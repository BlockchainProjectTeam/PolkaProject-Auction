<template>
  <nav>
    <article class="container">
      <a class="navbar-brand" @click="goLink('/')">
        <img src="@/assets/img/icon/logo.png" height="32" />
      </a>
      <a href="javascript:;" class="menu" @click="collapseShow = true">
        <img src="@/assets/img/icon/menu.png" width="32" />
      </a>
      <div
        :class="['collapse', { 'moblie-show': collapseShow }]"
        id="toggleNav"
      >
        <div class="collapse-close" @click="collapseShow = false">×</div>
        <ul class="navbar-nav">
          <li>
            <a @click="goLink('/')">Auction</a>
          </li>
          <li>
            <a @click="goLink('/crowdloan')">Crowdloan</a>
          </li>
          <li>
            <a @click="goLink('/submit')">{{ $t("Submit") }}</a>
          </li>
          <li class="dropdown">
            <a
              :class="{ open: langDropdownShow }"
              @click="
                langDropdownShow = !langDropdownShow;
                accountDropdownShow = false;
              "
            >
              <span>{{ $t("lang") }}</span>
              <img src="@/assets/img/icon/downward_white.png" width="16" />
            </a>
            <div class="dropdown-menu" v-show="langDropdownShow">
              <a @click="changeLang('en')">English</a>
              <a @click="changeLang('cn')">简体中文</a>
            </div>
          </li>
          <li class="dropdown ml-16">
            <a v-if="!account||!account.address" class="border-btn" @click="login">{{
              $t("Login")
            }}</a>
            <a
              v-else
              :class="['border-btn active', { open: accountDropdownShow }]"
              @click="
                accountDropdownShow = !accountDropdownShow;
                langDropdownShow = false;
              "
            >
              <span>{{ webUtil.formatStrByDot(account.address) }}</span>
              <img src="@/assets/img/icon/downward_white.png" width="16" />
            </a>
            <div class="dropdown-menu" v-show="accountDropdownShow">
              <a href="https://rococo.subscan.io/auction_board" target="_blank" rel="noopener noreferrer">Data</a>
              <a href="https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frococo-rpc.polkadot.io#/parachains/crowdloan" target="_blank" rel="noopener noreferrer">Withdraw</a>
              <a @click="logoutAction">{{ $t("Logout") }}</a>
            </div>
          </li>
        </ul>
      </div>
    </article>
  </nav>
</template>

<script>
import { mapActions } from "vuex";
export default {
  data() {
    return {
      langDropdownShow: false,
      accountDropdownShow: false,
      collapseShow: false,
      selectShow: false,
      accountList: [],
    };
  },
  methods: {
    ...mapActions(["setLang","logout"]),
    changeLang(lang) {
      this.setLang(lang);
      this.langDropdownShow = false;
      this.collapseShow = false;
    },
    goLink(link) {
      this.accountDropdownShow = false;
      this.collapseShow = false;
      if (this.$route.path != link) {
        this.$router.push(link);
      }
    },
    logoutAction() {
      this.logout();
      sessionStorage.clear();
      this.accountDropdownShow = false;
      this.collapseShow = false;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
nav {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 2000;
  background: #000;
}
nav .container {
  display: flex;
  justify-content: space-between;
}

.navbar-brand {
  padding: 16px 0;
  position: relative;
  z-index: 1050;
}

.navbar-nav {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.navbar-nav li {
  position: relative;
}

.navbar-nav a {
  display: block;
  color: #fff;
  padding: 20px 24px;
  font: 700 16px/1.5 Rubik-Medium;
}
.dropdown .border-btn {
  padding: 4px 16px;
  max-width: 206px;
  margin: 14px auto;
}
.ml-16 {
  margin-left: 16px;
}
.dropdown .active {
  padding-left: 36px;
  position: relative;
}
.dropdown .active:after {
  content: "";
  position: absolute;
  left: 16px;
  top: 11px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff57b0;
  box-shadow: 0 0 8px 0 #ff57b0;
}
.dropdown img {
  margin-left: 4px;
}
.open img {
  transform: rotate(180deg);
}
.menu {
  padding: 16px 6px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  left: 0;
  top: 56px;
  background: #fff;
  border-radius: 16px;
  padding: 12px 0;
  z-index: 100;
  text-align: center;
  max-width: 204px;
  margin: 0 auto;
}

.dropdown-menu a {
  color: #000;
  padding: 4px 12px;
  font: 700 16px/1.5 Rubik-Medium;
}
.select-account {
  position: fixed;
  top: 10%;
  left: 0;
  right: 0;
  width: 90%;
  max-width: 800px;
  max-height: 80%;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  overflow: auto;
  z-index: 2100;
}
.select-account + .mask {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 2000;
}
@media (max-width: 992px) {
  .ml-16 {
    margin: 0;
  }
  .select-account {
    top: 70px;
  }
  .select-account + .mask {
    background: rgba(255, 255, 255, 0.2);
  }

  .menu {
    display: block;
  }
  .collapse {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: scroll;
    background: #000;
    z-index: 1040;
    display: none;
  }
  .moblie-show {
    display: block;
  }
  .collapse-close {
    font-size: 28px;
    padding: 14px 20px 0;
    color: #fff;
    text-align: right;
    cursor: pointer;
    display: block;
  }
  .navbar-nav {
    padding-top: 40px;
  }
  .navbar-nav li {
    width: 100%;
  }
  .navbar-nav a {
    text-align: center;
  }
  .account-list li {
    width: 100%;
  }
}
</style>
