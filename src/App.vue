<template>
  <div>
    <v-app>
      <v-main>
        <component :is="layout" />
        <Notification /> // Notification components
        <Permissions :notif="true" :dialog="!permissions && !isExtension" />
      </v-main>
    </v-app>
  </div>
</template>

<script>
const default_layout = "app";
import { mapGetters } from "vuex";
import moment from "moment";
import timer from "@/timer";
import firebase from "firebase";
import "firebase/messaging";

export default {
  name: "app",
  data() {
    return {
      started: null,
      running: false,
      stopTime: null,
      startTime: null,
      permissions: true,
    };
  },
  components: {
    "simple-layout": () => import("@/components/Layouts/LoginLayout"),
    "app-layout": () => import("@/components/Layouts/AppLayout"),
    Notification: () => import("@/components/includes/Notification"),
    Permissions: () => import("@/components/includes/Permissions"),
  },
  computed: {
    ...mapGetters([
      "getActiveTask",
      "getLoggedInUser",
      "getTimer",
      "getActiveTimeEntry",
      "findTask",
      "getRecordingAvailable",
      "getTasks",
      "getTasksPagination",
    ]),

    // Dates calculation after date range (option) selection
    dateRange() {
      if (this.getTaskDateFilter == "Today")
        return [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
      if (this.getTaskDateFilter == "Yesterday")
        return [
          moment().subtract(1, "day").format("YYYY-MM-DD"),
          moment().subtract(1, "day").format("YYYY-MM-DD"),
        ];
      if (this.getTaskDateFilter == "Last 7 days")
        return [
          moment().subtract(7, "day").format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      if (this.getTaskDateFilter == "Last 30 days")
        return [
          moment().subtract(30, "day").format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      if (this.getTaskDateFilter == "This month") {
        let daysFromStartOfMonth = moment().format("DD");
        return [
          moment()
            .subtract(daysFromStartOfMonth - 1, "days")
            .format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      }
      if (this.getTaskDateFilter == "All the time")
        return ["2000-01-01", moment().format("YYYY-MM-DD")];
      else return [];
    },

    isExtension() {
      return innerHeight == "600" && innerWidth == "450";
    },
    layout() {
      return (this.$route.meta.layout || default_layout) + "-layout";
    },
  },

  methods: {
    // asks for user to allow notifications
    allowNotif() {
      try {
        if (
          navigator.userAgent.indexOf("Chrome") > -1 &&
          firebase.messaging()
        ) {
          firebase
            .messaging()
            .requestPermission()
            .then(() => {
              return firebase
                .messaging()
                .getToken()
                .then((token) => {
                  console.log("setting token", token);
                  localStorage.setItem("fcm_token", token);
                })
                .catch((err) => {
                  console.log("unable to get token", err);
                });
            })
            .catch(() => {
              this.permissions = false;
            });
        }
      } catch (e) {
        console.log(e);
      }
    },
    // Starts timer
    startTimer() {
      // start time in store
      this.running = true;
      this.started = setInterval(this.addOneSecond, 1000);
    },

    addOneSecond() {
      this.$store.commit("addOneSecond");
      this.$store.commit("updateActiveDuration", {
        entry: this.getActiveTimeEntry,
        duration: this.getTimer,
      });
      let time = timer.format(this.getTimer);
      window.document.title = timer.formatTimerAnalog(time);
    },

    // Stops timer
    stopTimer() {
      // stop time in store
      clearInterval(this.started);
      this.running = false;
      window.document.title = "GIGS Timer";
    },
  },

  watch: {
    // Check date range and refresh filter
    dateRange(value) {
      this.$store.commit("setTaskFilter", {
        start_date: value[0],
        end_date: value[1],
      });
    },
    // if task is changed
    getActiveTask(value) {
      if (value) {
        // stop previous timer
        if (this.running) {
          this.stopTimer();
        }
        // start new timer
        this.startTimer();
      } else {
        this.stopTimer();
      }
    },

    getRecordingAvailable(value) {
      if (value) {
        if (this.$route.name != "task") {
          this.$router.push({
            name: "task",
          });
        }
      }
    },
  },

  mounted() {
    this.$store.commit("setPendingTimer", false);
    this.$store.commit("resetScreenRecorder");

    if (this.getActiveTask) {
      if (!this.findTask(this.getActiveTask.task_id)) {
        this.$store.commit("addNewTask", {
          taskArray: this.getTasks,
          newTaskObj: this.getActiveTask,
          pagination: this.getTasksPagination,
        });
      }
      this.$store.commit("recoverTimer");
      this.startTimer();
    }
  },

  created() {
    // Initializing FCM token for notification
    this.allowNotif();

    // Binding offline event
    window.addEventListener("offline", () => {
      this.$store.commit("setOnlineStatus", false);
    });
    window.addEventListener("online", () => {
      this.$store.commit("setOnlineStatus", true);
    });
  },
};

require("jquery/dist/jquery.min");
</script>

<style>
html {   
  overflow-y: hidden !important;
   } 
.v-application--wrap {
  min-height: 0vh !important;
}

.container {
  padding: 0px !important;
}
</style>
