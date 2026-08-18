import { get } from './client.js';

export async function searchAddress(ip) {
  // Tanpa '/' di depan 'addresses'
  const response = await get(`addresses/search/${encodeURIComponent(ip)}/`);
  return response.data || [];
}

export async function searchHostname(hostname) {
  const response = await get(`addresses/search_hostname/${encodeURIComponent(hostname)}/`);
  return response.data || [];
}

export async function getAddress(ip, subnetId) {
  const response = await get(`addresses/${encodeURIComponent(ip)}/${subnetId}/`);
  return response.data;
}