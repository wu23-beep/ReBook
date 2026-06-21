import { supabase } from "./supabase";
import { Book } from "../types";

export interface DatabaseBookRow {
  id: string;
  title: string;
  author: string;
  edition?: string | null;
  price: number | null;
  condition: "New" | "Like New" | "Good" | "Fair" | "Old";
  tags: string[] | null;
  department: string;
  school: string;
  professor: string;
  location: string;
  cover_url: string;
  owner_id: string;
  owner_name?: string | null;
  owner_avatar_url?: string | null;
  owner_rating?: number | null;
  owner_trust_badges?: string[] | null;
  course_name?: string | null;
  course_professor?: string | null;
  course_department?: string | null;
  course_semester?: string | null;
  created_at?: string;
}

export function mapRowToBook(row: DatabaseBookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    edition: row.edition || undefined,
    price: row.price,
    condition: row.condition,
    tags: row.tags || [],
    department: row.department,
    school: row.school,
    professor: row.professor,
    location: row.location,
    coverUrl: row.cover_url,
    ownerId: row.owner_id,
    ownerName: row.owner_name || undefined,
    ownerAvatarUrl: row.owner_avatar_url || undefined,
    ownerRating: row.owner_rating !== null ? Number(row.owner_rating) : undefined,
    ownerTrustBadges: row.owner_trust_badges || undefined,
    courseInfo: row.course_name ? {
      courseName: row.course_name,
      professorName: row.course_professor || "",
      department: row.course_department || "",
      semester: row.course_semester || ""
    } : undefined
  };
}

export function mapBookToRow(book: Omit<Book, "id"> & { id?: string }): Omit<DatabaseBookRow, "created_at"> {
  return {
    id: book.id || "", // Supabase will auto generate if empty string, or we can omit it if it's new
    title: book.title,
    author: book.author,
    edition: book.edition || null,
    price: book.price,
    condition: book.condition,
    tags: book.tags,
    department: book.department,
    school: book.school,
    professor: book.professor,
    location: book.location,
    cover_url: book.coverUrl,
    owner_id: book.ownerId,
    owner_name: book.ownerName || null,
    owner_avatar_url: book.ownerAvatarUrl || null,
    owner_rating: book.ownerRating !== undefined ? book.ownerRating : null,
    owner_trust_badges: book.ownerTrustBadges || null,
    course_name: book.courseInfo?.courseName || null,
    course_professor: book.courseInfo?.professorName || null,
    course_department: book.courseInfo?.department || null,
    course_semester: book.courseInfo?.semester || null
  };
}

/**
 * Fetch all books from Supabase, sorted by creation date descending.
 */
export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching books from Supabase:", error);
    throw error;
  }

  return (data as DatabaseBookRow[]).map(mapRowToBook);
}

/**
 * Add a new book to Supabase.
 */
export async function addBook(book: Omit<Book, "id">): Promise<Book> {
  const dbRow = mapBookToRow(book);
  
  // If id is empty, delete it so that Supabase generates a UUID automatically
  if (!dbRow.id) {
    delete (dbRow as any).id;
  }

  const { data, error } = await supabase
    .from("books")
    .insert([dbRow])
    .select("*")
    .single();

  if (error) {
    console.error("Error inserting book to Supabase:", error);
    throw error;
  }

  return mapRowToBook(data as DatabaseBookRow);
}
