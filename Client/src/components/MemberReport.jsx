// import { useState, useEffect, useCallback } from "react";
// import Cookies from "js-cookie";
// import { decryptData } from "../common/Functions/DecryptData";
// import TableUtility from "../common/TableUtility/TableUtility";
// import Modal from "../common/Modal/Modal";
// import CreateNewButton from "../common/Buttons/AddButton";
// import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
// import { Trash2, Loader2, Download } from 'lucide-react';

// // Import API hooks
// import {
//     useGetMemberReportsQuery,
//     useGetMaxDocNoQuery,
//     useUploadMemberReportMutation,
//     useUpdateMemberReportMutation,
//     useDeleteMemberReportMutation,
//     useDownloadFileMutation,
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
//     const [notification, setNotification] = useState({
//         show: false,
//         message: "",
//         type: "success",
//     });

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
//         setFormData({
//             doc_No: row.doc_No || "",
//             Member_id: row.Member_id?.toString() || "",
//             Report_id: row.Report_id?.toString() || "",
//             purpose: row.purpose || "",
//             remarks: row.remarks || "",
//             Created_by: row.Created_by || "",
//             Modified_by: row.Modified_by || "",
//         });
        
//         // Set existing files
//         setFiles({
//             uploaded_file_report_first: row.uploaded_file_report_first,
//             uploaded_file_report_second: row.uploaded_file_report_second,
//             uploaded_file_report_third: row.uploaded_file_report_third,
//         });
        
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
//                                 "Failed to delete report. Please try again.";
//             showNotification(errorMessage, "error");
//         } finally {
//             setShowDeleteModal(false);
//             setDeleteId(null);
//         }
//     };

//     const handleDownloadFile = async (filename) => {
//         if (!filename) return;
        
//         try {
//             const { data } = await triggerDownload(filename).unwrap();
//             const url = window.URL.createObjectURL(data);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = filename;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
            
//             showNotification("File downloaded successfully!");
//         } catch (error) {
//             console.error('Download failed:', error);
//             // Fallback to direct download
//             window.open(`${import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000"}/memberreport/download/${filename}`, '_blank');
//             showNotification("Downloading file...", "info");
//         }
//     };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.Member_id) {
//         showNotification("Please select a member", "error");
//         return;
//     }
//     if (!formData.Report_id) {
//         showNotification("Please select a report type", "error");
//         return;
//     }
//     if (!formData.purpose.trim()) {
//         showNotification("Purpose is required", "error");
//         return;
//     }

//     try {
//         const formDataToSend = new FormData();
//         const userName = getUserNameFromCookie();
        
//         console.log('Form data before sending:', formData);
//         console.log('Files:', files);
//         console.log('User:', userName);

//         // For CREATE operation
//         if (!editId) {
//             formDataToSend.append("Member_id", formData.Member_id);
//             formDataToSend.append("Report_id", formData.Report_id);
//             formDataToSend.append("purpose", formData.purpose);
//             formDataToSend.append("Created_by", userName);
            
//             if (formData.remarks) {
//                 formDataToSend.append("remarks", formData.remarks);
//             }
//             if (formData.doc_No) {
//                 formDataToSend.append("doc_No", formData.doc_No);
//             }
            
//             // Add files
//             Object.entries(files).forEach(([key, file]) => {
//                 if (file instanceof File) {
//                     console.log('Adding file:', key, file.name, file.size);
//                     formDataToSend.append(key, file);
//                 }
//             });

//             // Debug: Log FormData contents
//             console.log('FormData entries:');
//             for (let [key, value] of formDataToSend.entries()) {
//                 console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
//             }

//             const result = await uploadMemberReport(formDataToSend).unwrap();
//             console.log('Create response:', result);
//             showNotification("Report created successfully!");
//         } 
//         // For UPDATE operation
//         else {
//             // Add required fields for update
//             if (formData.purpose) {
//                 formDataToSend.append("purpose", formData.purpose);
//             }
//             if (formData.remarks !== undefined) {
//                 formDataToSend.append("remarks", formData.remarks);
//             }
//             formDataToSend.append("Modified_by", userName);
            
