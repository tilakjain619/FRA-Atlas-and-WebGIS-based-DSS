'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, File, X, CheckCircle, Eye, FileText, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import axios from 'axios';

// Import react-pdf components dynamically to avoid SSR issues
let Document: any, Page: any, pdfjs: any;

if (typeof window !== 'undefined') {
  const reactPdf = require('react-pdf');
  Document = reactPdf.Document;
  Page = reactPdf.Page;
  pdfjs = reactPdf.pdfjs;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'submitting' | 'submitted';
  extractedText?: string;
  file?: File;
  claimId?: string;
}

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

export function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileText, setSelectedFileText] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [activeIntervals, setActiveIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [submissionStatus, setSubmissionStatus] = useState<string>('');

  // Set up PDF.js worker
  useEffect(() => {
    // Set up worker only on client side when pdfjs is available
    if (typeof window !== 'undefined' && pdfjs) {
      // Use the correct version for react-pdf 10.1.0
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.93/legacy/build/pdf.worker.min.js`;
    }
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any remaining intervals when component unmounts
      activeIntervals.forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [activeIntervals]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const isPDFFile = (file: File) => {
    return file.type === 'application/pdf';
  };

  const isProcessableFile = (file: File) => {
    return isImageFile(file) || isPDFFile(file);
  };


// IMPORTANT: match version you installed
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.93/pdf.worker.min.js`;

const extractTextFromPDF = async (file: File, fileId: string) => {
  try {
    console.log('Starting PDF OCR for:', file.name);

    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'processing' } : f
    ));

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    let extractedText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      // Render page to canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;

      // OCR
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject('Failed to create blob'), 'image/png');
      });

      const { data: { text } } = await Tesseract.recognize(blob, 'eng');
      extractedText += `--- Page ${pageNum} ---\n${text.trim()}\n\n`;
    }

    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, status: 'completed', extractedText: extractedText || 'No text found' }
        : f
    ));
  } catch (err) {
    console.error('PDF OCR error:', err);
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'error', extractedText: 'Error processing PDF' } : f
    ));
  }
};


  const extractTextFromImage = async (file: File, fileId: string) => {
    try {
      console.log('Starting OCR text extraction for file:', file.name);

      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'processing' } : f
      ));

      // Run OCR with Tesseract.js
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log('Extracted text from', file.name, ':', text);

      setFiles(prev => prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'completed', extractedText: text.trim() }
          : f
      ));
    } catch (error) {
      console.error('Error extracting text from image:', error);
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error' } : f
      ));
    }
  };

  const extractTextFromFile = async (file: File, fileId: string) => {
    if (isImageFile(file)) {
      await extractTextFromImage(file, fileId);
    } else if (isPDFFile(file)) {
      await extractTextFromPDF(file, fileId);
    } else {
      // For other file types, mark as completed without text extraction
      setFiles(prev => prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'completed', extractedText: 'Text extraction not supported for this file type.' }
          : f
      ));
    }
  };

  // Clean extracted text by removing extra whitespaces and formatting
  const cleanExtractedText = (text: string): string => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/\r\n/g, '\n')         // Normalize line endings
      .replace(/\r/g, '\n')           // Normalize line endings
      .replace(/\s+/g, ' ')           // Replace multiple whitespaces with single space
      .replace(/\n+/g, '\n')          // Replace multiple newlines with single newline
      .replace(/\t/g, ' ')            // Replace tabs with spaces
      .replace(/[^\x20-\x7E\n]/g, '')  // Remove non-printable characters except newlines
      .trim();                        // Remove leading/trailing whitespace
  };

  // Submit extracted text to backend API
  const submitToAPI = async (fileId: string, extractedText: string) => {
    try {
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'submitting' } : f
      ));

      setSubmissionStatus('Submitting to API...');

      // Clean the extracted text before sending
      const cleanedText = cleanExtractedText(extractedText);
      
      // Validate cleaned text
      if (!cleanedText || cleanedText.length < 10) {
        throw new Error('Extracted text is too short or empty after cleaning');
      }
      
      console.log('Original text length:', extractedText.length);
      console.log('Cleaned text length:', cleanedText.length);
      console.log('Submitting to API:', { extracted_text: cleanedText.substring(0, 200) + '...' });

      const response = await axios.post(`${API_BASE_URL}/claims/`, {
        extracted_text: cleanedText
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.success) {
        setFiles(prev => prev.map(f =>
          f.id === fileId 
            ? { ...f, status: 'submitted', claimId: response.data.claim_id } 
            : f
        ));
        setSubmissionStatus(`Claim submitted successfully! ID: ${response.data.claim_id}`);
        console.log('API Response:', response.data);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (error: any) {
      console.error('Error submitting to API:', error);
      
      let errorMessage = 'Error submitting to API. Please try again.';
      
      // Extract specific error message from backend response
      if (error.response?.data?.detail) {
        errorMessage = `API Error: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Network Error: ${error.message}`;
      }
      
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error' } : f
      ));
      setSubmissionStatus(errorMessage);
    }
  };  const processFiles = (fileList: File[]) => {
    fileList.forEach((file) => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading',
        file: file
      };

      setFiles(prev => [...prev, newFile]);

      // Prevent duplicate intervals for the same file
      if (activeIntervals.has(newFile.id)) {
        return;
      }

      // Simulate upload progress
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === newFile.id && f.progress < 100) {
            const newProgress = f.progress + 20;
            if (newProgress >= 100) {
              clearInterval(interval);
              setActiveIntervals(prev => {
                const newMap = new Map(prev);
                newMap.delete(newFile.id);
                return newMap;
              });
              
              // If it's a processable file (image or PDF), extract text
              if (isProcessableFile(file)) {
                // Set progress to 100 but keep status as uploading until text extraction
                setTimeout(() => extractTextFromFile(file, newFile.id), 100);
                return { ...f, progress: 100, status: 'uploading' };
              } else {
                // For non-processable files, just mark as completed
                return { ...f, progress: 100, status: 'completed' };
              }
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 300);

      setActiveIntervals(prev => new Map(prev).set(newFile.id, interval));
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const viewExtractedText = (text: string) => {
    setSelectedFileText(text);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-600">Submitted</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Text Extracted</Badge>;
      case 'submitting':
        return <Badge className="bg-purple-500">Submitting</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Uploading</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop your documents here
            </h3>
            <p className="text-gray-500 mb-4">
              Supports PDF and Image files (JPG, PNG, GIF, BMP) with OCR text extraction
            </p>
            <Button
              onClick={() => document.getElementById('file-input')?.click()}
              className="bg-primary hover:bg-primary/90"
            >
              Browse Files
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  processFiles(Array.from(e.target.files));
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      {submissionStatus && (
        <Card>
          <CardContent className="pt-6">
            <div className={`p-4 rounded-lg ${
              submissionStatus.includes('Error') 
                ? 'bg-red-50 border border-red-200' 
                : submissionStatus.includes('successfully')
                ? 'bg-green-50 border border-green-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm font-medium ${
                submissionStatus.includes('Error') 
                  ? 'text-red-800' 
                  : submissionStatus.includes('successfully')
                  ? 'text-green-800'
                  : 'text-blue-800'
              }`}>
                {submissionStatus}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <File className="w-8 h-8 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      {getStatusBadge(file.status)}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={file.progress} className="h-2" />
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatFileSize(file.size)}
                      </span>
                    </div>

                    {file.extractedText && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 truncate">
                          Text extracted: {file.extractedText.substring(0, 100)}...
                        </p>
                      </div>
                    )}

                    {file.claimId && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600 font-medium">
                          Claim ID: {file.claimId}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.extractedText && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewExtractedText(file.extractedText!)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Text
                        </Button>
                        {file.status === 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => submitToAPI(file.id, file.extractedText!)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Text Modal */}
      {selectedFileText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Extracted Text
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFileText(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {selectedFileText}
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => navigator.clipboard.writeText(selectedFileText)}
                variant="outline"
              >
                Copy Text
              </Button>
              <Button
                onClick={async () => {
                  const fileWithText = files.find(f => f.extractedText === selectedFileText);
                  if (fileWithText && fileWithText.status === 'completed') {
                    await submitToAPI(fileWithText.id, selectedFileText);
                    setSelectedFileText(null);
                  }
                }}
                className="bg-primary hover:bg-primary/90"
                disabled={!files.find(f => f.extractedText === selectedFileText && f.status === 'completed')}
              >
                <Send className="w-4 h-4 mr-1" />
                Submit to API
              </Button>
              <Button
                onClick={() => setSelectedFileText(null)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}