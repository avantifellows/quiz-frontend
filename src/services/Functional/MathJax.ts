import { nextTick } from "vue";

type MathJaxWindow = Window & {
  MathJax?: {
    startup?: {
      promise?: Promise<unknown>;
    };
    typesetClear?: (elements?: HTMLElement[]) => void;
    typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
  };
};

let typesetQueue: Promise<void> = Promise.resolve();

export function queueMathJaxTypeset(element?: HTMLElement | null) {
  if (!element) return typesetQueue;

  typesetQueue = typesetQueue
    .then(async () => {
      await nextTick();

      const mathJax = (window as MathJaxWindow).MathJax;
      if (!mathJax?.typesetPromise || !element.isConnected) return;

      if (mathJax.startup?.promise) {
        await mathJax.startup.promise;
      }

      if (!element.isConnected) return;

      if (typeof mathJax.typesetClear === "function") {
        mathJax.typesetClear([element]);
      }

      await mathJax.typesetPromise([element]);
    })
    .catch((error) => {
      console.error("MathJax typeset failed", error);
    });

  return typesetQueue;
}
