<template>
  <div id="app">
    <v-app class="position-relative">
      <v-tooltip color="#302277" bottom open-delay="300">
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            v-show="breakpoint == 'lg' || breakpoint == 'xl'"
            class="toggler"
            @click="toggleMini"
            fab
          >
            <v-icon color="white">{{
              mini ? "mdi-chevron-right" : "mdi-chevron-left"
            }}</v-icon>
          </v-btn>
        </template>
        <span>{{ mini ? "Expand" : "Minimize" }}</span>
      </v-tooltip>

      <v-navigation-drawer
        v-if="!isExtension"
        disable-resize-watcher
        disable-route-watcher
        permanent
        :mini-variant="mini"
        app
      >
        <v-card
          dark
          class="rounded-0 h-100 overflow-hidden left-pannel-bg-color"
        >
          <v-list-item :class="$vuetify.breakpoint.xs ? 'px-1' : 'px-1'">
            <!-- User Profile -->
            <v-menu>
              <template v-slot:activator="{ on }">
                <profileimage
                  class="pointer text-light mt-2"
                  v-on="on"
                  inline
                  v-show="getLoggedInUser.image ? ':src' : ':username'"
                  :username="getLoggedInUser.name"
                  :src="getLoggedInUser.image"
                  :userProfile="true"
                  :size="$vuetify.breakpoint.xs ? 40 : 50"
                  :circular="true"
                ></profileimage>
              </template>
              <v-list>
                <v-list-item id="user-profile-setting-dropdown-list">
                  <v-list-item-title>Profile Setting</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <!-- User Name -->
            <v-list-item-content>
              <v-list-item-title id="User-name" class="ml-4">
                <v-tooltip color="#6C5CD6" bottom>
                  <template v-slot:activator="{ on }">
                    <span
                      class="d-inline-block text-truncate pointer font-weight-bold text-capitalize"
                      v-on="on"
                      style="max-width: 120px"
                    >
                      {{ getLoggedInUserName }}
                    </span>
                  </template>
                  <span
                    :class="getLoggedInUser.name ? 'text-capitalize' : ''"
                    >{{
                      getLoggedInUser.name
                        ? getLoggedInUser.name
                        : getLoggedInUser.email
                    }}</span
                  >
                </v-tooltip>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!------Render Left Pannel List---->
          <div id="sidebar-list" class="mt-16 pointer">
            <div
              :class="[
                title == link.text ? 'selected-route' : '',
                getSelectedCompany.role == 'employee' ? 'd-none' : '',
              ]"
              class="d-flex align-center py-4 pl-4"
              id="left-nav-listitem"
              v-for="(link, i) in links"
              :key="i"
              @click="redirect(link)"
              :disabled="
                getPendingTimer || getOnlineStatus == false ? true : false
              "
            >
              <!-- Sidebar Icons -->
              <div :id="link.icon">
                <v-icon
                  :class="!getOnlineStatus ? 'disabled-icon' : ''"
                  class="sidebar-icons mr-7"
                  v-text="link.icon"
                  size="25"
                ></v-icon>
              </div>
              <v-tooltip
                v-if="getSidebarMini"
                :activator="'#' + link.icon"
                nudge-right="7"
                right
                color="#302277"
              >
                <span> {{ link.text }} </span>
              </v-tooltip>

              <!-- Sidebar Text -->
              <div v-show="!getSidebarMini" id="left-nav-list-text">
                <div
                  v-if="
                    link.text == 'Task Tracker' &&
                    $route.name != 'task' &&
                    getTimer &&
                    getActiveTask
                  "
                >
                  <b class="sidebar-link-text">{{ time }}</b>
                </div>
                <div v-else>
                  <b class="sidebar-link-text">{{ link.text }}</b>
                </div>
              </div>
            </div>
            <div
              :disabled="
                getPendingTimer ||
                getOnlineStatus == false ||
                getScreenRecorderState
                  ? true
                  : false
              "
              @click="logout()"
              id="logout"
              class="pointer d-flex align-center py-4 pl-4"
            >
              <div id="logout-icon">
                <v-icon
                  size="25"
                  class="mr-7"
                  :class="!getOnlineStatus ? 'disabled-icon' : ''"
                  >mdi-logout</v-icon
                >
              </div>
              <v-tooltip
                v-if="getSidebarMini"
                activator="#logout-icon"
                nudge-right="7"
                right
                color="#302277"
              >
                <span> {{ "Logout" }} </span>
              </v-tooltip>
              <!-- Sidebar Text -->
              <div>
                <div id="logout-text"><b>Log Out </b></div>
              </div>
            </div>
            <div
              style="background-color: #1cc283; height: 40px"
              :disabled="
                getPendingTimer ||
                getOnlineStatus == false ||
                getScreenRecorderState
                  ? true
                  : false
              "
              @click="extension()"
              id="extension"
              class="pointer extension-button rounded mx-2 d-flex align-center py-4 pl-2"
            >
              <div class="mr-7" id="extension-icon">
                <img
                  src="../../assets/images/chrome-w.svg"
                  style="padding-top: 5px; padding-left: 1px"
                />
              </div>
              <v-tooltip
                v-if="getSidebarMini"
                activator="#extension-icon"
                nudge-right="7"
                right
                color="#302277"
              >
                <span> {{ "For Chrome" }} </span>
              </v-tooltip>
              <!-- Sidebar Text -->
              <div v-if="!getSidebarMini">Download Extension</div>
            </div>
          </div>
          <v-spacer></v-spacer>
        </v-card>
      </v-navigation-drawer>
      <!-- Top Bar -->
      <v-app-bar
        app
        :color="isExtension ? '#2A206A' : 'white'"
        :height="isExtension ? 48 : 58"
      >
        <v-overlay
          :value="!getOnlineStatus"
          v-if="!getOnlineStatus"
          opacity="1"
          color="#FFF5F7"
        >
          <span class="overlay-text1-color font-weight-bold">
            <v-icon class="overlay-text1-color">
              mdi-close-circle-outline
            </v-icon>

            Offline Mode !</span
          >
          <span class="overlay-text2-color"> No internet Connection </span>
        </v-overlay>
        <img
          v-if="isExtension"
          src="@/assets/images/logo-2.svg"
          height="28px"
        />
        <v-toolbar-title
          v-else
          class="font-weight-bold text-h6"
          id="rightpannel-header-title"
          >{{ title }}</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-icon @click="logout()" size="19" class="mx-2" color="white"
          >mdi-logout</v-icon
        >
        <span>
          <CompaniesList />
        </span>
        <!--Selected Company Avatar-->
      </v-app-bar>
    </v-app>
    <v-snackbar
      class="mt-5"
      top
      right
      :color="logoutError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="logoutError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="logoutError ? 'red' : 'green'"
          text
          v-bind="attrs"
          @click="snackbar = false"
          small
          fab
        >
          <v-icon small> mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import profileimage from "@/components/includes/ProfileImage";
