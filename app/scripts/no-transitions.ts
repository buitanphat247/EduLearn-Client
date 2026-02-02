/**
 * Script để disable transitions trong quá trình hydration
 * Prevent flash of wrong styles during React hydration
 * 
 * This script is injected before React hydration to prevent
 * visual glitches when styles are applied during hydration.
 */
export const noTransitionsScript = `
  (function() {
    try {
      var html = document.documentElement;
      // Disable transitions initially to prevent flash during hydration
      html.classList.add('no-transitions');
      
      // Remove no-transitions after a longer delay to allow React hydration
      // This prevents the flash of wrong styles during client-side hydration
      var removeNoTransitions = function() {
        // Use longer delay to ensure React has fully hydrated
        setTimeout(function() {
          requestAnimationFrame(function() {
            html.classList.remove('no-transitions');
          });
        }, 100); // 100ms delay to allow hydration
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeNoTransitions);
      } else {
        removeNoTransitions();
      }
    } catch (e) {
      // Silent fail - script is non-critical
    }
  })();
`;
