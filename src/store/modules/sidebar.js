// THIS STORE IS TO SAVE SIDEBAR PROPERTIES USED GLOBALLY
const state = {
  mini: true,
};
const getters = {
  getSidebarMini: (state) => state.mini,
};
const mutations = {
  setSidebarMini(state, payload) {
    state.mini = payload;
  },
};

export default {
  state,
  getters,
  mutations,
};
