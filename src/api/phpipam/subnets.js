import { get } from './client.js';

// Konversi nilai integer/Long IP dari phpIPAM ke format String IP
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

  // 1. Coba pencarian langsung ke endpoint CIDR phpIPAM
  try {
    const encodedCidr = encodeURIComponent(cleanInput);
    const response = await get(`subnets/cidr/${encodedCidr}/`);
    if (response?.data && response.data.length > 0) {
      return response.data.map(normalizeSubnet);
    }
  } catch (err) {}

  // 2. Strategi Pelacakan Hierarki: Cari IP sampel di dalam subnet untuk menemukan Subnet Parent
  try {
    const searchIp = ipPart.endsWith('.0')
      ? ipPart.substring(0, ipPart.lastIndexOf('.')) + '.59'
      : ipPart;

    const addrRes = await get(`addresses/search/${encodeURIComponent(searchIp)}/`);
    const addresses = addrRes?.data || [];

    if (addresses.length > 0 && addresses[0].subnetId) {
      const leafSubnetId = addresses[0].subnetId;
      const hierarchy = await getSubnetHierarchy(leafSubnetId);

      if (maskPart) {
        const matched = hierarchy.find((s) => String(s.mask) === String(maskPart));
        if (matched) {
          return [matched];
        }
      }

      if (hierarchy.length > 0) {
        return [hierarchy[0]];
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