// import { useState, useEffect, useCallback } from "react";
// import Cookies from "js-cookie";
// import { decryptData } from "../common/Functions/DecryptData";
// import TableUtility from "../common/TableUtility/TableUtility";
// import Modal from "../common/Modal/Modal";
// import CreateNewButton from "../common/Buttons/AddButton";
// import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
// import { Trash2, Loader2, Download, X, File, FileText, FileImage, Eye } from 'lucide-react';

// // Import API hooks
// import {
//     useGetMemberReportsQuery,
//     useGetMaxDocNoQuery,
//     useUploadMemberReportMutation,
//     useUpdateMemberReportMutation,
//     useDeleteMemberReportMutation,
//     useDownloadFileMutation,
//     useLazyGetFilePreviewInfoQuery,
// } from "../services/memberReportApi";

// // Import related APIs
// import {
//     useGetMemberMastersQuery,
// } from "../services/medicalAppoinmentApi";
// import {
//     useGetReportMastersQuery,
// } from "../services/reportMasterApi";

// function MemberReport() {
//     // State
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editId, setEditId] = useState(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [deleteId, setDeleteId] = useState(null);
//     const [previewFile, setPreviewFile] = useState(null);
//     const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isDownloading, setIsDownloading] = useState(false);

//     // Form Data
//     const initialFormData = {
//         doc_No: "",
//         Member_id: "",
//         Report_id: "",
//         purpose: "",
//         remarks: "",
//         Created_by: "",
//         Modified_by: "",
//         uploaded_file_report_first: null,
//         uploaded_file_report_second: null,
//         uploaded_file_report_third: null,
//     };

//     const [formData, setFormData] = useState(initialFormData);
//     const [files, setFiles] = useState({});
//     const [existingFiles, setExistingFiles] = useState({});
//     const [notification, setNotification] = useState({
//         show: false,
//         message: "",
//         type: "success",
//     });
//     // Enhanced file type detection
//     const getFileCategory = (filename) => {
//         if (!filename) return 'unknown';

//         const ext = filename.split('.').pop().toLowerCase();

//         // Image files
//         if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
//             return 'image';
//         }
//         // PDF files
//         if (ext === 'pdf') {
//             return 'pdf';
//         }
//         // Text files
//         if (['txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'md', 'log'].includes(ext)) {
//             return 'text';
//         }
//         // Office documents
//         if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
//             return 'office';
//         }
//         // Archives
//         if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
//             return 'archive';
//         }
//         // Audio files
//         if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
//             return 'audio';
//         }
//         // Video files
//         if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
//             return 'video';
//         }
//         // Executables
//         if (['exe', 'msi', 'dmg', 'apk'].includes(ext)) {
//             return 'executable';
//         }

//         return 'other';
//     };

//     // Check if file can be previewed inline
//     const canPreviewInline = (filename) => {
//         const category = getFileCategory(filename);

//         const inlinePreviewable = [
//             'image',     // Images can be shown with img tag
//             'pdf',       // PDFs can be shown in iframe
//             'text',      // Text files can be shown in iframe or textarea
//         ];

//         return inlinePreviewable.includes(category);
//     };

//     // Get appropriate file icon
//     const getFileIconEnhanced = (filename) => {
//         const category = getFileCategory(filename);
//         const iconStyle = "h-5 w-5";

//         switch (category) {
//             case 'image':
//                 return <FileImage className={`${iconStyle} text-green-600`} />;
//             case 'pdf':
//                 return <FileText className={`${iconStyle} text-red-600`} />;
//             case 'text':
//                 return <FileText className={`${iconStyle} text-blue-600`} />;
//             case 'office':
//                 return <FileText className={`${iconStyle} text-purple-600`} />;
//             case 'archive':
//                 return <File className={`${iconStyle} text-orange-600`} />;
//             case 'audio':
//                 return <File className={`${iconStyle} text-yellow-600`} />;
//             case 'video':
//                 return <File className={`${iconStyle} text-pink-600`} />;
//             case 'executable':
//                 return <File className={`${iconStyle} text-red-700`} />;
//             default:
//                 return <File className={`${iconStyle} text-gray-600`} />;
//         }
//     };

//     // Get file type description
//     const getFileTypeDescription = (filename) => {
//         const ext = filename.split('.').pop().toLowerCase();

//         const typeDescriptions = {
//             // Images
//             'jpg': 'JPEG Image',
//             'jpeg': 'JPEG Image',
//             'png': 'PNG Image',
//             'gif': 'GIF Image',
//             'bmp': 'Bitmap Image',
//             'webp': 'WebP Image',
//             'svg': 'Scalable Vector Graphic',
//             // PDF
//             'pdf': 'PDF Document',
//             // Text files
//             'txt': 'Text File',
//             'csv': 'Comma Separated Values',
//             'json': 'JSON File',
//             'xml': 'XML File',
//             'html': 'HTML Document',
//             'htm': 'HTML Document',
//             'css': 'CSS Stylesheet',
//             'js': 'JavaScript File',
//             'md': 'Markdown File',
//             'log': 'Log File',
//             // Office
//             'doc': 'Microsoft Word Document',
//             'docx': 'Microsoft Word Document',
//             'xls': 'Microsoft Excel Spreadsheet',
//             'xlsx': 'Microsoft Excel Spreadsheet',
//             'ppt': 'Microsoft PowerPoint Presentation',
//             'pptx': 'Microsoft PowerPoint Presentation',
//             'odt': 'OpenDocument Text',
//             'ods': 'OpenDocument Spreadsheet',
//             'odp': 'OpenDocument Presentation',
//             // Archives
//             'zip': 'ZIP Archive',
//             'rar': 'RAR Archive',
//             '7z': '7-Zip Archive',
//             'tar': 'TAR Archive',
//             'gz': 'GZIP Compressed File',
//             'bz2': 'BZIP2 Compressed File',
//             // Audio
//             'mp3': 'MP3 Audio',
//             'wav': 'WAV Audio',
//             'ogg': 'OGG Audio',
//             'm4a': 'MPEG-4 Audio',
//             'flac': 'FLAC Audio',
//             // Video
//             'mp4': 'MPEG-4 Video',
//             'avi': 'AVI Video',
//             'mov': 'QuickTime Video',
//             'wmv': 'Windows Media Video',
//             'flv': 'Flash Video',
//             'mkv': 'Matroska Video',
//             // Executables
//             'exe': 'Windows Executable',
//             'msi': 'Windows Installer',
//             'dmg': 'macOS Disk Image',
//             'apk': 'Android Package',
//         };

//         return typeDescriptions[ext] || `${ext.toUpperCase()} File`;
//     };
//     // API Hooks
//     const {
//         data: reports = [],
//         isLoading,
//         isError,
//         error: fetchError,
//         refetch
//     } = useGetMemberReportsQuery({ skip: 0, limit: 100 });

//     const { data: maxDocNoData, isLoading: isMaxDocLoading, refetch: refetchMaxDoc } = useGetMaxDocNoQuery();
//     const { data: members = [] } = useGetMemberMastersQuery();
//     const { data: reportTypes = [] } = useGetReportMastersQuery();

//     const [uploadMemberReport] = useUploadMemberReportMutation();
//     const [updateMemberReport] = useUpdateMemberReportMutation();
//     const [deleteMemberReport] = useDeleteMemberReportMutation();
//     const [triggerDownload] = useDownloadFileMutation();
//     const [triggerGetFilePreviewInfo] = useLazyGetFilePreviewInfoQuery(); // FIXED: Added this hook

//     // Get logged-in username from decrypted cookie
//     const getUserNameFromCookie = useCallback(() => {
//         try {
//             const encrypted = Cookies.get("user_data");
//             if (!encrypted) {
//                 console.warn("No user_data cookie found");
//                 return "System";
//             }

//             const decrypted = decryptData(encrypted);
//             return decrypted?.User_Name || decrypted?.username || decrypted?.user_name || "System";
//         } catch (error) {
//             console.error("Error getting user from cookie:", error);
//             return "System";
//         }
//     }, []);

//     const showNotification = useCallback((message, type = "success") => {
//         setNotification({ show: true, message, type });
//         setTimeout(() => {
//             setNotification(prev => ({ ...prev, show: false }));
//         }, 3000);
//     }, []);

//     // Get file icon based on extension
//     const getFileIcon = (filename) => {
//         if (!filename) return <File className="h-5 w-5 text-gray-500" />;

//         const ext = filename.split('.').pop().toLowerCase();
//         const iconStyle = "h-5 w-5";

//         if (['pdf'].includes(ext)) {
//             return <FileText className={`${iconStyle} text-red-600`} />;
//         } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
//             return <FileImage className={`${iconStyle} text-green-600`} />;
//         } else if (['txt', 'doc', 'docx', 'rtf'].includes(ext)) {
//             return <FileText className={`${iconStyle} text-blue-600`} />;
//         }
//         return <File className={`${iconStyle} text-gray-600`} />;
//     };

//     // Check if file is image
//     const isImageFile = (filename) => {
//         if (!filename) return false;
//         const ext = filename.split('.').pop().toLowerCase();
//         return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
//     };

//     // Check if file is PDF
//     const isPdfFile = (filename) => {
//         if (!filename) return false;
//         const ext = filename.split('.').pop().toLowerCase();
//         return ext === 'pdf';
//     };

//     // Get just the filename from path
//     const getFilenameFromPath = useCallback((filePath) => {
//         if (!filePath) return '';
//         // Handle both full paths and just filenames
//         if (filePath.includes('/')) {
//             return filePath.split('/').pop();
//         }
//         return filePath;
//     }, []);

//     // Helper function to format file size
//     const formatFileSize = (sizeInBytes) => {
//         if (!sizeInBytes || isNaN(sizeInBytes)) return 'Unknown size';

//         if (sizeInBytes === 0) return '0 Bytes';

//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));

//         return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     };

//     // Helper function to get file type description
//     const getFileType = (filename) => {
//         if (!filename) return 'Unknown';

//         const ext = filename.split('.').pop().toLowerCase();

//         const typeMap = {
//             'pdf': 'PDF Document',
//             'jpg': 'JPEG Image',
//             'jpeg': 'JPEG Image',
//             'png': 'PNG Image',
//             'gif': 'GIF Image',
//             'bmp': 'Bitmap Image',
//             'webp': 'WebP Image',
//             'txt': 'Text File',
//             'doc': 'Word Document',
//             'docx': 'Word Document',
//             'xls': 'Excel Spreadsheet',
//             'xlsx': 'Excel Spreadsheet',
//             'csv': 'CSV File',
//             'zip': 'ZIP Archive',
//             'rar': 'RAR Archive',
//         };

//         return typeMap[ext] || ext.toUpperCase() + ' File';
//     };

//     // Preview file
//     // Preview file - FIXED VERSION
//     const handlePreviewFile = async (filename) => {
//         if (!filename) return;

//         const cleanFilename = getFilenameFromPath(filename);
//         console.log('Previewing file:', cleanFilename);

//         try {
//             setIsDownloading(true);

//             // Get file extension for type detection
//             const fileExt = cleanFilename.split('.').pop().toLowerCase();

//             // Determine if file can be previewed inline
//             const previewableTypes = [
//                 // Images
//                 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
//                 // Documents
//                 'pdf',
//                 // Text files
//                 'txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'md',
//                 // Office files (some browsers can preview these)
//                 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
//             ];

//             const isPreviewable = previewableTypes.includes(fileExt);

//             if (!isPreviewable) {
//                 // For non-previewable files, show download option directly
//                 showNotification("This file type cannot be previewed. Please download to view.", "info");

//                 const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
//                 const baseUrl = apiBaseUrl.replace(/\/$/, '');
//                 const encodedFilename = encodeURIComponent(cleanFilename);
//                 const downloadUrl = `${baseUrl}/memberreport/download/${encodedFilename}`;

//                 setPreviewFile({
//                     url: downloadUrl,
//                     filename: cleanFilename,
//                     isImage: false,
//                     isPdf: false,
//                     isText: false,
//                     isOffice: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt),
//                     isArchive: ['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExt),
//                     fileType: fileExt.toUpperCase(),
//                     directUrl: true,
//                     canPreview: false
//                 });
//                 setIsPreviewOpen(true);
//                 return;
//             }

//             // For previewable files, try to get file info first
//             try {
//                 const previewInfo = await triggerGetFilePreviewInfo(cleanFilename).unwrap();
//                 console.log('Preview info:', previewInfo);

//                 if (previewInfo?.file?.viewable_in_browser) {
//                     // Use the view endpoint for browser preview
//                     const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
//                     const baseUrl = apiBaseUrl.replace(/\/$/, '');
//                     const encodedFilename = encodeURIComponent(cleanFilename);
//                     const viewUrl = `${baseUrl}/memberreport/view/${encodedFilename}`;

//                     setPreviewFile({
//                         url: viewUrl,
//                         filename: cleanFilename,
//                         isImage: isImageFile(cleanFilename),
//                         isPdf: isPdfFile(cleanFilename),
//                         isText: ['txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'md'].includes(fileExt),
//                         fileType: fileExt.toUpperCase(),
//                         directUrl: true,
//                         canPreview: true,
//                         fileInfo: previewInfo.file
//                     });
//                     setIsPreviewOpen(true);
//                     showNotification("Opening preview...", "info");
//                     return;
//                 }
//             } catch (infoError) {
//                 console.log('Could not get preview info, trying direct view:', infoError);
//             }

//             // Try direct view for previewable files
//             const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
//             const baseUrl = apiBaseUrl.replace(/\/$/, '');
//             const encodedFilename = encodeURIComponent(cleanFilename);
//             const viewUrl = `${baseUrl}/memberreport/view/${encodedFilename}`;

//             console.log('Direct view URL:', viewUrl);

//             setPreviewFile({
//                 url: viewUrl,
//                 filename: cleanFilename,
//                 isImage: isImageFile(cleanFilename),
//                 isPdf: isPdfFile(cleanFilename),
//                 isText: ['txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'md'].includes(fileExt),
//                 isOffice: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt),
//                 fileType: fileExt.toUpperCase(),
//                 directUrl: true,
//                 canPreview: true
//             });
//             setIsPreviewOpen(true);
//             showNotification("Opening preview...", "info");

//         } catch (error) {
//             console.error('Preview failed:', error);

//             // Final fallback: download endpoint
//             const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
//             const baseUrl = apiBaseUrl.replace(/\/$/, '');
//             const encodedFilename = encodeURIComponent(cleanFilename);
//             const downloadUrl = `${baseUrl}/memberreport/download/${encodedFilename}`;

//             const fileExt = cleanFilename.split('.').pop().toLowerCase();

//             setPreviewFile({
//                 url: downloadUrl,
//                 filename: cleanFilename,
//                 isImage: false,
//                 isPdf: false,
//                 isText: false,
//                 isOffice: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt),
//                 isArchive: ['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExt),
//                 fileType: fileExt.toUpperCase(),
//                 directUrl: true,
//                 canPreview: false,
//                 isDownloadFallback: true
//             });
//             setIsPreviewOpen(true);

//             showNotification("Using download link...", "info");
//         } finally {
//             setIsDownloading(false);
//         }
//     };

//     // Download file
//     const handleDownloadFile = async (filename) => {
//         if (!filename) return;

//         const cleanFilename = getFilenameFromPath(filename);
//         console.log('Downloading file:', cleanFilename);

//         try {
//             setIsDownloading(true);
//             const { data } = await triggerDownload(cleanFilename).unwrap();

//             if (!(data instanceof Blob)) {
//                 throw new Error('Invalid response from server');
//             }

//             if (data.size === 0) {
//                 throw new Error('File is empty');
//             }

//             // Create blob URL
//             const url = window.URL.createObjectURL(data);

//             // Create download link
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = cleanFilename;
//             link.style.display = 'none';

//             // Add to DOM, click, and remove
//             document.body.appendChild(link);
//             link.click();

//             // Cleanup
//             setTimeout(() => {
//                 document.body.removeChild(link);
//                 window.URL.revokeObjectURL(url);
//                 setIsDownloading(false);
//             }, 100);

//             showNotification("File downloaded successfully!");

//         } catch (error) {
//             console.error('Download failed:', error);
//             setIsDownloading(false);

//             // Fallback: Direct download via URL
//             const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
//             const baseUrl = apiBaseUrl.replace(/\/$/, '');
//             const downloadUrl = `${baseUrl}/memberreport/download/${encodeURIComponent(cleanFilename)}`;

//             // Open in new tab
//             const newWindow = window.open(downloadUrl, '_blank');
//             if (!newWindow) {
//                 showNotification("Please allow popups to download files", "error");
//                 return;
//             }

//             showNotification("Opening download in new tab...", "info");
//         }
//     };

//     // Auto-generate doc_No for new report
//     useEffect(() => {
//         if (!editId && !isMaxDocLoading && isModalOpen) {
//             const nextDocNo = (Number(maxDocNoData?.max_doc_no) || 0) + 1;
//             setFormData(prev => ({ ...prev, doc_No: nextDocNo.toString() }));
//         }
//     }, [maxDocNoData, isMaxDocLoading, editId, isModalOpen]);

//     // Handlers
//     const handleAddNew = async () => {
//         setEditId(null);
//         resetForm();

//         const userName = getUserNameFromCookie();

//         try {
//             await refetchMaxDoc();
//         } catch (error) {
//             console.error("Error fetching max doc no:", error);
//             showNotification("Failed to generate document number", "error");
//             return;
//         }

//         setFormData(prev => ({
//             ...prev,
//             Created_by: userName,
//             Created_at: new Date().toISOString().split("T")[0]
//         }));

//         setIsModalOpen(true);
//     };

//     const handleEdit = (row) => {
//         console.log('Editing row:', row);

//         setFormData({
//             doc_No: row.doc_No || "",
//             Member_id: row.Member_id?.toString() || "",
//             Report_id: row.Report_id?.toString() || "",
//             purpose: row.purpose || "",
//             remarks: row.remarks || "",
//             Created_by: row.Created_by || "",
//             Modified_by: row.Modified_by || "",
//         });

//         // Extract filenames from paths
//         const existingFilesObj = {
//             uploaded_file_report_first: getFilenameFromPath(row.uploaded_file_report_first),
//             uploaded_file_report_second: getFilenameFromPath(row.uploaded_file_report_second),
//             uploaded_file_report_third: getFilenameFromPath(row.uploaded_file_report_third),
//         };

//         console.log('Existing files:', existingFilesObj);

//         setExistingFiles(existingFilesObj);
//         setFiles(existingFilesObj); // Start with existing files

//         setEditId(row.MemberReport_id);
//         setIsModalOpen(true);
//     };

//     const handleDelete = (id) => {
//         if (!id) {
//             showNotification("Invalid report ID", "error");
//             return;
//         }
//         setDeleteId(id);
//         setShowDeleteModal(true);
//     };

//     const confirmDelete = async () => {
//         if (!deleteId) return;

//         try {
//             await deleteMemberReport(deleteId).unwrap();
//             showNotification("Report deleted successfully!");
//             await refetch();
//         } catch (error) {
//             console.error("Delete failed:", error);
//             const errorMessage = error?.data?.message ||
//                 error?.data?.detail ||
//                 "Failed to delete report. Please try again.";
//             showNotification(errorMessage, "error");
//         } finally {
//             setShowDeleteModal(false);
//             setDeleteId(null);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         // Validation
//         if (!formData.Member_id) {
//             showNotification("Please select a member", "error");
//             setIsSubmitting(false);
//             return;
//         }
//         if (!formData.Report_id) {
//             showNotification("Please select a report type", "error");
//             setIsSubmitting(false);
//             return;
//         }
//         if (!formData.purpose.trim()) {
//             showNotification("Purpose is required", "error");
//             setIsSubmitting(false);
//             return;
//         }

//         try {
//             const formDataToSend = new FormData();
//             const userName = getUserNameFromCookie();

//             // For CREATE operation
//             if (!editId) {
//                 formDataToSend.append("Member_id", formData.Member_id);
//                 formDataToSend.append("Report_id", formData.Report_id);
//                 formDataToSend.append("purpose", formData.purpose);
//                 formDataToSend.append("Created_by", userName);

//                 if (formData.remarks) {
//                     formDataToSend.append("remarks", formData.remarks);
//                 }
//                 if (formData.doc_No) {
//                     formDataToSend.append("doc_No", formData.doc_No);
//                 }

//                 // Add files for create
//                 Object.entries(files).forEach(([key, file]) => {
//                     if (file && typeof file === 'object' && file.name) {
//                         formDataToSend.append(key, file);
//                     }
//                 });

//                 await uploadMemberReport(formDataToSend).unwrap();
//                 showNotification("Report created successfully!");
//             }
//             // For UPDATE operation with JSON actions
//             else {
//                 // Add required fields
//                 if (formData.purpose) {
//                     formDataToSend.append("purpose", formData.purpose);
//                 }
//                 if (formData.remarks !== undefined) {
//                     formDataToSend.append("remarks", formData.remarks);
//                 }
//                 if (formData.Modified_by !== undefined) {
//                     formDataToSend.append("Modified_by", userName);
//                 }

//                 // Build file actions JSON
//                 const fileActions = {};

//                 Object.entries(files).forEach(([key, file]) => {
//                     const oldFile = existingFiles[key];

//                     if (file === null && oldFile) {
//                         // Mark for deletion
//                         fileActions[key] = 'delete';
//                     }
//                     else if (file && typeof file === 'object' && file.name) {
//                         // New file - add to form data
//                         formDataToSend.append(key, file);
//                         fileActions[key] = 'update';
//                     }
//                     else if (file && typeof file === 'string' && file === oldFile) {
//                         // Keep existing
//                         fileActions[key] = 'keep';
//                     }
//                 });

//                 // Add file actions JSON
//                 if (Object.keys(fileActions).length > 0) {
//                     formDataToSend.append("file_actions", JSON.stringify(fileActions));
//                 }

//                 await updateMemberReport({
//                     id: editId,
//                     formData: formDataToSend
//                 }).unwrap();
//                 showNotification("Report updated successfully!");
//             }

//             resetForm();
//             setIsModalOpen(false);
//             await refetch();
//         } catch (error) {
//             console.error("Save failed:", error);

//             let errorMessage = "Failed to save report";
//             if (error?.data?.detail) {
//                 if (Array.isArray(error.data.detail)) {
//                     errorMessage = error.data.detail.map(d => d.msg).join(', ');
//                 } else {
//                     errorMessage = error.data.detail;
//                 }
//             } else if (error?.data?.message) {
//                 errorMessage = error.data.message;
//             }

//             showNotification(errorMessage, "error");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const resetForm = () => {
//         setFormData(initialFormData);
//         setFiles({});
//         setExistingFiles({});
//         setEditId(null);
//         setIsPreviewOpen(false);
//         setPreviewFile(null);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleFileChange = (e, fieldName) => {
//         const file = e.target.files?.[0];
//         if (file && file.name && file.size !== undefined) {
//             // Validate file size (10MB max)
//             if (file.size > 10 * 1024 * 1024) {
//                 showNotification("File size must be less than 10MB", "error");
//                 e.target.value = ''; // Clear the file input
//                 return;
//             }
//             setFiles(prev => ({ ...prev, [fieldName]: file }));
//         }
//     };

//     const handleRemoveFile = (fieldName) => {
//         setFiles(prev => ({ ...prev, [fieldName]: null }));
//     };

//     // Enhanced file display component
//     const FileDisplay = ({ file, fieldName }) => {
//         const isNewFile = file && typeof file === 'object' && file.name && file.size !== undefined;
//         const isExistingFile = typeof file === 'string' && file.trim() !== '';
//         const isRemoved = file === null;

//         const filename = isNewFile ? file.name : getFilenameFromPath(file);

//         if (isRemoved) {
//             return (
//                 <div className="p-3 border border-dashed border-gray-300 rounded text-center">
//                     <p className="text-gray-500">File removed</p>
//                     <input
//                         type="file"
//                         onChange={(e) => handleFileChange(e, fieldName)}
//                         className="w-full mt-2 p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     />
//                 </div>
//             );
//         }

//         if (!isNewFile && !isExistingFile) {
//             return (
//                 <input
//                     type="file"
//                     onChange={(e) => handleFileChange(e, fieldName)}
//                     className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     required={fieldName === 'uploaded_file_report_first' && !editId}
//                 />
//             );
//         }

//         const fileSize = isNewFile && file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '';

//         return (
//             <div className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-gray-100 transition">
//                 <div className="flex items-center space-x-3 flex-1 min-w-0">
//                     <div className="flex-shrink-0">
//                         {getFileIcon(filename)}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                         <div className="flex items-center space-x-2">
//                             <span className="text-sm font-medium truncate" title={filename}>
//                                 {filename}
//                             </span>
//                             {isNewFile && (
//                                 <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
//                                     New
//                                 </span>
//                             )}
//                         </div>
//                         {fileSize && (
//                             <span className="text-xs text-gray-500">{fileSize}</span>
//                         )}
//                     </div>
//                 </div>
//                 <div className="flex items-center space-x-2 flex-shrink-0">
//                     {isExistingFile && (
//                         <>
//                             <button
//                                 type="button"
//                                 onClick={() => handlePreviewFile(filename)}
//                                 className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
//                                 title="Preview"
//                             >
//                                 <Eye className="h-4 w-4" />
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => handleDownloadFile(filename)}
//                                 className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
//                                 title="Download"
//                             >
//                                 <Download className="h-4 w-4" />
//                             </button>
//                         </>
//                     )}
//                     <button
//                         type="button"
//                         onClick={() => handleRemoveFile(fieldName)}
//                         className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
//                         title="Remove"
//                     >
//                         <X className="h-4 w-4" />
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     // Helper function to get member name
//     const getMemberName = (memberId) => {
//         const member = members.find(m => m.Member_id === memberId);
//         return member?.Member_name || "Unknown";
//     };

