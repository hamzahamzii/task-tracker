<template>
  <div>
    <v-dialog v-model="flag" max-width="500px" max-height="600px">
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
              <b class="ui-theme-color modals-title-size"> Assign Members </b>
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
          <div class="flex-column mx-2">
            <!-- Search Field -->
            <div class="theme-border mt-3">
              <v-text-field
                autocomplete="off"
                prepend-inner-icon="mdi-magnify"
                background-color="white"
                placeholder="Search Team Members"
                color="#DCD8F3"
                hide-details
                dense
                flat
                solo
                autofocus
                v-model="searchMember"
              />
            </div>
            <v-divider color="#DAD6F5" class="mt-8 mb-6"></v-divider>
            <!-- Member List -->
            <v-list max-height="150" class="overflow-scroll">
              <div v-if="memberDetails" class="caption">
                <div
                  :class="
                    array.find((item) => {
                      return !item.deleted_team_members && item.id == member.id;
                    })
                      ? 'bg-selected'
                      : ''
                  "
                  class="pointer d-flex listing-hover"
                  v-for="member in getSelectedCompany.role == 'team-manager'
                    ? this.filteredAllTeamLeadMembers
                    : getMembers.filter((item) => {
                        return item.id != memberDetails.id;
                      })"
                  :key="member.id"
                  @click="addRemoveMember(member)"
                >
                  <profileImage
                    inline
                    v-show="member.image ? ':src' : ':username'"
                    :src="member.image"
                    :username="member.name ? member.name : member.email"
                    :size="25"
                    :userProfile="true"
                    :circular="true"
                    class="ml-3 text-light"
                  >
                  </profileImage>

                  <v-list-item-content
                    style="max-width: 200px"
                    :class="member.name ? 'text-capitalize' : ''"
                    class="d-inline-block text-truncate ml-2 caption"
                  >
                    {{
                      member.name ? member.name : member.email
                    }}</v-list-item-content
                  >
                  <v-spacer></v-spacer>
                  <v-icon
                    v-show="!member.deleted_team_members"
                    class="mr-3"
                    :color="
                      array.find((item) => {
                        return item.id == member.id;
                      })
                        ? '#1cc283'
                        : '#DCD8F3'
                    "
                    v-text="
                      array.find((item) => {
                        return item.id == member.id;
                      })
                        ? 'mdi-check-circle-outline'
                        : 'mdi-plus-circle-outline'
                    "
                  ></v-icon>
                  <v-icon
                    color="red"
                    class="mr-3"
                    v-show="member.deleted_team_members"
                  >
                    mdi-minus-circle-outline</v-icon
                  >
                </div>
              </div>
              <div v-if="searchMember && !getMembers.length">
                <p class="no-results-found my-1">No results found</p>
              </div>
            </v-list>

            <v-divider color="#DAD6F5" class="my-7"></v-divider>
            <!-- Email Div -->
            <div class="theme-border mt-2">
              <v-text-field
                autocomplete="off"
                v-model="email"
                color="#DCD8F3"
                placeholder="Invite by email address"
                multiple
                dense
                hide-details
                solo
                flat
                prepend-inner-icon="mdi-email-outline"
                @keydown.enter="emailSend()"
              >
              </v-text-field>
            </div>
            <div class="d-flex justify-center my-4">
              <v-btn
                @click="emailSend"
                depressed
                class="btn-success py-2 px-6 text-capitalize mx-2 white--text"
              >
                <v-progress-circular
                  v-if="loader"
                  indeterminate
                  :size="20"
                ></v-progress-circular>
                <span v-else>Send Invite</span>
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <!-- Copy Link -->
        <v-card-actions
          class="theme-light-bg d-flex ui-theme-color justify-center align-center"
        >
          <v-tooltip color="#302277" top>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <v-icon class="ui-theme-color">mdi-attachment</v-icon>
                <input
                  type="text"
                  :value="getSelectedCompany.invite_link"
                  id="copyInp"
                  style="position: absolute; left: -1000px; top: -1000px"
                />
                <a
                  @click="copyFunc()"
                  style="cursor: cell"
                  class="ui-theme-color"
                >
                  Copy link to share & invite team
                </a>
              </div>
            </template>
            <span>Copy to clipboard</span>
          </v-tooltip>
        </v-card-actions>
      </v-card>

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
    </v-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import profileImage from "@/components/includes/ProfileImage";
