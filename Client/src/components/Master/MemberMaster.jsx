// import { useState, useEffect } from "react";
// import Cookies from "js-cookie";
// import { decryptData } from "../../common/Functions/DecryptData";
// import TableUtility from "../../common/TableUtility/TableUtility";
// import Modal from "../../common/Modal/Modal";
// import CreateNewButton from "../../common/Buttons/AddButton";
// import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
// import { Trash2 } from "lucide-react";

// import {
//     useGetMemberMastersQuery,
//     useGetMaxMemberDocNoQuery,
//     useAddMemberMasterMutation,
//     useUpdateMemberMasterMutation,
//     useDeleteMemberMasterMutation,
// } from "../../services/medicalAppoinmentApi";

// function MemberMaster() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editId, setEditId] = useState(null);
//     const [formData, setFormData] = useState({
//         doc_No: "",
//         Member_name: "",
//         Member_address: "",
//         Mobile_no: "",
//         other_details: "",
//         Created_by: "",
//         Modified_by: "",
//         Created_at: new Date().toISOString().split("T")[0]
//     });

//     const [notification, setNotification] = useState({
//         show: false,
//         message: "",
//         type: "success",
//     });

//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
//     const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

//     const { 
//         data: tableData = [], 
//         isLoading, 
//         isError, 
//         refetch 
//     } = useGetMemberMastersQuery();
    
//     const { 
//         data: maxDocNoData, 
//         isLoading: isMaxDocLoading, 
//         refetch: refetchDoc 
//     } = useGetMaxMemberDocNoQuery();
    
//     const [addMember, { isLoading: isAdding }] = useAddMemberMasterMutation();
//     const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMasterMutation();
//     const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberMasterMutation();

//     // Get user data from cookie
//     const getUserDataFromCookie = () => {
//         try {
//             const userDataCookie = Cookies.get("user_data");
//             if (!userDataCookie) {
//                 console.warn("user_data cookie not found");
//                 return {};
//             }
//             const decryptedUser = decryptData(userDataCookie);
//             console.log("Decrypted user_data:", decryptedUser);
//             return decryptedUser || {};
//         } catch (error) {
//             console.error("Error decrypting user data:", error);
//             return {};
//         }
//     };

//     const showNotification = (message, type = "success") => {
//         setNotification({ show: true, message, type });
//         setTimeout(() => {
//             setNotification(prev => ({ ...prev, show: false }));
//         }, 3000);
//     };

//     // Extract maxDocNo value safely
//     const maxDocNo = maxDocNoData?.maxDocNo || maxDocNoData || 0;

//     // Auto-generate next doc_No when adding new
//     useEffect(() => {
//         if (!editId && !isMaxDocLoading && isModalOpen) {
//             const nextDocNo = (Number(maxDocNo) || 0) + 1;
//             setFormData(prev => ({ 
//                 ...prev, 
//                 doc_No: nextDocNo.toString() 
//             }));
//         }
//     }, [maxDocNo, isMaxDocLoading, editId, isModalOpen]);

//     const handleAddNew = async () => {
//         resetForm();
//         setEditId(null);

//         const userData = getUserDataFromCookie();
        
//         // Refetch max doc no first
//         try {
//             await refetchDoc();
//         } catch (error) {
//             console.error("Error fetching max doc no:", error);
//         }

//         setFormData(prev => ({
//             ...prev,
//             Created_by: userData.User_Name || userData.username || "",
//             Created_at: new Date().toISOString().split("T")[0],
//         }));

//         setIsModalOpen(true);
//     };

//     const columns = [
//         { 
//             header: "Doc No", 
//             accessor: "doc_No",
//             cell: (row) => row.doc_No || "-"
//         },
//         { 
//             header: "Name", 
//             accessor: "Member_name",
//             cell: (row) => row.Member_name || "-"
//         },
//         { 
//             header: "Address", 
//             accessor: "Member_address",
//             cell: (row) => row.Member_address || "-"
//         },
//         { 
//             header: "Mobile", 
//             accessor: "Mobile_no",
//             cell: (row) => row.Mobile_no || "-"
//         },
//         {
//             header: "Action",
//             accessor: "action",
//             isAction: true,
//             className: "text-center",
//             actionRenderer: (row) => (
//                 <div className="flex justify-center space-x-3">
//                     <button
//                         type="button"
//                         className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
//                         onClick={() => handleEdit(row)}
//                         disabled={isLoading || isAdding || isUpdating}
//                     >
//                         <PencilSquareIcon className="h-5 w-5" />
//                     </button>
//                     <button
//                         type="button"
//                         className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
//                         onClick={() => handleDelete(row.Member_id || row.id)}
//                         disabled={isLoading || isDeleting}
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button>
//                 </div>
//             ),
//         },
//     ];

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ 
//             ...prev, 
//             [name]: value 
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         // Validation
//         if (!formData.Member_name.trim()) {
//             showNotification("Member Name is required!", "error");
//             return;
//         }

