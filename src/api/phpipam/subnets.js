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

  console.log('=== [DEBUG PHPIPAM API SUBNET] ===');
  console.log('Input CIDR:', cleanInput);
  console.log('IP Part:', ipPart, '| Mask Part:', maskPart);

  // Tes 1: Endpoint subnets/cidr/
  try {
    const url = `subnets/cidr/${encodeURIComponent(cleanInput)}/`;
    console.log('[TEST 1] GET:', url);
    const res = await get(url);
    console.log('[TEST 1] Response Data:', JSON.stringify(res.data));
  } catch (err) {
    console.log('[TEST 1] Error Status:', err.response?.status, '| Message:', err.response?.data?.message || err.message);
  }

  // Tes 2: Endpoint subnets/search/
  try {
    const url = `subnets/search/${encodeURIComponent(ipPart)}/`;
    console.log('[TEST 2] GET:', url);
    const res = await get(url);
    console.log('[TEST 2] Response Data:', JSON.stringify(res.data));
  } catch (err) {
    console.log('[TEST 2] Error Status:', err.response?.status, '| Message:', err.response?.data?.message || err.message);
  }

  // Tes 3: Fetch Direct Subnet ID 1533 (Subnet ID yang valid dari pencarian IP kamu)
  try {
    console.log('[TEST 3] GET Direct Subnet ID 1533...');
    const res = await getSubnet(1533);
    console.log('[TEST 3] Response Data 1533:', JSON.stringify(res));
  } catch (err) {
    console.log('[TEST 3] Error 1533:', err.message);
  }

  console.log('===================================');
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