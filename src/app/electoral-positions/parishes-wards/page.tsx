"use client";
import React, { useState, useEffect } from "react";
import {
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetDistrictsQuery,
  useGetConstituenciesQuery,
  useGetSubcountiesQuery,
  useGetParishesQuery,
  useGetMunicipalitiesQuery,
  useGetDivisionsQuery,
  useGetWardsQuery,
  useGetCellsQuery,
  useGetVillagesQuery,
  useAddParishesWardsCandidateMutation,
  useUpdateParishesWardsCandidateMutation,
  useDeleteParishesWardsCandidateMutation,
  useGetParishesWardsCandidatesQuery,
} from "@/state/api";

interface ParishesWardsCandidate {
  id: string;
  ninNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  category?: string;
  position?: string;
  region: string;
  subregion: string;
  district: string;
  constituency?: string;
  subcounty?: string;
  parish?: string;
  municipality?: string;
  division?: string;
  ward?: string;
  cell?: string;
  village?: string;
  parishwardElectionType: string;
}

const ParishesWardsElections: React.FC = () => {
  const { data: regions } = useGetRegionsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: constituencies } = useGetConstituenciesQuery();
  const { data: subcounties } = useGetSubcountiesQuery();
  const { data: parishes } = useGetParishesQuery();
  const { data: municipalities } = useGetMunicipalitiesQuery();
  const { data: divisions } = useGetDivisionsQuery();
  const { data: wards } = useGetWardsQuery();
  const { data: cells } = useGetCellsQuery();
  const { data: villages } = useGetVillagesQuery();

  const [addParishesWardsCandidate] = useAddParishesWardsCandidateMutation();
  const [updateParishesWardsCandidate] =
    useUpdateParishesWardsCandidateMutation();
  const [deleteParishesWardsCandidate] =
    useDeleteParishesWardsCandidateMutation();
  const { data: parishesWardsCandidates, refetch } =
    useGetParishesWardsCandidatesQuery({});

  const [electionType, setElectionType] = useState("");
  const [candidateData, setCandidateData] = useState<ParishesWardsCandidate>({
    id: "",
    ninNumber: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    category: "",
    position: "",
    region: "",
    subregion: "",
    district: "",
    constituency: "",
    subcounty: "",
    parish: "",
    cell: "",
    village: "",
    municipality: undefined,
    division: undefined,
    ward: undefined,
    parishwardElectionType: "",
  });
  const [hasCity, setHasCity] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const categoryOptions = {
    partyStructure: [
      "youth",
      "women",
      "pwds",
      "elders",
      "mainstream",
      "veterans",
    ],
    lc2: [],
  };

  const positionOptions = {
    partyStructure: [
      "chairman",
      "vice chairman",
      "secretary finance",
      "general secretary",
      "secretary publicity",
    ],
    lc2: [],
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCandidateData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));

    if (name === "district") {
      const selectedDistrict = districts?.find(
        (d) => d.id.toString() === value
      );
      setHasCity(selectedDistrict?.hasCity || false);
    }
  };

  const handleElectionTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setElectionType(e.target.value);
    setCandidateData({
      ...candidateData,
      parishwardElectionType: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "ninNumber",
      "firstName",
      "lastName",
      "phoneNumber",
      "region",
      "subregion",
      "district",
      "parishwardElectionType",
    ];

    if (!hasCity) {
      requiredFields.push("constituency", "subcounty", "parish");
    } else {
      requiredFields.push("municipality", "division", "ward");
    }

    const missingFields = requiredFields.filter(
      (field) => !candidateData[field as keyof ParishesWardsCandidate]
    );

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const dataToSubmit: Partial<ParishesWardsCandidate> = {
        ninNumber: candidateData.ninNumber,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        phoneNumber: candidateData.phoneNumber,
        category: candidateData.category,
        position: candidateData.position,
        region: candidateData.region,
        subregion: candidateData.subregion,
        district: candidateData.district,
        parishwardElectionType: candidateData.parishwardElectionType,
        constituency: candidateData.constituency,
        subcounty: candidateData.subcounty,
        parish: candidateData.parish,
        municipality: candidateData.municipality,
        division: candidateData.division,
        ward: candidateData.ward,
      };

      Object.keys(dataToSubmit).forEach((key) => {
        if (dataToSubmit[key as keyof ParishesWardsCandidate] === undefined) {
          delete dataToSubmit[key as keyof ParishesWardsCandidate];
        }
      });

      if (editMode) {
        await updateParishesWardsCandidate({
          ...dataToSubmit,
          id: candidateData.id,
        }).unwrap();
      } else {
        await addParishesWardsCandidate(dataToSubmit).unwrap();
      }
      refetch();
      resetForm();
      alert(`Candidate ${editMode ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error(
        `Failed to ${editMode ? "update" : "add"} candidate:`,
        error
      );
      alert(
        `Failed to ${editMode ? "update" : "add"} candidate. Please try again.`
      );
    }
  };

  const handleEdit = (candidate: ParishesWardsCandidate) => {
    setCandidateData(candidate);
    setElectionType(candidate.parishwardElectionType);
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteParishesWardsCandidate(id).unwrap();
        refetch();
        alert("Candidate deleted successfully!");
      } catch (error) {
        console.error("Failed to delete candidate:", error);
        alert("Failed to delete candidate. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setCandidateData({
      id: "",
      ninNumber: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      category: "",
      position: "",
      region: "",
      subregion: "",
      district: "",
      constituency: "",
      subcounty: "",
      parish: "",
      municipality: undefined,
      division: undefined,
      ward: undefined,
      parishwardElectionType: "",
    });
    setElectionType("");
    setEditMode(false);
  };

  const renderFormFields = () => {
    switch (electionType) {
      case "partyStructure":
        return (
          <>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="category"
              value={candidateData.category}
              onChange={handleInputChange}
            >
              <option value="">Select Category</option>
              {categoryOptions.partyStructure.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="position"
              value={candidateData.position}
              onChange={handleInputChange}
            >
              <option value="">Select Position</option>
              {positionOptions.partyStructure.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </>
        );
      case "lc2":
      default:
        return null;
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const getName = (id: string | undefined, dataArray: any[] | undefined) => {
    if (!id || !dataArray) return "";
    const item = dataArray.find((item) => item.id.toString() === id.toString());
    return item ? item.name : "";
  };

  const filterCandidatesByType = (type: string) => {
    if (type === "all") return parishesWardsCandidates;
    return parishesWardsCandidates?.filter(
      (candidate: ParishesWardsCandidate) =>
        candidate.parishwardElectionType === type
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Parish/Ward Elections Candidate Information
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Election Type
          </label>
          <select
            className="block w-full mt-1 p-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="electionType"
            value={electionType}
            onChange={handleElectionTypeChange}
          >
            <option value="">Select Election Type</option>
            <option value="partyStructure">Party Structure</option>
            <option value="lc2">LC2 Elections</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="ninNumber"
            placeholder="NIN Number"
            value={candidateData.ninNumber}
            onChange={handleInputChange}
          />
          <input
            className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="firstName"
            placeholder="First Name"
            value={candidateData.firstName}
            onChange={handleInputChange}
          />
          <input
            className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="lastName"
            placeholder="Last Name"
            value={candidateData.lastName}
            onChange={handleInputChange}
          />
          <input
            className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="phoneNumber"
            placeholder="Phone Number"
            value={candidateData.phoneNumber}
            onChange={handleInputChange}
          />
          <select
            className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="region"
            value={candidateData.region}
            onChange={handleInputChange}
          >
            <option value="">Select Region</option>
            {regions?.map((region: any) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <select
            className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="subregion"
            value={candidateData.subregion}
            onChange={handleInputChange}
          >
            <option value="">Select Subregion</option>
            {subregions
              ?.filter(
                (subregion: any) =>
                  subregion.regionId === parseInt(candidateData.region)
              )
              .map((subregion: any) => (
                <option key={subregion.id} value={subregion.id}>
                  {subregion.name}
                </option>
              ))}
          </select>
          <select
            className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
            name="district"
            value={candidateData.district}
            onChange={handleInputChange}
          >
            <option value="">Select District</option>
            {districts
              ?.filter(
                (district: any) =>
                  district.subregionId === parseInt(candidateData.subregion)
              )
              .map((district: any) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
          </select>
        </div>

        {!hasCity && (
          <>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="constituency"
              value={candidateData.constituency || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Constituency</option>
              {constituencies
                ?.filter(
                  (constituency: any) =>
                    constituency.districtId === parseInt(candidateData.district)
                )
                .map((constituency: any) => (
                  <option key={constituency.id} value={constituency.id}>
                    {constituency.name}
                  </option>
                ))}
            </select>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="subcounty"
              value={candidateData.subcounty || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Subcounty</option>
              {subcounties
                ?.filter(
                  (subcounty: any) =>
                    subcounty.constituencyId ===
                    parseInt(candidateData.constituency || "0")
                )
                .map((subcounty: any) => (
                  <option key={subcounty.id} value={subcounty.id}>
                    {subcounty.name}
                  </option>
                ))}
            </select>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="parish"
              value={candidateData.parish || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Parish</option>
              {parishes
                ?.filter(
                  (parish: any) =>
                    parish.subcountyId ===
                    parseInt(candidateData.subcounty || "0")
                )
                .map((parish: any) => (
                  <option key={parish.id} value={parish.id}>
                    {parish.name}
                  </option>
                ))}
            </select>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="village"
              value={candidateData.village || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Village</option>
              {villages
                ?.filter(
                  (village: any) =>
                    village.parishId === parseInt(candidateData.parish || "0")
                )
                .map((village: any) => (
                  <option key={village.id} value={village.id}>
                    {village.name}
                  </option>
                ))}
            </select>
          </>
        )}

        {hasCity && (
          <>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="municipality"
              value={candidateData.municipality || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Municipality</option>
              {municipalities
                ?.filter(
                  (municipality: any) =>
                    municipality.districtId === parseInt(candidateData.district)
                )
                .map((municipality: any) => (
                  <option
                    key={municipality.id}
                    value={municipality.id.toString()}
                  >
                    {municipality.name}
                  </option>
                ))}
            </select>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="division"
              value={candidateData.division || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Division</option>
              {divisions
                ?.filter(
                  (division: any) =>
                    division.municipalityId ===
                    (candidateData.municipality
                      ? parseInt(candidateData.municipality)
                      : undefined)
                )
                .map((division: any) => (
                  <option key={division.id} value={division.id.toString()}>
                    {division.name}
                  </option>
                ))}
            </select>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="ward"
              value={candidateData.ward || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Ward</option>
              {wards
                ?.filter(
                  (ward: any) =>
                    ward.divisionId ===
                    (candidateData.division
                      ? parseInt(candidateData.division)
                      : undefined)
                )
                .map((ward: any) => (
                  <option key={ward.id} value={ward.id.toString()}>
                    {ward.name}
                  </option>
                ))}
            </select>
            <select
              className="block w-full p-2 mt-2 border rounded-md shadow-sm focus:border-yellow-500"
              name="cell"
              value={candidateData.cell || ""}
              onChange={handleInputChange}
            >
              <option value="">Select Cell</option>
              {cells
                ?.filter(
                  (cell: any) =>
                    cell.wardId ===
                    (candidateData.ward
                      ? parseInt(candidateData.ward)
                      : undefined)
                )
                .map((cell: any) => (
                  <option key={cell.id} value={cell.id.toString()}>
                    {cell.name}
                  </option>
                ))}
            </select>
          </>
        )}

        {renderFormFields()}

        <button
          type="submit"
          className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-md shadow-md hover:bg-yellow-600"
        >
          {editMode ? "Update Candidate" : "Submit Candidate"}
        </button>

        {editMode && (
          <button
            type="button"
            onClick={resetForm}
            className="mt-2 w-full bg-gray-300 text-gray-700 py-2 rounded-md shadow-md hover:bg-gray-400"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Registered Candidates</h2>

        {/* Tabs */}
        <div className="mb-4">
          <button
            className={`mr-2 px-4 py-2 rounded ${
              activeTab === "all" ? "bg-yellow-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          {["partyStructure", "lc2"].map((type) => (
            <button
              key={type}
              className={`mr-2 px-4 py-2 rounded ${
                activeTab === type ? "bg-yellow-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setActiveTab(type)}
            >
              {type === "partyStructure" ? "Party Structure" : "LC2"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  NIN
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Region
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subregion
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  District
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Constituency/Municipality
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subcounty/Division
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Parish/Ward
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Village/Cell
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Election Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Position
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterCandidatesByType(activeTab)?.map(
                (candidate: ParishesWardsCandidate, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.ninNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getName(candidate.region, regions)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getName(candidate.subregion, subregions)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getName(candidate.district, districts)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.municipality
                          ? getName(candidate.municipality, municipalities)
                          : getName(candidate.constituency, constituencies)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.division
                          ? getName(candidate.division, divisions)
                          : getName(candidate.subcounty, subcounties)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.ward
                          ? getName(candidate.ward, wards)
                          : getName(candidate.parish, parishes)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.cell
                          ? getName(candidate.cell, cells)
                          : getName(candidate.village, villages)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.parishwardElectionType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(candidate)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="text-red-600 hover:text-red-900"
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
      </div>
    </div>
  );
};

export default ParishesWardsElections;
