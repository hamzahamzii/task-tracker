<template>
  <div class="d-flex justify-center flex-column">
    <v-btn
      outlined
      width="80px"
      class="d-flex px-0 mt-4 ml-3 align-center success-text"
      v-if="isExtension && list"
      @click="list = false"
    >
      <v-icon size="18" class="success-text mr-2">
        mdi-keyboard-backspace
      </v-icon>
      <span class="caption">Back</span>
    </v-btn>
    <StartTask v-show="!isExtension" @stopAttempt="stop = false" :stop="stop" />
    <TaskList
      v-show="!isExtension || list"
      @stopTask="stop = true"
      :headers.sync="_headers"
    />
    <ExtensionTaskPage v-if="isExtension && !list" />
    <div v-if="!list && isExtension" class="d-flex align-center success-text">
      <span class="pointer ml-9 my-2" @click="list = true">View Task List</span>
      <v-icon class="success-text ml-2"> mdi-exit-to-app </v-icon>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "TaskHead",
  components: {
    TaskList: () => import("@/components/Tasks/TaskList"),
    ExtensionTaskPage: () => import("@/components/Tasks/ExtensionTaskPage"),
    StartTask: () => import("@/components/Tasks/StartTask"),
  },
  data() {
    return {
      list: false,
      dialog: false,
      stop: false,
      employeeHeaders: [
        {
          text: "",
          value: "data-table-expand",
          class: "light-purple-bg",
          cellClass: "pl-2 pr-0",
        },
        {
          value: "assigned_by",
          text: "Assigned By",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
          width: "",
        },
        {
          value: "project",
          text: "Project Name",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
          width: "",
        },
        {
          value: "title",
          text: "Title",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
          width: "",
        },
        {
          value: "created_at",
          text: "Assigned Date",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
          width: "",
        },
        {
          value: "due_date",
          text: "Due Date",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
          width: "116px",
        },
        {
          value: "interval",
          text: "Start - End time",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
          width: "116px",
        },
        {
          value: "status",
          text: "Status",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
          width: "116px",
        },
        {
          value: "members.duration",
          text: "Duration",
          sortable: false,
          class: "light-purple-bg pl-1 pr-0",
          cellClass: "px-5",
        },
        {
          value: "actions",
          text: "Action",
          sortable: false,
          class: "light-purple-bg px-5",
          cellClass: "px-1",
          width: "116px",
        },
      ],
      employerHeaders: [
        {
          text: "",
          value: "data-table-expand",
          class: "light-purple-bg pl-3 pr-0",
          cellClass: "pl-2 pr-0",
        },
        {
          value: "members",
          text: "Assigned To",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "assigned_by",
          text: "Assigned By",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "project",
          text: "Project Name",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "title",
          text: "Title",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "created_at",
          text: "Assigned Date",
          sortable: false,
          class: "light-purple-bg px-0",
          cellClass: "px-1",
        },
        {
          value: "due_date",
          text: "Due Date",
          width: "116px",
          sortable: false,
          class: "light-purple-bg px-0",
          cellClass: "px-1",
        },
        {
          value: "interval",
          text: "Start  -  End Time",
          width: "116px",
          sortable: false,
          class: "light-purple-bg pl-0 pr-3",
          cellClass: "px-1",
        },
        {
          value: "status",
          text: "Status",
          sortable: false,
          class: "light-purple-bg px-0",
          cellClass: "px-1",
        },
        {
          value: "members.duration",
          text: "Duration",
          sortable: false,
          class: "light-purple-bg pl-1 pr-0",
          cellClass: "px-5",
        },
        {
          value: "actions",
          text: "Action",
          sortable: false,
          class: "light-purple-bg px-5",
          cellClass: "px-1",
        },
      ],
      ownerHeaders: [
        {
          text: "",
          value: "data-table-expand",
          class: "light-purple-bg pl-3 pr-0",
          cellClass: "pl-2 pr-0",
        },
        {
          value: "members",
          text: "Assigned To",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "assigned_by",
          text: "Assigned By",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "project",
          text: "Project Name",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "title",
          text: "Title",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "created_at",
          text: "Assigned Date",
          sortable: false,
          class: "light-purple-bg px-0",
          cellClass: "px-1",
        },
        {
          value: "due_date",
          text: "Due Date",
          width: "116px",
          sortable: false,
          class: "light-purple-bg px-0",
          cellClass: "px-1",
        },
        {
          value: "interval",
          text: "Start  -  End Time",
          width: "116px",
          sortable: false,
          class: "light-purple-bg pl-0 pr-3",
          cellClass: "px-1",
        },
        {
          value: "status",
          text: "Status",
          sortable: false,
          class: "light-purple-bg px-0",
          cellClass: "px-1",
        },
        {
          value: "members.duration",
          text: "Duration",
          sortable: false,
          class: "light-purple-bg pl-1 pr-0",
          cellClass: "px-5",
        },
        {
          value: "actions",
          text: "Action",
          sortable: false,
          class: "light-purple-bg px-5",
          cellClass: "px-1",
        },
      ],
      extensionHeaders: [
        {
          text: "",
          value: "data-table-expand",
          class: "light-purple-bg pl-3 pr-0",
          cellClass: "pl-2 pr-0",
        },
        {
          value: "title",
          text: "Title",
          sortable: false,
          class: "light-purple-bg px-1",
          cellClass: "px-1",
        },
        {
          value: "members.duration",
          text: "Duration",
          sortable: false,
          class: "light-purple-bg pl-1 pr-0",
          cellClass: "px-5",
        },
        {
          value: "actions",
          text: "Action",
          sortable: false,
          class: "light-purple-bg px-5",
          cellClass: "px-1",
        },
      ],
    };
  },

  watch: {
    getShowAllTasks(value) {
      if (value == "By Others") {
        this.ownerHeaders[2].width = "100px";
        this.employerHeaders[2].width = "100px";
      } else if (value == "By Me") {
        this.ownerHeaders[2].width = "0px";
        this.employerHeaders[2].width = "0px";
      }
    },
    dialog(val) {
      if (val) {
        document.addEventListener("mousedown", this.mousedownHandler);
      } else {
        document.removeEventListener("mousedown", this.mousedownHandler);
      }
    },
  },

  methods: {
    mousedownHandler(e) {
      if (e.target.classList.contains("v-overlay__scrim")) this.dialog = false;
    },
    addTaskModal() {
      this.dialog = true;
    },
  },
  computed: {
    ...mapGetters(["getSelectedCompany", "getShowAllTasks"]),
    isExtension() {
      return window.innerHeight == "600" && window.innerWidth == "450";
    },
    _headers() {
      if (this.isExtension) return this.extensionHeaders;
      if (this.getSelectedCompany.role == "owner") {
        return this.ownerHeaders;
      }
      if (
        this.getSelectedCompany.role == "employee" ||
        (this.getSelectedCompany.role == "admin" &&
          !this.getSelectedCompany.permissions.team_member &&
          this.getSelectedCompany.permissions.project)
      ) {
        return this.employeeHeaders;
      } else {
        return this.employerHeaders;
      }
    },
  },
};
</script>
<style scoped>
#add-task {
  background-color: #2758f6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: sans-serif;
}
#task-table {
  padding: 10px;
}
</style>
