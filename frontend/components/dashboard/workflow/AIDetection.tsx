import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, XCircle, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

interface Anomaly {
  id: number;
  claim_id: string;
  type: string;
  severity: string;
  confidence: number;
  description: string;
  claimant_name: string;
  area: number;
  timestamp: string;
  status: string;
}

interface AnomalyResponse {
  success: boolean;
  anomalies: Anomaly[];
  summary: {
    total_analyzed: number;
    anomalies_found: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  claims_analyzed: number;
  updated_anomaly_flags: number;
}

export function AIDetection() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState({
    total_analyzed: 0,
    anomalies_found: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0
  });
  const [lastAnalyzed, setLastAnalyzed] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Fetch existing anomalous claims on component mount
  useEffect(() => {
    fetchAnomalousClaims();
  }, []);

  const fetchAnomalousClaims = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/claims/anomalies`);
      
      if (response.data.success) {
        // Convert anomalous claims to anomaly format
        const claimAnomalies = response.data.anomalous_claims.map((claim: any, index: number) => ({
          id: index + 1,
          claim_id: claim._id,
          type: claim.anomaly_details?.type || "Data Anomaly",
          severity: claim.anomaly_details?.severity || "Medium",
          confidence: claim.anomaly_details?.confidence || 75,
          description: claim.anomaly_details?.description || `Anomaly detected in claim for ${claim.claimant_name}`,
          claimant_name: claim.claimant_name,
          area: claim.area,
          timestamp: claim.submission_date || new Date().toISOString(),
          status: "Flagged"
        }));
        
        setAnomalies(claimAnomalies);
        setSummary({
          total_analyzed: response.data.count,
          anomalies_found: response.data.count,
          high_risk: claimAnomalies.filter((a: Anomaly) => a.severity === 'High').length,
          medium_risk: claimAnomalies.filter((a: Anomaly) => a.severity === 'Medium').length,
          low_risk: claimAnomalies.filter((a: Anomaly) => a.severity === 'Low').length
        });
      }
    } catch (err: any) {
      console.error('Error fetching anomalous claims:', err);
      setError('Failed to fetch anomalous claims');
    } finally {
      setLoading(false);
    }
  };

  const runAnomalyDetection = async () => {
    setAnalyzing(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/claims/detect-anomalies`);
      
      if (response.data.success) {
        setAnomalies(response.data.anomalies);
        setSummary(response.data.summary);
        setLastAnalyzed(new Date().toLocaleString());
        
        // Refresh the anomalous claims list
        await fetchAnomalousClaims();
      }
    } catch (err: any) {
      console.error('Error running anomaly detection:', err);
      setError('Failed to run anomaly detection');
    } finally {
      setAnalyzing(false);
    }
  };

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

  // Dynamic stats based on current data
  const detectionStats = {
    totalScanned: summary.total_analyzed,
    anomaliesFound: summary.anomalies_found,
    resolved: anomalies.filter(a => a.status === 'Resolved').length,
    pending: anomalies.filter(a => a.status === 'Pending' || a.status === 'Flagged').length,
    accuracy: anomalies.length > 0 ? (anomalies.reduce((acc, a) => acc + a.confidence, 0) / anomalies.length).toFixed(1) : '0'
  };

  return (
    <div className="space-y-6">
      {/* AI Detection Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Anomaly Detection
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={runAnomalyDetection}
                disabled={analyzing}
                className="bg-primary hover:bg-primary/90"
              >
                {analyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {analyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
              <Button
                onClick={fetchAnomalousClaims}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
          {lastAnalyzed && (
            <p className="text-sm text-gray-500">Last analyzed: {lastAnalyzed}</p>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </CardHeader>
      </Card>

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
                  <span>Claim ID: {anomaly.claim_id}</span>
                  <span>Claimant: {anomaly.claimant_name}</span>
                  <span>Area: {anomaly.area} ha</span>
                </div>
                
                <div className="text-sm text-gray-500 mt-1">
                  <span>Detected: {new Date(anomaly.timestamp).toLocaleString()}</span>
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
                {(() => {
                  const categoryStats = anomalies.reduce((acc, anomaly) => {
                    const type = anomaly.type;
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  const total = anomalies.length || 1;
                  
                  return Object.entries(categoryStats).map(([category, count]) => {
                    const percentage = Math.round((count / total) * 100);
                    const color = percentage > 50 ? 'bg-red-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-green-500';
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    );
                  });
                })()}
                
                {anomalies.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <p>No anomalies detected</p>
                    <p className="text-sm">Run analysis to detect potential issues</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {summary.high_risk > 0 && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Immediate review required for {summary.high_risk} high-risk anomal{summary.high_risk === 1 ? 'y' : 'ies'}</p>
                  </div>
                )}
                {summary.medium_risk > 0 && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Schedule verification for {summary.medium_risk} medium-risk case{summary.medium_risk === 1 ? '' : 's'}</p>
                  </div>
                )}
                {summary.low_risk > 0 && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Monitor {summary.low_risk} low-risk anomal{summary.low_risk === 1 ? 'y' : 'ies'} for patterns</p>
                  </div>
                )}
                {anomalies.length === 0 && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>No anomalies detected. System operating normally.</p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Run regular analysis to maintain data quality and detect emerging patterns</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}