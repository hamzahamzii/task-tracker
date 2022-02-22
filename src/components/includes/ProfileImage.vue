<template>
  <div
    :class="{
      'd-inline': this.inline,
      'd-block': !this.inline,
      'rounded-circle': this.circular,
      rounded: !this.circular,
      hover: this.hover,
    }"
    class="d-flex align-center justify-center ma-0 pa-0"
  >
    <img
      v-if="this.src"
      :style="this.style"
      style="object-fit: contain !important; background-color: white"
      :class="{
        'rounded-circle': this.circular,
        rounded: !this.circular,
      }"
      class="ma-0 pa-0 elevation-2"
      :src="`${url}storage/${this.src}`"
      @error="
        $event.target.src = userProfile
          ? require('@/assets/images/dummy-user-logo.png')
          : require('@/assets/images/default-company.png')
      "
    />

    <div
      class="d-flex white--text align-center justify-center"
      :class="{
        'rounded-circle': this.circular,
        rounded: !this.circular,
        hover: this.hover,
      }"
      v-if="!this.src && this.username"
      :style="initials"
    >
      <div v-if="checkUserNameLength()" :style="textSize">
        {{ this.firstName.toUpperCase() + this.lastName.toUpperCase() }}
      </div>
      <div v-else :style="textSize">
        {{ this.username[0].toUpperCase() + this.username[1].toUpperCase() }}
      </div>
    </div>
  </div>
</template>

<script>
import { baseURL } from "@/assets/js/urls";
export default {
  name: "profileimage",
  data() {
    return {
      backgroundColors: [
        "#F44336",
        "#FF4081",
        "#9C27B0",
        "#673AB7",
        "#3F51B5",
        "#2196F3",
        "#03A9F4",
        "#00BCD4",
        "#009688",
        "#4CAF50",
        "#8BC34A",
        "#CDDC39",
        "#FFC107",
        "#FF9800",
        "#FF5722",
        "#795548",
        "#607D8B",
      ],
      firstName: null,
      lastName: null,
    };
  },
  props: {
    username: {
      type: String,
    },
    inline: {
      type: Boolean,
    },
    userProfile: {
      type: Boolean,
    },
    size: {
      type: Number,
      default: 50,
    },
    src: {
      type: String,
    },
    circular: {
      type: Boolean,
    },
    hover: {
      type: Boolean,
    },
  },
  computed: {
    style() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
      };
    },
    url() {
      return baseURL.API_URL;
    },
    textSize() {
      return { "font-size": this.size * 0.4 + "px" };
    },
    initials() {
      if (this.username) {
        return {
          background: this.randomBackgroundColor(
            this.username.length,
            this.backgroundColors
          ),
          width: `${this.size}px`,
          height: `${this.size}px`,
        };
      }
      return null;
    },
  },
  methods: {
    randomBackgroundColor(seed, colors) {
      return colors[seed % colors.length];
    },
    checkUserNameLength() {
      var loggedInUserName = this.username;
      if (loggedInUserName) {
        loggedInUserName = loggedInUserName.split(" ");
        if (loggedInUserName.length > 1) {
          this.firstName = loggedInUserName[0].charAt(0);
          this.lastName = loggedInUserName[1].charAt(0);
          return true;
        } else {
          return false;
        }
      }
    },
  },
};
</script>

<style scoped>
.text-size {
  font-size: 20px;
}
.hover:hover {
  box-shadow: 0 0px 10px 1px white;
  cursor: pointer !important;
}
</style>
