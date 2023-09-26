import { mount, VueWrapper } from '@vue/test-utils';
import InstructionPage from '@/components/InstructionPage.vue';

describe('InstructionPage', () => {
  // When test_format is 'full_syllabus_test'
  describe('when test_format is full_syllabus_test', () => {
    const wrapper = mount(InstructionPage, {
      propsData: {
        questionSets: [
          {
            _id:"64bf709a8b60731c693290c1",
            title: "Question Set 0",
            description: "You may attempt all questions",
            maxQuestionsAllowedToAttempt: 4,
          },
          {
            _id:"64bf709a8b60731c693290c8",
            title: "Question Set 1",
            description: "You may attempt all questions",
            maxQuestionsAllowedToAttempt: 4,
          },
          // Add more questionSets as needed
        ],
      },
      props: {
        title: "Geometry Quiz",
        subject: "Maths",
        quizType: "assessment",
        maxQuestionsAllowedToAttempt: 3,
        grade: "8",
        maxMarks: 30,
        quizTimeLimit: 3,
        test_format: "major_test",
      },
    });

    it("renders props correctly", () => {
      expect(wrapper.find('[data-test="title"]').text()).toBe("Geometry Quiz");
      expect(wrapper.find('[data-test="subject"]').text()).toBe("Maths");
      expect(wrapper.find('[data-test="test-format"]').text()).toContain("major_test");
      expect(wrapper.find('[data-test="num-questions"]').text()).toContain(3);
      expect(wrapper.find('[data-test="num-questions"]').text()).toContain(3);
      expect(wrapper.find('[data-test="total-marks"]').text()).toContain(30);
    });

    // afterEach(() => {
    //   (wrapper as VueWrapper<InstanceType<typeof InstructionPage>>).unmount();
    // });
  });

  // When test_format is not 'full_syllabus_test'
  // describe('when test_format is not full_syllabus_test', () => {
  //   const wrapper = mount(InstructionPage, {
  //     propsData: {
  //       test_format: 'major_test', // Change this to the appropriate format
  //       questionSets: [
  //       {
  //         _id:"64bf709a8b60731c693290c1",
  //         title: "Question Set 0",
  //         description: "You may attempt all questions",
  //         maxQuestionsAllowedToAttempt: 4,
  //       },
  //       {
  //         _id:"64bf709a8b60731c693290c8",
  //         title: "Question Set 1",
  //         description: "You may attempt all questions",
  //         maxQuestionsAllowedToAttempt: 4,
  //       },
  //         // Add more questionSets as needed
  //       ],
  //     },
  //   });

  //   it('should run the other tests', () => {
  //     // Your other tests here
  //   });

  //   afterEach(() => {
  //     (wrapper as VueWrapper<InstanceType<typeof InstructionPage>>).unmount();
  //   });
  // });


});


// import { mount } from "@vue/test-utils";
// import InstructionPage from "@/components/InstructionPage.vue";

// describe("InstructionPage.vue", () => {
//     const title = "Geometry Quiz";
//     const subject = "Maths";
//     const quizType = "assessment";
//     const maxQuestionsAllowedToAttempt = 3;
//     const grade = "8";
//     const maxMarks = 30;
//     const quizTimeLimit = 3;
//     const test_format = "full_syllabus_test";
//     const wrapper = mount(InstructionPage, {
//       props: {
//         title,
//         subject,
//         quizType,
//         maxQuestionsAllowedToAttempt,
//         grade,
//         maxMarks,
//         quizTimeLimit
//       },
//     });

//     const testFormatMapping = new Map<string, string>([
//         ["full_syllabus_test", "Full Syllabus Test"],
//         ["major_test", "Major Test"],
//         ["part_test", "Part Test"],
//         ["chapter_test", "Chapter Test"],
//         ["hiring_test", "Hiring Test"],
//         ["evaluation_test", "Evaluation Test"],
//         ["homework", "Homework"]
//     ]);

//     it("renders props correctly", async () => {
//         const testCurrentQuestionIndex = 1;
//         const testQuestionSets = [
//         {
//           _id:"64bf709a8b60731c693290c1",
//           title: "Question Set 0",
//           description: "You may attempt all questions",
//           maxQuestionsAllowedToAttempt: 4,
//         },
//         {
//           _id:"64bf709a8b60731c693290c8",
//           title: "Question Set 1",
//           description: "You may attempt all questions",
//           maxQuestionsAllowedToAttempt: 4,
//         },
//       ];
//         await wrapper.setProps({
//         questionSets: testQuestionSets,
//         currentQuestionIndex: testCurrentQuestionIndex,
//         test_format: test_format
//       });
        // expect(wrapper.find('[data-test="title"]').text()).toBe(title);
        // expect(wrapper.find('[data-test="subject"]').text()).toBe(subject);
        // expect(wrapper.find('[data-test="test-format"]').text()).toBe(testFormatMapping.get(test_format));
        // expect(wrapper.find('[data-test="num-questions"]').text()).toContain(maxQuestionsAllowedToAttempt + "");
        // expect(wrapper.find('[data-test="num-questions"]').text()).toContain(quizTimeLimit + "");
        // expect(wrapper.find('[data-test="total-marks"]').text()).toContain(maxMarks + "");
//     });
// });