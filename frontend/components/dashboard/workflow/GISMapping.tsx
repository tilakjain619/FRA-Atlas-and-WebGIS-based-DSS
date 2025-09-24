import { useState } from 'react';
import { Map, Layers, Search, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export function GISMapping() {
  const [selectedLayer, setSelectedLayer] = useState('satellite');
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);

  const landParcels = [
    {
      id: "245/1B",
      owner: "Rajesh Kumar Sharma",
      area: "2.5 Acres",
      coordinates: "28.3670° N, 77.3119° E",
      status: "Verified",
      riskLevel: "Low"
    },
    {
      id: "245/2A", 
      owner: "Sunita Devi",
      area: "1.8 Acres",
      coordinates: "28.3672° N, 77.3121° E", 
      status: "Pending",
      riskLevel: "Medium"
    },
    {
      id: "245/3C",
      owner: "Mohan Singh",
      area: "3.2 Acres", 
      coordinates: "28.3668° N, 77.3117° E",
      status: "Disputed",
      riskLevel: "High"
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500'; 
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            GIS Mapping & Auto-GeoTagging
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by survey number, owner name..." 
                className="w-64"
              />
            </div>
            
            <Select value={selectedLayer} onValueChange={setSelectedLayer}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="roadmap">Road Map</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative h-96 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200"></div>
            
            {/* Simulated Land Parcels */}
            <div className="absolute inset-0 p-4">
              {landParcels.map((parcel, index) => (
                <div
                  key={parcel.id}
                  className={`absolute border-2 rounded cursor-pointer transition-all ${
                    selectedParcel === parcel.id 
                      ? 'border-primary bg-primary/20 z-10' 
                      : 'border-white bg-white/30 hover:bg-white/50'
                  }`}
                  style={{
                    left: `${20 + index * 25}%`,
                    top: `${30 + index * 15}%`,
                    width: '120px',
                    height: '80px'
                  }}
                  onClick={() => setSelectedParcel(parcel.id)}
                >
                  <div className="p-2 text-xs">
                    <div className="font-medium">{parcel.id}</div>
                    <div className="text-gray-600">{parcel.area}</div>
                  </div>
                  <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${getRiskColor(parcel.riskLevel)}`}></div>
                </div>
              ))}
            </div>

            {/* Layer Toggle */}
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="sm" className="bg-white">
                <Layers className="w-4 h-4 mr-2" />
                Layers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Land Parcels List */}
      <Card>
        <CardHeader>
          <CardTitle>Land Parcels in Current View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {landParcels.map((parcel) => (
              <div 
                key={parcel.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedParcel === parcel.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedParcel(parcel.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">Survey No: {parcel.id}</h4>
                      <Badge className={getRiskColor(parcel.riskLevel) + ' text-white'}>
                        {parcel.riskLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Owner: {parcel.owner}</p>
                    <p className="text-sm text-gray-500">Area: {parcel.area} | {parcel.coordinates}</p>
                  </div>
                  
                  <Badge variant="outline" className={getStatusColor(parcel.status)}>
                    {parcel.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Heatmap Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">High Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}