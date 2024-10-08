"use client";
import React, { useState } from "react";
import {
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetDistrictsQuery,
  useGetConstituenciesQuery,
  useGetMunicipalitiesQuery,
  useGetSubcountiesQuery,
  useGetDivisionsQuery,
  useGetParishesQuery,
  useGetWardsQuery,
  useGetVillagesQuery,
  useGetCellsQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  useCreateCellMutation,
  useUpdateCellMutation,
  useDeleteCellMutation,
  useGetVillageRegistrasQuery,
  useCreateVillageRegistraMutation,
  useUpdateVillageRegistraMutation,
  useDeleteVillageRegistraMutation,
  useGetCellRegistrasQuery,
  useCreateCellRegistraMutation,
  useUpdateCellRegistraMutation,
  useDeleteCellRegistraMutation,
} from "@/state/api";
import { Edit, Trash, Plus } from "lucide-react";

interface UnitModel {
  id: number;
  name: string;
}

interface VillageModel extends UnitModel {
  parishId: number;
}

interface CellModel extends UnitModel {
  wardId: number;
}

interface ParishModel extends UnitModel {
  subcountyId: number;
}

interface SubcountyModel extends UnitModel {
  constituencyId: number;
}

interface ConstituencyModel extends UnitModel {
  districtId: number;
}

interface DistrictModel extends UnitModel {
  subregionId: number;
}

interface SubregionModel extends UnitModel {
  regionId: number;
}

interface WardModel extends UnitModel {
  divisionId: number;
}

interface DivisionModel extends UnitModel {
  municipalityId: number;
}

interface MunicipalityModel extends UnitModel {
  districtId: number;
}

interface Registra {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ninNumber: string;
  isActive: boolean;
}

