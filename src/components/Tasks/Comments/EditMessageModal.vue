<template>
  <div>
    <v-dialog v-model="editMessageDialog" width="400">
      <v-card tile class="white">
        <!-- Title bar -->
        <v-card-title
          class="py-3 px-4 text-truncate dialog-title-border ui-theme-color"
        >
          <div class="d-flex justify-center" style="width: 90%">
            <span>
              <b class="modals-title-size">
                Edit Comment
              </b>
            </span>
          </div>

          <v-spacer></v-spacer>
          <v-icon small color="#757096" @click="closeDialog">mdi-close</v-icon>
        </v-card-title>
        <v-snackbar
          class="mt-5"
          top
          right
          :color="editCommentError ? 'red lighten-5' : 'green lighten-5'"
          light
          v-model="snackbar"
        >
          <span :class="editCommentError ? 'red--text' : 'green--text'">
            {{ snackbarMessage }}</span
          >
          <template v-slot:action="{ attrs }">
            <v-btn
              :color="editCommentError ? 'red' : 'green'"
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
        <v-card-text>
          <div class="d-flex mx-2 pt-6 align-center">
            <div
              style="width: 85vw"
              class="d-flex flex-column float-left mx-1 bottom-bar px-1"
              id="bottom-bar"
            >
              <!-- Text Field -->
              <div class="mt-1">
                <div class="editor" style="width:290px;">
                  <editor-content
                    id="editor"
                    class="editor__content ml-4"
                    :editor="editor"
                  />
                </div>
              </div>

              <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
                <div class="menubar">
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        class="menubar__button"
                        :class="{ 'is-active': isActive.bold() }"
                        @click="commands.bold"
                      >
                        <v-icon size="18px" color="rgb(96,96,96)" medium
                          >mdi-format-bold</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Bold</span>
                  </v-tooltip>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        class="menubar__button"
                        :class="{ 'is-active': isActive.italic() }"
                        @click="commands.italic"
                      >
                        <v-icon size="18px" color="rgb(96,96,96)" medium
                          >mdi-format-italic</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Italic</span>
                  </v-tooltip>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        class="menubar__button"
                        :class="{ 'is-active': isActive.underline() }"
                        @click="commands.underline"
                      >
                        <v-icon size="18px" color="rgb(96,96,96)" medium
                          >mdi-format-underline</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Under Line</span>
                  </v-tooltip>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        class="menubar__button"
                        :class="{ 'is-active': isActive.bullet_list() }"
                        @click="commands.bullet_list"
                      >
                        <v-icon size="18px" color="rgb(96,96,96)" medium
                          >mdi-format-list-bulleted</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Unorder List</span>
                  </v-tooltip>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        class="menubar__button"
                        :class="{ 'is-active': isActive.ordered_list() }"
                        @click="commands.ordered_list"
                      >
                        <v-icon size="18px" color="rgb(96,96,96)"
                          >mdi-format-list-numbered</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Order List</span>
                  </v-tooltip>
                </div>
              </editor-menu-bar>
            </div>
          </div>
        </v-card-text>
        <!-- save button -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="reset-btn text-capitalize"
            color="darken-1"
            tile
            text
            @click="closeDialog"
            >Close
          </v-btn>
          <v-btn
            class="text-capitalize white--text"
            text
            tile
            :disabled="disableSendBtn || loader"
            :class="disableSendBtn || loader ? 'disabled-send' : 'enabled-send'"
            @click="editComment()"
            >Save
            <v-progress-circular
              v-if="loader"
              indeterminate
              class="ml-2"
              :size="20"
            ></v-progress-circular>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import { mapGetters } from "vuex";
import authAxios from "@/services/api.service.js";
import SendMessage from "@/TipTapExtension/sendMessage";
import CustomLink from "@/TipTapExtension/customLink";
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  ListItem,
  BulletList,
  Bold,
  Italic,
  Underline,
  History,
  Placeholder,
} from "tiptap-extensions";
export default {
  data() {
    return {
      editMessageDialog: true,
      disableSendBtn: false,
      loader: false,
      snackbar: false,
      snackbarMessage: null,
      editCommentError: null,
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new CustomLink(),
          new Bold(),
          new Italic(),
          new Underline(),
          new History(),
          new Placeholder({
            emptyEditorClass: "is-editor-empty",
            emptyNodeClass: "is-empty",
            emptyNodeText: "Write a Comment Here.... ",
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
          }),

          new SendMessage({
            /*
            For sending message typed in input
            */

            sendMessage: () => this.checkEditorText(this.editor.getHTML()),
          }),
        ],
        onUpdate: ({ getJSON }) => {
          if (!("content" in getJSON().content[0])) {
            this.disableSendBtn = true;
          } else {
            this.disableSendBtn = false;
          }
        },

        autoFocus: true,
      }),
    };
  },
  props: ["openEditMsgDialog", "messageDetails", "taskDetail", "allComments"],
  computed: {
    ...mapGetters(["getSelectedCompany"]),
  },
  components: {
    EditorContent,
    EditorMenuBar,
  },
  watch: {
    editMessageDialog(value) {
      !value ? this.$emit("update:openEditMsgDialog", false) : () => {};
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:openEditMsgDialog", false);
      this.editor.clearContent();
    },

    editComment() {
      this.loader = true;
      var editCommentData = {
        comment_id: this.messageDetails.id,
        text: this.editor.getHTML(),
        task_id: this.taskDetail.task_id,
        company_id: this.getSelectedCompany.id,
        project_id: this.taskDetail.project ? this.taskDetail.project.id : null,
      };
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "update-comment",
            JSON.parse(localStorage.getItem("token")),
            editCommentData
          )
          .then((response) => {
            var id = this.allComments.findIndex((item) => {
              return item.id == editCommentData.comment_id;
            });
            Object.assign(this.allComments[id], editCommentData);
            this.loader = false;
            this.closeDialog();
            resolve(response);
          })
          .catch((err) => {
            this.loader = false;
            this.snackbar = true;
            this.snackbarMessage = err.response.data.errors.text[0];
            this.editCommentError = true;
            this.$store.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    //Check Have Text/Attachment then Send Message
    checkEditorText(messageHtml) {
      var dummyElement = document.createElement("div");
      dummyElement.innerHTML = messageHtml;
      if (dummyElement.innerText.trim() != "") {
        this.editComment();
      } else {
        return;
      }
    },
  },
  mounted() {
    this.editor.setContent(this.messageDetails.text);
    var dummyElement = document.createElement("div");
    dummyElement.innerHTML = this.messageDetails.text;
    if (dummyElement.innerText.trim() != "") {
      this.disableSendBtn = false;
    } else {
      this.disableSendBtn = true;
    }
    this.editor.focus();
  },
  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>
<style scoped>
.reset-btn {
  color: #1cc283 !important;
  background-color: white;
  border: 1px #1cc283 solid;
}
.enabled-send {
  background-color: #1cc283 !important;
}
.disabled-send {
  background-color: rgb(233, 231, 231);
}
</style>
