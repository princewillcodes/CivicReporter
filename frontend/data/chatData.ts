export type ChatMessage = { id: string; author: string; area: string; body: string; time: string; mine?: boolean; reportId?: string };

export const currentChatUser = {
  displayName: "Akosua Kwarteng",
  municipality: "Accra Metropolitan",
};

export const chatMessages: ChatMessage[] = [
  { id: "m1", author: "Kojo", area: "Osu", body: "Has anyone confirmed the open drain near Oxford Street?", time: "10:42 AM" },
  { id: "m2", author: "Ama", area: "Labone", body: "I added a confirmation to the report. It is under review now.", time: "10:48 AM" },
  { id: "m3", author: "You", area: "Accra Metropolitan", body: "Thanks. I have also shared the location with my neighbours.", time: "10:51 AM", mine: true, reportId: "CR-2048" },
];
