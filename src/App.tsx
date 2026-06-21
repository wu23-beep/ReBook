import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomeView from "./components/HomeView";
import BookDetailView from "./components/BookDetailView";
import ChatView from "./components/ChatView";
import ProfileView from "./components/ProfileView";
import ShelfView from "./components/ShelfView";
import { Book, FilterState } from "./types";
import { MOCK_BOOKS } from "./data";
import { fetchBooks, addBook } from "./lib/bookService";
import AiAssistantView from "./components/AiAssistantView";


interface AppProps {
  demoScene?: "scene-1" | "scene-2" | "scene-3" | "scene-4" | null;
}

export default function App({ demoScene = null }: AppProps) {
  const isRecordMode = !demoScene && new URLSearchParams(window.location.search).get("record") === "true";
  
  // Record console states
  const [recScene, setRecScene] = useState<"scene-1" | "scene-2" | "scene-3" | "scene-4">("scene-1");
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser"
        },
        audio: false
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rebook_promo_video.webm";
        a.click();
        
        // Stop all stream tracks
        stream.getTracks().forEach(track => track.stop());
        setRecording(false);
      };

      setRecording(true);
      setRecScene("scene-1");
      recorder.start();

      // Start scene sequence (each scene plays for 8.5 seconds)
      let current = 1;
      timerRef.current = setInterval(() => {
        current++;
        if (current > 4) {
          clearInterval(timerRef.current);
          recorder.stop();
        } else {
          setRecScene(`scene-${current}` as any);
        }
      }, 8500);

    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("啟動錄影失敗，請確認是否授予螢幕分享權限。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
    }
  };

  // Global Database state
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBooks();
      setBooks(data);
    } catch (err: any) {
      console.error("Failed to load books:", err);
      setError("連線至 Supabase 資料庫失敗，已為您載入預設的離線圖書資料。");
      setBooks(MOCK_BOOKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Controlled Demo Scene effect
  useEffect(() => {
    if (!demoScene) return;

    if (demoScene === "scene-1") {
      setActiveTab("home");
      setSelectedBook(null);
      setIsAiOpen(false);
      
      // Auto scroll the main content list to simulate scrolling in a video
      let timer: any;
      let scrollCount = 0;
      const scrollContainer = document.getElementById("app-main-content");
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
        timer = setInterval(() => {
          scrollCount += 2;
          scrollContainer.scrollTop = scrollCount;
          if (scrollCount >= 320) {
            clearInterval(timer);
            // Reverse scroll back up after a pause
            setTimeout(() => {
              timer = setInterval(() => {
                scrollCount -= 4;
                scrollContainer.scrollTop = scrollCount;
                if (scrollCount <= 0) {
                  clearInterval(timer);
                }
              }, 20);
            }, 1200);
          }
        }, 30);
      }
      return () => {
        if (timer) clearInterval(timer);
      };
    }

    if (demoScene === "scene-2") {
      setActiveTab("home");
      setSelectedBook(null);
      setIsAiOpen(false);
      // Open AI sidebar automatically after a short delay
      const timer = setTimeout(() => {
        setIsAiOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }

    if (demoScene === "scene-3") {
      setActiveTab("ai");
      setIsAiOpen(false);
      setSelectedBook(null);
    }

    if (demoScene === "scene-4") {
      setActiveTab("exchange");
      setIsAiOpen(false);
      setSelectedBook(null);
      // Select the first book for Alex Chen conversation
      const target = books.length > 0 ? books[0] : MOCK_BOOKS[0];
      setSelectedChatBook(target);
    }
  }, [demoScene, books]);

  // Custom Navigation state
  const [activeTab, setActiveTab] = useState<"home" | "shelf" | "exchange" | "profile" | "ai">("home");
  
  // Drill-down book selection state (Screen 2 details drawer)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Prefilled text message stream context passing variables
  const [chatPrefilledText, setChatPrefilledText] = useState<string>("");
  const [selectedChatBook, setSelectedChatBook] = useState<Book | null>(null);

  // Sub-tab / search filters communication
  const [homeFilters, setHomeFilters] = useState<FilterState | undefined>(undefined);

  // Floating AI drawer state
  const [isAiOpen, setIsAiOpen] = useState(false);



  // Dynamic book additions handler
  const handleAddBook = async (newBook: Omit<Book, "id">) => {
    try {
      setError(null);
      const insertedBook = await addBook(newBook);
      setBooks((prev) => [insertedBook, ...prev]);
    } catch (err: any) {
      console.error("Failed to add book:", err);
      alert("新增書籍至 Supabase 失敗，已為您新增至本機暫存：" + (err.message || err));
      const localBook: Book = {
        ...newBook,
        id: `local-${Date.now()}`
      };
      setBooks((prev) => [localBook, ...prev]);
    }
  };

  // Navigating to corresponding chat conversation with preset messages
  const handleStartChatFromDetail = (book: Book, initialMsg?: string) => {
    setSelectedBook(null); // Close detail drawer
    setSelectedChatBook(book); // Set active book chat target
    setChatPrefilledText(initialMsg || "");
    setActiveTab("exchange"); // switch view to chat
  };

  // Profile Action: View Listings trigger (filters Home with pre-populated dept settings)
  const handleSearchFilterApply = (field: string, value: string) => {
    setSelectedBook(null);
    if (field === "department") {
      setHomeFilters({
        searchQuery: "",
        school: "Select University",
        department: value,
        professor: "",
        condition: "All",
        minPrice: "",
        maxPrice: "",
        sortBy: "Relevance"
      });
      setActiveTab("home");
    }
  };

  // Navigating to detail directly from shelf active listings
  const handleSelectBookFromShelf = (book: Book) => {
    setSelectedBook(book);
    setActiveTab("home"); // Swaps tab context so details can render cleanly
  };

  // Primary rendering engine for tabs
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-primary space-y-4">
          <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
          <span className="text-sm font-sans font-bold text-outline">正在從 Supabase 載入資料庫書籍...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        if (selectedBook) {
          return (
            <BookDetailView
              book={selectedBook}
              onBack={() => setSelectedBook(null)}
              onStartChat={handleStartChatFromDetail}
            />
          );
        }
        return (
          <HomeView
            books={books}
            initialFilters={homeFilters}
            onSelectBook={(book) => setSelectedBook(book)}
            onInitiateExchange={(book) => {
              setSelectedChatBook(book);
              setChatPrefilledText("");
              setActiveTab("exchange");
            }}
          />
        );

      case "shelf":
        return (
          <ShelfView
            books={books}
            onAddBook={handleAddBook}
            onSelectBook={handleSelectBookFromShelf}
          />
        );

      case "exchange":
        return (
          <ChatView
            books={books}
            targetBook={selectedChatBook || undefined}
            customPrefilledText={chatPrefilledText}
            onBack={() => setActiveTab("home")}
            demoScene={demoScene}
          />
        );

      case "ai":
        return (
          <AiAssistantView
            books={books}
            onSelectBook={(book) => {
              setSelectedBook(book);
              setActiveTab("home");
            }}
            onStartChat={handleStartChatFromDetail}
            demoScene={demoScene}
          />
        );

      case "profile":
        return (
          <ProfileView
            onSearchFilterApply={handleSearchFilterApply}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center pt-20 text-outline italic">
            This workspace context is missing. Return home.
          </div>
        );
    }
  };

  // Render Record Console if in record mode
  if (isRecordMode) {
    const scenesInfo = {
      "scene-1": {
        title: "1. 讓課本開啟下一段旅程",
        subtitle: "ReBook 續頁 — 校園流轉大廳",
        description: "採用高雅學術藍與森林綠觸感現代美學設計，為學生教科書交易帶來最高雅精緻的市集體驗。首頁書籍會自動慢慢往下滾動展示。",
        subtitleText: "學期結束，書本有了溫度和故事..."
      },
      "scene-2": {
        title: "2. 隨時召喚：右側 AI 學術助理",
        subtitle: "自動隱藏懸浮按鈕 & 右側貼齊側欄",
        description: "右下角 AI 小助手按鈕自動點擊滑出。系統會模擬真實使用者在對話框內「自動打字」問句並發送，由 AI 助理給予即時對答推薦書籍。",
        subtitleText: "AI 智慧檢索，貼心給予購買星等建議..."
      },
      "scene-3": {
        title: "3. 省去大面積：大綱比對自動折疊",
        subtitle: "摺疊手風琴極大化對話空間",
        description: "自動轉入 AI 大綱比對頁面，以打字機打入演算法課程大綱並比對。畫面展示 RAG 診斷日誌，完成後上方輸入區會「自動折疊」以釋放空間。",
        subtitleText: "點擊「展開修改」按鈕即可隨時還原大綱框..."
      },
      "scene-4": {
        title: "4. 真實校園交易與圖片面交",
        subtitle: "內頁實照回覆 & 面交預約卡片",
        description: "進入與 Alex Chen 的交換訊息室。模擬使用者打字詢問書況並要實照，Alex 陳自動回覆內頁照。隨後自動觸發面交預約並成約，產生面交預約卡片。",
        subtitleText: "星期一中午台大活大面交，系統卡片已成立..."
      }
    };

    const currentSceneIndex = recScene === "scene-1" ? 0 : recScene === "scene-2" ? 1 : recScene === "scene-3" ? 2 : 3;

    return (
      <div className="fixed inset-0 bg-stone-950 flex items-center justify-center p-6 select-none font-sans text-on-surface">
        <div className="bg-surface-container-lowest border border-outline-variant/20 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[680px] overflow-hidden">
          
          {/* Left Side: Mobile Phone Mockup */}
          <div className="w-full md:w-[45%] bg-primary flex flex-col items-center justify-center p-6 relative border-r border-outline-variant/10">
            <div className="w-[300px] h-[580px] bg-stone-900 rounded-[40px] p-3 shadow-2xl border-4 border-stone-800 relative flex flex-col justify-between overflow-hidden">
              {/* Phone notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-stone-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-8 h-1 bg-stone-700 rounded-full"></div>
              </div>
              {/* Screen */}
              <div className="flex-grow bg-background rounded-[30px] overflow-hidden flex flex-col justify-between p-0 relative border border-stone-950">
                <App demoScene={recScene} />
              </div>
              {/* Home indicator */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-stone-600 rounded-full z-20"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-2 bg-secondary/15 blur-md rounded-full"></div>
          </div>

          {/* Right Side: Recording Control Panel */}
          <div className="flex-grow p-8 flex flex-col justify-between bg-surface-container-lowest">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-4">
                <span className="material-symbols-outlined text-red-500 text-2xl animate-pulse">videocam</span>
                <h2 className="font-serif font-bold text-primary text-lg">ReBook 宣傳展示影片錄製中心</h2>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 text-xs leading-relaxed text-outline-variant">
                <p className="font-bold text-primary mb-1">💡 錄影操作步驟：</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>點擊下方的 <strong>「🎬 開始錄影」</strong> 按鈕。</li>
                  <li>在 Chrome 彈出的分享畫面中，選擇 <strong>「Chrome 分頁」</strong>，並點選 <strong>「此分頁」</strong>。</li>
                  <li>勾選 <strong>「不要共用音訊」</strong> (如果有的話)，然後點選 <strong>「共用」</strong>。</li>
                  <li>系統會自動開始跑 4 大核心場景的自動化操作（共計 34 秒），並在錄製完成後，自動將宣傳影片以 <strong>rebook_promo_video.webm</strong> 格式下載至您的電腦！</li>
                </ol>
              </div>

              {/* Scene Details */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded-md self-start">
                  當前錄製場景：SCENE {currentSceneIndex + 1} / 4
                </span>
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-primary">{scenesInfo[recScene].title}</h4>
                  <p className="text-xs text-outline font-semibold">{scenesInfo[recScene].subtitle}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <p className="text-xs leading-relaxed text-on-surface-variant">{scenesInfo[recScene].description}</p>
                  <div className="mt-3 pt-2.5 border-t border-outline-variant/10 flex items-center gap-1.5 text-xs font-bold text-primary italic">
                    <span className="material-symbols-outlined text-sm">graphic_eq</span>
                    <span>旁白字幕：「{scenesInfo[recScene].subtitleText}」</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t border-outline-variant/10 pt-4 space-y-4">
              {/* Progress bar */}
              <div className="flex items-center gap-2 text-xs text-outline font-bold">
                <span>00:{currentSceneIndex * 8 < 10 ? "0" : ""}{currentSceneIndex * 8}</span>
                <div className="flex-grow h-1.5 bg-surface-container-high rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-red-500 transition-all duration-300"
                    style={{ width: `${((currentSceneIndex + 1) / 4) * 100}%` }}
                  ></div>
                </div>
                <span>00:32</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!recording ? (
                    <button
                      onClick={startRecording}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      <span>開始錄製宣傳影片</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 animate-pulse"
                    >
                      <span className="material-symbols-outlined text-sm">stop</span>
                      <span>停止錄製並下載</span>
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-outline font-semibold">
                  {recording ? "🔴 正在自動錄製中，請勿切換分頁..." : "⚪ 準備就緒"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background text-on-surface font-sans flex flex-col justify-between ${demoScene ? "h-full min-h-0 w-full overflow-hidden" : "min-h-screen"}`}>
      
      {/* Top Academic Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          // If swapping tabs, close details drawer by default for smooth transitions
          setSelectedBook(null);
          // Reset prefilled text to avoid contamination
          setChatPrefilledText("");
          
          if (tab === "home") {
            // keep previous custom filters or reset to all
            setHomeFilters(undefined);
          }
        }}
        onSearchPress={() => {
          setActiveTab("home");
          setSelectedBook(null);
          setHomeFilters(undefined);
          // Highlight search input focus
          setTimeout(() => {
            const inputEl = document.querySelector('input[placeholder*="Organic Chemistry"]');
            if (inputEl) {
              (inputEl as HTMLInputElement).focus();
            }
          }, 300);
        }}
      />

      {/* Main Dynamic View Layout */}
      <main id="app-main-content" className={`flex-grow pt-20 pb-24 md:pb-12 w-full transition-all duration-300 ${demoScene ? "overflow-y-auto overflow-x-hidden pt-16 pb-16" : ""}`}>
        {error && (
          <div className="max-w-[1280px] mx-auto px-4 md:px-10 mb-4 select-none animate-fade-in">
            <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </main>

      {/* Bottom Floating Navigation (Mobile Screen Context) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedBook(null);
          setChatPrefilledText("");
          
          if (tab === "home") {
            setHomeFilters(undefined);
          }
        }}
      />

      {/* Floating AI Assistant Widget Button (Only visible when AI panel is closed) */}
      {!isAiOpen && (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-40 select-none">
          <button
            onClick={() => setIsAiOpen(true)}
            className="w-14 h-14 bg-primary text-background rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-outline-variant/30 group relative"
            title="AI 學術小助手"
          >
            <span className="material-symbols-outlined text-2xl animate-pulse">smart_toy</span>
            {/* Tooltip on hover */}
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-primary text-background text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20">
              AI 智慧助理
            </span>
          </button>
        </div>
      )}

      {/* Right Sidebar AI Assistant Panel */}
      {isAiOpen && (
        <div className="fixed right-2 md:right-4 top-18 bottom-22 md:bottom-4 w-[calc(100vw-16px)] sm:w-[480px] bg-surface-container-lowest border border-outline-variant/30 shadow-2xl flex flex-col z-40 animate-in slide-in-from-right duration-300 overflow-hidden rounded-2xl">
          <AiAssistantView
            books={books}
            onSelectBook={(book) => {
              setSelectedBook(book);
              setActiveTab("home");
              setIsAiOpen(false);
            }}
            onStartChat={(book, msg) => {
              handleStartChatFromDetail(book, msg);
              setIsAiOpen(false);
            }}
            onClose={() => setIsAiOpen(false)}
            demoScene={demoScene}
          />
        </div>
      )}


      
    </div>
  );
}
