/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface HeaderProps {
  activeTab: "home" | "shelf" | "exchange" | "profile" | "ai";
  onTabChange: (tab: "home" | "shelf" | "exchange" | "profile" | "ai") => void;
  onSearchPress?: () => void;
}

export default function Header({ activeTab, onTabChange, onSearchPress }: HeaderProps) {
  return (
    <header className="bg-surface dark:bg-surface-dim shadow-[0px_4px_20px_0px_rgba(3,22,50,0.04)] fixed top-0 w-full z-50 h-16 flex justify-between items-center px-4 md:px-10 border-b border-surface-container-high transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onSearchPress}
          className="hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors active:scale-95 p-2 rounded-full cursor-pointer"
          id="search-button-header"
        >
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed text-2xl">search</span>
        </button>
        <span 
          onClick={() => onTabChange("home")}
          className="font-serif text-2xl md:text-3xl text-primary eb-garamond font-bold select-none cursor-pointer tracking-tight flex items-center gap-1.5"
        >
          ReBook 續頁
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center" id="desktop-nav">
          <button
            onClick={() => onTabChange("home")}
            className={`font-sans font-semibold text-sm transition-colors cursor-pointer ${
              activeTab === "home" ? "text-primary border-b-2 border-secondary pb-1" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            探索書籍
          </button>
          <button
            onClick={() => onTabChange("shelf")}
            className={`font-sans font-semibold text-sm transition-colors cursor-pointer ${
              activeTab === "shelf" ? "text-primary border-b-2 border-secondary pb-1" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            我的書架
          </button>
          <button
            onClick={() => onTabChange("exchange")}
            className={`font-sans font-semibold text-sm transition-colors cursor-pointer ${
              activeTab === "exchange" ? "text-primary border-b-2 border-secondary pb-1" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            交換訊息
          </button>

          <button
            onClick={() => onTabChange("profile")}
            className={`font-sans font-semibold text-sm transition-colors cursor-pointer ${
              activeTab === "profile" ? "text-primary border-b-2 border-secondary pb-1" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            帳號檔案
          </button>
        </nav>

        {/* Notifications, Video & Avatar */}
        <div className="flex items-center gap-3">


          <button 
            className="hover:bg-surface-container-high p-2 rounded-full cursor-pointer transition-colors relative"
            id="notifications-button"
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-on-tertiary-container rounded-full animate-pulse"></span>
          </button>

          <img
            onClick={() => onTabChange("profile")}
            alt="Emily Wang avatar"
            className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer hover:ring-2 hover:ring-secondary transition-all"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG8jM-azr1sxrBx_5pVjKMCusHCXpDw8xRa6v8J6p1TYGehT2m7MuL3rWDM0dsJDuWYja2KW2tfKuHSsHivmHsFRuzSObXbZkAAV3sAGzz1xewQckHIMw6e5mVQJhtu4htrQuNKtUWSmuxhPanuaSCs4g-DTq5p-WffAe0ZlPy79Abwf2DcclGEnw8T0-dj3uV3G378Ejq9styzfIaBoQMr3d1I9ZwCz_80ERjfhbyY03kPHcNGPFMLZKhYr1UY6E-XBEG7F4RnEw"
          />
        </div>
      </div>
    </header>
  );
}
