<template>
  <v-dialog v-model="flag" max-width="460px" @click:outside="closeDialog">
    <v-card
      max-width="460px"
      id="comments-card"
      class="white"
      @dragenter="showDefaultDragImageFunc()"
      @dragleave="showDefaultDragImageFunc()"
      @drop.prevent="addDraggedFiles"
      @dragover.prevent
    >
      <v-card-title
        style="border-bottom: 1px solid #dad6f5"
        class="px-1 text-truncate dialog-title-border"
      >
        <div class="d-flex justify-center float-left" style="width: 90%">
          <span
            class="d-inline-block text-truncate"
            style="max-width: 300px"
            :style="$vuetify.breakpoint.xs ? 'max-width: 100px;' : ''"
          >
            <b class="ui-theme-color modals-title-size">
              {{
                taskDetails
                  ? taskDetails.title
                    ? upperCaseTitleName(taskDetails.title)
                    : "No Title"
                  : () => {}
              }}
            </b>
          </span>
        </div>
        <div
          class="d-flex justify-end align-center float-right"
          style="width: 10%; height: 32px"
        >
          <v-icon
            small
            color="#757096"
            @click="closeDialog"
            class="d-flex mr-2"
          >
            mdi-close
          </v-icon>
        </div>
      </v-card-title>

      <v-card-text class="px-0">
        <!-- skeleton loader -->
        <v-row v-if="skeletonLoader" class="mt-5">
          <v-col>
            <v-card elevation="0" height="30vh" class="my-1 py-2 mt-2 y-scroll">
              <v-skeleton-loader
                type="list-item-avatar-two-line"
                width="300px"
              ></v-skeleton-loader>
              <v-skeleton-loader
                type="list-item-avatar-two-line"
                width="300px"
              ></v-skeleton-loader>
              <v-skeleton-loader
                type="list-item-avatar-two-line"
                width="300px"
              ></v-skeleton-loader>
            </v-card>
          </v-col>
        </v-row>
        <!-- Show comments in Response -->
        <div
          class="d-flex flex-column"
          :class="noComments ? 'mt-3' : ''"
          v-else
        >
          <div v-if="taskDetails">
            <v-card-text style="font-size: 10px; line-height: 0.8rem">
              <v-row class="mx-5 align-center">
                <div class="align-center header-text-color">
                  <div
                    class="notify-inner"
                    style="max-width: 400px; word-wrap: break-word"
                  >
                    <v-tooltip
                      bottom
                      color="#302277"
                      v-if="
                        taskDetails.status == 'pending' ||
                        taskDetails.status == 'active' ||
                        taskDetails.status == 'overdue'
                      "
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon
                          color="#1cc283"
                          v-on="on"
                          class="pointer"
                          small
                          @click="updateTaskStatusCompleted"
                          :disabled="
                            getSelectedCompany.role == 'employee' &&
                            taskDetails.assigned_by.id != getLoggedInUser.id
                          "
                          >mdi-checkbox-blank-outline</v-icon
                        >
                      </template>
                      <span>Mark as Complete</span>
                    </v-tooltip>
                    <v-tooltip bottom color="#302277" v-else>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          color="#1cc283"
                          v-on="on"
                          class="pointer"
                          @click="checkTaskPrevStatus"
                          small
                          :disabled="
                            getSelectedCompany.role == 'employee' &&
                            taskDetails.assigned_by.id != getLoggedInUser.id
                          "
                          >mdi-checkbox-marked</v-icon
                        >
                      </template>
                      <span>Mark as Incomplete</span>
                    </v-tooltip>
                    {{
                      taskDetails && taskDetails.assigned_by
                        ? taskDetails.assigned_by.name
                        : ""
                    }}
                    has Assigned a task on
                    {{
                      taskDetails && taskDetails.created_at
                        ? showDate(taskDetails.created_at)
                        : ""
                    }}
                    with Description: {{ taskDetails.title }}
                  </div>
                  <v-divider class="mt-2"></v-divider>
                </div>
              </v-row>
            </v-card-text>
          </div>

          <div
            cols="12"
            v-if="noComments && !comments.length && !showTempMsgDiv"
          >
            <!-- error message -->
            <v-alert
              v-if="showAttachmentError"
              dismissible
              dense
              class="mx-1"
              type="error"
            >
              {{ showAttachmentError }}
            </v-alert>
            <!-- Empty Comment Box View -->
            <v-card
              elevation="0"
              height="180px"
              width="100%"
              class="d-flex align-center justify-center"
              style="overflow-y: scroll"
            >
              <v-card
                v-show="attachmentsOverlay"
                class="dragFiles drag-files-width"
              >
                <v-container fill-height fluid>
                  <v-row
                    align="center"
                    justify="center"
                    style="margin-right: 12px"
                  >
                    <v-col :cols="$mq == 'extraSmallPhones' ? '12' : '10'">
                      <template v-if="showAudio">
                        <AudioRecorder
                          @audioRecording="getAudio"
                          :showAudio="showAudio"
                        />
                      </template>
                      <template v-show="showFileContainer">
                        <FileAttachment
                          :selectedAttachments="selectedAttachments"
                        />
                      </template>
                      <!-- Screen Attachment -->
                      <div
                        class="d-flex justify-center mt-2"
                        v-if="preview"
                        style="border 1px solid blue"
                      >
                        <video
                          id="preview"
                          controls
                          :src="preview"
                          style="margin-left: 24px"
                          width="250"
                          height="140"
                        ></video>
                        <v-btn class="mx-2" small fab @click="deleteVideo()">
                          <v-icon small fab color="red">mdi-delete</v-icon>
                        </v-btn>
                        <v-btn
                          v-if="this.preview"
                          @click="onSubmit"
                          class="text-capitalize white--text float-right mt-1 mr-1 enabled-send"
                          depressed
                          :small="!$vuetify.breakpoint.xs"
                          :x-small="$vuetify.breakpoint.xs"
                        >
                          Send
                        </v-btn>
                      </div>
                      <img
                        v-if="
                          showDefaultDragImage && selectedAttachments.length < 1
                        "
                        src="@/assets/images/upload-files-drag-and-drop.png"
                        width="50%"
                      />
                      <v-carousel
                        v-if="showCarousel"
                        :show-arrows="false"
                        height="170"
                      >
                        <v-carousel-item
                          v-for="(item, i) in items"
                          :key="i"
                          :src="item.src"
                          reverse-transition="fade-transition"
                          transition="fade-transition"
                        >
                          <v-app-bar height="10" flat color="rgba(0, 0, 0, 0)">
                            <v-spacer></v-spacer>
                            <v-btn
                              color="white"
                              fab
                              x-small
                              class="mt-6 mr-n3"
                              @click="hideCarasol"
                            >
                              <v-icon class="pointer red--text"
                                >mdi-close</v-icon
                              >
                            </v-btn>
                          </v-app-bar>
                        </v-carousel-item>
                      </v-carousel>
                      <v-btn
                        v-if="
                          selectedAttachments.length || this.get_audio_record[0]
                        "
                        @click="onSubmit"
                        :class="
                          selectedAttachments.length == 1
                            ? 'mt-n6 mr-6'
                            : 'mt-1 mr-1'
                        "
                        class="text-capitalize white--text float-right enabled-send"
                        depressed
                        :small="!$vuetify.breakpoint.xs"
                        :x-small="$vuetify.breakpoint.xs"
                      >
                        Send
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
              <div
                style="width: 200px"
                justify="center"
                align="center"
                v-if="!attachmentsOverlay"
              >
                <!-- Empty Comment Box Image -->
                <p ref="p" class="dusty-purple-text">
                  <b v-if="!checkSync()"
                    >No comments yet. Your conversation will show here.</b
                  >
                  <b v-if="checkSync()"
                    >Something went wrong.<br />
                    Please try again</b
                  >
                  <v-icon
                    class="pointer"
                    v-if="checkSync()"
                    @click="fetchComments()"
                    >mdi-sync</v-icon
                  >
                </p>
              </div>
            </v-card>
          </div>
          <!-- Filled Comment Box -->
          <div v-else>
            <v-card
              elevation="0"
              height="250px"
              :class="
                (showAudio ||
                  showCarousel ||
                  selectedAttachments.length ||
                  getRecordingAvailable) &&
                attachmentsOverlay
                  ? 'overflow-hidden'
                  : 'y-scroll'
              "
              id="chat"
            >
              <!-- error message -->
              <v-alert
                v-if="showAttachmentError"
                dismissible
                dense
                class="mx-1"
                type="error"
              >
                {{ showAttachmentError }}
              </v-alert>
              <v-snackbar
                class="mt-5"
                top
                right
                :color="commentError ? 'red lighten-5' : 'green lighten-5'"
                light
                v-model="snackbar"
              >
                <span :class="commentError ? 'red--text' : 'green--text'">
                  {{ snackbarMessage }}</span
                >
                <template v-slot:action="{ attrs }">
                  <v-btn
                    :color="commentError ? 'red' : 'green'"
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
                v-show="attachmentsOverlay"
                class="dragFiles drag-files-width"
              >
                <v-container fill-height fluid>
                  <v-row
                    align="center"
                    justify="center"
                    style="margin-right: 12px"
                  >
                    <v-col :cols="$mq == 'extraSmallPhones' ? '12' : '10'">
                      <template v-if="showAudio">
                        <AudioRecorder
                          @audioRecording="getAudio"
                          :showAudio="showAudio"
                        />
                      </template>
                      <template v-show="showFileContainer">
                        <FileAttachment
                          :selectedAttachments="selectedAttachments"
                        />
                      </template>
                      <!-- Screen Attachment -->
                      <div
                        class="d-flex justify-center mt-2"
                        v-if="preview"
                        style="border 1px solid blue"
                      >
                        <video
                          id="preview"
                          controls
                          :src="preview"
                          style="margin-left: 24px"
                          width="250"
                          height="180"
                        ></video>
                        <v-btn class="mx-2" small fab @click="deleteVideo()">
                          <v-icon small fab color="red">mdi-delete</v-icon>
                        </v-btn>
                        <v-btn
                          v-if="this.preview"
                          @click="onSubmit"
                          class="text-capitalize white--text float-right mt-1 mr-1 enabled-send"
                          depressed
                          :small="!$vuetify.breakpoint.xs"
                          :x-small="$vuetify.breakpoint.xs"
                        >
                          Send
                        </v-btn>
                      </div>
                      <img
                        v-if="
                          showDefaultDragImage && selectedAttachments.length < 1
                        "
                        src="@/assets/images/upload-files-drag-and-drop.png"
                        width="50%"
                      />
                      <v-carousel
                        v-if="showCarousel"
                        :show-arrows="false"
                        height="200"
                      >
                        <v-carousel-item
                          v-for="(item, i) in items"
                          :key="i"
                          :src="item.src"
                          reverse-transition="fade-transition"
                          transition="fade-transition"
                        >
                          <v-app-bar height="10" flat color="rgba(0, 0, 0, 0)">
                            <v-spacer></v-spacer>
                            <v-btn
                              color="white"
                              fab
                              x-small
                              class="mt-6 mr-n3"
                              @click="hideCarasol"
                            >
                              <v-icon class="pointer red--text"
                                >mdi-close</v-icon
                              >
                            </v-btn>
                          </v-app-bar>
                        </v-carousel-item>
                      </v-carousel>
                      <v-btn
                        v-if="
                          selectedAttachments.length || this.get_audio_record[0]
                        "
                        @click="onSubmit"
                        :class="
                          selectedAttachments.length == 1
                            ? 'mt-n6 mr-6'
                            : 'mt-1 mr-1'
                        "
                        class="text-capitalize white--text float-right enabled-send"
                        depressed
                        :small="!$vuetify.breakpoint.xs"
                        :x-small="$vuetify.breakpoint.xs"
                      >
                        Send
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
              <v-card-text class="overflow-y-auto" height="200">
                <div v-for="comment in comments" :key="comment.id">
                  <TaskLog :details="comment" v-if="comment.is_log" />
                  <div
                    v-else
                    style="height: auto; white-space: normal"
                    class="pa-2 mb-2 d-flex flex-column"
                  >
                    <div v-if="checkForDate(comment.created_at)">
                      <div class="d-flex justify-center align-center my-2">
                        <v-divider></v-divider>
                        <span
                          class="mx-2"
                          v-html="groupByDate(comment.created_at)"
                        >
                        </span>
                        <v-divider></v-divider>
                      </div>
                    </div>
                    <div id="msginfo-div">
                      <!-- purple box -->
                      <div
                        :style="
                          $mq == 'extraSmallPhones'
                            ? 'width: 290px'
                            : 'width: 316px'
                        "
                        class="d-flex flex-column pa-2"
                        :class="
                          getLoggedInUser.name == comment.user.name
                            ? 'sender-msg-bg sender-msg-direction'
                            : 'reciever-msg-bg reciever-msg-direction'
                        "
                      >
                        <div class="d-flex">
                          <!-- name -->
                          <v-tooltip
                            color="transparent"
                            content-class="tooltip-opacity"
                            left
                          >
                            <template v-slot:activator="{ on }">
                              <div
                                v-on="on"
                                class="d-flex justify-start align-center name-color float-left"
                              >
                                <!-- user avatar inside message  bubble -->
                                <profileimage
                                  class="text-light pointer mx-2"
                                  inline
                                  v-show="
                                    comment.user.image ? ':src' : ':username'
                                  "
                                  :username="comment.user.name"
                                  :src="comment.user.image"
                                  :size="30"
                                  :circular="true"
                                ></profileimage>
                                <span
                                  class="d-inline-block text-truncate text-capitalize name-width"
                                  ><b>{{ comment.user.name }}</b></span
                                >
                              </div>
                            </template>
                            <!-- tooltip content -->
                            <span>
                              <v-card
                                elevation="1"
                                class="ma-0 pa-0"
                                max-width="200px"
                                height="148"
                              >
                                <v-card-text>
                                  <!-- avatar -->
                                  <profileimage
                                    inline
                                    v-show="
                                      comment.user.image ? ':src' : ':username'
                                    "
                                    :username="comment.user.name"
                                    :src="comment.user.image"
                                    :size="40"
                                    :circular="true"
                                  ></profileimage>
                                  <!-- name-->
                                  <span
                                    class="d-inline-block d-flex my-1 justify-center text-truncate text-capitalize"
                                    style="max-width: 200px"
                                  >
                                    <b> {{ comment.user.name }} </b>
                                  </span>
                                  <!-- email  -->
                                  <span
                                    class="d-inline-block text-truncate d-flex justify-center align-center ui-theme-color mt-n2"
                                    style="max-width: 200px"
                                  >
                                    <b class="font-weight-thin ui-theme-color">
                                      {{ comment.user.email }}
                                    </b>
                                  </span>
                                  <!-- role -->
                                  <span
                                    class="grey--text d-flex justify-center font-weight-thin d-inline-block text-truncate text-capitalize"
                                    style="max-width: 200px"
                                  >
                                    ({{ comment.user.role }})
                                  </span>
                                </v-card-text>
                              </v-card>
                            </span>
                          </v-tooltip>
                          <v-spacer></v-spacer>

                          <!-- sent time -->
                          <div class="d-flex align-center ml-2 justify-end">
                            <v-tooltip top color="#302277">
                              <template v-slot:activator="{ on, attrs }">
                                <span
                                  class="sent-time-css"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                >
                                  {{ getDate(comment.created_at) }}
                                </span>
                              </template>
                              <span>{{ showDate(comment.created_at) }}</span>
                            </v-tooltip>
                          </div>
                          <div
                            v-if="getLoggedInUser.name == comment.user.name"
                            class="d-flex align-center"
                          >
                            <!-- action dots -->
                            <v-menu offset-y>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on" icon x-small>
                                  <v-icon x-small class="float-right icon-color"
                                    >mdi-dots-vertical</v-icon
                                  >
                                </v-btn>
                              </template>
                              <v-list dense height="70">
                                <div class="list-item-height mt-n1">
                                  <v-list-item class="list-item">
                                    <v-list-item-title
                                      @click="openEditMsgModal(comment)"
                                      class="pointer caption ui-theme-color"
                                    >
                                      <v-icon
                                        x-small
                                        class="mr-2"
                                        color="#2a206a"
                                      >
                                        mdi-pencil </v-icon
                                      >Edit</v-list-item-title
                                    >
                                  </v-list-item>
                                </div>
                                <v-divider class="mt-2"></v-divider>
                                <div class="list-item-height">
                                  <v-list-item dense class="list-item">
                                    <v-list-item-title
                                      class="pointer caption red--text"
                                      @click="deleteComment(comment.id)"
                                      ><v-icon color="red" class="mr-2" x-small>
                                        mdi-delete</v-icon
                                      >Delete</v-list-item-title
                                    >
                                  </v-list-item>
                                </div>
                              </v-list>
                            </v-menu>
                          </div>
                        </div>

                        <!-- text messsage -->
                        <div
                          class="d-flex message-text-color justify-start ml-12 text-message"
                        >
                          <span
                            id="comment-text"
                            class="d-inline-block word-break"
                            style="max-width: 248px"
                            v-html="comment.text"
                          >
                          </span>
                        </div>
                        <div v-if="comment.attachments">
                          <div
                            v-for="attachment in comment.attachments"
                            :key="attachment.id"
                          >
                            <div v-if="attachment.type == 'audio/mp3'">
                              <audio
                                id="audio-tag"
                                controls
                                :class="
                                  getLoggedInUser.name == comment.user.name
                                    ? 'sender-voice-clip'
                                    : 'receiever-voice-clip'
                                "
                                style="width: 260px"
                                :src="url + attachment.filename"
                                :type="attachment.type"
                              ></audio>
                            </div>
                            <!-- attachments div -->
                            <div class="mx-10" v-else>
                              <span>
                                <a
                                  :href="url + attachment.filename"
                                  target="_blank"
                                  class="text-decoration-none attachment-text-color"
                                >
                                  <v-icon
                                    small
                                    class="mx-1 mb-3 attachment-text-color"
                                    v-if="
                                      attachment.type == 'image/png' ||
                                      attachment.type == 'image/jpeg' ||
                                      attachment.type == 'image/jpg' ||
                                      attachment.type == 'image/gif'
                                    "
                                    >mdi-image</v-icon
                                  >
                                  <span
                                    class="attachment-decoration caption d-inline-block text-truncate attachment-text-color"
                                    style="max-width: 130px"
                                    v-if="
                                      attachment.type == 'image/png' ||
                                      attachment.type == 'image/jpeg' ||
                                      attachment.type == 'image/jpg' ||
                                      attachment.type == 'image/gif'
                                    "
                                    >{{ attachment.name }}
                                  </span>
                                </a>

                                <a
                                  :href="url + attachment.filename"
                                  target="_blank"
                                  class="text-decoration-none attachment-text-color"
                                >
                                  <v-icon
                                    small
                                    class="mx-1 mb-3 attachment-text-color"
                                    v-if="attachment.type == 'video/webm'"
                                    >mdi-television-play</v-icon
                                  >
                                  <span
                                    class="attachment-decoration caption d-inline-block text-truncate attachment-text-color"
                                    style="max-width: 130px"
                                    v-if="attachment.type == 'video/webm'"
                                    >{{ attachment.name }}
                                  </span>
                                </a>
                                <!-- video/mp4 attachment -->
                                <a
                                  :href="url + attachment.filename"
                                  target="_blank"
                                  class="text-decoration-none attachment-text-color"
                                >
                                  <v-icon
                                    small
                                    class="pointer mx-1 my-1 mt-n2 attachment-text-color"
                                    v-if="
                                      attachment.type == 'video/mp4' ||
                                      attachment.type == 'video/mp4'
                                    "
                                    >mdi-movie-play-outline</v-icon
                                  >
                                  <!-- video name -->
                                  <span
                                    class="attachment-decoration caption d-inline-block text-truncate attachment-text-color"
                                    style="max-width: 130px"
                                    v-if="attachment.type == 'video/mp4'"
                                    >{{ attachment.name }}
                                  </span>
                                </a>
                                <!-- pdf attachment -->
                                <a
                                  :href="url + attachment.filename"
                                  target="_blank"
                                  class="text-decoration-none attachment-text-color"
                                >
                                  <v-icon
                                    small
                                    class="mx-1 mb-3 attachment-text-color"
                                    v-if="attachment.type == 'application/pdf'"
                                    >mdi-file-pdf-outline</v-icon
                                  >
                                  <span
                                    class="attachment-decoration caption d-inline-block text-truncate attachment-text-color"
                                    style="max-width: 130px"
                                    v-if="attachment.type == 'application/pdf'"
                                    >{{ attachment.name }}
                                  </span>
                                </a>
                                <!-- MSword docx attachment -->
                                <span class="d-flex justify-start">
                                  <a
                                    :href="url + attachment.filename"
                                    class="text-decoration-none attachment-text-color"
                                  >
                                    <v-icon
                                      small
                                      class="mx-1 mb-3 attachment-text-color"
                                      v-if="
                                        attachment.type ==
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                      "
                                      >mdi-file-word-outline</v-icon
                                    ><span
                                      class="attachment-decoration caption attachment-text-color d-inline-block text-truncate caption"
                                      style="max-width: 130px"
                                      v-if="
                                        attachment.type ==
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                      "
                                      >{{ attachment.name }}
                                    </span>
                                  </a>
                                </span>
                                <!-- MSword doc attachment -->
                                <span class="d-flex justify-start">
                                  <a
                                    :href="url + attachment.filename"
                                    class="text-decoration-none attachment-text-color"
                                  >
                                    <v-icon
                                      small
                                      class="mx-1 mb-3 attachment-text-color"
                                      v-if="
                                        attachment.type == 'application/msword'
                                      "
                                      >mdi-file-word-outline</v-icon
                                    ><span
                                      class="attachment-decoration caption attachment-text-color d-inline-block text-truncate caption"
                                      style="max-width: 130px"
                                      v-if="
                                        attachment.type == 'application/msword'
                                      "
                                      >{{ attachment.name }}
                                    </span>
                                  </a>
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          class="d-flex message-text-color justify-end"
                          v-if="comment && comment.read_by.length"
                        >
                          <v-tooltip
                            open-delay="150"
                            color="#f3fafb"
                            left
                            bottom
                            v-if="getLoggedInUser.id == comment.user.id"
                          >
                            <template v-slot:activator="{ on }">
                              <p class="sent-time-css d-block" v-on="on">
                                Seen By
                              </p>
                              <!-- <v-icon class="mx-2" size="18" v-on="on">mdi-check-all</v-icon> -->
                            </template>
                            <span v-if="comment.read_by.length != ''">
                              <div
                                class="title-text d-block text-capitalize"
                                v-for="(user, index) of comment.read_by"
                                :key="index"
                              >
                                {{ user }}
                              </div>
                            </span>
                          </v-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="showTempMsgDiv">
                  <div
                    style="height: auto; white-space: normal"
                    class="pa-2 mb-2 d-flex flex-column"
                  >
                    <div id="msginfo-div">
                      <!-- purple box -->
                      <div
                        :style="
                          $mq == 'extraSmallPhones'
                            ? 'width: 290px'
                            : 'width: 316px'
                        "
                        class="d-flex flex-column pa-2 temp-msg-bg sender-msg-direction"
                      >
                        <div class="d-flex">
                          <!-- name -->
                          <div
                            class="d-flex justify-start align-center name-color float-left"
                          >
                            <!-- user avatar inside message  bubble -->
                            <profileimage
                              :size="30"
                              :circular="true"
                              class="text-light pointer mx-2"
                              inline
                              v-show="
                                getLoggedInUser.image ? ':src' : ':username'
                              "
                              :username="getLoggedInUser.name"
                              :src="getLoggedInUser.image"
                            ></profileimage>
                            <span
                              class="d-inline-block text-truncate text-capitalize name-width"
                              ><b>{{ getLoggedInUser.name }}</b></span
                            >
                          </div>
                          <v-spacer></v-spacer>
                          <div class="d-flex align-center">
                            <v-progress-circular
                              indeterminate
                              color="grey lighten-1"
                              :size="18"
                              width="2"
                            ></v-progress-circular>
                          </div>
                        </div>
                        <div
                          style="max-width: 180px"
                          class="d-flex message-text-color justify-start ml-12 text-message"
                        >
                          <span
                            class="d-inline-block word-break"
                            style="max-width: 180px"
                            v-html="form.text"
                          >
                          </span>
                        </div>
                        <div v-if="form.attachments">
                          <div
                            v-for="attachment in form.attachments"
                            :key="attachment.id"
                          >
                            <div v-if="attachment.type == 'audio/mp3'">
                              <audio
                                id="audio-tag"
                                controls
                                class="temp-voice-clip"
                                style="width: 260px"
                              ></audio>
                            </div>
                            <div v-else class="mx-10">
                              <span class="d-flex align-start">
                                <v-icon
                                  v-if="
                                    attachment.type == 'image/png' ||
                                    attachment.type == 'image/jpeg' ||
                                    attachment.type == 'image/jpg' ||
                                    attachment.type == 'image/gif'
                                  "
                                  small
                                  class="pointer mx-1 my-1 attachment-text-color"
                                  >mdi-image</v-icon
                                >
                                <v-icon
                                  small
                                  class="pointer mx-1 my-1 attachment-text-color"
                                  v-if="attachment.type == 'video/webm'"
                                  >mdi-television-play</v-icon
                                >
                                <v-icon
                                  small
                                  class="pointer mx-1 my-1 mt-n2 attachment-text-color"
                                  v-if="attachment.type == 'video/mp4'"
                                  >mdi-movie-play-outline</v-icon
                                >
                                <v-icon
                                  small
                                  class="mx-1 mb-3 attachment-text-color"
                                  v-if="attachment.type == 'application/pdf'"
                                  >mdi-file-pdf-outline</v-icon
                                >
                                <v-icon
                                  small
                                  class="mx-1 mb-3 attachment-text-color"
                                  v-if="
                                    attachment.type ==
                                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                                    attachment.type == 'application/msword'
                                  "
                                  >mdi-file-word-outline</v-icon
                                >
                                <span
                                  v-if="attachment.type == 'video/webm'"
                                  class="caption attachment-text-color attachment-decoration"
                                >
                                  Screen Record
                                </span>
                                <span
                                  class="attachment-decoration caption d-inline-block text-truncate attachment-text-color"
                                  style="max-width: 130px"
                                >
                                  {{ attachment.name }}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
        <!-- bottom bar -->

        <div class="d-flex mx-2 pt-1 align-center">
          <div
            :style="$vuetify.breakpoint.xs ? 'width:100%;' : 'width: 70vw;'"
            class="d-flex flex-column float-left mx-1 bottom-bar px-1"
            id="bottom-bar"
          >
            <!-- Text Field -->
            <div class="mt-1">
              <div class="d-flex float-right">
                <!-- audio icon -->
                <v-tooltip color="#302277" top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-on="on"
                      v-bind="attrs"
                      :disabled="
                        getScreenRecorderState || selectedAttachments.length
                          ? true
                          : false || showMenuBar || getRecordingAvailable
                          ? true
                          : false
                      "
                      class="pointer icon-color"
                      @click="triggerRecordFunction()"
                      >mdi-microphone-outline</v-icon
                    >
                  </template>
                  <span>Record Audio</span>
                </v-tooltip>
                <!-- screen share icon -->
                <v-tooltip color="#302277" top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-on="on"
                      v-bind="attrs"
                      :disabled="
                        showCarousel || showAudio || selectedAttachments.length
                          ? true
                          : false || showMenuBar
                      "
                      class="pointer icon-color mx-1"
                      @click="screenShare()"
                      id="captureBtn"
                      >mdi-monitor-share</v-icon
                    >
                  </template>
                  <span>Share Screen</span>
                </v-tooltip>
                <!-- attachment icon -->
                <v-tooltip color="#302277" top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-on="on"
                      v-bind="attrs"
                      :disabled="
                        showCarousel ||
                        showAudio ||
                        getScreenRecorderState ||
                        showMenuBar ||
                        getRecordingAvailable
                          ? true
                          : false
                      "
                      class="mx-1 pointer rotate attachment icon-color"
                      @click="showFileDropContainer()"
                      >mdi-attachment</v-icon
                    >
                  </template>
                  <span>Attach Files</span>
                </v-tooltip>
              </div>
              <div
                class="editor"
                :style="$vuetify.breakpoint.xs ? 'width:70%;' : 'width: 345px;'"
              >
                <editor-content
                  autofocus
                  id="editor"
                  class="editor__content ml-4"
                  :editor="editor"
                />
              </div>
            </div>

            <editor-menu-bar
              :editor="editor"
              v-slot="{ commands, isActive }"
              v-show="showMenuBar"
            >
              <div class="menubar">
                <v-tooltip top color="#2a206a">
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

                <v-tooltip top color="#2a206a">
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

                <v-tooltip top color="#2a206a">
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

                <v-tooltip top color="#2a206a">
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

                <v-tooltip top color="#2a206a">
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
                <!-- send button -->
                <v-btn
                  @click="onSubmit"
                  class="text-capitalize white--text float-right mt-1 mr-1 enabled-send"
                  depressed
                  :small="!$vuetify.breakpoint.xs"
                  :x-small="$vuetify.breakpoint.xs"
                >
                  Send
                </v-btn>
              </div>
            </editor-menu-bar>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <!--Edit Message Modal -->
    <template v-if="openEditMsgDialog">
      <EditMessageModal
        :openEditMsgDialog.sync="openEditMsgDialog"
        :messageDetails="editMessageDetails"
        :taskDetail="taskDetails"
        :allComments="comments"
      />
    </template>
  </v-dialog>
