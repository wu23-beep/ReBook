/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Book, FilterState } from "../types";
import { MOCK_BOOKS } from "../data";

interface HomeViewProps {
  onSelectBook: (book: Book) => void;
  onInitiateExchange: (book: Book) => void;
  initialFilters?: FilterState;
  books?: Book[];
}

export default function HomeView({ onSelectBook, onInitiateExchange, initialFilters, books }: HomeViewProps) {
  // Local Filter State
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      searchQuery: "",
      school: "Select University",
      department: "All",
      professor: "",
      condition: "All",
      minPrice: "",
      maxPrice: "",
      sortBy: "Relevance",
    }
  );

  const [activeCondition, setActiveCondition] = useState<string>("All");

  // Temporary local state for user typing before pressing "Apply Filters"
  const [tempTitle, setTempTitle] = useState("");
  const [tempSchool, setTempSchool] = useState("Select University");
  const [tempDept, setTempDept] = useState("All");
  const [tempProf, setTempProf] = useState("");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");

  const handleConditionClick = (cond: string) => {
    setActiveCondition(cond);
    setFilters((prev) => ({ ...prev, condition: cond }));
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: tempTitle,
      school: tempSchool,
      department: tempDept,
      professor: tempProf,
      condition: activeCondition,
      minPrice: tempMinPrice,
      maxPrice: tempMaxPrice,
    }));
  };

  const handleResetFilters = () => {
    setTempTitle("");
    setTempSchool("Select University");
    setTempDept("All");
    setTempProf("");
    setTempMinPrice("");
    setTempMaxPrice("");
    setActiveCondition("All");
    setFilters({
      searchQuery: "",
      school: "Select University",
      department: "All",
      professor: "",
      condition: "All",
      minPrice: "",
      maxPrice: "",
      sortBy: "Relevance",
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: e.target.value as any,
    }));
  };

  const translateTag = (tag: string) => {
    const mapping: Record<string, string> = {
      "Donation": "贈書",
      "Fair": "普通",
      "Old": "微舊",
      "Verified Lender": "認證書主",
      "Like New": "近全新",
      "New": "全新",
      "Good": "良好",
    };
    return mapping[tag] || tag;
  };

  const translateCondition = (cond: string) => {
    const mapping: Record<string, string> = {
      "All": "全部",
      "New": "全新",
      "Like New": "近全新",
      "Good": "良好",
      "Fair": "普通",
      "Old": "微舊",
    };
    return mapping[cond] || cond;
  };

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

  // Filtering Logic
  const filteredBooks = useMemo(() => {
    let result = books ? [...books] : [...MOCK_BOOKS];

    // Title / ISBN query
    if (filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }

    // School filter
    if (filters.school && filters.school !== "Select University") {
      result = result.filter((b) => b.school === filters.school);
    }

    // Department filter
    if (filters.department && filters.department !== "All") {
      result = result.filter((b) => b.department === filters.department);
    }

    // Professor filter
    if (filters.professor.trim() !== "") {
      const p = filters.professor.toLowerCase();
      result = result.filter((b) => b.professor.toLowerCase().includes(p));
    }

    // Condition filter
    if (filters.condition && filters.condition !== "All") {
      result = result.filter((b) => b.condition === filters.condition);
    }

    // Price filtering
    if (filters.minPrice !== "") {
      const min = parseFloat(filters.minPrice);
      result = result.filter((b) => {
        const p = b.price === null ? 0 : b.price;
        return p >= min;
      });
    }
    if (filters.maxPrice !== "") {
      const max = parseFloat(filters.maxPrice);
      result = result.filter((b) => {
        const p = b.price === null ? 0 : b.price;
        return p <= max;
      });
    }

    // Sorting
    if (filters.sortBy === "Price: Low to High") {
      result.sort((a, b) => {
        const pa = a.price === null ? 0 : a.price;
        const pb = b.price === null ? 0 : b.price;
        return pa - pb;
      });
    } else if (filters.sortBy === "Condition: Best First") {
      const hierarchy = { New: 5, "Like New": 4, Good: 3, Fair: 2, Old: 1 };
      result.sort((a, b) => hierarchy[b.condition] - hierarchy[a.condition]);
    }

    return result;
  }, [filters]);

  const dynamicSubheading = useMemo(() => {
    if (filters.school && filters.school !== "Select University") {
      return `${renderSchoolName(filters.school)} 二手教科書大廳`;
    }
    return "二手教科書大廳";
  }, [filters.school]);

  const dynamicHeading = useMemo(() => {
    const deptMap: Record<string, string> = {
      "Computer Science": "資訊工程",
      "Electrical Engineering": "電機工程",
      "Economics": "經濟學系",
      "Literature & Arts": "文學與藝術"
    };

    const schoolPrefix = filters.school && filters.school !== "Select University"
      ? renderSchoolName(filters.school)
      : "";

    if (filters.department && filters.department !== "All") {
      const deptName = deptMap[filters.department] || filters.department;
      return schoolPrefix
        ? `必選教科書：${schoolPrefix} ${deptName} 系列`
        : `必選教科書：${deptName} 系列`;
    }
    return schoolPrefix
      ? `精選教科書：${schoolPrefix} 熱門書籍`
      : "精選教科書：熱門書籍大廳";
  }, [filters.department, filters.school]);

  return (
    <div className="pt-8 pb-12 max-w-[1280px] mx-auto px-4 md:px-10" id="home-view-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Filter Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto academic-scroll lg:pr-1">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-[0px_4px_20px_0px_rgba(3,22,50,0.04)] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-primary font-bold tracking-tight">學術搜尋篩選</h2>
              <button
                onClick={handleResetFilters}
                className="text-secondary hover:text-secondary-container text-xs font-semibold cursor-pointer hover:underline transition-all"
              >
                重設篩選
              </button>
            </div>

            {/* Inputs Group */}
            <div className="space-y-4">
              {/* Title Search */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-outline tracking-wide uppercase">書名 / 作者 / ISBN</label>
                <div className="relative">
                  <input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant py-2 font-sans text-sm text-on-surface focus:outline-none focus:border-secondary focus:border-b-2 transition-all placeholder:text-outline-variant"
                    placeholder="例如：Algorithms 演算法"
                    type="text"
                  />
                  {tempTitle && (
                    <button 
                      onClick={() => setTempTitle("")}
                      className="absolute right-2 top-2 text-outline hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>

              {/* School Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-outline tracking-wide uppercase">學校名稱</label>
                <select
                  value={tempSchool}
                  onChange={(e) => setTempSchool(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant py-2 font-sans text-sm text-on-surface focus:outline-none focus:border-secondary focus:border-b-2 transition-all cursor-pointer"
                >
                  <option value="Select University">選擇大學名稱</option>
                  <option value="National Taiwan University">國立臺灣大學 (台大)</option>
                  <option value="National Chengchi University">國立政治大學 (政大)</option>
                  <option value="Soochow University">東吳大學 (東吳)</option>
                  <option value="Fu Jen Catholic University">輔仁大學 (輔仁)</option>
                </select>
              </div>

              {/* Department Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-outline tracking-wide uppercase">學門系所</label>
                <select
                  value={tempDept}
                  onChange={(e) => setTempDept(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant py-2 font-sans text-sm text-on-surface focus:outline-none focus:border-secondary focus:border-b-2 transition-all cursor-pointer"
                >
                  <option value="All">所有系所門類</option>
                  <option value="Computer Science">資訊工程系</option>
                  <option value="Electrical Engineering">電機工程系</option>
                  <option value="Economics">經濟學系</option>
                  <option value="Literature & Arts">文學與藝術學系</option>
                </select>
              </div>

              {/* Professor Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-outline tracking-wide uppercase">授課教授</label>
                <input
                  value={tempProf}
                  onChange={(e) => setTempProf(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant py-2 font-sans text-sm text-on-surface focus:outline-none focus:border-secondary focus:border-b-2 transition-all placeholder:text-outline-variant"
                  placeholder="例如：Dr. Smith 或 陳教授"
                  type="text"
                />
              </div>
            </div>

            {/* Condition Filter */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider block">書籍書況</label>
              <div className="flex flex-wrap gap-2">
                {["All", "New", "Like New", "Good", "Fair", "Old"].map((cond) => {
                  const isActive = activeCondition === cond;
                  return (
                    <button
                      key={cond}
                      onClick={() => handleConditionClick(cond)}
                      className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium cursor-pointer transition-all border ${
                        isActive
                          ? "bg-secondary-container border-transparent text-on-secondary-container"
                          : "bg-surface-container-highest border-transparent text-on-surface-variant hover:bg-secondary-container/40"
                      }`}
                    >
                      {translateCondition(cond)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider block">書籍預算價格範圍 (NT$)</label>
              <div className="flex items-center gap-4">
                <input
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  className="w-full bg-surface-container-highest rounded-lg px-3 py-2 text-sm border-none focus:ring-1 focus:ring-secondary placeholder:text-outline/60 text-primary"
                  placeholder="最低"
                  type="number"
                  min="0"
                />
                <span className="text-outline">—</span>
                <input
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  className="w-full bg-surface-container-highest rounded-lg px-3 py-2 text-sm border-none focus:ring-1 focus:ring-secondary placeholder:text-outline/60 text-primary"
                  placeholder="最高"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
               onClick={handleApplyFilters}
              className="w-full py-3.5 bg-primary text-background hover:bg-primary-container rounded-xl font-sans text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              套用篩選
            </button>
          </div>
        </aside>

        {/* Results Stream Section */}
        <section className="lg:col-span-8 xl:col-span-9" id="book-search-results-section">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-surface-container-high pb-4">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">{dynamicSubheading}</p>
              <h2 className="font-serif text-2xl md:text-3xl eb-garamond text-primary font-bold leading-tight select-all">
                {dynamicHeading}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 text-on-surface-variant shrink-0 select-none">
              <span className="text-xs font-semibold">排序依據：</span>
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="bg-transparent border-none text-xs font-semibold text-primary cursor-pointer focus:ring-0 focus:outline-none focus:border-b-2 py-1"
              >
                <option value="Relevance">智能推薦相關性</option>
                <option value="Price: Low to High">價格由低到高</option>
                <option value="Condition: Best First">書況良好優先</option>
              </select>
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
              <span className="material-symbols-outlined text-outline-variant text-5xl mb-4">search_off</span>
              <p className="font-serif text-lg text-primary font-medium">找不到符合當前篩選條件的學術教材</p>
              <p className="text-sm text-outline mt-1">您可以嘗試點擊下方按鈕或重設側邊欄的篩選條件</p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-5 py-2 bg-secondary text-background hover:brightness-115 rounded-full font-sans text-xs font-bold uppercase cursor-pointer transition-all"
              >
                探索全部學術教科書
              </button>
            </div>
          ) : (
            <>
              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBooks.map((book) => {
                  const isFree = book.price === null;
                  return (
                    <div
                      key={book.id}
                      onClick={() => onSelectBook(book)}
                      className="bg-surface-container-lowest rounded-xl overflow-hidden book-card-shadow border border-outline-variant/10 flex flex-col group transition-all duration-300 cursor-pointer"
                    >
                      {/* Cover Photo */}
                      <div className="h-64 overflow-hidden relative bg-surface-container-high flex items-center justify-center p-2">
                        <img
                          referrerPolicy="no-referrer"
                          alt={book.title}
                          className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          src={book.coverUrl}
                        />
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold font-sans shadow-md ${
                          isFree 
                            ? "bg-tertiary text-white" 
                            : "bg-primary text-white"
                        }`}>
                          {isFree ? "贈送" : `NT$ ${book.price}`}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          {/* Tags block */}
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {book.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  tag === "Donation" || tag === "Fair" || tag === "Old"
                                    ? "bg-tertiary/10 text-tertiary"
                                    : tag === "Verified Lender" || tag === "Like New" || tag === "New"
                                    ? "bg-secondary/15 text-secondary"
                                    : "bg-surface-container-highest text-on-surface-variant"
                                }`}
                              >
                                {translateTag(tag)}
                              </span>
                            ))}
                          </div>
                          
                          <h3 className="font-serif text-lg text-primary leading-snug font-bold group-hover:text-secondary transition-colors line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-xs text-outline font-medium mt-1 italic font-sans truncate">
                            {book.author}
                          </p>
                        </div>

                        {/* Location Details & Button */}
                        <div className="space-y-3 pt-3.5 border-t border-outline-variant/20">
                          <div className="flex items-center gap-1.5 text-on-surface-variant select-none">
                            <span className="material-symbols-outlined text-[18px]">school</span>
                            <span className="text-xs font-semibold truncate text-on-surface-variant/90">{renderSchoolName(book.school)}</span>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInitiateExchange(book);
                            }}
                            className={`w-full py-2.5 rounded-lg font-sans text-xs font-bold tracking-wide transition-all ${
                              isFree
                                ? "bg-secondary text-background hover:brightness-105 cursor-pointer shadow-sm"
                                : "border border-secondary text-secondary hover:bg-secondary hover:text-white cursor-pointer"
                            }`}
                          >
                            {isFree ? "免費索取書本" : "發起交換預約"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              <div className="mt-12 flex justify-center selection:bg-secondary">
                <button
                  type="button"
                  className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-primary bg-surface-container-high px-6 py-3.5 rounded-full hover:bg-surface-container-highest cursor-pointer transition-colors active:scale-95"
                >
                  載入更多二手書
                  <span className="material-symbols-outlined text-base">expand_more</span>
                </button>
              </div>
            </>
          )}

        </section>

      </div>
    </div>
  );
}
