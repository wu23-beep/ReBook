/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Book, OwnerProfile } from "../types";

interface BookDetailViewProps {
  book: Book;
  onBack: () => void;
  onStartChat: (book: Book, initialMessage?: string) => void;
}

export default function BookDetailView({ book, onBack, onStartChat }: BookDetailViewProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const owner: OwnerProfile = {
    id: book.ownerId || "unknown",
    name: book.ownerName || "Independent Student",
    avatarUrl: book.ownerAvatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCG8jM-azr1sxrBx_5pVjKMCusHCXpDw8xRa6v8J6p1TYGehT2m7MuL3rWDM0dsJDuWYja2KW2tfKuHSsHivmHsFRuzSObXbZkAAV3sAGzz1xewQckHIMw6e5mVQJhtu4htrQuNKtUWSmuxhPanuaSCs4g-DTq5p-WffAe0ZlPy79Abwf2DcclGEnw8T0-dj3uV3G378Ejq9styzfIaBoQMr3d1I9ZwCz_80ERjfhbyY03kPHcNGPFMLZKhYr1UY6E-XBEG7F4RnEw",
    rating: book.ownerRating ?? 4.8,
    activeStatus: "Active recently",
    trustBadges: book.ownerTrustBadges || ["Verified Lender", "Fast Response"],
    department: book.department,
    school: book.school,
  };

  const translateTrustBadge = (badge: string) => {
    const mapping: Record<string, string> = {
      "Verified Lender": "已認證書主",
      "Friendly Lender": "友善書主",
      "Punctual": "守時準時",
      "Accurate Description": "書況描述相符",
      "Fast Response": "快速回覆",
      "Department Lab": "系所實驗室提供",
      "50+ Donations": "累計贈書 50+",
      "Verified Faculty": "認證教職員",
      "34 Exchanges": "完成 34 次交換",
      "12 Exchanges": "完成 12 次交換",
    };
    return mapping[badge] || badge;
  };

  const translateActiveStatus = (status: string) => {
    if (status.includes("Active 2h ago")) return "2 小時前上線";
    if (status.includes("Active 5m ago")) return "5 分鐘前上線";
    if (status.includes("Active 10h ago")) return "10 小時前上線";
    if (status.includes("Active recently")) return "最近上線過";
    return status.replace("Active", "上線於").replace("ago", "前").replace("h", "小時").replace("m", "分鐘");
  };

  const handlesQuickMessageClick = (msgText: string) => {
    onStartChat(book, msgText);
  };

  const isFree = book.price === null;

  return (
    <div className="pt-4 pb-16 max-w-xl mx-auto px-4" id="book-detail-view">
      
      {/* Detail View Header / Back Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer flex items-center justify-center"
          title="返回搜尋"
        >
          <span className="material-symbols-outlined text-primary text-2xl font-bold">arrow_back</span>
        </button>
        <span className="font-sans text-xs font-bold text-outline uppercase tracking-wider">返回探索書籍</span>
      </div>

      {/* Main Single Column Layout */}
      <div className="space-y-6">
        
        {/* Large Textured Book Cover Card */}
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden book-card-shadow border border-outline-variant/10 p-4 flex flex-col items-center">
          <div className="w-full aspect-[4/5] max-h-96 rounded-xl overflow-hidden shadow-inner bg-surface-container-high relative group flex items-center justify-center p-3">
            <img
              referrerPolicy="no-referrer"
              alt={book.title}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-102"
              src={book.coverUrl}
            />
          </div>

          <div className="w-full pt-6 flex justify-between items-start gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary leading-tight">
                {book.title}
              </h2>
              <p className="text-sm text-outline italic mt-1 font-sans">
                {book.edition ? `${book.edition} • ` : ""}{book.author}
              </p>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full text-sm font-extrabold font-sans text-center shadow-sm select-none ${
              isFree ? "bg-tertiary-container text-on-tertiary-container" : "bg-primary-container text-on-primary-container"
            }`}>
              {isFree ? "贈送" : `NT$ ${book.price}`}
            </div>
          </div>
        </div>

        {/* Owner Profile Trust Card */}
        <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4.5">
              <img
                alt={owner.name}
                className="w-12 h-12 rounded-full border border-secondary p-0.5 object-cover"
                src={owner.avatarUrl}
              />
              <div>
                <h3 className="font-sans text-sm font-bold text-primary">{owner.name}</h3>
                <p className="text-xs text-outline">{translateActiveStatus(owner.activeStatus)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full text-xs font-bold text-primary shadow-inner select-none">
              <span className="material-symbols-outlined text-[15px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {owner.rating.toFixed(1)}
            </div>
          </div>

          {/* Quick Review Indicators */}
          <div className="flex flex-wrap gap-2 pt-2">
            {owner.trustBadges.slice(0, 3).map((badge, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#eefaee] text-secondary border border-secondary/20 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                {translateTrustBadge(badge)}
              </span>
            ))}
          </div>
        </div>

        {/* Academic Course Information Card */}
        {book.courseInfo && (
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/25 shadow-inner space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-outline uppercase">學術與大學資訊</h4>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <span className="text-[11px] font-semibold text-outline block">課程名稱</span>
                <span className="font-sans text-xs sm:text-sm font-bold text-primary">{book.courseInfo.courseName}</span>
              </div>
              
              <div>
                <span className="text-[11px] font-semibold text-outline block">授課教授</span>
                <span className="font-sans text-xs sm:text-sm font-bold text-primary">{book.courseInfo.professorName}</span>
              </div>
              
              <div>
                <span className="text-[11px] font-semibold text-outline block">開課學系</span>
                <span className="font-sans text-xs sm:text-sm font-bold text-primary">{book.courseInfo.department}</span>
              </div>
              
              <div>
                <span className="text-[11px] font-semibold text-outline block">大學名稱</span>
                <span className="font-sans text-xs sm:text-sm font-bold text-primary">{book.school}</span>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Hand-Off Locations */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/25 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold tracking-wider text-outline uppercase">建議面交地點</h4>
            <span className="bg-tertiary-container/10 text-on-tertiary-container px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">熱門面交點</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { loc: "校園總圖書館正門", icon: "menu_book" },
              { loc: "學生學習共享空間（北館）", icon: "coffee" },
              { loc: "社科院經濟系館", icon: "apartment" },
              { loc: "捷運公館站 2 號出口", icon: "directions_subway" }
            ].map((spot, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl hover:border-secondary hover:shadow-sm transition-colors cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-[16px]">{spot.icon}</span>
                </div>
                <span className="font-sans text-xs font-bold text-primary">{spot.loc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Message Templates inside interactive Chat block */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 space-y-4">
          <h4 className="text-xs font-bold tracking-wider text-outline uppercase block">快速發送互動提案</h4>
          
          <div className="flex flex-col gap-2.5">
            {[
              "請問這本書目前還在嗎？",
              "明天方便在學校面交嗎？",
              "請問書中有筆記或螢光筆畫記嗎？"
            ].map((txt, idx) => (
              <button
                key={idx}
                onClick={() => handlesQuickMessageClick(txt)}
                className="w-full py-3 px-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-left font-sans text-xs font-semibold text-primary shadow-[0_2px_10px_rgba(3,22,50,0.02)] hover:bg-secondary-container/10 hover:border-secondary cursor-pointer transition-colors"
              >
                "{txt}"
              </button>
            ))}
          </div>

          <div className="pt-4 flex items-center gap-3 border-t border-outline-variant/20 mt-4.5">
            <button
              onClick={() => onStartChat(book)}
              className="flex-grow py-3.5 bg-primary text-background hover:brightness-110 rounded-xl font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:scale-98 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              傳送交換訊息給 {owner.name.split(" ")[0]}
            </button>
            
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-3.5 border rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isFavorited
                  ? "bg-tertiary-container/10 border-on-tertiary-container text-on-tertiary-container"
                  : "border-outline-variant text-on-surface-variant hover:border-secondary"
              }`}
              title={isFavorited ? "從追蹤清單移除" : "加入追蹤清單"}
            >
              <span 
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : undefined }}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
