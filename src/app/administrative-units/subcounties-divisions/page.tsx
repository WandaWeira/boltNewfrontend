"use client";
import React, { useState, useEffect } from "react";
import {
  useGetDistrictsQuery,
  useGetConstituenciesQuery,
  useGetMunicipalitiesQuery,
  useGetSubcountiesQuery,
  useGetDivisionsQuery,
  useCreateSubcountyMutation,
  useUpdateSubcountyMutation,
  useDeleteSubcountyMutation,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
  useGetSubcountyRegistrasQuery,
  useCreateSubcountyRegistraMutation,
  useUpdateSubcountyRegistraMutation,
  useDeleteSubcountyRegistraMutation,
  useGetDivisionRegistrasQuery,
  useCreateDivisionRegistraMutation,
  useUpdateDivisionRegistraMutation,
  useDeleteDivisionRegistraMutation,
  useGetRegionsQuery,
  useGetSubregionsQuery
} from "@/state/api";
import { Edit, Trash, Plus } from "lucide-react";

interface UnitModel {
  id: number;
  name: string;
}

interface SubcountyModel extends UnitModel {
  constituencyId: number;
}

interface DivisionModel extends UnitModel {
  municipalityId: number;
}

interface ConstituencyModel extends UnitModel {
  districtId: number;
}

interface MunicipalityModel extends UnitModel {
  districtId: number;
}

interface DistrictModel extends UnitModel {
  subregionId: number;
}

interface SubregionModel extends UnitModel {
  regionId: number;
}

interface RegionModel extends UnitModel {}

interface Registra {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ninNumber: string;
  isActive: boolean;
}