//             // Handle file updates
//             Object.entries(files).forEach(([key, file]) => {
//                 if (file instanceof File) {
//                     console.log('Updating file:', key, file.name, file.size);
//                     formDataToSend.append(key, file);
//                 } else if (file === null) {
//                     // File was removed - send empty string
//                     console.log('Removing file:', key);
//                     formDataToSend.append(key, "");
//                 }
//             });

//             // Debug: Log FormData contents
//             console.log('Update FormData entries:');
//             for (let [key, value] of formDataToSend.entries()) {
//                 console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
//             }

//             const result = await updateMemberReport({ 
//                 id: editId, 
//                 formData: formDataToSend 
//             }).unwrap();
//             console.log('Update response:', result);
//             showNotification("Report updated successfully!");
//         }

//         resetForm();
//         setIsModalOpen(false);
//         await refetch();
//     } catch (error) {
//         console.error("Save failed:", error);
//         console.error("Error details:", error.data);
        
//         // Better error display
//         let errorMessage = "Failed to save report";
//         if (error?.data?.detail) {
//             if (Array.isArray(error.data.detail)) {
//                 errorMessage = error.data.detail.map(d => d.msg).join(', ');
//             } else {
//                 errorMessage = error.data.detail;
//             }
//         } else if (error?.data?.message) {
//             errorMessage = error.data.message;
//         } else if (error?.error) {
//             errorMessage = error.error;
//         }
        
//         showNotification(errorMessage, "error");
//     }
// };
//     const resetForm = () => {
//         setFormData(initialFormData);
//         setFiles({});
//         setEditId(null);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleFileChange = (e, fieldName) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             // Validate file size (10MB max)
//             if (file.size > 10 * 1024 * 1024) {
//                 showNotification("File size must be less than 10MB", "error");
//                 return;
//             }
//             setFiles(prev => ({ ...prev, [fieldName]: file }));
//         }
//     };

//     const handleRemoveFile = (fieldName) => {
//         setFiles(prev => ({ ...prev, [fieldName]: null }));
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

//     // Table Columns for TableUtility
//     const columns = [
//         { 
//             header: 'Doc No', 
//             accessor: 'doc_No',
//             cellRenderer: (value, row) => row.doc_No || "-"
//         },
//         { 
//             header: 'Member', 
//             accessor: 'Member_id',
//             cellRenderer: (value, row) => getMemberName(row.Member_id)
//         },
//         { 
//             header: 'Report Type', 
//             accessor: 'Report_id',
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
//                 const fileCount = [
//                     row.uploaded_file_report_first,
//                     row.uploaded_file_report_second,
//                     row.uploaded_file_report_third,
//                 ].filter(Boolean).length;
                
//                 return fileCount > 0 ? `${fileCount} file(s)` : "No files";
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
//                          fetchError?.error || 
//                          "Failed to load reports. Please check your connection and try again."}
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
//         <div className="bg-gray-50 min-h-screen font-inter p-4 md:p-6">
//             {/* Notification */}
//             {notification.show && (
//                 <div
//                     className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 animate-fade-in-up ${
//                         notification.type === "success"
//                             ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200"
//                             : "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200"
//                     }`}
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
//             <div className="max-w-full mx-auto">
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                             <div>
//                                 <h1 className="text-2xl font-bold text-gray-800">Member Reports</h1>
//                                 <p className="text-gray-600 mt-1">Manage member medical reports and documents</p>
//                             </div>
//                             <div className="mt-4 sm:mt-0">
//                                 <CreateNewButton 
//                                     onClick={handleAddNew}
//                                     disabled={isMaxDocLoading || isLoading}
//                                     label={isMaxDocLoading ? "Generating..." : "Add New Report"}
//                                     className="shadow-md hover:shadow-lg"
//                                 />
//                             </div>
//                         </div>
//                     </div>
                    
