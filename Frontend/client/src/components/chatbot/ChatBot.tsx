import React, { useState, FormEvent, ChangeEvent } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'model';
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to messages
    const newMessages = [...messages, { text: inputMessage, sender: 'user' }];
setMessages(newMessages as Message[]);
    setInputMessage('');

    // Send the entire conversation (messages) to the backend
    const response = await fetch('http://localhost:8000/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        messages: newMessages.map(message => ({
          role: message.sender,
          parts: [{ text: message.text }],
        })),
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let botResponse = ''; // Store the full bot response

    if (!reader) return;

// Inside your while loop reading the stream:
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  
  // Split the chunk by 'data:' and filter out empty parts
  const parts = chunk.split("data:").map(part => part.trim()).filter(Boolean);

  // Accumulate new content from this chunk and check for termination
  let newContent = "";
  let isDone = false;

  for (const part of parts) {
    if (part === "[DONE]") {
      isDone = true;
    } else {
      newContent += part;
    }
  }

  // If any new content was collected, update botResponse and state once
  if (newContent) {
    botResponse += newContent;
    setMessages(prev => {
      const updated = [...prev];
      // If the last message is already a bot message, update it; otherwise add a new one.
      const last = updated[updated.length - 1];
      if (last && last.sender === "model") {
        updated[updated.length - 1] = { ...last, text: botResponse };
      } else {
        updated.push({ text: botResponse, sender: "model" });
      }
      return updated;
    });
  }

  if (isDone) {
    // Finalize the bot message and exit the loop.
    setMessages(prev => {
      const updated = [...prev];
      if (updated[updated.length - 1]?.sender === "model") {
        updated[updated.length - 1] = { text: botResponse, sender: "model" };
      } else {
        updated.push({ text: botResponse, sender: "model" });
      }
      return updated;
    });
    return;
  }
}


  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button 
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
          <div className="bg-black p-3 rounded-t-lg">
            <h3 className="text-white font-semibold m-0">Mission Planning Assistant</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`max-w-[80%] p-3 rounded-lg mb-2 ${
                  message.sender === 'user' 
                    ? 'bg-black text-white ml-auto' 
                    : 'bg-gray-100 mr-auto'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button 
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