</template>

<script>
import Swal from "sweetalert2";
import { mapGetters } from "vuex";
// for grouping messaging by date
import authAxios from "@/services/api.service.js";
let oldDate = null;
import { baseURL } from "@/assets/js/urls";
import { eventBus } from "@/main";
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import SendMessage from "@/TipTapExtension/sendMessage";
import CustomLink from "@/TipTapExtension/customLink";
import moment from "moment";
import AudioRecorder from "@/components/Tasks/Comments/AudioRecorder";
import FileAttachment from "@/components/Tasks/Comments/FileAttachment";
import TaskLog from "@/components/Tasks/Comments/TaskLog";
import profileimage from "@/components/includes/ProfileImage";
import EditMessageModal from "@/components/Tasks/Comments/EditMessageModal";

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
  name: "Comments",
  components: {
    AudioRecorder,
    FileAttachment,
    EditorContent,
    EditorMenuBar,
    profileimage,
    EditMessageModal,
    TaskLog,
  },
  props: [
    "openCommentDialog",
    "taskDetails",
    "getTaskComments",
    "clearTextField",
  ],
  computed: {
    ...mapGetters([
      "getSelectedCompany",
      "getLoggedInUser",
      "getRecordingAvailable",
      "getScreenRecorderState",
      "getScreenRecordingBlob",
      "getPendingTimer",
    ]),
    url() {
      return baseURL.API_URL;
    },
    isExtension() {
      return window.innerHeight == "600" && window.innerWidth == "450";
    },
  },
  data() {
    return {
      comments: [],
      syncComments: null,
      skeletonLoader: false,
      getSync: false,
      preview: null,
      showCarousel: false,
      flag: false, // Dialog activator
      form: {
        company_id: "",
        task_id: "",
        text: "",
        attachments: [],
      },
      showAudio: false,
      showVideo: false,
      // for UI purpose
      noComments: true,
      get_audio_record: [],
      showFileContainer: false,
      snackbar: false,
      snackbarMessage: null,
      commentError: null,
      showTempMsgDiv: false,
      attachmentError: "",
      attachments: [],
      attachmentsOverlay: false,
      showMenuBar: false,
      showDefaultDragImage: false,
      openEditMsgDialog: false,
      editMessageDetails: null,
      showAttachmentError: "",
      selectedAttachments: [],
      updateTaskStatusValue: null,
      items: [
        {
          src: require("@/assets/images/step1.png"),
        },
        {
          src: require("@/assets/images/step2.png"),
        },
        {
          src: require("@/assets/images/step3.png"),
        },
        {
          src: require("@/assets/images/step4.png"),
        },
        {
          src: require("@/assets/images/step5.png"),
        },
      ],
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
            showOnlyWhenEditable: false,
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
            this.showMenuBar = false;
          } else {
            this.showMenuBar = true;
          }
        },
        autoFocus: true,
      }),
    };
  },

  methods: {
    // Create comment
    createComment(data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "create-comment",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            this.comments.push(response.data.data);
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // READ Comments from API (GET)
    fetchComments() {
      this.skeletonLoader = true;
      return new Promise((resolve, reject) => {
        if (this.taskDetails && this.taskDetails.task_id) {
          authAxios
            .post("get-comments", JSON.parse(localStorage.getItem("token")), {
              task_id: this.taskDetails.task_id,
              company_id: this.getSelectedCompany.id,
            })
            .then((res) => {
              this.skeletonLoader = false;
              this.comments = res.data.data;
              resolve(res.data.data);
            })
            .catch((err) => {
              this.skeletonLoader = false;
              this.syncComments = true;
              reject(err);
            });
        } else {
          this.skeletonLoader = false;
          reject();
        }
      });
    },

    checkSync() {
      return this.syncComments;
    },
    // This function is responsible for attaching the dragged files.
    addDraggedFiles() {
      if (!this.showAudio && !this.get_audio_record[0] && !this.preview) {
        this.distinguishData();
      }
    },

    //Methods for set Dragged attachments
    distinguishData() {
      var files = event.dataTransfer.files;
      if (files.length > 5) {
        if (!this.selectedAttachments.length) {
          this.attachmentsOverlay = false;
          this.showAttachmentError =
            "You cannot select more than 5 files at a time";
          setTimeout(() => {
            this.showAttachmentError = "";
          }, 2000);
        } else {
          eventBus.$emit("showAttachmentSelectionError");
        }
        return;
      }
      for (var i = 0; i < files.length; i++) {
        if (files[i].type != "audio/mpeg") {
          let dragFileName = files[i].name;
          let dragFileType = files[i].type;
          // Pushing the attachment in the array of allDraggedFiles.
          this.getBase64(files[i]).then((data) => {
            var body = {
              id: Math.random().toString(36).substr(2, 5),
              name: dragFileName,
              type: dragFileType,
              file: data,
            };
            dragFileName = "";
            dragFileType = "";
            this.selectedAttachments.push(body);
          });
        } else {
          eventBus.$emit("showAttachmentError");
        }
      }
      this.showDefaultDragImage = false;
      this.showFileContainer = true;
    },
    //set dragged File Path
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },
    //This method responsible for showing default Drag Image on Dragging
    showDefaultDragImageFunc() {
      if (this.comments && this.comments.length) {
        var container = document.getElementById("chat");
        container.scrollTop = "250px";
      }

      if (!this.showAudio && !this.get_audio_record[0] && !this.preview) {
        if (!this.selectedAttachments.length) {
          this.attachmentsOverlay = !this.attachmentsOverlay;
        }
        this.showDefaultDragImage = true;
      }
    },
    hideCarasol() {
      this.editor.setOptions({ editable: true });
      this.showCarousel = false;
      if (this.comments && this.comments.length) {
        var container = document.getElementById("chat");
        container.scrollTop = container.scrollHeight;
      }
      this.attachmentsOverlay = false;
    },

    // this method will check date difference between previous and current message
    checkForDate(date) {
      let dateChecker = new Date(date).toISOString().substr(0, 10);
      if (oldDate != dateChecker) {
        oldDate = dateChecker;
        return true;
      }
      return false;
    },
    groupByDate(date) {
      if (
        new Date().toISOString().substr(0, 10) ==
        new Date(date).toISOString().substr(0, 10)
      ) {
        return "Today";
      }
      return new Date(date).toISOString().substr(0, 10);
    },

    closeDialog() {
      this.$emit("update:openCommentDialog", false);
      this.form.text = "";
      this.form.attachments = [];
      this.editor.clearContent();
      this.video_record = [];
      this.get_audio_record = [];
      this.showFileContainer = false;
      this.showDefaultDragImage = false;
      this.showAudio = false;
      this.showCarousel = false;
      this.videohide = false;
      this.flag = false;
      this.editor.setOptions({ editable: true });
      this.selectedAttachments = [];
      this.stopAudioOnModalClose();
      this.attachmentsOverlay = false;
      this.$store.commit("resetAudioTimer");
    },
    upperCaseTitleName(name) {
      return name
        .split(" ")
        .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
        .join(" ");
    },
    openEditMsgModal(comment) {
      this.openEditMsgDialog = true;
      this.editMessageDetails = comment;
      eventBus.$emit("openEditMessageDialog", this.editMessageDetails.text);
    },
    deleteComment(id) {
      Swal.fire({
        title: "Are you sure?",
        html: "Delete this comment!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Delete",
        reverseButtons: true,
      }).then((result) => {
        if (result.value) {
          let commentDelData = {
            comment_id: id,
            company_id: this.getSelectedCompany.id,
            task_id: this.taskDetails.task_id,
          };
          return new Promise((resolve, reject) => {
            authAxios
              .post(
                "delete-comment",
                JSON.parse(localStorage.getItem("token")),
                commentDelData
              )
              .then((response) => {
                this.comments = this.comments.filter((item) => {
                  return item.id != commentDelData.comment_id;
                });
                resolve(response);
              })
              .catch((err) => {
                this.$store.dispatch("checkAuth", err);
                reject(err);
              });
          });
        }
      });
    },
    getDate(date) {
      var difference = moment(date).fromNow();
      return difference;
    },
    showDate(date) {
      let d = moment(date).format("MMMM Do YYYY, h:mm:ss a");
      return d;
    },
    screenShare() {
      // if app is opened in extension
      if (window.innerHeight == "600" && window.innerWidth == "450") {
        localStorage.setItem("selectedTask", this.taskDetails.task_id);
        window.open("https://gigstimer.com/task");
      }
      this.showVideo = true;
      this.screenShareMain();
    },

    screenShareMain() {
      this.$store
        .dispatch("allowRec", {
          audio: true,
          mic: true,
        })
        .then(() => {
          this.editor.setOptions({ editable: false });
          this.showDefaultDragImage = false;
          this.$store.commit("initRec", this.taskDetails);
          this.$store.commit("startRec");
        })
        .catch((err) => {
          console.log(err);
          let chromeAgent = navigator.userAgent.indexOf("Chrome") > -1;
          if (chromeAgent) {
            Swal.fire(
              "GIGS TIMER",
              "Please allow to access 'Microphone & Camera' to use screen/voice recording feature in comment section"
            );
          } else {
            Swal.fire("GIGS TIMER", "Screen recording supported only Chrome");
          }
        });
    },
    stopAudioOnModalClose() {
      var player = document.getElementById("audio-tag");
      if (player) {
        player.pause();
      }
    },
    deleteVideo() {
      document.getElementById("preview").pause();
      this.preview = null;
      this.attachmentsOverlay = false;
      if (this.comments && this.comments.length) {
        let container = document.getElementById("chat");
        container.scrollTop = container.scrollHeight;
      }
      this.editor.setOptions({ editable: true });
      this.editor.focus();
      this.$store.commit("resetScreenRecorder");
    },

    getAudio: function (params) {
      this.editor.setOptions({ editable: false });
      this.get_audio_record = params;
      this.editor.focus();
      if (params && params.length <= 0) {
        this.showAudio = false;
        this.attachmentsOverlay = false;
        this.editor.setOptions({ editable: true });
        this.editor.focus();
        if (this.comments && this.comments.length) {
          let container = document.getElementById("chat");
          container.scrollTop = container.scrollHeight;
        }
      }
    },

    showFileDropContainer() {
      this.showFileContainer = true;
      eventBus.$emit("openChooseFileModal");
    },
    // Triggers AudioRecorder's (i.e. Child's) recording function
    triggerRecordFunction() {
      let chromeAgent = navigator.userAgent.indexOf("Chrome") > -1;
      if (chromeAgent) {
        navigator.permissions
          .query({ name: "microphone" })
          .then((permissionStatus) => {
            if (permissionStatus.state == "denied") {
              if (this.isExtension) {
                this.showCarousel = true;
                this.editor.setOptions({ editable: false });
                if (this.comments && this.comments.length) {
                  var container = document.getElementById("chat");
                  container.scrollTop = "250px";
                }
                this.attachmentsOverlay = true;
              } else {
                Swal.fire(
                  "GIGS TIMER APP",
                  "Please allow to access 'Microphone & Camera' to use screen/voice recording feature in comment section"
                );
              }
            } else if (permissionStatus.state === "granted") {
              this.startAudio();
            }
          });
      }
    },
    startAudio() {
      this.editor.setOptions({ editable: false });
      if (this.comments && this.comments.length) {
        var container = document.getElementById("chat");
        container.scrollTop = "250px";
      }
      this.attachmentsOverlay = true;
      this.showDefaultDragImage = false;
      this.showAudio = true;
    },
    // Submits final message (with text/attachments)
    onSubmit() {
      this.attachmentsOverlay = false;
      this.showMenuBar = false;
      this.editor.setOptions({ editable: false });
      //Check don't Have text then send text null in payload
      var dummyElement = document.createElement("div");
      dummyElement.innerHTML = this.editor.getHTML();
      if (dummyElement.innerText.trim() != "") {
        this.form.text = this.editor.getHTML();
      }
      this.showTempMsgDiv = true;
      if (this.comments && this.comments.length) {
        let container = document.getElementById("chat");
        container.scrollTop = container.scrollHeight;
      }

      let check_video_btn = document.getElementById("stopBtn");
      if (check_video_btn) {
        check_video_btn.click();
      }

      this.form.company_id = this.getSelectedCompany.id;
      this.form.task_id = this.taskDetails.task_id;

      if (this.getRecordingAvailable) {
        var videoReq = this.getRecordingAvailable;
        videoReq.type = "video/webm";
        this.form.attachments.push(videoReq);
      }
      this.get_audio_record.find((record) => {
        this.form.attachments.push({
          file: record.file,
          type: "audio/mp3",
        });
      });

      if (this.selectedAttachments) {
        for (let index of this.selectedAttachments) {
          this.form.attachments.push(index);
        }
      }
      // Push to queue if comment is being posted in a pending task
      if (this.getPendingTimer) {
        let req = this.form;
        req.id = Date.now();
        this.$store.commit("pushCommentRequest", req);
        return;
      }
      this.createComment(this.form)
        .then(() => {
          this.form.attachments = [];
          this.form.text = "";
          this.editor.clearContent();
          this.editor.setOptions({ editable: true });
          this.editor.focus();
          this.showTempMsgDiv = false;
          this.video_record = [];
          this.get_audio_record = [];
          this.showFileContainer = false;
          this.showAudio = false;
          this.videohide = false;
          var container = document.getElementById("chat");
          container.scrollTop = container.scrollHeight;
          this.$store.commit("resetScreenRecorder");
          this.selectedAttachments = [];
          this.preview = null;
        })
        .catch((error) => {
          this.showTempMsgDiv = false;
          this.selectedAttachments = [];
          this.editor.setOptions({ editable: true });
          this.showMenuBar = false;
          if (error) {
            if (error.response.status == 422) {
              this.snackbar = true;
              this.snackbarMessage = error.response.data.errors.text[0];
              this.commentError = true;
            }
          }
          this.$store.commit("resetScreenRecorder");
        });
    },
    //Check Have Text/Attachment then Send Message
    checkEditorText(messageHtml) {
      var dummyElement = document.createElement("div");
      dummyElement.innerHTML = messageHtml;
      if (
        dummyElement.innerText.trim() != "" ||
        this.selectedAttachments.length ||
        this.getRecordingAvailable ||
        this.get_audio_record[0]
      ) {
        this.onSubmit();
      } else {
        return;
      }
    },
    //Check Task Prev State
    checkTaskPrevStatus() {
      if (this.taskDetails.interval.length) {
        this.updateTaskStatusValue = "active";
      } else if (this.taskDetails.completed_at > this.taskDetails.due_date) {
        this.updateTaskStatusValue = "overdue";
      } else {
        this.updateTaskStatusValue = "pending";
      }
      let data = {
        status: this.updateTaskStatusValue,
        taskData: this.taskDetails,
      };
      eventBus.$emit("updateTaskStatusEvent", data);
      this.closeDialog();
    },
    updateTaskStatusCompleted() {
      this.updateTaskStatusValue = "completed";
      let data = {
        status: this.updateTaskStatusValue,
        taskData: this.taskDetails,
      };
      eventBus.$emit("updateTaskStatusEvent", data);
      this.closeDialog();
    },
    addSelectedAttachments(params) {
      this.selectedAttachments.push(params);
    },
    deleteSelectedAttachment(param) {
      console.log("param");
      this.selectedAttachments = this.selectedAttachments.filter(
        (t) => t.id !== param
      );
      if (this.selectedAttachments < 1) {
        if (this.comments && this.comments.length) {
          var container = document.getElementById("chat");
          container.scrollTop = container.scrollHeight;
        }
        this.editor.setOptions({ editable: true });
        this.editor.focus();
        this.showFileContainer = false;
      }
    },
  },

  watch: {
    selectedAttachments(value) {
      if (value && this.selectedAttachments.length) {
        this.editor.setOptions({ editable: false });
        this.editor.focus();
        if (this.comments && this.comments.length) {
          var container = document.getElementById("chat");
          container.scrollTop = "250px";
        }
        this.attachmentsOverlay = true;
      } else {
        this.attachmentsOverlay = false;
      }
    },
    openCommentDialog(value) {
      value ? (this.flag = true) : (this.flag = false);
    },
    flag(value) {
      if (value) {
        this.editor.focus();
        this.fetchComments()
          .then(() => {
            if (this.preview) {
              if (this.comments && this.comments.length) {
                var container = document.getElementById("chat");
                container.scrollTop = "250px";
              }
              this.attachmentsOverlay = true;
              this.editor.setOptions({ editable: false });
            } else {
              if (this.comments && this.comments.length) {
                let container = document.getElementById("chat");
                container.scrollTop = container.scrollHeight;
              }
              if (this.getScreenRecorderState) {
                this.editor.setOptions({ editable: false });
              } else {
                this.editor.focus();
              }
            }
          })
          .catch(() => {});
      } else {
        this.comments = [];
        this.$emit("update:openCommentDialog", false);
        this.$store.commit("resetAudioTimer");
        localStorage.removeItem("selectedTask");
      }
    },
    getRecordingAvailable(value) {
      if (value && this.getScreenRecordingBlob) {
        this.flag = true;
        this.fetchComments().then(() => {
          if (this.comments && this.comments.length) {
            var container = document.getElementById("chat");
            container.scrollTop = "250px";
          }
          this.attachmentsOverlay = true;
          this.editor.setOptions({ editable: false });
          this.preview = window.URL.createObjectURL(
            this.getScreenRecordingBlob
          );
        });
      }
    },

    clearTextField(value) {
      value
        ? Object.assign(
            this.form,
            {
              company_id: "",
              task_id: "",
              text: "",
              attachments: [],
            },
            (this.showFileContainer = false)
          )
        : () => {};
    },
  },
  mounted() {
    this.checkSync();
    eventBus.$on("addSelectedAttachments", this.addSelectedAttachments);
    eventBus.$on("deleteSelectedAttachment", this.deleteSelectedAttachment);
    eventBus.$on("showSelectedAttachmentsError", () => {
      this.showAttachmentError =
        "You cannot select more than 5 files at a time";
      setTimeout(() => {
        this.showAttachmentError = "";
      }, 2000);
    });
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var player = document.getElementById("audio-tag");
        if (player) {
          player.pause();
        }
      }
    });
    if (localStorage.getItem("selectedTask")) {
      this.flag = true;
    }

    if (this.getRecordingAvailable) {
      this.flag = true;
      this.preview = window.URL.createObjectURL(this.getScreenRecordingBlob);
    }

    eventBus.$on("commentsPosted", () => {
      this.showTempMsgDiv = false;
    });

    eventBus.$on("create-comment", (req) => {
      this.createComment(req).then(() => {
        this.$store.commit("popCommentRequest", req.id);
      });
    });
  },
  beforeDestroy() {
    this.editor.destroy();
    eventBus.$off("showSelectedAttachmentsError");
    eventBus.$off("commentsPosted");
    eventBus.$off("addSelectedAttachments");
    eventBus.$off("deleteSelectedAttachment");
    eventBus.$off("create-comment");
  },
};
</script>
<style>
.notify-row {
  background-color: #f3fafb;
  border: 1px solid #28806d;
  border-radius: 3px;
}
.notify-inner {
  color: #000000cc;
}
.title-text {
  color: cadetblue;
  font-weight: bolder;
  font-size: 11px;
}
.title-text-detail {
  color: #181717d9;
  font-weight: bolder;
  font-size: 11px;
}

