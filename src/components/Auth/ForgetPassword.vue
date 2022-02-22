<template>
  <FormLayout :imgSrc="this.imgSource" :imgWidth="imgWdth">
    <template v-slot:form>
      <v-snackbar
        class="mt-5"
        top
        right
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
          <div :class="$vuetify.breakpoint.xs ? 'mx-auto mb-5' : 'mx-8'">
            <!-- Alert message for success-->
            <v-alert dense text type="error" v-if="error">{{ error }}</v-alert>
            <p
              id="forgot-password-card-heading"
              :class="
                $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                  ? 'mb-2 forgot-password-card-heading-xs dark-purple-text text-h6 font-weight-bold'
                  : 'card-heading'
              "
              class="my-9 "
            >
              Forgot Password
            </p>
          </div>

          <v-form
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'mx-auto'
                : 'mb-10 form mx-8'
            "
            v-model="valid"
            @submit.prevent="sendEmail"
          >
            <v-text-field
              color="purple darken-2"
              :rules="emailRules"
              outlined
              label="Email Address *"
              type="text"
              v-model="email"
              required
            ></v-text-field>

            <v-btn
              id="forget-btn"
              dark
              :class="$vuetify.breakpoint.xs ? 'subtitle-1' : 'title'"
              :x-large="$vuetify.breakpoint.md || $vuetify.breakpoint.lg"
              :medium="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
              width="60%"
              class="btn-success mx-auto mb-5 text-capitalize mt-1 white--text align-center d-flex"
              type="submit"
            >
              Submit
              <v-progress-circular
                v-if="loader"
                indeterminate
                class="ml-2"
              ></v-progress-circular>
            </v-btn>

            <!--login redirect Text-->
            <p class="subtitle ml-1 justify-center align-center d-flex">
              <router-link id="login-link" to="/login" class="success-text ml-2"
                >Back to Login</router-link
              >
            </p>
          </v-form>
        </v-card-text>
      </v-card>
    </template>
  </FormLayout>
</template>

<script>
import FormLayout from "../Layouts/FormLayout";
import { emailRules } from "@/validations/validations.js";
export default {
  name: "ForgetPassword",
  components: {
    FormLayout,
  },
  data() {
    return {
      loader: false,
      visible: false,
      valid: true,
      email: null,
      emailRules: emailRules,
      imgSource: "",
      imgWdth: "70%",
      error: "",
      createTaskError: null,
      snackbar: false,
      snackbarMessage: null,
    };
  },
  methods: {
    sendEmail() {
      let data = {
        email: this.email,
      };
      this.loader = true;
      this.$store
        .dispatch("forgetPasssword", data)
        .then((response) => {
          this.loader = false;
          this.snackbar = true;
          this.snackbarMessage = response.data.error_msg;
          this.createTaskError = false;
        })
        .catch((error) => {
          this.loader = false;
          if (error.response.status == 422) {
            if (error.response.data.error_msg) {
              this.snackbar = true;
              this.createTaskError = true;
              this.snackbarMessage = error.response.data.error_msg;
            } else if (error.response.data.errors.email) {
              this.snackbar = true;
              this.createTaskError = true;
              this.snackbarMessage = error.response.data.errors.email[0];
            }
          }
        });
    },
  },
};
</script>
<style scoped>
#forget-btn {
  /* width: 342px; */
  height: 50px;
}
/* .forgot-password-card-heading {
  color: #2a206a;
} */
.forgot-password-card-heading-xs {
  font-size: 20px;
}
</style>
