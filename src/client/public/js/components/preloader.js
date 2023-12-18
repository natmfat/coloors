import { elements } from "/js/utils/elements.js";
import * as a from "/js/utils/animations.js";
import { $ } from "/js/utils/elements.js";

const { div } = elements;

// preloader component
export default () => div({ class: "preloader" }, div({ class: "spinner" }));

export const remove = (element) => {
  if (element) {
    a.fadeOut(element, { remove: true, delay: 0.1 });
  }
};

addEventListener("DOMContentLoaded", () => {
  remove($(".preloader"));
});
