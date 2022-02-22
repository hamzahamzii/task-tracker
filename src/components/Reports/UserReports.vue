<template>
  <div class="mt-10 mx-4">
    <!-- Date Range Row -->
    <div class="d-flex justify-end mb-5">
      <div
        style="width: 200px"
        class="d-flex justify-end mr-3 theme-border rounded"
      >
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <!-- Date Range Textfield -->
            <v-text-field
              v-bind="attrs"
              v-model="selectedDateItem"
              solo
              flat
              hide-details
              dense
              readonly
              class="pointer"
              :class="
                $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                  ? 'caption'
                  : 'subtitle-2'
              "
              color="#2a206a"
              append-icon="mdi-calendar"
              v-on="on"
            ></v-text-field>
          </template>
          <v-list>
            <v-list-item
              v-for="date of dateRanges"
              :key="date.text"
              class="date-range-dropdown pointer"
              :class="selectedDateItem == date.text ? 'bg-selected' : ''"
              @click="selectedDateItem = date.text"
            >
              <v-list-item-title class="date-range-text-color">{{
                date.text
              }}</v-list-item-title>
              <v-icon
                small
                color="#1cc283"
                v-if="selectedDateItem == date.text"
              >
                mdi-check-box-outline</v-icon
              >
            </v-list-item>
            <!-- Date Range Dropdown -->
            <v-menu
              v-model="customRangeMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              nudge-left="80"
              max-width="290px"
              min-width="auto"
            >
              <template v-slot:activator="{ on }">
                <v-list-item
                  class="date-range-dropdown pointer"
                  v-on="on"
                  :class="
                    selectedDateItem == 'Custom Range' ? 'bg-selected' : ''
                  "
                >
                  <v-list-item-title class="date-range-text-color"
                    >Custom Range</v-list-item-title
                  >
                  <v-icon
                    small
                    color="#1cc283"
                    v-if="selectedDateItem == 'Custom Range'"
                  >
                    mdi-check-box-outline</v-icon
                  >
                </v-list-item>
              </template>
              <v-date-picker
                v-model="selectedDates"
                no-title
                range
                color="#2a206a"
              >
                <v-layout class="justify-end">
                  <v-btn
                    text
                    color="#2a206a"
                    class="mt-n5 claender-ok-btn"
                    @click="customRangeSearch()"
                  >
                    OK
                  </v-btn>
                </v-layout>
              </v-date-picker>
            </v-menu>
          </v-list>
        </v-menu>
      </div>
    </div>
    <!-- Filter(s) Row -->
    <div
      :class="
        $vuetify.breakpoint.md
          ? 'table-width-2'
          : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
          ? 'table-width-3'
          : getSidebarMini
          ? 'table-width-5'
          : 'table-width'
      "
      id="filter-row"
      style="overflow: scroll"
      class="d-flex align-center theme-border my-1 pa-2"
    >
      <div
        v-if="getSelectedCompany.role != 'employee'"
        class="d-flex align-center"
      >
        <v-icon v-if="$vuetify.breakpoint.xs" class="dusty-purple-text mr-2"
          >mdi-filter-outline</v-icon
        >
        <span v-else class="dusty-purple-text mx-4">Filter By</span>
        <div
          v-if="
            getSelectedCompany.role == 'owner' ||
              (getSelectedCompany.role == 'admin' &&
                getSelectedCompany.permissions.team_member)
          "
          class="vertical-dotted-border px-1"
        >
          <!-- 'Team Lead' Menu -->
          <v-menu close-on-click offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="#1CC283"
                class="text-capitalize"
                text
                v-bind="attrs"
                v-on="on"
                tile
              >
                <v-icon medium v-if="$vuetify.breakpoint.xs" class="d-sm-none"
                  >mdi-account-supervisor-outline</v-icon
                >
                <span
                  class="align-center d-flex d-inline-block text-truncate"
                  :class="
                    selectedTeamLead && !selectedTeamLead.name
                      ? 'text-lowercase'
                      : ''
                  "
                  v-else
                >
                  <v-icon
                    :class="selectedTeamLead ? 'd-none' : ''"
                    class="mx-1"
                    small
                    >mdi-plus-circle-outline</v-icon
                  >
                  {{
                    selectedTeamLead
                      ? selectedTeamLead.name
                        ? selectedTeamLead.name
                        : selectedTeamLead.email
                      : "Team Lead"
                  }}
                </span>
              </v-btn>
            </template>
            <v-text-field
              v-model="searchTeamLead"
              prepend-inner-icon="mdi-magnify"
              background-color="white"
              color="#2a206a"
              placeholder="Search by name/email"
              class="pa-1"
              outlined
              hide-details
              solo
              dense
              flat
              autofocus
            >
            </v-text-field>
            <v-list class="overflow-scroll" scrollable max-height="200">
              <v-list-item-group v-if="teamLeadsArray.length">
                <v-list-item
                  class="pointer listing-hover d-flex list-item-min-height"
                  v-for="teamLead in filteredTeamLeads"
                  :key="teamLead.id"
                  @click="selectTeamLead(teamLead)"
                >
                  <div class="d-flex">
                    <profileimage
                      v-show="teamLead.image ? ':src' : ':username'"
                      :src="teamLead.image"
                      inline
                      :username="teamLead.name ? teamLead.name : teamLead.email"
                      :size="23"
                      :circular="true"
                    ></profileimage>
                    <v-list-item-content
                      class="caption ml-2 text-capitalize"
                      v-if="teamLead.name"
                    >
                      {{ teamLead.name }}
                    </v-list-item-content>
                    <v-list-item-content class="caption ml-2" v-else>
                      {{ teamLead.email }}
                    </v-list-item-content>
                  </div>
                </v-list-item>
              </v-list-item-group>
              <v-list-item-group v-else
                ><v-list-item>
                  <div class="grey--text subtitle-2 ml-4">
                    Not Found
                  </div></v-list-item
                ></v-list-item-group
              >
              <div
                v-if="
                  searchTeamLead &&
                    filteredTeamLeads &&
                    !filteredTeamLeads.length
                "
              >
                <p class="no-results-found my-1">No results found</p>
              </div>
            </v-list>
          </v-menu>
        </div>
        <div class="vertical-dotted-border px-1">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="#1CC283"
                class="text-capitalize"
                text
                v-bind="attrs"
                v-on="on"
              >
                <span v-if="$vuetify.breakpoint.xs">
                  <img
                    src="@/assets/images/add_member_icon.svg"
                    class="mt-1 d-sm-none"
                    height="24px"
                    alt="member"
                  />
                </span>
                <div v-else class="align-center d-flex">
                  <v-icon
                    :class="selectedMember ? 'd-none' : ''"
                    class="mx-1"
                    small
                    >mdi-plus-circle-outline</v-icon
                  >
                  <span
                    :class="
                      selectedMember && !selectedMember.name
                        ? 'text-lowercase'
                        : ''
                    "
                    style="max-width: 120px"
                    class="d-inline-block text-truncate"
                  >
                    {{
                      selectedMember
                        ? selectedMember.name
                          ? selectedMember.name
                          : selectedMember.email
                        : "Members"
                    }}
                  </span>
                </div>
              </v-btn>
            </template>
            <!-- Member List -->
            <v-text-field
              v-model="searchMember"
              prepend-inner-icon="mdi-magnify"
              background-color="white"
              color="#2a206a"
              placeholder="Search by name/email"
              class="pa-1"
              outlined
              hide-details
              solo
              dense
              flat
              autofocus
            >
            </v-text-field>
            <v-list class="overflow-scroll" scrollable max-height="200">
              <v-list-item-group>
                <v-list-item
                  class="pointer listing-hover d-flex list-item-min-height"
                  v-for="member in teamMembersList"
                  :key="member.id"
                  :id="member.id"
                  @click="
                    selectedMember && selectedMember.id == member.id
                      ? (selectedMember = null)
                      : (selectedMember = member)
                  "
                >
                  <profileimage
                    v-show="member.image ? ':src' : ':username'"
                    :src="member.image"
                    inline
                    :username="member.name ? member.name : member.email"
                    :size="23"
                    :circular="true"
                  ></profileimage>
                  <v-list-item-content
                    v-if="member.name"
                    class="caption ml-2 text-capitalize"
                  >
                    {{ member.name }}
                  </v-list-item-content>
                  <v-list-item-content v-else class="caption ml-2">
                    {{ member.email }}
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
              <div
                v-if="
                  searchMember && teamMembersList && !teamMembersList.length
                "
              >
                <p class="no-results-found my-1">No results found</p>
              </div>
            </v-list>
          </v-menu>
        </div>
        <!-- Project Menu -->
        <div class="vertical-dotted-border px-1">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="#1CC283"
                class="text-capitalize"
                text
                v-bind="attrs"
                v-on="on"
              >
                <span v-if="$vuetify.breakpoint.xs">
                  <img
                    src="@/assets/images/add_projects_icon.svg"
                    class="mt-1 d-sm-none"
                    height="24px"
                    alt="project"
                  />
                </span>
                <div v-else class="d-flex align-center">
                  <v-icon
                    :class="selectedProject ? 'd-none' : ''"
                    class="mx-1"
                    small
                    >mdi-plus-circle-outline</v-icon
                  >
                  <span
                    class="d-inline-block text-truncate"
                    style="max-width: 120px"
                  >
                    {{ selectedProject ? selectedProject.name : "Projects" }}
                  </span>
                </div>
              </v-btn>
            </template>
            <!-- Project List -->
            <v-text-field
              v-model="searchProject"
              prepend-inner-icon="mdi-magnify"
              background-color="white"
              color="#2a206a"
              placeholder="Search project"
              class="pa-1"
              outlined
              hide-details
              solo
              dense
              flat
              autofocus
            >
            </v-text-field>
            <v-list class="overflow-scroll" scrollable max-height="200">
              <v-list-item-group>
                <v-list-item
                  class="pointer listing-hover d-flex list-item-min-height"
                  v-for="project in projectsList"
                  :key="project.id"
                  :id="project.id"
                  @click="
                    selectedProject && selectedProject.id == project.id
                      ? (selectedProject = null)
                      : (selectedProject = project)
                  "
                >
                  <profileimage
                    inline
                    :username="project.name"
                    :size="23"
                    :circular="true"
                    class="text-light"
                  >
                  </profileimage>
                  <v-list-item-content class="caption ml-2 text-capitalize">
                    {{ project.name }}
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
              <div v-if="searchProject && projectsList && !projectsList.length">
                <p class="no-results-found my-1">No results found</p>
              </div>
            </v-list>
          </v-menu>
        </div>
      </div>
      <v-spacer></v-spacer>
      <!-- 'Export As' Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="text-capitalize theme-border mx-2"
            text
            v-bind="attrs"
            v-on="on"
          >
            <div
              class="vertical-dotted-border mt-1"
              v-if="$vuetify.breakpoint.xs"
            >
              <v-icon class="ml-2 mt-1">mdi-printer</v-icon>
            </div>
            <span class="align-center d-flex" v-else>
              Download As
              <v-icon class="mt-1" x-small>mdi-chevron-down</v-icon>
            </span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item class="listing-hover pointer" @click="download('csv')">
            <img
              src="@/assets/images/Csv_icon.png"
              height="16px"
              class="mr-1"
            />
            <v-list-item-title class="listing-hover">CSV</v-list-item-title>
          </v-list-item>
          <v-list-item class="listing-hover pointer" @click="download('xls')">
            <img
              src="@/assets/images/Excel_icon.png"
              height="18px"
              class="mr-1"
            />
            <v-list-item-title class="listing-hover">EXCEL</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <!-- Expansion Panel -->
    <div
      id="expansion-panel"
      :class="
        $vuetify.breakpoint.md
          ? 'table-width-2'
          : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
          ? 'table-width-3'
          : getSidebarMini
          ? 'table-width-5'
          : 'table-width'
      "
      style="max-height: 70vh; overflow-y: scroll"
      class="theme-border"
    >
      <v-expansion-panels multiple accordion v-model="selectedPanel">
        <v-expansion-panel v-for="(user, i) in getReports" :key="i">
          <v-expansion-panel-header hide-actions class="justify-self-start">
            <div class="d-flex align-center">
              <!-- If a panel is currently expanded show '+' icon else show '-' -->
              <!-- If 'selectedPanel' array includes this index => the panel is expanded -->
              <v-icon class="mt-2 mx-1" color="#1CC283">
                {{
                  selectedPanel.includes(i)
                    ? "mdi-minus-box-outline"
                    : "mdi-plus-box-outline"
                }}
              </v-icon>
              <profileimage
                class="pointer text-light mt-2"
                inline
                v-show="user.image ? ':src' : ':username'"
                :username="user.name ? user.name : user.email"
                :src="user.image"
                :userProfile="true"
                :size="$vuetify.breakpoint.xs ? 30 : 40"
                :circular="true"
              ></profileimage>
              <span
                :class="user.name ? 'text-capitalize' : ''"
                class="mx-2 panel-user"
                >{{ user.name ? user.name : user.email }}</span
              >
              <v-spacer></v-spacer>
              <span class="mx-2 ui-theme-color"
                ><b>{{ user.summary.total_time }}</b>
              </span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-simple-table class="table-border">
              <template v-slot:default>
                <thead>
                  <tr class="faded-purple-bg">
                    <th class="text-left ui-theme-color">Task Title</th>
                    <th class="text-left ui-theme-color">Project</th>
                    <th class="text-left ui-theme-color">Time Spent</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="user.tasks.length != 0">
                    <tr v-for="task in user.tasks" :key="task.id">
                      <td>
                        {{ task.title }}
                      </td>
                      <td>
                        {{
                          task.project && task.project.name
                            ? task.project.name
                            : "no project"
                        }}
                      </td>
                      <td>{{ task.total_time }}</td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td
                        colspan="12"
                        class="grey--text text-center font-italic"
                      >
                        No Record Found
                      </td>
                    </tr>
                  </template>
                </tbody>
              </template>
            </v-simple-table>

            <div class="theme-border my-5 pa-3 rounded">
              <div class="text-h6 mx-2 font-weight-bold ui-theme-color">
                Summary
              </div>
              <div class="d-flex justify-center">
                <v-row>
                  <v-col cols="12" md="4">
                    <!-- Pending Task Card -->
                    <v-card
                      @click="goToPending(user)"
                      elevation="0"
                      class="mx-2 my-2"
                    >
                      <v-card-title
                        :class="
                          $vuetify.breakpoint.xs ? 'caption' : 'subtitle-1'
                        "
                        class="pa-2 pending-task-bg pending-task-text"
                      >
                        <v-icon
                          :small="$vuetify.breakpoint.xs"
                          class="mx-2 pending-task-text"
                          >mdi-clock-alert-outline</v-icon
                        >
                        <span>Pending Task(s)</span>
                        <v-spacer></v-spacer>
                        <span
                          :class="
                            $vuetify.breakpoint.xs ? 'text-h6' : 'text-h5'
                          "
                          class="mx-1"
                          >{{ user.summary.pending }}</span
                        >
                      </v-card-title>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="4">
                    <!-- Overdue Task Card -->
                    <v-card
                      @click="goToCompleted(user)"
                      elevation="0"
                      class="mx-2 my-2"
                    >
                      <v-card-title
                        :class="
                          $vuetify.breakpoint.xs ? 'caption' : 'subtitle-1'
                        "
                        class="pa-2 overdue-task-bg overdue-task-text"
                      >
                        <v-icon
                          :small="$vuetify.breakpoint.xs"
                          class="mx-2 overdue-task-text"
                          >mdi-alert-circle-outline</v-icon
                        >
                        <span>Overdue Task(s)</span>
                        <v-spacer></v-spacer>
                        <span
                          :class="
                            $vuetify.breakpoint.xs ? 'text-h6' : 'text-h5 '
                          "
                          class="mx-1"
                          >{{ user.summary.overdue }}</span
                        >
                      </v-card-title>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="4">
                    <!-- Completed Task Card -->
                    <v-card
                      @click="goToCompleted(user)"
                      elevation="0"
                      class="mx-2 my-2"
                    >
                      <v-card-title
                        :class="
                          $vuetify.breakpoint.xs ? 'caption' : 'subtitle-1'
                        "
                        class="pa-2 completed-task-bg completed-task-text"
                      >
                        <v-icon
                          :small="$vuetify.breakpoint.xs"
                          class="mx-2 completed-task-text"
                          >mdi-check-circle-outline</v-icon
                        >
                        <span>Completed Task(s)</span>
                        <v-spacer></v-spacer>
                        <span
                          :class="
                            $vuetify.breakpoint.xs ? 'text-h6' : 'text-h5 '
                          "
                          class="mx-1"
                          >{{ user.summary.completed }}</span
                        >
                      </v-card-title>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import exportTable from "@/table-export.js";