.enabled-send {
  background-color: #1cc283 !important;
}
.y-scroll {
  overflow-y: scroll;
}
.sender-voice-clip::-webkit-media-controls-play-button,
.sender-voice-clip::-webkit-media-controls-panel {
  background-color: #edebf9;
}
.receiever-voice-clip::-webkit-media-controls-play-button,
.receiever-voice-clip::-webkit-media-controls-panel {
  background-color: #f5f5f5;
}
.bottom-bar {
  border: 1px solid #2a206a !important;
  border-radius: 8px;
}

.icon-color {
  color: #2a206a !important;
}
/* video css */
.desc-label {
  font-size: 14px;
  font-family: "poppins";
  color: #000000;
  letter-spacing: 0.2px;
  text-align: left;
  line-height: 20px;
}
#startBtn {
  font-size: 21px;
  cursor: pointer;
  color: #2a206a;
  margin-right: 5px;
}
.text-inner-btn {
  height: 15px;
  font-family: "poppins";
  font-size: 12px;
  line-height: 16px;
  letter-spacing: normal;
  color: #2a206a;
  margin-top: -13px;
  padding-left: 17px;
}
.text-inner-btn-download {
  height: 15px;
  font-family: "poppins";
  font-size: 12px;
  line-height: 16px;
  letter-spacing: normal;
  color: #2a206a;
  margin-top: -11px;
  padding-left: 8px;
}
.text-inner-btn-record {
  height: 15px;
  font-family: "poppins";
  font-size: 10px;
  line-height: 16px;
  letter-spacing: normal;
  color: #2a206a;
  margin-top: -20px;
  padding-left: 24px;
}