//         if (!formData.Mobile_no.trim()) {
//             showNotification("Mobile No is required!", "error");
//             return;
//         }

//         const userData = getUserDataFromCookie();
//         const userName = userData.User_Name || userData.username || "System";

//         try {
//             if (editId) {
//                 const updateData = {
//                     id: editId,
//                     ...formData,
//                     Modified_by: userName,
//                     Modified_at: new Date().toISOString()
//                 };
//                 await updateMember(updateData).unwrap();
//                 showNotification("Member updated successfully!");
//             } else {
//                 const addData = {
//                     ...formData,
//                     Created_by: userName,
//                     Created_at: new Date().toISOString()
//                 };
//                 await addMember(addData).unwrap();
//                 showNotification("Member added successfully!");
//             }

//             resetForm();
//             setIsModalOpen(false);
//             await refetch();
//         } catch (error) {
//             console.error("Error saving member:", error);
//             const errorMessage = error?.data?.message || 
//                                 error?.error || 
//                                 "Failed to save member. Please try again.";
//             showNotification(errorMessage, "error");
//         }
//     };

//     const handleEdit = (row) => {
//         if (!row) return;
        
//         setFormData({
//             doc_No: row.doc_No || "",
//             Member_name: row.Member_name || "",
//             Member_address: row.Member_address || "",
//             Mobile_no: row.Mobile_no || "",
//             other_details: row.other_details || "",
//             Created_by: row.Created_by || "",
//             Modified_by: row.Modified_by || "",
//             Created_at: row.Created_at ? 
//                 new Date(row.Created_at).toISOString().split("T")[0] : 
//                 new Date().toISOString().split("T")[0],
//         });

//         setEditId(row.Member_id || row.id);
//         setIsModalOpen(true);
//     };

//     const handleDelete = (id) => {
//         if (!id) {
//             showNotification("Invalid member ID", "error");
//             return;
//         }
//         setDeleteIdToConfirm(id);
//         setShowDeleteConfirmModal(true);
//     };

//     const confirmDelete = async () => {
//         if (!deleteIdToConfirm) return;

//         try {
//             await deleteMember(deleteIdToConfirm).unwrap();
//             showNotification("Member deleted successfully!");
//             await refetch();
//         } catch (error) {
//             console.error("Delete failed:", error);
//             const errorMessage = error?.data?.message || 
//                                 "Failed to delete member. Please try again.";
//             showNotification(errorMessage, "error");
//         } finally {
//             setShowDeleteConfirmModal(false);
//             setDeleteIdToConfirm(null);
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             doc_No: "",
//             Member_name: "",
//             Member_address: "",
//             Mobile_no: "",
//             other_details: "",
//             Created_by: "",
//             Modified_by: "",
//             Created_at: new Date().toISOString().split("T")[0]
//         });
//         setEditId(null);
//     };

//     const handleModalClose = () => {
//         resetForm();
//         setIsModalOpen(false);
//     };

//     // Loading and error states
//     if (isLoading) {
//         return (
//             <div className="min-h-screen flex justify-center items-center">
//                 <div className="flex flex-col items-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                     <p className="mt-4 text-gray-600">Loading members...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (isError) {
//         return (
//             <div className="min-h-screen flex flex-col justify-center items-center">
//                 <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md text-center">
//                     <XCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
//                     <h3 className="text-lg font-semibold mb-2">Error loading members</h3>
//                     <p className="mb-4">Please try again later.</p>
//                     <button
//                         onClick={() => refetch()}
//                         className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                     >
//                         Retry
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
//                     className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg transition-all duration-300 ${
//                         notification.type === "success"
//                             ? "bg-green-50 text-green-800 border border-green-200"
//                             : "bg-red-50 text-red-800 border border-red-200"
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
//             <div className="max-w-full ">
//                 <TableUtility
//                     title="Member Master"
//                     headerContent={
//                         <div className="flex justify-between items-center mb-1">
                            
//                             <CreateNewButton 
//                                 onClick={handleAddNew}
//                                 disabled={isMaxDocLoading}
//                                 label={isMaxDocLoading ? "Loading..." : "Add New Family Member"}
//                             />
//                         </div>
//                     }
//                     columns={columns}
//                     data={Array.isArray(tableData) ? tableData : []}
//                     pageSize={10}
//                     loading={isLoading}
//                 />
//             </div>

