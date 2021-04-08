<template>
  <section class="container">
    <div class="card">
      <h3>404</h3>
      <router-link to="/" class="pink-btn">{{$t('backToHome')}}</router-link>
    </div>
  </section>
</template>

<style scoped>
.card {
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 4px;
  margin-top: 32px;
}
h3 {
  font: 400 80px/1.5 Gotham-Book;
  margin-bottom: 32px;
}

</style>
