import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { FileText, User, MapPin, Calendar, Hash } from 'lucide-react';

export function OCRData() {
  const extractedData = {
    documentType: "Land Patta Certificate",
    confidence: 98.5,
    entities: [
      { label: "Owner Name", value: "Rajesh Kumar Sharma", confidence: 99.2, type: "PERSON" },
      { label: "Father's Name", value: "Mohan Lal Sharma", confidence: 97.8, type: "PERSON" },
      { label: "Survey Number", value: "245/1B", confidence: 99.8, type: "ID" },
      { label: "Village", value: "Rampur Khas", confidence: 98.9, type: "LOCATION" },
      { label: "Tehsil", value: "Saharanpur", confidence: 99.1, type: "LOCATION" },
      { label: "District", value: "Saharanpur", confidence: 99.5, type: "LOCATION" },
      { label: "Area", value: "2.5 Acres", confidence: 96.7, type: "MEASURE" },
      { label: "Date of Issue", value: "15-March-2024", confidence: 94.3, type: "DATE" },
      { label: "Revenue Inspector", value: "A.K. Verma", confidence: 92.1, type: "PERSON" },
      { label: "Khata Number", value: "KH-2024-0158", confidence: 98.6, type: "ID" }
    ]
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON': return <User className="w-4 h-4" />;
      case 'LOCATION': return <MapPin className="w-4 h-4" />;
      case 'DATE': return <Calendar className="w-4 h-4" />;
      case 'ID': return <Hash className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'bg-green-500';
    if (confidence >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Document Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              OCR Processing Results
            </div>
            <Badge className="bg-green-500 text-white">
              {extractedData.confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{extractedData.documentType}</h3>
              <p className="text-sm text-gray-500">Processed with Named Entity Recognition</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Entities */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Data Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {extractedData.entities.map((entity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {getEntityIcon(entity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{entity.label}</p>
                    <p className="font-medium text-gray-900">{entity.value}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${getConfidenceColor(entity.confidence)}`}
                  />
                  <span className="text-xs text-gray-500">{entity.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entity Types Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['PERSON', 'LOCATION', 'DATE', 'ID'].map((type) => {
          const count = extractedData.entities.filter(e => e.type === type).length;
          return (
            <Card key={type}>
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 mx-auto mb-2 text-primary">
                  {getEntityIcon(type)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{type.toLowerCase()}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}