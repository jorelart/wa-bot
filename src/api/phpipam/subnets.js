import { get } from './client.js';

// Konversi nilai Integer/Long IP dari phpIPAM ke format String IP
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

// Format ulang objek subnet agar subnet selalu berupa teks (contoh: 103.80.81.0)
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

  console.log('\n========== [IPAM DEBUG: SEARCH SUBNET] ==========');
  console.log('1. Input Asli        :', cidrInput);
  console.log('2. IP Part           :', ipPart);
  console.log('3. Mask Part         :', maskPart);

  let foundSubnets = [];

  // TEST 1: Endpoint CIDR standar (URL Encoded) - Bawaan phpIPAM
  try {
    const url1 = `subnets/cidr/${encodeURIComponent(cleanInput)}/`;
    console.log('\n[TEST 1] Memanggil   :', url1);
    const res1 = await get(url1);
    console.log('[TEST 1] HTTP Status : Berhasil (200 OK)');
    console.log('[TEST 1] Data Mentah :', JSON.stringify(res1.data));
    
    if (res1.data && res1.data.length > 0) {
      foundSubnets = res1.data;
    }
  } catch (err) {
    console.log('[TEST 1] GAGAL       :', err.response?.status, err.response?.data?.message || err.message);
  }

  // TEST 2: Endpoint CIDR format dipisah (Bypass masalah web server merusak %2F)
  if (foundSubnets.length === 0) {
    try {
      const url2 = `subnets/cidr/${ipPart}/${maskPart}/`;
      console.log('\n[TEST 2] Memanggil   :', url2);
      const res2 = await get(url2);
      console.log('[TEST 2] HTTP Status : Berhasil (200 OK)');
      console.log('[TEST 2] Data Mentah :', JSON.stringify(res2.data));
      
      if (res2.data && res2.data.length > 0) {
        foundSubnets = res2.data;
      }
    } catch (err) {
      console.log('[TEST 2] GAGAL       :', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3: Endpoint Search khusus IP
  if (foundSubnets.length === 0) {
    try {
      const url3 = `subnets/search/${encodeURIComponent(ipPart)}/`;
      console.log('\n[TEST 3] Memanggil   :', url3);
      const res3 = await get(url3);
      console.log('[TEST 3] HTTP Status : Berhasil (200 OK)');
      console.log('[TEST 3] Data Mentah :', JSON.stringify(res3.data));
      
      if (res3.data && res3.data.length > 0) {
        // Filter agar mask-nya sesuai
        const matched = res3.data.filter(s => String(s.mask) === String(maskPart));
        if (matched.length > 0) {
           foundSubnets = matched;
        }
      }
    } catch (err) {
      console.log('[TEST 3] GAGAL       :', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 4: GET ALL SUBNETS & FILTER MANUAL (ULTIMATE FALLBACK PASTI KETEMU)
  if (foundSubnets.length === 0) {
    try {
      const url4 = `subnets/`;
      console.log('\n[TEST 4] Memanggil   :', url4, '(Mengambil semua subnet dari phpIPAM lalu mencari manual)');
      const res4 = await get(url4);
      const allSubnets = res4.data || [];
      console.log(`[TEST 4] Berhasil mengambil ${allSubnets.length} subnet dari server.`);
      
      // Filter menggunakan JavaScript di sisi Node.js
      const matched = allSubnets.filter(s => {
        const sIp = longToIp(s.subnet);
        return sIp === ipPart && String(s.mask) === String(maskPart);
      });
      
      console.log(`[TEST 4] Hasil filter: Ditemukan ${matched.length} subnet yang cocok.`);
      if (matched.length > 0) {
        console.log('[TEST 4] Data cocok  :', JSON.stringify(matched));
        foundSubnets = matched;
      }
    } catch (err) {
      console.log('[TEST 4] GAGAL       :', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  console.log('=================================================\n');

  if (foundSubnets.length > 0) {
    return foundSubnets.map(normalizeSubnet);
  }
  return [];
}


export async function getSubnetAddresses(subnetId) {
  const response = await get(`subnets/${subnetId}/addresses/`);
  return response.data || [];
}

export async function getSubnetUsage(subnetId) {
  console.log(`\n========== [IPAM DEBUG: USAGE] ==========`);
  console.log(`Meminta data Usage untuk Subnet ID : ${subnetId}`);
  try {
    const response = await get(`subnets/${subnetId}/usage/`);
    console.log(`[USAGE] HTTP Status : Berhasil`);
    console.log(`[USAGE] Data Mentah :`, JSON.stringify(response.data));
    console.log(`=========================================\n`);
    return response.data;
  } catch (err) {
    console.log(`[USAGE] GAGAL       :`, err.response?.status, err.response?.data?.message || err.message);
    console.log(`=========================================\n`);
    throw err;
  }
}

export async function getFirstFreeIp(subnetId) {
  console.log(`\n========== [IPAM DEBUG: FREE IP] ==========`);
  console.log(`Meminta First Free IP untuk Subnet ID : ${subnetId}`);
  try {
    const response = await get(`subnets/${subnetId}/first_free/`);
    console.log(`[FREE IP] HTTP Status : Berhasil`);
    console.log(`[FREE IP] Data Mentah :`, JSON.stringify(response.data));
    console.log(`===========================================\n`);
    return response.data;
  } catch (err) {
    console.log(`[FREE IP] GAGAL       :`, err.response?.status, err.response?.data?.message || err.message);
    console.log(`===========================================\n`);
    throw err;
  }
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