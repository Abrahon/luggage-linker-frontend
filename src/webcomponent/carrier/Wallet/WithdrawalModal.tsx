import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getWithdrawalMethods,
  createWithdrawalMethod,
  requestWithdrawal,
  WithdrawMethod,
  MethodType,
  CreateWithdrawMethodPayload,
} from "@/api/wallets.api";

interface WithdrawalModalProps {
  isWithdrawOpen: boolean;
  setIsWithdrawOpen: (open: boolean) => void;
  maxPayout: number | string;
  onSuccess?: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isWithdrawOpen,
  setIsWithdrawOpen,
  maxPayout = 0,
  onSuccess,
}) => {
  const numericMaxPayout =
    typeof maxPayout === "string" ? parseFloat(maxPayout) || 0 : maxPayout;

  // --- UI & Navigation States ---
  const [methods, setMethods] = useState<WithdrawMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddingMethod, setIsAddingMethod] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Dynamic New Method Payload States ---
  const [selectedType, setSelectedType] = useState<MethodType>("BANK");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");

  useEffect(() => {
    if (isWithdrawOpen) {
      fetchMethods();
    } else {
      resetForms();
    }
  }, [isWithdrawOpen]);

  /**
   * Helper to parse and extract backend error messages (Django / DRF format)
   */
  const parseBackendError = (err: any): string => {
    if (!err?.response?.data) {
      return err?.message || "An unexpected error occurred.";
    }

    const data = err.response.data;

    if (typeof data === "string") return data;

    if (data.detail && typeof data.detail === "string") return data.detail;
    if (data.message && typeof data.message === "string") return data.message;
    if (data.error && typeof data.error === "string") return data.error;

    // Handle non_field_errors array
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors.join(" ");
    }

    // Handle object field errors
    if (typeof data === "object") {
      const messages: string[] = [];
      Object.keys(data).forEach((key) => {
        const val = data[key];
        const fieldName = key !== "non_field_errors" ? `${key.replace("_", " ")}: ` : "";
        if (Array.isArray(val)) {
          messages.push(`${fieldName}${val.join(" ")}`);
        } else if (typeof val === "string") {
          messages.push(`${fieldName}${val}`);
        }
      });

      if (messages.length > 0) {
        return messages.join(" | ");
      }
    }

    return "Failed to process request.";
  };

  const fetchMethods = async () => {
    try {
      setErrorMessage(null);
      const data = await getWithdrawalMethods();

      const uniqueMethods = Array.from(
        new Map(data.map((item) => [item.id, item])).values()
      );

      setMethods(uniqueMethods);
      if (uniqueMethods.length > 0) {
        setSelectedMethodId(uniqueMethods[0].id);
      }
    } catch (err: any) {
      setErrorMessage(parseBackendError(err));
    }
  };

  const resetForms = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(false);
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
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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
      const newMethod = res.data || (res as any);

      if (newMethod && newMethod.id) {
        setMethods((prev) => {
          const exists = prev.some((m) => m.id === newMethod.id);
          return exists ? prev : [...prev, newMethod];
        });
        setSelectedMethodId(newMethod.id);
        setIsAddingMethod(false);
        setSuccessMessage("Withdrawal route added successfully!");
        setAccountName("");
        setAccountNumber("");
        setBankName("");
        setBranchName("");
        setRoutingNumber("");
      }
    } catch (err: any) {
      setErrorMessage(parseBackendError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedMethodId) {
      setErrorMessage("Please select or add a payout destination.");
      return;
    }

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Please specify a valid payout amount.");
      return;
    }

    if (amountNum < 10.00) {
      setErrorMessage("Minimum withdrawal amount is $10.00.");
      return;
    }

    if (amountNum > numericMaxPayout) {
      setErrorMessage(`Available balance is only $${numericMaxPayout.toFixed(2)}.`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestWithdrawal({
        withdrawal_method: selectedMethodId,
        amount: amountNum.toFixed(2),
      });

      if (res) {
        setSuccessMessage("Withdrawal request submitted successfully!");
        // Keep isLoading true so the button stays on "Processing..." until modal closes
        setTimeout(() => {
          setIsWithdrawOpen(false);
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(parseBackendError(err));
      setIsLoading(false);
    }
  };

  return (
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

        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs rounded-md">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-md font-medium">
            {successMessage}
          </div>
        )}

        {!isAddingMethod ? (
          <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4 mt-2">
            <div className="text-sm bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
                  Available Total
                </p>
                <p className="text-2xl font-extrabold text-amber-900 mt-0.5">
                  ${numericMaxPayout.toFixed(2)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-amber-600 hover:text-amber-700 font-bold underline p-0"
                onClick={() => setWithdrawAmount(numericMaxPayout.toString())}
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
                placeholder="Minimum $10.00"
                max={numericMaxPayout}
                min="10.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={isLoading || !!successMessage}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Destination Route
                </label>
                <button
                  type="button"
                  disabled={isLoading || !!successMessage}
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setIsAddingMethod(true);
                  }}
                  className="text-xs text-amber-600 hover:text-amber-700 hover:underline font-semibold disabled:opacity-50"
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
                  disabled={isLoading || !!successMessage}
                  className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
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
                  disabled={isLoading || !!successMessage}
                  onClick={() => setIsWithdrawOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || methods.length === 0 || !!successMessage}
                  className="bg-amber-400 hover:bg-amber-500 text-white font-semibold transition-colors disabled:opacity-70"
                >
                  {isLoading || !!successMessage ? "Processing..." : "Confirm Payout"}
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
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <option value="BANK">BANK (Bank Transfer)</option>
                <option value="BKASH">BKASH (bKash)</option>
                <option value="NAGAD">NAGAD (Nagad)</option>
                <option value="ROCKET">ROCKET (Rocket)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 font-medium">Account Name</label>
              <Input
                placeholder="e.g. John Doe"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 font-medium">
                {selectedType === "BANK" ? "Account Number" : "Mobile Wallet Number"}
              </label>
              <Input
                placeholder={selectedType === "BANK" ? "1234567890" : "017XXXXXXXX"}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>

            {selectedType === "BANK" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600 font-medium">Bank Name</label>
                  <Input
                    placeholder="e.g. City Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600 font-medium">Branch Name</label>
                  <Input
                    placeholder="e.g. Gulshan Branch"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600 font-medium">Routing Number</label>
                  <Input
                    placeholder="e.g. 020261144"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    required
                  />
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
                  setSuccessMessage(null);
                  setIsAddingMethod(false);
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="bg-amber-400 hover:bg-amber-500 text-white font-semibold transition-colors disabled:opacity-70"
              >
                {isLoading ? "Saving..." : "Save Route"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};