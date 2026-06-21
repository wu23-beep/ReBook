/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, OwnerProfile, Conversation } from "./types";

export const MOCK_OWNERS: Record<string, OwnerProfile> = {
  "owner-alex": {
    id: "owner-alex",
    name: "Alex Chen",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG8jM-azr1sxrBx_5pVjKMCusHCXpDw8xRa6v8J6p1TYGehT2m7MuL3rWDM0dsJDuWYja2KW2tfKuHSsHivmHsFRuzSObXbZkAAV3sAGzz1xewQckHIMw6e5mVQJhtu4htrQuNKtUWSmuxhPanuaSCs4g-DTq5p-WffAe0ZlPy79Abwf2DcclGEnw8T0-dj3uV3G378Ejq9styzfIaBoQMr3d1I9ZwCz_80ERjfhbyY03kPHcNGPFMLZKhYr1UY6E-XBEG7F4RnEw",
    rating: 4.9,
    activeStatus: "Active 2h ago",
    trustBadges: ["Verified Lender", "34 Exchanges", "Punctual", "Accurate Description", "Fast Response"],
    department: "Economics & Policy",
    school: "National Taiwan University"
  },
  "owner-elena": {
    id: "owner-elena",
    name: "Elena Rostova",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX0gjGA7vLpDEK7dR6hed1KMRvpjbWzmrg8XnaDls1xbR4hylywITOrIq3ZnvtnGA7-7U9V2TUmwwMwqhgMOf1w2mmx4F8d9S3Ag0aDuLWJSnxc3IWHTGAV0Xvq4ufYbGtx0GqKJ63wmtzr0ys_YWeFzH_BFU1ACIP3I9GE_ZInmPRkFKqwWNGgS91gjmLjU6oYpkmX_rsz7z0eP2hGyPjEU-vM_0w7zttsW2oqWEwSZ3Vmdq8TqytZff8tHSwIp1OgBXWmabYgTY",
    rating: 4.8,
    activeStatus: "Active 5m ago",
    trustBadges: ["Friendly Lender", "12 Exchanges", "Punctual", "Fast Response"],
    department: "Literature & Arts",
    school: "National Taiwan University"
  },
  "owner-prof-chen": {
    id: "owner-prof-chen",
    name: "Prof. Chen (EE102)",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvSAcGKcNCqPxgQNQfUnI-p49nqH9w7aETJ90vhDL6qJ31a9AuLQZlHR4-pCP0gAUB2wPfTJ-VIHQS4XO288dF9RCoXnB-aLjjR0LD3Anc-8PNnVTj2tlxJ5WSWRlvcLkKbCJrzjhn62R-RMRfrJU25wE9CefFuvaV-3lilsZjdKQ4YLj_GmAQjtidjPvxRBnCMVsdBvMJc1ypsuKKlkzKE4RNGOprOHGMWXra4rE2aMNom0TW4tYh2FyBL8kY1iTldpxSWP0x6jA",
    rating: 5.0,
    activeStatus: "Active 10h ago",
    trustBadges: ["Department Lab", "50+ Donations", "Verified Faculty"],
    department: "Electrical Engineering",
    school: "National Taiwan University"
  }
};

