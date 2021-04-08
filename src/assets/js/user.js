import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  isWeb3Injected,
  web3Accounts,
  web3Enable,
  web3FromAddress,
  web3FromSource,
} from "@polkadot/extension-dapp";
import util from './util'

import { u8aConcat, stringToU8a, u8aEq ,BN_ONE, BN_ZERO} from '@polkadot/util';
// import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto';

web3Enable( "PolkaProject" );

const websockets = {
  kusama: [
    "wss://kusama.maiziqianbao.net/ws",
    "ws://47.97.254.221:1322",
    "wss://kusama-rpc.polkadot.io",
    "wss://cc3-5.kusama.network/",
  ],
  polkadot: ["wss://polkadot.maiziqianbao.net/ws"],
  rococo: [
    "wss://rococo-rpc.polkadot.io/",
    "wss://rpc.rococo.plasmnet.io/",
    "wss://rococo.polkabtc.io/api/parachain",
    "wss://pc2-rpc.darwinia.network/",
    "wss://para.rococo-v1.kilt.io/",
  ],
};

const ss58Formats = {
  rococo: 42,
  polkadot: 0,
  edgeware: 7,
  kusama: 2,
  kulupu: 16,
};

const CROWD_PREFIX = stringToU8a( 'modlpy/cfund' );
const EMPTY_U8A = new Uint8Array( 32 );
const RANGES = [
  [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 1], [1, 2], [1, 3],
  [2, 2], [2, 3],
  [3, 3]
];

// function createChildKey (trieIndex) {
//   return u8aToHex(
//     u8aConcat(
//       ':child_storage:default:',
//       blake2AsU8a(
//         u8aConcat('crowdloan', trieIndex.toU8a())
//       )
//     )
//   );
// }

function createAddress (paraId) {
  return u8aConcat(CROWD_PREFIX, paraId.toU8a(), EMPTY_U8A).subarray(0, 32);
}

function isCrowdloadAccount(paraId, accountId) {
  return accountId.eq(createAddress(paraId));
}

class User {
  constructor(chain) {
    let provider = new WsProvider(websockets[chain][0]);
    this.api = ApiPromise.create({ provider });
    this.ss58Format = ss58Formats[chain];
  }

  // 获取钱包账号
  async getAccounts() {
    if (isWeb3Injected) {
      return await web3Accounts({ ss58Format: this.ss58Format }).then(
        (accounts) => {
          accounts.forEach((account) => {
            account.isActive = false;
          });
          return accounts;
        }
      );
    }
  }

  // 获取账户余额
  async getBalance(account) {
    const api = await this.api;
    let balanceList = await api.derive.balances.all(account.address)
    return balanceList?.availableBalance.toString()
  }

  async getAllBalance(account) {
    const api = await this.api;
    return await api.derive.balances.all(account.address)
  }

  async getCurrentBlock() {
    const api = await this.api;
    let block = await api.derive.chain.bestNumber()
    return block.toString()
  }
  async getCurrentPeriod() {
    const api = await this.api;
    let bestNumber = await this.getCurrentBlock()
    let period = api.consts.slots.leasePeriod
    let cyrrentPeriod = Math.floor(bestNumber/period);
    return [cyrrentPeriod,bestNumber]
  }

  // 获取竞拍 第几期, 周期, 结束时间
  async getAuctionInfo() {
    const api = await this.api;
    let numAuctions = (await api.query.auctions.auctionCounter()).toString();
    let optInfo = await api.query.auctions.auctionInfo();
    const [leasePeriod, endBlock] = optInfo.unwrapOr([null, null]);
    return {
      numAuctions,
      leasePeriod,
      endBlock
    }
    // return {
      // leasePeriod: info.toJSON()[0],
      // endPeriod: info.toJSON()[0]+3,
      // endBlock: info,
    // }
  }

