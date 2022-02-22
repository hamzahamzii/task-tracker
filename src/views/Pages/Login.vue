<template>
  <div>
    <LoginUser />
  </div>
</template>

<script>
export default {
  name: "Login",
  components: {
    LoginUser: () => import("@/components/Auth/loginUser"),
  },
  computed: {},
  mounted() {},
  methods: {},
};
</script>


