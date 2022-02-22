import authAxios from "@/services/api.service";
import router from "@/router";

import firebase from "firebase";
import "firebase/messaging";

const state = {
  loggedInUser: null,
};

const getters = {
  getLoggedInUser: (state) => state.loggedInUser,
};

const mutations = {
  setLoggedInUser(state, payload) {
    state.loggedInUser = payload;
  },
  setLogout(state, payload) {
    state.loggedInUser = null;
    payload.companies = null;
    payload.selectedCompanyId = null;
    payload.tasks = null;
    payload.project.projects = null;
    payload.reports.reports = null;
    payload.teamMembers = null;
    payload.filteredTeamMembers = null;
    payload.selectedProject = null;
    payload.ownerNames = null;
    payload.archivedMembers = null;
    localStorage.removeItem("role");
  },
  reset_user(state) {
    state.loggedInUser = null;
  },
  APP_DATA: (state, data) => {
    state.data = data;
  },
};

const actions = {
  forgetPasssword(NUll, data) {
    return authAxios.post("auth/forgot-password", null, data);
  },
  resetPassword(context, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post("auth/update-password", null, data)
        .then((response) => {
          if (!localStorage.getItem("token")) {
            context
              .dispatch("userLogin", {
                email: data.email,
                password: data.password,
              })
              .then((response) => {
                context.dispatch("fetchCompanies");
                resolve(response);
              })
              .catch((err) => {
                console.log(err);
              });
          }
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  reset({ commit }) {
    commit("reset_user");
    localStorage.clear();
    return Promise.resolve();
  },
  userRegister(context, user) {
    return authAxios
      .post("auth/trial-registration", null, user)
      .then((response) => {
        return response;
      });
  },
  setPassword(context, user) {
    return new Promise((resolve, reject) => {
      authAxios
        .post("auth/set-password", null, user)
        .then((response) => {
          if (!localStorage.getItem("token")) {
            context
              .dispatch("userLogin", {
                email: user.email,
                password: user.password,
              })
              .then((response) => {
                context.dispatch("fetchCompanies");
                resolve(response);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            let status = "loggedIn";
            localStorage.setItem("anotherTab", status);
          }
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  acceptInvitation(context, user) {
    authAxios
      .post("auth/is-already-verified", null, user)
      .then((response) => {
        console.log("responseAcceptInvitation", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  },
  accountSetup(context, user) {
    return new Promise((resolve, reject) => {
      authAxios
        .post("invitation/accept", null, user)
        .then((response) => {
          if (!localStorage.getItem("token")) {
            localStorage.setItem(
              "token",
              JSON.stringify(response.data.data.authorization)
            );
            authAxios.post(
              "set-fcm-token",
              JSON.parse(localStorage.getItem("token")),
              {
                token: localStorage.getItem("fcm_token"),
              }
            );
            context.commit("setLoggedInUser", response.data.data.auth_user);
            context.dispatch("fetchCompanies");
          }
          let statusLogin = true;
          localStorage.setItem("anotherTab", statusLogin);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  userLogin(context, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post("auth/backoffice/login", null, data)
        .then((response) => {
          context.commit("setLoggedInUser", response.data.data.auth_user);
          localStorage.setItem(
            "token",
            JSON.stringify(response.data.data.authorization)
          );
          if (localStorage.getItem("fcm_token")) {
            authAxios.post(
              "set-fcm-token",
              JSON.parse(localStorage.getItem("token")),
              {
                token: localStorage.getItem("fcm_token"),
              }
            );
            window.console.log(localStorage.getItem("fcm_token"));
          } else if (navigator.userAgent.indexOf("Chrome") > -1) {
            firebase
              .messaging()
              .requestPermission()
              .then(() => {
                return firebase
                  .messaging()
                  .getToken()
                  .then((token) => {
                    console.log("token", token);
                    localStorage.setItem("fcm_token", token);
                    authAxios.post(
                      "set-fcm-token",
                      JSON.parse(localStorage.getItem("token")),
                      {
                        token: localStorage.getItem("fcm_token"),
                      }
                    );
                  })
                  .catch((err) => {
                    console.log("unable to get token", err);
                  });
              });
          }
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  logout(context) {
    context.commit("resetScreenRecorder");
    context.commit("setActiveTask", null);
    context.commit("resetTimer");
    localStorage.removeItem("selectedTask");
    if (localStorage.getItem("fcm_token"))
      authAxios.post(
        "remove-fcm-token",
        JSON.parse(localStorage.getItem("token")),
        {
          token: localStorage.getItem("fcm_token"),
        }
      );
    authAxios
      .post("auth/backoffice/logout", JSON.parse(localStorage.getItem("token")))
      .then(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("fcm_token");
        context.commit("setLogout", context.rootState);
        context.commit("resetTimer");
        router.push({ name: "login" });
        context.commit("resetTaskFilters");
      })
      .catch((err) => {
        console.log("error", err);
      });
  },
  userProfile(context, data) {
    return authAxios
      .post("update-profile", JSON.parse(localStorage.getItem("token")), data)
      .then((response) => {
        context.commit("setLoggedInUser", response.data.data);
        return response;
      });
  },
};

let mutationNames = [];

for (let mutation in mutations) {
  mutationNames.push(mutation);
}

export default {
  state,
  getters,
  mutations,
  actions,
  mutationNames,
};
