"use client";
import React, { useState, useEffect } from "react";
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
  useCreateParishMutation,
  useUpdateParishMutation,
  useDeleteParishMutation,
  useCreateWardMutation,
  useUpdateWardMutation,
  useDeleteWardMutation,
  useGetParishRegistrasQuery,
  useCreateParishRegistraMutation,
  useUpdateParishRegistraMutation,
  useDeleteParishRegistraMutation,
  useGetWardRegistrasQuery,
  useCreateWardRegistraMutation,
  useUpdateWardRegistraMutation,
  useDeleteWardRegistraMutation,
  useGetParishPollingStationsQuery,
  useCreateParishPollingStationMutation,
  useUpdateParishPollingStationMutation,
  useDeleteParishPollingStationMutation,
  useGetWardPollingStationsQuery,
  useCreateWardPollingStationMutation,
  useUpdateWardPollingStationMutation,
  useDeleteWardPollingStationMutation,
  PollingStation,
} from "@/state/api";
import { Edit, Trash, Plus } from "lucide-react";

interface UnitModel {
  id: number;
  name: string;
}

interface ParishModel extends UnitModel {
  subcountyId: number;
}

interface WardModel extends UnitModel {
  divisionId: number;
}

interface DistrictModel extends UnitModel {
  subregionId: number;
}

interface ConstituencyModel extends UnitModel {
  districtId: number;
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

interface SubcountyModel extends UnitModel {
  constituencyId: number;
}

const ParishesWardsPage: React.FC = () => {
  const { data: regions } = useGetRegionsQuery();
  const { data: parishes, refetch: refetchParishes } = useGetParishesQuery();
  const { data: wards, refetch: refetchWards } = useGetWardsQuery();
  const { data: subcounties } = useGetSubcountiesQuery();
  const { data: constituencies } = useGetConstituenciesQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: divisions } = useGetDivisionsQuery();
  const { data: municipalities } = useGetMunicipalitiesQuery();

