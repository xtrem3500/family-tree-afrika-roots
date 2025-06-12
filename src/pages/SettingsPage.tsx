import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAllData } from '@/components/DeleteAllData';

export const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Zone de danger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Attention : Les actions ci-dessous sont irréversibles.
          </p>
          <DeleteAllData />
        </CardContent>
      </Card>
    </div>
  );
};
