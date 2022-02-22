<template>
  <!-- Render form-base-layout component-->
  <FormLayout>
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
          $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
            ? 'mx-auto my-10'
            : ''
        "
      >
        <v-card-text>
          <!--card Heading -->
          <p
            id="invite-setup"
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'mt-1'
                : 'ml-4 display-6 mt-2'
            "
            class="btn--text text-center"
          >
            Account Setup
          </p>
          <div v-if="!startCam">
            <div v-if="!image_src">
              <div
                class="pa-2 mt-5 uploadImageContainer"
                @click="uploadImageDialog"
              >
                <div
                  class="btn--text mt-5 upload-image-text-hover"
                  style="font-size:10px;"
                >
                  Upload an Image <br />
                  Dimensions 150 x 150<br />
                  Files Allowed are JPG , PNG ,JPEG
                </div>
                <input
                  ref="uploader"
                  @change="onFileChange"
                  accept="image/png, image/jpg, image/jpeg"
                  data-vv-as="Image"
                  class="d-none"
                  data-vv-validate-on="change"
                  name="logo"
                  type="file"
                />
              </div>
              <v-layout class="justify-center mt-3">
                <v-btn
                  @click="openWebCam"
                  class="text-capitalize upload-pic-webcam-btn"
                  depressed
                  large
                  justify="center"
                >
                  <b> Upload From WebCam </b>
                </v-btn>
              </v-layout>
            </div>
            <div v-else>
              <div
                v-if="
                  cropped_file_url &&
                    (uploadResult === 'Please wait...!' ||
                      uploadResult === true ||
                      uploadResult === '')
                "
              >
                <v-layout class="justify-center">
                  <img
                    :src="cropped_file_url"
                    width="150"
                    height="150"
                    @error="
                      $event.target.src = require('@/assets/images/dummy-user-logo.png')
                    "
                    class="mt-7"
                  />
                </v-layout>
                <v-layout class="justify-center mt-1">
                  <v-btn @click="removeImage" depressed fab small>
                    <v-icon color="red" small>mdi-delete </v-icon>
                  </v-btn>
                </v-layout>
              </div>

              <div
                v-if="
                  !cropped_file_url ||
                    (uploadResult &&
                      uploadResult !== 'Please wait...!' &&
                      uploadResult !== true)
                "
              >
                <imageCroper
                  class="mt-7"
                  :cropHeight="100"
                  :cropWidth="100"
                  :imgSrc="image_src"
                  :imgStyle="{ width: '150px', height: '150px' }"
                  :resizeable="false"
                  @croped_file="attach_crop_file($event)"
                  alt="User Image"
                />
                <v-layout class="justify-center">
                  <v-btn
                    @click="removeImage"
                    depressed
                    fab
                    class="delete-image-btn"
                    small
                  >
                    <v-icon color="red" small>mdi-delete </v-icon>
                  </v-btn>
                </v-layout>
              </div>
            </div>
            <div
              class="text-center"
              v-bind:class="{
                error:
                  uploadResult &&
                  uploadResult !== 'Please wait...!' &&
                  uploadResult !== true,
              }"
            >
              <span class="error-msg ml-2" v-if="uploadResult !== true">{{
                uploadResult
              }}</span>
            </div>
          </div>

          <div v-if="startCam">
            <div class="text-center">
              <v-layout class="justify-center mt-7">
                <web-cam
                  class="web-cam-style"
                  :deviceId="deviceId"
                  @cameras="onCameras"
                  @error="onError"
                  ref="webcam"
                />
              </v-layout>

              <v-btn
                @click="onCapture"
                class="text-capitalize upload-pic-webcam-btn mt-1 mb-2"
                depressed
                >Capture Photo</v-btn
              >
            </div>
          </div>

          <p
            v-if="validate"
            id="set-password-sub-heading"
            class="mt-2 red--text red lighten-4 pa-2 rounded"
          >
            {{ validate }}
          </p>

          <v-form
            id="set-password-form"
            ref="form"
            v-model="valid"
            lazy-validation
            class
            :class="
              $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                ? 'mx-auto mt-2'
                : 'form mx-8 mt-2'
            "
            autocomplete="off"
          >
            <!-- Name Field -->
            <v-text-field
              color="purple darken-2"
              v-model="name"
              label="Full Name *"
              autofocus
              outlined
              :rules="required"
            ></v-text-field>

            <!-- Password Field -->
            <v-text-field
              color="purple darken-2"
              ref="pswd"
              outlined
              :error-messages="invalidPassword"
              v-model="password"
              :rules="required"
              label="Password *"
              :append-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
              :type="visible ? 'text' : 'password'"
              @click:append="visible = !visible"
              @focus="resetValidation()"
              min-length="6"
            ></v-text-field>
            <!-- Confirm Password Field -->
            <v-text-field
              color="purple darken-2"
              ref="confirm-pswd"
              outlined
              v-model="confirmPassword"
              :rules="confirmPasswordRules"
              label="Confirm Password *"
              :append-icon="confmVisible ? 'mdi-eye' : 'mdi-eye-off'"
              :type="confmVisible ? 'text' : 'password'"
              @click:append="confmVisible = !confmVisible"
              min-length="6"
            ></v-text-field>
            <!-- Set Password button -->
            <v-btn
              :disabled="!valid"
              id="invite-setup-btn"
              :x-large="$vuetify.breakpoint.md || $vuetify.breakpoint.lg"
              :medium="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
              class="btn-success mx-auto text-capitalize mb-3 white--text align-center d-flex"
              :class="$vuetify.breakpoint.xs ? 'subtitle-1' : 'title'"
              @click="accountSetup()"
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
</template>

