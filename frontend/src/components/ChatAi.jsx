import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';
 
function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi, How are you" }], },//ies format mn ai ko dena padega jis se wo samjh paaye
        { role: 'user', parts: [{ text: "I am Good" }], },
        { role: 'model', parts: [{ text: "How can i help you?" }], }
    ]);

    const { register, handleSubmit, reset,formState: {errors} } = useForm();//here reset for clearing the search bar
    const messagesEndRef = useRef(null);//latest wala msg mere screen pe dikhe aur pahle ke msg scrool karke uper dekh sakte hn

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        
        // update
         const newMessages = [
            ...messages,
            { role: 'user', parts: [{ text: data.message }] }
        ];
        setMessages(newMessages);
        reset();
        try {
            
            const response = await axiosClient.post("/ai/chat", {
                messages: newMessages,//history of chat backend ko mil raha hn
                title:problem.title,
                description:problem.description,
                testCases: problem.visibleTestCases,
                startCode:problem.startCode
            });
            setMessages(prev => [...prev, {  
                role: 'model', 
                parts:[{text: response.data.message}] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: "Error from AI Chatbot"}]
            }]);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble text-sm ${msg.role === 'user'? 'bg-[#10a37f] text-white': 'bg-gray-200 text-gray-900'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center">
                    <input 
                        placeholder="Ask me anything" 
                        className="input input-bordered flex-1" 
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-ghost ml-2  bg-[#0d0d0d] hover:bg-[#0e8c6c] text-white transition"
                        disabled={errors.message}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;















// import {useForm} from "react-hook-form";
// import { Send } from 'lucide-react';//icon import from lucide-react (react) send ka

// const ChatAi = ()=>{
//         const {register, handleSubmit} = useForm();

//         const onSubmit = (data)=>{
//                 console.log(data);
//         }
//         return (
//                 <>

//                 {/* daisyUi-> components -> chatBubble -> jsx */}
//                 <div className="chat chat-start">
//                         <div className="chat-bubble">
//                         It's over Anakin,
//                         <br />
//                         I have the high ground.
//                 </div>
//                 </div>
//                         <div className="chat chat-end">
//                         <div className="chat-bubble">You underestimate my power!</div>
//                 </div>
//                 <form onSubmit={handleSubmit(onSubmit)}
//                 className="flex items-center w-full max-w-3xl mx-auto bg-[#f7f7f8] border border-gray-300 rounded-xl px-4 py-2 shadow-sm"
//                 >
//                         <input {...register("message", { required: true, minLength: 2 })} placeholder="Message AI..." className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-500"/>
//                         <button type="submit" className="ml-2 p-2 bg-[#10a37f] hover:bg-[#0e8c6c] text-white rounded-md transition duration-200">
//                              <Send className="w-5 h-5" />
//                         </button>
//                 </form>
//                 </>
//         )
// }

// export default ChatAi;
