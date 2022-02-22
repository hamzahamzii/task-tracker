<template>
  <div>
    <v-snackbar
      class="mt-5"
      top
      right
      :color="updateProfileError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="updateProfileError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="updateProfileError ? 'red' : 'green'"
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
    <v-dialog v-model="flag" width="350">
      <v-card tile class="white">
        <!-- Title bar -->
        <v-card-title
          class="py-3 px-4 text-truncate dialog-title-border ui-theme-color"
        >
          <div class="d-flex justify-center" style="width: 90%">
            <span>
              <b class="modals-title-size">
                Edit Member's Profile
              </b>
            </span>
          </div>

          <v-spacer></v-spacer>
          <v-icon small color="#757096" @click="closeDialog">mdi-close</v-icon>
        </v-card-title>
        <!-- Edit Member Form -->
        <v-card-text class="mt-5">
          <v-form ref="form" v-model="valid" lazy-validation>
            <!-- name -->
            <v-text-field
              autocomplete="off"
              color="#2a206a"
              outlined
              dense
              v-model="editName"
              label="Name"
            ></v-text-field>
            <!-- email -->
            <v-text-field
              autocomplete="off"
              color="#2a206a"
              outlined
              dense
              v-model="editEmail"
              :rules="emailRules"
              label="Email"
              disabled
            ></v-text-field>
            <!-- designation -->
            <v-text-field
              autocomplete="off"
              color="#2a206a"
              outlined
              dense
              v-model="editDesignation"
              label="Designation"
            ></v-text-field>

            <v-autocomplete
              v-if="getDepartments"
              @click="departmentBtn = true"
              color="#2a206a"
              :items="getDepartments"
              dense
              outlined
              v-model="memberDetails.department"
              @update:search-input="setSearchQuery"
              flat
              solo
              item-value="name"
              item-text="name"
              label="Department"
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
                      :size="30"
                    ></profileimage>
                  </span>
                  <span
                    class="d-inline-block text-truncate pointer ml-2 mt-1"
                    style="max-width: 150px"
                  >
                    {{ item.name }}
                  </span>
                </div>
              </template>
              <template v-slot:selection="{ item }">
                <div class="mx-2">
                  {{ item.name }}
                </div></template
              >
              <template v-slot:append-item>
                <div
                  v-if="departmentBtn"
                  class="d-flex justify-center align-center"
                >
                  <v-btn
                    v-model="departmentBtn"
                    @click="dep ? createDepartment() : (departmentBtn = false)"
                    color="#EEF0F6"
                    width="270"
                    class="listing-hover mx-2 my-2 text-capitalize"
                  >
                    <v-icon class="mx-1">mdi-plus</v-icon> Add New
                    Department</v-btn
                  >
                </div>
                <v-text-field
                  autocomplete="off"
                  v-else
                  class="pa-0 ma-0"
                  v-model="departmentCreation"
                  prepend-inner-icon="mdi-plus"
                  color="#2a206a"
                  background-color="#F8F7FD"
                  hide-details
                  autofocus
                  solo
                  dense
                  flat
                  @keydown.enter="createDepartment()"
                >
                  <template v-slot:append>
                    <div class="font-size pa-0 ma-0" color="#2a206a">
                      *press enter to add
                    </div>
                  </template>
                </v-text-field>
              </template>
            </v-autocomplete>

            <!-- Date of Joining -->
            <div class="d-flex">
              <div class="d-inline-flex">
                <v-menu
                  ref="menu"
                  :close-on-content-click="false"
                  v-model="joiningDateMenu"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      autocomplete="off"
                      color="#2a206a"
                      v-model="editjoiningDate"
                      label="Date of Joining"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    color="#2a206a"
                    no-title
                    v-model="editjoiningDate"
                    scrollable
                    @input="joiningDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </div>
              <!-- Date of Resignation -->
              <div class="d-inline-flex">
                <v-menu
                  ref="menu"
                  v-model="resignationDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  :nudge-left="$vuetify.breakpoint.xs ? '140' : ''"
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      autocomplete="off"
                      color="#2a206a"
                      v-model="editresignationDate"
                      label="Date of Resignation"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>

                  <v-date-picker
                    color="#2a206a"
                    no-title
                    v-model="editresignationDate"
                    scrollable
                    @input="resignationDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <!-- save button -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            tile
            class="px-2 theme-outlined-btn text-capitalize d-inline-block text-truncate"
            text
            @click="closeDialog()"
            >Cancel
          </v-btn>
          <v-btn
            class="white--text btn-success text-capitalize"
            color="darken-1"
            text
            tile
            @click="updateUser()"
            >Save Changes
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
// import moment from "moment";
export default {
  components: {
    profileimage,
  },
  data: () => ({
    departmentCreation: null,
    departmentBtn: true,
    flag: true,
    updatedUser: "",
    editName: "",
    editEmail: "",
    editDesignation: "",
    editjoiningDate: null,
    editresignationDate: null,
    dep: null,
    depName: null,
    valid: true,
    resignationDateMenu: false,
    snackbar: false,
    snackbarMessage: null,
    updateProfileError: null,
    joiningDateMenu: false,
    joiningDate: null,
    resignationDate: null,
    loader: false,
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
  }),
  props: ["openEditMemberDialog", "memberDetails"],
  mounted() {
    this.editName = this.memberDetails.name;
    this.editEmail = this.memberDetails.email;
    this.editDesignation = this.memberDetails.designation;
    this.editjoiningDate = this.memberDetails.joining_date;
    this.editresignationDate = this.memberDetails.resign_date;
  },
  computed: {
    ...mapGetters(["getSelectedCompany", "getDepartments"]),
  },
  watch: {
    flag(value) {
      !value ? this.$emit("update:openEditMemberDialog", false) : () => {};
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:openEditMemberDialog", false);
    },
    createDepartment() {
      if (this.dep || this.departmentCreation) {
        this.$store
          .dispatch("createDepartment", {
            company_id: this.getSelectedCompany.id,
            name: this.dep ? this.dep : this.departmentCreation,
          })
          .then(() => {
            this.departmentCreation = null;
            this.dep = null;
            this.departmentBtn = true;
            this.snackbar = true;
            this.snackbarMessage = "Department created successfully";
            this.updateProfileError = false;
          })
          .catch((error) => {
            if (error.response.status == 422) {
              this.snackbar = true;
              this.snackbarMessage = error.response.data.errors.name[0];
              this.updateProfileError = true;
            }
          });
      } else {
        this.snackbar = true;
        this.snackbarMessage = "Please enter the name of the department";
        this.updateProfileError = true;
      }
    },
    setSearchQuery(item) {
      this.dep = item;
    },
    updateUser() {
      this.loader = true;
      let department = this.getDepartments.find((item) => {
        return this.memberDetails.department
          ? item.name == this.memberDetails.department
          : null;
      });
      let data = {
        company_id: this.getSelectedCompany.id,
        employee_id: this.memberDetails.id,
        name: this.editName,
        email: this.email,
        department: department ? department.id : null,
        designation: this.editDesignation,
        joining_date: this.editjoiningDate,
        resign_date: this.editresignationDate,
      };
      this.$store
        .dispatch("updateSingleUser", data)
        .then((response) => {
          if (response.status == 200) {
            this.loader = false;
            this.snackbar = true;
            this.snackbarMessage = response.data.error_msg;
            this.updateProfileError = false;
            this.$store.dispatch("fetchTeamMembers");
            setTimeout(() => {
              this.closeDialog();
            }, 1000);
          }
        })
        .catch((error) => {
          this.loader = false;
          this.snackbar = true;
          this.updateProfileError = true;
          if (error.response.status == 422) {
            if (error.response.data.errors.name) {
              this.snackbarMessage = error.response.data.errors.name[0];
            } else if (error.response.data.errors.designation) {
              this.snackbarMessage = error.response.data.errors.designation[0];
            } else if (error.response.data.errors.joining_date) {
              this.snackbarMessage = error.response.data.errors.joining_date[0];
            } else if (error.response.data.errors.resign_date) {
              this.snackbarMessage = error.response.data.errors.resign_date[0];
            }
          }
        });
    },
  },
};
</script>
<style scoped>
.font-size {
  font-size: 10px;
}
.project-list:hover {
  color: white !important;
  background: #2a206a !important;
}
.v-autocomplete__content.v-menu__content .v-select-list {
  border-radius: 0 0 4px 4px;
  max-height: 120px;
  overflow: scroll;
}
</style>
<style>
.v-application .primary--text {
  color: #1cc283 !important;
  caret-color: #e9fcf5 !important;
}
</style>