<script>
import { WebCam } from "vue-web-cam";
import { find, head } from "lodash";
import { required } from "@/validations/validations.js";
import FormLayout from "../Layouts/FormLayout";

export default {
  name: "SetPasswordDb",
  components: {
    FormLayout,
    WebCam,
    imageCroper: () => import("@/components/includes/Helper/ImageCropper"),
  },
  data() {
    return {
      get: "",
      validate: "",
      loader: false,
      visible: false,
      confmVisible: false,
      valid: true,
      name: null,
      password: null,
      confirmPassword: null,
      required: required,
      email: this.$route.params.email,
      invalidPassword: "",
      startCam: false,
      image_src: "",
      cropped_file_url: "",
      uploadResult: "",
      is_cropped: false,
      picturePath: "",
      base64: "",
      imageUrl: null,
      img: null,
      camera: null,
      deviceId: null,
      devices: [],
      updateTaskError: null,
      snackbar: false,
      snackbarMessage: null,
      confirmPasswordRules: [
        (v) => !!v || "Please confirm your password",
        (v) => v == this.password || "Passwords do not match",
      ],
    };
  },
  watch: {
    camera: function(id) {
      this.deviceId = id;
    },
    devices: function() {
      // Once we have a list select the first one
      let first = head(this.devices);
      if (first) {
        this.camera = first.deviceId;
        this.deviceId = first.deviceId;
      }
    },
  },
  computed: {
    device: function() {
      return find(this.devices, (n) => n.deviceId == this.deviceId);
    },
  },

  methods: {
    //open Choose Image Dialoge
    uploadImageDialog() {
      this.$refs.uploader.click();
    },
    resetValidation() {
      this.$refs.pswd.reset();
    },
    accountSetup() {
      if (
        this.$route.params.email &&
        this.name &&
        this.password == this.confirmPassword
      ) {
        let user = {
          email: this.$route.params.email,
          name: this.name,
          password: this.password,
          password_confirmation: this.confirmPassword,
          token: this.$route.params.token,
          image: this.picturePath,
          base64: this.base64,
        };
        this.loader = true;
        this.$store
          .dispatch("accountSetup", user)
          .then(() => {
            this.loader = false;
          })
          .catch((error) => {
            this.loader = false;
            this.snackbar = true;
            this.updateTaskError = true;
            if (error.response.status == 422) {
              if (error.response.data.error_msg) {
                this.snackbarMessage = error.response.data.error_msg;
              } else if (error.response.data.errors.name) {
                this.snackbarMessage = error.response.data.errors.name[0];
              } else if (error.response.data.errors.email) {
                this.snackbarMessage = error.response.data.errors.email[0];
              } else if (error.response.data.errors.password) {
                this.snackbarMessage = error.response.data.errors.password[0];
              }
            }
          });
      } else {
        // this.validate = "Please select a new password to continue";
      }
    },

    //web cam
    openWebCam() {
      this.startCam = true;
      setTimeout(() => this.$refs.webcam.start(), 20);
    },
    onCapture() {
      this.image_src = this.$refs.webcam.capture();
      this.base64 = this.$refs.webcam.capture();
      this.onStop();
      this.startCam = false;
    },
    onStop() {
      this.$refs.webcam.stop();
    },
    onCameras(cameras) {
      this.devices = cameras;
    },
    onError() {
      try {
        this.onFileChange();
      } catch (error) {
        this.startCam = false;
      }
    },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      let _size = file.size;
      if (_size > 1000000) {
        return;
      }
      var reader = new FileReader();
      var vm = this;
      reader.onload = (e) => {
        vm.image_src = e.target.result;
      };
      this.picturePath = file;
      reader.readAsDataURL(file);
    },
    attach_crop_file(file_url) {
      this.uploadResult = "Please wait...!";
      this.cropped_file_url = file_url;
      this.picturePath = file_url;
      this.is_cropped = true;
      this.uploadResult = true;
    },
    removeImage: function() {
      this.uploadResult = "";
      this.image_src = "";
      this.picturePath = "";
      this.cropped_file_url = "";
      this.is_cropped = false;
      this.base64 = "";
    },
  },
};
</script>
<style scoped>
.uploadImageContainer {
  border: 2px dashed #2a206a;
  background-color: #f8f9fb;
  color: #2a206a;
  text-align: center;
  cursor: pointer;
  width: 150px;
  height: 150px;
  border-radius: 70%;
  margin: auto;

  padding: 10px;
}
.upload-image-text-hover:hover {
  text-decoration-line: underline;
}
.upload-pic-webcam-btn {
  border: 1px #1cc283 solid;
  background-color: #1cc283 !important;
  color: #fff !important;
}
.web-cam-style {
  width: 150px;
  height: 150px;
  border-radius: 100px;

  border: 1px #1cc283 solid;
}
.delete-image-btn {
  margin-top: -40px;
  position: absolute;
  margin-left: 50px;
}
.image-size-text-font {
  font-size: 10px;
}
#invite-setup {
  font-size: 36px;
  color: #2a206a;
}
#forget-btn {
  width: 342px;
  height: 50px;
}
</style>
