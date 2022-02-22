<template>
  <div>
    <div class="mx-3 mb-2">
      <v-row no-gutters>
        <v-col
          :class="$vuetify.breakpoint.xs ? 'my-1' : ''"
          class="d-flex justify-end align-end"
        >
          <v-menu offset-y>
            <template #activator="{ on: onMenu }">
              <v-tooltip color="#302277" bottom>
                <template #activator="{ on: onTooltip }">
                  <v-btn
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
              <v-list-item
                class="listing-hover pointer"
                @click="download('csv')"
              >
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
          <v-btn
            v-show="
              $vuetify.breakpoint.md ||
                $vuetify.breakpoint.lg ||
                $vuetify.breakpoint.xl
            "
            @click="dialog = true"
            depressed
            class="btn-success pa-2 text-capitalize mx-2 white--text"
          >
            <v-icon class="mr-2">mdi-plus-box</v-icon>
            Invite Members</v-btn
          >
          <v-btn
            v-show="
              $vuetify.breakpoint.md ||
                $vuetify.breakpoint.lg ||
                $vuetify.breakpoint.xl
            "
            @click="openProjectDialog = true"
            outlined
            class="theme-outlined-btn text-capitalize pointer"
            :class="getSelectedCompany.role == 'team-manager' ? 'd-none' : ''"
          >
            Assign Projects
          </v-btn>
          <v-tooltip bottom color="#302277">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-show="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
                :class="
                  getSelectedCompany.role == 'team-manager' ? 'd-none' : ''
                "
                v-on="on"
                v-bind="attrs"
                class="mx-1 mt-3"
                depressed
                outlined
                height="36px"
                color="#dcd8f3"
                small
                @click="dialog = true"
              >
                <img
                  src="@/assets/images/add_member_icon.svg"
                  height="25px"
                /> </v-btn
            ></template>
            <span>Add Member</span>
          </v-tooltip>
          <v-tooltip bottom color="#302277">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-show="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
                :class="
                  getSelectedCompany.role == 'team-manager' ? 'd-none' : ''
                "
                v-on="on"
                v-bind="attrs"
                class="mx-1 mt-3"
                depressed
                outlined
                height="36px"
                color="#dcd8f3"
                small
                @click="openProjectDialog = true"
              >
                <img
                  src="@/assets/images/add_projects_icon.svg"
                  height="25px"
                /> </v-btn
            ></template>
            <span>Assign Project</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <AddMember @close="dialog = false" :dialog.sync="dialog" />
    </div>
    <div>
      <!-- data table -->
      <v-data-table
        :height="
          $vuetify.breakpoint.md
            ? 'calc(100vh - 221px)'
            : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
            ? 'calc(100vh - 320px)'
            : 'calc(100vh - 221px)'
        "
        id="active-members-table"
        fixed-header
        :headers="headers"
        :mobile-breakpoint="0"
        :items="
          getSelectedCompany.role == 'team-manager'
            ? roleSort || completedSort || pendingSort || overdueSort
              ? sortedTeamLeadMembers
              : sortedTeamLeadMembers
            : roleSort || completedSort || pendingSort || overdueSort
            ? sortedCompanyEmployees.filter((item) => {
                return item.id != getLoggedInUser.id;
              })
            : filteredMemberEntries.filter((item) => {
                return item.id != getLoggedInUser.id;
              })
        "
        :items-per-page="perPage"
        :page="currentPage"
        :search="search"
        disable-sort
        class="elevation-1 table-height"
        :item-class="
          (item) => {
            return item.just_added ? 'bg-selected  elevation-3' : '';
          }
        "
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
        <template v-slot:[`header.today_time`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
          </div>
        </template>
        <template v-slot:[`header.weekly_time`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
          </div>
        </template>
        <template v-slot:[`header.monthly_time`]="{ header }">
          <div class="header-text-color">
            {{ header.text }}
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
        <template v-slot:[`header.action`]="{ header }">
          <div
            v-if="
              getSelectedCompany.role == 'owner' ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project) ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  getSelectedCompany.permissions.project) ||
                getSelectedCompany.role == 'team-manager'
            "
            class="header-text-color"
          >
            {{ header.text }}
          </div>
        </template>
        <template v-slot:[`body.prepend`]="{ headers }">
          <tr>
            <td v-for="(header, i) in headers" :key="i">
              <div v-if="header.value == 'name'" class="sub-header">
                <div class="inputContainer">
                  <v-icon small class="ml-1 mt-3"> mdi-magnify </v-icon>
                  <input
                    autocomplete="off"
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
                    autocomplete="off"
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
                    autocomplete="off"
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
        <!-- Today time -->
        <template v-slot:[`item.today_time`]="{ item }">
          {{ item.today_time ? item.today_time : "00:00:00" }}
        </template>
        <!-- Weekly time -->
        <template v-slot:[`item.weekly_time`]="{ item }">
          {{ item.weekly_time ? item.weekly_time : "00:00:00" }}
        </template>
        <!-- Monthly time -->
        <template v-slot:[`item.monthly_time`]="{ item }">
          {{ item.monthly_time ? item.monthly_time : "00:00:00" }}
        </template>
        <!-- Email Column -->
        <template v-slot:[`item.email`]="{ item }">
          <span style="max-width: 150px" class="d-inline-block text-truncate">
            {{ item.email }}
          </span>
        </template>
        <!-- Role Column -->
        <template v-slot:[`item.role`]="{ item }">
          <span
            @click="
              (getSelectedCompany.role == 'owner' ||
                getSelectedCompany.role == 'admin') &&
              item.role != 'owner'
                ? ((details = item), (rolesDialog = true))
                : ''
            "
            :class="
              (getSelectedCompany.role == 'owner' ||
                getSelectedCompany.role == 'admin') &&
              item.role != 'owner'
                ? 'pointer'
                : ''
            "
          >
            <v-icon
              :class="
                (getSelectedCompany.role == 'owner' ||
                  getSelectedCompany.role == 'admin') &&
                item.role != 'owner'
                  ? ''
                  : 'd-none'
              "
              small
              class="logo-text-color pointer"
            >
              mdi-plus-circle-outline
            </v-icon>
            <span class="role-name-on-hover text--transform">
              {{ item.role }}
            </span>
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
            color="yellow-chip-color-team"
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
            color="green-chip-color-team"
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
            color="red-chip-color-team"
          >
            <span>
              {{ item.overdue }}
            </span>
          </v-chip>
        </template>
        <!-- Action Column -->
        <template v-slot:[`item.action`]="{ item }">
          <!-- edit icon -->
          <v-layout>
            <v-tooltip color="#302277" bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-if="
                    getSelectedCompany.role == 'owner' ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        !getSelectedCompany.permissions.project) ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        getSelectedCompany.permissions.project)
                  "
                  v-on="on"
                  small
                  class="logo-text-color"
                  icon
                  @click="editUserInfo(item)"
                >
                  <v-icon small> mdi-circle-edit-outline</v-icon>
                </v-btn>
              </template>
              <span> Edit member's profile</span>
            </v-tooltip>
            <!-- payroll icon -->
            <v-tooltip color="#302277" bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-if="
                    getSelectedCompany.role == 'owner' ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        !getSelectedCompany.permissions.project) ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        getSelectedCompany.permissions.project)
                  "
                  v-on="on"
                  small
                  class="logo-text-color"
                  icon
                  @click="
                    openPayrollModal(item);
                    $store.dispatch('fetchCurrencies');
                    fetchPayroll(item);
                  "
                  ><v-icon small>mdi-cash</v-icon></v-btn
                >
              </template>
              <span>Payroll settings</span>
            </v-tooltip>
            <!-- Assign Members -->
            <v-tooltip color="#302277" bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-if="getSelectedCompany.role == 'team-manager'"
                  v-on="on"
                  small
                  class="logo-text-color"
                  icon
                  @click="
                    getSelectedCompany.role == 'team-manager' &&
                    item.role != 'owner'
                      ? ((details = item), (openAssignDialog = true))
                      : ''
                  "
                  ><v-icon small>mdi-account-check</v-icon></v-btn
                >
              </template>
              <span>Assign Members</span>
            </v-tooltip>
            <!-- archive icon -->
            <v-tooltip color="#302277" bottom>
              <template v-slot:activator="{ on }">
                <div
                  v-if="
                    getSelectedCompany.role == 'owner' ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        !getSelectedCompany.permissions.project) ||
                      (getSelectedCompany.role == 'admin' &&
                        getSelectedCompany.permissions.team_member &&
                        getSelectedCompany.permissions.project)
                  "
                  v-on="on"
                >
                  <v-menu offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        v-bind="attrs"
                        v-on="on"
                        small
                        class="logo-text-color"
                        >mdi-dots-vertical</v-icon
                      >
                    </template>
                    <v-list class="grey lighten-3">
                      <div class="px-1 pa-2" @click="archiveMember(item)">
                        <v-list-item-title class="pointer caption red--text"
                          ><v-icon class="mx-1" color="red" x-small>
                            mdi-archive-arrow-down</v-icon
                          >Archive</v-list-item-title
                        >
                      </div>
                    </v-list>
                  </v-menu>
                </div>
              </template>
              <span>Actions</span>
            </v-tooltip>
          </v-layout>
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
            {{
              getSelectedCompany.role == "team-manager"
                ? sortedTeamLeadMembers
                  ? sortedTeamLeadMembers.length
                  : 0
                : sortedCompanyEmployees
                ? sortedCompanyEmployees.length
                : 0
            }}
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
      <!-- MODALS -->
      <!-- Assign Project Modal -->
      <template v-if="openProjectDialog">
        <AssignProject
          :projectDetails="projectDetails"
          :openProjectDialog.sync="openProjectDialog"
        />
      </template>
      <!-- Edit Member Modal -->
      <template v-if="openEditMemberDialog">
        <EditMember
          :openEditMemberDialog.sync="openEditMemberDialog"
          :memberDetails="details"
        />
      </template>
      <!-- Payroll Modal -->
      <template v-if="openPayrollDialog">
        <SetPayroll
          :openPayrollDialog.sync="openPayrollDialog"
          :memberDetails="details"
          :fetchPayRollLoader.sync="fetchPayRollLoader"
        />
      </template>
      <template v-if="openAssignDialog">
        <AssignMembers
          v-if="getSelectedCompany.role == 'team-manager'"
          :openAssignDialog.sync="openAssignDialog"
          :memberDetails="details"
        />
      </template>

      <RolesAndPermissions
        v-if="getSelectedCompany.role != 'team-manager'"
        @close="rolesDialog = false"
        :rolesDialog.sync="rolesDialog"
        :memberDetails="details"
      />
      <!-- Snackbars -->
      <v-snackbar
        class="mt-5"
        top
        right
        :color="selectionError ? 'red lighten-5' : 'green lighten-5'"
        light
        v-model="snackbar"
      >
        <span :class="selectionError ? 'red--text' : 'green--text'">
          {{ snackbarMessage }}</span
        >
        <template v-slot:action="{ attrs }">
          <v-btn
            :color="selectionError ? 'red' : 'green'"
            text
            v-bind="attrs"
            @click="snackbar = false"
            small
            fab
          >
            <v-icon small> mdi-close </v-icon></v-btn
          >
        </template>
      </v-snackbar>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import exportTable from "@/table-export.js";
