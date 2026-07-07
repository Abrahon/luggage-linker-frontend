"use client";

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
import { Eye } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";

export interface VerificationProps {
  name: string;
  email: string;
  role: "carrier" | "sender";
  documentType: "Passport" | "National ID" | "Driver License";
  country: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "expired";
  phoneNumber: string;
  nationalId: string;
  nationality: string;
  dateOfBirth: string;
  idFrontImageUrl: string;
  idBackImageUrl: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  selfieImageUrl: string[];
  reviewedBy?: string;
  reviewedAt?: string;
}

const demoData: VerificationProps[] = Array.from({ length: 8 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@gmail.com`,
  role: "carrier",
  documentType: "Passport",
  country: "Bangladesh",
  submittedAt: "12-09-2025",
  status:
    i % 4 === 0
      ? "pending"
      : i % 4 === 1
      ? "approved"
      : i % 4 === 2
      ? "rejected"
      : "expired",
  phoneNumber: "+8801XXXXXXXXX",
  nationalId: "1234567890",
  nationality: "Bangladeshi",
  dateOfBirth: "12 March, 1992",
  idFrontImageUrl: "/admin/id1.png",
  idBackImageUrl: "/admin/id2.jpg",
  addressLine1: "House 12, Road 3",
  addressLine2: "Block A",
  city: "Dhaka",
  state: "Dhaka",
  zip: "1212",
  selfieImageUrl: [
    "/admin/selfie1.png",
    "/admin/selfie2.png",
    "/admin/selfie3.png",
    "/admin/selfie4.png",
  ],
}));

export const Verification = () => {
  const [selectedUser, setSelectedUser] = useState<VerificationProps | null>(
    null
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedData = demoData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(demoData.length / itemsPerPage);

  return (
    <div className="flex flex-col gap-6 py-16">
      <HeadingSection
        heading="User Verification"
        subheading="Verify the user with documents"
      />

      <div className="bg-white rounded-lg shadow-sm p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-none">
              {[
                "User Details",
                "Role",
                "Doc Type",
                "Country",
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
            {paginatedData.map((user, idx) => (
              <TableRow key={idx} className="border-none">
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize rounded-full border px-3 py-1 text-sm">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>{user.documentType}</TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>{user.submittedAt}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                    ${
                      user.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : user.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : user.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
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
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl w-full bg-white font-montserrat">
          <DialogHeader>
            <DialogTitle>User Verification Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
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
                  value="address"
                  className="shrink-0 px-3 py-1 rounded-full data-[state=active]:bg-white transition-all duration-300"
                >
                  Address
                </TabsTrigger>
                <TabsTrigger
                  value="selfie"
                  className="shrink-0 px-3 py-1 rounded-full data-[state=active]:bg-white transition-all duration-300"
                >
                  Selfie
                </TabsTrigger>
              </TabsList>

              {/* Each tab container layout */}
              <div className="relative mt-3 bg-[#FAFAFA] rounded-lg p-4 h-[420px] overflow-y-auto">
                {/* Personal Details */}
                <TabsContent value="personal" className="h-full">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="flex flex-col gap-2">
                      <strong>Name:</strong> {selectedUser.name}
                    </p>
                    <p className="flex flex-col gap-2 place-self-end">
                      <strong>Status:</strong>{" "}
                      <span className="capitalize">{selectedUser.status}</span>
                    </p>
                    <p className="flex flex-col gap-2">
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                    <p className="flex flex-col gap-2 place-self-end">
                      <strong>Phone:</strong> {selectedUser.phoneNumber}
                    </p>
                    <p className="flex flex-col gap-2">
                      <strong>Nationality:</strong> {selectedUser.nationality}
                    </p>
                    <p className="flex flex-col gap-2 place-self-end">
                      <strong>Date of Birth:</strong> {selectedUser.dateOfBirth}
                    </p>
                    <p className="flex flex-col gap-2">
                      <strong>National ID / Doc Number:</strong>{" "}
                      {selectedUser.nationalId}
                    </p>
                    <p className="flex flex-col gap-2 place-self-end">
                      <strong>Document Type:</strong>{" "}
                      {selectedUser.documentType}
                    </p>
                  </div>
                </TabsContent>

                {/* ID Verification */}
                <TabsContent value="id" className="h-full">
                  <h4 className="font-semibold mb-3">
                    Identity Documents ({selectedUser.documentType})
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div>
                      <strong>Front Image</strong>
                      <div className="mt-2 w-full h-48 bg-white border rounded-lg overflow-hidden">
                        <Image
                          src={selectedUser.idFrontImageUrl}
                          alt="Front ID"
                          width={600}
                          height={600}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <strong>Back Image</strong>
                      <div className="mt-2 w-full h-48 bg-white border rounded-lg overflow-hidden">
                        <Image
                          src={selectedUser.idBackImageUrl}
                          alt="Back ID"
                          width={600}
                          height={600}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Address */}
                <TabsContent value="address" className="h-full">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="flex flex-col gap-2">
                      <strong>Address Line 1:</strong>{" "}
                      {selectedUser.addressLine1}
                    </p>
                    <p className="flex flex-col gap-2 place-self-end">
                      <strong>Address Line 2:</strong>{" "}
                      {selectedUser.addressLine2 || "N/A"}
                    </p>
                    <p className="flex flex-col gap-2">
                      <strong>City:</strong> {selectedUser.city}
                    </p>
                    <p className="flex flex-col gap-2 place-self-end">
                      <strong>State:</strong> {selectedUser.state}
                    </p>
                    <p className="flex flex-col gap-2">
                      <strong>Zip:</strong> {selectedUser.zip}
                    </p>
                    <p className="flex flex-col gap-2 place-self-end">
                      <strong>Country:</strong> {selectedUser.country}
                    </p>
                  </div>
                </TabsContent>

                {/* Selfie */}
                <TabsContent value="selfie" className="h-full">
                  <h4 className="font-semibold mb-3">Selfie Verification</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {selectedUser.selfieImageUrl.map((img, i) => (
                      <div
                        key={i}
                        className="w-[60px] h-[60px] border rounded-lg overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt={`Selfie ${i + 1}`}
                          width={60}
                          height={60}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}

          <DialogFooter>
            {selectedUser?.status === "pending" ? (
              <div className="flex justify-end gap-3 w-full">
                <Button variant="outline">Reject</Button>
                <Button>Approve User</Button>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
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