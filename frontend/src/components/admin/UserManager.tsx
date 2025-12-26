import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from './DataTable';
import SlideOver from './SlideOver';
import ConfirmationModal from './ConfirmationModal';
import userService from '../../services/userApiService';

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
    password?: string;
    confirmPassword?: string;
    role: string;
    status: string;
}

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<Array<{ id: number, name: string, description?: string }>>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Default form data
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CUSTOMER',
        status: 'active'
    });

    // Memoized change handlers to prevent focus loss
    const handleInputChange = useCallback((field: keyof UserFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Fetch roles only once on mount
    useEffect(() => {
        fetchRoles();
    }, []);

    // Fetch users when page changes
    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchRoles = async () => {
        try {
            const response = await userService.getRoles();
            if (response.data && Array.isArray(response.data)) {
                setAvailableRoles(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            // Fallback to default roles if API fails
            setAvailableRoles([
                { id: 1, name: 'USER' },
                { id: 2, name: 'ADMIN' },
                { id: 3, name: 'SUPER_ADMIN' }
            ]);
        }
    };

    const fetchUsers = async (page: number) => {
        setLoading(true);
        try {
            // API expects 0-indexed page
            const response = await userService.getAllUsers({
                page: page - 1,
                size: itemsPerPage
            });

            // Handle different response structures (PageImpl vs List)
            // Handle different response structures
            // Case 1: Wrapped Response<RestResponsePage> (Current BFF structure)
            if (response.data && response.data.content) {
                setUsers(response.data.content);
                setTotalItems(response.data.totalElements);
            }
            // Case 2: Direct PageImpl (Direct Service call)
            else if (response.content) {
                setUsers(response.content);
                setTotalItems(response.totalElements);
            }
            // Case 3: Wrapped List Response
            else if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);
                setTotalItems(response.totalElements || response.data.length);
            }
            // Case 4: Direct List
            else if (Array.isArray(response)) {
                setUsers(response);
                setTotalItems(response.length);
            } else {
                setUsers([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
            password: '',
            confirmPassword: '',
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
            await userService.deleteUser(selectedUser.id);
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

        // Validate passwords for new users
        if (!selectedUser) {
            if (!formData.password) {
                toast.error('Password is required for new users');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            if (formData.password.length < 8) {
                toast.error('Password must be at least 8 characters long');
                return;
            }
        }

        try {
            // Construct payload
            const payload = {
                ...formData,
                enabled: formData.status === 'active'
            };

            if (selectedUser) {
                // Update - remove password fields if empty
                const { password, confirmPassword, ...updatePayload } = payload;
                await userService.updateUser(selectedUser.id, updatePayload);
                toast.success('User updated successfully');
            } else {
                // Create - include password
                const { confirmPassword, ...createPayload } = payload;
                await userService.createUser(createPayload);
                toast.success('User created successfully');
            }

            setIsSlideOverOpen(false);
            fetchUsers(currentPage);
        } catch (error) {
            console.error('Failed to save user:', error);
            toast.error('Failed to save user');
            // Don't close the slide-over on error so user can fix issues
        }
    };

    const handleBulkDelete = (ids: (string | number)[]) => {
        // Implement bulk delete API call here
        toast(`Bulk delete not yet implemented for ${ids.length} users`, { icon: 'ℹ️' });
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
                        onClick={() => fetchUsers(currentPage)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'CUSTOMER', status: 'active' });
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
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
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
                                onChange={e => handleInputChange('firstName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={e => handleInputChange('lastName', e.target.value)}
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
                            onChange={e => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {!selectedUser && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password || ''}
                                    onChange={e => handleInputChange('password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword || ''}
                                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Re-enter password"
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={e => handleInputChange('role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {availableRoles.map(role => (
                                <option key={role.id} value={role.name}>
                                    {role.name.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={e => handleInputChange('status', e.target.value)}
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
