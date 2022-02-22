<template>
  <div>
    <!-- snackbar -->
    <v-snackbar
      :color="createTaskError ? 'red lighten-5' : 'green lighten-5'"
      light
      top
      right
      v-model="snackbar"
    >
      <span :class="createTaskError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}
      </span>
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar = false"
          small
          fab
        >
          <v-icon :color="createTaskError ? 'red' : 'green'" small>
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <!-- For Extension -->
    <div v-if="extension" class="d-flex flex-column mt-2 justify-center w-100">
      <!-- Timer modes -->
      <div class="mt-2 ml-3 mb-2 d-flex align-center">
        <!-- Timer -->
        <v-btn
          height="35"
          width="182"
          @click="manualTaskFlag = false"
          outlined
          class="d-flex align-center theme-border rounded theme-light-bg py-3"
        >
          <v-icon size="20" class="mr-2">mdi-clock-outline</v-icon>
          <span class="timer-mode-font">Timer mode</span>
        </v-btn>
        <!-- Manual -->
        <v-btn
          :disabled="getActiveTask ? true : false"
          @click="manualTaskFlag = true"
          height="35"
          width="182"
          outlined
          class="d-flex align-center theme-border rounded theme-light-bg ml-2 py-3"
        >
          <v-icon size="20" class="mr-2">mdi-calendar-edit</v-icon>
          <span class="timer-mode-font">Manual mode</span>
        </v-btn>
      </div>
      <!-- Timer Card -->
      <v-card
        width="374px"
        height="55px"
        class="d-flex ml-3 align-center justify-center theme-border"
        outlined
      >
        <Timer class="py-1" v-if="!manualTaskFlag" :extension="true" />
        <div v-else>
          <!-- start/end time input -->
          <div class="d-flex w-100 align-center justify-start">
            <!-- Start Time -->
            <v-menu
              ref="startTimePicker"
              v-model="startTimePicker"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template v-slot:activator="{ on, attrs }">
                <input
                  ref="startTime"
                  v-model="startTime"
                  v-bind="attrs"
                  v-on="on"
                  class="d-inline w-input-time text-h7"
                />
              </template>
              <v-time-picker
                class="timePicker"
                v-if="startTimePicker"
                v-model="startTime"
                type="month"
              ></v-time-picker>
            </v-menu>
            <span class="mr-2">-</span>
            <!-- Stop Time -->
            <v-menu
              ref="stopTimePicker"
              v-model="stopTimePicker"
              :close-on-content-click="false"
              offset-y
              transition="scale-transition"
            >
              <template v-slot:activator="{ on, attrs }">
                <input
                  ref="stopTime"
                  v-model="stopTime"
                  v-bind="attrs"
                  v-on="on"
                  class="d-inline w-input-time text-h7 py-1"
                />
              </template>
              <v-time-picker
                class="timePicker"
                v-if="stopTimePicker"
                v-model="stopTime"
                type="month"
              ></v-time-picker>
            </v-menu>
            <v-spacer></v-spacer>
            <!-- Dates -->
            <!-- manual time selection icon  -->
            <v-tooltip color="#302277" bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-menu
                    :close-on-content-click="false"
                    tile
                    bottom
                    offset-y
                    min-width="366px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-on="on"
                        v-bind="attrs"
                        :disabled="getActiveTask ? true : false"
                        @click="manualTaskFlag = true"
                        small
                        class="theme-border rounded theme-light-bg"
                        outlined
                      >
                        <v-icon :color="manualTaskFlag ? '#2A206A' : '#DCD8F3'"
                          >mdi-calendar-edit</v-icon
                        >
                      </v-btn>
                    </template>
                    <!-- manual time dropdown -->
                    <v-card outlined tile>
                      <v-card-text class="black--text">
                        <!-- start/end date -->
                        <div class="d-flex">
                          <div class="d-flex flex-column">
                            <!-- calendar icon and tooltip -->
                            <v-btn
                              :class="$vuetify.breakpoint.xs ? 'mt-1' : 'my-2'"
                              color="black"
                              light
                              icon
                            >
                              <v-icon>mdi-calendar-outline</v-icon>
                            </v-btn>
                          </div>
                          <!-- start date/ end date label-->
                          <div class="d-flex align-center ml-2">
                            <span
                              :class="
                                $vuetify.breakpoint.xs
                                  ? 'xs-label'
                                  : 'default-label'
                              "
                              class="font-weight-light"
                              >From - To</span
                            >
                            <!-- start date -->
                            <div
                              v-on="on"
                              style="border-radius: 5px; text-align: center"
                              :class="
                                $vuetify.breakpoint.xs
                                  ? 'xs-date-css'
                                  : 'default-date-css'
                              "
                              class="font-weight-light light-purple-bg py-1 px-2 pointer"
                            >
                              {{ today }}
                            </div>
                            <div
                              :style="
                                $vuetify.breakpoint.xs
                                  ? 'width:8px'
                                  : 'width:24px'
                              "
                              class="d-flex justify-center mx-1"
                            >
                              -
                            </div>
                            <!-- end date -->
                            <div
                              v-on="on"
                              style="border-radius: 5px; text-align: center"
                              :class="
                                $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
                                  ? 'xs-date-css'
                                  : 'default-date-css'
                              "
                              class="font-weight-light light-purple-bg py-1 px-2 pointer"
                            >
                              {{ today }}
                            </div>
                          </div>
                        </div>
                        <!-- start/end time -->
                        <div class="d-flex">
                          <!-- clock icon -->
                          <div class="d-flex flex-column pa-2 mr-1">
                            <v-icon color="black">mdi-clock-outline</v-icon>
                          </div>
                          <!-- start date/ end time label-->
                          <div
                            :class="
                              $vuetify.breakpoint.sm || $vuetify.breakpoint.xs
                                ? 'xs-label'
                                : 'default-label'
                            "
                            class="d-flex align-center"
                          >
                            <span class="font-weight-light"
                              >Start - End Time</span
                            >
                          </div>
                          <!-- start/end time input -->
                          <div class="d-flex align-center">
                            <v-menu
                              ref="startTimePicker"
                              v-model="startTimePicker"
                              :close-on-content-click="false"
                              transition="scale-transition"
                              offset-y
                              max-width="290px"
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <input
                                  style="border-radius: 5px"
                                  ref="startTime"
                                  v-model="startTime"
                                  v-bind="attrs"
                                  v-on="on"
                                  class="d-block font-weight-light light-purple-bg"
                                  :class="
                                    $vuetify.breakpoint.xs
                                      ? 'time-style-sm'
                                      : 'time-style'
                                  "
                                />
                              </template>
                              <v-time-picker
                                class="timePicker"
                                v-if="startTimePicker"
                                v-model="startTime"
                                @input="startTimeUpdated"
                                type="month"
                                width="290"
                              ></v-time-picker>
                            </v-menu>
                            <div
                              :style="
                                $vuetify.breakpoint.xs
                                  ? 'width:8px'
                                  : 'width:24px'
                              "
                              class="d-flex justify-center subtitle-2 mx-1"
                            >
                              -
                            </div>
                            <!-- Stop Time -->
                            <v-menu
                              ref="stopTimePicker"
                              v-model="stopTimePicker"
                              :close-on-content-click="false"
                              offset-y
                              transition="scale-transition"
                              max-width="290px"
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <input
                                  style="border-radius: 5px"
                                  ref="stopTime"
                                  v-model="stopTime"
                                  v-bind="attrs"
                                  v-on="on"
                                  :class="
                                    $vuetify.breakpoint.sm ||
                                    $vuetify.breakpoint.xs
                                      ? 'time-style-sm'
                                      : 'time-style'
                                  "
                                  class="d-block light-purple-bg font-weight-light"
                                />
                              </template>
                              <v-time-picker
                                class="timePicker"
                                v-if="stopTimePicker"
                                v-model="stopTime"
                                @input="stopTimeUpdated"
                                type="month"
                                width="290"
                              ></v-time-picker>
                            </v-menu>
                          </div>
                        </div>
                        <!-- Range slider -->
                        <v-range-slider
                          hide-details
                          v-model="manualEntryRange"
                          @end="calculateInterval"
                          :max="1440"
                          :step="1"
                          :min="0"
                          color="#1CC283"
                          track-color="#E6E6E6"
                          track-fill-color="#9185E0"
                        >
                        </v-range-slider>
                        <RangeSliderLabels />
                        <div class="d-flex mt-2 align-center">
                          <v-spacer></v-spacer>
                          <v-btn
                            @click="addTask()"
                            small
                            class="btn-success white--text"
                            >ADD</v-btn
                          >
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </div>
              </template>
              <span>{{
                today.slice(8) +
                  today.slice(4, 7) +
                  "  to  " +
                  today.slice(8) +
                  today.slice(4, 7)
              }}</span>
            </v-tooltip>
            <v-divider class="mx-3" vertical></v-divider>
            <Timer :extension="true" />
          </div>
        </div>
      </v-card>
      <!-- Task Title -->
      <div>
        <v-textarea
          class="my-2 ml-3 mr-10 theme-border"
          hide-details
          solo
          height="130"
          v-model="taskTitle"
          flat
          placeholder="What are you working on"
          @keydown.enter="
            !manualTaskFlag
              ? getActiveTask
                ? changeTitle(getActiveTask)
                : getSelectedCompany.role == 'employee'
                ? (openProjectList = true)
                : (openMemberList = true)
              : (openProjectList = true)
          "
          @keydown.tab="
            getSelectedCompany.role != 'employee'
              ? (openMemberList = true)
              : (openProjectList = true)
          "
          :disabled="
            getActiveTask
              ? getActiveTask.assigned_by.id != getLoggedInUser.id &&
                getSelectedCompany.role == 'employee'
                ? true
                : false
              : false
          "
        ></v-textarea>
      </div>
      <!-- Members list -->
      <MembersList
        :extension="true"
        v-if="
          getSelectedCompany.permissions
            ? getSelectedCompany.permissions.team_member
            : true
        "
        :open="openMemberList"
        :clearMembers="!taskMembers.length"
        @assignedMembers="assignMembers"
        @dropdownClosed="openMemberList = false"
        @membersDone="openProjectList = true"
      />
      <!-- Project Name -->
      <ProjectList
        :extension="true"
        :open="openProjectList"
        @assignProject="assignProject"
        @dropdownClosed="openProjectList = false"
        @projectDone="focusStart"
      />
      <!-- Start/Stop Button -->
      <v-btn
        v-if="!manualTaskFlag"
        :disabled="
          getQueue.length || (getActiveTask && !getOnlineStatus) ? true : false
        "
        class="pointer white--text ml-3"
        :class="
          getActiveTask
            ? 'stop-btn'
            : (getSelectedCompany.role == 'owner' ||
                (getSelectedCompany.role == 'admin' &&
                  getSelectedCompany.permissions.team_member)) &&
              taskMembers.length == 0
            ? 'assign-btn'
            : taskMembers.length > 0 &&
              !taskMembers.find((item) => {
                return item.id == getLoggedInUser.id;
              })
            ? 'assign-btn'
            : 'theme-filled-btn'
        "
        width="374px"
        height="42px"
        id="start-stop-assign"
        @click="
          getActiveTask
            ? getOnlineStatus
              ? stopTask()
              : () => {}
            : taskMembers.length > 0 &&
              !taskMembers.find((item) => {
                return item.id == getLoggedInUser.id;
              })
            ? assignTask()
            : startTask()
        "
        text
      >
        <label>
          {{
            getActiveTask
              ? "Stop"
              : (getSelectedCompany.role == "owner" ||
                  (getSelectedCompany.role == "admin" &&
                    getSelectedCompany.permissions.team_member)) &&
                taskMembers.length == 0
              ? "Assign"
              : taskMembers.length > 0 &&
                !taskMembers.find((item) => {
                  return item.id == getLoggedInUser.id;
                })
              ? "Assign"
              : "Start"
          }}
        </label>
      </v-btn>

      <!-- Add Manual Button -->
      <v-btn
        v-if="manualTaskFlag"
        @click="addTask()"
        depressed
        class="btn-success mx-3 white--text"
        width="374px"
        height="42px"
      >
        Add
      </v-btn>
      <!-- Discard button -->
      <v-btn
        v-if="getActiveTask"
        text
        elevation="0"
        class="ml-3 mt-2"
        solo
        width="374px"
        height="42px"
        @click="discard"
      >
        Discard
      </v-btn>
    </div>
    <!-- For Web -->
    <div
      v-else
      :class="
        $vuetify.breakpoint.md
          ? 'table-width-2'
          : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
          ? 'table-width-3'
          : getSidebarMini
          ? 'table-width-4'
          : 'table-width'
      "
    >
      <v-card
        class="d-flex align-center"
        elevation="0"
        :class="
          $vuetify.breakpoint.xs
            ? getActiveTask
              ? 'mx-2 mt-7 pt-0'
              : getQueue.length
              ? 'mx-2 mt-2 pt-0'
              : 'mx-2 mt-7 pt-0'
            : 'ml-6 d-flex mt-6'
        "
      >
        <v-card-text class="pa-1">
          <!-- manual/auto timer buttons -->
          <div class="d-flex">
            <div class="d-flex align-center">
              <!-- toggle buttons -->
              <div class="d-flex align-center justify-center flex-column mr-1">
                <!-- clock icon-->
                <v-tooltip color="#302277" top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="getActiveTask == true"
                      v-on="on"
                      @click="
                        manualTaskFlag = false;
                        taskMembers.length = 0;
                      "
                      small
                      class="theme-border rounded theme-light-bg mb-1"
                      outlined
                    >
                      <v-icon :color="!manualTaskFlag ? '#2A206A' : '#DCD8F3'"
                        >mdi-clock-outline</v-icon
                      >
                    </v-btn>
                  </template>
                  <span>Timer</span>
                </v-tooltip>
                <!-- manual time selection icon  -->
                <v-tooltip color="#302277" bottom>
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <v-menu
                        :close-on-content-click="false"
                        tile
                        bottom
                        offset-y
                        min-width="300px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-on="on"
                            v-bind="attrs"
                            :disabled="getActiveTask ? true : false"
                            @click="manualTaskFlag = true"
                            small
                            class="theme-border rounded theme-light-bg"
                            outlined
                          >
                            <v-icon
                              :color="manualTaskFlag ? '#2A206A' : '#DCD8F3'"
                              >mdi-calendar-edit</v-icon
                            >
                          </v-btn>
                        </template>
                        <!-- manual time dropdown -->
                        <v-card outlined tile>
                          <v-card-text class="black--text">
                            <!-- start/end date -->
                            <div class="d-flex">
                              <div class="d-flex flex-column">
                                <!-- calendar icon and tooltip -->
                                <v-btn
                                  :class="
                                    $vuetify.breakpoint.xs ? 'mt-1' : 'my-2'
                                  "
                                  color="black"
                                  light
                                  icon
                                >
                                  <v-icon>mdi-calendar-outline</v-icon>
                                </v-btn>
                              </div>
                              <!-- start date/ end date label-->
                              <div class="d-flex align-center ml-2">
                                <span
                                  :class="
                                    $vuetify.breakpoint.sm ||
                                    $vuetify.breakpoint.xs
                                      ? 'xs-label'
                                      : 'default-label'
                                  "
                                  class="font-weight-light"
                                  >From - To</span
                                >
                                <!-- start date -->
                                <div
                                  v-on="on"
                                  style="border-radius: 5px; text-align: center"
                                  :class="
                                    $vuetify.breakpoint.sm ||
                                    $vuetify.breakpoint.xs
                                      ? 'xs-date-css'
                                      : 'default-date-css'
                                  "
                                  class="font-weight-light light-purple-bg py-1 px-2 pointer"
                                >
                                  {{ today }}
                                </div>
                                <div
                                  :style="
                                    $vuetify.breakpoint.xs
                                      ? 'width:8px'
                                      : 'width:24px'
                                  "
                                  class="d-flex justify-center mx-1"
                                >
                                  -
                                </div>
                                <!-- end date -->
                                <div
                                  v-on="on"
                                  style="border-radius: 5px; text-align: center"
                                  :class="
                                    $vuetify.breakpoint.sm ||
                                    $vuetify.breakpoint.xs
                                      ? 'xs-date-css'
                                      : 'default-date-css'
                                  "
                                  class="font-weight-light light-purple-bg py-1 px-2 pointer"
                                >
                                  {{ today }}
                                </div>
                              </div>
                            </div>
                            <!-- start/end time -->
                            <div class="d-flex">
                              <!-- clock icon -->
                              <div class="d-flex flex-column pa-2 mr-1">
                                <v-icon color="black">mdi-clock-outline</v-icon>
                              </div>
                              <!-- start date/ end time label-->
                              <div
                                :class="
                                  $vuetify.breakpoint.sm ||
                                  $vuetify.breakpoint.xs
                                    ? 'xs-label'
                                    : 'default-label'
                                "
                                class="d-flex align-center"
                              >
                                <span class="font-weight-light"
                                  >Start - End Time</span
                                >
                              </div>
                              <!-- start/end time input -->
                              <div class="d-flex align-center">
                                <v-menu
                                  ref="startTimePicker"
                                  v-model="startTimePicker"
                                  :close-on-content-click="false"
                                  transition="scale-transition"
                                  offset-y
                                  max-width="290px"
                                  min-width="290px"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <input
                                      style="border-radius: 5px"
                                      ref="startTime"
                                      v-model="startTime"
                                      v-bind="attrs"
                                      v-on="on"
                                      class="d-block font-weight-light light-purple-bg"
                                      :class="
                                        $vuetify.breakpoint.sm ||
                                        $vuetify.breakpoint.xs
                                          ? 'time-style-sm'
                                          : 'time-style'
                                      "
                                    />
                                  </template>
                                  <v-time-picker
                                    class="timePicker"
                                    v-if="startTimePicker"
                                    v-model="startTime"
                                    @input="startTimeUpdated"
                                    type="month"
                                    width="290"
                                  ></v-time-picker>
                                </v-menu>
                                <div
                                  :style="
                                    $vuetify.breakpoint.xs
                                      ? 'width:8px'
                                      : 'width:24px'
                                  "
                                  class="d-flex justify-center subtitle-2 mx-1"
                                >
                                  -
                                </div>
                                <!-- Stop Time -->
                                <v-menu
                                  ref="stopTimePicker"
                                  v-model="stopTimePicker"
                                  :close-on-content-click="false"
                                  offset-y
                                  transition="scale-transition"
                                  max-width="290px"
                                  min-width="290px"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <input
                                      style="border-radius: 5px"
                                      ref="stopTime"
                                      v-model="stopTime"
                                      v-bind="attrs"
                                      v-on="on"
                                      :class="
                                        $vuetify.breakpoint.sm ||
                                        $vuetify.breakpoint.xs
                                          ? 'time-style-sm'
                                          : 'time-style'
                                      "
                                      class="d-block light-purple-bg font-weight-light"
                                    />
                                  </template>
                                  <v-time-picker
                                    class="timePicker"
                                    v-if="stopTimePicker"
                                    v-model="stopTime"
                                    @input="stopTimeUpdated"
                                    type="month"
                                    width="290"
                                  ></v-time-picker>
                                </v-menu>
                              </div>
                            </div>
                            <!-- Range slider -->
                            <v-range-slider
                              hide-details
                              v-model="manualEntryRange"
                              @end="calculateInterval"
                              :max="1440"
                              :step="1"
                              :min="0"
                              color="#1CC283"
                              track-color="#E6E6E6"
                              track-fill-color="#9185E0"
                            >
                            </v-range-slider>
                            <RangeSliderLabels />
                          </v-card-text>
                        </v-card>
                      </v-menu>
                    </div>
                  </template>
                  <span>Manual Timer</span>
                </v-tooltip>
              </div>
            </div>
            <div
              :class="[
                { 'flex-column': $mq == 'xs' || $vuetify.breakpoint.xs },

                $vuetify.breakpoint.md
                  ? 'table-width-2'
                  : $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                  ? 'table-width-3'
                  : getSidebarMini
                  ? 'table-width-5'
                  : 'table-width',
              ]"
              class="d-flex pa-1 theme-border rounded"
            >
              <!-- Add Task Title Input Field  -->
              <v-text-field
                autocomplete="off"
                ref="newtask"
                id="task-title"
                hide-details
                dense
                color="#DCD8F3"
                v-model="taskTitle"
                placeholder="Add Task Title"
                solo
                flat
                class="pa-0 pt-1 custom-placeholer-color"
                @keydown.enter="
                  !manualTaskFlag
                    ? getActiveTask
                      ? changeTitle(getActiveTask)
                      : getSelectedCompany.role == 'employee'
                      ? (openProjectList = true)
                      : (openMemberList = true)
                    : (openProjectList = true)
                "
                @keydown.tab="
                  getSelectedCompany.role != 'employee'
                    ? (openMemberList = true)
                    : (openProjectList = true)
                "
                :disabled="
                  getActiveTask
                    ? getActiveTask.assigned_by.id != getLoggedInUser.id &&
                      getSelectedCompany.role == 'employee'
                      ? true
                      : false
                    : false
                "
              >
              </v-text-field>
              <v-divider
                v-if="$vuetify.breakpoint.xs || $mq == 'xs'"
              ></v-divider>
              <div class="d-flex align-center justify-end">
                <!-- Member List component -->
                <div
                  class=""
                  v-if="!manualTaskFlag"
                  :class="
                    $vuetify.breakpoint.xs
                      ? ''
                      : getActiveTask
                      ? ''
                      : 'd-inline-flex'
                  "
                >
                  <MembersList
                    v-if="
                      getSelectedCompany.permissions
                        ? getSelectedCompany.permissions.team_member
                        : true
                    "
                    :open="openMemberList"
                    :clearMembers="!taskMembers.length"
                    @assignedMembers="assignMembers"
                    @dropdownClosed="openMemberList = false"
                    @membersDone="openProjectList = true"
                  />
                </div>
                <!-- Disabled Me btn -->
                <v-btn
                  v-if="getSelectedCompany.role == 'owner' && manualTaskFlag"
                  tile
                  disabled
                  :max-width="$vuetify.breakpoint.xs ? '16px' : '120px'"
                  :class="
                    $vuetify.breakpoint.xs ? 'caption mx-2' : 'px-10 mx-2'
                  "
                  class="theme-outlined-btn text-capitalize text-truncate"
                >
                  me
                </v-btn>
                <!-- ProjectList -->
                <div
                  class="vertical-dotted-border"
                  v-if="getSelectedCompany.role != 'employee'"
                ></div>
                <div
                  class="mx-1"
                  :class="
                    $vuetify.breakpoint.xs
                      ? 'mr-1'
                      : getActiveTask
                      ? ''
                      : 'd-inline-flex'
                  "
                >
                  <ProjectList
                    :open="openProjectList"
                    @assignProject="assignProject"
                    @dropdownClosed="openProjectList = false"
                    @projectDone="focusStart"
                  />
                </div>
                <div class="mr-1 vertical-dotted-border"></div>
                <div class="d-inline-flex mx-2 ma-0" v-if="!manualTaskFlag">
                  <Timer />
                </div>
                <div class="d-inline-flex mx-2 ma-0" v-else>
                  <b
                    :class="
                      $mq == 'phone' || $mq == 'extraSmallPhones'
                        ? 'smallScreen-timer-font'
                        : 'timer-font'
                    "
                  >
                    <p
                      :class="
                        $vuetify.breakpoint.xs || $vuetify.breakpoint.sm
                          ? 'mt-4'
                          : 'mt-3'
                      "
                    >
                      {{ manualDuration ? manualDuration : "00:00:00" }}
                    </p>
                  </b>
                </div>
                <!-- Add task button for manual time -->
                <v-btn
                  :style="$vuetify.breakpoint.xs ? '' : 'width:96px'"
                  v-if="manualTaskFlag"
                  @click="addTask()"
                  :x-small="$mq == 'extraSmallPhones'"
                  :small="$mq == 'phone'"
                  depressed
                  class="btn-success mx-2 white--text"
                  id="add-manual"
                >
                  <span>Add</span>
                </v-btn>
                <!-- Start/Stop Button -->
                <v-btn
                  v-else
                  :x-small="$mq == 'extraSmallPhones'"
                  :small="$mq == 'phone'"
                  :disabled="
                    getQueue.length || (getActiveTask && !getOnlineStatus)
                      ? true
                      : false
                  "
                  class="pointer white--text"
                  id="start-stop-assign"
                  @click="
                    getActiveTask
                      ? getOnlineStatus
                        ? stopTask()
                        : () => {}
                      : taskMembers.length > 0 &&
                        !taskMembers.find((item) => {
                          return item.id == getLoggedInUser.id;
                        })
                      ? assignTask()
                      : startTask()
                  "
                  :class="[
                    { 'mx-2': !$vuetify.breakpoint.xs },
                    {
                      'mt-1': $vuetify.breakpoint.xs || $vuetify.breakpoint.sm,
                    },
                    getQueue.length || (getActiveTask && !getOnlineStatus)
                      ? 'grey-btn'
                      : getActiveTask
                      ? 'stop-btn'
                      : (getSelectedCompany.role == 'owner' ||
                          (getSelectedCompany.role == 'admin' &&
                            getSelectedCompany.permissions.team_member)) &&
                        taskMembers.length == 0
                      ? 'assign-btn'
                      : taskMembers.length > 0 &&
                        !taskMembers.find((item) => {
                          return item.id == getLoggedInUser.id;
                        })
                      ? 'assign-btn'
                      : 'theme-filled-btn',
                  ]"
                  text
                >
                  <label>
                    {{
                      getActiveTask
                        ? "Stop"
                        : (getSelectedCompany.role == "owner" ||
                            (getSelectedCompany.role == "admin" &&
                              getSelectedCompany.permissions.team_member)) &&
                          taskMembers.length == 0
                        ? "Assign"
                        : taskMembers.length > 0 &&
                          !taskMembers.find((item) => {
                            return item.id == getLoggedInUser.id;
                          })
                        ? "Assign"
                        : "Start"
                    }}
                  </label>
                </v-btn>
                <!-- Cancel Icon-->
                <v-tooltip v-if="getActiveTask" bottom color="#302277">
                  <!-- tooltip template -->
                  <template v-slot:activator="{ on }">
                    <v-menu
                      v-on="on"
                      v-model="discardTaskMenu"
                      :close-on-content-click="false"
                      :nudge-width="200"
                      offset-y
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          :class="$vuetify.breakpoint.xs ? 'my-2' : 'my-1 mx-1'"
                          :disabled="!getOnlineStatus"
                          icon
                          x-small
                          grey
                          v-bind="attrs"
                          v-on="on"
                        >
                          <v-icon small>mdi-close</v-icon>
                        </v-btn>
                      </template>
                      <!-- discard task confirmation dialog -->
                      <v-card height="88">
                        <v-card-text>
                          <span>Are you sure?</span>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            class="highlight"
                            outlined
                            tile
                            x-small
                            @click="discardTaskMenu = false"
                          >
                            Cancel
                          </v-btn>
                          <v-btn
                            @click="discard"
                            x-small
                            class="btn-success darken-1 white--text"
                            tile
                          >
                            Discard
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-menu>
                  </template>
                  <span>Cancel</span>
                </v-tooltip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Task Conflict Dialog -->
      <TaskConflict
        :currentTask.sync="running"
        :conflicts.sync="conflicts"
        :openTaskConflictDialog.sync="openTaskConflictDialog"
      />
    </div>
  </div>
