<template>
  <div>
    <!-- Menu for extension -->
    <v-menu
      v-if="extension"
      content-class="bg-color"
      nudge-bottom
      v-model="projectDropdown"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          @click="
            projectBtn = true;
            searchQuery = null;
            searchProject = null;
            editIcon = false;
          "
          v-on="on"
          outlined
          height="45px"
          depressed
          width="374px"
          class="ml-3 mb-2 dusty-purple-text theme-border text-capitalize d-inline-block text-truncate"
          :disabled="
            getActiveTask
              ? getActiveTask.assigned_by.id != getLoggedInUser.id &&
                getSelectedCompany.role == 'employee'
                ? true
                : false
              : false
          "
        >
          <span max-width="300px" class="d-inline-block text-truncate">
            {{
              getActiveTask
                ? getActiveTask.project
                  ? getActiveTask.project.name
                  : "Project Name"
                : getSelectedProject
                ? getSelectedProject.name
                : "Project Name"
            }}
          </span>
          <v-spacer></v-spacer>
          <v-icon> mdi-chevron-down </v-icon>
          <!-- add project icon -->
        </v-btn>
      </template>

      <v-text-field
        autocomplete="off"
        prepend-inner-icon="mdi-magnify"
        background-color="white"
        color="#2a206a"
        :placeholder="
          getProjects ? (!getProjects.length ? 'Add Project' : 'Search') : ''
        "
        class="pa-1"
        outlined
        hide-details
        solo
        dense
        flat
        autofocus
        v-model="searchQuery"
        @keydown.enter="
          getActiveTask
            ? searchQuery
              ? selectedItem
                ? getActiveTask.project &&
                  getActiveTask.project.id == projectsList[selectedItem].id
                  ? $emit('assignProject', null)
                  : $emit('assignProject', projectsList[selectedItem])
                : projectsList[0]
                ? getActiveTask.project &&
                  getActiveTask.project.id == projectsList[0].id
                  ? $emit('assignProject', null)
                  : $emit('assignProject', projectsList[0])
                : createProject(true)
              : selectedItem != null
              ? getActiveTask.project &&
                getActiveTask.project.id == projectsList[selectedItem].id
                ? $emit('assignProject', null)
                : $emit('assignProject', projectsList[selectedItem])
              : projectsList[0]
              ? getActiveTask.project &&
                getActiveTask.project.id == projectsList[0].id
                ? $emit('assignProject', null)
                : $emit('assignProject', projectsList[0])
              : () => {}
            : searchQuery
            ? selectedItem != null
              ? getSelectedProject &&
                getSelectedProject.id == projectsList[selectedItem].id
                ? unSelectProject(true)
                : selectProject(projectsList[selectedItem], true)
              : projectsList[0]
              ? getSelectedProject &&
                getSelectedProject.id == projectsList[0].id
                ? unSelectProject(true)
                : selectProject(projectsList[0], true)
              : createProject(true)
            : selectedItem != null
            ? getSelectedProject &&
              getSelectedProject.id == projectsList[selectedItem].id
              ? unSelectProject(true)
              : selectProject(projectsList[selectedItem], true)
            : ($emit('projectDone'), (projectDropdown = false))
        "
        @keydown.up="selectPrev"
        @keydown.down="selectNext"
        @click="
          projectBtn = true;
          searchProject = null;
        "
      >
      </v-text-field>

      <v-list class="overflow-scroll" max-height="200" v-if="getProjects">
        <small
          v-if="!searchQuery && getProjects && !getProjects.length"
          class="caption d-flex justify-center align-center"
        >
          Please enter the project name
        </small>
        <div
          v-for="(project, index) in projectsList"
          :key="project.id"
          :class="
            getActiveTask
              ? getActiveTask.project
                ? getActiveTask.project.id == project.id
                  ? 'bg-selected'
                  : selectedItem == index
                  ? 'bg-hover'
                  : ''
                : searchQuery && !selectedItem && index == 0
                ? 'bg-hover'
                : selectedItem == index
                ? 'bg-hover'
                : ''
              : getSelectedProject
              ? getSelectedProject.id == project.id
                ? 'bg-selected'
                : ''
              : searchQuery && index == 0
              ? 'bg-hover'
              : selectedItem == index
              ? 'bg-hover'
              : ''
          "
          class="listing-hover d-flex pointer"
        >
          <v-text-field
            v-if="project.edit"
            v-model="editProjectName"
            dense
            outlined
            hide-details
            flat
            class="w-100 caption pa-2"
            autofocus
            @blur="blur(project)"
          >
          </v-text-field>
          <div
            v-if="!project.edit"
            @click="
              getActiveTask
                ? getActiveTask.project
                  ? getActiveTask.project.id == project.id
                    ? $emit('assignProject', null)
                    : $emit('assignProject', project)
                  : $emit('assignProject', project)
                : getSelectedProject
                ? getSelectedProject.id == project.id
                  ? unSelectProject()
                  : selectProject(project)
                : selectProject(project)
            "
            class="d-flex list-item-min-height"
          >
            <profileImage
              inline
              :username="project.name"
              :size="23"
              :circular="true"
              class="ml-3 text-light"
            >
            </profileImage>
            <v-list-item-content
              style="max-width: 160px"
              class="ml-2 d-inline-block text-truncate w-12 caption"
              >{{
                project.name[0].toUpperCase() +
                project.name.slice(1).toLowerCase()
              }}
            </v-list-item-content>
          </div>
          <v-spacer></v-spacer>
          <v-icon
            small
            color="#1cc283"
            class="pl-10 mr-1"
            v-text="
              getActiveTask
                ? getActiveTask.project
                  ? getActiveTask.project.id == project.id
                    ? 'mdi-check-box-outline'
                    : ''
                  : ''
                : getSelectedProject
                ? getSelectedProject.id == project.id
                  ? 'mdi-check-box-outline'
                  : ''
                : ''
            "
          ></v-icon>
          <v-tooltip top color="#302277">
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                v-show="project.id == editIcon"
                class="mr-1 logo-text-color"
                :class="
                  getSelectedCompany.role == 'team-manager' ||
                  getSelectedCompany.role == 'employee'
                    ? 'd-none'
                    : ''
                "
                @click="updateProject(project)"
                small
              >
                mdi-check
              </v-icon>
            </template>
            <span>Update Project</span>
          </v-tooltip>
          <v-tooltip top color="#302277">
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                v-show="
                  project.id != editIcon &&
                  (getSelectedCompany.permissions
                    ? getSelectedCompany.permissions.project
                    : true)
                "
                class="mr-1 logo-text-color"
                :class="
                  getSelectedCompany.role == 'team-manager' ||
                  getSelectedCompany.role == 'employee'
                    ? 'd-none'
                    : ''
                "
                @click="editProject(project)"
                small
              >
                mdi-pencil
              </v-icon>
            </template>
            <span>Edit Project</span>
          </v-tooltip>
          <v-tooltip top color="#302277">
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                class="logo-text-color mr-2"
                v-if="
                  getSelectedCompany.permissions
                    ? getSelectedCompany.permissions.project
                    : true
                "
                @click="deleteProject(project)"
                small
                :class="
                  getSelectedCompany.role == 'team-manager' ||
                  getSelectedCompany.role == 'employee'
                    ? 'd-none'
                    : ''
                "
                >mdi-trash-can-outline</v-icon
              >
            </template>
            <span>Delete Project</span>
          </v-tooltip>
        </div>
        <div v-if="searchQuery && projectsList && !projectsList.length">
          <p class="no-results-found my-1">No results found</p>
        </div>
      </v-list>
      <v-btn
        v-model="projectBtn"
        v-if="
          projectBtn && getSelectedCompany.permissions
            ? getSelectedCompany.permissions.project
            : true
        "
        @click="searchQuery ? createProject() : (projectBtn = false)"
        color="#EEF0F6"
        width="325"
        class="listing-hover mx-2 my-2 text-capitalize"
        :class="
          !projectBtn ||
          getSelectedCompany.role == 'team-manager' ||
          getSelectedCompany.role == 'employee'
            ? 'd-none'
            : ''
        "
      >
        <v-icon class="mx-1">mdi-plus</v-icon>
        <span style="max-width: 160px" class="d-inline-block text-truncate">
          Add
          {{
            projectsList && !projectsList.length ? searchQuery : "New Project"
          }}</span
        ></v-btn
      >
      <v-text-field
        autocomplete="off"
        class="pa-0 ma-0 caption"
        v-if="!projectBtn"
        prepend-inner-icon="mdi-plus"
        color="#2a206a"
        background-color="#F8F7FD"
        hide-details
        autofocus
        v-model="searchProject"
        solo
        dense
        flat
        @keydown.enter="
          createProject();
          projectBtn = true;
        "
      >
        <template v-slot:append>
          <div class="font-size pa-0 ma-0" color="#2a206a">
            *press enter to add
          </div>
        </template>
      </v-text-field>
    </v-menu>

    <!-- Menu for web -->
    <v-menu
      v-else
      content-class="bg-color"
      offset-y
      v-model="projectDropdown"
      :close-on-content-click="false"
      right
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          @click="
            projectBtn = true;
            searchQuery = null;
            searchProject = null;
            editIcon = false;
          "
          v-bind="attrs"
          v-on="on"
          tile
          depressed
          :x-small="$vuetify.breakpoint.xs"
          :fab="$vuetify.breakpoint.xs"
          :width="
            $mq == 'phone' || $mq == 'extraSmallPhones'
              ? '70%'
              : $vuetify.breakpoint.xs
              ? '70px'
              : '120px'
          "
          :class="
            getActiveTask
              ? getActiveTask.project
                ? 'task-bar-btns-borders task-bar-btns-height'
                : ''
              : getSelectedProject
              ? 'task-bar-btns-borders task-bar-btns-height'
              : ''
          "
          class="task-bar-btns ml-1 mr-1 text-capitalize d-inline-block text-truncate"
          :disabled="
            getActiveTask
              ? getActiveTask.assigned_by.id != getLoggedInUser.id &&
                getSelectedCompany.role == 'employee'
                ? true
                : false
              : false
          "
        >
          <!-- add project icon & tooltip for small screens (including extension) start-->
          <v-tooltip bottom color="#302277">
            <template v-slot:activator="{ on, attrs }">
              <img
                v-on="on"
                v-bind="attrs"
                src="@/assets/images/add_projects_icon.svg"
                class="mt-1 d-flex d-sm-none"
                :height="
                  $mq == 'phone' || $mq == 'extraSmallPhones' ? '20px' : '25px'
                "
              />
            </template>
            <span>Add Project</span>
          </v-tooltip>
          <!-- add project icon & tooltip for small screens (including extension) start-->
          <v-icon
            small
            class="mr-1"
            :class="
              getSelectedCompany.role == 'employee' ||
              getSelectedCompany.role == 'team-manager'
                ? 'd-none'
                : ''
            "
            v-show="!$vuetify.breakpoint.xs"
            v-if="
              !getSelectedProject && getSelectedCompany.permissions
                ? getSelectedCompany.permissions.project
                : true
            "
          >
            mdi-plus-circle-outline
          </v-icon>
          <span
            v-if="!$vuetify.breakpoint.xs"
            max-width="120px"
            class="d-inline-block text-truncate"
          >
            {{
              getActiveTask
                ? getActiveTask.project
                  ? getActiveTask.project.name
                  : "Project"
                : getSelectedProject
                ? getSelectedProject.name
                  ? getSelectedProject.name
                  : searchQuery || searchProject
                : "Project"
            }}
          </span>
        </v-btn>
      </template>

      <v-text-field
        autocomplete="off"
        prepend-inner-icon="mdi-magnify"
        background-color="white"
        color="#2a206a"
        :placeholder="
          getProjects ? (!getProjects.length ? 'Add Project' : 'Search') : ''
        "
        class="pa-1"
        outlined
        hide-details
        solo
        dense
        flat
        autofocus
        v-model="searchQuery"
        @keydown.enter="
          getActiveTask
            ? searchQuery
              ? selectedItem
                ? getActiveTask.project &&
                  getActiveTask.project.id == projectsList[selectedItem].id
                  ? $emit('assignProject', null)
                  : $emit('assignProject', projectsList[selectedItem])
                : projectsList[0]
                ? getActiveTask.project &&
                  getActiveTask.project.id == projectsList[0].id
                  ? $emit('assignProject', null)
                  : $emit('assignProject', projectsList[0])
                : createProject(true)
              : selectedItem != null
              ? getActiveTask.project &&
                getActiveTask.project.id == projectsList[selectedItem].id
                ? $emit('assignProject', null)
                : $emit('assignProject', projectsList[selectedItem])
              : projectsList[0]
              ? getActiveTask.project &&
                getActiveTask.project.id == projectsList[0].id
                ? $emit('assignProject', null)
                : $emit('assignProject', projectsList[0])
              : () => {}
            : searchQuery
            ? selectedItem != null
              ? getSelectedProject &&
                getSelectedProject.id == projectsList[selectedItem].id
                ? unSelectProject(true)
                : selectProject(projectsList[selectedItem], true)
              : projectsList[0]
              ? getSelectedProject &&
                getSelectedProject.id == projectsList[0].id
                ? unSelectProject(true)
                : selectProject(projectsList[0], true)
              : createProject(true)
            : selectedItem != null
            ? getSelectedProject &&
              getSelectedProject.id == projectsList[selectedItem].id
              ? unSelectProject(true)
              : selectProject(projectsList[selectedItem], true)
            : ($emit('projectDone'), (projectDropdown = false))
        "
        @keydown.up="selectPrev"
        @keydown.down="selectNext"
        @click="
          projectBtn = true;
          searchProject = null;
        "
      >
      </v-text-field>

      <v-list class="overflow-scroll" max-height="210" v-if="getProjects">
        <small
          v-if="!searchQuery && getProjects && !getProjects.length"
          class="caption d-flex justify-center align-center"
        >
          Please enter the project name
        </small>
        <div
          v-for="(project, index) in projectsList"
          :key="project.id"
          :class="
            getActiveTask
              ? getActiveTask.project
                ? getActiveTask.project.id == project.id
                  ? 'bg-selected'
                  : selectedItem == index
                  ? 'bg-hover'
                  : ''
                : searchQuery && !selectedItem && index == 0
                ? 'bg-hover'
                : selectedItem == index
                ? 'bg-hover'
                : ''
              : getSelectedProject
              ? getSelectedProject.id == project.id
                ? 'bg-selected'
                : ''
              : searchQuery && index == 0
              ? 'bg-hover'
              : selectedItem == index
              ? 'bg-hover'
              : ''
          "
          class="listing-hover d-flex pointer"
        >
          <v-text-field
            v-if="project.edit"
            v-model="editProjectName"
            dense
            outlined
            hide-details
            flat
            class="w-100 caption pa-2"
            autofocus
            @blur="blur(project)"
          >
          </v-text-field>
          <div
            v-if="!project.edit"
            @click="
              getActiveTask
                ? getActiveTask.project
                  ? getActiveTask.project.id == project.id
                    ? $emit('assignProject', null)
                    : $emit('assignProject', project)
                  : $emit('assignProject', project)
                : getSelectedProject
                ? getSelectedProject.id == project.id
                  ? unSelectProject()
                  : selectProject(project)
                : selectProject(project)
            "
            class="d-flex list-item-min-height"
          >
            <profileImage
              inline
              :username="project.name"
              :size="23"
              :circular="true"
              class="ml-3 text-light"
            >
            </profileImage>
            <v-list-item-content
              style="max-width: 160px"
              class="ml-2 d-inline-block text-truncate w-12 caption"
              >{{
                project.name[0].toUpperCase() +
                project.name.slice(1).toLowerCase()
              }}
            </v-list-item-content>
            <v-icon
              small
              color="#1cc283"
              class="pl-10"
              v-text="
                getActiveTask
                  ? getActiveTask.project
                    ? getActiveTask.project.id == project.id
                      ? 'mdi-check-box-outline'
                      : ''
                    : ''
                  : getSelectedProject
                  ? getSelectedProject.id == project.id
                    ? 'mdi-check-box-outline'
                    : ''
                  : ''
              "
            ></v-icon>
          </div>
          <v-spacer></v-spacer>
          <v-tooltip top color="#302277">
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                v-show="project.id == editIcon"
                class="mr-1 logo-text-color"
                :class="
                  getSelectedCompany.role == 'team-manager' ||
                  getSelectedCompany.role == 'employee'
                    ? 'd-none'
                    : ''
                "
                @click="updateProject(project)"
                small
              >
                mdi-check
              </v-icon>
            </template>
            <span>Update Project</span>
          </v-tooltip>
          <v-tooltip top color="#302277">
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                v-show="
                  project.id != editIcon &&
                  (getSelectedCompany.permissions
                    ? getSelectedCompany.permissions.project
                    : true)
                "
                class="mr-1 logo-text-color"
                :class="
                  getSelectedCompany.role == 'team-manager' ||
                  getSelectedCompany.role == 'employee'
                    ? 'd-none'
                    : ''
                "
                @click="editProject(project)"
                small
              >
                mdi-pencil
              </v-icon>
            </template>
            <span>Edit Project</span>
          </v-tooltip>
          <v-tooltip top color="#302277">
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                class="logo-text-color mr-2"
                v-if="
                  getSelectedCompany.permissions
                    ? getSelectedCompany.permissions.project
                    : true
                "
                @click="deleteProject(project)"
                small
                :class="
                  getSelectedCompany.role == 'team-manager' ||
                  getSelectedCompany.role == 'employee'
                    ? 'd-none'
                    : ''
                "
                >mdi-trash-can-outline</v-icon
              >
            </template>
            <span>Delete Project</span>
          </v-tooltip>
        </div>
        <div v-if="searchQuery && projectsList && !projectsList.length">
          <p class="no-results-found my-1">No results found</p>
        </div>
      </v-list>
      <v-btn
        v-model="projectBtn"
        v-if="
          projectBtn && getSelectedCompany.permissions
            ? getSelectedCompany.permissions.project
            : true
        "
        @click="searchQuery ? createProject() : (projectBtn = false)"
        color="#EEF0F6"
        width="260"
        class="listing-hover mx-2 my-2 text-capitalize"
        :class="
          !projectBtn ||
          getSelectedCompany.role == 'team-manager' ||
          getSelectedCompany.role == 'employee'
            ? 'd-none'
            : ''
        "
      >
        <v-icon class="mx-1">mdi-plus</v-icon>
        <span style="max-width: 160px" class="d-inline-block text-truncate">
          Add
          {{
            projectsList && !projectsList.length ? searchQuery : "New Project"
          }}</span
        ></v-btn
      >
      <v-text-field
        autocomplete="off"
        class="pa-0 ma-0 caption"
        v-if="!projectBtn"
        prepend-inner-icon="mdi-plus"
        color="#2a206a"
        background-color="#F8F7FD"
        hide-details
        autofocus
        v-model="searchProject"
        solo
        dense
        flat
        @keydown.enter="
          createProject();
          projectBtn = true;
        "
      >
        <template v-slot:append>
          <div class="font-size pa-0 ma-0" color="#2a206a">
            *press enter to add
          </div>
        </template>
      </v-text-field>
    </v-menu>
    <v-snackbar
      class="mt-5"
      top
      right
      :color="projectError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="projectError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="projectError ? 'red' : 'green'"
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
import profileImage from "../includes/ProfileImage";
import { mapGetters } from "vuex";
import Swal from "sweetalert2";

