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
// === FUNGSI: Ambil semua hierarki subnet ke atas (Parent/Master) ===
export async function getSubnetHierarchy(subnetId) {
  const hierarchy = [];
  let currentId = subnetId;
  let depth = 0;

  // Hentikan loop jika currentId bernilai '0', 0, null, atau undefined
  while (currentId && currentId !== '0' && currentId !== 0 && depth < 5) {
    try {
      const subnet = await getSubnet(currentId);
      
      // Pastikan objek subnet valid dan memiliki properti subnet/mask
      if (subnet && subnet.subnet !== undefined && subnet.mask !== undefined) {
        hierarchy.unshift(subnet); // Tambahkan ke urutan atas
        currentId = subnet.masterSubnetId;
      } else {
        break; // Stop jika data subnet tidak valid
      }
    } catch (err) {
      break; // Stop jika API error/404
    }
    depth++;
  }

  return hierarchy;
}