//                     <div className="p-6">
//                         <TableUtility
//                             columns={columns}
//                             data={Array.isArray(reports) ? reports : []}
//                             pageSize={10}
//                             loading={isLoading}
//                             searchable={true}
//                             exportable={true}
//                             className="border-0"
//                         />
//                     </div>
//                 </div>
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
//                                 Member *
//                             </label>
//                             <select
//                                 name="Member_id"
//                                 value={formData.Member_id}
//                                 onChange={handleInputChange}
//                                 required
//                                 disabled={editId}
//                                 className="w-full p-2 border rounded disabled:bg-gray-50"
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
//                                 Report Type *
//                             </label>
//                             <select
//                                 name="Report_id"
//                                 value={formData.Report_id}
//                                 onChange={handleInputChange}
//                                 required
//                                 disabled={editId}
//                                 className="w-full p-2 border rounded disabled:bg-gray-50"
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
//                                 className="w-full p-2 border rounded"
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
//                                 className="w-full p-2 border rounded"
//                                 rows="3"
//                                 placeholder="Additional notes"
//                             />
//                         </div>

//                         {/* File Uploads */}
//                         {['uploaded_file_report_first', 'uploaded_file_report_second', 'uploaded_file_report_third'].map((field, index) => (
//                             <div key={field} className="md:col-span-2">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Report File {index + 1} {index === 0 ? "*" : ""}
//                                 </label>
                                
//                                 {files[field] ? (
//                                     <div className="flex items-center justify-between p-3 border rounded bg-gray-50">
//                                         <div className="flex items-center space-x-3">
//                                             <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center">
//                                                 📄
//                                             </div>
//                                             <div>
//                                                 <span className="text-sm font-medium truncate block max-w-xs">
//                                                     {files[field] instanceof File 
//                                                         ? files[field].name 
//                                                         : files[field]?.split('/').pop() || "File"}
//                                                 </span>
//                                                 {files[field] instanceof File && (
//                                                     <span className="text-xs text-gray-500">
//                                                         {(files[field].size / 1024 / 1024).toFixed(2)} MB
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                         <div className="flex space-x-2">
//                                             {(!editId || files[field] instanceof File) ? (
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleRemoveFile(field)}
//                                                     className="text-red-600 hover:text-red-800 text-sm"
//                                                 >
//                                                     Remove
//                                                 </button>
//                                             ) : (
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleDownloadFile(files[field]?.split('/').pop())}
//                                                     className="text-blue-600 hover:text-blue-800"
//                                                     title="Download"
//                                                 >
//                                                     <Download className="h-5 w-5" />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <input
//                                         type="file"
//                                         onChange={(e) => handleFileChange(e, field)}
//                                         className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                                         required={index === 0 && !editId}
//                                     />
//                                 )}
//                                 <p className="text-xs text-gray-500 mt-1">Max 10MB per file</p>
//                             </div>
//                         ))}

//                         {/* User Info */}
//                         <div className="md:col-span-2 p-3 bg-gray-50 rounded border">
//                             <h4 className="text-sm font-semibold text-gray-700 mb-2">User Information</h4>
//                             <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div>
//                                     <div className="text-gray-600">Created By</div>
//                                     <div className="font-medium text-gray-900">
//                                         {formData.Created_by || getUserNameFromCookie()}
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <div className="text-gray-600">Modified By</div>
//                                     <div className="font-medium text-gray-900">
//                                         {formData.Modified_by || "-"}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
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
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                         >
//                             {editId ? "Update Report" : "Save Report"}
//                         </button>
//                     </div>
//                 </form>
//             </Modal>

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

// export default MemberReport;import { useState, useEffect, useCallback } from "react";import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { useState, useEffect, useCallback } from "react";

