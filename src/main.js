import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Vuetify from "vuetify";
import VueMq from "vue-mq";
import createPersistedState from "vuex-persistedstate";
import moment from "moment";
import firebase from "firebase";
import "firebase/messaging";
import "vuetify/dist/vuetify.min.css";
import "@mdi/font/css/materialdesignicons.css";
import "@/assets/css/styles.css";

import AudioRecorder from "vue-audio-recorder";
import "./registerServiceWorker";
// debugger for console logs
import myDebugger from "./console";

Vue.use(AudioRecorder);

// Event bus
export const eventBus = new Vue();

// // Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAE2dYllUY4DOzMnIbrbK2N5-LselonGK4",
  authDomain: "gigstimer.firebaseapp.com",
  projectId: "gigstimer",
  storageBucket: "gigstimer.appspot.com",
  messagingSenderId: "768974872886",
  appId: "1:768974872886:web:bfa7d92b95adc51c42d397",
  measurementId: "G-RCKLE7Y59N",
});

if ("serviceWorker" in navigator) {
  // Supported!
  navigator.serviceWorker.onmessage = (payload) => {
    // Assigned task
    if (payload.data.type == "assign") {
      store.commit("setTaskFilter", {
        status: "pending",
      });
      store.dispatch("fetchTasks");
    }
    // Removed from task
    else if (payload.data.type == "remove") {
      if (store.getters.getActiveTask) {
        if (store.getters.getActiveTask.task_id == payload.data.task_id)
          store.dispatch("stopTask").then(() => {
            store.dispatch("fetchTasks");
          });
      } else {
        store.dispatch("fetchTasks");
      }
    }
    // Task completed
    else if (payload.data.type == "completed-task") {
      if (store.getters.getActiveTask) {
        if (store.getters.getActiveTask.task_id == payload.data.task_id)
          store.dispatch("stopTask").then(() => {
            store.dispatch("fetchTasks");
          });
      } else {
        store.dispatch("fetchTasks");
      }
    }
    // New comment
    else if (payload.data.type == "new-comment") {
      console.log("received in main js", payload);
      if (payload.data.action == "complete-task") {
        let task = store.getters.getTask(payload.data.task_id);
        store.dispatch("updateTask", {
          task_id: payload.data.task_id,
          company_id: payload.data.company_id,
          project_id: task.project ? task.project.id : null,
          status: "completed",
          completed_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
      } else if (window.location.href != "https://gigstimer.com/task") {
        localStorage.setItem(
          "new-comment",
          JSON.stringify({
            title: payload.data.task_title,
            task_id: payload.data.task_id,
          })
        );
        window.location.href = "https://gigstimer.com/task";
      } else {
        eventBus.$emit("new-comment", {
          title: payload.data.task_title,
          task_id: payload.data.task_id,
        });
      }
    }
    // Accept invitation
    else if (payload.data.type == "accept-invitation") {
      store.dispatch("fetchTeamMembers");
    }
  };
}

Vue.use(Vuetify);
//Media queries
Vue.use(VueMq, {
  breakpoints: {
    extraSmallPhones: 390,
    phone: 450,
    xs: 850,
    sm: 1400,
  },
});
Vue.config.productionTip = false;
createPersistedState()(store);

// Prototypes
Vue.prototype.$debug = myDebugger;

new Vue({
  router,
  store,
  moment,
  vuetify: new Vuetify(),
  render: (h) => h(App),
}).$mount("#app");
