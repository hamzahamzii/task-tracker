<template>
  <div class="d-flex justify-center mb-2 mx-2">
    <v-chip
      style="width:100% ; overflow:auto"
      color="#ddf6ee"
      class="task-log font-italic font-weight-bold text-truncate px-5 d-flex justify-center align-center"
      ><span >{{ details.text }} {{showDate(details.created_at)}}</span>
    </v-chip>
  </div>
</template>

<script>
import moment from "moment";
export default {
  name: "TaskLog",
  props: ["details"],
  methods:{
      showDate(date) {
      let d = moment(date).format("MMMM Do YYYY, h:mm:ss a");
      return d;
    },
  }
};
</script>

<style scoped>
.task-log {
  color: #28806d;
  font-size: 10px;
  width: 300px;
}
</style>