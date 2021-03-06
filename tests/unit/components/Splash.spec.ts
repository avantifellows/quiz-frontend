import { mount } from "@vue/test-utils";
import Splash from "@/components/Splash.vue";

describe("Splash.vue", () => {
  const title = "Geometry Quiz";
  const subject = "Maths";
  const quizType = "assessment";
  const numQuestions = 3;
  const grade = "8";
  const wrapper = mount(Splash, {
    props: {
      title,
      subject,
      quizType,
      numQuestions,
      grade,
    },
  });

  it("renders props correctly", () => {
    expect(wrapper.find('[data-test="title"]').text()).toBe(title);
    expect(wrapper.find('[data-test="subject"]').text()).toBe(subject);
    expect(wrapper.find('[data-test="quizType"]').text()).toBe(quizType);
    expect(wrapper.find('[data-test="numQuestions"]').text()).toContain(
      numQuestions + ""
    );
    expect(wrapper.find('[data-test="grade"]').text()).toContain(grade + "");
  });

  it("disables the start button if session data has not been fetched", async () => {
    await wrapper.setProps({ isFirstSession: null })
    await wrapper.find('[data-test="startQuiz"]').trigger("click");
    expect(wrapper.emitted()).toEqual({});
  })

  it("emits start when start button is active and clicked", async () => {
    await wrapper.setProps({ isFirstSession: true })
    await wrapper.find('[data-test="startQuiz"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("start");
  });
});
