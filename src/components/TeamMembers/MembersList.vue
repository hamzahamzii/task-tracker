<template>
  <div v-if="getSelectedCompany.role != 'employee'">
    <!-- Menu for extension -->
    <v-menu
      v-if="extension"
      content-class="bg-color"
      offset-y
      v-model="memberDropdown"
      :close-on-content-click="false"
    >
      <!-- member btn for medium screens and up -->
      <template v-slot:activator="{ on, attrs }">
        <!-- for medium screens and up -->
        <v-btn
          @click="
            search = null;
            searchMember = null;
            memberBtn = true;
          "
          v-bind="attrs"
          v-on="on"
          outlined
          height="45px"
          depressed
          width="374px"
          class="ml-3 mb-2 dusty-purple-text theme-border text-capitalize d-inline-block text-truncate"
        >
          <!-- add member icon & tooltip for small screens (including extension) start-->
          <span width="120px" class="d-inline-block text-truncate">
            {{
              getActiveTask
                ? "Me"
                : membersArray.length
                ? membersArray[0].name
                  ? membersArray[0].name
                  : membersArray[0].email
                : "Add Members"
            }}</span
          >
          <v-spacer></v-spacer>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <!-- search field -->
      <v-text-field
        autocomplete="off"
        class="pa-1"
        color="#2a206a"
        prepend-inner-icon="mdi-magnify"
        background-color="white"
        placeholder="Search by name/email"
        hide-details
        dense
        outlined
        autofocus
        v-model="search"
        @keydown.enter="
          !selectedItem
            ? getMembers[0]
              ? getActiveTask
                ? assign(getMembers[0].id)
                : addOrRemove(getMembers[0])
              : addNewMember()
            : getMembers[selectedItem]
            ? getActiveTask
              ? assign(getMembers[selectedItem].id)
              : addOrRemove(getMembers[selectedItem])
            : addNewMember()
        "
        @keydown.tab="$emit('membersDone')"
        @keydown.esc="$emit('membersDone')"
        @keydown.up="selectPrev"
        @keydown.down="selectNext"
        @click="
          memberBtn = true;
          searchMember = null;
        "
      >
      </v-text-field>
      <!-- member list -->
      <v-list class="overflow-scroll" scrollable max-height="200">
        <v-list-item-group>
          <div
            class="pointer listing-hover d-flex"
            v-for="(member, index) in getMembers"
            :key="member.id"
            :id="member.id"
            :disabled="getActiveTask && member.id == getLoggedInUser.id"
            :class="
              getActiveTask
                ? getActiveTask.members.find((item) => {
                    return item.id == member.id;
                  })
                  ? 'bg-selected'
                  : search && !selectedItem && index == 0
                  ? 'bg-hover'
                  : selectedItem == index
                  ? 'bg-hover'
                  : ''
                : membersArray.find((item) => {
                    return item.id == member.id;
                  })
                ? 'bg-selected'
                : search && !selectedItem && index == 0
                ? 'bg-hover'
                : selectedItem == index
                ? 'bg-hover'
                : ''
            "
            @click="getActiveTask ? assign(member.id) : addOrRemove(member)"
          >
            <profileimage
              v-show="member.image ? ':src' : ':username'"
              :src="member.image"
              inline
              :username="member.name ? member.name : member.email"
              :size="23"
              :circular="true"
              class="ml-4 text-light"
            ></profileimage>
            <v-list-item-content
              style="max-width: 160px"
              class="d-inline-block text-truncate caption ml-2"
              :class="member.name ? 'text-capitalize' : ''"
            >
              {{ member.name ? member.name : member.email }}
            </v-list-item-content>
            <v-icon
              small
              color="#1cc283"
              class="mr-3"
              v-text="
                getActiveTask
                  ? getActiveTask.members.find((item) => {
                      return item.id == member.id;
                    })
                    ? 'mdi-check-box-outline'
                    : ''
                  : membersArray.find((item) => {
                      return item.id == member.id;
                    })
                  ? 'mdi-check-box-outline'
                  : ''
              "
            ></v-icon>
          </div>
        </v-list-item-group>

        <div v-if="search && !getMembers.length">
          <p class="no-results-found my-1">No results found</p>
        </div>
      </v-list>
      <v-btn
        v-if="memberBtn"
        @click="search ? addNewMember() : (memberBtn = false)"
        color="#EEF0F6"
        width="325"
        class="listing-hover mx-2 my-2 text-capitalize"
      >
        <v-icon class="mx-1">mdi-plus</v-icon>
        <span style="max-width: 160px" class="d-inline-block text-truncate">
          Add
          {{ !getMembers.length ? search : "New Member" }}
        </span>
      </v-btn>
      <v-text-field
        autocomplete="off"
        class="pa-0 ma-0 caption"
        v-if="!memberBtn"
        prepend-inner-icon="mdi-plus"
        color="#2a206a"
        background-color="#F8F7FD"
        hide-details
        autofocus
        v-model="searchMember"
        solo
        dense
        flat
        @keydown.enter="
          addNewMember();
          memberBtn = true;
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
      v-model="memberDropdown"
      :close-on-content-click="false"
    >
      <!-- member btn for medium screens and up -->
      <template v-slot:activator="{ on, attrs }">
        <!-- for medium screens and up -->
        <v-btn
          @click="
            search = null;
            searchMember = null;
            memberBtn = true;
            $store.dispatch('fetchTeamMembers');
          "
          v-bind="attrs"
          v-on="on"
          tile
          depressed
          :width="
            $mq == 'phone' || $mq == 'extraSmallPhones'
              ? '70%'
              : $vuetify.breakpoint.xs
              ? '70px'
              : '120px'
          "
          :class="
            $vuetify.breakpoint.xs
              ? 'mx-1'
              : 'mx-2' && (membersArray.length || getActiveTask)
              ? 'task-bar-btns-borders task-bar-btns-height'
              : ''
          "
          class="px-2 mr-2 task-bar-btns text-capitalize d-inline-block text-truncate"
        >
          <!-- add member icon & tooltip for small screens (including extension) start-->
          <v-tooltip bottom color="#302277">
            <template v-slot:activator="{ on, attrs }">
              <img
                v-on="on"
                v-bind="attrs"
                src="@/assets/images/add_member_icon.svg"
                class="mt-1 d-flex d-sm-none"
                :height="
                  $mq == 'phone' || $mq == 'extraSmallPhones' ? '20px' : '25px'
                "
              />
            </template>
            <span>Add Member</span>
          </v-tooltip>
          <!-- add member icon & tooltip for small screens (including extension) start-->
          <v-icon
            v-if="
              !$vuetify.breakpoint.xs &&
              (getSelectedCompany.role == 'owner' ||
                getSelectedCompany.role == 'team-manager' ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  !getSelectedCompany.permissions.project) ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member &&
                  getSelectedCompany.permissions.project))
            "
            class="mr-1"
            small
          >
            mdi-plus-circle-outline
          </v-icon>
          <span
            v-if="!$vuetify.breakpoint.xs"
            width="120px"
            class="d-inline-block text-truncate"
          >
            {{
              getActiveTask
                ? "Me"
                : membersArray.length
                ? membersArray[0].name
                  ? membersArray[0].name
                  : membersArray[0].email
                : "Members"
            }}</span
          >
        </v-btn>
      </template>
      <!-- search field -->
      <v-text-field
        autocomplete="off"
        class="pa-1"
        color="#2a206a"
        prepend-inner-icon="mdi-magnify"
        background-color="white"
        placeholder="Search by name/email"
        hide-details
        dense
        outlined
        autofocus
        v-model="search"
        @keydown.enter="
          !selectedItem
            ? getMembers[0]
              ? getActiveTask
                ? assign(getMembers[0].id)
                : addOrRemove(getMembers[0])
              : addNewMember()
            : getMembers[selectedItem]
            ? getActiveTask
              ? assign(getMembers[selectedItem].id)
              : addOrRemove(getMembers[selectedItem])
            : addNewMember()
        "
        @keydown.tab="$emit('membersDone')"
        @keydown.esc="$emit('membersDone')"
        @keydown.up="selectPrev"
        @keydown.down="selectNext"
        @click="
          memberBtn = true;
          searchMember = null;
        "
      >
      </v-text-field>
      <!-- member list -->
      <v-list class="overflow-scroll" scrollable max-height="200">
        <v-list-item-group>
          <div
            class="pointer listing-hover d-flex"
            v-for="(member, index) in getMembers"
            :key="member.id"
            :id="member.id"
            :disabled="getActiveTask && member.id == getLoggedInUser.id"
            :class="
              getActiveTask
                ? getActiveTask.members.find((item) => {
                    return item.id == member.id;
                  })
                  ? 'bg-selected'
                  : search && !selectedItem && index == 0
                  ? 'bg-hover'
                  : selectedItem == index
                  ? 'bg-hover'
                  : ''
                : membersArray.find((item) => {
                    return item.id == member.id;
                  })
                ? 'bg-selected'
                : search && !selectedItem && index == 0
                ? 'bg-hover'
                : selectedItem == index
                ? 'bg-hover'
                : ''
            "
            @click="getActiveTask ? assign(member.id) : addOrRemove(member)"
          >
            <profileimage
              v-show="member.image ? ':src' : ':username'"
              :src="member.image"
              inline
              :username="member.name ? member.name : member.email"
              :size="23"
              :circular="true"
              class="ml-4 text-light"
            ></profileimage>
            <v-list-item-content
              style="max-width: 160px"
              class="d-inline-block text-truncate caption ml-2"
              :class="member.name ? 'text-capitalize' : ''"
            >
              {{ member.name ? member.name : member.email }}
            </v-list-item-content>
            <v-spacer></v-spacer>
            <v-icon
              small
              color="#1cc283"
              class="mr-3"
              v-text="
                getActiveTask
                  ? getActiveTask.members.find((item) => {
                      return item.id == member.id;
                    })
                    ? 'mdi-check-box-outline'
                    : ''
                  : membersArray.find((item) => {
                      return item.id == member.id;
                    })
                  ? 'mdi-check-box-outline'
                  : ''
              "
            ></v-icon>
          </div>
        </v-list-item-group>

        <div v-if="search && !getMembers.length">
          <p class="no-results-found my-1">No results found</p>
        </div>
      </v-list>
      <v-btn
        v-if="memberBtn"
        @click="search ? addNewMember() : (memberBtn = false)"
        color="#EEF0F6"
        width="260"
        class="listing-hover mx-2 my-2"
      >
        <v-icon class="mx-1">mdi-plus</v-icon>
        <div class="d-flex">
          <span> Add </span>
          <span
            :class="getMembers.length ? '' : 'lowercase'"
            style="max-width: 160px"
            class="ml-1 d-inline-block text-truncate"
          >
            {{ !getMembers.length ? search : "New  Member" }}
          </span>
        </div>
      </v-btn>
      <v-text-field
        autocomplete="off"
        class="pa-0 ma-0 caption"
        v-if="!memberBtn"
        prepend-inner-icon="mdi-plus"
        color="#2a206a"
        background-color="#F8F7FD"
        hide-details
        autofocus
        v-model="searchMember"
        solo
        dense
        flat
        @keydown.enter="
          addNewMember();
          memberBtn = true;
        "
      >
        <template v-slot:append>
          <div class="font-size pa-0 ma-0" color="#2a206a">
            *press enter to add
          </div>
        </template>
      </v-text-field>
    </v-menu>
    <!-- snackbar -->
    <v-snackbar
      class="mt-5"
      top
      right
      :color="error ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="error ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="error ? 'red' : 'green'"
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
import { mapGetters } from "vuex";
import profileimage from "../includes/ProfileImage";

