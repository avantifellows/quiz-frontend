import { mount } from "@vue/test-utils";
import EndTestSummaryModal from "@/components/EndTestSummaryModal.vue";
import { EndTestBuckets } from "@/types";

const buckets: EndTestBuckets = {
  total: 75,
  answered: 5,
  notAnswered: 10,
  markedForReview: 2,
  notVisited: 58
};

function mountModal(variant: string) {
  return mount(EndTestSummaryModal, {
    props: {
      show: true,
      variant,
      buckets,
      isProcessing: false
    }
  });
}

describe("EndTestSummaryModal", () => {
  it("does not render when show is false", () => {
    const wrapper = mount(EndTestSummaryModal, {
      props: { show: false, variant: "exam", buckets, isProcessing: false }
    });
    expect(wrapper.find('[data-test="endTestSummaryModal"]').exists()).toBe(false);
  });

  it("renders all five buckets for the exam variant", () => {
    const wrapper = mountModal("exam");
    const stats = wrapper.vm.stats;
    expect(stats.map((s: { key: string }) => s.key)).toEqual([
      "total",
      "answered",
      "notAnswered",
      "markedForReview",
      "notVisited"
    ]);
  });

  it("renders only total/answered/notAnswered for the omr variant", () => {
    const wrapper = mountModal("omr");
    expect(wrapper.vm.stats.map((s: { key: string }) => s.key)).toEqual([
      "total",
      "answered",
      "notAnswered"
    ]);
  });

  it("maps bucket counts onto the stat values", () => {
    const wrapper = mountModal("exam");
    const byKey = Object.fromEntries(
      wrapper.vm.stats.map((s: { key: string; value: number }) => [s.key, s.value])
    );
    expect(byKey).toMatchObject({
      total: 75,
      answered: 5,
      notAnswered: 10,
      markedForReview: 2,
      notVisited: 58
    });
  });

  it("emits confirm and cancel on the respective buttons", async () => {
    const wrapper = mountModal("exam");
    await wrapper.find('[data-test="summaryYesButton"]').trigger("click");
    await wrapper.find('[data-test="summaryNoButton"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("confirm");
    expect(wrapper.emitted()).toHaveProperty("cancel");
  });

  it("shows the attempt limit only when it is below the total", () => {
    const limited = mount(EndTestSummaryModal, {
      props: { show: true, variant: "exam", buckets, maxQuestionsAllowedToAttempt: 37 }
    });
    expect(limited.find('[data-test="summaryAttemptLimit"]').text()).toBe(
      "You can attempt up to 37 questions."
    );

    const unlimited = mount(EndTestSummaryModal, {
      props: { show: true, variant: "exam", buckets, maxQuestionsAllowedToAttempt: buckets.total }
    });
    expect(unlimited.find('[data-test="summaryAttemptLimit"]').exists()).toBe(false);
  });

  it("disables the buttons while processing", () => {
    const wrapper = mount(EndTestSummaryModal, {
      props: { show: true, variant: "exam", buckets, isProcessing: true }
    });
    expect(
      wrapper.find('[data-test="summaryYesButton"]').attributes("disabled")
    ).toBeDefined();
    expect(
      wrapper.find('[data-test="summaryNoButton"]').attributes("disabled")
    ).toBeDefined();
  });
});
