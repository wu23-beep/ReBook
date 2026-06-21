/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Book } from "../types";

interface ShelfViewProps {
  books: Book[];
  onAddBook: (book: Book) => void;
  onSelectBook: (book: Book) => void;
}

export default function ShelfView({ books, onAddBook, onSelectBook }: ShelfViewProps) {
  // Local state for interactive Post Listing Form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [dept, setDept] = useState("Economics");
  const [school, setSchool] = useState("National Taiwan University");
  const [professor, setProfessor] = useState("");
  const [condition, setCondition] = useState<"New" | "Like New" | "Good" | "Fair" | "Old">("Like New");
  const [priceInput, setPriceInput] = useState("");
  const [location, setLocation] = useState("Main Campus Library");
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const translateCondition = (cond: string) => {
    const mapping: Record<string, string> = {
      "New": "全新",
      "Like New": "近全新",
      "Good": "良好",
      "Fair": "普通",
      "Old": "微舊",
    };
    return mapping[cond] || cond;
  };

  // Filter books owned by Emily (we assume owner-alex is Emily's partner profile, as styled in mockup!)
  const myListings = books.filter((b) => b.ownerId === "owner-alex");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("請填寫教科書書名！");
      return;
    }

    const priceValue = priceInput.trim() === "" ? null : parseFloat(priceInput);

    const newBook: Book = {
      id: `custom-book-${Date.now()}`,
      title,
      author: author || "未註明作者",
      price: priceValue,
      condition,
      tags: priceValue === null ? [condition, "Donation"] : [condition, "Verified Lender"],
      department: dept,
      school,
      professor: professor || "陳教授",
      location: location || "校總區圖書館",
      coverUrl: coverUrlInput.trim() || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop",
      ownerId: "owner-alex", // represents User Emily's lender ID
      ownerName: "Alex Chen",
      ownerAvatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG8jM-azr1sxrBx_5pVjKMCusHCXpDw8xRa6v8J6p1TYGehT2m7MuL3rWDM0dsJDuWYja2KW2tfKuHSsHivmHsFRuzSObXbZkAAV3sAGzz1xewQckHIMw6e5mVQJhtu4htrQuNKtUWSmuxhPanuaSCs4g-DTq5p-WffAe0ZlPy79Abwf2DcclGEnw8T0-dj3uV3G378Ejq9styzfIaBoQMr3d1I9ZwCz_80ERjfhbyY03kPHcNGPFMLZKhYr1UY6E-XBEG7F4RnEw",
      ownerRating: 4.9,
      ownerTrustBadges: ["Verified Lender", "34 Exchanges", "Punctual", "Accurate Description", "Fast Response"],
      courseInfo: {
        courseName: `核心領域進階學術教材 - ${dept}`,
        professorName: professor || "陳教授",
        department: dept,
        semester: "Fall 2026"
      }
    };

    onAddBook(newBook);
    setSuccessMsg(`已成功將《${title}》上架到 ReBook 續頁！`);
    
    // Clear form inputs
    setTitle("");
    setAuthor("");
    setProfessor("");
    setPriceInput("");
    setCoverUrlInput("");
    
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  return (
    <div className="pt-8 pb-16 max-w-[1280px] mx-auto px-4 md:px-10" id="shelf-view-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form to Post New Listing */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-primary font-bold">上架二手教材</h2>
              <p className="text-xs text-outline mt-1 leading-normal">
                賦予教科書第二次生命！與在 {renderSchoolName(school)} 共同學習的夥伴們分享你的筆記教材。
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-[#eefaee] text-secondary border border-secondary/20 rounded-xl text-xs font-bold leading-relaxed shadow-xs animate-pulse select-none">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">經典書名 / 教材名稱</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：Principles of Economics"
                  className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs sm:text-sm text-primary focus:ring-1 focus:ring-secondary border-none"
                  type="text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">原著作者</label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="例如：N. Gregory Mankiw"
                  className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs sm:text-sm text-primary focus:ring-1 focus:ring-secondary border-none"
                  type="text"
                />
              </div>

              {/* Grid 1: School and Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">開課學校</label>
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs text-primary focus:ring-1 focus:ring-secondary border-none cursor-pointer"
                  >
                    <option value="National Taiwan University">國立臺灣大學</option>
                    <option value="National Chengchi University">國立政治大學</option>
                    <option value="Soochow University">東吳大學</option>
                    <option value="Fu Jen Catholic University">輔仁大學</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">相關系所門類</label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs text-primary focus:ring-1 focus:ring-secondary border-none cursor-pointer"
                  >
                    <option value="Economics">經濟學系</option>
                    <option value="Computer Science">資訊工程系</option>
                    <option value="Electrical Engineering">電機工程系</option>
                    <option value="Literature & Arts">文學與藝術</option>
                  </select>
                </div>
              </div>

              {/* Grid 2: Professor and Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">授課教授</label>
                  <input
                    value={professor}
                    onChange={(e) => setProfessor(e.target.value)}
                    placeholder="例如：陳教授"
                    className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs sm:text-sm text-primary focus:ring-1 focus:ring-secondary border-none"
                    type="text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">舊書書況</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs text-primary focus:ring-1 focus:ring-secondary border-none cursor-pointer"
                  >
                    <option value="New">全新</option>
                    <option value="Like New">近全新</option>
                    <option value="Good">書況良好</option>
                    <option value="Fair">普通/略有筆記</option>
                    <option value="Old">較舊/微黃</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Price and Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">預計售價 (NT$) <span className="text-[9px] text-outline block sm:inline">(留空=免費)</span></label>
                  <input
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="免費二手結緣"
                    className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs sm:text-sm text-primary focus:ring-1 focus:ring-secondary border-none"
                    type="number"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">期望相約面交點</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例如：校園總圖書館正門"
                    className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs sm:text-sm text-primary focus:ring-1 focus:ring-secondary border-none"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">封面圖片網址 <span className="text-[10px] text-outline italic">(選填，留空將套用精美預設圖)</span></label>
                <input
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  placeholder="請貼上書本封面圖片 URL 網址"
                  className="w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-xs sm:text-sm text-primary focus:ring-1 focus:ring-secondary border-none"
                  type="text"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-secondary text-background hover:brightness-110 rounded-xl font-sans text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-base">checklist_rtl</span>
                認證並發布至我的書櫃
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Emily's Bookshelf active cards & Past Exchange logs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Listings section */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary border-b border-surface-container-high pb-2">
              我已上架的二手學術教材 ({myListings.length})
            </h3>

            {myListings.length === 0 ? (
              <p className="text-sm text-outline italic py-8">當前沒有正在出售或贈送的教材書籍。請在左側表單中填寫書本資訊發布上架！</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myListings.map((book) => {
                  const isFree = book.price === null;
                  return (
                    <div
                      key={book.id}
                      onClick={() => onSelectBook(book)}
                      className="bg-surface-container-lowest border border-outline-variant/15 p-4 rounded-xl flex gap-4 hover:border-secondary cursor-pointer transition-colors shadow-xs"
                    >
                      <img
                        referrerPolicy="no-referrer"
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded-md shadow-xs bg-surface-container-high"
                        src={book.coverUrl}
                      />
                      <div className="flex flex-col justify-between truncate">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-primary truncate">{book.title}</h4>
                          <p className="text-[11px] text-outline italic truncate">{book.author}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] bg-secondary-container/30 text-secondary font-bold px-2 py-0.5 rounded uppercase">
                            {translateCondition(book.condition)}
                          </span>
                          <span className="text-[11px] text-primary font-bold">
                            {isFree ? "贈送" : `NT$ ${book.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historical exchanges logs */}
          <div className="space-y-4 pt-4">
            <h3 className="font-serif text-xl font-bold text-primary border-b border-surface-container-high pb-2 select-all">
              已完成的書籍交換與交易紀錄 (累計 34 次完成)
            </h3>
            
            <div className="space-y-3">
              {[
                { book: "Mankiw 總體經濟學 (Macroeconomics)", with: "Elena Rostova", date: "2026年5月24日", type: "雙向交換", status: "交易圓滿成功" },
                { book: "普通物理學基礎原理卷一", with: "Marcus Wu", date: "2026年5月10日", type: "買賣交易 (NT$ 350)", status: "交易圓滿成功" },
                { book: "Calculus 微積分經典基礎 (Early Transcendentals)", with: "Jessica Lin", date: "2026年4月28日", type: "免費贈書流轉", status: "交易圓滿成功" },
                { book: "Java 演算法與資料結構基礎", with: "Prof. Chen", date: "2026年4月15日", type: "系所圖書捐贈", status: "交易圓滿成功" },
              ].map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3 select-none">
                    <div className="w-8 h-8 rounded-full bg-[#eefaee] text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-base">handshake</span>
                    </div>
                    <div>
                      <p className="font-bold text-primary leading-none mb-1">{log.book}</p>
                      <p className="text-[10px] text-outline">交易對象: {log.with} • {log.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 select-none">
                    <span className="text-[11px] font-semibold text-outline">{log.type}</span>
                    <span className="bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
