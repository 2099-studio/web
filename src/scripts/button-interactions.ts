/**
 * Subtle press/hover feedback only — magnetic pull fought the custom cursor
 * and felt like the pointer was being pushed off buttons.
 */
export function initButtonInteractions(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Magnetic translate removed: with cursor:none it reads as repulsion/desync.
}
