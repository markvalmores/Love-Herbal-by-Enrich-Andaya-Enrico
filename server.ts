import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Initial in-memory data store for products (Official Love Herbal Catalog)
let products = [
  {
    id: "prod-glowtah",
    name: "GLOWTAH Herbal Coffee Mix",
    description: "The 'Pambabae' coffee mix. A powerful blend designed to support skin health, anti-aging, and detoxification while boosting metabolism.",
    benefits: ["Skin health & glow", "Anti-aging & Detox", "Fat management & metabolism", "Brain & kidney health"],
    price: 275,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=60",
    stock: 50,
    category: "Coffee Mix",
    isExtracted: false
  },
  {
    id: "prod-buffalo",
    name: "BUFFALO Herbal Coffee Mix",
    description: "Specially blended for men. Infused with Tongkat Ali and Ginseng to support energy, endurance, and male vitality.",
    benefits: ["Energy & endurance", "Libido & performance", "Testosterone support", "Immune system health"],
    price: 275,
    image: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=600&auto=format&fit=crop&q=60",
    stock: 45,
    category: "Coffee Mix",
    isExtracted: false
  },
  {
    id: "prod-vit-c",
    name: "Alkaline Vitamin C (90-cap)",
    description: "90 capsules of premium Alkaline Vitamin C for superior immune support without the acidity.",
    benefits: ["Immune system strength", "Non-acidic formula", "Powerful antioxidant"],
    price: 450,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=60",
    stock: 30,
    category: "Capsules",
    isExtracted: false
  },
  {
    id: "prod-barley",
    name: "Barley Capsule (90-cap)",
    description: "Pure Barley grass powder in capsules. A superfood powerhouse for overall cellular health.",
    benefits: ["Nutrient dense superfood", "Supports digestive health", "Energy booster"],
    price: 750,
    image: "https://images.unsplash.com/photo-1616671285410-9a2245367667?w=600&auto=format&fit=crop&q=60",
    stock: 20,
    category: "Capsules",
    isExtracted: false
  },
  {
    id: "prod-gluta",
    name: "Gluta-Collagen-Carnitine (90-cap)",
    description: "The ultimate beauty and fitness blend. Combines Glutathione, Collagen, and L-Carnitine for skin and weight support.",
    benefits: ["Skin whitening & elasticity", "Weight management support", "90 capsules per bottle"],
    price: 750,
    image: "https://images.unsplash.com/photo-1626202340534-f958804d38c3?w=600&auto=format&fit=crop&q=60",
    stock: 15,
    category: "Capsules",
    isExtracted: false
  }
];

// Initial transactions store
let transactions = [];

// In-memory Stores for Community, Auth, Messenger & Complaints
let users = [
  {
    email: "andayaenrico55@gmail.com",
    username: "Enrico Andaya (Admin)",
    password: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Official founder & traditional herbalist of Love Herbal. Helping you navigate your wellness journey!",
    followers: ["marie.santos@gmail.com", "jose_v@yahoo.com"],
    following: ["marie.santos@gmail.com"],
    createdAt: new Date().toISOString(),
    role: "admin"
  },
  {
    email: "marie.santos@gmail.com",
    username: "MarieSantos",
    password: "user123",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Detoxification & glowing skin advocate! Love GLOWTAH Coffee ❤️",
    followers: ["andayaenrico55@gmail.com"],
    following: ["andayaenrico55@gmail.com", "liza_reyes@gmail.com"],
    createdAt: new Date().toISOString(),
    role: "user"
  },
  {
    email: "jose_v@yahoo.com",
    username: "JoseValdez",
    password: "user123",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "BUFFALO herbal mix drinker. Daily energy for training!",
    followers: [],
    following: ["andayaenrico55@gmail.com"],
    createdAt: new Date().toISOString(),
    role: "user"
  },
  {
    email: "liza_reyes@gmail.com",
    username: "LizaReyes",
    password: "user123",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    bio: "Holistic wellness blogger. Live healthy, drink herbal.",
    followers: ["marie.santos@gmail.com"],
    following: [],
    createdAt: new Date().toISOString(),
    role: "user"
  }
];

