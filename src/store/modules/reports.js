import moment from "moment";
import authAxios from "@/services/api.service.js";

const state = {
  reports: null,
};

const getters = {
  getReports: (state) => state.reports,
};

const mutations = {
  setReports(state, payload) {
    state.reports = payload;
  },

  // Sorting on the basis of role (REPORTS)
  setRoleSorting(state, payload) {
    if (payload == "asc") {
      state.reports = state.reports.sort((a, b) => {
        return a.role.localeCompare(b.role);
      });
    } else if (payload == "desc") {
      state.reports = state.reports
        .sort((a, b) => {
          return a.role.localeCompare(b.role);
        })
        .reverse();
    }
  },

  // Sorting on the basis of Completed Tasks (REPORTS)
  setCompletedTaskSorting(state, payload) {
    if (payload == "asc") {
      state.reports = state.reports.sort((a, b) => {
        return a.completed - b.completed;
      });
    } else if (payload == "desc") {
      state.reports = state.reports
        .sort((a, b) => {
          return a.completed - b.completed;
        })
        .reverse();
    }
  },

  // Sorting on the basis of Pending Tasks (REPORTS)
  setPendingTaskSorting(state, payload) {
    if (payload == "asc") {
      state.reports = state.reports.sort((a, b) => {
        return a.pending - b.pending;
      });
    } else if (payload == "desc") {
      state.reports = state.reports
        .sort((a, b) => {
          return a.pending - b.pending;
        })
        .reverse();
    }
  },

  // Sorting on the basis of Overdue Tasks (REPORTS)
  setOverdueTaskSorting(state, payload) {
    if (payload == "asc") {
      state.reports = state.reports.sort((a, b) => {
        return a.overdue - b.overdue;
      });
    } else if (payload == "desc") {
      state.reports = state.reports
        .sort((a, b) => {
          return a.overdue - b.overdue;
        })
        .reverse();
    }
  },

  // Sorting on the basis of Time Spent Tasks (REPORTS)
  setTimeSpentSort(state, payload) {
    if (payload == "asc") {
      state.reports = state.reports.sort((a, b) => {
        return (
          moment.duration(a.total_time).asSeconds() -
          moment.duration(b.total_time).asSeconds()
        );
      });
    } else if (payload == "desc") {
      state.reports = state.reports
        .sort((a, b) => {
          return (
            moment.duration(a.total_time).asSeconds() -
            moment.duration(b.total_time).asSeconds()
          );
        })
        .reverse();
    }
  },
};

const actions = {
  fetchReports(context, payload) {
    let data = {
      company_id: context.rootState.selectedCompanyId,
      start_date:
        payload && payload.start_date
          ? payload.start_date
          :moment().subtract(1, "day").format("YYYY-MM-DD"), // TODAY (Default)
      end_date:
        payload && payload.end_date
          ? payload.end_date
          : moment().subtract(1, "day").format("YYYY-MM-DD"),
      search_col:
        payload && payload.search_col
          ? payload.search_col
          : {
              project_id: "",
              team_manager: "",
              member: "",
            },
    };
    return new Promise((resolve, reject) => {
      authAxios
        .post("report", JSON.parse(localStorage.getItem("token")), data)
        .then((response) => {
          context.commit("setReports", response.data.data);
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
