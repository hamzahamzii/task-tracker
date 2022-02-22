<template>
  <div class="w-100">
    <TaskHead class="w-100" />
  </div>
</template>

<script>
export default {
  name: "Task",
  components: {
    TaskHead: () => import("@/components/Tasks/TaskHead"),
  },
};
</script>

