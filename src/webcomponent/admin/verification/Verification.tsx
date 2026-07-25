"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAdminKYCListApi,
  updateAdminKYCStatusApi,
  KYCStatusType,
} from "@/api/kyc.api";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";

// Helper for dynamic status badge styling
const getStatusBadgeStyle = (status: KYCStatusType | string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "under_review":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "approved":
      return "bg-green-100 text-green-700 border-green-300";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export interface KYCUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface KYCRecord {
  id: string;
  user: KYCUser;
  id_type: "national_id" | "passport" | "drivers_license";
  id_number: string;
  document_front: string;
  document_back: string | null;
  selfie: string;
  status: KYCStatusType;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export const Verification = () => {
  const [kycData, setKycData] = useState<KYCRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const itemsPerPage = 10;

  // Fetch KYC List
  const fetchKYCRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminKYCListApi(page);
      setKycData(data.results as KYCRecord[]);
      setTotalCount(data.count);
    } catch (error) {
      console.error("Failed to fetch KYC records:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchKYCRecords();
  }, [fetchKYCRecords]);

  // Handle Approve / Reject actions
  const handleUpdateStatus = async (status: KYCStatusType) => {
    if (!selectedRecord) return;

    let reason: string | null = null;
    if (status === "rejected") {
      reason = prompt("Enter rejection reason:");
      if (!reason) return; // Cancel if no reason provided
    }

    try {
      setActionLoading(true);
      await updateAdminKYCStatusApi(selectedRecord.id, {
        status,
        rejection_reason: reason,
      });

      setSelectedRecord(null);
      fetchKYCRecords(); // Refresh list
    } catch (error) {
      console.error(`Failed to update status to ${status}:`, error);
      alert("An error occurred while updating status.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const formatDocType = (type: string) => {
    switch (type) {
      case "national_id":
        return "National ID";
      case "passport":
        return "Passport";
      case "drivers_license":
        return "Driver's License";
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col gap-6 py-16">
      <HeadingSection
        heading="User Verification"
        subheading="Verify user identity documents"
      />

      <div className="bg-white rounded-lg shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  {[
                    "User Details",
                    "Doc Type",
                    "Doc Number",
                    "Submitted Date",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <TableHead key={h} className="font-bold text-gray-700">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      No verification requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  kycData.map((record) => (
                    <TableRow key={record.id} className="border-none">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.user.first_name} {record.user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{record.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDocType(record.id_type)}</TableCell>
                      <TableCell>{record.id_number}</TableCell>
                      <TableCell>
                        {new Date(record.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadgeStyle(
                            record.status
                          )}`}
                        >
                          {record.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Review Dialog Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-4xl w-full bg-white font-montserrat">
          <DialogHeader>
            <DialogTitle>User Verification Details</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <Tabs defaultValue="personal" className="mt-4">
              <TabsList className="flex w-full overflow-x-auto bg-[#D9D9D9] rounded-full p-1 scrollbar-none">
                <TabsTrigger
                  value="personal"
                  className="shrink-0 px-3 py-1 rounded-full data-[state=active]:bg-white transition-all duration-300"
                >
                  Personal Details
                </TabsTrigger>
                <TabsTrigger
                  value="id"
                  className="shrink-0 px-3 py-1 rounded-full data-[state=active]:bg-white transition-all duration-300"
                >
                  ID Verification
                </TabsTrigger>
                <TabsTrigger
                  value="selfie"
                  className="shrink-0 px-3 py-1 rounded-full data-[state=active]:bg-white transition-all duration-300"
                >
                  Selfie
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <div className="relative mt-3 bg-[#FAFAFA] rounded-lg p-4 h-[420px] overflow-y-auto">
                {/* Personal Details Tab */}
                <TabsContent value="personal" className="h-full">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="flex flex-col gap-1">
                      <strong>First Name:</strong> {selectedRecord.user.first_name}
                    </p>
                    <p className="flex flex-col gap-1 place-self-end">
                      <strong>Last Name:</strong> {selectedRecord.user.last_name}
                    </p>
                    <p className="flex flex-col gap-1">
                      <strong>Email:</strong> {selectedRecord.user.email}
                    </p>
                    <p className="flex flex-col gap-1 place-self-end">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border capitalize w-fit ${getStatusBadgeStyle(
                          selectedRecord.status
                        )}`}
                      >
                        {selectedRecord.status.replace("_", " ")}
                      </span>
                    </p>
                    <p className="flex flex-col gap-1">
                      <strong>Document Type:</strong>{" "}
                      {formatDocType(selectedRecord.id_type)}
                    </p>
                    <p className="flex flex-col gap-1 place-self-end">
                      <strong>Document Number:</strong> {selectedRecord.id_number}
                    </p>
                    {selectedRecord.rejection_reason && (
                      <p className="flex flex-col gap-1 col-span-2 text-red-600">
                        <strong>Rejection Reason:</strong> {selectedRecord.rejection_reason}
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* ID Documents Tab */}
                <TabsContent value="id" className="h-full">
                  <h4 className="font-semibold mb-3">
                    Identity Documents ({formatDocType(selectedRecord.id_type)})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>Front Image</strong>
                      <div className="mt-2 w-full h-56 bg-white border rounded-lg overflow-hidden relative">
                        <Image
                          src={selectedRecord.document_front}
                          alt="Front ID"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    {selectedRecord.document_back && (
                      <div>
                        <strong>Back Image</strong>
                        <div className="mt-2 w-full h-56 bg-white border rounded-lg overflow-hidden relative">
                          <Image
                            src={selectedRecord.document_back}
                            alt="Back ID"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Selfie Tab */}
                <TabsContent value="selfie" className="h-full">
                  <h4 className="font-semibold mb-3">Selfie Verification</h4>
                  <div className="w-full h-64 bg-white border rounded-lg overflow-hidden relative">
                    <Image
                      src={selectedRecord.selfie}
                      alt="User Selfie"
                      fill
                      className="object-contain"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}

          <DialogFooter>
            {selectedRecord?.status === "pending" || selectedRecord?.status === "under_review" ? (
              <div className="flex justify-end gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("rejected")}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateStatus("approved")}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Approve User"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};