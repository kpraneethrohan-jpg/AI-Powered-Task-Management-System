import React, {useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../components/AppIcon';
import { API_ROUTES } from '../api/apiRoutes';

const FileList = ({ taskId, triggerRefresh }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFileId, setDownloadingFileId] = useState(null); // To show a loading state per file

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Authentication Error: Cannot fetch files without a token.");
        return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    setIsLoading(true);
    axios.get(API_ROUTES.FILE_HANDLING.GET_TASK_FILES(taskId), { headers })
      .then(response => setFiles(response.data))
      .catch(error => console.error("Error fetching files:", error))
      .finally(() => setIsLoading(false));
  }, [taskId, triggerRefresh]);


  const handleFileDownload = async (fileId, filename) => {
    // Prevent multiple clicks while a download is in progress
    if (downloadingFileId === fileId) return;

    setDownloadingFileId(fileId);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Authentication Error: Please log in again.");
        return;
      }
      
      // 1. Make an authenticated request to get the file as a 'blob'
      const response = await axios.get(API_ROUTES.FILE_HANDLING.DOWNLOAD(fileId), {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob', // This is the crucial part!
      });

      // 2. Create a temporary URL from the blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // 3. Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Set the filename for the download
      document.body.appendChild(link);
      link.click();

      // 4. Clean up the temporary link and URL
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file.");
    } finally {
      setDownloadingFileId(null); // Reset the loading state
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading files...</p>;
  }

  if (files.length === 0) {
    return <p className="text-sm text-gray-500">No attachments.</p>;
  }

  return (
    <div className="space-y-2">
      {files.map(file => (
        // The <a> tag is now a <button> to better handle the onClick event.
        // We prevent the default link behavior and call our secure handler instead.
        <button 
          key={file.id}
          onClick={() => handleFileDownload(file.id, file.filename)}
          disabled={downloadingFileId === file.id}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors disabled:text-gray-400 disabled:cursor-wait"
        >
          <Icon name={downloadingFileId === file.id ? "Loader" : "Paperclip"} size={14} className={downloadingFileId === file.id ? 'animate-spin' : ''} />
          <span>{downloadingFileId === file.id ? 'Downloading...' : file.filename}</span>
        </button>
      ))}
    </div>
  );
};

export default FileList;