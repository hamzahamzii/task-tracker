<template>
  <div class="container page-cont mt-16">
    <div class="error-page-404">
      404
    </div>
    <div class="btn--text lost-text">
      Are you lost ?
    </div>
    <div class="detail-text">
      We searched high and low but couldn't <br> find what you're looking for.
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      imgSource: require("@/assets/images/404Image.jpg"),
    };
  },
};
</script>
<style scoped>
.margin-top-image {
  margin-top: 10rem;
}
.error-page-404 {
 color:#dcd8f3;
 font-size:10em;
 text-align: center;
}
.page-cont {
  height: 233px;
  width: 500px;
}
.lost-text {
  font-size: 30px;
  text-align: center;
  font-weight: 700;
}
.detail-text{
   font-size: 20px;
  text-align: center;
}
</style>
