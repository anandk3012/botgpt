"use client";

import { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { IoCopy } from "react-icons/io5";
import Image from "next/image";

export default function MessageBubble({ message, modelLogo }: { message: Message, modelLogo: string }) {
  const isUser = message.role === "user";
  const isLoader = message.content === "__LOADER__";
  const [llmModelLogo, setLlmModelLogo] = useState(modelLogo || "/images/logos/ollama.png");

  // console.log("MessageBubble modelLogo:", llmModelLogo);

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      {/* model logo */}
      {!isUser && !isLoader && <div className="mr-2">
        <Image
          src={llmModelLogo}
          alt={llmModelLogo}
          width={40}
          height={40}
          className="inline-block bg-[#181818] rounded-full p-2"
        />
      </div>}
      <div
        className={`relative rounded-xl px-4 mr-6 text-sm shadow whitespace-pre-wrap ${
          isUser ? " max-w-[80%] py-2 bg-[#303030] text-white mb-4" : "py-4  bg-[#181818] text-white"
        }`}
      >
        {isLoader ? (
          <div className="flex space-x-1">
            <span className="animate-bounce [animation-delay:-0.3s]">.</span>
            <span className="animate-bounce [animation-delay:-0.15s]">.</span>
            <span className="animate-bounce">.</span>
          </div>
        ) : (
          
        
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const [copied, setCopied] = useState(false);

              const handleCopy = () => {
                navigator.clipboard.writeText(String(children).trim());
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              };

              return !inline ? (
                <div className="relative group">
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 z-10 text-xs bg-[#181818] border border-[#303030] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:cursor-pointer"
                    disabled={!navigator.clipboard}
                  >
                    {copied ? "Copied!" : <IoCopy />}
                  </button>
                  <SyntaxHighlighter
                    {...props}
                    language={match?.[1] || "text"}
                    style={oneDark}
                    customStyle={{
                      borderRadius: "0.5rem",
                      fontSize: "0.85rem",
                      padding: "1rem",
                      background: "#1e1e1e",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      )}
      </div>
    </div>
  );
}
