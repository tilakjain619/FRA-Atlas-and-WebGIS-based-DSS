import { Shield, QrCode, Download, Share, Eye, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

export function BlockchainPattas() {
  const pattaRecords = [
    {
      id: "PATTA-2024-001",
      surveyNumber: "245/1B",
      ownerName: "Rajesh Kumar Sharma",
      area: "2.5 Acres",
      issueDate: "2024-01-15",
      blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
      qrCode: "QR-PATTA-001",
      status: "Verified",
      transactionId: "TX-789123456"
    },
    {
      id: "PATTA-2024-002", 
      surveyNumber: "245/2A",
      ownerName: "Sunita Devi",
      area: "1.8 Acres",
      issueDate: "2024-01-14",
      blockchainHash: "0x9876543210fedcba0987654321abcdef",
      qrCode: "QR-PATTA-002",
      status: "Pending Verification",
      transactionId: "TX-456789123"
    },
    {
      id: "PATTA-2024-003",
      surveyNumber: "245/3C", 
      ownerName: "Mohan Singh",
      area: "3.2 Acres",
      issueDate: "2024-01-13",
      blockchainHash: "0xabcdef1234567890fedcba0987654321",
      qrCode: "QR-PATTA-003",
      status: "Verified",
      transactionId: "TX-123456789"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending Verification': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Blockchain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-sm text-gray-500">Total Pattas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <QrCode className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">142</p>
            <p className="text-sm text-gray-500">QR Generated</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BC</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">138</p>
            <p className="text-sm text-gray-500">On Blockchain</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">99.2%</p>
            <p className="text-sm text-gray-500">Verification Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Digital Patta Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Blockchain-Verified Digital Pattas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pattaRecords.map((patta) => (
              <div key={patta.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{patta.id}</h3>
                    <p className="text-gray-600">Survey No: {patta.surveyNumber}</p>
                  </div>
                  
                  <Badge className={getStatusColor(patta.status)}>
                    {patta.status}
                  </Badge>
                </div>

                {/* Owner Information */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Owner Name</p>
                    <p className="font-medium text-gray-900">{patta.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Land Area</p>
                    <p className="font-medium text-gray-900">{patta.area}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium text-gray-900">{patta.issueDate}</p>
                  </div>
                </div>

                {/* Blockchain Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Blockchain Details</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Blockchain Hash:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-800">
                          {patta.blockchainHash.substring(0, 20)}...
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(patta.blockchainHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Transaction ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-800">{patta.transactionId}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(patta.transactionId)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">QR Code ID</p>
                      <p className="font-medium text-gray-900">{patta.qrCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Process */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Verification Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-semibold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Document Creation</h4>
              <p className="text-sm text-gray-500">Digital patta generated from verified data</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-semibold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Blockchain Recording</h4>
              <p className="text-sm text-gray-500">Document hash stored immutably on blockchain</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-semibold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">QR Generation</h4>
              <p className="text-sm text-gray-500">Unique QR code linked to blockchain record</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-semibold">4</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Public Verification</h4>
              <p className="text-sm text-gray-500">Anyone can verify authenticity via QR scan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}