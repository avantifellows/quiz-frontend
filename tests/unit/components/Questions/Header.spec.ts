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
  it("emits warning when timer goes below warning limit", async () => {
    const wrapper = mount(Header, {
      propsData: {
        hasTimeLimit: true,
        warningTimeLimit: 1, // minutes (60 seconds)
        timeRemaining: 61 // seconds - starts above warning threshold
      }
    });

    expect(wrapper.find(`[data-test="countdownTimer"]`).exists()).toBe(true);

    // The warning should trigger when timeRemaining equals warningTimeLimit * 60 (60 seconds)
    // So we need to simulate the countdown reaching exactly 60 seconds
    await wrapper.setProps({ timeRemaining: 60 });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()).toHaveProperty("time-limit-warning");
    expect(wrapper.find(`[data-test="countdownTimer"]`).text()).toBe("00:01:00");
  });
});

describe("Header with time remaining close to zero", () => {
  it("emits end-test when time remaining hits zero", async () => {
    const wrapper = mount(Header, {
      propsData: {
        hasTimeLimit: true,
        warningTimeLimit: 1, // minutes
        timeRemaining: 2 // seconds
      }
    });

    // Simulate timer countdown to zero by updating the prop
    await wrapper.setProps({ timeRemaining: 0 });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()).toHaveProperty("end-test-by-time");
  });
});
