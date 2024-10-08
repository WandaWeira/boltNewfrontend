"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  useGetDistrictsQuery,
  useGetConstituenciesQuery,
  useGetMunicipalitiesQuery,
  useCreateConstituencyMutation,
  useUpdateConstituencyMutation,
  useDeleteConstituencyMutation,
  useCreateMunicipalityMutation,
  useUpdateMunicipalityMutation,
  useDeleteMunicipalityMutation,
  useGetSubregionsQuery,
  useGetRegionsQuery,
  useGetConstituencyRegistrasQuery,
  useCreateConstituencyRegistraMutation,
  useUpdateConstituencyRegistraMutation,
  useDeleteConstituencyRegistraMutation,
  useGetMunicipalityRegistrasQuery,
  useCreateMunicipalityRegistraMutation,
  useUpdateMunicipalityRegistraMutation,
  useDeleteMunicipalityRegistraMutation,
} from "@/state/api";
import { Edit, Trash, Plus } from "lucide-react";

interface DistrictModel {
  id: number;
  name: string;
  subregionId: number;
  hasCity: boolean;
}

interface SubregionModel {
  id: number;
  name: string;
  regionId: number;
}

interface RegionModel {
  id: number;
  name: string;
}

interface ConstituencyMunicipalityModel {
  id: number;
  name: string;
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

const ConstituenciesMunicipalitiesPage: React.FC = () => {
  const {
    data: districts,
    isLoading: isLoadingDistricts,
    isError: isErrorDistricts,
  } = useGetDistrictsQuery();
  const { data: constituencies, refetch: refetchConstituencies } =
    useGetConstituenciesQuery();
  const { data: municipalities, refetch: refetchMunicipalities } =
    useGetMunicipalitiesQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: regions } = useGetRegionsQuery();

  const [createConstituency] = useCreateConstituencyMutation();
  const [updateConstituency] = useUpdateConstituencyMutation();
  const [deleteConstituency] = useDeleteConstituencyMutation();
  const [createMunicipality] = useCreateMunicipalityMutation();
  const [updateMunicipality] = useUpdateMunicipalityMutation();
  const [deleteMunicipality] = useDeleteMunicipalityMutation();

