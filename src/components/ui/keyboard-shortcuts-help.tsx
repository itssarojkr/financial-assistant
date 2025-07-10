import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Keyboard, Command } from 'lucide-react';

interface ShortcutItem {
  keys: string;
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: 'Ctrl + S', description: 'Save current calculation' },
  { keys: 'Ctrl + Enter', description: 'Calculate taxes' },
  { keys: 'Alt + →', description: 'Next step' },
  { keys: 'Alt + ←', description: 'Previous step' },
  { keys: 'Tab', description: 'Navigate between fields' },
  { keys: 'Escape', description: 'Close modals/dropdowns' },
];

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Command className="w-5 h-5" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 Tip: These shortcuts work when you're not typing in input fields.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};