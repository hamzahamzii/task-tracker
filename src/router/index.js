import Vue from "vue";
import VueRouter from "vue-router";
import Store from "@/store";
Vue.use(VueRouter);
const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      meta: { title: "Login", layout: "simple", requireAuth: true },
      component: require("@/views/Pages/Login").default,
    },
    {
      path: "/login",
      name: "login",
      meta: { title: "Login", layout: "simple" },
      component: require("@/views/Pages/Login").default,
    },
    {
      path: "/signup",
      name: "signup",
      meta: { title: "SignUp User", layout: "simple" },
      component: require("@/components/Auth/SignUpUser").default,
    },
    {
      path: "/extension",
      name: "extension",
      meta: { title: "TTA Extension", layout: "simple" },
      component: require("@/views/Pages/Extension").default,
    },
    {
      path: "/set-password/:token/:email",
      name: "setpassword",
      meta: { title: "Set Password", layout: "simple" },
      component: require("@/components/Auth/SetPassword").default,
    },
    {
      path: "/invitation/accept/:token/:email",
      name: "acceptInvitation",
      meta: { title: "Account Setup", layout: "simple" },
      component: require("@/components/Auth/InviteSetup").default,
    },
    {
      path: "/forget-password",
      name: "forgetpassword",
      meta: { title: "Forget Password", layout: "simple" },
      component: require("@/components/Auth/ForgetPassword").default,
    },
    {
      path: "/invite/:cid/:token",
      name: "invitationLink",
      meta: { title: "Invitation Link", layout: "simple" },
      component: require("@/components/Auth/InvitationLink").default,
    },
    {
      path: "/reset-password/:token/:email",
      name: "resetpassword",
      meta: { title: "Forget Password", layout: "simple" },
      component: require("@/components/Auth/ResetPassword").default,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      meta: { title: "Dashboard", layout: "app", requireAuth: true },
      component: require("@/views/Pages/Dashboard").default,
    },
    {
      path: "/task",
      name: "task",
      meta: { title: "Task Tracker", layout: "app", requireAuth: true },
      component: require("@/views/Pages/Task").default,
    },
    {
      path: "/reports",
      name: "reports",
      meta: { title: "Reports", layout: "app", requireAuth: true },
      component: require("@/views/Pages/Reports").default,
    },    
    {
      path: "/companysettings",
      name: "companySettings",
      meta: { title: "Settings", layout: "app", requireAuth: true },
      component: require("@/views/Pages/CompanySettings").default,
    },
    {
      path: "/member",
      name: "member",
      meta: { title: "Team Members", layout: "app", requireAuth: true },
      component: require("@/views/Pages/TeamMember").default,

      beforeEnter: (to, from, next) => {
        if (
          Store.getters.getSelectedCompany.role == "employee" ||
          (Store.getters.getSelectedCompany.role == "admin" &&
            !Store.getters.getSelectedCompany.permissions.team_member &&
            Store.getters.getSelectedCompany.permissions.project)
        ) {
          next({ name: "task" });
        } else {
          next();
        }
      },
    },
    {
      path: "/*",
      name: "404",
      meta: { title: "NotFound", layout: "simple" },
      component: require("@/views/Pages/404.vue").default,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);
  if (nearestWithTitle)
    document.title = `${nearestWithTitle.meta.title} | GIGS Timer`;
  if (to.matched.some((record) => record.meta.requireAuth)) {
    if (!localStorage.getItem("token")) {
      next({
        name: "login",
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
