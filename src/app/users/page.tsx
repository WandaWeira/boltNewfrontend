"use client";
import React, { useState } from "react";
import {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/state/api";
import { Eye, EyeOff, Edit, Trash, Plus } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  ninNumber: string;
  phoneNumber: string;
}

const userRoles = [
  "RegionalCoordinator",
  "DistrictRegistra",
  "PEO",
  "SuperAdmin",
];

const UsersPage: React.FC = () => {
  const { data: users, isLoading, isError, refetch } = useGetUsersQuery();
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({});

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleAddUser = async () => {
    try {
      await addUser(newUser as User);
      setIsModalOpen(false);
      setNewUser({});
      refetch();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      const updatedUser = { ...editingUser, ...newUser };
      try {
        await updateUser(updatedUser).unwrap();
        setIsModalOpen(false);
        setEditingUser(null);
        refetch();
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      refetch();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setNewUser({});
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setNewUser(user);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading users</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <button
          onClick={openAddModal}
          className="mb-4 bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New User
        </button>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Password</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">NIN Number</th>
            <th className="px-4 py-2">Phone Number</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) &&
            users.map((user: User) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{`${user.firstName} ${user.lastName}`}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">
                  <div className="flex items-center">
                    <input
                      type={showPassword[user.id] ? "text" : "password"}
                      value={user.password}
                      readOnly
                      className="bg-gray-100 px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => togglePasswordVisibility(user.id)}
                      className="ml-2"
                    >
                      {showPassword[user.id] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border px-4 py-2">{user.ninNumber}</td>
                <td className="border px-4 py-2">{user.phoneNumber}</td>
                <td className="border px-4 py-2">
                  <button onClick={() => openEditModal(user)} className="mr-2">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 shadow-xl">
          <div className="bg-white p-8 rounded w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-6">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingUser ? handleUpdateUser() : handleAddUser();
              }}
            >
              <input
                placeholder="First Name"
                value={newUser.firstName || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              />
              <input
                placeholder="Last Name"
                value={newUser.lastName || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              />
              <input
                placeholder="Email"
                type="email"
                value={newUser.email || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              />
              <input
                placeholder="Password"
                type="password"
                value={newUser.password || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              />
              <select
                value={newUser.role || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              >
                <option value="">Select Role</option>
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <input
                placeholder="NIN Number"
                value={newUser.ninNumber || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, ninNumber: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              />
              <input
                placeholder="Phone Number"
                value={newUser.phoneNumber || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, phoneNumber: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editingUser ? "Update" : "Add"} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
