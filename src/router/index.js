import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/projects",
    name: "Projects",
    component: () =>
      import(/* webpackChunkName: "projects" */ "../views/Projects"),
  },
  {
    path: "/contact",
    name: "Contact",
    component: () =>
      import(/* webpackChunkName: "contact" */ "../views/Contact.vue"),
  },
  {
    path: "*",
    name: "NotFound",
    component: () =>
      import(/* webpackChunkName: "notfound" */ "../views/NotFoundError.vue"),
  },
];

const router = new VueRouter({
  routes,
  mode: "history",
  scrollBehavior: (to) => {
    if (to.hash) {
      return {
        selector: to.hash,
      };
    }
  },
});

export default router;
