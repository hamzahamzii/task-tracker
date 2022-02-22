<template>
  <v-data-table
    :headers="subHeaders"
    hide-default-footer
    :mobile-breakpoint="0"
    :items="item.interval"
    :items-per-page="3"
    class="child-table-bg"
  >
    <!-- Child Table: Assigned To -->
    <template v-slot:[`item.members`]="{}">
      <div class="disable-cursor d-flex justify-start">
        <v-list
          v-if="getAssignees(item.task_id)"
          class="transparent disable-cursor"
        >
          <v-list-item
            class="px-0"
            v-for="member in getAssignees(item.task_id).slice(0, 1)"
            :key="member.id"
          >
            <div class="d-flex">
              <profileImage
                v-show="member.image ? ':src' : ':username'"
                :src="member.image"
                inline
                :userProfile="true"
                :username="member.name ? member.name : member.email"
                :size="30"
                :circular="true"
                class="my-2 text-light d-inline mr-2"
              >
              </profileImage>
              <profileImage
                v-if="getAssignees(item.task_id).length > 1"
                inline
                :username="`+${getAssignees(item.task_id).length - 1}`"
                :size="30"
                :circular="true"
                :userProfile="true"
                class="my-2 text-light d-inline ml-n8 mr-2"
              >
              </profileImage>
            </div>
            <v-list-item-content>
              <!-- username -->
              <span
                style="max-width: 88px"
                class="d-inline-block"
                :class="member.name ? 'text-truncate' : ''"
              >
                {{ member.name ? member.name : member.email }}
              </span>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </template>
    <!-- Child Table: Title -->
    <template v-slot:[`item.title`]="{}">
      <div class="d-flex justify-start disable-cursor">
        <span
          class="d-inline-block text-truncate text-capitalize"
          :style="$vuetify.breakpoint.xl ? 'max-width:98%' : 'max-width:296px'"
          :class="
            !item.title
              ? 'font-italic grey--text caption'
              : $vuetify.breakpoint.xl
              ? 'ml-2'
              : ''
          "
          >{{ item.title ? item.title : "No title" }}</span
        >
      </div>
    </template>
    <!-- Child Table: Assigned Date -->
    <template v-slot:[`item.created_at`]="{}">
      <div style="min-width: 100px" class="d-flex justify-start">
        <span
          style="max-width: 100px"
          class="d-inline-block caption text-truncate"
        >
          {{ getAssignedDate(item.created_at) }}
        </span>
      </div>
    </template>
    <!-- Child Table: Start/End Time  -->
    <template v-slot:[`item.interval`]="{ item }">
      <div class="d-flex justify-start">
        <v-tooltip color="#302277" bottom>
          <template v-slot:activator="{ on }">
            <div v-on="on">
              <v-menu
                :close-on-content-click="false"
                ref="editMenu"
                tile
                bottom
                offset-y
              >
                <template v-slot:activator="{ on, attrs }">
                  <div
                    class="d-flex justify-start"
                    v-on="on"
                    v-bind="attrs"
                    @click="selectedInterval = item.entry_id"
                  >
                    <span
                      class="pointer underline mx-1"
                      v-text="
                        item
                          ? item.start_time
                            ? item.start_time.slice(11, 16)
                            : ''
                          : ''
                      "
                    ></span>
                    -
                    <span
                      class="pointer underline mx-1"
                      v-text="
                        item
                          ? item.end_time
                            ? item.end_time.slice(11, 16)
                            : ''
                          : ''
                      "
                    >
                    </span>
                  </div>
                </template>
                <!-- manual time dropdown -->
                <v-card width="300px" tile>
                  <v-card-text class="black--text">
                    <!-- start/end time -->
                    <div class="d-flex">
                      <!-- clock icon -->
                      <v-icon color="black">mdi-clock-outline</v-icon>
                      <!-- start/end time input -->
                      <div class="d-flex align-center">
                        <!-- start time -->
                        <input
                          :id="'start-' + item.entry_id"
                          :class="$vuetify.breakpoint.xs ? 'w-xs' : 'w-lg'"
                          class="mx-1 pa-2 duration-input"
                          type="time"
                          :value="
                            item
                              ? item.start_time
                                ? item.start_time.slice(11, 16)
                                : ''
                              : ''
                          "
                          placeholder="start"
                        />
                        <!-- end time -->
                        <input
                          :id="'end-' + item.entry_id"
                          type="time"
                          :class="$vuetify.breakpoint.xs ? 'w-xs' : 'w-lg'"
                          class="pa-2 duration-input"
                          :value="
                            item
                              ? item.end_time
                                ? item.end_time.slice(11, 16)
                                : ''
                              : ''
                          "
                          placeholder="end"
                        />
                      </div>
                    </div>
                    <div class="d-flex">
                      <div class="d-flex my-1">
                        <!-- start/end date -->
                        <v-menu
                          ref="menu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          offset-x
                          min-width="auto"
                          left
                        >
                          <template v-slot:activator="{ on }">
                            <div v-on="on" class="d-flex">
                              <div class="d-flex flex-column">
                                <!-- calendar icon -->
                                <v-icon
                                  v-on="on"
                                  class="mr-1"
                                  color="black"
                                  light
                                  icon
                                  >mdi-calendar-outline</v-icon
                                >
                              </div>

                              <!-- start date/ end date -->
                              <div class="d-flex align-center mr-2">
                                <!-- start date -->
                                <div
                                  :class="
                                    $vuetify.breakpoint.xs ? 'w-xs' : 'w-lg'
                                  "
                                  class="duration-input px-2"
                                  v-if="dates[0]"
                                >
                                  {{ dates[0] }}
                                </div>
                                <!-- end date -->
                                <div
                                  :id="'end-date-' + item.entry_id"
                                  class="duration-input mx-1 px-2"
                                  :class="
                                    $vuetify.breakpoint.xs ? 'w-xs' : 'w-lg'
                                  "
                                >
                                  <span v-if="dates[1]"> {{ dates[1] }}</span>
                                  <span
                                    v-else
                                    class="warning--text"
                                    style="font-size: 10px"
                                    >Enter Ending Date</span
                                  >
                                </div>
                              </div>
                            </div>
                          </template>
                          <!-- date picker -->
                          <v-date-picker
                            no-title
                            v-model="dates"
                            range
                            color="#2a206a"
                          ></v-date-picker>
                        </v-menu>
                      </div>
                    </div>
                    <div class="d-flex">
                      <v-spacer></v-spacer>
                      <v-btn
                        class="btn-success white--text"
                        x-small
                        @click="editTimeEntry(item.task_id, item)"
                      >
                        <span v-if="!pending">Save</span>
                        <v-progress-circular
                          color="white"
                          v-else
                          width="2"
                          size="15"
                        >
                        </v-progress-circular>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-menu>
            </div>
          </template>
          <span>Edit Duration</span>
        </v-tooltip>
      </div>
    </template>
    <!-- Child Table: Duration  -->
    <template v-slot:[`item.members.duration`]="{ item }">
      <div class="d-flex disable-cursor">
        <span :class="!item.duration ? 'mx-5' : ''">
          {{
            item
              ? item.duration
                ? getDuration(item.duration).slice(0, 5)
                : "-"
              : ""
          }}
        </span>
      </div>
    </template>
    <!-- Child Table: Actions  -->
    <template v-slot:[`item.actions`]="{}">
      <div>
        <v-icon
          @click="deleteTimeEntry(item, item.interval[0].entry_id)"
          class="dark-purple-text mx-2"
          >mdi-delete-outline</v-icon
        >
      </div>
    </template>
  </v-data-table>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import timer from "@/timer";
