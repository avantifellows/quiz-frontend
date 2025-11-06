import { createRouter, createWebHistory } from "vue-router";
import { getPortalIdentifiers, getCachedPortalIdentifiers } from "@/services/portalAuth";
import type { PortalIdentifiers, DisplayIdType } from "@/types";

declare module "vue-router" {
  interface RouteMeta {
    portalIdentifiers?: PortalIdentifiers | null;
  }
}

const requiredAuthKeys = ["apiKey"];

const getQueryValue = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  if (Array.isArray(value) && value.length > 0) {
    const [first] = value;
    return typeof first === "string" && first.trim() !== "" ? first.trim() : null;
  }
  return null;
};

const resolvePortalData = (route: any): PortalIdentifiers | null => {
  return (
    (route.meta?.portalIdentifiers as PortalIdentifiers | null) ??
    getCachedPortalIdentifiers()
  );
};

const resolveUserId = (route: any): string | null => {
  const fromQuery = getQueryValue(route.query.userId);
  if (fromQuery) return fromQuery;
  return resolvePortalData(route)?.userId ?? null;
};

const resolveDisplayData = (
  route: any
): { displayId: string | null; displayIdType: DisplayIdType } => {
  const userIdFromQuery = getQueryValue(route.query.userId);

  if (userIdFromQuery) {
    return {
      displayId: userIdFromQuery,
      displayIdType: "user_id",
    };
  }

  const portalData = resolvePortalData(route);
  if (!portalData) {
    return { displayId: null, displayIdType: null };
  }

  if (portalData.displayId) {
    return {
      displayId: portalData.displayId,
      displayIdType: portalData.displayIdType ?? null,
    };
  }

  if (portalData.userId) {
    return {
      displayId: portalData.userId,
      displayIdType: "user_id",
    };
  }

  return { displayId: null, displayIdType: null };
};

const routes = [
  {
    path: "/quiz/:quizId",
    name: "Player",
    props: (route: any) => ({
      ...route.params,
      userId: resolveUserId(route),
      ...resolveDisplayData(route),
      apiKey: route.query.apiKey,
      omrMode: route.query.omrMode === "true",
      singlePageMode: route.query.singlePageMode === "true",
      autoStart: route.query.autoStart === "true"
    }),
    // lazy-loading: https://router.vuejs.org/guide/advanced/lazy-loading.html
    component: () =>
      import(/* webpackChunkName: "about" */ "@/views/Player.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/form/:quizId",
    name: "FormPlayer",
    props: (route: any) => ({
      ...route.params,
      userId: resolveUserId(route),
      ...resolveDisplayData(route),
      apiKey: route.query.apiKey,
      omrMode: route.query.omrMode === "true",
      singlePageMode: route.query.singlePageMode === "true",
      autoStart: route.query.autoStart === "true"
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
    path: "/quiz-not-available",
    name: "quiz-not-available",
    component: () =>
      import(/* webpackChunkName: "error" */ "@/views/Error.vue"),
    props: { type: "quiz-not-available" },
  },
  {
    path: "/form-not-available",
    name: "form-not-available",
    component: () =>
      import(/* webpackChunkName: "error" */ "@/views/Error.vue"),
    props: { type: "form-not-available" },
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

router.beforeEach(async (to) => {
  /** Before each router, check if the user is a third party and therefore, needs authentication. */
  if (to.meta.requiresAuth) {
    const hasApiKey = requiredAuthKeys.every((key: string) => getQueryValue(to.query[key]) !== null);

    if (!hasApiKey) {
      return { name: "403" };
    }

    const userIdFromQuery = getQueryValue(to.query.userId);
    // check the cache
    let identifiers: PortalIdentifiers | null = resolvePortalData(to);

    if (!identifiers) {
      identifiers = await getPortalIdentifiers({ force: true });
    }

    to.meta.portalIdentifiers = identifiers;

    if (!userIdFromQuery && !identifiers?.userId) {
      return { name: "403" };
    }
  }
});

export default router;
