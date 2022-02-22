<template>
  <div>
    <div
      :class="
        $vuetify.breakpoint.md
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
            $vuetify.breakpoint.md
              ? 'table-width-2 overlay-height'
              : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
              ? 'table-width-3 overlay-height-sm'
              : 'table-width overlay-height'
          "
          absolute
          id="divOverlay"
          :value="!getOnlineStatus"
          v-if="!getOnlineStatus"
          color="white"
        >
        </v-overlay>
      </div>

      <v-row class="justify-end align-center pt-4 mr-3">
        <!-- 'Export As' Menu -->
      </v-row>

      <div style="position: relative">
        <!-- Loader while waiting -->
        <v-skeleton-loader
          v-show="getTasksSkeletonLoader"
          type="table-tbody,table-tfoot"
          class="mt-3"
          :class="
            $vuetify.breakpoint.md
              ? 'table-width-2'
              : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
              ? 'table-width-3'
              : getSidebarMini
              ? 'table-width-4'
              : 'table-width'
          "
        >
        </v-skeleton-loader>
        <v-data-table
          id="v-data-table-task"
          fixed-header
          v-show="!getTasksSkeletonLoader"
          height="500"
          :headers="headers"
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
          item-key="task_id"
          disable-pagination
          hide-default-footer
          :class="$vuetify.breakpoint.xs ? 'mx-3' : 'ml-6'"
          class="elevation-1 mb-1 table-height mt-4"
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
                    min-width="160"
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
                      <div style="color: grey" class="caption pa-2 pl-5">
                        Assigned by
                      </div>
                      <div
                        class="listing-hover pa-2 pl-5 caption"
                        @click="changeShowAll('By Me')"
                        :class="showAllTasks == 'By Me' ? 'bg-selected' : ''"
                      >
                        Me ({{ getLoggedInUser.name }})
                      </div>
                      <div
                        class="listing-hover pa-2 pl-5 caption"
                        @click="changeShowAll('By Others')"
                        :class="
                          showAllTasks == 'By Others' ? 'bg-selected' : ''
                        "
                      >
                        By Others
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
                  showAllTasks == 'By Others') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  getSelectedCompany.permissions.project &&
                  showAllTasks == 'By Others') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project &&
                  showAllTasks == 'By Others') ||
                (getSelectedCompany.role == 'team-manager' &&
                  showAllTasks == 'By Others') ||
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
          <template v-slot:[`header.interval`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <template v-slot:[`header.status`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <template v-slot:[`header.members.duration`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <template v-slot:[`header.actions`]="{ header }">
            <div class="header-text-color">
              {{ header.text }}
            </div>
          </template>
          <template v-slot:[`body.prepend`]="{ headers }">
            <tr>
              <td
                :class="getSelectedCompany.role == 'owner' ? 'px-0' : 'px-1'"
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
                          selectedAssignedTo
                            ? selectedAssignedTo.name
                              ? selectedAssignedTo.name
                              : selectedAssignedTo.email
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
                        @click="
                          selectedAssignedTo = null;
                          searchData();
                        "
                        :class="selectedAssignedTo == null ? 'bg-selected' : ''"
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
                            selectedAssignedTo == null
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
                          selectedAssignedTo
                            ? selectedAssignedTo.id == member.id
                              ? ((selectedAssignedTo = null), searchData())
                              : ((selectedAssignedTo = member), searchData())
                            : ((selectedAssignedTo = member), searchData());
                          assignedToDropdown = false;
                        "
                        :class="
                          selectedAssignedTo
                            ? selectedAssignedTo.id == member.id
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

                        <v-list-item-content class="ml-2" v-if="member.name">
                          {{
                            member.id == getLoggedInUser.id
                              ? "ME"
                              : member.name[0].toUpperCase() +
                                member.name.slice(1).toLowerCase()
                          }}</v-list-item-content
                        >
                        <v-list-item-content class="ml-2" v-if="!member.name">{{
                          member.email
                        }}</v-list-item-content>
                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-3"
                          v-text="
                            selectedAssignedTo
                              ? selectedAssignedTo.id == member.id
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
                      showAllTasks == 'By Others') ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        getSelectedCompany.permissions.project &&
                        showAllTasks == 'By Others') ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        !getSelectedCompany.permissions.project &&
                        showAllTasks == 'By Others') ||
                      (getSelectedCompany.role == 'team-manager' &&
                        showAllTasks == 'By Others') ||
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
                          selectedAssignedBy
                            ? selectedAssignedBy.name
                              ? selectedAssignedBy.name
                              : selectedAssignedBy.email
                            : "Members"
                        }}
                        <v-icon small class="pl-3"> mdi-menu-down </v-icon>
                      </v-btn>
                    </template>

                    <v-list max-height="200" class="overflow-scroll">
                      <v-text-field
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
                          selectedAssignedBy
                            ? selectedAssignedBy.id == member.id
                              ? ((selectedAssignedBy = null), searchData())
                              : ((selectedAssignedBy = member), searchData())
                            : ((selectedAssignedBy = member), searchData());
                          assignedByDropdown = false;
                        "
                        :class="
                          selectedAssignedBy
                            ? selectedAssignedBy.id == member.id
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
                        <v-list-item-content class="ml-2" v-if="member.name">
                          {{
                            member.id == getLoggedInUser.id
                              ? "ME"
                              : member.name[0].toUpperCase() +
                                member.name.slice(1).toLowerCase()
                          }}</v-list-item-content
                        >
                        <v-list-item-content class="ml-2" v-if="!member.name">{{
                          member.email
                        }}</v-list-item-content>
                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-3"
                          v-text="
                            selectedAssignedBy
                              ? selectedAssignedBy.id == member.id
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
                            selectedProject ? selectedProject.name : "Projects"
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
                          selectedProject = null;
                          searchData();
                        "
                        :class="selectedProject == null ? 'bg-selected' : ''"
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
                            selectedProject == null
                              ? 'mdi-check-box-outline'
                              : ''
                          "
                        ></v-icon>
                      </div>
                      <div
                        v-for="project in projectsList"
                        :key="project.id"
                        class="list-item-min-height caption listing-hover d-flex pointer"
                        @click="
                          selectedProject
                            ? selectedProject.id == project.id
                              ? ((selectedProject = null), searchData())
                              : ((selectedProject = project), searchData())
                            : ((selectedProject = project), searchData());
                          projectsDropdown = false;
                        "
                        :class="
                          selectedProject
                            ? selectedProject.id == project.id
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
                            selectedProject
                              ? selectedProject.id == project.id
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
                          {{ searchedStatus ? searchedStatus : "Status" }}
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
                        class="d-flex status-list-min-height caption listing-hover pointer"
                        @click="
                          searchedStatus = null;
                          searchData();
                        "
                        :class="searchedStatus == null ? 'bg-selected' : ''"
                      >
                        <v-list-item-content class="ml-2">
                          All
                        </v-list-item-content>
                        <v-icon
                          small
                          color="#1cc283"
                          class="mr-1"
                          v-text="
                            searchedStatus == null
                              ? 'mdi-check-box-outline'
                              : ''
                          "
                        ></v-icon>
                      </div>
                      <div
                        v-for="status in statusList"
                        :key="status.text"
                        class="status-list-min-height caption listing-hover d-flex pointer"
                        @click="(searchedStatus = status.text), searchData()"
                        :class="
                          searchedStatus
                            ? searchedStatus == status.text
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
                            searchedStatus
                              ? searchedStatus == status.text
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
                        v-model="dateRangeValue"
                        readonly
                        type="text"
                        v-on="on"
                        v-bind="attrs"
                        size="16"
                        class="dateRangesearch-input-field pointer mb-1 mt-2 rounded-2"
                        @keyup.enter="searchData"
                      />
                    </template>
                    <v-list>
                      <v-list-item
                        v-for="list of dropdownList"
                        :key="list.text"
                        class="date-range-dropdown pointer d-flex"
                        :class="
                          selectedDateItem == list.text ? 'bg-selected' : ''
                        "
                        @click="getSelectedDates(list.text)"
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
                </div>
              </td>
            </tr>
          </template>
          <!-------------------------------->
          <!-- Item Slots -->
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
              class="align-center d-flex justify-start px-0"
            >
              <v-menu content-class="bg-color" :close-on-content-click="false">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-list
                      v-if="getAssignees(item.task_id)"
                      class="transparent"
                    >
                      <v-list-item
                        class="pa-0 pointer list-item-min-height"
                        v-for="member in getAssignees(item.task_id).slice(0, 1)"
                        @click="memberSearch = null"
                        :key="member.id"
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
                                inline
                                :username="
                                  member.name ? member.name : member.email
                                "
                                :size="30"
                                :circular="true"
                                class="my-2 text-light d-inline mr-2"
                              >
                              </profileImage>
                              <profileImage
                                v-if="getAssignees(item.task_id).length > 1"
                                inline
                                :username="`+${
                                  getAssignees(item.task_id).length - 1
                                }`"
                                :size="30"
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
                </template>
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
                  >
                  </v-text-field>

                  <v-list
                    class="pointer overflow-scroll"
                    scrollable
                    max-height="200"
                  >
                    <div
                      v-for="member in filteredAssignees(item.task_id)"
                      :key="member.id"
                      :disabled="
                        (getActiveTask && member.id == getLoggedInUser.id) ||
                        getAssignees(item.task_id).length <= 1
                          ? true
                          : false
                      "
                      class="d-flex bg-selected listing-hover caption list-item-min-height"
                      @click="
                        getAssignees(item.task_id).length > 1
                          ? assign(item.task_id, member.id)
                          : () => {}
                      "
                    >
                      <profileImage
                        v-show="member.image ? ':src' : ':username'"
                        :src="member.image"
                        inline
                        :username="member.name ? member.name : member.email"
                        :size="23"
                        :circular="true"
                        class="ml-3 text-light"
                      >
                      </profileImage>
                      <v-list-item-content class="ml-3" v-if="member.name">{{
                        getLoggedInUser.id == member.id
                          ? "ME"
                          : member.name[0].toUpperCase() +
                            member.name.slice(1).toLowerCase()
                      }}</v-list-item-content>
                      <v-list-item-content class="ml-3" v-if="!member.name">{{
                        member.email
                      }}</v-list-item-content>
                      <v-icon small class="mr-2" color="#1cc283"
                        >mdi-check-box-outline</v-icon
                      >
                    </div>
                    <div
                      v-for="member in filteredNonAssignees(item.task_id)"
                      :key="member.id"
                      @click="assign(item.task_id, member.id)"
                      class="d-flex list-item-min-height listing-hover caption"
                    >
                      <profileImage
                        v-show="member.image ? ':src' : ':username'"
                        :src="member.image"
                        inline
                        :username="member.name ? member.name : member.email"
                        :size="23"
                        :circular="true"
                        class="ml-3 text-light"
                      >
                      </profileImage>
                      <v-list-item-content v-if="member.name" class="ml-3"
                        >{{
                          getLoggedInUser.id == member.id
                            ? "ME"
                            : member.name[0].toUpperCase() +
                              member.name.slice(1).toLowerCase()
                        }}
                      </v-list-item-content>
                      <v-list-item-content v-if="!member.name" class="ml-3">
                        {{ member.email }}
                      </v-list-item-content>
                    </div>
                    <div
                      v-if="
                        memberSearch &&
                        !filteredAssignees(item.task_id).length &&
                        !filteredNonAssignees(item.task_id).length
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
            </div>
          </template>
          <!-- Intervals -->
          <template v-slot:expanded-item="{ item }">
            <td v-show="item.interval.length" class="white px-0" colspan="12">
              <!-- Child Table -->
              <div>
                <TaskEntries :item="item" />
              </div>
            </td>
          </template>
          <!-- Icon for expanding -->
          <template
            v-slot:[`item.data-table-expand`]="{ expand, isExpanded, item }"
          >
            <v-btn
              v-if="item.interval.length"
              class="expanding-chevron-bg px-0"
              icon
              x-small
              @click="expand(!isExpanded)"
            >
              <v-icon color="#1CC283">{{
                !isExpanded ? "mdi-chevron-right" : "mdi-chevron-down"
              }}</v-icon>
            </v-btn>
          </template>
          <!-- Assigned By -->
          <template v-slot:[`item.assigned_by`]="{ item }">
            <div
              v-if="
                (getSelectedCompany.role == 'owner' &&
                  showAllTasks == 'By Others') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  getSelectedCompany.permissions.project &&
                  showAllTasks == 'By Others') ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project &&
                  showAllTasks == 'By Others') ||
                (getSelectedCompany.role == 'team-manager' &&
                  showAllTasks == 'By Others') ||
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
            <div class="d-flex mx-0">
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
              <v-menu
                v-else
                :close-on-content-click="false"
                content-class="bg-color"
                offset-y
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    @click="projectBtn = true"
                    class="px-0"
                    v-on="on"
                    plain
                  >
                    <v-icon
                      small
                      v-show="!item.project"
                      class="logo-text-color"
                    >
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
                </template>
                <div
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
                    v-model="projectSearch"
                    @keydown.enter="
                      item.project
                        ? item.project.id == projectsList[0].id
                          ? updateSelectedProject(null, item)
                          : updateSelectedProject(projectsList[0], item)
                        : updateSelectedProject(projectsList[0], item);
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
                        item.project
                          ? item.project.id == project.id
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
                        @blur="blur(project)"
                      >
                      </v-text-field>
                      <div
                        v-if="!project.edit"
                        class="d-flex list-item-min-height"
                        @click="
                          item.project
                            ? item.project.id == project.id
                              ? updateSelectedProject(null, item)
                              : updateSelectedProject(project, item)
                            : updateSelectedProject(project, item)
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
                          item.project
                            ? item.project.id == project.id
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
                    @click="
                      projectSearch ? createProject() : (projectBtn = false)
                    "
                    color="#EEF0F6"
                    width="220"
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
                    Add
                    {{ projectSearch ? projectSearch : "New Project" }}</v-btn
                  >
                  <v-text-field
                    class="pa-0 ma-0"
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
            </div>
          </template>
          <!--Assigned Date-->
          <template v-slot:[`item.created_at`]="{ item }">
            <div
              class="text-caption mt-1 d-flex justify-start"
              v-if="item.created_at"
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
            <div class="d-flex justify-start">
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
            class="d-flex align-center justify-start"
            v-slot:[`item.interval`]="{ item }"
          >
            <v-tooltip v-if="item.interval.length" bottom color="#302277">
              <template v-slot:activator="{ on }">
                <div
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
            class="d-flex align-center justify-start"
            v-slot:[`item.status`]="{ item }"
          >
            <div class="px-0">
              <v-chip
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
                    <div class="mr-2">
                      {{ totalDuration(item).slice(0, 5) }}
                    </div>
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
            <v-layout :class="$vuetify.breakpoint.xs ? 'my-5' : ''">
              <div class="d-flex justify-end">
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
                          getActiveTask && getActiveTask.task_id == item.task_id
                            ? 'stop-icon'
                            : 'play-icon'
                        "
                        @click="
                          getActiveTask && getActiveTask.task_id == item.task_id
                            ? stopTask()
                            : playTask(item)
                        "
                        >{{
                          getActiveTask && getActiveTask.task_id == item.task_id
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
                <!-- comment icon -->
                <v-tooltip color="#302277" bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-badge
                      v-if="item.comments_count > 0"
                      overlap
                      color="green"
                    >
                      <template v-slot:badge>
                        <span v-text="item.comments_count"></span>
                      </template>
                      <img
                        height="24px"
                        width="24px"
                        v-bind="attrs"
                        v-on="on"
                        @click="
                          (item.comments_count = 0), openCommentModal(item)
                        "
                        class="logo-text-color pointer mt-1 mx-1"
                        :src="comment_icon"
                      />
                    </v-badge>
                    <img
                      v-show="!item.comments_count || item.comments_count == 0"
                      v-bind="attrs"
                      v-on="on"
                      @click="(item.comments_count = 0), openCommentModal(item)"
                      height="24px"
                      width="24px"
                      class="logo-text-color pointer mt-1 mx-1"
                      :src="comment_icon"
                      alt="comment icon"
                    />
                  </template>
                  <span>Comment</span>
                </v-tooltip>
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
                      color="#302277"
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
                      @click="(setTaskId = item.task_id), CheckTaskStatus(item)"
                      >mdi-checkbox-marked</v-icon
                    >
                  </template>
                  <span>Mark as Incomplete</span>
                </v-tooltip>

                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      class="logo-text-color pointer"
                      v-bind="attrs"
                      v-on="on"
                    >
                      mdi-dots-vertical
                    </v-icon>
                  </template>

                  <v-list
                    max-height="200"
                    class="pointer overflow-scroll"
                    width="70px"
                  >
                    <div
                      class="d-flex status-list-min-height caption listing-hover pointer"
                    >
                      <v-list-item-content class="d-flex justify-center">
                        Edit
                      </v-list-item-content>
                    </div>
                    <v-divider
                      v-if="item.assigned_by.id == getLoggedInUser.id"
                    ></v-divider>
                    <div
                      v-if="item.assigned_by.id == getLoggedInUser.id"
                      @click="deleteTaskEntry(item)"
                      class="d-flex status-list-min-height caption listing-hover pointer"
                    >
                      <v-list-item-content class="d-flex justify-center">
                        Delete
                      </v-list-item-content>
                    </div>
                  </v-list>
                </v-menu>
              </div>
            </v-layout>
          </template>
          <!-- Task Title -->
          <template v-slot:[`item.title`]="{ item }">
            <div style="min-width: 280px">
              <input
                class="edit-title-field pl-2"
                v-model="taskTitle"
                placeholder="Add Title"
                v-if="
                  selectedTask == item.task_id &&
                  (getSelectedCompany.role != 'employee' ||
                    item.assigned_by.id == getLoggedInUser.id)
                "
                @keydown.enter="editTaskTitle(item)"
                autofocus
                @blur="myblur(item)"
              />
              <p
                v-else
                :class="[
                  { 'thin red--text font-italic': !item.title },
                  item.assigned_by.id != getLoggedInUser.id &&
                  getSelectedCompany.role == 'employee'
                    ? ''
                    : 'pointer',
                ]"
                class="d-flex align-center ml-2 ma-0"
                @click="selectTask(item)"
              >
                <v-tooltip bottom color="#302277">
                  <template v-slot:activator="{ on }">
                    <span
                      class="d-inline-block text-truncate text-capitalize"
                      :style="
                        $vuetify.breakpoint.xl
                          ? 'max-width:20vw'
                          : 'max-width: 300px'
                      "
                      v-on="on"
                    >
                      {{ item.title ? item.title : "no title" }}
                    </span>
                  </template>
                  <span class="text-capitalize">
                    {{ item.title ? item.title : "no title" }}</span
                  >
                </v-tooltip>
              </p>
            </div>
          </template>
        </v-data-table>
      </div>
      <!-- Pagination -->
      <div
        class="caption d-flex w-100 align-center"
        :class="$vuetify.breakpoint.xs ? 'px-1  my-2' : 'px-4'"
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
            :style="$vuetify.breakpoint.xs ? 'width: 55px;' : 'width: 72px;'"
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
              :items="[5, 10, 25, 50, 100]"
              v-model="perPage"
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
            <v-list-item class="listing-hover pointer" @click="download('xls')">
              <img
                src="@/assets/images/Excel_icon.png"
                height="18px"
                class="mr-1"
              />
              <v-list-item-title class="listing-hover">Excel</v-list-item-title>
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
            v-model="page"
            :length="getTasksPagination.last_page"
            circle
            :total-visible="$vuetify.breakpoint.xs ? 3 : 5"
            @input="fetchPage(page)"
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
    <AddMember @close="dialog = false" :dialog.sync="dialog" />
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
import AddMember from "@/components/TeamMembers/AddMember";
import UserInfo from "@/components/TeamMembers/UserInfo";
import { eventBus } from "@/main";
import _ from "lodash";
import Swal from "sweetalert2";

export default {
  name: "TaskList",
  props: ["headers"],

  components: {
    AddMember,
    profileImage,
    CommentsDialogBox,
    UserInfo,
    TaskConflict: () =>
      import("@/components/Tasks/TaskConflict/SelectionModal"),
    TaskEntries: () => import("@/components/Tasks/TaskEntries"),
  },
  data() {
    return {
      assignedToDropdown: false,
      assignedByDropdown: false,
      projectsDropdown: false,
      editProjectName: "",
      editIcon: null,
      tasksDropdown: false,
      taskTitle: "",
      comment_icon: require("@/assets/images/comment-icon.svg"),
      dates: [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")],
      showAllTasks: "By Me",
      absolute: true,
      dialog: false,
      searchProject: null,
      projectBtn: true,
      selectedInterval: null,
      pending: false,
      conflicts: [],
      running: null,
      openTaskConflictDialog: false,
      stop: false,
      openCommentDialog: false,
      details: null,
      selectedTask: null,
      dateRangeValue: null,
      selectedDateItem: "Last 7 days",
      dropdownList: [
        { text: "Today" },
        { text: "Yesterday" },
        { text: "Last 7 days" },
        { text: "Last 30 days" },
        { text: "This month" },
      ],
      statusList: [
        { text: "pending" },
        { text: "completed" },
        { text: "active" },
        { text: "overdue" },
      ],
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
      selectedAssignedBy: null,
      selectedProject: null,
      selectedAssignedTo: null,
      searchedTitle: null,
      searchedStatus: null,
      sortAssignedToMember: "desc",
      sortAssignedByMember: "desc",
      sortProjects: "desc",
      sortDueDate: "desc",
      sortAssignedDate: "desc",
      sortTitles: "desc",
      activeColumn: "created_at",
      page: 1,
      perPage: 25,
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
    ]),
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
    // Number of pages
    paginationLength() {
      return Math.ceil(
        this.getTasksPagination.total / this.getTasksPagination.per_page
      );
    },
  },

  methods: {
    myblur(task) {
      this.selectedTask = !task.task_id;
    },
    // when click oustide the text field when update text field show
    blur(project) {
      project.edit = false;
      project.id != this.editIcon;
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
      this.showAllTasks = option;
      this.searchData()
        .then(() => {
          this.tasksDropdown = false;
        })
        .catch(() => {
          this.snackbar = true;
          this.updateTaskError = true;
          this.snackbarMessage = "Error fetching tasks by others";
        });
    },
    // Select task for editing title
    selectTask(task) {
      this.selectedTask = task.task_id;
      this.taskTitle = task.title;
    },
    // Export data table to CSV ofr xls
    download(format) {
      exportTable.download("tasks", "v-data-table-task", format);
    },

    CheckTaskStatus(item) {
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
      if (!this.isMember(task)) return timer.format(task.members[0].duration);
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
      if (this.getPendingTimer) {
        this.$store.commit("setCommentSkeletonLoader", false);
        return this.$store.commit("setComments", []);
      }
      let data = {
        task_id: this.details.task_id,
        company_id: this.getSelectedCompany.id,
      };
      this.$store.commit("setCommentSkeletonLoader", true);
      this.$store.dispatch("fetchComments", data);
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
      if (trimTitle.length > 0) {
        let body = {
          project_id: data.project ? data.project.id : null,
          company_id: this.getSelectedCompany.id,
          task_id: data.task_id,
          title: trimTitle,
        };
        this.$store
          .dispatch("updateTask", body)
          .then((res) => {
            this.search = null;
            this.snackbar = true;
            this.snackbarMessage = res.data.error_msg;
            this.updateTaskError = false;
            if (
              this.getActiveTask &&
              this.getActiveTask.task_id == data.task_id
            )
              eventBus.$emit("titleUpdated", trimTitle);
          })
          .catch((error) => {
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
      } else {
        return;
      }
    },

    // Assign member to task
    assign(task_id, member_id) {
      if (this.pending) return;
      this.pending = "assign";
      this.$store
        .dispatch("assignMember", {
          task_id,
          member_id,
        })
        .then(() => {
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
      this.disableStatusIcon = true;
      this.updateStatusLoader = true;
      let body = {
        project_id: taskData.project ? taskData.project.id : null,
        company_id: this.getSelectedCompany.id,
        task_id: taskData.task_id,
        status: this.setTaskStatus,
      };
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

    // This function returns search filters if applied
    getSearchFilters() {
      return {
        search_col: {
          project_id: this.selectedProject ? this.selectedProject.id : null,
          assigned_by: this.selectedAssignedBy
            ? this.selectedAssignedBy.id
            : null,
          assigned_to: this.selectedAssignedTo
            ? this.selectedAssignedTo.id
            : null,
          title: this.searchedTitle,
          status: this.searchedStatus,
        },
        sort: {
          order_by: "desc",
          column_name: "created_at",
        },
        show_all: this.showAllTasks == "By Others" ? true : false,
      };
    },

    //Column Search for Task
    searchData() {
      return new Promise((resolve, reject) => {
        var body = this.getSearchFilters();
        body.start_date = this.startTime;
        body.end_date = this.endTime;
        this.$store
          .dispatch("fetchTasks", body)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    searchDateRangeTasks() {
      var body = this.getSearchFilters();
      body.start_date = this.startTime;
      body.end_date = this.endTime;
      this.$store.dispatch("fetchTasks", body);
    },

    sortColumn(col_name, order_name) {
      let body = this.getSearchFilters();
      this.activeColumn = col_name;
      body.sort = {
        order_by: order_name,
        column_name: col_name,
      };
      this.$store.dispatch("fetchTasks", body);
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

    openNewTaskComments(value) {
      if (value) {
        if (this.getPendingTimer) {
          this.openCommentModal(this.getPendingTimer);
        } else {
          this.openCommentModal(this.getTasks[0]);
        }
      }
    },
    deleteTaskEntry(item) {
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
          this.$store
            .dispatch("deleteTaskEntry", item.task_id)
            .then((response) => {
              this.snackbar = true;
              this.snackbarMessage = response.data.error_msg;
              this.updateTaskError = false;
            })
            .catch((error) => {
              if (error.response.status == 422) {
                this.snackbar = true;
                this.snackbarMessage = error.response.data.error_msg;
                this.updateTaskError = true;
              }
              if (error.response.status == 403) {
                this.snackbar = true;
                this.snackbarMessage = error.response.data.error_msg;
                this.updateTaskError = true;
              }
            });
        }
      });
    },
    getSelectedDates(value) {
      //select Today
      if (value == "Today") {
        this.startTime = this.getCurrentDate();
        this.endTime = this.getCurrentDate();
        this.dateRangeValue = "Today";
      }
      //select Yesterday
      else if (value == "Yesterday") {
        this.startTime = this.getYesterdayDate();
        this.endTime = this.getYesterdayDate();
        this.dateRangeValue = "Yesterday";
      }
      //select last 7 days
      else if (value == "Last 7 days") {
        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 6);
        let date = last7Days.toISOString().substr(0, 10);
        this.startTime = date;
        this.endTime = new Date().toISOString().substr(0, 10);
        this.dateRangeValue = "Last 7 days";
      }
      //select last 30 days
      else if (value == "Last 30 days") {
        const today = new Date();
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 29);
        let date = last30Days.toISOString().substr(0, 10);
        this.startTime = date;
        this.endTime = new Date().toISOString().substr(0, 10);
        this.dateRangeValue = "Last 30 days";
      }
      //select last month
      else if (value == "This month") {
        var date = new Date(),
          y = date.getFullYear(),
          m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        firstDay.setDate(firstDay.getDate() + 1);
        lastDay.setDate(lastDay.getDate() + 1);
        let startDay = firstDay.toISOString().substr(0, 10);
        let endDay = lastDay.toISOString().substr(0, 10);
        this.startTime = startDay;
        this.endTime = endDay;
        this.dateRangeValue = "This month";
      }
      this.selectedDateItem = value;
      this.searchDateRangeTasks();
    },

    // Fetch new page
    fetchPage(value) {
      if (value) {
        var body = this.getSearchFilters();
        body.page = value;
        this.$store.dispatch("fetchTasks", body);
      }
    },
    // Validate start and end times for manual entry
    validateTimeEntries() {
      // if date range is inverted
      moment(this.dates[1]).isBefore(this.dates[0])
        ? ([this.dates[0], this.dates[1]] = [this.dates[1], this.dates[0]])
        : () => {};

      var start = moment(
        `${this.dates[0] ? this.dates[0] : this.dates[1]} ${this.startTime}:00`,
        "YYYY-MM-DD HH:mm:ss"
      );
      var stop = moment(
        `${this.dates[1] ? this.dates[1] : this.dates[0]} ${this.stopTime}:00`,
        "YYYY-MM-DD HH:mm:ss"
      );

      return {
        start,
        stop,
        duration: moment.duration(stop.diff(start)).asSeconds(),
      };
    },
  },

  watch: {
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
      handler: _.debounce(function () {
        this.searchData();
      }, 1000),
      deep: true,
    },
    // Inform 'Start Task' component to start/stop task if active task is changed
    getActiveTask(value) {
      value ? (this.stop = false) : () => {};
    },

    // Change in per page display
    perPage(value) {
      if (value) {
        var body = this.getSearchFilters();
        body.per_page = value;
        this.$store.dispatch("fetchTasks", body);
      }
    },

    // Update pages
    getTasksPagination(value) {
      this.page = value.current_page;
      this.perPage = value.per_page;
    },
  },

  mounted() {
    eventBus.$on("companySwitched", () => {
      this.selectedAssignedTo = null;
      this.selectedAssignedBy = null;
      this.selectedProject = null;
      this.searchedStatus = null;
      this.searchedTitle = null;
      this.selectedDateItem = "Last 7 days";
      this.dateRangeValue = "Last 7 days";
      this.showAllTasks = "By Me";
    });
    if (localStorage.getItem("statusFilter")) {
      this.searchedStatus = localStorage.getItem("statusFilter");
      localStorage.removeItem("statusFilter");
    }
    if (localStorage.getItem("memberFilter")) {
      this.selectedAssigedTo = localStorage.getItem("memberFilter");
      localStorage.removeItem("memberFilter");
    }

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

    // Event raised when a new task is assigned to some member
    // This event triggers comments dialog for the newly assigned task
    eventBus.$on("newTaskAssigned", this.openNewTaskComments);

    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 6);
    let date = last7Days.toISOString().substr(0, 10);
    this.startTime = date;
    this.endTime = new Date().toISOString().substr(0, 10);

    this.openCommentDialog = false;
    this.dateRangeValue = "Last 7 days";

    if (localStorage.getItem("dateRangeFilter")) {
      this.dateRangeValue = localStorage.getItem("dateRangeFilter");
      localStorage.removeItem("dateRangeFilter");
    }
    this.searchData();
  },

  beforeDestroy() {
    eventBus.$off("retry");
    eventBus.$off("newTaskAssigned");
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
.border {
  border: 1px solid rgb(201, 196, 196);
  border-radius: 5;
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
  color: #28806d !important;
}
.green-chip-color {
  color: #28806d !important;
  background-color: #e4f6f2 !important;
}
.yellow-chip-color {
  color: #8e6a01 !important;
  background-color: #fffae5 !important;
}
.red-chip-color {
  color: red !important;
  background-color: rgb(253, 235, 235) !important;
}
.yellow-chip {
  color: #8e6a01 !important;
}
.red-chip {
  color: red !important;
}
.no-date {
  color: grey !important;
}
.no-date-chip {
  color: grey !important;
  background-color: rgb(238, 235, 235) !important;
}
.blue-chip-color {
  color: #0076d1 !important;
  background-color: #d4ecff !important;
}
.edit-title-field {
  border: 1px #2a206a solid;
  border-radius: 5px;
  height: 30px;
}
.listing-hover .v-list-item {
  min-height: 30px !important;
}
</style>
