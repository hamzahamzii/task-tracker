const nameRules = [
  (v) => !!v || "Name is required",
  (v) => (v && v.length <= 40) || "Name must be less than 40 characters",
];
const projectNameRules = [
  (v) => !!v || "Name is required",
  (v) => (v && v.length <= 30) || "Name must be less than 30 characters",
];
const phoneNumberRules = [
  // (v) => (v && v.length > 12) || "Number cannot greater than 12 characters",
  (value) => value.length <= 12 || "Max 12 characters",
];

const emailRules = [
  (v) => !!v || "Email is required",
  (v) =>
    /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/.test(
      v
    ) || "Email must be valid",
];

const required = [(v) => !!v || "Required."];

export { nameRules, emailRules, required, projectNameRules, phoneNumberRules };
