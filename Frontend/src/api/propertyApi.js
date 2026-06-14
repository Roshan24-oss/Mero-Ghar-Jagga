import axios from "axios";

const API = "http://localhost:8000/api/property";

/* VIEW */
export const addView = (propertyId, visitorId) => {
  return axios.post(`${API}/view/${propertyId}`, {
    visitorId,
  });
};

/* LIKE */
export const toggleLike = (propertyId, token) => {
  return axios.post(
    `${API}/like/${propertyId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/* FAVORITE */
export const toggleFavorite = (propertyId, token) => {
  return axios.post(
    `${API}/favorite/${propertyId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};