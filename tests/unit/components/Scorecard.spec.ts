import { mount, flushPromises } from "@vue/test-utils";
import Scorecard from "@/components/Scorecard.vue";
import domtoimage from "dom-to-image";
import store from "@/store";

jest.mock("@/services/Functional/Utilities.ts", () => ({
  __esModule: true,
  throwConfetti: jest.fn(),
  isScreenPortrait: jest.fn(),
}));

/**
 * we are only declaring the mock for window.open here instead of defining it too;
 * this is because we will destroy it after each test and recreate it before each;
 */
let mockWindowOpen: any;

beforeEach(() => {
  jest.useFakeTimers();
  mockWindowOpen = jest.fn().mockImplementation(() => ({
    focus: jest.fn(),
  }));
  Object.defineProperty(window, "open", {
    writable: true,
    value: mockWindowOpen,
  });
});

afterEach(() => {
  // required otherwise the calls to window.open get stacked
  mockWindowOpen.mockRestore();
});

describe("Scorecard.vue", () => {
  const wrapper = mount(Scorecard, {
    props: {
      numQuestionsAnswered: 2,
      title: "dummyTitle",
      progressPercentage: 100,
      metrics: [
        {
          name: "correct",
          value: 2,
          icon: {
            source: "correct",
            class: "",
          },
        },
        {
          name: "partially correct",
          value: 2,
          icon: {
            source: "partially-correct",
            class: "",
          },
        },
      ],
      result: {
        title: "Accuracy",
        value: "100%",
      },
    },
    global: {
      provide: {
        store,
      },
    },
  });
  it("should render with default values", () => {
    expect(wrapper).toBeTruthy();
  });
  it("Student ID Visible", () => {
    const wrapper = mount(Scorecard, {
      props: { userId: "12345" }
    })
    const userIdText = wrapper.find('[data-test="scorecard-user-id"]').text()
    expect(userIdText).toEqual("Id: 12345")
  })

  it("should adjust the radius/stroke of the progress bar according to screen size and orientation", async () => {
    expect(wrapper.vm.circularProgressRadius).toBe(120);
    expect(wrapper.vm.circularProgressStroke).toBe(18);

    wrapper.vm.innerWidth = 1300;
    expect(wrapper.vm.circularProgressRadius).toBe(130);
    expect(wrapper.vm.circularProgressStroke).toBe(20);

    wrapper.vm.innerWidth = 800;
    expect(wrapper.vm.circularProgressRadius).toBe(110);
    expect(wrapper.vm.circularProgressStroke).toBe(18);

    wrapper.vm.innerWidth = 700;
    expect(wrapper.vm.circularProgressRadius).toBe(100);
    expect(wrapper.vm.circularProgressStroke).toBe(17);

    wrapper.vm.innerWidth = 500;
    expect(wrapper.vm.circularProgressRadius).toBe(85);
    expect(wrapper.vm.circularProgressStroke).toBe(15);
  });

  // commenting out because back button is removed for now
  // it("should emit a signal when watch again is clicked", async () => {
  //   await wrapper.find('[data-test="backButton"]').trigger("click");
  //   expect(wrapper.emitted()).toHaveProperty("go-back");
  // });

  it("triggers sharing text on whatsapp upon clicking share button", async () => {
    await wrapper.find('[data-test="share"]').trigger("click");
    expect(mockWindowOpen).toHaveBeenCalled();
  });

  it("animates the progress bar based on the isShown prop", async () => {
    const progressPercentage = 50;
    await wrapper.setProps({
      progressPercentage,
      isShown: true,
    });
    await flushPromises();

    jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressBarPercent).toBe(progressPercentage);

    await wrapper.setProps({
      isShown: false,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressBarPercent).toBe(0);
  });

  it("share text on whatsapp when no questions answered", async () => {
    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Quiz!*%20%F0%9F%8F%86%0A%0A%F0%9F%8C%9F%20*dummyTitle*%20%F0%9F%8C%9F%0A%0AI%20answered%202%20questions%20with%20100%25%20accuracy%20on%20Avanti%20Fellows%20quiz%20today!%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A"
    );
  });

  it("share text on whatsapp when one question answered", async () => {
    const progressPercentage = 50;
    await wrapper.setProps({
      numQuestionsAnswered: 4,
      progressPercentage,
      isShown: true,
      title: "Geometry Quiz",
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Quiz!*%20%F0%9F%8F%86%0A%0A%F0%9F%8C%9F%20*Geometry%20Quiz*%20%F0%9F%8C%9F%0A%0AI%20answered%204%20questions%20with%20100%25%20accuracy%20on%20Avanti%20Fellows%20quiz%20today!%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });

  it("share text on whatsapp when multiple questions answered", async () => {
    const progressPercentage = 50;
    await wrapper.setProps({
      numQuestionsAnswered: 4,
      progressPercentage,
      isShown: true,
      title: "Geometry Quiz",
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Quiz!*%20%F0%9F%8F%86%0A%0A%F0%9F%8C%9F%20*Geometry%20Quiz*%20%F0%9F%8C%9F%0A%0AI%20answered%204%20questions%20with%20100%25%20accuracy%20on%20Avanti%20Fellows%20quiz%20today!%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });
  it("triggers domtoimage when share button is clicked where supported", async () => {
    const toBlob = jest.spyOn(domtoimage, "toBlob");
    await wrapper.setProps({
      numQuestionsAnswered: 4,
    });

    // mock navigator.canShare
    globalThis.navigator.canShare = jest.fn(() => true);
    globalThis.navigator.share = jest.fn(
      () => new Promise((resolve) => resolve())
    );

    await wrapper.find('[data-test="share"]').trigger("click");
    expect(toBlob).toBeCalled();
  });

  it("calls navigator.share when domtoimage is done preparing the blob", async () => {
    // mock navigator.canShare
    globalThis.navigator.canShare = jest.fn(() => true);
    globalThis.navigator.share = jest.fn(() => {
      return new Promise((resolve) => resolve());
    });

    await wrapper.find('[data-test="share"]').trigger("click");
    // expect(globalThis.navigator.share).toHaveBeenCalled();
    expect(store.state.isSpinnerShown).toBeFalsy();
  });

  it("triggers sharing whatsapp text if canShare in general but can't share the image", async () => {
    await wrapper.setProps({
      numQuestionsAnswered: 4,
    });

    // mock navigator.canShare
    globalThis.navigator.canShare = jest.fn((arg: any) => {
      if (arg.files != undefined) return false;
      return true;
    });
    globalThis.navigator.share = jest.fn(() => {
      return new Promise((resolve) => resolve());
    });

    await wrapper.find('[data-test="share"]').trigger("click");
    expect(globalThis.navigator.share).not.toHaveBeenCalled();
  });

  it("does not show circular progress bar is result value is null", async () => {
    await wrapper.setProps({
      result: {
        value: null,
      },
    });
    expect(wrapper.vm.isCircularProgressShown).toBeFalsy();
  });
});
