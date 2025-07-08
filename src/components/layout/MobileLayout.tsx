import React from 'react';
import { useMobile } from '@/presentation/hooks/ui/useMobile';
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
  const { isMobile } = useMobile();

  const handleBack = () => {
    onBack?.();
  };

  const handleMenuClick = () => {
    onMenuClick?.();
  };

  const handleMoreClick = () => {
    onMoreClick?.();
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Header */}
      {(title || showBackButton || showMenu || showMore) && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3" role="banner" aria-label="Mobile header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-2 min-w-[44px] min-h-[44px]"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {showMenu && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMenuClick}
                  className="p-2 min-w-[44px] min-h-[44px]"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 truncate" id="mobile-header-title">
                  {title}
                </h1>
              )}
            </div>
            {showMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoreClick}
                className="p-2 min-w-[44px] min-h-[44px]"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Content */}
      <div className="p-4 pb-20 overflow-y-auto" role="main" aria-labelledby="mobile-header-title">
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
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={`${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} min-w-[44px] min-h-[44px] ${className}`}
      onClick={handleClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Open card' : undefined}
    >
      {children}
    </Card>
  );
}; 