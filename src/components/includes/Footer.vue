<template>
  <v-footer class="grey lighten-3" padless id="footer">
    <!-- <v-col class="text-center footer-container" cols="12">
      <strong>Task Timer</strong> - {{ new Date().getFullYear() }}
    </v-col> -->
  </v-footer>
</template>

<script>
export default {
  name: "Footer",
  components: {},
};
</script>

<style scoped>
.footer-container {
  text-align: center;
}
#footer {
  position: fixed;
  bottom: 0;
  width: 100%;
}
.footer-bg-color {
  background-color: white !important;
}
</style>