export default {
  props: ["openAssignDialog", "memberDetails"],
  components: {
    profileImage,
  },
  data() {
    return {
      array: [],
      fetchRoleLoader: false,
      flag: true,
      email: null,
      snackbar: false,
      snackbarMessage: null,
      selectionError: null,
      searchMember: null,
      absolute: true,
      loader: false,
    };
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getAllMembers",
      "getLoggedInUser",
      "getProjects",
      "getAllTeamLeadMembers",
    ]),
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
    filteredAllTeamLeadMembers() {
      return this.getAllTeamLeadMembers
        ? this.searchMember
          ? this.getAllTeamLeadMembers.filter((item) => {
              return item.name
                ? item.name
                    .toLowerCase()
                    .includes(this.searchMember.toLowerCase())
                : item.email
                    .toLowerCase()
                    .includes(this.searchMember.toLowerCase());
            })
          : this.getAllTeamLeadMembers
        : [];
    },
  },
  methods: {
    copyFunc() {
      var copyText = document.getElementById("copyInp");
      copyText.select();
      document.execCommand("copy");
    },
    addRemoveMember(member) {
      let status = this.array.find((item) => {
        return item.id == member.id;
      });
      let data = {
        company_id: this.getSelectedCompany.id,
        user_id: this.memberDetails.id,
        role: "team-manager",
      };
      !status
        ? ((data.add_member = member.id),
          this.$store.commit("setAddStatusMember", member),
          this.array.push(member))
        : ((data.remove_member = member.id),
          this.$store.commit("setRemoveStatusMember", member),
          (this.array = this.array.filter((item) => {
            return item.id != member.id;
          })));

      this.$store.dispatch("assignTeamMembers", data).then((response) => {
        this.memberDetails.id == this.getLoggedInUser.id
          ? !status
            ? this.$store.commit("setAddTeamMember", member)
            : this.$store.commit("setRemoveTeamMember", member)
          : () => {};
        this.snackbar = true;
        this.snackbarMessage = response.data;
        this.selectionError = false;
      });
    },
    closeRoleModal() {
      this.$emit("update:openAssignDialog", false);
    },

    fetchTeamLeadMembers() {
      this.fetchRoleLoader = true;
      if (this.memberDetails)
        if (this.memberDetails.id) {
          this.$store
            .dispatch("fetchTeamLeadMembers", {
              company_id: this.getSelectedCompany.id,
              user_id: this.memberDetails.id,
            })
            .then((response) => {
              this.fetchRoleLoader = false;
              this.array = response.filter((item) => {
                return item.leader_id ? !item.deleted_team_members : false;
              });
            });
        }
    },
    emailSend() {
      this.loader = true;
      this.$store
        .dispatch("addteamMembers", {
          company_id: this.getSelectedCompany.id,
          members: [this.email],
        })
        .then(() => {
          this.loader = false;
          this.flag = false;
          this.email = null;
        })
        .catch((error) => {
          if (error.response.status == 422) {
            this.loader = false;
            this.snackbar = true;
            this.selectionError = true;
            if (error.response.data.errors.members[0]) {
              this.snackbarMessage = error.response.data.errors.members[0];
            }
            setTimeout(() => {
              this.flag = false;
            }, 1000);
          }
        });
    },
  },
  watch: {
    openAssignDialog(value) {
      this.assignModal = value;
    },
    flag(value) {
      !value ? this.$emit("update:openAssignDialog", false) : () => {};
    },
    assignModal(value) {
      if (!value) {
        this.$emit("close");
      }
    },
    // memberDetails(value) {
    //   if (value) this.fetchDetails();
    // },
  },
  mounted() {
    this.fetchTeamLeadMembers();
  },
};
</script>
