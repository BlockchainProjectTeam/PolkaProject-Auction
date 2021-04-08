import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import i18n from './assets/js/i18n'
import util from './assets/js/util'
import Loading from './components/Loading'
import Toast from './components/Toast'
import LoginModal from './components/LoginModal'
import ba from "vue-ba";
import './assets/css/common.css'

Vue.use( Loading );
Vue.use( Toast );
Vue.use( LoginModal );
Vue.config.productionTip = false;

// 百度统计
Vue.use(ba, "6b8038ccc73f8a8e76bf77b940fa65ec");
Vue.use(ba, { siteId: "6b8038ccc73f8a8e76bf77b940fa65ec" });

// 混入方法
import { mapGetters,mapActions } from 'vuex'
Vue.mixin({
  data() {
    return {
      webUtil: util,
      axios: axios,
      domain:process.env.NODE_ENV === "production" ?"https://app.staked.xyz/api/v1/polkadot_project/":"/api/",
    }
  },
  computed: {
    ...mapGetters({
      lang: 'getLang',
      account: 'account',
      currentChain: 'currentChain',
      chainInfo: 'chainInfo',
    }),
    user() {
      return this.chainInfo ? this.chainInfo.ws : null
    },
    symbol() {
      return this.chainInfo ? this.chainInfo.symbol : 'ROC'
    },
    chain_id() {
      return this.chainInfo ? this.chainInfo.chain_id : 0
    },
    decimals() {
      return this.chainInfo ? this.chainInfo.decimals : '12'
    },
  },
  methods: {
    ...mapActions( ["setAccount"] ),
    logoError(e){
      let img = e.srcElement;
      img.src = require('./assets/img/icon/default.png');
      img.style.boxShadow = 'none';
      img.onerror = null; //防止闪图
    },
    getProjectInfo(item) {
      this.$loading(1)
      this.axios.get(this.domain+'chain_id/'+this.chain_id+'/para_id/'+(item.paraId-0)).then(res=>{
        this.$loading(0)
        if(res.data.code==0){
          let project = res.data.data.project
          this.$set(item,'project',project)
          this.$set(item,'weight',project.weight)
          this.$set(item,'id',project.id)
          this.$set(item,'img',project.img)
          this.$set(item,'title',project.title)
          this.$set(item,'token',project.token?.alias)
          this.$set(item,'crowdloan_info',res.data.data.crowdloan_info)
        }
      }).catch(()=>{
        this.$loading(0)
      })
    },
    login() {
      return new Promise( resolve => {
        this.user
          .getAccounts()
          .then( ( accountList ) => {
            // 在麦子钱包中打开自动登录
            if ( this.webUtil.browserVersions().mdsApp ) {
              if ( accountList && accountList.length > 0 ) {
                this.setAccount( accountList[0] );
                resolve( accountList[0] );
              } else {
                this.$toast( "Please switch to Polkadot wallet operation" );
              }
            } else {
              this.$loginModal( true, accountList, this , ( account ) => {
                if ( account ) {
                  this.setAccount( account );
                }
                resolve( account );
              } );
            }
          } )
          .catch( ( err ) => {
            this.$toast( err, 3000 )
            this.$loginModal( true );
          } );
      } )
    },
  }
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
