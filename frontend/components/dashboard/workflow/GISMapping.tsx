import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, FileText, Layers, Search, Filter, Download, Eye } from 'lucide-react';
import SimpleMap from './SimpleMap';

// Simple map placeholder component to avoid SSR issues
const MapPlaceholder = () => (
  <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
    <div className="text-center">
      <MapPin className="mx-auto h-12 w-12 text-green-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Forest Rights Map</h3>
      <p className="text-sm text-gray-600 mb-4">GIS visualization of FRA claims and forest boundaries</p>
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Approved Claims</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span>Pending Claims</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span>Disputed Claims</span>
        </div>
      </div>
      <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
        <p className="text-xs text-gray-500">
          Interactive Leaflet map will load here<br/>
          Showing forest claims across Maharashtra
        </p>
      </div>
    </div>
  </div>
);

// Note: InteractiveMap temporarily disabled due to SSR issues
// Will be re-enabled once Leaflet integration is stabilized

// Simple UI components with proper TypeScript
interface ComponentProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<ComponentProps> = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<ComponentProps> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
    {children}
  </span>
);

interface GISData {
  totalParcels: number;
  verifiedClaims: number;
  pendingVerification: number;
  disputes: number;
}

interface Parcel {
  id: string;
  owner: string;
  area: string;
  status: 'Verified' | 'Pending' | 'Disputed';
  coordinates: [number, number];
  claims: number;
}

export function GISMapping() {
  const [selectedLayer, setSelectedLayer] = useState('satellite');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    type: 'all',
    district: 'all'
  });

  // Mock data for demonstration
  const gisData: GISData = {
    totalParcels: 1247,
    verifiedClaims: 892,
    pendingVerification: 234,
    disputes: 121
  };

  const recentParcels: Parcel[] = [
    { id: "FRA-2024-001", owner: "Ramesh Bhosale", area: "2.5 ha", status: "Verified", coordinates: [19.9975, 73.7898], claims: 1 },
    { id: "FRA-2024-002", owner: "Anita Tribal Community", area: "15.0 ha", status: "Pending", coordinates: [19.2183, 73.0978], claims: 1 },
    { id: "FRA-2024-003", owner: "Meera Singh", area: "1.8 ha", status: "Disputed", coordinates: [18.5204, 73.8567], claims: 1 },
    { id: "FRA-2024-004", owner: "Warli Tribal Collective", area: "25.0 ha", status: "Verified", coordinates: [20.7595, 73.4192], claims: 1 },
    { id: "FRA-2024-005", owner: "Ajay Kumar", area: "0.8 ha", status: "Disputed", coordinates: [19.0760, 72.8777], claims: 1 }
  ];

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GIS Mapping & Land Records</h2>
          <p className="text-gray-600">Spatial visualization and verification of forest land claims</p>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">Nashik District, Maharashtra</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Parcels</p>
              <p className="text-2xl font-bold text-gray-900">{gisData.totalParcels}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Claims</p>
              <p className="text-2xl font-bold text-green-600">{gisData.verifiedClaims}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-green-600"></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Verification</p>
              <p className="text-2xl font-bold text-yellow-600">{gisData.pendingVerification}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-yellow-600"></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disputes</p>
              <p className="text-2xl font-bold text-red-600">{gisData.disputes}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Interactive Map with Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <Card className="lg:col-span-3 h-96 p-0 overflow-hidden">
          <SimpleMap 
            selectedParcel={selectedParcel}
            onParcelSelect={setSelectedParcel}
          />
        </Card>

        {/* Map Controls */}
        <div className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Claims
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Survey no, owner name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claim Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="community">Community</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Layer Controls */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-gray-900">Map Layers</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="layer" 
                  value="satellite" 
                  checked={selectedLayer === 'satellite'}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">Satellite View</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="layer" 
                  value="street" 
                  checked={selectedLayer === 'street'}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">Street Map</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="layer" 
                  value="terrain" 
                  checked={selectedLayer === 'terrain'}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">Terrain</span>
              </label>
            </div>
          </Card>

          {/* Filters */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">Filters</h3>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600 text-sm hover:text-blue-700"
              >
                {showFilters ? 'Hide' : 'Show'}
              </button>
            </div>
            {showFilters && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={activeFilters.status}
                    onChange={(e) => setActiveFilters({...activeFilters, status: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={activeFilters.type}
                    onChange={(e) => setActiveFilters({...activeFilters, type: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="community">Community</option>
                  </select>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                <Search className="h-4 w-4" />
                Search Claims
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100">
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                <Eye className="h-4 w-4" />
                Satellite Analysis
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Parcels Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Land Parcels</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Survey No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claims
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentParcels.map((parcel) => (
                <tr key={parcel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {parcel.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parcel.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parcel.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(parcel.status)}>
                      {parcel.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parcel.claims}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}