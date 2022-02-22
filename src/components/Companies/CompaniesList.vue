<template>
  <div class="d-flex">
    <v-snackbar
      class="mt-5"
      top
      center
      :color="companyError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="companyError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="companyError ? 'red' : 'green'"
          text
          v-bind="attrs"
          @click="snackbar = false"
          fab
          small
        >
          <v-icon small> mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <!-- User Company Name & Dropdown -->
    <div>
      <v-menu
        content-class="bg-color"
        v-model="companyMenu"
        :close-on-content-click="false"
        offset-y
        max-width="276"
        nudge-right="920"
      >
        <template v-slot:activator="{ on }">
          <!-- Dropdown Button icon -->
          <v-icon id="companies-icon" size="22" v-on="on" color="white"
            >mdi-format-align-justify</v-icon
          >
          <v-tooltip
            bottom
            color="#302277"
            activator="#companies-icon"
            v-if="isExtension"
          >
            <span>Company</span>
          </v-tooltip>
          <div
            v-else
            @click="
              companyBtn = true;
              search = null;
              searchCompany = null;
            "
            class="d-flex justify-end align-center font-weight-bold pb-5"
            v-on="on"
            :class="getSidebarMini ? 'c-name-width' : 'c-name-width-minibar'"
          >
            <div :class="$vuetify.breakpoint.xs ? 'mr-0' : 'mr-2'">
              <profileimage
                class="pointer text-light"
                inline
                v-show="getSelectedCompany.logo ? ':src' : ':username'"
                :username="
                  getSelectedCompany.name
                    ? getSelectedCompany.name
                    : getLoggedInUserName
                "
                :src="getSelectedCompany.logo ? getSelectedCompany.logo : ''"
                :userProfile="false"
                :size="35"
                :circular="true"
              ></profileimage>
            </div>
            <v-tooltip bottom color="#302277">
              <template v-slot:activator="{ on }">
                <div
                  v-if="getSelectedCompany.name"
                  v-on="on"
                  style="max-width: 400px"
                  class="d-inline-block text-truncate pointer mx-1 my-2"
                >
                  {{
                    getSelectedCompany.name
                      ? getSelectedCompany.name[0].toUpperCase() +
                        getSelectedCompany.name.slice(1).toLowerCase()
                      : getSelectedCompany.owner[0].toUpperCase() +
                        getSelectedCompany.owner.slice(1).toLowerCase() +
                        "'s Company"
                  }}
                </div>
              </template>
              <span>{{
                getSelectedCompany.name
                  ? getSelectedCompany.name[0].toUpperCase() +
                    getSelectedCompany.name.slice(1).toLowerCase()
                  : getSelectedCompany.owner[0].toUpperCase() +
                    getSelectedCompany.owner.slice(1).toLowerCase()
              }}</span>
            </v-tooltip>
            <v-btn
              id="companies-dropdown-btn"
              icon
              dark
              x-small
              class="ml-1 my-2"
            >
              <v-icon color="#2A206A">mdi-chevron-down</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- Dropdown Menu List -->
        <v-text-field
          prepend-inner-icon="mdi-magnify"
          background-color="white"
          color="#2a206a"
          placeholder="Search"
          class="pa-1 position"
          outlined
          hide-details
          autofocus
          solo
          dense
          flat
          v-model="search"
        >
        </v-text-field>
        <v-list
          v-if="searchedCompanies"
          max-height="163"
          class="pointer overflow-scroll"
        >
          <div
            :id="company.id"
            v-for="company in searchedCompanies.concat(searchedOwnernames)"
            :key="company.id"
            class="border-bottom listing-hover d-flex list-item-min-height"
            @click="selectCompany(company.id), (companyMenu = false)"
          >
            <profileimage
              class="pointer text-light ml-3"
              inline
              v-show="company.logo ? ':src' : ':username'"
              :username="company.name ? company.name : company.owner"
              :src="company.logo"
              :size="23"
              :circular="true"
            ></profileimage>
            <v-badge
              v-if="company.id == getSelectedCompany.id"
              color="green"
              dot
              class="mt-7 ml-n1"
            ></v-badge>
            <v-list-item-content
              v-if="company.name"
              class="ml-3 d-inline-block text-truncate caption"
              style="max-width: 160px"
              :class="
                company.id == getSelectedCompany.id ? 'font-weight-bold' : ''
              "
            >
              {{
                company.name[0].toUpperCase() +
                company.name.slice(1).toLowerCase()
              }}
            </v-list-item-content>
            <v-list-item-content
              v-else
              class="ml-3 d-inline-block text-truncate caption"
              style="max-width: 160px"
            >
              {{
                company.owner[0].toUpperCase() +
                company.owner.slice(1).toLowerCase()
              }}
              's company
            </v-list-item-content>
            <v-spacer></v-spacer>

            <div
              v-if="company.id == getSelectedCompany.id"
              class="caption ml-2 mr-1 default"
            >
              Default
            </div>
          </div>

          <div v-if="search && !searchedCompanies.length">
            <p class="no-results-found my-1">No results found.</p>
          </div>
        </v-list>
        <v-btn
          v-model="companyBtn"
          v-if="companyBtn"
          @click="search ? addCompany() : (companyBtn = false)"
          color="#EEF0F6"
          width="260"
          class="listing-hover mx-2 my-2"
        >
          <v-icon class="mx-1">mdi-plus</v-icon> New Workspace</v-btn
        >
        <v-text-field
          class="pa-0 ma-0 caption"
          v-else
          v-model="searchCompany"
          prepend-inner-icon="mdi-plus"
          color="#2a206a"
          background-color="#F8F7FD"
          hide-details
          autofocus
          solo
          dense
          flat
          @keydown.enter="addCompany()"
        >
          <template v-slot:append>
            <div class="font-size pa-0 ma-0" color="#2a206a">
              *press enter to add
            </div>
          </template>
        </v-text-field>
      </v-menu>
    </div>
  </div>
