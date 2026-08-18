import { get } from './client.js';

// Convert Long IP / Decimal dari phpIPAM ke String IP (misal 1733303040 -> 103.80.83.0)
export function longToIp(long) {
  if (typeof long === 'string' && long.includes('.')) {
    return long;
  }
  const num = Number(long);
  if (isNaN(num)) return long;

  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.');
}

// Transformasi properti .subnet agar selalu berformat IP string
function normalizeSubnet(subnet) {
  if (!subnet) return subnet;
  return {
    ...subnet,
    subnet: longToIp(subnet.subnet),
  };
}

export async function getSubnet(subnetId) {
  const response = await get(`subnets/${subnetId}/`);
  return normalizeSubnet(response.data);
}

export async function searchSubnet(cidrInput) {
  const cleanInput = cidrInput.trim();
  const [ipPart, maskPart] = cleanInput.split('/');

  // 1. Coba pencarian via endpoint cidr resmi phpIPAM (URL-encoded)
  try {
    const response = await get(`subnets/cidr/${encodeURIComponent(cleanInput)}/`);
    if (response.data && response.data.length > 0) {
      return response.data.map(normalizeSubnet);
    }
  } catch (err) {}

  // 2. Coba pencarian via endpoint search subnets
  try {
    const response = await get(`subnets/search/${encodeURIComponent(ipPart)}/`);
    let results = response.data || [];

    if (Array.isArray(results) && results.length > 0) {
      results = results.map(normalizeSubnet);

      if (maskPart) {
        const filtered = results.filter(
          (s) => String(s.mask) === String(maskPart)
        );
        if (filtered.length > 0) return filtered;
      }

      return results;
    }
  } catch (err) {}

  // 3. ULTIMATE FALLBACK: Cari via IP address untuk menemukan subnetId secara presisi
  try {
    // Jika input 103.80.83.0, buat dummy IP 103.80.83.1 atau gunakan IP asal
    const testIp = ipPart.endsWith('.0') 
      ? ipPart.replace(/\.0$/, '.1') 
      : ipPart;

    const addrRes = await get(`addresses/search/${encodeURIComponent(testIp)}/`);
    const addresses = addrRes.data || [];

    if (addresses.length > 0 && addresses[0].subnetId) {
      const targetSubnetId = addresses[0].subnetId;
      const subnetData = await getSubnet(targetSubnetId);
      if (subnetData) {
        return [subnetData];
      }
    }
  } catch (err) {}

  return [];
}

export async function getSubnetUsage(subnetId) {
  const response = await get(`subnets/${subnetId}/usage/`);
  return response.data;
}

export async function getSubnetAddresses(subnetId) {
  const response = await get(`subnets/${subnetId}/addresses/`);
  return response.data || [];
}

export async function getFirstFreeIp(subnetId) {
  const response = await get(`subnets/${subnetId}/first_free/`);
  return response.data;
}

export async function getSubnetHierarchy(subnetId) {
  const hierarchy = [];
  let currentId = subnetId;
  let depth = 0;

  while (currentId && currentId !== '0' && currentId !== 0 && depth < 5) {
    try {
      const subnet = await getSubnet(currentId);

      if (subnet && subnet.subnet !== undefined && subnet.mask !== undefined) {
        hierarchy.unshift(subnet);
        currentId = subnet.masterSubnetId;
      } else {
        break;
      }
    } catch (err) {
      break;
    }
    depth++;
  }

  return hierarchy;
}