//             {/* Add/Edit Modal */}
// <Modal
//     isOpen={isModalOpen}
//     onClose={handleModalClose}
//     title={editId ? "" : ""}
//     width={"800px"}
// >
//     <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Modal Header with Gradient */}
//     <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-6 mb-4">
//       <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200 rounded-full opacity-20"></div>
//          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>

//                 <div className="relative z-10">
//                     {/* Header */}
//                     <div className="flex items-center space-x-3 mb-4">
//                         <div className="p-2 bg-white rounded-lg shadow-sm">
//                             {editId ? (
//                                 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                                         d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                 </svg>
//                             ) : (
//                                 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                                         d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//                                 </svg>
//                             )}
//                         </div>

//                         <div>
//                             <h2 className="text-2xl font-bold text-gray-800">
//                                 {editId ? "Update Member Details" : "Add New Family Member"}
//                             </h2>
//                             <p className="text-sm text-gray-600">
//                                 {editId
//                                     ? "Update the member information below"
//                                     : "Fill in the member information below"}
//                             </p>
//                         </div>
//                     </div>

       
//                 <div className="max-w-md">
//                         <div className="absolute top-1 right-6 w-20">
//                             <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center justify-end">
//                                 <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded mr-2">
//                                     Auto
//                                 </span>
//                                 Document No
//                             </label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         name="doc_No"
//                                         value={formData.doc_No}
//                                         readOnly
//                                         className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl
//                                                 p-2.5 pl-9 text-sm text-gray-700 font-medium
//                                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20
//                                                 focus:border-blue-500"
//                                     />
//                                 <div className="absolute left-3 top-1/2 -translate-y-1/2">
//                                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                                             d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                     </svg>
//                                 </div>
//                                 </div>
//                             </div>
//                       </div>
//                  </div>
//         </div>


//         {/* Form Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Doc No */}
           

//             {/* Member Name */}
//             <div className="relative group">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Member Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                     <input
//                         type="text"
//                         name="Member_name"
//                         value={formData.Member_name}
//                         onChange={handleInputChange}
//                         required
//                         placeholder="Enter full name"
//                         maxLength={100}
//                         className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
//                     />
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                         </svg>
//                     </div>
//                 </div>
//                 <div className="flex justify-between items-center mt-2">
//                     <p className="text-xs text-gray-500">Full name of the member</p>
//                     <span className="text-xs text-gray-400">{formData.Member_name.length}/100</span>
//                 </div>
//             </div>

//             {/* Mobile No */}
//             <div className="relative group">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Mobile Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
//                         <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                         </svg>
//                         <span className="text-gray-400">+91</span>
//                     </div>
//                     <input
//                         type="tel"
//                         name="Mobile_no"
//                         value={formData.Mobile_no}
//                         onChange={handleInputChange}
//                         required
//                         pattern="[0-9]{10}"
                     
//                         maxLength={10}
//                         className="w-full border-2 border-gray-200 rounded-xl p-3 pl-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
//                     />
//                 </div>
//                 <div className="flex justify-between items-center mt-2">
//                     <p className="text-xs text-gray-500">10-digit Indian mobile number</p>
//                     {formData.Mobile_no.length === 10 && (
//                         <span className="text-xs text-green-600 flex items-center">
//                             <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                             </svg>
//                             Valid format
//                         </span>
//                     )}
//                 </div>
//             </div>

//             {/* Address - Full Width */}
//             <div className="md:col-span-2 relative group">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                     <textarea
//                         name="Member_address"
//                         value={formData.Member_address}
//                         onChange={handleInputChange}
//                         required
//                         placeholder="Enter complete address "
//                         rows={3}
//                         maxLength={255}
//                         className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-none"
//                     />
//                     <div className="absolute left-3 top-3">
//                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                         </svg>
//                     </div>
//                 </div>
//                 <div className="flex justify-between items-center mt-2">
//                     <p className="text-xs text-gray-500">Complete residential or office address</p>
//                     <span className="text-xs text-gray-400">{formData.Member_address.length}/255</span>
//                 </div>
//             </div>

//             {/* Created Date - Only for Edit */}
//             {editId && (
//                 <div className="relative group">
//                     <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                         <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Created</span>
//                         Registration Date
//                     </label>
//                     <div className="relative">
//                         <input
//                             type="date"
//                             name="Created_at"
//                             value={formData.Created_at}
//                             readOnly
//                             className="w-full bg-green-50 border-2 border-green-200 rounded-xl p-3 pl-10 text-gray-700 font-medium focus:outline-none transition-all duration-200"
//                         />
//                         <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                             <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                         </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Original registration date</p>
//                 </div>
//             )}

