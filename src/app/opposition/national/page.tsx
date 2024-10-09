"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  useGetNationalsQuery,
  useGetNationalOppositionQuery,
  useAddNationalOppositionMutation,
  useUpdateNationalOppositionMutation,
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

interface NationalOppositionCandidate {
  id?: string;
  OppositionCandidate: {
    ninNumber: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
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
  vote: number;
  party: string;
}

const NationalOpposition = () => {
  const { data: nationalCandidates, refetch } = useGetNationalsQuery({});
  const { data: oppositionCandidates, refetch: refetchOpposition } =
    useGetNationalOppositionQuery();
  const [addNationalOpposition] = useAddNationalOppositionMutation();
  const [updateNationalOpposition] = useUpdateNationalOppositionMutation();
  const [deleteNationalOppositionCandidate] =
    useDeleteNationalOppositionCandidateMutation();
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOppositionCandidate, setNewOppositionCandidate] = useState<
    Partial<NationalOppositionCandidate>
  >({
    OppositionCandidate: {
      ninNumber: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });
  const [currentElectionType, setCurrentElectionType] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");

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
    refetch();
    refetchOpposition();
  }, [refetch, refetchOpposition]);

  const getName = (id: string | undefined, dataArray: any[] | undefined) => {
    if (!id || !dataArray) return "";
    const item = dataArray.find((item) => item.id.toString() === id.toString());
    return item ? item.name : "";
  };

  const getLocationName = (
    candidate: Candidate | NationalOppositionCandidate,
    cityField: keyof (Candidate | NationalOppositionCandidate),
    ruralField: keyof (Candidate | NationalOppositionCandidate),
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
        // Keep only the winner (first candidate after sorting)
        groupedCandidates[type][category] = [
          groupedCandidates[type][category][0],
        ];
      });
    });
    return groupedCandidates;
  }, [nationalCandidates]);

  const handleAddOpposition = (electionType: string, category: string) => {
    setCurrentElectionType(electionType);
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewOppositionCandidate({
      OppositionCandidate: {
        ninNumber: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field?: string
  ) => {
    const { name, value } = e.target;
    if (field === 'OppositionCandidate') {
      setNewOppositionCandidate((prev) => ({
        ...prev,
        OppositionCandidate: {
          ...prev.OppositionCandidate,
          [name]: value,
        },
      }));
    } else {
      setNewOppositionCandidate((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNationalOpposition({
        ...newOppositionCandidate,
        nationalElectionType: currentElectionType,
        category: currentCategory,
      }).unwrap();
      refetchOpposition();
      handleModalClose();
    } catch (error) {
      console.error("Failed to add opposition candidate:", error);
    }
  };

  const handleDeleteOpposition = async (id: string) => {
    try {
      await deleteNationalOppositionCandidate(id).unwrap();
      refetchOpposition();
    } catch (error) {
      console.error("Failed to delete opposition candidate:", error);
    }
  };

  const renderCandidateTable = (
    candidates: Candidate[],
    category: string,
    electionType: string
  ) => {
    const winner = candidates[0];
    const oppositionCandidatesForCategory =
      oppositionCandidates?.filter(
        (c) =>
          c.nationalElectionType === electionType && c.category === category
      ) || [];

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
                Subcounty/Division
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parish/Ward
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Village/Cell
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                <div className="text-sm text-gray-500">
                  {getLocationName(
                    winner,
                    "division",
                    "subcounty",
                    divisions,
                    subcounties
                  )}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {getLocationName(winner, "ward", "parish", wards, parishes)}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {getLocationName(winner, "cell", "village", cells, villages)}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="text-sm text-gray-500">{winner.vote}</div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="text-green-600 text-sm">Winner</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4">
          <button
            onClick={() => handleAddOpposition(electionType, category)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Opposition
          </button>
        </div>
        {oppositionCandidatesForCategory.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">
              Opposition Candidates
            </h4>
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
                {oppositionCandidatesForCategory.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.OppositionCandidate.firstName} {candidate.OppositionCandidate.lastName}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.OppositionCandidate.ninNumber}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.OppositionCandidate.phoneNumber}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.party}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {candidate.vote}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteOpposition(candidate.id!)}
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
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">National Opposition Winners</h1>

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
              renderCandidateTable(candidates, category, type)
            )}
          </div>
        ))
      ) : (
        <div>
          <h2 className="text-xl font-bold my-4">{activeTab}</h2>
          {Object.entries(sortedGroupedCandidates[activeTab] || {}).map(
            ([category, candidates]) =>
              renderCandidateTable(candidates, category, activeTab)
          )}
        </div>
      )}

      {/* Modal for adding opposition candidates */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add Opposition Candidate</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newOppositionCandidate.OppositionCandidate?.firstName || ""}
                onChange={(e) => handleInputChange(e, 'OppositionCandidate')}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newOppositionCandidate.OppositionCandidate?.lastName || ""}
                onChange={(e) => handleInputChange(e, 'OppositionCandidate')}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <input
                type="text"
                name="ninNumber"
                placeholder="NIN Number"
                value={newOppositionCandidate.OppositionCandidate?.ninNumber || ""}
                onChange={(e) => handleInputChange(e, 'OppositionCandidate')}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={newOppositionCandidate.OppositionCandidate?.phoneNumber || ""}
                onChange={(e) => handleInputChange(e, 'OppositionCandidate')}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <input
                type="text"
                name="party"
                placeholder="Party"
                value={newOppositionCandidate.party || ""}
                onChange={(e) => handleInputChange(e)}
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalOpposition;