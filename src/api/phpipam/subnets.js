import { get } from './client.js';

export async function searchSubnet(cidr) {
  const response = await get(`subnets/cidr/${encodeURIComponent(cidr)}/`);
  return response.data || [];
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

// === FUNGSI BARU: Ambil semua hierarki subnet ke atas (Parent/Master) ===
export async function getSubnetHierarchy(subnetId) {
  const hierarchy = [];
  let currentId = subnetId;

  // Batasi maksimal 5 level kedalaman agar tidak terjadi infinite loop
  let depth = 0;
  while (currentId && currentId !== '0' && depth < 5) {
    try {
      const subnet = await getSubnet(currentId);
      if (subnet) {
        hierarchy.unshift(subnet); // Masukkan di depan agar urutan dari Parent terbesar ke Child terkecil
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