import profileimage from "@/components/includes/ProfileImage";
export default {
  name: "Reports",
  components: {
    profileimage,
  },
  data() {
    return {
      // Search filters
      searchTeamLead: null,
      searchProject: null,
      searchMember: null,
      selectedProject: null,
      selectedTeamLead: null,
      selectedMember: null,
      selectedDates: [],
      selectedDateItem: "Today",
      selectedPanel: [],
      teamMembers: null,
      customRangeMenu: false,
      customRange: [],
      dateRanges: [
        { text: "Today" },
        { text: "Yesterday" },
        { text: "Last 7 days" },
        { text: "Last 30 days" },
      ],
      openMemberList: false,
      openProjectList: false,
      toggleIcon: null,
      dummyItems: 5,
    };
  },
  computed: {
    ...mapGetters([
      "getLoggedInUser",
      "getAllMembers",
      "getProjects",
      "getSelectedCompany",
      "getReports",
      "getSidebarMini",
    ]),

    // Team Leads Array
    teamLeadsArray() {
      return this.getAllMembers.filter((item) => {
        return item.role == "team-manager";
      });
    },

    // Search All Team Leads
    filteredTeamLeads() {
      return this.searchTeamLead && this.teamLeadsArray
        ? this.teamLeadsArray.filter((item) => {
            return item.name
              ? item.name
                  .toLowerCase()
                  .includes(this.searchTeamLead.toLowerCase())
              : item.email
                  .toLowerCase()
                  .includes(this.searchTeamLead.toLowerCase());
          })
        : this.teamLeadsArray;
    },

    // Search All Projects
    projectsList() {
      return this.searchProject && this.getProjects
        ? this.getProjects.filter((item) => {
            return item.name
              ? item.name
                  .toLowerCase()
                  .includes(this.searchProject.toLowerCase())
              : false;
          })
        : this.getProjects;
    },

    // Search All Team Members
    teamMembersList() {
      return this.searchMember && this.teamMembers
        ? this.teamMembers.filter((item) => {
            return item.name
              ? item.name
                  .toLowerCase()
                  .includes(this.searchMember.toLowerCase())
              : item.email
                  .toLowerCase()
                  .includes(this.searchMember.toLowerCase());
          })
        : this.teamMembers;
    },

    // Date range filter
    dateRange() {
      if (this.selectedDateItem == "Today")
        return [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
      if (this.selectedDateItem == "Yesterday")
        return [
          moment()
            .subtract(1, "day")
            .format("YYYY-MM-DD"),
          moment()
            .subtract(1, "day")
            .format("YYYY-MM-DD"),
        ];
      if (this.selectedDateItem == "Last 7 days")
        return [
          moment()
            .subtract(6, "day")
            .format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      if (this.selectedDateItem == "Last 30 days")
        return [
          moment()
            .subtract(29, "day")
            .format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      else if (this.customRange)
        return [
          moment(this.customRange[0]).format("YYYY-MM-DD"),
          moment(this.customRange[1]).format("YYYY-MM-DD"),
        ];
      return [];
    },
  },
  methods: {
    // Select team lead
    selectTeamLead(teamLead) {
      if (this.selectedTeamLead && this.selectedTeamLead.id == teamLead.id) {
        this.selectedTeamLead = null;
      } else {
        this.selectedMember = null;
        this.selectedTeamLead = teamLead;
      }
    },
    // Go to task tracker page to see pending tasks
    goToPending(user) {
      this.$store.commit("setTaskFilter", {
        status: "pending",
        assigned_to: user,
        start_date: this.dateRange[0],
        end_date: this.dateRange[1],
        show_all: true,
      });
      this.$store.commit("setTaskDateFilter", this.selectedDateItem);
      window.open("task");
      //this.$router.push({ name: "task" });
    },
    // Go to task tracker page to see pending tasks
    goToCompleted(user) {
      this.$store.commit("setTaskFilter", {
        status: "completed",
        assigned_to: user,
        start_date: this.dateRange[0],
        end_date: this.dateRange[1],
      });
      this.$store.commit("setTaskDateFilter", this.selectedDateItem);
      window.open("task");
      //this.$router.push({ name: "task" });
    },
    // Expand all panels
    expandAll() {
      this.selectedPanel = [...Array(this.getReports.length).keys()].map(
        (k, i) => i
      );
    },
    // Export data table to CSV ofr xls
    download(format) {
      exportTable.downloadJoin(this.getReports, "Reports", format);
    },
    // Applies range filter after a custom range has been selected
    customRangeSearch() {
      if (this.selectedDates.length == 1) {
        this.customRange[0] = this.selectedDates[0];
        this.customRange[1] = this.selectedDates[0];
      } else {
        this.customRange = this.selectedDates;
        if (this.customRange[0] > this.customRange[1]) {
          var temp = this.customRange[0];
          this.customRange[0] = this.customRange[1];
          this.customRange[1] = temp;
        }
        this.selectedDateItem =
          this.customRange[0] + " - " + this.customRange[1];
      }
      return (this.customRangeMenu = false);
    },

    // This function returns search filters if applied
    getSearchFilters() {
      return {
        search_col: {
          project_id: this.selectedProject ? this.selectedProject.id : null,
          team_manager: this.selectedTeamLead ? this.selectedTeamLead.id : null,
          member: this.selectedMember ? this.selectedMember.id : null,
        },
        start_date: this.dateRange[0],
        end_date: this.dateRange[1],
      };
    },
  },
  mounted() {
    this.teamMembers = this.getAllMembers.filter((item) => {
      return item.id != this.getLoggedInUser.id;
    });
    this.teamMembers.unshift(this.getLoggedInUser);
    this.$store.dispatch("fetchReports").then(() => {
      this.expandAll();
    });
  },
  watch: {
    dateRange() {
      this.$store.dispatch("fetchReports", this.getSearchFilters());
    },
    selectedProject() {
      this.$store.dispatch("fetchReports", this.getSearchFilters());
    },
    selectedTeamLead(value) {
      if (value) {
        this.$store
          .dispatch("fetchUserDetails", {
            user_id: value.id,
            company_id: this.getSelectedCompany.id,
          })
          .then((res) => {
            this.teamMembers = res.data.data.team_members;
          });
      }
      this.teamMembers = this.getAllMembers.filter((item) => {
        return item.id != this.getLoggedInUser.id;
      });
      this.teamMembers.unshift(this.getLoggedInUser);
      this.$store.dispatch("fetchReports", this.getSearchFilters());
    },
    selectedMember() {
      this.$store.dispatch("fetchReports", this.getSearchFilters());
    },
  },
};
</script>

<style scoped>
.pending-task-text {
  color: #8e6a01 !important ;
}
.pending-task-bg {
  background-color: #fffae5 !important ;
}
.overdue-task-text {
  color: red !important ;
}
.overdue-task-bg {
  background-color: rgb(253, 235, 235) !important ;
}
.completed-task-bg {
  background-color: #e4f6f2 !important ;
}
.completed-task-text {
  color: #28806d;
}
.table-width-custom {
  width: calc(100vh - 56vh);
}
</style>
