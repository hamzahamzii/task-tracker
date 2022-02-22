<template>
  <div>
    <!-- error message -->
    <v-alert v-if="attachmentError" dismissible dense class="mx-1" type="error">
      {{ attachmentError }}
    </v-alert>
    <!-- Preview when only One Attachment Selected -->
    <div
      v-if="selectedAttachments.length && selectedAttachments.length == 1"
      class="d-flex justify-center"
    >
      <v-card class="float-left rounded my-1 mx-1" width="185" height="150">
        <!-- preview for images -->
        <v-img
          v-if="
            selectedAttachments[0].type == 'image/png' ||
              selectedAttachments[0].type == 'image/jpg' ||
              selectedAttachments[0].type == 'image/jpeg'
          "
          height="150"
          :src="selectedAttachments[0].file"
        >
          <v-app-bar height="10" flat color="rgba(0, 0, 0, 0)">
            <v-spacer></v-spacer>
            <v-icon
              @click="deleteImage(selectedAttachments[0].id)"
              class="pointer dlt-icon red--text"
              >mdi-delete</v-icon
            >
          </v-app-bar>
        </v-img>

        <span v-else>
          <v-app-bar height="10" flat color="rgba(0, 0, 0, 0)">
            <v-spacer></v-spacer>
            <v-icon
              @click="deleteImage(selectedAttachments[0].id)"
              class="pointer dlt-icon "
              color="red"
              >mdi-delete</v-icon
            >
          </v-app-bar>
          <!-- preview for GIFs -->
          <v-icon
            v-if="selectedAttachments[0].type == 'image/gif'"
            class="my-1 gif-icon"
            color="#6C5CD6"
            x-large
            >mdi-gif</v-icon
          >
          <!-- preview for videos -->
          <v-icon
            v-if="
              selectedAttachments[0].type == 'video/mp4' ||
                selectedAttachments[0].type == 'video/webm'
            "
            class="my-1 video-icon"
            color="#6C5CD6"
            x-large
            >mdi-movie-open-play</v-icon
          >
          <!-- preview for word files/text/docx -->
          <v-icon
            v-if="
              selectedAttachments[0].type == 'application/msword' ||
                selectedAttachments[0].type ==
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            "
            class="my-2 word-file"
            color="#6C5CD6"
            x-large
            >mdi-microsoft-word</v-icon
          >
          <!-- preview for pdfs -->
          <v-icon
            v-if="selectedAttachments[0].type == 'application/pdf'"
            class="my-2 pdf-style"
            color="red"
            x-large
            >mdi-file-pdf</v-icon
          >
          <!-- preview for audio files  -->
          <v-icon
            v-if="selectedAttachments[0].type == 'audio/mp3'"
            class="my-2"
            x-large
            >mdi-microphone</v-icon
          >
        </span>
      </v-card>
    </div>
    <!-- Preview when more than one Attachment Selected -->
    <div
      v-show="selectedAttachments.length && selectedAttachments.length > 1"
      class="fileContainer mx-1 mb-2"
      style="margin-top: 3px; text-align: center; overflow-y: scroll;pointer"
    >
      <div>
        <input
          @change="previewFiles"
          ref="uploader"
          accept=".jpg, .jpeg, .png, .gif, .mp4, .mpeg, .pdf, .docx, .doc, .mov, .mp3"
          id="my_input"
          multiple
          placeholder="Choose multiple files..."
          type="file"
          class="float-right"
        />

        <!-- Display Image Preview -->
        <v-card
          class="float-left rounded my-1 mx-1"
          v-for="(item, i) in selectedAttachments"
          :key="item.id"
          v-show="i <= 2"
          width="62"
          height="70"
        >
          <!-- preview for images -->
          <v-img
            v-if="
              item.type == 'image/png' ||
                item.type == 'image/jpg' ||
                item.type == 'image/jpeg'
            "
            height="70"
            :src="item.file"
          >
            <v-app-bar height="10" flat color="rgba(0, 0, 0, 0)">
              <v-spacer></v-spacer>
              <v-icon
                @click="deleteImage(item.id)"
                class="pointer ml-8 mt-1 red--text"
                small
                >mdi-delete</v-icon
              >
            </v-app-bar>
          </v-img>

          <span v-else>
            <v-app-bar height="10" flat color="rgba(0, 0, 0, 0)">
              <v-spacer></v-spacer>
              <v-icon
                @click="deleteImage(item.id)"
                class="pointer ml-8 mt-1"
                color="red"
                small
                >mdi-delete</v-icon
              >
            </v-app-bar>
            <!-- preview for GIFs -->
            <v-icon
              class="my-1"
              v-if="item.type == 'image/gif'"
              color="#6C5CD6"
              x-large
              >mdi-gif</v-icon
            >
            <!-- preview for videos -->
            <v-icon
              class="my-1"
              color="#6C5CD6"
              x-large
              v-if="item.type == 'video/mp4' || item.type == 'video/webm'"
              >mdi-movie-open-play</v-icon
            >
            <!-- preview for pdfs -->
            <v-icon
              v-if="item.type == 'application/pdf'"
              class="my-2"
              color="red"
              x-large
              >mdi-file-pdf</v-icon
            >
            <!-- preview for word files/ text/docx  -->
            <v-icon
              v-if="
                item.type == 'application/msword' ||
                  item.type ==
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              "
              class="my-2"
              color="#6C5CD6"
              x-large
              >mdi-microsoft-word</v-icon
            >
            <!-- preview for audio files  -->

            <v-icon class="my-2" x-large v-if="item.type == 'audio/mp3'"
              >mdi-microphone</v-icon
            >
          </span>
        </v-card>
        <!-- Preview when more than three Attachment Selected -->
        <div
          v-if="selectedAttachments.length > 3"
          style="padding-top:25px;"
          class="d-flex"
        >
          <span class="white--text caption">
            (+{{ selectedAttachments.length - 3 }} others)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { eventBus } from "@/main";
