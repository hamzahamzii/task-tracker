<template>
  <div>
    <div
      :class="
        $vuetify.breakpoint.md
          ? 'table-width-2'
          : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
          ? ''
          : getSidebarMini
          ? 'table-width-5'
          : 'table-width'
      "
    >
      <v-data-table
        :height="
          $vuetify.breakpoint.md
            ? 'calc(100vh - 221px)'
            : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
            ? 'calc(100vh - 320px)'
            : 'calc(100vh - 221px)'
        "
        id="archived-members-table"
        fixed-header
        :headers="headers"
        :items-per-page="perPage"
        :page="currentPage"
        :items="filteredArchivedMembers ? filteredArchivedMembers : []"
        :mobile-breakpoint="0"
        :search="search"
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
        <template v-slot:[`header.action`]="{ header }">
          <div class="header-text-color">
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
                    v-model="searchedName"
                    type="text"
                    size="15"
                    id="name-search"
                    class="header-search-input-field mb-1 mt-2 rounded-2"
                    placeholder="Search..."
                  />
                </div>
              </div>
              <div v-if="header.value == 'email'" class="sub-header">
                <div class="inputContainer">
                  <v-icon small class="ml-1 mt-3"> mdi-magnify </v-icon>
                  <input
                    v-model="searchedEmail"
                    type="text"
                    size="15"
                    id="email-search"
                    class="header-search-input-field mb-1 mt-2 rounded-2"
                    placeholder="Search..."
                  />
                </div>
              </div>
            </td>
          </tr>
        </template>
        <template v-slot:[`item.name`]="{ item }">
          <span v-if="item.image || item.name" class="pt-3 d-flex">
            <v-tooltip content-class="ma-0 pa-0 tooltip-opacity" right>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <profileImage
                    v-show="item.image ? ':src' : ':username'"
                    :src="item.image"
                    inline
                    :username="item.name"
                    :userProfile="true"
                    :size="30"
                    :circular="true"
                    class="my-1 text-light d-inline mr-2"
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
            <span class="mt-1 mx-1">{{ item.name }}</span>
          </span>
          <span class="grey--text mx-10" v-else>
            <i>No name</i>
          </span>
        </template>
        <!-- Email Column -->
        <template v-slot:[`item.email`]="{ item }">
          <span style="max-width: 160px" class="d-inline-block text-truncate">
            {{ item.email }}
          </span>
        </template>

        <template v-slot:[`item.joining_date`]="{ item }">
          <span v-if="item.joining_date">
            {{ joinDate(item.joining_date) }}
          </span>
        </template>

        <template v-slot:[`item.resign_date`]="{ item }">
          <span v-if="item.resign_date">
            {{ joinDate(item.resign_date) }}
          </span>
        </template>
        <template v-slot:[`item.last_working_date`]="{ item }">
          <span v-if="item.last_working_date">
            {{ joinDate(item.last_working_date) }}
          </span>
        </template>
        <!-- Item Slot -->
        <template v-slot:[`item.action`]="{ item }">
          <v-menu offset-y max-height="30px" :close-on-content-click="false">
            <template v-slot:activator="{ on, attrs }">
              <v-tooltip v-on="on" color="#302277" bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    class="logo-text-color"
                    icon
                    @click="restoreMember(item)"
                    ><v-icon>mdi-restore</v-icon></v-btn
                  >
                </template>
                <span>Restore</span></v-tooltip
              >
            </template>
          </v-menu>
        </template>
      </v-data-table>
      <div class="d-flex align-center">
        <div class="per-page d-flex align-center caption">
          <span v-show="!$vuetify.breakpoint.xs">View:</span>
          <v-select
            hide-details
            dense
            class="pt-0 pb-2 caption"
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm ? 'px-1' : 'px-2'
            "
            :items="[5, 10, 25, 50, 100]"
            :value="perPage"
            @change="changePerPage"
          />
        </div>
        <v-spacer></v-spacer>
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
</template>
<script>
import { mapGetters } from "vuex";
import exportTable from "@/table-export.js";
import profileImage from "../includes/ProfileImage";
import UserInfo from "@/components/TeamMembers/UserInfo";
import moment from "moment";
import Swal from "sweetalert2";
import JsonExcel from "vue-json-excel";
export default {
  components: {
    UserInfo,
    profileImage,
    downloadExcel: JsonExcel,
  },
  data: () => ({
    currentPage: 1,
    perPage: 25,
    restoreDialog: false,
    search: null,
    details: null,
    menu: false,
    addRoleModal: false,
    date: new Date().toISOString().substr(0, 10),
    searchedName: null,
    searchedEmail: null,
    headers: [
      {
        text: "Name",
        value: "name",
        sortable: false,
        class: "light-purple-bg",
        cellClass: "px-0",
        width: "80px",
      },
      {
        text: "Email",
        value: "email",
        class: "light-purple-bg",
        sortable: false,
        cellClass: "px-0",
        width: "80px",
      },
      {
        text: "Total Hours",
        value: "total_time",
        class: "light-purple-bg",
        sortable: false,
        cellClass: "px-0",
        width: "80px",
      },
      {
        text: "Join Date",
        value: "joining_date",
        class: "light-purple-bg",
        sortable: false,
        cellClass: "px-0",
        width: "80px",
      },
      {
        text: "Resign Date",
        value: "resign_date",
        class: "light-purple-bg",
        sortable: false,
        cellClass: "px-0",
        width: "80px",
      },
      {
        text: "Last Working Date",
        value: "last_working_date",
        class: "light-purple-bg",
        sortable: false,
        cellClass: "px-0",
        width: "80px",
      },
      {
        text: "Action",
        value: "action",
        class: "light-purple-bg",
        sortable: false,
        cellClass: "px-0",
        width: "80px",
      },
    ],
    excel_fields: {
      details: {
        labels: {
          Name: "Name",
          Email: "Email",
          Total_Time: "Total Time",
          Joining_Date: "Joining Date",
          Resign_Date: "Resign Date",
          Last_Working_Date: "Last Working Date",
        },
        fields: [
          "Name",
          "Email",
          "Total_Time",
          "Joining_Date",
          "Resign_Date",
          "Last_Working_Date",
        ],
        dataFile: "Archive Members.xls",
      },
    },
    items: [],
    openEditMemberDialog: false,
    openPayrollDialog: false,
  }),

  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getArchievedmembers",
      "getSidebarMini",
    ]),
    // Number of pages
    paginationLength() {
      return Math.ceil(this.filteredArchivedMembers.length / this.perPage);
    },

    // Filtered Archived Members
    filteredArchivedMembers() {
      if (this.getArchievedmembers) {
        if (this.searchedName) {
          return this.getArchievedmembers.filter((item) => {
            return item.name &&
              item.name.toLowerCase().includes(this.searchedName.toLowerCase())
              ? true
              : false;
          });
        } else if (this.searchedEmail) {
          return this.getArchievedmembers.filter((item) => {
            return item.email &&
              item.email
                .toLowerCase()
                .includes(this.searchedEmail.toLowerCase())
              ? true
              : false;
          });
        } else {
          return this.getArchievedmembers;
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

    detailsJson: function () {
      let rawData = this.getArchievedmembers;
      let json = [];
      rawData.forEach((member) => {
        let mem = {};
        mem.Name = member.name
          ? member.name.charAt(0).toUpperCase() + member.name.slice(1)
          : "no name";
        mem.Email = member.email;
        mem.Total_Time = member.total_time;
        mem.Joining_Date = member.joining_date
          ? moment(member.joining_date).format("DD-MM-YYYY")
          : "";
        mem.Resign_Date = member.resign_date
          ? moment(member.resign_date).format("DD-MM-YYYY")
          : "";
        mem.Last_Working_Date = member.last_working_date
          ? moment(member.last_working_date).format("DD-MM-YYYY")
          : "";
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
    // Export data table to CSV ofr xls
    download(format) {
      exportTable.ArchiveTeamMemberTableExport(
        this.getArchievedmembers,
        "Archived Members",
        format
      );
    },

    // Restore archived member
    restoreMember(row) {
      let member = row;
      Swal.fire({
        title: "Are you sure?",
        html: "Restore this member",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Restore",
        reverseButtons: true,
      }).then((result) => {
        this.$store.commit("setMemberRestore", {
          company_id: this.getSelectedCompany.id,
          employee_id: row.id,
          archived: false,
        });
        if (result.value) {
          this.$store
            .dispatch("fetchRestoreMember", {
              company_id: this.getSelectedCompany.id,
              employee_id: row.id,
              archived: false,
            })
            .then(() => {
              this.$store.dispatch("fetchTeamMembers");
            })
            .catch(() => {
              this.$store.state.archivedMembers.unshift(member);
            });
        }
      });
    },
    joinDate(date) {
      var join_res = moment(date).format("Do, MMM YYYY");
      return join_res;
    },
  },
  mounted() {
    var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    if (mac) {
      document
        .getElementById("archived-members-table")
        .classList.add("edited_scrollbar");
    } else {
      return;
    }
  },
};
</script>

<style scoped>
.inputContainer i {
  position: absolute;
}
.sub-header {
  position: relative;
  margin: 0 auto;
}
.per-page {
  width: 70px !important;
}
</style>
