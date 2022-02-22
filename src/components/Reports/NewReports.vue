<template>
  <div class="mx-4 mb-3">
    <!-- Filter(s) Row -->
    <div
      :class="[{ 'theme-border': getSelectedCompany.role != 'employee' }]"
      id="filter-row"
      style="overflow: scroll"
      class="d-flex align-center my-1 mt-2 pa-2"
    >
      <div
        v-if="getSelectedCompany.role != 'employee'"
        class="d-flex align-center"
      >
        <v-icon v-if="$vuetify.breakpoint.xs" class="dusty-purple-text"
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
          <v-menu content-class="bg-color" close-on-click offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="#1CC283"
                class="text-capitalize"
                text
                v-bind="attrs"
                v-on="on"
                tile
                @click="searchTeamLead = null"
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
              autocomplete="off"
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
            <v-list class="overflow-scroll" scrollable max-height="210">
              <div
                class="pointer listing-hover d-flex list-item-min-height"
                :class="!selectedTeamLead ? 'bg-selected' : ''"
                @click="selectedTeamLead = null"
              >
                <profileImage
                  v-show="':username'"
                  inline
                  username="All"
                  :size="23"
                  :userProfile="true"
                  :circular="true"
                  class="ml-4 text-light"
                >
                </profileImage>
                <v-list-item-content class="caption ml-2 text-capitalize">
                  All Team Leads
                </v-list-item-content>
                <v-icon
                  small
                  color="#1cc283"
                  class="mr-3"
                  v-text="!selectedTeamLead ? 'mdi-check-box-outline' : ''"
                ></v-icon>
              </div>
              <div
                class="pointer listing-hover d-flex list-item-min-height"
                :class="
                  selectedTeamLead && selectedTeamLead.id == teamLead.id
                    ? 'bg-selected'
                    : ''
                "
                v-for="teamLead in filteredTeamLeads"
                :key="teamLead.id"
                @click="selectTeamLead(teamLead)"
              >
                <profileImage
                  v-show="teamLead.image ? ':src' : ':username'"
                  :src="teamLead.image"
                  inline
                  :username="teamLead.name ? teamLead.name : teamLead.email"
                  :size="23"
                  :userProfile="true"
                  :circular="true"
                  class="ml-4 text-light"
                ></profileImage>
                <v-list-item-content
                  style="max-width: 160px"
                  class="caption ml-2 text-capitalize"
                >
                  {{ teamLead.name ? teamLead.name : teamLead.email }}
                </v-list-item-content>
                <v-icon
                  small
                  color="#1cc283"
                  class="mr-3"
                  v-text="
                    selectedTeamLead && selectedTeamLead.id == teamLead.id
                      ? 'mdi-check-box-outline'
                      : ''
                  "
                ></v-icon>
              </div>

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
        <!-- Project Menu -->
        <div class="vertical-dotted-border px-1">
          <v-menu content-class="bg-color" offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="#1CC283"
                class="text-capitalize"
                text
                v-bind="attrs"
                v-on="on"
                @click="searchProject = null"
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
            <v-list class="overflow-scroll" scrollable max-height="210">
              <v-list-item-group>
                <div
                  class="pointer listing-hover d-flex list-item-min-height"
                  :class="!selectedProject ? 'bg-selected' : ''"
                  @click="selectedProject = null"
                >
                  <profileImage
                    v-show="':username'"
                    inline
                    username="All"
                    :size="23"
                    :userProfile="true"
                    :circular="true"
                    class="ml-4 text-light"
                  >
                  </profileImage>
                  <v-list-item-content class="caption ml-2 text-capitalize">
                    All Projects
                  </v-list-item-content>
                  <v-icon
                    small
                    color="#1cc283"
                    class="mr-3"
                    v-text="!selectedProject ? 'mdi-check-box-outline' : ''"
                  ></v-icon>
                </div>
                <div
                  class="pointer listing-hover d-flex list-item-min-height"
                  :class="
                    selectedProject && selectedProject.id == project.id
                      ? 'bg-selected'
                      : ''
                  "
                  v-for="project in projectsList"
                  :key="project.id"
                  :id="project.id"
                  @click="
                    selectedProject && selectedProject.id == project.id
                      ? (selectedProject = null)
                      : (selectedProject = project)
                  "
                >
                  <profileImage
                    inline
                    :username="project.name"
                    :size="23"
                    :circular="true"
                    class="ml-4 text-light"
                  >
                  </profileImage>
                  <v-list-item-content
                    style="max-width: 160px"
                    class="caption ml-2 text-capitalize"
                  >
                    {{ project.name }}
                  </v-list-item-content>
                  <v-icon
                    small
                    color="#1cc283"
                    class="mr-3"
                    v-text="
                      selectedProject && selectedProject.id == project.id
                        ? 'mdi-check-box-outline'
                        : ''
                    "
                  ></v-icon>
                </div>
              </v-list-item-group>
              <div v-if="searchProject && projectsList && !projectsList.length">
                <p class="no-results-found my-1">No results found</p>
              </div>
            </v-list>
          </v-menu>
        </div>
        <div class="vertical-dotted-border px-1">
          <v-menu content-class="bg-color" offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="#1CC283"
                class="text-capitalize"
                text
                v-bind="attrs"
                v-on="on"
                @click="searchMember = null"
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
              autocomplete="off"
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
            <v-list class="overflow-scroll" scrollable max-height="210">
              <div
                class="pointer listing-hover d-flex list-item-min-height"
                :class="!selectedMember ? 'bg-selected' : ''"
                @click="selectedMember = null"
              >
                <profileImage
                  v-show="':username'"
                  inline
                  username="All"
                  :size="23"
                  :userProfile="true"
                  :circular="true"
                  class="ml-4 text-light"
                >
                </profileImage>
                <v-list-item-content class="caption ml-2 text-capitalize">
                  All Members
                </v-list-item-content>
                <v-icon
                  small
                  color="#1cc283"
                  class="mr-3"
                  v-text="!selectedMember ? 'mdi-check-box-outline' : ''"
                ></v-icon>
              </div>
              <div
                class="pointer listing-hover d-flex list-item-min-height"
                v-for="member in teamMembersList"
                :key="member.id"
                :id="member.id"
                @click="
                  selectedMember && selectedMember.id == member.id
                    ? (selectedMember = null)
                    : (selectedMember = member)
                "
                :class="
                  selectedMember
                    ? selectedMember.id == member.id
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
                  class="ml-4 text-light"
                ></profileImage>
                <v-list-item-content
                  style="max-width: 160px"
                  class="d-inline-block text-truncate caption ml-2 text-capitalize"
                >
                  {{ member.name ? member.name : member.email }}
                </v-list-item-content>
                <v-icon
                  small
                  color="#1cc283"
                  class="mr-3"
                  v-text="
                    selectedMember && selectedMember.id == member.id
                      ? 'mdi-check-box-outline'
                      : ''
                  "
                ></v-icon>
              </div>

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
      </div>
      <v-spacer></v-spacer>
      <!-- 'Export As' Menu -->
      <v-menu offset-y>
        <template #activator="{ on: onMenu }">
          <v-tooltip color="#302277" bottom>
            <template #activator="{ on: onTooltip }">
              <v-btn
                height="38"
                class="text-capitalize mx-2 d-flex align-center theme-border mr-3"
                text
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
    <div>
      <v-data-table
        id="v-data-table-reports"
        :height="
          $vuetify.breakpoint.md
            ? 'calc(100vh - 223px)'
            : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
            ? 'calc(100vh - 320px)'
            : 'calc(100vh - 223px)'
        "
        fixed-header
        :headers="headers"
        :mobile-breakpoint="0"
        :loading="true"
        loading-text="No data available"
        :items-per-page="perPage"
        :page="currentPage"
        :search="search"
        :items="filteredMemberEntries"
        disable-sort
        class="elevation-1 mb-1 table-height mt-4"
        
        hide-default-footer
      >
        <template v-slot:[`header.name`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
          </div>
        </template>
        <template v-slot:[`header.email`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
          </div>
        </template>
        <template v-slot:[`header.role`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
            <v-icon
              @click="
                roleSort == 'asc'
                  ? $store.commit('setRoleSorting', (roleSort = 'desc'))
                  : roleSort == 'desc'
                  ? $store.commit('setRoleSorting', (roleSort = 'asc'))
                  : $store.commit('setRoleSorting', (roleSort = 'asc'))
              "
              color="#2a206a"
              class="pointer"
              small
            >
              {{ roleSort == "asc" ? " mdi-arrow-up" : " mdi-arrow-down" }}
            </v-icon>
          </div>
        </template>
        <template v-slot:[`header.completed`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
            <v-icon
              @click="
                completedSort == 'asc'
                  ? $store.commit(
                      'setCompletedTaskSorting',
                      (completedSort = 'desc')
                    )
                  : completedSort == 'desc'
                  ? $store.commit(
                      'setCompletedTaskSorting',
                      (completedSort = 'asc')
                    )
                  : $store.commit(
                      'setCompletedTaskSorting',
                      (completedSort = 'asc')
                    )
              "
              color="#2a206a"
              class="pointer"
              small
            >
              {{ completedSort == "asc" ? " mdi-arrow-up" : " mdi-arrow-down" }}
            </v-icon>
          </div>
        </template>
        <template v-slot:[`header.pending`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
            <v-icon
              @click="
                pendingSort == 'asc'
                  ? $store.commit(
                      'setPendingTaskSorting',
                      (pendingSort = 'desc')
                    )
                  : pendingSort == 'desc'
                  ? $store.commit(
                      'setPendingTaskSorting',
                      (pendingSort = 'asc')
                    )
                  : $store.commit(
                      'setPendingTaskSorting',
                      (pendingSort = 'asc')
                    )
              "
              color="#2a206a"
              class="pointer"
              small
            >
              {{ pendingSort == "asc" ? " mdi-arrow-up" : " mdi-arrow-down" }}
            </v-icon>
          </div>
        </template>
        <template v-slot:[`header.overdue`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
            <v-icon
              @click="
                overdueSort == 'asc'
                  ? $store.commit(
                      'setOverdueTaskSorting',
                      (overdueSort = 'desc')
                    )
                  : overdueSort == 'desc'
                  ? $store.commit(
                      'setOverdueTaskSorting',
                      (overdueSort = 'asc')
                    )
                  : $store.commit(
                      'setOverdueTaskSorting',
                      (overdueSort = 'asc')
                    )
              "
              color="#2a206a"
              class="pointer"
              small
            >
              {{ overdueSort == "asc" ? " mdi-arrow-up" : " mdi-arrow-down" }}
            </v-icon>
          </div>
        </template>
        <template v-slot:[`header.time_spent`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
            <v-icon
              @click="
                timeSpentSort == 'asc'
                  ? $store.commit('setTimeSpentSort', (timeSpentSort = 'desc'))
                  : timeSpentSort == 'desc'
                  ? $store.commit('setTimeSpentSort', (timeSpentSort = 'asc'))
                  : $store.commit('setTimeSpentSort', (timeSpentSort = 'asc'))
              "
              color="#2a206a"
              class="pointer"
              small
            >
              {{ timeSpentSort == "asc" ? " mdi-arrow-up" : " mdi-arrow-down" }}
            </v-icon>
          </div>
        </template>
        <v-progress-linear
          v-show="fetchLinearLoader"
          slot="progress"
          color="#2a206a"
          indeterminate
        ></v-progress-linear>
        <template v-slot:[`body.prepend`]="{ headers }">
          <tr>
            <td v-for="(header, i) in headers" :key="i">
              <div v-if="header.value == 'name'" class="sub-header">
                <div class="inputContainer">
                  <v-icon small class="ml-1 mt-3"> mdi-magnify </v-icon>
                  <input
                    v-model="searchedName"
                    type="text"
                    size="15"
                    id="name-search"
                    class="header-search-input-field mb-1 mt-2 rounded-2 inp-width"
                    placeholder="Search..."
                  />
                </div>
              </div>
              <div
                width="80px"
                v-if="header.value == 'email'"
                class="sub-header"
              >
                <div class="inputContainer">
                  <v-icon small class="ml-1 mt-3"> mdi-magnify </v-icon>
                  <input
                    v-model="searchedEmail"
                    type="text"
                    size="15"
                    id="email-search"
                    class="header-search-input-field mb-1 mt-2 rounded-2 inp-width"
                    placeholder="Search..."
                  />
                </div>
              </div>
              <div
                width="80px"
                v-if="header.value == 'role'"
                class="sub-header"
              >
                <div class="inputContainer">
                  <v-icon small class="ml-1 mt-3"> mdi-magnify </v-icon>
                  <input
                    v-model="searchedRole"
                    type="text"
                    size="15"
                    id="role-search"
                    class="header-search-input-field mb-1 mt-2 rounded-2 inp-width"
                    placeholder="Search..."
                  />
                </div>
              </div>
            </td>
          </tr>
        </template>

        <!-- Name Column -->
        <template v-slot:[`item.name`]="{ item }">
          <span v-if="item.image || item.name" class="pa-2 d-flex">
            <v-tooltip content-class="ma-0 pa-0 tooltip-opacity" left>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <profileImage
                    v-show="item.image ? ':src' : ':username'"
                    :src="item.image"
                    inline
                    :username="item.name"
                    :size="30"
                    :userProfile="true"
                    :circular="true"
                    class="mt-2"
                  >
                  </profileImage>
                </div>
              </template>

              <!-- Display User info on hover -->
              <UserInfo
                :image="item.image"
                :name="item.name"
                :email="item.email"
                :role="item.role"
                :designation="item.designation"
                :department="item.department"
                :joining_date="item.joining_date"
              />
            </v-tooltip>
            <v-list-item-content class="ml-3 text--transform">
              <v-tooltip color="#6C5CD6" bottom>
                <template v-slot:activator="{ on }">
                  <span
                    v-on="on"
                    class="d-inline-block text-truncate text-capitalize"
                    style="max-width: 100px"
                  >
                    {{ item.name }}
                  </span>
                </template>
                <span>
                  {{ item.name }}
                </span>
              </v-tooltip>
            </v-list-item-content>
          </span>
          <span class="grey--text mx-10" v-else>
            <i>No name</i>
          </span>
        </template>

        <!-- Email Column -->
        <template v-slot:[`item.email`]="{ item }">
          <span style="max-width: 150px" class="d-inline-block text-truncate">
            {{ item.email }}
          </span>
        </template>

        <!-- Role Column -->
        <template v-slot:[`item.role`]="{ item }">
          <span class="role-name-on-hover pointer text--transform">
            {{ item.role }}
          </span>
        </template>

        <!-- Completed Column -->
        <template v-slot:[`item.pending`]="{ item }">
          <v-chip
            @click="redirect(item, 'pending')"
            class="count-status-chip d-flex justify-center pointer"
            label
            small
            dark
            color="yellow-chip-color-report"
          >
            <span>
              {{ item.pending }}
            </span>
          </v-chip>
        </template>
        <!-- Pending Column -->
        <template v-slot:[`item.completed`]="{ item }">
          <v-chip
            @click="redirect(item, 'completed')"
            class="count-status-chip d-flex justify-center pointer"
            label
            small
            dark
            color="green-chip-color-report"
          >
            <span>
              {{ item.completed }}
            </span>
          </v-chip>
        </template>
        <!-- Overdue Column -->
        <template v-slot:[`item.overdue`]="{ item }">
          <v-chip
            @click="redirect(item, 'overdue')"
            class="count-status-chip d-flex justify-center pointer"
            label
            small
            dark
            color="red-chip-color-report"
          >
            <span>
              {{ item.overdue }}
            </span>
          </v-chip>
        </template>
        <!--Time Spent Column -->
        <template v-slot:[`item.time_spent`]="{ item }">
          <span>
            {{ item.total_time }}
          </span>
        </template>
      </v-data-table>
      <div class="d-flex align-center">
        <div class="d-flex align-center caption">
          <span
            class="my-2"
            :class="
              $vuetify.breakpoint.xs ? 'v-selector-text-sm' : 'v-selector-text'
            "
            >View:</span
          >
          <div style="width: 70px">
            <v-select
              hide-details
              dense
              class="pt-0 pb-2 caption"
              :class="
                $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                  ? 'px-1'
                  : 'px-2'
              "
              :items="[5, 10, 25, 50, 100]"
              :value="perPage"
              @change="changePerPage"
            />
          </div>
          <span
            class="my-2 d-none d-sm-flex"
            :class="
              $vuetify.breakpoint.xs ? 'v-selector-text-sm' : 'v-selector-text'
            "
            >rows per page</span
          >
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex">
          <span class="v-selector-text">
            Showing
            {{ currentPage ? currentPage : 0 }}-{{
              paginationLength ? paginationLength : 0
            }}
            of
            {{ filteredMemberEntries ? filteredMemberEntries.length : 0 }}
            {{ $vuetify.breakpoint.xs ? "" : "entries" }}
          </span>
          <v-pagination
            id="pagination"
            :value="currentPage"
            :length="paginationLength"
            circle
            :total-visible="$vuetify.breakpoint.xs ? 3 : 5"
            @input="selectPage"
          ></v-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import exportTable from "@/table-export.js";
import UserInfo from "@/components/TeamMembers/UserInfo";
import profileImage from "@/components/includes/ProfileImage";
import JsonExcel from "vue-json-excel";
export default {
  name: "Reports",
  components: {
    profileImage,
    UserInfo,
    downloadExcel: JsonExcel,
  },
  data() {
    return {
      // Search filters
      currentPage: 1,
      perPage: 10,
      fetchLinearLoader: false,
      searchedName: null,
      searchedEmail: null,
      searchedRole: null,
      searchedProject: null,
      search: null,
      completedSort: null,
      pendingSort: null,
      overdueSort: null,
      roleSort: null,
      timeSpentSort: null,
      searchTeamLead: null,
      searchProject: null,
      searchMember: null,
      selectedProject: null,
      selectedTeamLead: null,
      selectedMember: null,
      selectedDates: [],
      selectedDateItem: "Yesterday",
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
      headers: [
        {
          text: "Name",
          value: "name",
          sortable: false,
          class: "light-purple-bg px-3",
          cellClass: "px-0",
          width: "80px",
        },
        {
          text: "Email",
          value: "email",
          class: "light-purple-bg px-0",
          sortable: false,
          cellClass: "px-0",
          width: "80px",
        },

        {
          text: "Role",
          value: "role",
          class: "light-purple-bg px-0",
          sortable: false,
          width: "80px",
          cellClass: "px-0",
        },
        {
          text: "Completed",
          value: "completed",
          class: "light-purple-bg px-0",
          sortable: false,
          cellClass: "px-0",
          width: "100px",
        },
        {
          text: "Pending",
          value: "pending",
          class: "light-purple-bg px-0",
          sortable: false,
          cellClass: "px-0",
          width: "100px",
        },
        {
          text: "Overdue",
          value: "overdue",
          class: "light-purple-bg px-0",
          sortable: false,
          cellClass: "px-0",
          width: "100px",
        },
        {
          text: "Time Spent",
          value: "time_spent",
          class: "light-purple-bg px-0",
          sortable: false,
          cellClass: "px-0",
          width: "100px",
        },
      ],
      excel_fields: {
        details: {
          labels: {
            Name: "Name",
            Email: "Email",
            Role: "Role",
            Completed_Tasks: "Completed_Tasks",
            Pending_Tasks: "Pending_Tasks",
            Overdue_Tasks: "Overdue_Tasks",
            Total_Time: "Total_Time",
          },
          fields: [
            "Name",
            "Email",
            "Role",
            "Completed_Tasks",
            "Pending_Tasks",
            "Overdue_Tasks",
            "Total_Time",
          ],
          dataFile: "Reports.xls",
        },
      },
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
    // Number of pages
    paginationLength() {
      return Math.ceil(this.filteredMemberEntries.length / this.perPage);
    },

    filteredMemberEntries() {
      if (this.getReports) {
        if (this.searchedName) {
          return this.getReports.filter((item) => {
            return item.name &&
              item.name.toLowerCase().includes(this.searchedName.toLowerCase())
              ? true
              : false;
          });
        } else if (this.searchedEmail) {
          return this.getReports.filter((item) => {
            return item.email &&
              item.email
                .toLowerCase()
                .includes(this.searchedEmail.toLowerCase())
              ? true
              : false;
          });
        } else if (this.searchedRole) {
          return this.getReports.filter((item) => {
            return item.role &&
              item.role.toLowerCase().includes(this.searchedRole.toLowerCase())
              ? true
              : false;
          });
        } else {
          return this.getReports;
        }
      }
      return [];
    },

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
          moment().subtract(1, "day").format("YYYY-MM-DD"),
          moment().subtract(1, "day").format("YYYY-MM-DD"),
        ];
      if (this.selectedDateItem == "Last 7 days")
        return [
          moment().subtract(6, "day").format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      if (this.selectedDateItem == "Last 30 days")
        return [
          moment().subtract(29, "day").format("YYYY-MM-DD"),
          moment().format("YYYY-MM-DD"),
        ];
      else if (this.customRange)
        return [
          moment(this.customRange[0]).format("YYYY-MM-DD"),
          moment(this.customRange[1]).format("YYYY-MM-DD"),
        ];
      return [];
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
      let rawData = this.getReports;
      let json = [];
      if (rawData) {
        rawData.forEach((member) => {
          let mem = {};
          mem.Name = member.name
            ? member.name.charAt(0).toUpperCase() + member.name.slice(1)
            : member.email;
          mem.Email = member.email;
          (mem.Role = member.role
            ? member.role.charAt(0).toUpperCase() + member.role.slice(1)
            : ""),
            (mem.Completed_Tasks = member.completed);
          mem.Pending_Tasks = member.pending;
          mem.Overdue_Tasks = member.overdue;
          mem.Total_Time = member.total_time;
          json.push(mem);
        });
      }
      return json;
    },
  },
  methods: {
    // Select page to view members
    selectPage(value) {
      this.currentPage = value;
    },
    // Change per page value to show for pagination
    changePerPage(value) {
      this.perPage = value;
    },
    // Redirection to Task Page
    redirect(item, status) {
      this.$store.commit("setTaskFilter", {
        status,
        assigned_to: item,
        start_date: this.dateRange[0],
        end_date: this.dateRange[1],
        show_tasks: this.getSelectedCompany.role == "employee" ? "me" : "all",
        redirect: status == "pending" ? true : false,
        project_id: null,
        assigned_by: null,
      });
      this.$store.commit("setTaskDateFilter", this.selectedDateItem);
      window.open("task");
    },
    // Select team lead
    selectTeamLead(teamLead) {
      if (this.selectedTeamLead && this.selectedTeamLead.id == teamLead.id) {
        this.selectedTeamLead = null;
      } else {
        this.selectedMember = null;
        this.selectedTeamLead = teamLead;
      }
    },

    // Expand all panels
    // expandAll() {
    //   this.selectedPanel = [...Array(this.getReports.length).keys()].map(
    //     (k, i) => i
    //   );
    // },
    // Export data table to CSV ofr xls
    download(format) {
      exportTable.ReportsTableExport(this.getReports, "Reports", format);
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
    var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    if (mac) {
      document
        .getElementById("v-data-table-reports")
        .classList.add("edited_scrollbar");
    } else {
      return;
    }
    this.teamMembers = this.getAllMembers.filter((item) => {
      return item.id != this.getLoggedInUser.id;
    });
    this.teamMembers.unshift(this.getLoggedInUser);
    this.fetchLinearLoader = true;
    this.$store.dispatch("fetchReports").then(() => {
      this.fetchLinearLoader = false;
      // this.expandAll();
    });
  },
  watch: {
    dateRange() {
      this.roleSort = null;
      this.completedSort = null;
      this.pendingSort = null;
      this.overdueSort = null;
      this.timeSpentSort = null;
      this.fetchLinearLoader = true;
      this.$store.dispatch("fetchReports", this.getSearchFilters()).then(() => {
        this.fetchLinearLoader = false;
      });
    },
    selectedProject() {
      this.fetchLinearLoader = true;
      this.$store.dispatch("fetchReports", this.getSearchFilters()).then(() => {
        this.fetchLinearLoader = false;
      });
    },
    selectedTeamLead(value) {
      this.fetchLinearLoader = true;
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
      this.$store.dispatch("fetchReports", this.getSearchFilters()).then(() => {
        this.fetchLinearLoader = false;
      });
    },
    selectedMember() {
      this.fetchLinearLoader = true;
      this.$store.dispatch("fetchReports", this.getSearchFilters()).then(() => {
        this.fetchLinearLoader = false;
      });
    },
  },
};
</script>

<style scoped>
.green-chip-color-report {
  font-size: 12px;
  font-weight: bold;
  color: #1f6153 !important;
  background-color: #c6ebe4 !important;
}
.yellow-chip-color-report {
  font-size: 12px;
  font-weight: bold;
  color: #7f5f01 !important;
  background-color: #fff0b3 !important;
}
.red-chip-color-report {
  font-size: 12px;
  font-weight: bold;
  color: #961d41 !important;
  background-color: #f3becf !important;
}
.v-progress-linear {
  background: transparent;
  overflow: hidden;
  position: initial;
  transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  width: 100%;
}
.inp-width {
  width: 110px !important;
}
.light-purple-border {
  border: 1px #edebf9 solid;
  color: #757096;
}
.inputContainer i {
  position: absolute;
}

.date-width {
  width: 150px !important;
}

.confirm-button {
  background-color: #ffb7b7;
}
.t-color {
  color: grey;
  text-align: center !important;
  align-content: center !important;
}
.overflow-scroll {
  overflow: scroll;
}
.search-field-radius {
  border-radius: 5px;
}
.sub-header {
  position: relative;
  margin: 0 auto;
}
.date-range-dropdown {
  min-height: 32px;
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
.sub-checkboxLabel {
  font-size: 12px !important;
}
.count-status-chip {
  width: 40px !important;
}
.bg-color {
  background-color: white !important;
}
</style>
