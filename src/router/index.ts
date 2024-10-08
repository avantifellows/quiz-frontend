import { createRouter, createWebHistory } from "vue-router";

const requiredAuthKeys = ["userId", "apiKey"];

const routes = [
  {
    path: "/quiz/:quizId",
    name: "Player",
    props: (route: any) => ({
      ...route.params,
      userId: route.query.userId,
      apiKey: route.query.apiKey,
      review: route.query.review || null
    }),
    // lazy-loading: https://router.vuejs.org/guide/advanced/lazy-loading.html
    component: () =>
      import(/* webpackChunkName: "about" */ "@/views/Player.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/404-not-found",
    name: "404",
    component: () =>
      import(/* webpackChunkName: "error" */ "@/views/Error.vue"),
    props: { type: "404" },
  },
  {
    path: "/403-access-denied",
    name: "403",
    component: () =>
      import(/* webpackChunkName: "error" */ "@/views/Error.vue"),
    props: { type: "403" },
  },
  {
    path: "/",
    name: "LandingPage",
    component: () =>
      import("@/components/LandingPage.vue")
  },
  {
    // refer to: https://stackoverflow.com/a/64186073/7870587
    path: "/:pathMatch(.*)*",
    redirect: {
      name: "404",
      query: {}
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  /** Before each router, check if the user is a third party and therefore, needs authentication. */
  if (to.meta.requiresAuth) {
    const queryParams = Object.keys(to.query);
    const isAuthenticated =
      requiredAuthKeys.every((key: any) => queryParams.includes(key) && (to.query[key] != "" && to.query[key] != undefined))
    if (!isAuthenticated) {
      return {
        name: "403",
      };
    }
  }
}
);

export default router;