const SubcountiesDivisionsPage: React.FC = () => {
  const { data: regions } = useGetRegionsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: constituencies } = useGetConstituenciesQuery();
  const { data: municipalities } = useGetMunicipalitiesQuery();
  const { data: subcounties, refetch: refetchSubcounties } = useGetSubcountiesQuery();
  const { data: divisions, refetch: refetchDivisions } = useGetDivisionsQuery();

  const [createSubcounty] = useCreateSubcountyMutation();
  const [updateSubcounty] = useUpdateSubcountyMutation();
  const [deleteSubcounty] = useDeleteSubcountyMutation();
  const [createDivision] = useCreateDivisionMutation();
  const [updateDivision] = useUpdateDivisionMutation();
  const [deleteDivision] = useDeleteDivisionMutation();

  const [createSubcountyRegistra] = useCreateSubcountyRegistraMutation();
  const [updateSubcountyRegistra] = useUpdateSubcountyRegistraMutation();
  const [deleteSubcountyRegistra] = useDeleteSubcountyRegistraMutation();
  const [createDivisionRegistra] = useCreateDivisionRegistraMutation();
  const [updateDivisionRegistra] = useUpdateDivisionRegistraMutation();
  const [deleteDivisionRegistra] = useDeleteDivisionRegistraMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistraModalOpen, setIsRegistraModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubcountyModel | DivisionModel | null>(null);
  const [newItem, setNewItem] = useState<Partial<SubcountyModel | DivisionModel>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedRegistra, setSelectedRegistra] = useState<Registra | null>(null);
  const [newRegistra, setNewRegistra] = useState<Partial<Registra>>({});
  const [isSubcounty, setIsSubcounty] = useState(true);

  const { data: subcountyRegistras, refetch: refetchSubcountyRegistras } =
    useGetSubcountyRegistrasQuery(selectedId || 0, {
      skip: !selectedId || !isSubcounty,
    });

  const { data: divisionRegistras, refetch: refetchDivisionRegistras } =
    useGetDivisionRegistrasQuery(selectedId || 0, {
      skip: !selectedId || isSubcounty,
    });

  const handleAddItem = async () => {
    if (selectedParentId) {
      try {
        if (isSubcounty) {
          await createSubcounty({
            ...(newItem as SubcountyModel),
            constituencyId: selectedParentId,
          }).unwrap();
          refetchSubcounties();
        } else {
          await createDivision({
            ...(newItem as DivisionModel),
            municipalityId: selectedParentId,
          }).unwrap();
          refetchDivisions();
        }
        setIsModalOpen(false);
        setNewItem({});
        setSelectedParentId(null);
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
  };

  const handleUpdateItem = async () => {
    if (editingItem) {
      try {
        if ('constituencyId' in editingItem) {
          await updateSubcounty({
            id: editingItem.id,
            updates: newItem as SubcountyModel,
          }).unwrap();
          refetchSubcounties();
        } else {
          await updateDivision({
            id: editingItem.id,
            updates: newItem as DivisionModel,
          }).unwrap();
          refetchDivisions();
        }
        setIsModalOpen(false);
        setEditingItem(null);
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const handleDeleteItem = async (item: SubcountyModel | DivisionModel) => {
    try {
      if ('constituencyId' in item) {
        await deleteSubcounty(item.id).unwrap();
        refetchSubcounties();
      } else {
        await deleteDivision(item.id).unwrap();
        refetchDivisions();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddRegistra = async () => {
    if (selectedId && newRegistra) {
      try {
        if (isSubcounty) {
          await createSubcountyRegistra({
            subcountyId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
          refetchSubcountyRegistras();
        } else {
          await createDivisionRegistra({
            divisionId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
          refetchDivisionRegistras();
        }
        setIsRegistraModalOpen(false);
        setNewRegistra({});
        setSelectedId(null);
      } catch (error) {
        console.error("Error adding registra:", error);
      }
    }
  };

  const handleUpdateRegistra = async () => {
    if (selectedRegistra && selectedId) {
      try {
        if (isSubcounty) {
          await updateSubcountyRegistra({
            subcountyId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
          refetchSubcountyRegistras();
        } else {
          await updateDivisionRegistra({
            divisionId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
          refetchDivisionRegistras();
        }
        setIsRegistraModalOpen(false);
        setSelectedRegistra(null);
        setNewRegistra({});
      } catch (error) {
        console.error("Error updating registra:", error);
      }
    }
  };

  const handleDeleteRegistra = async (registraId: number) => {
    if (selectedId) {
      try {
        if (isSubcounty) {
          await deleteSubcountyRegistra({
            subcountyId: selectedId,
            id: registraId,
          }).unwrap();
          refetchSubcountyRegistras();
        } else {
          await deleteDivisionRegistra({
            divisionId: selectedId,
            id: registraId,
          }).unwrap();
          refetchDivisionRegistras();
        }
        setSelectedRegistra(null);
      } catch (error) {
        console.error("Error deleting registra:", error);
      }
    }
  };

  const openAddModal = (type: 'subcounty' | 'division') => {
    setEditingItem(null);
    setNewItem({});
    setSelectedParentId(null);
    setIsSubcounty(type === 'subcounty');
    setIsModalOpen(true);
  };

  const openEditModal = (item: SubcountyModel | DivisionModel) => {
    setEditingItem(item);
    setNewItem(item);
    setSelectedParentId('constituencyId' in item ? item.constituencyId : item.municipalityId);
    setIsSubcounty('constituencyId' in item);
    setIsModalOpen(true);
  };

  const openAddRegistraModal = (id: number, type: 'subcounty' | 'division') => {
    setSelectedId(id);
    setSelectedRegistra(null);
    setNewRegistra({});
    setIsSubcounty(type === 'subcounty');
    setIsRegistraModalOpen(true);
  };

  const openEditRegistraModal = (registra: Registra) => {
    setSelectedRegistra(registra);
    setNewRegistra(registra);
    setIsRegistraModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Subcounties and Divisions</h1>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Subcounties</h2>
          <button
            onClick={() => openAddModal('subcounty')}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Subcounty
          </button>
        </div>
        <table className="min-w-full bg-white mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Constituency</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Subregion</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
          {(subcounties as SubcountyModel[])?.map((subcounty) => {
              const constituency = (constituencies as ConstituencyModel[])?.find(
                (c) => c.id === subcounty.constituencyId
              );
              const district = (districts as DistrictModel[])?.find(
                (d) => d.id === constituency?.districtId
              );
              const subregion = (subregions as SubregionModel[])?.find(
                (sr) => sr.id === district?.subregionId
              );
              const region = (regions as RegionModel[])?.find(
                (r) => r.id === subregion?.regionId
              );
              return (
                <tr key={subcounty.id}>
                  <td className="border px-4 py-2">{subcounty.id}</td>
                  <td className="border px-4 py-2">{subcounty.name}</td>
                  <td className="border px-4 py-2">{constituency?.name || "N/A"}</td>
                  <td className="border px-4 py-2">{district?.name || "N/A"}</td>
                  <td className="border px-4 py-2">{subregion?.name || "N/A"}</td>
                  <td className="border px-4 py-2">{region?.name || "N/A"}</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => openEditModal(subcounty)} className="mr-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(subcounty)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() => openAddRegistraModal(subcounty.id, 'subcounty')}
                      className="ml-2 text-blue-500"
                    >
                      View Registra
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Divisions</h2>
          <button
            onClick={() => openAddModal('division')}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Division
          </button>
        </div>
        <table className="min-w-full bg-white mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Municipality</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Subregion</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
          {(divisions as DivisionModel[])?.map((division) => {
              const municipality = (municipalities as MunicipalityModel[])?.find(
                (m) => m.id === division.municipalityId
              );
              const district = (districts as DistrictModel[])?.find(
                (d) => d.id === municipality?.districtId
              );
              const subregion = (subregions as SubregionModel[])?.find(
                (sr) => sr.id === district?.subregionId
              );
              const region = (regions as RegionModel[])?.find(
                (r) => r.id === subregion?.regionId
              );
              return (
                <tr key={division.id}>
                  <td className="border px-4 py-2">{division.id}</td>
                  <td className="border px-4 py-2">{division.name}</td>
                  <td className="border px-4 py-2">{municipality?.name || "N/A"}</td>
                  <td className="border px-4 py-2">{district?.name || "N/A"}</td>
                  <td className="border px-4 py-2">{subregion?.name || "N/A"}</td>
                  <td className="border px-4 py-2">{region?.name || "N/A"}</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => openEditModal(division)} className="mr-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(division)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() => openAddRegistraModal(division.id, 'division')}
                      className="ml-2 text-blue-500"
                    >
                      View Registra
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? "Edit" : "Add"} {isSubcounty ? "Subcounty" : "Division"}
            </h2>
            <div>
              <label className="block mb-2">
                Name:
                <input
                  type="text"
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="border px-2 py-1 w-full"
                />
              </label>
              <label className="block mb-2">
                {isSubcounty ? "Constituency" : "Municipality"}:
                <select
                  value={selectedParentId || ""}
                  onChange={(e) => setSelectedParentId(Number(e.target.value))}
                  className="border px-2 py-1 w-full"
                  disabled={editingItem !== null}
                >
                  <option value="">Select {isSubcounty ? "Constituency" : "Municipality"}</option>
                  {isSubcounty
                    ? constituencies?.map((constituency) => (
                      <option key={constituency.id} value={constituency.id}>
                        {constituency.name}
                      </option>
                    ))
                    : municipalities?.map((municipality) => (
                      <option key={municipality.id} value={municipality.id}>
                        {municipality.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="mt-4">
              <button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="ml-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isRegistraModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-2/3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {isSubcounty ? "Subcounty" : "Division"} Registrars
            </h2>

            <div className="mb-6">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone Number</th>
                    <th className="px-4 py-2 text-left">NIN Number</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(isSubcounty ? subcountyRegistras : divisionRegistras)?.map((registrar) => (
                    <tr key={registrar.id}>
                      <td className="border px-4 py-2">{`${registrar.firstName} ${registrar.lastName}`}</td>
                      <td className="border px-4 py-2">{registrar.email}</td>
                      <td className="border px-4 py-2">{registrar.phoneNumber}</td>
                      <td className="border px-4 py-2">{registrar.ninNumber}</td>
                      <td className="border px-4 py-2">{registrar.isActive ? "Active" : "Inactive"}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => openEditRegistraModal(registrar)}
                          className="mr-2 text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRegistra(registrar.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold mb-4">
              {selectedRegistra ? "Edit Registra" : "Add New Registra"}
            </h3>
            <input
              type="text"
              placeholder="First Name"
              value={newRegistra.firstName || ""}
              onChange={(e) =>
                setNewRegistra({ ...newRegistra, firstName: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newRegistra.lastName || ""}
              onChange={(e) =>
                setNewRegistra({ ...newRegistra, lastName: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newRegistra.email || ""}
              onChange={(e) =>
                setNewRegistra({ ...newRegistra, email: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={newRegistra.phoneNumber || ""}
              onChange={(e) =>
                setNewRegistra({ ...newRegistra, phoneNumber: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="NIN Number"
              value={newRegistra.ninNumber || ""}
              onChange={(e) =>
                setNewRegistra({ ...newRegistra, ninNumber: e.target.value })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <label className="inline-flex items-center mb-4">
              <input
                type="checkbox"
                checked={newRegistra.isActive || false}
                onChange={(e) =>
                  setNewRegistra({ ...newRegistra, isActive: e.target.checked })
                }
                className="form-checkbox"
              />
              <span className="ml-2">Active</span>
            </label>
            <div className="flex justify-end mt-4">
              <button
                onClick={selectedRegistra ? handleUpdateRegistra : handleAddRegistra}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                {selectedRegistra ? "Update Registra" : "Add Registra"}
              </button>
              <button
                onClick={() => {
                  setIsRegistraModalOpen(false);
                  setSelectedRegistra(null);
                  setNewRegistra({});
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcountiesDivisionsPage;