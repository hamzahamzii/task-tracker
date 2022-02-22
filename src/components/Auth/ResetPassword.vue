<template>
  <!-- Render form-base-layout component-->
  <FormLayout>
    <!-- Pass form slot to component(FormLayout) -->
    <template v-slot:form>
      <v-snackbar
        class="mt-5"
        top
        :color="createTaskError ? 'red lighten-5' : 'green lighten-5'"
        light
        v-model="snackbar"
      >
        <span :class="createTaskError ? 'red--text' : 'green--text'">
          {{ snackbarMessage }}</span
        >
        <template v-slot:action="{ attrs }">
          <v-btn
            :color="createTaskError ? 'red' : 'green'"
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
      <v-card
        :width="
          $vuetify.breakpoint.md ||
          $vuetify.breakpoint.sm ||
          $vuetify.breakpoint.xs
            ? '100%'
            : $vuetify.breakpoint.xl
            ? '60%'
            : '60%'
        "
        elevation="0"
        :class="
          $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
            ? 'mx-auto my-10'
            : ''
        "
      >
        <v-card-text>
          <!--card Heading -->
          <p
            id="set-password-heading"
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'my-8 text-h6 dark-purple-text'
                : 'mt-10 ml-8 card-heading'
            "
          >
            <b>Reset Password</b>
          </p>
          <v-form
            id="reset-password-form"
            ref="form"
            v-model="valid"
            lazy-validation
            class
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'mx-auto'
                : 'my-10 form mx-8'
            "
            autocomplete="off"
          >
            <!-- Disabled Email Field -->
            <v-text-field
              color="purple darken-2"
              v-model="email"
              label="Email Address *"
              outlined
              disabled
              class="mb-n4"
            ></v-text-field>

            <!-- Password Field -->
            <v-text-field
              color="purple darken-2"
              ref="pswd"
              autofocus
              outlined
              :error-messages="invalidPassword"
              v-model="password"
              :rules="required"
              label="Password *"
              :append-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
              :type="visible ? 'text' : 'password'"
              @click:append="visible = !visible"
              @focus="resetValidation()"
              @input="checkPasswordStrength"
              min-length="6"
            ></v-text-field>
            <ul class="mb-6">
              <li :class="contains_lowercase ? 'green-text' : 'grey-text'">
                Include at least one alphabet
              </li>
              <li :class="contains_number ? 'green-text' : 'grey-text'">
                Include at least one number
              </li>
              <li
                :class="contains_special_charctrs ? 'green-text' : 'grey-text'"
              >
                Include at least one special character
              </li>
              <li :class="has_valid_length ? 'green-text' : 'grey-text'">
                must be at least 8 characters long
              </li>
            </ul>
            <!-- Confirm Password Field -->
            <v-text-field
              color="purple darken-2"
              ref="pswd"
              autofocus
              outlined
              :error-messages="invalidPassword"
              v-model="confirmPassword"
              :rules="required"
              label="Confirm Password *"
              :append-icon="visible2 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="visible2 ? 'text' : 'password'"
              @click:append="visible2 = !visible2"
              @keydown.enter="resetPassword()"
              @focus="resetValidation()"
              min-length="6"
            ></v-text-field>

            <!-- Set Password button -->
            <v-btn
              :disabled="!valid"
              id="reset-btn"
              :x-large="$vuetify.breakpoint.md || $vuetify.breakpoint.lg"
              :medium="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
              width="60%"
              class="btn-success mx-auto my-8 text-capitalize mt-1 white--text align-center d-flex"
              :class="$vuetify.breakpoint.xs ? 'subtitle-1' : 'title'"
              @click="resetPassword()"
            >
              Reset
              <v-progress-circular
                v-if="loader"
                indeterminate
                class="ml-2"
              ></v-progress-circular>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </template>
  </FormLayout>
</template>

<script>
import { required } from "@/validations/validations.js";
import FormLayout from "../Layouts/FormLayout";
export default {
  name: "login",
  components: {
    FormLayout,
  },
  data() {
    return {
      validate: "",
      loader: false,
      valid: true,
      password: null,
      confirmPassword: null,
      required: required,
      email: this.$route.params.email,
      invalidPassword: "",
      visible: false,
      visible2: false,
      createTaskError: null,
      snackbar: false,
      snackbarMessage: null,
      // For Password Strength Indication
      contains_lowercase: false,
      contains_number: false,
      has_valid_length: false,
      contains_special_charctrs: false,
    };
  },

  methods: {
    resetValidation() {
      this.$refs.pswd.reset();
    },
    resetPassword() {
      let data = {
        email: this.$route.params.email,
        password: this.password,
        confirm_password: this.confirmPassword,
        token: this.$route.params.token,
      };
      this.loader = true;
      this.$store
        .dispatch("resetPassword", data)
        .then(() => {
          this.loader = false;
          this.snackbar = true;
          this.snackbarMessage = "User loggedIn successfully";
          this.createTaskError = false;
        })
        .catch((error) => {
          this.loader = false;
          this.snackbar = true;
          this.createTaskError = true;
          this.snackbarMessage = error.response.data.error_msg;
          if (error.response.status == 422) {
            if (error.response.data.errors.password) {
              this.snackbarMessage = error.response.data.errors.password[0];
            }
            if (error.response.data.errors.confirm_password) {
              this.snackbarMessage =
                error.response.data.errors.confirm_password[0];
            }
          }
          if (error.response.status == 500) {
            this.snackbarMessage = "Something went wrong!";
          }
        });
    },
    checkPasswordStrength() {
      this.contains_lowercase = /[a-zA-Z]/.test(this.password);
      this.contains_number = /\d/.test(this.password);
      this.has_valid_length = this.password.length > 7;
      this.contains_special_charctrs = /[!@#$%^&*)(+=._-]/.test(this.password);
      if (
        this.contains_lowercase &&
        this.contains_number &&
        this.has_valid_length &&
        this.contains_special_charctrs
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
<style scoped>
#reset-btn {
  width: 342px;
  height: 50px;
}
.grey-text {
  color: #6f7490;
}
.green-text {
  color: #28806d;
}
</style>
