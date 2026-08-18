import { get } from './client.js';

// Convert String IP (103.80.81.0) ke Integer / Long IP (1733302528)
export function ipToLong(ip) {
  return ip
    .split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

// Convert Integer / Long IP ke String IP
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

  // 1. Coba pencarian resmi ke endpoint CIDR (URL-encoded)
  try {
    const response = await get(`subnets/cidr/${encodeURIComponent(cleanInput)}/`);
    if (response?.data && response.data.length > 0) {
      return response.data.map(normalizeSubnet);
    }
  } catch (err) {}

  // 2. Pencarian dinamis via String IP (misal: 103.80.81.0)
  try {
    const response = await get(`subnets/search/${encodeURIComponent(ipPart)}/`);
    let results = response?.data || [];

    if (Array.isArray(results) && results.length > 0) {
      results = results.map(normalizeSubnet);

      if (maskPart) {
        const matched = results.filter((s) => String(s.mask) === String(maskPart));
        if (matched.length > 0) return matched;
      }
      return results;
    }
  } catch (err) {}

  // 3. Pencarian dinamis via Integer/Long IP (karena phpIPAM menyimpan IP subnet sebagai Decimal di DB)
  try {
    const longIp = ipToLong(ipPart);
    if (longIp > 0) {
      const response = await get(`subnets/search/${longIp}/`);
      let results = response?.data || [];

      if (Array.isArray(results) && results.length > 0) {
        results = results.map(normalizeSubnet);

        if (maskPart) {
          const matched = results.filter((s) => String(s.mask) === String(maskPart));
          if (matched.length > 0) return matched;
        }
        return results;
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