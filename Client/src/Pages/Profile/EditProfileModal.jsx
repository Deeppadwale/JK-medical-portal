import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import {
    useUpdateUserProfileMutation,
    useGetUserByIdQuery
} from '../../services/userMasterApi';
import { decryptData } from  "../../common/Functions/DecryptData"

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`flex items-center p-4 rounded-lg shadow-lg ${type === 'success'
                ? 'bg-green-100 border border-green-200 text-green-800'
                : 'bg-red-100 border border-red-200 text-red-800'
                }`}>
                {type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const EditProfileModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        User_Name: '',
        EmailId: '',
        Mobile: '',
        userfullname: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [uid, setUid] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [updateUserProfile] = useUpdateUserProfileMutation();

    useEffect(() => {
        if (isOpen) {
            const encryptedUserData = sessionStorage.getItem('user_data');
            const userData = encryptedUserData ? decryptData(encryptedUserData) : null;
            setUid(userData?.uid || null);
        }
    }, [isOpen]);

    const { data: userData, isLoading: isFetching } = useGetUserByIdQuery(uid, {
        skip: !uid || !isOpen
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                User_Name: userData.User_Name || '',
                EmailId: userData.EmailId || '',
                Mobile: userData.Mobile || '',
                userfullname: userData.userfullname || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateUserProfile({ uid, ...formData }).unwrap();
            showToast('Profile updated successfully!', 'success');
            setTimeout(() => onClose(),500);
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast(error.message || 'Failed to update profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const fields = [
        { label: 'Full Name', name: 'userfullname', type: 'text' },
        { label: 'Username', name: 'User_Name', type: 'text' },
        { label: 'Email', name: 'EmailId', type: 'email' },
        { label: 'Mobile', name: 'Mobile', type: 'number' }
    ];

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: '' })}
                />
            )}

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
                <div className="bg-white rounded-lg w-full max-w-md">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold text-[#D92300]">Edit Profile</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    autoComplete="off"
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92300]"
                                    required
                                />
                            </div>
                        ))}

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || isFetching}
                                className="px-4 py-2 bg-[#D92300] text-white rounded-md text-sm font-medium hover:bg-[#C11B00] disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default EditProfileModal;