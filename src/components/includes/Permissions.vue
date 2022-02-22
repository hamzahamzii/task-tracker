<template>
  <div>
    <v-dialog v-model="flag" width="500">
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
        <v-card-text v-if="notif" class="mt-1 py-0">
          <p class="text-justify">
            Please allow <b class="ui-theme-color">GIGS TIMER</b> to access
            '<v-icon color="#2a206a" x-small> mdi-alarm-light </v-icon>
            Notification' to use push notification feature for tasks and
            comments<br />
            <span class="success-text">
              <b>In case you wouldn't be able to use that in future.</b>
            </span>
          </p>
        </v-card-text>
        <v-card-text v-else class="mt-1 py-0">
          <p class="text-justify">
            Please allow <b class="ui-theme-color">GIGS TIMER</b> to access
            '<v-icon color="#2a206a" x-small> mdi-microphone-settings </v-icon>
            microphone' & '<v-icon color="#2a206a" x-small> mdi-camera </v-icon>
            camera' to use screen/voice recording feature under comment
            section.<br />
            <span class="success-text">
              <b>In case you wouldn't be able to use that in future.</b>
            </span>
          </p>
        </v-card-text>
        <v-img :src="notif ? notifImg : mediaImg"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="flag = false"
            small
            color="btn-success"
            class="white--text"
            >Okay</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "Permissions",
  props: ["dialog", "notif"],
  data() {
    return {
      flag: this.dialog,
      notifImg: require("@/assets/images/notif.png"),
      mediaImg: require("@/assets/images/permissions.png"),
    };
  },
  watch: {
    dialog(value) {
      if (value) this.flag = true;
    },
  },
};
</script>
