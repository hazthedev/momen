/**
 * Momen Photo Upload Component
 * Drag and drop photo upload with progress
 */

'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  eventId: string;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in bytes
  allowedFormats?: string[];
}

export interface UploadResult {
  photoId: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export function PhotoUpload({
  eventId,
  onUploadComplete,
  onUploadError,
  maxSize = 50 * 1024 * 1024, // 50MB
  allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}: PhotoUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    if (!allowedFormats.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      if (onUploadError) onUploadError(error);
      return;
    }

    const uploadId = crypto.randomUUID();
    const uploadingFile: UploadingFile = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
    };

    setUploadingFiles((prev) => [...prev, uploadingFile]);

    try {
      const formData = new FormData();
      formData.append('eventId', eventId);
      formData.append('file', file);

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Upload failed');
      }

      const result = await response.json();

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadId ? { ...f, status: 'complete', progress: 100 } : f
        )
      );

      if (onUploadComplete) {
        onUploadComplete(result.data);
      }

      // Remove from uploading list after a delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadId ? { ...f, status: 'error', error: errorMessage } : f
        )
      );

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  }, [eventId, maxSize, allowedFormats, onUploadComplete, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadFile(file);
      }
    });
  }, [uploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);

    // Reset input
    e.target.value = '';
  }, [uploadFile]);

  const removeUploadingFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-sky bg-sky/10'
            : 'border-default hover:border-ice/50'
        }`}
      >
        <input
          type="file"
          id="photo-upload"
          multiple
          accept={allowedFormats.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadingFiles.length > 0}
        />

        <div className="space-y-3">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
            isDragOver ? 'bg-sky text-white' : 'bg-cream/60 text-sky'
          }`}>
            {uploadingFiles.length > 0 ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-slate font-medium">
              {uploadingFiles.length > 0
                ? 'Uploading photos...'
                : 'Drop photos here or click to upload'}
            </p>
            <p className="text-sm text-sky mt-1">
              JPEG, PNG, WebP up to {Math.round(maxSize / 1024 / 1024)}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-card rounded-lg border border-default"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 bg-cream/40 rounded flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-sky" />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-sky">
                  {file.status === 'complete'
                    ? 'Uploaded!'
                    : file.status === 'error'
                    ? file.error
                    : 'Uploading...'}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {file.status === 'uploading' || file.status === 'processing' ? (
                  <Loader2 className="w-4 h-4 text-sky animate-spin" />
                ) : file.status === 'complete' ? (
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <button
                    onClick={() => removeUploadingFile(file.id)}
                    className="p-1 hover:bg-error/10 rounded text-error hover:text-error transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
