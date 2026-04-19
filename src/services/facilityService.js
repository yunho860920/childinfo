/**
 * facilityService.js - Logic for filtering and managing facility data.
 */
import { fetchChildFacilities } from './facilityApi';

export { fetchChildFacilities };

export const getFilteredFacilities = (facilities, region, subRegion, dong, query) => {
  if (!facilities) return [];
  
  return facilities.filter(f => {
    const matchRegion = region === '전체' || f.region === region;
    const matchSub = subRegion === '전체' || f.subRegion === subRegion;
    const matchDong = !dong || dong === '전체' || f.dong === dong;
    
    const lowerQuery = (query || "").toLowerCase();
    const matchQuery = !query || 
      (f.name || "").toLowerCase().includes(lowerQuery) || 
      (f.address || "").toLowerCase().includes(lowerQuery) ||
      (f.type || "").toLowerCase().includes(lowerQuery);
      
    return matchRegion && matchSub && matchDong && matchQuery;
  });
};
