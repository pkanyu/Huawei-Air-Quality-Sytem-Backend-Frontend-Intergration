'use client';

import { useAirQuality } from '@/context/AirQualityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Activity, Users, AlertTriangle } from 'lucide-react';

export default function HealthPage() {
  const { 
    currentAQI,
    currentHealthRisks
  } = useAirQuality();
  
  const { current: currentRisk, visibleRisks: healthRisks } = currentHealthRisks;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Health Risks & Recommendations</h1>

      <Alert className={`mb-6 bg-${currentRisk.alertColor}/10 border-${currentRisk.alertColor}/50`}>
        <AlertTriangle className={`h-4 w-4 text-${currentRisk.alertColor}`} />
        <AlertTitle>Current Risk Level: {currentRisk.alertLevel} (AQI: {currentAQI.value})</AlertTitle>
        <AlertDescription>
          {currentRisk.alertDescription}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Status</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="groups">Affected Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid gap-6 md:grid-cols-3">
            {healthRisks.map((risk, index) => (
              <Card key={index} className={risk.level === currentRisk.level ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className={`h-5 w-5 text-${risk.alertColor}`} />
                    {risk.level}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{risk.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {healthRisks.map((risk, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className={`font-semibold ${risk.level === currentRisk.level ? 'text-blue-600' : ''}`}>
                      {risk.level} {risk.level === currentRisk.level && '(Current)'}
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {risk.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Affected Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {healthRisks.map((risk, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className={`font-semibold ${risk.level === currentRisk.level ? 'text-blue-600' : ''}`}>
                      {risk.level} {risk.level === currentRisk.level && '(Current)'}
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {risk.affectedGroups.map((group, idx) => (
                        <li key={idx}>{group}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}