  /** 获取竞拍数据系列方法 */
  isNewWinners (a, b) {
    return JSON.stringify({ w: a }) !== JSON.stringify({ w: b });
  }
  isNewOrdering (a, b) {
    return a.length !== b.length || a.some(({ firstSlot, lastSlot, paraId }, index) =>
      !paraId.eq(b[index].paraId) ||
      !firstSlot.eq(b[index].firstSlot) ||
      !lastSlot.eq(b[index].lastSlot)
    );
  }
  extractWinners (auctionInfo, optData) {
    return optData.isNone
      ? []
      : optData.unwrap().reduce((winners, optEntry, index) => {
        if (optEntry.isSome) {
          const [accountId, paraId, value] = optEntry.unwrap();
          const period = auctionInfo.leasePeriod || BN_ZERO;
          const [first, last] = RANGES[index];

          winners.push({
            accountId: accountId.toString(),
            firstSlot: period.addn(first),
            isCrowdloan: u8aEq(CROWD_PREFIX, accountId.subarray(0, CROWD_PREFIX.length)),
            lastSlot: period.addn(last),
            paraId,
            value
          });
        }

        return winners;
      }, []);
  }
  createWinning ({ endBlock }, blockOffset, winners) {
    return {
      blockNumber: endBlock && blockOffset
        ? blockOffset.add(endBlock)
        : blockOffset || BN_ZERO,
      blockOffset: blockOffset || BN_ZERO,
      total: winners.reduce((total, { value }) => total.iadd(value), BN_ZERO),
      winners
    };
  }
  extractData (auctionInfo, values){
    return values
      .sort(([{ args: [a] }], [{ args: [b] }]) => a.cmp(b))
      .reduce((all, [{ args: [blockOffset] }, optData]) => {
        const winners = this.extractWinners(auctionInfo, optData);

        winners.length && (
          all.length === 0 ||
          this.isNewWinners(winners, all[all.length - 1].winners)
        ) && all.push(this.createWinning(auctionInfo, blockOffset, winners));

        return all;
      }, [])
      .reverse();
  }
  mergeCurrent (auctionInfo, prev, optCurrent, blockOffset) {
    const current = this.createWinning(auctionInfo, blockOffset, this.extractWinners(auctionInfo, optCurrent));

    if (current.winners.length) {
      if (!prev || !prev.length) {
        return [current];
      }

      if (this.isNewWinners(current.winners, prev[0].winners)) {
        if (this.isNewOrdering(current.winners, prev[0].winners)) {
          return [current, ...prev];
        }

        prev[0] = current;

        return [...prev];
      }
    }

    return prev;
  }
  mergeFirst (auctionInfo, prev, optFirstData) {
    if (prev && prev.length <= 1) {
      const updated = prev || [];
      const firstEntry = this.createWinning(auctionInfo, null, this.extractWinners(auctionInfo, optFirstData));

      if (!firstEntry.winners.length) {
        return updated;
      } else if (!updated.length) {
        return [firstEntry];
      }

      updated[updated.length - 1] = firstEntry;

      return updated.slice();
    }

    return prev;
  }
  // 获取获胜列表
  async getWinningData() {
    const api = await this.api;
    const bestNumber = await api.derive.chain.bestNumber();
    const allEntries = await api.query.auctions?.winning.entries();
    const optFirstData = await api.query.auctions?.winning(0);
    const auctionInfo = await this.getAuctionInfo();
    let prev = [];
    if ( allEntries ) {
      prev = this.extractData(auctionInfo, allEntries)
    }
    if (optFirstData) {
      this.mergeFirst(auctionInfo, prev, optFirstData)
    }

    if (auctionInfo?.endBlock && bestNumber && bestNumber.gt(auctionInfo.endBlock)) {
      const blockOffset = bestNumber.sub(auctionInfo.endBlock).iadd(BN_ONE);
      let optCurrent = await api.query.auctions?.winning(blockOffset);

      return {
        auctionInfo,
        winningData: this.mergeCurrent( auctionInfo, prev, optCurrent, blockOffset ),
      }
    }

    return {auctionInfo};
  }
  interleave(winners, newRaise, asIs){
    if (asIs) {
      return winners;
    }
    const sorted = (campaigns.funds || [])
      .filter(({ paraId }) => newRaise.some((n) => n.eq(paraId)))
      .sort((a, b) => b.value.cmp(a.value));

    return winners.map((w) =>
      sorted.find(({ firstSlot, lastSlot, value }) =>
        w.firstSlot.eq(firstSlot) &&
        w.lastSlot.eq(lastSlot) &&
        w.value.lt(value)
      ) || w
    );
  }
  // 获取竞拍列表
  async getAuctionList() {
    const api = await this.api;
    const newRaise = await api.query.crowdloan.newRaise();
    const {auctionInfo,winningData} = await this.getWinningData();

    return auctionInfo && newRaise && winningData?.map(({ blockNumber, winners }, round) => (
      this.interleave( winners, newRaise, round !== 0 || winningData.length !== 1 ).map( ( value, index ) => ({
          auctionInfo,
          blockNumber,
          isFirst: index === 0,
          isLatest: round === 0,
          value
        })
      )
    ))
  }

  // 获取 crowdloan 列表
  async getCrowdloanList() {
    const api = await this.api;
    let minContribution =  api.consts.crowdloan.minContribution;
    let retirementPeriod = api.consts.crowdloan.retirementPeriod;
    let [currentPeriod,bestNumber] = await this.getCurrentPeriod();
    let paraIds = (await api.query.crowdloan.funds.keys()).map(({args}) => args[0]);
    let leases = await api.query.slots.leases.multi(paraIds);
    let leased = paraIds.filter( ( paraId, i ) => {
      return leases[i]
          .map((o) => o.unwrapOr(null))
          .filter(([accountId]) => {
            return isCrowdloadAccount(paraId, accountId)
          })
          .length !== 0
      }
    )

    return await api.query.crowdloan.funds.entries().then( res => {
      let funds = res&&res.map(( [{args:[paraId]}, v] ) => {
        let info = v.toJSON()
        info.humanData = v.toHuman();
        info.paraId = paraId.toJSON();
        info.isCapped = info.cap-info.raised<=minContribution;
        info.isEnded = bestNumber>info.end;
        info.retireEnd = info.end+retirementPeriod;
        info.isRetired = bestNumber>info.retireEnd;
        info.isWinner = leased.some( ( l ) => {
          return l.eq(paraId);
        })
        return info
      } )
      return funds.filter( v => {
        return !(v.isCapped || v.isEnded || v.isWinner) && currentPeriod<=v.firstSlot
      })
    } ).catch( err => {
      console.log(err);
    })
  }

  // 获取 单个 crowdloan 详情
  async getCrowdloanInfo(paraId) {
    const api = await this.api;
    let info = await api.query.crowdloan.funds( paraId );
    let HumanInfo = info.toHuman();
    HumanInfo.endTime = await this.endTimeToUTC( info.toJSON().end );
    return HumanInfo;
  }

  async endTimeToUTC( block ) {
    if ( !block ) {
      return null;
    }
    let bestNumber = await this.getCurrentBlock();
    return util.timestampToDate( util.BigNumber(block).minus(bestNumber).times(6000).plus(Date.now()).toNumber())
  }

  // 操作方法
  async setSigner(account) {
    const api = await this.api;
    const injector = await web3FromSource(account.meta.source).catch(() => {alert("Please refresh the page")});
    api.setSigner(injector.signer);
    return api;
  }
}

export default User;
