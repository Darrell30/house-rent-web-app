import { useState, useEffect, useCallback } from 'react';
import { UserCheck, UserX, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

const APPROVAL_TABS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
];

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
};

export function OwnerApprovalsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [owners, setOwners] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, user: null });

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ role: 'owner', ownerApprovalStatus: activeTab, limit: 100 });
      const userList = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      setOwners(userList);
    } catch {
      toast.error('Failed to load owner applications');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        adminService.getUsers({ role: 'owner', ownerApprovalStatus: 'pending', limit: 1 }),
        adminService.getUsers({ role: 'owner', ownerApprovalStatus: 'approved', limit: 1 }),
        adminService.getUsers({ role: 'owner', ownerApprovalStatus: 'rejected', limit: 1 }),
      ]);
      setStats({
        pending: pendingRes.meta?.total ?? pendingRes.data?.pagination?.total ?? 0,
        approved: approvedRes.meta?.total ?? approvedRes.data?.pagination?.total ?? 0,
        rejected: rejectedRes.meta?.total ?? rejectedRes.data?.pagination?.total ?? 0,
      });
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openConfirm = (user, action) => {
    setConfirmDialog({ open: true, action, user });
  };

  const handleApprovalAction = async () => {
    const { action, user } = confirmDialog;
    setConfirmDialog({ open: false, action: null, user: null });
    setActionLoading(user._id);
    try {
      await adminService.updateUserApproval(user._id, action);
      const label = action === 'approved' ? 'approved' : 'rejected';
      toast.success(`${user.name} has been ${label}`);
      await Promise.all([fetchOwners(), fetchStats()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = stats.pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Owner Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage property owner account applications
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchOwners(); fetchStats(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="amber"
          description="Awaiting admin decision"
        />
        <StatCard
          title="Approved Owners"
          value={stats.approved}
          icon={UserCheck}
          color="emerald"
          description="Active on the platform"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={UserX}
          color="red"
          description="Applications declined"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6">
          <nav className="flex gap-1 -mb-px" aria-label="Approval status tabs">
            {APPROVAL_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {key === 'pending' && pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : owners.length === 0 ? (
            <EmptyState
              icon={activeTab === 'pending' ? Clock : activeTab === 'approved' ? UserCheck : UserX}
              title={`No ${activeTab} applications`}
              description={
                activeTab === 'pending'
                  ? 'All owner applications have been reviewed.'
                  : `No owners with ${activeTab} status found.`
              }
            />
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pl-6 pr-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    {activeTab === 'pending' && (
                      <th className="pl-4 pr-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {owners.map((owner) => (
                    <tr key={owner._id} className="hover:bg-slate-50 transition-colors">
                      <td className="pl-6 pr-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-navy-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {owner.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{owner.name}</p>
                            <p className="text-xs text-slate-500">ID: {owner._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{owner.email}</p>
                        <p className="text-xs text-slate-500">{owner.phone || 'No phone'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{formatDate(owner.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            STATUS_STYLES[owner.ownerApprovalStatus] || STATUS_STYLES.pending
                          }`}
                        >
                          {owner.ownerApprovalStatus?.charAt(0).toUpperCase() +
                            owner.ownerApprovalStatus?.slice(1)}
                        </span>
                      </td>
                      {activeTab === 'pending' && (
                        <td className="pl-4 pr-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => openConfirm(owner, 'rejected')}
                              disabled={actionLoading === owner._id}
                            >
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="xs"
                              onClick={() => openConfirm(owner, 'approved')}
                              loading={actionLoading === owner._id}
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null, user: null })}
        onConfirm={handleApprovalAction}
        title={confirmDialog.action === 'approved' ? 'Approve Owner Account' : 'Reject Owner Account'}
        message={
          confirmDialog.action === 'approved'
            ? `Are you sure you want to approve ${confirmDialog.user?.name}'s owner account? They will be able to create property listings.`
            : `Are you sure you want to reject ${confirmDialog.user?.name}'s owner application? They will be notified.`
        }
        confirmText={confirmDialog.action === 'approved' ? 'Approve' : 'Reject'}
        confirmVariant={confirmDialog.action === 'approved' ? 'primary' : 'danger'}
        loading={Boolean(actionLoading)}
      />
    </div>
  );
}

export default OwnerApprovalsPage;
