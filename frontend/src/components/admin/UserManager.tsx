import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Mail, Phone, MoreVertical, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { DataTable } from './DataTable';
import SlideOver from './SlideOver';
import ConfirmationModal from './ConfirmationModal';
import api from '../../services/api.service';

interface User {
    id: string | number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    permissions?: string[];
    enabled: boolean;
    lastLogin?: string;
    [key: string]: any;
}

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
}

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Default form data
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'CUSTOMER',
        status: 'active'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Using the BFF endpoint as seen in UserManagement.jsx
            const response = await api.get('/api/bff/v1/users');
            // Check if response is array or wrapped in data
            const usersData = Array.isArray(response) ? response : (response.data || []);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'User',
            render: (_: any, row: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                        {(row.firstName?.[0] || '')}{(row.lastName?.[0] || '')}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{row.firstName} {row.lastName}</div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'roles',
            label: 'Roles',
            render: (value: string[]) => (
                <div className="flex flex-wrap gap-1">
                    {value?.map((role, idx) => (
                        <span
                            key={idx}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                    role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {role.replace('_', ' ')}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: 'enabled',
            label: 'Status',
            render: (value: boolean) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {value ? 'Active' : 'Disabled'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: any, row: User) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit User"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.roles?.[0] || 'CUSTOMER',
            status: user.enabled ? 'active' : 'inactive'
        });
        setIsSlideOverOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;

        try {
            await api.delete(`/api/bff/v1/users/${selectedUser.id}`);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Note: Actual implementation depends on backend create/update endpoints
        // For now simulating success or using what exists
        try {
            // Construct payload
            // const payload = { ...formData, enabled: formData.status === 'active' };

            // if (selectedUser) {
            //    await api.put(`/api/bff/v1/users/${selectedUser.id}`, payload);
            // } else {
            //    await api.post('/api/bff/v1/users', payload);
            // }

            toast.info('User save functionality would go here (backend dependency)');

            // Refetch to be safe
            // await fetchUsers();
            setIsSlideOverOpen(false);
        } catch (error) {
            console.error('Failed to save user:', error);
            toast.error('Failed to save user');
        }
    };

    const handleBulkDelete = (ids: (string | number)[]) => {
        // Implement bulk delete API call here
        toast.info(`Bulk delete not yet implemented for ${ids.length} users`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage system users, roles, and access permissions.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            setFormData({ firstName: '', lastName: '', email: '', role: 'items', status: 'active' });
                            setIsSlideOverOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Add User
                    </button>
                </div>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
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
                            <option value="CUSTOMER">Customer</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
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
                        </select>
                    </div>
                </form>
            </SlideOver>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser ? (selectedUser.firstName + ' ' + selectedUser.lastName) : 'this user'}? This action cannot be undone.`}
                confirmText="Delete User"
                type="danger"
            />
        </div>
    );
};

export default UserManager;
