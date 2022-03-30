/**
 * custom logic for deciding when the screen is considered to be in portrait mode
 */
export function isScreenPortrait() {
  if (screen.availHeight > 0.8 * screen.availWidth) return true;
  return false;
}
