import { get } from './client.js';
import { getSubnetHierarchy } from './subnets.js';

// Helper untuk mengambil hierarki subnet dari kumpulan address
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
  
  // Buat pola Regex cerdas dari input user
  // Contoh: input "R.JAM" atau "R JAM" -> diubah jadi /R.*JAM/i (Case-insensitive & mengabaikan spasi/titik)
  const regexPattern = cleanKeyword.split(/[\s\-_.]+/).filter(w => w.length > 0).join('.*');
  const regex = new RegExp(regexPattern, 'i');

  let foundAddresses = [];

  // STRATEGI 1: Pencarian Persis (Endpoint Bawaan)
  try {
    const res1 = await get(`addresses/search_hostname/${encodeURIComponent(cleanKeyword)}/`);
    if (res1.data && res1.data.length > 0) {
      foundAddresses = res1.data;
    }
  } catch (err) {}

  // STRATEGI 2: Pencarian Generic (Kadang API phpIPAM bisa matching sebagian di sini)
  if (foundAddresses.length === 0) {
    try {
      const res2 = await get(`addresses/search/${encodeURIComponent(cleanKeyword)}/`);
      if (res2.data && res2.data.length > 0) {
        foundAddresses = res2.data;
      }
    } catch (err) {}
  }

  // STRATEGI 3: ULTIMATE FALLBACK (Ambil data berdasarkan Tag IP lalu filter pakai Regex)
  // Tag ID phpIPAM: 2 (Used), 3 (Reserved), 4 (DHCP)
  if (foundAddresses.length === 0) {
    try {
      // Tarik data paralel agar sangat cepat
      const [tag2Res, tag3Res, tag4Res] = await Promise.all([
        get(`addresses/tags/2/`).catch(() => ({ data: [] })),
        get(`addresses/tags/3/`).catch(() => ({ data: [] })),
        get(`addresses/tags/4/`).catch(() => ({ data: [] }))
      ]);
      
      const allAddresses = [
        ...(tag2Res.data || []),
        ...(tag3Res.data || []),
        ...(tag4Res.data || [])
      ];

      // Saring SEMUA IP menggunakan Regex yang kita buat di atas
      foundAddresses = allAddresses.filter(item => {
        const h = item.hostname || '';
        const d = item.description || '';
        // Cocokkan hostname ATAU description
        return regex.test(h) || regex.test(d);
      });
    } catch (err) {}
  }

  // Jika hasil akhirnya ketemu (dari strategi mana pun)
  if (foundAddresses.length > 0) {
    // Validasi ulang dengan regex untuk membuang false-positive dari Strategi 1/2
    const finalMatched = foundAddresses.filter(item => {
       const h = item.hostname || '';
       const d = item.description || '';
       return regex.test(h) || regex.test(d);
    });

    // Batasi 10 hasil teratas agar bot tidak melambat saat mencari hierarki parent subnet
    const limitedResults = finalMatched.slice(0, 10);
    return await processAddressesHierarchy(limitedResults);
  }

  return [];
}