"use client";
import React, { useState, useEffect } from "react";
import {
  useGetConstituencyMunicipalityCandidatesQuery,
  useUpdateConstituencyMunicipalityCandidateMutation,
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
  constituencyMunicipalityElectionType: string;
  isQualified: boolean;
  vote: number;
}

const ConstituencyMunicipalityResults = () => {
  const [updateCandidate] =
    useUpdateConstituencyMunicipalityCandidateMutation();
  const { data: candidates, refetch } =
    useGetConstituencyMunicipalityCandidatesQuery({});
  const [activeTab, setActiveTab] = useState("all");

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
  }, [refetch]);

  const handleVoteChange = async (id: string, votes: number) => {
    try {
      await updateCandidate({ id, vote: votes }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update votes:", error);
      alert("Failed to update votes. Please try again.");
    }
  };

  const getName = (id: string | undefined, dataArray: any[] | undefined) => {
    if (!id || !dataArray) return "";
    const item = dataArray.find((item) => item.id.toString() === id.toString());
    return item ? item.name : "";
  };

  const getLocationName = (
    candidate: Candidate,
    cityField: keyof Candidate,
    ruralField: keyof Candidate,
    cityData: any[] | undefined,
    ruralData: any[] | undefined
  ) => {
    if (candidate[cityField]) {
      return getName(candidate[cityField] as string, cityData || []);
    } else {
      return getName(candidate[ruralField] as string, ruralData || []);
    }
  };

  const filterCandidatesByType = (type: string) => {
    const qualifiedCandidates =
      candidates?.filter((candidate: Candidate) => candidate.isQualified) || [];
    if (type === "all") return qualifiedCandidates;
    return qualifiedCandidates.filter(
      (candidate: Candidate) =>
        candidate.constituencyMunicipalityElectionType === type
    );
  };

  const sortCandidates = (candidates: Candidate[]) => {
    const sortedCandidates = [...candidates].sort((a, b) => b.vote - a.vote);
    const highestVote = sortedCandidates[0]?.vote;
    return sortedCandidates.map((candidate) => ({
      ...candidate,
      isWinner: candidate.vote === highestVote,
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Constituency/Municipality Election Results
      </h1>

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
        {["mps"].map((type) => (
          <button
            key={type}
            className={`mr-2 px-4 py-2 rounded ${
              activeTab === type ? "bg-yellow-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subregion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Constituency/Municipality
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcounty/Division
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parish/Ward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Village/Cell
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Election Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortCandidates(filterCandidatesByType(activeTab))?.map(
              (candidate: Candidate & { isWinner?: boolean }) => (
                <tr
                  key={candidate.id}
                  // className={candidate.isWinner ? "bg-yellow-100" : ""}
                  className={
                    activeTab !== "all" && candidate.isWinner
                      ? "bg-yellow-100"
                      : ""
                  }
                >
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
                      {getLocationName(
                        candidate,
                        "municipality",
                        "constituency",
                        municipalities,
                        constituencies
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {getLocationName(
                        candidate,
                        "division",
                        "subcounty",
                        divisions,
                        subcounties
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {getLocationName(
                        candidate,
                        "ward",
                        "parish",
                        wards,
                        parishes
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {getLocationName(
                        candidate,
                        "cell",
                        "village",
                        cells,
                        villages
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {candidate.constituencyMunicipalityElectionType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={candidate.vote}
                      onChange={(e) =>
                        handleVoteChange(candidate.id, parseInt(e.target.value))
                      }
                      className="w-20 p-1 border rounded"
                    />
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      {candidate.isWinner ? "Winner" : ""}
                    </div>
                  </td> */}

                  <td className="px-6 py-4 whitespace-nowrap">
                    {activeTab !== "all" && candidate.isWinner ? (
                      <span className="text-green-600">Winner</span>
                    ) : (
                      <span className="text-gray-500">—</span> // Placeholder for non-winners or when on the "All" tab
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConstituencyMunicipalityResults;
