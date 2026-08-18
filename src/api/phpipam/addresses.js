import { get } from './client.js';
import { getSubnetHierarchy, getSubnetAddresses } from './subnets.js';

// Helper mengambil hierarki subnet dari daftar IP yang cocok
async function processAddressesHierarchy(addresses) {
  return await Promise.all(
    addresses.map(async (addr) => {
      if (addr.subnetId) {
        try {
          const hierarchy = await getSubnetHierarchy(addr.subnetId);
          return {
            ...addr,
            subnetsHierarchy: hierarchy,
          };
        } catch (err) {
          console.error(`Gagal mengambil subnetId ${addr.subnetId}:`, err.message);
        }
      }
      return addr;
    })
  );
}

export async function searchAddress(ip) {
  try {
    const response = await get(`addresses/search/${encodeURIComponent(ip)}/`);
    const addresses = response.data || [];
    return await processAddressesHierarchy(addresses);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.data?.code === 404) return [];
    throw err;
  }
}

export async function getAddress(ip, subnetId) {
  const response = await get(`addresses/${encodeURIComponent(ip)}/${subnetId}/`);
  return response.data;
}

export async function searchHostname(keyword) {
  const cleanKeyword = keyword.trim();

  // Buat Regex fleksibel dari input user
  // Contoh: "R.JAM" -> /R.*JAM/i
  const words = cleanKeyword.split(/[\s\-_.]+/).filter((w) => w.length > 0);
  const regexPattern = words.join('.*');
  const regex = new RegExp(regexPattern, 'i');

  console.log('[DEBUG HOSTNAME] Input keyword:', cleanKeyword);
  console.log('[DEBUG HOSTNAME] Generated Regex:', regex);

  // 1. Coba Endpoint Persis bawaan phpIPAM
  try {
    const res1 = await get(`addresses/search_hostname/${encodeURIComponent(cleanKeyword)}/`);
    if (res1.data && res1.data.length > 0) {
      console.log('[DEBUG HOSTNAME] Found via search_hostname!');
      return await processAddressesHierarchy(res1.data);
    }
  } catch (err) {}

  // 2. Coba Endpoint Search umum phpIPAM
  try {
    const res2 = await get(`addresses/search/${encodeURIComponent(cleanKeyword)}/`);
    if (res2.data && res2.data.length > 0) {
      console.log('[DEBUG HOSTNAME] Found via general search!');
      return await processAddressesHierarchy(res2.data);
    }
  } catch (err) {}

  // 3. STRATEGI UTAMA: Ambil semua Subnet dari phpIPAM, lalu tarik IP di dalamnya
  try {
    console.log('[DEBUG HOSTNAME] Executing Subnet-based Address Search...');
    const subnetsRes = await get('subnets/');
    const allSubnets = subnetsRes.data || [];

    let matchedAddresses = [];

    // Looping semua subnet untuk mengambil daftar IP-nya
    for (const sub of allSubnets) {
      try {
        const addrList = await getSubnetAddresses(sub.id);
        if (Array.isArray(addrList) && addrList.length > 0) {
          // Filter IP berdasarkan Hostname atau Description menggunakan Regex
          const filtered = addrList.filter((item) => {
            const h = item.hostname || '';
            const d = item.description || '';
            return regex.test(h) || regex.test(d);
          });

          if (filtered.length > 0) {
            matchedAddresses.push(...filtered);
          }
        }
      } catch (err) {
        // Abaikan jika subnet tidak memiliki IP
      }
    }

    console.log(`[DEBUG HOSTNAME] Total matched addresses found: ${matchedAddresses.length}`);

    if (matchedAddresses.length > 0) {
      // Batasi 10 hasil teratas
      const limitedResults = matchedAddresses.slice(0, 10);
      return await processAddressesHierarchy(limitedResults);
    }
  } catch (err) {
    console.error('[DEBUG HOSTNAME] Error fetching subnets addresses:', err.message);
  }

  return [];
}