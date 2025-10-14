
import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Search, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  onImageRemove?: () => void;
  onSearch?: (imageData: string) => void;
}

export default function ImageUpload({
  onImageUpload,
  onImageRemove,
  onSearch,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Convert Blob or URL to Base64 dataURL */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const fetchImageAsBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const blob = await res.blob();
    return blobToBase64(blob);
  };

  /** Handle File Upload */
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          setPreview(dataUrl);
          onImageUpload(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file (PNG, JPG, GIF).");
    }
  };

  /** Drag/Drop Handlers */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  /** URL Input submit — automatically converts to Base64 */
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    setLoading(true);
    setError(null);
    try {
      const base64DataUrl = await fetchImageAsBase64(imageUrl);
      setPreview(base64DataUrl);
      onImageUpload(base64DataUrl); // send Base64 to analysis
      setImageUrl("");
    } catch (err: any) {
      console.error(err);
      setError(
        "Failed to load image from URL. Ensure it’s accessible and CORS-allowed."
      );
    } finally {
      setLoading(false);
    }
  };

  /** Remove image preview */
  const removePreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onImageRemove?.();
  };

  /** Manually trigger search */
  const handleSearch = () => {
    if (preview && (onSearch || onImageUpload)) {
      (onSearch ?? onImageUpload)(preview);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upload or Paste Image
      </h3>

      {/* Upload Type Toggle */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-4">
        {["file", "url"].map((method) => (
          <button
            key={method}
            onClick={() => setUploadMethod(method as "file" | "url")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              uploadMethod === method
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {method === "file" ? "File Upload" : "Image URL"}
          </button>
        ))}
      </div>

      {uploadMethod === "file" && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            <span className="font-medium text-indigo-600">Click to upload</span>{" "}
            or drag & drop
          </p>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF ≤ 10 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
          />
        </div>
      )}

      {uploadMethod === "url" && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="image-url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Image URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!imageUrl || loading}
                className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4 mr-2" />
                )}
                {loading ? "Loading..." : "Load"}
              </button>
            </div>
          </div>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-3 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-6 relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
          />
          <button
            onClick={removePreview}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm"
            title="Remove image"
          >
            <X className="h-4 w-4 text-gray-700" />
          </button>

          
        </div>
      )}
    </div>
  );
}
