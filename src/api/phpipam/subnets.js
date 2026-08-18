import { get } from './client.js';

// Convert Long IP / Integer dari phpIPAM ke String IP (misal 1733303040 -> 103.80.83.0)
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

  // 1. Coba pencarian via endpoint cidr resmi phpIPAM (URL-encoded)
  try {
    const response = await get(`subnets/cidr/${encodeURIComponent(cleanInput)}/`);
    if (response.data && response.data.length > 0) {
      return response.data.map(normalizeSubnet);
    }
  } catch (err) {}

  // 2. Strategi Handal: Cari IP via endpoint addresses untuk menemukan subnet induk (masterSubnetId)
  try {
    // Jika input 103.80.83.0, gunakan IP 103.80.83.1 atau IP aslinya
    const sampleIp = ipPart.endsWith('.0') 
      ? ipPart.substring(0, ipPart.lastIndexOf('.')) + '.1'
      : ipPart;

    const addrRes = await get(`addresses/search/${encodeURIComponent(sampleIp)}/`);
    const addresses = addrRes.data || [];

    if (addresses.length > 0 && addresses[0].subnetId) {
      // Ambil subnet paling spesifik tempat IP berada
      const leafSubnet = await getSubnet(addresses[0].subnetId);
      
      if (leafSubnet) {
        // Jika user mencari dengan mask tertentu (misal /24), cari subnet induknya yang sesuai mask
        if (maskPart && String(leafSubnet.mask) !== String(maskPart)) {
          const hierarchy = await getSubnetHierarchy(leafSubnet.id);
          const matchedSubnet = hierarchy.find((s) => String(s.mask) === String(maskPart));
          if (matchedSubnet) return [matchedSubnet];
        }
        
        return [leafSubnet];
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