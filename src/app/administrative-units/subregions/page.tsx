"use client";

import React, { useState, useMemo } from "react";
import {
  useGetSubregionsQuery,
  useCreateSubregionMutation,
  useUpdateSubregionMutation,
  useDeleteSubregionMutation,
  useGetRegionalCoordinatorsInSubregionQuery,
  useCreateRegionalCoordinatorMutation,
  useUpdateRegionalCoordinatorMutation,
  useDeleteRegionalCoordinatorMutation,
  useGetRegionsQuery,
} from "@/state/api";
import { Edit, Trash, Plus } from "lucide-react";

interface SubregionModel {
  id: number;
  name: string;
  regionId: number;
}

interface RegionModel {
  id: number;
  name: string;
}

interface RegionalCoordinator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ninNumber: string;
  isActive: boolean;
}

const SubregionsPage: React.FC = () => {
  const {
    data: subregions,
    isLoading,
    isError,
    refetch,
  } = useGetSubregionsQuery();
  const { data: regions } = useGetRegionsQuery();
  const [createSubregion] = useCreateSubregionMutation();
  const [updateSubregion] = useUpdateSubregionMutation();
  const [deleteSubregion] = useDeleteSubregionMutation();

  const [createRegionalCoordinator] = useCreateRegionalCoordinatorMutation();
  const [updateRegionalCoordinator] = useUpdateRegionalCoordinatorMutation();
  const [deleteRegionalCoordinator] = useDeleteRegionalCoordinatorMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoordinatorModalOpen, setIsCoordinatorModalOpen] = useState(false);
  const [editingSubregion, setEditingSubregion] =
    useState<SubregionModel | null>(null);
  const [newSubregion, setNewSubregion] = useState<Partial<SubregionModel>>({});
  const [selectedSubregionId, setSelectedSubregionId] = useState<number | null>(
    null
  );
  const [selectedCoordinator, setSelectedCoordinator] =
    useState<RegionalCoordinator | null>(null);
  const [newCoordinator, setNewCoordinator] = useState<
    Partial<RegionalCoordinator>
  >({});

  const { data: regionalCoordinators } =
    useGetRegionalCoordinatorsInSubregionQuery(selectedSubregionId || 0, {
      skip: !selectedSubregionId,
    });

  const regionMap = useMemo(() => {
    if (!regions) return new Map<number, string>();
    return new Map(
      regions.map((region: RegionModel) => [region.id, region.name])
    );
  }, [regions]);

  const handleAddSubregion = async () => {
    try {
      await createSubregion(newSubregion as SubregionModel).unwrap();
      setIsModalOpen(false);
      setNewSubregion({});
      refetch();
    } catch (error) {
      console.error("Error adding subregion:", error);
    }
  };

  const handleUpdateSubregion = async () => {
    if (editingSubregion) {
      const updatedSubregion = { ...editingSubregion, ...newSubregion };
      try {
        await updateSubregion({
          id: updatedSubregion.id,
          updates: updatedSubregion,
        }).unwrap();
        setIsModalOpen(false);
        setEditingSubregion(null);
        refetch();
      } catch (error) {
        console.error("Error updating subregion:", error);
      }
    }
  };

  const handleDeleteSubregion = async (subregionId: number) => {
    try {
      await deleteSubregion(subregionId).unwrap();
      refetch();
    } catch (error) {
      console.error("Error deleting subregion:", error);
    }
  };

  const handleAddRegionalCoordinator = async () => {
    if (selectedSubregionId && newCoordinator) {
      try {
        await createRegionalCoordinator({
          subregionId: selectedSubregionId,
          coordinator: newCoordinator as RegionalCoordinator,
        }).unwrap();
        setIsCoordinatorModalOpen(false);
        setNewCoordinator({});
        setSelectedSubregionId(null); // Close coordinator view
      } catch (error) {
        console.error("Error adding regional coordinator:", error);
      }
    }
  };

  const handleUpdateRegionalCoordinator = async () => {
    if (selectedCoordinator && selectedSubregionId) {
      try {
        await updateRegionalCoordinator({
          subregionId: selectedSubregionId,
          id: selectedCoordinator.id,
          updates: newCoordinator as RegionalCoordinator,
        }).unwrap();
        setIsCoordinatorModalOpen(false);
        setSelectedCoordinator(null);
        setNewCoordinator({});
      } catch (error) {
        console.error("Error updating regional coordinator:", error);
      }
    }
  };

  const handleDeleteRegionalCoordinator = async (coordinatorId: number) => {
    if (selectedSubregionId) {
      try {
        await deleteRegionalCoordinator({
          subregionId: selectedSubregionId,
          id: coordinatorId,
        }).unwrap();
        setSelectedCoordinator(null); // Close coordinator view
      } catch (error) {
        console.error("Error deleting regional coordinator:", error);
      }
    }
  };

  const openAddSubregionModal = () => {
    setEditingSubregion(null);
    setNewSubregion({});
    setIsModalOpen(true);
  };

  const openEditSubregionModal = (subregion: SubregionModel) => {
    setEditingSubregion(subregion);
    setNewSubregion(subregion);
    setIsModalOpen(true);
  };

  const openAddCoordinatorModal = () => {
    setSelectedCoordinator(null);
    setNewCoordinator({});
    setIsCoordinatorModalOpen(true);
  };

  const openEditCoordinatorModal = (coordinator: RegionalCoordinator) => {
    setSelectedCoordinator(coordinator);
    setNewCoordinator(coordinator);
    setIsCoordinatorModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading subregions</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Subregions</h1>
        <button
          onClick={openAddSubregionModal}
          className="mb-4 bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Subregion
        </button>
      </div>

      <table className="min-w-full bg-white mb-8">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Region</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subregions?.map((subregion: SubregionModel) => (
            <tr key={subregion.id}>
              <td className="border px-4 py-2">{subregion.id}</td>
              <td className="border px-4 py-2">{subregion.name}</td>
              <td className="border px-4 py-2">
                {regionMap.get(subregion.regionId) || "N/A"}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openEditSubregionModal(subregion)}
                  className="mr-2"
                >
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDeleteSubregion(subregion.id)}>
                  <Trash size={16} />
                </button>
                <button
                  onClick={() => setSelectedSubregionId(subregion.id)}
                  className="ml-2 text-blue-500"
                >
                  View Coordinators
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSubregionId && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Regional Coordinators</h2>
            <button
              onClick={openAddCoordinatorModal}
              className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Coordinator
            </button>
          </div>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">First Name</th>
                <th className="px-4 py-2">Last Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">NIN Number</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regionalCoordinators?.map((coordinator: RegionalCoordinator) => (
                <tr key={coordinator.id}>
                  <td className="border px-4 py-2">{coordinator.id}</td>
                  <td className="border px-4 py-2">{coordinator.firstName}</td>
                  <td className="border px-4 py-2">{coordinator.lastName}</td>
                  <td className="border px-4 py-2">{coordinator.email}</td>
                  <td className="border px-4 py-2">
                    {coordinator.phoneNumber}
                  </td>
                  <td className="border px-4 py-2">{coordinator.ninNumber}</td>
                  <td className="border px-4 py-2">
                    {coordinator.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openEditCoordinatorModal(coordinator)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteRegionalCoordinator(coordinator.id)
                      }
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subregion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">
              {editingSubregion ? "Edit Subregion" : "Add Subregion"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={newSubregion.name || ""}
              onChange={(e) =>
                setNewSubregion({ ...newSubregion, name: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <select
              value={newSubregion.regionId || ""}
              onChange={(e) =>
                setNewSubregion({
                  ...newSubregion,
                  regionId: Number(e.target.value),
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            >
              <option value="">Select Region</option>
              {regions?.map((region: RegionModel) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <button
              onClick={
                editingSubregion ? handleUpdateSubregion : handleAddSubregion
              }
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {editingSubregion ? "Update Subregion" : "Add Subregion"}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Regional Coordinator Modal */}
      {isCoordinatorModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">
              {selectedCoordinator
                ? "Edit Regional Coordinator"
                : "Add Regional Coordinator"}
            </h2>
            <input
              type="text"
              placeholder="First Name"
              value={newCoordinator.firstName || ""}
              onChange={(e) =>
                setNewCoordinator({
                  ...newCoordinator,
                  firstName: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newCoordinator.lastName || ""}
              onChange={(e) =>
                setNewCoordinator({
                  ...newCoordinator,
                  lastName: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Nin Nimber"
              value={newCoordinator.ninNumber || ""}
              onChange={(e) =>
                setNewCoordinator({
                  ...newCoordinator,
                  ninNumber: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newCoordinator.email || ""}
              onChange={(e) =>
                setNewCoordinator({ ...newCoordinator, email: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newCoordinator.phoneNumber || ""}
              onChange={(e) =>
                setNewCoordinator({
                  ...newCoordinator,
                  phoneNumber: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <label className="inline-flex items-center mb-4">
              <input
                type="checkbox"
                checked={newCoordinator.isActive || false}
                onChange={(e) =>
                  setNewCoordinator({
                    ...newCoordinator,
                    isActive: e.target.checked,
                  })
                }
                className="form-checkbox"
              />
              <span className="ml-2">Active</span>
            </label>
            <button
              onClick={
                selectedCoordinator
                  ? handleUpdateRegionalCoordinator
                  : handleAddRegionalCoordinator
              }
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {selectedCoordinator ? "Update Coordinator" : "Add Coordinator"}
            </button>
            <button
              onClick={() => setIsCoordinatorModalOpen(false)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubregionsPage;
