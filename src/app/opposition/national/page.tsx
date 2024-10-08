"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  useGetNationalsQuery,
  useGetNationalOppositionCandidatesQuery,
  useAddNationalOppositionCandidateMutation,
  useUpdateNationalOppositionCandidateMutation,
  useDeleteNationalOppositionCandidateMutation,
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
}

interface OppositionCandidate extends Omit<Candidate, "id"> {
  id?: string;
  party: string;
}

const NationalOpposition = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOppositionCandidate, setNewOppositionCandidate] = useState<
    Partial<OppositionCandidate>
  >({});

  const { data: nationalCandidates } = useGetNationalsQuery({});
  const { data: oppositionCandidates, refetch: refetchOpposition } =
    useGetNationalOppositionCandidatesQuery();
  const [addOppositionCandidate] = useAddNationalOppositionCandidateMutation();
  const [updateOppositionCandidate] =
    useUpdateNationalOppositionCandidateMutation();
  const [deleteOppositionCandidate] =
    useDeleteNationalOppositionCandidateMutation();

  // Fetch location data
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

  useEffect(() => {
    refetchOpposition();
  }, [refetchOpposition]);

  const getName = (id: string | undefined, dataArray: any[] | undefined) => {
    if (!id || !dataArray) return "";
    const item = dataArray.find((item) => item.id.toString() === id.toString());
    return item ? item.name : "";
  };

  const getLocationName = (
    candidate: Candidate | OppositionCandidate,
    cityField: keyof (Candidate | OppositionCandidate),
    ruralField: keyof (Candidate | OppositionCandidate),
    cityData: any[] | undefined,
    ruralData: any[] | undefined
  ) => {
    if (candidate[cityField]) {
      return getName(candidate[cityField] as string, cityData || []);
    } else {
      return getName(candidate[ruralField] as string, ruralData || []);
    }
  };

  const groupCandidatesByTypeAndCategory = (candidates: Candidate[]) => {
    const grouped: { [key: string]: { [key: string]: Candidate[] } } = {};
    candidates.forEach((candidate) => {
      if (candidate.isQualified) {
        if (!grouped[candidate.nationalElectionType]) {
          grouped[candidate.nationalElectionType] = {};
        }
        const category = candidate.category || "";
        if (!grouped[candidate.nationalElectionType][category]) {
          grouped[candidate.nationalElectionType][category] = [];
        }
        grouped[candidate.nationalElectionType][category].push(candidate);
      }
    });
    return grouped;
  };

  const sortedGroupedCandidates = useMemo(() => {
    const groupedCandidates = groupCandidatesByTypeAndCategory(
      nationalCandidates || []
    );
    Object.keys(groupedCandidates).forEach((type) => {
      Object.keys(groupedCandidates[type]).forEach((category) => {
        groupedCandidates[type][category].sort((a, b) => b.vote - a.vote);
      });
    });
    return groupedCandidates;
  }, [nationalCandidates]);

  const handleAddOppositionCandidate = async () => {
    try {
      await addOppositionCandidate(newOppositionCandidate).unwrap();
      setNewOppositionCandidate({});
      setShowAddForm(false);
      refetchOpposition();
    } catch (error) {
      console.error("Failed to add opposition candidate:", error);
      alert("Failed to add opposition candidate. Please try again.");
    }
  };

  const handleUpdateOppositionCandidate = async (
    id: string,
    updates: Partial<OppositionCandidate>
  ) => {
    try {
      await updateOppositionCandidate({ id, ...updates }).unwrap();
      refetchOpposition();
    } catch (error) {
      console.error("Failed to update opposition candidate:", error);
      alert("Failed to update opposition candidate. Please try again.");
    }
  };

  const handleDeleteOppositionCandidate = async (id: string) => {
    try {
      await deleteOppositionCandidate(id).unwrap();
      refetchOpposition();
    } catch (error) {
      console.error("Failed to delete opposition candidate:", error);
      alert("Failed to delete opposition candidate. Please try again.");
    }
  };

  const renderWinnerTable = (candidates: Candidate[], category: string) => {
    const winner = candidates[0];
    return (
      <div key={category} className="mb-8 overflow-x-auto">
        {category && <h3 className="text-lg font-semibold mb-2">{category}</h3>}
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
                Constituency/Municipality
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-yellow-100">
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {winner.firstName} {winner.lastName}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-500">{winner.ninNumber}</div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {winner.phoneNumber}
                </div>
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
                <div className="text-sm text-gray-500">
                  {getLocationName(
                    winner,
                    "municipality",
                    "constituency",
                    municipalities,
                    constituencies
                  )}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-500">{winner.vote}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderOppositionTable = () => {
    return (
      <div className="mb-8 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Opposition Candidates</h3>
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
                Constituency/Municipality
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Party
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {oppositionCandidates?.map((candidate) => (
              <tr key={candidate.id}>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {candidate.ninNumber}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {candidate.phoneNumber}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {getName(candidate.region, regions)}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {getName(candidate.subregion, subregions)}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {getName(candidate.district, districts)}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {getLocationName(
                      candidate,
                      "municipality",
                      "constituency",
                      municipalities,
                      constituencies
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{candidate.party}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={candidate.vote}
                    onChange={(e) =>
                      handleUpdateOppositionCandidate(candidate.id!, {
                        vote: parseInt(e.target.value),
                      })
                    }
                    className="w-16 p-1 border rounded text-sm"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() =>
                      handleDeleteOppositionCandidate(candidate.id!)
                    }
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
    );
  };

  const renderAddOppositionForm = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Add Opposition Candidate</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddOppositionCandidate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={newOppositionCandidate.firstName || ""}
              onChange={(e) =>
                setNewOppositionCandidate({
                  ...newOppositionCandidate,
                  firstName: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={newOppositionCandidate.lastName || ""}
              onChange={(e) =>
                setNewOppositionCandidate({
                  ...newOppositionCandidate,
                  lastName: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              NIN Number
            </label>
            <input
              type="text"
              value={newOppositionCandidate.ninNumber || ""}
              onChange={(e) =>
                setNewOppositionCandidate({
                  ...newOppositionCandidate,
                  ninNumber: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              value={newOppositionCandidate.phoneNumber || ""}
              onChange={(e) =>
                setNewOppositionCandidate({
                  ...newOppositionCandidate,
                  phoneNumber: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Party
            </label>
            <input
              type="text"
              value={newOppositionCandidate.party || ""}
              onChange={(e) =>
                setNewOppositionCandidate({
                  ...newOppositionCandidate,
                  party: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              National Election Type
            </label>
            <select
              value={newOppositionCandidate.nationalElectionType || ""}
              onChange={(e) =>
                setNewOppositionCandidate({
                  ...newOppositionCandidate,
                  nationalElectionType: e.target.value,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select Election Type</option>
              <option value="cec">CEC</option>
              <option value="leagues">Leagues</option>
              <option value="presidential">Presidential</option>
              <option value="sigmps">SIGMPS</option>
              <option value="eala">EALA</option>
              <option value="speakership">Speakership</option>
              <option value="parliamentaryCaucus">Parliamentary Caucus</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Candidate
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        National Opposition Candidates
      </h1>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 rounded text-sm ${
            activeTab === "all" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        {Object.keys(sortedGroupedCandidates).map((type) => (
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

      {/* Render tables for selected election type */}
      {activeTab === "all" ? (
        Object.entries(sortedGroupedCandidates).map(([type, categories]) => (
          <div key={type}>
            <h2 className="text-xl font-bold my-4">{type}</h2>
            {Object.entries(categories).map(([category, candidates]) =>
              renderWinnerTable(candidates, category)
            )}
          </div>
        ))
      ) : (
        <div>
          <h2 className="text-xl font-bold my-4">{activeTab}</h2>
          {Object.entries(sortedGroupedCandidates[activeTab] || {}).map(
            ([category, candidates]) => renderWinnerTable(candidates, category)
          )}
        </div>
      )}

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {showAddForm ? "Hide Add Opposition" : "Add Opposition"}
      </button>

      {showAddForm && renderAddOppositionForm()}

      {renderOppositionTable()}
    </div>
  );
};

export default NationalOpposition;
