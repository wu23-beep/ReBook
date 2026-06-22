import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("錯誤：找不到 Supabase URL 或 ANON KEY。");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to remove parentheses containing Chinese characters
function removeChineseParentheses(title) {
  return title
    .replace(/\([^)]*[\u4e00-\u9fa5]+[^)]*\)/g, "") // 移除包含中文的半形括號
    .replace(/（[^）]*[\u4e00-\u9fa5]+[^）]*）/g, "") // 移除包含中文的全形括號
    .replace(/\s+/g, " ") // 合併多個空格
    .trim();
}

// Helper function to clean search terms (remove edition tags and punctuation for search query)
function getSearchQuery(title, author) {
  let cleanTitle = title
    .replace(/\(.*?\)/g, "")
    .replace(/（.*?）/g, "")
    .replace(/第\s*\d+\s*[版|輯]/g, "")
    .replace(/\d+(st|nd|rd|th)\s+Edition/gi, "")
    .split("-")[0]
    .split(":")[0]
    .replace(/,/g, "")
    .trim();
  
  // Clean author name
  let cleanAuthor = author ? author.split(",")[0].split(" ")[0].trim() : "";
  
  return { cleanTitle, cleanAuthor };
}

// Fetch cover, filtering by title relevance and sorting by latest publish year
async function fetchCorrectCoverUrl(title, author) {
  const { cleanTitle, cleanAuthor } = getSearchQuery(title, author);
  const query = `${cleanTitle} ${cleanAuthor}`.trim();
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.docs && data.docs.length > 0) {
      // Filter by title match
      const matchedDocs = data.docs.filter(doc => {
        if (!doc.cover_i) return false;
        const docTitle = doc.title.toLowerCase();
        const searchTitle = cleanTitle.toLowerCase();
        return docTitle.includes(searchTitle) || searchTitle.includes(docTitle);
      });
      
      const docsToSort = matchedDocs.length > 0 ? matchedDocs : data.docs.filter(doc => doc.cover_i);
      
      // Sort by publish year (descending) to get the latest edition
      const sorted = docsToSort.sort((a, b) => {
        const yearA = a.publish_year ? Math.max(...a.publish_year) : (a.first_publish_year || 0);
        const yearB = b.publish_year ? Math.max(...b.publish_year) : (b.first_publish_year || 0);
        return yearB - yearA;
      });
      
      if (sorted.length > 0 && sorted[0].cover_i) {
        return `https://covers.openlibrary.org/b/id/${sorted[0].cover_i}-L.jpg`;
      }
    }
  } catch (err) {
    console.error(`查詢失敗 [${query}]:`, err.message);
  }
  
  // Fallback: title search only
  const fallbackUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=10`;
  try {
    const res = await fetch(fallbackUrl);
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      const matchedDocs = data.docs.filter(doc => {
        if (!doc.cover_i) return false;
        const docTitle = doc.title.toLowerCase();
        const searchTitle = cleanTitle.toLowerCase();
        return docTitle.includes(searchTitle) || searchTitle.includes(docTitle);
      });
      
      const docsToSort = matchedDocs.length > 0 ? matchedDocs : data.docs.filter(doc => doc.cover_i);
      
      const sorted = docsToSort.sort((a, b) => {
        const yearA = a.publish_year ? Math.max(...a.publish_year) : (a.first_publish_year || 0);
        const yearB = b.publish_year ? Math.max(...b.publish_year) : (b.first_publish_year || 0);
        return yearB - yearA;
      });
      
      if (sorted.length > 0 && sorted[0].cover_i) {
        return `https://covers.openlibrary.org/b/id/${sorted[0].cover_i}-L.jpg`;
      }
    }
  } catch (err) {
    console.error(`備份查詢失敗 [${cleanTitle}]:`, err.message);
  }
  
  return null;
}

async function startUpdating() {
  console.log("正在從 Supabase 獲取所有書籍以清理書名與更新最新封面...");
  
  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, author, cover_url");
    
  if (error) {
    console.error("無法取得書籍列表:", error.message);
    process.exit(1);
  }
  
  console.log(`共讀取到 ${books.length} 筆書籍。準備開始清理書名並查詢最新封面...`);
  let updatedCount = 0;
  
  for (const book of books) {
    const cleanTitle = removeChineseParentheses(book.title);
    const correctCover = await fetchCorrectCoverUrl(cleanTitle, book.author);
    
    const updateData = { title: cleanTitle };
    if (correctCover) {
      updateData.cover_url = correctCover;
    }
    
    // Update Supabase
    const { error: updateErr } = await supabase
      .from("books")
      .update(updateData)
      .eq("id", book.id);
      
    if (updateErr) {
      console.error(`更新資料庫失敗 [${book.title}]:`, updateErr.message);
    } else {
      updatedCount++;
      const coverMsg = correctCover ? `並套用新版封面：\n   └─ ${correctCover}` : "（封面維持原樣）";
      console.log(`[更新成功] (${updatedCount}) 已清理書名為「${cleanTitle}」${coverMsg}`);
    }
    
    // Add small delay to avoid Open Library rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n🎉 書名清理與封面更新完畢！共成功更新 ${updatedCount} 筆書籍。`);
  process.exit(0);
}

startUpdating();
