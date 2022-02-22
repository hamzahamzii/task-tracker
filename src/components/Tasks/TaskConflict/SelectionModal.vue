<template>
  <div>
    <v-dialog persistent v-model="flag" width="544">
      <v-card tile class="white">
        <!-- Title bar -->
        <v-card-title
          class="px-1 text-truncate dialog-title-border ui-theme-color"
        >
          <div class="d-flex justify-center float-left" style="width: 90%">
            <span
              class="d-inline-block text-truncate"
              style="max-width: 300px"
              :style="$vuetify.breakpoint.xs ? 'max-width: 100px;' : ''"
            >
              <b class="ui-theme-color modals-title-size"> Confirm Task </b>
            </span>
          </div>
          <div
            class="d-flex justify-end align-center float-right"
            style="width: 10%; height: 32px"
          >
            <v-icon
              small
              color="#757096"
              @click="closeDialog"
              class="d-flex mr-2"
            >
              mdi-close
            </v-icon>
          </div>

          <v-spacer></v-spacer>
        </v-card-title>
        <!-- Card Body -->

        <v-card-text class="mt-2 mb-n6">
          <!-- Conflict explanatory text -->
          <div class="d-flex">
            <div class="d-flex align-start mt-3">
              <v-icon color="red"> mdi-alert-outline</v-icon>
            </div>

            <div class="d-flex flex-column ml-2 mt-3">
              <span class="ui-theme-color h5">
                <b style="font-size: 15px">Conflict Detected</b>
              </span>
              <p class="caption dusty-purple-text">
                Your current task's timing overlaps with your scheduled task. To
                proceed, you need to select the task you want to
                <b class="red--text">discard</b>. <br />Note that the selected
                task will permanently be deleted from your task log.
              </p>
            </div>
          </div>
          <v-radio-group v-model="selected" column>
            <!-- Current Task -->
            <v-card flat class="my-1" min-height="30">
              <v-radio
                class="h5"
                label="Current Task"
                color="#1CC283"
                value="current"
              ></v-radio>
              <v-card-text v-if="currentTask" class="mx-4">
                <v-simple-table dense class="table-border">
                  <template v-slot:default>
                    <thead>
                      <tr class="faded-purple-bg">
                        <th class="text-left ui-theme-color">Task Title</th>
                        <th class="text-left ui-theme-color">Start Time</th>
                        <th class="text-left ui-theme-color">Start Time</th>
                        <th class="text-left ui-theme-color">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr height="54px">
                        <td>
                          <span
                            class="d-inline-block text-truncate"
                            style="max-width: 100px"
                            :class="[
                              { 'font-italic': !currentTask.title },
                              { 'grey--text': !currentTask.title },
                            ]"
                          >
                            {{
                              currentTask.title ? currentTask.title : "no title"
                            }}
                          </span>
                        </td>
                        <td>
                          <div>
                            {{
                              currentTask.start_time
                                ? currentTask.start_time.slice(11)
                                : ""
                            }}
                          </div>
                        </td>

                        <td>
                          <div>
                            {{
                              currentTask.end_time
                                ? currentTask.end_time.slice(11)
                                : ""
                            }}
                          </div>
                        </td>
                        <td>
                          <div>
                            <v-tooltip color="#302277" bottom>
                              <template v-slot:activator="{ on }">
                                <span
                                  class="d-inline-block text-truncate"
                                  style="max-width: 100px"
                                  v-on="on"
                                >
                                  {{ getSelectedCompany.name }}
                                </span>
                              </template>
                              <span> {{ getSelectedCompany.name }}</span>
                            </v-tooltip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
            </v-card>
            <!-- Conflicting Tasks -->
            <v-card flat>
              <v-radio
                class="h5"
                label="Conflicting Task (s)"
                color="#1CC283"
                value="scheduled"
              ></v-radio>
              <v-card-text class="mx-4 overflow-y-scroll">
                <v-simple-table dense class="table-border">
                  <template v-slot:default>
                    <thead>
                      <tr class="faded-purple-bg">
                        <th class="text-left ui-theme-color">Task Title</th>
                        <th class="text-left ui-theme-color">Start Time</th>
                        <th class="text-left ui-theme-color">End Time</th>
                        <th class="text-left ui-theme-color">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(task, index) in conflicts"
                        :key="index"
                        height="54px"
                      >
                        <td>
                          <v-tooltip color="#302277" bottom>
                            <template v-slot:activator="{ on }">
                              <span
                                class="d-inline-block text-truncate"
                                style="max-width: 80px"
                                v-on="on"
                              >
                                {{ task.title }}
                              </span>
                            </template>
                            <span> {{ task.title }}</span>
                          </v-tooltip>
                        </td>
                        <td>
                          <div>
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 100px"
                              >{{
                                task.start_time ? task.start_time.slice(11) : ""
                              }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 100px"
                              >{{
                                task.end_time ? task.end_time.slice(11) : ""
                              }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <v-tooltip color="#302277" bottom>
                              <template v-slot:activator="{ on }">
                                <span
                                  v-on="on"
                                  class="d-inline-block text-truncate"
                                  style="max-width: 80px"
                                  >{{
                                    task.company_name ? task.company_name : ""
                                  }}
                                </span>
                              </template>
                              <span>
                                {{
                                  task.company_name ? task.company_name : ""
                                }}</span
                              >
                            </v-tooltip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
            </v-card>
          </v-radio-group>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn
            large
            class="cancel-btn text-capitalize mb-2"
            color="darken-1"
            tile
            text
            @click="closeDialog()"
            ><b style="font-size: 16px">Cancel</b>
          </v-btn>
          <v-btn
            large
            depressed
            @click="openConfirmationModal"
            class="btn-success white--text text-capitalize mb-2"
            tile
            ><b style="font-size: 16px">Discard</b></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Confirmation Modal shown @save -->
    <ConfirmationDialog
      :toDelete.sync="toDelete"
      :openConfirmationDialog.sync="openConfirmationDialog"
    />
  </div>
</template>

<script>
import ConfirmationDialog from "@/components/Tasks/TaskConflict/ConfirmSelection";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      selected: null,
      flag: false, // Dialog activator
      openConfirmationDialog: false,
      toDelete: [],
    };
  },
  components: {
    ConfirmationDialog,
  },

  props: ["openTaskConflictDialog", "conflicts", "currentTask"],
  computed: {
    ...mapGetters(["getCompany", "getSelectedCompany"]),
  },
  methods: {
    closeDialog() {
      this.$emit("update:openTaskConflictDialog", false);
      this.flag = "false";
    },
    openConfirmationModal() {
      this.openConfirmationDialog = true;
    },
  },

  watch: {
    openTaskConflictDialog(value) {
      value ? (this.flag = true) : (this.flag = false);
    },
    flag(value) {
      !value ? this.$emit("update:openTaskConflictDialog", false) : () => {};
    },
    conflicts(value) {
      if (value) {
        this.toDelete = value.map((item) => {
          return item.entry_id;
        });
        this.selected = "scheduled";
      } else {
        this.toDelete = [];
        this.selected = "current";
      }
    },
    selected(value) {
      if (value == "current") {
        this.toDelete = [];
      }
      if (value == "scheduled") {
        this.toDelete = this.conflicts.map((item) => {
          return item.entry_id;
        });
      }
    },
    openConfirmationDialog(value) {
      if (!value) this.flag = false;
    },
  },
};
</script>

<style scoped>
.no-title {
  color: grey !important;
  font: italic !important;
}
.default-bg {
  /* grey lighten-5 */
  background-color: #fafafa !important;
}
.selected-bg {
  /* cyan lighten-5 */
  background-color: #e1ddf5 !important;
}
.overflow-y-scroll {
  overflow-y: scroll;
}
.cancel-btn {
  color: #1cc283 !important;
  background-color: white;
  border: 1px #1cc283 solid;
}
</style>
