import { useState, useEffect, useCallback } from "react";
import TableUtility from "../../common/TableUtility/TableUtility";
import Modal from "../../common/Modal/Modal";
import CreateNewButton from "../../common/Buttons/AddButton";
import { 
  PencilSquareIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { Trash2, Loader2, Save, Eye, FileText, User, History } from "lucide-react";

import {
    useGetReportMastersQuery,
    useGetMaxReportDocNoQuery,
    useAddReportMasterMutation,
    useUpdateReportMasterMutation,
    useDeleteReportMasterMutation,
} from "../../services/reportMasterApi";

function ReportMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
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

    // Get username from sessionStorage
    const getUserNameFromStorage = () => {
        try {
            const userName = sessionStorage.getItem("user_name");
            return userName || "System";
        } catch (error) {
            console.error("Error getting user name from sessionStorage:", error);
            return "System";
        }
    };

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
            const userName = getUserNameFromStorage();
            
            setFormData(prev => ({ 
                ...prev, 
                doc_No: nextDoc.toString(),
                Created_by: userName,
                Created_at: new Date().toISOString().split("T")[0]
            }));
        }
    }, [maxDocNo, isMaxDocLoading, editId, isModalOpen]);

    // Open modal for adding new
    const handleAddNew = async () => {
        resetForm();
        setEditId(null);
        
        try {
            await refetchDoc();
        } catch (error) {
            console.error("Error fetching max doc no:", error);
            showNotification("Failed to generate document number", "error");
            return;
        }
        
        setIsModalOpen(true);
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setIsViewModalOpen(true);
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
            const userName = getUserNameFromStorage();
            const currentDate = new Date().toISOString();

            if (editId) {
                const updateData = {
                    id: editId,
                    ...formData,
                    Modified_by: userName,
                    Modified_at: currentDate
                };
                await updateReport(updateData).unwrap();
                showNotification("Report updated successfully!");
            } else {
                const addData = {
                    ...formData,
                    Created_by: userName,
                    Created_at: currentDate
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
        
        const userName = getUserNameFromStorage();
        
        setFormData({
            doc_No: row.doc_No || "",
            report_name: row.report_name || "",
            Created_by: row.Created_by || "",
            Modified_by: userName, // Set current user as Modified_by
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
            cell: (row) => (
                <div className="font-mono font-semibold text-blue-700">
                    {row.doc_No || "N/A"}
                </div>
            )
        },
        { 
            header: "Report Name", 
            accessor: "report_name",
            cell: (row) => (
                <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-800">{row.report_name || "N/A"}</span>
                </div>
            )
        },
        {
            header: "Created By",
            accessor: "Created_by",
            cell: (row) => (
                <div className="flex items-center text-gray-700">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {row.Created_by || "System"}
                </div>
            )
        },
        {
            header: "Created Date",
            accessor: "Created_at",
            cell: (row) => (
                <div className="flex items-center text-gray-700">
                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {row.Created_at ? new Date(row.Created_at).toLocaleDateString('en-IN') : "N/A"}
                </div>
            )
        },
        {
            header: "Actions",
            accessor: "action",
            isAction: true,
            actionRenderer: (row) => (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => handleViewReport(row)}
                        className="p-2.5 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="View Details"
                    >
                        <Eye className="h-5 w-5 text-green-600" />
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit Report"
                        disabled={isLoading || isAdding || isUpdating}
                    >
                        <PencilSquareIcon className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.Report_id || row.id)}
                        className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Report"
                        disabled={isLoading || isDeleting}
                    >
                        <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
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
                    title="Report Master"
                    headerContent={
                        <div className="flex justify-between items-center mb-1">
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
                width={"800px"}
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
                                        <FileText className="w-6 h-6 text-green-600" />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {editId ? "Update Report Details" : "Add New Report"}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {editId
                                            ? "Update the report information below"
                                            : "Fill in the report information below"}
                                    </p>
                                </div>
                            </div>

                            {/* Doc No and Created By */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                                        User: {getUserNameFromStorage()}
                                    </div>
                                </div>

                                {/* Doc No */}
                                <div className="w-32">
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
                                                    p-2.5 pl-10 text-sm text-gray-700 font-medium
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Report Name */}
                        <div className="relative group md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-1 text-gray-400" />
                                Report Name <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="report_name"
                                    value={formData.report_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                                    placeholder="Enter report name"
                                    maxLength={100}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">Enter a descriptive report name</p>
                                <span className="text-xs text-gray-400">{formData.report_name.length}/100</span>
                            </div>
                        </div>

                        {/* Created By */}
                        {/* <div className="relative group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <User className="w-4 h-4 mr-1 text-gray-400" />
                                Created By
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="Created_by"
                                    value={formData.Created_by}
                                    readOnly
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 pl-10 text-gray-700 font-medium focus:outline-none transition-all duration-200"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">User who created this report</p>
                        </div> */}

                        {/* Modified By (Only for Edit) */}
                        {editId && (
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <History className="w-4 h-4 mr-1 text-gray-400" />
                                    Modified By
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="Modified_by"
                                        value={formData.Modified_by}
                                        readOnly
                                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 pl-10 text-gray-700 font-medium focus:outline-none transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <History className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">User who last modified</p>
                            </div>
                        )}

                        {/* Created Date */}
                        {editId && (
                            <div className="relative group md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <CalendarDaysIcon className="w-4 h-4 mr-1 text-green-500" />
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                                        Created
                                    </span>
                                    Creation Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="Created_at"
                                        value={formData.Created_at}
                                        readOnly
                                        className="w-full bg-green-50 border-2 border-green-200 rounded-xl p-3 pl-10 text-gray-700 font-medium focus:outline-none transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <CalendarDaysIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Original creation date</p>
                            </div>
                        )}
                    </div>

                    {/* Form Footer */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="flex items-center">
                                    
                                </div>
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
                                            {editId ? "Updating..." : "Saving..."}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            {editId ? "Update Report" : "Save Report"}
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

            {/* View Report Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Report Details"
                width={"800px"}
            >
                {selectedReport && (
                    <div className="space-y-6">
                        {/* Report Info Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <FileText className="h-8 w-8 text-blue-600 mr-3" />
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedReport.report_name}</h2>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            Doc No: {selectedReport.doc_No}
                                        </span>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            ID: {selectedReport.Report_id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-500" />
                                    User Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Created By</p>
                                        <div className="flex items-center mt-1">
                                            <User className="h-4 w-4 text-gray-400 mr-2" />
                                            <p className="font-medium text-gray-900">{selectedReport.Created_by || 'System'}</p>
                                        </div>
                                    </div>
                                    {selectedReport.Modified_by && (
                                        <div>
                                            <p className="text-sm text-gray-600">Last Modified By</p>
                                            <div className="flex items-center mt-1">
                                                <History className="h-4 w-4 text-gray-400 mr-2" />
                                                <p className="font-medium text-gray-900">{selectedReport.Modified_by}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-green-500" />
                                    Timeline
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Created Date</p>
                                        <div className="flex items-center mt-1">
                                            <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            <p className="font-medium text-gray-900">
                                                {selectedReport.Created_at ? new Date(selectedReport.Created_at).toLocaleDateString('en-IN') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedReport.Modified_at && (
                                        <div>
                                            <p className="text-sm text-gray-600">Last Modified</p>
                                            <div className="flex items-center mt-1">
                                                <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <p className="font-medium text-gray-900">
                                                    {new Date(selectedReport.Modified_at).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

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

export default ReportMaster;