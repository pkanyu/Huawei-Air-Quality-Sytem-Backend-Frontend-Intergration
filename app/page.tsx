'use client';

import { useAirQuality } from '@/context/AirQualityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { 
    currentAQI, 
    pollutantLevels, 
    chartData 
  } = useAirQuality();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Air Quality Dashboard</h1>
      
      <Alert className={`mb-6 bg-${currentAQI.color}/10 border-${currentAQI.color}/50`}>
        <AlertCircle className={`h-4 w-4 text-${currentAQI.color}`} />
        <AlertTitle>Air Quality Alert</AlertTitle>
        <AlertDescription>
          {currentAQI.level} air quality levels detected ({currentAQI.value}). 
          {currentAQI.value > 100 ? 
            " Sensitive individuals should reduce outdoor activities." : 
            " Air quality is acceptable for most individuals."}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {pollutantLevels.map((pollutant) => (
          <Card key={pollutant.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {pollutant.name}
              </CardTitle>
              <span className={`text-${pollutant.status === 'Good' ? 'green-500' : 
                pollutant.status === 'Moderate' ? 'yellow-600' : 
                pollutant.status === 'Unhealthy for Sensitive Groups' ? 'orange-500' : 
                pollutant.status === 'Unhealthy' ? 'red-500' : 
                pollutant.status === 'Very Unhealthy' ? 'purple-800' : 'red-900'}`}>
                {pollutant.status}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pollutant.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="PM25" stroke="hsl(var(--chart-1))" name="PM2.5" />
                  <Line type="monotone" dataKey="PM10" stroke="hsl(var(--chart-2))" name="PM10" />
                  <Line type="monotone" dataKey="CO" stroke="hsl(var(--chart-3))" name="CO" />
                  <Line type="monotone" dataKey="O3" stroke="hsl(var(--chart-4))" name="O₃" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pollutant Comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="PM25" fill="hsl(var(--chart-1))" name="PM2.5" />
                  <Bar dataKey="PM10" fill="hsl(var(--chart-2))" name="PM10" />
                  <Bar dataKey="CO" fill="hsl(var(--chart-3))" name="CO" />
                  <Bar dataKey="O3" fill="hsl(var(--chart-4))" name="O₃" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}