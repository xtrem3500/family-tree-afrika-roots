import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAllData } from '@/components/DeleteAllData';

export const AdminPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Actions Administratives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DeleteAllData />
        </CardContent>
      </Card>
    </div>
  );
};
