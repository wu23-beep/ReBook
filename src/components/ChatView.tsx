/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Conversation, ChatMessage, Book } from "../types";
import { INITIAL_CONVERSATIONS } from "../data";

interface ChatViewProps {
  activeConversation?: Conversation;
  onBack?: () => void;
  targetBook?: Book;
  customPrefilledText?: string;
  onConversationUpdate?: (updatedConv: Conversation) => void;
  books?: Book[];
  demoScene?: "scene-1" | "scene-2" | "scene-3" | "scene-4" | null;
}

export default function ChatView({
  activeConversation,
  onBack,
  targetBook,
  customPrefilledText = "",
  onConversationUpdate,
  books = [],
  demoScene = null,
}: ChatViewProps) {
  // Local Conversations Database State
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>("conv-algorithms");
  
  // Text Input State
  const [inputText, setInputText] = useState(customPrefilledText);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingLocation, setMeetingLocation] = useState("校總區圖書館 - 自習閱覽室");
  const [meetingDate, setMeetingDate] = useState("2026-05-28");
  const [meetingTime, setMeetingTime] = useState("14:00");

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const renderSchoolName = (sch: string) => {
    const mapping: Record<string, string> = {
      "National Taiwan University": "國立臺灣大學",
      "National Chengchi University": "國立政治大學",
      "Soochow University": "東吳大學",
      "Fu Jen Catholic University": "輔仁大學",
      "台大": "國立臺灣大學",
      "政大": "國立政治大學",
      "東吳": "東吳大學",
      "輔仁": "輔仁大學",
    };
    return mapping[sch] || sch;
  };

  // If a parent provides a dynamic book, mount / find/ create conversation
  useEffect(() => {
    if (targetBook) {
      setConversations((prev) => {
        const existing = prev.find((c) => c.bookId === targetBook.id);
        if (existing) {
          return prev;
        }
        // Create an initial dynamic conversation with the owner
        const newConv: Conversation = {
          id: `conv-${targetBook.id}`,
          bookId: targetBook.id,
          bookTitle: targetBook.title,
          bookCoverUrl: targetBook.coverUrl,
          otherPartyName: targetBook.ownerId === "owner-alex" ? "Alex Chen" : "Prof. Chen (EE102)",
          otherPartyAvatar:
            targetBook.ownerId === "owner-alex"
              ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCG8jM-azr1sxrBx_5pVjKMCusHCXpDw8xRa6v8J6p1TYGehT2m7MuL3rWDM0dsJDuWYja2KW2tfKuHSsHivmHsFRuzSObXbZkAAV3sAGzz1xewQckHIMw6e5mVQJhtu4htrQuNKtUWSmuxhPanuaSCs4g-DTq5p-WffAe0ZlPy79Abwf2DcclGEnw8T0-dj3uV3G378Ejq9styzfIaBoQMr3d1I9ZwCz_80ERjfhbyY03kPHcNGPFMLZKhYr1UY6E-XBEG7F4RnEw"
              : "https://lh3.googleusercontent.com/aida-public/AB6AXuCvSAcGKcNCqPxgQNQfUnI-p49nqH9w7aETJ90vhDL6qJ31a9AuLQZlHR4-pCP0gAUB2wPfTJ-VIHQS4XO288dF9RCoXnB-aLjjR0LD3Anc-8PNnVTj2tlxJ5WSWRlvcLkKbCJrzjhn62R-RMRfrJU25wE9CefFuvaV-3lilsZjdKQ4YLj_GmAQjtidjPvxRBnCMVsdBvMJc1ypsuKKlkzKE4RNGOprOHGMWXra4rE2aMNom0TW4tYh2FyBL8kY1iTldpxSWP0x6jA",
          lastMessageTime: "剛剛",
          messages: [
            {
              id: "init-1",
              senderId: "other",
              senderName: targetBook.ownerId === "owner-alex" ? "Alex" : "Prof. Chen",
              text: `你好！我是書本的持有者。你可以向我發送詢問，或是預約在校園的面交地點。`,
              timestamp: "09:30"
            }
          ],
        };
        return [newConv, ...prev];
      });
      setSelectedConvId(`conv-${targetBook.id}`);
    }
  }, [targetBook]);

  // Handle outside prop preset text values
  useEffect(() => {
    if (customPrefilledText) {
      setInputText(customPrefilledText);
    }
  }, [customPrefilledText]);

  // Retrieve current active conversation
  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const activeBook = books.find((b) => b.id === activeConv?.bookId) || 
                     books.find((b) => b.title === activeConv?.bookTitle);

  useEffect(() => {
    // Auto Scroll to Bottom on message update (without scrolling the main page window)
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      const scrollTimer = setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
      return () => clearTimeout(scrollTimer);
    }
  }, [activeConv?.messages, selectedConvId]);

  // Controlled Demo Scene effect
  useEffect(() => {
    if (!demoScene || demoScene !== "scene-4") return;

    // Reset conversation to initial state
    setSelectedConvId("conv-algorithms");
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === "conv-algorithms") {
          return {
            ...c,
            messages: [
              {
                id: "msg-init-demo",
                senderId: "other",
                senderName: "Alex",
                text: "你好！我這本演算法課本大約有八成新，你需要看實照嗎？",
                timestamp: "09:30",
              },
            ],
          };
        }
        return c;
      })
    );
    setInputText("");

    let typingTimer: any;
    const startTyping = setTimeout(() => {
      let typed = "";
      const phrase = "嗨 Alex，請問這本演算法課本還有嗎？想看一些內頁實照。";
      let idx = 0;
      typingTimer = setInterval(() => {
        if (idx < phrase.length) {
          typed += phrase[idx];
          setInputText(typed);
          idx++;
        } else {
          clearInterval(typingTimer);
          setTimeout(() => {
            handleSendMessage(phrase);
            
            // Wait 2.5 seconds (after bot replies image) to trigger schedule card creation
            setTimeout(() => {
              const timestamp = new Date().toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              const mtgMsg = {
                id: `mtg-${Date.now()}`,
                senderId: "system",
                senderName: "系統",
                text: `📅 Emily Wang 已發起二手書面交預約！面交地點：台大第一學生活動中心正門，日期：2026-06-22，時間 12:00。等待對方的確認中。`,
                timestamp,
              };

              setConversations((currentConvs) =>
                currentConvs.map((c) => {
                  if (c.id === "conv-algorithms") {
                    return {
                      ...c,
                      messages: [...c.messages, mtgMsg],
                      lastMessageTime: "剛剛",
                    };
                  }
                  return c;
                })
              );

              // 1.5 seconds later, Alex accepts the meeting
              setTimeout(() => {
                const acceptMsg = {
                  id: `bot-mtg-${Date.now()}`,
                  senderId: "other",
                  senderName: "Alex",
                  text: `太棒了！我已經確認並接受這個相約面交。到時候原約定時間與地點見囉！🤝`,
                  timestamp,
                };

                setConversations((currentConvs) =>
                  currentConvs.map((c) => {
                    if (c.id === "conv-algorithms") {
                      return {
                        ...c,
                        messages: [...c.messages, acceptMsg],
                      };
                    }
                    return c;
                  })
                );
              }, 1500);
            }, 2500);
          }, 300);
        }
      }, 95);
    }, 1500);

    return () => {
      clearTimeout(startTyping);
      if (typingTimer) clearInterval(typingTimer);
    };
  }, [demoScene]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timestamp = new Date().toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      senderId: "user",
      senderName: "Emily",
      text: textToSend,
      timestamp,
    };

    const updatedMessages = [...activeConv.messages, userMsg];
    const updatedConv = {
      ...activeConv,
      messages: updatedMessages,
      lastMessageTime: timestamp,
    };

    // Update global and local lists
    setConversations((prev) => prev.map((c) => (c.id === activeConv.id ? updatedConv : c)));
    setInputText("");

    if (onConversationUpdate) {
      onConversationUpdate(updatedConv);
    }

    // Trigger mock response after delay
    setTimeout(() => {
      let replyText = "了解！那你看哪天方便，我們可以直接點選上方按鈕發起面交時間跟地點預約碰面喔！";
      let replyImageUrl: string | undefined = undefined;

      const q = textToSend.toLowerCase();
      if (q.includes("照片") || q.includes("圖") || q.includes("實照") || q.includes("內頁")) {
        replyText = "沒問題！這是這本教材書本內頁的實物拍攝照，您可以參考看看：";
        replyImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAp9QZ_5TQPO5y2TKSjgFpHHW57DVG-OAbpj3m37pFjBvh5IzuMCqswV9q5cjZXdddd2rZzGit7LEdaslBMqIknTdvZqtGJYoqyV7AHvJeQ-d4RgTDlRbnuphIHW9geGTiBRkKOWdBnMEqbps1nq7o8R1vB4j5BxLdKvcxZqZ_Ffnj2bAkiv202Dhl7oeGj-8Qya5nlpbkuO8P4342esZbbVXqEOaDahDBiUOralj4bJE6bhueHn-aa0MDW4bEPktKdPT5G43WPNG0";
      } else if (q.includes("還在嗎") || q.includes("在嗎") || q.includes("賣出")) {
        replyText = "哈囉！在的喔，這本課本目前還在，您可以直接發起面交預約！";
      } else if (q.includes("面交") || q.includes("碰面") || q.includes("相約") || q.includes("拿書") || q.includes("約")) {
        replyText = "好啊，我這學期主要二四中午都在總圖書館或活大附近，或者您也可以點選上方的「預約面交」來定時間地點。";
      } else if (q.includes("筆記") || q.includes("劃記") || q.includes("鉛筆") || q.includes("螢光筆") || q.includes("書況") || q.includes("乾淨")) {
        replyText = "這本書的保存狀況良好，只有前幾章有少許螢光筆畫記重點跟鉛筆筆記，非常乾淨不影響閱讀，有需要我可以拍實拍照給您。";
      } else if (q.includes("便宜") || q.includes("打折") || q.includes("算少") || q.includes("價格") || q.includes("價錢") || q.includes("特價")) {
        replyText = "這本定價已經比外面二手書店便宜很多了，或者如果您手邊也有其他用不到的學術教材，也可以直接跟我發起雙向交換喔！";
      } else if (q.includes("嗨") || q.includes("哈囉") || q.includes("你好") || q.includes("您好") || q.includes("hello") || q.includes("hi")) {
        replyText = "您好！請問對這本二手教材有任何疑問，或是想要約時間面交嗎？";
      } else if (q.includes("謝謝") || q.includes("感恩") || q.includes("感謝") || q.includes("thanks") || q.includes("thx")) {
        replyText = "不會的，不客氣！如果有課本上的任何需求隨時傳訊息問我，祝您這學期歐趴！";
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        senderId: "other",
        senderName: activeConv.otherPartyName.split(" ")[0],
        text: replyText,
        imageUrl: replyImageUrl,
        timestamp,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            const list = [...c.messages, botMsg];
            return { ...c, messages: list, lastMessageTime: timestamp };
          }
          return c;
        })
      );
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(inputText);
    }
  };

  // Scheduled meeting trigger
  const handleScheduleSubmit = () => {
    const timestamp = new Date().toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const meetingCardMsg: ChatMessage = {
      id: `mtg-${Date.now()}`,
      senderId: "system",
      senderName: "系統",
      text: `📅 Emily Wang 已發起二手書面交預約！面交地點：${meetingLocation}，日期：${meetingDate}，時間 ${meetingTime}。等待對方的確認中。`,
      timestamp,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            messages: [...c.messages, meetingCardMsg],
            lastMessageTime: timestamp,
          };
        }
        return c;
      })
    );

    setIsModalOpen(false);

    // Dynamic acceptance after 3 seconds
    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: `bot-mtg-${Date.now()}`,
        senderId: "other",
        senderName: activeConv.otherPartyName.split(" ")[0],
        text: `太棒了！我已經確認並接受這個相約面交。到時候原約定時間與地點見囉！🤝`,
        timestamp,
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              messages: [...c.messages, confirmMsg],
            };
          }
          return c;
        })
      );
    }, 3000);
  };

  return (
    <div className="pt-2 pb-24 max-w-4xl mx-auto px-4" id="chat-view-container">
      
      {/* Dynamic Context Header */}
      {activeConv && (
        <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm border border-outline-variant/15 mb-4 z-40">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-16 rounded-md overflow-hidden shadow-md bg-surface-container-high flex-shrink-0">
              <img
                referrerPolicy="no-referrer"
                alt={activeConv.bookTitle}
                className="w-full h-full object-cover"
                src={activeConv.bookCoverUrl}
              />
            </div>
            <div>
              <h2 className="font-sans text-sm font-bold text-primary leading-tight line-clamp-1">{activeConv.bookTitle}</h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] font-sans text-on-surface-variant font-semibold">
                {activeBook && (
                  <>
                    <span className="bg-secondary-container/20 text-secondary px-1.5 py-0.5 rounded font-bold">
                      {activeBook.price === null ? "免費贈送" : `NT$ ${activeBook.price}`}
                    </span>
                    <span>•</span>
                    <span>{renderSchoolName(activeBook.school)}</span>
                    <span>•</span>
                    <span>{activeBook.department === "Computer Science" ? "資訊工程" : activeBook.department === "Electrical Engineering" ? "電機工程" : activeBook.department === "Economics" ? "經濟系" : activeBook.department}</span>
                    <span>•</span>
                  </>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse shrink-0"></span>
                  正在與 {activeConv.otherPartyName} 洽談對話中
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-secondary text-on-secondary px-4 py-2.5 rounded-xl flex items-center gap-2 font-sans text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>預約面交</span>
          </button>
        </div>
      )}

      {/* Main Grid: Left contacts stream, Right message body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch min-h-[500px]">
        
        {/* Contact List column for Desktops */}
        <div className="hidden lg:block lg:col-span-1 bg-surface-container-low rounded-2xl border border-outline-variant/20 p-4 space-y-3">
          <h3 className="text-xs font-bold text-outline uppercase tracking-wider px-2">對話訊息列表</h3>
          
          <div className="space-y-2">
            {conversations.map((c) => {
              const isSelected = c.id === selectedConvId;
              const lastMsg = c.messages[c.messages.length - 1];
              const lastMsgText = lastMsg 
                ? (lastMsg.senderId === "system" 
                    ? lastMsg.text 
                    : (lastMsg.senderId === "user" ? `我: ${lastMsg.text}` : lastMsg.text))
                : "";

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all relative ${
                    isSelected ? "bg-secondary-container/35 border-l-4 border-secondary shadow-xs" : "hover:bg-surface-container-high"
                  }`}
                >
                  <img
                    alt={c.otherPartyName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    src={c.otherPartyAvatar}
                  />
                  <div className="overflow-hidden flex-grow pr-8">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-primary truncate">{c.otherPartyName}</h4>
                    </div>
                    <p className="text-[10px] font-bold text-secondary truncate mt-0.5">《{c.bookTitle}》</p>
                    <p className="text-[10px] text-outline truncate mt-0.5">{lastMsgText}</p>
                  </div>
                  <span className="absolute top-3 right-3 text-[9px] text-outline font-semibold select-none">
                    {c.lastMessageTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Window Window Stream */}
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-[0px_4px_16px_rgba(3,22,50,0.03)] flex flex-col justify-between overflow-hidden">
          
          {/* Scrollable messages box */}
          <div ref={messageContainerRef} className="flex-grow overflow-y-auto academic-scroll p-4 space-y-4 max-h-[420px] min-h-[350px]">
            {activeConv?.messages.map((msg) => {
              const isUser = msg.senderId === "user";
              const isSys = msg.senderId === "system";

              if (isSys) {
                const isBooking = msg.text.includes("📅") || msg.text.includes("預約");
                const isConfirmed = msg.text.includes("🤝") || msg.text.includes("確認") || msg.text.includes("成功") || msg.text.includes("接受");
                
                if (isBooking || isConfirmed) {
                  return (
                    <div key={msg.id} className="flex justify-center my-4 select-none w-full max-w-sm sm:max-w-md mx-auto">
                      <div className={`w-full p-4 rounded-2xl border ${
                        isConfirmed 
                          ? "bg-secondary-container/10 border-secondary/35 text-on-secondary-container" 
                          : "bg-surface-container-low border-outline-variant/30 text-on-surface"
                      } shadow-sm space-y-3`}>
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-lg ${isConfirmed ? "text-secondary" : "text-outline"}`}>
                            {isConfirmed ? "handshake" : "calendar_month"}
                          </span>
                          <span className="text-xs font-bold tracking-wider uppercase font-sans">
                            {isConfirmed ? "面交約定已確認" : "發起面交預約邀請"}
                          </span>
                          <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isConfirmed ? "bg-secondary/15 text-secondary" : "bg-outline-variant/30 text-outline"
                          }`}>
                            {isConfirmed ? "已成約" : "待確認"}
                          </span>
                        </div>
                        <p className="text-xs font-sans leading-relaxed text-left text-on-surface-variant">
                          {msg.text.replace("📅", "").replace("🤝", "")}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex justify-center my-3 select-none">
                    <div className="bg-surface-container-high px-4 py-1.5 rounded-full border border-outline-variant/25">
                      <p className="text-[11px] font-semibold text-on-surface-variant text-center leading-normal">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 w-[90%] md:w-[75%] ${
                    isUser ? "self-end ml-auto flex-row-reverse" : "self-startMR pr-2"
                  }`}
                >
                  {/* Participant Avatar */}
                  <div className="w-9 h-9 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center overflow-hidden border border-outline-variant/15 select-none">
                    {isUser ? (
                      <span className="material-symbols-outlined text-primary text-lg">person</span>
                    ) : (
                      <img
                        alt={msg.senderName}
                        className="w-full h-full object-cover"
                        src={activeConv.otherPartyAvatar}
                      />
                    )}
                  </div>

                  {/* Text bubble block */}
                  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`p-3.5 rounded-2xl shadow-xs border ${
                        isUser
                          ? "bg-primary-container border-transparent text-white rounded-tr-none"
                          : "bg-surface-container-low border-outline-variant/10 text-on-surface rounded-tl-none"
                      }`}
                    >
                      <p className="font-sans text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                      
                      {msg.imageUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-outline-variant max-w-xs aspect-[3/4]">
                          <img
                            referrerPolicy="no-referrer"
                            alt="Interior detail photo"
                            className="w-full h-full object-cover cursor-zoom-in"
                            src={msg.imageUrl}
                          />
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[10px] text-outline mt-1 block select-none">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* Scroll Anchor */}
          </div>

          {/* Quick Replies Buttons Slider */}
          <div className="flex gap-2 overflow-x-auto py-2.5 px-4 bg-surface dark:bg-surface-dim border-t border-b border-surface-container-high select-none academic-scroll select-none">
            {[
              "這本書目前還在嗎？",
              "我已經發起面交預約囉！",
              "請問可以拍一下目錄跟書況實照嗎？",
              "請問書上筆記與劃記多嗎？",
              "一般約在校園哪裡取書比較方便？"
            ].map((msgChip, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(msgChip)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-outline/35 text-xs font-semibold text-primary bg-background hover:bg-surface-container cursor-pointer transition-colors"
              >
                {msgChip}
              </button>
            ))}
          </div>

          {/* User typing send bar */}
          <div className="p-3 bg-surface border-t border-outline-variant/10">
            <div className="bg-surface-container-lowest rounded-xl flex items-center p-1.5 shadow-sm border border-outline-variant/20">
              <button 
                onClick={() => handleSendMessage("好的！沒問題。")}
                className="p-2 text-outline hover:text-primary transition-colors cursor-pointer"
                title="快捷回覆"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
              </button>
              
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow bg-transparent border-none text-xs sm:text-sm px-3 focus:ring-0 focus:outline-none placeholder:text-outline-variant text-primary"
                placeholder="輸入訊息對話..."
                type="text"
              />
              
              <button
                onClick={() => {
                  // Mock camera trigger
                  const timestamp = new Date().toLocaleTimeString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  setConversations((prev) =>
                    prev.map((c) => {
                      if (c.id === activeConv.id) {
                        return {
                          ...c,
                          messages: [
                            ...c.messages,
                            {
                              id: `img-${Date.now()}`,
                              senderId: "user",
                              senderName: "Emily",
                              text: "書本內頁非常整潔，沒有任何缺頁！你可以看一下書況實拍內頁：",
                              imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp9QZ_5TQPO5y2TKSjgFpHHW57DVG-OAbpj3m37pFjBvh5IzuMCqswV9q5cjZXdddd2rZzGit7LEdaslBMqIknTdvZqtGJYoqyV7AHvJeQ-d4RgTDlRbnuphIHW9geGTiBRkKOWdBnMEqbps1nq7o8R1vB4j5BxLdKvcxZqZ_Ffnj2bAkiv202Dhl7oeGj-8Qya5nlpbkuO8P4342esZbbVXqEOaDahDBiUOralj4bJE6bhueHn-aa0MDW4bEPktKdPT5G43WPNG0",
                              timestamp,
                            },
                          ],
                          lastMessageTime: timestamp,
                        };
                      }
                      return c;
                    })
                  );
                }}
                className="p-2 text-outline hover:text-primary transition-colors cursor-pointer mr-1"
                title="發送內頁實照"
              >
                <span className="material-symbols-outlined text-lg">image</span>
              </button>

              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="p-2.5 bg-primary text-background disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Meeting Picker Modal (JSON-compliant popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
            <div className="p-6">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl font-bold text-primary">預約面交交換</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-outline">close</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Location Selection */}
                <div>
                  <label className="block font-sans text-xs font-bold text-outline mb-2 uppercase">選定面交地點</label>
                  <div className="flex items-center gap-3 bg-surface-container p-3 rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    <input
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      className="bg-transparent border-none text-xs sm:text-sm text-primary w-full focus:ring-0 focus:outline-none"
                      type="text"
                    />
                  </div>
                </div>

                {/* Date / Time Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-outline mb-2 uppercase">預定日期</label>
                    <div className="flex items-center gap-2 bg-surface-container p-3 rounded-xl border border-outline-variant/10">
                      <span className="material-symbols-outlined text-outline text-sm">event</span>
                      <input
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="bg-transparent border-none text-xs text-primary w-full focus:ring-0 focus:outline-none"
                        type="date"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-outline mb-2 uppercase">預定時間</label>
                    <div className="flex items-center gap-2 bg-surface-container p-3 rounded-xl border border-outline-variant/10">
                      <span className="material-symbols-outlined text-outline text-sm">schedule</span>
                      <input
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="bg-transparent border-none text-xs text-primary w-full focus:ring-0 focus:outline-none"
                        type="time"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#eff7ee] p-4 rounded-xl border border-secondary/15 flex items-start gap-2.5 mt-3 select-none">
                  <span className="material-symbols-outlined text-secondary text-base mt-0.5">info</span>
                  <p className="text-secondary font-sans text-[11px] leading-relaxed">
                    提案發送後，對方將會收到面交邀請通知，並可一鍵接受此面交，或於對話視窗中與您協調變更細節。
                  </p>
                </div>
              </div>

              <div className="mt-6 font-sans">
                <button
                  onClick={handleScheduleSubmit}
                  className="w-full bg-primary text-background hover:bg-primary-container p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg active:scale-98 transition-all cursor-pointer"
                >
                  發送面交相約邀請
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
