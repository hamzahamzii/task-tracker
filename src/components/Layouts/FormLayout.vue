<template>
  <div
    class="bg d-flex default-height"
  >
    <v-row no-gutters class="pa-o ma-0">
      <v-col class="mx-4 pa-0">
        <div class="logo-text-color d-flex">
          <img src="@/assets/images/logo.svg" height="40px" class="mt-8 ml-6" />
        </div>
        <div
          style="height: 90%"
          class="d-flex justify-center align-center mr-3"
        >
          <slot name="form"></slot>
        </div>
      </v-col>
      <!-- hidden only on xs -->
      <v-col
        cols="4"
        class="hidden-sm-and-down pa-0 ma-0"
        style="background-color: #17123b"
      >
        <!-- <img
          width="900vw"
          height="100vh"
          class="bg-img"
          src="@/assets/images/task-timer-login.svg"
        /> -->
        <div style="background-color: #17123b" class="d-flex flex-column mx-0">
          <div class="d-flex flex-column my-16 mx-10">
            <p class="text-h4 white--text">
              Your ultimate task managing solution
            </p>
            <p class="text-h6 white--text">Let's start tracking</p>
          </div>
          <div class="d-flex justify-center">
            <img
              src="@/assets/images/sub-login.svg"
              :class="
                $vuetify.breakpoint.md
                  ? 'upper-img-md'
                  : $vuetify.breakpoint.xl
                  ? 'upper-img-xl'
                  : 'upper-img-lg'
              "
            />
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      autofilled: false,
    };
  },
  methods: {},
  watch: {
    "form.email"() {
      this.autofilled = true;
    },
  },
};
</script>
<style scoped>
.bg-img {
  z-index: 1;
  height: 100vh;
}
.height-sm {
  height: 115vh;
}
.default-height {
  height: 100vh;
}
/* .upper-img-lg {
  position: absolute;
  z-index: 2;
  top: 10rem;
}
.upper-img-xl {
  position: absolute;
  z-index: 2;
  top: 12rem;
  right: 9rem;
  height: 60vh;
}
.upper-img-md {
  position: absolute;
  z-index: 2;
  top: 12rem;
} */
/* .upper-img-heading-text {
  font-size: 32px;
  line-height: 39px;
  color: #ffffff;
}
.upper-img-sub-heading-text {
  font-size: 18px;
  line-height: 21px;
  letter-spacing: normal;
  color: #ffffff;
  top: 8rem;
} */
.bg {
  background-color: #fff;
}
.logo-text {
  font-size: 24px;
}
</style>
