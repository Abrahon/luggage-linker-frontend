"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  Plus, 
  ArrowDownLeft, 
  TrendingUp, 
  HelpCircle,
  Building2,
  Trash2
} from "lucide-react";

// Mock Data matching structural layout criteria
const initialTransactions = [
  { id: "TXN-7721", type: "Earnings", booking: "BKO-9921", amount: 120.00, date: "2026-07-05", status: "Completed" },
  { id: "TXN-7610", type: "Earnings", booking: "BKO-4821", amount: 130.00, date: "2026-07-02", status: "Completed" },
  { id: "TXN-7402", type: "Withdrawal", booking: "—", amount: -200.00, date: "2026-06-28", status: "Completed" },
  { id: "TXN-7399", type: "Earnings", booking: "BKO-1029", amount: 250.00, date: "2026-06-15", status: "Completed" },
];

const pendingEarnings = [
  { id: "PEND-01", booking: "BKO-3341", amount: 70.00, releaseDate: "Expected 2026-07-12", source: "Delivery Delivery Escrow" },
  { id: "PEND-02", booking: "BKO-8812", amount: 50.00, releaseDate: "Expected 2026-07-15", source: "Luggage Spacing Premium" },
];

const withdrawalHistory = [
  { id: "WTH-991", amount: 200.00, method: "Bank Transfer (•••• 4321)", date: "2026-06-28", status: "Completed" },
  { id: "WTH-982", amount: 150.00, method: "PayPal (mehedy***@email.com)", date: "2026-05-14", status: "Completed" },
];

const initialPaymentMethods = [
  { id: "PM-01", type: "Bank", name: "Chase Checking", details: "•••• 4321", isDefault: true },
  { id: "PM-02", type: "PayPal", name: "Personal PayPal", details: "mehedy***@email.com", isDefault: false },
];

// Simple Simulated Data Structure for Monthly Earnings Chart
const chartData = [
  { month: "Feb", amount: 180 },
  { month: "Mar", amount: 320 },
  { month: "Apr", amount: 210 },
  { month: "May", amount: 450 },
  { month: "Jun", amount: 500 },
  { month: "Jul", amount: 250 },
];

