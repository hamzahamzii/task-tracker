Audio Recorder
<template>
  <div
    class="white"
    :style="$mq == 'extraSmallPhones' ? 'margin-left: 12px' : ''"
  >
    <v-card v-if="this.RecoderConatiner" elevation="0" width="200px">
      <div v-if="audio_record.length <= 0">
        <div v-show="start" class="pt-3 px-3 mx-1 rounded">
          <v-icon color="#D50000">mdi-microphone-outline</v-icon>
          <audio-recorder
            :class="
              $mq == 'extraSmallPhones'
                ? 'mx-8'
                : $mq == 'phone'
                ? 'mx-1'
                : 'mx-8'
            "
            style="width: 30px !important"
            :after-recording="callThis"
            :attempts="1"
            :before-recording="onStart"
            :headers="headers"
            :pause-recording="record_pause"
          />
        </div>
      </div>
      <div
        class="audio-review pa-0 mx-1 d-flex justify-center mx-1"
        v-else
        style="height: 50px"
      >
        <div
          class="d-flex justify-start pa-0 ma-0 rounded align-center"
          style="width: inherit !important"
        >
          <audio-player :src="audio_record[0].file"></audio-player>
          <v-icon
            @click="deleteAudio"
            color="red"
            class="float-right pointer"
            :class="$mq == 'extraSmallPhones' || $mq == 'phone' ? '' : 'ml-16'"
          >
            mdi-delete
          </v-icon>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script>
import Vue from "vue";
import AudioRecorder from "vue-audio-recorder";
Vue.use(AudioRecorder);
export default {
  data() {
    return {
      RecoderConatiner: false,
      audio_record: [],
      headers: {},
      start: true,
    };
  },
  props: ["showAudio"],
  created() {
    if (this.showAudio == true) {
      this.showAudioContainer();
    }
  },
  computed: {
    isExtension() {
      return innerHeight == "600" && innerWidth == "450";
    },
  },
  methods: {
    showAudioContainer() {
      this.RecoderConatiner = true;
      setTimeout(() => {
        document.querySelector(".ar-icon").click();
      }, 100);
    },

    onStart() {
      document.getElementsByClassName(
        "ar-recorder__duration"
      )[0].style.visibility = "visible";
    },

    callThis(data) {
      let reader = new FileReader();
      reader.readAsDataURL(data.blob);
      reader.onloadend = () => {
        var base64data = reader.result;
        this.audio_record.push({ file: base64data });
        // passing the recorded audio to parent component
        this.$emit("audioRecording", this.audio_record);
      };
    },

    record_pause() {
      document.getElementsByClassName("ar-recorder__stop")[0].click();
    },

    deleteAudio() {
      this.start = false;
      this.audio_record = [];
      this.audioError = "";
      this.$emit("audioRecording", this.audio_record);
    },
  },
};
</script>

<style>
div.ar-records {
  height: 0px !important;
}
div.ar-content {
  padding: 0px !important;
}
.ar-icon {
  padding: 3px !important;
}

.record {
  color: #2a206a;
  font-size: 14px;
  text-align: center;
  background-color: transparent !important;
}
.ar-player > .ar-player-bar {
  border: none !important;
}

/* important */
.ar {
  box-shadow: none !important;
  background-color: transparent !important;
}

/* Duration while recording */
.ar-recorder__duration {
  margin-top: -3.5rem !important;
  font-size: 16px !important;
  color: #2a206a !important;
}

/* pause icon ui (in use) */
.ar-icon__lg {
  height: 24px !important;
  width: 24px !important;
  background-color: transparent !important;
  fill: #2a206a !important;
  box-shadow: none !important;
}

/* play btn ui (in use) */
.ar-player__play {
  margin-bottom: 8px;
  height: 32px !important;
  width: 32px !important;
  background-color: transparent !important;
  fill: #2a206a !important;
  border: 0px solid #fff !important;
}
.ar-player__play--active {
  fill: white !important;
  background-color: blue !important;
}

/* total recording length */
.ar-player__time {
  color: #2a206a !important;
}
/* green progress bar when audio is playing */
.ar-line-control__head {
  background-color: #1cc283 !important;
}
div.ar-player {
  width: auto;
}
/* audio player line */
.ar-player > .ar-player-bar > .ar-player__progress {
  width: 88px !important;
  height: 1px !important;
}
.ar-recorder__records-limit,
.ar-volume-bar,
.ar-volume__icon,
.ar-recorder__records-limit,
.ar-recorder__stop,
.ar-content .ar-player {
  display: none;
}
/* audio div */
.audio-review {
  width: 100%;
}
@media only screen and (min-width: 768px) {
  .ar-icon--rec {
    position: relative;
    bottom: 1.8rem;
    left: 17rem;
    background-color: transparent !important;
  }
}
@media (max-width: 700px) and (min-width: 400px) {
  .ar-icon--rec {
    position: relative;
    bottom: 1.8rem;
    left: 14.5rem;
  }
}
@media (max-width: 399px) and (min-width: 351px) {
  .ar-icon--rec {
    position: relative;
    bottom: 1.8rem;
    left: 11rem;
  }
}
@media (max-width: 350px) and (min-width: 300px) {
  .ar-icon--rec {
    position: relative;
    bottom: 1.8rem;
    left: 7.5rem;
  }
}
</style>
