<template>
  <section>
    <header>
      <h1 class="container">Crowdloan</h1>
    </header>
    <article class="container">
      <div class="flex-between flex-align-center search-box">
        <div class="input-group">
          <input
            class="search"
            type="text"
            :placeholder="$t('Search')"
            @input="debouncedSearchProject"
            v-model="searchVal"
          />
          <img
            src="@/assets/img/icon/close.png"
            width="20"
            class="ab-right"
            v-show="searchVal.trim()"
            @click="emptySearch"
          />
        </div>
      </div>

      <!-- Mobile -->
      <main
        v-if="isMobile && currentProjects && currentProjects.length > 0"
        class="mobile-list"
      >
        <div
          class="table-list"
          v-for="item in currentProjects"
          :key="item.paraId"
        >
          <ul
            :class="['fold-parent flex-between', { open: item.foldOpen }]"
            @click="toggleFold(item)"
          >
            <li class="flex-align-top">
              <img
                @error="logoError"
                :src="
                  'https://medishares-cn.oss-cn-hangzhou.aliyuncs.com/polka_project/' +
                  item.img
                "
                width="48"
              />
              <div>
                <h4>{{ item.title ? item.title : item.paraId }}</h4>
                <h4>{{ item.token ? item.token : "--" }}</h4>
              </div>
            </li>
            <li>
              <h6>{{$t("Raised")}}</h6>
              <p
                :class="['progress', { none: !item.cap || item.cap - 0 == 0 }]"
              >
                <span
                  :style="
                    'width:' + getPercent(item.raised - 0, item.cap - 0) + '%'
                  "
                ></span>
              </p>
              <p v-if="item.cap && item.cap != 0">
                {{
                  (item.humanData.raised == 0
                    ? 0
                    : item.humanData.raised.slice(0, -3)) +
                  "/" +
                  item.humanData.cap.slice(0, -3)
                }}
              </p>
              <p v-else>None</p>
            </li>
          </ul>
          <div class="fold-child" v-show="item.foldOpen">
            <ul>
              <li>
                <h6>{{$t("Ending")}}</h6>
                <div>
                  <p v-if="item.end - currentBlock > 0">
                    {{ timestampToTime(item) }}
                  </p>
                  #{{ item.humanData.end }}
                </div>
              </li>
              <li>
                <h6>{{$t("Leases")}}</h6>
                <p>
                  {{
                    item.firstSlot +
                    (item.lastSlot > item.firstSlot
                      ? " - " + item.lastSlot
                      : "")
                  }}
                </p>
              </li>
            </ul>
            <router-link :to="'/detail?ID=' + item.paraId">{{
              $t("ViewDetails")
            }}</router-link>
          </div>
        </div>
      </main>
      <!-- PC -->
      <main
        v-else-if="currentProjects && currentProjects.length > 0"
        class="pc-list"
      >
        <ul class="table-title flex-list">
          <li>{{ $t("Project") }}</li>
          <li>{{ $t("Token") }}</li>
          <li>{{$t("Raised")}}</li>
          <li>{{$t("Ending")}}</li>
          <li>{{$t("Leases")}}</li>
        </ul>
        <ul
          class="table-list flex-list"
          v-for="item in currentProjects"
          :key="item.paraId"
          @click="goDetail(item)"
        >
          <li class="flex-align-center">
            <img
              @error="logoError"
              :src="
                'https://medishares-cn.oss-cn-hangzhou.aliyuncs.com/polka_project/' +
                item.img
              "
              width="48"
            />
            <h4>{{ item.title ? item.title : item.paraId }}</h4>
          </li>
          <li>
            <h4>{{ item.token ? item.token : "--" }}</h4>
          </li>
          <li>
            <p :class="['progress', { none: !item.cap || item.cap - 0 == 0 }]">
              <span
                :style="
                  'width:' + getPercent(item.raised - 0, item.cap - 0) + '%'
                "
              ></span>
            </p>
            <p v-if="item.cap && item.cap != 0">
              {{
                (item.humanData.raised == 0
                  ? 0
                  : item.humanData.raised.slice(0, -3)) +
                "/" +
                item.humanData.cap.slice(0, -3)
              }}
            </p>
            <p v-else>None</p>
          </li>
          <li>
            <p v-if="item.end - currentBlock > 0">
              {{ timestampToTime(item) }}
            </p>
            #{{ item.humanData.end }}
          </li>
          <li>
            {{
              item.firstSlot +
              (item.lastSlot > item.firstSlot ? " - " + item.lastSlot : "")
            }}
          </li>
        </ul>
      </main>
      <div v-else class="text-center table-title">{{ $t("NoInfo") }}</div>
    </article>
  </section>
</template>

<script>
import _ from "lodash";
export default {
  data() {
    return {
      searchVal: "",
      isMobile: false,
      projects: [],
      currentProjects: [],
      currentBlock: 0,
    };
  },
  created() {
    this.isMobile = window.innerWidth <= 768;
    window.onresize = () => {
      this.isMobile = window.innerWidth <= 768;
    };
    this.debouncedSearchProject = _.debounce(this.searchProject, 500);
    this.getList();
    setInterval(() => {
      this.getLatestBlock();
    }, 6000);
  },
  methods: {
    async getLatestBlock() {
      this.currentBlock = await this.user.getCurrentBlock();
    },
    timestampToTime(item) {
      return this.webUtil.timestampToTime(
        this.webUtil
          .BigNumber(item.end)
          .minus(this.currentBlock)
          .times(6)
          .toNumber(),
        this
      );
    },
    goDetail(item) {
      this.$router.push("/detail?ID=" + item.paraId);
    },
    getPercent(a, b) {
      return this.webUtil.BigNumber(a).div(b).times(100).toFixed(2);
    },
    getList() {
      this.$loading(1);
      this.getLatestBlock();
      this.user
        .getCrowdloanList()
        .then((res) => {
          if (res && res.length > 0) {
            res.map((v) => {
              this.$set(v, "foldOpen", false);
              this.getProjectInfo(v);
            });
          } else {
            this.$loading(0);
          }

          this.currentProjects = this.projects = res;
        })
        .catch((err) => {
          this.currentProjects = this.projects = null;
          this.$loading(0);
          console.log(err);
        });
    },
    searchProject() {
      let searchVal = this.searchVal.trim().toLowerCase();
      if (searchVal&&this.projects&&this.projects.length>0) {
        this.currentProjects = this.projects.filter((v) => {
          return (
            String(v?.paraId).includes(searchVal) ||
            v?.title?.toLowerCase().includes(searchVal) ||
            v?.token?.toLowerCase().includes(searchVal)
          );
        });
      } else {
        this.currentProjects = this.projects;
      }
    },
    emptySearch() {
      this.searchVal = "";
      this.currentProjects = this.projects;
    },
    toggleFold(item) {
      this.projects.map((v) => {
        if (v.paraId != item.paraId) {
          v.foldOpen = false;
        }
      });
      item.foldOpen = !item.foldOpen;
    },
  },
};
</script>
<style scoped>
.flex-list {
  display: flex;
  align-items: center;
}
.flex-list li {
  padding-right: 32px;
  width: 200px;
  white-space: nowrap;
}
.flex-list li:first-child {
  min-width: 240px;
  overflow: hidden;
}
.flex-list li:nth-child(2) {
  width: 120px;
}
.flex-list li:nth-child(3) {
  width: 300px;
}
.flex-list li:last-child {
  margin-right: 0;
  text-align: right;
}
</style>
