import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Users, Baby, Heart, UserPlus } from 'lucide-react';

export type RelationshipType = 'child' | 'grandchild' | 'nephew' | 'grandnephew' | 'spouse';

interface RelationshipTypeSelectProps {
  value: RelationshipType;
  onChange: (value: RelationshipType) => void;
  className?: string;
}

const relationshipOptions = [
  {
    value: 'child',
    label: 'Enfant',
    description: 'Fils ou fille direct',
    icon: Baby,
  },
  {
    value: 'grandchild',
    label: 'Petit-enfant',
    description: 'Petit-fils ou petite-fille',
    icon: Baby,
  },
  {
    value: 'nephew',
    label: 'Neveu/Nièce',
    description: 'Neveu ou nièce direct',
    icon: UserPlus,
  },
  {
    value: 'grandnephew',
    label: 'Petit-neveu/Petite-nièce',
    description: 'Petit-neveu ou petite-nièce',
    icon: UserPlus,
  },
  {
    value: 'spouse',
    label: 'Conjoint',
    description: 'Mari, femme ou partenaire',
    icon: Heart,
  },
];

export const RelationshipTypeSelect: React.FC<RelationshipTypeSelectProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={(value) => onChange(value as RelationshipType)}
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}
    >
      {relationshipOptions.map((option) => (
        <div key={option.value}>
          <RadioGroupItem
            value={option.value}
            id={option.value}
            className="peer sr-only"
          />
          <Label
            htmlFor={option.value}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <option.icon className="h-6 w-6" />
              <span className="font-medium">{option.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {option.description}
            </p>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};