import { eventBus } from "@/main";
export default {
  name: "MembersList",
  components: {
    profileimage,
  },
  props: ["clearMembers", "open", "extension"],

  data() {
    return {
      selectedItem: null,
      searchMember: null,
      memberBtn: true,
      pending: null,
      memberDropdown: false,
      membersArray: [],
      search: null,
      snackbar: false,
      snackbarMessage: null,
      error: null,
    };
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getActiveTask",
      "getLoggedInUser",
      "getAllMembers",
      "getArchievedmembers",
    ]),
    breakpoint() {
      return this.$vuetify.breakpoint.name;
    },
    // Search all Members
    getMembers() {
      return this.getAllMembers
        ? this.search
          ? [this.getLoggedInUser]
              .concat(
                this.getAllMembers.filter((item) => {
                  return item.id != this.getLoggedInUser.id;
                })
              )
              .filter((item) => {
                return item.name
                  ? item.name.toLowerCase().includes(this.search.toLowerCase())
                  : item.email
                      .toLowerCase()
                      .includes(this.search.toLowerCase());
              })
          : [this.getLoggedInUser].concat(
              this.getAllMembers.filter((item) => {
                return item.id != this.getLoggedInUser.id;
              })
            )
        : [];
    },
  },
  mounted() {
    eventBus.$on("companySwitched", () => {
      this.membersArray = [];
    });
  },
  beforeDestroy() {
    eventBus.$off("companySwitched");
  },

  watch: {
    // Update members array if task is changed
    getActiveTask() {
      this.membersArray = [];
    },
    clearMembers(value) {
      if (value) {
        this.membersArray = [];
        this.search = "";
      }
    },
    // signal from task bar to open dropdown
    open(value) {
      if (value) {
        this.memberDropdown = true;
      } else this.memberDropdown = false;
    },
    // signal to task bar if dropdown is closed
    memberDropdown(value) {
      if (!value) {
        this.selectedItem = null;
        this.$emit("dropdownClosed");
        this.search = null;
      }
    },
  },

  methods: {
    selectPrev() {
      if (this.selectedItem != null && this.getMembers) {
        if (this.selectedItem <= 0) {
          this.selectedItem = this.getMembers.length;
        } else {
          this.selectedItem -= 1;
        }
      } else {
        this.selectedItem = 0;
      }
    },
    selectNext() {
      if (this.selectedItem != null && this.getMembers) {
        if (this.selectedItem >= this.getMembers.length) {
          this.selectedItem = 0;
        } else {
          this.selectedItem += 1;
        }
      } else {
        this.selectedItem = 0;
      }
    },
    addNewMember() {
      if (this.pending) return;
      // Show temporary
      if (!this.getActiveTask) {
        this.membersArray.push({
          email: this.search ? this.search : this.searchMember,
        });
        this.memberDropdown = false;
        this.$emit("membersDone");
      }
      if (
        /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/.test(
          this.search
        ) ||
        /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/.test(
          this.searchMember
        )
      ) {
        if (
          [this.getLoggedInUser]
            .concat(this.getAllMembers)
            .concat(this.getArchievedmembers)
            .find((item) => {
              return this.search
                ? item.email == this.search
                : item.email == this.searchMember;
            })
        ) {
          this.searchMember = null;
          this.search = null;
          this.snackbar = true;
          this.snackbarMessage = "Member already exist";
          this.error = true;
        } else {
          this.pending = "invite";
          this.$store
            .dispatch("addteamMembers", {
              company_id: this.getSelectedCompany.id,
              members: this.searchMember ? [this.searchMember] : [this.search],
            })
            .then((response) => {
              this.membersArray = [];
              this.pending = false;
              this.getActiveTask
                ? this.assign(response.members_added[0].id)
                : this.addOrRemove(response.members_added[0]);
              this.searchMember = null;
              this.search = null;
            })
            .catch((err) => {
              this.pending = false;
              console.log(err);
            });
        }
      } else {
        this.searchMember = null;
        this.search = null;
        this.snackbar = true;
        this.snackbarMessage = "Please enter valid email";
        this.error = true;
        this.membersArray = [];
      }
    },

    assign(member_id) {
      if (!this.getActiveTask.title) {
        this.snackbar = true;
        this.snackbarMessage = "Add title to assign";
        this.error = true;
        return;
      }
      if (this.pending) return;
      this.pending = "assign";
      this.memberDropdown = false;
      this.$emit("membersDone");
      this.$store
        .dispatch("assignMember", {
          task_id: this.getActiveTask.task_id,
          member_id,
        })
        .then(() => {
          this.pending = false;
          this.snackbar = true;
          this.snackbarMessage = "Member(s) updated";
          this.error = false;
        })
        .catch(() => {
          this.pending = false;
        });
    },
    // This function adds or removes user from current transaction array
    // Current transaction array consists of users to add
    addOrRemove(member) {
      let status = this.membersArray.find((item) => {
        return item.id == member.id;
      });
      //going to add
      if (!status) {
        this.membersArray.push(member);
      }
      // going to remove
      else if (status) {
        this.membersArray = this.membersArray.filter((item) => {
          return item.id != member.id;
        });
      }
      this.$emit("assignedMembers", this.membersArray);
      this.memberDropdown = false;
      this.$emit("membersDone");
    },
    // signal task bar to move to next step
  },
};
</script>
<style scoped>
.bg-hover {
  background-color: #e5efff !important;
}
.lowercase {
  text-transform: lowercase !important;
}
.button-selected {
  color: #1cc283 !important;
  background: #e9fcf5 !important;
}
.font-size {
  font-size: 12px;
}
.text-color {
  color: #2979ff;
}
.bg-color {
  background-color: white !important;
}

.member-btn {
  background-color: #0097a7d1 !important;
  color: #fff !important;
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
</style>
