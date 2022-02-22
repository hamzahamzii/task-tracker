// This queue is responsible for sending comments in a task that is pending
// i.e. not been created yet (by API)
import { eventBus } from "@/main";

const state = {
  commentsQueue: [],
};
const getters = {
  getCommentsQueue: (state) => state.commentsQueue,
};
const mutations = {
  // Add comment in queue
  pushCommentRequest(state, payload) {
    state.commentsQueue.push(payload);
  },
  // Remove comment from queue
  popCommentRequest(state, reqId) {
    state.commentsQueue = state.commentsQueue.filter((item) => {
      return item.id != reqId;
    });
    if (!state.commentsQueue.length) {
      eventBus.$emit("commentsPosted");
    }
  },
};
const actions = {
  // Retry sending comments when task has been created
  async retryCommentsQueue(context, payload) {
    for (let req of context.state.commentsQueue) {
      req.task_id = payload;
      eventBus.$emit("create-comment", req);
    }
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
