<template>
  <div class="text-center">
    <v-dialog
      persistent
      v-model="openConfirmationDialog"
      width="250"
      height="80"
    >
      <v-card>
        <v-app-bar height="42px" class="headline pa-0 darken-1 white--text">
          <span class="float-left subtitle-1 ui-theme-color"
            >Discard Conflict
          </span>
          <v-spacer></v-spacer>
          <v-icon small color="grey" @click="dismiss" class="float-right"
            >mdi-close</v-icon
          >
        </v-app-bar>

        <v-card-text class="mt-2">
          <p class="caption">
            If you click confirm, the selected tasks will permanently be deleted
            from the task log.
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small class="theme-filled-btn" text @click="confirm">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { eventBus } from "@/main";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getActiveTask",
      "getActiveTimeEntry",
    ]),
  },
  props: ["openConfirmationDialog", "toDelete"],
  methods: {
    dismiss() {
      this.$emit("update:openConfirmationDialog", false);
    },
    confirm() {
      let req = {
        company_id: this.getSelectedCompany.id,
      };
      // delete conflicts case
      if (this.toDelete.length) {
        req.time_entries = this.toDelete;
        this.$store.dispatch("removeTimeEntries", req).then(() => {
          eventBus.$emit("retry", true);
        });
      }
      // discard case
      else {
        // Stop case
        if (this.getActiveTask) {
          req.time_entries = [this.getActiveTimeEntry.entry_id];
          this.$store
            .dispatch("removeTimeEntries", req)
            .then(() => {
              this.$store.commit("setDiscardedTask");
              eventBus.$emit("retry", false);
            })
            .catch(() => {
              this.$store.commit("setActiveTask", null);
              this.$store.commit("resetTimer");
              eventBus.$emit("retry", false);
            });
        } else {
          eventBus.$emit("retry", false);
        }
      }
      this.$emit("update:openConfirmationDialog", false);
    },
  },
};
</script>