<template>
  <section class="container">
    <h2 class="part-title">Crowdloan</h2>
    <form ref="form">
      <input type="hidden" name="chain_id" v-model="chain_id" />
      <label>{{ $t("Owner") }} *</label>
      <input type="text" name="owner" v-model="owner" autocomplete="off" />
      <label>{{ $t("ParaID") }} *</label>
      <input
        type="text"
        name="parachain"
        v-model="parachain"
        autocomplete="off"
      />
      <label>{{ $t("TokenSymbol") }} </label>
      <input type="text" name="token" v-model="token" autocomplete="off" />
      <label>{{ $t("RewardsInformation") }} *</label>
      <textarea
        name="reward"
        rows="10"
        v-model="reward"
        autocomplete="off"
      ></textarea>
      <label>{{ $t("RewardsInformationURL") }} *</label>
      <input type="text" name="url" v-model="url" autocomplete="off" />
      <a class="pink-btn" @click="submit">{{ $t("Submit") }}</a>
    </form>
  </section>
</template>
<script>
export default {
  data() {
    return {
      name: "",
      owner: "",
      parachain: "",
      token: "",
      reward: "",
      url: "https://",
    };
  },
  created() {
    this.$loading(0);
  },
  methods: {
    submit() {
      if (!this.owner) {
        return this.$toast(this.$t("noOwner"));
      }
      if (!this.parachain) {
        return this.$toast(this.$t("noParaID"));
      }
      if (!this.reward) {
        return this.$toast(this.$t("noRewardsInformation"));
      }
      var url = this.url.replace("https://", "");
      if (!url) {
        return this.$toast(this.$t("noRewardsInformationURL"));
      }

      this.$loading(1);
      var formData = new FormData(this.$refs.form);
      // 去除空文件元素
      try {
        for (var pair of formData.entries()) {
          if (
            pair[1] instanceof File &&
            pair[1].name == "" &&
            pair[1].size == 0
          )
            formData.delete(pair[0]);
        }
      } catch (e) {}

      this.axios
        .post(this.domain + "submit_crowdloan_info", formData)
        .then((res) => {
          if (res.data.code == 0) {
            this.$toast("Submit Success", 2000).then(() => {
              this.name = "";
              this.owner = "";
              this.parachain = "";
              this.token = "";
              this.reward = "";
              this.url = "https://";
            });
          } else {
            this.$toast(res.data.message);
          }
          this.$loading(0);
        })
        .catch(() => {
          this.$loading(0);
          this.$toast("ERROR");
        });
    },
  },
};
</script>
<style scoped>
form {
  background: #fff;
  padding: 32px;
  border-radius: 4px;
}
label {
  font-size: 14px;
  line-height: 24px;
}
input,
textarea {
  margin: 8px 0 32px;
}
</style>