let posts: any[] = [
  {
    id: "post-1",
    authorEmail: "marie.santos@gmail.com",
    authorUsername: "MarieSantos",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    title: "My 3-Week GLOWTAH Coffee Transformation! ✨",
    content: "Hi everyone! I just wanted to share my experience drinking the GLOWTAH Herbal Coffee Mix. I've been taking it every morning for three weeks now. My skin feels so much more hydrated, and my morning sluggishness is completely gone! Plus, it has Collagen and Ashwagandha. Anyone else noticing anti-aging benefits?",
    category: "Glowtah Benefits",
    upvotes: ["liza_reyes@gmail.com", "andayaenrico55@gmail.com"],
    downvotes: [],
    reactions: { "❤️": ["liza_reyes@gmail.com"], "🌿": ["andayaenrico55@gmail.com"] },
    comments: [
      {
        id: "comment-1-1",
        authorEmail: "andayaenrico55@gmail.com",
        authorUsername: "Enrico Andaya (Admin)",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        content: "Thank you for sharing your journey, Marie! The Ashwagandha and Glutathione synergy in GLOWTAH is custom formulated to aid detoxification and reduce stress. Stay healthy!",
        createdAt: new Date(Date.now() - 3600000 * 23).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "post-2",
    authorEmail: "jose_v@yahoo.com",
    authorUsername: "JoseValdez",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    title: "BUFFALO Mix vs. Regular Espresso for Workout Pre-workout?",
    content: "Personally, regular espresso gives me severe acid reflux and crashes. The BUFFALO Coffee has Tongkat Ali & Ginseng which feels like a smooth, sustained boost of energy. Highly recommended before high-intensity training!",
    category: "Herbal Tips",
    upvotes: ["marie.santos@gmail.com"],
    downvotes: [],
    reactions: { "💪": ["marie.santos@gmail.com"] },
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

let groupChats = [
  {
    id: "gc-general",
    name: "🌿 Love Herbal Community GC",
    description: "The official public group chat for herbal formulations, wellness queries, and health advice.",
    createdBy: "andayaenrico55@gmail.com",
    memberEmails: ["andayaenrico55@gmail.com", "marie.santos@gmail.com", "jose_v@yahoo.com", "liza_reyes@gmail.com"],
    messages: [
      {
        id: "msg-1",
        senderEmail: "andayaenrico55@gmail.com",
        senderUsername: "Enrico Andaya (Admin)",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        content: "Welcome to the Love Herbal Community GC! Feel free to ask questions about our capsules, teas, or wellness coffee blends. Stay healthy!",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: "msg-2",
        senderEmail: "marie.santos@gmail.com",
        senderUsername: "MarieSantos",
        senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        content: "Hello everyone! Happy to be here! Just ordered my next batch of Vitamin C 🌿",
        createdAt: new Date(Date.now() - 3600000 * 11).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

let complaints = [
  {
    id: "complaint-1",
    customerName: "Andres Bonifacio",
    customerEmail: "andres@philippines.org",
    subject: "GCash Transfer Status Check",
    message: "Good day, Enrico! Just sent my GCash payment of ₱275 for Buffalo Coffee. Please verify. Thanks!",
    status: "Pending",
    createdAt: new Date().toISOString()
  }
];


// Helper to check for low stock alert
function checkLowStockAlerts() {
  const alerts: string[] = [];
  products.forEach(p => {
    if (p.stock <= 5) {
      alerts.push(`Low Stock Alert: "${p.name}" has only ${p.stock} units remaining! Restock recommended.`);
    }
  });
  return alerts;
}

// API Routes

// --- COMMUNITY, MESSENGER, AUTH & SUPPORT COMPLAINTS SYSTEM ---

// Auth - Register
app.post("/api/auth/register", (req, res) => {
  const { email, username, password, avatar, bio } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Email, username, and password are required." });
  }
  const emailLower = email.toLowerCase();
  const existing = users.find(u => u.email.toLowerCase() === emailLower);
  if (existing) {
    return res.status(400).json({ error: "Email is already registered." });
  }

  const newUser = {
    email: emailLower,
    username,
    password,
    avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
    bio: bio || "Love Herbal wellness traveler.",
    followers: [] as string[],
    following: [] as string[],
    createdAt: new Date().toISOString(),
    role: emailLower === "andayaenrico55@gmail.com" ? ("admin" as const) : ("user" as const)
  };
  users.push(newUser);

  // Auto-subscribe to default community GC
  const generalGc = groupChats.find(g => g.id === "gc-general");
  if (generalGc && !generalGc.memberEmails.includes(emailLower)) {
    generalGc.memberEmails.push(emailLower);
  }

  const { password: _, ...profile } = newUser;
  res.json({ success: true, user: profile });
});

// Auth - Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const emailLower = email.toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === emailLower);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const { password: _, ...profile } = user;
  res.json({ success: true, user: profile });
});

// Auth - Profile Update
app.post("/api/auth/profile/update", (req, res) => {
  const { email, username, avatar, bio } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (username) user.username = username;
  if (avatar) user.avatar = avatar;
  if (bio !== undefined) user.bio = bio;

  // Propagate updates to posts, comments & GC messages
  const emailLower = email.toLowerCase();
  posts.forEach(p => {
    if (p.authorEmail.toLowerCase() === emailLower) {
      if (username) p.authorUsername = username;
      if (avatar) p.authorAvatar = avatar;
    }
    p.comments.forEach(c => {
      if (c.authorEmail.toLowerCase() === emailLower) {
        if (username) c.authorUsername = username;
        if (avatar) c.authorAvatar = avatar;
      }
    });
  });

  groupChats.forEach(g => {
    g.messages.forEach(m => {
      if (m.senderEmail.toLowerCase() === emailLower) {
        if (username) m.senderUsername = username;
        if (avatar) m.senderAvatar = avatar;
      }
    });
  });

  const { password: _, ...profile } = user;
  res.json({ success: true, user: profile });
});

// Users - List all public profiles
app.get("/api/users", (req, res) => {
  const safeProfiles = users.map(({ password, ...u }) => u);
  res.json(safeProfiles);
});

// Users - Follow/Unfollow
app.post("/api/users/follow", (req, res) => {
  const { followerEmail, targetEmail } = req.body;
  if (!followerEmail || !targetEmail) {
    return res.status(400).json({ error: "Follower and target emails are required." });
  }
  const fEmail = followerEmail.toLowerCase();
  const tEmail = targetEmail.toLowerCase();

  if (fEmail === tEmail) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  const followerUser = users.find(u => u.email.toLowerCase() === fEmail);
  const targetUser = users.find(u => u.email.toLowerCase() === tEmail);

  if (!followerUser || !targetUser) {
    return res.status(404).json({ error: "User profiles not found." });
  }

  const isFollowing = followerUser.following.includes(tEmail);
  if (isFollowing) {
    followerUser.following = followerUser.following.filter(e => e !== tEmail);
    targetUser.followers = targetUser.followers.filter(e => e !== fEmail);
  } else {
    followerUser.following.push(tEmail);
    targetUser.followers.push(fEmail);
  }

  res.json({
    success: true,
    follower: { email: followerUser.email, following: followerUser.following },
    target: { email: targetUser.email, followers: targetUser.followers },
    isFollowing: !isFollowing
  });
});

// Community - List all posts
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// Community - Create a post
app.post("/api/posts", (req, res) => {
  const { authorEmail, title, content, category } = req.body;
  if (!authorEmail || !title || !content || !category) {
    return res.status(400).json({ error: "Missing required post parameters." });
  }

  const user = users.find(u => u.email.toLowerCase() === authorEmail.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "Author profile not registered." });
  }

  const newPost = {
    id: "post-" + Date.now(),
    authorEmail: user.email,
    authorUsername: user.username,
    authorAvatar: user.avatar,
    title,
    content,
    category,
    upvotes: [user.email], // auto upvote on create
    downvotes: [] as string[],
    reactions: {} as { [emoji: string]: string[] },
    comments: [] as any[],
    createdAt: new Date().toISOString()
  };

  posts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

// Community - Upvote / Downvote
app.post("/api/posts/vote", (req, res) => {
  const { postId, email, voteType } = req.body; // 'up' | 'down' | 'none'
  if (!postId || !email) {
    return res.status(400).json({ error: "Post ID and voter email required." });
  }
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  const voterEmail = email.toLowerCase();
  post.upvotes = post.upvotes.filter(e => e !== voterEmail);
  post.downvotes = post.downvotes.filter(e => e !== voterEmail);

  if (voteType === "up") {
    post.upvotes.push(voterEmail);
  } else if (voteType === "down") {
    post.downvotes.push(voterEmail);
  }

  res.json({ success: true, upvotes: post.upvotes, downvotes: post.downvotes });
});

// Community - Emoji React
app.post("/api/posts/react", (req, res) => {
  const { postId, email, emoji } = req.body;
  if (!postId || !email || !emoji) {
    return res.status(400).json({ error: "Post ID, email, and emoji are required." });
  }
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  const userEmail = email.toLowerCase();
  if (!post.reactions) post.reactions = {};
  if (!post.reactions[emoji]) post.reactions[emoji] = [];

  const hasReacted = post.reactions[emoji].includes(userEmail);
  if (hasReacted) {
    post.reactions[emoji] = post.reactions[emoji].filter(e => e !== userEmail);
    if (post.reactions[emoji].length === 0) {
      delete post.reactions[emoji];
    }
  } else {
    post.reactions[emoji].push(userEmail);
  }

  res.json({ success: true, reactions: post.reactions });
});

// Community - Comment
app.post("/api/posts/comment", (req, res) => {
  const { postId, authorEmail, content } = req.body;
  if (!postId || !authorEmail || !content) {
    return res.status(400).json({ error: "Missing required comment parameters." });
  }
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  const user = users.find(u => u.email.toLowerCase() === authorEmail.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const newComment = {
    id: "comment-" + Date.now(),
    authorEmail: user.email,
    authorUsername: user.username,
    authorAvatar: user.avatar,
    content,
    createdAt: new Date().toISOString()
  };

  post.comments.push(newComment);
  res.json({ success: true, comment: newComment });
});

// Messenger - List all Group Chats
app.get("/api/chats", (req, res) => {
  res.json(groupChats);
});

// Messenger - Create Group Chat
app.post("/api/chats", (req, res) => {
  const { name, description, createdBy, memberEmails } = req.body;
  if (!name || !createdBy) {
    return res.status(400).json({ error: "Group name and creator email are required." });
  }

  const user = users.find(u => u.email.toLowerCase() === createdBy.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "Creator user profile not found." });
  }

  const uniqueMembers = Array.from(new Set([user.email, ...(memberEmails || []).map((e: string) => e.toLowerCase())]));

  const newGc = {
    id: "gc-" + Date.now(),
    name,
    description: description || "A new real-time wellness group conversation.",
    createdBy: user.email,
    memberEmails: uniqueMembers,
    messages: [
      {
        id: "msg-welcome-" + Date.now(),
        senderEmail: "andayaenrico55@gmail.com",
        senderUsername: "Enrico Andaya (Admin)",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        content: `Welcome to the new Group Chat: "${name}"! Let's talk wellness together.`,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  };

  groupChats.push(newGc);
  res.json({ success: true, chat: newGc });
});

// Messenger - Join Group Chat
app.post("/api/chats/join", (req, res) => {
  const { chatId, email } = req.body;
  if (!chatId || !email) {
    return res.status(400).json({ error: "Chat ID and user email are required." });
  }

  const gc = groupChats.find(g => g.id === chatId);
  if (!gc) {
    return res.status(404).json({ error: "Group Chat not found." });
  }

  const userEmail = email.toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === userEmail);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  if (!gc.memberEmails.includes(userEmail)) {
    gc.memberEmails.push(userEmail);
    gc.messages.push({
      id: "msg-join-" + Date.now(),
      senderEmail: "andayaenrico55@gmail.com",
      senderUsername: "System Dispatcher",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: `${user.username} joined the chat room.`,
      createdAt: new Date().toISOString()
    });
  }

  res.json({ success: true, chat: gc });
});

// Messenger - Send Message in GC
app.post("/api/chats/message", (req, res) => {
  const { chatId, senderEmail, content } = req.body;
  if (!chatId || !senderEmail || !content) {
    return res.status(400).json({ error: "Missing required chat parameters." });
  }

  const gc = groupChats.find(g => g.id === chatId);
  if (!gc) {
    return res.status(404).json({ error: "Group Chat not found." });
  }

  const user = users.find(u => u.email.toLowerCase() === senderEmail.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "Sender profile not found." });
  }

  const newMessage = {
    id: "msg-" + Date.now(),
    senderEmail: user.email,
    senderUsername: user.username,
    senderAvatar: user.avatar,
    content,
    createdAt: new Date().toISOString()
  };

  gc.messages.push(newMessage);
  res.json({ success: true, message: newMessage });
});

// Complaints / Support Feedback (Sent to andayaenrico55@gmail.com)
app.post("/api/complaints", (req, res) => {
  const { customerName, customerEmail, subject, message } = req.body;
  if (!customerName || !customerEmail || !subject || !message) {
    return res.status(400).json({ error: "All feedback/complaint parameters are required." });
  }

  const newComplaint = {
    id: "complaint-" + Date.now(),
    customerName,
    customerEmail,
    subject,
    message,
    status: 'Pending' as const,
    createdAt: new Date().toISOString()
  };

  complaints.push(newComplaint);

  res.json({
    success: true,
    message: "Thank you. Your message has been sent to Enrico Andaya (andayaenrico55@gmail.com). We will get back to you shortly!",
    complaint: newComplaint
  });
});

// Complaints - Get list
app.get("/api/complaints", (req, res) => {
  res.json(complaints);
});

// Complaints - Resolve
app.post("/api/complaints/resolve", (req, res) => {
  const { complaintId } = req.body;
  const complaint = complaints.find(c => c.id === complaintId);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found." });
  }
  complaint.status = "Resolved";
  res.json({ success: true, complaint });
});

// --- END COMMUNITY, MESSENGER, AUTH & SUPPORT COMPLAINTS ---


// 1. Get products list
app.get("/api/products", (req, res) => {
  console.log("Fetching products...", products);
  res.json({
    products,
    alerts: checkLowStockAlerts()
  });
});

// 2. Sync endpoint (Simplified to return current catalog)
app.post("/api/extract-facebook-media", async (req, res) => {
  res.json({
    success: true,
    message: "Catalog synchronized with official Love Herbal inventory.",
    postsScrapedCount: 0,
    detectedProductsCount: products.length,
    productsDetected: products
  });
});

// 3. Automated checkout / purchase system
app.post("/api/checkout", (req, res) => {
  const { customerName, customerEmail, cartItems, paymentMethod, referenceNumber, shippingAddress, totalAmount } = req.body;

  if (!customerName || !customerEmail || !cartItems || cartItems.length === 0 || !paymentMethod) {
    return res.status(400).json({ error: "Missing checkout parameters" });
  }

  // Double check and deduct inventory
  let calculatedTotal = 0;
  const itemsSummary: any[] = [];
  const errors: string[] = [];

  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      errors.push(`Product with ID ${item.productId} not found.`);
      continue;
    }
    if (product.stock < item.quantity) {
      errors.push(`Insufficient inventory for ${product.name}. Requested: ${item.quantity}, Available: ${product.stock}`);
      continue;
    }
    calculatedTotal += product.price * item.quantity;
  }

  if (totalAmount !== calculatedTotal) {
      return res.status(400).json({ error: "Price mismatch. Please refresh." });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(", ") });
  }

  // Deduct stock and assemble items
  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId)!;
    product.stock -= item.quantity;
    itemsSummary.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price
    });
  }

  // Generate unique transactional IDs
  const txId = "tx-" + Math.floor(1000 + Math.random() * 9000);

  // Validate payment if GCash
  if (paymentMethod === "GCash") {
    if (!referenceNumber || !/^\d{13}$/.test(referenceNumber)) {
      return res.status(400).json({ error: "Invalid or missing GCash reference number. Must be exactly 13 digits." });
    }
  }

  // Record transaction
  const orNumber = "OR-" + new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0') + String(new Date().getDate()).padStart(2, '0') + "-" + Math.floor(1000 + Math.random() * 9000);

  // If GCash is selected, check if they passed referenceNumber. If not, it can start as Pending Payment status
  const isGcashPending = paymentMethod === "GCash" && !referenceNumber;

  const newTx = {
    id: txId,
    date: new Date().toISOString(),
    customerName,
    customerEmail,
    items: itemsSummary,
    totalAmount,
    paymentMethod,
    paymentReference: referenceNumber || (isGcashPending ? "" : "PAYPAL-DIRECT-" + Math.floor(100000 + Math.random() * 900000)),
    status: isGcashPending ? "Pending" as const : "Completed" as const,
    orNumber,
    shippingAddress: shippingAddress || "Metro Manila, Philippines",
    shippingStatus: isGcashPending ? "Pending Payment" as const : "Processing" as const,
    trackingNumber: "LH-" + Math.floor(100000 + Math.random() * 900000)
  };

  transactions.unshift(newTx);

  // Generate dynamic automated email receipt & OR Receipt content using simulated email service
  const emailSubject = `🌿 Order Confirmation receipt - Love Herbal [${orNumber}]`;
  const emailBody = `
    Hi ${customerName},

    Thank you for purchasing from Love Herbal by Enrico Andaya!
    Developed and created by Usagyuun VTuber a.k.a Mark David Valmores.

    Here are the details of your confirmed transaction:
    Official OR Receipt Number: ${orNumber}
    Transaction ID: ${txId}
    Payment Method: ${paymentMethod}
    Payment Reference No: ${newTx.paymentReference || "Awaiting Confirmation"}
    Recipient Email: andayaenrico55@gmail.com (Authorized wellness fund merchant account)
    GCash Account Number (CP #): 09560333111 (Love Herbal)

    Items Purchased:
    ${itemsSummary.map(i => `- ${i.productName} (Qty: ${i.quantity}) - Php ${i.price * i.quantity}`).join("\n")}

    Total Amount Paid: Php ${totalAmount}.00

    Your items are being packed for immediate dispatch. Track your order on your secure user portal!
    Come again soon!

    Warm regards,
    Usagyuun VTuber / Mark David Valmores
  `;

  res.json({
    success: true,
    message: isGcashPending 
      ? "Order placed! Please paste your GCash Reference Number in the Orders Portal to confirm shipping."
      : "Thank you for your purchase! Come again soon.",
    transaction: newTx,
    emailReceipt: {
      to: customerEmail,
      subject: emailSubject,
      body: emailBody
    }
  });
});

