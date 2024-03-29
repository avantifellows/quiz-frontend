import { mount } from "@vue/test-utils";
import Header from "@/components/Questions/Header.vue";

describe("Basic tests on Header", () => {
  const wrapper = mount(Header);
  it("works with default values", () => {
    expect(wrapper).toBeTruthy();
  });

  describe("Title and ID Header", () => {
    it("Student ID Visible", () => {
      const wrapper = mount(Header, {
        props: { userId: "12345" }
      })
      const userIdText = wrapper.find('[data-test="user-id"]').text()
      expect(userIdText).toEqual("Id: 12345")
    })

    it("testname Visible", () => {
      const wrapper = mount(Header, {
        props: { title: "Mock Test series 1 for All over India for Government school Students by Avanti Fellows NGO" }
      })
      const testNameElement = wrapper.find('[data-test="test-name"]').text();
      expect(testNameElement).toEqual("Mock Test series 1 for All over India for Government school Students by Avanti Fellows NGO");
    })

    it("testName is truncating or not", () => {
      const testNameElement = wrapper.find('[data-test="test-name"]').text();
      const maxCharacterWidth = 12.6; // Maximum width in characters
      const expectedTruncatedText = testNameElement.slice(0, maxCharacterWidth) + '...'
      expect(expectedTruncatedText).toContain("...")
    })
  })

  it("emits end-test upon clicking End Test button", () => {
    wrapper.find('[data-test="endTestButton"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("end-test");
  });

  it("toggles palette visibility upon clicking hamburger", () => {
    expect(wrapper.vm.localIsPaletteVisible).toBeFalsy();
    wrapper.find('[data-test="togglePaletteButton"]').trigger("click");
    expect(wrapper.vm.localIsPaletteVisible).toBeTruthy();
  });

  it("clicking away from hamburger menu when palette visible closes palette", () => {
    wrapper.find('[data-test="togglePaletteButton"]').trigger("click");

    // click away
    wrapper.find('[data-test="endTestButton"]').trigger("click");
    expect(wrapper.vm.localIsPaletteVisible).toBeFalsy();
  });
});

describe("Header with no time limit", () => {
  const wrapper = mount(Header);
  it("does not display countdown timer when there is no time limit", async () => {
    await wrapper.setProps({
      hasTimeLimit: false
    });
    expect(wrapper.find(`[data-test="countdownTimer"]`).exists()).toBe(false);
  });
});

describe("Header with time limit and time remaining is close to warning time", () => {
  const wrapper = mount(Header, {
    propsData: {
      hasTimeLimit: true,
      warningTimeLimit: 1, // minutes
      timeRemaining: 61 // seconds
    }
  });
  it("emits warning when timer goes below warning limit", (done) => {
    expect(wrapper.find(`[data-test="countdownTimer"]`).exists()).toBe(true);
    // wait for 2 seconds to check changes
    setTimeout(() => {
      expect(wrapper.emitted()).toHaveProperty("time-limit-warning");
      expect(wrapper.find(`[data-test="countdownTimer"]`).text()).toBe("00:00:59")
      done()
    }, 2000);
  });
});

describe("Header with time remaining close to zero", () => {
  const wrapper = mount(Header, {
    propsData: {
      hasTimeLimit: true,
      warningTimeLimit: 1, // minutes
      timeRemaining: 1 // seconds
    }
  });
  it("emits end-test when time remaining hits zero", (done) => {
    // wait for 2 seconds to check changes
    setTimeout(() => {
      expect(wrapper.emitted()).toHaveProperty("end-test-by-time");
      done()
    }, 2000);
  });
});
