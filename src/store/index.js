import Vue from "vue";
import Vuex from "vuex";
import authAxios from "@/services/api.service.js";
import requestQueue from "@/services/requestQueue";
import moment from "moment";
import router from "@/router";
// importing store modules
import auth from "./modules/auth";
import reports from "./modules/reports";
import sidebar from "./modules/sidebar";
import project from "@/store/modules/project";
import dashboard from "./modules/dashboard";
// import departments from "./modules/departments";
import pendingComments from "./modules/pendingComments";
import screenRecording from "./modules/screenRecording";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";

Vue.use(Vuex);
const store = {
  state: {
    online: true,
    queue: [],
    companies: null,
    ownerNames: null,
    selectedCompanyId: null,
    tasks: null,
    tasksPagination: null,
    activeTask: null,
    teamMembers: null,
    teamLeadMembers: null,
    archivedMembers: null,
    startTime: null,
    timer: 0,
    timerMoment: null,
    countries: null,
    currencies: null,
    playedAttchment: null,
    commentSkeletonLoader: true,
    tasksSkeletonLoader: false,
    tasksLinearLoader: false,
    payroll: null,
    pendingTimerReq: false,
    startDateRange: null,
    endDateRange: null,
    fetchPayRollLoader: false,
    timeRecord: null,
    audioRecordStartTime: null,
    audioTimer: 0,
    taskFilters: {
      title: null,
      status: "pending",
      start_date: moment()
        .subtract(29, "day")
        .format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
      assigned_by: null,
      assigned_to: null,
      project_id: null,
      show_tasks: "me",
      redirect: false,
      page: 1,
      per_page: 25,
      sort: {
        order_by: null,
        column_name: null,
      },
    },
    taskDateFilter: "Last 7 days",
    departments: null,
  },
  // NOTE: All getter names should start with 'get'
  getters: {
    getDepartments: (state) => state.departments,
    getOnlineStatus: (state) => state.online,
    getQueue: (state) => state.queue,
    getCompanies: (state) =>
      state.companies
        ? state.companies
            .filter((item) => {
              return item.name ? item.name : false;
            })
            .sort((a, b) => {
              return a.name.localeCompare(b.name);
            })
        : null,

    getOwnerNames: (state) =>
      state.ownerNames
        .filter((item) => {
          return item.name ? false : item.owner;
        })
        .sort((a, b) => {
          return a.owner.localeCompare(b.owner);
        }),

    getCompany: (state) => (id) =>
      state.companies.find((item) => {
        return item.id == id;
      }),
    getSelectedCompany: (state) =>
      state.companies.find((item) => {
        return item.id == state.selectedCompanyId;
      }),

    getCompanyEmployees: (state) => state.teamMembers,
    getTeamMembers: (state) =>
      state.teamMembers
        ? state.teamMembers
            .filter((item) => {
              return item.name ? item.name : false;
            })
            .sort((a, b) => {
              return a.name.localeCompare(b.name);
            })
        : [],
    getTeamMembersEmail: (state) =>
      state.teamMembers
        ? state.teamMembers
            .filter((item) => {
              return !item.name ? item.email : false;
            })
            .sort((a, b) => {
              return a.email.localeCompare(b.email);
            })
        : [],
    getAllMembers: (state, getters) =>
      getters.getTeamMembers
        .concat(getters.getTeamMembersEmail)
        .filter((item) => {
          return !item.just_added;
        }),

    getTeamLeadMembers: (state, getters) =>
      state.teamMembers
        ? state.teamMembers.filter((item) => {
            return item.id && !item.just_added
              ? (item.leader_id == getters.getLoggedInUser.id ||
                  item.id == getters.getLoggedInUser.id) &&
                  !item.archived_team_member
              : null;
          })
        : [],

    getAllTeamLeadMembers: (state) =>
      state.teamLeadMembers ? state.teamLeadMembers : [],

    getJustAddedMembers: (state, getters) =>
      getters.getTeamMembers
        .concat(getters.getTeamMembersEmail)
        .filter((item) => {
          return item.just_added;
        }),

    getArchievedmembers: (state) =>
      state.archivedMembers ? state.archivedMembers : [],

    getTeamMember: (state) => (id) =>
      state.teamMembers.find((item) => {
        return item.id == id;
      }),

    getTasks: (state) => (state.tasks ? state.tasks : null),
    getTasksPagination: (state) => state.tasksPagination,
    // Gets task object for provided id, gets active task copy if active task is not in list
    getTask: (state) => (id) => {
      if (state.activeTask && id == state.activeTask.task_id) {
        if (
          state.tasks &&
          state.tasks.find((item) => {
            return item.task_id == id;
          })
        ) {
          return state.tasks.find((item) => {
            return item.task_id == id;
          });
        } else {
          return state.activeTask;
        }
      }
      return state.tasks.find((item) => {
        return item.task_id == id;
      });
    },
    // Checks if task is present in tasks list or not
    findTask: (state) => (id) => {
      return state.tasks.find((item) => {
        return item.task_id == id;
      });
    },
    getSearchedStatus: (state) => state.taskFilters.status,
    getSearchedTitle: (state) => state.taskFilters.title,
    getSearchedProject: (state, rootGetters) =>
      rootGetters.getProject(state.taskFilters.project_id),
    getSearchedAssignedBy: (state) => state.taskFilters.assigned_by,
    getSearchedAssignedTo: (state) => state.taskFilters.assigned_to,
    getSearchedPage: (state) => state.taskFilters.page,
    getSearchedPerPage: (state) => state.taskFilters.per_page,
    getTaskDateFilter: (state) => state.taskDateFilter,
    // Tasks showing: 'By Me' or 'By Others'
    getShowAllTasks: (state) => state.taskFilters.show_tasks,
    getAssignees: (state, getters) => (task_id) => {
      return getters.getTask(task_id) ? getters.getTask(task_id).members : [];
    },
    getNonAssignees: (state, getters) => (task_id) => {
      let nonAssignees = [];
      for (let member of getters.getAllMembers) {
        if (
          getters.getTask(task_id) &&
          !getters.getTask(task_id).members.find((item) => {
            return item.id == member.id;
          })
        ) {
          nonAssignees.push(member);
        }
      }
      return nonAssignees;
    },

    getActiveTask: (state, getters) =>
      state.activeTask ? getters.getTask(state.activeTask.task_id) : null,
    getActiveTimeEntry: (state, getters) => {
      return getters.getActiveTask.interval[
        getters.getActiveTask.interval.length - 1
      ];
    },
    getStartTime: (state) => state.startTime,
    getActiveDuration: (state, getters) =>
      state.activeTask ? getters.getActiveTask.interval.duration : 0,
    getTimer: (state) => state.timer,
    getPendingTimer: (state) => state.pendingTimerReq,
    getStartDateRange: (state) => state.startDateRange,
    getEndDateRange: (state) => state.endDateRange,
    getTimeRecord: (state) => state.timeRecord,
    getAudioRecordStartTime: (state) => state.audioRecordStartTime,
    getAudioTimer: (state) => state.audioTimer,
    getCountries: (state) => state.countries,

    getCurrencies: (state) => state.currencies,

    getPayroll: (state) => state.payroll,
    getFetchPayRollLoader: (state) => state.fetchPayRollLoader,

    getPlayedAttchment: (state) => state.playedAttchment,
    getCommentSkeletonLoader: (state) => state.commentSkeletonLoader,
    getTasksSkeletonLoader: (state) => state.tasksSkeletonLoader,
    getTasksLinearLoaderState: (state) => state.tasksLinearLoader,
  },
  // NOTE: All mutations should have prototypes like this:
  // mutationName(state, payload)
  // All mutation names should start with 'set'
  mutations: {
    // ONLINE STATUS
    setOnlineStatus(state, payload) {
      state.online = payload;
    },
    // QUEUE
    //pushes the provided request in to the queue
    pushRequest(state, request) {
      state.queue.push(request);
    },
    //pops the request with provided id, out of the queue
    popRequest(state, reqId) {
      state.queue = state.queue.filter((item) => {
        return item.id != reqId;
      });
    },

    // COMPANIES
    setCompanies(state, payload) {
      state.companies = payload;
    },

    setOwnerName(state, payload) {
      state.ownerNames = payload;
    },

    setSelectedCompany(state, payload) {
      state.selectedCompanyId = payload;
    },
    // Create -- (COMPANIES)
    setCreateComapny(state, payload) {
      state.companies.push(payload);
    },
    // Update -- (COMPANIES)
    setUpdateCompany(state, payload) {
      var id = state.companies.findIndex((item) => {
        return item.id == payload.id;
      });
      Object.assign(state.companies[id], payload);
    },
    // Delete/Archive -- (COMPANIES)
    //
    //
    // TASKS
    setTasks(state, payload) {
      state.tasks = payload;
    },
    resetTaskFilters(state) {
      state.taskFilters = {
        title: null,
        status: "pending",
        start_date: moment()
          .subtract(29, "day")
          .format("YYYY-MM-DD"),
        end_date: moment().format("YYYY-MM-DD"),
        assigned_by: null,
        assigned_to: null,
        project_id: null,
        show_tasks: "me",
        redirect: false,
        page: 1,
        per_page: 25,
        sort: {
          order_by: null,
          column_name: null,
        },
      };
      state.taskDateFilter = "Last 30 days";
    },
    setTaskFilter(state, payload) {
      for (let key in payload) {
        state.taskFilters[key] = payload[key];
      }
    },
    setTaskDateFilter(state, payload) {
      state.taskDateFilter = payload;
    },
    setTasksPagination(state, payload) {
      state.tasksPagination = payload;
    },
    addPage(state, payload) {
      payload.total += 1;
      payload.last_page = Math.ceil(payload.total / payload.per_page);
      if (payload.total < payload.per_page) {
        payload.to = payload.total;
      } else {
        if (payload.current_page == 1) payload.to = payload.per_page;
        else if (
          payload.current_page > 1 &&
          payload.current_page < payload.last_page
        )
          payload.to = payload.current_page * payload.per_page;
        else if (payload.current_page == payload.last_page)
          payload.to = payload.total;
      }
      payload.from = payload.from ? payload.from : 1;
    },
    removePage(state, payload) {
      payload.total -= 1;
      payload.last_page = Math.ceil(payload.total / payload.per_page);
      if (payload.total < payload.per_page) {
        payload.to = payload.total;
      } else {
        if (payload.current_page == 1) payload.to = payload.per_page;
        else if (
          payload.current_page > 1 &&
          payload.current_page < payload.last_page
        )
          payload.to = payload.current_page * payload.per_page;
        else if (payload.current_page == payload.last_page)
          payload.to = payload.total;
      }
      payload.from = payload.from ? payload.from : 1;
    },
    addNewTask(state, payload) {
      payload.newTaskObj.just_added = true;
      payload.taskArray.unshift(payload.newTaskObj);
      // Set temporary property for highlighting
      setTimeout(() => {
        state.tasks[0].just_added = false;
      }, 10000);
      if (payload.taskArray.length > payload.pagination.per_page)
        payload.taskArray.pop();
    },
    addTimeEntry(state, payload) {
      payload.task.interval.push(payload.interval);
    },
    // update active time entry (set end point)
    updateTimeEntry(state, payload) {
      Object.assign(payload.oldInterval, payload.newInterval);
    },
    // update active time entry (add second to duration)
    updateActiveDuration(state, payload) {
      payload.entry.duration = payload.duration;
    },

    //After click on any task play button in table set active that task
    setActiveTask(state, data) {
      state.activeTask = data;
      if (
        data &&
        state.tasks.find((item) => {
          return item.task_id == data.task_id;
        })
      ) {
        state.tasks.find((item) => {
          return item.task_id == data.task_id;
        }).status = "active";
      }
    },

    // Sets updated keys for task (title, due date, project)
    setUpdatedTask(state, payload) {
      for (let key in payload) {
        if (key != "task") {
          if (key == "project") {
            if (payload[key]) payload.task.project = payload.project;
            else payload.task.project = null;
          } else payload.task[key] = payload[key];
        }
      }
    },

    // Filters out task in case of completed
    setUpdatedStatus(state, payload) {
      payload.task.completed_at = payload.completed_at;
      if (
        (payload.status == "completed" &&
          state.taskFilters.status == "pending") ||
        (payload.status != "completed" &&
          state.taskFilters.status == "completed")
      ) {
        state.tasks = state.tasks.filter((item) => {
          return item.task_id != payload.task.task_id;
        });
      }
    },

    //delete Task entry
    removeTaskEntry(state, taskId) {
      state.tasks = state.tasks.filter((item) => {
        return item.task_id != taskId;
      });
    },

    // Runs timer. Adds one second to timer
    addOneSecond(state) {
      let now = moment();
      let timeSpent = moment.duration(now.diff(state.startTime)).asSeconds();
      state.timer = Math.ceil(timeSpent);
      state.timerMoment = now;
    },

    // recover timer after browser is closed
    recoverTimer(state) {
      let now = moment();
      let closedTime = moment.duration(now.diff(state.timerMoment)).asSeconds();
      state.timer += Math.ceil(closedTime);
    },
    // Create -- (TASKS)
    setDiscardedTask(state) {
      state.activeTask = null;
      state.timer = 0;
      state.startTime = null;
    },
    // Update -- (TASKS)
    setTasksSkeletonLoader(state, payload) {
      state.tasksSkeletonLoader = payload;
    },
    setTasksLinearLoader(state, payload) {
      state.tasksLinearLoader = payload;
    },

    // Assign member to task
    setAddedMember(state, payload) {
      if (payload.member.id == payload.me.id) {
        payload.task.members.unshift(payload.member);
        payload.task.self_assigned = true;
      } else payload.task.members.push(payload.member);
    },

    setRemovedMember(state, payload) {
      if (payload.member.id == payload.me.id) {
        payload.task.interval = [];
        payload.task.self_assigned = false;
      }
      payload.task.members = payload.task.members.filter((item) => {
        return item.id != payload.member.id;
      });
    },

    removeTimeEntry(state, payload) {
      payload.task.interval = payload.task.interval.filter((entry) => {
        return entry.entry_id != payload.entry_id;
      });
    },
    removeTimeInterval(state, payload) {
      for (let task of state.tasks) {
        task.interval = task.interval.filter((entry) => {
          return entry.entry_id != payload.entry_id;
        });
      }
    },
    removeTask(state, payload) {
      state.tasks = state.tasks.filter((item) => {
        return item.task_id != payload;
      });
    },
    // Delete/Archive -- (TASKS)
    //
    //
    // TIMER
    // Start time of current running task
    setStartTime(state, payload) {
      state.startTime = payload;
    },

    resetTimer(state) {
      state.timer = 0;
      state.startTime = null;
      state.timerMoment = null;
    },

    setTimer(state, time) {
      state.timer = time;
    },
    setPendingTimer(state, value) {
      state.pendingTimerReq = value;
    },
    setDateRange(state) {
      const today = new Date();
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 6);
      let date = last7Days.toISOString().substr(0, 10);
      let startTime = date;
      let endTime = new Date().toISOString().substr(0, 10);
      state.startDateRange = startTime;
      state.endDateRange = endTime;
    },

    // TEAM MEMBERS
    setMembers(state, payload) {
      state.teamMembers = payload;
    },

    // TEAM LEAD MEMBERS
    setTeamLeadMembers(state, payload) {
      state.teamLeadMembers = payload;
    },

    // Set Add New Member in a Team
    setAddTeamMember(state, payload) {
      state.teamMembers.find((item) => {
        return item.id == payload.id;
      }).archived_team_member = false;
    },

    // Set Remove a Member in a Team
    setRemoveTeamMember(state, payload) {
      state.teamMembers.find((item) => {
        return item.id == payload.id;
      }).archived_team_member = true;
    },

    setAddStatusMember(state, payload) {
      state.teamLeadMembers.find((item) => {
        return item.id == payload.id;
      }).deleted_team_members = false;
    },

    setRemoveStatusMember(state, payload) {
      state.teamLeadMembers.find((item) => {
        return item.id == payload.id;
      }).deleted_team_members = true;
    },

    setAddMembers(state, payload) {
      payload.members_added.map((item) => {
        item.just_added = true;
        item.completed = "0";
        item.pending = "0";
        item.overdue = "0";
      });
      state.teamMembers = state.teamMembers.concat(payload.members_added);
      setTimeout(() => {
        state.teamMembers.map((item) => {
          item.just_added = false;
        });
      }, 10000);
    },
    // Create -- (TEAM MEMBERS)
    // Update -- (TEAM MEMBERS)

    // Delete/Archive -- (TEAM MEMBERS)
    setArchievedMembers(state, payload) {
      state.archivedMembers = payload;
    },

    // Archieve -- (TEAM MEMBER) (Single)
    setMemberArchive(state, payload) {
      state.teamMembers = state.teamMembers.filter((item) => {
        return item.id != payload.employee_id;
      });
    },

    // Restore -- (TEAM MEMBER) (Single)
    setMemberRestore(state, payload) {
      state.archivedMembers = state.archivedMembers.filter((item) => {
        return item.id != payload.employee_id;
      });
    },
    // Sorting on the basis of role (TEAM MEMBERS)
    setRoleSorting(state, payload) {
      if (payload == "asc") {
        state.teamMembers = state.teamMembers.sort((a, b) => {
          return a.role.localeCompare(b.role);
        });
      } else if (payload == "desc") {
        state.teamMembers = state.teamMembers
          .sort((a, b) => {
            return a.role.localeCompare(b.role);
          })
          .reverse();
      }
    },

    // Sorting on the basis of Completed Tasks (TEAM MEMBERS)
    setCompletedTaskSorting(state, payload) {
      if (payload == "asc") {
        state.teamMembers = state.teamMembers.sort((a, b) => {
          return a.completed - b.completed;
        });
      } else if (payload == "desc") {
        state.teamMembers = state.teamMembers
          .sort((a, b) => {
            return a.completed - b.completed;
          })
          .reverse();
      }
    },

    // Sorting on the basis of Pending Tasks (TEAM MEMBERS)
    setPendingTaskSorting(state, payload) {
      if (payload == "asc") {
        state.teamMembers = state.teamMembers.sort((a, b) => {
          return a.pending - b.pending;
        });
      } else if (payload == "desc") {
        state.teamMembers = state.teamMembers
          .sort((a, b) => {
            return a.pending - b.pending;
          })
          .reverse();
      }
    },

    // Sorting on the basis of Overdue Tasks (TEAM MEMBERS)
    setOverdueTaskSorting(state, payload) {
      if (payload == "asc") {
        state.teamMembers = state.teamMembers.sort((a, b) => {
          return a.overdue - b.overdue;
        });
      } else if (payload == "desc") {
        state.teamMembers = state.teamMembers
          .sort((a, b) => {
            return a.overdue - b.overdue;
          })
          .reverse();
      }
    },

    newComment(state, payload) {
      if (
        state.tasks.find((item) => {
          return item.task_id == payload;
        })
      ) {
        state.tasks.find((item) => {
          return item.task_id == payload;
        }).comments_count += 1;
      }
    },
    addOneSecRecording(state) {
      let now = moment();
      let timeSpent = moment
        .duration(now.diff(state.audioRecordStartTime))
        .asSeconds();
      state.audioTimer = Math.ceil(timeSpent);
      state.timerMoment = now;
    },
    setAudioRecordStartTime(state, payload) {
      state.audioRecordStartTime = payload;
    },
    setTimeRecord(state, payload) {
      state.timeRecord = payload;
    },
    resetAudioTimer(state) {
      state.audioTimer = 0;
      state.audioRecordStartTime = null;
      state.timeRecord = null;
    },

    //Set played Attchment
    setPlayedAttchment(state, payload) {
      state.playedAttchment = payload;
    },

    // COUNTRIES
    // Read -- (COUNTRIES)
    setCountries(state, payload) {
      state.countries = payload;
    },

    // CURRENCIES
    // Read -- (CURRENCIES)
    setCurrencies(state, payload) {
      state.currencies = payload;
    },
    // DEPARTMENTS
    // Read -- (DEPARTMENTS)
    setDepartments(state, payload) {
      state.departments = payload;
    },

    // Create -- (DEPARTMENTS)
    setCreateDepartment(state, payload) {
      state.departments.push(payload);
    },

    // Payroll
    setPayroll(state, payload) {
      state.payroll = payload;
    },
    setRemovePayroll(state) {
      state.payroll = [];
    },
    setFetchPayRollLoader(state, payload) {
      state.fetchPayRollLoader = payload;
    },
    setUserRole(state, payload) {
      state.teamMembers.find((item) => {
        return item.id == payload.user_id;
      }).role = payload.roles;
    },
    updateUserRole(state, payload) {
      state.teamMembers.find((item) => {
        return item.id == payload.user_id;
      }).role = payload.role;
    },
    setMyRole(state, payload) {
      payload.company.role = payload.role;
      payload.company.permissions = payload.permissions;
    },
  },

  // Call API service (avoid using axios directly)
  // Call mutations to update state accordingly (avoid updating state directly)
  actions: {
    // AUTH ERROR CHECK
    // Logs out user if 401 (unauthorized)
    checkAuth(context, error) {
      if (error && error.response && error.response.status == 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("fcm_token");
        context.commit("setLogout", context.rootState);
        context.commit("resetTimer");
        router.push({ name: "login" });
        context.commit("resetTaskFilters");
      }
    },

    // COMPANIES
    selectCompany(context, id) {
      context.commit("setSelectedCompany", id);
      localStorage.setItem("role", context.getters.getCompany(id).role);
      context.commit("setTasks", null);
      context.dispatch("fetchTasks");
    },

    //Update last Comapny -- (COMPANIES)
    updateLastCompany(context, id) {
      authAxios
        .post(
          "update-last-company",
          JSON.parse(localStorage.getItem("token")),
          id
        )
        .catch((err) => {
          context.dispatch("checkAuth", err);
        });
    },

    // Update -- (COMPANIES)
    updateCompany(context, companyUpdate) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "update-company",
            JSON.parse(localStorage.getItem("token")),
            companyUpdate
          )
          .then((response) => {
            context.commit("setUpdateCompany", response.data.data);
            resolve(response.data);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    // Create -- (COMPANIES)
    createCompany(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "create-company",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            context.commit("setCreateComapny", response.data.data);
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    // Read -- (COMPANIES)
    fetchCompanies(context) {
      return new Promise((resolve, reject) => {
        authAxios
          .post("get-companies", JSON.parse(localStorage.getItem("token")))
          .then((response) => {
            context.commit("setOwnerName", response.data);
            context.commit("setCompanies", response.data);
            context.commit(
              "setSelectedCompany",
              context.rootState.auth.loggedInUser.last_company
            );
            context.dispatch("fetchProjects");
            let selection = context.state.companies.find((item) => {
              return item.id == context.state.selectedCompanyId;
            }).role;

            selection == "admin" &&
            !context.getters.getSelectedCompany.permissions.team_member &&
            context.getters.getSelectedCompany.permissions.project
              ? () => {}
              : context.dispatch("fetchTeamMembers");

            router.push({
              name: "task",
            });
            resolve();
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    // Update -- (COMPANIES)
    // Delete/Archive -- (COMPANIES)
    deleteCompany(context, companyDel) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "archive-company",
            JSON.parse(localStorage.getItem("token")),
            companyDel
          )
          .then((response) => {
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);

            reject(err);
          });
      });
    },
    //
    //

    //
    //
    // TASKS
    // Create -- (TASKS)
    createTask(context, payload) {
      context.commit("setPendingTimer", payload);
      if (payload.self_assigned && !payload.end_time) {
        context.commit("setStartTime", payload.start_time);
        context.commit("setActiveTask", {
          title: payload.title,
          timezone: payload.timezone,
          task_id: Date.now(),
          project:
            payload.project_id && context.getters.getProject(payload.project_id)
              ? context.getters.getProject(payload.project_id)
              : null,
          assigned_by: context.getters.getLoggedInUser,
          members: payload.members,
          interval: [
            {
              entry_id: Date.now(),
              start_time: payload.start_time,
              end_time: null,
              duration: 0,
            },
          ],
        });
      }
      return new Promise((resolve, reject) => {
        requestQueue
          .post(
            "create-task",
            JSON.parse(localStorage.getItem("token")),
            payload,
            (response) => {
              context.commit("setPendingTimer", false);
              context.commit("addNewTask", {
                taskArray: context.getters.getTasks,
                newTaskObj: response.data.data,
                pagination: context.getters.getTasksPagination,
              });
              context.commit("setSelectedProject", null);
              context.commit("addPage", context.getters.getTasksPagination);
              if (payload.self_assigned) {
                context.commit(
                  "setStartTime",
                  response.data.data.interval[0].start_time
                );
              }
              resolve(response.data);
            }
          )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            context.commit("setPendingTimer", false);
            context.commit("setActiveTask", null);
            context.commit("resetTimer");
            reject(err);
          });
      });
    },
    //delete Task
    deleteTaskEntry(context, taskId) {
      let data = {
        company_id: context.state.selectedCompanyId,
        task_id: taskId,
      };
      return new Promise((resolve, reject) => {
        authAxios
          .post("task/delete", JSON.parse(localStorage.getItem("token")), data)
          .then((response) => {
            context.commit("removeTaskEntry", taskId);
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    // Read -- (TASKS
    fetchTasks(context) {
      let filters = context.state.taskFilters;
      let data = {
        show_tasks: filters && filters.show_tasks ? filters.show_tasks : "me",
        company_id: context.state.selectedCompanyId,
        per_page: filters
          ? filters.per_page
            ? filters.per_page
            : context.getters.getTasksPagination
            ? context.getters.getTasksPagination.per_page
            : 25
          : 25,
        page: filters ? (filters.page ? filters.page : null) : null,
        start_date: filters && filters.start_date,
        end_date: filters && filters.end_date,
        redirect: filters && filters.redirect,
        search_col: {
          assigned_by:
            filters && filters.assigned_by ? filters.assigned_by.id : null,
          assigned_to:
            filters && filters.assigned_to ? filters.assigned_to.id : null,
          title: filters && filters.title,
          status: filters && filters.status,
          project_id: filters && filters.project_id,
        },
        sort:
          filters && filters.sort
            ? filters.sort
            : {
                order_by: "desc",
                column_name: "created_at",
              },
      };
      return new Promise((resolve, reject) => {
        context.getters.getTasks
          ? context.commit("setTasksLinearLoader", true)
          : context.commit("setTasksSkeletonLoader", true);
        setTimeout(() => {
          context.commit("setTasksSkeletonLoader", false);
        }, 3000);
        authAxios
          .post("get-tasks", JSON.parse(localStorage.getItem("token")), data)
          .then((response) => {
            var sorted_members = [];
            for (let task of response.data.data.tasks) {
              for (let member of task.members) {
                member.id == context.getters.getLoggedInUser.id
                  ? sorted_members.unshift(member)
                  : sorted_members.push(member);
              }
              Object.assign(task.members, sorted_members);
              sorted_members = [];
            }
            context.commit("setTasksPagination", response.data.data.pagination);
            context.commit("setTasksSkeletonLoader", false);
            context.commit("setTasksLinearLoader", false);

            context.commit("setTasks", response.data.data.tasks);
            resolve();
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    fetchSearchTask(context, payload) {
      return authAxios
        .post("search-task", JSON.parse(localStorage.getItem("token")), payload)
        .then((response) => {
          context.commit("setTasks", response.data);
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
        });
    },
    // Update -- (TASKS)
    editTask(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "update-task-metadata",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            if (!localStorage.getItem("token")) {
              if (response.data.user_type) {
                router.push({ name: "login" });
              } else {
                location.replace(response.data.url);
              }
            }
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    assignMember(context, payload) {
      let data = {
        company_id: context.getters.getSelectedCompany.id,
        task_id: payload.task_id,
      };

      let assign; // Key for adding or removing (true for add, false for remove)
      if (
        context.getters.getAssignees(payload.task_id).find((item) => {
          return item.id == payload.member_id;
        })
      ) {
        // Remove from task case
        data.remove_member = payload.member_id;
        assign = false;
      } else {
        // Add to task case
        data.add_member = payload.member_id;
        assign = true;
      }
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "update-task-member",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((res) => {
            assign
              ? context.commit("setAddedMember", {
                  member: res.data.members,
                  task: context.getters.getTask(payload.task_id),
                  me: context.getters.getLoggedInUser,
                })
              : context.commit("setRemovedMember", {
                  member: res.data.members,
                  task: context.getters.getTask(payload.task_id),
                  me: context.getters.getLoggedInUser,
                });
            resolve();
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    startTask(context, task) {
      // Call API
      context.commit("setPendingTimer", task);
      context.commit("setStartTime", moment().format("YYYY-MM-DD HH:mm:ss"));
      return new Promise((resolve, reject) => {
        authAxios
          .post("time-entry", JSON.parse(localStorage.getItem("token")), {
            company_id: context.getters.getSelectedCompany.id,
            project_id: task.project ? task.project.id : null,
            task_id: task.task_id,
            start_time: context.getters.getStartTime,
            end_time: "",
            title: task.title,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
          .then((res) => {
            context.commit("setPendingTimer", false);
            context.commit("setActiveTask", task);
            context.commit("addTimeEntry", {
              task: context.getters.getActiveTask,
              interval: res.data.data,
            });
            resolve(res);
          })
          .catch((err) => {
            context.commit("setPendingTimer", false);
            context.commit("setActiveTask", null);
            context.commit("resetTimer");
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    stopTask(context) {
      // Call API
      context.getters.getActiveTask
        ? context.commit("setPendingTimer", context.getters.getActiveTask)
        : () => {};
      return new Promise((resolve, reject) => {
        context.getters.getActiveTask
          ? authAxios
              .post("time-entry", JSON.parse(localStorage.getItem("token")), {
                company_id: context.getters.getSelectedCompany.id,
                project_id: context.getters.getActiveTask.project
                  ? context.getters.getActiveTask.project.id
                  : null,
                task_id: context.getters.getActiveTask.task_id,
                start_time: "",
                end_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                duration: context.state.timer,
                title: context.getters.getActiveTask.title,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })
              .then((res) => {
                context.commit("setPendingTimer", false);
                context.commit("updateTimeEntry", {
                  oldInterval: context.getters.getActiveTimeEntry,
                  newInterval: res.data.data,
                });
                context.commit("setStartTime", null);
                context.commit("resetTimer");
                context.commit("setActiveTask", null);
                resolve(res);
              })
              .catch((err) => {
                context.commit("setPendingTimer", false);
                context.dispatch("checkAuth", err);
                reject(err);
              })
          : resolve();
      });
    },

    discardTask(context, payload) {
      context.commit("setPendingTimer", payload);
      context
        .dispatch("removeTimeEntries", payload)
        .then(() => {
          context.commit("setPendingTimer", false);
          context.commit("setDiscardedTask");
        })
        .catch(() => {
          context.commit("setPendingTimer", false);
        });
    },

    removeTimeEntries(context, payload) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "delete-task",
            JSON.parse(localStorage.getItem("token")),
            payload
          )
          .then((res) => {
            let entries = res.data;
            for (let entry of entries) {
              let task = context.getters.getTask(entry.task_id);
              // task found in current company
              if (task) {
                context.commit("removeTimeEntry", {
                  task,
                  entry_id: entry.entry_id,
                });
                // Remove task if all entries are deleted
                if (
                  !task.interval.length &&
                  task.members.length == 1 &&
                  task.self_assigned
                ) {
                  context.commit("removeTask", entry.task_id);
                  context.commit(
                    "removePage",
                    context.getters.getTasksPagination
                  );
                }
              }
            }
            resolve();
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    editTimeEntry(context, payload) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "time-entry",
            JSON.parse(localStorage.getItem("token")),
            payload
          )
          .then((res) => {
            context.commit("updateTimeEntry", {
              oldInterval: context.getters
                .getTask(payload.task_id)
                .interval.find((item) => {
                  return item.entry_id == payload.entry_id;
                }),
              newInterval: res.data.data,
            });
            resolve(res.data.data);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    deleteTimeEntry(context, payload) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "delete-time-entry",
            JSON.parse(localStorage.getItem("token")),
            payload
          )
          .then((res) => {
            context.commit("removeTimeInterval", payload);
            resolve(res.data.data);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    updateTask(context, payload) {
      // Call API
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "update-task-metadata",
            JSON.parse(localStorage.getItem("token")),
            payload
          )
          .then((res) => {
            let data = {
              task: context.getters.getTask(payload.task_id),
              project: payload.project_id
                ? context.getters.getProject(payload.project_id)
                : null,
            };
            payload.title ? (data.title = payload.title) : () => {};
            payload.due_date ? (data.due_date = payload.due_date) : () => {};
            payload.status ? (data.status = payload.status) : () => {};
            context.commit("setUpdatedTask", data);
            if (data.status) {
              context.commit("setUpdatedStatus", {
                status: data.status,
                task: context.getters.getTask(payload.task_id),
                completed_at: payload.completed_at,
              });
            }
            resolve(res);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    // Delete/Archive -- (TASKS)
    //
    //
    // TEAM MEMBERS
    // Create -- (TEAM MEMBERS)
    // Read -- (TEAM MEMBERS)
    fetchTeamMembers(context) {
      return new Promise((resolve, reject) => {
        let data = {
          company_id: context.state.selectedCompanyId,
        };
        authAxios
          .post(
            "get-company-employees",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            context.commit("setMembers", response.data.data.company_employees);
            resolve(response.data.data.company_employees);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    // Add New Member/Members -- (TEAM MEMBERS)
    addteamMembers(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "invite-members",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            response.data.data.members_added[0].joining_date = moment().format(
              "YYYY-MM-DD"
            );
            context.commit("setAddMembers", response.data.data);
            resolve(response.data.data);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    inviteMember(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post("invite-link", null, data)
          .then((response) => {
            if (response.data.user_type) {
              router.push({ name: "login" });
            } else {
              location.replace(response.data.url);
            }
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // Assign Team Member
    assignTeamMembers(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "assign-unassign-members",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            context.commit("updateUserRole", data);
            if (!localStorage.getItem("token")) {
              if (response.data.user_type) {
                router.push({ name: "login" });
              } else {
                location.replace(response.data.url);
              }
            }
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    fetchProjectMembers(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "project-member/get",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            if (!localStorage.getItem("token")) {
              if (response.data.user_type) {
                router.push({ name: "login" });
              } else {
                location.replace(response.data.url);
              }
            }
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    assignProjectMembers(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "project-member/add-remove",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            if (!localStorage.getItem("token")) {
              if (response.data.user_type) {
                router.push({ name: "login" });
              } else {
                location.replace(response.data.url);
              }
            }
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    // Update -- (TEAM MEMBERS)
    // Delete/Archive -- (TEAM MEMBERS)
    fetchArchieveMembers(context, payload) {
      return new Promise((resolve, reject) => {
        let data = {
          company_id: context.state.selectedCompanyId,
          search_col: payload
            ? payload.search_col
              ? payload.search_col
              : null
            : null,
        };
        authAxios
          .post(
            "archived-employees",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            context.commit(
              "setArchievedMembers",
              response.data.data.company_employees
            );
            resolve(response.data);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    // Archieve -- (TEAM MEMBER)
    archiveMember(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "archive-company-employee",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            context.commit("setMemberArchive", data);
            resolve(response);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },
    fetchRestoreMember(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "archive-company-employee",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then(() => {
            context.commit("setMemberRestore", data);
            resolve();
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    // COUNTRIES
    // Read -- (COUNTRIES)
    fetchCountries(context) {
      authAxios
        .post("get-countries", JSON.parse(localStorage.getItem("token")))
        .then((response) => {
          context.commit("setCountries", response.data);
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
          console.log(err);
        });
    },

    // CURRENCIES
    // Read -- (CURRENCIES)
    fetchCurrencies(context) {
      authAxios
        .post("get-currencies", JSON.parse(localStorage.getItem("token")))
        .then((response) => {
          context.commit("setCurrencies", response.data);
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
          console.log(err);
        });
    },
    // DEPARTMENTS
    //Create -- (DEPARTMENTS)
    createDepartment(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "create-department",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            context.commit("setCreateDepartment", response.data.data);
            resolve(response.data.data);
          })
          .catch((err) => {
            context.dispatch("checkAuth", err);
            reject(err);
          });
      });
    },

    // Read -- (DEPARMENTS)
    fetchDepartments(context, data) {
      authAxios
        .post(
          "get-departments",
          JSON.parse(localStorage.getItem("token")),
          data
        )
        .then((response) => {
          context.commit("setDepartments", response.data.data);
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
          console.log(err);
        });
    },

    //update user team member
    updateSingleUser(context, data) {
      return authAxios.post(
        "update-company-employee",
        JSON.parse(localStorage.getItem("token")),
        data
      );
    },

    //User Add currency
    AddCurrency(context, data) {
      return authAxios.post(
        "payroll-setting",
        JSON.parse(localStorage.getItem("token")),
        data
      );
    },

    // Payroll Info
    fetchPayroll(context, data) {
      context.commit("setRemovePayroll");
      return authAxios
        .post("payroll-info", JSON.parse(localStorage.getItem("token")), data)
        .then((response) => {
          context.commit("setPayroll", response.data.data);
          return response;
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
          console.log(err);
        });
    },
    // User details
    fetchUserDetails(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "get-user-detail",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            localStorage.setItem("role", response.data.data.role);
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    // Team Lead Members
    fetchTeamLeadMembers(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post(
            "team-members-listing",
            JSON.parse(localStorage.getItem("token")),
            data
          )
          .then((response) => {
            context.commit("setTeamLeadMembers", response.data.data);
            resolve(response.data.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    // Add role
    addUserRole(context, data) {
      return new Promise((resolve, reject) => {
        authAxios
          .post("add-role", JSON.parse(localStorage.getItem("token")), data)
          .then((response) => {
            context.commit("setUserRole", response.data.data);
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
  },

  modules: {
    auth,
    screenRecording,
    pendingComments,
    reports,
    sidebar,
    dashboard,
    project,
  },
};

let mutationNames = [];
for (let mutation in store.mutations) {
  mutationNames.push(mutation);
}

store.plugins = [
  createPersistedState(),
  createMutationsSharer({
    predicate: mutationNames.concat(auth.mutationNames),
  }),
];

export default new Vuex.Store(store);
