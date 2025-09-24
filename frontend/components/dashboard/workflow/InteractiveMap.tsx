'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Home, AlertTriangle, CheckCircle, Clock, Trees } from 'lucide-react';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different claim types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <div style="font-size: 14px; font-weight: bold;">${icon}</div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface ForestClaim {
  id: string;
  claimant: string;
  type: 'individual' | 'community';
  status: 'approved' | 'pending' | 'rejected' | 'under_review';
  area: number;
  coordinates: [number, number];
  village: string;
  district: string;
  claimDate: string;
  documents: string[];
  boundaryPolygon?: [number, number][];
}

interface ForestArea {
  id: string;
  name: string;
  type: 'reserved' | 'protected' | 'sanctuary' | 'community';
  coordinates: [number, number][];
  coverPercentage: number;
}

interface InteractiveMapProps {
  selectedParcel?: string;
  onParcelSelect?: (parcelId: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  selectedParcel, 
  onParcelSelect 
}) => {
  const [selectedClaim, setSelectedClaim] = useState<ForestClaim | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Handle parcel selection
  const handleClaimSelect = (claim: ForestClaim) => {
    setSelectedClaim(claim);
    if (onParcelSelect) {
      onParcelSelect(claim.id);
    }
  };

  // Mock FRA claims data (centered around Maharashtra forest areas)
  const fraClaims: ForestClaim[] = [
    {
      id: 'FRA-2024-001',
      claimant: 'Ramesh Bhosale',
      type: 'individual',
      status: 'approved',
      area: 2.5,
      coordinates: [19.9975, 73.7898],
      village: 'Khandala',
      district: 'Pune',
      claimDate: '2024-01-15',
      documents: ['Ration Card', 'Residence Proof', 'Cultivation Proof'],
      boundaryPolygon: [
        [19.9975, 73.7898],
        [19.9985, 73.7908],
        [19.9965, 73.7918],
        [19.9955, 73.7888]
      ]
    },
    {
      id: 'FRA-2024-002',
      claimant: 'Anita Tribal Community',
      type: 'community',
      status: 'pending',
      area: 15.0,
      coordinates: [19.2183, 73.0978],
      village: 'Kamshet',
      district: 'Pune',
      claimDate: '2024-02-10',
      documents: ['Community Certificate', 'Traditional Use Proof'],
      boundaryPolygon: [
        [19.2183, 73.0978],
        [19.2193, 73.0988],
        [19.2173, 73.0998],
        [19.2163, 73.0968]
      ]
    },
    {
      id: 'FRA-2024-003',
      claimant: 'Meera Singh',
      type: 'individual',
      status: 'under_review',
      area: 1.8,
      coordinates: [18.5204, 73.8567],
      village: 'Lonavala',
      district: 'Pune',
      claimDate: '2024-03-05',
      documents: ['Identity Proof', 'Land Survey Records']
    },
    {
      id: 'FRA-2024-004',
      claimant: 'Warli Tribal Collective',
      type: 'community',
      status: 'approved',
      area: 25.0,
      coordinates: [20.7595, 73.4192],
      village: 'Jawhar',
      district: 'Palghar',
      claimDate: '2023-11-20',
      documents: ['Tribal Certificate', 'Traditional Rights Evidence'],
      boundaryPolygon: [
        [20.7595, 73.4192],
        [20.7605, 73.4202],
        [20.7585, 73.4212],
        [20.7575, 73.4182]
      ]
    },
    {
      id: 'FRA-2024-005',
      claimant: 'Ajay Kumar',
      type: 'individual',
      status: 'rejected',
      area: 0.8,
      coordinates: [19.0760, 72.8777],
      village: 'Aarey Colony',
      district: 'Mumbai',
      claimDate: '2024-01-30',
      documents: ['Application Form', 'Survey Sketch']
    }
  ];

  // Mock forest areas
  const forestAreas: ForestArea[] = [
    {
      id: 'SA-001',
      name: 'Sanjay Gandhi National Park',
      type: 'sanctuary',
      coordinates: [
        [19.2147, 72.9103],
        [19.2547, 72.9503],
        [19.2847, 72.9203],
        [19.2447, 72.8803]
      ],
      coverPercentage: 87
    },
    {
      id: 'RF-002',
      name: 'Sahyadri Reserved Forest',
      type: 'reserved',
      coordinates: [
        [18.7329, 73.4280],
        [18.7729, 73.4680],
        [18.8029, 73.4380],
        [18.7629, 73.3980]
      ],
      coverPercentage: 92
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981'; // green
      case 'pending': return '#F59E0B'; // yellow
      case 'under_review': return '#3B82F6'; // blue
      case 'rejected': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✓';
      case 'pending': return '⏳';
      case 'under_review': return '👁';  
      case 'rejected': return '✗';
      default: return '?';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'community' ? '👥' : '👤';
  };

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Initializing Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <MapContainer
        center={[19.0760, 72.8777]} // Mumbai/Maharashtra center
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <LayersControl position="topright">
          {/* Base Layers */}
          <LayersControl.BaseLayer checked name="Satellite View">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            />
          </LayersControl.BaseLayer>

          {/* Overlay Layers */}
          <LayersControl.Overlay checked name="FRA Claims">
            <>
              {fraClaims.map((claim) => (
                <Marker
                  key={claim.id}
                  position={claim.coordinates}
                  icon={createCustomIcon(getStatusColor(claim.status), getStatusIcon(claim.status))}
                  eventHandlers={{
                    click: () => handleClaimSelect(claim),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-64">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{claim.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                          claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          claim.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {claim.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span><strong>Claimant:</strong> {claim.claimant}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span><strong>Location:</strong> {claim.village}, {claim.district}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Trees className="h-4 w-4 text-gray-500" />
                          <span><strong>Area:</strong> {claim.area} hectares</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {claim.type === 'community' ? 
                            <span className="text-blue-600">👥 Community Claim</span> : 
                            <span className="text-green-600">👤 Individual Claim</span>
                          }
                        </div>
                        
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">
                            Applied: {new Date(claim.claimDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Documents: {claim.documents.length} submitted
                          </p>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Render claim boundaries if available */}
              {fraClaims
                .filter(claim => claim.boundaryPolygon)
                .map((claim) => (
                  <Polygon
                    key={`${claim.id}-boundary`}
                    positions={claim.boundaryPolygon!}
                    color={getStatusColor(claim.status)}
                    fillColor={getStatusColor(claim.status)}
                    fillOpacity={0.2}
                    weight={2}
                  />
                ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Forest Areas">
            <>
              {forestAreas.map((area) => (
                <Polygon
                  key={area.id}
                  positions={area.coordinates}
                  color={area.type === 'sanctuary' ? '#059669' : area.type === 'reserved' ? '#0D9488' : '#10B981'}
                  fillColor={area.type === 'sanctuary' ? '#065F46' : area.type === 'reserved' ? '#0F766E' : '#047857'}
                  fillOpacity={0.3}
                  weight={2}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-900 mb-2">{area.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Type:</strong> {area.type.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Forest Cover:</strong> {area.coverPercentage}%</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Trees className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Protected Area</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Village Boundaries">
            {/* Mock village circles */}
            <Circle center={[19.9975, 73.7898]} radius={2000} color="#8B5CF6" fillOpacity={0.1} />
            <Circle center={[19.2183, 73.0978]} radius={3000} color="#8B5CF6" fillOpacity={0.1} />
            <Circle center={[18.5204, 73.8567]} radius={1500} color="#8B5CF6" fillOpacity={0.1} />
          </LayersControl.Overlay>
        </LayersControl>

        {/* Custom Legend */}
        <div className="leaflet-bottom leaflet-left">
          <div className="bg-white p-3 rounded-lg shadow-lg border m-2 text-xs">
            <h4 className="font-bold text-gray-900 mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Approved Claims</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>Pending Claims</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Under Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Rejected Claims</span>
              </div>
            </div>
          </div>
        </div>
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg border p-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-medium">FRA Claims: {fraClaims.length}</span>
          <span className="text-gray-500">|</span>
          <span className="text-green-600">✓ {fraClaims.filter(c => c.status === 'approved').length}</span>
          <span className="text-yellow-600">⏳ {fraClaims.filter(c => c.status === 'pending').length}</span>
          <span className="text-red-600">✗ {fraClaims.filter(c => c.status === 'rejected').length}</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;