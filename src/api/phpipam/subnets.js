import { get } from './client.js';

// Helper merubah integer IP phpIPAM ke string IP (misal 1733303040 -> 103.80.83.0)
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

// Format ulang objek subnet dari phpIPAM API
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

  // Strategy 1: Cari via endpoint subnets/search (menggunakan IP murni tanpa /mask)
  try {
    const response = await get(`subnets/search/${encodeURIComponent(ipPart)}/`);
    let results = response.data || [];

    if (Array.isArray(results) && results.length > 0) {
      results = results.map(normalizeSubnet);

      // Jika user menyertakan subnet mask (misal /24), filter hasil yang cocok
      if (maskPart) {
        const filtered = results.filter(
          (s) => String(s.mask) === String(maskPart)
        );
        if (filtered.length > 0) return filtered;
      }

      return results;
    }
  } catch (err) {}

  // Strategy 2: Cari via endpoint custom/pencarian IP terdekat jika input berakhiran .0
  try {
    // Jika input 103.80.83.0, tes cari IP 103.80.83.1 di phpIPAM untuk mengambil subnetId-nya
    const sampleIp = ipPart.endsWith('.0') 
      ? ipPart.substring(0, ipPart.lastIndexOf('.')) + '.1'
      : ipPart;

    const addrRes = await get(`addresses/search/${encodeURIComponent(sampleIp)}/`);
    const addresses = addrRes.data || [];

    if (addresses.length > 0 && addresses[0].subnetId) {
      const targetSubnetId = addresses[0].subnetId;
      const subnetData = await getSubnet(targetSubnetId);
      if (subnetData) {
        return [subnetData];
      }
    }
  } catch (err) {}

  // Strategy 3: Direct CIDR endpoint fallback
  try {
    const response = await get(`subnets/cidr/${encodeURIComponent(cleanInput)}/`);
    if (response.data && response.data.length > 0) {
      return response.data.map(normalizeSubnet);
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