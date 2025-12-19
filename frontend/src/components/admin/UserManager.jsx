import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import SlideOver from './SlideOver';
import ConfirmationModal from './ConfirmationModal';
import { Plus, Edit2, Trash2, Shield, Mail, Phone, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'user', status: 'active' });

    // Mock Data Fetching
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUsers([
                { id: 1, name: 'Admin User', email: 'admin@ticketkatum.com', role: 'superadmin', status: 'active', lastLogin: '2 mins ago' },
                { id: 2, name: 'Bus Operator', email: 'bus@operator.com', role: 'admin', status: 'active', lastLogin: '1 hour ago' },
                { id: 3, name: 'Hotel Manager', email: 'hotel@manager.com', role: 'admin', status: 'inactive', lastLogin: '2 days ago' },
                { id: 4, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', lastLogin: '5 mins ago' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const columns = [
        {
            key: 'name',
            label: 'User',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {value.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{value}</div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Role',
            render: (value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                    value === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
        {
            key: 'lastLogin',
            label: 'Last Login',
            sortable: true
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData(user);
        setIsSlideOverOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setIsDeleteModalOpen(false);
        toast.success('User deleted successfully');
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (selectedUser) {
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
            toast.success('User updated successfully');
        } else {
            setUsers([...users, { ...formData, id: Date.now(), lastLogin: 'Just now' }]);
            toast.success('User created successfully');
        }
        setIsSlideOverOpen(false);
    };

    const handleBulkDelete = (ids) => {
        // 1. Backup current state
        const previousUsers = [...users];

        // 2. Optimistic Update
        setUsers(users.filter(u => !ids.includes(u.id)));

        // 3. Show Undo Toast
        const toastId = toast.success(
            <div className="flex items-center justify-between w-full gap-4">
                <span>{ids.length} user{ids.length > 1 ? 's' : ''} deleted</span>
                <button
                    onClick={() => {
                        // Restore state
                        setUsers(previousUsers);
                        toast.dismiss(toastId);
                        toast.info('Deletion cancelled');
                    }}
                    className="px-3 py-1 text-sm font-bold bg-white text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                >
                    Undo
                </button>
            </div>,
            {
                autoClose: 5000,
                closeButton: false,
                onClose: (props) => {
                    // Only execute if not undone (toast closed by timer or manual close, not by our undo button)
                    // Note: react-toastify onClose doesn't easily distinguish 'why' it closed without custom tracking.
                    // Simplified: We assume if the toast closes naturally, we commit. 
                    // But since we restore state immediately on Undo click, we don't need to do anything here 
                    // unless we were holding back the API call.

                    // For a real app, we would trigger the API call here if it wasn't cancelled.
                    // Since we don't have a real backend API for bulk delete yet, we just log it.
                    console.log('Committing delete for:', ids);
                }
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage system users, roles, and access permissions.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedUser(null);
                        setFormData({ name: '', email: '', role: 'user', status: 'active' });
                        setIsSlideOverOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                searchable={true}
                selectable={true}
                itemsPerPage={10}
                bulkActions={[
                    { label: 'Delete Selected', onClick: handleBulkDelete },
                    { label: 'Deactivate', onClick: (ids) => console.log('Deactivate', ids) }
                ]}
            />

            <SlideOver
                isOpen={isSlideOverOpen}
                onClose={() => setIsSlideOverOpen(false)}
                title={selectedUser ? 'Edit User' : 'Add New User'}
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsSlideOverOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="user-form"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Save Changes
                        </button>
                    </div>
                }
            >
                <form id="user-form" onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </form>
            </SlideOver>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
                confirmText="Delete User"
                type="danger"
            />
        </div>
    );
};

export default UserManager;
