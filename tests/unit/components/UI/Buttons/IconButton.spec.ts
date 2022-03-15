import { mount } from "@vue/test-utils";
import IconButton from "@/components/UI/Buttons/IconButton.vue";

describe("IconButton.vue", () => {
  it("renders title correctly", () => {
    const buttonText = "Test Button";
    const wrapper = mount(IconButton.component, {
      props: {
        titleConfig: {
          value: buttonText,
        },
      },
    });
    expect(wrapper.text()).toMatch(buttonText);
  });
  it("renders icon correctly", () => {
    const iconName = "chevron-right-solid";
    const wrapper = mount(IconButton.component, {
      props: {
        iconConfig: {
          enabled: true,
          iconName: iconName,
        },
      },
    });
    const iconWrapper = wrapper.find('[data-test="icon"]');
    expect(iconWrapper.exists()).toBeTruthy();
    expect(wrapper.vm.iconName).toBe(iconName);
    expect(iconWrapper.attributes("class")).toContain(
      "stroke-0 text-white white"
    );
  });
});
