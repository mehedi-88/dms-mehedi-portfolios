'use client';

import React, { useState, useCallback } from 'react';
import { uploadFile } from '@/lib/storage';
import { Loader2, Upload, CheckCircle, XCircle } from 'lucide-react';

interface ImageUploaderProps {
  storagePath: string; // e.g., 'home/hero-image.jpg' or 'about/profile-pic.png'
  onUploadSuccess: (url: string) => void;
}

export function ImageUploader({ storagePath, onUploadSuccess }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      setMessage('অনুগ্রহ করে একটি ছবি নির্বাচন করুন।');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setMessage('');

    try {
      const path = `${storagePath}/${file.name}`;
      const url = await uploadFile(file, path);
      
      onUploadSuccess(url);
      setUploadStatus('success');
      setMessage('ছবি সফলভাবে আপলোড হয়েছে!');
      setFile(null); // Clear file input after successful upload
    } catch (error) {
      console.error('Upload Error:', error);
      setUploadStatus('error');
      setMessage('ছবি আপলোডে সমস্যা হয়েছে। Firebase কনফিগারেশন চেক করুন।');
    } finally {
      setIsUploading(false);
    }
  }, [file, storagePath, onUploadSuccess]);

  return (
    <div className="p-4 border rounded-lg shadow-sm dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">ছবি আপলোড করুন ({storagePath.split('/')[0]})</h3>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
        dark:file:bg-gray-700 dark:file:text-white dark:hover:file:bg-gray-600
        "
      />

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
          !file || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            আপলোড হচ্ছে...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            আপলোড শুরু করুন
          </>
        )}
      </button>

      {message && (
        <div className={`mt-3 p-2 rounded-md flex items-center text-sm ${
          uploadStatus === 'success'
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : uploadStatus === 'error'
            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {uploadStatus === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
          {uploadStatus === 'error' && <XCircle className="mr-2 h-4 w-4" />}
          {message}
        </div>
      )}
    </div>
  );
}

