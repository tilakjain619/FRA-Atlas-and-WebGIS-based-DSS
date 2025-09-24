import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Map, Brain, Shield, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ClaimData {
  _id: string;
  claimant_name: string;
  area: string;
  claim_type: string;
  district?: string;
  state?: string;
  is_anomaly: boolean;
  created_at?: string;
}

interface DashboardStats {
  totalClaims: number;
  anomaliesClaims: number;
  recentClaims: number;
  processing: number;
}

export function Overview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    anomaliesClaims: 0,
    recentClaims: 0,
    processing: 0
  });
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [anomalies, setAnomalies] = useState<ClaimData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch statistics and detailed data in parallel
      const [statisticsResponse, claimsResponse, anomaliesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/claims/statistics`),
        axios.get(`${API_BASE_URL}/claims/`),
        axios.get(`${API_BASE_URL}/claims/anomalies`)
      ]);
      
      if (statisticsResponse.data.success && claimsResponse.data.success && anomaliesResponse.data.success) {
        const statisticsData = statisticsResponse.data.statistics;
        const allClaims = claimsResponse.data.claims;
        const anomalousClaims = anomaliesResponse.data.anomalous_claims;
        
        setClaims(allClaims);
        setAnomalies(anomalousClaims);
        
        // Use backend-calculated statistics
        setStats({
          totalClaims: statisticsData.total_claims,
          anomaliesClaims: statisticsData.anomaly_claims,
          recentClaims: statisticsData.today_submissions,
          processing: statisticsData.normal_claims
        });
        
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch data from server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate dynamic stats based on real data
  const workflowStats = [
    { 
      title: "Total Claims", 
      value: stats.totalClaims.toString(), 
      change: `+${stats.recentClaims} today`, 
      icon: FileText, 
      color: "text-blue-600" 
    },
    { 
      title: "Processing Claims", 
      value: stats.processing.toString(), 
      change: `${((stats.processing / stats.totalClaims) * 100 || 0).toFixed(1)}% of total`, 
      icon: Map, 
      color: "text-green-600" 
    },
    { 
      title: "AI Detections", 
      value: stats.anomaliesClaims.toString(), 
      change: `${((stats.anomaliesClaims / stats.totalClaims) * 100 || 0).toFixed(1)}% anomaly rate`, 
      icon: Brain, 
      color: "text-purple-600" 
    },
    { 
      title: "Verified Claims", 
      value: (stats.totalClaims - stats.anomaliesClaims).toString(), 
      change: `${(((stats.totalClaims - stats.anomaliesClaims) / stats.totalClaims) * 100 || 0).toFixed(1)}% success rate`, 
      icon: Shield, 
      color: "text-indigo-600" 
    }
  ];

  const systemHealth = [
    { component: "API Server", status: error ? "Error" : "Operational", uptime: error ? 0 : 99.8, color: error ? "bg-red-500" : "bg-green-500" },
    { component: "Database", status: "Operational", uptime: 98.5, color: "bg-green-500" },
    { component: "AI Detection", status: stats.anomaliesClaims > 0 ? "Active" : "Standby", uptime: 97.2, color: stats.anomaliesClaims > 0 ? "bg-green-500" : "bg-yellow-500" },
    { component: "Data Processing", status: loading ? "Processing" : "Ready", uptime: 99.9, color: loading ? "bg-yellow-500" : "bg-green-500" }
  ];

  // Generate recent activity from actual claims data
  const recentActivity = React.useMemo(() => {
    const activities = [];
    
    if (stats.recentClaims > 0) {
      activities.push({
        type: "New Claims",
        description: `${stats.recentClaims} new claims submitted today`,
        time: "Today",
        status: "success"
      });
    }
    
    if (stats.anomaliesClaims > 0) {
      const latestAnomaly = anomalies[0];
      activities.push({
        type: "AI Alert",
        description: `Anomaly detected in claim by ${latestAnomaly?.claimant_name || 'Unknown'}`,
        time: "Recent",
        status: "warning"
      });
    }
    
    activities.push({
      type: "System Update",
      description: `Last data refresh: ${lastUpdated || 'Never'}`,
      time: "System",
      status: "info"
    });
    
    if (stats.totalClaims > 0) {
      activities.push({
        type: "Database Status",
        description: `${stats.totalClaims} total claims in system`,
        time: "Current",
        status: "success"
      });
    }
    
    return activities.slice(0, 4); // Limit to 4 activities
  }, [stats, anomalies, lastUpdated]);

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Dynamic Claims Data based on real data
  const pendingClaimsOverview = React.useMemo(() => {
    const individualClaims = claims.filter(claim => claim.claim_type === 'individual').length;
    const communityClaims = claims.filter(claim => claim.claim_type === 'community').length;
    const anomalyClaims = stats.anomaliesClaims;
    const normalClaims = stats.totalClaims - anomalyClaims;
    
    return [
      { label: 'Individual Claims', value: individualClaims, color: '#10B981' },
      { label: 'Community Claims', value: communityClaims, color: '#6366F1' },
      { label: 'Normal Claims', value: normalClaims, color: '#10B981' },
      { label: 'Flagged Anomalies', value: anomalyClaims, color: '#EF4444' },
      { label: 'Processing', value: Math.max(0, stats.processing - anomalyClaims), color: '#F59E0B' },
      { label: 'Under Review', value: Math.min(stats.totalClaims, 15), color: '#8B5CF6' }
    ].filter(item => item.value > 0);
  }, [claims, stats]);

  // Generate trend data based on claim creation dates
  const claimsTrendData = React.useMemo(() => {
    const monthlyData: { [key: string]: { submitted: number; resolved: number; pending: number } } = {};
    
    claims.forEach(claim => {
      if (claim.created_at) {
        const date = new Date(claim.created_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { submitted: 0, resolved: 0, pending: 0 };
        }
        
        monthlyData[monthKey].submitted += 1;
        if (claim.is_anomaly) {
          monthlyData[monthKey].pending += 1;
        } else {
          monthlyData[monthKey].resolved += 1;
        }
      }
    });
    
    // Convert to array and sort by month order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder
      .filter(month => monthlyData[month])
      .map(month => ({
        month,
        ...monthlyData[month]
      }))
      .slice(-6); // Show last 6 months with data
  }, [claims]);

  // Generate district data from real claims
  const claimsByDistrict = React.useMemo(() => {
    const districtStats: { [key: string]: { pending: number; urgent: number } } = {};
    
    claims.forEach(claim => {
      const district = claim.district || 'Unknown';
      if (!districtStats[district]) {
        districtStats[district] = { pending: 0, urgent: 0 };
      }
      
      districtStats[district].pending += 1;
      if (claim.is_anomaly) {
        districtStats[district].urgent += 1;
      }
    });
    
    return Object.entries(districtStats)
      .map(([district, stats]) => ({ district, ...stats }))
      .sort((a, b) => b.pending - a.pending)
      .slice(0, 5); // Top 5 districts
  }, [claims]);

  const totalPendingClaims = pendingClaimsOverview.reduce((sum, item) => 
    sum + item.value, 0
  );

  const urgentClaims = stats.anomaliesClaims;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to FRA DSS Dashboard
              </h2>
              <p className="text-gray-600">
                Monitor and manage Forest Rights Act claims with AI-powered anomaly detection and real-time insights.
              </p>
              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-sm text-red-600">⚠️ {error}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-1">Updated: {lastUpdated}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {workflowStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {loading ? (
                        <span className="animate-pulse bg-gray-300 rounded h-8 w-16 inline-block"></span>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-xs text-gray-600">
                      {loading ? 'Loading...' : stat.change}
                    </p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${stat.color} ${loading ? 'opacity-50' : ''}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Claims Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claims Summary Cards */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Claims</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalClaims}</p>
                  <p className="text-xs text-gray-600">All claims in system</p>
                </div>
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Anomaly Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{urgentClaims}</p>
                  <p className="text-xs text-red-600">
                    {urgentClaims > 0 ? 'Require immediate attention' : 'No urgent alerts'}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today's Submissions</p>
                  <p className="text-3xl font-bold text-green-600">{stats.recentClaims}</p>
                  <p className="text-xs text-green-600">
                    {stats.recentClaims > 0 ? 'New claims today' : 'No new claims today'}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Claims Status Distribution
              {loading && <RefreshCw className="w-4 h-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pendingClaimsOverview}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({label, value, percent}) => `${label}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pendingClaimsOverview.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {pendingClaimsOverview.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.label}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Claims Trends and District Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Claims Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Claims Trends (6 Months)
              {loading && <RefreshCw className="w-4 h-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading trend data...</p>
                </div>
              </div>
            ) : claimsTrendData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={claimsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="submitted" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      name="Submitted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      name="Resolved"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="#F59E0B" 
                      strokeWidth={2} 
                      name="Pending"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No trend data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claims by District */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-green-500" />
              Claims by District
              {loading && <RefreshCw className="w-4 h-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading district data...</p>
                </div>
              </div>  
            ) : claimsByDistrict.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={claimsByDistrict}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="district" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="pending" fill="#3B82F6" name="Total Claims" />
                      <Bar dataKey="urgent" fill="#EF4444" name="Anomaly Claims" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {claimsByDistrict.map((district, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-900">{district.district} District</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">{district.pending} total</span>
                        <span className="text-red-600">{district.urgent} anomalies</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No district data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((system, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${system.color} rounded-full`}></div>
                    <span className="font-medium text-gray-900">{system.component}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {system.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{system.uptime}% uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.type}</p>
                      <Badge variant="outline" className={getActivityColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Today's Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Documents Processed</span>
                <span className="text-sm font-medium">45/60</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">75% of daily target</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">AI Reviews Completed</span>
                <span className="text-sm font-medium">23/30</span>
              </div>
              <Progress value={77} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">77% of daily target</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Blockchain Verifications</span>
                <span className="text-sm font-medium">18/25</span>
              </div>
              <Progress value={72} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">72% of daily target</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Upload Documents</h4>
              <p className="text-xs text-gray-500">Start new document processing</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Map className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">View GIS Map</h4>
              <p className="text-xs text-gray-500">Explore land parcels</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Brain className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">AI Alerts</h4>
              <p className="text-xs text-gray-500">Review detected anomalies</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Users className="w-8 h-8 text-orange-600 mb-2" />
              <h4 className="font-medium text-gray-900">Officer Status</h4>
              <p className="text-xs text-gray-500">Check team availability</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}