</template>

<script>
import ProjectList from "../Projects/ProjectList";
import Timer from "@/components/Tasks/Timer";
import RangeSliderLabels from "./RangeSliderLabels";
import TaskConflict from "@/components/Tasks/TaskConflict/SelectionModal";
import MembersList from "../TeamMembers/MembersList";
import moment from "moment";
import { eventBus } from "@/main";
import { mapGetters } from "vuex";
import requestQueue from "@/services/requestQueue";
import timer from "@/timer.js";

export default {
  name: "StartTask",
  components: {
    ProjectList,
    Timer,
    MembersList,
    TaskConflict,
    RangeSliderLabels,
  },
  props: ["stop", "extension"],
  data() {
    return {
      manualEntryRange: [
        moment
          .duration(
            moment()
              .subtract(1, "hour")
              .diff(moment("00:00:00", "HH:mm:ss"))
          )
          .asMinutes(),
        moment
          .duration(moment().diff(moment("00:00:00", "HH:mm:ss")))
          .asMinutes(),
      ],
      manualTaskFlag: false,
      openMemberList: false,
      openProjectList: false,
      discardTaskMenu: false,
      snackbarMessage: null,
      taskMembers: [],
      conflicts: [],
      running: null,
      openTaskConflictDialog: false,
      taskTitle: "",
      menu: false,
      today: moment().format("YYYY-MM-DD"),
      startTime: moment()
        .subtract(1, "hour")
        .format("HH:mm"),
      stopTime: moment().format("HH:mm"),
      createTaskError: null,
      snackbar: false,
      pending: false, // pending API request
      startTimePicker: false,
      stopTimePicker: false,
      manualDuration: null,
    };
  },
  computed: {
    ...mapGetters([
      "getActiveTask",
      "getSelectedCompany",
      "getSelectedProject",
      "getLoggedInUser",
      "getActiveTimeEntry",
      "getQueue",
      "getOnlineStatus",
      "getSidebarMini",
    ]),
  },

  methods: {
    // Calculates manual duration when start/stop time/date is changed
    calculateManualDuration() {
      let startMoment = moment(
        `${this.today} ${this.startTime}`,
        "YYYY-MM-DD HH:mm"
      );
      let stopMoment = moment(
        `${this.today} ${this.stopTime}`,
        "YYYY-MM-DD HH:mm"
      );
      return timer.format(
        moment.duration(stopMoment.diff(startMoment)).asSeconds()
      );
    },
    // Update range slider when start time of manual task is updated by timepicker
    startTimeUpdated(value) {
      if (value > this.stopTime) {
        this.startTime = `${Math.floor(this.manualEntryRange[0] / 60)}:${this
          .manualEntryRange[0] % 60}`;
        return;
      }
      if (value && value[0] != ":" && this.stopTime) {
        let start = moment(`${this.today} ${value}`, "YYYY-MM-DD HH:mm");
        let stop = moment(`${this.today} ${this.stopTime}`, "YYYY-MM-DD HH:mm");
        this.manualDuration = timer.format(
          moment.duration(stop.diff(start)).asSeconds()
        );
        this.manualEntryRange = [
          moment
            .duration(
              moment(value, "HH:mm:ss").diff(moment("00:00:00", "HH:mm:ss"))
            )
            .asMinutes(),
          this.manualEntryRange[1],
        ];
      }
    },
    // Update range slider when start time of manual task is updated by timepicker
    stopTimeUpdated(value) {
      if (value < this.startTime) {
        this.stopTime = `${Math.floor(this.manualEntryRange[1] / 60)}:${this
          .manualEntryRange[1] % 60}`;
        return;
      }
      if (value && value[0] != ":" && this.startTime) {
        let stop = moment(`${this.today} ${value}`, "YYYY-MM-DD HH:mm");
        let start = moment(
          `${this.today} ${this.startTime}`,
          "YYYY-MM-DD HH:mm"
        );
        this.manualDuration = timer.format(
          moment.duration(stop.diff(start)).asSeconds()
        );
        this.manualEntryRange = [
          this.manualEntryRange[0],
          moment
            .duration(
              moment(value, "HH:mm:ss").diff(moment("00:00:00", "HH:mm:ss"))
            )
            .asMinutes(),
        ];
      }
    },
    calculateInterval(range) {
      let startHours, startMinutes, endHours, endMinutes;
      startHours = Math.floor(range[0] / 60);
      startMinutes = range[0] % 60;
      endHours = Math.floor(range[1] / 60);
      endMinutes = range[1] % 60;
      startMinutes < 10 ? (startMinutes = "0" + startMinutes) : () => {};
      endMinutes < 10 ? (endMinutes = "0" + endMinutes) : () => {};
      this.startTime = `${startHours}:${startMinutes}`;
      this.stopTime = `${endHours}:${endMinutes}`;
      this.manualDuration = this.calculateManualDuration();
    },
    // Updates title if title is changed from list
    updateTitle(title) {
      this.taskTitle = title;
    },
    // focuses start button
    focusStart() {
      if (document.getElementById("start-stop-assign")) {
        if (
          !this.taskMembers.length ||
          this.taskMembers.find((item) => {
            return item.id == this.getLoggedInUser.id;
          })
        ) {
          return this.startTask();
        } else return this.assignTask();
      } else if (document.getElementById("add-manual")) return this.addTask();
    },
    assignMembers(members) {
      this.taskMembers = members;
    },

    // Checks for conflicts and opens dialog
    checkConflicts(error) {
      if (error.response.status == 423) {
        if (error.response.data.data) {
          this.openTaskConflictDialog = true;
          this.conflicts = error.response.data.data;
          return true;
        } else if (error.response.data.error_msg) {
          this.snackbar = true;
          this.createTaskError = true;
          this.snackbarMessage = error.response.data.error_msg;
        }
      }
      if (error.response.status == 422) {
        this.snackbar = true;
        this.createTaskError = true;
        if (error.response.data.errors.title) {
          this.snackbarMessage = error.response.data.errors.title[0];
        } else if (error.response.data.errors.end_time) {
          this.snackbarMessage = error.response.data.errors.end_time[0];
        } else if (error.response.data.errors.start_time) {
          this.snackbarMessage = error.response.data.errors.start_time[0];
        }
      }
      return false;
    },

    validateTitle() {
      let title = this.taskTitle;
      if (!title) {
        // to enable snackbar
        this.snackbar = true;
        // determine background color of snackbar
        this.createTaskError = true;
        // embeds snackbar message
        this.snackbarMessage = "Title is Required";
        return false;
      }
      if (title.length < 2) {
        this.snackbar = true;
        this.createTaskError = true;
        this.snackbarMessage = "Title must be at least two characters long";
        return false;
      }
      if (title.length > 255) {
        this.snackbar = true;
        this.createTaskError = true;
        this.snackbarMessage = "Title must not exceed 50 characters";
        return false;
      }
      return true;
    },

    // Validate start and end times for manual entry
    validateTimeEntries() {
      var start = moment(
        `${this.today ? this.today : this.today} ${this.startTime}:00`,
        "YYYY-MM-DD HH:mm:ss"
      );
      var stop = moment(
        `${this.today ? this.today : this.today} ${this.stopTime}:00`,
        "YYYY-MM-DD HH:mm:ss"
      );

      return {
        start,
        stop,
        duration: moment.duration(stop.diff(start)).asSeconds(),
      };
    },

    // Add manual time
    addTask() {
      if (this.pending) return;
      this.pending = "manual";
      let times = this.validateTimeEntries();
      let title = this.taskTitle;
      if (!title) {
        this.snackbar = true;
        this.createTaskError = true;
        this.snackbarMessage = "Title is Required";
        return (this.pending = false);
      }
      let body = {
        title,
        members: [this.getLoggedInUser.id],
        start_time: times.start.format("YYYY-MM-DD HH:mm:ss"),
        end_time: times.stop.format("YYYY-MM-DD HH:mm:ss"),
        project_id: this.getSelectedProject ? this.getSelectedProject.id : null,
        company_id: this.getSelectedCompany.id,
        self_assigned: true,
        due_date: "",
        duration: times.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      if (title != "") {
        this.$store.commit("resetTaskFilters");
        this.$store
          .dispatch("createTask", body)
          .then(() => {
            this.pending = false;
            this.taskTitle = "";
            // when no error messages
            this.snackbar = true;
            this.createTaskError = false;
            this.snackbarMessage = "Task Added successfully";
          })
          .catch((error) => {
            // conflict
            this.running = {
              title,
              start_time: body.start_time,
              end_time: body.end_time,
            };

            // Open conflicts dialog
            if (error)
              if (this.checkConflicts(error)) {
                return (this.pending = false);
              }
            this.pending = false;
          });
        this.manualTaskFlag = false;
        this.manualDuration = null;
      }
    },

    // Creates task request payload
    createTask() {
      !this.taskMembers.length
        ? this.taskMembers.push(this.getLoggedInUser)
        : () => {};
      let title = this.taskTitle;
      return {
        company_id: this.getSelectedCompany.id,
        project_id: this.getSelectedProject ? this.getSelectedProject.id : null,
        title,
        due_date: "",
        members: this.taskMembers.map((item) => {
          return item.id;
        }),
        end_time: "",
        duration: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        self_assigned: this.taskMembers.find((item) => {
          return item.id == this.getLoggedInUser.id;
        })
          ? true
          : false,
      };
    },

    // Create and play task
    startTask() {
      if (this.pending) return;
      if (this.taskMembers.length > 1 && !this.taskTitle) {
        this.snackbar = true;
        this.createTaskError = true;
        this.snackbarMessage = "Cannot assign task without title";
        return;
      }
      this.pending = "start";
      let newTask = this.createTask();
      newTask.start_time = moment().format("YYYY-MM-DD HH:mm:ss");
      this.$store.commit("resetTaskFilters");
      this.$store
        .dispatch("createTask", newTask)
        .then((res) => {
          this.$store.commit("setActiveTask", res.data);
          this.$store.dispatch("retryCommentsQueue", res.data.task_id);
          this.taskMembers = [];
          this.pending = false;
          this.clearSelection = true;
          this.snackbar = true;
          this.createTaskError = false;
          this.snackbarMessage = res.error_msg;
        })
        .catch((error) => {
          // conflict
          this.running = {
            title: newTask.title,
            start_time: newTask.start_time,
          };
          // Open conflicts dialog
          if (this.checkConflicts(error)) {
            return (this.pending = false);
          }
          this.taskTitle = "";
          this.pending = false;
        });
      newTask.members.length > 1
        ? eventBus.$emit("newTaskAssigned", true)
        : () => {};
    },

    // Create and assign task
    assignTask() {
      if (this.pending) return;
      if (this.validateTitle()) {
        this.pending = "assign";
        let newTask = this.createTask();
        newTask.start_time = "";
        this.$store.commit("resetTaskFilters");
        this.$store
          .dispatch("createTask", newTask)
          .then((res) => {
            this.$store.dispatch("retryCommentsQueue", res.data.task_id);
            this.taskMembers = [];
            this.pending = false;
            this.$store.commit("setSelectedProject", null);
            this.taskTitle = "";
          })
          .catch((err) => {
            console.log(err);
            this.$store.commit("setSelectedProject", null);
            this.pending = false;
          });
        eventBus.$emit("newTaskAssigned", true);
      }
    },

    //Stop the running task
    stopTask() {
      if (this.pending) return;
      this.pending = "stop";
      this.$emit("stopAttempt");
      if (this.validateTitle()) {
        this.changeTitle(this.getActiveTask).then(() => {
          this.$store
            .dispatch("stopTask")
            .then(() => {
              this.pending = false;
              this.taskMembers = [];
              this.taskTitle = "";
            })
            .catch((error) => {
              this.taskTitle = "";
              // conflict
              this.running = {
                title: this.getActiveTask.title,
                end_time: moment().format("YYYY-MM-DD HH:mm:ss"),
              };
              // Open conflicts dialog
              if (error) {
                if (this.checkConflicts(error)) {
                  return (this.pending = false);
                }
                if (
                  error.response.data.message ==
                  "Trying to access array offset on value of type null"
                ) {
                  this.$store.commit("setActiveTask", null);
                  this.$store.commit("resetTimer");
                  this.$store.dispatch("fetchTasks");
                }
              }
              this.pending = false;
            });
        });
      } else {
        this.pending = false;
      }
    },

    // Assign project to running task
    assignProject(project) {
      let body = {
        project_id: project ? project.id : null,
        company_id: this.getSelectedCompany.id,
        task_id: this.getActiveTask.task_id,
      };
      this.$store.dispatch("updateTask", body);
    },

    // Change title of running task
    changeTitle(task) {
      let title = this.taskTitle;
      if (title != "" && title != task.title) {
        return new Promise((resolve) => {
          this.$store
            .dispatch("updateTask", {
              company_id: this.getSelectedCompany.id,
              project_id: this.getActiveTask
                ? this.getActiveTask.project
                  ? this.getActiveTask.project.id
                  : null
                : null,
              task_id: task.task_id,
              title,
            })
            .then(() => {
              resolve(true);
            });
        });
      } else
        return new Promise((resolve) => {
          resolve();
        });
    },

    // retries pending requests
    retry(value) {
      if (value) {
        if (this.pending) {
          if (this.pending == "start") {
            this.pending = false;
            this.startTask();
          } else if (this.pending == "stop") {
            this.pending = false;
            this.stopTask();
          } else if (this.pending == "manual") {
            this.pending = false;
            this.addTask();
          }
        }
      }
      this.pending = false;
      this.taskTitle = "";
      this.openTaskConflictDialog = false;
    },

    // discard time for running task
    discard() {
      // to close the dropdown menu until 'x' icon is clicked again
      this.discardTaskMenu = false;
      if (this.pending) return;
      this.pending = "discard";
      this.$store
        .dispatch("discardTask", {
          company_id: this.getSelectedCompany.id,
          time_entries: [this.getActiveTimeEntry.entry_id],
        })
        .then(() => {
          this.pending = false;
          this.taskTitle = "";
          this.$store.commit("setActiveTask", null);
        })
        .catch((err) => {
          console.log(err);
          this.$store.commit("setActiveTask", null);
          this.$store.commit("resetTimer");
          this.pending = false;
        });
    },
  },

  mounted() {
    // Fetch and update user roles
    this.$store
      .dispatch("fetchUserDetails", {
        user_id: this.getLoggedInUser.id,
        company_id: this.getSelectedCompany.id,
      })
      .then((res) => {
        if (!res.data.data.role && !res.data.data.team_members) {
          this.$store.commit("setMyRole", {
            company: this.getSelectedCompany,
            role: "admin",
            permissions: res.data.data,
          });
        } else if (res.data.data.team_members) {
          this.$store.commit("setMyRole", {
            company: this.getSelectedCompany,
            role: "team-manager",
            permissions: null,
          });
        } else if (res.data.data.role == "owner") {
          this.$store.commit("setMyRole", {
            company: this.getSelectedCompany,
            role: "owner",
            permissions: null,
          });
        } else {
          this.$store.commit("setMyRole", {
            company: this.getSelectedCompany,
            role: "employee",
            permissions: null,
          });
        }
      });
    // listen for online
    window.ononline = () => {
      //start queue
      if (
        (localStorage.getItem("token") || localStorage.getItem("user")) &&
        this.getQueue.length
      ) {
        requestQueue.startQueue().catch((error) => {
          // conflict
          this.running = {
            title: error.body ? error.body.title : "",
            start_time: error.body.start_time,
          };
          if (error.err)
            if (this.checkConflicts(error.err)) {
              return (this.pending = false);
            }
        });
      }
    };

    eventBus.$on("retry", this.retry);
    if (this.getActiveTask) {
      this.taskTitle = this.getActiveTask.title;
    }
    eventBus.$on("titleUpdated", this.updateTitle);
  },

  beforeDestroy() {
    eventBus.$off("retry");
  },

  watch: {
    // Signal from list to stop task
    stop(value) {
      value ? this.stopTask() : () => {};
    },

    getActiveTask(value) {
      if (value) {
        this.manualTaskFlag = false;
        this.taskTitle = value.title;
      }
    },

    openProjectList(value) {
      if (value) this.openMemberList = false;
    },
  },
};
</script>
<style scoped>
.v-text-field--outlined >>> fieldset {
  border-color: #dcd8f3;
}
/* light purple background color */
.theme-light-bg {
  background-color: rgba(237, 235, 249, 0.4);
}
.custom-placeholer-color input::placeholder {
  color: red !important;
  opacity: 1;
}
.border {
  border: 1px solid rgb(201, 196, 196);
  border-radius: 5;
}
.xs-font {
  padding-top: 3px;
  font-size: 0.66rem;
}
.stop-btn {
  color: white;
  background-color: #d52a5d;
}
.grey-btn {
  color: white;
  background-color: #e6adbe;
}
.assign-btn {
  color: #ffffff;
  background-color: #6c5cd6;
}
.xs-label {
  font-size: 10px;
  width: 60px;
}
.default-label {
  font-size: 16px;
  width: 124px;
}
.xs-date-css {
  font-size: 10px;
  width: 80px;
}
.default-date-css {
  width: 108px;
}
</style>
<style>
.v-application .primary {
  background-color: #2a206a !important;
  border-color: #2a206a !important;
}
.v-application .accent {
  background-color: #2a206a !important;
  border-color: #2a206a !important;
}
.date-style {
  height: 24px !important;
  width: 106px;
  text-align: center;
}
.time-style {
  height: 28px !important;
  width: 88px;
  text-align: center;
}
.time-style-sm {
  height: 24px !important;
  width: 48px;
  font-size: 10px;
  text-align: center;
}
.timePicker .v-picker__title {
  height: 50px !important;
  font-size: smaller !important;
}
.timePicker .v-time-picker-title__time .v-picker__title__btn,
.v-time-picker-title__time span {
  height: 25px;
  font-size: 40px;
}
input[type="time"]::-webkit-calendar-picker-indicator {
  background: none;
  display: none;
}
.timer-font {
  font-size: 16px;
  color: #2a206a;
}
.smallScreen-timer-font {
  font-size: 10px !important;
  color: #2a206a;
}
.w-input-time {
  width: 50px !important;
}
</style>
