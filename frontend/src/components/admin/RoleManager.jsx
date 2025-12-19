import React, { useState } from 'react';
import { Shield, Check, X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const RoleManager = () => {
    const [roles, setRoles] = useState([
        { id: 'superadmin', name: 'Superadmin', description: 'Full system access' },
        { id: 'admin', name: 'Admin', description: 'Operational access' },
        { id: 'manager', name: 'Manager', description: 'Limited management access' },
        { id: 'user', name: 'User', description: 'Standard user access' }
    ]);

    const [permissions, setPermissions] = useState([
        { id: 'users.view', label: 'View Users', category: 'User Management' },
        { id: 'users.create', label: 'Create Users', category: 'User Management' },
        { id: 'users.edit', label: 'Edit Users', category: 'User Management' },
        { id: 'users.delete', label: 'Delete Users', category: 'User Management' },
        { id: 'buses.manage', label: 'Manage Buses', category: 'Operations' },
        { id: 'routes.manage', label: 'Manage Routes', category: 'Operations' },
        { id: 'tickets.manage', label: 'Manage Tickets', category: 'Operations' },
        { id: 'reports.view', label: 'View Reports', category: 'Governance' },
        { id: 'audit.view', label: 'View Audit Logs', category: 'Governance' },
        { id: 'settings.manage', label: 'Manage Settings', category: 'System' }
    ]);

    const [rolePermissions, setRolePermissions] = useState({
        superadmin: permissions.map(p => p.id),
        admin: ['users.view', 'buses.manage', 'routes.manage', 'tickets.manage', 'reports.view'],
        manager: ['buses.manage', 'routes.manage', 'tickets.manage'],
        user: []
    });

    const togglePermission = (roleId, permissionId) => {
        if (roleId === 'superadmin') return; // Superadmin always has all permissions

        setRolePermissions(prev => {
            const current = prev[roleId] || [];
            const hasPermission = current.includes(permissionId);

            if (hasPermission) {
                return { ...prev, [roleId]: current.filter(id => id !== permissionId) };
            } else {
                return { ...prev, [roleId]: [...current, permissionId] };
            }
        });
        toast.success('Permission updated');
    };

    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-gray-500">Manage role-based access control (RBAC) matrix.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus size={20} />
                    Add Role
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                                    Permission
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-bold text-gray-900">{role.name}</span>
                                            <span className="text-[10px] text-gray-400 font-normal normal-case">{role.description}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={roles.length + 1} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {category}
                                        </td>
                                    </tr>
                                    {perms.map(perm => (
                                        <tr key={perm.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {perm.label}
                                            </td>
                                            {roles.map(role => {
                                                const hasPermission = rolePermissions[role.id]?.includes(perm.id);
                                                const isSuperAdmin = role.id === 'superadmin';

                                                return (
                                                    <td key={role.id} className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => togglePermission(role.id, perm.id)}
                                                            disabled={isSuperAdmin}
                                                            className={`p-1.5 rounded-lg transition-all ${hasPermission
                                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                                                } ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        >
                                                            {hasPermission ? <Check size={18} strokeWidth={3} /> : <X size={18} />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoleManager;
