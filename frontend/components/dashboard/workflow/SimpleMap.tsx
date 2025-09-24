'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Layers, Search, Filter } from 'lucide-react';

interface SimpleMapProps {
  selectedParcel?: string;
  onParcelSelect?: (parcelId: string) => void;
}

interface ClaimMarker {
  id: string;
  name: string;
  coordinates: [number, number];
  status: 'approved' | 'pending' | 'rejected';
  type: 'individual' | 'community';
  area: number;
  village: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ selectedParcel, onParcelSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Sample claim data
  const claims: ClaimMarker[] = [
    {
      id: 'FRA-001',
      name: 'Ramesh Bhosale',
      coordinates: [20.1234, 77.8765],
      status: 'approved',
      type: 'individual',
      area: 2.5,
      village: 'Khandala'
    },
    {
      id: 'FRA-002', 
      name: 'Anita Tribal Community',
      coordinates: [20.1456, 77.8943],
      status: 'pending',
      type: 'community',
      area: 15.0,
      village: 'Kendupani'
    },
    {
      id: 'FRA-003',
      name: 'Meera Singh',
      coordinates: [20.1189, 77.8654],
      status: 'rejected',
      type: 'individual',
      area: 1.8,
      village: 'Nandgaon'
    },
    {
      id: 'FRA-004',
      name: 'Warli Tribal Collective',
      coordinates: [20.1567, 77.8432],
      status: 'approved',
      type: 'community',
      area: 25.0,
      village: 'Bamhani'
    }
  ];

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading Forest Rights Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-gradient-to-br from-green-100 via-blue-50 to-teal-100 rounded-lg overflow-hidden">
      {/* Map Background with Grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="h-full w-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10B981" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Forest Area Representation */}
      <div className="absolute inset-0">
        {/* Large forest area */}
        <div 
          className="absolute bg-green-200 opacity-30 rounded-full"
          style={{
            width: '200px',
            height: '200px',
            top: '20%',
            left: '30%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute bg-green-300 opacity-25 rounded-full"
          style={{
            width: '150px',
            height: '150px',
            top: '60%',
            left: '70%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* River/Water body */}
        <div 
          className="absolute bg-blue-200 opacity-40"
          style={{
            width: '80%',
            height: '8px',
            top: '45%',
            left: '10%',
            borderRadius: '4px',
            transform: 'rotate(-15deg)'
          }}
        />
      </div>

      {/* Claim markers */}
      <div className="absolute inset-0">
        {claims.map((claim, index) => (
          <div
            key={claim.id}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 ${
              selectedParcel === claim.id ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${25 + (index * 12)}%`
            }}
            onClick={() => onParcelSelect && onParcelSelect(claim.id)}
          >
            {/* Marker */}
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
              style={{ backgroundColor: getStatusColor(claim.status) }}
            >
              <span className="text-white text-xs font-bold">
                {claim.type === 'community' ? 'C' : 'I'}
              </span>
            </div>
            
            {/* Popup on hover/selection */}
            {selectedParcel === claim.id && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border p-3 min-w-48 z-30">
                <div className="text-xs">
                  <div className="font-semibold text-gray-900 mb-1">{claim.id}</div>
                  <div className="text-gray-700 mb-1">{claim.name}</div>
                  <div className="text-gray-600 mb-2">{claim.village} Village</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{claim.area} ha</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
                {/* Arrow pointing down */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border p-2 z-20">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-green-600" />
            <span className="font-medium">Claims: {claims.length}</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{claims.filter(c => c.status === 'approved').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>{claims.filter(c => c.status === 'pending').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{claims.filter(c => c.status === 'rejected').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute top-4 right-4 bg-white rounded-full shadow-lg border p-2 z-20">
        <div className="w-8 h-8 relative flex items-center justify-center">
          <div className="absolute text-xs font-bold text-red-600">N</div>
          <div className="w-4 h-4 border border-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-4 left-4 bg-white rounded px-2 py-1 shadow-lg border text-xs z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-gray-800"></div>
          <span>1 km</span>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
        FRA DSS Map © 2024
      </div>
    </div>
  );
};

export default SimpleMap;