export default {
  name: "ProjectList",
  components: {
    profileImage,
  },
  props: ["open", "extension"],
  data() {
    return {
      projectToEdit: false,
      editIcon: null,
      projectBtn: true,
      projectDropdown: false,
      searchQuery: null,
      searchProject: null,
      editProjectName: "",
      dialog: false,
      delProject: "",
      projectError: null,
      snackbar: false,
      snackbarMessage: null,
      loader: false,
      selectedItem: null,
    };
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getProjects",
      "getActiveTask",
      "getSelectedProject",
      "getLoggedInUser",
    ]),
    // Search all Projects
    projectsList() {
      return this.searchQuery && this.getProjects
        ? this.getProjects.filter((item) => {
            return item.name
              ? item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
              : false;
          })
        : this.getProjects;
    },
  },
  methods: {
    selectPrev() {
      if (this.selectedItem != null && this.projectsList) {
        if (this.selectedItem <= 0) {
          this.selectedItem = this.projectsList.length - 1;
        } else {
          this.selectedItem -= 1;
        }
      } else {
        this.selectedItem = 0;
      }
    },
    selectNext() {
      if (this.selectedItem != null && this.projectsList) {
        if (this.selectedItem >= this.projectsList.length - 1) {
          this.selectedItem = 0;
        } else {
          this.selectedItem += 1;
        }
      } else {
        this.selectedItem = 0;
      }
    },
    // Select project to assign to task
    selectProject(project, autoStart) {
      this.projectDropdown = false;
      this.$store.commit("setSelectedProject", project);
      if (autoStart) this.$emit("projectDone");
    },
    // unselect  project to assign to task
    unSelectProject(autoStart) {
      this.projectDropdown = false;
      this.$store.commit("setSelectedProject", null);
      if (autoStart) this.$emit("projectDone");
    },
    // when click oustide the text field when update text field show
    blur(project) {
      project.edit = false;
      project.id != this.editIcon;
    },
    //add project
    createProject(autoStart) {
      if (this.searchProject || this.searchQuery) {
        this.$store.commit(
          "setSelectedProject",
          this.searchQuery ? this.searchQuery : this.searchProject
        );
        this.projectDropdown = false;
        this.$store
          .dispatch("createProject", {
            project_name: this.searchProject
              ? this.searchProject
              : this.searchQuery,
            company_id: this.getSelectedCompany.id,
          })
          .then((response) => {
            this.selectProject(response);
            if (autoStart) this.$emit("projectDone");
            this.searchProject = null;
            this.searchQuery = null;
            this.projectBtn = true;
          })
          .catch((error) => {
            this.snackbar = true;
            this.projectError = true;
            if (error.response.status == 422) {
              if (error.response.data.errors.project_name) {
                this.snackbarMessage =
                  error.response.data.errors.project_name[0];
              }
            }
            this.searchProject = null;
            this.searchQuery = null;
            this.projectBtn = true;
          });
      }
    },

    deleteProject(delProject) {
      if (this.getActiveTask) {
        this.snackbar = true;
        this.snackbarMessage = "Please stop your task";
        this.projectError = true;
      } else {
        Swal.fire({
          title: "Are you sure?",
          html: "Delete this project",
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Delete",
          reverseButtons: true,
        }).then((result) => {
          if (result.value) {
            this.$store
              .dispatch("deleteProject", {
                project_id: delProject.id,
                company_id: this.getSelectedCompany.id,
                archived: true,
              })
              .then(() => {
                this.$store.commit("setSelectedProject", null);
                this.snackbar = true;
                this.snackbarMessage = "Project deleted successfully";
                this.projectError = false;
                this.$store.dispatch("fetchTasks");
                this.loader = false;
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      }
    },

    // hit when click on edit button
    editProject(project) {
      if (this.getActiveTask) {
        this.snackbar = true;
        this.snackbarMessage = "Please stop your task";
        this.projectError = true;
      } else {
        this.projectToEdit = true;
        this.editIcon = project.id;
        project.edit = true;
        this.editProjectName = project.name;
      }
    },

    // hit on update  project
    updateProject(project) {
      let editProjectData = {
        name: this.editProjectName,
        project_id: project.id,
        company_id: this.getSelectedCompany.id,
      };
      this.$store
        .dispatch("updateProject", editProjectData)
        .then((response) => {
          this.editIcon = false;
          this.snackbar = true;
          this.snackbarMessage = response.data.error_msg;
          this.projectError = false;
        })
        .catch((error) => {
          console.log("error", error);
          this.snackbar = true;
          this.projectError = true;
          if (error.response.status == 422) {
            if (error.response.data.errors.name) {
              this.snackbarMessage = error.response.data.errors.name[0];
            }
          }
        });
    },
  },
  watch: {
    getActiveTask() {
      this.$store.commit("setSelectedProject", null);
    },
    // signal from task bar to open dropdown
    open(value) {
      if (value) {
        this.projectDropdown = true;
      }
    },
    // signal to task bar if dropdown is closed
    projectDropdown(value) {
      if (value) {
        this.$store.dispatch("fetchProjects");
      }
      if (!value) {
        this.selectedItem = null;
        this.$emit("dropdownClosed");
      }
    },
    // clear search field
    getSelectedProject(value) {
      if (!value) this.searchQuery = "";
    },
  },
  mounted() {
    this.$store.commit("setSelectedProject", null);
  },
};
</script>
<style scoped>
.font-size {
  font-size: 10px;
}

.listing-hover:hover .logo-text-color {
  color: green !important;
}
.btn-bg-color {
  background-color: #cbdaf2;
  color: #0000ff;
}
.confimr-button {
  font-size: 12px;
  background-color: blue;
  color: #fff;
}
.no-btn {
  font-size: 12px;
  background-color: #fff;
  color: black;
}
.bg-color {
  background-color: white !important;
}
.text-color {
  color: #2979ff;
}
.w-12 {
  width: 120px !important;
}
.confirm-button {
  background-color: #ffb7b7;
}
.task-bar-btns {
  background-color: transparent !important;
  color: #1cc283;
}
.task-bar-btns-borders {
  border: 1px #2b6ad8 solid;
  color: #2b6ad8;
  border-radius: 20px;
  background-color: #e5efff !important;
}
.task-bar-btns-height {
  height: 30px !important;
}

.bg-hover {
  background-color: #e5efff !important;
}
</style>
