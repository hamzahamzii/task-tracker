<template>
  <div>
    <v-dialog v-model="flag" max-width="500px" max-height="600px">
      <v-card class="white">
        <!-- Title -->
        <v-card-title class="px-1 text-truncate dialog-title-border">
          <!-- snackbar -->
          <v-snackbar
            top
            right
            :color="taskUpdateError ? 'red lighten-5' : 'green lighten-5'"
            light
            v-model="snackbar"
          >
            <span :class="taskUpdateError ? 'red--text' : 'green--text'">
              {{ snackbarMessage }}</span
            >
            <template v-slot:action="{ attrs }">
              <v-btn
                :color="taskUpdateError ? 'red' : 'green'"
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
          <div class="d-flex justify-center float-left" style="width: 90%">
            <span
              class="d-inline-block text-truncate"
              style="max-width: 300px"
              :style="$vuetify.breakpoint.xs ? 'max-width: 100px;' : ''"
            >
              <b class="ui-theme-color modals-title-size"> Edit Task</b>
            </span>
          </div>
          <div
            class="d-flex justify-end align-center float-right"
            style="width: 10%; height: 32px"
          >
            <v-icon small color="#757096" @click="close" class="d-flex mr-2">
              mdi-close
            </v-icon>
          </div>
        </v-card-title>
        <!-- Content -->
        <v-card-text class="py-10 px-12">
          <!-- Task name -->
          <v-text-field
            label="Task Name"
            v-model="taskName"
            color="#757096 "
            class="custom-border-color"
            autofocus
            outlined
            dense
          ></v-text-field>
          <!-- Edit Member(s) -->
          <v-select
            v-model="selectedMembers"
            :items="getAllMembers"
            :item-text="'name'"
            :item-value="'id'"
            label="Edit Member(s)"
            color="#757096"
            outlined
            class="custom-border-color"
            multiple
          >
            <template v-slot:item="{ item }">
              <div
                @click="assign(item)"
                style="width: 100% !important"
                class="d-flex"
              >
                <div
                  :class="item.name ? 'text-capitalize' : ''"
                  class="caption ml-3"
                >
                  {{ item.name ? item.name : item.email }}
                </div>
                <v-spacer></v-spacer>
                <v-icon
                  large
                  :color="
                    selectedMembers.find((member) => {
                      return member.id == item.id;
                    }) || selectedMembers.includes(item.id)
                      ? '#1cc283'
                      : '#DCD8F3'
                  "
                  v-text="
                    selectedMembers.find((member) => {
                      return member.id == item.id;
                    }) || selectedMembers.includes(item.id)
                      ? 'mdi-check-circle-outline'
                      : 'mdi-plus-circle-outline'
                  "
                ></v-icon>
              </div>
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip class="my-1 chip-bg chip-text" v-if="index < 3">
                <profileImage
                  inline
                  v-show="item.image ? ':src' : ':username'"
                  :src="item.image"
                  :username="item.name ? item.name : item.email"
                  :size="20"
                  :userProfile="true"
                  :circular="true"
                  class="text-light"
                >
                </profileImage>
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
          </v-select>
          <br />
          <!-- Project Name -->
          <v-autocomplete
            deletable-chips
            attach
            chips
            v-model="selectedProjects"
            :items="getProjects"
            :item-text="'name'"
            :item-value="'id'"
            label="Project Name"
            color="#757096"
            class="custom-border-color"
            full-width
            hide-details
            outlined
            dense
            @input="updateSelectedProject"
          >
            <template v-slot:item="{ item }">
              <div class="d-flex">
                <span class="caption ml-3">
                  {{ item.name }}
                </span>
              </div>
            </template>
            <template v-slot:selection="{ item }">
              <v-chip class="my-1 chip-bg chip-text">
                {{ item.name ? item.name : "" }}
              </v-chip>
            </template>
          </v-autocomplete>

          <v-row class="my-4">
            <v-col class="d-flex justify-end">
              <v-btn
                @click="updateTask"
                depressed
                class="btn-success white--text text-capitalize ml-1 px-5 font-weight-bold"
              >
                <v-progress-circular
                  v-if="loader"
                  indeterminate
                  :size="20"
                ></v-progress-circular>
                <span>Update</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["openEditDialog", "taskDetails"],
  components: {
    profileImage: () => import("@/components/includes/ProfileImage"),
  },
  data() {
    return {
      selectedMembers: [],
      selectedProjects: [],
      flag: true /* to open & close dialog */,
      loader: false,
      taskName: null,
      pending: null,
      taskUpdateError: null,
      snackbar: false,
      snackbarMessage: null,
    };
  },
  mounted() {
    this.taskName = this.taskDetails.title;
    this.selectedMembers = this.taskDetails.members;
    this.selectedProjects = this.taskDetails.project;
  },
  computed: {
    ...mapGetters(["getProjects", "getSelectedCompany", "getAllMembers"]),
  },
  watch: {
    openEditDialog(value) {
      value ? (this.flag = true) : (this.flag = false);
    },
    flag(value) {
      !value ? this.$emit("update:openEditDialog", false) : () => {};
    },
  },
  methods: {
    //  To close dialog
    close() {
      this.$emit("update:openEditDialog", false);
    },
    // Assign member to task
    assign(member) {
      let selectedMember = member.id;
      if (this.pending) return;
      this.pending = "assign";
      this.$store
        .dispatch("assignMember", {
          task_id: this.taskDetails.task_id,
          member_id: selectedMember,
          company_id: this.getSelectedCompany.id,
        })
        .then(() => {
          this.pending = false;
        })
        .catch(() => {
          this.pending = false;
        });
    },
    // Update Project
    updateSelectedProject() {
      let selectedProject = this.selectedProjects;
      let body = {
        project_id: selectedProject ? selectedProject : null,
        company_id: this.getSelectedCompany.id,
        task_id: this.taskDetails.task_id ? this.taskDetails.task_id : null,
      };
      this.$store.dispatch("updateTask", body);
    },
    // Update Task Name
    updateTask() {
      this.loader = true;
      let payload = {
        company_id: this.getSelectedCompany.id,
        task_id: this.taskDetails.task_id,
        title: this.taskName,
        project_id: this.taskDetails.project,
        due_date: null,
        status: this.taskDetails.status,
        deleted_at: this.taskDetails.deleted_at,
      };
      this.$store
        .dispatch("editTask", payload)
        .then((response) => {
          this.loader = false;
          this.snackbar = true;
          this.taskUpdateError = false;
          this.snackbarMessage = response.data.error_msg;
          setTimeout(() => {
            this.$emit("update:openEditDialog", false);
          }, 1000);
        })
        .catch((error) => {
          this.loader = false;
          this.snackbar = true;
          this.taskUpdateError = true;
          if (error.response.status == 422) {
            if (error.response.data.errors.title) {
              this.snackbarMessage = error.response.data.errors.title[0];
            }
          }
        });
    },
  },
};
</script>
<style scoped>
.custom-border-color {
  color: #dcd8f3 !important;
}
.chip-bg {
  background-color: #eae8f5 !important;
}
.chip-text {
  color: #2a206a !important;
}
</style>
<style>
.v-autocomplete__content.v-menu__content {
  max-height: 105px !important;
}
.v-application .primary--text {
  color: #2a206a !important;
  caret-color: #eae8f5 !important;
}
</style>
