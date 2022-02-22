<template>
  <div>
    <!-- <Snackbar
      @closed="notify = false"
      :snackbar="notify"
      :message="notif.message"
      :notification="notif.data"
      color="green"
    /> -->
  </div>
</template>

<script>
import firebase from "firebase";
import "firebase/messaging";

import { mapGetters } from "vuex";

export default {
  name: "Notification",
  data() {
    return {
      messaging: null,
      notif: {},
      notify: false,
    };
  },
  components: {
    // Snackbar: () => import("@/components/includes/Snackbar"),
  },
  methods: {
    // Recieve foreground notifications
    receiveMessage() {
      try {
        if (this.messaging)
          this.messaging.onMessage((payload) => {
            // USING SHOW NOTIF ON FOREGROUND
            if ("serviceWorker" in navigator) {
              let options = {
                body: payload.data.body,
                icon: payload.data.icon,
                data: payload.data,
                requireInteraction: true,
              };
              payload.data.actions && localStorage.getItem("role") != "employee"
                ? (options.actions = JSON.parse(payload.data.actions))
                : () => {};
              navigator.serviceWorker.getRegistrations().then((reg) => {
                reg[0].showNotification(payload.data.title, options);
              });
            }
            this.notif.data = payload.data;
            // debugger
            var message;
            console.log("Message received. ", payload);
            // Assigned task
            if (payload.data.type == "assign") {
              this.$store.dispatch("fetchTasks");
              message = payload.data.title + ": " + payload.data.body;
            }
            // Removed from task
            else if (payload.data.type == "remove") {
              if (this.getActiveTask) {
                if (this.getActiveTask.task_id == payload.data.task_id)
                  this.$store.dispatch("stopTask").then(() => {
                    this.$store.dispatch("fetchTasks");
                  });
              } else {
                this.$store.dispatch("fetchTasks");
              }
              message = payload.data.title + ": " + payload.data.body;
            }
            // Task completed
            else if (payload.data.type == "completed-task") {
              if (this.getActiveTask) {
                if (this.getActiveTask.task_id == payload.data.task_id)
                  this.$store.dispatch("stopTask").then(() => {
                    this.$store.dispatch("fetchTasks");
                  });
              } else {
                this.$store.dispatch("fetchTasks");
              }
              message = payload.data.title + ": " + payload.data.body;
            }
            // New comment
            else if (payload.data.type == "new-comment") {
              this.$store.commit("newComment", payload.data.task_id);
              this.notificationData = payload.data;
              message = payload.data.title + ": " + payload.data.body;
            }
            // Accept invitation
            else if (payload.data.type == "accept-invitation") {
              message = payload.data.title + ": " + payload.data.body;
              this.$store.dispatch("fetchTeamMembers");
            }
            this.notif.message = message;
            this.notify = true;
          });
      } catch (e) {
        console.log("e", e);
      }
    },
  },
  computed: {
    ...mapGetters([
      "getActiveTask",
      "getTask",
      "getSelectedCompany",
      "getLoggedInUser",
    ]),
  },
  created() {
    if (navigator.userAgent.indexOf("Chrome") > -1)
      this.messaging = firebase.messaging();
    this.receiveMessage();
  },
};
</script>