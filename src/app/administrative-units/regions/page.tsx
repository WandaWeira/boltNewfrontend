"use client";

import React, { useState } from "react";
import {
  useGetRegionsQuery,
  useAddRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} from "@/state/api";
import { Edit, Trash, Plus } from "lucide-react";

interface UnitModel {
  id: number; // Changed to lowercase 'id'
  name: string;
}

const RegionsPage: React.FC = () => {
  const { data: regions, isLoading, isError, refetch } = useGetRegionsQuery();
  const [addRegion] = useAddRegionMutation();
  const [updateRegion] = useUpdateRegionMutation();
  const [deleteRegion] = useDeleteRegionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<UnitModel | null>(null);
  const [newRegion, setNewRegion] = useState<Partial<UnitModel>>({});

  const handleAddRegion = async () => {
    try {
      await addRegion(newRegion as UnitModel).unwrap();
      setIsModalOpen(false);
      setNewRegion({});
      refetch();
    } catch (error) {
      console.error("Error adding region:", error);
    }
  };

  const handleUpdateRegion = async () => {
    if (editingRegion) {
      const updatedRegion = { ...editingRegion, ...newRegion };

      if (!updatedRegion.id) {
        console.error("Region ID is missing. Cannot update.");
        return;
      }

      try {
        await updateRegion(updatedRegion).unwrap();
        setIsModalOpen(false);
        setEditingRegion(null);
        refetch();
      } catch (error) {
        console.error("Error updating region:", error);
      }
    }
  };

  const handleDeleteRegion = async (regionId: number) => {
    try {
      await deleteRegion(regionId).unwrap();
      refetch();
    } catch (error) {
      console.error("Error deleting region:", error);
    }
  };

  const openAddModal = () => {
    setEditingRegion(null);
    setNewRegion({});
    setIsModalOpen(true);
  };

  const openEditModal = (region: UnitModel) => {
    setEditingRegion(region);
    setNewRegion(region);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading regions</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Regions</h1>
        <button
          onClick={openAddModal}
          className="mb-4 bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Region
        </button>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {regions?.map((region: UnitModel) => (
            <tr key={region.id}>
              <td className="border px-4 py-2">{region.id}</td>
              <td className="border px-4 py-2">{region.name}</td>
              <td className="border px-4 py-2">
                <button onClick={() => openEditModal(region)} className="mr-2">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDeleteRegion(region.id)}>
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
              {editingRegion ? "Edit Region" : "Add New Region"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingRegion ? handleUpdateRegion() : handleAddRegion();
              }}
            >
              <input
                placeholder="Region Name"
                value={newRegion.name || ""}
                onChange={(e) =>
                  setNewRegion({ ...newRegion, name: e.target.value })
                }
                className="mb-4 w-full px-4 py-2 border rounded"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-4 px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-yellow-500 text-white rounded"
                >
                  {editingRegion ? "Update" : "Add"} Region
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionsPage;
