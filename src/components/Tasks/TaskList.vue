<template>
  <div>
    <div
      class="mt-1 ml-7"
      v-if="getActiveTask && getSelectedCompany.role != 'employee'"
    >
      <v-icon color="#1CC283" size="20"> mdi-checkbox-marked-outline </v-icon>
      <span class="dark-purple-text" style="font-size: 13px">
        Want to assign another task?
        <a
          class="success-text text-decoration-underline font-weight-bold"
          @click="openAssignTaskDialog = true"
        >
          Click Here
        </a>
      </span>
    </div>
    <div
      :class="
        isExtension
          ? 'table-width-extension'
          : $vuetify.breakpoint.md
          ? 'table-width-2'
          : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
          ? 'table-width-3'
          : getSidebarMini
          ? 'table-width-4'
          : 'table-width'
      "
    >
      <div style="position: relative">
        <v-overlay
          :class="
            isExtension
              ? 'table-width-extension'
              : $vuetify.breakpoint.md
              ? 'table-width-2 overlay-height'
              : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
              ? 'table-width-3 overlay-height-sm'
              : getSidebarMini
              ? 'table-width-4  overlay-height'
              : 'table-width  overlay-height'
          "
          absolute
          id="divOverlay"
          :value="!getOnlineStatus"
          v-if="!getOnlineStatus"
          color="white"
        >
        </v-overlay>
      </div>

      <div style="position: relative">
        <!-- Loader while waiting -->
        <v-skeleton-loader
          v-show="getTasksSkeletonLoader"
          type="table-tbody,table-tfoot"
          class="mt-3"
          :class="
            isExtension
              ? 'table-width-extension'
              : $vuetify.breakpoint.md
              ? 'table-width-2'
              : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
              ? 'table-width-3'
              : getSidebarMini
              ? 'table-width-4'
              : 'table-width'
          "
        >
        </v-skeleton-loader>

        <!-- Assigned to menu -->
        <v-menu
          v-model="assignedToMenu"
          absolute
          max-width="276"
          content-class="bg-color"
          :close-on-content-click="false"
          :position-x="x"
          :position-y="y"
        >
          <!-- member search-->
          <div
            :class="
              getSelectedCompany.permissions
                ? getSelectedCompany.permissions.project &&
                  !getSelectedCompany.permissions.team_member
                  ? 'd-none'
                  : ''
                : ''
            "
          >
            <v-text-field
              prepend-inner-icon="mdi-magnify"
              background-color="white"
              placeholder="Search"
              class="pa-1"
              color="#2a206a"
              hide-details
              solo
              dense
              flat
              autofocus
              outlined
              v-model="memberSearch"
              autocomplete="off"
            >
            </v-text-field>
            <v-list
              v-if="selectedTask"
              class="pointer overflow-scroll"
              scrollable
              max-height="200"
            >
              <div
                v-for="member in filteredAssignees(selectedTask.task_id)"
                :key="member.email"
                :disabled="
                  (getActiveTask && member.id == getLoggedInUser.id) ||
                  selectedTask.members.length <= 1
                    ? true
                    : false
                "
                class="d-flex bg-selected listing-hover caption list-item-min-height"
                @click="
                  selectedTask.members.length > 1
                    ? assign(selectedTask.task_id, member.id)
                    : () => {}
                "
              >
                <profileImage
                  v-show="member.image ? ':src' : ':username'"
                  :src="member.image"
                  inline
                  :username="member.name ? member.name : member.email"
                  :size="23"
                  :userProfile="true"
                  :circular="true"
                  class="ml-3 text-light"
                >
                </profileImage>
                <v-list-item-content
                  style="max-width: 160px"
                  class="d-inline-block text-truncate ml-3"
                  v-if="member.name"
                  >{{
                    getLoggedInUser.id == member.id
                      ? "ME"
                      : member.name[0].toUpperCase() +
                        member.name.slice(1).toLowerCase()
                  }}</v-list-item-content
                >
                <v-list-item-content
                  style="max-width: 160px"
                  class="d-inline-block text-truncate ml-3"
                  v-if="!member.name"
                  >{{ member.email }}</v-list-item-content
                >
                <v-spacer></v-spacer>
                <v-icon small class="mr-4" color="#1cc283"
                  >mdi-check-box-outline</v-icon
                >
              </div>
              <div
                v-for="member in tempMembers.concat(
                  filteredNonAssignees(selectedTask.task_id)
                )"
                :key="member.email"
                @click="
                  member.id ? assign(selectedTask.task_id, member.id) : () => {}
                "
                class="d-flex list-item-min-height listing-hover caption"
                :class="member.id == requestQue ? 'bg-selected' : ''"
              >
                <profileImage
                  v-show="member.image ? ':src' : ':username'"
                  :src="member.image"
                  inline
                  :username="member.name ? member.name : member.email"
                  :size="23"
                  :userProfile="true"
                  :circular="true"
                  class="ml-3 text-light"
                >
                </profileImage>
                <v-list-item-content
                  style="max-width: 160px"
                  v-if="member.name"
                  class="d-inline-block text-truncate ml-3"
                  >{{
                    getLoggedInUser.id == member.id
                      ? "ME"
                      : member.name[0].toUpperCase() +
                        member.name.slice(1).toLowerCase()
                  }}
                </v-list-item-content>
                <v-list-item-content
                  style="max-width: 160px"
                  v-if="!member.name"
                  class="d-inline-block text-truncate ml-3"
                >
                  {{ member.email }}
                </v-list-item-content>
                <v-spacer></v-spacer>
                <v-icon
                  v-if="member.id == requestQue"
                  small
                  class="mr-4"
                  color="#1cc283"
                  >mdi-check-box-outline</v-icon
                >
              </div>
              <div
                v-if="
                  memberSearch &&
                  !filteredAssignees(selectedTask.task_id).length &&
                  !filteredNonAssignees(selectedTask.task_id).length
                "
              >
                <p class="no-results-found my-1">No results found</p>
              </div>
            </v-list>
            <v-btn
              @click="dialog = true"
              color="#EEF0F6"
              width="260"
              class="listing-hover mx-2 my-2"
            >
              <v-icon class="mx-1">mdi-plus</v-icon> Add New Member</v-btn
            >
          </div>
        </v-menu>

        <!-- Project Menu -->
        <v-menu
          max-width="276"
          :close-on-content-click="false"
          content-class="bg-color"
          offset-y
          v-model="projectMenu"
          absolute
          :position-x="x"
          :position-y="y"
        >
          <div
            v-if="selectedTask"
            :class="
              getSelectedCompany.permissions
                ? getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project
                  ? 'd-none'
                  : ''
                : ''
                ? 'd-none'
                : ''
            "
          >
            <v-text-field
              prepend-inner-icon="mdi-magnify"
              background-color="white"
              placeholder="Search"
              color="#2a206a"
              class="pa-1"
              hide-details
              solo
              dense
              autofocus
              outlined
              autocomplete="off"
              v-model="projectSearch"
              @keydown.enter="
                selectedTask.project
                  ? selectedTask.project.id == projectsList[0].id
                    ? updateSelectedProject(null, selectedTask)
                    : updateSelectedProject(projectsList[0], selectedTask)
                  : updateSelectedProject(projectsList[0], selectedTask);
                createProject();
              "
            >
            </v-text-field>

            <v-list max-height="200" class="pointer overflow-scroll">
              <small
                v-if="!projectSearch && !getProjects.length"
                class="caption d-flex justify-center align-center"
              >
                Please enter the project name
              </small>
              <div
                v-for="(project, index) in projectsList"
                :key="project.id"
                class="listing-hover d-flex pointer list-item-min-height"
                :class="
                  selectedTask.project
                    ? selectedTask.project.id == project.id
                      ? 'bg-selected'
                      : projectSearch && index == 0
                      ? 'bg-search-result'
                      : ''
                    : ''
                "
              >
                <v-text-field
                  v-if="project.edit"
                  v-model="editProjectName"
                  dense
                  outlined
                  hide-details
                  color="#2a206a"
                  flat
                  class="pl-2 caption"
                  autofocus
                  autocomplete="off"
                  @blur="
                    project.edit = false;
                    project.id != editIcon;
                  "
                >
                </v-text-field>
                <div
                  v-if="!project.edit"
                  class="d-flex list-item-min-height"
                  @click="
                    selectedTask.project
                      ? selectedTask.project.id == project.id
                        ? updateSelectedProject(null, selectedTask)
                        : updateSelectedProject(project, selectedTask)
                      : updateSelectedProject(project, selectedTask)
                  "
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
                    ><span
                      style="max-width: 160px"
                      class="ml-2 d-inline-block text-truncate w-12 caption"
                    >
                      {{ project.name }}
                    </span>
                  </v-list-item-content>
                </div>
                <v-spacer></v-spacer>
                <v-icon
                  small
                  color="#1cc283"
                  class="mr-3"
                  v-text="
                    selectedTask.project
                      ? selectedTask.project.id == project.id
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

              <div v-if="projectSearch && !projectsList.length">
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
              @click="projectSearch ? createProject() : (projectBtn = false)"
              color="#EEF0F6"
              width="242"
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
              <span
                style="max-width: 160px"
                class="d-inline-block text-truncate"
              >
                Add
                {{ projectSearch ? projectSearch : "New Project" }}
              </span></v-btn
            >
            <v-text-field
              class="pa-0 ma-0 caption"
              v-if="!projectBtn"
              prepend-inner-icon="mdi-plus"
              color="#2a206a"
              background-color="#F8F7FD"
              hide-details
              autofocus
              v-model="searchProject"
              autocomplete="off"
              solo
              dense
              flat
              @keydown.enter="createProject()"
            >
              <template v-slot:append>
                <div class="font-size pa-0 ma-0" color="#2a206a">
                  *press enter to add
                </div>
              </template>
            </v-text-field>
          </div>
        </v-menu>

        <v-data-table
          height="calc(100vh - 240px)"
          id="v-data-table-task"
          fixed-header
          v-show="!getTasksSkeletonLoader"
          :headers="headers"
          :loading="true"
          loading-text="No data available"
          :mobile-breakpoint="0"
          show-expand
          :items="
            getTasks
              ? getActiveTask
                ? [getActiveTask].concat(
                    getTasks.filter((item) => {
                      return item.task_id != getActiveTask.task_id;
                    })
                  )
                : getTasks
              : []
          "
          :item-class="
            (item) => {
              return item.just_added
                ? 'teal--text font-weight-light teal lighten-5 elevation-3'
                : '';
            }
          "
          item-key="task_id"
          disable-pagination
          hide-default-footer
          :class="$vuetify.breakpoint.xs ? 'mx-3' : 'ml-6'"
          class="mb-1 elevation-1 table-height mt-4 transition-swing task-list-table"
          @click:row="selectTask"
        >
          <template v-slot:[`header.data-table-expand`]>
            <v-tooltip top color="#302277">
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-menu
                    v-if="
                      getSelectedCompany.role == 'owner' ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        getSelectedCompany.permissions.project) ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        !getSelectedCompany.permissions.project) ||
                      getSelectedCompany.role == 'team-manager'
                    "
                    min-width="100"
                    v-model="tasksDropdown"
                    nudge-bottom="20"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ on }">
                      <v-icon
                        @click="tasksDropdown = true"
                        v-on="on"
                        small
                        size="60"
                        color="#2a206a"
                        class="mr-4 pointer"
                        >mdi-filter-menu</v-icon
                      >
                    </template>
                    <v-list class="pointer">
                      <div
                        class="listing-hover pa-2 pl-5 caption"
                        @click="changeShowAll('all')"
                        :class="getShowAllTasks == 'all' ? 'bg-selected' : ''"
                      >
                        All Tasks
                      </div>
                      <div
                        class="listing-hover pa-2 pl-5 caption"
                        @click="changeShowAll('me')"
                        :class="getShowAllTasks == 'me' ? 'bg-selected' : ''"
                      >
                        My Tasks
                      </div>
                      <div
                        class="listing-hover pa-2 pl-5 caption"
                        @click="changeShowAll('others')"
                        :class="
                          getShowAllTasks == 'others' ? 'bg-selected' : ''
                        "
                      >
                        Others Tasks
                      </div>
                    </v-list>
                  </v-menu>
                </div>
              </template>
              <span>Apply filter</span>
            </v-tooltip>
          </template>

          <!-- Header Slot for Assigned By -->
          <template v-slot:[`header.assigned_by`]="{ header }">
            <div
              v-show="
                (getSelectedCompany.role == 'owner' &&
                  getShowAllTasks != 'me') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  getSelectedCompany.permissions.project &&
                  getShowAllTasks != 'me') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project &&
                  getShowAllTasks != 'me') ||
                (getSelectedCompany.role == 'team-manager' &&
                  getShowAllTasks != 'me') ||
                getSelectedCompany.role == 'employee' ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.project &&
                  !getSelectedCompany.permissions.team_member)
              "
              class="header-text-color"
            >
              {{ header.text }}
            </div>
          </template>
          <!-- Header Slot for Assigned To -->
          <template v-slot:[`header.members`]="{ header }">
            <div class="d-flex">
              <div
                v-if="
                  getSelectedCompany.role == 'owner' ||
                  (getSelectedCompany.role == 'admin' &&
                    getSelectedCompany.permissions.team_member &&
                    getSelectedCompany.permissions.project) ||
                  (getSelectedCompany.role == 'admin' &&
                    getSelectedCompany.permissions.team_member &&
                    !getSelectedCompany.permissions.project) ||
                  getSelectedCompany.role == 'team-manager'
                "
                class="header-text-color"
              >
                {{ header.text }}
              </div>
            </div>
          </template>
          <!-- Header Slot for Project -->
          <template v-slot:[`header.project`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
              <v-icon
                small
                color="#2a206a"
                class="pointer"
                @click="
                  sortProjects == 'desc'
                    ? ((sortProjects = 'asc'),
                      sortColumn(header.value, sortProjects))
                    : ((sortProjects = 'desc'),
                      sortColumn(header.value, sortProjects))
                "
              >
                {{
                  sortProjects == "asc" ? " mdi-arrow-up" : " mdi-arrow-down"
                }}</v-icon
              >
            </div>
          </template>
          <!-- Header Slot for Title -->
          <template v-slot:[`header.title`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
              <v-icon
                small
                color="#2a206a"
                class="pointer"
                @click="
                  sortTitles == 'desc'
                    ? ((sortTitles = 'asc'),
                      sortColumn(header.value, sortTitles))
                    : ((sortTitles = 'desc'),
                      sortColumn(header.value, sortTitles))
                "
              >
                {{
                  sortTitles == "asc" ? " mdi-arrow-up" : " mdi-arrow-down"
                }}</v-icon
              >
            </div>
          </template>
          <!-- Header Slot for Assigned Date -->
          <template v-slot:[`header.created_at`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
              <v-icon
                small
                color="#2a206a"
                class="pointer"
                @click="
                  sortAssignedDate == 'desc'
                    ? ((sortAssignedDate = 'asc'),
                      sortColumn(header.value, sortAssignedDate))
                    : ((sortAssignedDate = 'desc'),
                      sortColumn(header.value, sortAssignedDate))
                "
              >
                {{
                  sortAssignedDate == "asc"
                    ? " mdi-arrow-up"
                    : " mdi-arrow-down"
                }}</v-icon
              >
            </div>
          </template>
          <!-- Header Slot for Due Date -->
          <template v-slot:[`header.due_date`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
              <v-icon
                small
                color="#2a206a"
                class="pointer"
                @click="
                  sortDueDate == 'desc'
                    ? ((sortDueDate = 'asc'),
                      sortColumn(header.value, sortDueDate))
                    : ((sortDueDate = 'desc'),
                      sortColumn(header.value, sortDueDate))
                "
              >
                {{
                  sortDueDate == "asc" ? " mdi-arrow-up" : " mdi-arrow-down"
                }}</v-icon
              >
            </div>
          </template>
          <!-- Header Slot for interval -->
          <template v-slot:[`header.interval`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <!-- Header Slot for status -->
          <template v-slot:[`header.status`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <!-- Header Slot for durations -->
          <template v-slot:[`header.members.duration`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <!-- Header Slot for actions -->
          <template v-slot:[`header.actions`]="{ header }">
            <div v-if="!isExtension" class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <v-progress-linear
            v-show="fetchLinearLoader || getTasksLinearLoaderState"
            slot="progress"
            color="#2a206a"
            indeterminate
          ></v-progress-linear>
          <template v-slot:[`body.prepend`]="{ headers }">
            <tr>
              <td
                :class="getSelectedCompany.role == 'owner' ? 'px-1' : 'px-1'"
                v-for="(header, i) in headers"
                :key="i"
              >
                <div v-if="header.value == 'members'">
                  <v-menu
                    v-model="assignedToDropdown"
                    :close-on-content-click="false"
                    offset-y
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="searchMember = null"
                        color="white"
                        v-bind="attrs"
                        v-on="on"
                        depressed
                        class="text-capitalize rounded-0 mr-1 header-dropdown mb-1 mt-2 ml-n2"
                        x-small
                      >
                        {{
                          getSearchedAssignedTo
                            ? getSearchedAssignedTo.name
                              ? getSearchedAssignedTo.name
                              : getSearchedAssignedTo.email
                            : "Members"
                        }}
                        <v-icon small class="pl-3"> mdi-menu-down </v-icon>
                      </v-btn>
                    </template>

                    <v-list
                      :class="
                        getSelectedCompany.permissions
                          ? getSelectedCompany.permissions.project &&
                            !getSelectedCompany.permissions.team_member
                            ? 'd-none'
                            : ''
                          : ''
                      "
                      max-height="180"
                      class="overflow-scroll"
                    >
                      <v-text-field
                        autocomplete="off"
                        prepend-inner-icon="mdi-magnify"
                        background-color="white"
                        placeholder="Search.."
                        color="#2a206a"
                        class="pa-1"
                        hide-details
                        solo
                        dense
                        flat
                        autofocus
                        outlined
                        v-model="searchMember"
                      />
                      <div
                        class="d-flex list-item-min-height caption listing-hover pointer"
                        @click="
                          $store.commit('setTaskFilter', {
                            assigned_to: null,
                            page: 1,
                          });
                          searchData(true);
                        "
                        :class="!getSearchedAssignedTo ? 'bg-selected' : ''"
                      >
                        <profileImage
                          v-show="':username'"
                          inline
                          username="All"
                          :size="23"
                          :userProfile="true"
                          :circular="true"
                          class="ml-3 text-light"
                        >
                        </profileImage>
                        <v-list-item-content
                          @click="assignedToDropdown = false"
                          class="ml-2"
                        >
                          All Members
                        </v-list-item-content>
                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-3"
                          v-text="
                            !getSearchedAssignedTo
                              ? 'mdi-check-box-outline'
                              : ''
                          "
                        ></v-icon>
                      </div>
                      <div
                        class="d-flex pointer list-item-min-height caption listing-hover"
                        v-for="member in [getLoggedInUser].concat(getMembers)"
                        :key="member.id"
                        @click="
                          getSearchedAssignedTo
                            ? getSearchedAssignedTo.id == member.id
                              ? ($store.commit('setTaskFilter', {
                                  assigned_to: null,
                                  page: 1,
                                }),
                                searchData(true))
                              : ($store.commit('setTaskFilter', {
                                  assigned_to: member,
                                  page: 1,
                                }),
                                searchData(true))
                            : ($store.commit('setTaskFilter', {
                                assigned_to: member,
                                page: 1,
                              }),
                              searchData(true));
                          assignedToDropdown = false;
                        "
                        :class="
                          getSearchedAssignedTo
                            ? getSearchedAssignedTo.id == member.id
                              ? 'bg-selected'
                              : ''
                            : ''
                        "
                      >
                        <profileImage
                          v-show="member.image ? ':src' : ':username'"
                          :src="member.image"
                          inline
                          :username="member.name ? member.name : member.email"
                          :size="23"
                          :userProfile="true"
                          :circular="true"
                          class="ml-3 text-light"
                        >
                        </profileImage>

                        <v-list-item-content
                          style="max-width: 160px"
                          class="d-inline-block text-truncate ml-2"
                          v-if="member.name"
                        >
                          {{
                            member.id == getLoggedInUser.id
                              ? "ME"
                              : member.name[0].toUpperCase() +
                                member.name.slice(1).toLowerCase()
                          }}</v-list-item-content
                        >
                        <v-list-item-content
                          style="max-width: 160px"
                          class="d-inline-block text-truncate ml-2"
                          v-if="!member.name"
                          >{{ member.email }}</v-list-item-content
                        >
                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-3"
                          v-text="
                            getSearchedAssignedTo
                              ? getSearchedAssignedTo.id == member.id
                                ? 'mdi-check-box-outline'
                                : ''
                              : ''
                          "
                        ></v-icon>
                      </div>

                      <div v-if="searchMember && !getMembers.length">
                        <p class="no-results-found my-1">No results found</p>
                      </div>
                    </v-list>
                  </v-menu>
                </div>
                <div
                  v-if="
                    header.value == 'assigned_by' &&
                    ((getSelectedCompany.role == 'owner' &&
                      getShowAllTasks != 'me') ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        getSelectedCompany.permissions.project &&
                        getShowAllTasks != 'me') ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        !getSelectedCompany.permissions.project &&
                        getShowAllTasks != 'me') ||
                      (getSelectedCompany.role == 'team-manager' &&
                        getShowAllTasks != 'me') ||
                      getSelectedCompany.role == 'employee' ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.project &&
                        !getSelectedCompany.permissions.team_member))
                  "
                >
                  <v-menu
                    v-model="assignedByDropdown"
                    :close-on-content-click="false"
                    offset-y
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="searchMember = null"
                        color="white"
                        v-bind="attrs"
                        v-on="on"
                        depressed
                        class="text-capitalize rounded-0 mr-1 header-dropdown mb-1 mt-2 ml-n2"
                        x-small
                      >
                        {{
                          getSearchedAssignedBy
                            ? getSearchedAssignedBy.name
                              ? getSearchedAssignedBy.name
                              : getSearchedAssignedBy.email
                            : "Members"
                        }}
                        <v-icon small class="pl-3"> mdi-menu-down </v-icon>
                      </v-btn>
                    </template>

                    <v-list max-height="200" class="overflow-scroll">
                      <v-text-field
                        autocomplete="off"
                        prepend-inner-icon="mdi-magnify"
                        background-color="white"
                        placeholder="Search"
                        color="#2a206a"
                        class="pa-1"
                        hide-details
                        solo
                        dense
                        flat
                        autofocus
                        outlined
                        v-model="searchMember"
                      />
                      <div
                        class="d-flex list-item-min-height caption listing-hover pointer"
                        v-for="member in [getLoggedInUser].concat(getMembers)"
                        :key="member.id"
                        @click="
                          getSearchedAssignedBy
                            ? getSearchedAssignedBy.id == member.id
                              ? ($store.commit('setTaskFilter', {
                                  assigned_by: null,
                                  page: 1,
                                }),
                                searchData(true))
                              : ($store.commit('setTaskFilter', {
                                  assigned_by: member,
                                  page: 1,
                                }),
                                searchData(true))
                            : ($store.commit('setTaskFilter', {
                                assigned_by: member,
                                page: 1,
                              }),
                              searchData(true));
                          assignedByDropdown = false;
                        "
                        :class="
                          getSearchedAssignedBy
                            ? getSearchedAssignedBy.id == member.id
                              ? 'bg-selected'
                              : ''
                            : ''
                        "
                      >
                        <profileImage
                          inline
                          :username="member.name ? member.name : member.email"
                          :size="23"
                          :circular="true"
                          class="ml-3 text-light"
                        >
                        </profileImage>
                        <v-list-item-content
                          style="max-width: 160px"
                          class="d-inline-block text-truncate ml-2"
                          v-if="member.name"
                        >
                          {{
                            member.id == getLoggedInUser.id
                              ? "ME"
                              : member.name[0].toUpperCase() +
                                member.name.slice(1).toLowerCase()
                          }}</v-list-item-content
                        >
                        <v-list-item-content
                          style="max-width: 160px"
                          class="d-inline-block text-truncate ml-2"
                          v-if="!member.name"
                          >{{ member.email }}</v-list-item-content
                        >
                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-3"
                          v-text="
                            getSearchedAssignedBy
                              ? getSearchedAssignedBy.id == member.id
                                ? 'mdi-check-box-outline'
                                : ''
                              : ''
                          "
                        ></v-icon>
                      </div>
                      <div v-if="searchMember && !getMembers.length">
                        <p class="no-results-found my-1">No results found</p>
                      </div>
                    </v-list>
                  </v-menu>
                </div>
                <div v-if="header.value == 'project'">
                  <v-menu
                    v-model="projectsDropdown"
                    :close-on-content-click="false"
                    offset-y
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="projectSearch = null"
                        color="white"
                        v-bind="attrs"
                        v-on="on"
                        depressed
                        class="text-capitalize rounded-0 mr-1 header-dropdown mb-1 mt-2"
                        x-small
                      >
                        <span
                          class="d-inline-block text-truncate"
                          style="max-width: 90px"
                        >
                          {{
                            getSearchedProject
                              ? getSearchedProject.name
                              : "Projects"
                          }}
                        </span>
                        <v-icon small class="pl-3"> mdi-menu-down </v-icon>
                      </v-btn>
                    </template>

                    <v-list
                      :class="
                        getSelectedCompany.permissions
                          ? getSelectedCompany.permissions.team_member &&
                            !getSelectedCompany.permissions.project
                            ? 'd-none'
                            : ''
                          : ''
                          ? 'd-none'
                          : ''
                      "
                      max-height="200"
                      class="pointer overflow-scroll"
                    >
                      <v-text-field
                        autocomplete="off"
                        prepend-inner-icon="mdi-magnify"
                        background-color="white"
                        placeholder="Search"
                        color="#2a206a"
                        class="pa-1"
                        hide-details
                        solo
                        dense
                        autofocus
                        outlined
                        v-model="projectSearch"
                      >
                      </v-text-field>
                      <div
                        class="d-flex list-item-min-height caption listing-hover pointer"
                        @click="
                          $store.commit('setTaskFilter', {
                            project_id: null,
                            page: 1,
                          });
                          searchData(true);
                        "
                        :class="!getSearchedProject ? 'bg-selected' : ''"
                      >
                        <profileImage
                          v-show="':username'"
                          inline
                          username="All"
                          :size="23"
                          :userProfile="true"
                          :circular="true"
                          class="ml-3 text-light"
                        >
                        </profileImage>
                        <v-list-item-content
                          @click="projectsDropdown = false"
                          class="ml-2"
                        >
                          All Projects
                        </v-list-item-content>
                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-3"
                          v-text="
                            !getSearchedProject ? 'mdi-check-box-outline' : ''
                          "
                        ></v-icon>
                      </div>
                      <div
                        v-for="project in projectsList"
                        :key="project.id"
                        class="list-item-min-height caption listing-hover d-flex pointer"
                        @click="
                          getSearchedProject
                            ? getSearchedProject.id == project.id
                              ? ($store.commit('setTaskFilter', {
                                  project_id: null,
                                  page: 1,
                                }),
                                searchData(true))
                              : ($store.commit('setTaskFilter', {
                                  project_id: project.id,
                                  page: 1,
                                }),
                                searchData(true))
                            : ($store.commit('setTaskFilter', {
                                project_id: project.id,
                                page: 1,
                              }),
                              searchData(true));
                          projectsDropdown = false;
                        "
                        :class="
                          getSearchedProject
                            ? getSearchedProject.id == project.id
                              ? 'bg-selected'
                              : ''
                            : ''
                        "
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
                          ><span
                            style="width: 30px"
                            class="d-inline-block text-truncate ml-2 text-capitalize"
                          >
                            {{ project.name }}
                          </span>
                        </v-list-item-content>

                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-3"
                          v-text="
                            getSearchedProject
                              ? getSearchedProject.id == project.id
                                ? 'mdi-check-box-outline'
                                : ''
                              : ''
                          "
                        ></v-icon>
                      </div>
                      <div v-if="projectSearch && !projectsList.length">
                        <p class="no-results-found my-1">No results found</p>
                      </div>
                    </v-list>
                  </v-menu>
                </div>
                <div v-if="header.value == 'title'" class="sub-header">
                  <div class="inputContainer">
                    <v-icon small class="ml-1 mt-3"> mdi-magnify </v-icon>
                    <input
                      autocomplete="off"
                      v-model="searchedTitle"
                      type="text"
                      size="15"
                      id="title-search"
                      class="header-search-input-field mb-1 mt-2 rounded-2"
                      placeholder="Search ..."
                      @keyup.enter="searchData"
                    />
                  </div>
                </div>
                <div v-if="header.value == 'status'" class="sub-header">
                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        color="white"
                        v-bind="attrs"
                        v-on="on"
                        depressed
                        class="text-capitalize rounded-0 mr-1 header-dropdown mb-1 mt-2"
                        x-small
                      >
                        <span class="text-capitalize">
                          {{ getSearchedStatus ? getSearchedStatus : "Status" }}
                        </span>
                        <v-icon small class="pl-3"> mdi-menu-down </v-icon>
                      </v-btn>
                    </template>

                    <v-list
                      max-height="200"
                      class="pointer overflow-scroll"
                      width="150px"
                    >
                      <div
                        v-for="status in statusList"
                        :key="status.text"
                        class="status-list-min-height caption listing-hover d-flex pointer"
                        @click="
                          getSearchedStatus == status.text
                            ? $store.commit('setTaskFilter', {
                                status: 'pending',
                                page: 1,
                              })
                            : $store.commit('setTaskFilter', {
                                status: status.text,
                                page: 1,
                              });
                          searchData(true);
                        "
                        :class="
                          getSearchedStatus
                            ? getSearchedStatus == status.text
                              ? 'bg-selected'
                              : ''
                            : ''
                        "
                      >
                        <v-list-item-content>
                          <span class="ml-2 text-capitalize">
                            {{ status.text }}
                          </span>
                        </v-list-item-content>

                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-1"
                          v-text="
                            getSearchedStatus
                              ? getSearchedStatus == status.text
                                ? 'mdi-check-box-outline'
                                : ''
                              : ''
                          "
                        ></v-icon>
                      </div>
                    </v-list>
                  </v-menu>
                </div>
                <div v-if="header.value == 'created_at'" class="sub-header">
                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <input
                        v-model="getTaskDateFilter"
                        readonly
                        type="text"
                        v-on="on"
                        v-bind="attrs"
                        size="16"
                        class="dateRangesearch-input-field pointer mb-1 mt-2 rounded-2"
                        @keyup.enter="searchData(true)"
                      />
                    </template>
                    <v-list>
                      <v-list-item
                        v-for="list of dropdownList"
                        :key="list.text"
                        class="date-range-dropdown pointer d-flex"
                        :class="
                          getTaskDateFilter == list.text ? 'bg-selected' : ''
                        "
                        @click="$store.commit('setTaskDateFilter', list.text)"
                      >
                        <v-list-item-title class="date-range-text-color">{{
                          list.text
                        }}</v-list-item-title>
                        <v-icon
                          small
                          color="#1cc283"
                          v-if="getTaskDateFilter == list.text"
                        >
                          mdi-check-box-outline</v-icon
                        >
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </td>
            </tr>
          </template>
          <!-------------------------------->
          <!-- Item Slots -->
          <!-- Icon for expanding -->
          <template
            v-slot:[`item.data-table-expand`]="{ expand, isExpanded, item }"
          >
            <div class="d-flex align-center">
              <v-btn
                v-if="item.interval.length"
                class="expanding-chevron-bg px-0"
                :class="isExtension ? 'mr-2' : ''"
                icon
                x-small
                @click="
                  expandedTask = item;
                  timeEntryMenu = true;
                  expand(!isExpanded);
                "
              >
                <v-icon color="#1CC283">{{
                  !isExpanded ? "mdi-chevron-right" : "mdi-chevron-down"
                }}</v-icon>
              </v-btn>
            </div>
          </template>
          <!-- Intervals -->
          <template v-slot:expanded-item="{ item }">
            <td
              v-show="item.interval.length"
              :class="{
                'ma-0 pa-0': true,
              }"
              class="pa-0 border-0 white"
              colspan="12"
            >
              <!-- Child Table -->
              <v-data-table
                id="v-data-table-task-child"
                :headers="headers"
                hide-default-header
                hide-default-footer
                :items="item.interval"
                class="elevation-1 theme-light-bg y-scroll child-table"
              >
                <!-- Child:Expand Icon -->
                <template v-slot:[`item.data-table-expand`]="{}">
                  <v-btn class="px-0" icon x-small
                    ><v-icon color="transparent"
                      >mdi-chevron-down</v-icon
                    ></v-btn
                  >
                </template>
                <!-- Child Table: Assigned To -->
                <template v-slot:[`item.members`]="{}">
                  <div
                    style="min-width: 136px"
                    class="disable-cursor d-flex justify-start ml-2"
                  >
                    <div class="d-flex">
                      <profileImage
                        v-show="getLoggedInUser.image ? ':src' : ':username'"
                        :src="getLoggedInUser.image"
                        inline
                        :username="getLoggedInUser.name"
                        :size="30"
                        :userProfile="true"
                        :circular="true"
                        class="my-2 text-light d-inline mr-2"
                      >
                      </profileImage>
                      <span
                        style="max-width: 90px"
                        class="mt-3 d-inline-block text-truncate text-capitalize"
                        >{{ getLoggedInUser.name }}</span
                      >
                    </div>
                  </div>
                </template>
                <!-- Child Table: Assigned By  -->
                <template v-slot:[`item.assigned_by`]="{}">
                  <div
                    v-if="
                      (getSelectedCompany.role == 'owner' &&
                        getShowAllTasks != 'me') ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        getSelectedCompany.permissions.project &&
                        getShowAllTasks != 'me') ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        !getSelectedCompany.permissions.project &&
                        getShowAllTasks != 'me') ||
                      (getSelectedCompany.role == 'team-manager' &&
                        getShowAllTasks != 'me') ||
                      getSelectedCompany.role == 'employee' ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.project &&
                        !getSelectedCompany.permissions.team_member)
                    "
                    class="disable-cursor d-flex justify-start"
                  >
                    <div class="d-flex">
                      <profileImage
                        v-show="getLoggedInUser.image ? ':src' : ':username'"
                        :src="getLoggedInUser.image"
                        inline
                        :username="getLoggedInUser.name"
                        :userProfile="true"
                        :size="30"
                        :circular="true"
                        class="my-2 text-light d-inline mr-2"
                      >
                      </profileImage>
                      <span
                        style="max-width: 90px"
                        class="mt-3 d-inline-block text-truncate text-capitalize"
                        >{{ getLoggedInUser.name }}</span
                      >
                    </div>
                  </div>
                </template>
                <!-- Child Table: Project Name -->
                <template v-slot:[`item.project`]="{}">
                  <div style="min-width: 80px" class="d-flex justify-start">
                    <span
                      style="max-width: 120px"
                      class="d-inline-block text-truncate text-capitalize"
                      :class="
                        !item.project
                          ? 'font-italic grey--text caption px-1'
                          : ''
                      "
                      >{{
                        item.project ? item.project.name : "No project"
                      }}</span
                    >
                  </div>
                </template>
                <!-- Child Table: Title -->
                <template v-slot:[`item.title`]="{}">
                  <div
                    style="max-width: 300px; min-width: 280px"
                    class="d-flex justify-start disable-cursor"
                  >
                    <span
                      class="d-inline-block text-truncate text-capitalize pl-3"
                      :style="
                        $vuetify.breakpoint.xl
                          ? 'max-width:100%'
                          : 'max-width:296px'
                      "
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
                <!-- Child Table: Due Date -->
                <template v-slot:[`item.due_date`]="{}">
                  <div class="d-flex justify-end disable-cursor">
                    <v-icon color="#E0E0E0">mdi-calendar</v-icon>
                    <v-chip
                      v-if="!item.due_date"
                      class="disable-cursor due_date-chip d-flex justify-center"
                      color="grey lighten-2"
                      :class="!item.due_date ? 'font-italic grey--text' : ''"
                      label
                      small
                    >
                      <span class="caption italic-font">No due date</span>
                    </v-chip>
                    <v-chip
                      v-if="item.due_date"
                      class="disable-cursor due_date-chip d-flex justify-center"
                      label
                      small
                      dark
                      :color="
                        item.due_date === getCurrentDate()
                          ? 'yellow-chip-color'
                          : item.due_date < getCurrentDate()
                          ? 'red-chip-color'
                          : 'green-chip-color'
                      "
                    >
                      <span v-if="item.due_date === getCurrentDate()">
                        Today
                      </span>
                      <span
                        v-else-if="
                          item.due_date === getTommorrowDate(item.due_date)
                        "
                      >
                        Tommorow
                      </span>
                      <span v-else>
                        {{ getDueDate(item.due_date) }}
                      </span>
                    </v-chip>
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
                                @click="
                                  selectedInterval = Object.assign({}, item);
                                  timeEntryMenu = true;
                                "
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
                            <v-card
                              :width="
                                $vuetify.breakpoint.xl || $vuetify.breakpoint.lg
                                  ? '575px'
                                  : '380px'
                              "
                              outlined
                              tile
                              v-if="timeEntryMenu"
                            >
                              <v-card-text class="black--text">
                                <div class="d-flex align-center">
                                  <!-- Icons -->
                                  <div class="d-flex flex-column mx-1">
                                    <v-icon class="my-2"
                                      >mdi-calendar-outline</v-icon
                                    >
                                    <v-icon color="black"
                                      >mdi-clock-outline</v-icon
                                    >
                                  </div>
                                  <!-- Chips -->
                                  <div>
                                    <!-- Date Chips -->
                                    <div class="d-flex align-center my-1">
                                      <!-- start date -->
                                      <v-chip
                                        label
                                        class="font-weight-light date-time-chip light-purple-bg py-1 px-2 pointer"
                                      >
                                        {{ startDate }}
                                      </v-chip>
                                      <div class="mx-1">-</div>
                                      <!-- end date -->
                                      <v-chip
                                        label
                                        class="font-weight-light date-time-chip light-purple-bg py-1 px-2 pointer"
                                      >
                                        {{ endDate }}
                                      </v-chip>
                                    </div>
                                    <!-- Time Chips -->
                                    <div class="d-flex align-center">
                                      <!-- Start Time -->
                                      <input
                                        style="border-radius: 5px; width"
                                        ref="newStartTime"
                                        v-model="newStartTime"
                                        class="d-block date-time-chip font-weight-light light-purple-bg"
                                        :class="
                                          $vuetify.breakpoint.xs
                                            ? 'time-style-sm'
                                            : 'time-style'
                                        "
                                      />
                                      <div class="mx-1">-</div>
                                      <!-- Stop Time -->
                                      <input
                                        style="border-radius: 5px"
                                        ref="newEndTime"
                                        v-model="newEndTime"
                                        :class="
                                          $vuetify.breakpoint.xs
                                            ? 'time-style-sm'
                                            : 'time-style'
                                        "
                                        class="d-block date-time-chip light-purple-bg font-weight-light"
                                      />
                                    </div>
                                  </div>
                                  <!-- Labels -->
                                  <div class="d-flex flex-column mx-3">
                                    <span
                                      class="caption italic grey--text mb-3 mt-1"
                                      >(From - To)</span
                                    >
                                    <span class="caption italic grey--text"
                                      >(Start Time - End Time)</span
                                    >
                                  </div>
                                </div>
                                <!-- Range slider -->
                                <v-range-slider
                                  hide-details
                                  v-model="timeEntryRange"
                                  @end="calculateInterval"
                                  :max="1440"
                                  :step="1"
                                  :min="0"
                                  color="#1CC283"
                                  track-color="#E6E6E6"
                                  track-fill-color="#9185E0"
                                ></v-range-slider>
                                <RangeSliderLabels />
                                <div class="d-flex mt-2 align-center">
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    @click="editTimeEntry(item)"
                                    small
                                    class="btn-success white--text"
                                    >Save
                                    <v-progress-circular
                                      v-if="editTimeEntryLoader"
                                      indeterminate
                                      class="ml-1"
                                      :size="20"
                                    ></v-progress-circular>
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
                <!-- Child Table: Status  -->
                <template v-slot:[`item.status`]="{}">
                  <div class="disable-cursor">
                    <v-chip
                      class="disable-cursor due_date-chip d-flex px-0 justify-center font-weight-bold"
                      label
                      small
                      dark
                      :class="
                        item.status === 'pending'
                          ? 'yellow-chip-color'
                          : item.status === 'active'
                          ? 'blue-chip-color'
                          : item.status === 'overdue'
                          ? 'red-chip-color'
                          : 'green-chip-color'
                      "
                    >
                      <span class="text-capitalize px-0">
                        <span> {{ item.status }}</span>
                      </span>
                    </v-chip>
                  </div>
                </template>
                <!-- Child Table: Duration  -->
                <template v-slot:[`item.members.duration`]="{ item }">
                  <div class="d-flex disable-cursor mr-2">
                    <span>
                      {{
                        item
                          ? item.duration
                            ? getDuration(item.duration).slice(0, 5)
                            : ""
                          : ""
                      }}
                    </span>
                  </div>
                </template>
                <!-- Child Table: Actions  -->
                <template v-slot:[`item.actions`]="{ item }">
                  <div style="min-width: 108px" class="d-flex justify-end mr-2">
                    <v-icon
                      @click="deleteTimeEntry(item)"
                      class="dark-purple-text"
                      >mdi-delete-outline</v-icon
                    >
                  </div>
                </template>
              </v-data-table>
            </td>
          </template>
          <!-- Assigned to -->
          <template v-slot:[`item.members`]="{ item }">
            <div
              v-if="
                getSelectedCompany.role == 'owner' ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  getSelectedCompany.permissions.project) ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project) ||
                getSelectedCompany.role == 'team-manager'
              "
              @click="openAssignedToMenu($event)"
              class="align-center d-flex justify-start px-0"
            >
              <div>
                <v-list v-if="item.members" class="transparent">
                  <v-list-item
                    class="pa-0 pointer list-item-min-height"
                    v-for="member in item.members.slice(0, 1)"
                    @click="memberSearch = null"
                    :key="member.email"
                  >
                    <v-tooltip
                      content-class="ma-0 pa-0 tooltip-opacity"
                      left
                      open-delay="200"
                    >
                      <template v-slot:activator="{ on }">
                        <div class="d-flex" v-on="on">
                          <profileImage
                            v-show="member.image ? ':src' : ':username'"
                            :src="member.image"
                            :userProfile="true"
                            inline
                            :username="member.name ? member.name : member.email"
                            :size="30"
                            :circular="true"
                            class="my-2 text-light d-inline mr-2"
                          >
                          </profileImage>
                          <profileImage
                            v-if="item.members.length > 1"
                            inline
                            :username="`+${item.members.length - 1}`"
                            :size="30"
                            :userProfile="true"
                            :circular="true"
                            class="my-2 text-light d-inline ml-n8 mr-2"
                          >
                          </profileImage>
                        </div>
                      </template>
                      <!-- Display User info on hover -->
                      <div v-if="getAllMembers">
                        <UserInfo
                          :image="member.image"
                          :name="member.name ? member.name : ''"
                          :email="member.email ? member.email : ''"
                          :role="
                            getAllMembers.find((user) => {
                              return user.id == member.id;
                            })
                              ? getAllMembers.find((user) => {
                                  return user.id == member.id;
                                }).role
                              : ''
                          "
                          :designation="
                            getAllMembers.find((user) => {
                              return user.id == member.id;
                            })
                              ? getAllMembers.find((user) => {
                                  return user.id == member.id;
                                }).designation
                              : ''
                          "
                          :department="
                            getAllMembers.find((user) => {
                              return user.id == member.id;
                            })
                              ? getAllMembers.find((user) => {
                                  return user.id == member.id;
                                }).department
                              : ''
                          "
                        />
                      </div>
                    </v-tooltip>
                    <v-list-item-content>
                      <!-- username -->
                      <span
                        style="max-width: 88px"
                        class="d-inline-block text-truncate"
                      >
                        {{
                          member.name
                            ? member.name[0].toUpperCase() +
                              member.name.slice(1).toLowerCase()
                            : member.email
                        }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </template>
          <!-- Assigned By -->
          <template v-slot:[`item.assigned_by`]="{ item }">
            <div
              v-if="
                (getSelectedCompany.role == 'owner' &&
                  getShowAllTasks != 'me') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  getSelectedCompany.permissions.project &&
                  getShowAllTasks != 'me') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project &&
                  getShowAllTasks != 'me') ||
                (getSelectedCompany.role == 'team-manager' &&
                  getShowAllTasks != 'me') ||
                getSelectedCompany.role == 'employee' ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.project &&
                  !getSelectedCompany.permissions.team_member)
              "
              class="text-caption mt-1"
            >
              <div class="align-center d-flex text-truncate">
                <v-tooltip content-class="ma-0 pa-0 tooltip-opacity" left>
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <profileImage
                        v-show="item.assigned_by.image ? ':src' : ':username'"
                        :src="item.assigned_by.image"
                        inline
                        :username="item.assigned_by.name"
                        :size="30"
                        :userProfile="true"
                        :circular="true"
                        class="my-2 text-light d-inline"
                      >
                      </profileImage>
                    </div>
                  </template>
                  <!-- Display User info on hover -->
                  <UserInfo
                    :image="item.assigned_by.image"
                    :name="item.assigned_by.name"
                    :email="item.assigned_by.email"
                    :role="
                      getAllMembers.find((user) => {
                        return user.hash_id == item.assigned_by.id;
                      })
                        ? getAllMembers.find((user) => {
                            return user.hash_id == item.assigned_by.id;
                          }).role
                        : ''
                    "
                    :designation="
                      getAllMembers.find((user) => {
                        return user.hash_id == item.assigned_by.id;
                      })
                        ? getAllMembers.find((user) => {
                            return user.hash_id == item.assigned_by.id;
                          }).designation
                        : ''
                    "
                    :department="
                      getAllMembers.find((user) => {
                        return user.hash_id == item.assigned_by.id;
                      })
                        ? getAllMembers.find((user) => {
                            return user.hash_id == item.assigned_by.id;
                          }).department
                        : ''
                    "
                  />
                </v-tooltip>
                <span
                  class="mx-2 text-truncate"
                  style="max-width: 90px"
                  v-if="item.assigned_by"
                >
                  {{
                    item.assigned_by.name[0].toUpperCase() +
                    item.assigned_by.name.slice(1).toLowerCase()
                  }}
                </span>
                <span class="mt-3" v-else> Self Assigned </span>
              </div>
            </div>
          </template>
          <!--Project name-->
          <template class="pointer" v-slot:[`item.project`]="{ item }">
            <div
              @click="!projectMenu ? openProjectMenu($event) : () => {}"
              class="d-flex mx-0"
            >
              <span
                v-if="
                  item.assigned_by.id != getLoggedInUser.id &&
                  getSelectedCompany.role == 'employee'
                "
                class="text-capitalize black--text d-inline-block text-truncate"
                style="max-width: 98px"
                :class="[
                  { 'grey--text font-italic': !item.project },
                  item.assigned_by.id != getLoggedInUser.id &&
                  getSelectedCompany.role == 'employee'
                    ? ''
                    : 'project-name-on-hover',
                ]"
                >{{ item.project ? item.project.name : "No Project" }}</span
              >
              <v-btn v-else @click="projectBtn = true" class="px-0" plain>
                <v-icon small v-show="!item.project" class="logo-text-color">
                  mdi-plus-circle-outline
                </v-icon>
                <v-tooltip bottom color="#302277">
                  <template v-slot:activator="{ on }">
                    <span
                      @click="
                        editIcon = false;
                        projectBtn = true;
                        projectSearch = null;
                        searchProject = null;
                      "
                      v-on="on"
                      class="text-capitalize black--text d-inline-block text-truncate project-name-on-hover"
                      style="max-width: 120px"
                      >{{
                        item.project && getProject(item.project.id)
                          ? getProject(item.project.id).name
                          : "Project"
                      }}</span
                    >
                  </template>
                  <span class="text-capitalize">{{
                    item.project ? item.project.name : "Add Project"
                  }}</span>
                </v-tooltip>
              </v-btn>
            </div>
          </template>
          <!--Assigned Date-->
          <template v-slot:[`item.created_at`]="{ item }">
            <div
              class="text-caption mt-1 pointer d-flex justify-start"
              v-if="item.created_at"
              @click="openCommentModal(item)"
            >
              <template>
                <v-tooltip bottom color="#302277">
                  <template v-slot:activator="{ on: tooltip }">
                    <span color="primary" dark v-on="{ ...tooltip }">
                      {{ getAssignedDate(item.created_at) }}
                    </span>
                  </template>
                  <span>{{ getAssignedDateFormat(item.created_at) }}</span>
                </v-tooltip>
              </template>
            </div>
          </template>
          <!-- Due Date -->
          <template v-slot:[`item.due_date`]="{ item }">
            <div class="d-flex pointer justify-start">
              <v-menu transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-on="on"
                    v-bind="attrs"
                    @click="selectedTaskDate = item.task_id"
                    :class="
                      item.due_date === getCurrentDate()
                        ? 'yellow-chip'
                        : item.due_date === getTommorrowDate()
                        ? 'green-chip'
                        : item.due_date < getCurrentDate()
                        ? 'red-chip'
                        : !item.due_date
                        ? 'no-date'
                        : 'green-chip'
                    "
                    >mdi-calendar</v-icon
                  >
                  <div v-show="item.due_date">
                    <div
                      v-on="on"
                      @click="selectedTaskDate = item.task_id"
                      class="text-caption"
                    >
                      <v-tooltip bottom color="#302277">
                        <template v-slot:activator="{ on: tooltip }">
                          <v-chip
                            class="due_date-chip d-flex justify-center"
                            label
                            small
                            v-on="{ ...tooltip }"
                            dark
                            :class="
                              item.assigned_by.id != getLoggedInUser.id &&
                              getSelectedCompany.role == 'employee'
                                ? ''
                                : 'pointer'
                            "
                            :color="
                              item.due_date === getCurrentDate()
                                ? 'yellow-chip-color'
                                : item.due_date < getCurrentDate()
                                ? 'red-chip-color'
                                : 'green-chip-color'
                            "
                          >
                            <span v-if="item.due_date === getCurrentDate()">
                              Today
                            </span>
                            <span
                              v-else-if="
                                item.due_date ===
                                getTommorrowDate(item.due_date)
                              "
                            >
                              Tommorow
                            </span>
                            <span v-else>
                              {{ getDueDate(item.due_date) }}
                            </span>
                          </v-chip>
                        </template>
                        <span style="width: 116px">{{
                          getDueDateFormat(item.due_date)
                        }}</span>
                      </v-tooltip>
                    </div>
                  </div>
                  <span
                    @click="openCommentModal(item)"
                    class="mx-1 grey--text font-italic caption"
                    v-show="!item.due_date"
                    >No Due Date</span
                  >
                </template>
                <v-date-picker
                  no-title
                  v-if="
                    selectedTaskDate == item.task_id &&
                    (getSelectedCompany.role != 'employee' ||
                      item.assigned_by.id == getLoggedInUser.id)
                  "
                  v-model="date"
                  color="#2a206a"
                  @input="updateDueDate(date, item), (dateMenu = false)"
                ></v-date-picker>
              </v-menu>
            </div>
          </template>
          <!-- Start Time --- End Time -->
          <template
            class="d-flex pointer align-center justify-start"
            v-slot:[`item.interval`]="{ item }"
          >
            <v-tooltip v-if="item.interval.length" bottom color="#302277">
              <template v-slot:activator="{ on }">
                <div
                  @click="openCommentModal(item)"
                  v-on="on"
                  v-if="item.interval.length"
                  class="d-flex align-center"
                >
                  <div>
                    {{
                      item.interval
                        ? item.interval[0]
                          ? item.interval[0].start_time
                            ? item.interval[0].start_time.slice(11, 16)
                            : ""
                          : ""
                        : ""
                    }}
                  </div>
                  -
                  <div class="mx-1">
                    {{
                      item.interval
                        ? item.interval[item.interval.length - 1]
                          ? item.interval[item.interval.length - 1].end_time
                            ? item.interval[
                                item.interval.length - 1
                              ].end_time.slice(11, 16)
                            : ""
                          : ""
                        : ""
                    }}
                  </div>
                </div>
              </template>
              <span
                v-if="
                  item.interval[item.interval.length - 1].start_time &&
                  item.interval[0].end_time
                "
              >
                {{
                  getAssignedDateFormat(
                    item.interval[0].start_time.slice(0, 11)
                  )
                }}
                To
                {{
                  item.interval[item.interval.length - 1].end_time
                    ? getAssignedDateFormat(
                        item.interval[item.interval.length - 1].end_time.slice(
                          0,
                          11
                        )
                      )
                    : ""
                }}
              </span>
              <span v-else>
                {{
                  getAssignedDateFormat(
                    item.interval[0].start_time.slice(0, 11)
                  )
                }}
              </span>
            </v-tooltip>
          </template>
          <!-- Status -->
          <template
            class="d-flex align-center pointer justify-start"
            v-slot:[`item.status`]="{ item }"
          >
            <div @click="openCommentModal(item)" class="px-0">
              <v-chip
                :id="'status-' + item.task_id"
                class="due_date-chip px-0 d-flex justify-center font-weight-bold"
                label
                small
                :class="
                  item.overdue && item.status != 'completed'
                    ? 'red-chip-color'
                    : item.status === 'active'
                    ? 'blue-chip-color'
                    : item.status === 'pending'
                    ? 'yellow-chip-color'
                    : 'green-chip-color'
                "
              >
                <span class="text-capitalize">
                  <v-progress-circular
                    v-if="updateStatusLoader && setTaskId == item.task_id"
                    indeterminate
                    class="ml-1"
                    :size="15"
                    :width="2"
                  ></v-progress-circular>
                  <span v-else>
                    {{
                      item.overdue && item.status != "completed"
                        ? "Overdue"
                        : item.status
                    }}</span
                  >
                </span>
              </v-chip>
              <v-tooltip
                v-if="item.completed_at"
                :activator="'#' + 'status-' + item.task_id"
                bottom
                color="#302277"
              >
                <span>{{ getCompletedDateFormat(item.completed_at) }}</span>
              </v-tooltip>
            </div>
          </template>
          <!-- Durations -->
          <template class="px-0" v-slot:[`item.members.duration`]="{ item }">
            <div class="d-flex align-center px-0 pointer">
              <v-menu
                v-if="getSelectedCompany.role != 'employee'"
                max-width="200px"
                max-height="150px"
                content-class="pa-0 bg-color"
                offset-y
                bottom
                nudge-left="88px"
              >
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-tooltip bottom down color="#302277">
                      <template v-slot:activator="{ on }">
                        <div v-on="on" class="mr-2">
                          {{ totalDuration(item).slice(0, 5) }}
                        </div>
                      </template>
                      <span>{{ "HH:MM" }}</span>
                    </v-tooltip>
                  </div>
                </template>

                <div
                  class="left-pannel-bg-color font-weight-bold w-100 white--text py-2 px-3"
                >
                  Durations
                </div>
                <div
                  class="d-flex align-center py-0 px-3 justify-start white"
                  v-for="member in item.members"
                  :key="member.id"
                >
                  <profileImage
                    inline
                    v-show="member.image ? ':src' : ':username'"
                    :src="member.image"
                    :username="member.name ? member.name : member.email"
                    :size="30"
                    :userProfile="true"
                    :circular="true"
                    class="my-2 text-light d-inline mr-2"
                  >
                  </profileImage>
                  <span
                    max-width="100px"
                    class="d-inline-block caption text-capitalize text-truncate mr-1"
                    >{{ member.name ? member.name : member.email }} :</span
                  >
                  <v-spacer></v-spacer>
                  <span class="caption d-inline-block">
                    {{
                      member
                        ? member.id == getLoggedInUser.id
                          ? totalDuration(item)
                          : format(member.duration)
                        : ""
                    }}
                  </span>
                </div>
              </v-menu>
              <div v-else class="mr-2">
                {{ totalDuration(item).slice(0, 5) }}
              </div>
            </div>
          </template>
          <!-- Play/Pause actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <div
              class="d-flex align-center"
              :class="$vuetify.breakpoint.xs ? 'my-5' : ''"
            >
              <v-layout>
                <div
                  :style="!isExtension ? 'min-width: 110px' : ''"
                  class="d-flex align-center justify-end"
                >
                  <!-- play/pause icon div -->
                  <div
                    v-if="
                      item.members.find((item) => {
                        return item.id == getLoggedInUser.id;
                      })
                    "
                  >
                    <v-tooltip bottom color="#302277">
                      <template v-slot:activator="{ on }">
                        <v-icon
                          color="#1cc283"
                          class="my-1"
                          v-on="on"
                          :class="
                            getActiveTask &&
                            getActiveTask.task_id == item.task_id
                              ? 'stop-icon'
                              : 'play-icon'
                          "
                          @click="
                            getActiveTask &&
                            getActiveTask.task_id == item.task_id
                              ? stopTask()
                              : playTask(item)
                          "
                          >{{
                            getActiveTask &&
                            getActiveTask.task_id == item.task_id
                              ? "mdi-pause-circle-outline"
                              : "mdi-play-circle-outline"
                          }}</v-icon
                        >
                      </template>
                      <span>{{
                        getActiveTask && getActiveTask.task_id == item.task_id
                          ? "Stop Task"
                          : "Play Task"
                      }}</span>
                    </v-tooltip>
                  </div>
                  <div class="d-flex align-center" v-if="!isExtension">
                    <!-- comment icon -->
                    <v-badge
                      :content="item.comments_count"
                      v-if="item.comments_count"
                      color="green"
                      overlap
                    >
                      <img
                        :id="'comment-' + item.task_id"
                        @click="
                          (item.comments_count = 0), openCommentModal(item)
                        "
                        height="24px"
                        width="24px"
                        class="logo-text-color pointer mx-1"
                        :src="comment_icon"
                        alt="comment icon"
                      />
                    </v-badge>
                    <img
                      v-else
                      @click="(item.comments_count = 0), openCommentModal(item)"
                      height="24px"
                      width="24px"
                      class="logo-text-color pointer mx-1"
                      :src="comment_icon"
                      alt="comment icon"
                    />
                    <!---Make task Status Completed-------->
                    <v-tooltip
                      bottom
                      v-if="
                        item.status == 'pending' ||
                        item.status == 'active' ||
                        item.status == 'overdue'
                      "
                      color="#302277"
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon
                          color="#1cc283"
                          :disabled="
                            (setTaskId == item.task_id &&
                              disableStatusIcon == true) ||
                            (getSelectedCompany.role == 'employee' &&
                              item.assigned_by.id != getLoggedInUser.id)
                          "
                          v-on="on"
                          class="pointer ml-1"
                          @click="
                            (setTaskStatus = 'completed'),
                              (setTaskId = item.task_id),
                              updateTaskStatus(item)
                          "
                          >mdi-checkbox-blank-outline</v-icon
                        >
                      </template>
                      <span>Mark as Complete</span>
                    </v-tooltip>
                    <!---Make task Status Incompleted-------->
                    <v-tooltip bottom v-else color="#302277">
                      <template v-slot:activator="{ on }">
                        <v-icon
                          v-on="on"
                          :disabled="
                            (setTaskId == item.task_id &&
                              disableStatusIcon == true) ||
                            (getSelectedCompany.role == 'employee' &&
                              item.assigned_by.id != getLoggedInUser.id)
                          "
                          color="#13865a "
                          class="pointer ml-1"
                          @click="
                            (setTaskId = item.task_id), checkTaskStatus(item)
                          "
                          >mdi-checkbox-marked</v-icon
                        >
                      </template>
                      <span>Mark as Incomplete</span>
                    </v-tooltip>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          class="logo-text-color"
                          icon
                          small
                          v-bind="attrs"
                          v-on="on"
                        >
                          <v-icon class="logo-text-color">
                            mdi-dots-vertical
                          </v-icon>
                        </v-btn>
                      </template>

                      <v-list
                        max-height="200"
                        class="pointer overflow-scroll pa-0"
                        width="70px"
                      >
                        <div
                          v-if="item.assigned_by.id == getLoggedInUser.id"
                          @click="deleteTaskEntry(item)"
                          class="d-flex status-list-min-height caption listing-hover pointer"
                        >
                          <v-list-item-content
                            class="d-flex justify-start ml-2"
                          >
                            Delete
                          </v-list-item-content>
                        </div>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </v-layout>
              <v-menu
                v-if="isExtension"
                content-class="bg-color"
                offset-y
                :close-on-content-click="false"
              >
                <!-- member btn for medium screens and up -->
                <template v-slot:activator="{ on }">
                  <v-icon color="" v-on="on">mdi-dots-vertical</v-icon>
                </template>
                <v-list class="pointer">
                  <div
                    @click="openCommentModal(item)"
                    class="py-2 px-3 listing-hover"
                  >
                    Add Comments
                  </div>
                  <div
                    @click="
                      (setTaskStatus = 'completed'),
                        (setTaskId = item.task_id),
                        updateTaskStatus(item)
                    "
                    class="py-2 px-3 listing-hover"
                  >
                    Mark as completed
                  </div>
                  <div
                    @click="deleteTaskEntry(item)"
                    class="py-2 px-3 listing-hover"
                  >
                    Delete
                  </div>
                </v-list>
              </v-menu>
            </div>
          </template>
          <!-- Task Title -->
          <template v-slot:[`item.title`]="{ item }">
            <v-hover v-slot="{ hover }">
              <div
                :style="isExtension ? 'max-width: 220px' : 'max-width: 280px'"
                class="d-flex d-inline-block align-center"
                :id="'title-' + item.task_id"
              >
                <v-icon
                  @click="
                    selectTask(item);
                    taskTitle = item.title;
                  "
                  v-show="
                    hover &&
                    !taskTitle &&
                    (item.assigned_by.id == getLoggedInUser.id ||
                      getSelectedCompany.role != 'employee')
                  "
                  size="15"
                  >mdi-pencil</v-icon
                >
                <v-text-field
                  autocomplete="off"
                  autofocus
                  v-model="taskTitle"
                  outlined
                  dense
                  hide-details=""
                  color="#2a206a"
                  placeholder="Add Title"
                  v-if="
                    selectedTask &&
                    selectedTask.task_id == item.task_id &&
                    taskTitle &&
                    (getSelectedCompany.role != 'employee' ||
                      item.assigned_by.id == getLoggedInUser.id)
                  "
                  @keydown.enter="editTaskTitle(item)"
                  @blur="selectedTask = null"
                  @keydown.esc="selectedTask = null"
                >
                  <template v-slot:append>
                    <v-icon color="green" @click="editTaskTitle(item)">
                      mdi-check
                    </v-icon>
                  </template>
                </v-text-field>
                <p
                  v-else
                  :style="isExtension ? 'max-width: 220px' : 'max-width: 280px'"
                  @click="openCommentModal(item)"
                  :class="[
                    { 'thin red--text font-italic': !item.title },
                    item.assigned_by.id != getLoggedInUser.id &&
                    getSelectedCompany.role == 'employee'
                      ? ''
                      : 'pointer',
                  ]"
                  class="d-flex align-center w-100 ml-2 ma-0"
                >
                  <v-tooltip bottom color="#302277">
                    <template v-slot:activator="{ on }">
                      <span
                        class="d-inline-block text-truncate text-capitalize"
                        :style="
                          $vuetify.breakpoint.xl
                            ? 'max-width:300px'
                            : 'max-width: 300px'
                        "
                        v-on="on"
                      >
                        {{ item.title ? item.title : "no title" }}
                      </span>
                    </template>
                    <span
                      class="d-inline-block text-capitalize"
                      :style="
                        $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                          ? 'max-width: 300px;word-wrap:break-word;'
                          : 'max-width:500px;word-wrap:break-word;'
                      "
                    >
                      <p>{{ item.title ? item.title : "no title" }}</p>
                    </span>
                  </v-tooltip>
                </p>
              </div>
            </v-hover>
          </template>
        </v-data-table>
      </div>
      <!-- Pagination -->
      <div
        class="caption d-flex w-100 align-center"
        :class="[
          { 'mx-3': isExtension },
          $vuetify.breakpoint.xs ? 'px-1  my-2' : 'px-4',
        ]"
      >
        <div class="d-flex">
          <span
            class="my-2"
            :class="
              $vuetify.breakpoint.xs ? 'v-selector-text-sm' : 'v-selector-text'
            "
            >View:</span
          >
          <div
            :style="
              isExtension
                ? 'width: 65px'
                : $vuetify.breakpoint.xs
                ? 'width: 55px;'
                : 'width: 72px;'
            "
            class="pa-0"
            :cols="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm ? 2 : 1"
          >
            <v-select
              hide-details
              dense
              style="height: 20px"
              class="pt-0 pb-2 caption"
              :class="
                $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                  ? 'px-1'
                  : 'px-2'
              "
              :items="[5, 10, 25, 50]"
              :value="getSearchedPerPage"
              @change="changePerPage"
            />
          </div>
          <!-- 'd-none d-sm-flex' makes it invisble on small screen -->
          <span
            class="my-2 d-none d-sm-flex"
            :class="
              $vuetify.breakpoint.xs ? 'v-selector-text-sm' : 'v-selector-text'
            "
            >rows per page</span
          >
        </div>

        <v-spacer></v-spacer>
        <v-menu offset-y>
          <template #activator="{ on: onMenu }">
            <v-tooltip color="#302277" bottom>
              <template #activator="{ on: onTooltip }">
                <v-btn
                  class="text-capitalize mx-2 d-flex align-center theme-border mr-3 mt-2 mb-2"
                  text
                  small
                  v-on="{ ...onMenu, ...onTooltip }"
                >
                  <div class="m-0">
                    <v-icon class="mx-1" color="#302277">mdi-printer</v-icon>
                  </div>
                </v-btn>
              </template>
              <span>Download</span>
            </v-tooltip>
          </template>
          <v-list class="pa-0">
            <v-list-item class="listing-hover pointer" @click="download('csv')">
              <img
                src="@/assets/images/Csv_icon.png"
                height="16px"
                class="mr-1"
              />
              <v-list-item-title class="listing-hover">CSV</v-list-item-title>
            </v-list-item>
            <v-list-item class="listing-hover pointer">
              <img
                src="@/assets/images/Excel_icon.png"
                height="20px"
                class="mr-1"
              />
              <a
                class="dropdown-item text-decoration-none"
                href="#"
                style="color: black"
              >
                <download-excel
                  :data="excelDownload.data"
                  :labels="excelDownload.labels"
                  :name="excelDownload.name"
                  worksheet="abc"
                  >Excel</download-excel
                >
              </a>
            </v-list-item>
          </v-list>
        </v-menu>
        <div class="d-flex">
          <span
            :class="
              $vuetify.breakpoint.xs ? 'v-selector-text-sm' : 'v-selector-text'
            "
          >
            Showing
            {{
              getTasksPagination && getTasksPagination.from
                ? getTasksPagination.from
                : 0
            }}-{{
              getTasksPagination && getTasksPagination.to
                ? getTasksPagination.to
                : 0
            }}
            of
            {{
              getTasksPagination && getTasksPagination.total
                ? getTasksPagination.total
                : 0
            }}
            {{ $vuetify.breakpoint.xs ? "" : "entries" }}
          </span>
          <v-pagination
            v-if="getTasksPagination"
            id="pagination"
            :value="getSearchedPage"
            :length="getTasksPagination.last_page"
            circle
            :total-visible="$vuetify.breakpoint.xs ? 3 : 5"
            @input="fetchPage"
          ></v-pagination>
        </div>
      </div>
    </div>
    <!-- snackbar -->
    <v-snackbar
      class="mt-5"
      top
      right
      :color="updateTaskError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="updateTaskError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="updateTaskError ? 'red' : 'green'"
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
    <!-- Dialogs -->
    <!-- Edit Task Dialog -->
    <template v-if="openEditDialog">
      <EditDialog
        :taskDetails="details"
        :openEditDialog.sync="openEditDialog"
      />
    </template>
    <!-- Assign Task Dialog -->
    <template v-if="openAssignTaskDialog">
      <AssignTaskModal :openAssignTaskDialog.sync="openAssignTaskDialog" />
    </template>

    <!-- Task Conflict Dialog -->
    <TaskConflict
      :currentTask.sync="running"
      :conflicts.sync="conflicts"
      :openTaskConflictDialog.sync="openTaskConflictDialog"
    />
    <!-- Comment Dialog Box -->
    <template v-show="openCommentDialog">
      <CommentsDialogBox
        :openCommentDialog.sync="openCommentDialog"
        :taskDetails="details"
        :getTaskComments="getTaskComments"
        :clearTextField="openCommentDialog"
      />
    </template>
    <!--- Add New Member Modal --->
    <AddMember
      @membersDone="setTempMembers([])"
      @membersTemp="setTempMembers"
      @close="dialog = false"
      :dialog.sync="dialog"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import exportTable from "@/table-export.js";
