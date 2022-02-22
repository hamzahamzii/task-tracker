<template>
  <!-- Render form-base-layout component to render Image and pass input fields -->
  <FormLayout :imgSrc="this.imgSource" :imgWidth="imgWdth">
    <!-- Pass form slot to component(FormLayout) -->
    <template v-slot:form>
      <v-snackbar
        class="mt-5"
        top
        center
        :color="updateTaskError ? 'red lighten-5' : 'green lighten-5'"
        light
        v-model="snackbar"
      >
        <span :class="updateTaskError ? 'red--text' : 'green--text'">
          {{ snackbarMessage }}</span
        >
        <template v-slot:action="{ attrs }">
          <v-btn
            :color="updateTaskError ? 'red' : 'green'"
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
      <v-card
        :width="
          $vuetify.breakpoint.md ||
          $vuetify.breakpoint.sm ||
          $vuetify.breakpoint.xs
            ? '100%'
            : $vuetify.breakpoint.xl
            ? '40%'
            : '60%'
        "
        elevation="0"
        :class="
          $vuetify.breakpoint.sm || $vuetify.breakpoint.xs ? 'mx-auto' : ''
        "
      >
        <v-card-text>
          <div :class="$vuetify.breakpoint.xs ? 'mx-auto mb-5' : 'mx-8'">
            <p
              v-if="validate"
              id="signup-card-sub-heading"
              class="red--text red lighten-4 pa-4 rounded"
            >
              {{ validate }}
            </p>

            <!-- Alert message for success-->
            <v-alert dense text type="success" v-if="success">{{
              success
            }}</v-alert>

            <!--Card Heading -->
            <p id="signup-card-heading" class="mt-10 mb-5 card-heading">
              Create Account
            </p>
          </div>
          <v-form
            id="signup-card-form"
            ref="form"
            v-model="valid"
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'mx-auto'
                : 'form mx-8'
            "
            lazy-validation
            autocomplete="off"
          >
            <!-- Full Name Input Field -->
            <v-text-field
              color="purple darken-2"
              id="signup-card-fullname-input"
              outlined
              v-model="name"
              :rules="required"
              label="Full Name *"
              @focus="onFocus"
            ></v-text-field>
            <!-- Email Input Field -->
            <v-text-field
              color="purple darken-2"
              id="signup-card-email-input"
              :error-messages="erroremail"
              outlined
              v-model="email"
              :rules="emailRules"
              label="Email Address *"
              @focus="onFocus"
            ></v-text-field>

            <!--Create Account Button-->
            <v-btn
              id="sf-create-account-btn"
              :disabled="!valid"
              :class="$vuetify.breakpoint.xs ? 'subtitle-1' : 'title'"
              :x-large="$vuetify.breakpoint.md || $vuetify.breakpoint.lg"
              :medium="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
              :width="$vuetify.breakpoint.xs ? '250px' : '342px'"
              class="btn-success mx-auto mb-1 text-capitalize white--text white--text align-center d-flex"
              @click="signup()"
              >Create Account
              <v-progress-circular
                v-if="loader"
                indeterminate
                class="ml-2"
              ></v-progress-circular>
            </v-btn>
            <!--login redirect Text-->
            <p class="subtitle ml-1 justify-center align-center d-flex">
              Already have an account?
              <router-link
                id="login-link"
                to="/login"
                class="text-decoration-none success-text ml-2"
                >Login</router-link
              >
            </p>
          </v-form>
        </v-card-text>
      </v-card>
    </template>
    <SetPassword :email="email" />
  </FormLayout>
</template>

<script>
import { nameRules, emailRules, required } from "@/validations/validations.js";
import FormLayout from "../Layouts/FormLayout";
// import router from "@/router";
export default {
  name: "signup",
  components: {
    FormLayout,
    SetPassword: () => import("@/components/Auth/SetPassword"),
  },
  data() {
    return {
      updateTaskError: null,
      snackbar: false,
      snackbarMessage: null,
      validate: "",
      loader: false,
      erroremail: "",
      errorpassword: "",
      visible: false,
      valid: true,
      name: null,
      email: null,
      password: null,
      passwordVisible: false,
      nameRules: nameRules,
      emailRules: emailRules,
      required: required,
      imgSource: "",
      imgWdth: "70%",
      success: null,
    };
  },
  methods: {
    onFocus() {
      this.erroremail = "";
      this.validate = "";
      this.errorpassword = "";
    },
    signup() {
      if (this.email) {
        let user = {
          name: this.name,
          email: this.email,
        };
        this.loader = true;
        localStorage.setItem("registered-email", user.email);
        this.$store
          .dispatch("userRegister", user)
          .then(() => {
            this.loader = false;
            this.success =
              "A verification link has been sent to your account. Please click on the link to set a password for your account";
          })
          .catch((error) => {
            this.loader = false;
            if (error.response.status == 422) {
              if (error.response.data.errors.name) {
                this.snackbar = true;
                this.updateTaskError = true;
                // this.error = error.response.data.errors.password[0];
                this.snackbarMessage = error.response.data.errors.name[0];
              }
              if (error.response.data.errors.email) {
                this.snackbar = true;
                this.updateTaskError = true;
                this.snackbarMessage = error.response.data.errors.email[0];
              }
            }
          });
      } else {
        this.validate = "Enter your credentials to proceed!";
      }
    },
  },
};
</script>
<style>
.card-margin {
  margin-top: 15%;
}

#sf-create-account-btn {
  /* width: 342px; */
  height: 50px;
}
</style>
