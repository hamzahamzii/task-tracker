<template>
  <div>
    <router-view></router-view>
    <Footer />
  </div>
</template>

<script>
  
  export default {
    name : "simple-layout",
    components : {
      Footer : () => import('@/components/includes/Footer'),
    },
  }
</script>

<style scoped>

</style>
