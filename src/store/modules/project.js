import Vue from "vue";
import Vuex from "vuex";
import authAxios from "@/services/api.service.js";

Vue.use(Vuex);

const state = {
  projects: null,
  selectedProject: null,
};
// NOTE: All getter names should start with 'get'
const getters = {
  getProjects: (state) =>
    state.projects
      ? state.projects
          .filter((item) => {
            return item ? item.name : false;
          })
          .sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
      : null,
  getProject: (state) => (id) =>
    state.projects
      ? state.projects.find((item) => {
          return item.id == id;
        })
      : null,
  getSelectedProject: (state) =>
    state.selectedProject ? state.selectedProject : null,
};

// NOTE: All mutations should have prototypes like this:
// mutationName(state, payload)
// All mutation names should start with 'set'
const mutations = {
  // PROJECTS
  // set All projects
  setProjects(state, payload) {
    state.projects = payload;
  },

  // set new created project
  setNewProject(state, payload) {
    state.projects.push(payload);
  },

  // set selected project
  setSelectedProject(state, payload) {
    state.selectedProject = payload;
  },

  // set delete project
  setDeleteProject(state, payload) {
    state.projects = state.projects.filter((item) => {
      return item.id != payload.project_id;
    });
  },
  // set updated project
  setUpdateProject(state, payload) {
    var id = state.projects.findIndex((item) => {
      return item.id == payload.id;
    });
    Object.assign(state.projects[id], payload);
  },
};

// Call API service (avoid using axios directly)
// Call mutations to update state accordingly (avoid updating state directly)
const actions = {
  // PROJECTS

  // Create -- (PROJECTS)
  createProject(context, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post("create-project", JSON.parse(localStorage.getItem("token")), data)
        .then((response) => {
          context.commit("setNewProject", response.data.data);
          resolve(response.data.data);
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
          reject(err);
        });
    });
  },

  // Read -- (PROJECTS)
  fetchProjects(context) {
    let data = {
      company_id: context.rootState.selectedCompanyId,
    };
    authAxios
      .post("get-projects", JSON.parse(localStorage.getItem("token")), data)
      .then((response) => {
        let all_projects = response.data;
        all_projects.map((project) => (project.edit = false));
        context.commit("setProjects", all_projects);
      })
      .catch((err) => {
        context.dispatch("checkAuth", err);
        console.log(err);
      });
  },

  // Update -- (PROJECTS)
  updateProject(context, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post("update-project", JSON.parse(localStorage.getItem("token")), data)
        .then((response) => {
          context.commit("setUpdateProject", {
            id: response.data.data.id,
            name: response.data.data.name,
            company_id: context.rootState.selectedCompanyId,
            edit: false,
          });
          resolve(response);
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
          reject(err);
        });
    });
  },

  // Delete/Archive -- (PROJECTS)
  deleteProject(context, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          "archive-project",
          JSON.parse(localStorage.getItem("token")),
          data
        )
        .then((response) => {
          console.log(response);
          context.commit("setDeleteProject", data);
          resolve(response);
        })
        .catch((err) => {
          context.dispatch("checkAuth", err);
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