//     // Helper function to get report name
//     const getReportName = (reportId) => {
//         const report = reportTypes.find(r => r.Report_id === reportId);
//         return report?.report_name || "Unknown";
//     };

//     // Enhanced table with file actions
//     const columns = [
//         {
//             header: 'Doc No',
//             accessor: 'doc_No',
//             cellRenderer: (value, row) => row.doc_No || "-"
//         },
//         {
//             header: 'Member',
//             accessor: 'member_name',
//             cellRenderer: (value, row) => getMemberName(row.Member_id)
//         },
//         {
//             header: 'Report Type',
//             accessor: 'report_name',
//             cellRenderer: (value, row) => getReportName(row.Report_id)
//         },
//         {
//             header: 'Purpose',
//             accessor: 'purpose',
//             cellRenderer: (value, row) => row.purpose || "-"
//         },
//         {
//             header: 'Files',
//             accessor: 'files',
//             cellRenderer: (value, row) => {
//                 const fileFields = [
//                     row.uploaded_file_report_first,
//                     row.uploaded_file_report_second,
//                     row.uploaded_file_report_third,
//                 ].filter(Boolean);

//                 const fileCount = fileFields.length;

//                 if (fileCount === 0) {
//                     return (
//                         <span className="text-gray-500 text-sm">No files</span>
//                     );
//                 }

