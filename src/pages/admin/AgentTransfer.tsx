import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/admin/auth.store";
import { useAgentStore } from "../../features/agent/agent.store";
import { AgentApi } from "../../features/agent/agent.api";
import Card from "../../components/ui/Card";
import {
  ArrowLeft, Send, DollarSign, Percent, CreditCard, User,
  Loader2, CheckCircle, AlertCircle, Hash, Globe, Building2, Smartphone, MapPin, Search
} from "lucide-react";
import { CURRENCY_TOKEN } from "../../config/constants";

const PAYOUT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "CASH_PICKUP", label: "Cash Pickup" },
];

export default function AgentTransfer() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const agentId = profile?.id || "";
  const { loading, result, transfer, clearResult } = useAgentStore();

  const [customerIdentifier, setCustomerIdentifier] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; fullName: string | null; phone: string | null } | null>(null);
  const [debitUserWallet, setDebitUserWallet] = useState(false);

  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("BANK_TRANSFER");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [useExistingBeneficiary, setUseExistingBeneficiary] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState("0");

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState("");
  const [cashPickupLocation, setCashPickupLocation] = useState("");

  const handleLookupCustomer = async () => {
    if (!customerIdentifier.trim()) {
      setFoundUser(null);
      setLookupError("");
      return;
    }
    setLookupLoading(true);
    setLookupError("");
    try {
      const user = await AgentApi.lookupUser(customerIdentifier.trim());
      if (!user) {
        setLookupError("User not found");
        setFoundUser(null);
      } else {
        setFoundUser(user);
      }
    } catch (err: any) {
      setLookupError(err?.response?.data?.error || err?.message || "User not found");
      setFoundUser(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !payoutMethod) return;
    if (!useExistingBeneficiary && !fullName) return;

    const beneficiary = useExistingBeneficiary
      ? undefined
      : { fullName, country, bankName: bankName || undefined, accountNumber: accountNumber || undefined, mobileWalletNumber: mobileWalletNumber || undefined, mobileProvider: mobileProvider || undefined, cashPickupLocation: cashPickupLocation || undefined };

    const targetUserId = foundUser ? foundUser.id : undefined;

    await transfer(agentId, {
      userId: targetUserId,
      amount: Number(amount),
      payoutMethod,
      beneficiaryId: useExistingBeneficiary ? beneficiaryId || undefined : undefined,
      beneficiary,
      commissionPercent: Number(commissionPercent) || 0,
      debitUserWallet: foundUser ? debitUserWallet : false,
    });
  };

  useEffect(() => {
    return () => clearResult();
  }, [clearResult]);

  useEffect(() => {
    if (result?.success) {
      const t = setTimeout(() => {
        clearResult();
        setAmount(""); setBeneficiaryId(""); setCommissionPercent("0");
        setFullName(""); setCountry(""); setBankName(""); setAccountNumber("");
        setMobileWalletNumber(""); setMobileProvider(""); setCashPickupLocation("");
        setCustomerIdentifier(""); setFoundUser(null); setDebitUserWallet(false);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [result, clearResult]);

  const canSubmit = amount && payoutMethod && Number(amount) > 0 && !loading
    && (useExistingBeneficiary ? beneficiaryId : fullName);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1.5 hover:bg-card-alt rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Cash Transfer</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5">Send cash to a beneficiary from agent wallet</p>
        </div>
      </div>

      <Card className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Send size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text-primary">Transfer Details</h2>
        </div>

        {/* Customer / Sender Lookup */}
        <div className="bg-card-alt rounded-lg p-4 border border-border space-y-3">
          <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wider">
            Sender (Optional Wallet User)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customerIdentifier}
              onChange={(e) => setCustomerIdentifier(e.target.value)}
              placeholder="Enter User ID, Email, or Phone"
              className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
              disabled={loading || lookupLoading}
            />
            <button
              type="button"
              onClick={handleLookupCustomer}
              disabled={loading || lookupLoading || !customerIdentifier.trim()}
              className="px-3 py-2 text-xs bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1 font-medium"
            >
              {lookupLoading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              Verify
            </button>
          </div>

          {lookupError && (
            <p className="text-[11px] text-danger mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {lookupError}
            </p>
          )}

          {foundUser ? (
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-3 p-2 bg-primary-dim rounded-lg border border-primary/20">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {foundUser.fullName ? foundUser.fullName[0].toUpperCase() : foundUser.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary">
                    {foundUser.fullName || "Registered User"}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">{foundUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFoundUser(null);
                    setCustomerIdentifier("");
                    setDebitUserWallet(false);
                  }}
                  className="text-[10px] text-text-subtle hover:text-danger px-2 py-1 rounded hover:bg-card transition-colors font-medium shrink-0"
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={debitUserWallet}
                    onChange={(e) => setDebitUserWallet(e.target.checked)}
                    className="accent-primary"
                    disabled={loading}
                  />
                  Debit sender's wallet balance
                </label>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-card rounded-lg border border-dashed border-border mt-2">
              <p className="text-xs text-text-secondary text-center">
                Unregistered / Walk-in Customer (Agent Treasury Funded)
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <DollarSign size={14} className="inline mr-1" />
            {`${CURRENCY_TOKEN} Amount *`}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
            disabled={loading}
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <CreditCard size={14} className="inline mr-1" />
            Payout Method *
          </label>
          <select
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary"
            disabled={loading}
          >
            {PAYOUT_METHODS.map((pm) => (
              <option key={pm.value} value={pm.value}>{pm.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 pt-2 pb-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={useExistingBeneficiary}
              onChange={(e) => setUseExistingBeneficiary(e.target.checked)}
              className="accent-primary"
              disabled={loading}
            />
            Use existing beneficiary
          </label>
        </div>

        {useExistingBeneficiary ? (
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              <Hash size={14} className="inline mr-1" />
              Beneficiary ID *
            </label>
            <input
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
              placeholder="Existing beneficiary record ID"
              className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
              disabled={loading}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                <User size={14} className="inline mr-1" />
                Beneficiary Full Name *
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name of the beneficiary"
                className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                <Globe size={14} className="inline mr-1" />
                Country *
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Nigeria"
                className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                disabled={loading}
              />
            </div>

            {payoutMethod === "BANK_TRANSFER" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">
                    <Building2 size={14} className="inline mr-1" />
                    Bank Name
                  </label>
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Access Bank"
                    className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">
                    <Hash size={14} className="inline mr-1" />
                    Account Number
                  </label>
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 0123456789"
                    className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {payoutMethod === "MOBILE_MONEY" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">
                    <Smartphone size={14} className="inline mr-1" />
                    Mobile Wallet Number
                  </label>
                  <input
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                    placeholder="e.g. 08031234567"
                    className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">
                    <Smartphone size={14} className="inline mr-1" />
                    Mobile Provider
                  </label>
                  <input
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                    placeholder="e.g. MTN, Orange"
                    className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {payoutMethod === "CASH_PICKUP" && (
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">
                  <MapPin size={14} className="inline mr-1" />
                  Cash Pickup Location
                </label>
                <input
                  value={cashPickupLocation}
                  onChange={(e) => setCashPickupLocation(e.target.value)}
                  placeholder="e.g. Main Street Branch, Lagos"
                  className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary"
                  disabled={loading}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            <Percent size={14} className="inline mr-1" />
            Commission %
          </label>
          <input
            type="number"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(e.target.value)}
            placeholder="0"
            className="w-full bg-card-alt border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary max-w-full sm:max-w-[200px]"
            disabled={loading}
            min="0"
            max="100"
          />
        </div>

        {result && (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${
            result.success ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
          }`}>
            {result.success ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
            <div>
              <p>{result.message}</p>
              {result.reference && <p className="text-[10px] mt-1 opacity-70">Ref: {result.reference}</p>}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full sm:w-auto px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Processing..." : "Confirm Transfer"}
          </button>
        </div>
      </Card>
    </div>
  );
}
