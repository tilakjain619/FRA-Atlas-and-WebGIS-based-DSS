import { useState } from 'react';
import { TrendingUp, MapPin, Settings, Play, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Slider } from '../../ui/slider';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export function PredictiveAnalytics() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeHorizon, setTimeHorizon] = useState([6]); // months
  const [riskThreshold, setRiskThreshold] = useState([75]); // percentage
  const [policyImpact, setPolicyImpact] = useState([50]); // percentage

  const hotspots = [
    {
      id: 1,
      name: "Rampur Khas Village",
      riskScore: 87,
      predictedCases: 12,
      factors: ["High document fraud", "Boundary disputes", "Rapid urbanization"],
      coordinates: "28.3670° N, 77.3119° E"
    },
    {
      id: 2,
      name: "Saharanpur Tehsil", 
      riskScore: 74,
      predictedCases: 8,
      factors: ["Data inconsistencies", "Officer shortage", "Legacy systems"],
      coordinates: "29.9680° N, 77.5552° E"
    },
    {
      id: 3,
      name: "Industrial Zone B",
      riskScore: 92,
      predictedCases: 15,
      factors: ["Land acquisition", "Multiple stakeholders", "Policy changes"],
      coordinates: "28.4595° N, 77.0266° E"
    }
  ];

  const policyScenarios = [
    {
      name: "Enhanced Verification Protocol",
      description: "Implement stricter document verification process",
      impact: {
        fraudReduction: 35,
        processingTime: -20,
        costIncrease: 15
      }
    },
    {
      name: "AI-First Processing",
      description: "Prioritize AI screening before human review", 
      impact: {
        fraudReduction: 28,
        processingTime: 45,
        costIncrease: -10
      }
    },
    {
      name: "Mobile Officer Deployment",
      description: "Increase field officers in high-risk zones",
      impact: {
        fraudReduction: 42,
        processingTime: -15,
        costIncrease: 25
      }
    }
  ];

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-500 text-white';
    if (score >= 60) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getImpactColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Predictive Analytics Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="urban">Urban Areas</SelectItem>
                  <SelectItem value="rural">Rural Areas</SelectItem>
                  <SelectItem value="industrial">Industrial Zones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Time Horizon: {timeHorizon[0]} months
              </label>
              <Slider
                value={timeHorizon}
                onValueChange={setTimeHorizon}
                max={24}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Risk Threshold: {riskThreshold[0]}%
              </label>
              <Slider
                value={riskThreshold}
                onValueChange={setRiskThreshold}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Play className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Hotspots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Predicted Risk Hotspots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hotspots.map((hotspot) => (
              <div key={hotspot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{hotspot.name}</h4>
                    <p className="text-sm text-gray-500">{hotspot.coordinates}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getRiskColor(hotspot.riskScore)}>
                      Risk: {hotspot.riskScore}%
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">{hotspot.predictedCases} predicted cases</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
                  <div className="flex flex-wrap gap-2">
                    {hotspot.factors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className={`h-2 rounded-full ${hotspot.riskScore >= 80 ? 'bg-red-500' : hotspot.riskScore >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${hotspot.riskScore}%` }}
                    ></div>
                  </div>
                  <Button variant="outline" size="sm">
                    View on Map
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policy Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Policy Impact Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Policy Implementation Scale: {policyImpact[0]}%
            </label>
            <Slider
              value={policyImpact}
              onValueChange={setPolicyImpact}
              max={100}
              min={0}
              step={10}
              className="mb-4"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {policyScenarios.map((scenario, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{scenario.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fraud Reduction</span>
                    <span className={`text-sm font-medium ${getImpactColor(scenario.impact.fraudReduction)}`}>
                      +{scenario.impact.fraudReduction}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Processing Time</span>
                    <span className={`text-sm font-medium ${getImpactColor(scenario.impact.processingTime)}`}>
                      {scenario.impact.processingTime > 0 ? '+' : ''}{scenario.impact.processingTime}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost Impact</span>
                    <span className={`text-sm font-medium ${getImpactColor(scenario.impact.costIncrease)}`}>
                      {scenario.impact.costIncrease > 0 ? '+' : ''}{scenario.impact.costIncrease}%
                    </span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Simulate Policy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Historical Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Case Volume Trends</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Q1 2024</span>
                  <span className="font-medium">89 cases</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Q2 2024</span>
                  <span className="font-medium text-green-600">67 cases ↓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Predicted Q3</span>
                  <span className="font-medium text-blue-600">52 cases ↓</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Fraud Detection Rate</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Manual Review</span>
                  <span className="font-medium">73.2%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI + Manual</span>
                  <span className="font-medium text-green-600">94.2% ↑</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Projected</span>
                  <span className="font-medium text-blue-600">97.1% ↑</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Processing Efficiency</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg. Resolution</span>
                  <span className="font-medium">3.2 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current</span>
                  <span className="font-medium text-green-600">1.8 days ↓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Target</span>
                  <span className="font-medium text-blue-600">1.2 days ↓</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}