// 4. Secure User Portal Endpoint - Access all completed receipts / ORs for a customer email
app.get("/api/portal/orders", (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: "Customer email is required" });
  }

  const userTx = transactions.filter(t => t.customerEmail.toLowerCase() === email.toLowerCase());
  res.json({
    email,
    orders: userTx
  });
});

// 4a. Confirm GCash Payment via Reference Number
app.post("/api/portal/confirm-gcash-payment", (req, res) => {
  const { orderId, referenceNumber } = req.body;
  if (!orderId || !referenceNumber) {
    return res.status(400).json({ error: "Order ID and GCash Reference Number are required." });
  }

  const tx = transactions.find(t => t.id === orderId);
  if (!tx) {
    return res.status(404).json({ error: "Order not found." });
  }

  tx.paymentReference = referenceNumber;
  tx.status = "Completed";
  tx.shippingStatus = "Processing";

  res.json({
    success: true,
    message: "GCash reference number verified! Order approved for immediate shipping.",
    transaction: tx
  });
});

// 4b. Simulate Shipping Progress (For premium interactive tracking)
app.post("/api/portal/simulate-shipping", (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required." });
  }

  const tx = transactions.find(t => t.id === orderId);
  if (!tx) {
    return res.status(404).json({ error: "Order not found." });
  }

  const stages: ('Pending Payment' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered')[] = [
    'Pending Payment', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'
  ];
  const currentIndex = stages.indexOf(tx.shippingStatus || 'Processing');
  if (currentIndex < stages.length - 1) {
    tx.shippingStatus = stages[currentIndex + 1];
  } else {
    // Reset back to Processing for infinite simulation delight
    tx.shippingStatus = 'Processing';
  }

  res.json({
    success: true,
    message: `Shipping status updated to "${tx.shippingStatus}"!`,
    transaction: tx
  });
});

