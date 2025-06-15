import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onAction: () => void;
  actionLabel: string;
  showBackButton?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  onAction,
  actionLabel,
  showBackButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 to-baobab-100">
      <main className="container mx-auto px-4 py-4">
        {showBackButton && (
          <div className="flex items-center mb-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="h-8 px-2 text-sm hover:bg-baobab-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="p-2 pb-0">
              {icon && <div className="mb-1 scale-75">{icon}</div>}
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>
              <Button
                onClick={onAction}
                className="w-full bg-gradient-to-r from-baobab-500 to-baobab-700 text-xs py-1 h-7"
              >
                {actionLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FeatureCard;
