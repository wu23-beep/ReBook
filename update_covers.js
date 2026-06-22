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

// Helper function to clean search terms (remove Chinese brackets and notes)
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

async function fetchCorrectCoverUrl(title, author) {
  const { cleanTitle, cleanAuthor } = getSearchQuery(title, author);
  const query = `${cleanTitle} ${cleanAuthor}`.trim();
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=3`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.docs && data.docs.length > 0) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
      }
    }
  } catch (err) {
    console.error(`查詢失敗 [${query}]:`, err.message);
  }
  
  // Fallback: title search only
  const fallbackUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=3`;
  try {
    const res = await fetch(fallbackUrl);
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
      }
    }
  } catch (err) {
    console.error(`備份查詢失敗 [${cleanTitle}]:`, err.message);
  }
  
  return null;
}

async function startUpdating() {
  console.log("正在從 Supabase 獲取所有書籍以更新正確封面...");
  
  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, author, cover_url");
    
  if (error) {
    console.error("無法取得書籍列表:", error.message);
    process.exit(1);
  }
  
  console.log(`共讀取到 ${books.length} 筆書籍。準備開始查詢正確封面...`);
  let updatedCount = 0;
  
  for (const book of books) {
    const correctCover = await fetchCorrectCoverUrl(book.title, book.author);
    
    if (correctCover) {
      // Update Supabase
      const { error: updateErr } = await supabase
        .from("books")
        .update({ cover_url: correctCover })
        .eq("id", book.id);
        
      if (updateErr) {
        console.error(`更新資料庫失敗 [${book.title}]:`, updateErr.message);
      } else {
        updatedCount++;
        console.log(`[更新成功] (${updatedCount}) 已為「${book.title}」套用真實封面：`);
        console.log(`   └─ ${correctCover}`);
      }
    } else {
      console.log(`[跳過/未找到]「${book.title}」未在 Google Books 找到適用封面，保留原圖。`);
    }
    
    // Add small delay to avoid Google API rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n🎉 封面更新完畢！共成功更新 ${updatedCount} 筆書籍封面圖。`);
  process.exit(0);
}

startUpdating();
