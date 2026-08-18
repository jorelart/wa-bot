import { get } from './client.js';
import { getSubnetHierarchy } from './subnets.js';

export async function searchAddress(ip) {
  const response = await get(`addresses/search/${encodeURIComponent(ip)}/`);
  const addresses = response.data || [];

  const addressesWithHierarchy = await Promise.all(
    addresses.map(async (addr) => {
      if (addr.subnetId) {
        const hierarchy = await getSubnetHierarchy(addr.subnetId);
        return {
          ...addr,
          subnetsHierarchy: hierarchy,
        };
      }
      return addr;
    })
  );

  return addressesWithHierarchy;
}

export async function searchHostname(hostname) {
  const response = await get(`addresses/search_hostname/${encodeURIComponent(hostname)}/`);
  const addresses = response.data || [];

  const addressesWithHierarchy = await Promise.all(
    addresses.map(async (addr) => {
      if (addr.subnetId) {
        const hierarchy = await getSubnetHierarchy(addr.subnetId);
        return {
          ...addr,
          subnetsHierarchy: hierarchy,
        };
      }
      return addr;
    })
  );

  return addressesWithHierarchy;
}