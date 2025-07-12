import { Message } from "./types";

export async function sendMessageToBackend(messages: Message[], onChunk: (text: string) => void, model: string): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model }),
  });

  if (!response.ok) throw new Error("Failed to fetch response");

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  while (reader) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
}

export async function fetchModels(setModelsData: React.Dispatch<React.SetStateAction<object>>): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/models`);
  if (!response.ok) throw new Error("Failed to fetch models");
  const data = await response.json();
  console.log("Fetched models:", data);
  setModelsData(data);
}

