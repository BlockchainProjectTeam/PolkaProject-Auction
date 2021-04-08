<template>
  <section>
    <article class="bgfff-box">
      <div class="container flex-between">
        <div class="flex-align-center">
          <img
            @error="logoError"
            :src="
              'https://medishares-cn.oss-cn-hangzhou.aliyuncs.com/polka_project/' +
              (info && info.img)
            "
            width="88"
          />
          <h2>{{ info && info.title ? info.title : ID }}</h2>
        </div>
        <div class="input-group">
          <span class="ab-right">{{ symbol }}</span>
          <input type="number" v-model="amount" placeholder="0" />
          <label v-if="account" class="pointer" @click="amount = balance - 0"
            >{{ $t("available") }} {{ balance ? balance : "--" }}
            {{ symbol }}</label
          >
          <a v-if="account" class="pink-btn" @click="contribute">{{
            $t("Contribute")
          }}</a>
          <a v-else class="pink-btn" @click="login">{{ $t("Login") }}</a>
        </div>
      </div>
    </article>
    <main class="container" v-if="info">
      <ul>
        <li>
          <h5>{{ $t("ParaID") }}</h5>
          <p>{{ ID }}</p>
        </li>
        <li>
          <h5>{{ $t("Owner") }}</h5>
          <a href="javascript:;">{{
            info.depositor
          }}</a>
        </li>
        <li>
          <h5>{{ $t("Token") }}</h5>
          <p>{{ info.token ? info.token : "--" }}</p>
        </li>
        <li>
          <h5>{{ $t("Leases") }}</h5>
          <p>{{ info.firstSlot + " - " + info.lastSlot }}</p>
        </li>
        <li>
          <h5>{{ $t("RaisedCap") }}</h5>
          <p>{{ info.raised + "/" + info.cap }}</p>
        </li>
        <li>
          <h5>{{ $t("Ending") }}</h5>
          <p>{{ info.endTime ? info.endTime +'(UTC)': "🕯️" }}</p>
        </li>
      </ul>
      <template v-if="info.project">
        <h3>{{ $t("Rewards") }}</h3>
        <p v-if="info.project.crowdloan_reward" v-html="webUtil.getFormatCode(info.project.crowdloan_reward)"></p>
        <p v-if="info.project.plo_token_allocation_plan">
          <a :href="info.project.plo_token_allocation_plan" target="_blank" rel="noopener noreferrer">{{$t('Rewards_tip1')}}</a>
        </p>
        <p v-if="info.project.p_id">
          <a :href="'https://polkaproject.com/#/project/'+info.project.p_id" target="_blank" rel="noopener noreferrer">{{$t('Rewards_tip2')}}</a>
        </p>
      </template>
    </main>
  </section>
</template>
<script>
export default {
  props: ["ID"],
  data() {
    return {
      amount: "",
      balance: "",
      info: null,
    };
  },
  created() {
    this.getInfo();
  },
  methods: {
    async getInfo() {
      this.$loading(1);
      this.user
        .getCrowdloanInfo(this.ID)
        .then((res) => {
          this.info = res;
          this.info.paraId = this.ID;
          this.getProjectInfo(this.info);
        })
        .catch(() => {
          this.$loading(0);
        });

        this.getBalance();
    },
    getBalance() {
      if (this.account) {
        this.user.getBalance(this.account).then((res) => {
          this.balance = this.webUtil.fixedByDecimal(res, this.decimals);
        });
      }
    },
    contribute() {
      let amount = this.webUtil.timesByDecimal(this.amount, this.decimals);
      let max = this.webUtil.timesByDecimal(this.balance, this.decimals);
      if (!this.amount) {
        return this.$toast(this.$t("EnterAmountFirst"));
      }
      if (amount.isGreaterThan(max)) {
        return this.$toast(this.$t("amountNotenough"));
      }
      this.$loading(1);
      this.user.setSigner(this.account).then((api) => {
        api.tx.crowdloan
          .contribute(this.ID, amount, null)
          .signAndSend(this.account.address, (status) => {
            if (status.isCompleted && status.isInBlock && !status.isError) {
              if (status.findRecord("system", "ExtrinsicSuccess")) {
                this.$toast("Success");
              } else {
                this.$toast("Fail");
              }
              this.$loading(0);
            }
          })
          .catch((err) => {
            this.$loading(0);
            this.$toast(err, 3000);
            console.log(err);
          });
      });
    },
  },
  watch: {
    ID() {
      this.getInfo();
    },
    account(){
      this.getBalance();
    }
  },
};
</script>
<style scoped>
.flex-align-center img {
  margin-right: 24px;
}
.input-group .ab-right {
  font: 700 16px/24px Rubik-Medium;
}
.input-group input {
  font: 700 20px/24px Rubik-Medium;
  margin-bottom: 8px;
}
.pink-btn {
  text-align: center;
  width: 100%;
}
label {
  font-size: 12px;
  color: #8a8a8f;
  padding: 4px 16px;
  display: block;
}
main {
  padding: 48px 16px;
  font: normal 14px/24px Rubik-Regular;
}
main li {
  display: flex;
  margin-bottom: 8px;
}
main h5 {
  font: normal 14px/24px Rubik-Regular;
  width: 128px;
  margin-right: 32px;
  white-space: nowrap;
}
main a {
  text-decoration: underline;
  color: #000;
  word-break: break-word;
  flex: 1;
}
main p {
  word-break: break-word;
  flex: 1;
}
main h3 {
  margin: 48px 0 16px;
}
.circle-list {
  display: inline-block;
  border: 1px solid #000;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  text-align: center;
}
@media (max-width: 768px) {
  .flex-between {
    display: block;
  }
  .flex-align-center img {
    margin-right: 16px;
  }
  .input-group {
    margin-top: 32px;
  }
}
</style>
