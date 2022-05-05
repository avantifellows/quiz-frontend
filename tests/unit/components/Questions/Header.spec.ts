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
});
