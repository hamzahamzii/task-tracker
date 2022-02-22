<template>
  <div class="text-center">
    <v-dialog persistent v-model="dialog" width="500">
      <v-card>
        <v-card-title
          style="border-bottom: 1px solid #dad6f5"
          class="px-1 dialog-title-border"
        >
          <div class="d-flex justify-center" style="width: 100%">
            <v-icon class="d-flex ui-theme-color mr-2"
              >mdi-shield-account-variant-outline</v-icon
            >
            <b class="ui-theme-color modals-title-size"> Permissions </b>
          </div>
        </v-card-title>
        <v-card-text class="mt-1 py-0">
          <p class="text-justify">
            Allow <b class="ui-theme-color">GIGS TIMER</b>  to access ' <v-icon color="#2a206a" x-small> mdi-microphone-settings </v-icon> microphone' & '<v-icon color="#2a206a" x-small> mdi-camera </v-icon> camera' to send instructions for the tasks in the comments in form of audio and screen recording.
            In case if you block GIGS TIMER from these permissions you would have to remove and again add the extension to chrome to allow and use these features
            <!-- Please allow <b class="ui-theme-color">GIGS TIMER</b> to access
            '<v-icon color="#2a206a" x-small> mdi-microphone-settings </v-icon>
            microphone' & '<v-icon color="#2a206a" x-small> mdi-camera </v-icon>
            camera' to use screen/voice recording feature under comment
            section. -->
            <br />
            <!-- <span class="success-text">
              <b>In case you wouldn't be able to use that in future.</b>
            </span> -->
          </p>
        </v-card-text>
        <v-img :src="imgSource"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="allow()"
            small
            color="btn-success darken-1"
            class="white--text"
            >Ok</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "Extension",
  data() {
    return {
      dialog: true,
      imgSource: require("@/assets/images/extension-per.png"),
    };
  },
  methods: {
    allow() {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
        })
        .then((res) => {
          console.log(res);
          parent.window.close();
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
<style scoped>
.text-bg {
  color: #00838f !important;
}
.btn-allow {
  background-color: #00838f !important;
}

/* css class for the transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.popup-modal {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  z-index: 1;
}

.window {
  background: #fff;
  border-radius: 5px;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;
}
</style>