export default function TravelerWallet() {
  // Payout Modals Local State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("PM-01");

  // Local State collections
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);

  const maxPayout = 250.00; // Available matching balance parameters

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > maxPayout) {
      alert("Please specify a valid payout range fitting your available balances.");
      return;
    }
    alert(`Payout sequence initiated successfully!\nAmount: $${amount.toFixed(2)}\nProcessing channels take 1-3 regulatory bank business days.`);
    setIsWithdrawOpen(false);
    setWithdrawAmount("");
  };

  const handleRemoveMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
  };

  return (
   // 🚀 Update your container wrapper line to this:
<div className="flex flex-col gap-8 py-12 md:px-8 px-4 w-full font-sans text-gray-900 bg-gray-50/30">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" /> Wallet Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your traveler trip payouts, view pending releases, and manage bank connections.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
          onClick={() => setIsWithdrawOpen(true)}
        >
          <ArrowUpRight className="w-4 h-4" /> Request Withdrawal
        </Button>
      </div>

      {/* 1. Quad Balances Summary Grid Grid Container Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Balance</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">${maxPayout.toFixed(2)}</p>
          <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready for immediate withdrawal
          </p>
        </div>

        {/* Pending Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Balance</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">$120.00</p>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Locked in secure transaction escrow
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Earned</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">$700.00</p>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Lifetime gross platform payouts
          </p>
        </div>

        {/* Withdrawn */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Withdrawn</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">$350.00</p>
          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3 text-purple-500" /> Transferred to personal banks
          </p>
        </div>
      </div>

      {/* 2. Monthly Earnings Chart & Pending Area Row Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Earnings Chart Block */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Earnings</h3>
                <p className="text-xs text-gray-400">Visual performance breakdown of historical trip payouts</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold">2026 Ledger</span>
            </div>

            {/* Custom Visual Bar Chart Element */}
            <div className="h-48 flex items-end gap-4 pt-6 pb-2 px-2">
              {chartData.map((data, index) => {
                const maxAmount = Math.max(...chartData.map(d => d.amount));
                const heightPercentage = (data.amount / maxAmount) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full relative rounded-t-md bg-gray-100 group-hover:bg-blue-100 transition-colors flex items-end h-36">
                      <div 
                        style={{ height: `${heightPercentage}%` }}
                        className="w-full bg-blue-600 rounded-t-md transition-all duration-500 relative group-hover:bg-blue-700"
                      >
                        {/* Tooltip dynamic prompt */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
                          ${data.amount}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pending Earnings Right Block Column */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
          {/* Fixed Type-Safe Code */}
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
            <span>Pending Releases</span>
            <span title="Funds held securely until transport verifies shipment arrivals" className="cursor-help flex items-center">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            </span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">Secured amounts queued for automated settlement</p>
            
            <div className="flex flex-col gap-3">
              {pendingEarnings.map((pnd) => (
                <div key={pnd.id} className="p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800">{pnd.source}</span>
                    <span className="text-[11px] text-gray-400 font-mono mt-0.5">{pnd.booking} • {pnd.releaseDate}</span>
                  </div>
                  <span className="text-sm font-bold text-amber-700">+${pnd.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 italic mt-4 text-center">Funds process out of escrow instantly following traveler order confirmations.</p>
        </div>
      </div>

      {/* 3. Recent Transactions & Withdrawal History Data Layout Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions Elements */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Recent Activity Ledger</h3>
            <p className="text-xs text-gray-400 mb-4">Complete tracking of standard inflow and outflow records</p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/60">
                  <TableRow>
                    <TableHead className="text-xs font-semibold py-2">Reference / Date</TableHead>
                    <TableHead className="text-xs font-semibold py-2">Type</TableHead>
                    <TableHead className="text-xs font-semibold py-2 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialTransactions.map((txn) => (
                    <TableRow key={txn.id} className="hover:bg-gray-50/40">
                      <TableCell className="py-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">{txn.id}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{txn.date} {txn.booking !== "—" && `• ${txn.booking}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-medium inline-block",
                          txn.type === "Earnings" ? "bg-green-50 text-green-700" : "bg-purple-50 text-purple-700"
                        )}>
                          {txn.type}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                        "text-xs font-bold text-right py-2.5",
                        txn.amount > 0 ? "text-green-600" : "text-gray-900"
                      )}>
                        {txn.amount > 0 ? "+" : ""}${txn.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Withdrawal History Elements */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Withdrawal Logs</h3>
            <p className="text-xs text-gray-400 mb-4">Historical record of manual payout transfers</p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/60">
                  <TableRow>
                    <TableHead className="text-xs font-semibold py-2">Withdrawal ID</TableHead>
                    <TableHead className="text-xs font-semibold py-2">Method / Date</TableHead>
                    <TableHead className="text-xs font-semibold py-2 text-right">Settled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalHistory.map((wth) => (
                    <TableRow key={wth.id} className="hover:bg-gray-50/40">
                      <TableCell className="py-2.5 text-xs font-semibold text-gray-800">{wth.id}</TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600 font-medium">{wth.method}</span>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5">{wth.date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-right text-gray-900 py-2.5">
                        -${wth.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Payment Methods Block Section Panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Linked Payout Accounts</h3>
            <p className="text-xs text-gray-400">Manage bank checking routes or financial addresses where funds route</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 hover:bg-gray-50 border-gray-200"
            onClick={() => alert("Redirecting initialization layout logic to structural plaid/stripe processing pipeline integrations...")}
          >
            <Plus className="w-3.5 h-3.5" /> Link Method
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-4 border border-gray-100 bg-gray-50/40 rounded-xl flex items-center justify-between group hover:border-gray-200/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500">
                  {method.type === "Bank" ? <Building2 className="w-5 h-5 text-blue-500" /> : <CreditCard className="w-5 h-5 text-purple-500" />}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{method.name}</span>
                    {method.isDefault && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Primary</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-mono mt-0.5">{method.details}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-rose-600 rounded-lg"
                title="Remove account entry"
                onClick={() => handleRemoveMethod(method.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Request Withdrawal Modal Dialog View */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="max-w-md w-full bg-white font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Initiate Payout Request</DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Transfer your cleared, available travel earnings securely to your active financial channels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4 mt-2">
            <div className="text-sm bg-blue-50/60 p-4 rounded-xl border border-blue-100/50 flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Maximum Payout Available</p>
                <p className="text-2xl font-extrabold text-blue-900 mt-0.5">${maxPayout.toFixed(2)}</p>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                className="text-xs text-blue-600 hover:text-blue-700 font-bold underline p-0"
                onClick={() => setWithdrawAmount(maxPayout.toString())}
              >
                Use Max Total
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Specify Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                max={maxPayout}
                min="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Destination Account Route</label>
              <select 
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-gray-800 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.details})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="mt-4">
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" type="button" onClick={() => setIsWithdrawOpen(false)}>
                  Cancel Request
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Confirm Payout
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}