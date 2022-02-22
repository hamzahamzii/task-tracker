const state = {
  recorder: null,
  screenRecordingBlob: null,
  stream: null,
  voiceStream: null,
  screenStream: null,
  running: false,
  taskToSendRecording: null,
  screenRecordingPermissions: {
    mic: false,
    audio: false,
    video: false,
  },
  recordingAvailable: false,
};
// Merges video and audio streams
const mergeAudioStreams = (state) => {
  const context = new AudioContext();
  const destination = context.createMediaStreamDestination();
  let hasDesktop = false;
  let hasVoice = false;
  if (state.screenStream && state.screenStream.getAudioTracks().length > 0) {
    // If you don't want to share Audio from the desktop it should still work with just the voice.
    const source1 = context.createMediaStreamSource(state.screenStream);
    const desktopGain = context.createGain();
    desktopGain.gain.value = 0.7;
    source1.connect(desktopGain).connect(destination);
    hasDesktop = true;
  }

  if (state.voiceStream) {
    if (state.voiceStream.getAudioTracks().length > 0) {
      const source2 = context.createMediaStreamSource(state.voiceStream);
      const voiceGain = context.createGain();
      voiceGain.gain.value = 0.7;
      source2.connect(voiceGain).connect(destination);
      hasVoice = true;
    }
  }

  return hasDesktop || hasVoice ? destination.stream.getAudioTracks() : [];
};
const mutations = {
  //   Initialize screen recording streams and variables
  initRec(state, payload) {
    state.taskToSendRecording = payload;
    const tracks = [
      ...state.screenStream.getVideoTracks(),
      ...mergeAudioStreams(state),
    ];
    state.stream = new MediaStream(tracks);
    window.streamReference = state.stream;
    state.screenRecordingBlob = [];
    state.recorder = new MediaRecorder(state.stream, {
      mimeType: "video/webm; codecs=vp8,opus",
    });
    state.screenStream.getTracks().forEach((track) =>
      track.addEventListener("ended", () => {
        if (state.voiceStream)
          state.voiceStream.getAudioTracks().forEach((audio) => audio.stop());
        if (state.recorder) {
          state.recorder.stop();
          state.running = false;
        }
        state.recorder = null;
      })
    );
    state.recorder.ondataavailable = (e) =>
      state.screenRecordingBlob.push(e.data);

    state.recorder.onstop = async () => {
      state.running = false;
      if (state.voiceStream) {
        state.voiceStream.getTracks().forEach((track) => track.stop());
      }
      state.screenStream.getTracks().forEach((s) => s.stop());
      let reader = new FileReader();
      reader.readAsBinaryString(state.screenRecordingBlob[0]);

      reader.onloadend = () => {
        var base64data = btoa(reader.result);
        state.recordingAvailable = {
          file: "data:video/webm;base64," + base64data,
        };
      };
    };
  },

  // Starts recording
  startRec(state) {
    state.recorder.start();
    state.running = true;
    state.recordingAvailable = false;
  },

  // Stops recording
  stopRec(state) {
    state.recorder.stop();
    state.running = false;
  },

  setRecordingAvailable(state, payload) {
    state.recordingAvailable = payload;
  },

  resetScreenRecorder(state) {
    state.recorder = null;
    state.screenRecordingBlob = null;
    state.stream = null;
    state.voiceStream = null;
    state.screenStream = null;
    state.running = false;
    state.taskToSendRecording = null;
    state.screenRecordingPermissions = {
      mic: false,
      audio: false,
      video: false,
    };
    state.recordingAvailable = false;
  },
};
const getters = {
  getScreenRecorder: (state) => state.recorder,
  getScreenRecorderState: (state) => state.running,
  getTaskToSendRecording: (state) => state.taskToSendRecording,
  getRecordingAvailable: (state) => state.recordingAvailable,
  getScreenRecordingBlob: (state) => state.screenRecordingBlob[0],
};
const actions = {
  // Asks for permissions for screen recording
  allowRec({ state }, payload) {
    return new Promise((resolve, reject) => {
      // Get permission config from payload
      state.screenRecordingPermissions.audio = payload.audio || false;
      state.screenRecordingPermissions.mic = payload.mic || true;
      // ask for permissions
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: false,
        })
        .then((res) => {
          state.screenStream = res;
          if (payload.mic) {
            navigator.mediaDevices
              .getUserMedia({
                video: false,
                audio: payload.mic,
              })
              .then((res) => {
                state.voiceStream = res;
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            resolve(res);
          }
        });
    });
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
