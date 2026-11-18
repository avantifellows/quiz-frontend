import { mount } from "@vue/test-utils";
import InfoBar from "@/components/Questions/InfoBar.vue";

describe("InfoBar (homework / forms context strip)", () => {
  it("shows the test name and ID", () => {
    const wrapper = mount(InfoBar, { props: { title: "Weekly Homework 3", userId: "test_student" } });
    expect(wrapper.find('[data-test="test-name"]').text()).toBe("Weekly Homework 3");
    expect(wrapper.find('[data-test="user-id"]').text()).toBe("ID: test_student");
  });

  it("prefers the display id over the user id", () => {
    const wrapper = mount(InfoBar, { props: { title: "HW", userId: "u1", displayId: "20185600341" } });
    expect(wrapper.find('[data-test="user-id"]').text()).toBe("ID: 20185600341");
  });

  it("renders nothing when there is neither a title nor an ID", () => {
    const wrapper = mount(InfoBar, { props: { title: null } });
    expect(wrapper.find('[data-test="test-name"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="user-id"]').exists()).toBe(false);
  });
});
