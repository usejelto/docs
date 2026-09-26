// styles.css's motion tokens for JavaScript: Svelte transitions, WAAPI and
// libraries take numbers and easing strings, not CSS custom properties.
// Import-free so the marketing bundle can share it. styles.test.ts keeps the
// two in step.

/** Half the fast tier: a control's press. */
export const PRESS_MS = 75
/** `--motion-fast`: controls, exits and routed content. */
export const FAST_MS = 150
/** `--motion-base`: surfaces, list moves and icon swaps. */
export const BASE_MS = 200
/** `--motion-enter`: one-shot entrances, card height and inline reveals. */
export const ENTER_MS = 240
/** `--ease`: every entrance decelerates on it. */
export const EASE = 'cubic-bezier(0.2, 0, 0, 1)'
/** `--ease-exit`: every exit accelerates away on it. */
export const EASE_EXIT = 'cubic-bezier(0.3, 0, 1, 1)'
