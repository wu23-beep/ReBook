/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Book } from "../types";
import { MOCK_WISHLIST } from "../data";

interface ProfileViewProps {
  onSearchFilterApply?: (field: string, value: string) => void;
  onSelectBookByTitle?: (title: string) => void;
  favorites?: Book[];
  onToggleFavorite?: (book: Book) => void;
  onSelectBook?: (book: Book) => void;
}

export default function ProfileView({ 
  onSearchFilterApply, 
  onSelectBookByTitle,
  favorites = [],
  onToggleFavorite,
  onSelectBook
}: ProfileViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"wishlist" | "alerts" | "settings">("wishlist");

  // Wishlist item state (to support toggles)
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST);

  // Profile preferences state
  const [school, setSchool] = useState("國立臺灣大學");
  const [prefDept, setPrefDept] = useState("經濟學系");
  const [prefLocation, setPrefLocation] = useState("總校區圖書館 ─ 社會科學院服務部櫃台");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [popupAlerts, setPopupAlerts] = useState(true);

  // Mock addition to wishlist
  const [newWishlistTitle, setNewWishlistTitle] = useState("");
  const [newWishlistAuthor, setNewWishlistAuthor] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const handleToggleAlerts = (id: string) => {
    setWishlistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, alertsOn: !item.alertsOn } : item))
    );
  };

  const handleAddNewWishlistItem = () => {
    if (!newWishlistTitle.trim()) return;
    const newItem = {
      id: `custom-wishlist-${Date.now()}`,
      title: newWishlistTitle,
      author: newWishlistAuthor || "未註明作者",
      coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATRzJVUUcYKTHOMNQnKxbT7a4_uDYTLRgzl3XGVjE3GWvSP8cU_opjJpZs9jiUAeIalfLxuayiNx7J7PlkFVNnzYc0XLpId9j7tLQeXhqsjBdCYxUzfyT6ahCxUPaAfLTmuh5t7iTWKXtF5uO17VXPrOsMgOzWy5IDdov8px3EPfmIXfU6y0JtgSngV_cn-b-MnPXiH_koTZ31ZEihqT3MtqAGM-lU_zz96jzRyGGqfcprsLuT0MuMaige48OrqWKfceCV4bpIjTw", // Fallback to macroeconomics cover looks nice
      alertsOn: true,
      hasActiveListing: false,
    };
    setWishlistItems((prev) => [...prev, newItem]);
    setNewWishlistTitle("");
    setNewWishlistAuthor("");
    setIsAddingItem(false);
  };

  const handleDeleteWishlistItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="pt-8 pb-16 max-w-[1280px] mx-auto px-4 md:px-10" id="profile-view-container">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* User Profile Card column */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-[0_4px_20px_0px_rgba(3,22,50,0.04)] flex flex-col items-center text-center">
            
            <div className="relative mb-4">
              <img
                alt="User avatar Emily"
                className="w-32 h-32 rounded-full border border-secondary p-1 bg-background object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbidKXgk9cUCubWxAJoQt2c4-B5Yfhx1jtwI6FLd7-LuR5F8oX_jWNs2bY_jr2_8Oy6DrZf2Rhnpyj41o6XNG5bWhRubiAmyLEzKuV7ODnzjZtDldLT-f_M51vUai-TJyV33WsLaeyS6OW8BfLbWrsd4aqPHJLvFUdyhQn9ec44oDQaNkuVPVTql51OgT9dybEdgTMmwJ-ki4M6EkYaaOE5pWNJc1TcoOCaUACRUy-LBiC1jV00wujWh3go_yZlE57rDdhw9jggNQ"
              />
              <div className="absolute bottom-1 right-1 bg-secondary text-on-secondary p-1 rounded-full border-4 border-surface-container-lowest flex items-center justify-center">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-primary mb-1">Emily Wang</h2>
            <p className="font-sans text-xs font-semibold text-outline tracking-wider mb-3">{school}</p>
            
            <div className="bg-secondary-container/20 px-4 py-1.5 rounded-full mb-6">
              <span className="font-sans text-xs font-bold text-secondary">{prefDept}</span>
            </div>

            <div className="w-full space-y-2.5">
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-outline-variant/10 select-none">
                <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                <span className="font-sans text-xs font-bold text-primary select-none">已認證資深書主</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-outline-variant/10 select-none">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>swap_horiz</span>
                <span className="font-sans text-xs font-bold text-primary select-none">累計已完成 34 次交換與交易</span>
              </div>
            </div>

            {/* Quick action to add custom listing */}
            <button
              onClick={() => setIsAddingItem(true)}
              className="mt-6 w-full py-2.5 bg-secondary text-background hover:brightness-110 rounded-xl font-sans text-xs font-semibold tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">bookmark_add</span>
              新增至追蹤清單
            </button>

          </div>
        </div>

        {/* Dynamic Content area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          
          {/* Sub Navigation tabs */}
          <nav className="flex border-b border-surface-container-high gap-6 sm:gap-8 pb-0" id="profile-subtabs">
            <button
              onClick={() => setActiveSubTab("wishlist")}
              className={`pb-4 border-b-2 font-sans text-xs sm:text-sm font-bold tracking-wide cursor-pointer transition-all ${
                activeSubTab === "wishlist" ? "border-primary text-primary" : "border-transparent text-outline"
              }`}
            >
              我的追蹤清單
            </button>
            <button
              onClick={() => setActiveSubTab("alerts")}
              className={`pb-4 border-b-2 font-sans text-xs sm:text-sm font-bold tracking-wide cursor-pointer transition-all ${
                activeSubTab === "alerts" ? "border-primary text-primary" : "border-transparent text-outline"
              }`}
            >
              降價通知設定
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`pb-4 border-b-2 font-sans text-xs sm:text-sm font-bold tracking-wide cursor-pointer transition-all ${
                activeSubTab === "settings" ? "border-primary text-primary" : "border-transparent text-outline"
              }`}
            >
              帳號偏好設定
            </button>
          </nav>

          {/* Quick Wishlist Adding Modal (within card block) */}
          {isAddingItem && (
            <div className="bg-surface-container-low p-5 rounded-2xl border border-secondary/15 space-y-4 shadow-sm animate-in fade-in duration-200">
              <h3 className="font-serif text-lg font-bold text-primary">新增圖書教材至追蹤清單</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={newWishlistTitle}
                  onChange={(e) => setNewWishlistTitle(e.target.value)}
                  placeholder="教材書名（例如：Principles of Economics）"
                  className="bg-surface-container-lowest rounded-lg p-2.5 text-xs text-primary focus:ring-1 focus:ring-secondary border-none"
                  type="text"
                />
                <input
                  value={newWishlistAuthor}
                  onChange={(e) => setNewWishlistAuthor(e.target.value)}
                  placeholder="原著作者（例如：N. Gregory Mankiw）"
                  className="bg-surface-container-lowest rounded-lg p-2.5 text-xs text-primary focus:ring-1 focus:ring-secondary border-none"
                  type="text"
                />
              </div>
              <div className="flex justify-end gap-2.5 font-sans">
                <button
                  onClick={() => setIsAddingItem(false)}
                  className="px-4 py-2 hover:bg-surface-container-high rounded-lg text-xs font-bold text-outline cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleAddNewWishlistItem}
                  className="px-4 py-2 bg-secondary text-background hover:brightness-105 rounded-lg text-xs font-bold cursor-pointer"
                >
                  加入清單
                </button>
              </div>
            </div>
          )}

          {/* Tab Content Rendering */}
          {activeSubTab === "wishlist" && (
            <div className="space-y-6" id="wishlist-tab-panel">
              {/* Recent Active Alerts and community news */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 select-none">
                {/* Alert Box 1 */}
                <div className="bg-secondary-container/10 border border-secondary/15 p-4.5 rounded-2xl flex gap-4 items-center">
                  <div className="w-12 h-16 bg-surface-container rounded-sm overflow-hidden shrink-0 shadow-sm border border-outline-variant/10">
                    <img
                      referrerPolicy="no-referrer"
                      alt="Macroeconomics thumbnail"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuATRzJVUUcYKTHOMNQnKxbT7a4_uDYTLRgzl3XGVjE3GWvSP8cU_opjJpZs9jiUAeIalfLxuayiNx7J7PlkFVNnzYc0XLpId9j7tLQeXhqsjBdCYxUzfyT6ahCxUPaAfLTmuh5t7iTWKXtF5uO17VXPrOsMgOzWy5IDdov8px3EPfmIXfU6y0JtgSngV_cn-b-MnPXiH_koTZ31ZEihqT3MtqAGM-lU_zz96jzRyGGqfcprsLuT0MuMaige48OrqWKfceCV4bpIjTw"
                    />
                  </div>
                  <div>
                    <p className="font-sans text-xs text-primary leading-relaxed">
                      <span className="font-extrabold text-secondary">好消息！</span> 您的追蹤教材《Macroeconomics》剛被附近的同學上架囉。
                    </p>
                    <button
                      onClick={() => {
                        if (onSearchFilterApply) {
                          onSearchFilterApply("department", "Economics");
                        }
                      }}
                      className="font-sans text-xs font-bold text-secondary hover:underline cursor-pointer mt-1"
                    >
                      立即查看刊登
                    </button>
                  </div>
                </div>

                {/* Alert Box 2 */}
                <div className="bg-tertiary-container/5 border border-tertiary-container/10 p-4.5 rounded-2xl flex gap-4 items-center">
                  <div className="w-10 h-10 bg-tertiary-container/10 rounded-full flex items-center justify-center shrink-0 text-on-tertiary-container">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  </div>
                  <p className="font-sans text-xs text-primary leading-relaxed">
                    您喜愛的追蹤書目 <span className="italic text-on-tertiary-container font-semibold">"Freakonomics"</span> 目前在台大社群中非常熱門！
                  </p>
                </div>
              </div>

              {/* Saved Books Grid list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="wishlist-book-grid">
                {/* Real Favorited Books */}
                {favorites.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook && onSelectBook(book)}
                    className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 shadow-sm group hover:shadow-[0_8px_30px_rgba(3,22,50,0.05)] transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-serif text-base sm:text-lg text-primary font-bold tracking-tight line-clamp-2">{book.title}</h3>
                          <p className="font-sans text-xs text-outline mt-1 italic">{book.author}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite && onToggleFavorite(book);
                          }}
                          className="bg-secondary-container/20 text-secondary p-2 rounded-full transition-colors cursor-pointer shrink-0 flex items-center justify-center hover:bg-tertiary-container/20"
                          title="取消追蹤"
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2.5 my-4 select-none pt-3 border-t border-outline-variant/10">
                        <div className="flex items-center gap-1 font-sans text-secondary">
                          <span className="material-symbols-outlined text-base">notifications_active</span>
                          <span className="text-[11px] font-bold">即時通知：開啟中</span>
                        </div>
                        
                        <span className="text-[11px] text-outline italic">
                          目前已上架
                        </span>
                      </div>
                    </div>

                    <div className="w-full text-center py-2.5 bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary rounded-lg font-sans text-xs font-bold transition-all">
                      查看書籍詳情
                    </div>
                  </div>
                ))}

                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 shadow-sm group hover:shadow-[0_8px_30px_rgba(3,22,50,0.05)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-serif text-base sm:text-lg text-primary font-bold tracking-tight line-clamp-2">{item.title}</h3>
                          <p className="font-sans text-xs text-outline mt-1 italic">{item.author}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteWishlistItem(item.id, e)}
                          className="bg-surface-container-high hover:bg-tertiary-container/20 text-outline hover:text-on-tertiary-container p-2 rounded-full transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                          title="取消追蹤"
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2.5 my-4 select-none pt-3 border-t border-outline-variant/10">
                        <div className={`flex items-center gap-1 font-sans ${item.alertsOn ? "text-secondary" : "text-outline"}`}>
                          <span className="material-symbols-outlined text-base">
                            {item.alertsOn ? "notifications_active" : "notifications_off"}
                          </span>
                          <span className="text-[11px] font-bold">即時通知：{item.alertsOn ? "開啟中" : "已關閉"}</span>
                        </div>
                        
                        <span className="text-[11px] text-outline italic">
                          {item.hasActiveListing ? "目前有 2 個上架項目" : "目前暫無上架項目"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAlerts(item.id)}
                      className={`w-full py-2.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                        item.alertsOn
                          ? "bg-primary text-background hover:bg-primary-container"
                          : "border border-secondary text-secondary hover:bg-secondary/10"
                      }`}
                    >
                      {item.alertsOn ? "關閉即時通知" : "開啟降價即時通知"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "alerts" && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-6" id="alerts-tab-panel">
              <h3 className="font-serif text-xl font-bold text-primary">管理教材追蹤降價提醒</h3>
              <p className="text-xs text-outline leading-relaxed">
                您可以為特定二手教材書目設定最高預算門檻。當校園有同學上架低於此價格的書籍時，系統將即時發送郵件與網頁推播通知您。
              </p>

              <div className="divide-y divide-surface-container-high">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3 items-center">
                      <img alt={item.title} className="w-10 h-14 object-cover rounded-sm shrink-0 border border-outline-variant/2" src={item.coverUrl} />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-primary">{item.title}</h4>
                        <p className="text-[11px] text-outline">{item.author}</p>
                      </div>
                    </div>

                    {/* Alert trigger sliders */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-outline font-semibold">最高預算：</span>
                        <div className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/10 text-xs font-bold text-primary">
                          NT$ 400
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleAlerts(item.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          item.alertsOn 
                            ? "bg-[#eefaee] text-secondary border border-secondary/20" 
                            : "bg-surface-container text-outline border border-transparent"
                        }`}
                      >
                        {item.alertsOn ? "通知中" : "已暫停通知"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "settings" && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-6" id="settings-tab-panel">
              <h3 className="font-serif text-xl font-bold text-primary">學術帳號與個人檔案偏好</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">所屬大學校院</label>
                  <input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/10 focus:ring-1 focus:ring-secondary text-xs sm:text-sm font-semibold text-primary"
                    type="text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">學術研究方向 / 開課系所</label>
                  <input
                    value={prefDept}
                    onChange={(e) => setPrefDept(e.target.value)}
                    className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/10 focus:ring-1 focus:ring-secondary text-xs sm:text-sm font-semibold text-primary"
                    type="text"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">預設期望面交地點</label>
                  <input
                    value={prefLocation}
                    onChange={(e) => setPrefLocation(e.target.value)}
                    className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/10 focus:ring-1 focus:ring-secondary text-xs sm:text-sm font-semibold text-primary"
                    type="text"
                  />
                </div>
              </div>

              {/* Alerts preferences toggle */}
              <div className="space-y-3 pt-4 border-t border-surface-container-high">
                <h4 className="text-[11px] font-bold text-outline uppercase tracking-wider">即時通知與推播管道</h4>
                
                <div className="space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-primary block">電子郵件即時通知</span>
                      <span className="text-[10px] text-outline">當有附近學生上架符合您預算的教材時，發送 Email 通知</span>
                    </div>
                    <input
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      type="checkbox"
                      className="rounded text-secondary border-outline focus:ring-secondary shadow-sm cursor-pointer w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-primary block">網頁內置彈出通知</span>
                      <span className="text-[10px] text-outline">當您在使用平台時，即時在底部顯示符合追蹤項目之卡片</span>
                    </div>
                    <input
                      checked={popupAlerts}
                      onChange={(e) => setPopupAlerts(e.target.checked)}
                      type="checkbox"
                      className="rounded text-secondary border-outline focus:ring-secondary shadow-sm cursor-pointer w-5 h-5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 font-sans">
                <button
                  type="button"
                  onClick={() => alert("個人偏好設定已成功儲存！")}
                  className="px-5 py-2.5 bg-primary text-background hover:bg-primary-container rounded-xl text-xs font-bold uppercase cursor-pointer transition-all shadow-md active:scale-95"
                >
                  儲存並變更
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
