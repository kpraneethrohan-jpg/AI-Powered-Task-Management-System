import React, { useState } from "react";
import axios from "axios";
import { X, Upload, Loader, AlertCircle, CheckCircle, Info } from "react-feather";
import { API_ROUTES } from "../api/apiRoutes";

const BulkUploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // Track global structural errors

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setErrorMessage(""); // Clear errors when a new file is chosen
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(""); // Reset error message
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        API_ROUTES.ADMIN.BULK_USER_UPLOAD,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(response.data);
    } catch (err) {
      // Extract the specific error message from the backend (the 400 Bad Request body)
      const msg = err.response?.data?.error || "An unexpected error occurred during upload.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">Bulk User Upload</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* SHOW GLOBAL ERROR MESSAGE IF FILE IS INVALID */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-red-800">Invalid File Structure</p>
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {!result ? (
            <>
              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                <Info className="text-blue-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm text-blue-800 font-bold mb-1">Upload Requirements:</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    The Excel file must contain headers for: <br />
                    <span className="font-mono font-bold bg-blue-100 px-1">userid, username, email, phonenumber, role, password</span>
                    <br />
                    The columns can be in any order.
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 transition-colors ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                />
                <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                  <Upload className="text-emerald-500 mb-2" size={40} />
                  <span className="text-sm font-medium text-slate-600">
                    {file ? file.name : "Click to select Excel file"}
                  </span>
                </label>
              </div>

              <button
                disabled={!file || isLoading}
                onClick={handleUpload}
                className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-emerald-700 disabled:bg-slate-300 transition-all shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} /> Processing Excel...
                  </>
                ) : (
                  "Insert Users"
                )}
              </button>
            </>
          ) : (
            /* Result View (Same as before) */
            <div className="space-y-4">
               <div className="flex gap-4">
                <div className="flex-1 bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-center">
                  <CheckCircle className="mx-auto text-emerald-600 mb-1" />
                  <p className="text-2xl font-bold text-emerald-700">{result.successCount}</p>
                  <p className="text-xs text-emerald-600 font-medium uppercase">Successful</p>
                </div>
                <div className="flex-1 bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                  <AlertCircle className="mx-auto text-red-600 mb-1" />
                  <p className="text-2xl font-bold text-red-700">{result.failureCount}</p>
                  <p className="text-xs text-red-600 font-medium uppercase">Failed Rows</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-[250px] overflow-y-auto border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="p-2 border-b">Row</th>
                        <th className="p-2 border-b">ID</th>
                        <th className="p-2 border-b">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 border-b">{err.rowNumber}</td>
                          <td className="p-2 border-b font-mono text-slate-500">{err.userId}</td>
                          <td className="p-2 border-b text-red-600 font-medium">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={() => {setResult(null); setFile(null); onClose();}}
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors"
              >
                Close and Finish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;