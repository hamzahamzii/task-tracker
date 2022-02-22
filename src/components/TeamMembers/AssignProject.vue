<template>
  <div>
    <v-dialog v-model="flag" max-width="500px" max-height="600px">
      <v-card class="white">
        <!-- Title -->
        <v-card-title class="px-1 text-truncate dialog-title-border">
          <div class="d-flex justify-center float-left" style="width: 90%">
            <span
              class="d-inline-block text-truncate"
              style="max-width: 300px"
              :style="$vuetify.breakpoint.xs ? 'max-width: 100px;' : ''"
            >
              <b class="ui-theme-color modals-title-size"> Assign Project </b>
            </span>
          </div>
          <div
            class="d-flex justify-end align-center float-right"
            style="width: 10%; height: 32px"
          >
            <v-icon
              small
              color="#757096"
              @click="closeDialog()"
              class="d-flex mr-2"
            >
              mdi-close
            </v-icon>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="flex-column mx-2">
            <!-- Project Dropdown -->
            <div class="theme-border mt-3">
              <v-select
                v-model="selectedProject"
                solo
                flat
                hide-details
                :items="getProjects"
                item-text="name"
                item-value="id"
                label="Select Project"
                dense
                @input="fetchProjectMembers"
              ></v-select>
            </div>
            <div class="ui-theme-color subtitle-1 font-weight-bold my-2">
              Members
            </div>
            <v-divider color="#DAD6F5" class="mb-2"></v-divider>
            <div class="theme-border mt-3">
              <v-text-field
                autocomplete="off"
                prepend-inner-icon="mdi-magnify"
                background-color="white"
                placeholder="Search Member"
                color="#DCD8F3"
                hide-details
                dense
                flat
                solo
                v-model="searchMember"
              />
            </div>
            <!-- Member List -->
            <v-list max-height="150" class="overflow-scroll mt-4">
              <div class="caption">
                <div
                  class="pointer d-flex list-item-min-height py-6 bottom-border"
                  v-for="member in filteredMembersList"
                  :key="member.id"
                >
                  <profileImage
                    inline
                    v-show="member.image ? ':src' : ':username'"
                    :src="member.image"
                    :username="member.name ? member.name : member.email"
                    :size="25"
                    :circular="true"
                    :userProfile="true"
                    class="ml-3 text-light"
                  >
                  </profileImage>

                  <v-list-item-content
                    :class="member.name ? 'text-capitalize' : ''"
                    class="ml-2 pa-2 subtitle-1"
                  >
                    {{
                      member.name ? member.name : member.email
                    }}</v-list-item-content
                  >
                  <v-icon
                    v-if="showAddRemoveOption"
                    class="mr-2n"
                    large
                    @click="addOrRemoveMember(member)"
                    :color="
                      membersArray.find((item) => {
                        return item.id == member.id;
                      })
                        ? '#1cc283'
                        : '#DCD8F3'
                    "
                    v-text="
                      membersArray.find((item) => {
                        return item.id == member.id;
                      })
                        ? 'mdi-check-circle-outline'
                        : 'mdi-plus-circle-outline'
                    "
                  ></v-icon>
                </div>
              </div>
              <div v-if="searchMember && !filteredMembersList.length">
                <p class="t-color my-1">No results found</p>
              </div>
            </v-list>
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
export default {
  props: ["openProjectDialog", "projectDetails"],
  components: {
    profileImage: () => import("@/components/includes/ProfileImage"),
  },
  computed: {
    ...mapGetters([
      "getLoggedInUser",
      "getAllMembers",
      "getProjects",
      "getSelectedCompany",
    ]),
    filteredMembersList() {
      return this.memberList
        ? this.searchMember
          ? this.memberList.filter((item) => {
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
          : this.memberList.filter((item) => {
              return item.id != this.getLoggedInUser.id;
            })
        : [];
    },
  },
  data() {
    return {
      flag: true,
      loader: false,
      // For Snackbars
      snackbar: null,
      selectionError: null,
      snackbarMessage: null,
      selectedMembers: [],
      selectedProject: [],
      searchMember: null,
      memberList: [],
      membersArray: [],
      showAddRemoveOption: null,
    };
  },
  methods: {
    closeDialog() {
      this.$emit("update:openProjectDialog", false);
    },
    fetchAllProjects() {
      let payload = {
        company_id: this.getSelectedCompany.id,
      };
      this.$store
        .dispatch("assignProjectMembers", payload)
        .then((res) => {
          this.projectDetails = res.data.data;
          console.log("the response", res.data.data);
        })
        .catch((error) => {
          console.log("the error!!", error);
        });
    },

    fetchProjectMembers() {
      let payload = {
        company_id: this.getSelectedCompany.id,
        project_id: this.selectedProject,
      };
      this.$store
        .dispatch("fetchProjectMembers", payload)
        .then((res) => {
          this.showAddRemoveOption = true;
          this.membersArray = res.data.data;
        })
        .catch((error) => {
          console.log("Error", error);
        });
    },
    addOrRemoveMember(member) {
      let status = this.membersArray.find((item) => {
        return item.id == member.id;
      });
      //going to add
      if (!status) {
        this.membersArray.push(member);
        this.$store
          .dispatch("assignProjectMembers", {
            company_id: this.getSelectedCompany.id,
            project_id: this.selectedProject,
            add_member: member.id,
          })
          .then(() => {
            this.loader = false;
            this.snackbar = true;
            this.snackbarMessage = "Member Added!";
            this.selectionError = false;
          })
          .catch((error) => {
            this.loader = false;
            this.snackbar = true;
            this.selectionError = true;
            this.snackbarMessage = "Oops! Something went wrong";
            console.log("error!!", error);
          });
      }
      // going to remove
      else if (status) {
        // for reactive front-end
        let membersArrayReplica = this.membersArray;
        this.membersArray = this.membersArray.filter((item) => {
          return item.id != member.id;
        });
        // console.log("members array", membersArrayReplica);
        let removedMember = membersArrayReplica.find((item) => {
          return item.id == member.id;
        });
        this.$store
          .dispatch("assignProjectMembers", {
            company_id: this.getSelectedCompany.id,
            project_id: this.selectedProject,
            remove_member: removedMember.id,
          })
          .then(() => {
            this.loader = false;
            this.snackbar = true;
            this.snackbarMessage = "Member Removed!";
            this.selectionError = false;
          })
          .catch((error) => {
            this.loader = false;
            this.snackbar = true;
            this.selectionError = true;
            this.snackbarMessage = "Oops! Something went wrong";
            console.log("error!!", error);
          });
      }
    },
  },
  watch: {
    openProjectDialog(value) {
      this.assignModal = value;
    },
    assignModal(value) {
      if (!value) {
        this.$emit("close");
      }
    },
    flag(value) {
      !value ? this.$emit("update:openProjectDialog", false) : () => {};
    },
  },
  mounted() {
    this.memberList = this.getAllMembers;
  },
};
</script>

<style></style>
