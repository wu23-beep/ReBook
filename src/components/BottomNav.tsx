/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface BottomNavProps {
  activeTab: "home" | "shelf" | "exchange" | "profile" | "ai";
  onTabChange: (tab: "home" | "shelf" | "exchange" | "profile" | "ai") => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 pb-2 bg-surface dark:bg-surface-dim shadow-[0px_-4px_20px_0px_rgba(3,22,50,0.04)] z-50 rounded-t-xl border-t border-surface-container-high transition-transform duration-200">
      
      <button
        onClick={() => onTabChange("home")}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all cursor-pointer ${
          activeTab === "home"
            ? "bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed px-5 scale-105"
            : "text-on-surface-variant dark:text-outline hover:text-secondary"
        }`}
        id="mobile-nav-home"
      >
        <span className="material-symbols-outlined select-none">home</span>
        <span className="font-sans text-xs font-semibold mt-0.5">探索書籍</span>
      </button>

      <button
        onClick={() => onTabChange("shelf")}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all cursor-pointer ${
          activeTab === "shelf"
            ? "bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed px-5 scale-105"
            : "text-on-surface-variant dark:text-outline hover:text-secondary"
        }`}
        id="mobile-nav-shelf"
      >
        <span className="material-symbols-outlined select-none text-[22px]">menu_book</span>
        <span className="font-sans text-xs font-semibold mt-0.5">我的書架</span>
      </button>

      <button
        onClick={() => onTabChange("exchange")}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all cursor-pointer ${
          activeTab === "exchange"
            ? "bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed px-5 scale-105"
            : "text-on-surface-variant dark:text-outline hover:text-secondary"
        }`}
        id="mobile-nav-exchange"
      >
        <span 
          className="material-symbols-outlined select-none"
          style={{ fontVariationSettings: activeTab === "exchange" ? "'FILL' 1" : undefined }}
        >
          swap_horiz
        </span>
        <span className="font-sans text-xs font-semibold mt-0.5">交換訊息</span>
      </button>



      <button
        onClick={() => onTabChange("profile")}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all cursor-pointer ${
          activeTab === "profile"
            ? "bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed px-5 scale-105"
            : "text-on-surface-variant dark:text-outline hover:text-secondary"
        }`}
        id="mobile-nav-profile"
      >
        <span 
          className="material-symbols-outlined select-none"
          style={{ fontVariationSettings: activeTab === "profile" ? "'FILL' 1" : undefined }}
        >
          person
        </span>
        <span className="font-sans text-xs font-semibold mt-0.5">帳號檔案</span>
      </button>
      
    </nav>
  );
}
