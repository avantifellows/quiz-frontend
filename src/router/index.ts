import { createRouter, createWebHistory } from "vue-router";

const requiredAuthKeys = ["userId", "api_key"];

const routes = [
  {
    path: "/quiz/:quizId",
    name: "Player",
    props: (route: any) => ({
      quizId: route.params.quizId,
      thirdPartyUserId: route.query.user_id,
      thirdPartyApiKey: route.query.api_key,
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
  if (to.meta.requiresAuth) {
    const queryParams = Object.keys(to.query);
    const isThirdPartyAuth =
      requiredAuthKeys.every((key) => queryParams.includes(key)) &&
      queryParams.every(
        (key) => to.query[key] != "" && to.query[key] != undefined
      );
    if (!isThirdPartyAuth) {
      return {
        name: "403",
      };
    }
  }
}
);

export default router;
