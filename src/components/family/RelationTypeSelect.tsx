import React from 'react';
import { RelationType } from '@/types/supabase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Users, Heart, Baby } from 'lucide-react';

interface RelationTypeSelectProps {
  value: RelationType;
  onChange: (value: RelationType) => void;
  className?: string;
}

export const RelationTypeSelect: React.FC<RelationTypeSelectProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={(value) => onChange(value as RelationType)}
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative">
          <RadioGroupItem
            value="parent"
            id="parent"
            className="peer sr-only"
          />
          <Label
            htmlFor="parent"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Users className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Parent</p>
              <p className="text-xs text-muted-foreground">
                Je suis le parent de cette personne
              </p>
            </div>
          </Label>
        </Card>

        <Card className="relative">
          <RadioGroupItem
            value="child"
            id="child"
            className="peer sr-only"
          />
          <Label
            htmlFor="child"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Baby className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Enfant</p>
              <p className="text-xs text-muted-foreground">
                Je suis l'enfant de cette personne
              </p>
            </div>
          </Label>
        </Card>

        <Card className="relative">
          <RadioGroupItem
            value="spouse"
            id="spouse"
            className="peer sr-only"
          />
          <Label
            htmlFor="spouse"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Heart className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium leading-none">Conjoint</p>
              <p className="text-xs text-muted-foreground">
                Je suis le conjoint de cette personne
              </p>
            </div>
          </Label>
        </Card>
      </div>
    </RadioGroup>
  );
};