import timer from "@/timer";

export default {
  name: "Sidebar",
  components: {
    CompaniesList: () => import("@/components/Companies/CompaniesList.vue"),
    profileimage,
  },

  data() {
    return {
      logoutError: null,
      snackbar: false,
      snackbarMessage: null,
      selectedCompany: null,
      userName: "",
      title: "",
      mini: true,
      // Router links Array
      links: [
        {
          icon: "mdi-view-dashboard",
          text: "Dashboard",
          route: "/dashboard",
        },
        {
          icon: "mdi-clock-fast",
          text: "Task Tracker",
          route: "/task",
        },
        {
          icon: "mdi-account-supervisor-outline",
          text: "Team Members",
          route: "/member",
        },
        {
          icon: "mdi-chart-line",
          text: "Reports",
          route: "/reports",
        },
        {
          icon: "mdi-cog",
          text: "Settings",
          route: "/companysettings",
        },
      ],
    };
  },
  computed: {
    ...mapGetters([
      "getLoggedInUser",
      "getSelectedCompany",
      "getTime",
      "getActiveTask",
      "getTimer",
      "getPendingTimer",
      "getOnlineStatus",
      "getScreenRecorderState",
      "getSidebarMini",
    ]),
    role() {
      return this.getSelectedCompany.role;
    },
    isExtension() {
      return window.innerHeight == "600" && window.innerWidth == "450";
    },

    time() {
      return timer.format(this.getTimer);
    },
    breakpoint() {
      return this.$vuetify.breakpoint.name;
    },
    getLoggedInUserName() {
      var userName = this.getLoggedInUser.name;
      if (userName) {
        userName = userName.split(" ");
        if (userName.length >= 3) {
          userName =
            userName[0].charAt(0) +
            " " +
            userName[1].charAt(0) +
            " " +
            userName[2];

          return userName;
        } else {
          return this.getLoggedInUser.name;
        }
      }
      return this.getLoggedInUser.email;
    },
    currentRouteName() {
      return this.$route.path;
    },
  },

  watch: {
    role(value) {
      if (
        !(
          value == "owner" ||
          value == "team-manager" ||
          (value == "admin" && this.getSelectedCompany.permissions.team_member)
        )
      ) {
        this.links = this.links.filter((item) => {
          return item.route != "/member";
        });
      } else {
        this.links = [
          {
            icon: "mdi-view-dashboard",
            text: "Dashboard",
            route: "/dashboard",
          },
          {
            icon: "mdi-clock-fast",
            text: "Task Tracker",
            route: "/task",
          },
          {
            icon: "mdi-account-supervisor-outline",
            text: "Team Members",
            route: "/member",
          },
          {
            icon: "mdi-chart-line",
            text: "Reports",
            route: "/reports",
          },
          {
            icon: "mdi-cog",
            text: "Settings",
            route: "/companysettings",
          },
        ];
      }
    },

    getSelectedCompany(value) {
      if (
        !(
          value.role == "owner" ||
          value.role == "team-manager" ||
          (value.role == "admin" && value.permissions.team_member)
        )
      ) {
        this.links = this.links.filter((item) => {
          return item.route != "/member";
        });
      } else {
        this.links = [
          {
            icon: "mdi-view-dashboard",
            text: "Dashboard",
            route: "/dashboard",
          },
          {
            icon: "mdi-clock-fast",
            text: "Task Tracker",
            route: "/task",
          },
          {
            icon: "mdi-account-supervisor-outline",
            text: "Team Members",
            route: "/member",
          },
          {
            icon: "mdi-chart-line",
            text: "Reports",
            route: "/reports",
          },
          {
            icon: "mdi-cog",
            text: "Settings",
            route: "/companysettings",
          },
        ];
      }
    },
    $route(value) {
      this.title = value.meta.title;
    },
    // Watcher for breakpoint, when screen hits the
    // large or small screen. Navigation drawer will get open
    breakpoint(value) {
      if (value == "md" || value == "sm" || value == "xs") {
        this.mini = true;
        this.$store.commit("setSidebarMini", true);
      }
    },
  },
  mounted() {
    if (
      !(
        this.role == "owner" ||
        this.role == "team-manager" ||
        (this.role == "admin" &&
          this.getSelectedCompany.permissions.team_member)
      )
    ) {
      this.links = this.links.filter((item) => {
        return item.route != "/member";
      });
    } else {
      this.links = [
        {
          icon: "mdi-view-dashboard",
          text: "Dashboard",
          route: "/dashboard",
        },
        {
          icon: "mdi-clock-fast",
          text: "Task Tracker",
          route: "/task",
        },
        {
          icon: "mdi-account-supervisor-outline",
          text: "Team Members",
          route: "/member",
        },
        {
          icon: "mdi-chart-line",
          text: "Reports",
          route: "/reports",
        },
        {
          icon: "mdi-cog",
          text: "Settings",
          route: "/companysettings",
        },
      ];
    }

    // Mini variant by default
    this.$store.commit("setSidebarMini", true);
    //Return selected Route title on click
    let link = this.links.find((item) => {
      return item.route == this.$route.path;
    });
    this.title = link.text;
  },
  methods: {
    ...mapActions(["selectCompany"]),
    redirect(link) {
      if (link.text == "Task Tracker") {
        if (this.title != "Task Tracker") {
          this.$store.commit("resetTaskFilters");
          this.$router.push({ path: link.route });
        } else {
          this.$store.commit("resetTaskFilters");
          this.$store.dispatch("fetchTasks");
        }
      } else {
        this.$route.path != link.route
          ? this.$router.push({ path: link.route })
          : () => {};
      }
    },
    // Toggle sidebar
    toggleMini() {
      this.mini = !this.mini;
      this.$store.commit("setSidebarMini", this.mini);
    },
    extension() {
      window.open(
        "https://chrome.google.com/webstore/detail/gigs-timer/cimhmkfhdmcnneknggkhbdcefhimjdgo/related?hl=en",
        "_blank"
      );
    },
    logout() {
      if (this.getActiveTask) {
        this.snackbar = true;
        this.snackbarMessage = "Please stop your task";
        this.logoutError = true;
      } else {
        window.document.title = "task timer";
        this.getActiveTask ? this.$store.dispatch("stopTask") : () => {};
        this.$store.dispatch("logout");
      }
    },
  },
};
</script>
<style scoped>
.toggler {
  position: absolute;
  left: -15px;
  top: 20px;
  z-index: 9999;
  background-color: #2a206a !important;
  border: solid white 1.8px;
  height: 30px;
  width: 30px;
}

