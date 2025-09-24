import { useState } from 'react';
import { Monitor, BarChart3, AlertCircle, Users, FileCheck, Clock, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';

export function DSSDashboard() {
  const [arModeEnabled, setArModeEnabled] = useState(false);

  const kpiData = [
    { title: "Active Cases", value: "23", change: "+2 today", color: "text-blue-600", icon: FileCheck },
    { title: "Pending Reviews", value: "8", change: "-3 today", color: "text-yellow-600", icon: Clock },
    { title: "Officers Online", value: "12", change: "2 in field", color: "text-green-600", icon: Users },
    { title: "Critical Alerts", value: "3", change: "Needs attention", color: "text-red-600", icon: AlertCircle }
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "High Risk Detection",
      message: "Document fraud suspected in Parcel 245/2A",
      priority: "High",
      timestamp: "2 minutes ago",
      assignee: "Officer Kumar"
    },
    {
      id: 2,
      type: "Boundary Dispute",
      message: "Conflicting claims reported for adjacent parcels",
      priority: "Medium", 
      timestamp: "15 minutes ago",
      assignee: "Officer Sharma"
    },
    {
      id: 3,
      type: "System Update",
      message: "Blockchain verification completed for 5 new pattas",
      priority: "Low",
      timestamp: "1 hour ago", 
      assignee: "System"
    }
  ];

  const officerActivity = [
    { name: "A.K. Verma", role: "Senior Inspector", status: "Field Work", location: "Zone A", cases: 5 },
    { name: "Priya Singh", role: "Revenue Officer", status: "Office", location: "Desk 12", cases: 3 },
    { name: "Rajesh Kumar", role: "Inspector", status: "Field Work", location: "Zone B", cases: 7 },
    { name: "Sunita Devi", role: "Assistant", status: "Office", location: "Desk 8", cases: 2 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Field Work': return 'bg-blue-100 text-blue-800';
      case 'Office': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* AR Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Decision Support System Dashboard
            </div>
            
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">AR Mode</span>
              <Switch
                checked={arModeEnabled}
                onCheckedChange={setArModeEnabled}
              />
              <Badge variant={arModeEnabled ? "default" : "outline"} className={arModeEnabled ? "bg-accent-green text-black" : ""}>
                {arModeEnabled ? "ON" : "OFF"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        {arModeEnabled && (
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-green rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">AR Field Assistant Active</h4>
                  <p className="text-sm text-gray-600">Mobile AR overlay enabled for field officers</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Launch AR View
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{kpi.title}</p>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-xs text-gray-400">{kpi.change}</p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts and Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{alert.type}</h4>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Assigned to: {alert.assignee}</span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Officer Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Officer Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {officerActivity.map((officer, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {officer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{officer.name}</h4>
                      <p className="text-sm text-gray-500">{officer.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getStatusColor(officer.status)}>
                      {officer.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{officer.cases} active cases</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Case Resolution Time</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average</span>
                  <span className="font-medium">2.3 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-medium text-green-600">1.8 days ↓</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Accuracy Rate</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI Detection</span>
                  <span className="font-medium">94.2%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Officer Review</span>
                  <span className="font-medium text-green-600">97.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">System Efficiency</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing Speed</span>
                  <span className="font-medium">85.6%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}