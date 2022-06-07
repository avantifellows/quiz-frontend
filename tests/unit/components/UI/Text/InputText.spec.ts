import { mount } from "@vue/test-utils";
import InputText from "@/components/UI/Text/InputText.vue";

describe("InputText.vue", () => {
  const wrapper = mount(InputText);
  it("should render with default values", () => {
    expect(wrapper).toBeTruthy();
  });

  it("should render title correctly", async () => {
    const title = "test title";
    await wrapper.setProps({
      title,
    });
    expect(wrapper.find('[data-test="title"]').text()).toBe(title);
  });

  it("renders valid messages correctly", async () => {
    const validation = {
      enabled: true,
      isValid: true,
      validMessage: "valid",
    };
    await wrapper.setProps({
      inputValidation: validation,
    });

    await expect(wrapper.find('[data-test="validationMessage"]').text()).toBe(
      validation.validMessage
    );
  });

  it("renders invalid messages correctly", async () => {
    const validation = {
      enabled: true,
      isValid: false,
      invalidMessage: "invalid",
    };
    await wrapper.setProps({
      inputValidation: validation,
    });

    expect(wrapper.find('[data-test="validationMessage"]').text()).toBe(
      validation.invalidMessage
    );
  });
});
