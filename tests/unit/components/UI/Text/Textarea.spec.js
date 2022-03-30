import { mount } from "@vue/test-utils";
import Textarea from "@/components/UI/Text/Textarea";

describe("Textarea.vue", () => {
  const wrapper = mount(Textarea);
  it("should render placeholder correctly", async () => {
    const placeholder = "test placeholder";
    await wrapper.setProps({
      placeholder: placeholder,
    });
    expect(wrapper.find('[data-test="input"]').attributes("placeholder")).toBe(
      placeholder
    );
  });

  it("input should get disabled", async () => {
    await wrapper.setProps({
      isDisabled: true,
    });
    expect(wrapper.find('[data-test="input"]').element.disabled).toBe(true);
  });

  it("renders value sent through prop", async () => {
    const value = 10;
    await wrapper.setProps({
      value: value,
    });

    expect(wrapper.find('[data-test="input"]').element.value).toBe(
      String(value)
    );
  });

  it("renders value set through input field", async () => {
    const value = 10;
    const input = wrapper.find('[data-test="input"]');
    await input.setValue(value);

    expect(input.element.value).toBe(String(value));
  });
});
