"use client";
import React, { useState, useMemo } from "react";
import {
  useGetNationalsQuery,
  useGetRegionsQuery,
  useGetSubregionsQuery,
  useGetDistrictsQuery,
  useGetConstituenciesQuery,
  useGetSubcountiesQuery,
  useGetParishesQuery,
  useGetVillagesQuery,
  useGetMunicipalitiesQuery,
  useGetDivisionsQuery,
  useGetWardsQuery,
  useGetCellsQuery,
  useAddNationalOppositionMutation,
  useUpdateNationalOppositionMutation,
  useDeleteNationalOppositionMutation,
  useGetNationalOppositionQuery,
} from "@/state/api";

interface Candidate {
  id: string;
  ninNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  category?: string;
  region: string;
  subregion: string;
  district: string;
  constituency?: string;
  subcounty?: string;
  parish?: string;
  village?: string;
  municipality?: string;
  division?: string;
  ward?: string;
  cell?: string;
  nationalElectionType: string;
  isQualified: boolean;
  vote: number;
  party: string;
}

const NationalOpposition: React.FC = () => {
  const { data: nationalCandidates } = useGetNationalsQuery({});
  const { data: regions } = useGetRegionsQuery();
  const { data: subregions } = useGetSubregionsQuery();
  const { data: districts } = useGetDistrictsQuery();
  const { data: constituencies } = useGetConstituenciesQuery();
  const { data: subcounties } = useGetSubcountiesQuery();
  const { data: parishes } = useGetParishesQuery();
  const { data: villages } = useGetVillagesQuery();
  const { data: municipalities } = useGetMunicipalitiesQuery();
  const { data: divisions } = useGetDivisionsQuery();
  const { data: wards } = useGetWardsQuery();
  const { data: cells } = useGetCellsQuery();

  const [addNationalOpposition] = useAddNationalOppositionMutation();
  const [updateNationalOpposition] = useUpdateNationalOppositionMutation();
  const [deleteNationalOpposition] = useDeleteNationalOppositionMutation();
  const { data: nationalOppositionCandidates, refetch } =
    useGetNationalOppositionQuery({});

  const [activeTab, setActiveTab] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasCity, setHasCity] = useState(false);

  const [candidateData, setCandidateData] = useState<Candidate>({
    id: "",
    ninNumber: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    category: "",
    region: "",
    subregion: "",
    district: "",
    constituency: "",
    subcounty: "",
    parish: "",
    village: "",
    municipality: "",
    division: "",
    ward: "",
    cell: "",
    nationalElectionType: "",
    isQualified: false,
    vote: 0,
    party: "",
  });

  const groupWinnersByTypeAndCategory = (candidates: Candidate[]) => {
    const grouped: { [key: string]: { [key: string]: Candidate } } = {};
    candidates.forEach((candidate) => {
      if (candidate.isQualified) {
        if (!grouped[candidate.nationalElectionType]) {
          grouped[candidate.nationalElectionType] = {};
        }
        const category = candidate.category || "";
        if (
          !grouped[candidate.nationalElectionType][category] ||
          candidate.vote >
            grouped[candidate.nationalElectionType][category].vote
        ) {
          grouped[candidate.nationalElectionType][category] = candidate;
        }
      }
    });
    return grouped;
  };

  const winners = useMemo(() => {
    return groupWinnersByTypeAndCategory(nationalCandidates || []);
  }, [nationalCandidates]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCandidateData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "district") {
      const selectedDistrict = districts?.find(
        (d) => d.id.toString() === value
      );
      setHasCity(selectedDistrict?.hasCity || false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSubmit = {
        ...candidateData,
        vote: parseInt(candidateData.vote.toString()) || 0,
      };

      // Remove the id field if it's an empty string (for new candidates)
      if (!editMode) {
        delete dataToSubmit.id;
      }

      if (editMode) {
        await updateNationalOpposition({
          ...dataToSubmit,
          id: candidateData.id,
        }).unwrap();
      } else {
        await addNationalOpposition(dataToSubmit).unwrap();
      }

      refetch();
      resetForm();
      setShowForm(false);
      alert(
        `Opposition candidate ${editMode ? "updated" : "added"} successfully!`
      );
    } catch (error) {
      console.error(
        `Failed to ${editMode ? "update" : "add"} opposition candidate:`,
        error
      );
      alert(
        `Failed to ${
          editMode ? "update" : "add"
        } opposition candidate. Please try again.`
      );
    }
  };
  const handleEdit = (candidate: Candidate) => {
    setCandidateData(candidate);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteNationalOpposition(id).unwrap();
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
      region: "",
      subregion: "",
      district: "",
      constituency: "",
      subcounty: "",
      parish: "",
      village: "",
      municipality: "",
      division: "",
      ward: "",
      cell: "",
      nationalElectionType: "",
      isQualified: false,
      vote: 0,
      party: "",
    });
    setEditMode(false);
  };

  const getName = (id: string | undefined, dataArray: any[] | undefined) => {
    if (!id || !dataArray) return "";
    const item = dataArray.find((item) => item.id.toString() === id.toString());
    return item ? item.name : "";
  };

  const renderWinnerRow = (winner: Candidate) => (
    <tr key={winner.id} className="bg-yellow-100">
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {winner.firstName} {winner.lastName}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-500">{winner.ninNumber}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-500">{winner.phoneNumber}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {getName(winner.region, regions)}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {getName(winner.subregion, subregions)}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {getName(winner.district, districts)}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-500">{winner.vote}</div>
      </td>
    </tr>
  );

  const renderWinnerTable = (
    electionType: string,
    categoryWinners: { [key: string]: Candidate }
  ) => (
    <div key={electionType} className="mb-8 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">{electionType}</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NIN
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subregion
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              District
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Votes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(categoryWinners).map(([category, winner]) => (
            <React.Fragment key={category}>
              <tr>
                <td colSpan={7} className="px-3 py-2 bg-gray-100 font-medium">
                  {category}
                </td>
              </tr>
              {renderWinnerRow(winner)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        National Election Category Winners
      </h1>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(winners).map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded text-sm ${
              activeTab === type ? "bg-yellow-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Render tables for selected election type or all types if none selected */}
      {activeTab
        ? renderWinnerTable(activeTab, winners[activeTab])
        : Object.entries(winners).map(([electionType, categoryWinners]) =>
            renderWinnerTable(electionType, categoryWinners)
          )}

      {/* Add Opposition Candidate Button */}
      <button
        onClick={() => setShowForm(true)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Opposition Candidate
      </button>

      {/* Opposition Candidate Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-bold mb-4">
            {editMode ? "Edit" : "Add"} Opposition Candidate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full p-2 border rounded"
              name="ninNumber"
              placeholder="NIN Number"
              value={candidateData.ninNumber}
              onChange={handleInputChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              name="firstName"
              placeholder="First Name"
              value={candidateData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              name="lastName"
              placeholder="Last Name"
              value={candidateData.lastName}
              onChange={handleInputChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              name="phoneNumber"
              placeholder="Phone Number"
              value={candidateData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            <select
              className="w-full p-2 border rounded"
              name="region"
              value={candidateData.region}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Region</option>
              {regions?.map((region: any) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <select
              className="w-full p-2 border rounded"
              name="subregion"
              value={candidateData.subregion}
              onChange={handleInputChange}
              required
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
              className="w-full p-2 border rounded"
              name="district"
              value={candidateData.district}
              onChange={handleInputChange}
              required
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
            {!hasCity ? (
              <>
                <select
                  className="w-full p-2 border rounded"
                  name="constituency"
                  value={candidateData.constituency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Constituency</option>
                  {constituencies
                    ?.filter(
                      (constituency: any) =>
                        constituency.districtId ===
                        parseInt(candidateData.district)
                    )
                    .map((constituency: any) => (
                      <option key={constituency.id} value={constituency.id}>
                        {constituency.name}
                      </option>
                    ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  name="subcounty"
                  value={candidateData.subcounty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Subcounty</option>
                  {subcounties
                    ?.filter(
                      (subcounty: any) =>
                        subcounty.constituencyId ===
                        parseInt(candidateData.constituency)
                    )
                    .map((subcounty: any) => (
                      <option key={subcounty.id} value={subcounty.id}>
                        {subcounty.name}
                      </option>
                    ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  name="parish"
                  value={candidateData.parish}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Parish</option>
                  {parishes
                    ?.filter(
                      (parish: any) =>
                        parish.subcountyId === parseInt(candidateData.subcounty)
                    )
                    .map((parish: any) => (
                      <option key={parish.id} value={parish.id}>
                        {parish.name}
                      </option>
                    ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  name="village"
                  value={candidateData.village}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Village</option>
                  {villages
                    ?.filter(
                      (village: any) =>
                        village.parishId === parseInt(candidateData.parish)
                    )
                    .map((village: any) => (
                      <option key={village.id} value={village.id}>
                        {village.name}
                      </option>
                    ))}
                </select>
              </>
            ) : (
              <>
                <select
                  className="w-full p-2 border rounded"
                  name="municipality"
                  value={candidateData.municipality}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Municipality</option>
                  {municipalities
                    ?.filter(
                      (municipality: any) =>
                        municipality.districtId ===
                        parseInt(candidateData.district)
                    )
                    .map((municipality: any) => (
                      <option key={municipality.id} value={municipality.id}>
                        {municipality.name}
                      </option>
                    ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  name="division"
                  value={candidateData.division}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions
                    ?.filter(
                      (division: any) =>
                        division.municipalityId ===
                        parseInt(candidateData.municipality)
                    )
                    .map((division: any) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  name="ward"
                  value={candidateData.ward}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Ward</option>
                  {wards
                    ?.filter(
                      (ward: any) =>
                        ward.divisionId === parseInt(candidateData.division)
                    )
                    .map((ward: any) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  name="cell"
                  value={candidateData.cell}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Cell</option>
                  {cells
                    ?.filter(
                      (cell: any) =>
                        cell.wardId === parseInt(candidateData.ward)
                    )
                    .map((cell: any) => (
                      <option key={cell.id} value={cell.id}>
                        {cell.name}
                      </option>
                    ))}
                </select>
              </>
            )}
            <select
              className="w-full p-2 border rounded"
              name="nationalElectionType"
              value={candidateData.nationalElectionType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Election Type</option>
              <option value="cec">CEC</option>
              <option value="leagues">Leagues</option>
              <option value="presidential">Presidential</option>
              <option value="sigmps">SIG MPs</option>
              <option value="eala">EALA</option>
              <option value="speakership">Speakership</option>
              <option value="parliamentaryCaucus">Parliamentary Caucus</option>
            </select>
            <input
              className="w-full p-2 border rounded"
              name="category"
              placeholder="Category"
              value={candidateData.category}
              onChange={handleInputChange}
            />
            <input
              className="w-full p-2 border rounded"
              name="party"
              placeholder="Party"
              value={candidateData.party}
              onChange={handleInputChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="number"
              name="vote"
              placeholder="Votes"
              value={candidateData.vote}
              onChange={handleInputChange}
              required
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isQualified"
                checked={candidateData.isQualified}
                onChange={(e) =>
                  setCandidateData({
                    ...candidateData,
                    isQualified: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label>Is Qualified</label>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-md shadow-md hover:bg-yellow-600"
          >
            {editMode ? "Update Candidate" : "Submit Candidate"}
          </button>
        </form>
      )}

      {/* Opposition Candidates Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Opposition Candidates</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIN
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Constituency/Municipality
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Election Type
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Party
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qualified
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nationalOppositionCandidates?.map((candidate: Candidate) => (
              <tr key={candidate.id}>
                <td className="px-3 py-2 whitespace-nowrap">
                  {candidate.firstName} {candidate.lastName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {candidate.ninNumber}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {candidate.phoneNumber}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {getName(candidate.region, regions)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {getName(candidate.district, districts)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {getName(candidate.constituency, constituencies) ||
                    getName(candidate.municipality, municipalities)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {candidate.nationalElectionType}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {candidate.party}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {candidate.vote}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {candidate.isQualified ? "Yes" : "No"}
                </td>
                
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NationalOpposition;
