const debug = false; //set to true to print console logs

export default {
  log: function(message) {
    if (debug) {
      console.log(message);
    }
  }
};
