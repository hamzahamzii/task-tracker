<template>
  <div>
    <!-- Date Range Row -->
    <v-row class="mx-2 mt-1 d-flex justify-end">
      <v-col sm="4" md="2" xl="2" cols="12">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-bind="attrs"
              v-model="selectedDateItem"
              solo
              outlined
              hide-details
              flat
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
          <v-list class="opacity-1">
            <v-list-item
              v-for="list of dropdownList"
              :key="list.text"
              class="date-range-dropdown pointer"
              :class="selectedDateItem == list.text ? 'bg-selected' : ''"
              @click="
                (selectedDateItem = list.text),
                  $store.commit('setTaskDateFilter', list.text)
              "
            >
              <v-list-item-title class="date-range-text-color">{{
                list.text
              }}</v-list-item-title>
              <v-icon
                small
                color="#1cc283"
                v-if="selectedDateItem == list.text"
              >
                mdi-check-box-outline</v-icon
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <v-row
      :class="
        $vuetify.breakpoint.xs || $vuetify.breakpoint.sm ? 'mt-3' : 'mt-8 mx-4'
      "
      no-gutters
    >
      <v-col cols="12" md="3" class="d-flex justify-center flex-column">
        <v-card
          width="90%"
          :height="$vuetify.breakpoint.xs ? '' : '220'"
          elevation="0"
          tile
          :class="$vuetify.breakpoint.xs ? '' : 'mt-3'"
          class="theme-border mx-3 pa-2"
        >
          <v-card-title
            :class="$vuetify.breakpoint.xs ? 'pa-1' : ''"
            class="ui-theme-color d-flex justify-start"
            >Summary</v-card-title
          >
          <v-card-text :class="$vuetify.breakpoint.xs ? 'pa-1' : ''">
            <div class="d-flex my-2">
              <span class="pointer list-hover">Total Time</span>
              <v-spacer></v-spacer>
              <span class="ui-theme-color subtitle-2"
                ><b>{{ totalTime }}</b></span
              >
            </div>
            <div
              @click="redirect('completed', getLoggedInUser)"
              class="d-flex my-2"
            >
              <span class="pointer list-hover">Completed Tasks</span>
              <v-spacer></v-spacer>
              <span class="ui-theme-color subtitle-2 font-weight-bold">
                {{ completeTask ? completeTask : "0" }}</span
              >
            </div>
            <div
              @click="redirect('pending', getLoggedInUser)"
              class="d-flex my-2"
            >
              <span class="pointer list-hover">Pending Tasks</span>
              <v-spacer></v-spacer>
              <span class="ui-theme-color subtitle-2 font-weight-bold">
                {{ pendingTask ? pendingTask : "0" }}</span
              >
            </div>
            <div
              @click="redirect('completed', getLoggedInUser)"
              class="d-flex my-2"
            >
              <span class="pointer list-hover">Overdue Tasks</span>
              <v-spacer></v-spacer>
              <span class="ui-theme-color subtitle-2 font-weight-bold">{{
                overDueTask ? overDueTask : "0"
              }}</span>
            </div>
          </v-card-text>
        </v-card>
        <v-card
          width="90%"
          :height="$vuetify.breakpoint.xs ? '' : '220'"
          elevation="0"
          tile
          :class="$vuetify.breakpoint.xs ? '' : 'mt-10'"
          class="theme-border mx-3 pa-2"
        >
          <v-card-title
            :class="$vuetify.breakpoint.xs ? 'pa-1' : ''"
            class="ui-theme-color d-flex justify-start"
            >Projects</v-card-title
          >
          <v-card-text v-if="!getproject" class="d-flex justify-center">
            No Projects
          </v-card-text>
          <v-card-text :class="$vuetify.breakpoint.xs ? 'pa-1' : ''">
            <div
              class="d-flex my-2"
              v-for="item in getproject"
              :key="item.name"
            >
              <span class="pointer list-hover text-capitalize">{{
                item.name
              }}</span>
              <v-spacer></v-spacer>
              <span class="ui-theme-color subtitle-2"
                ><b>{{ item.sum ? format(item.sum) : "00:00:00" }}</b></span
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col class="d-flex justify-center flex-column" cols="12" md="9">
        <div class="d-flex align-center">
          <apexchart
            class="ml=3"
            v-if="options && series"
            :class="
              $vuetify.breakpoint.md
                ? 'table-width-2'
                : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'table-width-3 mt-4 mr-1'
                : 'table-width'
            "
            :height="$vuetify.breakpoint.xs ? '100%' : '500'"
            type="bar"
            :options="options"
            :series="series"
          ></apexchart>
        </div>
        <div class="d-flex justify-center">
          <span class="text-style ui-theme-color"
            ><b>{{ this.selectedDateItem }}</b></span
          >
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import chart from "vue-apexcharts";
import moment from "moment";

