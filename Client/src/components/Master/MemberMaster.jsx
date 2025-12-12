import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { decryptData } from "../../common/Functions/DecryptData";
import TableUtility from "../../common/TableUtility/TableUtility";
import Modal from "../../common/Modal/Modal";
import CreateNewButton from "../../common/Buttons/AddButton";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";

import {
    useGetMemberMastersQuery,
    useGetMaxMemberDocNoQuery,
    useAddMemberMasterMutation,
    useUpdateMemberMasterMutation,
    useDeleteMemberMasterMutation,
} from "../../services/medicalAppoinmentApi";

function MemberMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        doc_No: "",
        Member_name: "",
        Member_address: "",
        Mobile_no: "",
        other_details: "",
        Created_by: "",
        Modified_by: "",
        Created_at: new Date().toISOString().split("T")[0]
    });

    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

    const { 
        data: tableData = [], 
        isLoading, 
        isError, 
        refetch 
    } = useGetMemberMastersQuery();
    
    const { 
        data: maxDocNoData, 
        isLoading: isMaxDocLoading, 
        refetch: refetchDoc 
    } = useGetMaxMemberDocNoQuery();
    
    const [addMember, { isLoading: isAdding }] = useAddMemberMasterMutation();
    const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMasterMutation();
    const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberMasterMutation();

    // Get user data from cookie
    const getUserDataFromCookie = () => {
        try {
            const userDataCookie = Cookies.get("user_data");
            if (!userDataCookie) {
                console.warn("user_data cookie not found");
                return {};
            }
            const decryptedUser = decryptData(userDataCookie);
            console.log("Decrypted user_data:", decryptedUser);
            return decryptedUser || {};
        } catch (error) {
            console.error("Error decrypting user data:", error);
            return {};
        }
    };

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
                doc_No: nextDocNo.toString() 
            }));
        }
    }, [maxDocNo, isMaxDocLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        resetForm();
        setEditId(null);

        const userData = getUserDataFromCookie();
        
        // Refetch max doc no first
        try {
            await refetchDoc();
        } catch (error) {
            console.error("Error fetching max doc no:", error);
        }

        setFormData(prev => ({
            ...prev,
            Created_by: userData.User_Name || userData.username || "",
            Created_at: new Date().toISOString().split("T")[0],
        }));

        setIsModalOpen(true);
    };

    const columns = [
        { 
            header: "Doc No", 
            accessor: "doc_No",
            cell: (row) => row.doc_No || "-"
        },
        { 
            header: "Name", 
            accessor: "Member_name",
            cell: (row) => row.Member_name || "-"
        },
        { 
            header: "Address", 
            accessor: "Member_address",
            cell: (row) => row.Member_address || "-"
        },
        { 
            header: "Mobile", 
            accessor: "Mobile_no",
            cell: (row) => row.Mobile_no || "-"
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
                        className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                        onClick={() => handleEdit(row)}
                        disabled={isLoading || isAdding || isUpdating}
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
                        onClick={() => handleDelete(row.Member_id || row.id)}
                        disabled={isLoading || isDeleting}
                    >
                        <Trash2 className="h-5 w-5" />
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

        const userData = getUserDataFromCookie();
        const userName = userData.User_Name || userData.username || "System";

        try {
            if (editId) {
                const updateData = {
                    id: editId,
                    ...formData,
                    Modified_by: userName,
                    Modified_at: new Date().toISOString()
                };
                await updateMember(updateData).unwrap();
                showNotification("Member updated successfully!");
            } else {
                const addData = {
                    ...formData,
                    Created_by: userName,
                    Created_at: new Date().toISOString()
                };
                await addMember(addData).unwrap();
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
        
        setFormData({
            doc_No: row.doc_No || "",
            Member_name: row.Member_name || "",
            Member_address: row.Member_address || "",
            Mobile_no: row.Mobile_no || "",
            other_details: row.other_details || "",
            Created_by: row.Created_by || "",
            Modified_by: row.Modified_by || "",
            Created_at: row.Created_at ? 
                new Date(row.Created_at).toISOString().split("T")[0] : 
                new Date().toISOString().split("T")[0],
        });

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
        setFormData({
            doc_No: "",
            Member_name: "",
            Member_address: "",
            Mobile_no: "",
            other_details: "",
            Created_by: "",
            Modified_by: "",
            Created_at: new Date().toISOString().split("T")[0]
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
                    title="Member Master"
                    headerContent={
                        <div className="flex justify-between items-center mb-6">
                            
                            <CreateNewButton 
                                onClick={handleAddNew}
                                disabled={isMaxDocLoading}
                                label={isMaxDocLoading ? "Loading..." : "Add New Member"}
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
                title={editId ? "Edit Member" : "Add New Member"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Doc No */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Doc No *
                            </label>
                            <input
                                type="text"
                                name="doc_No"
                                value={formData.doc_No}
                                readOnly
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2.5 text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        {/* Member Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Member Name *
                            </label>
                            <input
                                type="text"
                                name="Member_name"
                                value={formData.Member_name}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter member name"
                                maxLength={100}
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="Member_address"
                                value={formData.Member_address}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter address"
                                maxLength={255}
                            />
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile No *
                            </label>
                            <input
                                type="tel"
                                name="Mobile_no"
                                value={formData.Mobile_no}
                                onChange={handleInputChange}
                                required
                                pattern="[0-9]{10}"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="10-digit mobile number"
                                maxLength={10}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
                        </div>

                        {/* Created At - Read Only */}
                        {editId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Created Date
                                </label>
                                <input
                                    type="date"
                                    name="Created_at"
                                    value={formData.Created_at}
                                    readOnly
                                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2.5 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        )}

                        {/* Other Details */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Other Details
                            </label>
                            <textarea
                                name="other_details"
                                value={formData.other_details}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Additional information"
                                rows={3}
                                maxLength={500}
                            />
                        </div>
                    </div>

                    {/* User Info (Read Only) */}
                    {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Created By: </span>
                                <span className="font-medium">{formData.Created_by || "-"}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Modified By: </span>
                                <span className="font-medium">{formData.Modified_by || "-"}</span>
                            </div>
                        </div>
                    </div> */}

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
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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