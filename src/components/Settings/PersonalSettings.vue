<template>
  <div style="max-height: 600px" class="overflow-y-auto">
    <v-snackbar
      class="mt-5"
      top
      right
      :color="updateProfileError ? 'red lighten-5' : 'green lighten-5'"
      light
      v-model="snackbar"
    >
      <span :class="updateProfileError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="updateProfileError ? 'red' : 'green'"
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
    <v-row class="mx-1 mt-1">
      <v-col cols="12">
        <v-card
          width="200"
          height="230"
          :class="
            $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
              ? 'mt-3 mx-auto'
              : 'float-right mr-16 mt-3 mb-1'
          "
        >
          <v-card-text>
            <div v-if="!startCam">
              <div v-if="!image_src">
                <profileimage
                  class="pointer text-light py-2"
                  inline
                  v-show="getLoggedInUser.image ? ':src' : ':username'"
                  :username="getLoggedInUser.name"
                  :src="getLoggedInUser.image"
                  :size="170"
                  :circular="false"
                ></profileimage>
                <v-layout class="justify-center">
                  <v-tooltip color="#302277" bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        @click="uploadImageDialog"
                        color="#2a206a"
                        class="white--text mt-n1"
                        x-small
                        v-on="on"
                        fab
                      >
                        <v-icon>mdi-upload</v-icon>
                      </v-btn>
                    </template>
                    <span>Upload Image</span>
                  </v-tooltip>
                  <v-tooltip color="#302277" bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="#2a206a"
                        class="white--text ml-1 mt-n1"
                        @click="openWebCam"
                        x-small
                        fab
                        v-on="on"
                      >
                        <v-icon>mdi-camera-plus</v-icon>
                      </v-btn>
                    </template>
                    <span>Capture Image</span>
                  </v-tooltip>
                </v-layout>

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
              <div v-else>
                <div
                  v-if="
                    cropped_file_url &&
                      (uploadResult === 'Please wait...!' ||
                        uploadResult === true ||
                        uploadResult === '')
                  "
                >
                  <img
                    class="ml-n4 mt-n4"
                    :src="cropped_file_url"
                    width="200"
                    height="180"
                    @error="
                      $event.target.src = require('@/assets/images/dummy-user-logo.png')
                    "
                  />
                  <v-layout class="justify-center">
                    <v-tooltip color="#302277" bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          @click="removeImage"
                          depressed
                          fab
                          small
                          v-on="on"
                        >
                          <v-icon color="red" small>mdi-delete </v-icon>
                        </v-btn>
                      </template>
                      <span>Delete Image</span>
                    </v-tooltip>
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
                    :cropHeight="100"
                    :cropWidth="100"
                    :imgSrc="image_src"
                    :imgStyle="{ width: '250px', height: '150px' }"
                    :resizeable="false"
                    @croped_file="attach_crop_file($event)"
                    alt="User Image"
                  />
                  <v-layout class="justify-center">
                    <v-tooltip color="#302277" bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          @click="removeImage"
                          depressed
                          fab
                          class="delete-image-btn"
                          v-on="on"
                          small
                        >
                          <v-icon color="red" small>mdi-delete </v-icon>
                        </v-btn>
                      </template>
                      <span>Delete Image</span>
                    </v-tooltip>
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
              <web-cam
                class="web-cam-style ml-n4"
                :deviceId="deviceId"
                @cameras="onCameras"
                @error="onError"
                ref="webcam"
              />
              <v-layout class="justify-center">
                <v-tooltip color="#302277" bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      @click="onCapture"
                      color="#00ACC1"
                      class="white--text mt-3"
                      v-on="on"
                      x-small
                      fab
                    >
                      <v-icon>mdi-image-size-select-large</v-icon>
                    </v-btn>
                  </template>
                  <span>Capture</span>
                </v-tooltip>
              </v-layout>
            </div>
          </v-card-text>
        </v-card>

        <div
          :class="
            $vuetify.breakpoint.sm || $vuetify.breakpoint.xs ? 'mt-3' : 'mt-5'
          "
        >
          <v-form ref="form" v-model="valid" lazy-validation autocomplete="off">
            <v-col md="6" cols="12">
              <!-- Full Name Input Field -->
              <v-text-field
                color="purple darken-2"
                dense
                outlined
                maxlength="50"
                v-model="getLoggedInUser.name"
                :rules="required"
                label="Full Name"
                prepend-inner-icon="mdi-account"
              ></v-text-field>
              <!-- Email Input Field -->
              <v-text-field
                color="purple darken-2"
                dense
                disabled
                outlined
                v-model="getLoggedInUser.email"
                :rules="emailRules"
                label="Enter Email"
                prepend-inner-icon="mdi-email"
              ></v-text-field>
              <!-- Phone Input Field -->
              <v-text-field
                color="purple darken-2"
                dense
                outlined
                type="number"
                v-model="getLoggedInUser.phone_number"
                label="Phone Number"
                @keypress="isNumber($event)"
                prepend-inner-icon="mdi-phone"
              ></v-text-field>
              <!-- Password Field -->
              <v-text-field
                color="purple darken-2"
                ref="pswd"
                dense
                outlined
                :error-messages="invalidPassword"
                v-model="current_password"
                label="Current Password"
                :append-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                :type="visible ? 'text' : 'password'"
                @click:append="visible = !visible"
                min-length="6"
              ></v-text-field>
              <!-- Confirm Password Field -->
              <v-text-field
                color="purple darken-2"
                ref="pswd"
                dense
                outlined
                :error-messages="invalidPassword"
                v-model="new_password"
                label="New Password"
                :append-icon="visible2 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="visible2 ? 'text' : 'password'"
                @click:append="visible2 = !visible2"
                @keydown.enter="setPassword()"
                min-length="6"
              ></v-text-field>

              <!--Save Button-->
              <v-btn
                :disabled="!valid"
                class="btn-success text-capitalize white--text pa-4 float-right"
                :class="
                  $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
                    ? 'subtitle-1'
                    : 'title'
                "
                @click="saveUpdatedProfileSetting()"
                >Save
                <v-progress-circular
                  v-if="loader"
                  indeterminate
                  class="ml-2"
                  :size="20"
                ></v-progress-circular>
              </v-btn>
            </v-col>
          </v-form>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { WebCam } from "vue-web-cam";
