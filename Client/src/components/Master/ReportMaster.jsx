import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

import TableUtility from "../../common/TableUtility/TableUtility";
import Modal from "../../common/Modal/Modal";
import CreateNewButton from "../../common/Buttons/AddButton";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Trash2, Loader2 } from "lucide-react";
import { decryptData } from "../../common/Functions/DecryptData";
import {
    useGetReportMastersQuery,
    useGetMaxReportDocNoQuery,
    useAddReportMasterMutation,
    useUpdateReportMasterMutation,
    useDeleteReportMasterMutation,
} from "../../services/reportMasterApi";

function ReportMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        doc_No: "",
        report_name: "",
        Created_by: "",
        Modified_by: "",
        Created_at: "",
    });

    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

    // API Hooks
    const { 
        data: tableData = [], 
        isLoading, 
        isError, 
        error: fetchError,
        refetch 
    } = useGetReportMastersQuery();
    
    const { 
        data: maxDocNoData, 
        isLoading: isMaxDocLoading, 
        refetch: refetchDoc 
    } = useGetMaxReportDocNoQuery();
    
    const [addReport, { isLoading: isAdding }] = useAddReportMasterMutation();
    const [updateReport, { isLoading: isUpdating }] = useUpdateReportMasterMutation();
    const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMasterMutation();

    // Get logged-in username from decrypted cookie using the imported decryptData
    const getUserNameFromCookie = useCallback(() => {
        try {
            const encrypted = Cookies.get("user_data");
            if (!encrypted) {
                console.warn("No user_data cookie found");
                return "System";
            }
            
            const decrypted = decryptData(encrypted);
            console.log("Decrypted user_data:", decrypted);
            
            return decrypted?.User_Name || decrypted?.username || decrypted?.name || "System";
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

    // Extract maxDocNo safely
    const maxDocNo = maxDocNoData?.maxDocNo || maxDocNoData || 0;

    // Auto-generate next doc_No
    useEffect(() => {
        if (!editId && !isMaxDocLoading && isModalOpen) {
            const nextDoc = (Number(maxDocNo) || 0) + 1;
            setFormData(prev => ({ 
                ...prev, 
                doc_No: nextDoc.toString() 
            }));
        }
    }, [maxDocNo, isMaxDocLoading, editId, isModalOpen]);

    // Open modal for adding new
    const handleAddNew = async () => {
        resetForm();
        setEditId(null);
        
        const userName = getUserNameFromCookie();
        
        try {
            await refetchDoc();
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.report_name.trim()) {
            showNotification("Report Name is required!", "error");
            return;
        }
        
        try {
            const userName = getUserNameFromCookie();

            if (editId) {
                const updateData = {
                    id: editId,
                    ...formData,
                    Modified_by: userName,
                    Modified_at: new Date().toISOString()
                };
                await updateReport(updateData).unwrap();
                showNotification("Report updated successfully!");
            } else {
                const addData = {
                    ...formData,
                    Created_by: userName,
                    Created_at: new Date().toISOString()
                };
                await addReport(addData).unwrap();
                showNotification("Report added successfully!");
            }

            resetForm();
            setIsModalOpen(false);
            await refetch();
        } catch (error) {
            console.error("Error saving report:", error);
            const errorMessage = error?.data?.message || 
                                error?.error || 
                                "Failed to save report. Please try again.";
            showNotification(errorMessage, "error");
        }
    };

    const handleEdit = (row) => {
        if (!row) return;
        
        setFormData({
            doc_No: row.doc_No || "",
            report_name: row.report_name || "",
            Created_by: row.Created_by || "",
            Modified_by: row.Modified_by || "",
            Created_at: row.Created_at ? 
                new Date(row.Created_at).toISOString().split("T")[0] : 
                new Date().toISOString().split("T")[0],
        });

        setEditId(row.Report_id || row.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!id) {
            showNotification("Invalid report ID", "error");
            return;
        }
        setDeleteIdToConfirm(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteIdToConfirm) return;

        try {
            await deleteReport(deleteIdToConfirm).unwrap();
            showNotification("Report deleted successfully!");
            await refetch();
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMessage = error?.data?.message || 
                                "Failed to delete report. Please try again.";
            showNotification(errorMessage, "error");
        } finally {
            setShowDeleteConfirmModal(false);
            setDeleteIdToConfirm(null);
        }
    };

    const resetForm = () => {
        setFormData({
            doc_No: "",
            report_name: "",
            Created_by: "",
            Modified_by: "",
            Created_at: "",
        });
        setEditId(null);
    };

    const handleModalClose = () => {
        resetForm();
        setIsModalOpen(false);
    };

    const columns = [
        { 
            header: "Doc No", 
            accessor: "doc_No",
            cell: (row) => row.doc_No || "-"
        },
        { 
            header: "Report Name", 
            accessor: "report_name",
            cell: (row) => row.report_name || "-"
        },
       
        {
            header: "Action",
            accessor: "action",
            isAction: true,
            className: "text-center",
            actionRenderer: (row) => (
                <div className="flex justify-center space-x-3">
                    <button
                        type="button"
                        className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleEdit(row)}
                        disabled={isLoading || isAdding || isUpdating}
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDelete(row.Report_id || row.id)}
                        disabled={isLoading || isDeleting}
                        title="Delete"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading reports...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md text-center">
                    <XCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
                    <p className="mb-4">
                        {fetchError?.data?.message || 
                         fetchError?.error || 
                         "Failed to load reports. Please try again."}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Retry
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
            <div className="max-w-full mx-auto">
                <TableUtility
                    title="Report Master"
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
                    data={Array.isArray(tableData) ? tableData : []}
                    pageSize={10}
                    loading={isLoading}
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                title={editId ? "Edit Report" : "Add New Report"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Doc No */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Doc No
                            </label>
                            <input 
                                type="text"
                                name="doc_No"
                                value={formData.doc_No}
                                readOnly
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2.5 text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        {/* Report Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Report Name *
                            </label>
                            <input 
                                type="text"
                                name="report_name"
                                value={formData.report_name}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter report name"
                                maxLength={100}
                            />
                        </div>

                        {/* Created By */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created By
                            </label>
                            <input 
                                type="text"
                                name="Created_by"
                                value={formData.Created_by}
                                readOnly
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2.5 text-gray-600 cursor-not-allowed"
                            />
                        </div> */}

                        {/* Modified By */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Modified By
                            </label>
                            <input 
                                type="text"
                                name="Modified_by"
                                value={formData.Modified_by}
                                readOnly
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2.5 text-gray-600 cursor-not-allowed"
                            />
                        </div> */}

                        {/* Created At */}
                        {/* <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created At {editId ? "" : "(auto-generated)"}
                            </label>
                            <input 
                                type="date"
                                name="Created_at"
                                value={formData.Created_at}
                                onChange={handleInputChange}
                                readOnly={!editId}
                                className={`w-full border border-gray-300 rounded-lg p-2.5 ${
                                    !editId ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                }`}
                            />
                        </div> */}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleModalClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            disabled={isAdding || isUpdating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isAdding || isUpdating}
                        >
                            {isAdding || isUpdating ? (
                                <span className="flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {editId ? "Updating..." : "Saving..."}
                                </span>
                            ) : (
                                editId ? "Update" : "Save"
                            )}
                        </button>
                    </div>
                </form>
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
                        Delete Report
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete this report? This action cannot be undone.
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
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
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

export default ReportMaster;