</template>
<script>
import profileimage from "@/components/includes/ProfileImage";
import { eventBus } from "@/main";
import { mapGetters } from "vuex";
export default {
  name: "CompaniesList",
  components: {
    profileimage,
  },
  data() {
    return {
      companyBtn: true,
      searchCompany: null,
      search: null,
      companyMenu: false,
      companyError: null,
      snackbar: false,
      snackbarMessage: null,
    };
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getCompanies",
      "getLoggedInUser",
      "getProjects",
      "getOwnerNames",
      "getActiveTask",
      "getScreenRecorderState",
      "getSidebarMini",
    ]),

    isExtension() {
      return window.innerHeight == "600" && window.innerWidth == "450";
    },

    searchedCompanies() {
      return this.search && this.getCompanies
        ? this.getCompanies.filter((item) => {
            return item.name
              ? item.name.toLowerCase().includes(this.search.toLowerCase())
              : false;
          })
        : this.getCompanies;
    },

    searchedOwnernames() {
      return this.search && this.getOwnerNames
        ? this.getOwnerNames.filter((item) => {
            return item.owner
              ? item.owner.toLowerCase().includes(this.search.toLowerCase())
              : false;
          })
        : this.getOwnerNames;
    },

    getLoggedInUserName() {
      return this.getLoggedInUser.name
        .split(" ")
        .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
        .join(" ");
    },
  },
  methods: {
    // company select
    selectCompany(id) {
      if (this.getScreenRecorderState) {
        return;
      }
      let c_id = {
        company_id: id,
      };
      if (this.getActiveTask) {
        this.snackbar = true;
        this.snackbarMessage = "Please stop your task";
        this.companyError = true;
      } else {
        this.$store.commit("setTasksSkeletonLoader", true);
        this.$store.dispatch("stopTask").then(() => {
          if (this.$route.name != "task" && localStorage.getItem("user"))
            this.$router.push({
              name: "task",
            });
          this.$store.commit("setMembers", null);
          this.$store.commit("setSelectedProject", null);
          eventBus.$emit("companySwitched");
          this.$store.dispatch("updateLastCompany", c_id);
          this.$store.dispatch("selectCompany", id).then(() => {
            this.$store.dispatch("fetchProjects");
            if (
              !(
                this.getSelectedCompany.role == "admin" &&
                !this.getSelectedCompany.permissions.team_member &&
                this.getSelectedCompany.permissions.project
              )
            ) {
              this.$store.dispatch("fetchTeamMembers");
            }
          });
        });
      }
    },

    // add company
    addCompany() {
      if (this.search || this.searchCompany) {
        let companyAddData = {
          name: this.search ? this.search : this.searchCompany,
        };
        this.$store
          .dispatch("createCompany", companyAddData)
          .then((response) => {
            this.companyBtn = true;
            this.searchCompany = null;
            this.search = null;
            this.snackbar = true;
            this.snackbarMessage = response.data.error_msg;
            this.companyError = false;
          })
          .catch((error) => {
            if (error.response.status == 422) {
              this.snackbar = true;
              this.snackbarMessage = error.response.data.errors.name[0];
              this.companyError = true;
            }
          });
      } else {
        this.snackbar = true;
        this.snackbarMessage = "Please enter the name of the company";
        this.companyError = true;
      }
    },
  },
};
</script>
<style scoped>
@font-face {
  font-family: Roboto;
  src: url("https://fonts.googleapis.com/css?family=Roboto");
}
.c-name-width {
  width: calc(100vw - 280px);
}
.c-name-width-minibar {
  width: calc(100vw - 480px);
}
.font-size {
  font-size: 10px;
}
.default {
  height: 19px;
  width: 48px;
  color: #a2b0cc;
  font-family: "Open Sans";
  font-size: 14px;
  letter-spacing: 0;
  line-height: 19px;
  margin-top: 14px !important;
}
.oval {
  height: 14px;
  width: 14px;
  background-color: #00b67a;
}
.btn-green {
  background-color: green !important;
}
.active-company {
  background-color: rgb(245, 234, 225);
}
.bg-color {
  background-color: white !important;
}
.position {
  position: sticky;
}
.w-12 {
  width: 120px !important;
}
/* #selected-company-name{
  font-size: 14px;
} */
</style>
