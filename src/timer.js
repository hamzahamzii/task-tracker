// Helper functions for performing operations on time
import moment from "moment";
export default {
  // format time in HH:mm:ss
  format(timeSpent) {
    if (!timeSpent) return "00:00:00";
    // Calculating in hours,minutes,seconds
    let hours = Math.floor(timeSpent / 3600);
    let minutes = Math.floor((timeSpent - hours * 3600) / 60);
    let seconds = timeSpent - hours * 3600 - minutes * 60;

    // Adding zero prefixes
    hours < 10 ? (hours = "0" + hours) : () => {};
    minutes < 10 ? (minutes = "0" + minutes) : () => {};
    seconds < 10 ? (seconds = "0" + seconds) : () => {};

    // Final time spent in HH:mm:ss where hours have no upperbound
    let timeInHMS = hours + ":" + minutes + ":" + seconds;

    return timeInHMS;
  },
  formatTimerAnalog(timeSpent) {
    let sec = moment(timeSpent, "HH:mm:ss").format("s");
    let min = moment(timeSpent, "HH:mm:ss").format("m");
    let hour = moment(timeSpent, "HH:mm:ss").format("HH");
    if (sec < 60 && min <= 0 && hour <= 0) {
      let timeFormat =
        moment(timeSpent, "HH:mm:ss").format("s") + "  secs" + "  GIGS Timer";
      return timeFormat;
    } else if (min > 0 && hour == 0) {
      let timeFormat =
        moment(timeSpent, "HH:mm:ss").format("m:ss") + " mins" + "  GIGS Timer";
      return timeFormat;
    } else if (hour > 0) {
      return timeSpent;
    }
  },
};
