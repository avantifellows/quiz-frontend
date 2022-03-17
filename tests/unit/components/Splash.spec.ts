import { mount } from "@vue/test-utils";
import Splash from "@/components/Splash.vue";

describe("Splash.vue", () => {
    it("renders title correctly", () => {
        const title = "Geometry Quiz";
        const subject = "Maths";
        const examType = "CBSE";
        const numQuestions = 3;
        const classNumber = 8;
        const wrapper = mount(Splash, {
            props: {
                title: title,
                subject: subject,
                examType: examType,
                numQuestions: numQuestions,
                classNumber: classNumber,
            },
        });
        expect(wrapper.find('[data-test="title"]').text()).toBe(title);
        expect(wrapper.find('[data-test="subject"]').text()).toBe(subject);
        expect(wrapper.find('[data-test="examType"]').text()).toBe(examType);
        expect(wrapper.find('[data-test="numQuestions"]').text()).toContain(numQuestions + "");
        expect(wrapper.find('[data-test="classNumber"]').text()).toContain(classNumber + "");

    });
    it("emits start when start button is clicked", async () => {
        const wrapper = mount(Splash);
        await wrapper.find('[data-test="startQuiz"]').trigger('click');
        expect(wrapper.emitted()).toHaveProperty("start");
    });
});