export default {
  props: ["showFileContainer", "selectedAttachments"],

  data() {
    return {
      noComments: null,
      AttchHidden: null,
      attachmentError: "",
      attachments: [],
      showChooseModal: false,
    };
  },
  created() {
    if (this.showContainer == true) {
      this.showAttachemntsContainer();
    }
  },
  methods: {
    containerclick() {
      let element = document.getElementById("my_input");
      element.click();
    },
    showAttachemntsContainer() {
      this.noComments = false;
      this.AttchHidden = true;
    },
    previewFiles(event) {
      this.attachmentError = "";
      this.numFiles = 0;
      this.filesSize = 0;
      let types = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/mpeg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/doc",
        "text/docx",
        "audio/mp3",
        "video/webm",
      ];
      // if file size exceeds max limit
      if (event.target.files.length > 5) {
        if (!this.selectedAttachments.length) {
          eventBus.$emit("showSelectedAttachmentsError");
        }
        this.attachmentError = "You cannot select more than 5 files at a time";
        setTimeout(() => {
          this.attachmentError = "";
        }, 2000);
        return;
      }
      // else
      for (let i = 0; i < event.target.files.length; i++) {
        if (types.includes(event.target.files[i].type)) {
          this.filesSize += event.target.files[i].size;
          if (this.filesSize > 50000000) {
            this.attachmentError = "Size exceeded.";
            return;
          }
          this.getBase64(event.target.files[i]).then((data) => {
            this.attachmentError = "";
            this.numFiles = event.target.files.length;
            var body = {
              id: Math.random()
                .toString(36)
                .substr(2, 5),
              name: event.target.files[i].name,
              type: event.target.files[i].type,
              file: data,
            };

            eventBus.$emit("addSelectedAttachments", body);
          });
        } else {
          this.attachmentError = "File is not supported.";
        }
      }
      setTimeout(() => {
        this.attachmentError = "";
      }, 2000);
    },

    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },
    deleteImage(id) {
      eventBus.$emit("deleteSelectedAttachment", id);
    },
    triggerInputClick() {
      let my_input = document.getElementById("my_input");
      my_input.click();
    },
  },

  mounted() {
    eventBus.$on("openChooseFileModal", () => {
      let my_input = document.getElementById("my_input");
      my_input.click();
    });
    eventBus.$on("showAttachmentError", () => {
      this.attachmentError = "File is not supported.";
      setTimeout(() => {
        this.attachmentError = "";
      }, 2000);
    });
    eventBus.$on("showAttachmentSelectionError", () => {
      this.attachmentError = "You cannot select more than 5 files at a time";
      setTimeout(() => {
        this.attachmentError = "";
      }, 2000);
    });
  },
  beforeDestroy() {
    eventBus.$off("showAttachmentError");
    eventBus.$off("showAttachmentSelectionError");
    eventBus.$off("openChooseFileModal");
  },
};
</script>

<style scoped>
/* file uplaod attachment */
.fileContainer {
  overflow: hidden;
  position: relative;
  font-size: 12px;
  height: 90px;
  /* border: dashed 1px #2a206a; */
  border-radius: 3px;
  background-color: rgb(255, 246, 246) !important;
  background-color: rgba(56, 56, 56, 0.8) !important;
  -webkit-backdrop-filter: transparent(4px);
  backdrop-filter: transparent(4px);
  /* background-color: #f8f9fb; */
  /* color: #2a206a; */
  padding-top: 6px;
}
.fileContainer [type="file"] {
  display: block;
  font-size: 999px;
  filter: alpha(opacity=0);
  min-height: 100%;
  min-width: 100%;
  opacity: 0;
  position: absolute;
  right: 0;
  text-align: right;
  top: 0;
  cursor: pointer;
}
.pdf-style.mdi-file-pdf::before {
  margin-top: 35px;
}
.word-file.mdi-microsoft-word::before {
  margin-top: 35px;
}
.dlt-icon.mdi-delete::before {
  margin-top: 13px;
  margin-right: -17px;
  background-color: transparent !important;
}
.video-icon.mdi-movie-open-play::before {
  margin-top: 35px;
}
.gif-icon.mdi-gif::before {
  margin-top: 35px;
}
</style>
