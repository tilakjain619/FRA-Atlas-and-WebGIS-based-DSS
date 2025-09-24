import { Brain, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';

export function AIDetection() {
  const anomalies = [
    {
      id: 1,
      type: "Document Fraud",
      severity: "High",
      confidence: 94.7,
      description: "Potential signature forgery detected in land transfer documents",
      parcelId: "245/2A",
      timestamp: "2024-01-15 14:23:45",
      status: "Under Review"
    },
    {
      id: 2,
      type: "Boundary Dispute",
      severity: "Medium", 
      confidence: 87.3,
      description: "Overlapping boundary claims between adjacent parcels",
      parcelId: "245/1B, 245/3C",
      timestamp: "2024-01-15 13:45:12",
      status: "Resolved"
    },
    {
      id: 3,
      type: "Data Inconsistency",
      severity: "Low",
      confidence: 76.8,
      description: "Minor discrepancy in land area measurements",
      parcelId: "245/4D",
      timestamp: "2024-01-15 12:15:30",
      status: "Pending"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Under Review': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Pending': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const detectionStats = {
    totalScanned: 1247,
    anomaliesFound: 23,
    resolved: 18,
    pending: 5,
    accuracy: 94.2
  };

  return (
    <div className="space-y-6">
      {/* AI Detection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{detectionStats.totalScanned}</p>
            <p className="text-sm text-gray-500">Documents Scanned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{detectionStats.anomaliesFound}</p>
            <p className="text-sm text-gray-500">Anomalies Detected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{detectionStats.resolved}</p>
            <p className="text-sm text-gray-500">Issues Resolved</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{detectionStats.accuracy}%</p>
            <p className="text-sm text-gray-500">AI Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Anomaly Detection Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(anomaly.status)}
                      <h4 className="font-medium text-gray-900">{anomaly.type}</h4>
                    </div>
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className="font-semibold text-gray-900">{anomaly.confidence}%</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{anomaly.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Parcel: {anomaly.parcelId}</span>
                  <span>Detected: {anomaly.timestamp}</span>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Detection Confidence</span>
                    <span className="text-sm font-medium">{anomaly.confidence}%</span>
                  </div>
                  <Progress value={anomaly.confidence} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Detection Categories</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Document Fraud</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Boundary Issues</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Inconsistency</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Immediate review required for high-risk document fraud cases</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Schedule field verification for boundary dispute areas</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Update data validation rules to prevent inconsistencies</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}