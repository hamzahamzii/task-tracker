import authAxios from "@/services/api.service.js";

const state = {
  dashboard: null,
};
const getters = {};
const mutations = {};
const actions = {
  // Dashboard Data
  fetchDashboard(context, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post("get-dashboard", JSON.parse(localStorage.getItem("token")), data)
        .then((response) => {
          resolve(response.data.data);
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
