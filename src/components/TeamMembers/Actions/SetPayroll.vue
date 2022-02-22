<template>
  <div>
    <v-snackbar
      class="mt-5"
      top
      right
      :color="updatePayRollError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="updatePayRollError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="updatePayRollError ? 'red' : 'green'"
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
    <v-dialog v-model="flag" width="300">
      <v-card tile class="white">
        <v-overlay
          :value="getFetchPayRollLoader"
          :absolute="absolute"
          v-if="getFetchPayRollLoader == true"
        >
          <div>
            <div class="snippet">
              <div class="stage">
                <div class="dot-stretching"></div>
              </div>
            </div>
          </div>
        </v-overlay>
        <!-- Title bar -->
        <v-card-title
          class="py-3 px-4 text-truncate dialog-title-border ui-theme-color"
        >
          <div class="d-flex justify-center" style="width: 90%">
            <span>
              <b class="modals-title-size">
                Set Payroll
              </b>
            </span>
          </div>

          <v-spacer></v-spacer>
          <v-icon small color="#757096" @click="closeDialog">mdi-close</v-icon>
        </v-card-title>
        <!-- Edit Member Form -->
        <v-card-text class="mt-5">
          <v-form ref="form" v-model="valid" lazy-validation>
            <!-- Rate per hour text field -->
            <v-text-field
              autocomplete="off"
              color="#2a206a"
              dense
              outlined
              v-model="getPayroll.hourly_rate"
              label="Rate per Hour"
              prepend-inner-icon="mdi-cash"
            ></v-text-field>
            <!-- Currency Field -->
            <v-autocomplete
              v-if="getCurrencies"
              color="#2a206a"
              dense
              :items="getCurrencies"
              v-model="getPayroll.currency_name"
              outlined
              flat
              solo
              item-value="hash_id"
              item-text="name"
              label="Currency"
              auto-select-first
              :prepend-inner-icon="
                !getPayroll.currency_name ? 'mdi-currency-usd' : ''
              "
            >
              <template v-slot:item="{ item }">
                <div class="d-flex" style="width:200px;">
                  <span class="caption">
                    {{ item.sign }}
                  </span>
                  <span class="caption ml-3">
                    {{ item.name }}
                  </span>
                </div>
              </template>
              <template v-slot:selection="{ item }">
                <div class="d-flex align-center">
                  <div>{{ item.sign }}</div>
                  <div class="ml-3">{{ item.name }}</div>
                </div>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>

        <!-- save button -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="reset-btn text-capitalize"
            color="darken-1"
            tile
            text
            @click="reset()"
            >Reset
          </v-btn>
          <v-btn
            class="white--text btn-success text-capitalize"
            color="darken-1"
            text
            tile
            @click="save()"
            >Confirm
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
export default {
  data() {
    return {
      flag: true,
      valid: true,
      currency: "",
      ratePerHour: "",
      loader: false,
      updatePayRollError: null,
      snackbar: false,
      snackbarMessage: null,
      absolute: true,
    };
  },
  props: ["openPayrollDialog", "memberDetails"],
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getCurrencies",
      "getPayroll",
      "getFetchPayRollLoader",
    ]),
  },
  watch: {
    flag(value) {
      !value ? this.$emit("update:openPayrollDialog", false) : () => {};
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:openPayrollDialog", false);
    },
    reset() {
      this.getPayroll.hourly_rate = null;
      this.getPayroll.currency_name = null;
    },
    save() {
      this.loader = true;
      this.currency = this.memberDetails.currency_name;
      let data = {
        user_id: this.memberDetails.id,
        company_id: this.getSelectedCompany.id,
        currency_id: this.getPayroll.currency_name,
        hourly_rate: this.getPayroll.hourly_rate,
        is_effective: false,
      };
      this.$store
        .dispatch("AddCurrency", data)
        .then((response) => {
          if (response.status == 200) {
            this.loader = false;
            this.snackbar = true;
            this.snackbarMessage = response.data.error_msg;
            this.updatePayRollError = false;
            setTimeout(() => {
              this.closeDialog();
            }, 1000);
          }
        })
        .catch((error) => {
          this.loader = false;
          this.snackbar = true;
          this.updatePayRollError = true;
          if (error.response.status == 422) {
            if (error.response.data.errors.currency_id) {
              this.snackbarMessage = error.response.data.errors.currency_id[0];
            } else if (error.response.data.errors.hourly_rate) {
              this.snackbarMessage = error.response.data.errors.hourly_rate[0];
            }
          }
        });
    },
  },
};
</script>
<style scoped>
.reset-btn {
  color: #1cc283 !important;
  background-color: white;
  border: 1px #1cc283 solid;
}
.v-autocomplete__content.v-menu__content .v-select-list {
  border-radius: 0 0 4px 4px;
  max-height: 78px;
  overflow: scroll;
}
</style>