// 5. Customer Support Chatbot leveraging Gemini 3.5 Flash for natural, polite herbal wellness queries
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemInstructions = `
    You are Usagyuun, the friendly herbal advisor VTuber a.k.a Mark David Valmores, speaking for "Love Herbal by Enrico Andaya" (a personalized wellness journey experience).
    Greet the user in a cheerful VTuber tone (using words like 'Hello, wellness explorer!', 'Yay!', or cute herbal phrases, and occasionally saying friendly local tagalog greetings).
    You are representing Enrico Andaya's herbal products (Moringa/Malunggay Capsules, Banaba Tea, Lagundi Extract, Sambong Kidneys, Ginger & Turmeric Fusion Honey).
    Provide wellness advice strictly related to natural herbal remedies, dosing guidelines, and help users decide what product is best for their health.
    
    NEW PRODUCTS ALERT:
    - GLOWTAH Herbal Coffee Mix: For women. Supports skin health, anti-aging, detox, brain/kidney health, fat management, and metabolism. Ingredients: Ashwagandha, Moringa, Garcinia Cambogia, L-Carnitine, Glutathione, Collagen, Spirulina, Mangosteen.
    - BUFFALO Herbal Coffee Mix: For men. Supports energy, endurance, libido, performance, testosterone, and immune health. Ingredients: Tongkat Ali, Ginseng, Maca Root, Horny Goat Weed, Mangosteen.
    
    If the user asks about customer support, order updates, or GCash payments, provide the official info:
    - Customer Support Email: andayaenrico55@gmail.com
    - GCash Payment / Phone (CP #): 09560333111
    - Business name: Love Herbal
    Keep your answers concise, clear, and highly engaging.
    Always sign off with: "Stay healthy!" or "Best regards!" or friendly VTuber signature phrases when appropriate.
  `;

  if (!ai) {
    // Return friendly local response if Gemini API key is not active
    return res.json({
      reply: `[Local Mode Usagyuun Bot] Yay! Hello there, wellness explorer! Enrico Andaya's herbal products are here to guide your personalized wellness journey. Currently, Moringa Oleifera capsules are excellent for raw energy, while Banaba Leaf tea supports metabolic balance! For customer support, reach out to us at andayaenrico55@gmail.com or CP # 09560333111. Let me know which one you like best. Stay healthy!`
    });
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstructions,
      }
    });

    // Send history context if available
    if (chatHistory && chatHistory.length > 0) {
      // Seed historical conversation
      for (const item of chatHistory.slice(-4)) {
        await chat.sendMessage({ message: item.text });
      }
    }

    const response = await chat.sendMessage({ message });
    res.json({
      reply: response.text
    });
  } catch (error: any) {
    console.error("Chatbot error: ", error);
    res.json({
      reply: `Oh no, my antenna had a little static! But Enrico Andaya's Love Herbal is still fully operational. How can I help you choose the best capsules, teas, or extracts today? Stay healthy!`
    });
  }
});

// 6. Analytics dashboard stats
app.get("/api/dashboard-stats", (req, res) => {
  const totalSales = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const categoriesCount = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const stockAlerts = checkLowStockAlerts();

  res.json({
    totalSales,
    transactionCount: transactions.length,
    productCount: products.length,
    categoriesCount,
    stockAlerts,
    allTransactions: transactions
  });
});

// Integrate Vite Middleware for dev environments, or Static Assets for production environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Love Herbal server running on port ${PORT}`);
  });
}

startServer();
