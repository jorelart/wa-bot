import { get } from './client.js';
import { getSubnet } from './subnets.js';

export async function searchAddress(ip) {
  const response = await get(
    `addresses/search/${encodeURIComponent(ip)}/`
  );

  const addresses = response.data || [];

  // Jika IP ditemukan, ambil detail subnet untuk tiap IP
  const addressesWithSubnet = await Promise.all(
    addresses.map(async (addr) => {
      if (addr.subnetId) {
        try {
          const subnetData = await getSubnet(addr.subnetId);
          return {
            ...addr,
            subnetInfo: subnetData, // Simpan detail subnet di properti ini
          };
        } catch (err) {
          console.error(`Gagal mengambil subnetId ${addr.subnetId}:`, err.message);
        }
      }
      return addr;
    })
  );

  return addressesWithSubnet;
}

export async function searchHostname(hostname) {
  const response = await get(
    `addresses/search_hostname/${encodeURIComponent(hostname)}/`
  );

  const addresses = response.data || [];

  const addressesWithSubnet = await Promise.all(
    addresses.map(async (addr) => {
      if (addr.subnetId) {
        try {
          const subnetData = await getSubnet(addr.subnetId);
          return {
            ...addr,
            subnetInfo: subnetData,
          };
        } catch (err) {
          console.error(`Gagal mengambil subnetId ${addr.subnetId}:`, err.message);
        }
      }
      return addr;
    })
  );

  return addressesWithSubnet;
}

export async function getAddress(ip, subnetId) {
  const response = await get(
    `addresses/${encodeURIComponent(ip)}/${subnetId}/`
  );

  return response.data;
}