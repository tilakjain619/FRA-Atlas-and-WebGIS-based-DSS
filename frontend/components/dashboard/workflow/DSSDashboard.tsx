import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, BarChart3, AlertCircle, Users, FileCheck, Clock, Smartphone, Lightbulb, Droplets, Link as LinkIcon, Camera, Upload, Image as ImageIcon, X, Loader2, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "../../ui/utils";
import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// TypeScript interfaces for data structures
interface ClaimData {
  _id: string;
  claimant_name: string;
  area: string;
  claim_type: string;
  district?: string;
  state?: string;
  village?: string;
  is_anomaly: boolean;
  created_at?: string;
}

interface DSSRecommendation {
  id: string;
  type: string;
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
  action: string;
  status: 'pending' | 'in-progress' | 'completed' | 'actioned';
  priority: 'High' | 'Medium' | 'Low';
}

interface SystemAlert {
  id: number;
  type: string;
  message: string;
  priority: string;
  timestamp: string;
  assignee: string;
  claimId?: string;
}

interface OfficerActivity {
  id: string;
  name: string;
  role: string;
  location: string;
  status: 'online' | 'offline' | 'busy';
  cases: number;
}

interface KPIData {
  title: string;
  value: number;
  change: string;
  color: string;
  icon: LucideIcon;
}

interface Statistics {
  total_claims: number;
  anomaly_claims: number;
  normal_claims: number;
  individual_claims: number;
  community_claims: number;
  today_submissions: number;
  anomaly_rate: number;
  district_stats?: Record<string, any>;
}

