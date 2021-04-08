<template>
  <div id="app">
    <projectNav/>
    <router-view/>
     <projectFoot/>
  </div>
</template>
<script>
import projectNav from './components/ProjectNav'
import projectFoot from './components/ProjectFoot'
import { web3Accounts } from "@polkadot/extension-dapp";
import { mapGetters, mapActions } from "vuex";
export default {
  created(){
    this.init();
    web3Accounts();
  },
  computed: {
    ...mapGetters({
      chainList: "chainList"
    })
  },
  methods: {
    ...mapActions(["setChain", "setUser"]),
    init(chain = "rococo") {
      if (!this.chainList[chain]) {
        chain = "rococo";
        this.$router.push(this.root);
      }
      // connect wss
      if (!this.chainList[chain].ws) {
        this.setUser(chain);
      }

      // toggle chain
      if (this.currentChain != chain) {
        this.setChain(chain);
      }
    }
  },
  components:{
    projectNav,
    projectFoot
  },
}
</script>
