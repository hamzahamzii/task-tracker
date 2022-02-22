<template>
  <div>
    <v-row>
      <v-col>
        <Sidebar />
        <router-view></router-view>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "app-layout",
  components: {
    Sidebar: () => import("@/components/includes/Sidebar"),
  },
  computed: {},
};
</script>

