
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FamilyMember {
  id: string;
  name: string;
  role: 'patriarch' | 'spouse' | 'child' | 'grandchild';
  photo?: string;
  birthDate?: string;
  location?: string;
  title?: string;
  children?: FamilyMember[];
}

// Sample data for demonstration
const sampleFamily: FamilyMember = {
  id: '1',
  name: 'Grand-Père Kofi',
  role: 'patriarch',
  title: 'Chef de famille',
  location: 'Accra, Ghana',
  children: [
    {
      id: '2',
      name: 'Papa Kwame',
      role: 'child',
      title: 'Ingénieur',
      location: 'Lagos, Nigeria',
      children: [
        {
          id: '4',
          name: 'Ama Kwame',
          role: 'grandchild',
          title: 'Étudiante',
          location: 'Paris, France'
        },
        {
          id: '5',
          name: 'Yaw Kwame',
          role: 'grandchild',
          title: 'Développeur',
          location: 'Dakar, Sénégal'
        }
      ]
    },
    {
      id: '3',
      name: 'Tante Akosua',
      role: 'child',
      title: 'Médecin',
      location: 'Abidjan, Côte d\'Ivoire',
      children: [
        {
          id: '6',
          name: 'Kojo Asante',
          role: 'grandchild',
          title: 'Artiste',
          location: 'New York, USA'
        }
      ]
    }
  ]
};

const FamilyTreeNode: React.FC<{ member: FamilyMember; level: number }> = ({ member, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patriarch': return 'bg-baobab-500 text-white';
      case 'spouse': return 'bg-earth-400 text-white';
      case 'child': return 'bg-primary text-primary-foreground';
      case 'grandchild': return 'bg-whatsapp-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getNodeClasses = (role: string) => {
    const base = "tree-node interactive";
    return role === 'patriarch' ? `${base} patriarch` : base;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card className={getNodeClasses(member.role)} onClick={() => setIsExpanded(!isExpanded)}>
        <CardContent className="p-4 text-center min-w-[200px]">
          <div className="w-16 h-16 bg-gradient-to-br from-earth-200 to-earth-400 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
          <Badge className={`${getRoleColor(member.role)} mb-2`}>
            {member.role === 'patriarch' ? 'Patriarche' : 
             member.role === 'spouse' ? 'Époux/se' :
             member.role === 'child' ? 'Enfant' : 'Petit-enfant'}
          </Badge>
          {member.title && <p className="text-sm text-muted-foreground mb-1">{member.title}</p>}
          {member.location && <p className="text-xs text-muted-foreground">{member.location}</p>}
          {member.children && member.children.length > 0 && (
            <p className="text-xs mt-2 text-primary">
              {isExpanded ? '▼' : '▶'} {member.children.length} descendant(s)
            </p>
          )}
        </CardContent>
      </Card>

      {isExpanded && member.children && member.children.length > 0 && (
        <div className="flex space-x-8 animate-fade-in">
          {member.children.map((child) => (
            <div key={child.id} className="relative">
              <div className="absolute -top-4 left-1/2 w-px h-4 bg-border"></div>
              <FamilyTreeNode member={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FamilyTree = () => {
  return (
    <Card className="w-full h-[600px] overflow-auto">
      <CardContent className="p-8">
        <div className="flex justify-center">
          <div className="animate-tree-grow">
            <FamilyTreeNode member={sampleFamily} level={0} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyTree;
