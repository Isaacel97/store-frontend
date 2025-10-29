import axios from "axios";
import { API_URL } from "../utils/constants";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getEmployees = async () => {
  const res = await axios.get(`${API_URL}/users/all` , { headers: headers() });
  return res.data;
};

export const createEmployee = async (payload) => {
  const res = await axios.post(`${API_URL}/auth/register`, payload, { headers: headers() });
  return res.data;
};

export const getShiftsByUser = async (userId) => {
  const res = await axios.get(`${API_URL}/shifts/${userId}`, { headers: headers() });
  return res.data;
};

export const createShift = async (payload) => {
  const res = await axios.post(`${API_URL}/shifts`, payload, { headers: headers() });
  return res.data;
};

export const clockIn = async (userId) => {
  const res = await axios.post(`${API_URL}/attendance/clockin`, { user_id: userId }, { headers: headers() });
  return res.data;
};

export const clockOut = async (userId) => {
  const res = await axios.post(`${API_URL}/attendance/clockout`, { user_id: userId }, { headers: headers() });
  return res.data;
};
