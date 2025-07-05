import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, MoreVertical } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showMore?: boolean;
  onMoreClick?: () => void;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  onBack,
  showMenu = false,
  onMenuClick,
  showMore = false,
  onMoreClick,
  className = ''
}) => {
  const { isMobile, hapticFeedback } = useMobile();

  const handleBack = () => {
    hapticFeedback('light');
    onBack?.();
  };

  const handleMenuClick = () => {
    hapticFeedback('light');
    onMenuClick?.();
  };

  const handleMoreClick = () => {
    hapticFeedback('light');
    onMoreClick?.();
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Header */}
      {(title || showBackButton || showMenu || showMore) && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {showMenu && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMenuClick}
                  className="p-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              )}
            </div>
            {showMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoreClick}
                className="p-2"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Content */}
      <div className="p-4 pb-20">
        {children}
      </div>

      {/* Mobile Bottom Safe Area */}
      <div className="h-4 bg-gray-50" />
    </div>
  );
};

export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const { hapticFeedback } = useMobile();

  const handleClick = () => {
    if (onClick) {
      hapticFeedback('light');
      onClick();
    }
  };

  return (
    <Card
      className={`${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
      onClick={handleClick}
    >
      {children}
    </Card>
  );
}; 