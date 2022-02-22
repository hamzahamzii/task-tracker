<template>
  <div class="pointer" @click="goToNotif">
    <v-snackbar top v-model="flag" :color="color">
      {{ message }}
      <template v-slot:action="{ attrs }">
        <v-btn dark text v-bind="attrs" @click="closeSnackbar"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
import { eventBus } from "@/main";

export default {
  data() {
    return {
      flag: false,
    };
  },
  props: {
    snackbar: {
      type: Boolean,
    },
    notification: {
      type: Object,
    },
    message: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  methods: {
    closeSnackbar() {
      this.flag = false;
    },

    // Click on notification
    goToNotif() {
      this.closeSnackbar();
      if (this.notification.type == "new-comment") {
        if (this.$route.name != "task") {
          this.$router.push({
            name: "task",
          });
        }
        eventBus.$emit("new-comment", {
          task_id: this.notification.task_id,
          title: this.notification.task_title,
        });
      }
    },
  },

  watch: {
    snackbar(value) {
      if (value) this.flag = true;
    },
    flag(value) {
      if (!value) {
        this.$emit("closed");
      }
    },
  },
};
</script>