import { decryptData } from "../common/Functions/DecryptData";
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from "../common/Modal/Modal";
import CreateNewButton from "../common/Buttons/AddButton";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Trash2, Loader2, Download, X, File, FileText, FileImage, Eye } from 'lucide-react';

// Import API hooks
import {
    useGetMemberReportsQuery,
    useGetMaxDocNoQuery,
    useUploadMemberReportMutation,
    useUpdateMemberReportMutation,
    useDeleteMemberReportMutation,
    useDownloadFileMutation,
} from "../services/memberReportApi";

// Import related APIs
import {
    useGetMemberMastersQuery,
} from "../services/medicalAppoinmentApi";
import {
    useGetReportMastersQuery,
} from "../services/reportMasterApi";

function MemberReport() {
    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Form Data
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

    // API Hooks
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

    // Get logged-in username from decrypted cookie
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

    // Get file icon based on extension
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

    // Check if file is image
    const isImageFile = (filename) => {
        if (!filename) return false;
        const ext = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
    };

    // Check if file is PDF
    const isPdfFile = (filename) => {
        if (!filename) return false;
        const ext = filename.split('.').pop().toLowerCase();
        return ext === 'pdf';
    };

    // Get just the filename from path
    const getFilenameFromPath = useCallback((filePath) => {
        if (!filePath) return '';
        // Handle both full paths and just filenames
        if (filePath.includes('/')) {
            return filePath.split('/').pop();
        }
        return filePath;
    }, []);

    // Preview file
const handlePreviewFile = async (filename) => {
    if (!filename) return;
    
    const cleanFilename = getFilenameFromPath(filename);
    console.log('Previewing file:', cleanFilename);
    
    try {
        // Use the API endpoint
        const { data } = await triggerDownload(cleanFilename).unwrap();
        
        if (!(data instanceof Blob)) {
            throw new Error('Invalid response from server');
        }
        
        if (data.size === 0) {
            throw new Error('File is empty');
        }
        
        const url = window.URL.createObjectURL(data);
        
        setPreviewFile({
            url,
            filename: cleanFilename,
            isImage: isImageFile(cleanFilename),
            isPdf: isPdfFile(cleanFilename)
        });
        setIsPreviewOpen(true);
        
    } catch (error) {
        console.error('Preview failed:', error);
        
        // Construct correct URL without double slash
        const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
        // Remove trailing slash if present
        const baseUrl = apiBaseUrl.replace(/\/$/, '');
        const directUrl = `${baseUrl}/memberreport/download/${encodeURIComponent(cleanFilename)}`;
        console.log('Trying fallback URL:', directUrl);
        
        setPreviewFile({
            url: directUrl,
            filename: cleanFilename,
            isImage: isImageFile(cleanFilename),
            isPdf: isPdfFile(cleanFilename),
            directUrl: true
        });
        setIsPreviewOpen(true);
        
        showNotification("Opening file in new tab...", "info");
    }
};

    // Download file
   const handleDownloadFile = async (filename) => {
    if (!filename) return;
    
    const cleanFilename = getFilenameFromPath(filename);
    console.log('Downloading file:', cleanFilename);
    
    try {
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
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        showNotification("File downloaded successfully!");
        
    } catch (error) {
        console.error('Download failed:', error);
        
        // Construct correct URL without double slash
        const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:8000";
        // Remove trailing slash if present
        const baseUrl = apiBaseUrl.replace(/\/$/, '');
        const downloadUrl = `${baseUrl}/memberreport/download/${encodeURIComponent(cleanFilename)}`;
        
        // Try opening in new tab
        const newWindow = window.open(downloadUrl, '_blank');
        if (!newWindow) {
            showNotification("Please allow popups to download files", "error");
            return;
        }
        
        showNotification("Opening download...", "info");
    }
};

    // Auto-generate doc_No for new report
    useEffect(() => {
        if (!editId && !isMaxDocLoading && isModalOpen) {
            const nextDocNo = (Number(maxDocNoData?.max_doc_no) || 0) + 1;
            setFormData(prev => ({ ...prev, doc_No: nextDocNo.toString() }));
        }
    }, [maxDocNoData, isMaxDocLoading, editId, isModalOpen]);

    // Handlers
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
        
        // Extract filenames from paths
        const existingFilesObj = {
            uploaded_file_report_first: getFilenameFromPath(row.uploaded_file_report_first),
            uploaded_file_report_second: getFilenameFromPath(row.uploaded_file_report_second),
            uploaded_file_report_third: getFilenameFromPath(row.uploaded_file_report_third),
        };
        
        console.log('Existing files:', existingFilesObj);
        
        setExistingFiles(existingFilesObj);
        setFiles(existingFilesObj); // Start with existing files
        
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
        
        // Validation
        if (!formData.Member_id) {
            showNotification("Please select a member", "error");
            return;
        }
        if (!formData.Report_id) {
            showNotification("Please select a report type", "error");
            return;
        }
        if (!formData.purpose.trim()) {
            showNotification("Purpose is required", "error");
            return;
        }

        try {
            const formDataToSend = new FormData();
            const userName = getUserNameFromCookie();
            
            console.log('Submitting form data:', formData);
            console.log('Files:', files);
            console.log('User:', userName);

            // For CREATE operation
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
                
                // Add files with safer check
                Object.entries(files).forEach(([key, file]) => {
                    if (file && typeof file === 'object' && file.name && file.size !== undefined) {
                        console.log('Adding file:', key, file.name, file.size);
                        formDataToSend.append(key, file);
                    }
                });

                const result = await uploadMemberReport(formDataToSend).unwrap();
                console.log('Create response:', result);
                showNotification("Report created successfully!");
            } 
            // For UPDATE operation
            else {
                // Add required fields for update
                if (formData.purpose) {
                    formDataToSend.append("purpose", formData.purpose);
                }
                if (formData.remarks !== undefined) {
                    formDataToSend.append("remarks", formData.remarks);
                }
                if (formData.Modified_by !== undefined) {
                    formDataToSend.append("Modified_by", userName);
                }
                
                // Handle file updates with safer checks
                Object.entries(files).forEach(([key, file]) => {
                    if (file && typeof file === 'object' && file.name && file.size !== undefined) {
                        console.log('Updating file:', key, file.name, file.size);
                        formDataToSend.append(key, file);
                    } else if (file === null) {
                        // File was removed - send empty file
                        console.log('Removing file:', key);
                        formDataToSend.append(key, new File([""], ""));
                    }
                    // If file is a string (existing file), don't send it - it will remain unchanged
                });

                const result = await updateMemberReport({ 
                    id: editId, 
                    formData: formDataToSend 
                }).unwrap();
                console.log('Update response:', result);
                showNotification("Report updated successfully!");
            }

            resetForm();
            setIsModalOpen(false);
            await refetch();
        } catch (error) {
            console.error("Save failed:", error);
            console.error("Error details:", error.data);
            
            let errorMessage = "Failed to save report";
            if (error?.data?.detail) {
                if (Array.isArray(error.data.detail)) {
                    errorMessage = error.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMessage = error.data.detail;
                }
            } else if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.error) {
                errorMessage = error.error;
            }
            
            showNotification(errorMessage, "error");
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
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                showNotification("File size must be less than 10MB", "error");
                e.target.value = ''; // Clear the file input
                return;
            }
            setFiles(prev => ({ ...prev, [fieldName]: file }));
        }
    };

    const handleRemoveFile = (fieldName) => {
        setFiles(prev => ({ ...prev, [fieldName]: null }));
    };

    // Enhanced file display component
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

    // Helper function to get member name
    const getMemberName = (memberId) => {
        const member = members.find(m => m.Member_id === memberId);
        return member?.Member_name || "Unknown";
    };

    // Helper function to get report name
    const getReportName = (reportId) => {
        const report = reportTypes.find(r => r.Report_id === reportId);
        return report?.report_name || "Unknown";
    };

    // Enhanced table with file actions
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
            header: 'Created By', 
            accessor: 'Created_by',
            cellRenderer: (value, row) => row.Created_by || "-"
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
        <div className="bg-gray-50 min-h-screen font-inter p-4 md:p-6">
            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 animate-fade-in-up ${
                        notification.type === "success"
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
                        title="Member Report"
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
          
         

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editId ? "Edit Member Report" : "Add New Member Report"}
                width="1000px"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Doc No */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Document Number
                            </label>
                            <input
                                type="text"
                                name="doc_No"
                                value={formData.doc_No}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>

                        {/* Member */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Member *
                            </label>
                            <select
                                name="Member_id"
                                value={formData.Member_id}
                                onChange={handleInputChange}
                                required
                                disabled={editId}
                                className="w-full p-2 border rounded disabled:bg-gray-50"
                            >
                                <option value="">Select Member</option>
                                {members.map(member => (
                                    <option key={member.Member_id} value={member.Member_id}>
                                        {member.Member_name} - {member.Mobile_no}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Report Type *
                            </label>
                            <select
                                name="Report_id"
                                value={formData.Report_id}
                                onChange={handleInputChange}
                                required
                                disabled={editId}
                                className="w-full p-2 border rounded disabled:bg-gray-50"
                            >
                                <option value="">Select Report Type</option>
                                {reportTypes.map(report => (
                                    <option key={report.Report_id} value={report.Report_id}>
                                        {report.report_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Purpose */}
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
                                className="w-full p-2 border rounded"
                                placeholder="Enter purpose"
                            />
                        </div>

                        {/* Remarks */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                                placeholder="Additional notes"
                            />
                        </div>

                        {/* File Uploads */}
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

                        {/* User Info */}
                        {/* <div className="md:col-span-2 p-3 bg-gray-50 rounded border">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">User Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-600">Created By</div>
                                    <div className="font-medium text-gray-900">
                                        {formData.Created_by || getUserNameFromCookie()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Modified By</div>
                                    <div className="font-medium text-gray-900">
                                        {formData.Modified_by || "-"}
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {editId ? "Update Report" : "Save Report"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* File Preview Modal */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false);
                    setPreviewFile(null);
                    // Revoke object URL to prevent memory leaks
                    if (previewFile?.url && !previewFile.directUrl) {
                        window.URL.revokeObjectURL(previewFile.url);
                    }
                }}
                title={previewFile?.filename || "File Preview"}
                width="90%"
                height="90%"
            >
                <div className="h-full flex flex-col">
                    {previewFile ? (
                        <>
                            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                <div className="flex items-center space-x-2">
                                    {getFileIcon(previewFile.filename)}
                                    <span className="font-medium truncate max-w-md">
                                        {previewFile.filename}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleDownloadFile(previewFile.filename)}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download</span>
                                    </button>
                                    <button
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-auto bg-gray-50 rounded border">
                                {previewFile.isImage ? (
                                    <div className="flex items-center justify-center h-full p-4">
                                        <img 
                                            src={previewFile.url} 
                                            alt={previewFile.filename}
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%236b7280">Cannot display image</text></svg>`;
                                            }}
                                        />
                                    </div>
                                ) : previewFile.isPdf ? (
                                    <div className="h-full w-full">
                                        <iframe
                                            src={previewFile.url}
                                            title={previewFile.filename}
                                            className="w-full h-full border-0"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <div className="mb-4">
                                            {getFileIcon(previewFile.filename)}
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            This file type cannot be previewed in the browser.
                                        </p>
                                        <button
                                            onClick={() => handleDownloadFile(previewFile.filename)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center space-x-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Download to view</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {previewFile.directUrl && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                    <p className="font-medium">Note:</p>
                                    <p>Previewing directly from server. For better experience, download the file.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
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