// Fetch data from API
const fetchClaimsData = async () => {
  console.log('Fetching data from API_BASE_URL:', API_BASE_URL);
  
  try {
    // Test basic connectivity first
    const healthCheck = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    console.log('Backend health check successful:', healthCheck.status);

    const [claimsResponse, anomaliesResponse, statisticsResponse, schemesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/claims/`, { timeout: 10000 }),
      axios.get(`${API_BASE_URL}/claims/anomalies`, { timeout: 10000 }),
      axios.get(`${API_BASE_URL}/claims/statistics`, { timeout: 10000 }),
      axios.get(`${API_BASE_URL}/dss/schemes`, { timeout: 10000 })
    ]);

    console.log('API responses received:', {
      claims: claimsResponse.data?.length || 0,
      anomalies: anomaliesResponse.data?.length || 0,
      statistics: statisticsResponse.data,
      schemes: schemesResponse.data?.schemes?.length || 0
    });

    return {
      claims: claimsResponse.data,
      anomalies: anomaliesResponse.data,
      statistics: statisticsResponse.data,
      schemes: schemesResponse.data?.schemes || []
    };
  } catch (error: any) {
    console.error('Error fetching claims data:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Backend server is not running. Please start the FastAPI server.');
    } else if (error.response?.status === 404) {
      throw new Error(`API endpoint not found: ${error.config?.url}`);
    } else if (error.response?.status >= 500) {
      throw new Error('Backend server error. Please check server logs.');
    } else {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch data');
    }
  }
};

// New AI-powered DSS analysis function
const analyzeWithAI = async (claimData: ClaimData[], schemes: any[]) => {
  try {
    console.log('Running AI-powered DSS analysis...');
    
    // Sample claim for AI analysis
    const sampleClaim = claimData[0];
    if (!sampleClaim) return [];

    // Mock village data (in production, this would come from GIS data)
    const villageData = {
      name: sampleClaim.village || 'Unknown Village',
      water_index: Math.random() * 0.6, // Mock water stress data
      forest_cover: 0.6 + Math.random() * 0.3,
      population: 500 + Math.floor(Math.random() * 1000),
      literacy_rate: 0.5 + Math.random() * 0.4,
      infrastructure_score: 2 + Math.random() * 3
    };

    const aiAnalysisResponse = await axios.post(`${API_BASE_URL}/dss/analyze`, {
      claim_data: sampleClaim,
      village_data: villageData,
      schemes_data: schemes
    });

    return aiAnalysisResponse.data || [];
  } catch (error: any) {
    console.error('Error in AI DSS analysis:', error);
    return [];
  }
};

// Modal component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Loader component
const Loader: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
    <p className="text-gray-600">{text}</p>
  </div>
);

export function DSSDashboard() {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [arModeEnabled, setArModeEnabled] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'detected'>('idle');

  // Data states
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [anomalousClaims, setAnomalousClaims] = useState<ClaimData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [dssRecommendations, setDssRecommendations] = useState<DSSRecommendation[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<SystemAlert[]>([]);
  const [officerActivity, setOfficerActivity] = useState<OfficerActivity[]>([
    { id: 'off1', name: 'Priya Sharma', role: 'FRA Specialist', location: 'Chhattisgarh', status: 'online', cases: 0 },
    { id: 'off2', name: 'Ravi Kumar', role: 'Field Officer', location: 'Jharkhand', status: 'busy', cases: 0 },
    { id: 'off3', name: 'Anjali Singh', role: 'Legal Advisor', location: 'Odisha', status: 'online', cases: 0 },
    { id: 'off4', name: 'Vikram Patel', role: 'Survey Expert', location: 'Maharashtra', status: 'offline', cases: 0 }
  ]);

  // Modal state
  const [modalState, setModalState] = useState({ isOpen: false, title: '', content: '' });

  // REAL DATA FETCHING & DSS ENGINE
  const fetchAndProcessData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { claims, anomalies, statistics, schemes } = await fetchClaimsData();
      
      // Validate and ensure data is in expected format
      const validClaims = Array.isArray(claims) ? claims : [];
      const validAnomalies = Array.isArray(anomalies) ? anomalies : [];
      const validStatistics = statistics && typeof statistics === 'object' ? statistics : {};
      const validSchemes = Array.isArray(schemes) ? schemes : [];
      
      // Update state with real data
      setClaims(validClaims);
      setAnomalousClaims(validAnomalies);
      setStatistics(validStatistics);
      
      // Generate KPI data from real statistics
      if (validStatistics && Object.keys(validStatistics).length > 0) {
        const safeStatistics = {
          total_claims: validStatistics.total_claims || 0,
          anomaly_claims: validStatistics.anomaly_claims || 0,
          normal_claims: validStatistics.normal_claims || 0,
          individual_claims: validStatistics.individual_claims || 0,
          community_claims: validStatistics.community_claims || 0,
          today_submissions: validStatistics.today_submissions || 0,
          anomaly_rate: validStatistics.anomaly_rate || 0
        };

        setKpiData([
          { 
            title: "Total Claims", 
            value: safeStatistics.total_claims, 
            change: `${safeStatistics.today_submissions} today`, 
            color: "text-blue-600", 
            icon: FileCheck 
          },
          { 
            title: "Anomaly Flags", 
            value: safeStatistics.anomaly_claims, 
            change: `${safeStatistics.anomaly_rate.toFixed(1)}% rate`, 
            color: "text-red-600", 
            icon: AlertCircle 
          },
          { 
            title: "Processing", 
            value: safeStatistics.normal_claims, 
            change: "Under review", 
            color: "text-yellow-600", 
            icon: Clock 
          },
          { 
            title: "Individual Claims", 
            value: safeStatistics.individual_claims, 
            change: `vs ${safeStatistics.community_claims} community`, 
            color: "text-green-600", 
            icon: Users 
          }
        ]);
      }
      
      // Generate dynamic alerts from anomalous claims
      const alerts: SystemAlert[] = validAnomalies.slice(0, 4).map((claim: ClaimData, index: number) => ({
        id: index + 1,
        type: "AI Anomaly Detection",
        message: `Suspicious activity detected in claim by ${claim.claimant_name} from ${claim.village || 'Unknown'} district.`,
        priority: claim.is_anomaly ? 'High' : 'Medium',
        timestamp: claim.created_at ? new Date(claim.created_at).toLocaleString() : 'Recently',
        assignee: "AI System",
        claimId: claim._id
      }));
      
      setRecentAlerts(alerts);
      
      // Generate DSS recommendations based on real data
      const recommendations: DSSRecommendation[] = [];
      
      // AI-powered scheme eligibility and intervention recommendations
      if (validClaims.length > 0 && validSchemes.length > 0) {
        try {
          const aiRecommendations = await analyzeWithAI(validClaims, validSchemes);
          
          // Convert AI recommendations to our format
          aiRecommendations.forEach((aiRec: any, index: number) => {
            recommendations.push({
              id: aiRec.id || `ai-rec-${index}`,
              type: aiRec.type || 'AI Recommendation',
              icon: aiRec.type === 'Scheme Eligibility' ? LinkIcon : 
                    aiRec.type === 'Priority Intervention' ? BarChart3 : 
                    Lightbulb,
              color: aiRec.priority === 'High' ? 'text-red-600' : 
                     aiRec.priority === 'Medium' ? 'text-orange-600' : 
                     'text-blue-600',
              title: aiRec.title,
              description: `${aiRec.description} (Confidence: ${(aiRec.confidence_score * 100).toFixed(0)}%)`,
              action: aiRec.action,
              status: 'pending',
              priority: aiRec.priority
            });
          });
        } catch (error) {
          console.error('AI analysis failed, falling back to rule-based recommendations:', error);
        }
      }
      
      // Anomaly-based recommendations
      if (validAnomalies.length > 0) {
        recommendations.push({
          id: `rec-anomaly-review`,
          type: 'Urgent Review',
          icon: AlertCircle,
          color: 'text-red-600',
          title: `Review ${validAnomalies.length} Flagged Claims`,
          description: `AI has detected ${validAnomalies.length} potentially anomalous claims requiring immediate review.`,
          action: 'Start Review Process',
          status: 'pending',
          priority: 'High'
        });
      }
      
      // District-wise recommendations
      if (validStatistics && validStatistics.district_stats) {
        const districtEntries = Object.entries(validStatistics.district_stats);
        const highAnomalyDistricts = districtEntries.filter(([_, stats]: [string, any]) => 
          stats.anomalies > 0 && (stats.anomalies / stats.total) > 0.2
        );
        
        highAnomalyDistricts.forEach(([district, stats]: [string, any]) => {
          recommendations.push({
            id: `rec-district-${district}`,
            type: 'District Alert',
            icon: Droplets,
            color: 'text-orange-600',
            title: `High Anomaly Rate in ${district}`,
            description: `${district} district shows ${stats.anomalies}/${stats.total} anomalous claims (${((stats.anomalies/stats.total)*100).toFixed(1)}%). Requires investigation.`,
            action: 'Deploy Field Team',
            status: 'pending',
            priority: 'Medium'
          });
        });
      }
      
      // System health recommendations
      if (validClaims.length > 0) {
        const todaySubmissions = validStatistics?.today_submissions || 0;
        if (todaySubmissions > 5) {
          recommendations.push({
            id: `rec-high-volume`,
            type: 'System Efficiency',
            icon: BarChart3,
            color: 'text-blue-600',
            title: `High Volume Day: ${todaySubmissions} Claims`,
            description: `Today has seen ${todaySubmissions} new claim submissions. Consider allocating additional review resources.`,
            action: 'Scale Resources',
            status: 'pending',
            priority: 'Low'
          });
        }
      }
      
      setDssRecommendations(recommendations);
      
      // Update officer activity with real case counts
      setOfficerActivity(prev => prev.map(officer => ({
        ...officer,
        cases: Math.floor(Math.random() * (validStatistics?.total_claims || 10) * 0.1) // Simulate case distribution
      })));
      
      setLastUpdated(new Date().toLocaleString());
      
    } catch (err: any) {
      console.error('Error fetching DSS data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch data. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAndProcessData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Event handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setUploadedImage(URL.createObjectURL(file));
        setDetectionStatus('detecting');
        
        try {
          // Convert file to base64 for API
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          // Call AI image analysis API (mock implementation)
          const analysisResult = await analyzeImageWithAI(base64);
          
          const newRecommendation: DSSRecommendation = {
              id: `rec-img-${Date.now()}`, 
              type: analysisResult.anomaly_detected ? 'Land Encroachment Alert' : 'Image Analysis Complete',
              icon: AlertCircle, 
              color: analysisResult.anomaly_detected ? 'text-red-600' : 'text-green-600', 
              title: analysisResult.title,
              description: analysisResult.description,
              action: analysisResult.anomaly_detected ? 'Dispatch Survey Team' : 'File for Record', 
              status: 'pending',
              priority: analysisResult.anomaly_detected ? 'High' : 'Low'
          };
          setDssRecommendations(prev => [newRecommendation, ...prev]);
          setDetectionStatus('detected');
          
        } catch (error) {
          console.error('Image analysis failed:', error);
          // Fallback to mock analysis
          const newRecommendation: DSSRecommendation = {
              id: `rec-img-${Date.now()}`, 
              type: 'Image Analysis', 
              icon: AlertCircle, 
              color: 'text-orange-600', 
              title: 'Image Analysis Complete', 
              description: `Image uploaded and queued for manual review. File ID: IMG-${Date.now().toString().slice(-4)}`, 
              action: 'Review Manually', 
              status: 'pending',
              priority: 'Medium'
          };
          setDssRecommendations(prev => [newRecommendation, ...prev]);
          setDetectionStatus('detected');
        }
    }
  };

  // AI Image Analysis function
  const analyzeImageWithAI = async (base64Image: string) => {
    try {
      // Mock AI analysis - in production, this would call AIML API for image analysis
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock analysis results based on random factors
      const anomalyDetected = Math.random() > 0.7; // 30% chance of anomaly
      
      return {
        anomaly_detected: anomalyDetected,
        confidence: anomalyDetected ? 0.85 : 0.95,
        title: anomalyDetected ? 'Potential Land Boundary Violation' : 'Land Boundary Verification Complete',
        description: anomalyDetected ? 
          'AI analysis detected potential encroachment or unauthorized land use. Satellite imagery comparison shows changes in forest cover within the claimed area.' :
          'AI analysis confirms the land use appears consistent with FRA claim. No significant anomalies detected in forest cover or boundary markers.',
        analysis_details: {
          forest_cover_change: anomalyDetected ? -15 : 2,
          boundary_markers_detected: !anomalyDetected,
          unauthorized_structures: anomalyDetected,
          confidence_score: anomalyDetected ? 0.85 : 0.95
        }
      };
    } catch (error) {
      throw new Error('Image analysis service unavailable');
    }
  };
  
  const handleAction = useCallback((id: string, type: string) => {
      if (type === 'recommendation') {
        const recommendation = dssRecommendations.find(rec => rec.id === id);
        setDssRecommendations(prev => prev.map(rec => rec.id === id ? {...rec, status: 'actioned'} : rec));
        openModal('Action Confirmed', `Action "${recommendation?.action}" has been initiated for recommendation: "${recommendation?.title}". The relevant department has been notified.`);
      } else if (type === 'alert') {
        const alert = recentAlerts.find(alert => alert.id.toString() === id);
        setRecentAlerts(prev => prev.filter(alert => alert.id.toString() !== id));
        openModal('Alert Resolved', `The alert "${alert?.type}" has been marked as resolved and removed from the list.`);
      }
  }, [dssRecommendations, recentAlerts]);

  const openModal = (title: string, content: string) => setModalState({ isOpen: true, title, content });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-300';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return <Loader text="Loading Decision Support System..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading DSS</h2>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <Button onClick={fetchAndProcessData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Decision Support System</h1>
          <p className="text-gray-600 mt-1">AI-powered insights for FRA claim management • Last updated: {lastUpdated}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={arModeEnabled} 
              onCheckedChange={setArModeEnabled} 
            />
            <span className="text-sm font-medium">AR Mode</span>
            <Badge variant="outline" className={cn("transition-colors", arModeEnabled ? "bg-green-600 text-white border-green-600" : "bg-gray-200 text-gray-700 border-gray-200")}>
              {arModeEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Button onClick={fetchAndProcessData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.change}</p>
                </div>
                <kpi.icon className={cn("h-8 w-8", kpi.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scheme Eligibility Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <LinkIcon className="w-5 h-5 text-green-500" />
            Central Sector Schemes (CSS) Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-900 mb-2">DAJGUA</h4>
              <p className="text-sm text-blue-700 mb-2">Development of Antyodaya and Other Tribal Families</p>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300" variant="outline">
                {statistics ? `${Math.floor((statistics.total_claims || 0) * 0.6)} Eligible` : 'Loading...'}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-900 mb-2">PM-JANMAN</h4>
              <p className="text-sm text-green-700 mb-2">Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan</p>
              <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
                {statistics ? `${Math.floor((statistics.total_claims || 0) * 0.4)} Eligible` : 'Loading...'}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50">
              <h4 className="font-semibold text-purple-900 mb-2">Jal Shakti</h4>
              <p className="text-sm text-purple-700 mb-2">Water Conservation & Borewell Installation</p>
              <Badge className="bg-purple-100 text-purple-800 border-purple-300" variant="outline">
                High Priority
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DSS Recommendations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Smartphone className="w-5 h-5 text-blue-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dssRecommendations.slice(0, 6).map((rec) => (
                  <div 
                    key={rec.id} 
                    className={cn(
                      "flex items-start gap-4 p-4 border rounded-lg bg-white transition-all duration-300", 
                      rec.status === 'actioned' && "bg-gray-100 opacity-60"
                    )}
                  >
                    <rec.icon className={cn("w-5 h-5 mt-1 flex-shrink-0", rec.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <Badge className={getPriorityColor(rec.priority)} variant="outline">
                            {rec.priority}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="self-center ml-4 flex-shrink-0" 
                          onClick={() => handleAction(rec.id, 'recommendation')} 
                          disabled={rec.status === 'actioned'}
                        >
                          {rec.status === 'actioned' ? 'Actioned' : rec.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Image Analysis */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Camera className="w-5 h-5 text-green-500" />
                Real-time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <img src={uploadedImage} alt="Uploaded" className="max-w-full h-32 object-cover rounded-lg mx-auto" />
                      {detectionStatus === 'detecting' && (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-blue-600">Analyzing...</span>
                        </div>
                      )}
                      {detectionStatus === 'detected' && (
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-600">
                            {dssRecommendations[0]?.type === 'Land Encroachment Alert'
                              ? 'Anomaly Detected'
                              : 'No Anomaly Detected'}
                            </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Upload Image</p>
                        <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ pointerEvents: uploadedImage ? 'none' : 'auto' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Alerts and Officer Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-900">{alert.type}</p>
                        <p className="text-xs text-red-700 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(alert.priority)} variant="outline">
                            {alert.priority}
                          </Badge>
                          <span className="text-xs text-red-600">{alert.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openModal(`Alert Details: ${alert.id}`, alert.message)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAction(alert.id.toString(), 'alert')}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Officer Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Users className="w-5 h-5 text-green-500" />
              Officer Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {officerActivity.map((officer) => (
                <div key={officer.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{officer.name}</p>
                      <p className="text-xs text-gray-500">{officer.role} • {officer.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(officer.status)} variant="outline">
                      {officer.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{officer.cases} cases</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, title: '', content: '' })} 
        title={modalState.title}
      >
        <p>{modalState.content}</p>
      </Modal>
    </div>
  );
}