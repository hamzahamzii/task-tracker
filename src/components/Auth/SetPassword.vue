<template>
  <div>
    <!-- Render form-base-layout component-->
    <FormLayout :imgSrc="this.imgSource" :imgWidth="imgWdth">
      <!-- Pass form slot to component(FormLayout) -->
      <template v-slot:form>
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
              id="set-pass-heading"
              :class="
                $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                  ? 'my-8'
                  : 'mt-10 ml-8'
              "
              class="btn--text card-heading"
            >
              Set Password
            </p>
            <!-- <p
            id="set-password-sub-heading"
            class="ml-6 mt-2 red--text red lighten-4 pa-2 rounded"
          >
            {{ validate }}
          </p> -->
            <v-form
              id="set-password-form"
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
                label="Email"
                outlined
                disabled
                class="mb-n4"
                prepend-inner-icon="mdi-email"
              ></v-text-field>

              <!-- Password Field -->
              <v-text-field
                color="purple darken-2"
                ref="pswd"
                autofocus
                outlined
                :error-messages="invalidPassword"
                v-model="password"
                :rules="passwordRules"
                counter
                label="Enter Password"
                prepend-inner-icon="mdi-lock"
                :append-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                :type="visible ? 'text' : 'password'"
                @click:append="visible = !visible"
                @keydown.enter="setPassword()"
                @focus="resetValidation()"
                min-length="6"
              ></v-text-field>

              <!-- Set Password button -->
              <v-btn
                :disabled="!valid"
                id="set-passowrd-btn"
                :x-large="$vuetify.breakpoint.md || $vuetify.breakpoint.lg"
                :medium="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
                width="60%"
                class="btn-success mx-auto text-capitalize mt-1 white--text align-center d-flex"
                :class="$vuetify.breakpoint.xs ? 'subtitle-1' : 'title'"
                @click="setPassword()"
              >
                Set Password
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
    <!-- snackbar messages -->
    <v-snackbar
      class="mt-5"
      top
      right
      :color="setPasswordError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="setPasswordError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="setPasswordError ? 'red' : 'green'"
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
import FormLayout from "../Layouts/FormLayout";
export default {
  name: "login",
  components: {
    FormLayout,
  },
  data() {
    return {
      snackbarMessage: null,
      setPasswordError: null,
      snackbar: false,
      get: "",
      validate: null,
      loader: false,
      visible: false,
      valid: true,
      password: null,
      imgSource: "",
      imgWdth: "60%",
      email: this.$route.params.email,
      invalidPassword: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) =>
          (v && v.length >= 6) || "Password must be at least 6 characters long",
        (v) =>
          (v && v.length <= 15) || "Password must not exceed 15 characters",
      ],
    };
  },
  methods: {
    resetValidation() {
      this.$refs.pswd.resetValidation();
    },
    setPassword() {
      if (this.$route.params.email && this.password) {
        let user = {
          email: this.$route.params.email,
          password: this.password,
          token: this.$route.params.token,
        };
        localStorage.setItem("user", user);
        this.loader = true;
        this.$store
          .dispatch("setPassword", user)
          .then((response) => {
            console.log(response);
            if (localStorage.getItem("anotherTab") == "loggedIn") {
              this.snackbar = true;
              this.snackbarMessage = "Please logout from another tab";
              this.setPasswordError = true;
              this.loader = false;
              localStorage.removeItem("anotherTab");
            }
          })
          .catch((error) => {
            this.loader = false;
            if (error.response.data.error == true) {
              if (error.response.data.errors.email) {
                this.validate = error.response.data.errors.email[0];
                this.snackbar = true;
              }
              if (error.response.data.errors.password) {
                this.validate = error.response.data.errors.password[0];
                this.snackbar = true;
              }
            }
          });
      }
    },
  },
};
</script>
<style scoped>
#set-passowrd-btn {
  width: 342px;
  height: 50px;
}
</style>
