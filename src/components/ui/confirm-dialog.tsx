import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          cancelButton: 'border-red-200 text-red-700 hover:bg-red-50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancelButton: 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancelButton: 'border-blue-200 text-blue-700 hover:bg-blue-50'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          cancelButton: 'border-green-200 text-green-700 hover:bg-green-50'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-gray-600" />,
          confirmButton: 'bg-gray-900 hover:bg-gray-800 text-white',
          cancelButton: 'border-gray-200 text-gray-700 hover:bg-gray-50'
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon || styles.icon}
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className={styles.cancelButton}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm}
            className={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 