@font-face {
  font-family: Roboto;
  src: url("https://fonts.googleapis.com/css?family=Roboto");
}
#rightpannel-header-title {
  color: #2a206a;
}
.v-bottom-navigation {
  box-shadow: none !important;
}
.v-btn--fab.v-size--x-small {
  height: 29px !important;
  width: 28px;
}
.v-btn--fab.v-btn--absolute,
.v-btn--fab.v-btn--fixed {
  z-index: 10;
}
.v-btn--absolute.v-btn--right,
.v-btn--fixed.v-btn--right {
  left: -3px;
  top: 45px;
  position: absolute;
}
.v-btn--is-elevated.v-btn--fab {
  box-shadow: none;
}
.selected-route {
  border-left: 2px solid #1cc283 !important;
  background-color: #a49fc781;
}
.disabled-icon {
  color: #757096 !important;
}
.overlay-text1-color {
  color: red !important;
}
.overlay-text2-color {
  color: black !important;
}
@media (max-width: 1600px) and (min-width: 1000px) {
  .extension-button {
    margin-top: 16vh;
  }
}
@media (max-width: 2500px) and (min-width: 1601px) {
  .extension-button {
    margin-top: 40vh;
  }
}
@media (max-width: 2600px) and (min-width: 2501px) {
  .extension-button {
    margin-top: 35vh;
  }
}
</style>
<style>
.mdi-google-chrome::before {
  content: "\F02AF";
  font-size: 33px;
  margin-top: -7px;
  margin-left: -5px;
}
</style>
