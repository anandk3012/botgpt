"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import { sendMessageToBackend, fetchModels } from "@/lib/api";
import Image from "next/image";

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResponseRunning, setIsResponseRunning] = useState(false);
    const [selectedModel, setSelectedModel] = useState("llama3.2");
    const [modelsData, setModelsData] = useState(Object); // Add your model options here
    const [models, setModels] = useState<string[]>([]); // Add your model options here

    useEffect(() => {
        fetchModels(setModelsData);
    }, []);

    useEffect(() => {
        setModels(modelsData.models || []);
    }, [modelsData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(e.target.value);
    };
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userMessage: Message = { role: "user", content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        let assistantMessage: Message = { role: "assistant", content: "" };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(true);

        try {
            setIsResponseRunning(true);

            await sendMessageToBackend(updatedMessages, (chunk: string) => {
                assistantMessage = {
                    ...assistantMessage,
                    content: assistantMessage.content + chunk,
                };
                // Update the last message (assistant's message) as new content arrives
                setIsLoading(false);
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    assistantMessage
                ]);
            }, selectedModel); // Pass the selected model to the backend
        } catch (err) {
            console.error("❌ Streaming error:", err);
        } finally {
            setIsResponseRunning(false);
        }
    };

    return (
        <div className="mx-auto flex">
            <div className="w-1/6 bg-[#181818] " >

            </div>
            <div className="w-5/6 h-screen mx-auto pt-5 p-20 bg-[#212121] shadow-lg ">
                <div className="w-3/4 bg-transparent absolute" >
                    <h1 className="text-2xl font-bold text-white mb-4">BotGPT</h1>
                </div>
                <div className="w-3/4 flex flex-col h-full mx-auto my-3">

                    <div className="flex-1 overflow-y-auto my-5 hide-scrollbar">
                        {messages.map((m, i) => (
                            <MessageBubble key={i} message={m} model={selectedModel} />
                        ))}
                        {isLoading && (
                            <MessageBubble message={{ role: "assistant", content: "__LOADER__" }} modelLogo={modelsData.model_logos[selectedModel]} />
                        )}

                    </div>


                    <form onSubmit={handleSubmit} className="w-3/4 h-auto mx-auto flex mt-4 bg-[#0A0A0A] rounded-xl">
                        <select
                            className="mr-2 p-2 text-[0.7rem] rounded-lg"
                            value={selectedModel}
                            onChange={handleModelChange}
                        >
                            {models.map((model, index) => {
                                return (
                                    <option key={index} className="text-white bg-black rounded-lg" value={model}>                                
                                        {model}
                                    </option>
                                );
                            })}
                        </select>
                        <input
                            className="flex-1 rounded-l-xl border-gray-500 p-2 text-sm overflow-x-visible"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!input || isResponseRunning}
                            className="disabled:bg-gray-300 bg-white text-black px-4 rounded-r-xl text-sm"
                        >
                            Send
                        </button>
                    </form>

                </div>

            </div>

        </div>
    );
}