//             {/* Other Details - Full Width */}
//             <div className="md:col-span-2 relative group">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Information
//                 </label>
//                 <div className="relative">
//                     <textarea
//                         name="other_details"
//                         value={formData.other_details}
//                         onChange={handleInputChange}
//                         placeholder="Any additional notes, medical history, or special requirements..."
//                         rows={3}
//                         maxLength={500}
//                         className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-none"
//                     />
//                     <div className="absolute left-3 top-3">
//                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                     </div>
//                 </div>
//                 <div className="flex justify-between items-center mt-2">
//                     <p className="text-xs text-gray-500">Optional information for reference</p>
//                     <span className="text-xs text-gray-400">{formData.other_details.length}/500</span>
//                 </div>
//             </div>
//         </div>

//         {/* Form Footer */}
//         <div className="pt-6 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center text-sm text-gray-600">
//                     <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
                    
//                 </div>
                
//                 <div className="flex space-x-3">
//                     <button
//                         type="button"
//                         onClick={handleModalClose}
//                         className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={isAdding || isUpdating}
//                     >
//                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                         Cancel
//                     </button>
                    
//                     <button
//                         type="submit"
//                         className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={isAdding || isUpdating}
//                     >
//                         {isAdding || isUpdating ? (
//                             <>
//                                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                                 {editId ? "Updating Member..." : "Creating Member..."}
//                             </>
//                         ) : (
//                             <>
//                                 {editId ? (
//                                     <>
//                                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                         Update Member
//                                     </>
//                                 ) : (
//                                     <>
//                                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                                         </svg>
//                                         Save Member
//                                     </>
//                                 )}
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     </form>
// </Modal>


//             {/* Delete Confirmation Modal */}
//             <Modal
//                 isOpen={showDeleteConfirmModal}
//                 onClose={() => setShowDeleteConfirmModal(false)}
//                 title="Confirm Deletion"
//             >
//                 <div className="text-center p-4">
//                     <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
//                         <XCircleIcon className="h-6 w-6 text-red-600" />
//                     </div>
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">
//                         Delete Member
//                     </h3>
//                     <p className="text-gray-600 mb-6">
//                         Are you sure you want to delete this member? This action cannot be undone.
//                     </p>

