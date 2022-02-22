import authAxios from "./api.service.js";
import store from "@/store/index";

//Retry request
//Remove from queue on response/error
var retry = (request) => {
  //call API and remove request from queue with request's id
  return new Promise((resolve, reject) => {
    authAxios
      .post(request.endpoint, request.token, request.body)
      .then((res) => {
        request.success(res);
        store.commit("popRequest", request.id);
        resolve(res);
      })
      .catch((err) => {
        let body = request.body;
        store.commit("popRequest", request.id);
        reject({
          err,
          body,
        });
      });
  });
};

//Service module
//Provides post requests
//Pushes to queue if request is made in offline state
const RequestQueue = {
  post: (endpoint, token, body, success) => {
    return new Promise((resolve, reject) => {
      let id = Date.now();
      let request = {
        id,
        endpoint,
        token,
        body,
        success,
      };

      //if offline
      if (!navigator.onLine) {
        //push to request queue
        store.commit("pushRequest", request);
        return;
      }

      authAxios
        .post(endpoint, token, body)
        .then((res) => {
          success(res);
          store.commit("popRequest", request.id);
          resolve(res);
        })
        .catch((err) => {
          store.commit("popRequest", request.id);
          reject(err);
        });
    });
  },

  //Starts trying every request in queue
  startQueue: () => {
    return new Promise((resolve, reject) => {
      retry(store.state.queue[0])
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

export default RequestQueue;
