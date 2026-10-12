import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Check,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.isActive = statusFilter;

      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      toast.error('Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      const res = await adminService.updateUserStatus(user._id, newStatus);
      if (res.success) {
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleOwnerApproval = async (userId, approvalStatus) => {
    try {
      const res = await adminService.updateUserApproval(userId, approvalStatus);
      if (res.success) {
        toast.success(`Owner application ${approvalStatus}`);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, ownerApprovalStatus: approvalStatus } : u
          )
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update approval status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Inspect registered accounts, moderate platform members, and configure access permissions
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Roles</option>
            <option value="tenant">Tenant</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Account Status</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Owner Approval</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No users found matching query
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-slate-400 text-[11px]">{u._id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <p>{u.email}</p>
                      {u.phone && <p className="text-[11px] text-slate-400">{u.phone}</p>}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'owner'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {u.role === 'owner' ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            u.ownerApprovalStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.ownerApprovalStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.ownerApprovalStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500">{formatDate(u.createdAt)}</td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* If owner is pending, provide quick approve/reject */}
                        {u.role === 'owner' && u.ownerApprovalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOwnerApproval(u._id, 'approved')}
                              className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Approve Owner"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOwnerApproval(u._id, 'rejected')}
                              className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="Reject Owner"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Toggle active status */}
                        {u.role !== 'admin' && (
                          <Button
                            variant={u.isActive ? 'outline' : 'primary'}
                            size="sm"
                            className="text-[11px] py-1 px-2"
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => fetchUsers(p)}
          />
        </div>
      </div>
    </div>
  );
};
