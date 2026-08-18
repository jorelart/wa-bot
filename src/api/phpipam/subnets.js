import { get } from './client.js';

export async function searchSubnet(cidr) {
  try {
    // 1. Coba pencarian via endpoint cidr bawaan phpIPAM
    const encodedCidr = encodeURIComponent(cidr.trim());
    const response = await get(`subnets/cidr/${encodedCidr}/`);
    
    if (response.data && response.data.length > 0) {
      return response.data;
    }
  } catch (err) {
    // Abaikan jika 404, lanjut ke fallback
  }

  try {
    // 2. Fallback: Coba pencarian via endpoint search jika CIDR murni tidak me-return data
    const ipOnly = cidr.split('/')[0];
    const response = await get(`subnets/search/${encodeURIComponent(ipOnly)}/`);
    return response.data || [];
  } catch (err) {
    return [];
  }
}

export async function getSubnet(subnetId) {
  const response = await get(`subnets/${subnetId}/`);
  return response.data;
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