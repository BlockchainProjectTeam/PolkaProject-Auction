import Vue from 'vue'
import Vuex from 'vuex'
import i18n from '../assets/js/i18n'
import User from '../assets/js/user'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    lang: i18n.locale,
    account: sessionStorage.getItem('account')?JSON.parse(sessionStorage.getItem('account')):null, //当前账户地址
    chainList: {
      'rococo': {
        symbol: 'ROC',
        decimals: 12,
        chain_id: 0,
        ws: null,
      },
      'kusama': {
        symbol: 'KSM',
        decimals: 12,
        chain_id: 32,
        ws: null
      },
      'polkadot': {
        symbol: 'DOT',
        decimals: 10,
        chain_id: 24,
        ws: null
      },
    },
    currentChain: 'rococo',
  },
  getters: {
    lang(state) {
      return state.lang
    },
    account(state) {
      return state.account
    },
    currentChain(state) {
      return state.currentChain
    },
    chainList(state) {
      return state.chainList
    },
    chainInfo(state) {
      return state.chainList[state.currentChain]
    },
  },
  mutations: {
    setLang(state, val) {
      i18n.setUserLanguage(val)
      state.lang = val;
    },
    setAccount(state, val) {
      state.account = val;
      sessionStorage.setItem('account', JSON.stringify(val))
    },
    logout(state) {
      state.account = null;
      // 清除sessionStorage
      sessionStorage.removeItem('account');
    },
    setUser(state, chain) {
      state.chainList[chain].ws = new User(chain);
    },
    setChain(state, val) {
      state.currentChain = val
      state.chainInfo = state.chainList[val];
    },
  },
  actions: {
    setLang(context, val) {
      context.commit('setLang', val)
    },
    setAccount(context, val) {
      context.commit('setAccount', val)
    },
    logout(context, val) {
      context.commit('logout', val)
    },
    setUser(context, val) {
      context.commit('setUser', val)
    },
    setChain(context, val) {
      context.commit('setChain', val)
    },
  },
})
