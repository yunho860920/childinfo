// src/services/nursingRoomService.js
import { parseAggressiveRegion, isValidDong } from '../utils/regionUtils';

/**
 * 유아휴게소(수유실) API 연동 기초 구조
 * 
 * 주요 전략:
 * 1. 데이터 소스 추상화 (sooyusil.com 또는 data.go.kr)
 * 2. 공통 데이터 모델로의 정규화 (Normalization)
 * 3. 에러 핸들링 및 타임아웃 처리
 */

const NURSING_API_URL = '/api-nursing/api/nursingRoomJSON.do';

/**
 * 전국 유아휴게소 데이터를 가져와 앱 표준 포맷으로 변환합니다.
 * @param {string} apiKey - 수유정보 알리미 발급 인증키
 * @returns {Promise<Array>} 정규화된 시설 데이터 리스트
 */
export async function fetchNursingRoomsFromApi(apiKey) {
  if (!apiKey) {
    console.warn('Nursing API Key is missing. Skipping API fetch.');
    return [];
  }

  try {
    // 1. API 호출 (타임아웃 10초 설정)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // sooyusil.com API 스펙: confirmApiKey 파라미터 사용
    const fetchUrl = `${NURSING_API_URL}?confirmApiKey=${encodeURIComponent(apiKey)}`;
    console.log('Fetching Nursing Rooms from:', fetchUrl);
    
    const response = await fetch(fetchUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API Request Failed: ${response.status}`);

    const data = await response.json();
    
    // API 응답 구조: data.roomList 에 배열이 담겨 있음
    let items = data?.roomList || [];
    if (!Array.isArray(items) && data?.roomList) {
      items = [data.roomList];
    }

    // 2. 데이터 정규화 (Mapping)
    return items.map(item => normalizeNursingRoom(item));

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Nursing API request timed out');
    } else {
      console.error('Nursing API Error:', error);
    }
    return [];
  }
}

/**
 * 외부 API 데이터를 내부 시설 포맷으로 변환합니다.
 * (sooyusil.com API 필드 기준)
 */
function normalizeNursingRoom(raw) {
  // raw 데이터 구조 (sooyusil.com 기준):
  // { roomName, address, zoneName, cityName, gpsLat, gpsLong, fatherUseCode, ... }

  const name = raw.roomName || '유아휴게실';
  const address = raw.address || '';
  
  const { region, subRegion, dong: parsedDong } = parseAggressiveRegion(address, name);
  const dong = isValidDong(raw.townName) ? raw.townName : parsedDong;

  return {
    id: `api-nr-${raw.roomNo || Math.random().toString(36).substr(2, 9)}`,
    name: name,
    type: '유아휴게소',
    region: raw.zoneName || region,
    subRegion: raw.cityName || subRegion,
    dong: dong, 
    address: address,
    lat: raw.gpsLat,
    lng: raw.gpsLong,
    mapUrl: `https://map.kakao.com/?q=${encodeURIComponent(name)}`,
    metadata: {
      isDaddyAllowed: raw.fatherUseCode === '1',
      type: raw.roomTypeName,
      tel: raw.managerTelNo,
      locationDetail: raw.location
    }
  };
}
