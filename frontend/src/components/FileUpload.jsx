import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

export default function FileUpload({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length) onUpload(accepted[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragActive || dragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-blue-500 hover:bg-blue-500/5"}`}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className="w-14 h-14 mx-auto mb-4 text-blue-400" />
      <p className="text-xl font-semibold text-gray-200">
        {loading ? "Analyzing..." : "Drop your CSV file here"}
      </p>
      <p className="text-gray-500 mt-2 text-sm">or click to browse — .csv files only</p>
      {!loading && (
        <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
          Choose File
        </button>
      )}
      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