//                     <div className="flex justify-center space-x-4">
//                         <button
//                             type="button"
//                             className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                             onClick={() => setShowDeleteConfirmModal(false)}
//                             disabled={isDeleting}
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="button"
//                             className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
//                             onClick={confirmDelete}
//                             disabled={isDeleting}
//                         >
//                             {isDeleting ? (
//                                 <span className="flex items-center">
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                                     Deleting...
//                                 </span>
//                             ) : "Delete"}
//                         </button>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// }
import { useState, useEffect } from "react";
import TableUtility from "../../common/TableUtility/TableUtility";
import Modal from "../../common/Modal/Modal";
import CreateNewButton from "../../common/Buttons/AddButton";
import { 
  PencilSquareIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  HomeIcon,
  PhoneIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  HeartIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { Trash2, Eye, Download } from "lucide-react";

import {
  useGetMemberMastersQuery,
  useGetMaxMemberDocNoQuery,
  useAddMemberMasterMutation,
  useUpdateMemberMasterMutation,
  useDeleteMemberMasterMutation,
} from "../../services/medicalAppoinmentApi";

function MemberMaster() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editId, setEditId] = useState(null);
  const [userData, setUserData] = useState({
    Family_id: "",
    User_name: ""
  });

  const [formData, setFormData] = useState({
    doc_No: "",
    Member_name: "",
    Member_address: "",
    Mobile_no: "",
    other_details: "",
    Family_id: "",
    pan_no: "",
    adhar_card: "",
    insurance: "",
    blood_group: "",
    date_of_birth: "",
    Created_by: "",
    Modified_by: "",
    Created_at: new Date().toISOString().split("T")[0]
  });

  const [files, setFiles] = useState({
    pan_file: null,
    adhar_file: null,
    insurance_file: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    pan: null,
    adhar: null,
    insurance: null,
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

const familyId = sessionStorage.getItem("family_id");

const {
  data: tableData = [],
  isLoading,
  isError,
  refetch,
} = useGetMemberMastersQuery(familyId ? Number(familyId) : undefined);

  
  const { 
    data: maxDocNoData, 
    isLoading: isMaxDocLoading, 
    refetch: refetchDoc 
  } = useGetMaxMemberDocNoQuery();
  
  const [addMember, { isLoading: isAdding }] = useAddMemberMasterMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMasterMutation();
  const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberMasterMutation();

  // Blood group options
  const bloodGroups = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  ];

  // Get user data from sessionStorage
  useEffect(() => {
    const fetchUserData = () => {
      try {
        // Get Family_id and User_name from sessionStorage
        const familyId = sessionStorage.getItem("family_id");
        const userName = sessionStorage.getItem("user_name");
        
        console.log("sessionStorage data:", {
          Family_id: familyId,
          User_name: userName
        });

        const userData = {
          Family_id: familyId || "",
          User_name: userName || "System"
        };

        setUserData(userData);
        
        // Auto-fill Family_id in form if available
        if (familyId && !editId) {
          setFormData(prev => ({
            ...prev,
            Family_id: familyId,
            Created_by: userName || "System"
          }));
        }

        return userData;
      } catch (error) {
        console.error("Error getting user data from sessionStorage:", error);
        return {
          Family_id: "",
          User_name: "System"
        };
      }
    };

    fetchUserData();
  }, [editId]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Extract maxDocNo value safely
  const maxDocNo = maxDocNoData?.maxDocNo || maxDocNoData || 0;

  // Auto-generate next doc_No when adding new
  useEffect(() => {
    if (!editId && !isMaxDocLoading && isModalOpen) {
      const nextDocNo = (Number(maxDocNo) || 0) + 1;
      setFormData(prev => ({ 
        ...prev, 
        doc_No: nextDocNo.toString(),
        Family_id: userData.Family_id || "",
        Created_by: userData.User_name || "System"
      }));
    }
  }, [maxDocNo, isMaxDocLoading, editId, isModalOpen, userData]);

  const handleAddNew = async () => {
    resetForm();
    setEditId(null);

    // Get fresh data from sessionStorage
    const familyId = sessionStorage.getItem("Family_id");
    const userName = sessionStorage.getItem("User_name");
    
    console.log("Adding new member with:", {
      familyId,
      userName
    });

    // Refetch max doc no first
    try {
      await refetchDoc();
    } catch (error) {
      console.error("Error fetching max doc no:", error);
    }

    setFormData(prev => ({
      ...prev,
      Family_id: familyId || "",
      Created_by: userName || "System",
      Created_at: new Date().toISOString().split("T")[0],
    }));

    setIsModalOpen(true);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const downloadDocument = (filePath, documentType) => {
    if (!filePath) {
      showNotification(`No ${documentType} file available`, "error");
      return;
    }

    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop() || `${documentType}_document`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const columns = [
  //   { 
  //     header: "Doc No", 
  //     accessor: "doc_No",
  //     cell: (row) => row.doc_No || "-",
  //     className: "w-24"
  //   },
  //   { 
  //     header: "Name", 
  //     accessor: "Member_name",
  //     cell: (row) => row.Member_name || "-",
  //     className: "w-48"
  //   },
  //   { 
  //     header: "Mobile", 
  //     accessor: "Mobile_no",
  //     cell: (row) => row.Mobile_no || "-",
  //     className: "w-36"
  //   },
  
  //   {
  //     header: "Blood Group",
  //     accessor: "blood_group",
  //     cell: (row) => (
  //       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  //         row.blood_group ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
  //       }`}>
  //         {row.blood_group || "N/A"}
  //       </span>
  //     ),
  //     className: "w-28 text-center"
  //   },
  //   {
  //     header: "DOB",
  //     accessor: "date_of_birth",
  //     cell: (row) => row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString('en-IN') : "-",
  //     className: "w-32"
  //   },
  //   {
  //     header: "Action",
  //     accessor: "action",
  //     isAction: true,
  //     className: "text-center",
  //     actionRenderer: (row) => (
  //       <div className="flex justify-center space-x-2">
  //         <button
  //           type="button"
  //           className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
  //           onClick={() => handleViewMember(row)}
  //           title="View Details"
  //         >
  //           <Eye className="h-4 w-4" />
  //         </button>
  //         <button
  //           type="button"
  //           className="p-2 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition"
  //           onClick={() => handleEdit(row)}
  //           title="Edit Member"
  //         >
  //           <PencilSquareIcon className="h-4 w-4" />
  //         </button>
  //         <button
  //           type="button"
  //           className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
  //           onClick={() => handleDelete(row.Member_id || row.id)}
  //           title="Delete Member"
  //         >
  //           <Trash2 className="h-4 w-4" />
  //         </button>
  //       </div>
  //     ),
  //   },
  // ];

   const columns = [
  {
    header: "Doc No",
    accessor: "doc_No",
    cellRenderer: (row) => (
      <div className="font-mono font-semibold text-gray-800">
        {row.doc_No ?? "N/A"}
      </div>
    ),
  },
  {
    header: "Member Name",
    accessor: "Member_name",
    cellRenderer: (row) => (
      <div className="text-gray-800 font-medium">
        {row.Member_name ?? "N/A"}
      </div>
    ),
  },
  {
    header: "Mobile No",
    accessor: "Mobile_no",
    cellRenderer: (row) => (
      <div className="text-gray-700">
        {row.Mobile_no ?? "N/A"}
      </div>
    ),
  },
  {
    header: "Blood Group",
    accessor: "blood_group",
    cellRenderer: (row) => (
      <div className="text-gray-700">
        {row.blood_group ?? "N/A"}
      </div>
    ),
  },
  {
    header: "Date_of Birth",
    accessor: "date_of_birth",
    cellRenderer: (row) => (
      <div className="text-gray-700">
        {row.date_of_birth ?? "N/A"}
      </div>
    ),
  },
  {
    header: "Actions",
    accessor: "actions",
    isAction: true,
    className: "text-center",
    actionRenderer: (row) => (
      <div className="flex justify-center space-x-2">
        {/* View */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewMember(row);
          }}
          title="View"
          className="p-2.5 hover:bg-green-50 rounded-lg transition-all duration-200"
        >
          <Eye className="h-5 w-5 text-green-600" />
        </button>

        {/* Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
          title="Edit"
          className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200"
        >
          <PencilSquareIcon className="h-5 w-5 text-blue-600" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.Member_id || row.id);
          }}
          title="Delete"
          className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <Trash2 className="h-5 w-5 text-red-600" />
        </button>
      </div>
    ),
  },
];


      

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size should be less than 5MB", "error");
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showNotification("Only JPEG, PNG, and PDF files are allowed", "error");
      return;
    }

    setFiles(prev => ({ ...prev, [fileType]: file }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ 
          ...prev, 
          [fileType.replace('_file', '')]: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
    setFilePreviews(prev => ({ 
      ...prev, 
      [fileType.replace('_file', '')]: null 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.Member_name.trim()) {
      showNotification("Member Name is required!", "error");
      return;
    }

    if (!formData.Mobile_no.trim()) {
      showNotification("Mobile No is required!", "error");
      return;
    }

    if (!formData.Member_address.trim()) {
      showNotification("Address is required!", "error");
      return;
    }

    if (!formData.Family_id) {
      showNotification("Family ID is required!", "error");
      return;
    }

    // Get current user data from sessionStorage
    const currentUserName = sessionStorage.getItem("User_name") || "System";

    try {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      if (editId) {
        // For update, use current user as Modified_by
        submitData.append('Modified_by', currentUserName);
        await updateMember({ id: editId, ...Object.fromEntries(submitData) }).unwrap();
        showNotification("Member updated successfully!");
      } else {
        // For create, use current user as Created_by
        submitData.append('Created_by', currentUserName);
        await addMember(Object.fromEntries(submitData)).unwrap();
        showNotification("Member added successfully!");
      }

      resetForm();
      setIsModalOpen(false);
      await refetch();
    } catch (error) {
      console.error("Error saving member:", error);
      const errorMessage = error?.data?.message || 
                          error?.error || 
                          "Failed to save member. Please try again.";
      showNotification(errorMessage, "error");
    }
  };

  const handleEdit = (row) => {
    if (!row) return;
    
    // Get current user for Modified_by
    const currentUserName = sessionStorage.getItem("User_name") || "System";
    
    setFormData({
      doc_No: row.doc_No || "",
      Member_name: row.Member_name || "",
      Member_address: row.Member_address || "",
      Mobile_no: row.Mobile_no || "",
      other_details: row.other_details || "",
      Family_id: row.Family_id || "",
      pan_no: row.pan_no || "",
      adhar_card: row.adhar_card || "",
      insurance: row.insurance || "",
      blood_group: row.blood_group || "",
      date_of_birth: row.date_of_birth ? 
        new Date(row.date_of_birth).toISOString().split("T")[0] : "",
      Created_by: row.Created_by || "",
      Modified_by: currentUserName, // Set current user as Modified_by
      Created_at: row.Created_at ? 
        new Date(row.Created_at).toISOString().split("T")[0] : 
        new Date().toISOString().split("T")[0],
    });

    // Set file previews if files exist
    if (row.pan_no) setFilePreviews(prev => ({ ...prev, pan: row.pan_no }));
    if (row.adhar_card) setFilePreviews(prev => ({ ...prev, adhar: row.adhar_card }));
    if (row.insurance) setFilePreviews(prev => ({ ...prev, insurance: row.insurance }));

    setEditId(row.Member_id || row.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!id) {
      showNotification("Invalid member ID", "error");
      return;
    }
    setDeleteIdToConfirm(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteIdToConfirm) return;

    try {
      await deleteMember(deleteIdToConfirm).unwrap();
      showNotification("Member deleted successfully!");
      await refetch();
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMessage = error?.data?.message || 
                          "Failed to delete member. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setShowDeleteConfirmModal(false);
      setDeleteIdToConfirm(null);
    }
  };

  const resetForm = () => {
    // Get fresh data from sessionStorage
    const familyId = sessionStorage.getItem("Family_id");
    const userName = sessionStorage.getItem("User_name");
    
    setFormData({
      doc_No: "",
      Member_name: "",
      Member_address: "",
      Mobile_no: "",
      other_details: "",
      Family_id: familyId || "",
      pan_no: "",
      adhar_card: "",
      insurance: "",
      blood_group: "",
      date_of_birth: "",
      Created_by: userName || "System",
      Modified_by: "",
      Created_at: new Date().toISOString().split("T")[0]
    });
    setFiles({
      pan_file: null,
      adhar_file: null,
      insurance_file: null,
    });
    setFilePreviews({
      pan: null,
      adhar: null,
      insurance: null,
    });
    setEditId(null);
  };

  const handleModalClose = () => {
    resetForm();
    setIsModalOpen(false);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md text-center">
          <XCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Error loading members</h3>
          <p className="mb-4">Please try again later.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
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
          className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
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
      <div className="max-w-full">
        <TableUtility
          title="Member Master"
          headerContent={
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-4">
                <CreateNewButton 
                  onClick={handleAddNew}
                  disabled={isMaxDocLoading}
                  label={isMaxDocLoading ? "Loading..." : "Add New Family Member"}
                />
               
              </div>
            </div>
          }
          columns={columns}
          data={Array.isArray(tableData) ? tableData : []}
          pageSize={10}
          loading={isLoading}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editId ? "" : ""}
        width={"1000px"}
        maxHeight="90vh"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Modal Header with Gradient */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-6 mb-4">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200 rounded-full opacity-20"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {editId ? (
                    <PencilSquareIcon className="w-6 h-6 text-blue-600" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editId ? "Update Member Details" : "Add New Family Member"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {editId
                      ? "Update the member information below"
                      : "Fill in the member information below"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* User Info Badges */}
                <div className="flex items-center space-x-3">
                  {userData.Family_id && (
                    <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                      Family ID: {userData.Family_id}
                    </div>
                  )}
                  {userData.User_name && (
                    <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                      User: {userData.User_name}
                    </div>
                  )}
                </div>

                {/* Doc No */}
                <div className="w-20">
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
                      <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Family ID - Read Only */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HomeIcon className="w-4 h-4 mr-1 text-gray-400" />
                Family ID <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="Family_id"
                  value={formData.Family_id}
                  readOnly
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 pl-10 text-gray-700 font-medium focus:outline-none transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <HomeIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Auto-filled from your session</p>
            </div>

            {/* Member Name */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <UserCircleIcon className="w-4 h-4 mr-1 text-gray-400" />
                 Family Member Names <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="Member_name"
                  value={formData.Member_name}
                  onChange={handleInputChange}
                  
                  placeholder="Enter full name"
                  maxLength={100}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <UserCircleIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Full name of the member</p>
                <span className="text-xs text-gray-400">{formData.Member_name.length}/100</span>
              </div>
            </div>

            {/* Mobile No */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                Mobile Number <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">+91</span>
                </div>
                <input
                  type="tel"
                  name="Mobile_no"
                  value={formData.Mobile_no}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="9876543210"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">10-digit Indian mobile number</p>
                {formData.Mobile_no.length === 10 && (
                  <span className="text-xs text-green-600 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Valid format
                  </span>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-1 text-gray-400" />
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Member's date of birth</p>
            </div>

            {/* Blood Group */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HeartIcon className="w-4 h-4 mr-1 text-gray-400" />
                Blood Group
              </label>
              <div className="relative">
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <HeartIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Select blood group type</p>
            </div>

            <div className="md:col-span-2 lg:col-span-3 relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HomeIcon className="w-4 h-4 mr-1 text-gray-400" />
                Address <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  name="Member_address"
                  value={formData.Member_address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter complete address"
                  rows={2}
                  maxLength={255}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-none"
                />
                <div className="absolute left-3 top-3">
                  <HomeIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Complete residential address</p>
                <span className="text-xs text-gray-400">{formData.Member_address.length}/255</span>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Document Uploads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PAN Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <IdentificationIcon className="w-5 h-5 mr-2 text-blue-500" />
                      PAN Card
                    </label>
                    {files.pan_file && (
                      <button
                        type="button"
                        onClick={() => removeFile('pan_file')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="pan_file"
                    onChange={(e) => handleFileChange(e, 'pan_file')}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="pan_file" className="cursor-pointer block">
                    {filePreviews.pan ? (
                      <div className="flex items-center space-x-3">
                        {filePreviews.pan.startsWith('data:image') ? (
                          <img 
                            src={filePreviews.pan} 
                            alt="PAN Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                          </div>
                        )}
                        <span className="text-sm text-gray-600 truncate">
                          {files.pan_file?.name || 'Uploaded file'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="block text-sm text-gray-500">Click to upload PAN</span>
                        <span className="block text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Aadhar Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <IdentificationIcon className="w-5 h-5 mr-2 text-green-500" />
                      Aadhar Card
                    </label>
                    {files.adhar_file && (
                      <button
                        type="button"
                        onClick={() => removeFile('adhar_file')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="adhar_file"
                    onChange={(e) => handleFileChange(e, 'adhar_file')}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="adhar_file" className="cursor-pointer block">
                    {filePreviews.adhar ? (
                      <div className="flex items-center space-x-3">
                        {filePreviews.adhar.startsWith('data:image') ? (
                          <img 
                            src={filePreviews.adhar} 
                            alt="Aadhar Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-green-500" />
                          </div>
                        )}
                        <span className="text-sm text-gray-600 truncate">
                          {files.adhar_file?.name || 'Uploaded file'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-300 transition-colors">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <IdentificationIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="block text-sm text-gray-500">Click to upload Aadhar</span>
                        <span className="block text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Insurance */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <ShieldCheckIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Insurance
                    </label>
                    {files.insurance_file && (
                      <button
                        type="button"
                        onClick={() => removeFile('insurance_file')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="insurance_file"
                    onChange={(e) => handleFileChange(e, 'insurance_file')}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="insurance_file" className="cursor-pointer block">
                    {filePreviews.insurance ? (
                      <div className="flex items-center space-x-3">
                        {filePreviews.insurance.startsWith('data:image') ? (
                          <img 
                            src={filePreviews.insurance} 
                            alt="Insurance Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-purple-500" />
                          </div>
                        )}
                        <span className="text-sm text-gray-600 truncate">
                          {files.insurance_file?.name || 'Uploaded file'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-300 transition-colors">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="block text-sm text-gray-500">Click to upload Insurance</span>
                        <span className="block text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Other Details - Full Width */}
            <div className="md:col-span-2 lg:col-span-3 relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <div className="relative">
                <textarea
                  name="other_details"
                  value={formData.other_details}
                  onChange={handleInputChange}
                  placeholder="Any additional notes, medical history, or special requirements..."
                  rows={3}
                  maxLength={500}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-none"
                />
                <div className="absolute left-3 top-3">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Optional information for reference</p>
                <span className="text-xs text-gray-400">{formData.other_details.length}/500</span>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                       
              </div>
              
              <div className="flex space-x-3">
                               
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding || isUpdating}
                >
                  {isAdding || isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editId ? "Updating Member..." : "Creating Member..."}
                    </>
                  ) : (
                    <>
                      {editId ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          Update Member
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-5 h-5 mr-2" />
                          Save Member
                        </>
                      )}
                    </>
                  )}
                </button>
                 <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding || isUpdating}
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Member Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Member Details"
        width={"800px"}
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* Member Info Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMember.Member_name}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Doc No: {selectedMember.doc_No}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Family ID: {selectedMember.Family_id}
                    </span>
                    {selectedMember.blood_group && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {selectedMember.blood_group}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Created On</p>
                  <p className="font-medium text-gray-900">
                    {selectedMember.Created_at ? new Date(selectedMember.Created_at).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Mobile Number</p>
                    <p className="font-medium text-gray-900">{selectedMember.Mobile_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {selectedMember.date_of_birth ? new Date(selectedMember.date_of_birth).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HomeIcon className="w-5 h-5 mr-2 text-green-500" />
                  Address
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedMember.Member_address}</p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-500" />
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedMember.pan_no && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">PAN Card</h4>
                      <button
                        onClick={() => downloadDocument(selectedMember.pan_no, 'PAN Card')}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{selectedMember.pan_no}</p>
                  </div>
                )}

                {selectedMember.adhar_card && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Aadhar Card</h4>
                      <button
                        onClick={() => downloadDocument(selectedMember.adhar_card, 'Aadhar Card')}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{selectedMember.adhar_card}</p>
                  </div>
                )}

                {selectedMember.insurance && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Insurance</h4>
                      <button
                        onClick={() => downloadDocument(selectedMember.insurance, 'Insurance')}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{selectedMember.insurance}</p>
                  </div>
                )}

                {!selectedMember.pan_no && !selectedMember.adhar_card && !selectedMember.insurance && (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Other Details */}
            {selectedMember.other_details && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Additional Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{selectedMember.other_details}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirm Deletion"
      >
        <div className="text-center p-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Member
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this member? This action cannot be undone.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              onClick={() => setShowDeleteConfirmModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </span>
              ) : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MemberMaster;