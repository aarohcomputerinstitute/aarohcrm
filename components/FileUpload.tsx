"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X, CheckCircle2, Loader2, FileIcon } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  bucket: string;
  folder?: string;
  label: string;
  accept?: string;
}

export default function FileUpload({ onUploadComplete, bucket, folder = "temp", label, accept = "image/*" }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${folder}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
    } catch (error) {
      alert('Error uploading file! Make sure the bucket "' + bucket + '" exists in Supabase.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className={`relative border-2 border-dashed rounded-xl transition-all ${preview ? 'border-primary-500 bg-primary-50/10' : 'border-gray-200 hover:border-primary-400'}`}>
        {!preview ? (
          <div className="p-6 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-300" />
            )}
            <p className="text-xs text-gray-500 text-center">
              {uploading ? 'Uploading...' : 'Click or drag to upload'}
            </p>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUpload}
              disabled={uploading}
              accept={accept}
            />
          </div>
        ) : (
          <div className="p-4 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3 overflow-hidden">
                {accept.includes('image') ? (
                   <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
                ) : (
                   <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-gray-400" />
                   </div>
                )}
                <div className="min-w-0">
                   <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                   <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded successfully
                   </p>
                </div>
             </div>
             <button 
                type="button"
                onClick={() => { setPreview(null); setFileName(null); onUploadComplete(""); }}
                className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-200"
              >
                <X className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