//                 return (
//                     <div className="flex flex-col space-y-1">
//                         <span className="text-sm text-gray-700">
//                             {fileCount} file{fileCount > 1 ? 's' : ''}
//                         </span>
//                         <div className="flex space-x-1">
//                             {fileFields.slice(0, 3).map((file, index) => {
//                                 const filename = getFilenameFromPath(file);
//                                 return (
//                                     <div key={index} className="flex items-center space-x-1">
//                                         {getFileIcon(filename)}
//                                         <span
//                                             className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer hover:underline truncate max-w-[80px]"
//                                             title={filename}
//                                             onClick={() => handlePreviewFile(filename)}
//                                         >
//                                             {filename.length > 15 ? `${filename.substring(0, 15)}...` : filename}
//                                         </span>
//                                         {index < fileFields.length - 1 && index < 2 && (
//                                             <span className="text-gray-300">|</span>
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                             {fileCount > 3 && (
//                                 <span className="text-xs text-gray-500">
//                                     +{fileCount - 3} more
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                 );
//             }
//         },
//         {
//             header: 'Created By',
//             accessor: 'Created_by',
//             cellRenderer: (value, row) => row.Created_by || "-"
//         },
//         {
//             header: 'Date',
//             accessor: 'Created_at',
//             cellRenderer: (value, row) => {
//                 if (!row.Created_at) return "-";
//                 return new Date(row.Created_at).toLocaleDateString();
//             }
//         },
//         {
//             header: 'Actions',
//             accessor: 'action',
//             isAction: true,
//             className: 'text-center',
//             actionRenderer: (row) => (
//                 <div className="flex justify-center space-x-2">
//                     <button
//                         className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
//                         onClick={() => handleEdit(row)}
//                         title="Edit"
//                     >
//                         <PencilSquareIcon className="h-5 w-5" />
//                     </button>
//                     <button
//                         className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
//                         onClick={() => handleDelete(row.MemberReport_id)}
//                         title="Delete"
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button>
//                 </div>
//             )
//         }
//     ];

//     if (isLoading) {
//         return (
//             <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
//                 <div className="text-center">
//                     <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4 mx-auto" />
//                     <p className="text-gray-600 font-medium">Loading member reports...</p>
//                     <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
//                 </div>
//             </div>
//         );
//     }

//     if (isError) {
//         return (
//             <div className="min-h-screen flex flex-col justify-center items-center">
//                 <div className="bg-red-50 text-red-800 p-8 rounded-xl max-w-md text-center border border-red-200 shadow-sm">
//                     <XCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
//                     <h3 className="text-xl font-semibold mb-2">Error Loading Reports</h3>
//                     <p className="mb-6 text-gray-700">
//                         {fetchError?.data?.message ||
//                             fetchError?.error ||
//                             "Failed to load reports. Please check your connection and try again."}
//                     </p>
//                     <button
//                         onClick={() => refetch()}
//                         className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
//                     >
//                         <div className="flex items-center justify-center">
//                             <span>Retry</span>
//                         </div>
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="">
//             {/* Notification */}
//             {notification.show && (
//                 <div
//                     className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 animate-fade-in-up ${notification.type === "success"
//                             ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200"
//                             : "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200"
//                         }`}
//                 >
//                     {notification.type === "success" ? (
//                         <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
//                     ) : (
//                         <XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
//                     )}
//                     <span className="font-medium">{notification.message}</span>
//                 </div>
//             )}

//             {/* Main Content */}
//             <div className="max-w-full mx-auto ">
//                 <TableUtility
//                     title="Member Reports"
//                     headerContent={
//                         <div className="flex justify-between items-center mb-6">
//                             <CreateNewButton
//                                 onClick={handleAddNew}
//                                 disabled={isMaxDocLoading || isLoading}
//                                 label={isMaxDocLoading ? "Loading..." : "Add New Report"}
//                             />
//                         </div>
//                     }
//                     columns={columns}
//                     data={Array.isArray(reports) ? reports : []}
//                     pageSize={10}
//                     loading={isLoading}
//                     searchable={true}
//                     exportable={true}
//                     className="border-0"
//                 />
//             </div>

//             {/* Add/Edit Modal */}
//             <Modal
//                 isOpen={isModalOpen}
//                 onClose={() => {
//                     setIsModalOpen(false);
//                     resetForm();
//                 }}
//                 title={editId ? "Edit Member Report" : "Add New Member Report"}
//                 width="1000px"
//             >
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* Doc No */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Document Number
//                             </label>
//                             <input
//                                 type="text"
//                                 name="doc_No"
//                                 value={formData.doc_No}
//                                 readOnly
//                                 className="w-full p-2 border rounded bg-gray-50"
//                             />
//                         </div>

//                         {/* Member */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Member Name *
//                             </label>
//                             <select
//                                 name="Member_id"
//                                 value={formData.Member_id}
//                                 onChange={handleInputChange}
//                                 required
//                                 disabled={editId}
//                                 className="w-full border border-gray-300 rounded-lg p-2.5 
//                    focus:outline-none focus:ring-2 focus:ring-blue-500 
//                    focus:border-blue-500 hover:border-blue-400 transition"
//                             >
//                                 <option value="">Select Member</option>
//                                 {members.map(member => (
//                                     <option key={member.Member_id} value={member.Member_id}>
//                                         {member.Member_name} - {member.Mobile_no}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Report Type */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Report Name *
//                             </label>
//                             <select
//                                 name="Report_id"
//                                 value={formData.Report_id}
//                                 onChange={handleInputChange}
//                                 required
//                                 disabled={editId}
//                                 className="w-full border border-gray-300 rounded-lg p-2.5 
//                    focus:outline-none focus:ring-2 focus:ring-blue-500 
//                    focus:border-blue-500 hover:border-blue-400 transition"
//                             >
//                                 <option value="">Select Report Type</option>
//                                 {reportTypes.map(report => (
//                                     <option key={report.Report_id} value={report.Report_id}>
//                                         {report.report_name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Purpose */}
//                         <div className="md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Purpose *
//                             </label>
//                             <input
//                                 type="text"
//                                 name="purpose"
//                                 value={formData.purpose}
//                                 onChange={handleInputChange}
//                                 required
//                                 className="w-full border border-gray-300 rounded-lg p-2.5 
//                    focus:outline-none focus:ring-2 focus:ring-blue-500 
//                    focus:border-blue-500 hover:border-blue-400 transition"
//                                 placeholder="Enter purpose"
//                             />
//                         </div>

//                         {/* Remarks */}
//                         <div className="md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Remarks
//                             </label>
//                             <textarea
//                                 name="remarks"
//                                 value={formData.remarks}
//                                 onChange={handleInputChange}
//                                 className="w-full border border-gray-300 rounded-lg p-2.5 
//                    focus:outline-none focus:ring-2 focus:ring-blue-500 
//                    focus:border-blue-500 hover:border-blue-400 transition"
//                                 rows="3"
//                                 placeholder="Additional notes"
//                             />
//                         </div>

//                         {/* File Uploads */}
//                         {['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third'].map((field, index) => (
//                             <div key={field} className="md:col-span-2">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Report File {index + 1} {index === 0 && !editId ? "*" : ""}
//                                 </label>

//                                 <FileDisplay
//                                     file={files[field]}
//                                     fieldName={field}
//                                 />

//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Max 10MB per file. Supported: PDF, Images, Documents
//                                 </p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex justify-end space-x-3 pt-4 border-t">
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setIsModalOpen(false);
//                                 resetForm();
//                             }}
//                             className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
//                             disabled={isSubmitting}
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                             disabled={isSubmitting}
//                         >
//                             {isSubmitting ? (
//                                 <span className="flex items-center">
//                                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                                     {editId ? "Updating..." : "Saving..."}
//                                 </span>
//                             ) : editId ? "Update Report" : "Save Report"}
//                         </button>
//                     </div>
//                 </form>
//             </Modal>

//             {/* File Preview Modal */}
//             {/* File Preview Modal for all file types */}
//             {isPreviewOpen && previewFile && (
//                 <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
//                     <div
//                         className="bg-white rounded-lg shadow-xl flex flex-col w-full max-w-7xl h-full max-h-[90vh]"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* Header */}
//                         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//                             <div className="flex items-center space-x-3">
//                                 {getFileIconEnhanced(previewFile.filename)}
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-800">
//                                         File Preview
//                                     </h3>
//                                     <p className="text-sm text-gray-600 truncate max-w-md">
//                                         {previewFile.filename}
//                                     </p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <button
//                                     onClick={() => handleDownloadFile(previewFile.filename)}
//                                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
//                                     disabled={isDownloading}
//                                 >
//                                     {isDownloading ? (
//                                         <Loader2 className="h-4 w-4 animate-spin" />
//                                     ) : (
//                                         <Download className="h-4 w-4" />
//                                     )}
//                                     <span>Download</span>
//                                 </button>
//                                 <button
//                                     onClick={() => {
//                                         setIsPreviewOpen(false);
//                                         setPreviewFile(null);
//                                     }}
//                                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Close
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Content Area */}
//                         <div className="flex-1 overflow-auto bg-gray-50 p-4">
//                             {previewFile.canPreview ? (
//                                 <>
//                                     {/* Image Preview */}
//                                     {previewFile.isImage && (
//                                         <div className="flex items-center justify-center h-full">
//                                             <img
//                                                 src={previewFile.url}
//                                                 alt={previewFile.filename}
//                                                 className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
//                                                 onError={(e) => {
//                                                     e.target.onerror = null;
//                                                     e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%236b7280">Cannot display image</text></svg>`;
//                                                 }}
//                                             />
//                                         </div>
//                                     )}

