"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MonthlyWithdrawalChart, } from "../Wallet/MonthlyWithdrawalChart";
import { RecentActivityLedger, } from "../Wallet/RecentActivityLedger";
import { PendingReleasesCard, } from "../Wallet/PendingReleasesCard";
import {WithdrawalHistory } from "../Wallet/WithdrawalHistory";



import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  ArrowDownLeft, 
  TrendingUp, 
  HelpCircle,
} from "lucide-react";

import {
  getWalletData,
  getWithdrawalMethods,
  createWithdrawalMethod,
  requestWithdrawal,
  WalletData,
  WithdrawMethod,
  MethodType,
  CreateWithdrawMethodPayload,
} from "@/api/wallets.api";

// Mock Data for ledger & pending releases
const initialTransactions = [
  { id: "TXN-7721", type: "Earnings", booking: "BKO-9921", amount: 120.00, date: "2026-07-05", status: "Completed" },
  { id: "TXN-7610", type: "Earnings", booking: "BKO-4821", amount: 130.00, date: "2026-07-02", status: "Completed" },
  { id: "TXN-7402", type: "Withdrawal", booking: "—", amount: -200.00, date: "2026-06-28", status: "Completed" },
  { id: "TXN-7399", type: "Earnings", booking: "BKO-1029", amount: 250.00, date: "2026-06-15", status: "Completed" },
];

const pendingEarnings = [
  { id: "PEND-01", booking: "BKO-3341", amount: 70.00, releaseDate: "Expected 2026-08-05", source: "Delivery Escrow" },
  { id: "PEND-02", booking: "BKO-8812", amount: 50.00, releaseDate: "Expected 2026-08-10", source: "Luggage Spacing Premium" },
];

