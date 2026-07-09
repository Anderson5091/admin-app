import { useEffect, useState } from "react";
import { AdminApi } from "../../features/admin/admin.api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Loader2, RefreshCw, Banknote, Landmark, Search } from "lucide-react";

type Tab = "cash-requests" | "settlements";

const crStatusBadge: Record<string, "warning" | "success" | "danger" | "info"> = {
  PENDING: "warning",
  PROCESSING: "warning",
  DELIVERED: "success",
  REJECTED: "danger",
};

const stStatusBadge: Record<string, "warning" | "success" | "danger" | "info"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const crStatusLabel: Record<string, string> = {
  PENDING: "Submitted",
  PROCESSING: "Processing",
  DELIVERED: "Delivered",
  REJECTED: "Rejected",
};

const stStatusLabel: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function AdminCashRequests() {
  const [tab, setTab] = useState<Tab>("cash-requests");
  const [cashRequests, setCashRequests] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cr, st] = await Promise.all([
        AdminApi.getAllCashRequests(),
        AdminApi.getAllSettlements(),
      ]);
      setCashRequests(cr);
      setSettlements(st);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleProcess = async (id: string, type: Tab, status: string) => {
    setProcessing(id);
    try {
      if (type === "cash-requests") {
        await AdminApi.processCashRequest(id, status);
      } else {
        await AdminApi.processSettlement(id, status);
      }
      fetchData();
      setSelected(null);
    } catch (err) {
      console.error("Failed to process:", err);
    }
    setProcessing(null);
  };

  const filteredCR = cashRequests.filter((cr) =>
    cr.agent?.name?.toLowerCase().includes(search.toLowerCase()) ||
    cr.agent?.email?.toLowerCase().includes(search.toLowerCase()) ||
    cr.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredST = settlements.filter((st) =>
    st.agent?.name?.toLowerCase().includes(search.toLowerCase()) ||
    st.agent?.email?.toLowerCase().includes(search.toLowerCase()) ||
    st.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Requests & Settlements</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Manage and process agent cash requests and bank settlements</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-card-alt">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by agent name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder-text-subtle focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex bg-card-alt rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setTab("cash-requests")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "cash-requests" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Banknote size={14} />
            Cash Requests
          </button>
          <button
            onClick={() => setTab("settlements")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "settlements" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Landmark size={14} />
            Settlements
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : tab === "cash-requests" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold">Agent</th>
                  <th className="text-right py-3 pr-4 font-semibold">Amount</th>
                  <th className="text-left py-3 pr-4 font-semibold">Bank</th>
                  <th className="text-left py-3 pr-4 font-semibold">Account</th>
                  <th className="text-left py-3 pr-4 font-semibold">Country</th>
                  <th className="text-right py-3 pr-4 font-semibold">Status</th>
                  <th className="text-right py-3 pr-4 font-semibold">Date</th>
                  <th className="text-right py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCR.map((cr) => (
                  <tr key={cr.id} className="border-b border-border last:border-0 hover:bg-card-alt transition-colors">
                    <td className="py-3 pr-4">
                      <button onClick={() => setSelected(cr)} className="text-left hover:text-primary transition-colors">
                        <p className="font-medium text-text-primary">{cr.agent?.name || "—"}</p>
                        <p className="text-[9px] text-text-subtle">{cr.agent?.email}</p>
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-right text-text-primary font-medium">${Number(cr.amount).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-text-secondary">{cr.bankName || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary font-mono text-[10px]">{cr.accountNumber || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{cr.country || "—"}</td>
                    <td className="py-3 pr-4 text-right">
                      <Badge variant={crStatusBadge[cr.status] || "info"}>{crStatusLabel[cr.status] || cr.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-right text-text-subtle whitespace-nowrap">{new Date(cr.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {cr.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleProcess(cr.id, "cash-requests", "PROCESSING")}
                            disabled={processing === cr.id}
                            className="px-2 py-1 rounded bg-warning-dim text-warning text-[9px] font-semibold hover:opacity-80 disabled:opacity-50"
                          >
                            {processing === cr.id ? <Loader2 size={10} className="animate-spin" /> : "Process"}
                          </button>
                        </div>
                      )}
                      {cr.status === "PROCESSING" && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleProcess(cr.id, "cash-requests", "DELIVERED")}
                            disabled={processing === cr.id}
                            className="px-2 py-1 rounded bg-success-dim text-success text-[9px] font-semibold hover:opacity-80 disabled:opacity-50"
                          >
                            {processing === cr.id ? <Loader2 size={10} className="animate-spin" /> : "Deliver"}
                          </button>
                          <button
                            onClick={() => handleProcess(cr.id, "cash-requests", "REJECTED")}
                            disabled={processing === cr.id}
                            className="px-2 py-1 rounded bg-danger-dim text-danger text-[9px] font-semibold hover:opacity-80 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {cr.status === "DELIVERED" && <span className="text-[9px] text-success font-semibold">Delivered</span>}
                      {cr.status === "REJECTED" && <span className="text-[9px] text-danger font-semibold">Rejected</span>}
                    </td>
                  </tr>
                ))}
                {filteredCR.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-text-subtle text-sm">No cash requests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-subtle uppercase border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold">Agent</th>
                  <th className="text-right py-3 pr-4 font-semibold">Amount</th>
                  <th className="text-left py-3 pr-4 font-semibold">Bank</th>
                  <th className="text-left py-3 pr-4 font-semibold">Reference</th>
                  <th className="text-right py-3 pr-4 font-semibold">Status</th>
                  <th className="text-right py-3 pr-4 font-semibold">Date</th>
                  <th className="text-right py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredST.map((st) => (
                  <tr key={st.id} className="border-b border-border last:border-0 hover:bg-card-alt transition-colors">
                    <td className="py-3 pr-4">
                      <button onClick={() => setSelected(st)} className="text-left hover:text-primary transition-colors">
                        <p className="font-medium text-text-primary">{st.agent?.name || "—"}</p>
                        <p className="text-[9px] text-text-subtle">{st.agent?.email}</p>
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-right text-text-primary font-medium">${Number(st.amount).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-text-secondary">{st.bankName || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary font-mono text-[10px]">{st.referenceNumber?.slice(0, 16) || "—"}</td>
                    <td className="py-3 pr-4 text-right">
                      <Badge variant={stStatusBadge[st.status] || "info"}>{stStatusLabel[st.status] || st.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-right text-text-subtle whitespace-nowrap">{new Date(st.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {st.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleProcess(st.id, "settlements", "APPROVED")}
                            disabled={processing === st.id}
                            className="px-2 py-1 rounded bg-success-dim text-success text-[9px] font-semibold hover:opacity-80 disabled:opacity-50"
                          >
                            {processing === st.id ? <Loader2 size={10} className="animate-spin" /> : "Approve"}
                          </button>
                          <button
                            onClick={() => handleProcess(st.id, "settlements", "REJECTED")}
                            disabled={processing === st.id}
                            className="px-2 py-1 rounded bg-danger-dim text-danger text-[9px] font-semibold hover:opacity-80 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {st.status === "APPROVED" && <span className="text-[9px] text-success font-semibold">Approved</span>}
                      {st.status === "REJECTED" && <span className="text-[9px] text-danger font-semibold">Rejected</span>}
                    </td>
                  </tr>
                ))}
                {filteredST.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-text-subtle text-sm">No settlements found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={tab === "cash-requests" ? "Cash Request Detail" : "Settlement Detail"}>
          <div className="space-y-3 text-xs">
            {tab === "cash-requests" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-text-subtle">Agent</p><p className="text-text-primary font-medium">{selected.agent?.name || "—"}</p></div>
                  <div><p className="text-text-subtle">Email</p><p className="text-text-primary">{selected.agent?.email || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-text-subtle">Amount</p><p className="text-text-primary font-bold">${Number(selected.amount).toLocaleString()}</p></div>
                  <div><p className="text-text-subtle">Status</p><Badge variant={crStatusBadge[selected.status] || "info"}>{crStatusLabel[selected.status] || selected.status}</Badge></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-text-subtle">Bank Name</p><p className="text-text-primary">{selected.bankName || "—"}</p></div>
                  <div><p className="text-text-subtle">Account Number</p><p className="text-text-primary font-mono">{selected.accountNumber || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-text-subtle">Account Name</p><p className="text-text-primary">{selected.destination || "—"}</p></div>
                  <div><p className="text-text-subtle">Country</p><p className="text-text-primary">{selected.country || "—"}</p></div>
                </div>
                {selected.notes && <div><p className="text-text-subtle">Notes</p><p className="text-text-primary">{selected.notes}</p></div>}
                <p className="text-text-subtle">Created: {new Date(selected.createdAt).toLocaleString()}</p>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-text-subtle">Agent</p><p className="text-text-primary font-medium">{selected.agent?.name || "—"}</p></div>
                  <div><p className="text-text-subtle">Email</p><p className="text-text-primary">{selected.agent?.email || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-text-subtle">Amount</p><p className="text-text-primary font-bold">${Number(selected.amount).toLocaleString()}</p></div>
                  <div><p className="text-text-subtle">Status</p><Badge variant={stStatusBadge[selected.status] || "info"}>{stStatusLabel[selected.status] || selected.status}</Badge></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-text-subtle">Bank Name</p><p className="text-text-primary">{selected.bankName || "—"}</p></div>
                  <div><p className="text-text-subtle">Reference</p><p className="text-text-primary font-mono">{selected.referenceNumber || "—"}</p></div>
                </div>
                {selected.depositBankName && (
                  <div className="border-t border-border pt-2">
                    <p className="text-text-subtle mb-1 font-semibold">Deposit Details</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div><p className="text-text-subtle">Bank Name</p><p className="text-text-primary">{selected.depositBankName}</p></div>
                      <div><p className="text-text-subtle">Country</p><p className="text-text-primary">{selected.depositCountry || "—"}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div><p className="text-text-subtle">Account Number</p><p className="text-text-primary font-mono">{selected.depositAccountNumber || "—"}</p></div>
                      <div><p className="text-text-subtle">Account Name</p><p className="text-text-primary">{selected.depositAccountName || "—"}</p></div>
                    </div>
                    {selected.proofImage && (
                      <div className="mt-2">
                        <p className="text-text-subtle mb-1">Deposit Proof</p>
                        <img src={`data:image/jpeg;base64,${selected.proofImage}`} alt="Deposit proof" className="max-h-40 rounded-lg border border-border" />
                      </div>
                    )}
                  </div>
                )}
                {selected.notes && <div><p className="text-text-subtle">Notes</p><p className="text-text-primary">{selected.notes}</p></div>}
                <p className="text-text-subtle">Created: {new Date(selected.createdAt).toLocaleString()}</p>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}