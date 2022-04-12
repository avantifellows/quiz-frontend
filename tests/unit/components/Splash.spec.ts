import { mount } from "@vue/test-utils";
import Splash from "@/components/Splash.vue";

describe("Splash.vue", () => {
  const title = "Geometry Quiz";
  const subject = "Maths";
  const quizType = "CBSE";
  const numQuestions = 3;
  const grade = "8";
  const wrapper = mount(Splash, {
    props: {
      title: title,
      subject: subject,
      quizType: quizType,
      numQuestions: numQuestions,
      grade: grade,
    },
  });

  it("renders title correctly", () => {
    expect(wrapper.find('[data-test="title"]').text()).toBe(title);
    expect(wrapper.find('[data-test="subject"]').text()).toBe(subject);
    expect(wrapper.find('[data-test="quizType"]').text()).toBe(quizType);
    expect(wrapper.find('[data-test="numQuestions"]').text()).toContain(
      numQuestions + ""
    );
    expect(wrapper.find('[data-test="grade"]').text()).toContain(grade + "");
  });
  it("emits start when start button is clicked", async () => {
    await wrapper.find('[data-test="startQuiz"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("start");
  });
});
