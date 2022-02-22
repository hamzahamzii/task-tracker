<template>
  <div>
    <v-card class="white" style="max-height: 240px; width: 232px">
      <v-card-text class="px-2 py-4">
        <div class="d-flex justify-center">
          <profileImage
            v-show="image ? ':src' : ':username'"
            :src="image"
            inline
            :username="name ? name : email"
            :userProfile="true"
            :size="50"
            :circular="true"
            class="text-light"
          ></profileImage>
        </div>
        <div class="d-flex justify-center my-1 py-0 word-break">
          <span style="font-size: 16px; color: black" class="py-0"
            ><b>{{ upperCaseTitleName(name) }}</b></span
          >
        </div>
        <span
          v-if="role == 'owner'"
          class="d-flex justify-center word-break display-style"
          ><b>{{ upperCaseTitleName(role) }}</b></span
        >
        <span v-if="role != 'owner'">
          <div class="d-flex justify-center py-0 mx-5">
            <span v-if="department" class="d-flex align-center display-style"
              ><b class="word-break text-center">
                {{ upperCaseTitleName(department) }}</b
              >
            </span>
            <br />
          </div>
          <div class="d-flex justify-center py-0 mx-6">
            <span class="word-break" v-if="designation" style="font-size: 12px"
              >({{ upperCaseTitleName(designation) }})</span
            >
          </div>
        </span>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import profileImage from "@/components/includes/ProfileImage";
export default {
  data() {
    return {
      dummy_name: "dummy name",
    };
  },
  props: ["image", "name", "email", "designation", "role", "department"],
  components: {
    profileImage,
  },
  methods: {
    upperCaseTitleName(name) {
      return name
        .split(" ")
        .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
        .join(" ");
    },
  },
};
</script>

<style scoped>
.display-style {
  font-size: 14px;
  color: #8993a4;
}
</style>
