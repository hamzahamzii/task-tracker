<template>
  <NewReports />
  <!-- <UserReports /> -->
</template>

<script>
export default {
  name: "Reports",
  components: {
    //UserReports: () => import("@/components/Reports/UserReports"),
    NewReports: () => import("@/components/Reports/NewReports"),
  },
};
</script>
