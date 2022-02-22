<template>
  <div>
    <h2 class="success-text" v-if="extension">
      {{ getActiveTask ? time : "00:00:00" }}
    </h2>
    <b
      v-else
      :class="
        $mq == 'phone' || $mq == 'extraSmallPhones'
          ? 'smallScreen-timer-font'
          : 'timer-font'
      "
    >
      <p>
        {{ getActiveTask ? time : "00:00:00" }}
      </p>
    </b>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import timer from "@/timer";

export default {
  name: "Timer",
  props: ["extension"],
  computed: {
    ...mapGetters(["getActiveTask", "getLoggedInUser", "getTimer"]),
    time() {
      return this.getActiveTask ? timer.format(this.getTimer) : "00:00:00";
    },
  },
};
</script>
<style scoped>
.timer-font {
  font-size: 16px;
  color: #2a206a;
}
.smallScreen-timer-font {
  font-size: 10px !important;
  color: #2a206a;
}
</style>
