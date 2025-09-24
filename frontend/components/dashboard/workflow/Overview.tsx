import { BarChart3, FileText, Map, Brain, Shield, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function Overview() {
  const workflowStats = [
    { title: "Documents Processed", value: "1,247", change: "+12%", icon: FileText, color: "text-blue-600" },
    { title: "Land Parcels Mapped", value: "3,456", change: "+8%", icon: Map, color: "text-green-600" },
    { title: "AI Detections", value: "23", change: "+15%", icon: Brain, color: "text-purple-600" },
    { title: "Blockchain Records", value: "1,189", change: "+5%", icon: Shield, color: "text-indigo-600" }
  ];

  const systemHealth = [
    { component: "OCR Processing", status: "Operational", uptime: 99.8, color: "bg-green-500" },
    { component: "GIS Mapping", status: "Operational", uptime: 98.5, color: "bg-green-500" },
    { component: "AI Detection", status: "Operational", uptime: 97.2, color: "bg-green-500" },
    { component: "Blockchain Network", status: "Operational", uptime: 99.9, color: "bg-green-500" }
  ];

  const recentActivity = [
    { type: "Document Upload", description: "5 new patta certificates uploaded", time: "2 minutes ago", status: "success" },
    { type: "AI Alert", description: "High-risk anomaly detected in Parcel 245/2A", time: "15 minutes ago", status: "warning" },
    { type: "Blockchain Verification", description: "QR codes generated for 3 pattas", time: "1 hour ago", status: "success" },
    { type: "GIS Update", description: "New boundary data synchronized", time: "3 hours ago", status: "info" }
  ];

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pending Claims Data
  const pendingClaimsOverview = [
    { label: 'Pending Review', value: 142, color: '#F59E0B' },
    { label: 'Under Investigation', value: 67, color: '#EF4444' },
    { label: 'Awaiting Documentation', value: 89, color: '#6366F1' },
    { label: 'Processing', value: 34, color: '#8B5CF6' },
    { label: 'Approved', value: 203, color: '#10B981' },
    { label: 'Rejected', value: 28, color: '#6B7280' }
  ];

  const claimsTrendData = [
    { month: 'Aug', submitted: 89, resolved: 67, pending: 22 },
    { month: 'Sep', submitted: 124, resolved: 98, pending: 48 },
    { month: 'Oct', submitted: 156, resolved: 134, pending: 70 },
    { month: 'Nov', submitted: 178, resolved: 142, pending: 106 },
    { month: 'Dec', submitted: 198, resolved: 156, pending: 148 },
    { month: 'Jan', submitted: 234, resolved: 178, pending: 204 }
  ];

  const claimsByDistrict = [
    { district: 'Central', pending: 89, urgent: 12 },
    { district: 'North', pending: 156, urgent: 23 },
    { district: 'South', pending: 134, urgent: 18 },
    { district: 'East', pending: 98, urgent: 8 },
    { district: 'West', pending: 87, urgent: 15 }
  ];

  const totalPendingClaims = pendingClaimsOverview.reduce((sum, item) => 
    item.label !== 'Approved' && item.label !== 'Rejected' ? sum + item.value : sum, 0
  );

  const urgentClaims = claimsByDistrict.reduce((sum, district) => sum + district.urgent, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to Land Governance Dashboard
              </h2>
              <p className="text-gray-600">
                Monitor and manage your land administration workflow with AI-powered insights and blockchain security.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-medium text-gray-900">January 15, 2024</p>
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
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} from last month</p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
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
                  <p className="text-sm text-gray-500">Total Pending Claims</p>
                  <p className="text-3xl font-bold text-orange-600">{totalPendingClaims}</p>
                  <p className="text-xs text-red-600">+18 since yesterday</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Urgent Claims</p>
                  <p className="text-3xl font-bold text-red-600">{urgentClaims}</p>
                  <p className="text-xs text-red-600">Require immediate attention</p>
                </div>
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Claims Resolved Today</p>
                  <p className="text-3xl font-bold text-green-600">23</p>
                  <p className="text-xs text-green-600">87% efficiency rate</p>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
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
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Claims by District */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-green-500" />
              Pending Claims by District
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={claimsByDistrict}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pending" fill="#3B82F6" name="Pending Claims" />
                  <Bar dataKey="urgent" fill="#EF4444" name="Urgent Claims" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {claimsByDistrict.map((district, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{district.district} District</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">{district.pending} pending</span>
                    <span className="text-red-600">{district.urgent} urgent</span>
                  </div>
                </div>
              ))}
            </div>
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