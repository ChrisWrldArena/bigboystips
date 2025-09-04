/* eslint-disable @next/next/no-img-element */
"use client";
import { useDialog } from "@/app/components/shared/dialog";
import { User } from "@/app/lib/interface";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Edit, MoreVertical, Trash, User as EditUser, Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

const PAGE_SIZE = 50;

type SortField = 'username' | 'email' | 'role' | 'createdAt' | 'emailVerified';
type SortDirection = 'asc' | 'desc';

const UsersClient = () => {
    const dialog = useDialog();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [_updating, setUpdating] = useState(true);
    const [_currentPosition, setCurrentPosition] = useState<number>(-1);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    
    const pageSize = PAGE_SIZE;

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        const filtered = users.filter(user => {
            // Search filter
            const matchesSearch = !searchTerm || 
                user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Role filter
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            
            // Email verified filter
            const matchesEmailVerified = emailVerifiedFilter === 'all' || 
                (emailVerifiedFilter === 'verified' && user.emailVerified) ||
                (emailVerifiedFilter === 'unverified' && !user.emailVerified);
            
            return matchesSearch && matchesRole && matchesEmailVerified;
        });

        // Sort users
        filtered.sort((a, b) => {
            let aValue: string | number | Date | boolean = a[sortField];
            let bValue: string | number | Date | boolean = b[sortField];
            
            if (sortField === 'createdAt') {
                aValue = new Date(aValue as string | number | Date);
                bValue = new Date(bValue as string | number | Date);
            } else if (sortField === 'emailVerified') {
                // For boolean values, true comes first in ascending order
                aValue = aValue ? 1 : 0;
                bValue = bValue ? 1 : 0;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [users, searchTerm, roleFilter, emailVerifiedFilter, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Sorting functions
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setEmailVerifiedFilter('all');
        setCurrentPage(1);
    };

    // Sortable header component
    const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <th 
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                {sortField === field && (
                    sortDirection === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                )}
            </div>
        </th>
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, emailVerifiedFilter]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/user/?include=" + JSON.stringify({ subscriptions: true }));
                if (!res.ok) throw new Error("Failed to fetch users");
                const data = await res.json();

                setUsers(data);
            } catch {
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const deleteUser = async (index: number, id: string) => {
        setCurrentPosition(index);
        dialog.showDialog({
            title: "Delete user",
            message: "Are you sure you want to delete this user? This action cannot be undone.",
            type: "confirm",
            onConfirm: async () => {
                setUpdating(true);
                try {
                    const response = await fetch(`/api/user/${id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!response.ok) throw new Error("Failed to delete user");
                    setUsers(users.filter(pred => pred.id !== id));
                    setUpdating(false);
                } catch (error) {
                    setUpdating(false);
                    console.error("Error deleting user:", error);
                }

            }
        })
    }
    const updateUser = async (index: number, user: User, data: string) => {
        setCurrentPosition(index);
        const { id, ..._dataWithoutId } = user;
        dialog.showDialog({
            title: "Update user",
            message: `Are you sure you want to update this user to "${data}"?`,
            type: "confirm",
            onConfirm: async () => {
                setUpdating(true);
                try {
                    const response = await fetch(`/api/user/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            //...dataWithoutId,
                            role: data,
                        }),
                    });
                    if (!response.ok) throw new Error("Failed to Update user");
                    const result = await response.json();

                    const updatedusers = [...users];
                    updatedusers[index] = {
                        ...updatedusers[index],
                        role: data as User['result'],
                    };
                    setUsers([
                        ...updatedusers
                    ])
                    setUpdating(false);
                    console.log("user updated successfully:", result);
                    // setusers(result);
                } catch (error) {
                    setUpdating(false);
                    console.error("Error updating user:", error);
                }

            }
        })
    }

    return (
        <div className="p-4 bg-white">
            <div className="sticky top-0 flex items-center justify-between bg-white border-b border-gray-200 z-10">

                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage this tall list of users.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        href="/dashboard/users/create"
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto">
                        Add User
                    </Link>
                </div>
            </div>
            
            {/* Search and Filters */}
            <div className="mt-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Filters:</span>
                    </div>
                    
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="USER">User</option>
                    </select>

                    <select
                        value={emailVerifiedFilter}
                        onChange={(e) => setEmailVerifiedFilter(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="all">All Verification Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>

                    {(searchTerm || roleFilter !== 'all' || emailVerifiedFilter !== 'all') && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1 text-sm text-orange-600 hover:text-orange-800 underline"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                    Showing {paginatedUsers.length} of {filteredUsers.length} users
                    {filteredUsers.length !== users.length && ` (filtered from ${users.length} total)`}
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="overflow-x-auto  ring-1 ring-neutral-300 ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <SortableHeader field="username">Username</SortableHeader>
                                <SortableHeader field="email">Email Address</SortableHeader>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country Info</th>
                                <SortableHeader field="emailVerified">Email Verified</SortableHeader>
                                <SortableHeader field="role">Role</SortableHeader>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                <SortableHeader field="createdAt">Member since</SortableHeader>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {loading ? (
                                <tr className="w-full">
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr className="w-full">
                                    <td colSpan={7} className="text-center py-8 text-gray-500">No users found.</td></tr>
                            ) : (
                                paginatedUsers.map((user, i) => {
                                    const location = user.location ? JSON.parse(user.location) : {};
                                    return (
                                        <tr key={user.id}>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                {user.username}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                <div className="inline-flex items-center">
                                                    <img
                                                        src={location.flag || "/default-avatar.png"}
                                                        alt={user.username}
                                                        className="h-6 w-6 rounded-full mr-2" />
                                                    {location.country} &bull; ({location.currencycode})
                                                    <br />
                                                    {location.region}
                                                </div>


                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.emailVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"> {user.subscriptions?.length || "None"}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{moment(user.createdAt).format("LLL")}</td>
                                            {users.length > 0 && !loading && <td className="justify-end whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium">

                                                <Popover>
                                                    <PopoverTrigger className='max-w-lg w-full' asChild>
                                                        <MoreVertical
                                                            className="text-neutral-500 cursor-pointer hover:text-neutral-600 size-5 outline-0"
                                                            tabIndex={0}
                                                        />

                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className=" h-auto  bg-white z-50 rounded-lg border border-neutral-300 p-2 outline-0">

                                                        <button
                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            onClick={() => {
                                                                // Navigate to edit page
                                                                updateUser(i, user, user.role === 'ADMIN' ? 'USER' : 'ADMIN');
                                                            }}
                                                        >
                                                            <EditUser className="w-4 h-4 text-neutral-500" />
                                                            {user.role === 'ADMIN' ? 'Make User' : 'Make Admin'}
                                                        </button>
                                                        <button
                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            onClick={() => {
                                                                // Navigate to edit page
                                                                window.location.href = `/dashboard/users/update/?id=${user.id}`;
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4 text-gray-500" />
                                                            Edit User
                                                        </button>
                                                        <button
                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                            onClick={() => deleteUser(i, user.id)}
                                                        >
                                                            <Trash className="w-4 h-4 text-red-500" />
                                                            Delete User
                                                        </button>


                                                    </PopoverContent>
                                                </Popover>
                                            </td>}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {filteredUsers.length > 0 && totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <button
                                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersClient;
