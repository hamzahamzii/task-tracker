<template>
  <div>
    <v-dialog overlay-color="white" v-model="modal" width="500">
      <v-card>
        <v-card-title
          class="py-3 px-4 text-truncate dialog-title-border ui-theme-color"
        >
          <div class="d-flex justify-center" style="width: 90%">
            <span>
              <b class="modals-title-size">
                Invite Members
              </b>
            </span>
          </div>
          <v-spacer></v-spacer>
          <v-icon
            small
            color="#757096"
            @click="
              modal = false;
              chips = [];
              email = null;
            "
            >mdi-close</v-icon
          >
        </v-card-title>
        <v-divider></v-divider>

        <!-- snackbar -->
        <v-snackbar
          top
          right
          :color="addMemberError ? 'red lighten-5' : 'green lighten-5'"
          light
          v-model="snackbar"
        >
          <span :class="addMemberError ? 'red--text' : 'green--text'">
            {{ snackbarMessage }}</span
          >
          <template v-slot:action="{ attrs }">
            <v-btn
              :color="addMemberError ? 'red' : 'green'"
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
        <div class="mx-8">
          <div class="ml-4 mt-3 invite-link">Invite with link</div>

          <v-text-field
            autocomplete="off"
            class="mt-2 px-4"
            id="copy-link-field"
            color="#2a206a"
            v-model="getSelectedCompany.invite_link"
            outlined
            solo
            flat
            hide-details
            dense
            filled
            @click="copyText"
            @click:append="copyText()"
            readonly
          >
            <template v-slot:append>
              <v-btn
                v-if="!copied"
                @click="copyText"
                height="38"
                depressed
                class="btn-success white--text mr-n3"
              >
                Copy</v-btn
              >
              <v-btn
                v-if="copied"
                height="38"
                depressed
                color="#13865A"
                class="white--text mr-n3"
              >
                Copied!</v-btn
              >
            </template></v-text-field
          >
          <div class="ml-4 mt-3 invite-link">Invite with email</div>
          <div class="d-flex mt-2 justify-center align-center">
            <div class="mx-2 d-flex justify-center align-center">
              <v-badge
                class="mt-1"
                left
                dot
                color="purple lighten-4 white--text"
              ></v-badge>
              <div class="mx-2 dot">Valid</div>
            </div>
            <div class="mx-2 d-flex justify-center align-center">
              <v-badge
                class="mt-1"
                left
                dot
                color="orange lighten-2 white--text"
              ></v-badge>
              <div class="mx-2 dot">Already exists</div>
            </div>
            <div class="mx-2 d-flex justify-center align-center">
              <v-badge
                class="mt-1"
                left
                dot
                color="red lighten-2 white--text"
              ></v-badge>
              <div class="mx-2 dot">Invalid</div>
            </div>
          </div>
          <v-card-text class="mt-1">
            <v-text-field
              autocomplete="off"
              v-model="email"
              color="#2a206a"
              placeholder="Add emails here"
              multiple
              dense
              hide-details
              outlined
              autofocus
              @focus="focus()"
              @keydown.enter="!email && chips.length ? addTeamMembers() : add()"
            >
            </v-text-field>
            <small class="caption d-flex align-center justify-center">
              Press enter after each email in case of multiple emails
            </small>
            <p
              v-if="validate"
              id="login-card-sub-heading"
              class="red--text lighten-4 px-4 rounded"
            >
              {{ validate }}
            </p>

            <v-list max-height="90" class="overflow-scroll">
              <div style="width: 100%">
                <v-chip
                  v-for="(chip, index) in chips"
                  :key="index"
                  id="my-chips"
                  text-color="white"
                  class="mx-1 my-1 text-truncate"
                  style="min-width: 45%"
                  :color="isCorrect(chip)"
                >
                  <div style="width: 150px" class="text-truncate">
                    <strong>{{ chip }}</strong>
                  </div>

                  <v-icon small @click="remove(chip)">
                    mdi-close-circle
                  </v-icon>
                </v-chip>
              </div>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              class="highlighted-outline-btn"
              tile
              outlined
              @click="
                modal = false;
                chips = [];
                email = null;
              "
            >
              Cancel
            </v-btn>
            <v-btn
              :disabled="!this.chips.length"
              @click="addTeamMembers()"
              tile
              class="btn-save btn-success white--text"
            >
              Send Invite
              <v-progress-circular
                v-if="loader"
                indeterminate
                class="ml-2"
                :size="20"
              ></v-progress-circular>
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import { mapGetters } from "vuex";
export default {
  name: "AddMember",
  props: ["dialog"],
  data() {
    return {
      copied: false,
      email: "",
      chips: [],
      modal: this.dialog,
      validate: "",
      members: [],
      snackbar: false,
      snackbarMessage: null,
      addMemberError: null,
      loader: false,
    };
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getAllMembers",
      "getArchievedmembers",
      "getLoggedInUser",
    ]),
  },
  methods: {
    copyText() {
      this.copied = true;
      let input = document.getElementById("copy-link-field");
      input.select();
      document.execCommand("copy");
    },
    remove(item) {
      this.chips.splice(this.chips.indexOf(item), 1);
      this.chips = [...this.chips];
    },

    // Adds email to the invitation emails array
    add() {
      if (this.email) {
        if (
          !this.chips.find((item) => {
            return item == this.email;
          })
        )
          this.chips.push(this.email);
        return (this.email = "");
      }
    },
    isCorrect(v) {
      if (
        /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/.test(
          v
        )
      ) {
        if (
          [this.getLoggedInUser]
            .concat(this.getAllMembers)
            .concat(this.getArchievedmembers)
            .find((item) => {
              return item.email == v;
            })
        ) {
          return "orange lighten-2";
        }

        return "purple lighten-4";
      } else {
        return "red lighten-2";
      }
    },
    focus() {
      this.validate = "";
    },

    // Submits final members to invite
    addTeamMembers() {
      for (let chip of this.chips) {
        if (
          ![this.getLoggedInUser]
            .concat(this.getAllMembers)
            .concat(this.getArchievedmembers)
            .find((item) => {
              return item.email == chip;
            })
        ) {
          if (
            /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/.test(
              chip
            )
          ) {
            this.members.push(chip);
          }
        }
      }
      if (this.members.length) {
        // Emit to parent component to show temporary state of members
        this.$emit(
          "membersTemp",
          this.members.map((item) => {
            return { email: item };
          })
        );
        this.modal = false;
        this.loader = true;
        this.$store
          .dispatch("addteamMembers", {
            company_id: this.getSelectedCompany.id,
            members: this.members,
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Invitation Successfully Sent!",
              text: "An email has been successfully sent to the user",
            });
            this.loader = false;
            this.$emit("membersDone");
          })
          .catch((error) => {
            this.$emit("membersDone");
            if (error.response.status == 422) {
              this.loader = false;
              this.snackbar = true;
              this.addMemberError = true;
              if (error.response.data.errors.members[0]) {
                this.snackbarMessage = error.response.data.errors.members[0];
              }

              setTimeout(() => {
                this.chips = [];
                this.modal = false;
              }, 1000);
            }
          });
        this.members = [];
      }
    },
  },
  watch: {
    dialog(value) {
      this.modal = value;
      if (!value) {
        this.chips = [];
        this.members = [];
        this.copied = false;
      }
    },
    modal(value) {
      if (!value) {
        this.$emit("close");
      }
    },
  },
};
</script>
<style scoped>
.modal-header-color {
  background-color: #00838f !important;
  color: #fff;
}
.display-1 {
  font-size: 25px !important;
  font-weight: 600 !important;
}
.btn-save {
  color: #fff !important;
  font-size: 12px !important;
}
.btn-cancel {
  font-size: 12px !important;
  /* background-color: lightgrey !important; */
}
#my-chips {
  border-radius: 5px !important;
}
.invite-link {
  font-size: 14px !important;
  font-weight: bold !important;
}
.dot {
  font-size: 12px !important;
}
</style>
