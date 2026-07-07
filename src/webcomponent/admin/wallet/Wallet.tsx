"use client";

import { useState } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Ban, ShieldCheck, Scale, History } from "lucide-react";

// Interface
export interface WalletItem {
  userId: string;
  userName: string;
  role: "Traveler" | "Sender";
  availableBalance: number;
  pendingBalance: number;
  refundBalance: number;
  status: "Active" | "Negative" | "Frozen";
}

// Dummy Data matching criteria
const initialWallets: WalletItem[] = [
  {
    userId: "W-88201",
    userName: "John Doe",
    role: "Traveler",
    availableBalance: 250,
    pendingBalance: 120,
    refundBalance: 0,
    status: "Active",
  },
  {
    userId: "W-44102",
    userName: "Sarah Jenkins",
    role: "Sender",
    availableBalance: 45,
    pendingBalance: 0,
    refundBalance: 35,
    status: "Active",
  },
  {
    userId: "W-10923",
    userName: "Alex Rivera",
    role: "Traveler",
    availableBalance: -15,
    pendingBalance: 0,
    refundBalance: 0,
    status: "Negative",
  },
  {
    userId: "W-55124",
    userName: "Michael Chang",
    role: "Sender",
    availableBalance: 0,
    pendingBalance: 0,
    refundBalance: 0,
    status: "Frozen",
  },
];