import profileImage from "../includes/ProfileImage";

export default {
  props: ["item"],
  components: {
    profileImage,
  },
  data() {
    return {
      selectedInterval: null,
      dates: [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")],
      pending: false,
      subHeaders: [
        {
          value: "empty",
          text: "",
          sortable: false,
          class: "child-table-header-bg child-table-header-text",
          width: "188px",
        },
        {
          value: "members",
          text: "Assigned to",
          sortable: false,
          class: "child-table-header-bg child-table-header-text",
          //   width: "116px",
        },
        {
          value: "title",
          text: "Title",
          sortable: false,
          class: "child-table-header-bg child-table-header-text",
          width: "296px",
        },
        {
          value: "created_at",
          text: "Assigned Date",
          sortable: false,
          class: "child-table-header-bg child-table-header-text",
          //   width: "264px",
        },
        {
          value: "interval",
          text: "Start - End time",
          sortable: false,
          width: "124px",
          class: "child-table-header-bg child-table-header-text",
        },
        {
          value: "members.duration",
          text: "Duration",
          sortable: false,
          class: "child-table-header-bg child-table-header-text ",
          width: "124px",
        },
        {
          value: "actions",
          text: "Action",
          sortable: false,
          class: "child-table-header-bg child-table-header-text ",
        },
        {
          value: "empty-end",
          text: "",
          sortable: false,
          class: "child-table-header-bg child-table-header-text ",
          width: "20%",
        },
      ],
    };
  },
  computed: {
    ...mapGetters([
      "getProject",
      "getAllMembers",
      "getAssignees",
      "getSelectedCompany",
      "getLoggedInUser",
      "getSidebarMini",
    ]),
  },
  methods: {
    getDuration(time) {
      return timer.format(time);
    },
    // Edit Start/End time for any entry
    editTimeEntry(task, interval) {
      if (this.pending) return;
      this.pending = "edit";
      let start_time = moment(
        `${this.dates[0]} ${
          document.getElementById("start-" + interval.entry_id).value
        }:00`,
        "YYYY-MM-DD HH:mm:ss"
      );
      let end_time;
      if (interval.end_time) {
        end_time = moment(
          `${this.dates[1]} ${
            document.getElementById("end-" + interval.entry_id).value
          }:00`,
          "YYYY-MM-DD HH:mm:ss"
        );
      } else {
        end_time = moment(
          `${moment().format("YYYY-MM-DD")} ${
            document.getElementById("end-" + interval.entry_id).value
          }:00`,
          "YYYY-MM-DD HH:mm:ss"
        );
      }

      let duration = moment.duration(end_time.diff(start_time)).asSeconds();
      this.selectedInterval = null;
      this.$store
        .dispatch("editTimeEntry", {
          company_id: this.getSelectedCompany.id,
          entry_id: interval.entry_id,
          start_time: start_time.format("YYYY-MM-DD HH:mm:ss"),
          end_time: end_time.format("YYYY-MM-DD HH:mm:ss"),
          duration,
          project_id: task.project ? task.project.id : null,
          task_id: task.task_id,
        })
        .then(() => {
          this.pending = false;
        })
        .catch((error) => {
          // conflict
          this.running = {
            title: task.title,
            start_time: start_time.format("YYYY-MM-DD HH:mm:ss"),
            end_time: end_time.format("YYYY-MM-DD HH:mm:ss"),
          };
          // Open conflicts dialog
          this.checkConflicts(error);
          this.pending = false;
        });
    },
    deleteTimeEntry(item, interval_id) {
      if (this.getActiveTask && item.task_id == this.getActiveTask.task_id) {
        this.snackbar = true;
        this.updateTaskError = true;
        this.snackbarMessage = "Cannot delete active time entry";
        return;
      }
      this.$store
        .dispatch("deleteTimeEntry", {
          task_id: item.task_id,
          entry_id: interval_id,
        })
        .then(() => {
          let index = item.interval.findIndex(
            (interval) => interval.entry_id === interval_id
          );
          item.interval.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getAssignedDate(date) {
      return moment(date).fromNow();
    },
    getAssignedDateFormat(date) {
      return moment(date).format("LL");
    },
  },
};
</script>

<style scoped>
.intervals {
  max-height: 154px !important;
  overflow: hidden;
  overflow-y: scroll !important;
}
</style>
