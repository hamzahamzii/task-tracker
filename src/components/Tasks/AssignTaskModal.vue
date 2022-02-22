<template>
  <div>
    <v-dialog v-model="assignTaskModalValue" width="400">
      <v-card tile class="white">
        <!-- Title bar -->
        <v-card-title
          class="py-3 px-4 text-truncate dialog-title-border ui-theme-color"
        >
          <div class="d-flex justify-center" style="width: 90%">
            <span class="modals-title-size">
              <b>
                Assign Task
              </b>
            </span>
          </div>

          <v-spacer></v-spacer>
          <v-icon small color="#757096" @click="closeDialog">mdi-close</v-icon>
        </v-card-title>
        <v-snackbar
          :color="createTaskError ? 'red lighten-5' : 'green lighten-5'"
          light
          top
          right
          v-model="snackbar"
        >
          <span :class="createTaskError ? 'red--text' : 'green--text'">
            {{ snackbarMessage }}
          </span>
          <template v-slot:action="{ attrs }">
            <v-btn
              color="white"
              text
              v-bind="attrs"
              @click="snackbar = false"
              small
              fab
            >
              <v-icon :color="createTaskError ? 'red' : 'green'" small>
                mdi-close
              </v-icon>
            </v-btn>
          </template>
        </v-snackbar>
        <v-card-text class="mt-5">
          <v-form ref="form" lazy-validation>
            <!--Task Name text field -->
            <v-text-field
              color="#2a206a"
              dense
              outlined
              v-model="taskName"
              @keydown.enter="openMemberDropdown = true"
              label="Task Name"
            ></v-text-field>
            <!-- Members Menu-->
            <v-autocomplete
              v-if="getMembers"
              color="#2a206a"
              :items="getMembers"
              dense
              outlined
              ref="memberMenu"
              flat
              solo
              @keydown.enter="openProjectDropdown = true"
              item-value="email"
              item-text="email"
              label="Add Member"
              v-model="selectedMembers"
              multiple
              auto-select-first
            >
              <template v-slot:item="{ item }">
                <div class="d-flex" style="width:200px;">
                  <span>
                    <profileimage
                      class="pointer text-light mt-1 mb-1"
                      inline
                      :username="item.name ? item.name : item.email"
                      :circular="true"
                      v-show="item.image ? ':src' : ':username'"
                      :src="item.image"
                      :size="25"
                    ></profileimage>
                  </span>
                  <span
                    v-if="item.name"
                    class="d-inline-block text-truncate pointer ml-2 mt-1 caption"
                    style="max-width: 150px"
                  >
                    {{ item.name }}
                  </span>
                  <span
                    v-else
                    class="d-inline-block text-truncate pointer ml-2 mt-1 caption"
                    style="max-width: 150px"
                  >
                    {{ item.email }}
                  </span>
                </div>
              </template>
              <template v-slot:selection="{ item, index }">
                <v-chip class="my-1 chip-bg chip-text" v-if="index < 3">
                  <profileimage
                    class="pointer text-light mt-1 mb-1"
                    inline
                    :username="item.name ? item.name : item.email"
                    :circular="true"
                    :size="25"
                  ></profileimage>
                  <span
                    class="d-inline-block text-truncate mx-1"
                    style="max-width: 80px"
                    >{{ item.name }}</span
                  >
                </v-chip>
                <span v-if="index === 3" class="grey--text caption">
                  (+{{ selectedMembers.length - 3 }} others)
                </span>
              </template>
            </v-autocomplete>
            <v-autocomplete
              v-if="getProjects"
              color="#2a206a"
              @keydown.enter="assignTask()"
              :items="getProjects"
              dense
              ref="projectMenu"
              outlined
              flat
              solo
              v-model="selectedProject"
              item-value="name"
              item-text="name"
              label="Add Project"
              auto-select-first
            >
              <template v-slot:item="{ item }">
                <div class="d-flex" style="width:200px;">
                  <span>
                    <profileimage
                      class="pointer text-light mt-1 mb-1"
                      inline
                      :username="item.name"
                      :circular="true"
                      :size="25"
                    ></profileimage>
                  </span>
                  <span
                    class="d-inline-block text-truncate pointer ml-2 mt-1 caption"
                    style="max-width: 150px"
                  >
                    {{ item.name }}
                  </span>
                </div>
              </template>
              <template v-slot:selection="{ item }">
                <div class="mx-2">
                  <span>
                    {{ item.name }}
                  </span>
                </div></template
              >
            </v-autocomplete>
          </v-form>
        </v-card-text>

        <!-- save button -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="reset-btn text-capitalize"
            color="darken-1"
            tile
            text
            @click="reset()"
            >Reset
          </v-btn>
          <v-btn
            class="text-capitalize"
            color="darken-1"
            text
            id="assign-btn"
            tile
            :disabled="disableAssignBtn"
            :class="
              disableAssignBtn ? 'grey lighten-2' : 'white--text btn-success'
            "
            @click="assignTask()"
            >Assign
            <v-progress-circular
              v-if="loader"
              indeterminate
              class="ml-2"
              :size="20"
            ></v-progress-circular>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import profileimage from "@/components/includes/ProfileImage";