import { baseURL } from "@/assets/js/urls";
import moment from "moment";
import timer from "@/timer";
import profileImage from "../includes/ProfileImage";
import CommentsDialogBox from "@/components/Tasks/Comments/CommentsDialogBox";
import AssignTaskModal from "@/components/Tasks/AssignTaskModal";
import AddMember from "@/components/TeamMembers/AddMember";
import UserInfo from "@/components/TeamMembers/UserInfo";
import { eventBus } from "@/main";
import _ from "lodash";
import Swal from "sweetalert2";
import JsonExcel from "vue-json-excel";

export default {
  name: "TaskList",
  props: ["headers"],

  components: {
    AddMember,
    profileImage,
    CommentsDialogBox,
    AssignTaskModal,
    UserInfo,
    TaskConflict: () =>
      import("@/components/Tasks/TaskConflict/SelectionModal"),
    RangeSliderLabels: () => import("./RangeSliderLabels"),
    EditDialog: () => import("@/components/Tasks/EditTask"),
    downloadExcel: JsonExcel,
  },
  data() {
    return {
      projectMenu: false,
      x: null, // Mouse position
      y: null, // Mouse position
      assignedToMenu: false,
      requestQue: null,
      requestQueRemove: null,
      requestQueAdd: null,
      timeEntryMenu: false,
      timeEntryRange: [1440, 1600],
      startTimePicker: false,
      stopTimePicker: false,
      newEndTime: null, // Edited time entry
      newStartTime: null, // Edited time entry
      startDate: null,
      endDate: null,
      tempMembers: [], // Temporary members being added from add member component
      openAssignTaskDialog: false,
      assignedToDropdown: false,
      assignedByDropdown: false,
      projectsDropdown: false,
      editProjectName: "",
      editIcon: null,
      tasksDropdown: false,
      taskTitle: "",
      comment_icon: require("@/assets/images/comment-icon.svg"),
      dates: [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")],
      absolute: true,
      dialog: false,
      searchProject: null,
      projectBtn: true,
      selectedInterval: {},
      pending: false,
      conflicts: [],
      running: null,
      openTaskConflictDialog: false,
      stop: false,
      openCommentDialog: false,
      details: null,
      selectedTask: null,
      expandedTask: null,
      dropdownList: [
        { text: "Today" },
        { text: "Yesterday" },
        { text: "Last 7 days" },
        { text: "Last 30 days" },
        { text: "This month" },
        { text: "All the time" },
      ],
      statusList: [{ text: "all" }, { text: "pending" }, { text: "completed" }],
      setTaskStatus: null,
      disableStatusIcon: false,
      setTaskId: null,
      updateStatusLoader: false,
      selectedTaskDate: null,
      showSelectedDate: false,
      getTaskComments: "",
      projectSearch: null,
      memberSearch: null,
      date: new Date().toISOString().substr(0, 10),
      dateMenu: false,
      updateTaskError: null,
      expanded: [],
      singleExpand: true,
      snackbar: false,
      snackbarMessage: null,
      searchMember: null,
      searchedTitle: null,
      sortAssignedToMember: "desc",
      sortAssignedByMember: "desc",
      sortProjects: "desc",
      sortDueDate: "desc",
      sortAssignedDate: "desc",
      sortTitles: "desc",
      openEditDialog: false,
      syncComments: false,
      fetchLinearLoader: false,
      editTimeEntryLoader: false,
      excel_fields: {
        details: {
          labels: {
            Members: "Members",
            Assigned_By: "Assigned_By",
            Project: "Project",
            Title: "Title",
            Assigned_Date: "Assigned_Date",
            Due_Date: "Due_Date",
            Time_Spent: "Time_Spent",
          },
          fields: [
            "Members",
            "Assigned_By",
            "Project",
            "Title",
            "Assigned_Date",
            "Due_Date",
            "Time_Spent",
          ],
          dataFile: "Tasks.xls",
        },
      },
    };
  },
  computed: {
    ...mapGetters([
      "getProject",
      "getTask",
      "getTasks",
      "getActiveTask",
      "getProjects",
      "getTeamMembers",
      "getTeamMember",
      "getAssignees",
      "getNonAssignees",
      "getSelectedCompany",
      "getLoggedInUser",
      "getTasksSkeletonLoader",
      "getAllMembers",
      "getTasksPagination",
      "getOnlineStatus",
      "getRecordingAvailable",
      "getTaskToSendRecording",
      "getPendingTimer",
      "getSidebarMini",
      "getSearchedStatus",
      "getSearchedProject",
      "getSearchedTitle",
      "getSearchedAssignedTo",
      "getSearchedAssignedBy",
      "getTasksLinearLoaderState",
      "getSearchedPage",
      "getSearchedPerPage",
      "getTaskDateFilter",
      "getShowAllTasks",
    ]),
    isExtension() {
      return window.innerHeight == "600" && window.innerWidth == "450";
    },
    projectsList() {
      return this.projectSearch && this.getProjects
        ? this.getProjects.filter((item) => {
            return item.name
              ? item.name
                  .toLowerCase()
                  .includes(this.projectSearch.toLowerCase())
              : false;
          })
        : this.getProjects;
    },
    MembersList() {
      return this.searchMember && this.getTeamMembers
        ? this.getTeamMembers.filter((item) => {
            return item.name
              ? item.name
                  .toLowerCase()
                  .includes(this.searchMember.toLowerCase())
              : false;
          })
        : this.getTeamMembers;
    },
    // Search all Members
    getMembers() {
      return this.getAllMembers
        ? this.searchMember
          ? this.getAllMembers.filter((item) => {
              return item.name
                ? item.name
                    .toLowerCase()
                    .includes(this.searchMember.toLowerCase()) &&
                    item.id != this.getLoggedInUser.id
                : item.email
                    .toLowerCase()
                    .includes(this.searchMember.toLowerCase()) &&
                    item.id != this.getLoggedInUser.id;
            })
          : this.getAllMembers.filter((item) => {
              return item.id != this.getLoggedInUser.id;
            })
        : [];
    },
    url() {
      return baseURL.API_URL;
    },
    // Dates calculation after date range (option) selection
    dateRange() {
      if (this.getTaskDateFilter == "Today")
        return [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
      if (this.getTaskDateFilter == "Yesterday")
        return [
          moment().subtract(1, "day").format("YYYY-MM-DD"),
          moment().subtract(1, "day").format("YYYY-MM-DD"),
        ];
      if (this.getTaskDateFilter == "Last 7 days")
        return [
          moment().subtract(7, "day").format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      if (this.getTaskDateFilter == "Last 30 days")
        return [
          moment().subtract(30, "day").format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      if (this.getTaskDateFilter == "This month") {
        let daysFromStartOfMonth = moment().format("DD");
        return [
          moment()
            .subtract(daysFromStartOfMonth - 1, "days")
            .format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      }
      if (this.getTaskDateFilter == "All the time")
        return ["2000-01-01", moment().format("YYYY-MM-DD")];
      else return [];
    },
    excelDownload() {
      return {
        data: this.detailsJson,
        name: this.excel_fields.details.dataFile,
        labels: this.excel_fields.details.labels,
        fields: this.excel_fields.details.fields,
      };
    },

    detailsJson: function () {
      let rawData = this.getTasks;
      let json = [];
      if (rawData) {
        rawData.forEach((member) => {
          let users = member.members.map((k) => {
            return k ? k.name : k.email;
          });
          let time_spent = member.members.map((t) => {
            return t.duration ? timer.format(t.duration) : "00";
          });
          let mem = {};
          mem.Members = users ? users : "";
          mem.Assigned_By = member.assigned_by.name;
          (mem.Project = member.project
            ? member.project.name.charAt(0).toUpperCase() +
              member.project.name.slice(1)
            : "no project"),
            (mem.Title = member.title
              ? member.title.charAt(0).toUpperCase() + member.title.slice(1)
              : "no title"),
            (mem.Assigned_Date = member.created_at
              ? moment(member.created_at).format("DD-MM-YYYY")
              : ""),
            (mem.Due_Date = member.due_date
              ? moment(member.due_date).format("DD-MM-YYYY")
              : ""),
            (mem.Time_Spent = time_spent ? time_spent : "00"),
            json.push(mem);
        });
      }
      return json;
    },
  },

  methods: {
    openProjectMenu(event) {
      this.x = event.clientX;
      this.y = event.clientY;
      this.projectMenu = true;
    },
    openAssignedToMenu(event) {
      this.x = event.clientX;
      this.y = event.clientY;
      this.assignedToMenu = true;
    },
    // Change pagination of tasks. Number of tasks per page
    changePerPage(value) {
      this.$store.commit("setTaskFilter", {
        per_page: value,
        page: 1,
      });
      this.searchData();
    },
    // Runs after range slider is moved
    // Calulates intervals for time entries
    calculateInterval(range) {
      let startHours, startMinutes, endHours, endMinutes;
      startHours = Math.floor(range[0] / 60);
      startMinutes = range[0] % 60;
      endHours = Math.floor(range[1] / 60);
      endMinutes = range[1] % 60;

      startMinutes < 10 ? (startMinutes = "0" + startMinutes) : () => {};
      endMinutes < 10 ? (endMinutes = "0" + endMinutes) : () => {};
      this.newStartTime = `${startHours}:${startMinutes}`;
      this.newEndTime = `${endHours}:${endMinutes}`;
      this.selectedInterval.start_time = `${this.startDate} ${this.newStartTime}`;
      this.selectedInterval.end_time = `${this.endDate} ${this.newEndTime}`;
    },

    // Set temporary members being invited in add member component
    setTempMembers(payload) {
      this.tempMembers = payload;
    },
    editFunction(item) {
      this.openEditDialog = true;
      this.details = item;
    },
    deleteProject(delProject) {
      if (this.getActiveTask) {
        this.snackbar = true;
        this.snackbarMessage = "Please stop your task";
        this.updateTaskError = true;
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
                this.updateTaskError = false;
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
        this.updateTaskError = true;
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
          this.updateTaskError = false;
        })
        .catch((error) => {
          console.log("error", error);
          this.snackbar = true;
          this.updateTaskError = true;
          if (error.response.status == 422) {
            if (error.response.data.errors.name) {
              this.snackbarMessage = error.response.data.errors.name[0];
            }
          }
        });
    },
    // Change showing tasks to tasks 'By Me' or 'By Others'
    // Only owner can see this
    changeShowAll(option) {
      if (option == "me")
        this.$store.commit("setTaskFilter", {
          show_tasks: option,
          assigned_by: null,
          page: 1,
        });
      else
        this.$store.commit("setTaskFilter", {
          show_tasks: option,
          page: 1,
        });
      this.searchData()
        .then(() => {
          this.tasksDropdown = false;
        })
        .catch(() => {
          this.snackbar = true;
          this.updateTaskError = true;
          this.snackbarMessage = "Error fetching tasks by" + option;
        });
    },
    // Select task for editing title
    selectTask(task) {
      this.selectedTask = task;
    },
    // Export data table to CSV ofr xls
    download(format) {
      exportTable.TaskTableExport(this.getTasks, "TasksReport", format);
    },

    checkTaskStatus(item) {
      if (item.interval.length) {
        this.setTaskStatus = "active";
      } else if (item.completed_at > item.due_date) {
        this.setTaskStatus = "overdue";
      } else {
        this.setTaskStatus = "pending";
      }
      this.updateTaskStatus(item);
    },
    // Duration from creation of task till last stop
    totalDuration(task) {
      if (!this.isMember(task))
        return timer.format(task.members[0] ? task.members[0].duration : "");
      let totalDuration = 0;
      for (let interval of task.interval) {
        if (interval.duration) {
          totalDuration = totalDuration + parseInt(interval.duration);
        }
      }
      return timer.format(totalDuration);
    },

    openCommentModal(row) {
      this.openCommentDialog = true;
      this.details = row;
    },

    // Checks for conflicts and opens dialog
    checkConflicts(error) {
      if (error.response.status == 423) {
        if (error.response.data.data) {
          this.openTaskConflictDialog = true;
          this.conflicts = error.response.data.data;
          return true;
        } else if (error.response.data.error_msg) {
          this.snackbar = true;
          this.updateTaskError = true;
          this.snackbarMessage = this.upperCaseTitleName(
            error.response.data.error_msg
          );
        }
      }
      if (error.response.status == 422) {
        this.snackbar = true;
        this.updateTaskError = true;
        if (error.response.data.errors.title) {
          this.snackbarMessage = this.upperCaseTitleName(
            error.response.data.errors.title[0]
          );
        } else if (error.response.data.errors.end_time) {
          this.snackbarMessage = this.upperCaseTitleName(
            error.response.data.errors.end_time[0]
          );
        } else if (error.response.data.errors.start_time) {
          this.snackbarMessage = this.upperCaseTitleName(
            error.response.data.errors.start_time[0]
          );
        }
      }
      return false;
    },

    // Start a task from list
    playTask(task) {
      if (this.pending) return;
      this.pending = "play";
      if (this.getActiveTask) {
        if (!this.getActiveTask.title) {
          this.snackbar = true;
          this.snackbarMessage = "Cannot stop current task without title";
          this.updateTaskError = true;
          return;
        }
        this.setTaskId = task.task_id;
        this.updateStatusLoader = true;
        this.setTaskStatus = "active";
        this.$store
          .dispatch("stopTask")
          .then(() => {
            this.$store
              .dispatch("startTask", task)
              .then(() => {
                this.updateStatusLoader = false;
                this.pending = false;
              })
              .catch((err) => {
                if (this.checkConflicts(err)) this.pending;
                this.pending = false;
              });
          })
          .catch((err) => {
            this.running = {
              title: task.title,
              start_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            this.checkConflicts(err);
            this.pending = false;
          });
      } else {
        this.setTaskId = task.task_id;
        this.updateStatusLoader = true;
        this.setTaskStatus = "active";
        this.$store
          .dispatch("startTask", task)
          .then(() => {
            this.pending = false;
            this.updateStatusLoader = false;
          })
          .catch((err) => {
            this.running = {
              title: task.title,
              start_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            this.checkConflicts(err);
            this.pending = false;
          });
      }
    },

    // Stop a running task from list
    stopTask() {
      if (this.getActiveTask) this.$emit("stopTask");
    },

    // Date getters for different formats
    getAssignedDate(date) {
      return moment(date).fromNow();
    },
    getAssignedDateFormat(date) {
      return moment(date).format("LL");
    },
    getDuration(time) {
      return timer.format(time);
    },
    getDueDate(date) {
      return moment(date).fromNow();
    },
    getDueDateFormat(date) {
      return moment(date).format("LL");
    },
    getCompletedDateFormat(date) {
      return moment(date).format("MMMM Do YYYY, h:mm:ss a");
    },
    getCurrentDate() {
      let date = new Date().toISOString().substr(0, 10);
      return date;
    },
    getTommorrowDate() {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      let date = tomorrow.toISOString().substr(0, 10);
      return date;
    },
    getYesterdayDate() {
      const today = new Date();
      const Yesterday = new Date(today);
      Yesterday.setDate(Yesterday.getDate() - 1);
      let date = Yesterday.toISOString().substr(0, 10);
      return date;
    },

    selectProject(project) {
      this.$store.commit("setSelectedProject", project);
    },

    // Add new project in company
    createProject() {
      if (this.projectSearch || this.searchProject) {
        this.$store
          .dispatch("createProject", {
            project_name: this.projectSearch
              ? this.projectSearch
              : this.searchProject,
            company_id: this.getSelectedCompany.id,
          })
          .then((response) => {
            this.selectProject(response);
            this.searchProject = null;
            this.projectSearch = null;
            this.projectBtn = true;
          })
          .catch((error) => {
            if (error.response && error.response.status == 422) {
              this.projectSearch = null;
              this.snackbar = true;
              this.updateTaskError = true;
              if (error.response.status == 422) {
                if (error.response.data.errors.project_name) {
                  this.snackbarMessage = this.upperCaseTitleName(
                    error.response.data.errors.project_name[0]
                  );
                }
              }
            }
          });
      }
    },

    updateSelectedProject(newselectedProject, taskData) {
      let body = {
        project_id: newselectedProject ? newselectedProject.id : null,
        company_id: this.getSelectedCompany.id,
        task_id: taskData ? taskData.task_id : null,
      };
      this.$store
        .dispatch("updateTask", body)
        .then((response) => {
          this.snackbar = true;
          this.snackbarMessage = this.upperCaseTitleName(
            response.data.error_msg
          );
          this.updateTaskError = false;
        })
        .catch((error) => {
          if (error.response.status == 403) {
            this.snackbar = true;
            this.snackbarMessage = error.response.data.error_msg;
            this.updateTaskError = true;
          }
        });
    },

    // Edit task title from list
    editTaskTitle(data) {
      let trimTitle = this.taskTitle.trim();
      let oldTitle = this.getTask(data.task_id).title;
      if (trimTitle.length > 0) {
        let body = {
          project_id: data.project ? data.project.id : null,
          company_id: this.getSelectedCompany.id,
          task_id: data.task_id,
          title: trimTitle,
        };
        if (this.getActiveTask && this.getActiveTask.task_id == data.task_id)
          eventBus.$emit("titleUpdated", trimTitle);
        this.$store.commit("setUpdatedTask", {
          project: data.project,
          task: this.getTask(data.task_id),
          title: trimTitle,
        });
        this.$store
          .dispatch("updateTask", body)
          .then((res) => {
            this.search = null;
            this.snackbar = true;
            this.snackbarMessage = res.data.error_msg;
            this.updateTaskError = false;
          })
          .catch((error) => {
            this.$store.commit("setUpdatedTask", {
              project: data.project,
              task: this.getTask(data.task_id),
              title: oldTitle,
            });
            if (error.response.status == 422) {
              this.snackbar = true;
              if (error.response.data.errors.title) {
                this.snackbarMessage = this.upperCaseTitleName(
                  error.response.data.errors.title[0]
                );
                this.updateTaskError = true;
              }
            }
            if (error.response.status == 403) {
              this.snackbar = true;
              this.snackbarMessage = error.response.data.error_msg;
              this.updateTaskError = true;
            }
          });
        this.selectedTask = null;
        this.taskTitle = null;
      }
    },

    // Edit Start/End time for any entry
    editTimeEntry(interval) {
      if (this.pending) return;
      this.pending = "edit";
      this.editTimeEntryLoader = true;
      let task = this.expandedTask;
      let start_time = moment(
        `${this.startDate} ${this.newStartTime}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      let end_time = moment(
        `${this.endDate} ${this.newEndTime}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      let duration = moment.duration(end_time.diff(start_time)).asSeconds();
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
          this.editTimeEntryLoader = false;
          this.timeEntryMenu = false;
        })
        .catch((error) => {
          this.timeEntryMenu = false;
          // conflict
          this.running = {
            title: task.title,
            start_time: start_time.format("YYYY-MM-DD HH:mm:ss"),
            end_time: end_time.format("YYYY-MM-DD HH:mm:ss"),
          };
          // Open conflicts dialog
          this.checkConflicts(error);
          this.pending = false;
          this.editTimeEntryLoader = false;
        });
    },

    deleteTimeEntry(item) {
      if (!item.end_time) {
        this.snackbar = true;
        this.updateTaskError = true;
        this.snackbarMessage = "Cannot delete active time entry";
        return;
      }
      this.$store
        .dispatch("deleteTimeEntry", {
          entry_id: item.entry_id,
        })
        .then(() => {
          this.snackbar = true;
          this.updateTaskError = false;
          this.snackbarMessage = "Time entry deleted successfully";
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // Assign member to task
    assign(task_id, member_id) {
      this.requestQueAdd = member_id;
      this.requestQueRemove = member_id;
      if (this.pending) return;
      this.pending = "assign";
      this.$store
        .dispatch("assignMember", {
          task_id,
          member_id,
        })
        .then(() => {
          this.requestQueAdd = null;
          this.requestQueRemove = null;
          this.snackbar = true;
          this.pending = false;
          this.snackbarMessage = "Task member updated successfully";
          this.updateTaskError = false;
        })
        .catch(() => {
          this.pending = false;
        });
    },

    // Formats time to HH:mm:ss
    format(value) {
      return timer.format(value);
    },

    filteredAssignees(task_id) {
      return this.getAssignees(task_id)
        ? this.memberSearch
          ? this.getAssignees(task_id).filter((item) => {
              return item.name
                ? item.name
                    .toLowerCase()
                    .includes(this.memberSearch.toLowerCase())
                : item.email
                    .toLowerCase()
                    .includes(this.memberSearch.toLowerCase());
            })
          : this.getAssignees(task_id)
        : null;
    },

    filteredNonAssignees(task_id) {
      return this.getNonAssignees(task_id)
        ? this.memberSearch
          ? this.getNonAssignees(task_id).filter((item) => {
              return item.name
                ? item.name
                    .toLowerCase()
                    .includes(this.memberSearch.toLowerCase())
                : item.email
                    .toLowerCase()
                    .includes(this.memberSearch.toLowerCase());
            })
          : this.getNonAssignees(task_id)
        : null;
    },

    updateDueDate(date, taskData) {
      this.updateStatusLoader = true;
      this.setTaskId = taskData.task_id;
      let body = {
        project_id: taskData.project ? taskData.project.id : null,
        company_id: this.getSelectedCompany.id,
        task_id: taskData.task_id,
        due_date: date,
      };
      this.$store
        .dispatch("updateTask", body)
        .then((res) => {
          this.$store.dispatch("fetchTasks").then(() => {
            this.updateStatusLoader = false;
          });
          this.search = null;
          this.snackbar = true;
          this.snackbarMessage = res.data.error_msg;
          this.updateTaskError = false;
        })
        .catch((error) => {
          if (error.response.status == 422) {
            this.snackbar = true;
            this.snackbarMessage = this.upperCaseTitleName(
              error.response.data.errors.due_date[0]
            );
            this.updateTaskError = true;
          }
          if (error.response.status == 403) {
            this.snackbar = true;
            this.snackbarMessage = error.response.data.error_msg;
            this.updateTaskError = true;
          }
        });
      this.showSelectedDate = true;
    },

    updateTaskStatus(taskData) {
      if (
        this.getActiveTask &&
        this.getActiveTask.task_id == taskData.task_id
      ) {
        this.snackbarMessage = "Please stop, then complete";
        this.snackbar = true;
        this.updateTaskError = true;
        return;
      }
      this.disableStatusIcon = true;
      this.updateStatusLoader = true;
      let body = {
        project_id: taskData.project ? taskData.project.id : null,
        company_id: this.getSelectedCompany.id,
        task_id: taskData.task_id,
        status: this.setTaskStatus,
      };
      this.$store.commit("setUpdatedTask", {
        project: taskData.project,
        task: this.getTask(taskData.task_id),
        status: this.setTaskStatus,
      });
      body.status == "completed"
        ? (body.completed_at = moment().format("YYYY-MM-DD HH:mm:ss"))
        : () => {};
      this.$store
        .dispatch("updateTask", body)
        .then((res) => {
          this.disableStatusIcon = false;
          this.updateStatusLoader = false;
          this.search = null;
          this.snackbar = true;
          this.snackbarMessage = res.data.error_msg;
          this.updateTaskError = false;
        })
        .catch((error) => {
          this.disableStatusIcon = false;
          this.updateStatusLoader = false;
          if (error.response.status == 403) {
            this.snackbar = true;
            this.snackbarMessage = error.response.data.error_msg;
            this.updateTaskError = true;
          }
        });
    },

    upperCaseTitleName(name) {
      return name
        .split(" ")
        .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
        .join(" ");
    },

    // This function applies all the search filters and fetches tasks
    searchData(loader) {
      if (loader) this.fetchLinearLoader = true;
      return new Promise((resolve, reject) => {
        this.$store
          .dispatch("fetchTasks")
          .then((res) => {
            this.fetchLinearLoader = false;
            resolve(res);
          })
          .catch((err) => {
            this.fetchLinearLoader = false;
            reject(err);
          });
      });
    },

    sortColumn(col_name, order_name) {
      this.$store.commit("setTaskFilter", {
        sort: {
          order_by: order_name,
          column_name: col_name,
        },
      });
      this.searchData();
    },

    // check if logged in user is a member of a task
    isMember(task) {
      return task.members.find((item) => {
        return item.id == this.getLoggedInUser.id;
      });
    },

    // show snackbar on conflict resolve
    conflictResolved(value) {
      if (value) {
        this.snackbar = true;
        this.snackbarMessage = "Entries discarded successfully";
        this.updateTaskError = false;
      }
    },

    // Open comments of new assigned task
    openNewTaskComments(value) {
      if (value) {
        if (this.getPendingTimer) {
          this.openCommentModal(this.getPendingTimer);
        } else {
          this.openCommentModal(this.getTasks[0]);
        }
      }
    },
    callUpdateStatusFunc(params) {
      this.setTaskStatus = params.status;
      this.setTaskId = params.taskData.task_id;
      this.updateTaskStatus(params.taskData);
    },
    deleteTaskEntry(item) {
      let task = item;
      Swal.fire({
        title: "Are you sure?",
        html: "Delete this Task!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Delete",
        reverseButtons: true,
      }).then((result) => {
        if (result.value) {
          if (
            this.getActiveTask &&
            this.getActiveTask.task_id == item.task_id
          ) {
            this.snackbar = true;
            this.snackbarMessage =
              " You or other members have to stop the task before deleting it";
            this.updateTaskError = true;
            return;
          }
          this.$store.commit("removeTaskEntry", item.task_id);
          this.$store
            .dispatch("deleteTaskEntry", item.task_id)
            .then((response) => {
              if (response.status == 200) {
                this.snackbar = true;
                this.snackbarMessage = response.data.error_msg;
                this.updateTaskError = false;
              }
            })
            .catch((err) => {
              this.$store.commit("addNewTask", {
                taskArray: this.getTasks,
                newTaskObj: task,
                pagination: this.getTasksPagination,
              });
              if (err.response.status == 422) {
                this.snackbar = true;
                this.snackbarMessage = err.response.data.message;
                this.updateTaskError = true;
              }
              if (err.response.status == 403) {
                this.snackbar = true;
                this.snackbarMessage = err.response.data.message;
                this.updateTaskError = true;
              }
            });
        }
      });
    },
    // Fetch new page
    fetchPage(value) {
      if (value) {
        this.$store.commit("setTaskFilter", { page: value });
        this.searchData();
      }
    },
  },

  watch: {
    // Update range slider when start time of entry is updated by keyboard
    newStartTime(value) {
      if (value[0] != ":") {
        this.timeEntryRange = [
          moment
            .duration(
              moment(value, "HH:mm:ss").diff(moment("00:00:00", "HH:mm:ss"))
            )
            .asMinutes(),
          this.timeEntryRange[1],
        ];
      }
    },

    // Update range slider when end time of entry is updated by keyboard
    newEndTime(value) {
      if (value[0] != ":") {
        this.timeEntryRange = [
          this.timeEntryRange[0],
          moment
            .duration(
              moment(value, "HH:mm:ss").diff(moment("00:00:00", "HH:mm:ss"))
            )
            .asMinutes(),
        ];
      }
    },
    // Time entry being edited
    // Re-initialize range slider if new interval is selected
    selectedInterval(value) {
      if (value) {
        this.startDate = value.start_time.slice(0, 11);
        this.endDate = value.end_time.slice(0, 11);
        this.newStartTime = value.start_time.slice(11, 16);
        this.newEndTime = value.end_time.slice(11, 16);
        this.timeEntryRange = [
          moment
            .duration(
              moment(value.start_time.slice(11, 16), "HH:mm:ss").diff(
                moment("00:00:00", "HH:mm:ss")
              )
            )
            .asMinutes(),
          moment
            .duration(
              moment(value.end_time.slice(11, 16), "HH:mm:ss").diff(
                moment("00:00:00", "HH:mm:ss")
              )
            )
            .asMinutes(),
        ];
      }
    },

    // Update comments dialog details if pending task has resolved
    getPendingTimer(value) {
      if (!value) this.details = this.getTasks[0];
    },
    // Open the dialog for the task to which screen recording was sent
    // Details of the target task are being set to show on dialog
    getRecordingAvailable(value) {
      if (value) {
        this.details = this.getTaskToSendRecording;
      }
    },
    searchedTitle: {
      handler: _.debounce(function (value) {
        this.$store.commit("setTaskFilter", { title: value, page: 1 });
      }, 1000),
      deep: true,
    },

    dateRange(value) {
      this.$store.commit("setTaskFilter", {
        start_date: value[0],
        end_date: value[1],
        page: 1,
      });
    },

    getTaskDateFilter() {
      this.searchData(true);
    },

    getSearchedTitle(value) {
      this.searchedTitle = value;
      this.searchData(true);
    },
    // Inform 'Start Task' component to start/stop task if active task is changed
    getActiveTask(value) {
      value ? (this.stop = false) : () => {};
    },
  },

  mounted() {
    // this.$store.dispatch("fetchTasks");
    this.searchedTitle = this.getSearchedTitle;
    if (JSON.parse(localStorage.getItem("new-comment"))) {
      this.openCommentModal(JSON.parse(localStorage.getItem("new-comment")));
      localStorage.removeItem("new-comment");
    }
    eventBus.$on("companySwitched", () => {
      this.searchedTitle = null;
      this.$store.commit("resetTaskFilters");
    });

    eventBus.$on("updateTaskStatusEvent", this.callUpdateStatusFunc);
    // Open the dialog for the task to which screen recording was sent
    // Details of the target task are being set to show on dialog
    if (this.getRecordingAvailable) {
      this.details = this.getTaskToSendRecording;
    }

    // Redirection from extension
    if (localStorage.getItem("selectedTask")) {
      this.openCommentModal(this.getTask(localStorage.getItem("selectedTask")));
    }

    // Event raised on resolving task conflicts
    eventBus.$on("retry", this.conflictResolved);
    eventBus.$on("new-comment", this.openCommentModal);

    // Event raised when a new task is assigned to some member
    // This event triggers comments dialog for the newly assigned task
    eventBus.$on("newTaskAssigned", this.openNewTaskComments);
    this.openCommentDialog = false;
    this.searchData();
  },

  beforeDestroy() {
    eventBus.$off("retry");
    eventBus.$off("newTaskAssigned");
    eventBus.$off("updateTaskStatusEvent");
    eventBus.$off("companySwitched");
  },
};
</script>
<style scoped>
.font-size {
  font-size: 10px;
}
.tooltip-opacity {
  opacity: 1 !important;
}
.badge-label {
  font-size: 9px !important;
}

.stop-icon {
  color: #e14268 !important;
}
.bg-color {
  background-color: white !important;
}

.project-name-on-hover:hover {
  text-decoration-line: underline;
  color: #6c5cd6 !important;
}

.overflow-scroll {
  overflow: scroll;
}
/* table header dropdowns CSS */

/* Expanded table CSS */
.intervals {
  max-height: 154px !important;
  overflow: hidden;
  overflow-y: scroll !important;
}
.underline {
  text-decoration: underline;
}
.border {
  border: 1px solid rgb(201, 196, 196);
  border-radius: 5;
}
.duration-input {
  border: 1px solid rgb(201, 196, 196);
  height: 24px;
}
/* row per page css */
.v-selector-text {
  color: #757096;
  font-size: 14px;
}
.v-selector-text-sm {
  color: #757096;
  font-size: 10px;
}

.inputContainer i {
  position: absolute;
}
.inputContainer i {
  position: absolute;
}
.sub-header {
  position: relative;
  margin: 0 auto;
}
.header-dropdown {
  color: #6c5cd6 !important;
  border: 1px #dad6f5 solid !important;
}
.date-range-dropdown {
  min-height: 25px;
  min-width: 150px;
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
.claender-ok-btn {
  background-color: #edebf9;
}
/* show overlay when offline */
.divOverlay {
  position: absolute;
  left: 50%;
  bottom: 20%;
}
.expanding-chevron-bg {
  border: 1px solid #1cc283;
  background-color: rgba(28, 194, 131, 0.12);
}
.due_date-chip {
  width: 100px !important;
}
.overlay-height {
  height: calc(100vh - 160px) !important;
  overflow: hidden;
  overflow-y: scroll;
}
.overlay-height-sm {
  height: calc(100vh - 140px) !important;
  overflow: hidden;
  overflow-y: scroll;
}
.green-chip {
  color: #1f6153 !important;
}
.green-chip-color {
  font-size: 12px;
  font-weight: bold;
  color: #1f6153 !important;
  background-color: #c6ebe4 !important;
  /* color: #28806d !important;
  background-color: #e4f6f2 !important; */
}
.yellow-chip-color {
  font-size: 12px;
  font-weight: bold;
  color: #7f5f01 !important;
  background-color: #fff0b3 !important;
  /* color: #8e6a01 !important;
  background-color: #fffae5 !important; */
}
.red-chip-color {
  font-size: 12px;
  font-weight: bold;
  color: #961d41 !important;
  background-color: #f3becf !important;
  /* color: red !important;
  background-color: rgb(253, 235, 235) !important; */
}
.yellow-chip {
  color: #7f5f01 !important;
}
.red-chip {
  color: #961d41 !important;
}
.no-date {
  color: grey !important;
}
.no-date-chip {
  color: grey !important;
  background-color: rgb(238, 235, 235) !important;
}
.blue-chip-color {
  font-size: 12px;
  font-weight: bold;
  color: #2a206a !important;
  background-color: #e5e9ff !important;
  /* color: #0076d1 !important;
  background-color: #d4ecff !important; */
}
.edit-title-field {
  border: 1px #2a206a solid;
  border-radius: 5px;
  height: 30px;
}
.listing-hover .v-list-item {
  min-height: 30px !important;
}
.v-table tr:hover:not(.v-table__expanded__content) {
  background: red !important;
}
.highlighted-row {
  background-color: #f3fafb !important;
  border: 1px solid #28806d !important;
}
.v-progress-linear {
  background: transparent;
  overflow: hidden;
  position: initial;
  transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  width: 100%;
}
.child-table {
  max-height: 190px;
}
</style>
