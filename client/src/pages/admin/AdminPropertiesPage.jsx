import { useState, useEffect, useCallback } from 'react';
import { Building2, Archive, ArchiveRestore, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import adminService from '../../services/adminService';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
=======
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
>>>>>>> master
import { formatIDR, formatDate } from '../../utils/formatters';
import { AVAILABILITY_STATUS_CONFIG } from '../../utils/constants';

const ARCHIVE_TABS = [
  { key: 'active', label: 'Active' },
  { key: 'archived', label: 'Archived' },
];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, property: null });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getProperties({
        page,
        limit: 15,
        search: search || undefined,
        isArchived: activeTab === 'archived',
      });
<<<<<<< HEAD
      setProperties(res.data?.properties || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1, total: 0 });
=======
      setProperties(res.data || []);
      setPagination(
        res.meta || { page: 1, totalPages: 1, total: 0 }
      );
>>>>>>> master
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openArchiveConfirm = (property) => {
    setConfirmDialog({ open: true, property });
  };

  const handleToggleArchive = async () => {
    const { property } = confirmDialog;
    setConfirmDialog({ open: false, property: null });
    setActionLoading(property._id);
    try {
      await adminService.toggleArchiveProperty(property._id);
      const label = property.isArchived ? 'restored' : 'archived';
      toast.success(`Property "${property.title}" ${label}`);
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Properties</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and moderate all listings on the platform
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProperties}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or city…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <Button type="submit" size="sm">Search</Button>
            {search && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              >
                Clear
              </Button>
            )}
          </form>

          {/* Tabs */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {ARCHIVE_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{pagination.total}</span>{' '}
            {activeTab} propert{pagination.total !== 1 ? 'ies' : 'y'} found
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={Building2}
                title="No properties found"
                description={
                  search
                    ? `No ${activeTab} properties match "${search}".`
                    : `No ${activeTab} properties on the platform yet.`
                }
              />
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="pl-6 pr-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Price / Month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Listed
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {properties.map((property) => {
                  const statusCfg = AVAILABILITY_STATUS_CONFIG[property.availabilityStatus] || {};
                  return (
                    <tr key={property._id} className="hover:bg-slate-50 transition-colors">
                      <td className="pl-6 pr-4 py-4">
                        <div className="flex items-center gap-3">
                          {property.images?.[0]?.url ? (
                            <img
                              src={property.images[0].url}
                              alt={property.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                              {property.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {property.city} · {property.propertyType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{property.owner?.name || '—'}</p>
                        <p className="text-xs text-slate-500">{property.owner?.email || ''}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {formatIDR(property.rentPrice)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className || 'bg-slate-100 text-slate-600'}`}
                        >
                          {statusCfg.label || property.availabilityStatus}
                        </span>
                        {property.isArchived && (
                          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">{formatDate(property.createdAt)}</p>
                      </td>
                      <td className="pl-4 pr-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/properties/${property._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                            title="View listing"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Button
                            size="xs"
                            variant="outline"
                            className={
                              property.isArchived
                                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                            }
                            onClick={() => openArchiveConfirm(property)}
                            loading={actionLoading === property._id}
                          >
                            {property.isArchived ? (
                              <><ArchiveRestore className="w-3.5 h-3.5 mr-1" />Restore</>
                            ) : (
                              <><Archive className="w-3.5 h-3.5 mr-1" />Archive</>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, property: null })}
        onConfirm={handleToggleArchive}
        title={
          confirmDialog.property?.isArchived ? 'Restore Property' : 'Archive Property'
        }
        description={
          confirmDialog.property?.isArchived
            ? `Restore "${confirmDialog.property?.title}"? It will become visible to tenants again.`
            : `Archive "${confirmDialog.property?.title}"? It will be hidden from tenants and search results.`
        }
        confirmLabel={confirmDialog.property?.isArchived ? 'Restore' : 'Archive'}
        variant={confirmDialog.property?.isArchived ? 'primary' : 'danger'}
      />
    </div>
  );
}
