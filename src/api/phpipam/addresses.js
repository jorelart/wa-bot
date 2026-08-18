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

  // STRATEGI 1: Pencarian Persis (Bawaan phpIPAM)
  try {
    const response = await get(`addresses/search_hostname/${encodeURIComponent(cleanKeyword)}/`);
    if (response.data && response.data.length > 0) {
      return await processAddressesHierarchy(response.data);
    }
  } catch (err) {
    // Abaikan jika 404, lanjut ke Strategi 2
  }

  // STRATEGI 2: Pencarian SUPER FLEXIBLE (Regex/Fuzzy di sisi Node.js)
  // Memecah input user (Misal: "r jamiul" menjadi ["r", "jamiul"])
  const words = cleanKeyword.split(/[\s\-_.]+/).filter(w => w.length > 0);
  
  // Cari kata terpanjang untuk dijadikan "jangkar" query ke phpIPAM agar tidak menarik terlalu banyak data
  const mainWord = words.sort((a, b) => b.length - a.length)[0];

  if (!mainWord) return [];

  try {
    // Tarik data besar menggunakan kata jangkar
    const fallbackRes = await get(`addresses/search_hostname/${encodeURIComponent(mainWord)}/`);
    let results = fallbackRes.data || [];

    if (results.length > 0) {
      // Buat pola Regex dari input asli user. 
      // Contoh: "r jamiul" -> Regex: /r.*jamiul/i (Mencari 'r' diikuti apapun lalu 'jamiul')
      const regexPattern = words.join('.*');
      const regex = new RegExp(regexPattern, 'i');

      // Filter menggunakan Regex Node.js
      results = results.filter(item => {
        const h = item.hostname || '';
        const d = item.description || '';
        // Cek apakah pola cocok di Hostname ATAU Description
        return regex.test(h) || regex.test(d);
      });

      if (results.length > 0) {
        return await processAddressesHierarchy(results);
      }
    }
  } catch (err) {
    if (err.response?.status === 404 || err.response?.data?.code === 404) return [];
    throw err;
  }

  return [];
}