import { Directive, DirectiveBinding } from 'vue';

/**
 * Vue directive to add lazy loading to all images within an element
 * This is especially useful for v-html content where images are embedded
 *
 * Usage: v-lazy-images on any element containing images
 *
 * This adds loading="lazy" to all img tags which:
 * - Defers loading of off-screen images
 * - Reduces initial page load
 * - Improves performance for single-page mode with many questions
 */
export const lazyLoadImages: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // Find all img tags within the element
    const images = el.querySelectorAll('img');

    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      // Add native lazy loading attribute
      imgElement.setAttribute('loading', 'lazy');

      // Optionally add a placeholder or low-quality placeholder
      if (binding.value?.placeholder) {
        imgElement.setAttribute('data-src', imgElement.src);
        imgElement.src = binding.value.placeholder;
      }

      // Add decoding="async" for better performance
      imgElement.setAttribute('decoding', 'async');
    });
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    // Handle dynamically added images when content updates
    const images = el.querySelectorAll('img:not([loading])');

    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.setAttribute('loading', 'lazy');
      imgElement.setAttribute('decoding', 'async');

      if (binding.value?.placeholder && !imgElement.hasAttribute('data-src')) {
        imgElement.setAttribute('data-src', imgElement.src);
        imgElement.src = binding.value.placeholder;
      }
    });
  }
};

export default lazyLoadImages;
