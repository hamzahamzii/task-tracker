<template>
  <div class="ml-6 mt-3 d-flex jusity-center flex-column">
    <StartTask :extension="true" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "ExtensionTaskPage",
  components: {
    StartTask: () => import("@/components/Tasks/StartTask"),
  },
  computed: {
    ...mapGetters(["getOnlineStatus", "getActiveTask"]),
  },
  methods: {},
};
</script>

<style scoped>
.theme-light-bg {
  background-color: rgba(237, 235, 249, 0.4);
}

.custom-placeholer-color input::placeholder {
  color: red !important;
  opacity: 1;
}

.timer-mode-font {
  font-size: 12px;
}
</style>