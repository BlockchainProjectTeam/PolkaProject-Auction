<template>
  <footer class="container">
    <a href="https://github.com/PolkaProject/PolkaProject-Auction" target="_blank" rel="noopener noreferrer">Github</a>
    <a href="mailto:polkaprojectcom@gmail.com">Email</a>
    <a href="https://polkaproject.medium.com/" target="_blank" rel="noopener noreferrer">Medium</a>
    <a href="https://twitter.com/KusamaProject" target="_blank" rel="noopener noreferrer">Twitter</a>
  </footer>
</template>

<style scoped>
footer{
  padding: 64px 16px 48px;
  display: flex;
}
footer a{
  color: #a7a7a7;
  font: 700 14px/16px Rubik-Medium;
  padding-right: 28px;
  position: relative;
}
footer a:after{
  content: '·';
  position: absolute;
  right: 12px;
  top: 0;
}
footer a:last-child:after{
  display: none;
}
</style>
