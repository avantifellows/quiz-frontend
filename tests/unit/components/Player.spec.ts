import { mount } from "@vue/test-utils";
import Player from "@/views/Player.vue";
import router from "@/router"
import OrganizationAPIService from "@/services/API/Organization"
import mockAxios from "jest-mock-axios";

export const BASE_URL = 'http://127.0.0.1:8000';

describe("Player.vue", () => {
  const quizId = "62540adb0f748c8e206c1612";
  const userId = "1";
  let apiKey = "6qOO8UdF1EGxLgzwIbQN";

  const spy = jest.spyOn(OrganizationAPIService, "checkAuthToken");

  const wrapper = mount(Player, {
    global: {
      plugins: [router]
    },

    props: {
      quizId,
      userId,
      apiKey,
    },

  });

  afterEach(() => {
    mockAxios.reset();
  });

  it("renders props correctly", () => {
    expect(wrapper.props().quizId).toBe('62540adb0f748c8e206c1612');
    expect(wrapper.props().userId).toBe('1');
    expect(wrapper.props().apiKey).toBe('6qOO8UdF1EGxLgzwIbQN')
  });

  it("renders component properly", () => {
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(apiKey);
    expect(wrapper.findComponent(Player).exists()).toBe(true);
  });

  it("403 page if apiKey is not authorized", async () => {
    apiKey = '123'
    mount(Player, {
      global: {
        plugins: [router]
      },
      props: {
        quizId,
        userId,
        apiKey,
      },
    });

    const spy = jest.spyOn(OrganizationAPIService, "checkAuthToken");
    expect(spy).toHaveBeenCalledWith('123');
  });
})
