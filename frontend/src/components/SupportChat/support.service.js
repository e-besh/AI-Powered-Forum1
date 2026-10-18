import { apiClient } from "../../services/core/api.client.js";

export const sendSupportMessage = async ({ message, messages }) => {
  const response = await apiClient.post("/api/support/chat", {
    message,
    messages,
  });

  return response.data;
};
