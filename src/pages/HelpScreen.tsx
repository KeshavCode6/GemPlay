"use client"

import type React from "react"
import { useState } from "react"
import { HelpingHand, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { askQuestion } from "@/lib/ai"
import Header from "@/components/Header"
import Background from "@/components/Background"
import { motion } from "framer-motion"

type Message = {
    id: string
    content: string
    sender: "user" | "bot"
}

export default function HelpScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: `Just so you know, to use GemPlay: click the new story button to generate a custom story, and continue selecting choices until the story ends (3 choices), click “Exit” to stop the story and export it to a cloud library (if you are signed in) or “Home” to return to the welcome page without exporting. All your videos will show up on the home page!`,
            sender: "bot",
        },
        {
            id: "2",
            content: `Other than that, how can I help?`,
            sender: "bot",
        },
    ])
    const [inputMessage, setInputMessage] = useState("")

    // Function to handle message submission
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault() // Prevent default form submission behavior

        if (!inputMessage.trim()) return // Prevent empty messages

        // Creating a new user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputMessage,
            sender: "user",
        }

        const response = await askQuestion(inputMessage) // Fetch AI-generated response

        setMessages((prev) => [...prev, userMessage]) // Add user message to state
        setInputMessage("") // Clear input field

        // Simulating bot response delay
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                sender: "bot",
            }
            setMessages((prev) => [...prev, botMessage]) // Add bot response to state
        }, 1000)
    }

    return (
        <motion.div
            initial={{ backgroundColor: "#FFFBF2", overflow: "hidden" }}
            animate={{ backgroundColor: "#f2d1b3" }}
            exit={{ overflow: "auto" }}
            onAnimationEnd={() => {
                document.body.style.overflow = 'auto';
            }}
            transition={{ duration: 1 }}
            className="min-h-screen flex flex-col items-center p-4 md:p-8"
        >
            <Background />
            <Header />
            <motion.div
                initial={{ y: 1000 }}
                animate={{ y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 20
                }}
                className="flex-grow w-full h-full flex justify-center items-center z-50">
                <Card className="w-full h-full max-w-[50%] flex flex-col" style={{ aspectRatio: "5/4" }}>
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-xl flex gap-2">
                            GemPlay Assistant <HelpingHand />
                        </CardTitle>
                    </CardHeader>

                    {/* Scrollable chat area */}
                    <ScrollArea className="flex-1 p-4 max-h-[75%]">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === "user" ? "bg-primary text-white" : "bg-muted"}`}
                                    >
                                        <p>{message.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Message input field and send button */}
                    <CardFooter className="border-t p-4">
                        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" className="text-white">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    )
}