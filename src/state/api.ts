import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';

// Define your models
export interface UnitModel {
  id: number;
  name: string;
}


export interface SubregionModel extends UnitModel {
  regionId: number;
  region?: UnitModel; // Contains the region object
}

// export interface DistrictModel extends UnitModel {
//   subregionId: number;
// }

export interface DistrictModel extends UnitModel {
  subregionId: number;
  hasCity: boolean;
}

export interface DistrictRegistra {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ninNumber: string;
  isActive: boolean;
}

export interface RegionalCoordinator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ninNumber: string;
  isActive: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  ninNumber: string;
  email: string;
  password: string;
  role: string; // e.g., 'District Registrar', 'Regional Coordinator', etc.
  phoneNumber: string; 
  // address?: string; // Optional
  // createdAt?: string; // Optional
  // updatedAt?: string; // Optional
}

// 19/09/2024-----------------------START
export interface ConstituencyModel extends UnitModel {
  districtId: number;
}

export interface MunicipalityModel extends UnitModel {
  districtId: number;
}

export interface Registra {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ninNumber: string;
  isActive: boolean;
}

export interface ConstituencyRegistra extends Registra {
  constituencyId: number;
}

export interface MunicipalityRegistra extends Registra {
  municipalityId: number;
}
// 19/09/2024-----------------------END

// 24/09/2024-----------------------START
export interface SubcountyModel extends UnitModel {
  constituencyId: number;
}

export interface DivisionModel extends UnitModel {
  municipalityId: number;
}

export interface SubcountyRegistra extends Registra {
  subcountyId: number;
}

export interface DivisionRegistra extends Registra {
  divisionId: number;
}

// 24/09/2024-----------------------END

export interface ParishModel extends UnitModel {
  subcountyId: number;
}

export interface WardModel extends UnitModel {
  divisionId: number;
}

export interface ParishRegistra extends Registra {
  parishId: number;
}

export interface WardRegistra extends Registra {
  wardId: number;
}

export interface VillageModel extends UnitModel {
  parishId: number;
}

export interface CellModel extends UnitModel {
  wardId: number;
}

export interface PollingStation {
  id: number;
  name: string;
  parishId?: number;
  wardId?: number;
  code: string;
}

export interface OppositionCandidate {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  party: string;
  electionType: 'village' | 'national' | 'constituency' | 'parish' | 'district' | 'subcounty';
  vote: number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'pending' | 'approved';
  createdBy?: number;
  updatedBy?: number;
  approvedBy?: number;
  isQualified?: boolean;
}

interface NationalOppositionCandidate {
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
  vote: number;
  party: string;
}



