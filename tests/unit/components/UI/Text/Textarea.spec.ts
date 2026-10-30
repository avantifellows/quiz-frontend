import { mount } from "@vue/test-utils";
import Textarea from "@/components/UI/Text/Textarea.vue";

describe("Textarea.vue", () => {
  const wrapper = mount(Textarea);
  it("should render placeholder correctly", async () => {
    const placeholder = "test placeholder";
    await wrapper.setProps({
      placeholder,
    });
    expect(wrapper.find('[data-test="input"]').attributes("placeholder")).toBe(
      placeholder
    );
  });

  it("input should get disabled", async () => {
    await wrapper.setProps({
      isDisabled: true,
    });
    expect(
      (wrapper.find('[data-test="input"]').element as HTMLInputElement).disabled
    ).toBe(true);
  });

  it("renders value sent through prop", async () => {
    const value = 10;
    await wrapper.setProps({
      value,
    });

    expect(
      (wrapper.find('[data-test="input"]').element as HTMLInputElement).value
    ).toBe(String(value));
  });

  it("renders value set through input field", async () => {
    const value = 10;
    const input = wrapper.find('[data-test="input"]');
    await input.setValue(value);

    expect((input.element as HTMLInputElement).value).toBe(String(value));
  });

  describe("sanitizeValue", () => {
    const keepDigits = (value: string) => value.replace(/[^0-9]/g, "");

    it("cleans the typed value and emits the cleaned value", async () => {
      const wrapper = mount(Textarea, { props: { sanitizeValue: keepDigits } });
      const input = wrapper.find('[data-test="input"]');
      await input.setValue("7-6");

      expect((input.element as HTMLTextAreaElement).value).toBe("76");
      expect(wrapper.emitted("update:value")?.slice(-1)[0]).toEqual(["76"]);
    });

    it("shows the cleaned value even when it equals the previous value", async () => {
      // the parent's value does not change (7 -> 7), so only the textarea itself can
      // undo the invalid character on screen
      const wrapper = mount(Textarea, {
        props: { sanitizeValue: keepDigits, value: "7" },
      });
      const input = wrapper.find('[data-test="input"]');
      await input.setValue("7-");

      expect((input.element as HTMLTextAreaElement).value).toBe("7");
      expect(wrapper.emitted("update:value")?.slice(-1)[0]).toEqual(["7"]);
    });

    it("leaves the value untouched when no sanitizeValue is given", async () => {
      const wrapper = mount(Textarea);
      const input = wrapper.find('[data-test="input"]');
      await input.setValue("7-6");

      expect((input.element as HTMLTextAreaElement).value).toBe("7-6");
    });
  });
});