  const [createParish] = useCreateParishMutation();
  const [updateParish] = useUpdateParishMutation();
  const [deleteParish] = useDeleteParishMutation();
  const [createWard] = useCreateWardMutation();
  const [updateWard] = useUpdateWardMutation();
  const [deleteWard] = useDeleteWardMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistraModalOpen, setIsRegistraModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    ParishModel | WardModel | null
  >(null);
  const [newItem, setNewItem] = useState<Partial<ParishModel | WardModel>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedRegistra, setSelectedRegistra] = useState<Registra | null>(
    null
  );
  const [newRegistra, setNewRegistra] = useState<Partial<Registra>>({});
  const [isParish, setIsParish] = useState(true);

  const { data: parishRegistras, refetch: refetchParishRegistras } =
    useGetParishRegistrasQuery(selectedId || 0, {
      skip: !selectedId || !isParish,
    });

  const { data: wardRegistras, refetch: refetchWardRegistras } =
    useGetWardRegistrasQuery(selectedId || 0, {
      skip: !selectedId || isParish,
    });

  const [createParishRegistra] = useCreateParishRegistraMutation();
  const [updateParishRegistra] = useUpdateParishRegistraMutation();
  const [deleteParishRegistra] = useDeleteParishRegistraMutation();
  const [createWardRegistra] = useCreateWardRegistraMutation();
  const [updateWardRegistra] = useUpdateWardRegistraMutation();
  const [deleteWardRegistra] = useDeleteWardRegistraMutation();

  const [isPollingStationModalOpen, setIsPollingStationModalOpen] =
    useState(false);
  const [selectedPollingStation, setSelectedPollingStation] =
    useState<PollingStation | null>(null);
  const [newPollingStation, setNewPollingStation] = useState<
    Partial<PollingStation>
  >({});

  const { data: parishPollingStations, refetch: refetchParishPollingStations } =
    useGetParishPollingStationsQuery(selectedId || 0, {
      skip: !selectedId || !isParish,
    });

  const { data: wardPollingStations, refetch: refetchWardPollingStations } =
    useGetWardPollingStationsQuery(selectedId || 0, {
      skip: !selectedId || isParish,
    });

  const [createParishPollingStation] = useCreateParishPollingStationMutation();
  const [updateParishPollingStation] = useUpdateParishPollingStationMutation();
  const [deleteParishPollingStation] = useDeleteParishPollingStationMutation();
  const [createWardPollingStation] = useCreateWardPollingStationMutation();
  const [updateWardPollingStation] = useUpdateWardPollingStationMutation();
  const [deleteWardPollingStation] = useDeleteWardPollingStationMutation();

  const handleAddPollingStation = async () => {
    if (selectedId && newPollingStation.name && newPollingStation.code) {
      try {
        if (isParish) {
          await createParishPollingStation({
            parishId: selectedId,
            pollingStation: newPollingStation,
          }).unwrap();
          refetchParishPollingStations();
        } else {
          await createWardPollingStation({
            wardId: selectedId,
            pollingStation: newPollingStation,
          }).unwrap();
          refetchWardPollingStations();
        }
        setIsPollingStationModalOpen(false);
        setNewPollingStation({});
        setSelectedId(null);
      } catch (error) {
        console.error("Error adding polling station:", error);
      }
    }
  };

  const handleUpdatePollingStation = async () => {
    if (selectedPollingStation && selectedId) {
      try {
        if (isParish) {
          await updateParishPollingStation({
            parishId: selectedId,
            id: selectedPollingStation.id,
            updates: newPollingStation as PollingStation,
          }).unwrap();
          refetchParishPollingStations();
        } else {
          await updateWardPollingStation({
            wardId: selectedId,
            id: selectedPollingStation.id,
            updates: newPollingStation as PollingStation,
          }).unwrap();
          refetchWardPollingStations();
        }
        setIsPollingStationModalOpen(false);
        setSelectedPollingStation(null);
        setNewPollingStation({});
      } catch (error) {
        console.error("Error updating polling station:", error);
      }
    }
  };

  const handleDeletePollingStation = async (pollingStationId: number) => {
    if (selectedId) {
      try {
        if (isParish) {
          await deleteParishPollingStation({
            parishId: selectedId,
            id: pollingStationId,
          }).unwrap();
          refetchParishPollingStations();
        } else {
          await deleteWardPollingStation({
            wardId: selectedId,
            id: pollingStationId,
          }).unwrap();
          refetchWardPollingStations();
        }
        setSelectedPollingStation(null);
      } catch (error) {
        console.error("Error deleting polling station:", error);
      }
    }
  };

  const openAddPollingStationModal = (id: number, type: "parish" | "ward") => {
    setSelectedId(id);
    setIsParish(type === "parish");
    setIsPollingStationModalOpen(true);
  };

  const openEditPollingStationModal = (pollingStation: PollingStation) => {
    setSelectedPollingStation(pollingStation);
    setNewPollingStation(pollingStation);
    setIsPollingStationModalOpen(true);
  };

  const handleAddItem = async () => {
    if (selectedParentId) {
      try {
        if (isParish) {
          await createParish({
            name: newItem.name,
            subcountyId: selectedParentId,
          }).unwrap();
        } else {
          await createWard({
            name: newItem.name,
            divisionId: selectedParentId,
          }).unwrap();
        }
        setIsModalOpen(false);
        setNewItem({});
        setSelectedParentId(null);
        if (isParish) {
          refetchParishes();
        } else {
          refetchWards();
        }
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
  };

  const handleUpdateItem = async () => {
    if (editingItem) {
      try {
        if ("subcountyId" in editingItem) {
          await updateParish({
            id: editingItem.id,
            updates: newItem as ParishModel,
          }).unwrap();
          refetchParishes();
        } else {
          await updateWard({
            id: editingItem.id,
            updates: newItem as WardModel,
          }).unwrap();
          refetchWards();
        }
        setIsModalOpen(false);
        setEditingItem(null);
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const handleDeleteItem = async (item: ParishModel | WardModel) => {
    try {
      if ("subcountyId" in item) {
        await deleteParish(item.id).unwrap();
        refetchParishes();
      } else {
        await deleteWard(item.id).unwrap();
        refetchWards();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddRegistra = async () => {
    if (selectedId && newRegistra) {
      try {
        if (isParish) {
          await createParishRegistra({
            parishId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
          refetchParishRegistras();
        } else {
          await createWardRegistra({
            wardId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
          refetchWardRegistras();
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
        if (isParish) {
          await updateParishRegistra({
            parishId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
          refetchParishRegistras();
        } else {
          await updateWardRegistra({
            wardId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
          refetchWardRegistras();
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
        if (isParish) {
          await deleteParishRegistra({
            parishId: selectedId,
            id: registraId,
          }).unwrap();
          refetchParishRegistras();
        } else {
          await deleteWardRegistra({
            wardId: selectedId,
            id: registraId,
          }).unwrap();
          refetchWardRegistras();
        }
        setSelectedRegistra(null);
      } catch (error) {
        console.error("Error deleting registra:", error);
      }
    }
  };

  const openAddModal = (type: "parish" | "ward") => {
    setEditingItem(null);
    setNewItem({});
    setSelectedParentId(null);
    setIsParish(type === "parish");
    setIsModalOpen(true);
  };

  const openEditModal = (item: ParishModel | WardModel) => {
    setEditingItem(item);
    setNewItem(item);
    setSelectedParentId(
      "subcountyId" in item ? item.subcountyId : item.divisionId
    );
    setIsParish("subcountyId" in item);
    setIsModalOpen(true);
  };

  const openAddRegistraModal = (id: number, type: "parish" | "ward") => {
    setSelectedId(id);
    setIsParish(type === "parish");
    setIsRegistraModalOpen(true);
  };

  const openEditRegistraModal = (registra: Registra) => {
    setSelectedRegistra(registra);
    setNewRegistra(registra);
    setIsRegistraModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Parishes and Wards</h1>

      {/* Parishes Table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Parishes</h2>
          <button
            onClick={() => openAddModal("parish")}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Parish
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Subcounty</th>
              <th className="px-4 py-2">Constituency</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Subregion</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(parishes as ParishModel[])?.map((parish) => {
              const subcounty = (subcounties as SubcountyModel[])?.find(
                (sc) => sc.id === parish.subcountyId
              );
              const constituency = (
                constituencies as ConstituencyModel[]
              )?.find((c) => c.id === subcounty?.constituencyId);
              const district = (districts as DistrictModel[])?.find(
                (d) => d.id === constituency?.districtId
              );
              const subregion = subregions?.find(
                (sr) => sr.id === district?.subregionId
              );
              const region = regions?.find((r) => r.id === subregion?.regionId);
              return (
                <tr key={parish.id}>
                  <td className="border px-4 py-2">{parish.name}</td>
                  <td className="border px-4 py-2">{subcounty?.name}</td>
                  <td className="border px-4 py-2">{constituency?.name}</td>
                  <td className="border px-4 py-2">{district?.name}</td>
                  <td className="border px-4 py-2">{subregion?.name}</td>
                  <td className="border px-4 py-2">{region?.name}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openEditModal(parish)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(parish)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() => openAddRegistraModal(parish.id, "parish")}
                      className="ml-2 text-blue-500"
                    >
                      Registrars
                    </button>
                    <button
                      onClick={() =>
                        openAddPollingStationModal(parish.id, "parish")
                      }
                      className="ml-2 text-green-500"
                    >
                      View Polling Stations
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Wards Table */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Wards</h2>
          <button
            onClick={() => openAddModal("ward")}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Ward
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Division</th>
              <th className="px-4 py-2">Municipality</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Subregion</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(wards as WardModel[])?.map((ward) => {
              const division = divisions?.find((d) => d.id === ward.divisionId);
              const municipality = (
                municipalities as MunicipalityModel[]
              )?.find((m) => m.id === division?.municipalityId);
              const district = (districts as DistrictModel[])?.find(
                (d) => d.id === municipality?.districtId
              );
              const subregion = subregions?.find(
                (sr) => sr.id === district?.subregionId
              );
              const region = regions?.find((r) => r.id === subregion?.regionId);
              return (
                <tr key={ward.id}>
                  <td className="border px-4 py-2">{ward.name}</td>
                  <td className="border px-4 py-2">{division?.name}</td>
                  <td className="border px-4 py-2">{municipality?.name}</td>
                  <td className="border px-4 py-2">{district?.name}</td>
                  <td className="border px-4 py-2">{subregion?.name}</td>
                  <td className="border px-4 py-2">{region?.name}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openEditModal(ward)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(ward)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() => openAddRegistraModal(ward.id, "ward")}
                      className="ml-2 text-blue-500"
                    >
                      Registrars
                    </button>
                    <button
                      onClick={() =>
                        openAddPollingStationModal(ward.id, "ward")
                      }
                      className="ml-2 text-green-500"
                    >
                      View Polling Stations
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
                ? `Edit ${isParish ? "Parish" : "Ward"}`
                : `Add ${isParish ? "Parish" : "Ward"}`}
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
              <option value="">
                Select {isParish ? "Subcounty" : "Division"}
              </option>
              {isParish
                ? subcounties?.map((subcounty) => (
                    <option key={subcounty.id} value={subcounty.id}>
                      {subcounty.name}
                    </option>
                  ))
                : divisions?.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
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
              {isParish ? "Parish" : "Ward"} Registrars
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
                  {(isParish ? parishRegistras : wardRegistras)?.map(
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

      {isPollingStationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-2/3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {isParish ? "Parish" : "Ward"} Polling Stations
            </h2>

            <div className="mb-6">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(isParish
                    ? parishPollingStations
                    : wardPollingStations
                  )?.map((pollingStation) => (
                    <tr key={pollingStation.id}>
                      <td className="border px-4 py-2">
                        {pollingStation.name}
                      </td>
                      <td className="border px-4 py-2">
                        {pollingStation.code}
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() =>
                            openEditPollingStationModal(pollingStation)
                          }
                          className="mr-2 text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePollingStation(pollingStation.id)
                          }
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
              {selectedPollingStation
                ? "Edit Polling Station"
                : "Add New Polling Station"}
            </h3>
            <input
              type="text"
              placeholder="Name"
              value={newPollingStation.name || ""}
              onChange={(e) =>
                setNewPollingStation({
                  ...newPollingStation,
                  name: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Code"
              value={newPollingStation.code || ""}
              onChange={(e) =>
                setNewPollingStation({
                  ...newPollingStation,
                  code: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={
                  selectedPollingStation
                    ? handleUpdatePollingStation
                    : handleAddPollingStation
                }
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                {selectedPollingStation
                  ? "Update Polling Station"
                  : "Add Polling Station"}
              </button>
              <button
                onClick={() => {
                  setIsPollingStationModalOpen(false);
                  setSelectedPollingStation(null);
                  setNewPollingStation({});
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

export default ParishesWardsPage;
