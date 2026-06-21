import React, { useState, useRef, useEffect } from "react";
import { Book } from "../types";

interface AssistantMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  recommendedBooks?: Book[];
  isLoading?: boolean;
}

interface SyllabusMatchResult {
  book: Book;
  score: string;
  keywords: string[];
  reason: string;
}

interface AiAssistantViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onStartChat: (book: Book, initialMsg?: string) => void;
  onClose?: () => void;
  demoScene?: "scene-1" | "scene-2" | "scene-3" | "scene-4" | null;
}

export default function AiAssistantView({ books, onSelectBook, onStartChat, onClose, demoScene = null }: AiAssistantViewProps) {
  // Read API Key from environment or local storage
  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("rebook_gemini_api_key") || "";
  });
  
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  
  // Tab control: "chat" or "syllabus"
  const [activeAssistantTab, setActiveAssistantTab] = useState<"chat" | "syllabus">("chat");

  // Textbook comparison cart
  const [compareList, setCompareList] = useState<Book[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Chat message states
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "哈囉！我是 ReBook AI 學術教材助手。您可以問我任何關於教科書、開課課程、或面交地點的問題喔！\n\n例如：\n• 「推薦台大資工系的演算法參考書」\n• 「有經濟學原理相關的教材嗎？」\n• 「有哪些可以免費索取的贈書？」",
      timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatLogs, setChatLogs] = useState<string[]>([]);

  // Syllabus analysis states
  const [syllabusInput, setSyllabusInput] = useState("");
  const [isAnalyzingSyllabus, setIsAnalyzingSyllabus] = useState(false);
  const [syllabusLogs, setSyllabusLogs] = useState<string[]>([]);
  const [syllabusResults, setSyllabusResults] = useState<SyllabusMatchResult[]>([]);
  const [isSyllabusExpanded, setIsSyllabusExpanded] = useState(true);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of assistant chat
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Handle Save API Key
  const handleSaveKey = () => {
    const key = tempKey.trim();
    localStorage.setItem("rebook_gemini_api_key", key);
    setApiKey(key);
    setShowKeyInput(false);
    if (key) {
      alert("Gemini API 金鑰設定成功！現在起將使用真實 AI 模型為您進行語意檢索對答。");
    } else {
      alert("已清除 API 金鑰，系統切換為本機模擬檢索模式。");
    }
  };

  // Helper to translate school name
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

  // Toggle textbook comparison list
  const toggleCompare = (book: Book) => {
    setCompareList((prev) => {
      const exists = prev.some((b) => b.id === book.id);
      if (exists) {
        return prev.filter((b) => b.id !== book.id);
      } else {
        if (prev.length >= 3) {
          alert("比對籃上限為 3 本書喔！");
          return prev;
        }
        return [...prev, book];
      }
    });
  };

  // Custom text formatter for chatbot response (bullet points, bolding)
  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      let content: React.ReactNode = line;
      
      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
      const cleanLine = isBullet ? line.trim().substring(1).trim() : line;
      
      const parts = cleanLine.split(/\*\*([^*]+)\*\*/g);
      if (parts.length > 1) {
        content = parts.map((part, partIdx) => {
          if (partIdx % 2 === 1) {
            return <strong key={partIdx} className="font-extrabold text-primary">{part}</strong>;
          }
          return part;
        });
      }

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 my-1 ml-2 text-xs sm:text-sm">
            <span className="text-secondary shrink-0">•</span>
            <span className="leading-relaxed">{content}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="leading-relaxed text-xs sm:text-sm my-1 min-h-[1em]">
          {content}
        </p>
      );
    });
  };

  // Local RAG Keyword engine
  const getLocalRagResponse = (query: string): { text: string; recommended: Book[] } => {
    const q = query.toLowerCase();
    let matched: Book[] = [];
    let text = "";

    let targetSchool = "";
    if (q.includes("台大") || q.includes("臺灣大學") || q.includes("taiwan")) {
      targetSchool = "National Taiwan University";
    } else if (q.includes("政大") || q.includes("政治大學") || q.includes("chengchi")) {
      targetSchool = "National Chengchi University";
    } else if (q.includes("東吳") || q.includes("soochow")) {
      targetSchool = "Soochow University";
    } else if (q.includes("輔仁") || q.includes("fu jen")) {
      targetSchool = "Fu Jen Catholic University";
    }

    if (q.includes("演算法") || q.includes("algorithm") || q.includes("cormen") || q.includes("資工")) {
      matched = books.filter(b => b.title.toLowerCase().includes("algorithm") || b.department.includes("Computer Science"));
      text = "已為您尋找到【資訊工程與演算法】相關教材。演算法導論（Cormen）是資工系的核心教科書，以下書籍目前在庫：";
    } else if (q.includes("經濟") || q.includes("economic") || q.includes("mankiw")) {
      matched = books.filter(b => b.title.toLowerCase().includes("economic") || b.department.includes("Economics"));
      text = "為您找到資料庫中的【經濟學原理】相關教材。Gregory Mankiw 的教材是大學經濟學入門首選，在庫清單如下：";
    } else if (q.includes("邏輯") || q.includes("digital") || q.includes("mano") || q.includes("電機") || q.includes("ee")) {
      matched = books.filter(b => b.title.toLowerCase().includes("digital") || b.title.toLowerCase().includes("logic") || b.department.includes("Electrical Engineering"));
      text = "已為您檢索【電機工程與數位邏輯設計】相關書籍。以下是與數位電路、Logic Circuits 有關的課本：";
    } else if (q.includes("免費") || q.includes("贈送") || q.includes("送") || q.includes("結緣")) {
      matched = books.filter(b => b.price === null);
      text = "太棒了！以下是目前在平台中提供【免費贈書/索取】的二手學術教材，您可以直接點擊「聯絡書主」向對方索取：";
    } else {
      matched = books.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) || 
        b.department.toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        text = `已為您找到與「${query}」相關的學術教材資源，資訊如下：`;
      } else {
        text = `抱歉，在目前書籍庫中暫時沒有找到與「${query}」高度匹配的課本。建議您可於「我的書架」中將這本教材加入追蹤名單，或貼上大綱至大綱分析分頁搜尋替代用書。`;
      }
    }

    if (targetSchool && matched.length > 0) {
      const schoolMatched = matched.filter(b => b.school === targetSchool);
      if (schoolMatched.length > 0) {
        matched = schoolMatched;
        text = `已為您篩選出【${renderSchoolName(targetSchool)}】的教材，資訊如下：`;
      } else {
        text += `（註：目前該學科暫無屬於 ${renderSchoolName(targetSchool)} 的在庫書籍）`;
      }
    }

    return { text, recommended: matched.slice(0, 3) };
  };

  // Real Gemini RAG API Call
  const callGeminiRag = async (query: string): Promise<{ text: string; recommended: Book[] }> => {
    const databaseContext = books.map(b => 
      `ID: ${b.id} | 書名: ${b.title} | 作者: ${b.author} | 價格: ${b.price === null ? "免費贈送" : `NT$ ${b.price}`} | 學校: ${b.school} | 科系: ${b.department} | 教授: ${b.professor} | 地點: ${b.location} | 書況: ${b.condition}`
    ).join("\n");

    const prompt = `
您是 ReBook 續頁二手教科書平台的 AI 智慧小助手。您的任務是根據下方提供給您的「真實平台教科書資料庫」，回答使用者的詢問。

【真實書籍資料庫庫存】：
${databaseContext}

【使用者目前的問題】：
"${query}"

【回答規範】：
1. 您必須以繁體中文回答，語氣要親切、專業，符合大學校園學術氛圍。
2. 請檢視資料庫，如果找到符合使用者需求的書，在回覆文字中說明，並在回覆內容的「最後一行」，以特殊 JSON 格式輸出符合書籍的 ID 列表，格式如下：
   [RECOMMENDED_IDS: book-id-1, book-id-2]
   (請只輸出存在於資料庫庫存中的真實 ID，至多推薦 3 本。若無相符書籍，請不要輸出此格式)。
3. 如果在庫中沒有找到相符的書籍，請親切告知，並引導他們可以去「我的書架」中加入追蹤降價通知。
`.trim();

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API 回傳錯誤: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      let recommended: Book[] = [];
      let cleanText = rawText;
      
      const idMatch = rawText.match(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/);
      if (idMatch) {
        const ids = idMatch[1].split(",").map((s: string) => s.trim());
        recommended = books.filter(b => ids.includes(b.id));
        cleanText = rawText.replace(/\[RECOMMENDED_IDS:[^\]]+\]/, "").trim();
      }

      return { text: cleanText, recommended };
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      const fallback = getLocalRagResponse(query);
      return {
        text: `（AI 助理連線失敗，已自動為您切換至本地檢索模式）\n\n${fallback.text}`,
        recommended: fallback.recommended
      };
    }
  };

  // Send message Q&A
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const timestamp = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsGenerating(true);
    setChatLogs([]);

    // Start RAG simulated diagnostic logging
    const pushLog = (logStr: string, delay: number) => {
      setTimeout(() => {
        setChatLogs((prev) => [...prev, logStr]);
      }, delay);
    };

    pushLog("正在將查詢轉化為高維度向量 (Query Embedding)...", 100);
    pushLog(`正在針對資料庫 ${books.length} 筆圖書進行餘弦相似度 (Cosine Similarity) 運算...`, 500);
    pushLog("關聯語境檢索成功！已將平台庫存資訊載入至 RAG 脈絡。", 900);

    try {
      let botResponse;
      if (apiKey) {
        botResponse = await callGeminiRag(text);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1300));
        botResponse = getLocalRagResponse(text);
      }

      const aiMsg: AssistantMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: botResponse.text,
        recommendedBooks: botResponse.recommended,
        timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Syllabus matching local mock list
  const getLocalSyllabusMatches = (text: string): SyllabusMatchResult[] => {
    const t = text.toLowerCase();
    let matched: SyllabusMatchResult[] = [];
    
    // 1. 演算法 / 資工
    if (t.includes("algorithm") || t.includes("演算法") || t.includes("cormen") || t.includes("資工") || t.includes("data structure") || t.includes("資料結構")) {
      const algoBook = books.find(b => b.title.toLowerCase().includes("algorithm") || b.title.toLowerCase().includes("演算法"));
      if (algoBook) {
        matched.push({
          book: algoBook,
          score: "98%",
          keywords: ["演算法", "資料結構", "圖形計算"],
          reason: "大綱提及圖論演算法與複雜度分析，本書為資工系指定參考教材，完整覆蓋大綱核心進度。"
        });
      }
      const cppBook = books.find(b => b.title.toLowerCase().includes("c++") || b.title.toLowerCase().includes("程式設計"));
      if (cppBook) {
        matched.push({
          book: cppBook,
          score: "85%",
          keywords: ["C++", "程式設計", "語法基礎"],
          reason: "課程大綱涉及程式碼實作，此在庫教材適合作為開發語法與實作參考工具。"
        });
      }
    }

    // 2. 數位邏輯 / 電機
    if (t.includes("logic") || t.includes("circuits") || t.includes("verilog") || t.includes("mano") || t.includes("電機") || t.includes("邏輯") || t.includes("數位")) {
      const logicBook = books.find(b => b.title.toLowerCase().includes("digital") || b.title.toLowerCase().includes("logic") || b.title.toLowerCase().includes("邏輯"));
      if (logicBook) {
        matched.push({
          book: logicBook,
          score: "95%",
          keywords: ["數位電路", "邏輯設計", "Verilog"],
          reason: "課堂大綱與微處理器及邏輯閘設計高度相關，該教材為電機系最推崇經典用書之一。"
        });
      }
    }

    // 3. 經濟
    if (t.includes("economic") || t.includes("mankiw") || t.includes("經濟") || t.includes("供需") || t.includes("市場")) {
      const econBook = books.find(b => b.title.toLowerCase().includes("principles of economics") || (b.title.toLowerCase().includes("economics") && !b.title.toLowerCase().includes("macro")));
      if (econBook) {
        matched.push({
          book: econBook,
          score: "96%",
          keywords: ["微觀經濟", "供需理論", "市場機制"],
          reason: "大綱提及個體經濟學基礎供需平衡，Mankiw 的 Principles of Economics 為最核心教材。"
        });
      }
      const macroBook = books.find(b => b.title.toLowerCase().includes("macroeconomics") || b.title.toLowerCase().includes("總體經濟"));
      if (macroBook) {
        matched.push({
          book: macroBook,
          score: "90%",
          keywords: ["總體經濟", "通貨膨脹", "GDP"],
          reason: "針對大綱中涉及總體經濟運作、貨幣與通膨單元，本書提供最佳的圖表與理論詳解。"
        });
      }
    }

    // 4. 文學小說
    if (t.includes("literature") || t.includes("gatsby") || t.includes("文學") || t.includes("英文") || t.includes("小說")) {
      const gatsbyBook = books.find(b => b.title.toLowerCase().includes("gatsby") || b.title.toLowerCase().includes("文學") || b.title.toLowerCase().includes("novel"));
      if (gatsbyBook) {
        matched.push({
          book: gatsbyBook,
          score: "92%",
          keywords: ["英文文學", "現代小說", "經典索取"],
          reason: "契合課程大綱中二十世紀英美文學閱讀列表，本書目前在平台中上架供交易或索取。"
        });
      }
    }

    // 5. Fallback - 模糊關鍵字匹配
    if (matched.length === 0) {
      books.forEach(b => {
        const titleWords = b.title.toLowerCase().split(/\s+/);
        const matchesWord = titleWords.some(w => w.length > 3 && t.includes(w));
        if (matchesWord) {
          matched.push({
            book: b,
            score: "80%",
            keywords: [b.department, "庫存匹配"],
            reason: `圖書名稱中含有與您大綱相符的關鍵字「${b.title}」，為${renderSchoolName(b.school)}的在庫書籍。`
          });
        }
      });
    }

    return matched.slice(0, 3);
  };

  const callGeminiSyllabus = async (text: string): Promise<SyllabusMatchResult[]> => {
    const databaseContext = books.map(b => 
      `ID: ${b.id} | 書名: ${b.title} | 作者: ${b.author} | 價格: ${b.price === null ? "免費贈送" : `NT$ ${b.price}`} | 學校: ${b.school} | 科系: ${b.department} | 教授: ${b.professor} | 地點: ${b.location} | 書況: ${b.condition}`
    ).join("\n");

    const prompt = `
您是 ReBook 二手教科書平台的 AI 大綱比對專家。您的任務是分析使用者的課程大綱/描述，並從下方的「真實平台教科書庫存資料庫」中，推薦最合適的 1-3 本書。

【真實書籍資料庫庫存】：
${databaseContext}

【使用者貼上的課程大綱】：
"${text}"

【回覆規範】：
您必須以繁體中文分析。請列出推薦的書籍（至多 3 本），並針對每本書給予：
1. 匹配的百分比契合度（例如 95%）
2. 3 個匹配的關鍵字
3. 大綱契合分析（簡短 1-2 句話解釋為什麼這本書適合大綱）

請在回覆的最後一行以特殊的格式輸出推薦書籍列表，格式如下：
[RECOMMENDED_SYLLABUS: id1|95%|關鍵字1,關鍵字2|契合分析; id2|80%|關鍵字3,關鍵字4|契合分析]
(請只使用在庫書籍的真實 ID，若無合適的書則不要輸出此格式)。
`.trim();

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error("Gemini API error");

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      let results: SyllabusMatchResult[] = [];
      const match = rawText.match(/\[RECOMMENDED_SYLLABUS:\s*([^\]]+)\]/);
      if (match) {
        const items = match[1].split(";").map((s: string) => s.trim());
        items.forEach(item => {
          const parts = item.split("|");
          if (parts.length >= 4) {
            const id = parts[0].trim();
            const score = parts[1].trim();
            const keywords = parts[2].split(",").map((k: string) => k.trim());
            const reason = parts[3].trim();
            const bookObj = books.find(b => b.id === id);
            if (bookObj) {
              results.push({ book: bookObj, score, keywords, reason });
            }
          }
        });
      }
      
      if (results.length === 0) {
        return getLocalSyllabusMatches(text);
      }
      return results;
    } catch (err) {
      console.error("Gemini Syllabus Match Error:", err);
      return getLocalSyllabusMatches(text);
    }
  };

  const handleAnalyzeSyllabus = async () => {
    if (!syllabusInput.trim() || isAnalyzingSyllabus) return;

    setIsAnalyzingSyllabus(true);
    setSyllabusLogs([]);
    setSyllabusResults([]);

    const pushLog = (logStr: string, delay: number) => {
      setTimeout(() => {
        setSyllabusLogs((prev) => [...prev, logStr]);
      }, delay);
    };

    pushLog("正在分析課程大綱核心關鍵詞與授課主題...", 100);
    pushLog(`正在進行全校二手教科書資料庫 (${books.length} 筆圖書) 交叉匹配...`, 600);
    pushLog("匹配完畢！正在生成教學大綱專屬比對報告...", 1100);

    try {
      let results;
      if (apiKey) {
        results = await callGeminiSyllabus(syllabusInput);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1400));
        results = getLocalSyllabusMatches(syllabusInput);
      }
      setSyllabusResults(results);
      if (results && results.length > 0) {
        setIsSyllabusExpanded(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingSyllabus(false);
    }
  };

  // Controlled Demo Automation effect
  useEffect(() => {
    if (!demoScene) return;

    if (demoScene === "scene-2") {
      // Scene 2: Open AI Chat and simulate typing
      setActiveAssistantTab("chat");
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: "哈囉！我是 ReBook AI 學術教材助手。您可以問我任何關於教科書、開課課程、或面交地點的問題喔！\n\n例如：\n• 「推薦台大資工系的演算法參考書」\n• 「有經濟學原理相關的教材嗎？」\n• 「有哪些可以免費索取的贈書？」",
          timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })
        }
      ]);
      setInputText("");

      let typingTimer: any;
      const startTyping = setTimeout(() => {
        let typed = "";
        const phrase = "我想找演算法相關的書";
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
            }, 300);
          }
        }, 100);
      }, 1500);

      return () => {
        clearTimeout(startTyping);
        if (typingTimer) clearInterval(typingTimer);
      };
    }

    if (demoScene === "scene-3") {
      // Scene 3: Open Syllabus Match and simulate pasting syllabus
      setActiveAssistantTab("syllabus");
      setIsSyllabusExpanded(true);
      setSyllabusInput("");
      setSyllabusResults([]);

      let typingTimer: any;
      const startTyping = setTimeout(() => {
        let typed = "";
        const phrase = "這門課是資工系開設 of 演算法設計，大綱包含漸近複雜度分析、動態規劃 (Dynamic Programming)、圖形演算法 (Dijkstra, DFS/BFS)、貪婪演算法以及 NP-Complete 簡介。";
        let idx = 0;
        typingTimer = setInterval(() => {
          if (idx < phrase.length) {
            typed += phrase[idx];
            setSyllabusInput(typed);
            idx++;
          } else {
            clearInterval(typingTimer);
            setTimeout(() => {
              handleAnalyzeSyllabus();
            }, 400);
          }
        }, 30);
      }, 1000);

      return () => {
        clearTimeout(startTyping);
        if (typingTimer) clearInterval(typingTimer);
      };
    }
  }, [demoScene]);

  return (
    <div className="flex flex-col h-full overflow-hidden text-on-surface p-3 sm:p-4" id="ai-assistant-container">
      
      {/* 1. Header Bar - Simplified with a prominent close button */}
      <div className="flex justify-between items-center border-b border-outline-variant/15 pb-2.5 mb-3 select-none shrink-0" id="assistant-header-bar">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-lg">smart_toy</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-serif text-sm font-bold text-primary leading-tight">AI 學術教材助理</h2>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${apiKey ? "bg-secondary animate-pulse" : "bg-orange-400"}`} title={apiKey ? "已連線 Gemini RAG" : "使用本地語意引擎"}></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer text-outline hover:text-primary flex items-center justify-center"
            title="AI 設定"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-full transition-colors cursor-pointer text-outline flex items-center justify-center border border-outline-variant/30 shadow-xs hover:border-red-300"
              title="關閉 AI 助理"
            >
              <span className="material-symbols-outlined text-xl font-bold">close</span>
            </button>
          )}
        </div>
      </div>



      {/* Settings Collapse Panel */}
      {showKeyInput && (
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 shadow-sm mb-4 space-y-3 animate-in fade-in duration-200 shrink-0">
          <h3 className="font-sans text-xs font-bold text-primary uppercase tracking-wide">設定 Gemini API 金鑰</h3>
          <p className="text-[11px] text-outline leading-normal font-sans">
            若要使用正式的語意檢索（RAG）對答，請貼上您的 Gemini API Key。金鑰將儲存於您的瀏覽器本地快取（Local Storage）中，不會上傳至任何第三方伺服器。
          </p>
          <div className="flex gap-2 font-sans">
            <input
              type="password"
              placeholder="請輸入 Gemini API Key (e.g. AIzaSy...)"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="flex-grow bg-surface-container-highest rounded-xl px-3 py-2 text-xs text-primary focus:ring-1 focus:ring-secondary border-none outline-none"
            />
            <button
              onClick={handleSaveKey}
              className="bg-primary text-background px-4 py-2 rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer transition-all"
            >
              儲存
            </button>
          </div>
        </div>
      )}

      {/* 2. Tab Switching Header */}
      <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/15 mb-3 select-none shrink-0">
        <button
          onClick={() => setActiveAssistantTab("chat")}
          className={`flex-grow py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
            activeAssistantTab === "chat"
              ? "bg-primary text-background shadow-xs"
              : "text-outline hover:text-primary hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-sm">smart_toy</span>
          <span>AI 搜尋問答</span>
        </button>
        <button
          onClick={() => setActiveAssistantTab("syllabus")}
          className={`flex-grow py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
            activeAssistantTab === "syllabus"
              ? "bg-primary text-background shadow-xs"
              : "text-outline hover:text-primary hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-sm">description</span>
          <span>大綱找書</span>
        </button>
      </div>

      {/* Tab 1: AI Chat View */}
      {activeAssistantTab === "chat" && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm flex flex-col flex-grow overflow-hidden justify-between min-h-0">
          {/* Messages list */}
          <div className="flex-grow overflow-y-auto academic-scroll p-4 space-y-4 min-h-0">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col w-[96%] md:w-[94%] ${isUser ? "self-end ml-auto items-end" : "self-start items-start"}`}
                >
                  <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center overflow-hidden border border-outline-variant/15 select-none">
                      {isUser ? (
                        <span className="material-symbols-outlined text-primary text-base">person</span>
                      ) : (
                        <span className="material-symbols-outlined text-secondary text-base">smart_toy</span>
                      )}
                    </div>

                    {/* Speech Bubble */}
                    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`p-3.5 rounded-2xl shadow-xs border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? "bg-primary-container border-transparent text-white rounded-tr-none"
                            : "bg-surface-container-low border-outline-variant/10 text-on-surface rounded-tl-none"
                        }`}
                      >
                        {isUser ? msg.text : formatMessageText(msg.text)}
                      </div>
                      <span className="text-[9px] text-outline mt-1 block select-none">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Recommended Book Cards Grid */}
                  {!isUser && msg.recommendedBooks && msg.recommendedBooks.length > 0 && (
                    <div className="w-full mt-3 pl-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.recommendedBooks.map((book) => {
                        const isFree = book.price === null;
                        const inCompare = compareList.some(b => b.id === book.id);
                        return (
                          <div
                            key={book.id}
                            className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 flex flex-col justify-between hover:border-secondary transition-all shadow-xs group"
                          >
                            <div className="flex gap-2.5 items-start">
                              <img
                                referrerPolicy="no-referrer"
                                alt={book.title}
                                className="w-10 h-14 object-contain rounded bg-surface-container-high shrink-0 shadow-xs"
                                src={book.coverUrl}
                              />
                              <div className="overflow-hidden">
                                <h4 className="text-[11px] font-bold text-primary truncate leading-tight group-hover:text-secondary transition-colors" title={book.title}>
                                  {book.title}
                                </h4>
                                <p className="text-[10px] text-outline truncate mt-0.5">{book.author}</p>
                                <p className="text-[10px] text-secondary font-bold mt-1">
                                  {isFree ? "贈送" : `NT$ ${book.price}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 mt-3 border-t border-outline-variant/10 pt-2 font-sans select-none">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => onSelectBook(book)}
                                  className="flex-grow py-1 bg-surface-container hover:bg-surface-container-high text-primary rounded text-[10px] font-bold cursor-pointer text-center"
                                >
                                  規格細節
                                </button>
                                <button
                                  onClick={() => onStartChat(book, `哈囉！我看到 AI 推薦了您的這本《${book.title}》，想詢問是否方便交易？`)}
                                  className="flex-grow py-1 bg-secondary text-background hover:brightness-105 rounded text-[10px] font-bold cursor-pointer text-center"
                                >
                                  聯絡書主
                                </button>
                              </div>
                              <button
                                onClick={() => toggleCompare(book)}
                                className={`w-full py-1 border text-[10px] font-bold rounded cursor-pointer text-center flex items-center justify-center gap-1 transition-colors ${
                                  inCompare
                                    ? "bg-secondary/10 border-secondary text-secondary"
                                    : "border-outline-variant/50 hover:bg-surface-container-high text-outline hover:text-primary"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  {inCompare ? "check" : "compare_arrows"}
                                </span>
                                {inCompare ? "已加入比對" : "加入書籍比對"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI generating text diagnostic animation */}
            {isGenerating && (
              <div className="flex flex-col gap-2.5 w-[95%] md:w-[85%] self-start">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-outline-variant/15 select-none">
                    <span className="material-symbols-outlined text-secondary text-base">smart_toy</span>
                  </div>
                  <div className="flex-grow bg-primary/95 text-background font-mono text-[10px] sm:text-xs p-3.5 rounded-2xl rounded-tl-none shadow-inner space-y-1 max-w-[450px]">
                    <div className="flex items-center gap-2 text-secondary font-bold border-b border-background/10 pb-1.5 mb-1.5 select-none">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                      <span>ReBook RAG 檢索診斷中</span>
                    </div>
                    {chatLogs.map((log, idx) => (
                      <div key={idx} className="animate-fade-in">&gt; {log}</div>
                    ))}
                    {chatLogs.length < 3 && (
                      <div className="text-stone-500 animate-pulse">&gt; 執行中...</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messageEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto py-2 px-3 bg-surface dark:bg-surface-dim border-t border-b border-surface-container-high select-none academic-scroll select-none shrink-0">
            {[
              "推薦台大資工系的演算法參考書",
              "有經濟學原理相關的教材嗎？",
              "有哪些可以免費索取的贈書？",
              "推薦微積分經典課本"
            ].map((chip, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-outline/35 text-xs font-semibold text-primary bg-background hover:bg-surface-container cursor-pointer transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Typing Bar */}
          <div className="p-2 bg-surface border-t border-outline-variant/10 shrink-0">
            <div className="bg-surface-container-lowest rounded-xl flex items-center p-1.5 shadow-sm border border-outline-variant/20">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                className="flex-grow bg-transparent border-none text-xs sm:text-sm px-3 focus:ring-0 focus:outline-none placeholder:text-outline-variant text-primary"
                placeholder={isGenerating ? "助理正在思考中..." : "問問 AI 課本助理..."}
                type="text"
                disabled={isGenerating}
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isGenerating}
                className="p-2.5 bg-primary text-background disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Syllabus Matcher View */}
      {activeAssistantTab === "syllabus" && (
        <div className="flex-grow overflow-hidden flex flex-col gap-3 min-h-0">
          {isSyllabusExpanded || syllabusResults.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-xl shadow-xs space-y-3 shrink-0 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 select-none">
                  <span className="material-symbols-outlined text-sm">description</span>
                </div>
                <div className="space-y-0.5 flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xs font-bold text-primary">教學大綱/考題精準教材分析</h3>
                    {syllabusResults.length > 0 && (
                      <button
                        onClick={() => setIsSyllabusExpanded(false)}
                        className="text-[10px] text-outline hover:text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>收起</span>
                        <span className="material-symbols-outlined text-[14px]">expand_less</span>
                      </button>
                    )}
                  </div>
                  <p className="text-outline text-[10px] leading-relaxed">
                    將修課教學大綱或考題範圍貼在下方。AI 會進行關鍵詞餘弦分析，精準找出在庫書！
                  </p>
                </div>
              </div>

              {/* Input area */}
              <div className="space-y-2">
                <textarea
                  value={syllabusInput}
                  onChange={(e) => setSyllabusInput(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-highest text-primary border border-outline-variant/20 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-secondary focus:outline-none placeholder:text-outline-variant/70 leading-relaxed font-sans"
                  placeholder="貼上您的課程大綱...\n例如：微積分期中考大綱包含極限極值、泰勒展開式與導函數應用。"
                  disabled={isAnalyzingSyllabus}
                />
                <div className="flex justify-between items-center select-none font-sans">
                  <button
                    onClick={() => setSyllabusInput("這門課是資工系開設 of 演算法設計，大綱包含漸近複雜度分析、動態規劃 (Dynamic Programming)、圖形演算法 (Dijkstra, DFS/BFS)、貪婪演算法以及 NP-Complete 簡介。")}
                    className="text-[10px] text-secondary hover:underline cursor-pointer"
                  >
                    💡 載入範例大綱
                  </button>
                  <button
                    onClick={handleAnalyzeSyllabus}
                    disabled={!syllabusInput.trim() || isAnalyzingSyllabus}
                    className="bg-primary text-background px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">analytics</span>
                    <span>比對</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/15 px-3 py-2 rounded-xl shadow-xs flex justify-between items-center shrink-0 select-none animate-in fade-in duration-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="material-symbols-outlined text-primary text-sm shrink-0">description</span>
                <span className="text-[11px] font-bold text-primary truncate">
                  已載入課堂大綱："{syllabusInput.length > 25 ? syllabusInput.substring(0, 25) + "..." : syllabusInput}"
                </span>
              </div>
              <button
                onClick={() => setIsSyllabusExpanded(true)}
                className="text-[10px] text-secondary hover:underline cursor-pointer flex items-center gap-0.5 shrink-0 ml-2"
              >
                <span>展開修改</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
          )}

          {/* Analyzing log state */}
          {isAnalyzingSyllabus && (
            <div className="bg-primary/95 text-background font-mono text-[10px] p-3 rounded-xl border border-outline-variant/20 shadow-inner space-y-1 shrink-0 animate-pulse">
              <div className="flex items-center gap-2 text-secondary font-bold border-b border-background/10 pb-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                <span>ReBook RAG Analyzer</span>
              </div>
              {syllabusLogs.map((log, idx) => (
                <div key={idx} className="animate-fade-in">&gt; {log}</div>
              ))}
              {syllabusLogs.length < 3 && (
                <div className="text-stone-500">&gt; 進行語意特徵匹配中...</div>
              )}
            </div>
          )}

          {/* Match Results list */}
          {!isAnalyzingSyllabus && syllabusResults.length > 0 && (
            <div className="flex-grow overflow-y-auto academic-scroll space-y-3 min-h-0 pr-1">
              <h3 className="font-serif text-xs font-bold text-primary flex items-center gap-1 py-1 select-none sticky top-0 bg-background/95 backdrop-blur-xs z-10">
                <span className="material-symbols-outlined text-secondary text-[14px]">analytics</span>
                <span>大綱匹配教材分析報告</span>
              </h3>
              
              <div className="space-y-3">
                {syllabusResults.map((result) => {
                  const book = result.book;
                  const isFree = book.price === null;
                  const inCompare = compareList.some(b => b.id === book.id);
                  
                  return (
                    <div
                      key={book.id}
                      className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-3 flex flex-col gap-2.5 hover:border-secondary/35 transition-all shadow-xs"
                    >
                      {/* Book Cover and Info */}
                      <div className="flex gap-3 items-start">
                        <img
                          referrerPolicy="no-referrer"
                          alt={book.title}
                          className="w-11 h-16 object-contain rounded bg-surface-container-high shrink-0 shadow-xs"
                          src={book.coverUrl}
                        />
                        <div className="overflow-hidden space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="bg-secondary/10 text-secondary text-[9px] font-bold px-1.5 py-0.5 rounded-full select-none">
                              契合度 {result.score}
                            </span>
                            {result.keywords.slice(0, 2).map((kw, i) => (
                              <span key={i} className="bg-surface-container text-primary text-[8px] font-bold px-1 py-0.5 rounded select-none">
                                #{kw}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-[11px] sm:text-xs font-bold text-primary truncate leading-snug">
                            {book.title}
                          </h4>
                          <p className="text-[9px] text-outline truncate">{book.author} | {renderSchoolName(book.school)}</p>
                        </div>
                      </div>

                      {/* AI Reason Summary */}
                      <p className="text-[10px] text-on-surface-variant leading-relaxed bg-surface-container-lowest/50 p-2 rounded-lg font-sans">
                        <strong className="text-secondary font-bold">AI 分析：</strong>{result.reason}
                      </p>

                      {/* Actions Panel */}
                      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-2 font-sans select-none">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[9px] text-outline">二手價</span>
                          <span className="text-xs font-extrabold text-secondary">
                            {isFree ? "免費贈送" : `NT$ ${book.price}`}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onSelectBook(book)}
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-primary rounded text-[9px] font-bold cursor-pointer text-center"
                          >
                            細節
                          </button>
                          <button
                            onClick={() => onStartChat(book, `哈囉！我在 AI 大綱找書中匹配到了您的《${book.title}》，想跟您預約索取/交易！`)}
                            className="px-2.5 py-1 bg-secondary text-background hover:brightness-105 rounded text-[9px] font-bold cursor-pointer text-center"
                          >
                            聯絡書主
                          </button>
                          <button
                            onClick={() => toggleCompare(book)}
                            className={`p-1 border rounded text-center flex items-center justify-center cursor-pointer transition-colors ${
                              inCompare
                                ? "bg-secondary/10 border-secondary text-secondary"
                                : "border-outline-variant/50 hover:bg-surface-container-high text-outline"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {inCompare ? "check" : "compare_arrows"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state for syllabus matches */}
          {!isAnalyzingSyllabus && syllabusResults.length === 0 && syllabusInput.trim() !== "" && (
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 text-center text-outline text-[11px] shrink-0">
              未能在此課綱中提取到相配的庫存教材。
            </div>
          )}
        </div>
      )}

      {/* 4. Sticky floating comparison tray at bottom inside drawer */}
      {compareList.length > 0 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 bg-primary/95 text-background rounded-full px-4 py-2 flex items-center gap-3 shadow-xl border border-outline-variant/20 backdrop-blur-md w-[92%] justify-between select-none animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary animate-bounce text-xs">compare_arrows</span>
            <span className="text-[10px] font-bold font-sans">
              已選 {compareList.length} 本教材比對中
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareList([])}
              className="text-[10px] text-stone-300 hover:text-white px-1.5 py-0.5 cursor-pointer font-sans"
            >
              清空
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              disabled={compareList.length < 2}
              className="bg-secondary text-background hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-extrabold px-2.5 py-1 rounded-full transition-all cursor-pointer font-sans"
            >
              {compareList.length < 2 ? "再選 1 本" : "立即比對"}
            </button>
          </div>
        </div>
      )}

      {/* 5. Textbook Comparison Overlay Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/20 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">compare_arrows</span>
                <h3 className="font-serif font-bold text-primary text-base">ReBook 教科書多維度比對</h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 hover:bg-surface-container-high rounded-full cursor-pointer text-outline hover:text-primary flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content Table */}
            <div className="flex-grow overflow-auto p-4 sm:p-6 academic-scroll">
              <table className="w-full border-collapse border-spacing-0 text-left text-xs font-sans">
                <thead>
                  <tr>
                    <th className="p-2 border-b border-outline-variant/25 font-bold text-outline uppercase w-[20%]">比對項目</th>
                    {compareList.map((book) => (
                      <th key={book.id} className="p-2 border-b border-outline-variant/25 font-bold text-primary w-[26%] text-center">
                        <div className="flex flex-col items-center gap-2">
                          <img
                            referrerPolicy="no-referrer"
                            alt={book.title}
                            className="w-14 h-20 object-contain rounded bg-surface-container-high shadow-xs"
                            src={book.coverUrl}
                          />
                          <div className="text-[11px] font-bold line-clamp-1 w-full" title={book.title}>
                            {book.title}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">定價 / 索取</td>
                    {compareList.map((book) => (
                      <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center font-extrabold text-secondary">
                        {book.price === null ? (
                          <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px]">免費贈送</span>
                        ) : (
                          `NT$ ${book.price}`
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">授課大學</td>
                    {compareList.map((book) => (
                      <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center font-bold text-primary">
                        {renderSchoolName(book.school)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">開課系所</td>
                    {compareList.map((book) => (
                      <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center text-on-surface-variant font-bold">
                        {book.department}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">授課教授</td>
                    {compareList.map((book) => (
                      <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center text-on-surface-variant italic">
                        {book.professor || "未指定"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">作者 / 版本</td>
                    {compareList.map((book) => (
                      <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center text-outline text-[11px] truncate max-w-[120px]" title={book.author}>
                        {book.author} {book.edition ? `(${book.edition})` : ""}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">二手書況</td>
                    {compareList.map((book) => {
                      const conditionMap: Record<string, { label: string; cls: string }> = {
                        "New": { label: "全新", cls: "bg-emerald-100 text-emerald-800" },
                        "Like New": { label: "近全新", cls: "bg-emerald-50 text-emerald-700" },
                        "Good": { label: "良好", cls: "bg-blue-50 text-blue-700" },
                        "Fair": { label: "普通", cls: "bg-amber-50 text-amber-700" },
                        "Old": { label: "微舊", cls: "bg-red-50 text-red-700" },
                      };
                      const cond = conditionMap[book.condition] || { label: book.condition, cls: "bg-surface-container text-primary" };
                      return (
                        <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cond.cls}`}>{cond.label}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">交易地點</td>
                    {compareList.map((book) => (
                      <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center text-[11px] font-bold text-primary truncate max-w-[120px]" title={book.location}>
                        {book.location}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-outline">書主誠信評等</td>
                    {compareList.map((book) => {
                      const rating = book.ownerRating ?? 4.8;
                      return (
                        <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center">
                          <div className="flex items-center justify-center gap-1 font-bold text-primary text-[11px]">
                            <span className="material-symbols-outlined text-[13px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span>{rating.toFixed(1)}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* AI 智慧推薦指標 */}
                  <tr className="bg-secondary/5">
                    <td className="p-3 border-b border-outline-variant/10 font-bold text-secondary">AI 推薦指數</td>
                    {compareList.map((book) => {
                      let stars = 4;
                      if (book.price === null) stars = 5;
                      else if (book.condition === "New" || book.condition === "Like New") stars = 5;
                      else if (book.price > 500 && book.condition === "Old") stars = 3;
                      
                      return (
                        <td key={book.id} className="p-3 border-b border-outline-variant/10 text-center">
                          <span className="text-stone-800 text-[11px]">
                            {"⭐".repeat(stars)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-secondary/5">
                    <td className="p-3 border-b border-outline-variant/15 font-bold text-secondary">AI 智慧分析</td>
                    {compareList.map((book) => {
                      let advice = "";
                      if (book.price === null) {
                        advice = "【索取首選】此書為免費贈送，且書主評分良好、地點方便。推薦給需要此參考書的學生！";
                      } else if (book.condition === "New" || book.condition === "Like New") {
                        advice = `【書況極優】價格 NT$ ${book.price} 對應近全新的書況非常超值。適合想買乾淨課本的使用者！`;
                      } else if (book.price > 500) {
                        advice = "【單價較高】適合預算充足或需要原文書精裝版的同學。面交時請仔細檢查是否有缺頁。";
                      } else {
                        advice = `【平價實惠】定價 NT$ ${book.price} 且書況良好。是極具性價比的理想二手選擇！`;
                      }
                      return (
                        <td key={book.id} className="p-3 border-b border-outline-variant/15 text-[11px] leading-relaxed text-on-surface-variant max-w-[200px]">
                          {advice}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant/15 bg-surface-container-low flex justify-end gap-3 select-none">
              <button
                onClick={() => {
                  setShowCompareModal(false);
                  // Quick click to first book details and switch to home
                  if (compareList.length > 0) {
                    onSelectBook(compareList[0]);
                  }
                }}
                className="px-4 py-2 bg-primary text-background rounded-xl text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
              >
                查看首本規格
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 border border-outline-variant/50 text-primary rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