//                                     {/* PDF Preview */}
//                                     {previewFile.isPdf && (
//                                         <div className="h-full flex flex-col">
//                                             <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
//                                                 <iframe
//                                                     src={previewFile.url}
//                                                     title={previewFile.filename}
//                                                     className="w-full h-full"
//                                                     frameBorder="0"
//                                                 />
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Text File Preview */}
//                                     {previewFile.isText && (
//                                         <div className="h-full flex flex-col">
//                                             <div className="flex-1 border border-gray-300 rounded-lg overflow-auto bg-white p-4">
//                                                 <pre className="whitespace-pre-wrap font-mono text-sm">
//                                                     {/* Content will be loaded via fetch if needed */}
//                                                     Loading text content...
//                                                 </pre>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* For other previewable types */}
//                                     {!previewFile.isImage && !previewFile.isPdf && !previewFile.isText && (
//                                         <div className="h-full flex flex-col">
//                                             <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
//                                                 <iframe
//                                                     src={previewFile.url}
//                                                     title={previewFile.filename}
//                                                     className="w-full h-full"
//                                                     frameBorder="0"
//                                                 />
//                                             </div>
//                                         </div>
//                                     )}
//                                 </>
//                             ) : (
//                                 /* Non-previewable file types */
//                                 <div className="h-full flex flex-col items-center justify-center p-8">
//                                     <div className="mb-6">
//                                         <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
//                                             {getFileIconEnhanced(previewFile.filename)}
//                                         </div>
//                                     </div>
//                                     <h4 className="text-xl font-semibold text-gray-800 mb-2">
//                                         File Type Not Supported for Preview
//                                     </h4>
//                                     <p className="text-gray-600 mb-6 max-w-md text-center">
//                                         {getFileTypeDescription(previewFile.filename)} files cannot be previewed directly in the browser.
//                                     </p>
//                                     <div className="flex flex-col space-y-4 w-full max-w-sm">
//                                         <button
//                                             onClick={() => handleDownloadFile(previewFile.filename)}
//                                             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-3 transition-colors"
//                                             disabled={isDownloading}
//                                         >
//                                             {isDownloading ? (
//                                                 <Loader2 className="h-5 w-5 animate-spin" />
//                                             ) : (
//                                                 <Download className="h-5 w-5" />
//                                             )}
//                                             <span className="font-medium">Download File</span>
//                                         </button>

