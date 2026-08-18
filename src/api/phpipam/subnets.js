import { get } from './client.js';

// Helper untuk mengubah Long IP / Integer dari phpIPAM menjadi format String IP (misal 1733303040 -> 103.80.83.0)
export function longToIp(long) {
  if (typeof long === 'string' && long.includes('.')) {
    return long; // Jika sudah berbentuk string IP
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

// Transformasi objek subnet agar field .subnet selalu berbentuk String IP (103.80.83.0)
function normalizeSubnet(subnet) {
  if (!subnet) return subnet;
  return {
    ...subnet,
    subnet: longToIp(subnet.subnet),
  };
}

export async function searchSubnet(cidr) {
  const cleanInput = cidr.trim();
  const [ipPart, maskPart] = cleanInput.split('/');

  try {
    // 1. Coba pencarian via endpoint search phpIPAM menggunakan bagian IP (misal 103.80.83.0)
    const response = await get(`subnets/search/${encodeURIComponent(ipPart)}/`);
    let results = response.data || [];

    if (Array.isArray(results) && results.length > 0) {
      // Normalize IP integer ke IP string
      results = results.map(normalizeSubnet);

      // Jika user memasukkan subnet dengan mask (misal /24), filter hasil yang cocok
      if (maskPart) {
        const filtered = results.filter(
          (s) => String(s.mask) === String(maskPart)
        );
        if (filtered.length > 0) return filtered;
      }

      return results;
    }
  } catch (err) {
    // Abaikan error search, lanjut ke endpoint cidr
  }

  try {
    // 2. Fallback: Gunakan endpoint cidr
    const response = await get(`subnets/cidr/${encodeURIComponent(cleanInput)}/`);
    let results = response.data || [];
    if (Array.isArray(results)) {
      return results.map(normalizeSubnet);
    }
  } catch (err) {
    // 404 Not Found
  }

  return [];
}

export async function getSubnet(subnetId) {
  const response = await get(`subnets/${subnetId}/`);
  return normalizeSubnet(response.data);
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