const VillagesCellsPage: React.FC = () => {
  const { data: regions } = useGetRegionsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: constituencies } = useGetConstituenciesQuery();
  const { data: municipalities } = useGetMunicipalitiesQuery();
  const { data: subcounties } = useGetSubcountiesQuery();
  const { data: divisions } = useGetDivisionsQuery();
  const { data: parishes } = useGetParishesQuery();
  const { data: wards } = useGetWardsQuery();
  const { data: villages, refetch: refetchVillages } = useGetVillagesQuery();
  const { data: cells, refetch: refetchCells } = useGetCellsQuery();

  const [createVillage] = useCreateVillageMutation();
  const [updateVillage] = useUpdateVillageMutation();
  const [deleteVillage] = useDeleteVillageMutation();
  const [createCell] = useCreateCellMutation();
  const [updateCell] = useUpdateCellMutation();
  const [deleteCell] = useDeleteCellMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistraModalOpen, setIsRegistraModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    VillageModel | CellModel | null
  >(null);
  const [newItem, setNewItem] = useState<Partial<VillageModel | CellModel>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedRegistra, setSelectedRegistra] = useState<Registra | null>(
    null
  );
  const [newRegistra, setNewRegistra] = useState<Partial<Registra>>({});
  const [isVillage, setIsVillage] = useState(true);

  const { data: villageRegistras, refetch: refetchVillageRegistras } =
    useGetVillageRegistrasQuery(selectedId || 0, {
      skip: !selectedId || !isVillage,
    });

  const { data: cellRegistras, refetch: refetchCellRegistras } =
    useGetCellRegistrasQuery(selectedId || 0, {
      skip: !selectedId || isVillage,
    });

  const [createVillageRegistra] = useCreateVillageRegistraMutation();
  const [updateVillageRegistra] = useUpdateVillageRegistraMutation();
  const [deleteVillageRegistra] = useDeleteVillageRegistraMutation();
  const [createCellRegistra] = useCreateCellRegistraMutation();
  const [updateCellRegistra] = useUpdateCellRegistraMutation();
  const [deleteCellRegistra] = useDeleteCellRegistraMutation();

  const handleAddItem = async () => {
    if (selectedParentId) {
      try {
        if (isVillage) {
          await createVillage({
            name: newItem.name,
            parishId: selectedParentId,
          }).unwrap();
        } else {
          await createCell({
            name: newItem.name,
            wardId: selectedParentId,
          }).unwrap();
        }
        setIsModalOpen(false);
        setNewItem({});
        setSelectedParentId(null);
        if (isVillage) {
          refetchVillages();
        } else {
          refetchCells();
        }
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
  };

  const handleUpdateItem = async () => {
    if (editingItem) {
      try {
        if ("parishId" in editingItem) {
          await updateVillage({
            id: editingItem.id,
            updates: newItem as VillageModel,
          }).unwrap();
          refetchVillages();
        } else {
          await updateCell({
            id: editingItem.id,
            updates: newItem as CellModel,
          }).unwrap();
          refetchCells();
        }
        setIsModalOpen(false);
        setEditingItem(null);
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const handleDeleteItem = async (item: VillageModel | CellModel) => {
    try {
      if ("parishId" in item) {
        await deleteVillage(item.id).unwrap();
        refetchVillages();
      } else {
        await deleteCell(item.id).unwrap();
        refetchCells();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddRegistra = async () => {
    if (selectedId && newRegistra) {
      try {
        if (isVillage) {
          await createVillageRegistra({
            villageId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
          refetchVillageRegistras();
        } else {
          await createCellRegistra({
            cellId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
          refetchCellRegistras();
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
        if (isVillage) {
          await updateVillageRegistra({
            villageId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
          refetchVillageRegistras();
        } else {
          await updateCellRegistra({
            cellId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
          refetchCellRegistras();
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
        if (isVillage) {
          await deleteVillageRegistra({
            villageId: selectedId,
            id: registraId,
          }).unwrap();
          refetchVillageRegistras();
        } else {
          await deleteCellRegistra({
            cellId: selectedId,
            id: registraId,
          }).unwrap();
          refetchCellRegistras();
        }
        setSelectedRegistra(null);
      } catch (error) {
        console.error("Error deleting registra:", error);
      }
    }
  };

  const openAddModal = (type: "village" | "cell") => {
    setEditingItem(null);
    setNewItem({});
    setSelectedParentId(null);
    setIsVillage(type === "village");
    setIsModalOpen(true);
  };

  const openEditModal = (item: VillageModel | CellModel) => {
    setEditingItem(item);
    setNewItem(item);
    setSelectedParentId("parishId" in item ? item.parishId : item.wardId);
    setIsVillage("parishId" in item);
    setIsModalOpen(true);
  };

  const openAddRegistraModal = (id: number, type: "village" | "cell") => {
    setSelectedId(id);
    setIsVillage(type === "village");
    setIsRegistraModalOpen(true);
  };

  const openEditRegistraModal = (registra: Registra) => {
    setSelectedRegistra(registra);
    setNewRegistra(registra);
    setIsRegistraModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Villages and Cells</h1>

      {/* Villages Table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Villages</h2>
          <button
            onClick={() => openAddModal("village")}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Village
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Parish</th>
              <th className="px-4 py-2">Subcounty</th>
              <th className="px-4 py-2">Constituency</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Subregion</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
          {(villages as VillageModel[])?.map((village) => {
            const parish = (parishes as ParishModel[])?.find((p) => p.id === village.parishId);
            const subcounty = (subcounties as SubcountyModel[])?.find(
              (sc) => sc.id === parish?.subcountyId
            );
            const constituency = (constituencies as ConstituencyModel[])?.find(
              (c) => c.id === subcounty?.constituencyId
            );
            const district = (districts as DistrictModel[])?.find(
              (d) => d.id === constituency?.districtId
            );
            const subregion = (subregions as SubregionModel[])?.find(
              (sr) => sr.id === district?.subregionId
            );
            const region = regions?.find((r) => r.id === subregion?.regionId);
            return (
                <tr key={village.id}>
                  <td className="border px-4 py-2">{village.name}</td>
                  <td className="border px-4 py-2">{parish?.name}</td>
                  <td className="border px-4 py-2">{subcounty?.name}</td>
                  <td className="border px-4 py-2">{constituency?.name}</td>
                  <td className="border px-4 py-2">{district?.name}</td>
                  <td className="border px-4 py-2">{subregion?.name}</td>
                  <td className="border px-4 py-2">{region?.name}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openEditModal(village)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(village)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() =>
                        openAddRegistraModal(village.id, "village")
                      }
                      className="ml-2 text-blue-500"
                    >
                      Registrars
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cells Table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Cells</h2>
          <button
            onClick={() => openAddModal("cell")}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Cell
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Ward</th>
              <th className="px-4 py-2">Division</th>
              <th className="px-4 py-2">Municipality</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Subregion</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
          {(cells as CellModel[])?.map((cell) => {
            const ward = (wards as WardModel[])?.find((w) => w.id === cell.wardId);
            const division = (divisions as DivisionModel[])?.find(
              (d) => d.id === ward?.divisionId
            );
            const municipality = (municipalities as MunicipalityModel[])?.find(
              (m) => m.id === division?.municipalityId
            );
            const district = (districts as DistrictModel[])?.find(
              (d) => d.id === municipality?.districtId
            );
            const subregion = (subregions as SubregionModel[])?.find(
              (sr) => sr.id === district?.subregionId
            );
            const region = regions?.find((r) => r.id === subregion?.regionId);
            return (
                <tr key={cell.id}>
                  <td className="border px-4 py-2">{cell.name}</td>
                  <td className="border px-4 py-2">{ward?.name}</td>
                  <td className="border px-4 py-2">{division?.name}</td>
                  <td className="border px-4 py-2">{municipality?.name}</td>
                  <td className="border px-4 py-2">{district?.name}</td>
                  <td className="border px-4 py-2">{subregion?.name}</td>
                  <td className="border px-4 py-2">{region?.name}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openEditModal(cell)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(cell)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() => openAddRegistraModal(cell.id, "cell")}
                      className="ml-2 text-blue-500"
                    >
                      Registrars
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl font-bold mb-4">
              {editingItem
                ? `Edit ${isVillage ? "Village" : "Cell"}`
                : `Add ${isVillage ? "Village" : "Cell"}`}
            </h2>
            <input
              type="text"
              value={newItem.name || ""}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="border p-2 mb-2 w-full"
              placeholder="Name"
            />
            <select
              value={selectedParentId || ""}
              onChange={(e) => setSelectedParentId(Number(e.target.value))}
              className="border p-2 mb-2 w-full"
            >
              <option value="">Select {isVillage ? "Parish" : "Ward"}</option>
              {isVillage
                ? parishes?.map((parish) => (
                    <option key={parish.id} value={parish.id}>
                      {parish.name}
                    </option>
                  ))
                : wards?.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                {editingItem ? "Update" : "Add"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registra Modal */}
      {isRegistraModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-2/3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {isVillage ? "Village" : "Cell"} Registrars
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
                  {(isVillage ? villageRegistras : cellRegistras)?.map(
                    (registrar) => (
                      <tr key={registrar.id}>
                        <td className="border px-4 py-2">{`${registrar.firstName} ${registrar.lastName}`}</td>
                        <td className="border px-4 py-2">{registrar.email}</td>
                        <td className="border px-4 py-2">
                          {registrar.phoneNumber}
                        </td>
                        <td className="border px-4 py-2">
                          {registrar.ninNumber}
                        </td>
                        <td className="border px-4 py-2">
                          {registrar.isActive ? "Active" : "Inactive"}
                        </td>
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
                    )
                  )}
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
                onClick={
                  selectedRegistra ? handleUpdateRegistra : handleAddRegistra
                }
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

export default VillagesCellsPage;
