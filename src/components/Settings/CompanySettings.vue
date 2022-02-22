<template>
  <div style="max-height: 590px" class="overflow-y-auto">
    <v-snackbar
      class="mt-5"
      top
      right
      light
      :color="updateProfileError ? 'red lighten-5' : 'green lighten-5'"
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
    <!-- Company Name, website & Image Row -->
    <v-row class="mx-1 mt-1">
      <!-- Company Profile Image/Avatar -->
      <v-col cols="12">
        <v-card
          width="200"
          height="230"
          :class="
            $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
              ? 'mt-3 mx-auto'
              : 'float-right mx-4 mt-3 mb-1'
          "
        >
          <v-card-text>
            <!-- company profile image -->
            <div v-if="!image_src">
              <profileimage
                class="pointer text-light py-2"
                inline
                v-show="companyInfo.logo ? ':src' : ':username'"
                :username="
                  companyInfo.name ? companyInfo.name : getLoggedInUser.name
                "
                :src="companyInfo.logo"
                :size="170"
                :circular="false"
              ></profileimage>

              <v-layout class="justify-center">
                <v-btn
                  @click="uploadImageDialog"
                  color="#2a206a"
                  class="white--text mt-n1"
                  x-small
                  fab
                >
                  <v-icon>mdi-upload</v-icon>
                </v-btn>
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
                <v-layout class="justify-center">
                  <img
                    class="mt-n4"
                    :src="cropped_file_url"
                    width="200"
                    height="180"
                    @error="
                      $event.target.src = require('@/assets/images/dummy-user-logo.png')
                    "
                  />
                </v-layout>
                <v-layout class="justify-center mt-1">
                  <v-btn @click="removeImage" depressed fab small>
                    <v-icon color="red" small>mdi-delete</v-icon>
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
                  :cropHeight="100"
                  :cropWidth="100"
                  :imgSrc="image_src"
                  :imgStyle="{ width: '250px', height: '150px' }"
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
                    <v-icon color="red" small>mdi-delete</v-icon>
                  </v-btn>
                </v-layout>
              </div>
            </div>
          </v-card-text>
        </v-card>
        <div
          :class="
            $vuetify.breakpoint.sm || $vuetify.breakpoint.xs ? 'mt-3' : 'mt-10'
          "
        >
          <!-- Company Settings Form -->
          <v-row>
            <v-col md="6" :cols="12">
              <!-- Company Name Input Field -->
              <v-text-field
                color="purple darken-2"
                dense
                outlined
                v-model="companyInfo.name"
                maxlength="50"
                type="text"
                label="Company Name"
                prepend-inner-icon="mdi-domain"
              ></v-text-field>
              <!-- Company size Input Field -->
              <v-text-field
                color="purple darken-2"
                dense
                outlined
                v-model="companyInfo.team_size"
                label="Company Size"
                prepend-inner-icon="mdi-account"
              ></v-text-field>
              <!-- Website -->
              <v-text-field
                color="purple darken-2"
                dense
                outlined
                v-model="companyInfo.website"
                label="Website"
                prepend-inner-icon="mdi-web"
              ></v-text-field>
              <!-- Industry Field -->
              <v-autocomplete
                v-if="industries"
                color="purple darken-2"
                dense
                :items="industries"
                v-model="companyInfo.industry"
                outlined
                flat
                solo
                label="Industry"
                auto-select-first
              >
                <template v-slot:selection="{ item }">
                  <div class="mx-2">{{ item }}</div>
                </template>
              </v-autocomplete>
              <!-- Alert message for success-->
              <v-alert dense text type="success" v-show="success">{{
                success
              }}</v-alert>
            </v-col>
            <v-col>
              <!-- Currency Field -->
              <v-autocomplete
                v-if="getCurrencies"
                color="purple darken-2"
                dense
                :items="getCurrencies"
                v-model="companyInfo.currency_id"
                outlined
                flat
                solo
                item-value="item"
                item-text="name"
                label="Currency"
                auto-select-first
                :prepend-inner-icon="!currency ? 'mdi-currency-usd' : ''"
              >
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <div>{{ item.name }}</div>
                    <div class="ml-3">( {{ item.sign }} )</div>
                  </div>
                </template>
              </v-autocomplete>
              <!-- Time Zone Field -->
              <v-autocomplete
                v-if="timezones"
                color="purple darken-2"
                dense
                :items="timezones"
                v-model="companyInfo.timezone"
                outlined
                flat
                solo
                label="Time Zone"
                auto-select-first
              >
                <template v-slot:selection="{ item }">
                  <div class="mx-2">
                    {{ item }}
                  </div>
                </template>
              </v-autocomplete>
              <!-- Country Field -->
              <v-autocomplete
                v-if="getCountries"
                color="purple darken-2"
                dense
                :items="getCountries"
                v-model="companyInfo.country_id"
                outlined
                flat
                solo
                item-value="item"
                item-text="name"
                label="Country"
                auto-select-first
              >
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <div>{{ item.flag }}</div>
                    <div class="mx-2">{{ item.name }}</div>
                  </div>
                </template>
              </v-autocomplete>
              <!--Save Button-->
              <v-btn
                @click="updateCompany()"
                class="btn-success text-capitalize white--text pa-4 float-right"
                :class="
                  $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
                    ? 'subtitle-1'
                    : 'title'
                "
                >Save
                <v-progress-circular
                  v-if="loader"
                  indeterminate
                  class="ml-2"
                  :size="20"
                ></v-progress-circular>
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div
          class="deactivate-acc my-2 ml-7 "
          :style="
            $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
              ? 'width:90%;'
              : 'width:50%;'
          "
        >
          <div class="d-flex pa-3">
            <v-icon color="#2a206a">mdi-alert-circle-outline</v-icon>
            <h5 class="subtitle-1 name-color ml-1 font-weight-bold">
              Delete your account
            </h5>
          </div>

          <p class="subtitle-2 ml-5 mr-5 delete-message-style">
            If you delete your company, all of your personal information saved
            on our servers including projects, tasks and attachments will be
            deleted.
            <a
              @click="deleteCompany(getSelectedCompany)"
              class="text-decoration-underline delete-link-style"
              >Delete Account</a
            >
          </p>
        </div>
        <!-- <div class="deactivate-acc">
          <h5>Delete Your Account</h5>
          <p class="p-text caption">
            If you delete your company, all of your personal information saved
            on our servers including projects, tasks and attachments will be
            deleted.
            <br />
            <a @click="confrmDialog = true" class="text-decoration-underline"
              >Delete Your Account</a
            >
          </p>
        </div> -->
      </v-col>
    </v-row>
    <!-- delete company confirmation modal -->
    <!-- <v-dialog v-model="confrmDialog" max-width="290">
      <v-card>
        <v-card-title class="title cyan darken-3 white--text"
          >Are You Sure?</v-card-title
        >
        <v-card-text class="mt-2"
          >This action will result in permanent deletion of all the projects,
          tasks and attachments in this company</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="no-btn text-capitalize body-2 cyan--text"
            text
            @click="confrmDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            class="confirm-button text-capitalize body-2 red--text"
            text
            @click="deleteCompany(getSelectedCompany), (confrmDialog = false)"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog> -->
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
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { required } from "@/validations/validations.js";
import profileimage from "@/components/includes/ProfileImage";
import { timezones, industries } from "@/constants/timezone.js";
import Swal from "sweetalert2";
export default {
  data() {
    return {
      companyInfo: {},
      company: null,
      country: null,
      currency: null,
      website: null,
      image_src: null,
      confrmDialog: false,
      required: required,
      timezones: timezones,
      industries: industries,
      cropped_file_url: "",
      uploadResult: "",
      is_cropped: false,
      picturePath: "",
      base64: "",
      imageUrl: null,
      img: null,
      loader: false,
      updateProfileError: null,
      snackbar: false,
      snackbarMessage: null,
      success: null,
    };
  },
  components: {
    imageCroper: () => import("@/components/includes/Helper/ImageCropper"),
    profileimage,
  },
  mounted() {
    if (this.getSelectedCompany) {
      this.fetchInfo();
    }
  },
  watch: {
    getSelectedCompany(value) {
      this.companyInfo.company_id = value.id;
      this.companyInfo.currency_id = value.currency_id;
      this.companyInfo.country_id = value.country_id;
      this.companyInfo.timezone = value.timezone;
      this.companyInfo.trial_days = value.trial_days;
      this.companyInfo.website = value.website;
      this.companyInfo.team_size = value.team_size;
      this.companyInfo.name = value.name;
      this.companyInfo.logo = value.logo;
      this.companyInfo.industry = value.industry;
    },
  },
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getLoggedInUser",
      "getCountries",
      "getCurrencies",
    ]),
    companyImage: {
      get: function() {
        return this.getSelectedCompany.logo;
      },
      set: function(logo) {
        return logo;
      },
    },
  },
  methods: {
    fetchInfo() {
      this.companyInfo.company_id = this.getSelectedCompany.id;
      this.companyInfo.currency_id = this.getSelectedCompany.currency_id;
      this.companyInfo.country_id = this.getSelectedCompany.country_id;
      this.companyInfo.timezone = this.getSelectedCompany.timezone;
      this.companyInfo.trial_days = this.getSelectedCompany.trial_days;
      this.companyInfo.website = this.getSelectedCompany.website;
      this.companyInfo.team_size = this.getSelectedCompany.team_size;
      this.companyInfo.name = this.getSelectedCompany.name;
      this.companyInfo.logo = this.getSelectedCompany.logo;
      this.companyInfo.industry = this.getSelectedCompany.industry;
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
    deactivateUser() {
      this.confrmDialog = true;
    },

    deleteCompany(company) {
      Swal.fire({
        title: "Are you sure?",
        html: "Delete this company",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Delete",
        reverseButtons: true,
      }).then((result) => {
        if (result.value) {
          if (company.role == "owner") {
            this.success =
              "A verification link has been sent to your account. Please confirm the deletion of your company";
            setTimeout(() => {
              this.success = "";
            }, 5000);
            let companyDel = {
              company_id: company.id,
              archived: true,
            };
            this.$store
              .dispatch("deleteCompany", companyDel)
              .then(() => {})
              .catch((error) => {
                console.log("error", error);
              });
          }
        }
      });
    },
    // deleteCompany(company) {
    //   if (company.role == "owner") {
    //     let companyDel = {
    //       company_id: company.id,
    //       archived: true,
    //     };
    //     this.$store
    //       .dispatch("deleteCompany", companyDel)
    //       .then(() => {
    //         this.$router.push({ name: "login" });
    //         this.$store.dispatch("logout");
    //         localStorage.removeItem("user");
    //       })
    //       .catch((error) => {
    //         console.log("error", error);
    //       });
    //   }
    // },
    updateCompany() {
      this.loader = true;
      this.loader = true;
      let payload = {};
      for (let key in this.companyInfo) {
        if (this.companyInfo[key] != this.getSelectedCompany[key]) {
          payload[key] = this.companyInfo[key];
        }
      }
      this.image_src ? (payload.logo = this.image_src) : () => {};
      this.$store
        .dispatch("updateCompany", payload)
        .then((response) => {
          this.snackbar = true;
          this.snackbarMessage = response.error_msg;
          this.updateProfileError = false;
          this.loader = false;
        })
        .catch((error) => {
          this.loader = false;
          this.snackbar = true;
          this.updateProfileError = true;
          if (error.response.status == 422) {
            this.fetchInfo();
            if (error.response.data.errors.name) {
              this.snackbarMessage = error.response.data.errors.name[0];
            } else if (error.response.data.errors.company_name) {
              this.snackbarMessage = error.response.data.errors.company_name[0];
            } else if (error.response.data.errors.team_size) {
              this.snackbarMessage = error.response.data.errors.team_size[0];
            } else if (error.response.data.errors.website) {
              this.snackbarMessage = error.response.data.errors.website[0];
            }
          }
        });
    },
  },
};
</script>

<style scoped>
.delete-image-btn {
  margin-top: -40px;
  position: absolute;
  margin-left: 50px;
}
::-webkit-scrollbar {
  width: 0px !important;
  display: none !important;
}
.additional-info-text {
  color: #2a206a;
  font-weight: bolder;
  font-size: larger;
}
.deactivate-acc {
  border: 1px #edebf9 solid;
}
.delete-message-style {
  color: #757096;
}
.delete-link-style {
  color: #1cc283;
}
</style>
