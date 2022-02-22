<template>
  <!-- Render form-base-layout component to render Image and pass input fields -->
  <FormLayout>
    <!-- Pass form slot to component(FormLayout) -->
    <template v-slot:form>
      <!-- snackbar -->
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
            <v-icon small> mdi-close-circle </v-icon>
          </v-btn>
        </template>
      </v-snackbar>
      <!-- card -->
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
          $vuetify.breakpoint.sm || $vuetify.breakpoint.xs ? 'mx-auto ' : ''
        "
      >
        <v-card-text>
          <p
            v-if="validate"
            id="login-card-sub-heading"
            class="red--text red lighten-4 pa-4 rounded"
          >
            {{ validate }}
          </p>
          <div
            v-if="errorLogin"
            class="mt-2 mx-8 red lighten-4 rounded red--text pa-3"
          >
            <small>{{ errorLogin }}</small>
          </div>
          <!--card Heading -->
          <v-card-title
            :class="$vuetify.breakpoint.xs ? 'mx-auto mb-5' : 'mx-4'"
          >
            <p id="login-card-heading" class="font-weight-bold card-heading">
              Login
            </p>
            <!-- <p>to get started with Task Timer</p> -->
          </v-card-title>
          <v-form
            id="login-form"
            ref="form"
            v-model="valid"
            lazy-validation
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'mx-auto'
                : 'mb-16 form mx-8'
            "
            autocomplete="off"
          >
            <!-- email Input Field -->

            <v-text-field
              color="purple darken-2"
              id="login-email-input"
              outlined
              v-model="email"
              :rules="emailRules"
              label="Email Address *"
              @focus="focus"
            ></v-text-field>
            <!-- Password Input Field -->

            <v-text-field
              color="purple darken-2"
              id="login-password-input"
              outlined
              v-model="password"
              :rules="required"
              label="Password *"
              :append-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
              :type="visible ? 'text' : 'password'"
              @click:append="visible = !visible"
              @keydown.enter="login()"
              @focus="focus"
              class="mb-n7"
            ></v-text-field>
            <!-- CheckBox Field -->
            <v-row align="center" class="mx-1">
              <v-checkbox
                id="login-remember-checkbox"
                label="Remember Me"
              ></v-checkbox>
              <!-- Forgot Password Page Redirect Text -->
              <v-spacer></v-spacer>
              <router-link
                id="forget-password-link"
                to="/forget-password"
                class="text-decoration-none subtitle success-text"
                :class="
                  $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                    ? 'float-left my-2'
                    : 'float-right'
                "
                >Forgot Password?</router-link
              >
            </v-row>
            <!-- Login button -->
            <v-btn
              :disabled="!valid"
              id="login-btn"
              :class="$vuetify.breakpoint.xs ? 'subtitle-1' : 'title'"
              :x-large="$vuetify.breakpoint.md || $vuetify.breakpoint.lg"
              :medium="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
              width="60%"
              class="btn-success white--text mx-auto my-1 text-capitalize mt-5 white--text align-center d-flex"
              @click="login"
            >
              Login
              <v-progress-circular
                v-if="loader"
                indeterminate
                class="ml-2"
              ></v-progress-circular>
            </v-btn>

            <!--SignUp Page Redirect Text -->
            <p class="mt-1 subtitle ml-1 justify-center align-center d-flex">
              Don't have an account?
              <router-link
                id="signup-link"
                to="signup"
                class="text-decoration-none success-text ml-2"
                >Sign Up</router-link
              >
            </p>
          </v-form>
        </v-card-text>
      </v-card>
    </template>
  </FormLayout>
</template>

<script>
import { emailRules, required } from "@/validations/validations.js";
import FormLayout from "../Layouts/FormLayout";
import { mapGetters } from "vuex";
export default {
  name: "login",
  components: {
    FormLayout,
  },
  computed: {
    ...mapGetters(["getCompanies"]),
  },
  data() {
    return {
      validate: "",
      loader: false,
      errorLogin: "",
      visible: false,
      valid: true,
      password: null,
      email: null,
      emailRules: emailRules,
      required: required,
      updateTaskError: null,
      snackbar: false,
      snackbarMessage: null,
      // imgSource: require("@/assets/images/login-img.png"),
      // imgWdth: "70%",
      autofilled: false,
    };
  },
  methods: {
    // User login
    login() {
      if (this.email && this.password) {
        let user = {
          email: this.email,
          password: this.password,
        };
        this.loader = true;
        this.$store.commit("setTasksSkeletonLoader", true);
        this.$store
          .dispatch("userLogin", user)
          .then(() => {
            localStorage.setItem("user", user);
            this.$store.dispatch("fetchCompanies").then(() => {
             
            }).catch((error) => {
            if (error.response.status == 422) {
              this.snackbar = true;
              this.updateTaskError = true;
              this.snackbarMessage = error.response.data.error_msg;
            }
          });
            this.loader = false;
          })
          .catch((error) => {
            this.loader = false;
            if (error.response.status == 422) {
              if (error.response.data.errors.email) {
                this.snackbar = true;
                this.updateTaskError = true;
                this.snackbarMessage = error.response.data.errors.email[0];
              }
            }
          });
      } else {
        this.validate = "Enter your credentials to proceed";
      }
    },
    focus() {
      this.validate = "";
      this.errorLogin = "";
    },
  },
  mounted() {
    // if user's session has not expired yet then redirect the user to dashboard else route to login
    if (localStorage.getItem("user") && localStorage.getItem("token")) {
      this.$router.push({
        name: "task",
      });
    }
  },
};
</script>
<style scoped>
.card-margin {
  margin-top: 15%;
}
#login-btn {
  height: 50px;
}
</style>
