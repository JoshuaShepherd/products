"use client";

import { useState } from "react";
import { FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LabelMakerOnly } from "@/components/auth/ProtectedComponent";

interface ExtractionResults {
  agent1_data?: any;
  agent2_data?: any;
  success: boolean;
  message?: string;
}

function LabelMakerComponent({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<"upload" | "extracting" | "injecting" | "done" | "error">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ExtractionResults | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFiles(uploadedFiles);
    setError("");
  };

  const handleTwoAgentExtraction = async () => {
    if (files.length === 0) return;
    
    try {
      setStep("extracting");
      setError("");
      
      // Step 1: Agent 1 - PDF Extraction
      console.log('🔍 Starting Agent 1: PDF Extraction...');
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const agent1Response = await fetch('/api/labelmaker/agents/extract', {
        method: 'POST',
        body: formData
      });

      if (!agent1Response.ok) {
        const errorData = await agent1Response.json();
        throw new Error(`Agent 1 failed: ${errorData.error}`);
      }

      const agent1Result = await agent1Response.json();
      console.log('✅ Agent 1 completed successfully');
      
      // Step 2: Agent 2 - Database Injection
      setStep("injecting");
      console.log('💾 Starting Agent 2: Database Injection...');
      
      const agent2Response = await fetch('/api/labelmaker/agents/inject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agent1Result.data)
      });

      if (!agent2Response.ok) {
        const errorData = await agent2Response.json();
        throw new Error(`Agent 2 failed: ${errorData.error}`);
      }

      const agent2Result = await agent2Response.json();
      console.log('✅ Agent 2 completed successfully');
      
      setResults({
        agent1_data: agent1Result.data,
        agent2_data: agent2Result.data,
        success: true,
        message: agent2Result.message
      });
      
      setStep("done");
      
    } catch (error) {
      console.error('❌ Two-agent process failed:', error);
      setError(error instanceof Error ? error.message : 'Process failed');
      setStep("error");
    }
  };

  const handleClose = () => {
    setFiles([]);
    setResults(null);
    setError("");
    setStep("upload");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <FileText className="w-5 h-5 text-blue-600" />
            LabelMaker Two-Agent System
            <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">{step}</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="px-4 pb-8 space-y-6">
          {step === "upload" && (
            <div className="space-y-8">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    Upload PDF Files
                  </div>
                  <div className="text-gray-500">
                    Click to upload TDS/SDS PDF documents
                  </div>
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold">Selected Files:</div>
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                disabled={files.length === 0} 
                onClick={handleTwoAgentExtraction} 
                className="w-full py-3"
              >
                🚀 Start Two-Agent Processing ({files.length} PDF{files.length !== 1 ? 's' : ''})
              </Button>
            </div>
          )}
          
          {step === "extracting" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold">🔍 Agent 1: Extracting PDF Text</div>
                <div className="text-gray-500">Performing complete verbatim text extraction</div>
              </div>
            </div>
          )}
          
          {step === "injecting" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <Loader2 className="w-12 h-12 animate-spin text-green-600" />
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold">💾 Agent 2: Database Injection</div>
                <div className="text-gray-500">Validating and saving to staging database</div>
              </div>
            </div>
          )}
          
          {step === "done" && results && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <div className="text-xl font-semibold text-green-800 mb-2">
                  Two-Agent Process Complete! 🎉
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="font-semibold text-green-800 mb-3">Process Summary</div>
                <div className="space-y-2 text-sm">
                  <div><strong>Agent 1:</strong> Extracted {Object.keys(results.agent1_data?.extracted_fields || {}).length} fields</div>
                  <div><strong>Agent 2:</strong> {results.agent2_data?.operation} operation completed</div>
                  <div><strong>Staging ID:</strong> {results.agent2_data?.staging_id}</div>
                  <div><strong>Message:</strong> {results.message}</div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="font-semibold text-blue-800 mb-3">Next Steps</div>
                <ul className="text-sm space-y-1 list-disc list-inside text-blue-700">
                  <li>Review extracted data in staging database</li>
                  <li>Approve for production when ready</li>
                  <li>Generate labels with extracted data</li>
                </ul>
              </div>
              
              <Button className="w-full mt-6" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
          
          {step === "error" && (
            <div className="text-center py-16 space-y-6">
              <div className="text-xl font-semibold text-red-600">Process Failed</div>
              <div className="text-gray-600 max-w-md mx-auto leading-relaxed">{error}</div>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function LabelMakerAgentModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <LabelMakerOnly>
      <LabelMakerComponent open={open} onOpenChange={onOpenChange} />
    </LabelMakerOnly>
  );
}