export const MOCK_BOOKS: Book[] = [
  {
    id: "book-algorithms",
    title: "Introduction to Algorithms, 3rd Ed.",
    author: "Cormen, Leiserson, Rivest, Stein",
    price: 450,
    condition: "Like New",
    tags: ["Like New", "Verified Lender"],
    department: "Computer Science",
    school: "National Taiwan University",
    professor: "Dr. Smith",
    location: "Computer Science Dept.",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvKxddnUWY4p1b8tvcaHSPkEuxTSEfejzlLx0pt4NNg81ZW3VD3_ZMqDuDzucGxqjsAdryeeA0-3PTFVtK56QfxyCQmmUKbUmi1U4BcBRqYByWvj2nVyTEZPfrfyyZOag7UjmdSmC84nTdSfXdhJ4arVo7awQlqc0qE81E_1MpcO9zS9b31UwFqAgtzwIrJDeztq28qJKyyk_JJU3OrMyO7GQPxZxvb02bPNROMLniK7wGf0AROBWgq94BFdGuUSunjNBH3wkXRow",
    ownerId: "owner-alex",
    courseInfo: {
      courseName: "Computer Science 101: Data Structures",
      professorName: "Dr. Smith",
      department: "Computer Science & Engineering",
      semester: "Fall 2024"
    }
  },
  {
    id: "book-digital-logic",
    title: "Digital Logic Design",
    author: "M. Morris Mano",
    price: 320,
    condition: "Good",
    tags: ["Good"],
    department: "Electrical Engineering",
    school: "National Taiwan University",
    professor: "Prof. Chen",
    location: "Prof. Chen (EE102) Lab",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnRqXngaIfUEQtQ1Snm-E5MnPwZgiFlPAT8dQBjpS5PAhj_AI2u_VMw79014DyxJXzxniBqdTQ8ehjpVqHL_AyV_F3hZGihYmIcUWHgLQSSRd1QC2ZtbF7A3--7mqdRiX_uMC_4mbLOK8BCi6L5kyZYwwfVEJlVi-xcHvPqL0OQyfSZi-dQWf1yo3jcs3MoBw702H9SupeRgCXz8m1tsXkZl8fQWnE3DpKS0d9zGrpHjZZR1Liz4VhZL-nCY-syP3V1yNfiYHMYe8",
    ownerId: "owner-prof-chen",
    courseInfo: {
      courseName: "EE102: Introduction to Logic Circuits",
      professorName: "Prof. Chen",
      department: "Electrical Engineering",
      semester: "Spring 2024"
    }
  },
  {
    id: "book-cpp",
    title: "C++ How to Program",
    author: "Deitel & Deitel",
    price: null, // Free / Donation
    condition: "Fair",
    tags: ["Fair", "Donation"],
    department: "Computer Science",
    school: "National Taiwan University",
    professor: "Dr. Smith",
    location: "Main Campus Locker",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9CBa2i1-5mCnO58FmQY1fiyl81SXF9nn-fwOvbsY-UjvKuSfGSkU6_PJppbuYFe4PWj5SfjO4n7yf8HiyC_e_qo99EdHvpdAi-bZp5A2wPfvwx6B2eEpIQiAxLo38np6ctGu5Nb7cV09e4zkTwaRXdynlwtrtj7PC7w9cjtKooFLEJtRonpmHpLpKXNXqZeKiYxjt2Oz0v0nB2hrGzjzYk-LPWT0Ml3WfCXlmHIP-UM-WlUu29GHt-f2XcY--TbR73DwOyR9isYw",
    ownerId: "owner-alex",
    courseInfo: {
      courseName: "CS101: Basic Computer Programming",
      professorName: "Dr. Smith",
      department: "Computer Science Dept.",
      semester: "Fall 2024"
    }
  },
  {
    id: "book-economics",
    title: "Principles of Economics",
    author: "N. Gregory Mankiw",
    edition: "10th Edition",
    price: 450,
    condition: "Like New",
    tags: ["Like New", "Verified Lender"],
    department: "Economics",
    school: "National Taiwan University",
    professor: "Dr. Sarah Miller",
    location: "Student Lounge (North)",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhZqHiuAGpFu9t3dd6UQCQppbNMoyZjPlcpmlJywGN3tYmsj3EOc12qbB4Nyjbl38suNm9FbbVy8J7MVZy6ZgoEFrZbY3UGjaz9MXGho8tcDoQibWn7wVliOxy1Yl-KwPsTOJCd6sPqzguBzZ4FPm_2I8c5Dc0VnE1kk47BNtvVEWS9YByFysqhrTBbi_-KHxCMY8kDPSVPyFE3WF-WXSPyZDylGJoObGpQGuDueyf9rK3TqB7rgHtaNME0W1VBqRNBOGuvHGwt0s",
    ownerId: "owner-alex",
    courseInfo: {
      courseName: "Intro to Microeconomics",
      professorName: "Dr. Sarah Miller",
      department: "Economics & Policy",
      semester: "Fall 2024"
    }
  },
  {
    id: "book-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: null,
    condition: "Good",
    tags: ["Good", "Donation"],
    department: "Literature & Arts",
    school: "National Taiwan University",
    professor: "Dr. Sarah Miller",
    location: "Main Library Room 204",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcMvmThDowgc8vbSU20wKhpAb609e9U5tQmf5ffjHHceZGrpnIAHY7kEwcqL40emPg3Iewgb6EY9xUpC2SDYTUDy-k3ntO88z7MkCbuLQt5cCd3tKB4OYatkQP-Q6Wp_tQwWllb9zdFH5ekspHCy3dlPw8PF5dZzHbF2N9xBTRr2KwtYvvAx8kqRjMMfwPdvwUES0_aiFIGsZTtFLwrMpyfXhPAqVDqb0eX9szAcWbepoiSpqB55QFssLWU60AYxLcRM1mGhhRskc",
    ownerId: "owner-elena",
    courseInfo: {
      courseName: "English Literature Elective",
      professorName: "Dr. Sarah Miller",
      department: "Literature & Arts",
      semester: "Fall 2024"
    }
  },
  {
    id: "book-macroeconomics",
    title: "Macroeconomics",
    author: "N. Gregory Mankiw",
    price: 550,
    condition: "New",
    tags: ["New", "Verified Lender"],
    department: "Economics",
    school: "National Taiwan University",
    professor: "Dr. Sarah Miller",
    location: "Main Campus Locker",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATRzJVUUcYKTHOMNQnKxbT7a4_uDYTLRgzl3XGVjE3GWvSP8cU_opjJpZs9jiUAeIalfLxuayiNx7J7PlkFVNnzYc0XLpId9j7tLQeXhqsjBdCYxUzfyT6ahCxUPaAfLTmuh5t7iTWKXtF5uO17VXPrOsMgOzWy5IDdov8px3EPfmIXfU6y0JtgSngV_cn-b-MnPXiH_koTZ31ZEihqT3MtqAGM-lU_zz96jzRyGGqfcprsLuT0MuMaige48OrqWKfceCV4bpIjTw",
    ownerId: "owner-alex"
  },
  {
    id: "book-wealth-of-nations",
    title: "The Wealth of Nations",
    author: "Adam Smith",
    price: 150,
    condition: "Fair",
    tags: ["Fair", "Donation"],
    department: "Economics",
    school: "National Taiwan University",
    professor: "Dr. Sarah Miller",
    location: "Social Sciences Library",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyP7fsUQGI9qoJpqHDYcrgSM8c1C7KL9N7-coCEXhuoy5OOEBbPLPt2avD2ejmHqiUkTvTv53HrdcSmdosVwmiqcJJUSDFp0HUAjE9dwa1zMnDWp0tIxUf2kDMIcHwTn2bIWUG7-sb3GliYnK3aPPGj0RtmIL5eY_Xvq-2yRj4DZuI20t-c6GIcZAsAHqq_J7o6Pkvroin8w8xEoPGDT5eLyxUWCLGQTrOUJzFcX4NAGH0ymg9Q5Yrslad4HDeCHj8Rd93O0eu660",
    ownerId: "owner-alex"
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-algorithms",
    bookId: "book-001",
    bookTitle: "Introduction to Algorithms, 3rd Ed.",
    bookCoverUrl: "https://images-na.ssl-images-amazon.com/images/P/0262033844.01.LZZZZZZZ.jpg",
    otherPartyName: "Alex Chen",
    otherPartyAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG8jM-azr1sxrBx_5pVjKMCusHCXpDw8xRa6v8J6p1TYGehT2m7MuL3rWDM0dsJDuWYja2KW2tfKuHSsHivmHsFRuzSObXbZkAAV3sAGzz1xewQckHIMw6e5mVQJhtu4htrQuNKtUWSmuxhPanuaSCs4g-DTq5p-WffAe0ZlPy79Abwf2DcclGEnw8T0-dj3uV3G378Ejq9styzfIaBoQMr3d1I9ZwCz_80ERjfhbyY03kPHcNGPFMLZKhYr1UY6E-XBEG7F4RnEw",
    lastMessageTime: "16:05",
    messages: [
      {
        id: "m1-1",
        senderId: "user",
        senderName: "Emily",
        text: "哈囉 Alex，想詢問這本演算法導論（Cormen）還在嗎？",
        timestamp: "15:30"
      },
      {
        id: "m1-2",
        senderId: "other",
        senderName: "Alex",
        text: "哈囉 Emily！在的喔！書本保存得很好，沒有缺頁，只有第一章有鉛筆寫過幾題練習題的痕跡，其他大部分地方都是乾淨的。",
        timestamp: "15:45"
      },
      {
        id: "m1-3",
        senderId: "user",
        senderName: "Emily",
        text: "那太好了，我想用 450 元購買！請問方不方便週一下午約在總圖面交？",
        timestamp: "15:50"
      },
      {
        id: "m1-4",
        senderId: "other",
        senderName: "Alex",
        text: "週一下午的話我三點剛好有課，不然改約四點在活大正門呢？那時我剛好在附近下課。",
        timestamp: "15:58"
      },
      {
        id: "m1-5",
        senderId: "system",
        senderName: "系統",
        text: "📅 Emily Wang 已發起二手書面交預約！面交地點：國立臺灣大學 第一學生活動中心 (活大) 正門，日期：2026-06-22，時間 16:00。等待對方的確認中。",
        timestamp: "16:01"
      },
      {
        id: "m1-6",
        senderId: "other",
        senderName: "Alex",
        text: "太棒了！我已經確認並接受這個相約面交。到時候原約定時間與地點見囉！🤝",
        timestamp: "16:05"
      }
    ]
  },
  {
    id: "conv-economics",
    bookId: "book-005",
    bookTitle: "Principles of Economics, 7th Ed.",
    bookCoverUrl: "https://images-na.ssl-images-amazon.com/images/P/128516587X.01.LZZZZZZZ.jpg",
    otherPartyName: "Elena Rostova",
    otherPartyAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX0gjGA7vLpDEK7dR6hed1KMRvpjbWzmrg8XnaDls1xbR4hylywITOrIq3ZnvtnGA7-7U9V2TUmwwMwqhgMOf1w2mmx4F8d9S3Ag0aDuLWJSnxc3IWHTGAV0Xvq4ufYbGtx0GqKJ63wmtzr0ys_YWeFzH_BFU1ACIP3I9GE_ZInmPRkFKqwWNGgS91gjmLjU6oYpkmX_rsz7z0eP2hGyPjEU-vM_0w7zttsW2oqWEwSZ3Vmdq8TqytZff8tHSwIp1OgBXWmabYgTY",
    lastMessageTime: "昨日",
    messages: [
      {
        id: "m2-1",
        senderId: "other",
        senderName: "Elena",
        text: "嗨！請問這本經濟學原理還在嗎？我是大一的新生，這學期必修想找這本教科書。",
        timestamp: "11:20"
      },
      {
        id: "m2-2",
        senderId: "user",
        senderName: "Emily",
        text: "嗨！還在喔，這本我上學期剛上完，裡面的筆記算整理得滿乾淨的，主要都是用螢光筆畫一些重要定義。",
        timestamp: "11:25"
      },
      {
        id: "m2-3",
        senderId: "other",
        senderName: "Elena",
        text: "那太好了，想問一下可以約在社科院圖書館那邊面交嗎？平時下課比較方便過去。",
        timestamp: "11:32"
      },
      {
        id: "m2-4",
        senderId: "user",
        senderName: "Emily",
        text: "社科院面交完全沒問題喔！我通常星期二、四中午都在社科院大樓上課，12:30 可以面交。",
        timestamp: "11:40"
      },
      {
        id: "m2-5",
        senderId: "system",
        senderName: "系統",
        text: "📅 Elena Rostova 已發起二手書面交預約！面交地點：國立臺灣大學 社會科學院大樓大門，日期：2026-06-23，時間 12:30。等待對方的確認中。",
        timestamp: "11:42"
      },
      {
        id: "m2-6",
        senderId: "user",
        senderName: "Emily",
        text: "沒問題，我已經確認了！星期二見囉！",
        timestamp: "11:50"
      }
    ]
  },
  {
    id: "conv-logic",
    bookId: "book-002",
    bookTitle: "Digital Design: With an Introduction to the Verilog HDL",
    bookCoverUrl: "https://images-na.ssl-images-amazon.com/images/P/0132774208.01.LZZZZZZZ.jpg",
    otherPartyName: "Prof. Chen (EE102)",
    otherPartyAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvSAcGKcNCqPxgQNQfUnI-p49nqH9w7aETJ90vhDL6qJ31a9AuLQZlHR4-pCP0gAUB2wPfTJ-VIHQS4XO288dF9RCoXnB-aLjjR0LD3Anc-8PNnVTj2tlxJ5WSWRlvcLkKbCJrzjhn62R-RMRfrJU25wE9CefFuvaV-3lilsZjdKQ4YLj_GmAQjtidjPvxRBnCMVsdBvMJc1ypsuKKlkzKE4RNGOprOHGMWXra4rE2aMNom0TW4tYh2FyBL8kY1iTldpxSWP0x6jA",
    lastMessageTime: "2天前",
    messages: [
      {
        id: "m3-1",
        senderId: "user",
        senderName: "Emily",
        text: "陳教授您好，我看到實驗室有捐贈這本數位邏輯設計，請問我可以直接去實驗室索取嗎？",
        timestamp: "10:15"
      },
      {
        id: "m3-2",
        senderId: "other",
        senderName: "Prof.",
        text: "同學你好，可以的。這本是學長姐留給系上學弟妹的捐贈書，不需要任何費用。目前書放在 EE102 實驗室外面的書架上，可以直接去索取。",
        timestamp: "10:45"
      },
      {
        id: "m3-3",
        senderId: "user",
        senderName: "Emily",
        text: "太感謝教授了！那我可以在星期三早上去拿嗎？需要跟助教打招呼嗎？",
        timestamp: "11:00"
      },
      {
        id: "m3-4",
        senderId: "other",
        senderName: "Prof.",
        text: "直接過去跟裡面的值班助教說是要拿 ReBook 捐贈書的就可以了。助教知道這件事。下課時間都可以去。",
        timestamp: "11:15"
      },
      {
        id: "m3-5",
        senderId: "user",
        senderName: "Emily",
        text: "好的，謝謝教授，我會星期三早上 10:00 左右過去拿！祝教授順心！",
        timestamp: "11:30"
      }
    ]
  }
];