//                                         {/* Office files - suggest online viewers */}
//                                         {previewFile.isOffice && (
//                                             <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                                                 <p className="text-blue-800 text-sm mb-2">
//                                                     <span className="font-medium">Tip:</span> Office files can be viewed using:
//                                                 </p>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     <a
//                                                         href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewFile.url)}`}
//                                                         target="_blank"
//                                                         rel="noopener noreferrer"
//                                                         className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3 py-1 bg-white border border-blue-200 rounded"
//                                                     >
//                                                         Microsoft Online Viewer
//                                                     </a>
//                                                     <a
//                                                         href={`https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.url)}`}
//                                                         target="_blank"
//                                                         rel="noopener noreferrer"
//                                                         className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3 py-1 bg-white border border-blue-200 rounded"
//                                                     >
//                                                         Google Docs Viewer
//                                                     </a>
//                                                 </div>
//                                             </div>
//                                         )}

//                                         {/* Archives - suggest extraction */}
//                                         {previewFile.isArchive && (
//                                             <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
//                                                 <p className="text-orange-800 text-sm">
//                                                     <span className="font-medium">Note:</span> This is a compressed archive file. Download and extract to view contents.
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Footer */}
//                         <div className="border-t border-gray-200 p-3 bg-gray-50">
//                             <div className="flex justify-between items-center text-sm text-gray-600">
//                                 <div className="flex items-center space-x-4">
//                                     <span>
//                                         Type: <span className="font-medium">{getFileTypeDescription(previewFile.filename)}</span>
//                                     </span>
//                                     <span>•</span>
//                                     <span>
//                                         Preview: <span className="font-medium">{previewFile.canPreview ? 'Supported' : 'Not Supported'}</span>
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center space-x-4">
//                                     <button
//                                         onClick={() => {
//                                             const url = previewFile.url;
//                                             if (url) {
//                                                 window.open(url, '_blank');
//                                             }
//                                         }}
//                                         className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
//                                     >
//                                         Open Direct Link
//                                     </button>
//                                     {previewFile.isDownloadFallback && (
//                                         <span className="text-yellow-600 text-xs">(Using download link)</span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Delete Confirmation Modal */}
//             <Modal
//                 isOpen={showDeleteModal}
//                 onClose={() => setShowDeleteModal(false)}
//                 title="Confirm Delete"
//                 width="400px"
//             >
//                 <div className="p-4">
//                     <p className="mb-4 text-gray-700">Are you sure you want to delete this report? This action cannot be undone.</p>
//                     <div className="flex justify-end space-x-3">
//                         <button
//                             type="button"
//                             onClick={() => setShowDeleteModal(false)}
//                             className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="button"
//                             onClick={confirmDelete}
//                             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// }

