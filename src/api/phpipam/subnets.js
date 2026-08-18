import { get } from './client.js';

export async function searchSubnet(cidr) {
  const response = await get(
    `/subnets/cidr/${encodeURIComponent(cidr)}/`
  );

  return response.data || [];
}

export async function getSubnet(subnetId) {
  const response = await get(`/subnets/${subnetId}/`);

  return response.data;
}

export async function getSubnetUsage(subnetId) {
  const response = await get(
    `/subnets/${subnetId}/usage/`
  );

  return response.data;
}

export async function getSubnetAddresses(subnetId) {
  const response = await get(
    `/subnets/${subnetId}/addresses/`
  );

  return response.data || [];
}

export async function getFirstFreeIp(subnetId) {
  const response = await get(
    `/subnets/${subnetId}/first_free/`
  );

  return response.data;
}
