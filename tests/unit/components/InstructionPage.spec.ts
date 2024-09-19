import { mount } from '@vue/test-utils';
import InstructionPage from '@/components/InstructionPage.vue';

describe('InstructionPage', () => {
  describe('when test_format is not FST', () => {
    const wrapper = mount(InstructionPage, {
      props: {
        title: "Geometry Quiz",
        subject: "Maths",
        quizType: "assessment",
        maxQuestionsAllowedToAttempt: 3,
        grade: "8",
        maxMarks: 30,
        testFormat: "major_test",
        quizTimeLimit: { max: 10800, min: 0 },
        questionSetStates: [
          {
            title: "Maths - Set 0",
            instructionTest: "You may attempt all the questions",
            maxQuestionsAllowedToAttempt: 2,
            paletteItems: [
              { index: 0, value: "error" },
              { index: 1, value: "error" },
            ],
          },
        ],
      },
    });

    it("renders props correctly", () => {
      expect(wrapper.find('[data-test="title"]').text()).toBe("Geometry Quiz");
    });
  });

  describe('when switching to Hindi locale', () => {
    it('renders in Hindi', async () => {
      const wrapper = mount(InstructionPage);

      // Change the locale to Hindi
      wrapper.vm.$i18n.locale = 'hi';
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="title"]').text()).toContain("Geometry Quiz");
      expect(wrapper.find('[data-test="subject"]').text()).toContain("Maths");
      // Now the i18n-translated content should be in Hindi
      expect(wrapper.find('[data-test="generalInstructions.header"]').text()).toContain("सामान्य निर्देश");
    });
  });
});
