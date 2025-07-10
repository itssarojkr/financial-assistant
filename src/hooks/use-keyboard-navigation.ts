import { useEffect } from 'react';

interface UseKeyboardNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onCalculate?: () => void;
  enableShortcuts?: boolean;
}

export const useKeyboardNavigation = ({
  onNext,
  onPrevious,
  onSave,
  onCalculate,
  enableShortcuts = true
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    if (!enableShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave?.();
        return;
      }

      // Ctrl/Cmd + Enter to calculate
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        onCalculate?.();
        return;
      }

      // Arrow keys for navigation
      if (event.altKey) {
        switch (event.key) {
          case 'ArrowRight':
            event.preventDefault();
            onNext?.();
            break;
          case 'ArrowLeft':
            event.preventDefault();
            onPrevious?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, onSave, onCalculate, enableShortcuts]);

  return {
    shortcuts: {
      save: 'Ctrl+S',
      calculate: 'Ctrl+Enter',
      next: 'Alt+→',
      previous: 'Alt+←'
    }
  };
};