import { find, head } from "lodash";
import { nameRules, emailRules, required } from "@/validations/validations.js";
import profileimage from "@/components/includes/ProfileImage";

export default {
  data() {
    return {
      valid: false,
      number: "",
      nameRules: nameRules,
      emailRules: emailRules,
      required: required,
      counter: (value) => value.length <= 50 || "Max 50 characters",
      userImage: require("@/assets/images/dummy-user-image.jpg"),
      startCam: false,
      camera: null,
      deviceId: null,
      devices: [],
      image_src: "",
      cropped_file_url: "",
      uploadResult: "",
      is_cropped: false,
      picturePath: "",
      base64: "",
      imageUrl: null,
      img: null,
      updateProfileError: null,
      snackbar: false,
      snackbarMessage: null,
      loader: false,
      current_password: null,
      new_password: null,
      invalidPassword: "",
      visible: false,
      visible2: false,
    };
  },
  components: {
    imageCroper: () => import("@/components/includes/Helper/ImageCropper"),
    profileimage,
    WebCam,
  },
  computed: {
    ...mapGetters(["getLoggedInUser"]),
    device: function() {
      return find(this.devices, (n) => n.deviceId == this.deviceId);
    },
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
  methods: {
    //Validation on Phone field
    isNumber(evt) {
      if (evt.key == "e" || evt.key == "." || evt.key == "+") {
        evt.preventDefault();
      }
    },
    saveUpdatedProfileSetting() {
      this.loader = true;
      let data = {
        name: this.getLoggedInUser.name,
        phone_number: this.getLoggedInUser.phone_number,
      };
      this.image_src ? (data.image = this.image_src) : () => {};
      this.current_password
        ? (data.current_password = this.current_password)
        : () => {};
      this.new_password ? (data.new_password = this.new_password) : () => {};
      this.$store
        .dispatch("userProfile", data)
        .then((response) => {
          this.$store.dispatch("fetchTasks");
          this.snackbar = true;
          this.snackbarMessage = response.data.error_msg;
          this.updateProfileError = false;
          this.loader = false;
        })
        .catch((error) => {
          if (error.response.status == 422) {
            this.loader = false;
            this.snackbar = true;
            if (error.response.data.errors.name) {
              this.snackbarMessage = error.response.data.errors.name[0];
              this.updateProfileError = true;
            } else if (error.response.data.errors.phone_number) {
              this.snackbarMessage = error.response.data.errors.phone_number[0];
              this.updateProfileError = true;
            } else if (error.response.data.errors.current_password) {
              this.snackbarMessage =
                error.response.data.errors.current_password[0];
              this.updateProfileError = true;
            } else if (error.response.data.errors.new_password) {
              this.snackbarMessage = error.response.data.errors.new_password[0];
              this.updateProfileError = true;
            }
          }
        });
    },
    uploadImageDialog() {
      this.$refs.uploader.click();
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
        this.snackbar = true;
        this.snackbarMessage = "File size too large";
        this.updateProfileError = true;
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
    //web cam
    openWebCam() {
      this.startCam = true;
      setTimeout(() => this.$refs.webcam.start(), 50);
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
.web-cam-style {
  width: 200px;
  height: 150px;
}
.change-text {
  color: #2a206a;
  font-size: 18px;
  font-weight: 600;
}
.delete-image-btn {
  margin-top: -40px;
  position: absolute;
  margin-left: 50px;
}
::-webkit-scrollbar {
  width: 0px !important;
  display: none !important;
}
</style>
