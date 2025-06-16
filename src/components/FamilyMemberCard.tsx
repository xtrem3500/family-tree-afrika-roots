import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FamilyMemberCardProps {
  member: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string;
    birth_date?: string;
    birth_place?: string;
    title?: string;
    is_patriarch: boolean;
    is_current_user?: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  size = 'md',
  onClick,
}) => {
  const initials = `${member.first_name[0]}${member.last_name[0]}`;

  const sizeClasses = {
    sm: {
      avatar: 'w-12 h-12',
      text: 'text-sm',
      card: 'p-2',
    },
    md: {
      avatar: 'w-16 h-16',
      text: 'text-base',
      card: 'p-4',
    },
    lg: {
      avatar: 'w-24 h-24',
      text: 'text-lg',
      card: 'p-6',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`
              ${currentSize.card}
              ${member.is_current_user ? 'ring-2 ring-blue-500' : ''}
              ${member.is_patriarch ? 'ring-4 ring-yellow-400' : ''}
              transition-all duration-200 hover:shadow-lg
              ${onClick ? 'cursor-pointer' : ''}
              bg-gradient-to-br from-white via-emerald-50 to-teal-50
              shadow-md
              m-4
              border-2 border-emerald-200
            `}
            onClick={onClick}
          >
            <div className="flex flex-col items-center space-y-3">
              <Avatar className={currentSize.avatar}>
                <AvatarImage src={member.photo_url} alt={`${member.first_name} ${member.last_name}`} />
                <AvatarFallback className="text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-base">{`${member.first_name} ${member.last_name}`}</h3>
                {member.title && (
                  <p className="text-sm text-muted-foreground">{member.title}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {member.is_patriarch && (
                  <Badge className="bg-yellow-100 text-yellow-800">Patriarche</Badge>
                )}
                {member.is_current_user && (
                  <Badge className="bg-whatsapp-100 text-whatsapp-800">Vous</Badge>
                )}
              </div>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cliquez pour voir plus de détails</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FamilyMemberCard;
