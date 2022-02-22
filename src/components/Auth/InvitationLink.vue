<template>
  <FormLayout :imgSrc="this.imgSource" :imgWidth="imgWdth">
    <template v-slot:form>
      <v-snackbar
        class="mt-5"
        top
        right
        :color="inviteError ? 'red lighten-5' : 'green lighten-5'"
        light
        v-model="snackbar"
      >
        <span :class="inviteError ? 'red--text' : 'green--text'">
          {{ snackbarMessage }}</span
        >
        <template v-slot:action="{ attrs }">
          <v-btn
            :color="inviteError ? 'red' : 'green'"
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
              class="my-9"
            >
              Invitation Link
            </p>
          </div>

          <v-form
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'mx-auto'
                : 'mb-10 form mx-8'
            "
            v-model="valid"
            @submit.prevent="inviteMember"
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
  name: "InvitationLink",
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
      inviteError: null,
      snackbar: false,
      snackbarMessage: null,
    };
  },
  mounted() {},
  methods: {
    inviteMember() {
      this.$store
        .dispatch("inviteMember", {
          invite_token: this.$route.params.token,
          company_id: this.$route.params.cid,
          email: this.email,
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status == 422) {
            if (err.response.data.errors.name) {
              this.snackbar = true;
              this.inviteError = true;
              this.snackbarMessage = err.response.data.errors.name[0];
            }
            if (err.response.data.errors.email) {
              this.snackbar = true;
              this.inviteError = true;
              this.snackbarMessage =
                "Email may not be greater than 50 characters";
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
