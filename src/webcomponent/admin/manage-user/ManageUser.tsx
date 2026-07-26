"use client";

import { useState, useEffect, useCallback } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Search, Ban, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Updated API Response Item Type with Name fields
export interface ApiUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Fallback if backend returns full name
  role: string;
  is_active: boolean;
  is_online: boolean;
  last_seen: string | null;
  is_staff: boolean;
  is_verified: boolean;
  date_joined: string;
  updated_at: string;
}

export interface PaginatedUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiUser[];
}

export const ManageUser = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [actionType, setActionType] = useState<"ban" | "unban">("ban");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Debounce search input to reduce unnecessary backend requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      if (roleFilter !== "all") params.append("role", roleFilter.toUpperCase());
      if (statusFilter !== "all") {
        params.append("is_active", statusFilter === "active" ? "true" : "false");
      }

      const response = await axiosInstance.get<PaginatedUserResponse>(
        `/api/admin/users/?${params.toString()}`
      );

      setUsers(response.data.results);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Ban / Unban confirmation
  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const endpoint = `/api/admin/users/${selectedUser.id}/${actionType}/`;

      await axiosInstance.patch(endpoint);

      await fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error(`Error updating user status:`, error);
      alert(`Failed to ${actionType} user. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format full name cleanly
  const getUserFullName = (user: ApiUser) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    if (user.name) return user.name;
    return "—";
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  return (
    <div className="flex flex-col gap-6 py-16 md:px-6 px-4 font-montserrat">
      <HeadingSection heading="User Management" subheading="Manage all users" />

      {/* Search & Filter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="traveler">Traveler</SelectItem>
              <SelectItem value="sender">Sender</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {/* User Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Email</TableHead>
              <TableHead className="font-semibold text-gray-700">Role</TableHead>
              <TableHead className="font-semibold text-gray-700">Join Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={20} />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isBanned = !user.is_active;
                const formattedDate = new Date(user.date_joined).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const fullName = getUserFullName(user);

                return (
                  <TableRow
                    key={user.id}
                    className={cn(
                      "transition-colors hover:bg-gray-50/80",
                      isBanned && "bg-gray-50/50 text-gray-500"
                    )}
                  >
                    <TableCell className="font-medium text-gray-900 capitalize">
                      {fullName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role.toLowerCase()}</TableCell>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center",
                          user.is_active
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        )}
                      >
                        {user.is_active ? "Active" : "Banned"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "flex items-center gap-1.5 font-medium",
                          isBanned
                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                        )}
                        onClick={() => {
                          setSelectedUser(user);
                          setActionType(isBanned ? "unban" : "ban");
                        }}
                      >
                        <Ban size={15} />
                        {isBanned ? "Unban" : "Ban"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Ban/Unban Modal Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-white max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {actionType === "ban"
                ? "Are you sure you want to ban this user?"
                : "Are you sure you want to unban this user?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 leading-relaxed">
            This action will {actionType === "ban" ? "restrict" : "restore"} access for{" "}
            <strong className="text-gray-900">
              {selectedUser ? getUserFullName(selectedUser) : ""} ({selectedUser?.email})
            </strong>
            .
            {actionType === "ban"
              ? " They will no longer be able to log in or use platform features."
              : " They will be allowed back onto the platform."}
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className={cn(
                actionType === "ban"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              )}
              onClick={handleConfirmAction}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin mr-2" size={16} />}
              Confirm {actionType === "ban" ? "Ban" : "Unban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};