import EditMember from "@/components/TeamMembers/Actions/EditMember";
import SetPayroll from "@/components/TeamMembers/Actions/SetPayroll";
import profileImage from "../includes/ProfileImage";
import RolesAndPermissions from "@/components/TeamMembers/Actions/RolesAndPermissions";
import UserInfo from "@/components/TeamMembers/UserInfo";
import AssignMembers from "@/components/TeamMembers/Actions/AssginMembers";
import AddMember from "./AddMember";
import Swal from "sweetalert2";
import moment from "moment";
import JsonExcel from "vue-json-excel";

export default {
  components: {
    UserInfo,
    EditMember,
    profileImage,
    SetPayroll,
    AddMember,
    RolesAndPermissions,
    AssignMembers,
    AssignProject: () => import("@/components/TeamMembers/AssignProject"),
    downloadExcel: JsonExcel,
  },
  data: () => ({
    currentPage: 1,
    perPage: 25,
    sortedMembers: null,
    logInUser: null,
    teamLeadMembers: [],
    completedSort: null,
    pendingSort: null,
    overdueSort: null,
    roleSort: null,
    rolesDialog: false,
    snackbar: false,
    snackbarMessage: null,
    selectionError: null,
    search: null,
    dialog: false,
    details: null,
    menu: false,
    searchedName: null,
    searchedEmail: null,
    searchedRole: null,
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
        text: "Today Hours",
        value: "today_time",
        class: "light-purple-bg px-0",
        sortable: false,
        cellClass: "px-0",
        width: "95px",
      },
      {
        text: "Weekly Hours",
        value: "weekly_time",
        class: "light-purple-bg px-0",
        sortable: false,
        cellClass: "px-0",
        width: "95px",
      },
      {
        text: "Monthly Hours",
        value: "monthly_time",
        class: "light-purple-bg px-0",
        sortable: false,
        cellClass: "px-0",
        width: "95px",
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
        text: "Action",
        value: "action",
        class: "light-purple-bg px-0",
        sortable: false,
        cellClass: "px-0",
        width: "100px",
      },
    ],
    openEditMemberDialog: false,
    openPayrollDialog: false,
    openAssignDialog: false,
    openProjectDialog: false,
    fetchPayRollLoader: false,
    projectDetails: null,
    excel_fields: {
      details: {
        labels: {
          Name: "Name",
          Email: "Email",
          Role: "Role",
          Today_Hours: "Today Hours",
          Weekly_Hours: "Weekly Hours",
          Monthly_Hours: "Monthly Hours",
          Completed_Tasks: "Completed Tasks",
          Pending_Tasks: "Pending Tasks",
          Overdue_Tasks: "Overdue Tasks",
        },
        fields: [
          "Name",
          "Email",
          "Role",
          "Today_Hours",
          "Weekly_Hours",
          "Monthly_Hours",
          "Completed_Tasks",
          "Pending_Tasks",
          "Overdue_Tasks",
        ],
        dataFile: "Active Members.xls",
      },
    },
  }),

  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getAllMembers",
      "getJustAddedMembers",
      "getLoggedInUser",
      "getProjects",
      "getSidebarMini",
      "getCompanyEmployees",
      "getTeamLeadMembers",
    ]),

    // Number of pages
    paginationLength() {
      return Math.ceil(
        (this.getSelectedCompany.role == "team-manager"
          ? this.sortedTeamLeadMembers.length
          : this.sortedCompanyEmployees.filter((item) => {
              return item.id != this.getLoggedInUser.id;
            }).length) / this.perPage
      );
    },

    // Members filtered by 'name' or 'email' search
    filteredMemberEntries() {
      if (this.getJustAddedMembers.concat(this.getAllMembers)) {
        if (this.searchedName) {
          return this.getJustAddedMembers
            .concat(this.getAllMembers)
            .filter((item) => {
              return item.name &&
                item.name
                  .toLowerCase()
                  .includes(this.searchedName.toLowerCase())
                ? true
                : false;
            });
        } else if (this.searchedEmail) {
          return this.getJustAddedMembers
            .concat(this.getAllMembers)
            .filter((item) => {
              return item.email &&
                item.email
                  .toLowerCase()
                  .includes(this.searchedEmail.toLowerCase())
                ? true
                : false;
            });
        } else if (this.searchedRole) {
          return this.getJustAddedMembers
            .concat(this.getAllMembers)
            .filter((item) => {
              return item.role &&
                item.role
                  .toLowerCase()
                  .includes(this.searchedRole.toLowerCase())
                ? true
                : false;
            });
        } else {
          return this.getJustAddedMembers.concat(this.getAllMembers);
        }
      }
      return [];
    },

    // Sorted Company Members search by 'name' or 'email'
    sortedCompanyEmployees() {
      if (this.getCompanyEmployees) {
        if (this.searchedName) {
          return this.getCompanyEmployees.filter((item) => {
            return item.name &&
              item.name.toLowerCase().includes(this.searchedName.toLowerCase())
              ? true
              : false;
          });
        } else if (this.searchedEmail) {
          return this.getCompanyEmployees.filter((item) => {
            return item.email &&
              item.email
                .toLowerCase()
                .includes(this.searchedEmail.toLowerCase())
              ? true
              : false;
          });
        } else if (this.searchedRole) {
          return this.getCompanyEmployees.filter((item) => {
            return item.role &&
              item.role.toLowerCase().includes(this.searchedRole.toLowerCase())
              ? true
              : false;
          });
        } else {
          return this.getCompanyEmployees;
        }
      }
      return [];
    },

    // Sorted Team Lead Members search by 'name' or 'email'
    sortedTeamLeadMembers() {
      if (this.sortedMembers) {
        if (this.searchedName) {
          return this.sortedMembers.filter((item) => {
            return item.name &&
              item.name.toLowerCase().includes(this.searchedName.toLowerCase())
              ? true
              : false;
          });
        } else if (this.searchedEmail) {
          return this.sortedMembers.filter((item) => {
            return item.email &&
              item.email
                .toLowerCase()
                .includes(this.searchedEmail.toLowerCase())
              ? true
              : false;
          });
        } else if (this.searchedRole) {
          return this.sortedMembers.filter((item) => {
            return item.role &&
              item.role.toLowerCase().includes(this.searchedRole.toLowerCase())
              ? true
              : false;
          });
        } else {
          return this.sortedMembers;
        }
      }
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

    detailsJson: function() {
      let rawData = this.getAllMembers;
      let json = [];
      rawData.forEach((member) => {
        let mem = {};
        mem.Name = member.name
          ? member.name.charAt(0).toUpperCase() + member.name.slice(1)
          : "no name";
        mem.Email = member.email;
        (mem.Role = member.role
          ? member.role.charAt(0).toUpperCase() + member.role.slice(1)
          : ""),
          (mem.Today_Hours = member.today_time);
        mem.Weekly_Hours = member.weekly_time;
        mem.Monthly_Hours = member.monthly_time;
        mem.Completed_Tasks = member.completed;
        mem.Pending_Tasks = member.pending;
        mem.Overdue_Tasks = member.overdue;
        json.push(mem);
      });
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
      this.dateRangeValue = ["2000-01-01", moment().format("YYYY-MM-DD")];
      this.$store.commit("setTaskFilter", {
        status,
        assigned_to: item,
        start_date: this.dateRangeValue[0],
        end_date: this.dateRangeValue[1],
        show_tasks: "all",
        project_id: null,
        assigned_by: null,
        redirect: status == "pending" ? true : false,
      });
      this.$store.commit("setTaskDateFilter", "All the time");
      this.$router.push({ name: "task" });
    },
    // Export data table to CSV ofr xls
    download(format) {
      exportTable.ActiveTeamMemberTableExport(
        this.getAllMembers,
        "Active Members",
        format
      );
    },

    copyText() {
      let input = document.getElementById("copy-link-field");
      input.select();
      document.execCommand("copy");
    },

    editUserInfo(row) {
      this.$store.dispatch("fetchDepartments", {
        company_id: this.getSelectedCompany.id,
      });
      this.openEditMemberDialog = true;
      this.details = row;
    },
    openPayrollModal(row) {
      this.openPayrollDialog = true;
      this.details = row;
    },
    openRolelModal(row) {
      this.details = row;
    },
    archiveMember(row) {
      let member = row;
      Swal.fire({
        title: "Are you sure?",
        html: "Archive this member",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Archive",
        reverseButtons: true,
      }).then((result) => {
        this.$store.commit("setMemberArchive", {
          company_id: this.getSelectedCompany.id,
          employee_id: row.id,
          archived: true,
        });
        if (result.value) {
          this.$store
            .dispatch("archiveMember", {
              company_id: this.getSelectedCompany.id,
              employee_id: row.id,
              archived: true,
            })
            .then(() => {
              this.$store.dispatch("fetchArchieveMembers");
            })
            .catch(() => {
              this.$store.commit("setAddMembers", [member]);
            });
        }
      });
    },
    fetchPayroll(item) {
      this.$store.commit("setFetchPayRollLoader", true);
      this.$store
        .dispatch("fetchPayroll", {
          user_id: item.id,
          company_id: this.getSelectedCompany.id,
        })
        .then((response) => {
          if (response.status == 200) {
            this.$store.commit("setFetchPayRollLoader", false);
          }
        })
        .catch((error) => {
          if (error.response.status == 422) {
            this.$store.commit("setFetchPayRollLoader", false);
          }
        });
    },

    // Applies range filter after a custom range has been selected
  },
  mounted() {
    var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    if (mac) {
      document
        .getElementById("active-members-table")
        .classList.add("edited_scrollbar");
    } else {
      return;
    }
    this.$store.dispatch("fetchTeamMembers");
    this.teamLeadMembers = this.getTeamLeadMembers.filter((item) => {
      return item.id != this.getLoggedInUser.id;
    });
    this.logInUser = this.getTeamLeadMembers.find((item) => {
      return item.id == this.getLoggedInUser.id;
    });
    this.sortedMembers = [this.logInUser].concat(this.teamLeadMembers);
  },
  watch: {
    getTeamLeadMembers() {
      this.teamLeadMembers = this.getTeamLeadMembers.filter((item) => {
        return item.id != this.getLoggedInUser.id;
      });
      this.logInUser = this.getTeamLeadMembers.find((item) => {
        return item.id == this.getLoggedInUser.id;
      });
      this.sortedMembers = [this.logInUser].concat(this.teamLeadMembers);
    },
  },
};
</script>

<style scoped>
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
.role-name-on-hover:hover {
  text-decoration-line: underline;
  color: #2a206a !important;
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

.green-chip-color-team {
  font-size: 12px;
  font-weight: bold;
  color: #1f6153 !important;
  background-color: #c6ebe4 !important;
}
.yellow-chip-color-team {
  font-size: 12px;
  font-weight: bold;
  color: #7f5f01 !important;
  background-color: #fff0b3 !important;
}
.red-chip-color-team {
  font-size: 12px;
  font-weight: bold;
  color: #961d41 !important;
  background-color: #f3becf !important;
}
</style>