export default {
  components: {
    profileimage,
  },
  data() {
    return {
      assignTaskModalValue: true,
      search: null,
      selectedMembers: [],
      selectedProject: null,
      taskName: null,
      loader: false,
      openMemberDropdown: false,
      openProjectDropdown: false,
      createTaskError: null,
      snackbar: false,
      snackbarMessage: null,
      disableAssignBtn: false,
    };
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getLoggedInUser",
      "getAllMembers",
      "getProjects",
    ]),
    // Search all Members
    getMembers() {
      return this.getAllMembers
        ? this.search
          ? this.getAllMembers.filter((item) => {
              return item.name
                ? item.name.toLowerCase().includes(this.search.toLowerCase()) &&
                    item.id != this.getLoggedInUser.id
                : item.email
                    .toLowerCase()
                    .includes(this.search.toLowerCase()) &&
                    item.id != this.getLoggedInUser.id;
            })
          : this.getAllMembers.filter((item) => {
              return item.id != this.getLoggedInUser.id;
            })
        : [];
    },
  },

  props: ["openAssignTaskDialog"],

  watch: {
    assignTaskModalValue(value) {
      !value ? this.$emit("update:openAssignTaskDialog", false) : () => {};
    },
    openMemberDropdown(value) {
      if (value) {
        this.$refs.memberMenu.focus();
        this.$refs.memberMenu.activateMenu();
      }
    },
    selectedMembers(value) {
      if (value && this.selectedMembers.length) {
        this.$refs.memberMenu.blur();
        this.$refs.projectMenu.focus();
        this.$refs.projectMenu.activateMenu();
      }
    },
    // selectedProject(value) {
    //   if (value && this.selectedProject) {
    //     document.getElementById("assign-btn").click();
    //   }
    // },
  },
  methods: {
    reset() {
      this.$refs.form.reset();
    },
    closeDialog() {
      this.selectedMembers = [];
      this.loader = false;
      this.$emit("update:openAssignTaskDialog", false);
    },
    assignTask() {
      this.$refs.projectMenu.blur();
      if (this.validateTitle()) {
        if (this.validateMemberDropdown()) {
          this.loader = true;
          this.disableAssignBtn = true;
          let newTask = this.createTask();
          newTask.start_time = "";
          this.$store
            .dispatch("createTask", newTask)
            .then(() => {
              this.selectedMembers = [];
              this.loader = false;
              this.snackbar = true;
              // determine background color of snackbar
              this.createTaskError = false;
              // embeds snackbar message
              this.snackbarMessage = "Task assigned successfully";
              setTimeout(() => {
                this.closeDialog();
              }, 1000);
            })
            .catch(() => {
              this.loader = false;
              this.disableAssignBtn = false;
            });
        }
      }
    },
    createTask() {
      var selectedMemberDetail = [];
      for (let user of this.selectedMembers) {
        let member = this.getMembers.find(
          (item) => item.email === user || item.name === user
        );
        if (member) {
          selectedMemberDetail.push(member);
        }
      }
      let title = this.taskName;
      return {
        company_id: this.getSelectedCompany.id,
        project_id: this.selectedProject
          ? this.getProjects.find((item) => {
              return item.name == this.selectedProject;
            }).id
          : null,
        title: title,
        due_date: "",
        members: selectedMemberDetail.map((item) => {
          return item.id;
        }),
        end_time: "",
        duration: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        self_assigned: false,
      };
    },
    validateTitle() {
      let title = this.taskName;
      if (!title) {
        // to enable snackbar
        this.snackbar = true;
        // determine background color of snackbar
        this.createTaskError = true;
        // embeds snackbar message
        this.snackbarMessage = "Title is Required";
        return false;
      }
      if (title.length < 2) {
        this.snackbar = true;
        this.createTaskError = true;
        this.snackbarMessage = "Title must be at least two characters long";
        return false;
      }
      if (title.length > 255) {
        this.snackbar = true;
        this.createTaskError = true;
        this.snackbarMessage = "Title must not exceed 50 characters";
        return false;
      }
      return true;
    },
    validateMemberDropdown() {
      if (!this.selectedMembers.length) {
        // to enable snackbar
        this.snackbar = true;
        // determine background color of snackbar
        this.createTaskError = true;
        // embeds snackbar message
        this.snackbarMessage = "At least select one Member";
        return false;
      } else {
        return true;
      }
    },
  },
};
</script>
<style scoped>
.v-autocomplete__content.v-menu__content .v-select-list {
  border-radius: 0 0 4px 4px;
  max-height: 136px;
  overflow: scroll;
}
.reset-btn {
  color: #1cc283 !important;
  background-color: white;
  border: 1px #1cc283 solid;
}
.chip-bg {
  background-color: #eae8f5 !important;
}
.chip-text {
  color: #2a206a !important;
}
</style>
<style>
.v-application .primary--text {
  color: #1cc283 !important;
  caret-color: #e9fcf5 !important;
}
</style>