export default function MyWallet() {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);

  // Dynamic API State
  const [walletInfo, setWalletInfo] = useState<WalletData>({
    available_balance: "0.00",
    pending_balance: "0.00",
    total_earned: "0.00",
    total_withdrawn: "0.00",
  });

  // Modal / Method States
  const [methods, setMethods] = useState<WithdrawMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAddingMethod, setIsAddingMethod] = useState<boolean>(false);
  
  // Structured API error handler state
  const [errorMessage, setErrorMessage] = useState<string | Record<string, any> | null>(null);

  // New Method Form Fields
  const [selectedType, setSelectedType] = useState<MethodType>("BANK");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  useEffect(() => {
    if (isWithdrawOpen) {
      fetchMethods();
    } else {
      resetForms();
    }
  }, [isWithdrawOpen]);

  const fetchWalletInfo = async () => {
    try {
      setIsLoadingBalance(true);
      const data = await getWalletData();
      if (data) {
        setWalletInfo({
          available_balance: data.available_balance ? String(data.available_balance) : "0.00",
          pending_balance: data.pending_balance ? String(data.pending_balance) : "0.00",
          total_earned: data.total_earned ? String(data.total_earned) : "0.00",
          total_withdrawn: data.total_withdrawn ? String(data.total_withdrawn) : "0.00",
        });
      }
    } catch (error) {
      console.error("Failed to fetch wallet info:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchMethods = async () => {
    try {
      setErrorMessage(null);
      const data = await getWithdrawalMethods();
      const rawList = Array.isArray(data) ? data : (data as any)?.data || [];

      // Deduplicate by method ID
      const uniqueMethods = Array.from(
        new Map(rawList.map((item: WithdrawMethod) => [item.id, item])).values()
      ) as WithdrawMethod[];

      setMethods(uniqueMethods);
      if (uniqueMethods.length > 0) {
        setSelectedMethodId(uniqueMethods[0].id);
      }
    } catch (err: any) {
      const apiData = err?.response?.data;
      setErrorMessage(
        apiData && typeof apiData === "object"
          ? apiData.errors || apiData.message || apiData.error || apiData
          : "Failed to load withdrawal methods."
      );
    }
  };

  const resetForms = () => {
    setErrorMessage(null);
    setIsAddingMethod(false);
    setWithdrawAmount("");
    setSelectedType("BANK");
    setAccountName("");
    setAccountNumber("");
    setBankName("");
    setBranchName("");
    setRoutingNumber("");
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    let payload: CreateWithdrawMethodPayload;

    if (selectedType === "BANK") {
      payload = {
        type: "BANK",
        account_name: accountName,
        account_number: accountNumber,
        bank_name: bankName,
        branch_name: branchName,
        routing_number: routingNumber,
      };
    } else {
      payload = {
        type: selectedType as "BKASH" | "NAGAD" | "ROCKET",
        account_name: accountName,
        account_number: accountNumber,
      };
    }

    try {
      const res = await createWithdrawalMethod(payload);
      const newMethod = res.data || (res as unknown as WithdrawMethod);

      if (newMethod && newMethod.id) {
        setMethods((prev) => {
          const exists = prev.some((m) => m.id === newMethod.id);
          return exists ? prev : [...prev, newMethod];
        });
        setSelectedMethodId(newMethod.id);
        setIsAddingMethod(false);
        setAccountName("");
        setAccountNumber("");
        setBankName("");
        setBranchName("");
        setRoutingNumber("");
      }
    } catch (err: any) {
      const apiData = err?.response?.data;
      if (apiData && typeof apiData === "object") {
        setErrorMessage(apiData.errors || apiData.error || apiData.message || apiData);
      } else {
        setErrorMessage("Failed to save withdrawal method.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethodId) {
      setErrorMessage("Please select or add a payout destination.");
      return;
    }

    const amountNum = parseFloat(withdrawAmount);
    const maxPayout = parseFloat(walletInfo.available_balance) || 0;

    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage({ amount: ["Please specify a valid payout amount."] });
      return;
    }

    if (amountNum > maxPayout) {
      setErrorMessage({
        amount: [`Maximum available balance is $${maxPayout.toFixed(2)}.`],
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await requestWithdrawal({
        withdrawal_method: selectedMethodId,
        amount: amountNum.toFixed(2),
      });

      if (res?.success || res) {
        setIsWithdrawOpen(false);
        await fetchWalletInfo(); // Re-fetch updated balance
      }
    } catch (err: any) {
      const apiData = err?.response?.data;
      if (apiData && typeof apiData === "object") {
        setErrorMessage(apiData.errors || apiData.error || apiData.message || apiData);
      } else {
        setErrorMessage("Failed to initiate withdrawal request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericAvailable = parseFloat(walletInfo.available_balance) || 0;

  return (
    <div className="flex flex-col gap-8 py-12 md:px-8 px-4 w-full font-sans text-gray-900 bg-gray-50/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" /> Wallet Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track trip payouts, view pending releases, and manage bank connections.
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
          onClick={() => setIsWithdrawOpen(true)}
        >
          <ArrowUpRight className="w-4 h-4" /> Request Withdrawal
        </Button>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Balance</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {isLoadingBalance ? "..." : `$${numericAvailable.toFixed(2)}`}
          </p>
          <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready for immediate withdrawal
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Balance</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {isLoadingBalance ? "..." : `$${parseFloat(walletInfo.pending_balance).toFixed(2)}`}
          </p>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Locked in secure transaction escrow
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Earned</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {isLoadingBalance ? "..." : `$${parseFloat(walletInfo.total_earned).toFixed(2)}`}
          </p>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Lifetime gross platform payouts
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Withdrawn</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {isLoadingBalance ? "..." : `$${parseFloat(walletInfo.total_withdrawn).toFixed(2)}`}
          </p>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3 text-purple-500" /> Transferred to personal banks
          </p>
        </div>
      </div>

      {/* Chart & Pending Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Takes 2/3 width */}
        <div className="lg:col-span-2">
          <MonthlyWithdrawalChart />
        </div>

        {/* Takes 1/3 width (Same height & layout) */}
        <PendingReleasesCard />
      </div>

      {/* Activity Ledger */}
       <WithdrawalHistory></WithdrawalHistory>
      <RecentActivityLedger />
     

      {/* Integrated Withdrawal Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="max-w-md w-full bg-white font-sans max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {isAddingMethod ? "Add Withdrawal Method" : "Initiate Payout Request"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              {isAddingMethod
                ? "Register a bank account or mobile financial services (MFS) destination."
                : "Transfer cleared balance directly to your primary financial channel."}
            </DialogDescription>
          </DialogHeader>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs rounded-md font-medium">
              {typeof errorMessage === "string" ? (
                errorMessage
              ) : errorMessage.non_field_errors ? (
                <ul className="list-disc list-inside space-y-0.5">
                  {(Array.isArray(errorMessage.non_field_errors)
                    ? errorMessage.non_field_errors
                    : [errorMessage.non_field_errors]
                  ).map((err: any, idx: number) => (
                    <li key={idx}>{String(err)}</li>
                  ))}
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-0.5">
                  {Object.entries(errorMessage).map(([key, val]) => (
                    <li key={key}>
                      <strong className="capitalize">{key.replace("_", " ")}:</strong>{" "}
                      {Array.isArray(val) ? val.join(" ") : String(val)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!isAddingMethod ? (
            <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4 mt-2">
              <div className="text-sm bg-blue-50/60 p-4 rounded-xl border border-blue-100/50 flex justify-between items-center">
                <div>
                  <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">
                    Available Total
                  </p>
                  <p className="text-2xl font-extrabold text-blue-900 mt-0.5">
                    ${numericAvailable.toFixed(2)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold underline p-0"
                  onClick={() => setWithdrawAmount(numericAvailable.toString())}
                >
                  Use Max Total
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Specify Amount ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  max={numericAvailable}
                  min="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className={cn(
                    typeof errorMessage === "object" &&
                      errorMessage?.amount &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                  required
                />
                {typeof errorMessage === "object" && errorMessage?.amount && (
                  <p className="text-[11px] text-red-600 font-medium mt-0.5">
                    {Array.isArray(errorMessage.amount)
                      ? errorMessage.amount.join(" ")
                      : String(errorMessage.amount)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Destination Route
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setIsAddingMethod(true);
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + Add New Route
                  </button>
                </div>

                {methods.length === 0 ? (
                  <div className="text-xs text-gray-500 py-3 border border-dashed rounded-md text-center">
                    No methods found. Click "+ Add New Route" above.
                  </div>
                ) : (
                  <select
                    value={selectedMethodId}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {methods.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.type === "BANK"
                          ? `[BANK] ${pm.bank_name || "Bank"} (${pm.account_number})`
                          : `[${pm.type}] ${pm.account_name} (${pm.account_number})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <DialogFooter className="mt-4">
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsWithdrawOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || methods.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Payout"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleAddMethod} className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-medium">Method Choice</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as MethodType)}
                  className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="BANK">BANK (Bank Transfer)</option>
                  <option value="BKASH">BKASH (bKash)</option>
                  <option value="NAGAD">NAGAD (Nagad)</option>
                  <option value="ROCKET">ROCKET (Rocket)</option>
                </select>
              </div>

              {/* Account Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-medium">Account Name</label>
                <Input
                  placeholder="e.g. John Doe"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className={cn(
                    typeof errorMessage === "object" &&
                      errorMessage?.account_name &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                  required
                />
                {typeof errorMessage === "object" && errorMessage?.account_name && (
                  <p className="text-[11px] text-red-600 font-medium mt-0.5">
                    {Array.isArray(errorMessage.account_name)
                      ? errorMessage.account_name.join(" ")
                      : String(errorMessage.account_name)}
                  </p>
                )}
              </div>

              {/* Account / Mobile Number */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-medium">
                  {selectedType === "BANK" ? "Account Number" : "Mobile Wallet Number"}
                </label>
                <Input
                  placeholder={selectedType === "BANK" ? "1234567890" : "017XXXXXXXX"}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={cn(
                    typeof errorMessage === "object" &&
                      errorMessage?.account_number &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                  required
                />
                {typeof errorMessage === "object" && errorMessage?.account_number && (
                  <p className="text-[11px] text-red-600 font-medium mt-0.5">
                    {Array.isArray(errorMessage.account_number)
                      ? errorMessage.account_number.join(" ")
                      : String(errorMessage.account_number)}
                  </p>
                )}
              </div>

              {selectedType === "BANK" && (
                <>
                  {/* Bank Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600 font-medium">Bank Name</label>
                    <Input
                      placeholder="e.g. City Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className={cn(
                        typeof errorMessage === "object" &&
                          errorMessage?.bank_name &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      required
                    />
                    {typeof errorMessage === "object" && errorMessage?.bank_name && (
                      <p className="text-[11px] text-red-600 font-medium mt-0.5">
                        {Array.isArray(errorMessage.bank_name)
                          ? errorMessage.bank_name.join(" ")
                          : String(errorMessage.bank_name)}
                      </p>
                    )}
                  </div>

                  {/* Branch Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600 font-medium">Branch Name</label>
                    <Input
                      placeholder="e.g. Gulshan Branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className={cn(
                        typeof errorMessage === "object" &&
                          errorMessage?.branch_name &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      required
                    />
                    {typeof errorMessage === "object" && errorMessage?.branch_name && (
                      <p className="text-[11px] text-red-600 font-medium mt-0.5">
                        {Array.isArray(errorMessage.branch_name)
                          ? errorMessage.branch_name.join(" ")
                          : String(errorMessage.branch_name)}
                      </p>
                    )}
                  </div>

                  {/* Routing Number */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600 font-medium">Routing Number</label>
                    <Input
                      placeholder="e.g. 020261144"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className={cn(
                        typeof errorMessage === "object" &&
                          errorMessage?.routing_number &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      required
                    />
                    {typeof errorMessage === "object" && errorMessage?.routing_number && (
                      <p className="text-[11px] text-red-600 font-medium mt-0.5">
                        {Array.isArray(errorMessage.routing_number)
                          ? errorMessage.routing_number.join(" ")
                          : String(errorMessage.routing_number)}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setErrorMessage(null);
                    setIsAddingMethod(false);
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Saving..." : "Save Route"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}