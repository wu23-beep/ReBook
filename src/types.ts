/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OwnerProfile {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  activeStatus: string; // e.g. "Active 2h ago"
  trustBadges: string[]; // e.g. ["Verified Lender", "34 Exchanges", "Punctual", "Accurate Description", "Fast Response"]
  department: string;
  school: string;
}

export interface CourseInfo {
  courseName: string;
  professorName: string;
  department: string;
  semester: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  edition?: string;
  price: number | null; // null represents Free or Donation
  condition: "New" | "Like New" | "Good" | "Fair" | "Old";
  tags: string[]; // e.g. ["Verified Lender", "Donation", "Like New"]
  department: string;
  school: string;
  professor: string;
  location: string;
  coverUrl: string;
  ownerId: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
  ownerRating?: number;
  ownerTrustBadges?: string[];
  courseInfo?: CourseInfo;
}

export interface ChatMessage {
  id: string;
  senderId: "user" | "other" | "system";
  senderName: string;
  text: string;
  imageUrl?: string;
  timestamp: string; // HH:mm
}

export interface Conversation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string;
  otherPartyName: string;
  otherPartyAvatar: string;
  messages: ChatMessage[];
  lastMessageTime: string;
}

export interface FilterState {
  searchQuery: string;
  school: string;
  department: string;
  professor: string;
  condition: string; // e.g., "All", "New", "Like New", "Good", etc.
  minPrice: string;
  maxPrice: string;
  sortBy: "Relevance" | "Price: Low to High" | "Condition: Best First";
}
