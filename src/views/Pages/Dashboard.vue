<template>
  <DashboardView />
</template>

<script>
export default {
  name: "Dasboard",
  components: {
    DashboardView: () => import("@/components/Dashboard/DashboardView"),
  },
};
</script>