// Define the API
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await getSession(); // Get the session from NextAuth

      if (session?.token) {
        headers.set('Authorization', `Bearer ${session.token}`);
      }

      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  reducerPath: 'api',
  tagTypes: [
    'Regions', 'Subregions', 'Districts', 'Constituencies', 'Subcounties', 
    'Parishes', 'Villages', 'Divisions', 'Municipalities', 'Wards', 
    'Cells', 'Cities', 'Users', 'ConstituencyRegistrars',
    'MunicipalityRegistrars','SubcountyRegistrars','DivisionRegistrars',
    'Candidate', 'VillageCellsCandidates', 'NationalCandidate','WardRegistrars','ParishRegistrars','VillageRegistrars',
    'CellRegistrars','ParishPollingStations','WardPollingStations','ParishesWardsCandidates','SubcountiesDivisionsCandidates',
    'ConstituencyMunicipalityCandidates','DistrictCandidates','OppositionCandidates','NationalOppositionCandidate'
  ],
  endpoints: (build) => ({
    // Authentication
    // login: build.mutation<LoginResponse, LoginCredentials>({
    //   query: (credentials) => ({
    //     url: 'auth/login',
    //     method: 'POST',
    //     body: credentials,
    //   }),
    // }),

    // Users endpoints
    getUsers: build.query<User[], void>({
      query: () => 'user/users',
      providesTags: ['Users'],
    }),
    fetchUser: build.query<User, string>({
      query: (id) => `user/users/${id}`,
    }),
    addUser: build.mutation<User, Partial<User>>({
      query: (newUser) => ({
        url: 'user/add-user',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: build.mutation<User, User>({
      query: (user) => ({
        url: `user/users/${user.id}`,
        method: 'PUT',
        body: user,
      }), 
      invalidatesTags: ['Users'],
    }),
    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: `user/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Regions endpoints
    getRegions: build.query<UnitModel[], void>({
      query: () => 'regions',
      providesTags: ['Regions'],
    }),
    addRegion: build.mutation<UnitModel, Partial<UnitModel>>({
      query: (newRegion) => ({
        url: 'regions',
        method: 'POST',
        body: newRegion,
      }),
      invalidatesTags: ['Regions'],
    }),
    updateRegion: build.mutation<UnitModel, UnitModel>({
      query: (updatedRegion) => ({
        url: `regions/${updatedRegion.id}`,
        method: 'PUT',
        body: updatedRegion,
      }),
      invalidatesTags: ['Regions'],
    }),
    deleteRegion: build.mutation<void, number>({
      query: (id) => ({
        url: `regions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Regions'],
    }),

    // Subregions endpoints
    getSubregions: build.query<SubregionModel[], void>({
      query: () => 'subregions',
      providesTags: ['Subregions'],
    }),
    createSubregion: build.mutation<SubregionModel, Partial<SubregionModel>>({
      query: (newSubregion) => ({
        url: '/subregions',
        method: 'POST',
        body: newSubregion,
      }),
      invalidatesTags: ['Subregions'],
    }),
    updateSubregion: build.mutation<SubregionModel, { id: number; updates: Partial<SubregionModel> }>({
      query: ({ id, updates }) => ({
        url: `/subregions/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Subregions'],
    }),
    deleteSubregion: build.mutation<void, number>({
      query: (id) => ({
        url: `/subregions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subregions'],
    }),

    // Districts endpoints
    // Districts endpoints
    getDistricts: build.query<DistrictModel[], void>({
      query: () => 'districts',
      providesTags: ['Districts'],
    }),
    createDistrict: build.mutation<DistrictModel, Partial<DistrictModel>>({
      query: (newDistrict) => ({
        url: '/districts',
        method: 'POST',
        body: newDistrict,
      }),
      invalidatesTags: ['Districts'],
    }),
    updateDistrict: build.mutation<DistrictModel, { id: number; updates: Partial<DistrictModel> }>({
      query: ({ id, updates }) => ({
        url: `/districts/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Districts'],
    }),
    deleteDistrict: build.mutation<void, number>({
      query: (id) => ({
        url: `/districts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Districts'],
    }),

    // District Registrars endpoints
    getDistrictRegistras: build.query<DistrictRegistra[], number>({
      query: (districtId) => `districts/${districtId}/registrars`,
    }),
    createDistrictRegistra: build.mutation<void, { districtId: number; registra: Partial<DistrictRegistra> }>({
      query: ({ districtId, registra }) => ({
        url: `districts/${districtId}/registrars`,
        method: 'POST',
        body: registra,
      }),
    }),
    updateDistrictRegistra: build.mutation<void, { districtId: number; id: number; updates: Partial<DistrictRegistra> }>({
      query: ({ districtId, id, updates }) => ({
        url: `districts/${districtId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
    }),
    deleteDistrictRegistra: build.mutation<void, { districtId: number; id: number }>({
      query: ({ districtId, id }) => ({
        url: `districts/${districtId}/registrars/${id}`,
        method: 'DELETE',
      }),
    }),

    // 19/09/2024-----------------------START
    createConstituency: build.mutation<ConstituencyModel, Partial<ConstituencyModel>>({
      query: (newConstituency) => ({
        url: '/constituencies',
        method: 'POST',
        body: newConstituency,
      }),
      invalidatesTags: ['Constituencies'],
    }),
    updateConstituency: build.mutation<ConstituencyModel, { id: number; updates: Partial<ConstituencyModel> }>({
      query: ({ id, updates }) => ({
        url: `/constituencies/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Constituencies'],
    }),
    deleteConstituency: build.mutation<void, number>({
      query: (id) => ({
        url: `/constituencies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Constituencies'],
    }),
    getConstituencyRegistras: build.query<Registra[], number>({
      query: (constituencyId) => `constituencies/${constituencyId}/registrars`,
      providesTags: ['ConstituencyRegistrars'],
    }),
    createConstituencyRegistra: build.mutation<void, { constituencyId: number; registra: Partial<Registra> }>({
      query: ({ constituencyId, registra }) => ({
        url: `constituencies/${constituencyId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['ConstituencyRegistrars'],
    }),
    updateConstituencyRegistra: build.mutation<void, { constituencyId: number; id: number; updates: Partial<Registra> }>({
      query: ({ constituencyId, id, updates }) => ({
        url: `constituencies/${constituencyId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['ConstituencyRegistrars'],
    }),
    deleteConstituencyRegistra: build.mutation<void, { constituencyId: number; id: number }>({
      query: ({ constituencyId, id }) => ({
        url: `constituencies/${constituencyId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConstituencyRegistrars'],
    }),

    // Municipalities endpoints
  
    createMunicipality: build.mutation<MunicipalityModel, Partial<MunicipalityModel>>({
      query: (newMunicipality) => ({
        url: '/municipalities',
        method: 'POST',
        body: newMunicipality,
      }),
      invalidatesTags: ['Municipalities'],
    }),
    updateMunicipality: build.mutation<MunicipalityModel, { id: number; updates: Partial<MunicipalityModel> }>({
      query: ({ id, updates }) => ({
        url: `/municipalities/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Municipalities'],
    }),
    deleteMunicipality: build.mutation<void, number>({
      query: (id) => ({
        url: `/municipalities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Municipalities'],
    }),
    getMunicipalityRegistras: build.query<Registra[], number>({
      query: (municipalityId) => `municipalities/${municipalityId}/registrars`,
      providesTags: ['MunicipalityRegistrars'],
    }),
    createMunicipalityRegistra: build.mutation<void, { municipalityId: number; registra: Partial<Registra> }>({
      query: ({ municipalityId, registra }) => ({
        url: `municipalities/${municipalityId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['MunicipalityRegistrars'],
    }),
    updateMunicipalityRegistra: build.mutation<void, { municipalityId: number; id: number; updates: Partial<Registra> }>({
      query: ({ municipalityId, id, updates }) => ({
        url: `municipalities/${municipalityId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['MunicipalityRegistrars'],
    }),
    deleteMunicipalityRegistra: build.mutation<void, { municipalityId: number; id: number }>({
      query: ({ municipalityId, id }) => ({
        url: `municipalities/${municipalityId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MunicipalityRegistrars'],
    }),

    // 19/09/2024-----------------------END

    // 24/09/2024-----------------------START
    createSubcounty: build.mutation<SubcountyModel, Partial<SubcountyModel>>({
      query: (newSubcounty) => ({
        url: '/subcounties',
        method: 'POST',
        body: newSubcounty,
      }),
      invalidatesTags: ['Subcounties'],
    }),
    updateSubcounty: build.mutation<SubcountyModel, { id: number; updates: Partial<SubcountyModel> }>({
      query: ({ id, updates }) => ({
        url: `/subcounties/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Subcounties'],
    }),
    deleteSubcounty: build.mutation<void, number>({
      query: (id) => ({
        url: `/subcounties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subcounties'],
    }),
    createDivision: build.mutation<DivisionModel, Partial<DivisionModel>>({
      query: (newDivision) => ({
        url: '/divisions',
        method: 'POST',
        body: newDivision,
      }),
      invalidatesTags: ['Divisions'],
    }),
    updateDivision: build.mutation<DivisionModel, { id: number; updates: Partial<DivisionModel> }>({
      query: ({ id, updates }) => ({
        url: `/divisions/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Divisions'],
    }),
    deleteDivision: build.mutation<void, number>({
      query: (id) => ({
        url: `/divisions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Divisions'],
    }),
    getSubcountyRegistras: build.query<Registra[], number>({
      query: (subcountyId) => `subcounties/${subcountyId}/registrars`,
      providesTags: ['SubcountyRegistrars'],
    }),
    createSubcountyRegistra: build.mutation<void, { subcountyId: number; registra: Partial<Registra> }>({
      query: ({ subcountyId, registra }) => ({
        url: `subcounties/${subcountyId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['SubcountyRegistrars'],
    }),
    updateSubcountyRegistra: build.mutation<void, { subcountyId: number; id: number; updates: Partial<Registra> }>({
      query: ({ subcountyId, id, updates }) => ({
        url: `subcounties/${subcountyId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['SubcountyRegistrars'],
    }),
    deleteSubcountyRegistra: build.mutation<void, { subcountyId: number; id: number }>({
      query: ({ subcountyId, id }) => ({
        url: `subcounties/${subcountyId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubcountyRegistrars'],
    }),
    getDivisionRegistras: build.query<Registra[], number>({
      query: (divisionId) => `divisions/${divisionId}/registrars`,
      providesTags: ['DivisionRegistrars'],
    }),
    createDivisionRegistra: build.mutation<void, { divisionId: number; registra: Partial<Registra> }>({
      query: ({ divisionId, registra }) => ({
        url: `divisions/${divisionId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['DivisionRegistrars'],
    }),
    updateDivisionRegistra: build.mutation<void, { divisionId: number; id: number; updates: Partial<Registra> }>({
      query: ({ divisionId, id, updates }) => ({
        url: `divisions/${divisionId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['DivisionRegistrars'],
    }),
    deleteDivisionRegistra: build.mutation<void, { divisionId: number; id: number }>({
      query: ({ divisionId, id }) => ({
        url: `divisions/${divisionId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DivisionRegistrars'],
    }),
    // 24/09/2024-----------------------END

    // Regional Coordinators endpoints
    // getRegionalCoordinatorsInSubregion: build.query<RegionalCoordinator[], number>({
    //   query: (subregionId) => `/subregions/${subregionId}/regionalCoordinators`,
    // }),
    createRegionalCoordinatorInSubregion: build.mutation<RegionalCoordinator, { subregionId: number; coordinator: Partial<RegionalCoordinator> }>({
      query: ({ subregionId, coordinator }) => ({
        url: `/subregions/${subregionId}/regionalCoordinators`,
        method: 'POST',
        body: coordinator,
      }),
    }),

      // Regional Coordinator endpoints
      getRegionalCoordinatorsInSubregion: build.query<RegionalCoordinator[], number>({
        query: (subregionId) => `subregions/${subregionId}/regionalCoordinators`,
      }),
      createRegionalCoordinator: build.mutation<void, { subregionId: number; coordinator: Partial<RegionalCoordinator> }>({
        query: ({ subregionId, coordinator }) => ({
          url: `subregions/${subregionId}/regionalCoordinators`,
          method: 'POST',
          body: coordinator,
        }),
      }),
      updateRegionalCoordinator: build.mutation<void, { subregionId: number; id: number; updates: Partial<RegionalCoordinator> }>({
        query: ({ subregionId, id, updates }) => ({
          url: `subregions/${subregionId}/regionalCoordinators/${id}`,
          method: 'PUT',
          body: updates,
        }),
      }),
      deleteRegionalCoordinator: build.mutation<void, { subregionId: number; id: number }>({
        query: ({ subregionId, id }) => ({
          url: `subregions/${subregionId}/regionalCoordinators/${id}`,
          method: 'DELETE',
        }),
      }),

    // Other endpoints
    // getDistricts: build.query<UnitModel[], void>({
    //   query: () => 'districts',
    //   providesTags: ['Districts'],
    // }),
    getConstituencies: build.query<UnitModel[], void>({
      query: () => 'constituencies',
      providesTags: ['Constituencies'],
    }),
    // getSubcounties: build.query<UnitModel[], void>({
    //   query: () => 'subcounties',
    //   providesTags: ['Subcounties'],
    // }),
    getSubcounties: build.query<SubcountyModel[], void>({
      query: () => 'subcounties',
      providesTags: ['Subcounties'],
    }),
    getParishes: build.query<UnitModel[], void>({
      query: () => 'parishes',
      providesTags: ['Parishes'],
    }),
    getVillages: build.query<UnitModel[], void>({
      query: () => 'villages',
      providesTags: ['Villages'],
    }),
    // getDivisions: build.query<UnitModel[], void>({
    //   query: () => 'divisions',
    //   providesTags: ['Divisions'],
    // }),
    getDivisions: build.query<DivisionModel[], void>({
      query: () => 'divisions',
      providesTags: ['Divisions'],
    }),
    getMunicipalities: build.query<UnitModel[], void>({
      query: () => 'municipalities',
      providesTags: ['Municipalities'],
    }),
    getWards: build.query<UnitModel[], void>({
      query: () => 'wards',
      providesTags: ['Wards'],
    }),
    getCells: build.query<UnitModel[], void>({
      query: () => 'cells',
      providesTags: ['Cells'],
    }),
    getCities: build.query<UnitModel[], void>({
      query: () => 'districts/cities',
      providesTags: ['Cities'],
    }),

    // Parish endpoints
    createParish: build.mutation<ParishModel, Partial<ParishModel>>({
      query: (newParish) => ({
        url: 'parishes',
        method: 'POST',
        body: newParish,
      }),
      invalidatesTags: ['Parishes'],
    }),
    updateParish: build.mutation<ParishModel, { id: number; updates: Partial<ParishModel> }>({
      query: ({ id, updates }) => ({
        url: `parishes/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Parishes'],
    }),
    deleteParish: build.mutation<void, number>({
      query: (id) => ({
        url: `parishes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Parishes'],
    }),
    getParishRegistras: build.query<Registra[], number>({
      query: (parishId) => `parishes/${parishId}/registrars`,
      providesTags: ['ParishRegistrars'],
    }),
    createParishRegistra: build.mutation<void, { parishId: number; registra: Partial<Registra> }>({
      query: ({ parishId, registra }) => ({
        url: `parishes/${parishId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['ParishRegistrars'],
    }),
    updateParishRegistra: build.mutation<void, { parishId: number; id: number; updates: Partial<Registra> }>({
      query: ({ parishId, id, updates }) => ({
        url: `parishes/${parishId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['ParishRegistrars'],
    }),
    deleteParishRegistra: build.mutation<void, { parishId: number; id: number }>({
      query: ({ parishId, id }) => ({
        url: `parishes/${parishId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ParishRegistrars'],
    }),

    // Ward endpoints
    createWard: build.mutation<WardModel, Partial<WardModel>>({
      query: (newWard) => ({
        url: 'wards',
        method: 'POST',
        body: newWard,
      }),
      invalidatesTags: ['Wards'],
    }),
    updateWard: build.mutation<WardModel, { id: number; updates: Partial<WardModel> }>({
      query: ({ id, updates }) => ({
        url: `wards/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Wards'],
    }),
    deleteWard: build.mutation<void, number>({
      query: (id) => ({
        url: `wards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wards'],
    }),
    getWardRegistras: build.query<Registra[], number>({
      query: (wardId) => `wards/${wardId}/registrars`,
      providesTags: ['WardRegistrars'],
    }),
    createWardRegistra: build.mutation<void, { wardId: number; registra: Partial<Registra> }>({
      query: ({ wardId, registra }) => ({
        url: `wards/${wardId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['WardRegistrars'],
    }),
    updateWardRegistra: build.mutation<void, { wardId: number; id: number; updates: Partial<Registra> }>({
      query: ({ wardId, id, updates }) => ({
        url: `wards/${wardId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['WardRegistrars'],
    }),
    deleteWardRegistra: build.mutation<void, { wardId: number; id: number }>({
      query: ({ wardId, id }) => ({
        url: `wards/${wardId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WardRegistrars'],
    }),


    createVillage: build.mutation<VillageModel, Partial<VillageModel>>({
      query: (newVillage) => ({
        url: 'villages',
        method: 'POST',
        body: newVillage,
      }),
      invalidatesTags: ['Villages'],
    }),
    updateVillage: build.mutation<VillageModel, { id: number; updates: Partial<VillageModel> }>({
      query: ({ id, updates }) => ({
        url: `villages/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Villages'],
    }),
    deleteVillage: build.mutation<void, number>({
      query: (id) => ({
        url: `villages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Villages'],
    }),
    getVillageRegistras: build.query<Registra[], number>({
      query: (villageId) => `villages/${villageId}/registrars`,
      providesTags: ['VillageRegistrars'],
    }),
    createVillageRegistra: build.mutation<void, { villageId: number; registra: Partial<Registra> }>({
      query: ({ villageId, registra }) => ({
        url: `villages/${villageId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['VillageRegistrars'],
    }),
    updateVillageRegistra: build.mutation<void, { villageId: number; id: number; updates: Partial<Registra> }>({
      query: ({ villageId, id, updates }) => ({
        url: `villages/${villageId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['VillageRegistrars'],
    }),
    deleteVillageRegistra: build.mutation<void, { villageId: number; id: number }>({
      query: ({ villageId, id }) => ({
        url: `villages/${villageId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VillageRegistrars'],
    }),

    // Cell endpoints
    createCell: build.mutation<CellModel, Partial<CellModel>>({
      query: (newCell) => ({
        url: 'cells',
        method: 'POST',
        body: newCell,
      }),
      invalidatesTags: ['Cells'],
    }),
    updateCell: build.mutation<CellModel, { id: number; updates: Partial<CellModel> }>({
      query: ({ id, updates }) => ({
        url: `cells/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Cells'],
    }),
    deleteCell: build.mutation<void, number>({
      query: (id) => ({
        url: `cells/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cells'],
    }),
    getCellRegistras: build.query<Registra[], number>({
      query: (cellId) => `cells/${cellId}/registrars`,
      providesTags: ['CellRegistrars'],
    }),
    createCellRegistra: build.mutation<void, { cellId: number; registra: Partial<Registra> }>({
      query: ({ cellId, registra }) => ({
        url: `cells/${cellId}/registrars`,
        method: 'POST',
        body: registra,
      }),
      invalidatesTags: ['CellRegistrars'],
    }),
    updateCellRegistra: build.mutation<void, { cellId: number; id: number; updates: Partial<Registra> }>({
      query: ({ cellId, id, updates }) => ({
        url: `cells/${cellId}/registrars/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['CellRegistrars'],
    }),
    deleteCellRegistra: build.mutation<void, { cellId: number; id: number }>({
      query: ({ cellId, id }) => ({
        url: `cells/${cellId}/registrars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CellRegistrars'],
    }),


    //Electoral Positions apis
     // Candidate
     getCandidates: build.query({
      query: () => 'electoral-positions/candidates',
      providesTags: ['Candidate'],
    }),
    getCandidate: build.query({
      query: (id) => `electoral-positions/candidates/${id}`,
      providesTags: ['Candidate'],
    }),
    addCandidate: build.mutation({
      query: (candidate) => ({
        url: 'electoral-positions/candidates',
        method: 'POST',
        body: candidate,
      }),
      invalidatesTags: ['Candidate'],
    }),
    updateCandidate: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `electoral-positions/candidates/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Candidate'],
    }),
    deleteCandidate: build.mutation({
      query: (id) => ({
        url: `electoral-positions/candidates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Candidate'],
    }),
    // National
    getNationals: build.query({
      query: () => 'electoral-positions/national',
      providesTags: ['NationalCandidate'],
    }),
    getNational: build.query({
      query: (id) => `electoral-positions/national/${id}`,
      providesTags: ['NationalCandidate'],
    }),
    addNational: build.mutation({
      query: (national) => ({
        url: 'electoral-positions/national',
        method: 'POST',
        body: national,
      }),
      invalidatesTags: ['NationalCandidate'],
    }),
    updateNational: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `electoral-positions/national/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['NationalCandidate'],
    }),
    deleteNational: build.mutation({
      query: (id) => ({
        url: `electoral-positions/national/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NationalCandidate'],
    }),

    //Village
    getVillageCellsCandidates: build.query({
      query: () => 'electoral-positions/village-cell-candidates',
      providesTags: ['VillageCellsCandidates'],
    }),
    getVillageCellsCandidate: build.query({
      query: (id) => `electoral-positions/village-cell-candidates/${id}`,
      providesTags: ['VillageCellsCandidates'],
    }),
    addVillageCellsCandidate: build.mutation({
      query: (villageCell) => ({
        url: 'electoral-positions/village-cell-candidates',
        method: 'POST',
        body: villageCell,
      }),
      invalidatesTags: ['VillageCellsCandidates'],
    }),
    updateVillageCellsCandidate: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `electoral-positions/village-cell-candidates/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['VillageCellsCandidates'],
    }),
    deleteVillageCellsCandidate: build.mutation({
      query: (id) => ({
        url: `electoral-positions/village-cell-candidates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VillageCellsCandidates'],
    }),

    //Parishes-wards
        getParishesWardsCandidates: build.query({
          query: () => 'electoral-positions/parishes-wards-candidates',
          providesTags: ['ParishesWardsCandidates'],
        }),
        getParishesWardsCandidate: build.query({
          query: (id) => `electoral-positions/parishes-wards-candidates/${id}`,
          providesTags: ['ParishesWardsCandidates'],
        }),
        addParishesWardsCandidate: build.mutation({
          query: (villageCell) => ({
            url: 'electoral-positions/parishes-wards-candidates',
            method: 'POST',
            body: villageCell,
          }),
          invalidatesTags: ['ParishesWardsCandidates'],
        }),
        updateParishesWardsCandidate: build.mutation({
          query: ({ id, ...patch }) => ({
            url: `electoral-positions/parishes-wards-candidates/${id}`,
            method: 'PUT',
            body: patch,
          }),
          invalidatesTags: ['ParishesWardsCandidates'],
        }),
        deleteParishesWardsCandidate: build.mutation({
          query: (id) => ({
            url: `electoral-positions/parishes-wards-candidates/${id}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['ParishesWardsCandidates'],
        }),

         //Subcounties divisions
         getSubcountiesDivisionsCandidates: build.query({
          query: () => 'electoral-positions/subcounties-divisions-candidates',
          providesTags: ['SubcountiesDivisionsCandidates'],
        }),
        getSubcountiesDivisionsCandidate: build.query({
          query: (id) => `electoral-positions/subcounties-divisions-candidates/${id}`,
          providesTags: ['SubcountiesDivisionsCandidates'],
        }),
        addSubcountiesDivisionsCandidate: build.mutation({
          query: (villageCell) => ({
            url: 'electoral-positions/subcounties-divisions-candidates',
            method: 'POST',
            body: villageCell,
          }),
          invalidatesTags: ['SubcountiesDivisionsCandidates'],
        }),
        updateSubcountiesDivisionsCandidate: build.mutation({
          query: ({ id, ...patch }) => ({
            url: `electoral-positions/subcounties-divisions-candidates/${id}`,
            method: 'PUT',
            body: patch,
          }),
          invalidatesTags: ['SubcountiesDivisionsCandidates'],
        }),
        deleteSubcountiesDivisionsCandidate: build.mutation({
          query: (id) => ({
            url: `electoral-positions/subcounties-divisions-candidates/${id}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['SubcountiesDivisionsCandidates'],
        }),


         //constituency municipality
         getConstituencyMunicipalityCandidates: build.query({
          query: () => 'electoral-positions/constituency-municipality-candidates',
          providesTags: ['ConstituencyMunicipalityCandidates'],
        }),
        getConstituencyMunicipalityCandidate: build.query({
          query: (id) => `electoral-positions/constituency-municipality-candidates/${id}`,
          providesTags: ['ConstituencyMunicipalityCandidates'],
        }),
        addConstituencyMunicipalityCandidate: build.mutation({
          query: (villageCell) => ({
            url: 'electoral-positions/constituency-municipality-candidates',
            method: 'POST',
            body: villageCell,
          }),
          invalidatesTags: ['ConstituencyMunicipalityCandidates'],
        }),
        updateConstituencyMunicipalityCandidate: build.mutation({
          query: ({ id, ...patch }) => ({
            url: `electoral-positions/constituency-municipality-candidates/${id}`,
            method: 'PUT',
            body: patch,
          }),
          invalidatesTags: ['ConstituencyMunicipalityCandidates'],
        }),
        deleteConstituencyMunicipalityCandidate: build.mutation({
          query: (id) => ({
            url: `electoral-positions/constituency-municipality-candidates/${id}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['ConstituencyMunicipalityCandidates'],
        }),

          //district
          getDistrictCandidates: build.query({
            query: () => 'electoral-positions/district-candidates',
            providesTags: ['DistrictCandidates'],
          }),
          getDistrictCandidate: build.query({
            query: (id) => `electoral-positions/district-candidates/${id}`,
            providesTags: ['DistrictCandidates'],
          }),
          addDistrictCandidate: build.mutation({
            query: (villageCell) => ({
              url: 'electoral-positions/district-candidates',
              method: 'POST',
              body: villageCell,
            }),
            invalidatesTags: ['DistrictCandidates'],
          }),
          updateDistrictCandidate: build.mutation({
            query: ({ id, ...patch }) => ({
              url: `electoral-positions/district-candidates/${id}`,
              method: 'PUT',
              body: patch,
            }),
            invalidatesTags: ['DistrictCandidates'],
          }),
          deleteDistrictCandidate: build.mutation({
            query: (id) => ({
              url: `electoral-positions/district-candidates/${id}`,
              method: 'DELETE',
            }),
            invalidatesTags: ['DistrictCandidates'],
          }),
  


        
    
    ///End of electoral positions apis

    // Parish Polling Stations
    getParishPollingStations: build.query<PollingStation[], number>({
      query: (parishId) => `parishes/${parishId}/polling-stations`,
      providesTags: ['ParishPollingStations'],
    }),
    createParishPollingStation: build.mutation<void, { parishId: number; pollingStation: Partial<PollingStation> }>({
      query: ({ parishId, pollingStation }) => ({
        url: `parishes/${parishId}/polling-stations`,
        method: 'POST',
        body: pollingStation,
      }),
      invalidatesTags: ['ParishPollingStations'],
    }),
    updateParishPollingStation: build.mutation<void, { parishId: number; id: number; updates: Partial<PollingStation> }>({
      query: ({ parishId, id, updates }) => ({
        url: `parishes/${parishId}/polling-stations/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['ParishPollingStations'],
    }),
    deleteParishPollingStation: build.mutation<void, { parishId: number; id: number }>({
      query: ({ parishId, id }) => ({
        url: `parishes/${parishId}/polling-stations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ParishPollingStations'],
    }),

    // Ward Polling Stations
    getWardPollingStations: build.query<PollingStation[], number>({
      query: (wardId) => `wards/${wardId}/polling-stations`,
      providesTags: ['WardPollingStations'],
    }),
    createWardPollingStation: build.mutation<void, { wardId: number; pollingStation: Partial<PollingStation> }>({
      query: ({ wardId, pollingStation }) => ({
        url: `wards/${wardId}/polling-stations`,
        method: 'POST',
        body: pollingStation,
      }),
      invalidatesTags: ['WardPollingStations'],
    }),
    updateWardPollingStation: build.mutation<void, { wardId: number; id: number; updates: Partial<PollingStation> }>({
      query: ({ wardId, id, updates }) => ({
        url: `wards/${wardId}/polling-stations/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['WardPollingStations'],
    }),
    deleteWardPollingStation: build.mutation<void, { wardId: number; id: number }>({
      query: ({ wardId, id }) => ({
        url: `wards/${wardId}/polling-stations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WardPollingStations'],
    }),

///National opposition candidates
getNationalOppositionCandidates: build.query<NationalOppositionCandidate[], void>({
  query: () => 'national-opposition-candidates',
  providesTags: ['NationalOppositionCandidate'],
}),

addNationalOppositionCandidate: build.mutation<NationalOppositionCandidate, Partial<NationalOppositionCandidate>>({
  query: (newCandidate) => ({
    url: 'national-opposition-candidates',
    method: 'POST',
    body: newCandidate,
  }),
  invalidatesTags: ['NationalOppositionCandidate'],
}),

updateNationalOppositionCandidate: build.mutation<NationalOppositionCandidate, Partial<NationalOppositionCandidate>>({
  query: (updatedCandidate) => ({
    url: `national-opposition-candidates/${updatedCandidate.id}`,
    method: 'PUT',
    body: updatedCandidate,
  }),
  invalidatesTags: ['NationalOppositionCandidate'],
}),

deleteNationalOppositionCandidate: build.mutation<void, string>({
  query: (id) => ({
    url: `national-opposition-candidates/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['NationalOppositionCandidate'],
}),

///end opposition


  }),
});

// Export hooks
export const { 
  // useLoginMutation,
  useGetUsersQuery,
  useFetchUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRegionsQuery,
  useAddRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
  useGetSubregionsQuery,
  // useGetSubregionByIdQuery,
  useCreateSubregionMutation,
  useUpdateSubregionMutation,
  useDeleteSubregionMutation,
  // useGetDistrictsInSubregionQuery,
  // useCreateDistrictInSubregionMutation,
  useGetRegionalCoordinatorsInSubregionQuery,
  useCreateRegionalCoordinatorInSubregionMutation,
  // useGetDistrictsQuery,
  useGetConstituenciesQuery,
  useGetParishesQuery,
  useGetVillagesQuery,
  useGetMunicipalitiesQuery,
  useGetWardsQuery,
  useGetCellsQuery,
  useGetCitiesQuery,
  useCreateRegionalCoordinatorMutation,
  useUpdateRegionalCoordinatorMutation,
  useDeleteRegionalCoordinatorMutation,
  useGetDistrictsQuery,
  useCreateDistrictMutation,
  useUpdateDistrictMutation,
  useDeleteDistrictMutation,
  useGetDistrictRegistrasQuery,
  useCreateDistrictRegistraMutation,
  useUpdateDistrictRegistraMutation,
  useDeleteDistrictRegistraMutation,


  useCreateConstituencyMutation,
  useUpdateConstituencyMutation,
  useDeleteConstituencyMutation,
  useCreateMunicipalityMutation,
  useUpdateMunicipalityMutation,
  useDeleteMunicipalityMutation,

  useGetConstituencyRegistrasQuery,
  useCreateConstituencyRegistraMutation,
  useUpdateConstituencyRegistraMutation,
  useDeleteConstituencyRegistraMutation,
  useGetMunicipalityRegistrasQuery,
  useCreateMunicipalityRegistraMutation,
  useUpdateMunicipalityRegistraMutation,
  useDeleteMunicipalityRegistraMutation,

  useGetSubcountiesQuery,
  useCreateSubcountyMutation,
  useUpdateSubcountyMutation,
  useDeleteSubcountyMutation,
  useGetDivisionsQuery,
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
  
  useCreateParishMutation,
  useUpdateParishMutation,
  useDeleteParishMutation,
  useGetParishRegistrasQuery,
  useCreateParishRegistraMutation,
  useUpdateParishRegistraMutation,
  useDeleteParishRegistraMutation,
  useCreateWardMutation,
  useUpdateWardMutation,
  useDeleteWardMutation,
  useGetWardRegistrasQuery,
  useCreateWardRegistraMutation,
  useUpdateWardRegistraMutation,
  useDeleteWardRegistraMutation,

  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  useGetVillageRegistrasQuery,
  useCreateVillageRegistraMutation,
  useUpdateVillageRegistraMutation,
  useDeleteVillageRegistraMutation,
  useCreateCellMutation,
  useUpdateCellMutation,
  useDeleteCellMutation,
  useGetCellRegistrasQuery,
  useCreateCellRegistraMutation,
  useUpdateCellRegistraMutation,
  useDeleteCellRegistraMutation,

  //Electoral Positions apis

  useGetCandidatesQuery,
  useGetCandidateQuery,
  useAddCandidateMutation,
  useUpdateCandidateMutation,
  useDeleteCandidateMutation,
  ////
  useGetNationalsQuery,
  useGetNationalQuery,
  useAddNationalMutation,
  useUpdateNationalMutation,
  useDeleteNationalMutation,
  ///

    ////
    useGetVillageCellsCandidatesQuery,
    useGetVillageCellsCandidateQuery,
    useAddVillageCellsCandidateMutation,
    useUpdateVillageCellsCandidateMutation,
    useDeleteVillageCellsCandidateMutation,
    ///

    ////
    useGetParishesWardsCandidatesQuery,
    useGetParishesWardsCandidateQuery,
    useAddParishesWardsCandidateMutation,
    useUpdateParishesWardsCandidateMutation,
    useDeleteParishesWardsCandidateMutation,
    /////SubcountiesDivisions

    ////
    useGetSubcountiesDivisionsCandidatesQuery,
    useGetSubcountiesDivisionsCandidateQuery,
    useAddSubcountiesDivisionsCandidateMutation,
    useUpdateSubcountiesDivisionsCandidateMutation,
    useDeleteSubcountiesDivisionsCandidateMutation,

    ////
    useGetConstituencyMunicipalityCandidatesQuery,
    useGetConstituencyMunicipalityCandidateQuery,
    useAddConstituencyMunicipalityCandidateMutation,
    useUpdateConstituencyMunicipalityCandidateMutation,
    useDeleteConstituencyMunicipalityCandidateMutation,

    //
    useAddDistrictCandidateMutation,
    useUpdateDistrictCandidateMutation,
    useDeleteDistrictCandidateMutation,
    useGetDistrictCandidatesQuery,
    

  ///End of electoral positions apis

  useGetParishPollingStationsQuery,
  useCreateParishPollingStationMutation,
  useUpdateParishPollingStationMutation,
  useDeleteParishPollingStationMutation,
  useGetWardPollingStationsQuery,
  useCreateWardPollingStationMutation,
  useUpdateWardPollingStationMutation,
  useDeleteWardPollingStationMutation,

  ///Opposition
  useGetNationalOppositionCandidatesQuery,
  useAddNationalOppositionCandidateMutation,
  useUpdateNationalOppositionCandidateMutation,
  useDeleteNationalOppositionCandidateMutation,

  //end opposition


  //nominated
  // useGetNominatedCandidatesQuery,
  // useUpdateNominatedCandidateMutation,
} = api;
