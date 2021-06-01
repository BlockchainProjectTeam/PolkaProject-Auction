<template>
  <section>
    <header>
      <div class="container" v-if="auctionInfo && auctionInfo.endBlock">
        <h1>Auction #{{ auctionInfo.numAuctions }}</h1>
        <ul class="width-half">
          <li v-if="auctionInfo.endBlock">
            <h5>{{ $t("Ending") }}</h5>
            <p>{{ auctionInfo.endTime }} (UTC)</p>
          </li>
          <li>
            <h5>{{ $t("End") }}</h5>
            <p>🕯️</p>
          </li>
        </ul>
      </div>
      <h1 v-else class="container">Auction</h1>
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
        <!-- <a v-show="isMobile&&currentProjects&&currentProjects.length>0" class="font-grey-medium"
          >{{ $t("Locked") }}
          <img src="@/assets/img/icon/rank_gray.png" width="16" :class="{rotate:isAscend}"/>
          </a> -->
      </div>

      <!-- Mobile -->
      <main
        v-if="isMobile && currentProjects && currentProjects.length > 0"
        class="mobile-list"
      >
        <div
          class="table-list"
          v-for="(item, index) in currentProjects"
          :key="index"
        >
          <ul
            :class="['fold-parent flex-between', { open: item.foldOpen }]"
            @click="toggleFold(item)"
          >
            <li class="flex-align-top">
              <img
                :src="
                  'https://medishares-cn.oss-cn-hangzhou.aliyuncs.com/polka_project/' +
                  item.img
                "
                width="48"
                @error="logoError"
              />
              <div>
                <h4>{{ item.title ? item.title : item.paraId - 0 }}</h4>
                <h4>{{ item.token ? item.token : "--" }}</h4>
              </div>
            </li>

            <li>
              <h6>{{ $t("Locked") }} ({{ symbol }})</h6>
              <p>
                {{
                  item.value
                    ? webUtil.formatNumToShort(item.value, decimals)
                    : "--"
                }}
              </p>
            </li>
          </ul>
          <div class="fold-child" v-show="item.foldOpen">
            <ul>
              <li v-for="i in peroid" :key="i">
                <h6>{{ $t("Leases") }} {{ i }}</h6>
                <p class="progress">
                  <span
                    :style="
                      'width:' +
                      (i >= item.firstSlot && i <= item.lastSlot ? 100 : 0) +
                      '%'
                    "
                  ></span>
                </p>
              </li>
            </ul>
            <a @click="goDetail(item)">{{ $t("ViewDetails") }}</a>
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
          <li>
            <p>
              {{ $t("Locked") }} ({{ symbol }})
              <!-- <img src="@/assets/img/icon/rank_gray.png" width="16" :class="{rotate:isAscend}"/> -->
            </p>
            <!-- <p>{{ symbol }}</p> -->
          </li>
          <li v-for="i in peroid" :key="i">{{ $t("Leases") }} {{ i }}</li>
        </ul>
        <ul
          class="table-list flex-list"
          v-for="(item, index) in currentProjects"
          :key="index"
          @click="goDetail(item)"
        >
          <li class="flex-align-center">
            <img
              :src="
                'https://medishares-cn.oss-cn-hangzhou.aliyuncs.com/polka_project/' +
                item.img
              "
              width="48"
              @error="logoError"
            />
            <h4>{{ item.title ? item.title : item.paraId - 0 }}</h4>
          </li>
          <li>
            <h4>{{ item.token ? item.token : "--" }}</h4>
          </li>
          <li>
            <h4>
              {{
                item.value
                  ? webUtil.formatNumToShort(item.value, decimals)
                  : "--"
              }}
            </h4>
          </li>
          <li v-for="i in peroid" :key="i">
            <p class="progress">
              <span
                :style="
                  'width:' +
                  (i >= item.firstSlot && i <= item.lastSlot ? 100 : 0) +
                  '%'
                "
              ></span>
            </p>
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
      auctionInfo: null,
      isMobile: false,
      isAscend: false,
      projects: [],
      currentProjects: [],
    };
  },
  computed: {
    peroid() {
      if (this.auctionInfo && this.auctionInfo.leasePeriod) {
        let p = [];
        let num = this.auctionInfo?.leasePeriod?.toJSON() - 0;
        for (let i = num; i < num + 4; i++) {
          p.push(i);
        }
        return p;
      }
      return [1, 2, 3, 4];
    },
  },
  created() {
    this.isMobile = window.innerWidth <= 768;
    window.onresize = () => {
      this.isMobile = window.innerWidth <= 768;
    };
    this.debouncedSearchProject = _.debounce(this.searchProject, 500);

    this.getInfo();
    this.getList();
  },
  methods: {
    getInfo() {
      this.user
        .getAuctionInfo()
        .then((res) => {
          this.auctionInfo = res;
          this.auctionInfo.endTime = this.user.endTimeToUTC(res.endBlock);
        })
        .catch(() => {
          this.auctionInfo = null;
        });
    },
    getList() {
      this.$loading(1);
      this.user
        .getAuctionList()
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
        .catch(() => {
          this.currentProjects = this.projects = null;
          this.$loading(0);
        });
    },
    goDetail(item) {
      if (item.id) {
        window.open("https://www.polkaproject.com/#/project/" + item.id);
      }
    },
    searchProject() {
      let searchVal = this.searchVal.trim().toLowerCase();
      if (searchVal&&this.projects&&this.projects.length>0) {
        this.currentProjects = this.projects.filter((v) => {
          return (
            String(v?.paraID).includes(searchVal) ||
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
        if (v.paraId != item.paraId - 0) {
          v.foldOpen = false;
        }
      });
      item.foldOpen = !item.foldOpen;
    },
    //排序
    // sortByWeight() {
    //   this.isAscend = !this.isAscend;
    //   if(this.isAscend){
    //     // 升序
    //     this.currentProjects.sort((a,b)=>{
    //       return a.weight-b.weight;
    //     })
    //     console.log("升序");
    //   }else{
    //     // 降序
    //     this.currentProjects.sort((a,b)=>{
    //       return b.weight-a.weight;
    //     })
    //     console.log("降序");
    //   }
    // },
  },
};
</script>
<style scoped>
.width-half {
  width: 50%;
  border-top: 1px solid #fff;
  margin-top: 32px;
}
.width-half li {
  border-bottom: 1px solid #fff;
  padding: 7px 0;
  font: 700 14px/24px Rubik-Medium;
  display: flex;
}
.width-half h5 {
  font: 700 14px/24px Rubik-Medium;
  width: 96px;
  margin-right: 32px;
}
.width-half p {
  flex: 1;
}
.flex-list {
  display: flex;
  align-items: center;
}
.flex-list li {
  margin-right: 32px;
  width: 96px;
  white-space: nowrap;
}
.flex-list li:first-child {
  min-width: 180px;
  overflow: hidden;
}
.flex-list li:nth-child(2) {
  width: 80px;
}
.flex-list li:last-child {
  margin-right: 0;
}
@media (max-width: 768px) {
  h1 {
    font-size: 48px;
  }
  .width-half {
    width: 100%;
  }
}
</style>
