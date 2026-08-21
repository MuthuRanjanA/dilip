import api from "../api/axiosInstance";

export const addAsset = (assetData) => {
  return api.post("/asset", assetData);
};

export const getAllAssets = () => {
  return api.get("/asset");
};

export const getMyAssets = () => {
  return api.get("/asset/me");
};

export const updateAsset = (assetId, assetData) => {
  return api.put(`/asset/${assetId}`, assetData);
};

export const deleteAsset = (assetId) => {
  return api.delete(`/asset/${assetId}`);
};

export const getAssetByEmployee = (employeeId) => {
  return api.get(`/asset/employee/${employeeId}`);
};

export const getAssetByStatus = (status) => {
  return api.get(`/asset/status/${status}`);
};