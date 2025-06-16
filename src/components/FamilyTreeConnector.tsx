import React from 'react';

interface FamilyTreeConnectorProps {
  type: 'horizontal' | 'vertical' | 'diagonal';
  length: number;
  className?: string;
}

const FamilyTreeConnector: React.FC<FamilyTreeConnectorProps> = ({ type, length, className = '' }) => {
  const getConnectorStyle = () => {
    switch (type) {
      case 'horizontal':
        return {
          width: `${length}px`,
          height: '3px',
          backgroundColor: '#4ade80',
          boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
        };
      case 'vertical':
        return {
          width: '3px',
          height: `${length}px`,
          backgroundColor: '#4ade80',
          boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
        };
      case 'diagonal':
        return {
          width: `${length}px`,
          height: '3px',
          backgroundColor: '#4ade80',
          boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
          transform: 'rotate(45deg)',
          transformOrigin: 'left center',
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={getConnectorStyle()}
    />
  );
};

export default FamilyTreeConnector;
