<template>
  <div>
    <v-dialog
      class="overflow-scroll"
      scrollable
      v-model="rolesModal"
      max-width="400px"
      max-height="600px"
    >
      <v-card class="white">
        <v-overlay
          :value="fetchRoleLoader"
          :absolute="absolute"
          v-if="fetchRoleLoader == true"
        >
          <div>
            <div class="snippet">
              <div class="stage">
                <div class="dot-stretching"></div>
              </div>
            </div>
          </div>
        </v-overlay>
        <v-card-title class="px-1 text-truncate dialog-title-border">
          <div class="d-flex justify-center float-left" style="width: 90%">
            <span
              class="d-inline-block text-truncate"
              style="max-width: 300px"
              :style="$vuetify.breakpoint.xs ? 'max-width: 100px;' : ''"
            >
              <b class="ui-theme-color modals-title-size"> Add Role </b>
            </span>
          </div>
          <div
            class="d-flex justify-end align-center float-right"
            style="width: 10%; height: 32px"
          >
            <v-icon
              small
              color="#757096"
              @click="closeRoleModal()"
              class="d-flex mr-2"
            >
              mdi-close
            </v-icon>
          </div>
        </v-card-title>
        <v-card-text>
          <!-- Info Div -->
          <div
            class="caption my-2 py-1 px-4 rounded d-flex justify-start align-center light-purple-border"
          >
            <v-icon small class="mr-4" color="#2a206a"
              >mdi-alert-circle-outline</v-icon
            >

            <span>User can assign only one role at a time</span>
          </div>
          <!-- Admin Option -->
          <v-radio-group dense v-model="radios">
            <v-radio label="Admin" value="Admin" color="#2a206a"></v-radio>
            <div :class="radios == 'Admin' ? 'd-block' : 'd-none'">
              <v-list
                max-height="180"
                class="d-flex light-purple-bg my-1 rounded overflow-scroll pb-3 px-3 pt-0"
              >
                <div class="flex-column mx-2">
                  <v-container>
                    <p class="border-class mt-1 mb-0">
                      <v-icon small class="ml-2 mr-1 mb-1 dark-purple-text"
                        >mdi-shield-account-variant-outline</v-icon
                      >
                      <span class="dark-purple-text">
                        <b>Assign Permissions</b>
                      </span>
                    </p>
                    <div
                      :style="
                        $vuetify.breakpoint.xs ? 'width: 256px' : 'width: 300px'
                      "
                      class="d-flex align-center mx-1 mt-0 pt-0"
                    >
                      <v-checkbox
                        v-model="selected.project"
                        hide-details
                        color="#2a206a"
                        class="my-0"
                        input-value="project"
                        dense
                      >
                        <template v-slot:label>
                          <span class="sub-checkboxLabel dark-purple-text"
                            >Project</span
                          >
                        </template>
                      </v-checkbox>
                      <v-spacer></v-spacer>
                      <v-checkbox
                        class="my-0 mx-4"
                        v-model="selected.team_member"
                        hide-details
                        color="#2a206a"
                        input-value="team_member"
                        dense
                      >
                        <template v-slot:label>
                          <span class="sub-checkboxLabel dark-purple-text"
                            >Team Members</span
                          >
                        </template>
                      </v-checkbox>
                    </div>
                  </v-container>
                </div>
              </v-list>
            </div>
            <v-radio
              class="mt-1"
              label="Team Lead"
              value="Assign Member"
              color="#2a206a"
            ></v-radio>
            <div :class="radios == 'Assign Member' ? 'd-block' : 'd-none'">
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
              <v-list max-height="170" class="overflow-scroll elevation-1">
                <div v-if="memberDetails" class="caption">
                  <div
                    class="pointer listing-hover d-flex list-item-min-height"
                    v-for="member in getMembers.filter((item) => {
                      return item.id != memberDetails.id;
                    })"
                    :key="member.id"
                    @click="addOrRemoveMember(member)"
                    :class="
                      addedMembersArray.find((item) => {
                        return item == member.id;
                      })
                        ? 'bg-selected'
                        : ''
                    "
                  >
                    <profileImage
                      inline
                      :username="member.name ? member.name : member.email"
                      :size="25"
                      :userProfile="true"
                      :circular="true"
                      class="ml-3 text-light"
                    >
                    </profileImage>
                    <v-list-item-content
                      style="max-width:180px"
                      class="d-inline-block text-truncate ml-2"
                      :class="member.name ? 'text-capitalize' : ''"
                    >
                      {{
                        member.name ? member.name : member.email
                      }}</v-list-item-content
                    >
                    <v-spacer></v-spacer>
                    <v-icon
                      class="mr-3"
                      small
                      color="#1cc283"
                      v-text="
                        addedMembersArray.find((item) => {
                          return item == member.id;
                        })
                          ? 'mdi-check-box-outline'
                          : ''
                      "
                    ></v-icon>
                  </div>
                </div>
                <div v-if="searchMember && !getMembers.length">
                  <p class="t-color my-1">No results found</p>
                </div>
              </v-list>
            </div>
            <v-radio
              class="mt-1"
              label="Employee"
              value="Employee"
              color="#2a206a"
            ></v-radio>
          </v-radio-group>

          <!-- Team Lead Option -->
          <v-divider class="mt-3" color="#dad6f5"></v-divider>

          <!-- save btn div -->
          <div class="d-flex justify-end">
            <v-btn @click="saveRole()" class="my-1 btn-success" dark depressed>
              <span v-show="!pending">Save</span>
              <v-progress-circular
                v-show="pending"
                size="15"
                width="1"
                indeterminate
                color="white"
              ></v-progress-circular>
            </v-btn>
          </div>
        </v-card-text>
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
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import profileImage from "@/components/includes/ProfileImage";
export default {
  props: ["rolesDialog", "memberDetails"],
  components: {
    profileImage,
  },
  data() {
    return {
      rolesModal: this.rolesDialog,
      radios: null,
      pending: false,
      snackbar: false,
      snackbarMessage: null,
      selectionError: null,
      roles: "",
      selected: {},
      addedMembersArray: [],
      removedMembersArray: [],
      projectsArray: [],
      search: null,
      searchMember: null,
      fetchRoleLoader: false,
      absolute: true,
    };
  },
  computed: {
    ...mapGetters(["getSelectedCompany", "getAllMembers", "getLoggedInUser"]),

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
  },
  methods: {
    addOrRemoveMember(member) {
      let status = this.addedMembersArray.find((item) => {
        return item == member.id;
      });
      //going to add
      if (!status) {
        this.removedMembersArray = this.removedMembersArray.filter((item) => {
          return item != member.id;
        });
        this.addedMembersArray.push(member.id);
      }
      // going to remove
      else if (status) {
        this.addedMembersArray = this.addedMembersArray.filter((item) => {
          return item != member.id;
        });
        this.removedMembersArray.push(member.id);
      }
    },

    saveRole() {
      this.pending = true;
      if (this.memberDetails)
        if (this.memberDetails.id) {
          let data = {
            user_id: this.memberDetails.id,
            company_id: this.getSelectedCompany.id,
          };
          if (this.radios == "Admin") {
            data.roles = "admin";
            data.permissions = Object.keys(this.selected).filter(
              (item) => this.selected[item] === true
            );
          }
          if (this.radios == "Assign Member") {
            data.roles = "team-manager";
            data.add_members = this.addedMembersArray;
            data.remove_members = this.removedMembersArray;
          }
          if (this.radios == "Employee") {
            data.roles = "employee";
          }
          if (this.radios == "Assign Member" && this.radios == "Admin") {
            this.snackbar = true;
            this.snackbarMessage = "Please select only one role";
            this.selectionError = true;
            this.pending = false;
          } else {
            if (data.permissions ? !data.permissions.length : false) {
              this.snackbar = true;
              this.snackbarMessage = "Please select atleast one permission";
              this.selectionError = true;
              this.pending = false;
            } else {
              this.$store.dispatch("addUserRole", data).then(() => {
                this.removedMembersArray = [];
                this.snackbar = true;
                this.snackbarMessage = "Role successfully assigned";
                this.selectionError = false;
                this.pending = false;
                setTimeout(() => {
                  this.rolesModal = false;
                }, 2000);
              });
            }
          }
        }
    },
    closeRoleModal() {
      this.rolesModal = false;
    },
    fetchDetails() {
      if (this.memberDetails)
        if (this.memberDetails.id) {
          this.fetchRoleLoader = true;
          this.$store
            .dispatch("fetchUserDetails", {
              user_id: this.memberDetails.id,
              company_id: this.getSelectedCompany.id,
            })
            .then((response) => {
              if (response.status == 200) {
                this.fetchRoleLoader = false;
                this.selected = response.data.data;
                this.memberDetails.role == "employee"
                  ? (this.radios = "Employee")
                  : "";
                this.memberDetails.role == "admin"
                  ? (this.radios = "Admin")
                  : "";
                if (this.memberDetails.role == "team-manager") {
                  this.radios = "Assign Member";
                  this.addedMembersArray = response.data.data.team_members.map(
                    (item) => {
                      return item.id;
                    }
                  );
                }
              }
            })
            .catch((err) => {
              if (err.response.status == 422) {
                this.fetchRoleLoader = false;
              }
            });
        }
    },
  },
  watch: {
    rolesDialog(value) {
      this.rolesModal = value;
    },
    rolesModal(value) {
      if (value) this.fetchDetails();
      this.addedMembersArray = [];
      if (!value) {
        this.$emit("close");
      }
    },
    // memberDetails(value) {
    //   if (value) this.fetchDetails();
    // },
  },
};
</script>
