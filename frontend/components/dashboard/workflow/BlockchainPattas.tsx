import React, { useState, useEffect, useRef } from 'react';

// --- SVG Icon Components (recreated from lucide-react for single-file compatibility) ---
const Shield = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const QrCode = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M21 21v.01"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M3 12h.01"></path><path d="M12 3h.01"></path><path d="M12 16h.01"></path><path d="M16 12h.01"></path><path d="M21 12h.01"></path></svg>);
const Eye = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const Copy = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>);
const Download = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>);
const Share = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></svg>);
const X = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
const CheckCircle = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const AlertTriangle = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>);

// --- UI Components ---
const Card = ({ children, className = '' }) => <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
const CardContent = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;
const Button = ({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false }) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    const sizeStyles = { sm: "h-9 px-3", md: "h-10 py-2 px-4" };
    const variantStyles = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
    };
    return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>{children}</button>;
};
const Badge = ({ children, className }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;

export function BlockchainPattas() {
    // --- STATE MANAGEMENT ---
    const [documentFile, setDocumentFile] = useState(null);
    const [pattaId, setPattaId] = useState(`PATTA-${new Date().getFullYear()}-001`);
    const [ownerName, setOwnerName] = useState('Anil Jadhav');
    const [surveyNumber, setSurveyNumber] = useState('245/2B');
    const [area, setArea] = useState('1.8 Acres');
    
    // --- LOCALSTORAGE PERSISTENCE ---
    const [allPattaRecords, setAllPattaRecords] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedRecords = localStorage.getItem('pattaRecords');
                return savedRecords ? JSON.parse(savedRecords) : [];
            } catch (error) {
                console.error("Error parsing records from localStorage", error);
                return [];
            }
        }
        return [];
    });
    
    const [txIdToVerify, setTxIdToVerify] = useState('');
    const [qrModalPatta, setQrModalPatta] = useState(null);
    const [isQrGenerating, setIsQrGenerating] = useState(false);
    const [pattaFromUrl, setPattaFromUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const qrCodeRef = useRef(null);

    // --- SIDE EFFECTS ---
    useEffect(() => {
        // Load QRCode.js library
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
        script.async = true;
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) { document.body.removeChild(script); }};
    }, []);
    
     useEffect(() => {
        // Save to localStorage whenever records change
        if (typeof window !== 'undefined') {
            localStorage.setItem('pattaRecords', JSON.stringify(allPattaRecords));
        }
    }, [allPattaRecords]);

    useEffect(() => {
        // Generate QR Code when modal is opened
        if (qrModalPatta && qrCodeRef.current) {
            setIsQrGenerating(true);
            let attempts = 0;
            const maxAttempts = 30;
            const generate = () => {
                if (window.QRCode) {
                    qrCodeRef.current.innerHTML = '';
                    const verificationUrl = `${window.location.origin}?tx=${qrModalPatta.transactionId}`;
                    new window.QRCode(qrCodeRef.current, { text: verificationUrl, width: 256, height: 256 });
                    setIsQrGenerating(false);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(generate, 100);
                } else {
                    console.error("QR Code library failed to load.");
                    setIsQrGenerating(false); 
                }
            };
            generate();
        }
    }, [qrModalPatta]);
    
    useEffect(() => {
        // Handle verification from URL on page load
        const urlParams = new URLSearchParams(window.location.search);
        const txFromUrl = urlParams.get('tx');
        if (txFromUrl) {
            const record = allPattaRecords.find(p => p.transactionId === txFromUrl);
            if (record) {
                setPattaFromUrl({status: 'found', data: record});
            } else {
                setPattaFromUrl({status: 'not_found', txId: txFromUrl});
            }
        }
        setIsLoading(false);
    }, [allPattaRecords]); 

    // --- HELPER FUNCTIONS ---
    const calculateFileHash = async (file) => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return `0x${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    };

    const copyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Copied to clipboard!');
        } catch (err) {
            alert('Could not copy.');
        }
        document.body.removeChild(textArea);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Verified': return 'bg-green-100 text-green-800';
            case 'Pending Verification': return 'bg-yellow-100 text-yellow-800';
            case 'Processed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // --- EVENT HANDLERS ---
    const handleRegister = async () => {
        if (!documentFile || !pattaId || !ownerName) {
            alert('Please fill all required fields and upload a document.');
            return;
        }
        if (allPattaRecords.some(p => p.id === pattaId)) {
            alert(`Error: Patta ID "${pattaId}" already exists. Please use a unique ID.`);
            return;
        }
        const blockchainHash = await calculateFileHash(documentFile);
        const newPatta = { 
            id: pattaId, 
            surveyNumber, 
            ownerName, 
            area, 
            issueDate: new Date().toISOString(), 
            blockchainHash, 
            status: 'Pending Verification',
            transactionId: null,
            qrCode: null
        };
        setAllPattaRecords(prev => [newPatta, ...prev]);
        const nextIdSuffix = String(Date.now()).slice(-4);
        setPattaId(`PATTA-${new Date().getFullYear()}-${nextIdSuffix}`);
        setOwnerName(''); setSurveyNumber(''); setArea(''); setDocumentFile(null);
        if(document.getElementById('documentFile')) document.getElementById('documentFile').value = '';
    };

    const handleProcessVerification = (pattaToProcessId) => {
        const transactionId = `TX-${Date.now().toString().slice(-10)}`;
        setAllPattaRecords(prevRecords => 
            prevRecords.map(record => {
                if (record.id === pattaToProcessId) {
                    return { 
                        ...record, 
                        status: 'Processed', 
                        transactionId: transactionId, 
                        qrCode: `QR-${record.id}`
                    };
                }
                return record;
            })
        );
        alert(`Patta processed and is ready for final verification.`);
    };

    const handleVerifyAndShow = () => {
        if (!txIdToVerify) {
            alert('Please enter a Transaction ID.');
            return;
        }
        
        let recordFound = false;
        setAllPattaRecords(prevRecords => 
            prevRecords.map(record => {
                if (record.transactionId === txIdToVerify) {
                    recordFound = true;
                    if (record.status === 'Verified') {
                        alert('This record is already verified on the dashboard.');
                    }
                    return { ...record, status: 'Verified' };
                }
                return record;
            })
        );

        if (recordFound) {
            alert('Record successfully verified and updated on the dashboard!');
            setTxIdToVerify('');
        } else {
             alert('Transaction ID not found. Please enter a valid ID.');
        }
    };
    
    const handleDownload = (patta) => {
        let content = `--- DIGITAL PATTA RECORD ---\n\nPatta ID: ${patta.id}\nOwner Name: ${patta.ownerName}\nSurvey Number: ${patta.surveyNumber}\nLand Area: ${patta.area}\nIssue Date: ${new Date(patta.issueDate).toLocaleDateString()}\nStatus: ${patta.status}\n\n`;
        if (patta.status === 'Verified' || patta.status === 'Processed') {
            content += `--- BLOCKCHAIN DETAILS ---\nTransaction ID: ${patta.transactionId}\nDocument Hash (SHA-256): ${patta.blockchainHash}\n`;
        }
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${patta.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleShare = (patta) => {
        if (patta.status !== 'Verified' && patta.status !== 'Processed') {
            alert('Patta must be processed or verified to be shared.');
            return;
        }
        const shareData = { title: `Digital Patta: ${patta.id}`, text: `Verify the digital patta for ${patta.ownerName} using this secure link.`, url: `${window.location.origin}?tx=${patta.transactionId}` };
        copyToClipboard(shareData.url);
        alert('Verification link has been copied to the clipboard!');
    };
    
    // --- DERIVED LISTS FOR UI ---
    const pendingList = allPattaRecords.filter(p => p.status === 'Pending Verification');
    const processedList = allPattaRecords.filter(p => p.status === 'Processed');

    // --- Sub-component for Verification Result Page ---
    const VerificationResultPage = ({ result, onBack }) => {
        if (result.status === 'not_found') {
             return (
                <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center">
                        <CardContent className="p-8">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-red-700 mb-2">Record Not Found</h2>
                            <p className="text-gray-600 mb-4">Transaction ID <code className="bg-red-100 p-1 rounded text-sm">{result.txId}</code> was not found in this browser's local storage.</p>
                            <Button onClick={onBack} size="md">Back to Dashboard</Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        const { data: patta } = result;
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
                 <Card className="max-w-2xl w-full">
                    <CardHeader className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2"/>
                        <CardTitle className="text-2xl text-green-700">Patta Verified Successfully</CardTitle>
                        <p className="text-gray-500">This record is authentic and stored on the blockchain.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div><h3 className="text-lg font-semibold text-gray-900">{patta.id}</h3><p className="text-gray-600">Survey No: {patta.surveyNumber}</p></div>
                                <Badge className={getStatusColor(patta.status)}>{patta.status}</Badge>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div><p className="text-sm text-gray-500">Owner Name</p><p className="font-medium text-gray-900">{patta.ownerName}</p></div>
                                <div><p className="text-sm text-gray-500">Land Area</p><p className="font-medium text-gray-900">{patta.area}</p></div>
                                <div><p className="text-sm text-gray-500">Issue Date</p><p className="font-medium text-gray-900">{new Date(patta.issueDate).toLocaleDateString()}</p></div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Blockchain Details</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Document Hash:</span><div className="flex items-center gap-2"><span className="text-sm font-mono text-gray-800">{patta.blockchainHash.substring(0, 20)}...</span><Button variant="ghost" size="sm" onClick={() => copyToClipboard(patta.blockchainHash)}><Copy className="w-3 h-3" /></Button></div></div>
                                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Transaction ID:</span><div className="flex items-center gap-2"><span className="text-sm font-mono text-gray-800">{patta.transactionId}</span><Button variant="ghost" size="sm" onClick={() => copyToClipboard(patta.transactionId)}><Copy className="w-3 h-3" /></Button></div></div>
                                </div>
                            </div>
                        </div>
                         <Button onClick={onBack} size="md" variant="outline" className="w-full">Back to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const totalPattasCount = allPattaRecords.length;
    const onBlockchainCount = allPattaRecords.filter(p => p.status === 'Processed' || p.status === 'Verified').length;
    const dashboardCount = allPattaRecords.filter(p => p.status === 'Verified').length;
    const verificationRate = totalPattasCount > 0 ? ((dashboardCount / totalPattasCount) * 100).toFixed(1) : '0.0';

    if (isLoading) {
        return <div className="bg-gray-50 min-h-screen flex items-center justify-center"><p>Loading App...</p></div>;
    }

    if (pattaFromUrl) {
        return <VerificationResultPage result={pattaFromUrl} onBack={() => {
            setPattaFromUrl(null);
            window.history.pushState({}, '', window.location.pathname);
        }} />;
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Blockchain Patta Management System</h1>
                    <p className="text-gray-600 mt-2">A decentralized system to manage and verify land patta records.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2">Step 1: Register New Patta</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div><label htmlFor="documentFile" className="block text-sm font-medium text-gray-700 mb-1">Upload Document*</label><input type="file" id="documentFile" className="input-style" onChange={(e) => setDocumentFile(e.target.files[0])} /></div>
                                <div><label htmlFor="pattaId" className="block text-sm font-medium text-gray-700 mb-1">Patta ID*</label><input type="text" id="pattaId" value={pattaId} onChange={(e) => setPattaId(e.target.value)} className="input-style" /></div>
                                <div><label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">Owner Name*</label><input type="text" id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="input-style" /></div>
                                <div><label htmlFor="surveyNumber" className="block text-sm font-medium text-gray-700 mb-1">Survey No.</label><input type="text" id="surveyNumber" value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} className="input-style" /></div>
                                <div><label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Land Area</label><input type="text" id="area" value={area} onChange={(e) => setArea(e.target.value)} className="input-style" /></div>
                                <Button onClick={handleRegister} disabled={!documentFile || !pattaId || !ownerName} className="w-full" size="md">Register Patta</Button>
                            </CardContent>
                        </Card>
                        {pendingList.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>Step 2: Process Pending Records</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {pendingList.map(patta => (
                                        <div key={patta.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                            <p className="font-semibold text-gray-800">{patta.id}</p>
                                            <p className="text-sm text-gray-600">{patta.ownerName}</p>
                                            <Button onClick={() => handleProcessVerification(patta.id)} className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white" size="sm">Process Verification</Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        {processedList.length > 0 && (
                             <Card>
                                <CardHeader><CardTitle>Step 3: Ready for Verification</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {processedList.map(patta => (
                                        <div key={patta.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            <p className="font-semibold text-gray-800">{patta.id}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-sm font-mono text-blue-700">{patta.transactionId}</span>
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(patta.transactionId)}><Copy className="w-3 h-3" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                             <CardHeader><CardTitle>Step 4: Verify to Dashboard</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">Enter the Transaction ID of a processed patta.</p>
                                <div><label htmlFor="txIdToVerify" className="block text-sm font-medium text-gray-700 mb-1">Transaction ID*</label><input type="text" id="txIdToVerify" value={txIdToVerify} onChange={e => setTxIdToVerify(e.target.value)} className="input-style" placeholder="TX-..." /></div>
                                <Button onClick={handleVerifyAndShow} className="w-full" size="md">Verify & Update Dashboard</Button>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card><CardContent className="p-4 text-center"><Shield className="w-8 h-8 text-indigo-600 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{totalPattasCount}</p><p className="text-sm text-gray-500">Total Pattas</p></CardContent></Card>
                            <Card><CardContent className="p-4 text-center"><QrCode className="w-8 h-8 text-green-500 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{dashboardCount}</p><p className="text-sm text-gray-500">Verified on Dashboard</p></CardContent></Card>
                            <Card><CardContent className="p-4 text-center"><div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center"><span className="text-white font-bold text-sm">BC</span></div><p className="text-2xl font-bold text-gray-900">{onBlockchainCount}</p><p className="text-sm text-gray-500">On Blockchain</p></CardContent></Card>
                            <Card><CardContent className="p-4 text-center"><Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" /><p className="text-2xl font-bold text-gray-900">{verificationRate}%</p><p className="text-sm text-gray-500">Verification Rate</p></CardContent></Card>
                        </div>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-600" /> Digital Patta Records</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {allPattaRecords.length > 0 ? allPattaRecords.map((patta) => (
                                        <div key={patta.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div><h3 className="text-lg font-semibold text-gray-900">{patta.id}</h3><p className="text-gray-600">Survey No: {patta.surveyNumber}</p></div>
                                                <Badge className={getStatusColor(patta.status)}>{patta.status}</Badge>
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                                <div><p className="text-sm text-gray-500">Owner Name</p><p className="font-medium text-gray-900">{patta.ownerName}</p></div>
                                                <div><p className="text-sm text-gray-500">Land Area</p><p className="font-medium text-gray-900">{patta.area}</p></div>
                                                <div><p className="text-sm text-gray-500">Issue Date</p><p className="font-medium text-gray-900">{new Date(patta.issueDate).toLocaleDateString()}</p></div>
                                            </div>
                                            
                                            {(patta.status === 'Verified' || patta.status === 'Processed') && (
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Blockchain Details</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Document Hash:</span><div className="flex items-center gap-2"><span className="text-sm font-mono text-gray-800">{patta.blockchainHash.substring(0, 20)}...</span><Button variant="ghost" size="sm" onClick={() => copyToClipboard(patta.blockchainHash)}><Copy className="w-3 h-3" /></Button></div></div>
                                                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Transaction ID:</span><div className="flex items-center gap-2"><span className="text-sm font-mono text-gray-800">{patta.transactionId}</span><Button variant="ghost" size="sm" onClick={() => copyToClipboard(patta.transactionId)}><Copy className="w-3 h-3" /></Button></div></div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><QrCode className="w-8 h-8 text-gray-600" /></div>
                                                    <div><p className="text-sm text-gray-500">QR Code ID</p><p className="font-medium text-gray-900">{patta.qrCode || 'N/A'}</p></div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => (patta.status === 'Verified' || patta.status === 'Processed') ? setQrModalPatta(patta) : alert('Patta must be processed to view QR code.')}><Eye className="w-4 h-4 mr-2" /> View</Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDownload(patta)}><Download className="w-4 h-4 mr-2" /> Download</Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleShare(patta)}><Share className="w-4 h-4 mr-2" /> Share</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-8">No records found. Please register a patta to begin.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {qrModalPatta && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full relative">
                        <Button onClick={() => setQrModalPatta(null)} variant="ghost" size="sm" className="absolute top-2 right-2 !p-2 h-auto"><X className="w-5 h-5" /></Button>
                        <CardTitle className="mb-4 text-center">Verification QR Code</CardTitle>
                        <p className="text-center text-gray-600 mb-1">Patta ID: <span className="font-semibold">{qrModalPatta.id}</span></p>
                        <p className="text-center text-sm text-gray-500 mb-4">Scan this code to verify the document's authenticity.</p>
                        <div ref={qrCodeRef} className="mx-auto flex justify-center items-center p-2 border border-gray-200 rounded-lg bg-white min-h-[272px] min-w-[272px]">
                           {isQrGenerating && <p className="text-gray-500">Generating QR Code...</p>}
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
                .input-style:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); }
            `}} />
        </div>
    );
}