#inner-btn-icon {
  color: #2a206a !important;
  max-width: none !important;
}
#inner-btn-icon-stop {
  color: #2a206a !important;
  max-width: none !important;
  margin-top: 5px;
}
#download-inner-btn-icon {
  color: #2a206a !important;
  max-width: none !important;
  margin-top: 3px;
  display: flex;
}
.text-heading-recording {
  font-size: 10px;
  color: #2a206a;
  letter-spacing: normal;
  font-family: "Poppins";
  line-height: 12px;
  margin-top: 5.5rem;
}
.my-downlaod {
  cursor: pointer;
  width: 140% !important;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #2a206a;
  background-color: #eff5ff;
  display: grid;
  margin-top: 0rem;
  padding: 2px;
}
.input-field {
  position: fixed;
}

/* video {
  border-radius: 7px;
  width: 156px;
  height: 102px;
} */

.team-text-inner-btn {
  cursor: pointer !important;
  height: 15px;
  font-family: "poppins";
  font-size: 12px;
  line-height: 16px;
  letter-spacing: normal;
  color: #2a206a;
  margin-top: -13px;
  padding-left: 17px;
  text-align: center;
}
.my-downlaod-team {
  cursor: pointer;
  z-index: 999 !important;
  width: 110px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #2a206a;
  background-color: #eff5ff;
  display: grid;
  margin-top: 0rem;
  padding: 2px;
}
.screen-recording-options {
  cursor: pointer;
  margin-top: 65px !important;
  margin-left: 15px !important;
}
.delete-screen-recording {
  margin-top: -12px !important;
  margin-left: 15px !important;
  cursor: pointer;
}
.desc-img {
  width: 14px;
  height: 15px;
}
.rotate {
  transform: rotate(-52deg) !important;
}
.attachment-decoration {
  text-decoration-line: underline;
}
.btns-cursor {
  cursor: pointer;
}
.confirm-button {
  background-color: #ffb7b7;
}
.username-line-style:hover {
  text-decoration-line: underline;
}
.v-text-field__slot input::placeholder {
  color: #757096 !important;
  /* font-size: small !important; */
}
.v-text-field__slot {
  background-color: transparent !important;
}
.list-item-height {
  height: 20px !important;
}
.list-item:hover {
  background-color: #e9fcf5;
}
.v-list--dense .v-list-item,
.v-list-item--dense {
  min-height: 32px;
}
.word-break {
  word-break: break-all !important;
  /* white-space: pre-line; */
}
.overlay-style {
  border-radius: 50%;
  width: 42px;
  height: 42px;
}
.showPreview {
  display: flex;
}
.temp-msg-bg {
  background: rgb(245, 244, 244) !important;
  border-radius: 4px;
}
.dragFiles {
  background-color: rgb(255, 246, 246) !important;
  background-color: rgba(56, 56, 56, 0.8) !important;
  -webkit-backdrop-filter: transparent(4px);
  backdrop-filter: transparent(4px);
  border: 3px solid #f1f1f1;
  position: absolute;
  z-index: 2;
  height: 100%;
  text-align: center;
}

