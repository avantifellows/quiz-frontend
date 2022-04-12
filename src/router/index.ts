import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/:quizId",
    name: "Player",
    props: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "@/views/Player.vue"),
  },
  {
    path: "/404-not-found",
    name: "404",
    component: () =>
      import(/* webpackChunkName: "error" */ "@/views/Error.vue"),
    props: { type: "404" },
  },
  {
    // refer to: https://stackoverflow.com/a/64186073/7870587
    path: "/:pathMatch(.*)*",
    redirect: {
      name: "404",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
