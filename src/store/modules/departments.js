
import authAxios from "@/services/api.service.js";

const state = {
  departments: null,
};

// NOTE: All getter names should start with 'get'
const getters = {
  getDepartments: (state) => state.departments,
  // getDepartments: (state) => (state.departments ? state.departments : []),
};

// NOTE: All mutations should have prototypes like this:
// mutationName(state, payload)
// All mutation names should start with 'set'
const mutations = {
  // DEPARTMENTS
  // Read -- (DEPARTMENTS)
  setDepartments(state, payload) {
    state.departments = payload;
  },

  // Create -- (DEPARTMENTS)
  setCreateDepartment(state, payload) {
    state.departments.push(payload);
  },
};

// Call API service (avoid using axios directly)
// Call mutations to update state accordingly (avoid updating state directly)
const actions = {
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

};

export default {
  state,
  getters,
  mutations,
  actions,
};
