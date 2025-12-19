import { useState, useEffect, useRef } from 'react';
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from '../common/Modal/Modal';
import CreateNewButton from "../common/Buttons/AddButton";
import { 
  PencilSquareIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Trash2, Plus, X, User, FileText, ChevronRight, Calendar, Download, Eye } from 'lucide-react';
import {
  useGetMemberReportsByFamilyQuery,
  useCreateMemberReportMutation,
  useUpdateMemberReportMutation,
  useDeleteMemberReportMutation,
  useLazyDownloadReportFileQuery,
  useLazyPreviewReportFileQuery
} from '../services/memberReportAPI';

import {
  useGetReportMastersQuery
} from '../services/reportMasterApi';
import { useGetMemberMastersQuery } from "../services/medicalAppoinmentApi";

function MemberReport() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        Member_id: '',
        Family_id: sessionStorage.getItem('family_id') || '',
        purpose: '',
        remarks: '',
        Created_by: sessionStorage.getItem('user_name') || '',
        details: []
    });
    const [editId, setEditId] = useState(null);
    const [files, setFiles] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);
    const [selectedMemberName, setSelectedMemberName] = useState('');
    const [selectedReportNames, setSelectedReportNames] = useState({});
    const [deletedDetails, setDeletedDetails] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const detailRefs = useRef({});
    
    // Fetch all data
    const familyId = sessionStorage.getItem('family_id');
    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetMemberReportsByFamilyQuery(familyId);
    const { data: memberData = [], isLoading: isMemberLoading } = useGetMemberMastersQuery(familyId);
    const { data: reportData = [], isLoading: isReportLoading } = useGetReportMastersQuery();
    
    // Mutations
    const [createMemberReport] = useCreateMemberReportMutation();
    const [updateMemberReport] = useUpdateMemberReportMutation();
    const [deleteMemberReport] = useDeleteMemberReportMutation();
    const [triggerDownload] = useLazyDownloadReportFileQuery();
    const [triggerPreview] = useLazyPreviewReportFileQuery();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    // Function to extract just the filename (UUID) from path
    const getFileNameFromPath = (filePath) => {
        if (!filePath) return '';
        
        // If it's already just a filename (UUID with extension), return it
        if (filePath.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.[a-zA-Z0-9]+$/)) {
            return filePath;
        }
        
        // Extract the basename (filename) from path
        const pathParts = filePath.split(/[\\/]/);
        return pathParts.pop() || '';
    };

    // Function to extract extension for display
    const getFileExtension = (fileName) => {
        if (!fileName) return '';
        const parts = fileName.split('.');
        return parts.length > 1 ? parts.pop().toUpperCase() : '';
    };

    // Function to get file icon based on extension
    const getFileIcon = (fileName) => {
        const ext = getFileExtension(fileName).toLowerCase();
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
        return '📎';
    };

    // Find member name when Member_id changes
    useEffect(() => {
        if (formData.Member_id && memberData.length > 0) {
            const member = memberData.find(m => m.Member_id === parseInt(formData.Member_id));
            setSelectedMemberName(member ? `${member.Member_name} - ${member.Mobile_no}` : '');
        } else {
            setSelectedMemberName('');
        }
    }, [formData.Member_id, memberData]);

    // Find report names when details change
    useEffect(() => {
        if (formData.details.length > 0 && reportData.length > 0) {
            const newSelectedReportNames = {};
            formData.details.forEach((detail, index) => {
                if (detail.Report_id && detail.row_action !== 'delete') {
                    const report = reportData.find(r => r.Report_id === parseInt(detail.Report_id));
                    newSelectedReportNames[index] = report ? report.report_name : '';
                }
            });
            setSelectedReportNames(newSelectedReportNames);
        }
    }, [formData.details, reportData]);

    // Reset expanded rows when modal opens/closes
    useEffect(() => {
        if (!isModalOpen) {
            setExpandedRows({});
        }
    }, [isModalOpen]);

    const handleAddNew = () => {
        const userName = sessionStorage.getItem('user_name') || '';
        
        setFormData({
            Member_id: '',
            Family_id: sessionStorage.getItem('family_id') || '',
            purpose: '',
            remarks: '',
            Created_by: userName,
            details: []
        });
        setEditId(null);
        setFiles({});
        setDeletedDetails([]);
        setExpandedRows({});
        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
        const userName = sessionStorage.getItem('user_name') || '';
        
        // Create a unique file key for each detail to avoid conflicts
        const detailsWithUniqueKeys = (row.details || []).map((d, idx) => ({
            detail_id: d.detail_id,
            report_date: d.report_date || '',
            Report_id: d.Report_id?.toString() || '',
            Doctor_and_Hospital_name: d.Doctor_and_Hospital_name || '',
            uploaded_file_report: d.uploaded_file_report || '',
            file_key: d.detail_id ? `existing_${d.detail_id}` : `temp_${Date.now()}_${idx}`,
            row_action: 'update'
        }));
        
        setFormData({
            Member_id: row.Member_id?.toString() || '',
            Family_id: sessionStorage.getItem('family_id') || row.Family_id?.toString() || '',
            purpose: row.purpose || '',
            remarks: row.remarks || '',
            Created_by: userName,
            details: detailsWithUniqueKeys
        });
        setEditId(row.MemberReport_id);
        setFiles({});
        setDeletedDetails([]);
        setExpandedRows({});
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteIdToConfirm(id);
        setShowDeleteConfirmModal(true);
    };

    // Preview function - sends only filename
    const handlePreview = async (filePath) => {
        if (!filePath) {
            showNotification('No file to preview', 'error');
            return;
        }
        
        const fileName = getFileNameFromPath(filePath);
        
        if (!fileName) {
            showNotification('Invalid file path', 'error');
            return;
        }
        
        try {
            setIsLoading(true);
            const fileExt = getFileExtension(fileName);
            showNotification(`Opening ${fileExt} preview...`, 'info');
            
            // Use just the filename (UUID with extension)
            const previewUrl = `http://localhost:8000/member-report/preview/${encodeURIComponent(fileName)}`;
            window.open(previewUrl, '_blank');
            
            showNotification('Preview opened successfully!');
        } catch (error) {
            console.error('Failed to preview file:', error);
            showNotification('Failed to preview file. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Download function - sends only filename
    const handleDownload = async (filePath, reportName = '') => {
        if (!filePath) {
            showNotification('No file to download', 'error');
            return;
        }

        const fileName = getFileNameFromPath(filePath);
        
        if (!fileName) {
            showNotification('Invalid file path', 'error');
            return;
        }

        try {
            setIsLoading(true);
            const fileExt = getFileExtension(fileName);
            showNotification(`Downloading ${fileExt} file...`, 'info');
            
            // Use just the filename (UUID with extension)
            const downloadUrl = `http://localhost:8000/member-report/download/${encodeURIComponent(fileName)}`;
            
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            link.setAttribute('target', '_blank');
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Download started!');
        } catch (error) {
            console.error('Download failed:', error);
            showNotification('Failed to download file. Please try again.', 'error');
            
            // Fallback: Open the URL directly
            try {
                window.open(`http://localhost:8000/member-report/download/${encodeURIComponent(fileName)}`, '_blank');
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle row expansion
    const toggleRowExpansion = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Handle arrow key navigation
    const handleKeyDown = (e, index) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = index + 1;
            if (nextIndex < formData.details.length) {
                setExpandedRows(prev => ({
                    ...prev,
                    [nextIndex]: true
                }));
                // Scroll to next element
                setTimeout(() => {
                    if (detailRefs.current[nextIndex]) {
                        detailRefs.current[nextIndex].scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest' 
                        });
                    }
                }, 100);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = index - 1;
            if (prevIndex >= 0) {
                setExpandedRows(prev => ({
                    ...prev,
                    [prevIndex]: true
                }));
                // Scroll to previous element
                setTimeout(() => {
                    if (detailRefs.current[prevIndex]) {
                        detailRefs.current[prevIndex].scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest' 
                        });
                    }
                }, 100);
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleRowExpansion(index);
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteMemberReport(deleteIdToConfirm).unwrap();
            showNotification('Report deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Failed to delete report:', error);
            showNotification('Failed to delete report!', 'error');
        } finally {
            setShowDeleteConfirmModal(false);
            setDeleteIdToConfirm(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...formData.details];
        const detail = newDetails[index];
        
        if (!detail.row_action && detail.detail_id) {
            detail.row_action = 'update';
        }
        
        detail[field] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
        
        if (field === 'Report_id' && reportData.length > 0) {
            const report = reportData.find(r => r.Report_id === parseInt(value));
            setSelectedReportNames(prev => ({
                ...prev,
                [index]: report ? report.report_name : ''
            }));
        }
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const detail = formData.details[index];
        const fileKey = detail.file_key || `file_${Date.now()}_${index}`;
        
        // Update the detail with the file key
        const newDetails = [...formData.details];
        newDetails[index].file_key = fileKey;
        setFormData(prev => ({ ...prev, details: newDetails }));
        
        // Update files state
        setFiles(prev => ({ 
            ...prev, 
            [fileKey]: file 
        }));
    };

    // Add new detail row at the BEGINNING with unique file key
    const handleAddDetailRow = () => {
        const uniqueFileKey = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newDetail = {
            report_date: new Date().toISOString().split("T")[0],
            Report_id: '',
            Doctor_and_Hospital_name: '',
            file_key: uniqueFileKey,
            row_action: 'add'
        };
        
        // Shift all existing indices in expandedRows and selectedReportNames
        const newExpandedRows = {};
        const newSelectedReportNames = {};
        
        Object.keys(expandedRows).forEach(key => {
            const keyNum = parseInt(key);
            newExpandedRows[keyNum + 1] = expandedRows[key];
        });
        
        Object.keys(selectedReportNames).forEach(key => {
            const keyNum = parseInt(key);
            newSelectedReportNames[keyNum + 1] = selectedReportNames[key];
        });
        
        setFormData(prev => ({
            ...prev,
            details: [newDetail, ...prev.details]
        }));
        
        // Set expanded state for the new row at index 0
        newExpandedRows[0] = true;
        setExpandedRows(newExpandedRows);
        setSelectedReportNames(newSelectedReportNames);
    };

    const handleRemoveDetailRow = (index) => {
        const detailToRemove = formData.details[index];
        
        if (detailToRemove.row_action === 'add') {
            // Remove newly added detail
            const newDetails = [...formData.details];
            newDetails.splice(index, 1);
            setFormData(prev => ({ ...prev, details: newDetails }));
            
            // Remove associated file
            if (detailToRemove.file_key) {
                setFiles(prev => {
                    const newFiles = { ...prev };
                    delete newFiles[detailToRemove.file_key];
                    return newFiles;
                });
            }
            
            // Shift indices for expandedRows and selectedReportNames
            const newExpandedRows = {};
            const newSelectedReportNames = {};
            
            Object.keys(expandedRows).forEach(key => {
                const keyNum = parseInt(key);
                if (keyNum > index) {
                    newExpandedRows[keyNum - 1] = expandedRows[key];
                } else if (keyNum < index) {
                    newExpandedRows[keyNum] = expandedRows[key];
                }
            });
            
            Object.keys(selectedReportNames).forEach(key => {
                const keyNum = parseInt(key);
                if (keyNum > index) {
                    newSelectedReportNames[keyNum - 1] = selectedReportNames[key];
                } else if (keyNum < index) {
                    newSelectedReportNames[keyNum] = selectedReportNames[key];
                }
            });
            
            setExpandedRows(newExpandedRows);
            setSelectedReportNames(newSelectedReportNames);
        } else if (detailToRemove.detail_id) {
            // Mark existing detail for deletion
            const newDetails = [...formData.details];
            newDetails[index].row_action = 'delete';
            setFormData(prev => ({ ...prev, details: newDetails }));
            
            setDeletedDetails(prev => [...prev, detailToRemove.detail_id]);
        }
    };

    const handleRestoreDetail = (detailId) => {
        const newDetails = [...formData.details];
        const detailIndex = newDetails.findIndex(d => d.detail_id === detailId);
        if (detailIndex !== -1) {
            newDetails[detailIndex].row_action = 'update';
            setFormData(prev => ({ ...prev, details: newDetails }));
            
            setDeletedDetails(prev => prev.filter(id => id !== detailId));
        }
    };

    const getActiveDetails = () => {
        return formData.details.filter(detail => detail.row_action !== 'delete');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        setIsLoading(true);
        
        // Prepare payload according to backend structure
        const payload = {
            Member_id: parseInt(formData.Member_id),
            Family_id: parseInt(formData.Family_id),
            purpose: formData.purpose,
            remarks: formData.remarks || '',
            Created_by: formData.Created_by,
            details: formData.details.map(detail => {
                const detailObj = {
                    report_date: detail.report_date,
                    Report_id: parseInt(detail.Report_id),
                    Doctor_and_Hospital_name: detail.Doctor_and_Hospital_name || '',
                    row_action: detail.row_action || (detail.detail_id ? 'update' : 'add')
                };
                
                if (detail.file_key) {
                    detailObj.file_key = detail.file_key;
                }
                
                return detailObj;
            })
        };

        if (editId) {
            // UPDATE: Use head and details structure
            const updatePayload = {
                head: {
                    Member_id: parseInt(formData.Member_id),
                    Family_id: parseInt(formData.Family_id),
                    purpose: formData.purpose,
                    remarks: formData.remarks || '',
                    Created_by: formData.Created_by,
                    Modified_by: sessionStorage.getItem('user_name') || ''
                },
                details: formData.details.map(detail => {
                    const detailObj = {
                        report_date: detail.report_date,
                        Report_id: parseInt(detail.Report_id),
                        Doctor_and_Hospital_name: detail.Doctor_and_Hospital_name || '',
                        row_action: detail.row_action || (detail.detail_id ? 'update' : 'add')
                    };
                    
                    if (detail.detail_id) {
                        detailObj.detail_id = detail.detail_id;
                    }
                    
                    if (detail.file_key) {
                        detailObj.file_key = detail.file_key;
                    }
                    
                    return detailObj;
                })
            };
            
            await updateMemberReport({ 
                MemberReport_id: editId, 
                payload: updatePayload, 
                files 
            }).unwrap();
            showNotification('Report updated successfully!');
        } else {
            // CREATE: Use simple payload structure
            await createMemberReport({ 
                payload: payload, 
                files 
            }).unwrap();
            showNotification('Report created successfully!');
        }
        
        setIsModalOpen(false);
        refetch();
    } catch (error) {
        console.error('Failed to save report:', error);
        const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to save report!';
        showNotification(errorMessage, 'error');
    } finally {
        setIsLoading(false);
    }
};


    const activeDetails = getActiveDetails();

    const columns = [
        { 
            header: 'Doc No', 
            accessor: 'doc_No',
            cellRenderer: (row) => (
                <div className="font-mono font-semibold text-gray-800">
                    {row.doc_No || "N/A"}
                </div>
            )
        },
        { 
            header: 'Member Name', 
            accessor: 'Member_name',
            cellRenderer: (row) => (
                <div className="text-gray-800">{row.Member_name || "N/A"}</div>
            )
        },
        { 
            header: 'Purpose', 
            accessor: 'purpose',
            cellRenderer: (row) => (
                <div className="max-w-xs truncate" title={row.purpose}>
                    {row.purpose || "N/A"}
                </div>
            )
        },
        { 
            header: 'Remarks', 
            accessor: 'remarks',
            cellRenderer: (row) => (
                <div className="max-w-xs truncate" title={row.remarks}>
                    {row.remarks || "N/A"}
                </div>
            )
        },
        {
            header: 'Created Date',
            accessor: 'Created_at',
            cellRenderer: (row) => (
                <div className="text-gray-600">
                    {row.Created_at ? new Date(row.Created_at).toLocaleDateString() : "N/A"}
                </div>
            )
        },
        {
            header: 'Files',
            accessor: 'files',
            cellRenderer: (row) => {
                const hasFiles = row.details?.some(d => d.uploaded_file_report);
                if (!hasFiles) return <span className="text-gray-400">No files</span>;
                
                return (
                    <div className="flex flex-wrap gap-2">
                        {row.details?.map((detail, idx) => {
                            if (!detail.uploaded_file_report) return null;
                            
                            const fileName = getFileNameFromPath(detail.uploaded_file_report);
                            const fileIcon = getFileIcon(fileName);
                            const fileExt = getFileExtension(fileName);
                            const displayName = `${fileExt} File`;
                            
                            return (
                                <div key={idx} className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                                    <span className="text-lg">{fileIcon}</span>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreview(detail.uploaded_file_report);
                                            }}
                                            title={`Preview ${fileExt} file`}
                                            className="p-1.5 hover:bg-blue-200 rounded transition-colors"
                                        >
                                            <Eye className="h-4 w-4 text-blue-700" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(detail.uploaded_file_report, displayName);
                                            }}
                                            title={`Download ${fileExt} file`}
                                            className="p-1.5 hover:bg-green-200 rounded transition-colors"
                                        >
                                            <Download className="h-4 w-4 text-green-700" />
                                        </button>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">
                                        {displayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            accessor: 'actions',
            isAction: true,
            className: 'text-center',
            actionRenderer: (row) => (
                <div className="flex justify-center space-x-2">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }} 
                        title="Edit" 
                        className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105 group"
                    >
                        <PencilSquareIcon className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.MemberReport_id);
                        }} 
                        title="Delete" 
                        className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 group"
                    >
                        <Trash2 className="h-5 w-5 text-red-600 group-hover:text-red-800" />
                    </button>
                </div>
            )
        }
    ];

    if (isTableLoading) return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait while we fetch your data</p>
            </div>
        </div>
    );
    
    if (isError) return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-red-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md">
                <XCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Reports</h3>
                <p className="text-gray-600 mb-6">There was a problem loading the reports. Please try again.</p>
                <button 
                    onClick={() => refetch()} 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    Retry Loading
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {notification.show && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 animate-slide-in ${notification.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'}`}>
                    <div className="flex items-center">
                        {notification.type === 'success' ? 
                            <CheckCircleIcon className="h-6 w-6 mr-3 text-green-600" /> : 
                            <XCircleIcon className="h-6 w-6 mr-3 text-red-600" />
                        }
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-full">
                <TableUtility
                    title={
                        <div className="flex items-center space-x-3">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Member Reports</h1>
                            </div>
                        </div>
                    }
                    headerContent={
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <CreateNewButton
                                onClick={handleAddNew}
                                label={
                                    <div className="flex items-center space-x-2">
                                        <Plus className="h-5 w-5" />
                                        <span>Add New Report</span>
                                    </div>
                                }
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                            />
                        </div>
                    }
                    columns={columns}
                    data={Array.isArray(tableData) ? tableData : []}
                    pageSize={10}
                    searchable={true}
                    exportable={true}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${editId ? 'bg-yellow-100' : 'bg-green-100'}`}>
                            {editId ? (
                                <PencilSquareIcon className="h-6 w-6 text-yellow-600" />
                            ) : (
                                <Plus className="h-6 w-6 text-green-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {editId ? 'Edit Report' : 'Create New Report'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {editId ? 'Update existing report details' : 'Add a new medical report'}
                            </p>
                        </div>
                    </div>
                } 
                width={"1200px"}
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Family ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-500" />
                                    Family ID
                                </label>
                                <input 
                                    type="text" 
                                    name="Family_id" 
                                    value={formData.Family_id} 
                                    readOnly 
                                    disabled
                                    className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-not-allowed font-semibold text-blue-700"
                                />
                            </div>

                            {/* Member Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-blue-500" />
                                    Select Member <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        name="Member_id" 
                                        value={formData.Member_id} 
                                        onChange={handleInputChange} 
                                        required 
                                        disabled={editId}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none pr-10 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-600"
                                    >
                                        <option value="" className="text-gray-400">Select a member</option>
                                        {isMemberLoading ? (
                                            <option value="" disabled>Loading members...</option>
                                        ) : (
                                            memberData.map((member) => (
                                                <option key={member.Member_id} value={member.Member_id} className="py-2">
                                                    {member.Member_name} - {member.Mobile_no}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {selectedMemberName && (
                                    <p className="mt-2 text-sm text-green-600 font-medium">
                                        {selectedMemberName}
                                    </p>
                                )}
                            </div>

                            {/* Purpose */}
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        Purpose <span className="text-red-500 ml-1">*</span>
                                    </span>
                                </label>
                                <input 
                                    type="text" 
                                    name="purpose" 
                                    value={formData.purpose} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g., Annual Checkup"
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                                />
                            </div>

                            {/* Remarks */}
                            <div className="lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        Remarks
                                    </span>
                                </label>
                                <textarea 
                                    name="remarks" 
                                    value={formData.remarks} 
                                    onChange={handleInputChange} 
                                    rows="2" 
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                                    placeholder="Additional notes, observations, or comments about this report..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            
                            <button 
                                type="button" 
                                onClick={handleAddDetailRow} 
                                className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <Plus className="h-5 w-5" /> 
                                <span>Add Detail</span>
                            </button>
                        </div>

                        {/* Deleted Details Notice */}
                        {deletedDetails.length > 0 && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <Trash2 className="h-5 w-5 text-red-500 mr-3" />
                                        <div>
                                            <p className="font-medium text-red-700">
                                                {deletedDetails.length} detail{deletedDetails.length > 1 ? 's' : ''} marked for deletion
                                            </p>
                                            <p className="text-sm text-red-600 mt-1">
                                                These will be removed when you save changes
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newDetails = [...formData.details];
                                            newDetails.forEach(detail => {
                                                if (detail.row_action === 'delete') {
                                                    detail.row_action = 'update';
                                                }
                                            });
                                            setFormData(prev => ({ ...prev, details: newDetails }));
                                            setDeletedDetails([]);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        Restore All
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeDetails.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                <FileText className="h-14 w-14 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 font-medium">No report details added yet</p>
                                <p className="text-sm text-gray-500 mt-1">Click "Add Detail" to start adding reports</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeDetails.map((detail, index) => {
                                    const isExpanded = expandedRows[index] || false;
                                    const reportName = selectedReportNames[index] || `Report ${activeDetails.length - index}`;
                                    const fileName = detail.uploaded_file_report ? getFileNameFromPath(detail.uploaded_file_report) : '';
                                    const fileIcon = getFileIcon(fileName);
                                    const fileExt = getFileExtension(fileName);
                                    
                                    return (
                                        <div 
                                            key={detail.detail_id ? `detail_${detail.detail_id}` : `new_${detail.file_key}`}
                                            ref={el => detailRefs.current[index] = el}
                                            className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300"
                                        >
                                            {/* Collapsible Header */}
                                            <div 
                                                className="p-4 cursor-pointer hover:bg-gray-50 rounded-t-xl transition-colors"
                                                onClick={() => toggleRowExpansion(index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                tabIndex={0}
                                                role="button"
                                                aria-expanded={isExpanded}
                                                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} report detail ${index + 1}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-lg ${detail.detail_id ? 'bg-yellow-100' : 'bg-green-100'}`}>
                                                            {detail.detail_id ? (
                                                                <FileText className="h-5 w-5 text-yellow-600" />
                                                            ) : (
                                                                <Plus className="h-5 w-5 text-green-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-semibold text-gray-800">{reportName}</span>
                                                                {detail.detail_id ? (
                                                                    <span className="px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                                        Existing
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                                                <span>{detail.report_date || 'No date selected'}</span>
                                                                {fileName && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center space-x-1">
                                                                            <span>{fileIcon}</span>
                                                                            <span>{fileExt} File</span>
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {detail.uploaded_file_report && !files[detail.file_key] && (
                                                            <div className="flex space-x-1">
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePreview(detail.uploaded_file_report);
                                                                    }}
                                                                    title="Preview File"
                                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                                                >
                                                                    <EyeIcon className="h-4 w-4 text-blue-600 group-hover:text-blue-800" />
                                                                </button>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(detail.uploaded_file_report, reportName);
                                                                    }}
                                                                    title="Download File"
                                                                    className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                                                                >
                                                                    <DocumentArrowDownIcon className="h-4 w-4 text-green-600 group-hover:text-green-800" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveDetailRow(index);
                                                            }} 
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                                        >
                                                            <X className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                                                        </button>
                                                        <div className="flex flex-col items-center">
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (index > 0) {
                                                                        handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} }, index);
                                                                    }
                                                                }}
                                                                disabled={index === 0}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                title="Navigate up"
                                                            >
                                                                <ChevronUpIcon className="h-3 w-3 text-gray-500" />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (index < activeDetails.length - 1) {
                                                                        handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} }, index);
                                                                    }
                                                                }}
                                                                disabled={index === activeDetails.length - 1}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                title="Navigate down"
                                                            >
                                                                <ChevronDownIcon className="h-3 w-3 text-gray-500" />
                                                            </button>
                                                        </div>
                                                        <div className="text-gray-400">
                                                            {isExpanded ? (
                                                                <ChevronUpIcon className="h-5 w-5" />
                                                            ) : (
                                                                <ChevronDownIcon className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Expandable Content */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {/* Report Date */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                                                Report Date <span className="text-red-500 ml-1">*</span>
                                                            </label>
                                                            <input 
                                                                type="date" 
                                                                value={detail.report_date} 
                                                                onChange={(e) => handleDetailChange(index, 'report_date', e.target.value)} 
                                                                required 
                                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300" 
                                                            />
                                                        </div>
                                                        
                                                        {/* Report Type */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                                Report Type <span className="text-red-500 ml-1">*</span>
                                                            </label>
                                                            <div className="relative">
                                                                <select 
                                                                    value={detail.Report_id} 
                                                                    onChange={(e) => handleDetailChange(index, 'Report_id', e.target.value)} 
                                                                    required 
                                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none pr-10 hover:border-blue-300"
                                                                >
                                                                    <option value="" className="text-gray-400">Select report type</option>
                                                                    {isReportLoading ? (
                                                                        <option value="" disabled>Loading report types...</option>
                                                                    ) : (
                                                                        reportData.map((report) => (
                                                                            <option key={report.Report_id} value={report.Report_id}>
                                                                                {report.report_name}
                                                                            </option>
                                                                        ))
                                                                    )}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Doctor/Hospital */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                                <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                                Doctor/Hospital
                                                            </label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Doctor/Hospital name" 
                                                                value={detail.Doctor_and_Hospital_name} 
                                                                onChange={(e) => handleDetailChange(index, 'Doctor_and_Hospital_name', e.target.value)} 
                                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300" 
                                                            />
                                                        </div>
                                                        
                                                        {/* File Upload */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                <span className="flex items-center">
                                                                    <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                                    Upload File
                                                                </span>
                                                            </label>
                                                            <div className="relative">
                                                                <input 
                                                                    type="file" 
                                                                    onChange={(e) => handleFileChange(e, index)} 
                                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                                />
                                                            </div>
                                                            {detail.uploaded_file_report && !files[detail.file_key] && (
                                                                <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="text-lg">{fileIcon}</span>
                                                                            <div>
                                                                                <p className="text-xs font-medium text-gray-700">
                                                                                    {fileExt} File
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                                                                    {fileName}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                       
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {files[detail.file_key] && (
                                                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                                    <p className="text-xs font-medium text-green-700 flex items-center space-x-1">
                                                                        <span>📄</span>
                                                                        <span>New file: {files[detail.file_key].name}</span>
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-8 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-md"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span>{editId ? 'Update Report' : 'Create Report'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={showDeleteConfirmModal} 
                onClose={() => setShowDeleteConfirmModal(false)} 
                title={
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
                            <p className="text-sm text-gray-500">This action cannot be undone</p>
                        </div>
                    </div>
                } 
                size="md"
            >
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full mb-4">
                            <Trash2 className="h-10 w-10 text-red-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Delete Report?</h4>
                        <p className="text-gray-600">
                            Are you sure you want to delete this report? All associated files and details will be permanently removed.
                        </p>
                    </div>
                    <div className="flex justify-center space-x-4 pt-4">
                        <button 
                            onClick={() => setShowDeleteConfirmModal(false)} 
                            className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                        >
                            <Trash2 className="h-5 w-5" />
                            <span>Delete Report</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default MemberReport;