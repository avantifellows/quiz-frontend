import { mount } from "@vue/test-utils";
import Header from "@/components/Questions/Header.vue";

describe("Header.vue", () => {
  const wrapper = mount(Header);
  it("works with default values", () => {
    expect(wrapper).toBeTruthy();
  });

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
