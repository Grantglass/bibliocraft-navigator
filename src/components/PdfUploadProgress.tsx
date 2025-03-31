
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PdfUploadProgressProps {
  isLoading: boolean;
  progress: number;
  processingInfo: string;
  debugInfo: string[];
  error: string | null;
}

const PdfUploadProgress: React.FC<PdfUploadProgressProps> = ({
  isLoading,
  progress,
  processingInfo,
  debugInfo,
  error
}) => {
  if (!isLoading) {
    return (
      <>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {debugInfo.length > 0 && (
          <div className="mt-4 p-3 border rounded-md bg-gray-50 max-h-60 overflow-auto">
            <h4 className="font-medium mb-2 text-sm">Processing Log:</h4>
            <ul className="text-xs space-y-1 text-gray-600">
              {debugInfo.map((info, i) => (
                <li key={i}>{info}</li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }
  
  return (
    <div className="mt-4 space-y-3">
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-center text-biblio-gray">
        {processingInfo || `Processing PDF... ${progress}%`}
      </p>
      
      {debugInfo.length > 0 && (
        <div className="mt-4 p-3 border rounded-md bg-gray-50 max-h-60 overflow-auto">
          <h4 className="font-medium mb-2 text-sm">Processing Log:</h4>
          <ul className="text-xs space-y-1 text-gray-600">
            {debugInfo.map((info, i) => (
              <li key={i}>{info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PdfUploadProgress;
