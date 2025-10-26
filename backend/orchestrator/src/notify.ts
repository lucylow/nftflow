// src/notify.ts
export const notifyOperator = async (message: string) => {
  // Hook into Discord, Slack, email, or Socket.io
  console.log("[NOTIFY] operator:", message);
  // e.g., POST to webhook
  // await axios.post(process.env.DISCORD_WEBHOOK!, { content: message });
};

export const notifyUser = async (userAddress: string, message: string) => {
  console.log(`[NOTIFY] user ${userAddress}: ${message}`);
};