export default {
  components: { apexchart: chart },
  data: () => ({
    selectedDateItem: "Today",
    date: new Date().toISOString().substr(0, 10),
    dateRangeValue: null,
    customRange: [],
    dropdownList: [
      { text: "Today" },
      { text: "Yesterday" },
      { text: "Last 7 days" },
      { text: "Last 30 days" },
      { text: "This month" },
    ],
    options: null,
    series: null,
    completeTask: "",
    pendingTask: "",
    overDueTask: "",
    totalTime: "",
    getproject: null,
  }),

  computed: {
    ...mapGetters(["getSelectedCompany", "getDashboard", "getLoggedInUser"]),
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
  mounted() {
    this.dashboardData();
  },
  methods: {
    redirect(status, user) {
      this.$store.commit("setTaskFilter", {
        status: status,
        assigned_to: user,
        start_date: this.dateRange[0],
        end_date: this.dateRange[1],
        show_tasks: "me",
      });
      this.$store.commit("setTaskDateFilter", this.selectedDateItem);
      this.$router.push({ name: "task" });
    },

    format(time) {
      if (!time) return "00:00:00";
      // Calculating in hours,minutes,seconds
      let hours = Math.floor(time / 3600);
      let minutes = Math.floor((time - hours * 3600) / 60);
      let seconds = time - hours * 3600 - minutes * 60;

      // Adding zero prefixes
      hours < 10 ? (hours = "0" + hours) : () => {};
      minutes < 10 ? (minutes = "0" + minutes) : () => {};
      seconds < 10 ? (seconds = "0" + seconds) : () => {};

      // Final time spent in HH:mm:ss where hours have no upperbound
      let timeInHMS = hours + ":" + minutes + ":" + seconds;

      return timeInHMS;
    },
    // format the time seconds into hours and minutes
    dashboardData() {
      this.$store
        .dispatch("fetchDashboard", {
          company_id: this.getSelectedCompany.id,
          start_date: this.dateRange[0],
          end_date: this.dateRange[1],
        })
        .then((response) => {
          this.options = {
            xaxis: {
              title: {
                text: "Date",
                style: {
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#263238",
                },
              },
              categories: response.dates,
            },
            yaxis: {
              title: {
                text: "Minutes/Hours",
                style: {
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#263238",
                },
              },
            },
            fill: {
              colors: ["#6c5cd6"],
            },
          };
          this.series = [
            {
              name: "Time in minutes/hours(m/h)",
              data: response.time_spent.map((item) => {
                if (item.substring(0, 2) == "00") {
                  return item.slice(3, 5);
                } else {
                  return item.slice(0, 2);
                }
              }),
            },
          ];
          this.completeTask = response.completed;
          this.pendingTask = response.pending;
          this.overDueTask = response.overdue;
          this.totalTime = response.total_time;
          this.getproject = response.project;
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
  },
  watch: {
    dateRange() {
      this.dashboardData();
    },
  },
};
</script>
<style scoped>
.opacity-1 {
  opacity: 1 !important;
}
.text-inner {
  color: white !important;
  font-size: 41px;
  text-align: center;
}
.text-title {
  color: white;
  font-size: 22px;
  font-weight: 700;
}
.text-style {
  font-size: 22px;
}
.list-hover:hover {
  color: #1cc283 !important;
}
/* div.apexcharts-toolbar {
  z-index: 0 !important;
} */
.date-range-dropdown {
  min-height: 30px;
}
.date-range-dropdown:hover {
  background-color: #e9fcf5;
}
.date-range-text-color {
  color: #757096;
  font-size: 12px;
  font-style: Roboto Medium;
}
.date-range-text-color:hover {
  color: #1cc283 !important;
}
.date-range-text-color {
  color: #757096;
  font-size: 12px;
  font-style: Roboto Medium;
}
</style>