export const Wallet = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Negative" | "Frozen">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "Traveler" | "Sender">("all");
  const [page, setPage] = useState(1);
  
  // Modals Local State Management
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");

  const rowsPerPage = 5;

  // Filter Logic
  const filteredWallets = initialWallets.filter((w) => {
    const matchesSearch = w.userName.toLowerCase().includes(search.toLowerCase()) || w.userId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    const matchesRole = roleFilter === "all" || w.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredWallets.length / rowsPerPage);
  const paginatedData = filteredWallets.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  // Admin Actions Handlers
  const handleViewWallet = (wallet: WalletItem) => {
    alert(`Loading global breakdown statement overview for: ${wallet.userName}`);
  };

  const handleAdjustBalanceSubmit = () => {
    if (!selectedWallet || !adjustAmount) return;
    const value = parseFloat(adjustAmount);
    alert(`Successfully processed standard accounting ledger entry!\nAction: ${adjustType.toUpperCase()}\nTarget Wallet ID: ${selectedWallet.userId}\nValue: $${value.toFixed(2)}`);
    setIsAdjustOpen(false);
    setAdjustAmount("");
  };

  const handleToggleFreeze = (wallet: WalletItem) => {
    const nextState = wallet.status === "Frozen" ? "Unfreezing" : "Freezing";
    alert(`${nextState} secure ledger connection for ${wallet.userName} (${wallet.userId}) account state rows.`);
  };

  const handleViewTransactions = (wallet: WalletItem) => {
    alert(`Fetching operational historical transaction ledger entries matching target ID: ${wallet.userId}`);
  };

  return (
    <div className="flex flex-col gap-8 py-16 md:px-6 px-4 max-w-7xl mx-auto w-full">
      <HeadingSection
        heading="System Wallets"
        subheading="Monitor centralized user deposit points, manage structural ledger rules, and view global platform escrow states"
      />

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Wallet Balance", value: "$120,500", color: "border-l-blue-500", desc: "Aggregated global system credits" },
          { label: "Traveler Wallets", value: "245", color: "border-l-emerald-500", desc: "Registered logic accounts" },
          { label: "Sender Refund Wallets", value: "18", color: "border-l-indigo-500", desc: "Active dynamic claim pathways" },
          { label: "Negative Wallets", value: "3", color: "border-l-rose-500", desc: "Accounts requiring prompt attention" },
        ].map((card, idx) => (
          <div key={idx} className={cn("bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4", card.color)}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Filters Control Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-2">
        <div className="relative w-full lg:w-1/3">
          <Input
            placeholder="Search by User Name or Wallet ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <Select
            value={roleFilter}
            onValueChange={(v: typeof roleFilter) => {
              setRoleFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Traveler">Traveler</SelectItem>
              <SelectItem value="Sender">Sender</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v: typeof statusFilter) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Negative">Negative</SelectItem>
              <SelectItem value="Frozen">Frozen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Wallet Table Container */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-visible">
        <Table>
          <TableHeader className="bg-gray-50/70">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">User</TableHead>
              <TableHead className="font-semibold text-gray-700">Role</TableHead>
              <TableHead className="font-semibold text-gray-700">Available</TableHead>
              <TableHead className="font-semibold text-gray-700">Pending</TableHead>
              <TableHead className="font-semibold text-gray-700">Refund</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((wallet, index) => (
                <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{wallet.userName}</span>
                      <span className="text-xs text-gray-400 font-mono">{wallet.userId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-xs px-2.5 py-0.5 font-medium rounded-md",
                      wallet.role === "Traveler" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                    )}>
                      {wallet.role}
                    </span>
                  </TableCell>
                  <TableCell className={cn(
                    "font-semibold",
                    wallet.availableBalance < 0 ? "text-rose-600" : "text-gray-900"
                  )}>
                    {wallet.availableBalance < 0 ? "-" : ""}${Math.abs(wallet.availableBalance).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-gray-600 font-medium">${wallet.pendingBalance.toFixed(2)}</TableCell>
                  <TableCell className="text-amber-600 font-medium">${wallet.refundBalance.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide inline-block",
                      wallet.status === "Active" && "bg-green-100 text-green-800",
                      wallet.status === "Negative" && "bg-orange-100 text-orange-800",
                      wallet.status === "Frozen" && "bg-slate-100 text-slate-800"
                    )}>
                      {wallet.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 bg-white shadow-md rounded-lg border border-gray-100 z-50">
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50" onClick={() => handleViewWallet(wallet)}>
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>View Wallet</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50" onClick={() => {
                          setSelectedWallet(wallet);
                          setIsAdjustOpen(true);
                        }}>
                          <Scale className="w-4 h-4 text-amber-500" />
                          <span>Adjust Balance</span>
                        </DropdownMenuItem>

                        {wallet.status === "Frozen" ? (
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50" onClick={() => handleToggleFreeze(wallet)}>
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>Unfreeze Wallet</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50" onClick={() => handleToggleFreeze(wallet)}>
                            <Ban className="w-4 h-4 text-rose-400" />
                            <span>Freeze Wallet</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-gray-100" />

                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50" onClick={() => handleViewTransactions(wallet)}>
                          <History className="w-4 h-4 text-gray-400" />
                          <span>View Transactions</span>
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No tracking wallet files discovered.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination View */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-2">
          <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Interactive Adjustment Dialog Modal */}
      <Dialog open={isAdjustOpen} onOpenChange={(open) => {
        if(!open) setIsAdjustOpen(false);
      }}>
        <DialogContent className="max-w-md w-full bg-white font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Manual Financial Adjustment</DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Inject or deduct custom processing balance credits straight to secure system rows.
            </DialogDescription>
          </DialogHeader>

          {selectedWallet && (
            <div className="flex flex-col gap-4 my-2">
              <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
                <p className="text-gray-600"><span className="font-semibold text-gray-900">User:</span> {selectedWallet.userName}</p>
                <p className="text-gray-600 font-mono text-xs"><span className="font-semibold text-gray-900">ID:</span> {selectedWallet.userId}</p>
                <p className="text-gray-600 mt-1"><span className="font-semibold text-gray-900">Current Balance:</span> ${selectedWallet.availableBalance.toFixed(2)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Adjustment Framework</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button"
                    variant={adjustType === "add" ? "default" : "outline"}
                    className={cn(adjustType === "add" && "bg-emerald-600 text-white hover:bg-emerald-700")}
                    onClick={() => setAdjustType("add")}
                  >
                    Add Funds
                  </Button>
                  <Button 
                    type="button"
                    variant={adjustType === "deduct" ? "default" : "outline"}
                    className={cn(adjustType === "deduct" && "bg-rose-600 text-white hover:bg-rose-700")}
                    onClick={() => setAdjustType("deduct")}
                  >
                    Deduct Funds
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount ($)</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>
                Cancel Override
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAdjustBalanceSubmit}>
                Commit Adjustment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};