.drag-files-width {
  width: 100%;
}
/* Overwriting built in class css from tiptap */
/* Placeholder Design of Message Editor */
.editor p.is-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  pointer-events: none;
  color: #d1d1d1;
  height: 0;
}
.text-message pre code,
.editor__content pre code {
  display: block;
  background: #f8f8f8 !important;
}

.text-message pre,
.editor__content pre {
  border-radius: 5px;
  font-size: 1rem;
  overflow-x: auto;
  white-space: pre-wrap;
  background: rgb(248, 248, 248) !important;
  border: solid 1px lightgray;
}

/* Editor List BgColor */
.menubar {
  background: #f5f7fb !important;
}
.ProseMirror {
  min-height: 35px;
  max-height: 150px;
  overflow: scroll;
  cursor: auto;
}
.ProseMirror:focus {
  outline: none;
}
.v-application p {
  margin-bottom: 0px;
}
.ProseMirror p {
  cursor: auto !important;
}
/* ------------------ */
.temp-voice-clip::-webkit-media-controls-play-button,
.temp-voice-clip::-webkit-media-controls-panel {
  background-color: rgb(245, 244, 244);
}
@media (min-width: 1680px) and (max-width: 2600px) {
  .name-width {
    max-width: 145px !important;
  }
}
@media (min-width: 1100px) and (max-width: 1670px) {
  .name-width {
    max-width: 135px !important;
  }
}
@media (min-width: 300px) and (max-width: 1000px) {
  .name-width {
    max-width: 88px !important;
  }
}
</style>
