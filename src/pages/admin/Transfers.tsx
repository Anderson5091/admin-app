import { useEffect, useState, useMemo } from "react";
import { useAdminStore } from "../../features/admin/admin.store";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  Search, Filter, DollarSign, Download, RefreshCw, ChevronDown, ChevronUp, ArrowLeftRight
} from "lucide-react";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
  DRAFT: "default",
  PENDING: "warning",
  PENDING_PAYOUT: "info",
  SENT_TO_PARTNER: "purple",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "default",
};

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "PENDING_PAYOUT", label: "Pending Payout" },
  { value: "SENT_TO_PARTNER", label: "Sent to Partner" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const payoutMethodOptions = [
  { value: "ALL", label: "All Methods" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "CASH_PICKUP", label: "Cash Pickup" },
];

export default function Transfers() {
  const { transfers, transfersLoading, fetchTransfers } = useAdminStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    loadTransfers();
  }, []);

  async function loadTransfers() {
    setFetchError("");
    try {
      await fetchTransfers();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to fetch transfers";
      setFetchError(message);
    }
  }

  const safeTransfers = transfers ?? [];

  // Calculate statistics
  const stats = useMemo(() => {
    const filtered = applyFilters(safeTransfers);
    return {
      total: filtered.length,
      totalAmount: filtered.reduce((sum, t) => sum + t.amount, 0),
      totalFees: filtered.reduce((sum, t) => sum + t.fee, 0),
      completed: filtered.filter(t => t.status === "COMPLETED").length,
      pending: filtered.filter(t => ["PENDING", "PENDING_PAYOUT", "SENT_TO_PARTNER"].includes(t.status)).length,
      failed: filtered.filter(t => t.status === "FAILED").length,
    };
  }, [safeTransfers, search, statusFilter, methodFilter, startDate, endDate, minAmount, maxAmount]);

  const filtered = useMemo(() => applyFilters(safeTransfers), [safeTransfers, search, statusFilter, methodFilter, startDate, endDate, minAmount, maxAmount]);

  function applyFilters(data: typeof safeTransfers) {
    return data.filter((t) => {
      // Search filter
      const matchesSearch = 
        (t.userEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.id ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.referenceId ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.partner ?? "").toLowerCase().includes(search.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

      // Method filter
      const matchesMethod = methodFilter === "ALL" || t.payoutMethod === methodFilter;

      // Date filters
      const transferDate = new Date(t.createdAt);
      const matchesStartDate = !startDate || transferDate >= new Date(startDate);
      const matchesEndDate = !endDate || transferDate <= new Date(endDate);

      // Amount filters
      const matchesMinAmount = !minAmount || t.amount >= Number(minAmount);
      const matchesMaxAmount = !maxAmount || t.amount <= Number(maxAmount);

      return matchesSearch && matchesStatus && matchesMethod && 
             matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });
  }

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setMethodFilter("ALL");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  const handleExport = () => {
    const csvContent = [
      ["ID", "User", "Email", "Amount", "Fee", "Method", "Status", "Partner", "Reference", "Date"],
      ...filtered.map(t => [
        t.id,
        t.userName || "",
        t.userEmail || "",
        t.amount,
        t.fee,
        t.payoutMethod || "",
        t.status,
        t.partner || "",
        t.referenceId || "",
        new Date(t.createdAt).toLocaleString()
      ])
    ]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transfers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (transfersLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-text-subtle text-sm">Loading transfers...</p>
      </div>
    );
  }

  // Show helpful message if no transfers found
  if (safeTransfers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Transfers</h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">Track and monitor all platform transfers</p>
          </div>
          <div className="flex items-center gap-2">
              <button
                onClick={loadTransfers}
                className="flex items-center gap-1.5 text-xs bg-primary-dim text-primary hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-lg"
              >
                <RefreshCw size={14} />
                Retry
              </button>
          </div>
        </div>
        
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-card-alt flex items-center justify-center">
              <DollarSign size={24} className="text-text-subtle" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">No Transfers Found</h3>
            {fetchError && (
              <div className="bg-danger-dim text-danger text-sm px-4 py-3 rounded-lg max-w-md w-full text-left">
                <p className="font-semibold mb-1">API Error:</p>
                <p className="font-mono text-xs">{fetchError}</p>
              </div>
            )}
            <p className="text-text-secondary text-sm max-w-md">
              There are no transfers matching your criteria. Try adjusting your filters or check if you have the required permissions to view transfers.
            </p>
            <p className="text-xs text-text-subtle mt-2">
              Required roles: SUPER_ADMIN, ADMIN, or OPS
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Transfers</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Track and monitor all platform transfers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTransfers}
            className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs bg-primary-dim text-primary hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-lg"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs bg-card-alt border border-border hover:bg-card transition-colors px-3 py-1.5 rounded-lg"
          >
            <Filter size={14} />
            Filters
            {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ArrowLeftRight size={18} className="text-text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">{stats.total.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Total Transfers</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <DollarSign size={18} className="text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">${stats.totalAmount.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Total Amount</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <DollarSign size={18} className="text-warning shrink-0" />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">${stats.totalFees.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Total Fees</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ArrowLeftRight size={18} className="text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">{stats.completed.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ArrowLeftRight size={18} className="text-warning shrink-0" />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">{stats.pending.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ArrowLeftRight size={18} className="text-danger shrink-0" />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-text-primary truncate">{stats.failed.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                {payoutMethodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Min Amount ($)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider mb-1">Max Amount ($)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="No max"
                min="0"
                className="w-full bg-card-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
            <button
              onClick={handleResetFilters}
              className="text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt"
            >
              Reset Filters
            </button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative w-full sm:w-auto">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input
          type="text"
          placeholder="Search by user, email, ID, reference, or partner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 pl-9 pr-4 py-2 rounded-lg bg-card-alt border border-border text-text-primary text-sm placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Results Count */}
      <p className="text-xs text-text-subtle">
        Showing {filtered.length} of {safeTransfers.length} transfers
      </p>

      {/* Desktop Table */}
      <Card className="p-0 overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Fee</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Net Amount</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Method</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Partner</th>
                <th className="text-left px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Reference</th>
                <th className="text-right px-4 py-3 text-text-secondary font-semibold text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-card-alt transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-text-primary font-medium text-sm">{t.userName}</div>
                    <div className="text-text-subtle text-[10px]">{t.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-text-primary font-mono font-medium">${t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-secondary font-mono">${t.fee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-primary font-mono">${t.destinationAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-secondary">{t.payoutMethod?.replace(/_/g, " ") || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[t.status] || "info"}>
                      {t.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{t.partner || "—"}</td>
                  <td className="px-4 py-3 text-[10px] font-mono text-text-subtle max-w-[120px] truncate">{t.referenceId || "—"}</td>
                  <td className="px-4 py-3 text-right text-xs text-text-secondary whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-subtle text-sm">No transfers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">{t.userName}</span>
                <span className="text-sm font-mono font-bold text-text-primary">${t.amount.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-text-subtle">{t.userEmail}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-text-secondary">Fee: ${t.fee.toLocaleString()}</span>
                <span className="text-text-secondary">·</span>
                <span className="text-text-secondary">Net: ${t.destinationAmount.toLocaleString()}</span>
                <span className="text-text-secondary">·</span>
                <span className="text-text-secondary">{t.payoutMethod?.replace(/_/g, " ") || "—"}</span>
                <Badge variant={statusVariant[t.status] || "info"}>
                  {t.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-border">
                <span>{t.partner || "—"}</span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
              {t.referenceId && (
                <p className="text-[10px] font-mono text-text-subtle truncate">Ref: {t.referenceId}</p>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-text-subtle text-sm">No transfers found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