  const [createConstituencyRegistra] = useCreateConstituencyRegistraMutation();
  const [updateConstituencyRegistra] = useUpdateConstituencyRegistraMutation();
  const [deleteConstituencyRegistra] = useDeleteConstituencyRegistraMutation();
  const [createMunicipalityRegistra] = useCreateMunicipalityRegistraMutation();
  const [updateMunicipalityRegistra] = useUpdateMunicipalityRegistraMutation();
  const [deleteMunicipalityRegistra] = useDeleteMunicipalityRegistraMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistraModalOpen, setIsRegistraModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ConstituencyMunicipalityModel | null>(null);
  const [newItem, setNewItem] = useState<
    Partial<ConstituencyMunicipalityModel>
  >({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRegistra, setSelectedRegistra] = useState<Registra | null>(
    null
  );
  const [newRegistra, setNewRegistra] = useState<Partial<Registra>>({});

  // const { data: constituencyRegistras } = useGetConstituencyRegistrasQuery(
  //   selectedId || 0,
  //   {
  //     skip: !selectedId || districts?.find((d) => d.id === selectedId)?.hasCity,
  //   }
  // );

  // const { data: municipalityRegistras } = useGetMunicipalityRegistrasQuery(
  //   selectedId || 0,
  //   {
  //     skip:
  //       !selectedId || !districts?.find((d) => d.id === selectedId)?.hasCity,
  //   }
  // );

  const { data: constituencyRegistras, refetch: refetchConstituencyRegistras } =
    useGetConstituencyRegistrasQuery(selectedId || 0, {
      skip: !selectedId || districts?.find((d) => d.id === selectedId)?.hasCity,
    });

  const { data: municipalityRegistras, refetch: refetchMunicipalityRegistras } =
    useGetMunicipalityRegistrasQuery(selectedId || 0, {
      skip:
        !selectedId || !districts?.find((d) => d.id === selectedId)?.hasCity,
    });

  const subregionMap = useMemo(() => {
    if (!subregions) return new Map<number, string>();
    return new Map(
      subregions.map((subregion: SubregionModel) => [
        subregion.id,
        subregion.name,
      ])
    );
  }, [subregions]);

  const regionMap = useMemo(() => {
    if (!regions) return new Map<number, string>();
    return new Map(
      regions.map((region: RegionModel) => [region.id, region.name])
    );
  }, [regions]);

  const handleAddItem = async () => {
    if (selectedId) {
      try {
        const district = districts?.find((d) => d.id === selectedId);
        if (district?.hasCity) {
          await createMunicipality({
            ...(newItem as ConstituencyMunicipalityModel),
            districtId: selectedId,
          }).unwrap();
        } else {
          await createConstituency({
            ...(newItem as ConstituencyMunicipalityModel),
            districtId: selectedId,
          }).unwrap();
        }
        setIsModalOpen(false);
        setNewItem({});
        setSelectedId(null);
        refetchConstituencies();
        refetchMunicipalities();
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
  };

  const handleUpdateItem = async () => {
    if (editingItem) {
      try {
        const district = districts?.find(
          (d) => d.id === editingItem.districtId
        );
        if (district?.hasCity) {
          await updateMunicipality({
            id: editingItem.id,
            updates: newItem as ConstituencyMunicipalityModel,
          }).unwrap();
        } else {
          await updateConstituency({
            id: editingItem.id,
            updates: newItem as ConstituencyMunicipalityModel,
          }).unwrap();
        }
        setIsModalOpen(false);
        setEditingItem(null);
        refetchConstituencies();
        refetchMunicipalities();
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const handleDeleteItem = async (item: ConstituencyMunicipalityModel) => {
    try {
      const district = districts?.find((d) => d.id === item.districtId);
      if (district?.hasCity) {
        await deleteMunicipality(item.id).unwrap();
      } else {
        await deleteConstituency(item.id).unwrap();
      }
      refetchConstituencies();
      refetchMunicipalities();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddRegistra = async () => {
    if (selectedId && newRegistra) {
      try {
        const district = districts?.find((d) => d.id === selectedId);
        if (district?.hasCity) {
          await createMunicipalityRegistra({
            municipalityId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
        } else {
          await createConstituencyRegistra({
            constituencyId: selectedId,
            registra: newRegistra as Registra,
          }).unwrap();
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
        const district = districts?.find((d) => d.id === selectedId);
        if (district?.hasCity) {
          await updateMunicipalityRegistra({
            municipalityId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
        } else {
          await updateConstituencyRegistra({
            constituencyId: selectedId,
            id: selectedRegistra.id,
            updates: newRegistra as Registra,
          }).unwrap();
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
        const district = districts?.find((d) => d.id === selectedId);
        if (district?.hasCity) {
          await deleteMunicipalityRegistra({
            municipalityId: selectedId,
            id: registraId,
          }).unwrap();
        } else {
          await deleteConstituencyRegistra({
            constituencyId: selectedId,
            id: registraId,
          }).unwrap();
        }
        setSelectedRegistra(null);
      } catch (error) {
        console.error("Error deleting registra:", error);
      }
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewItem({});
    setSelectedId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ConstituencyMunicipalityModel) => {
    setEditingItem(item);
    setNewItem(item);
    setSelectedId(item.districtId);
    setIsModalOpen(true);
  };

  const openAddRegistraModal = () => {
    setSelectedRegistra(null);
    setNewRegistra({});
    setIsRegistraModalOpen(true);
  };

  const openEditRegistraModal = (registra: Registra) => {
    setSelectedRegistra(registra);
    setNewRegistra(registra);
    setIsRegistraModalOpen(true);
  };

  // Changes 20/09/2024   -   STARTS  --------------------------------------------
  // Add this useEffect to fetch registrars when a municipality or constituency is selected

  useEffect(() => {
    if (selectedId) {
      const district = districts?.find((d) => d.id === selectedId);
      if (district?.hasCity) {
        // Fetch municipality registrars
        refetchMunicipalityRegistras();
      } else {
        // Fetch constituency registrars
        refetchConstituencyRegistras();
      }
    }
  }, [selectedId, districts]);

  // Update handleEditRegistra function
  const handleEditRegistra = (registra: Registra) => {
    setSelectedRegistra(registra);
    setNewRegistra(registra);
    setIsRegistraModalOpen(true);
  };

  // Update handleDeleteRegistra function

  // Changes 20/09/2024   -   END  --------------------------------------------

  if (isLoadingDistricts) return <div>Loading...</div>;
  if (isErrorDistricts) return <div>Error loading data</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">
          Constituencies and Municipalities
        </h1>
        <button
          onClick={openAddModal}
          className="mb-4 bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Constituencies</h2>
      <table className="min-w-full bg-white mb-8">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">District</th>
            <th className="px-4 py-2">Region</th>
            <th className="px-4 py-2">Subregion</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(constituencies as ConstituencyMunicipalityModel[])?.map(
            (constituency) => {
              const district = districts?.find(
                (d) => d.id === constituency.districtId
              );
              const subregion = subregions?.find(
                (s) => s.id === district?.subregionId
              );
              const regionName = subregion
                ? regionMap.get(subregion.regionId)
                : "N/A";

              return (
                <tr key={constituency.id}>
                  <td className="border px-4 py-2">{constituency.id}</td>
                  <td className="border px-4 py-2">{constituency.name}</td>
                  <td className="border px-4 py-2">
                    {district?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">{regionName}</td>
                  <td className="border px-4 py-2">
                    {subregion?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openEditModal(constituency)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(constituency)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedId(constituency.id);
                        openAddRegistraModal();
                      }}
                      className="ml-2 text-blue-500"
                    >
                      View Registra
                    </button>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-8 mb-4">Municipalities</h2>
      <table className="min-w-full bg-white mb-8">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">District</th>
            <th className="px-4 py-2">Region</th>
            <th className="px-4 py-2">Subregion</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(municipalities as ConstituencyMunicipalityModel[])?.map(
            (municipality) => {
              const district = districts?.find(
                (d) => d.id === municipality.districtId
              );
              const subregion = subregions?.find(
                (s) => s.id === district?.subregionId
              );
              const regionName = subregion
                ? regionMap.get(subregion.regionId)
                : "N/A";

              return (
                <tr key={municipality.id}>
                  <td className="border px-4 py-2">{municipality.id}</td>
                  <td className="border px-4 py-2">{municipality.name}</td>
                  <td className="border px-4 py-2">
                    {district?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">{regionName}</td>
                  <td className="border px-4 py-2">
                    {subregion?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openEditModal(municipality)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(municipality)}>
                      <Trash size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedId(municipality.id);
                        openAddRegistraModal();
                      }}
                      className="ml-2 text-blue-500"
                    >
                      View Registra
                    </button>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? "Edit" : "Add"}{" "}
              {selectedId &&
              districts?.find((d) => d.id === selectedId)?.hasCity
                ? "Municipality"
                : "Constituency"}
            </h2>
            <div>
              <label>
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
              <label>
                District:
                <select
                  value={selectedId || ""}
                  onChange={(e) => setSelectedId(Number(e.target.value))}
                  className="border px-2 py-1 w-full"
                  disabled={!!editingItem}
                >
                  <option value="">Select District</option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
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
              {(() => {
                const district = districts?.find((d) => d.id === selectedId);
                if (district?.hasCity) {
                  const municipality = municipalities?.find(
                    (m) => m.id === selectedId
                  );
                  return municipality
                    ? `${municipality.name} Registrars`
                    : "Municipality Registrars";
                } else {
                  const constituency = constituencies?.find(
                    (c) => c.id === selectedId
                  );
                  return constituency
                    ? `${constituency.name} Registrars`
                    : "Constituency Registrars";
                }
              })()}
            </h2>

            {/* Table of existing registrars */}
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
                  {(districts?.find((d) => d.id === selectedId)?.hasCity
                    ? municipalityRegistras
                    : constituencyRegistras
                  )?.map((registrar) => (
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
                          onClick={() => handleEditRegistra(registrar)}
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
                setNewRegistra({
                  ...newRegistra,
                  firstName: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newRegistra.lastName || ""}
              onChange={(e) =>
                setNewRegistra({
                  ...newRegistra,
                  lastName: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newRegistra.email || ""}
              onChange={(e) =>
                setNewRegistra({
                  ...newRegistra,
                  email: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={newRegistra.phoneNumber || ""}
              onChange={(e) =>
                setNewRegistra({
                  ...newRegistra,
                  phoneNumber: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="NIN Number"
              value={newRegistra.ninNumber || ""}
              onChange={(e) =>
                setNewRegistra({
                  ...newRegistra,
                  ninNumber: e.target.value,
                })
              }
              className="border border-gray-300 p-2 w-full mb-2"
            />
            <label className="inline-flex items-center mb-4">
              <input
                type="checkbox"
                checked={newRegistra.isActive || false}
                onChange={(e) =>
                  setNewRegistra({
                    ...newRegistra,
                    isActive: e.target.checked,
                  })
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

export default ConstituenciesMunicipalitiesPage;