export const MOCK_WISHLIST: { id: string; title: string; author: string; coverUrl: string; alertsOn: boolean; hasActiveListing: boolean }[] = [
  {
    id: "wishlist-capital",
    title: "Capital in the 21st Century",
    author: "Thomas Piketty",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhZqHiuAGpFu9t3dd6UQCQppbNMoyZjPlcpmlJywGN3tYmsj3EOc12qbB4Nyjbl38suNm9FbbVy8J7MVZy6ZgoEFrZbY3UGjaz9MXGho8tcDoQibWn7wVliOxy1Yl-KwPsTOJCd6sPqzguBzZ4FPm_2I8c5Dc0VnE1kk47BNtvVEWS9YByFysqhrTBbi_-KHxCMY8kDPSVPyFE3WF-WXSPyZDylGJoObGpQGuDueyf9rK3TqB7rgHtaNME0W1VBqRNBOGuvHGwt0s",
    alertsOn: true,
    hasActiveListing: true
  },
  {
    id: "wishlist-wealth",
    title: "The Wealth of Nations",
    author: "Adam Smith",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyP7fsUQGI9qoJpqHDYcrgSM8c1C7KL9N7-coCEXhuoy5OOEBbPLPt2avD2ejmHqiUkTvTv53HrdcSmdosVwmiqcJJUSDFp0HUAjE9dwa1zMnDWp0tIxUf2kDMIcHwTn2bIWUG7-sb3GliYnK3aPPGj0RtmIL5eY_Xvq-2yRj4DZuI20t-c6GIcZAsAHqq_J7o6Pkvroin8w8xEoPGDT5eLyxUWCLGQTrOUJzFcX4NAGH0ymg9Q5Yrslad4HDeCHj8Rd93O0eu660",
    alertsOn: false,
    hasActiveListing: false
  }
];