// export default MemberReport;



import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { decryptData } from "../common/Functions/DecryptData";
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from "../common/Modal/Modal";
import CreateNewButton from "../common/Buttons/AddButton";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Trash2, Loader2, Download, X, File, FileText, FileImage, Eye } from 'lucide-react';
import {
    useGetMemberReportsQuery,
    useGetMaxDocNoQuery,
    useUploadMemberReportMutation,
    useUpdateMemberReportMutation,
    useDeleteMemberReportMutation,
    useDownloadFileMutation,
    useLazyGetFilePreviewInfoQuery,
} from "../services/memberReportApi";
import {
    useGetMemberMastersQuery,
} from "../services/medicalAppoinmentApi";
import {
    useGetReportMastersQuery,
} from "../services/reportMasterApi";

function MemberReport() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
 
    const initialFormData = {
        doc_No: "",
        Member_id: "",
        Report_id: "",
        purpose: "",
        remarks: "",
        Created_by: "",
        Modified_by: "",
        uploaded_file_report_first: null,
        uploaded_file_report_second: null,
        uploaded_file_report_third: null,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [files, setFiles] = useState({});
    const [existingFiles, setExistingFiles] = useState({});
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const {
        data: reports = [],
        isLoading,
        isError,
        error: fetchError,
        refetch
    } = useGetMemberReportsQuery({ skip: 0, limit: 100 });

    const { data: maxDocNoData, isLoading: isMaxDocLoading, refetch: refetchMaxDoc } = useGetMaxDocNoQuery();
    const { data: members = [] } = useGetMemberMastersQuery();
    const { data: reportTypes = [] } = useGetReportMastersQuery();

    const [uploadMemberReport] = useUploadMemberReportMutation();
    const [updateMemberReport] = useUpdateMemberReportMutation();
    const [deleteMemberReport] = useDeleteMemberReportMutation();
    const [triggerDownload] = useDownloadFileMutation();
    const [triggerGetFilePreviewInfo] = useLazyGetFilePreviewInfoQuery();


    const getUserNameFromCookie = useCallback(() => {
        try {
            const encrypted = Cookies.get("user_data");
            if (!encrypted) {
                console.warn("No user_data cookie found");
                return "System";
            }

            const decrypted = decryptData(encrypted);
            return decrypted?.User_Name || decrypted?.username || decrypted?.user_name || "System";
        } catch (error) {
            console.error("Error getting user from cookie:", error);
            return "System";
        }
    }, []);

    const showNotification = useCallback((message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    const getFileIcon = (filename) => {
        if (!filename) return <File className="h-5 w-5 text-gray-500" />;

        const ext = filename.split('.').pop().toLowerCase();
        const iconStyle = "h-5 w-5";

        if (['pdf'].includes(ext)) {
            return <FileText className={`${iconStyle} text-red-600`} />;
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
            return <FileImage className={`${iconStyle} text-green-600`} />;
        } else if (['txt', 'doc', 'docx', 'rtf'].includes(ext)) {
            return <FileText className={`${iconStyle} text-blue-600`} />;
        }
        return <File className={`${iconStyle} text-gray-600`} />;
    };

    const isImageFile = (filename) => {
        if (!filename) return false;
        const ext = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
    };

    const isPdfFile = (filename) => {
        if (!filename) return false;
        const ext = filename.split('.').pop().toLowerCase();
        return ext === 'pdf';
    };

    const getFilenameFromPath = useCallback((filePath) => {
        if (!filePath) return '';
        if (filePath.includes('/')) {
            return filePath.split('/').pop();
        }
        return filePath;
    }, []);

    const handlePreviewFile = async (filename) => {
        if (!filename) return;

        const cleanFilename = getFilenameFromPath(filename);
        console.log('Previewing file:', cleanFilename);

        try {
            setIsDownloading(true);

            const fileExt = cleanFilename.split('.').pop().toLowerCase();
            const previewableTypes = [
                'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
                'pdf',
                'txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'md',
                'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
            ];

            const isPreviewable = previewableTypes.includes(fileExt);

            if (!isPreviewable) {
                showNotification("This file type cannot be previewed. Please download to view.", "info");

                const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
                const baseUrl = apiBaseUrl.replace(/\/$/, '');
                const encodedFilename = encodeURIComponent(cleanFilename);
                const downloadUrl = `${baseUrl}/memberreport/download/${encodedFilename}`;

                setPreviewFile({
                    url: downloadUrl,
                    filename: cleanFilename,
                    isImage: false,
                    isPdf: false,
                    isText: false,
                    isOffice: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt),
                    isArchive: ['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExt),
                    fileType: fileExt.toUpperCase(),
                    directUrl: true,
                    canPreview: false
                });
                setIsPreviewOpen(true);
                return;
            }

            // Try direct view for previewable files
            const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
            const baseUrl = apiBaseUrl.replace(/\/$/, '');
            const encodedFilename = encodeURIComponent(cleanFilename);
            const viewUrl = `${baseUrl}/memberreport/view/${encodedFilename}`;

            setPreviewFile({
                url: viewUrl,
                filename: cleanFilename,
                isImage: isImageFile(cleanFilename),
                isPdf: isPdfFile(cleanFilename),
                isText: ['txt', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'md'].includes(fileExt),
                fileType: fileExt.toUpperCase(),
                directUrl: true,
                canPreview: true
            });
            setIsPreviewOpen(true);
            showNotification("Opening preview...", "info");

        } catch (error) {
            console.error('Preview failed:', error);

            const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
            const baseUrl = apiBaseUrl.replace(/\/$/, '');
            const encodedFilename = encodeURIComponent(cleanFilename);
            const downloadUrl = `${baseUrl}/memberreport/download/${encodedFilename}`;

            const fileExt = cleanFilename.split('.').pop().toLowerCase();

            setPreviewFile({
                url: downloadUrl,
                filename: cleanFilename,
                isImage: false,
                isPdf: false,
                isText: false,
                fileType: fileExt.toUpperCase(),
                directUrl: true,
                canPreview: false,
                isDownloadFallback: true
            });
            setIsPreviewOpen(true);

            showNotification("Using download link...", "info");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadFile = async (filename) => {
        if (!filename) return;

        const cleanFilename = getFilenameFromPath(filename);
        console.log('Downloading file:', cleanFilename);

        try {
            setIsDownloading(true);
            const { data } = await triggerDownload(cleanFilename).unwrap();

            if (!(data instanceof Blob)) {
                throw new Error('Invalid response from server');
            }

            if (data.size === 0) {
                throw new Error('File is empty');
            }

            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = cleanFilename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                setIsDownloading(false);
            }, 100);

            showNotification("File downloaded successfully!");

        } catch (error) {
            console.error('Download failed:', error);
            setIsDownloading(false);

            const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
            const baseUrl = apiBaseUrl.replace(/\/$/, '');
            const downloadUrl = `${baseUrl}/memberreport/download/${encodeURIComponent(cleanFilename)}`;

            const newWindow = window.open(downloadUrl, '_blank');
            if (!newWindow) {
                showNotification("Please allow popups to download files", "error");
                return;
            }

            showNotification("Opening download in new tab...", "info");
        }
    };

    useEffect(() => {
        if (!editId && !isMaxDocLoading && isModalOpen) {
            const nextDocNo = (Number(maxDocNoData?.max_doc_no) || 0) + 1;
            setFormData(prev => ({ ...prev, doc_No: nextDocNo.toString() }));
        }
    }, [maxDocNoData, isMaxDocLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();

        const userName = getUserNameFromCookie();

        try {
            await refetchMaxDoc();
        } catch (error) {
            console.error("Error fetching max doc no:", error);
            showNotification("Failed to generate document number", "error");
            return;
        }

        setFormData(prev => ({
            ...prev,
            Created_by: userName,
            Created_at: new Date().toISOString().split("T")[0]
        }));

        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
        console.log('Editing row:', row);

        setFormData({
            doc_No: row.doc_No || "",
            Member_id: row.Member_id?.toString() || "",
            Report_id: row.Report_id?.toString() || "",
            purpose: row.purpose || "",
            remarks: row.remarks || "",
            Created_by: row.Created_by || "",
            Modified_by: row.Modified_by || "",
        });

        const existingFilesObj = {
            uploaded_file_report_first: getFilenameFromPath(row.uploaded_file_report_first),
            uploaded_file_report_second: getFilenameFromPath(row.uploaded_file_report_second),
            uploaded_file_report_third: getFilenameFromPath(row.uploaded_file_report_third),
        };

        console.log('Existing files:', existingFilesObj);

        setExistingFiles(existingFilesObj);
        setFiles(existingFilesObj);

        setEditId(row.MemberReport_id);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!id) {
            showNotification("Invalid report ID", "error");
            return;
        }
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMemberReport(deleteId).unwrap();
            showNotification("Report deleted successfully!");
            await refetch();
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMessage = error?.data?.message ||
                error?.data?.detail ||
                "Failed to delete report. Please try again.";
            showNotification(errorMessage, "error");
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.Member_id) {
            showNotification("Please select a member", "error");
            setIsSubmitting(false);
            return;
        }
        if (!formData.Report_id) {
            showNotification("Please select a report type", "error");
            setIsSubmitting(false);
            return;
        }
        if (!formData.purpose.trim()) {
            showNotification("Purpose is required", "error");
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            const userName = getUserNameFromCookie();

            if (!editId) {
                formDataToSend.append("Member_id", formData.Member_id);
                formDataToSend.append("Report_id", formData.Report_id);
                formDataToSend.append("purpose", formData.purpose);
                formDataToSend.append("Created_by", userName);

                if (formData.remarks) {
                    formDataToSend.append("remarks", formData.remarks);
                }
                if (formData.doc_No) {
                    formDataToSend.append("doc_No", formData.doc_No);
                }

                Object.entries(files).forEach(([key, file]) => {
                    if (file && typeof file === 'object' && file.name) {
                        formDataToSend.append(key, file);
                    }
                });

                await uploadMemberReport(formDataToSend).unwrap();
                showNotification("Report created successfully!");
            }

            else {
          
                if (formData.purpose) {
                    formDataToSend.append("purpose", formData.purpose);
                }
                if (formData.remarks !== undefined) {
                    formDataToSend.append("remarks", formData.remarks);
                }
                if (formData.Modified_by !== undefined) {
                    formDataToSend.append("Modified_by", userName);
                }

       
                const fileActions = {};

                Object.entries(files).forEach(([key, file]) => {
                    const oldFile = existingFiles[key];

                    if (file === null && oldFile) {
                
                        fileActions[key] = 'delete';
                    }
                    else if (file && typeof file === 'object' && file.name) {
               
                        formDataToSend.append(key, file);
                        fileActions[key] = 'update';
                    }
                    else if (file && typeof file === 'string' && file === oldFile) {
                   
                        fileActions[key] = 'keep';
                    }
                });

           
                if (Object.keys(fileActions).length > 0) {
                    formDataToSend.append("file_actions", JSON.stringify(fileActions));
                }

                await updateMemberReport({
                    id: editId,
                    formData: formDataToSend
                }).unwrap();
                showNotification("Report updated successfully!");
            }

            resetForm();
            setIsModalOpen(false);
            await refetch();
        } catch (error) {
            console.error("Save failed:", error);

            let errorMessage = "Failed to save report";
            if (error?.data?.detail) {
                if (Array.isArray(error.data.detail)) {
                    errorMessage = error.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMessage = error.data.detail;
                }
            } else if (error?.data?.message) {
                errorMessage = error.data.message;
            }

            showNotification(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setFiles({});
        setExistingFiles({});
        setEditId(null);
        setIsPreviewOpen(false);
        setPreviewFile(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files?.[0];
        if (file && file.name && file.size !== undefined) {
            if (file.size > 10 * 1024 * 1024) {
                showNotification("File size must be less than 10MB", "error");
                e.target.value = '';
                return;
            }
            setFiles(prev => ({ ...prev, [fieldName]: file }));
        }
    };

    const handleRemoveFile = (fieldName) => {
        setFiles(prev => ({ ...prev, [fieldName]: null }));
    };

    const FileDisplay = ({ file, fieldName }) => {
        const isNewFile = file && typeof file === 'object' && file.name && file.size !== undefined;
        const isExistingFile = typeof file === 'string' && file.trim() !== '';
        const isRemoved = file === null;

        const filename = isNewFile ? file.name : getFilenameFromPath(file);

        if (isRemoved) {
            return (
                <div className="p-3 border border-dashed border-gray-300 rounded text-center">
                    <p className="text-gray-500">File removed</p>
                    <input
                        type="file"
                        onChange={(e) => handleFileChange(e, fieldName)}
                        className="w-full mt-2 p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
            );
        }

        if (!isNewFile && !isExistingFile) {
            return (
                <input
                    type="file"
                    onChange={(e) => handleFileChange(e, fieldName)}
                    className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required={fieldName === 'uploaded_file_report_first' && !editId}
                />
            );
        }

        const fileSize = isNewFile && file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '';

        return (
            <div className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        {getFileIcon(filename)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate" title={filename}>
                                {filename}
                            </span>
                            {isNewFile && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                    New
                                </span>
                            )}
                        </div>
                        {fileSize && (
                            <span className="text-xs text-gray-500">{fileSize}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {isExistingFile && (
                        <>
                            <button
                                type="button"
                                onClick={() => handlePreviewFile(filename)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Preview"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownloadFile(filename)}
                                className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="Download"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => handleRemoveFile(fieldName)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Remove"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    const getMemberName = (memberId) => {
        const member = members.find(m => m.Member_id === memberId);
        return member?.Member_name || "Unknown";
    };

    const getReportName = (reportId) => {
        const report = reportTypes.find(r => r.Report_id === reportId);
        return report?.report_name || "Unknown";
    };

    const columns = [
        {
            header: 'Doc No',
            accessor: 'doc_No',
            cellRenderer: (value, row) => row.doc_No || "-"
        },
        {
            header: 'Member',
            accessor: 'member_name',
            cellRenderer: (value, row) => getMemberName(row.Member_id)
        },
        {
            header: 'Report Type',
            accessor: 'report_name',
            cellRenderer: (value, row) => getReportName(row.Report_id)
        },
        {
            header: 'Purpose',
            accessor: 'purpose',
            cellRenderer: (value, row) => row.purpose || "-"
        },
        
        {
            header: 'Date',
            accessor: 'Created_at',
            cellRenderer: (value, row) => {
                if (!row.Created_at) return "-";
                return new Date(row.Created_at).toLocaleDateString();
            }
        },
        {
            header: 'Actions',
            accessor: 'action',
            isAction: true,
            className: 'text-center',
            actionRenderer: (row) => (
                <div className="flex justify-center space-x-2">
                    <button
                        className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        className="p-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
                        onClick={() => handleDelete(row.MemberReport_id)}
                        title="Delete"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4 mx-auto" />
                    <p className="text-gray-600 font-medium">Loading member reports...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="bg-red-50 text-red-800 p-8 rounded-xl max-w-md text-center border border-red-200 shadow-sm">
                    <XCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-semibold mb-2">Error Loading Reports</h3>
                    <p className="mb-6 text-gray-700">
                        {fetchError?.data?.message ||
                            fetchError?.error ||
                            "Failed to load reports. Please check your connection and try again."}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
                    >
                        <div className="flex items-center justify-center">
                            <span>Retry</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 animate-fade-in-up ${notification.type === "success"
                            ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200"
                            : "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200"
                        }`}
                >
                    {notification.type === "success" ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                        <XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                    )}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-full mx-auto">
                <TableUtility
                    title="Member Reports"
                    headerContent={
                        <div className="flex justify-between items-center mb-6">
                            <CreateNewButton
                                onClick={handleAddNew}
                                disabled={isMaxDocLoading || isLoading}
                                label={isMaxDocLoading ? "Loading..." : "Add New Report"}
                            />
                        </div>
                    }
                    columns={columns}
                    data={Array.isArray(reports) ? reports : []}
                    pageSize={10}
                    loading={isLoading}
                    searchable={true}
                    exportable={true}
                    className="border-0"
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editId ? "" : ""}
                width="900px"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-6 mb-4">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200 rounded-full opacity-20"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>
            
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-6 mb-4">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200 rounded-full opacity-20"></div>
         <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            {editId ? (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editId ? "Update Member Details" : "Add New Family Member Reports"}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {editId
                                    ? "Update the member information below"
                                    : ""}
                            </p>
                        </div>
                    </div>

       
                <div className="max-w-md">
                        <div className="absolute top-1 right-6 w-20">
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center justify-end">
                                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded mr-2">
                                    Auto
                                </span>
                                Document No
                            </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="doc_No"
                                        value={formData.doc_No}
                                        readOnly
                                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl
                                                p-2.5 pl-9 text-sm text-gray-700 font-medium
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                                focus:border-blue-500"
                                    />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                </div>
                            </div>
                      </div>
                 </div>
        </div>
        </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
                        

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Member Name *
                            </label>
                            <select
                                name="Member_id"
                                value={formData.Member_id}
                                onChange={handleInputChange}
                                required
                                disabled={editId}
                                className="w-full border border-gray-300 rounded-lg p-2.5 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500 hover:border-blue-400 transition"
                            >
                                <option value="">Select Member</option>
                                {members.map(member => (
                                    <option key={member.Member_id} value={member.Member_id}>
                                        {member.Member_name} - {member.Mobile_no}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Report Name *
                            </label>
                            <select
                                name="Report_id"
                                value={formData.Report_id}
                                onChange={handleInputChange}
                                required
                                disabled={editId}
                                className="w-full border border-gray-300 rounded-lg p-2.5 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500 hover:border-blue-400 transition"
                            >
                                <option value="">Select Report Type</option>
                                {reportTypes.map(report => (
                                    <option key={report.Report_id} value={report.Report_id}>
                                        {report.report_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Purpose *
                            </label>
                            <input
                                type="text"
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500 hover:border-blue-400 transition"
                                placeholder="Enter purpose"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500 hover:border-blue-400 transition"
                                rows="3"
                                placeholder="Additional notes"
                            />
                        </div>

                        {['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third'].map((field, index) => (
                            <div key={field} className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Report File {index + 1} {index === 0 && !editId ? "*" : ""}
                                </label>

                                <FileDisplay
                                    file={files[field]}
                                    fieldName={field}
                                />

                                <p className="text-xs text-gray-500 mt-1">
                                    Max 10MB per file. Supported: PDF, Images, Documents
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {editId ? "Updating..." : "Saving..."}
                                </span>
                            ) : (
                                editId ? "Update Report" : "Save Report"
                            )}
                        </button>
                    </div>
                </form>
                {isPreviewOpen && previewFile && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-lg shadow-xl flex flex-col w-full max-w-7xl h-full max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(previewFile.filename)}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        File Preview
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate max-w-md">
                                        {previewFile.filename}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                               
                                <button
                                    onClick={() => {
                                        setIsPreviewOpen(false);
                                        setPreviewFile(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-gray-50 p-4">
                            {previewFile.canPreview ? (
                                <>
                          
                                    {previewFile.isImage && (
                                        <div className="flex items-center justify-center h-full">
                                            <img
                                                src={previewFile.url}
                                                alt={previewFile.filename}
                                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%236b7280">Cannot display image</text></svg>`;
                                                }}
                                            />
                                        </div>
                                    )}

                                    {previewFile.isPdf && (
                                        <div className="h-full flex flex-col">
                                            <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                                                <iframe
                                                    src={previewFile.url}
                                                    title={previewFile.filename}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-8">
                                    <div className="mb-6">
                                        <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                            {getFileIcon(previewFile.filename)}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                        File Type Not Supported for Preview
                                    </h4>
                                    <p className="text-gray-600 mb-6 max-w-md text-center">
                                        {previewFile.fileType} files cannot be previewed directly in the browser.
                                    </p>
                                    <div className="flex flex-col space-y-4 w-full max-w-sm">
                                        <button
                                            onClick={() => handleDownloadFile(previewFile.filename)}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-3 transition-colors"
                                            disabled={isDownloading}
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Download className="h-5 w-5" />
                                            )}
                                            <span className="font-medium">Download File</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                    <span>
                                        Type: <span className="font-medium">{previewFile.fileType}</span>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Preview: <span className="font-medium">{previewFile.canPreview ? 'Supported' : 'Not Supported'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            </Modal>


            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Delete"
                width="400px"
            >
                <div className="p-4">
                    <p className="mb-4 text-gray-700">Are you sure you want to delete this report? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default MemberReport;