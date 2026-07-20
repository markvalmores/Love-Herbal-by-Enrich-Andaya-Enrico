import React, { useState, useEffect, useRef } from "react";
import { 
  Leaf, 
  ShoppingBag, 
  MessageSquare, 
  TrendingUp, 
  Bell, 
  CreditCard, 
  Mail, 
  FileText, 
  Share2, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Search, 
  X, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Activity, 
  Award,
  Sparkles,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle,
  Clock,
  Lock,
  Unlock,
  Users,
  ThumbsUp,
  ThumbsDown,
  Send,
  LogOut,
  LogIn,
  UserPlus,
  MessageCircle,
  Smile,
  PlusCircle,
  Globe,
  Paperclip
} from "lucide-react";
import { 
  Product, 
  Transaction, 
  ChatMessage, 
  SystemAlert,
  UserProfile,
  CommunityPost,
  GroupChat,
  GroupMessage,
  SupportComplaint
} from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // State variables
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [activeTab, setActiveTab] = useState<"store" | "cart" | "support" | "portal" | "dashboard" | "about" | "community" | "messenger">("store");
  
  const chatFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    
    const data = await res.json();
    return data.fileUrl; // This will be the URL to the uploaded file
  }
  const [products, setProducts] = useState<Product[]>([
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
  ]);
  const [stockAlerts, setStockAlerts] = useState<string[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  
  // Shipping and confirmation input states
  const [shippingAddress, setShippingAddress] = useState("");
  const [confirmingRefNum, setConfirmingRefNum] = useState<{ [orderId: string]: string }>({});
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

  // Notifications prompt state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [appAlerts, setAppAlerts] = useState<SystemAlert[]>([
    {
      id: "a-1",
      type: "info",
      message: "Welcome to Love Herbal! Prompt: Choose to enable real-time order alerts for immediate updates.",
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }
  ]);

  // Support Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Yay! Welcome explorer! I am Usagyuun, your VTuber wellness guide! Let's find your perfect Enrico Andaya formulation today. Ask me anything! Stay healthy!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Secure User Portal states
  const [portalEmail, setPortalEmail] = useState("");
  const [portalOrders, setPortalOrders] = useState<Transaction[]>([]);
  const [portalSearching, setPortalSearching] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Transaction | null>(null);

  // Checkout state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"GCash" | "PayPal">("GCash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [gcashStatus, setGcashStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [lastCompletedTx, setLastCompletedTx] = useState<Transaction | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  // Real-time Inventory Dashboard states
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalSales: 0,
    transactionCount: 0,
    productCount: 0,
    categoriesCount: {},
    stockAlerts: [],
    allTransactions: []
  });
  const [refreshingDashboard, setRefreshingDashboard] = useState(false);

  // Social Sharing Achivements
  const [sharedMessage, setSharedMessage] = useState("");

  // Dashboard Lock & Forgot Password states
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [inputPassword, setInputPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotStep, setForgotStep] = useState<"verify" | "reset" | "success">("verify");
  const [showPassword, setShowPassword] = useState(false);

  // --- CUSTOM AUTH, COMMUNITY, MESSENGER & SUPPORT TICKET STATES ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [complaints, setComplaints] = useState<SupportComplaint[]>([]);

  // Session timeout check
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        const loginTime = localStorage.getItem("loginTime");
        if (loginTime && (Date.now() - parseInt(loginTime)) > 34 * 60 * 1000) {
          handleAuthLogout();
        }
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentUser]);

  // Auth Modal form inputs
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBio, setAuthBio] = useState("");
  const [authAvatar, setAuthAvatar] = useState("");

  // Forums inputs
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("General Tips");
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const postFileRef = useRef<HTMLInputElement>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});

  // Group Chats inputs
  const [activeGcId, setActiveGcId] = useState<string>("gc-general");
  const [newGcName, setNewGcName] = useState("");
  const [newGcDesc, setNewGcDesc] = useState("");
  const [newGcMembers, setNewGcMembers] = useState<string[]>([]);
  const [showCreateGcModal, setShowCreateGcModal] = useState(false);
  const [chatInputMessage, setChatInputMessage] = useState("");
  const [communityCategoryFilter, setCommunityCategoryFilter] = useState("All");

  // Complaints form inputs
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setAllProfiles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroupChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setGroupChats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      setComplaints(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync all on mount and on poll
  useEffect(() => {
    fetchProfiles();
    fetchCommunityPosts();
    fetchGroupChats();
    fetchComplaints();

    // Poll chat, posts and complaints every 3 seconds for real-time vibe
    const interval = setInterval(() => {
      fetchCommunityPosts();
      fetchGroupChats();
      fetchComplaints();
      fetchProfiles();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard data on load
  useEffect(() => {
    fetchDashboardStats();
    
    // Notifications decision from LocalStorage
    const savedNotif = localStorage.getItem("love_herbal_notifs");
    if (savedNotif === null) {
      // First timer! Prompt them after a short delay
      const timer = setTimeout(() => {
        setShowNotificationModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setNotificationsEnabled(savedNotif === "true");
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const fetchDashboardStats = async () => {
    try {
      setRefreshingDashboard(true);
      const res = await fetch("/api/dashboard-stats");
      const data = await res.json();
      setDashboardStats(data);
    } catch (e) {
      console.error("Error fetching stats", e);
    } finally {
      setRefreshingDashboard(false);
    }
  };

  // Push system alert notification
  const addSystemAlert = (type: 'info' | 'warning' | 'success', message: string) => {
    const newAlert: SystemAlert = {
      id: "a-" + Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setAppAlerts(prev => [newAlert, ...prev]);

    // If notifications are active, trigger standard system alerts
    if (notificationsEnabled) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Love Herbal Update", { body: message });
      }
    }
  };

  // Handle Notifications prompt
  const handleEnableNotifications = (enable: boolean) => {
    setNotificationsEnabled(enable);
    localStorage.setItem("love_herbal_notifs", enable ? "true" : "false");
    setShowNotificationModal(false);
    if (enable) {
      if ("Notification" in window) {
        Notification.requestPermission();
      }
      addSystemAlert("success", "Real-time wellness and inventory alerts have been enabled!");
    } else {
      addSystemAlert("info", "Silent mode active. Alerts will display in-app only.");
    }
  };

  // --- AUTH, SOCIAL, COMMUNITY & TICKET API HANDLERS ---
  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authUsername || !authPassword) {
      addSystemAlert("warning", "Please fill in all registration fields.");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          username: authUsername,
          password: authPassword,
          bio: authBio,
          avatar: authAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(authUsername)}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        addSystemAlert("warning", data.error || "Registration failed.");
        return;
      }
      setCurrentUser(data.user);
      localStorage.setItem("love_herbal_user", JSON.stringify(data.user));
      localStorage.setItem("loginTime", Date.now().toString());
      setShowAuthModal(false);
      addSystemAlert("success", `Welcome to Love Herbal, ${data.user.username}!`);
      fetchProfiles();
      
      // Clear inputs
      setAuthEmail("");
      setAuthUsername("");
      setAuthPassword("");
      setAuthBio("");
      setAuthAvatar("");
    } catch (err) {
      console.error(err);
      addSystemAlert("warning", "Network error during registration.");
    }
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      addSystemAlert("warning", "Please enter both email and password.");
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        addSystemAlert("warning", data.error || "Login failed.");
        return;
      }
      setCurrentUser(data.user);
      localStorage.setItem("love_herbal_user", JSON.stringify(data.user));
      localStorage.setItem("loginTime", Date.now().toString());
      setShowAuthModal(false);
      addSystemAlert("success", `Welcome back, ${data.user.username}!`);
      
      // Auto-unlock dashboard if logging in as Enrico
      if (data.user.email === "andayaenrico55@gmail.com") {
        setIsDashboardUnlocked(true);
        addSystemAlert("success", "Merchant partner admin panel unlocked!");
      }
      fetchProfiles();
      
      // Clear inputs
      setAuthEmail("");
      setAuthPassword("");
    } catch (err) {
      console.error(err);
      addSystemAlert("warning", "Network error during login.");
    }
  };

  const handleAuthLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("love_herbal_user");
    localStorage.removeItem("loginTime");
    setIsDashboardUnlocked(false);
    addSystemAlert("info", "Logged out successfully. See you soon!");
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authTab === "login") {
      handleAuthLogin(e);
    } else {
      handleAuthRegister(e);
    }
  };

  const handleFollowToggle = async (targetEmail: string) => {
    if (!currentUser) {
      setAuthTab("login");
      setShowAuthModal(true);
      addSystemAlert("warning", "Please sign in to follow wellness partners.");
      return;
    }
    try {
      const res = await fetch("/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerEmail: currentUser.email, targetEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        addSystemAlert("warning", data.error || "Action failed.");
        return;
      }
      addSystemAlert("success", data.isFollowing ? `You followed ${targetEmail}` : `You unfollowed ${targetEmail}`);
      fetchProfiles();
      
      // Sync local user follow state if follower matches current
      if (currentUser.email === data.follower.email) {
        const updated = { ...currentUser, following: data.follower.following };
        setCurrentUser(updated);
        localStorage.setItem("love_herbal_user", JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthTab("login");
      setShowAuthModal(true);
      addSystemAlert("warning", "Please sign in to share a post.");
      return;
    }
    if (!newPostTitle || !newPostContent) {
      addSystemAlert("warning", "Title and content cannot be empty.");
      return;
    }
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorEmail: currentUser.email,
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
          mediaUrl: postMediaUrl
        })
      });
      const data = await res.json();
      if (!res.ok) {
        addSystemAlert("warning", data.error || "Failed to create post.");
        return;
      }
      addSystemAlert("success", "Post shared to Love Herbal Community!");
      setShowCreatePost(false);
      setNewPostTitle("");
      setNewPostContent("");
      setPostMediaUrl("");
      fetchCommunityPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVotePost = async (postId: string, type: 'up' | 'down') => {
    if (!currentUser) {
      setAuthTab("login");
      setShowAuthModal(true);
      addSystemAlert("warning", "Please sign in to vote on discussions.");
      return;
    }
    
    // Check current vote
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    let targetType: 'up' | 'down' | 'none' = type;
    const isUpvoted = post.upvotes.includes(currentUser.email);
    const isDownvoted = post.downvotes.includes(currentUser.email);
    
    if (type === 'up' && isUpvoted) targetType = 'none';
    if (type === 'down' && isDownvoted) targetType = 'none';

    try {
      await fetch("/api/posts/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, email: currentUser.email, voteType: targetType })
      });
      fetchCommunityPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactPost = async (postId: string, emoji: string) => {
    if (!currentUser) {
      setAuthTab("login");
      setShowAuthModal(true);
      addSystemAlert("warning", "Please sign in to add reactions.");
      return;
    }
    try {
      await fetch("/api/posts/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, email: currentUser.email, emoji })
      });
      fetchCommunityPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentPost = async (postId: string) => {
    if (!currentUser) {
      setAuthTab("login");
      setShowAuthModal(true);
      addSystemAlert("warning", "Please sign in to add comments.");
      return;
    }
    const text = newCommentText[postId] || "";
    if (!text.trim()) return;

    try {
      const res = await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, authorEmail: currentUser.email, content: text })
      });
      if (res.ok) {
        setNewCommentText(prev => ({ ...prev, [postId]: "" }));
        fetchCommunityPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newGcName.trim()) {
      addSystemAlert("warning", "Group chat name is required.");
      return;
    }
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGcName,
          description: newGcDesc,
          createdBy: currentUser.email,
          memberEmails: newGcMembers
        })
      });
      const data = await res.json();
      if (res.ok) {
        addSystemAlert("success", `Group Chat "${newGcName}" created successfully!`);
        setShowCreateGcModal(false);
        setNewGcName("");
        setNewGcDesc("");
        setNewGcMembers([]);
        setActiveGcId(data.chat.id);
        fetchGroupChats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGC = async (chatId: string) => {
    if (!currentUser) {
      setAuthTab("login");
      setShowAuthModal(true);
      addSystemAlert("warning", "Please sign in to join GCs.");
      return;
    }
    try {
      const res = await fetch("/api/chats/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, email: currentUser.email })
      });
      if (res.ok) {
        addSystemAlert("success", "Joined group chat conversation.");
        setActiveGcId(chatId);
        fetchGroupChats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendGCMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthTab("login");
      setShowAuthModal(true);
      addSystemAlert("warning", "Please sign in to send messages.");
      return;
    }
    if (!chatInputMessage.trim()) return;
    try {
      const res = await fetch("/api/chats/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeGcId,
          senderEmail: currentUser.email,
          content: chatInputMessage
        })
      });
      if (res.ok) {
        setChatInputMessage("");
        fetchGroupChats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintMessage.trim()) {
      addSystemAlert("warning", "Subject and message are required.");
      return;
    }
    const nameToUse = currentUser ? currentUser.username : "Guest Explorer";
    const emailToUse = currentUser ? currentUser.email : "guest@loveherbal.com";

    setIsSubmittingComplaint(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: nameToUse,
          customerEmail: emailToUse,
          subject: complaintSubject,
          message: complaintMessage
        })
      });
      const data = await res.json();
      if (res.ok) {
        addSystemAlert("success", "Complaint/Feedback securely routed to andayaenrico55@gmail.com.");
        setComplaintSubject("");
        setComplaintMessage("");
        fetchComplaints();
      } else {
        addSystemAlert("warning", data.error || "Submission failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await fetch("/api/complaints/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId })
      });
      if (res.ok) {
        addSystemAlert("success", "Ticket resolved.");
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cart Management
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        addSystemAlert("warning", `Cannot add more "${product.name}". Maximum available stock reached.`);
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    addSystemAlert("success", `Added ${product.name} to checkout cart.`);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const existing = cart.find(item => item.product.id === productId);
    if (!existing) return;
    const targetQty = existing.quantity + delta;
    if (targetQty <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
      addSystemAlert("info", `Removed from checkout cart.`);
    } else {
      const product = products.find(p => p.id === productId)!;
      if (targetQty > product.stock) {
        addSystemAlert("warning", `Only ${product.stock} units are currently in stock!`);
        return;
      }
      setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: targetQty } : item));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  // Checkout process simulation
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      addSystemAlert("warning", "Your cart is empty! Please select a formulation first.");
      return;
    }
    setActiveTab("cart");
    addSystemAlert("info", "Welcome to your dedicated Cart & Checkout tab. Enter your shipping coordinates below!");
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutEmail) {
      addSystemAlert("warning", "Please provide checkout credentials to dispatch.");
      return;
    }

    if (paymentMethod === "GCash") {
      setGcashStatus("verifying");
      if (!referenceNumber) {
        addSystemAlert("info", "Placing order with Pending GCash verification. You can confirm in portal.");
      } else {
        addSystemAlert("info", "GCash real-time reference audit matching. Please wait...");
      }
      
      setTimeout(async () => {
        await executeFinalCheckout();
      }, 2000);
    } else {
      // PayPal flow
      await executeFinalCheckout();
    }
  };

  const executeFinalCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutName,
          customerEmail: checkoutEmail,
          cartItems: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          paymentMethod,
          referenceNumber: paymentMethod === "GCash" ? referenceNumber : undefined,
          totalAmount: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
          shippingAddress: shippingAddress || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGcashStatus("success");
        setLastCompletedTx(data.transaction);
        setCart([]);
        setShowCheckoutModal(false);
        setShowThankYouModal(true);
        fetchDashboardStats(); // update dashboard sales
        addSystemAlert("success", `Payment confirmed! Official OR Receipt issued for ${checkoutName}.`);
        
        // Auto sign-in User Portal to view their new OR Receipt immediately!
        setPortalEmail(checkoutEmail);
        handlePortalSearch(checkoutEmail);
      } else {
        setGcashStatus("error");
        addSystemAlert("warning", data.error || "Checkout encountered inventory mismatch error.");
      }
    } catch (e: any) {
      setGcashStatus("error");
      addSystemAlert("warning", "Checkout offline: " + e.message);
    }
  };

  // Secure User Portal Receipt Finder
  const handlePortalSearch = async (emailToSearch?: string) => {
    const email = emailToSearch || portalEmail;
    if (!email) {
      setPortalError("Please enter your account email.");
      return;
    }
    setPortalSearching(true);
    setPortalError("");
    try {
      const res = await fetch(`/api/portal/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) {
        setPortalOrders(data.orders || []);
        if ((data.orders || []).length === 0) {
          setPortalError("No recorded transactions found for this email address yet.");
        }
      } else {
        setPortalError(data.error || "Failed to search secure portal receipts.");
      }
    } catch (err: any) {
      setPortalError("Portal verification error: " + err.message);
    } finally {
      setPortalSearching(false);
    }
  };

  // Confirm GCash payment with reference number
  const handleConfirmGcashPayment = async (orderId: string) => {
    const refNum = confirmingRefNum[orderId];
    if (!refNum || !refNum.trim()) {
      addSystemAlert("warning", "Please paste or type your GCash Reference Number first.");
      return;
    }
    setVerifyingOrderId(orderId);
    try {
      const res = await fetch("/api/portal/confirm-gcash-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, referenceNumber: refNum })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addSystemAlert("success", "GCash Payment verified! Shipping preparation started.");
        // Clear confirming ref input
        setConfirmingRefNum(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        // Re-fetch portal orders to reflect updated status
        handlePortalSearch(portalEmail);
      } else {
        addSystemAlert("warning", data.error || "Failed to confirm payment reference.");
      }
    } catch (e: any) {
      addSystemAlert("warning", "Connection offline: " + e.message);
    } finally {
      setVerifyingOrderId(null);
    }
  };

  // Simulate shipping tracking stepper progression
  const handleSimulateShipping = async (orderId: string) => {
    try {
      const res = await fetch("/api/portal/simulate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addSystemAlert("success", `Shipment tracker: Status updated to "${data.transaction.shippingStatus}"!`);
        handlePortalSearch(portalEmail);
      } else {
        addSystemAlert("warning", data.error || "Failed to simulate shipping progress.");
      }
    } catch (e: any) {
      addSystemAlert("warning", "Connection offline: " + e.message);
    }
  };

  // Support Chatbot handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          chatHistory: chatMessages
        })
      });
      const data = await res.json();
      const botMsg: ChatMessage = {
        sender: "bot",
        text: data.reply || "I am processing your wellness question. Stay healthy!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        sender: "bot",
        text: "I had a tiny disconnect, but Usagyuun is back! Ask me anything about Enrico Andaya's formulas. Stay healthy!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Social sharing logic
  const shareAchivement = (productName: string) => {
    const text = `I just purchased organic ${productName} from Love Herbal by Enrico Andaya! Start your personalized wellness journey today at andayaenrico55@gmail.com 🌿✨ #LoveHerbal #Wellness`;
    setSharedMessage(text);
    if (navigator.share) {
      navigator.share({
        title: "Love Herbal Wellness",
        text: text,
        url: window.location.href
      }).catch(err => console.log(err));
    } else {
      // Fallback
      navigator.clipboard.writeText(text);
      addSystemAlert("success", "Share achievement text copied to clipboard! Share it with friends.");
    }
  };

  return (
    <div id="root-layout" className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      
      {/* 1. Dynamic Elegant Title & Splash Screen */}
      <AnimatePresence>
        {showTitleScreen && (
          <motion.div 
            id="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 flex flex-col items-center justify-center text-white px-6 text-center"
          >
            <div className="absolute top-8 right-8 flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-100 font-mono tracking-wider">SECURE PAYMENTS ACTIVE</span>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-2xl flex flex-col items-center"
            >
              <div className="bg-emerald-500/20 p-5 rounded-full border border-emerald-500/30 mb-6 animate-bounce">
                <Leaf className="w-16 h-16 text-emerald-300" />
              </div>
              
              <h1 id="splash-main-title" className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-2 bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Love Herbal
              </h1>
              <p className="text-lg md:text-xl text-emerald-200/90 font-display font-medium mb-1 tracking-wide">
                by Enrico Andaya
              </p>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-emerald-400 to-transparent my-4"></div>
              
              <p className="text-sm md:text-base text-slate-300 max-w-md mb-8 leading-relaxed">
                Empowering your personalized wellness journey through hand-picked organic, traditional formulations.
              </p>

              <div className="flex flex-col items-center space-y-3">
                <button
                  id="enter-portal-button"
                  onClick={() => setShowTitleScreen(false)}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>Begin Wellness Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="text-xs text-slate-400/80 mt-4 leading-normal font-mono">
                  Developed & Created by Usagyuun VTuber a.k.a Mark David Valmores
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Love Herbal Main Header */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title Group */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowTitleScreen(true)}>
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-display font-bold text-slate-900 tracking-tight">Love Herbal</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-medium">PH Native</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">by Enrico Andaya</p>
            </div>
          </div>

          {/* Verified Merchant Badge */}
          <div className="flex items-center bg-emerald-50 rounded-xl px-4 py-2 border border-emerald-100 space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-mono text-emerald-700 font-bold leading-none">Verified Merchant Partner</span>
              <span className="text-[11px] font-bold text-slate-900">Enrico Andaya / Love Herbal</span>
            </div>
          </div>

          {/* Notification Quick Drawer Toggle & User Portal Navigation */}
          <div className="flex items-center space-x-3">
            <button
              id="toggle-alerts-panel"
              onClick={() => setShowNotificationModal(true)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg relative"
              title="Alert Preferences"
            >
              <Bell className="w-5 h-5" />
              {notificationsEnabled === null && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              )}
              {notificationsEnabled === true && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* Shopping Cart button with Badge indicator */}
            <button
              id="header-cart-summary"
              onClick={handleProceedToCheckout}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center space-x-2 relative hover:opacity-90 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({cart.reduce((s, c) => s + c.quantity, 0)})</span>
              <span className="bg-white text-emerald-800 font-mono px-1.5 py-0.5 rounded text-[10px]">
                ₱{getCartTotal()}
              </span>
            </button>

            {/* Authentication Control Badge */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username} 
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover" 
                />
                <div className="flex flex-col text-left max-w-[120px]">
                  <span className="text-xs font-bold text-slate-800 truncate" title={currentUser.username}>{currentUser.username}</span>
                  <span className="text-[10px] text-slate-500 font-mono leading-none truncate" title={currentUser.email}>{currentUser.email}</span>
                </div>
                <button 
                  onClick={handleAuthLogout}
                  className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg cursor-pointer transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Global tab Navigation with explicit layout IDs */}
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: "store", label: "Shop Catalog", icon: Leaf },
            { id: "cart", label: "My Cart & Checkout", icon: ShoppingBag },
            { id: "portal", label: "Orders & Shipping Portal", icon: FileText },
            { id: "community", label: "Reddit Forums", icon: Globe },
            { id: "messenger", label: "Wellness GCs", icon: MessageCircle },
            { id: "support", label: "Usagyuun Wellness AI", icon: MessageSquare },
            { id: "dashboard", label: "Inventory & Audit", icon: TrendingUp },
            { id: "about", label: "Enrico's Heritage", icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all whitespace-nowrap ${
                  active 
                    ? "bg-emerald-600 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content-region" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {/* Dynamic content rendering based on active navigation tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* TAB 1: ORGANIC STORE */}
            {activeTab === "store" && (
              <div id="store-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Product Catalog Display (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col space-y-6">
                  
                  {/* Category banners and page title */}
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-300 font-semibold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/35">
                        Pure Organics Catalog
                      </span>
                      <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                        A personalized wellness journey
                      </h2>
                      <p className="text-xs text-emerald-100/80 leading-normal max-w-md">
                        Every capsule and organic tea is fully verified and officially sourced by Enrico Andaya.
                      </p>
                    </div>
                    <div className="flex -space-x-2 shrink-0">
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-800 bg-slate-900 overflow-hidden flex items-center justify-center text-[10px] text-white font-bold font-mono">
                        🌿
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-800 bg-emerald-500 overflow-hidden flex items-center justify-center text-[10px] text-white font-bold font-mono">
                        🍵
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-800 bg-amber-500 overflow-hidden flex items-center justify-center text-[10px] text-white font-bold font-mono">
                        🍯
                      </div>
                    </div>
                  </div>

                  {/* Stock Alerts Display inside catalog */}
                  {stockAlerts.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Real-time Stock Alert System</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {stockAlerts.map((alert, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-100 text-[11px] text-slate-700 flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                            <span>{alert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Cards Grid */}
                  {products.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                        <Leaf className="w-8 h-8 animate-pulse" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-1">Catalog loading...</h3>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        We are populating the native herbal catalog with Enrico Andaya's verified formulations.
                      </p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                      >
                        Refresh Page
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {products.map((product) => (
                        <div 
                          key={product.id}
                          id={`product-card-${product.id}`}
                          className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group"
                        >
                          <div className="h-48 bg-slate-100 relative overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                              <span className="bg-emerald-600 text-white text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full font-bold shadow-sm">
                                {product.category}
                              </span>
                            </div>

                            {/* Inventory Status badge */}
                            <div className="absolute bottom-3 right-3">
                              {product.stock <= 5 ? (
                                <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-1 rounded-lg shadow-sm flex items-center space-x-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Only {product.stock} left!</span>
                                </span>
                              ) : (
                                <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-lg">
                                  {product.stock} In Stock
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-display font-bold text-slate-900 text-base leading-snug">
                                {product.name}
                              </h3>
                              <p className="text-xs text-slate-500 line-clamp-3">
                                {product.description}
                              </p>
                              
                              {/* Dynamic Benefits Bullet Points */}
                              <div className="pt-2 space-y-1">
                                {product.benefits.slice(0, 3).map((benefit, bIdx) => (
                                  <div key={bIdx} className="flex items-start space-x-1.5 text-[11px] text-slate-600">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 font-mono block">PRICE</span>
                                <span className="text-xl font-mono font-bold text-slate-900">₱{product.price}.00</span>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  id={`share-achievement-${product.id}`}
                                  onClick={() => shareAchivement(product.name)}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                                  title="Share Achievement with Friends"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                  id={`add-to-cart-${product.id}`}
                                  onClick={() => addToCart(product)}
                                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                                >
                                  Add to Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Left Shopping Cart Sidebar Drawer (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                  
                  {/* Cart Widget Container */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-display font-bold text-slate-900 text-sm">Your Order Summary</h3>
                      </div>
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono text-xs font-medium">
                        {cart.reduce((s, c) => s + c.quantity, 0)} items
                      </span>
                    </div>

                    {cart.length === 0 ? (
                      <div className="py-12 text-center flex flex-col items-center">
                        <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Your checkout cart is empty.</p>
                        <p className="text-[10px] text-slate-400 mt-1">Select our organic traditional tea or capsules on the left to begin.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-slate-900 truncate">{item.product.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">₱{item.product.price} each</p>
                            </div>
                            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, -1)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono font-semibold px-1 min-w-4 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, 1)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="pt-4 border-t border-slate-100 space-y-2">
                          <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>Subtotal</span>
                            <span className="font-mono">₱{getCartTotal()}.00</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>Shipping</span>
                            <span className="text-emerald-600 font-semibold text-[10px] uppercase">Free Shipping</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-150">
                            <span className="text-sm font-bold text-slate-900">Total Price</span>
                            <span className="text-lg font-mono font-bold text-emerald-800">₱{getCartTotal()}.00</span>
                          </div>
                        </div>

                        {/* GCash and Paypal clear merchant details */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center space-x-1.5 text-xs text-emerald-900 font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Authorized Checkout System</span>
                          </div>
                          <p className="text-[10px] text-emerald-800 leading-normal">
                            Direct automated transfers are processed instantly to GCash wellness fund <strong>CP # 09102225789</strong> or <strong>andayaenrico55@gmail.com</strong>.
                          </p>
                        </div>

                        <button
                          id="checkout-trigger-button"
                          onClick={handleProceedToCheckout}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:shadow-md hover:opacity-95 transition-all text-center flex items-center justify-center space-x-2"
                        >
                          <span>Proceed to Secure Checkout</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Applet Creator Banner */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white space-y-4">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-semibold">Creator Metadata</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold font-display">Love Herbal by Enrico Andaya</p>
                      <p className="text-xs text-slate-400">
                        This personalized wellness journey experience was developed and created by <span className="text-emerald-300 font-medium">Usagyuun VTuber</span> a.k.a <span className="text-emerald-300 font-medium">Mark David Valmores</span>.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>PH DIVISION</span>
                      <span>v1.2.0</span>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 1b: MY CART & CHECKOUT */}
            {activeTab === "cart" && (
              <div id="cart-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Items to Order (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-slate-900 text-base">Your Selected Items</h3>
                          <p className="text-xs text-slate-500">Review the formulation quantities before shipping</p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-mono text-xs font-semibold border border-emerald-100">
                        {cart.reduce((s, c) => s + c.quantity, 0)} items
                      </span>
                    </div>

                    {cart.length === 0 ? (
                      <div className="py-16 text-center flex flex-col items-center justify-center">
                        <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900">Your cart is empty</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          Browse our personalized traditional wellness coffee blends on the Shop Catalog tab to add items.
                        </p>
                        <button
                          onClick={() => setActiveTab("store")}
                          className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                        >
                          Go to Shop Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex items-center space-x-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.product.name}</h4>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.product.category}</p>
                              <p className="text-xs font-semibold text-slate-900 mt-1 font-mono">₱{item.product.price} each</p>
                            </div>
                            <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, -1)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-mono font-bold px-1.5 min-w-6 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, 1)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-right pl-2">
                              <p className="text-xs font-mono font-bold text-emerald-800">₱{item.product.price * item.quantity}.00</p>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, -item.quantity)}
                                className="text-[10px] text-red-500 hover:text-red-700 font-medium mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="pt-6 border-t border-slate-100 space-y-3">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-mono">₱{getCartTotal()}.00</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Shipping & Delivery Fee</span>
                            <span className="text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded">Free Shipping</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-150">
                            <span className="text-sm font-bold text-slate-900">Order Total Amount</span>
                            <span className="text-xl font-mono font-bold text-emerald-800">₱{getCartTotal()}.00</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Merchant Details / Verification Instructions */}
                  <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-display font-bold text-sm">Official Authorized Merchant Info</h4>
                    </div>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      For GCash wellness funds and automated deliveries, Enrico Andaya processes verification immediately at:
                    </p>
                    <div className="bg-white/10 rounded-2xl p-4 space-y-2.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300">GCash CP #:</span>
                        <span className="font-bold">09102225789 (Love Herbal)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300">Authorized Email:</span>
                        <span className="font-bold">andayaenrico55@gmail.com</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-emerald-300/80 leading-snug">
                      *Please save your GCash Transaction Reference Number. You can paste it here or in the portal to confirm your order and trigger instantaneous shipping dispatcher preparation!
                    </div>
                  </div>
                </div>

                {/* Right Column: Secure Portal & Checkout (5 Columns) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-base">Secure Dispatch & Checkout</h3>
                      <p className="text-xs text-slate-500">Provide shipping coordinates to proceed</p>
                    </div>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Juan Dela Cruz"
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="juan@example.com"
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Detailed Shipping / Delivery Address</label>
                        <textarea 
                          rows={3}
                          required
                          placeholder="Block 2 Lot 14, Emerald Street, Brgy. San Jose, Pasig City, Metro Manila, 1600"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none"
                        />
                        <span className="text-[9px] text-slate-400">Complete coordinates guarantee rapid 24-48h dispatch.</span>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Payment Method Selector</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("GCash")}
                            className={`p-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center space-y-1 ${
                              paymentMethod === "GCash"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="text-base">📱</span>
                            <span>GCash Wallet</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("PayPal")}
                            className={`p-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center space-y-1 ${
                              paymentMethod === "PayPal"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="text-base">💳</span>
                            <span>PayPal / Card</span>
                          </button>
                        </div>
                      </div>

                      {paymentMethod === "GCash" && (
                        <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 space-y-3">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              GCash Transfer Guide
                            </span>
                            <p className="text-[11px] text-amber-900 mt-1.5 font-medium">
                              Send exactly <strong className="text-emerald-800">₱{getCartTotal()}.00</strong> to GCash <strong>09102225789</strong>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">Paste GCash Ref # (Optional to proceed, confirm later)</label>
                            <input 
                              type="text" 
                              placeholder="13-Digit Reference Number"
                              value={referenceNumber}
                              onChange={(e) => setReferenceNumber(e.target.value)}
                              className="w-full text-xs p-2.5 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-white font-mono"
                            />
                            <p className="text-[9px] text-amber-700">
                              Pasting your GCash reference now allows instant automated dispatch! If left empty, you can paste it later on the Orders Portal.
                            </p>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={cart.length === 0 || gcashStatus === "verifying"}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-55 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        {gcashStatus === "verifying" ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Processing Secure Dispatch...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>{paymentMethod === "GCash" && !referenceNumber ? "Place Order (Verify Later)" : "Place Order & Pay"}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI CUSTOMER SUPPORT CHATBOT */}
            {activeTab === "support" && (
              <div id="support-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Chatbot conversation portal (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col h-[600px] bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                  
                  {/* Chat Header */}
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg animate-pulse">
                        🐰
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold font-display">Usagyuun Chatbot</span>
                          <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-medium tracking-wider uppercase">Active AI</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">Created by Usagyuun VTuber / Mark David Valmores</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 font-mono hidden sm:block">
                      Dosing & Health Advisor
                    </div>
                  </div>

                  {/* Chat Messages Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {chatMessages.map((msg, idx) => {
                      const isBot = msg.sender === "bot";
                      return (
                        <div key={idx} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed space-y-1 ${
                            isBot 
                              ? "bg-white border border-slate-100 text-slate-800 rounded-tl-none" 
                              : "bg-slate-900 text-white rounded-tr-none"
                          }`}>
                            {isBot && (
                              <span className="text-[9px] text-emerald-700 font-mono font-bold block mb-1">USAGYUUN ADVISOR:</span>
                            )}
                            <p className="whitespace-pre-line">{msg.text}</p>
                            <span className={`text-[9px] text-right block ${isBot ? "text-slate-400" : "text-slate-400"}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-xs text-slate-500 rounded-tl-none flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Usagyuun is typing response...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef}></div>
                  </div>

                  {/* Chat Input Footer */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask me about Moringa, Banaba Tea, Lagundi, or wellness..."
                      className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    <input
                      type="file"
                      ref={chatFileRef}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const fileUrl = await handleFileUpload(e.target.files[0]);
                          setChatInput(prev => prev + ` ${fileUrl}`);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => chatFileRef.current?.click()}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      id="send-chat-message"
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      Ask Usagyuun
                    </button>
                  </form>

                </div>

                {/* Left Wellness Info Widget (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                  
                  {/* Enrico and Usagyuun info */}
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 text-white space-y-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-emerald-300" />
                      <h4 className="font-display font-bold text-sm">Personalized Wellness Advice</h4>
                    </div>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      Our chatbot utilizes a customized system prompt referencing natural Filipino ingredients certified under Philippine standard wellness procedures.
                    </p>
                    <div className="bg-white/10 rounded-2xl p-4 space-y-2 text-[11px] text-emerald-200">
                      <span className="font-semibold block text-white uppercase tracking-wider font-mono text-[9px]">RECOMMENDED DOSAGE</span>
                      <p>• Moringa Capsules: 1 capsule in the morning with meals.</p>
                      <p>• Banaba Tea: Brew 1 leaf pack in 200ml boiling water daily.</p>
                      <p>• Lagundi Extract: 5-10 liquid drops when experiencing cough.</p>
                    </div>
                  </div>

                  {/* Customer Service Tickets & Direct Complaints Box */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Official Support Ticket Desk</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal font-mono">
                        Direct support dispatch to: <strong className="text-slate-900 font-semibold">andayaenrico55@gmail.com</strong>
                      </p>
                    </div>

                    <form onSubmit={handleSendComplaint} className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Ticket Subject</label>
                        <input 
                          type="text"
                          required
                          value={complaintSubject}
                          onChange={(e) => setComplaintSubject(e.target.value)}
                          placeholder="e.g., Shipping Delay, Incorrect Formulation..."
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Issue Details / Complaint</label>
                        <textarea 
                          required
                          rows={3}
                          value={complaintMessage}
                          onChange={(e) => setComplaintMessage(e.target.value)}
                          placeholder="Provide order reference or describe your health query here..."
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingComplaint}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isSubmittingComplaint ? "Routing Ticket..." : "Submit to Enrico"}</span>
                      </button>
                    </form>

                    {/* Admin Ticket Dashboard if current user is Enrico */}
                    {currentUser?.email === "andayaenrico55@gmail.com" && (
                      <div className="pt-4 mt-4 border-t border-dashed border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-700">Admin Live Tickets ({complaints.filter(c => !c.resolved).length})</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] uppercase tracking-wider font-mono rounded font-bold">Secure Access</span>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {complaints.length === 0 ? (
                            <p className="text-[10px] text-slate-400 font-mono text-center py-2">No active complaints found.</p>
                          ) : (
                            complaints.map((ticket) => (
                              <div key={ticket.id} className={`p-3 rounded-xl border text-[10px] space-y-1.5 ${ticket.resolved ? "bg-slate-50 border-slate-100 opacity-60" : "bg-emerald-50/50 border-emerald-100"}`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 truncate max-w-[120px]" title={ticket.customerName}>{ticket.customerName}</span>
                                  <span className="text-[8px] font-mono text-slate-400">{ticket.timestamp}</span>
                                </div>
                                <p className="text-slate-500 font-mono text-[9px] truncate">{ticket.customerEmail}</p>
                                <p className="font-bold text-slate-800">Subject: {ticket.subject}</p>
                                <p className="text-slate-600 font-sans leading-normal bg-white p-2 rounded border border-slate-100 whitespace-pre-line">{ticket.message}</p>
                                
                                {!ticket.resolved && (
                                  <button
                                    onClick={() => handleResolveComplaint(ticket.id)}
                                    className="w-full mt-1.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold font-mono transition"
                                  >
                                    Mark as Resolved & Email Customer
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: SECURE USER PORTAL & RECEIPT CHECKER */}
            {activeTab === "portal" && (
              <div id="portal-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Search Portal panel */}
                <div className="lg:col-span-12 space-y-6">
                  
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
                    <div className="text-center space-y-1">
                      <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h3 className="font-display font-bold text-lg text-slate-950">Secure User Receipt Portal</h3>
                      <p className="text-xs text-slate-500">
                        Enter your checkout account email below to access your digital receipts and Official OR numbers.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input 
                        type="email"
                        value={portalEmail}
                        onChange={(e) => setPortalEmail(e.target.value)}
                        placeholder="e.g. juan.delacruz@example.com"
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                      />
                      <button
                        id="portal-search-button"
                        onClick={() => handlePortalSearch()}
                        disabled={portalSearching}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap flex items-center justify-center space-x-1.5"
                      >
                        {portalSearching ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Locating Orders...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Access Portal</span>
                          </>
                        )}
                      </button>
                    </div>

                    {portalError && (
                      <p className="text-center text-xs text-red-600 font-medium">{portalError}</p>
                    )}
                  </div>

                  {/* List of Receipts retrieved */}
                  {portalOrders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {portalOrders.map((order) => (
                        <div 
                          key={order.id} 
                          className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 border-l-4 border-l-emerald-600"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <div>
                                <span className="text-[10px] text-slate-400 font-mono block">OFFICIAL OR RECEIPT</span>
                                <span className="text-xs font-mono font-bold text-slate-900">{order.orNumber}</span>
                              </div>
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold">
                                {order.status}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] text-slate-400 font-mono block">ITEMS PURCHASED</span>
                              <div className="space-y-1">
                                {order.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex justify-between text-xs font-medium text-slate-700">
                                    <span>{item.productName} (x{item.quantity})</span>
                                    <span className="font-mono">₱{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                              <span className="text-slate-500">Total Amount Paid</span>
                              <span className="font-mono font-bold text-emerald-800 text-sm">₱{order.totalAmount}.00</span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] text-slate-500 font-mono space-y-1">
                              <div>Payment Method: {order.paymentMethod}</div>
                              <div>Ref Number: {order.paymentReference || "Awaiting Confirmation"}</div>
                              <div>Merchant Account: andayaenrico55@gmail.com</div>
                              <div>GCash Account (CP #): 09102225789</div>
                              {order.shippingAddress && <div>Shipping To: {order.shippingAddress}</div>}
                              {order.trackingNumber && <div>Tracking ID: {order.trackingNumber}</div>}
                              <div>Checkout Date: {new Date(order.date).toLocaleString()}</div>
                            </div>

                            {/* Shipping Progress Tracker */}
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                              <span className="text-[10px] text-slate-400 font-mono block">SHIPPING & DISPATCH STATUS</span>
                              
                              {/* Visual Stepper */}
                              <div className="grid grid-cols-5 gap-1 items-center pt-1">
                                {['Pending Payment', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((stage, idx) => {
                                  const stages = ['Pending Payment', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
                                  const currentIdx = stages.indexOf(order.shippingStatus || 'Processing');
                                  const isPassedOrCurrent = idx <= currentIdx;
                                  return (
                                    <div key={stage} className="flex flex-col items-center">
                                      <div className={`w-2.5 h-2.5 rounded-full ${
                                        isPassedOrCurrent ? "bg-emerald-600 animate-pulse" : "bg-slate-200"
                                      }`} />
                                      <span className={`text-[8px] text-center mt-1 scale-90 ${
                                        isPassedOrCurrent ? "text-emerald-800 font-bold" : "text-slate-400"
                                      }`}>
                                        {stage.split(' ')[0]}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="bg-emerald-50/50 rounded-xl p-2.5 text-[11px] text-emerald-900 border border-emerald-100 flex items-center justify-between">
                                <div>
                                  Current: <strong className="text-emerald-800">{order.shippingStatus || "Processing"}</strong>
                                </div>
                                <button
                                  onClick={() => handleSimulateShipping(order.id)}
                                  className="text-[9px] font-bold text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
                                >
                                  Simulate Stage 🚀
                                </button>
                              </div>
                            </div>

                            {/* Paste GCash Reference Number to Confirm Payment */}
                            {order.status === "Pending" && order.paymentMethod === "GCash" && (
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-2 space-y-2.5">
                                <div className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Awaiting GCash Verification</div>
                                <p className="text-[11px] text-amber-800 leading-normal">
                                  Please send <strong>₱{order.totalAmount}.00</strong> to GCash <strong>CP # 09102225789</strong> and paste the reference number below to confirm shipment dispatch:
                                </p>
                                <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    placeholder="13-Digit GCash Ref Number"
                                    value={confirmingRefNum[order.id] || ""}
                                    onChange={(e) => setConfirmingRefNum(prev => ({ ...prev, [order.id]: e.target.value }))}
                                    className="flex-1 text-xs border border-amber-200 rounded-xl p-2 focus:outline-none focus:border-amber-500 font-mono bg-white"
                                  />
                                  <button
                                    onClick={() => handleConfirmGcashPayment(order.id)}
                                    disabled={verifyingOrderId === order.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[10px] rounded-xl px-4 py-2 transition-all shrink-0"
                                  >
                                    Confirm Payment
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            id={`view-full-or-${order.id}`}
                            onClick={() => setSelectedOrderReceipt(order)}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition text-center"
                          >
                            Print / View PDF Official OR
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB 4: REAL-TIME INVENTORY MANAGEMENT DASHBOARD & AUDIT */}
            {activeTab === "dashboard" && (
              <div id="dashboard-view" className="space-y-8">
                {!isDashboardUnlocked ? (
                  <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 my-12">
                    <div className="text-center space-y-2">
                      <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mx-auto">
                        <Lock className="w-8 h-8 animate-bounce" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-950">Merchant Partner Authentication</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Access is restricted to authorized partners. Enter your admin password to manage inventory, update formulations, and view financial audits.
                      </p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (inputPassword === adminPassword) {
                        setIsDashboardUnlocked(true);
                        setInputPassword("");
                        addSystemAlert("success", "Welcome back, Enrico! Dashboard unlocked.");
                      } else {
                        addSystemAlert("warning", "Access denied. Invalid admin password.");
                      }
                    }} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Admin Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter password..."
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            className="w-full text-xs p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono pr-12 text-slate-900 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 font-mono">Clue: <strong className="text-emerald-700">admin123</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotStep("verify");
                            setForgotEmail("");
                            setForgotAnswer("");
                            setForgotNewPass("");
                            setShowForgotPassword(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Unlock Admin Console</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    {/* Header and Locker */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="font-display font-bold text-slate-900 text-lg flex items-center space-x-2">
                          <Unlock className="w-5 h-5 text-emerald-600" />
                          <span>Merchant Inventory & Audit Console</span>
                        </h3>
                        <p className="text-xs text-slate-500">Live formulation stock levels, automated order queues, and sales ledger audits</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsDashboardUnlocked(false);
                          addSystemAlert("info", "Console locked successfully.");
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all self-start sm:self-auto border border-slate-200 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Console</span>
                      </button>
                    </div>

                    {/* Dashboard statistics panel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">TOTAL REVENUE AUDIT</span>
                      <span className="text-xl font-mono font-bold text-slate-900">₱{dashboardStats.totalSales || 0}.00</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">COMPLETED INVOICES</span>
                      <span className="text-xl font-mono font-bold text-slate-900">{dashboardStats.transactionCount || 0} Invoices</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">TOTAL MEDICINES SYNCED</span>
                      <span className="text-xl font-mono font-bold text-slate-900">{dashboardStats.productCount || 0} Products</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">ACTIVE RESTOCK ALERTS</span>
                      <span className="text-xl font-mono font-bold text-slate-900">{ (dashboardStats.stockAlerts || []).length } Items</span>
                    </div>
                  </div>

                </div>

                {/* Main inventory table & Audit logs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Products stock status (8 Columns) */}
                  <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="space-y-0.5">
                        <h4 className="font-display font-bold text-slate-900 text-sm">Real-time Stock Ledger</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Real-time tracking matched via automated checkout</p>
                      </div>
                      <button
                        onClick={fetchDashboardStats}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshingDashboard ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                            <th className="py-3 px-2">Formulation</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2">Price</th>
                            <th className="py-3 px-2">Stock Level</th>
                            <th className="py-3 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs">
                          {products.map((p) => {
                            const isLow = p.stock <= 5;
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                <td className="py-3 px-2 font-medium text-slate-900 flex items-center space-x-2">
                                  <img src={p.image} className="w-7 h-7 rounded object-cover" />
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-3 px-2 font-mono text-[10px] text-slate-500">{p.category}</td>
                                <td className="py-3 px-2 font-mono font-medium text-slate-900">₱{p.price}</td>
                                <td className="py-3 px-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLow ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`}></span>
                                    <span className={`font-semibold font-mono ${isLow ? "text-amber-600 font-bold" : "text-slate-700"}`}>
                                      {p.stock} remaining
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <button
                                    onClick={async () => {
                                      // Restock simulation
                                      const updated = products.map(item => item.id === p.id ? { ...item, stock: item.stock + 10 } : item);
                                      setProducts(updated);
                                      addSystemAlert("success", `Manually restocked "${p.name}" with 10 units.`);
                                      setTimeout(() => fetchDashboardStats(), 500);
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                                  >
                                    Restock +10
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transaction History & Audit logs (4 Columns) */}
                  <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="pb-3 border-b border-slate-100">
                      <h4 className="font-display font-bold text-slate-900 text-sm">Real-time Transaction Log</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Secure merchant account: andayaenrico55@gmail.com (09102225789)</p>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {(dashboardStats.allTransactions || []).map((tx: any) => (
                        <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                            <span>{tx.orNumber}</span>
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase font-semibold text-[9px] font-mono">
                              Paid
                            </span>
                          </div>
                          
                          <div className="font-medium text-slate-800">
                            {tx.customerName}
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[10px] font-mono">
                            <span className="text-slate-500">Method: {tx.paymentMethod}</span>
                            <span className="font-bold text-slate-950">₱{tx.totalAmount}.00</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
                </>
                )}

              </div>
            )}

            {/* TAB 5: ABOUT HERITAGE */}
            {activeTab === "about" && (
              <div id="heritage-view" className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                
                <div className="text-center space-y-2">
                  <Award className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-display font-bold text-2xl text-slate-900">Enrico Andaya Wellness Heritage</h3>
                  <p className="text-xs text-slate-500 font-mono">Love Herbal Personalized Experience</p>
                </div>

                <div className="h-0.5 w-full bg-slate-100"></div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                  <p>
                    Welcome to <strong>Love Herbal</strong>, a personalized traditional wellness showcase designed specifically by <strong>Enrico Andaya</strong>. We are committed to sourcing only the highest quality herbal formulations native to organic Filipino farming land.
                  </p>
                  <p>
                    By extracting pure, wild components like Malunggay (Moringa Oleifera), Banaba, Lagundi, and Sambong leaves, Love Herbal aims to bridge ancestral medicine with automated modern delivery.
                  </p>
                  
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-2 text-emerald-900">
                    <span className="font-semibold block text-sm">Verified Product Catalog:</span>
                    <p>
                      All products listed in our store are manually verified and officially sourced formulations by Enrico Andaya. We ensure real-time stock tracking and immediate dispatch upon secure purchase via GCash Reference Verification to **CP # 09102225789** or PayPal settlement to <strong>andayaenrico55@gmail.com</strong>.
                    </p>
                  </div>

                  <p className="pt-2 text-[10px] text-slate-500 font-mono text-center">
                    Website developed and created by Usagyuun VTuber a.k.a Mark David Valmores. All rights reserved.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 6: REDDIT-LIKE FORUMS COMMUNITY */}
            {activeTab === "community" && (
              <div id="community-forums-view" className="space-y-6">
                
                {/* Community Feed Header Banner */}
                <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-300 font-semibold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/35">
                      Live Herbalist Community
                    </span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
                      Love Herbal Forums
                    </h2>
                    <p className="text-xs text-emerald-100/80 leading-normal max-w-md">
                      Discuss formulations, ask dosage questions, share organic recipes, and upvote/downvote topics in real-time.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setAuthTab("login");
                        setShowAuthModal(true);
                        addSystemAlert("warning", "Please sign in to start a thread.");
                      } else {
                        setShowCreatePost(!showCreatePost);
                      }
                    }}
                    className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0 self-stretch md:self-auto justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>{showCreatePost ? "Collapse Creator" : "Create New Topic"}</span>
                  </button>
                </div>

                {/* Collapsible New Post Creator */}
                <AnimatePresence>
                  {showCreatePost && currentUser && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4"
                    >
                      <h3 className="font-display font-bold text-slate-950 text-sm flex items-center space-x-1.5 pb-2 border-b border-slate-150">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        <span>Start a New Wellness Discussion Thread</span>
                      </h3>

                      <form onSubmit={handleCreatePost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Topic Title</label>
                          <input 
                            type="text"
                            required
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            placeholder="e.g., Banaba tea completely cured my bloating!"
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 bg-white"
                          />
                        </div>

                        <div className="md:col-span-1 flex items-end">
                           <button
                             type="button"
                             onClick={() => postFileRef.current?.click()}
                             className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center space-x-2"
                           >
                             <Paperclip className="w-4 h-4" />
                             <span>{postMediaUrl ? "Media Attached" : "Attach Media"}</span>
                           </button>
                           <input
                             type="file"
                             ref={postFileRef}
                             onChange={async (e) => {
                               if (e.target.files && e.target.files[0]) {
                                 const fileUrl = await handleFileUpload(e.target.files[0]);
                                 setPostMediaUrl(fileUrl);
                               }
                             }}
                             className="hidden"
                           />
                        </div>

                        <div className="md:col-span-1">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Forum Category</label>
                          <select
                            value={newPostCategory}
                            onChange={(e) => setNewPostCategory(e.target.value)}
                            className="w-full text-xs p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 bg-white"
                          >
                            <option value="General Tips">General Tips</option>
                            <option value="Herbal Tips">Herbal Tips</option>
                            <option value="Glowtah Benefits">Glowtah Benefits</option>
                            <option value="Capsules">Capsules</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Detailed Discussion / Body</label>
                          <textarea
                            required
                            rows={4}
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Describe your health formulation experiences or ask the community a question..."
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowCreatePost(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-lg shadow cursor-pointer"
                          >
                            Post Thread
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Category filters list */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 mr-2">Filter category:</span>
                  {["All", "General Tips", "Herbal Tips", "Glowtah Benefits", "Capsules"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCommunityCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                        communityCategoryFilter === cat 
                          ? "bg-slate-900 border-slate-900 text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Main Forum topics grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Discussions stream (8 columns) */}
                  <div className="lg:col-span-8 space-y-4">
                    {posts.length === 0 ? (
                      <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm text-center">
                        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                        <h4 className="font-display font-semibold text-slate-800">No threads created yet</h4>
                        <p className="text-xs text-slate-500 mt-1">Be the first to start a conversation in the Love Herbal community!</p>
                      </div>
                    ) : (
                      posts
                        .filter(p => communityCategoryFilter === "All" || p.category === communityCategoryFilter)
                        .map((post) => {
                          const netScore = post.upvotes.length - post.downvotes.length;
                          const hasUpvoted = currentUser && post.upvotes.includes(currentUser.email);
                          const hasDownvoted = currentUser && post.downvotes.includes(currentUser.email);
                          const isFollowed = currentUser && currentUser.following.includes(post.authorEmail);
                          const isAuthorCurrent = currentUser && currentUser.email === post.authorEmail;

                          return (
                            <div key={post.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex gap-4 hover:border-slate-200 transition-all">
                              
                              {/* Reddit-like Upvote/Downvote panel */}
                              <div className="flex flex-col items-center bg-slate-50/50 rounded-2xl py-2 px-2.5 h-fit select-none">
                                <button
                                  onClick={() => handleVotePost(post.id, 'up')}
                                  className={`p-1 hover:bg-slate-200 rounded transition ${hasUpvoted ? "text-emerald-600 bg-emerald-50 font-bold" : "text-slate-400"}`}
                                  title="Upvote formulation discussion"
                                >
                                  <ChevronUp className="w-5 h-5 font-bold" />
                                </button>
                                <span className={`text-xs font-mono font-bold my-1 ${netScore > 0 ? "text-emerald-700" : netScore < 0 ? "text-rose-600" : "text-slate-600"}`}>
                                  {netScore > 0 ? `+${netScore}` : netScore}
                                </span>
                                <button
                                  onClick={() => handleVotePost(post.id, 'down')}
                                  className={`p-1 hover:bg-slate-200 rounded transition ${hasDownvoted ? "text-rose-600 bg-rose-50 font-bold" : "text-slate-400"}`}
                                  title="Downvote"
                                >
                                  <ChevronDown className="w-5 h-5 font-bold" />
                                </button>
                              </div>

                              {/* Discussion Content Column */}
                              <div className="flex-1 space-y-2 text-left">
                                
                                {/* User Meta and category info */}
                                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                                  <div className="flex items-center space-x-2">
                                    <img 
                                      src={post.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(post.authorName)}`} 
                                      alt={post.authorName} 
                                      className="w-6 h-6 rounded-full border border-slate-100 object-cover"
                                    />
                                    <div className="flex flex-col">
                                      <div className="flex items-center space-x-1">
                                        <span className="text-xs font-bold text-slate-800">{post.authorName}</span>
                                        {post.authorEmail === "andayaenrico55@gmail.com" && (
                                          <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[8px] uppercase px-1 py-0.2 rounded">
                                            Admin Partner
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-slate-400 font-mono">{post.timestamp}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    <span className="bg-slate-100 text-slate-700 font-mono font-medium text-[9px] px-2.5 py-0.5 rounded-full">
                                      {post.category}
                                    </span>
                                    
                                    {/* Real-time Follow toggle button */}
                                    {currentUser && !isAuthorCurrent && (
                                      <button
                                        onClick={() => handleFollowToggle(post.authorEmail)}
                                        className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all ${
                                          isFollowed 
                                            ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                        }`}
                                      >
                                        {isFollowed ? "✓ Following" : "+ Follow"}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Title and text body */}
                                <div className="space-y-1">
                                  <h4 className="font-display font-bold text-slate-900 text-sm hover:text-emerald-700 transition cursor-pointer" onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}>
                                    {post.title}
                                  </h4>
                                  <p className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line ${expandedPostId === post.id ? "" : "line-clamp-2"}`}>
                                    {post.content}
                                  </p>
                                  {post.content.length > 150 && (
                                    <button 
                                      onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                      className="text-[10px] text-emerald-700 font-semibold uppercase hover:underline"
                                    >
                                      {expandedPostId === post.id ? "Show less" : "Read full thread"}
                                    </button>
                                  )}
                                </div>

                                {/* Emoji Reactions Counter and trigger buttons */}
                                <div className="flex items-center flex-wrap gap-1.5 pt-2">
                                  {["👍", "❤️", "🌿", "😮", "🔥"].map((emoji) => {
                                    const rects = post.reactions[emoji] || [];
                                    const userReacted = currentUser && rects.includes(currentUser.email);
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReactPost(post.id, emoji)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition flex items-center space-x-1 ${
                                          userReacted 
                                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                                            : "bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100"
                                        }`}
                                      >
                                        <span>{emoji}</span>
                                        <span className="font-bold text-[10px]">{rects.length}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Comments Section Drawer toggle */}
                                <div className="pt-2">
                                  <button
                                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                    className="text-xs text-slate-500 font-medium hover:text-slate-800 transition flex items-center space-x-1"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>{post.comments.length} Comments</span>
                                  </button>

                                  {expandedPostId === post.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                                      <div className="space-y-3">
                                        {post.comments.length === 0 ? (
                                          <p className="text-[10px] text-slate-400 font-mono text-center py-2">No comments posted yet. Share your feedback below!</p>
                                        ) : (
                                          post.comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                                              <img 
                                                src={comment.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(comment.authorName)}`} 
                                                alt={comment.authorName} 
                                                className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 border"
                                              />
                                              <div className="flex-1 space-y-1 text-left">
                                                <div className="flex justify-between items-center text-[10px]">
                                                  <span className="font-bold text-slate-900">{comment.authorName}</span>
                                                  <span className="text-slate-400 font-mono">{comment.timestamp}</span>
                                                </div>
                                                <p className="leading-relaxed text-slate-600 font-sans">{comment.content}</p>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      {/* Comment writing box */}
                                      <div className="pt-2 flex gap-2">
                                        <input 
                                          type="text"
                                          placeholder={currentUser ? "Write an reply..." : "Sign in to add a comment"}
                                          disabled={!currentUser}
                                          value={newCommentText[post.id] || ""}
                                          onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                                        />
                                        <button
                                          disabled={!currentUser || !(newCommentText[post.id] || "").trim()}
                                          onClick={() => handleCommentPost(post.id)}
                                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                              </div>

                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* Hot stats sidebar (4 columns) */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Live follow list / verified partners widget */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>Wellness Professionals</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Meet & follow registered herbal specialists</p>
                      </div>

                      <div className="space-y-3">
                        {allProfiles.length === 0 ? (
                          <p className="text-[10px] text-slate-400 font-mono text-center">No profiles found.</p>
                        ) : (
                          allProfiles.slice(0, 5).map((profile) => {
                            const followersCount = allProfiles.filter(p => p.following.includes(profile.email)).length;
                            const isFollowedByMe = currentUser && currentUser.following.includes(profile.email);
                            const isMe = currentUser && currentUser.email === profile.email;

                            return (
                              <div key={profile.email} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={profile.avatar} 
                                    alt={profile.username} 
                                    className="w-7 h-7 rounded-full object-cover border"
                                  />
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{profile.username}</span>
                                    <span className="text-[9px] text-slate-400 font-mono font-medium">{followersCount} followers</span>
                                  </div>
                                </div>

                                {currentUser && !isMe && (
                                  <button
                                    onClick={() => handleFollowToggle(profile.email)}
                                    className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                      isFollowedByMe 
                                        ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs shadow-emerald-600/10"
                                    }`}
                                  >
                                    {isFollowedByMe ? "✓" : "+ Follow"}
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Community rules widget */}
                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 space-y-3 text-left">
                      <span className="font-bold text-xs uppercase tracking-wider font-mono text-emerald-800">Forums Code of Conduct</span>
                      <ul className="space-y-1.5 text-xs text-emerald-900 leading-normal font-sans">
                        <li>🌿 **Sourced by Enrico**: Only advocate traditional organic extracts.</li>
                        <li>🤝 **No Spams**: Respect dosing questions and partner opinions.</li>
                        <li>🛡️ **Secure Orders**: Never share Gcash receipts or OR numbers in discussion posts.</li>
                        <li>📌 **Admin Power**: Complaints/scams go instantly to **andayaenrico55@gmail.com**.</li>
                      </ul>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 7: REAL-TIME MESSENGER GROUP CHATS */}
            {activeTab === "messenger" && (
              <div id="messenger-chats-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
                
                {/* Left Panel: Active GCs & User Network (4 Columns) */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
                  
                  {/* Channels panel header */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex flex-col text-left">
                      <span className="text-xs uppercase font-mono tracking-wider font-bold text-emerald-400">Wellness Messenger</span>
                      <span className="text-sm font-bold font-display leading-none mt-1 text-white">Direct GC Group Chats</span>
                    </div>

                    <button
                      onClick={() => {
                        if (!currentUser) {
                          setAuthTab("login");
                          setShowAuthModal(true);
                          addSystemAlert("warning", "Please sign in to open a new group chat.");
                        } else {
                          setShowCreateGcModal(true);
                        }
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                      title="New GC Group Chat"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Channel stream items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[300px] border-b border-slate-150">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-2 px-1 text-left">Active Chatrooms</span>
                    {groupChats.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-mono text-center py-4">No active GCs yet.</p>
                    ) : (
                      groupChats.map((chat) => {
                        const isActive = activeGcId === chat.id;
                        const isMember = currentUser && chat.memberEmails.includes(currentUser.email);

                        return (
                          <div
                            key={chat.id}
                            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                              isActive 
                                ? "bg-emerald-50 border-emerald-200" 
                                : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                            }`}
                            onClick={() => {
                              if (isMember || chat.id === "gc-general") {
                                setActiveGcId(chat.id);
                              } else {
                                handleJoinGC(chat.id);
                              }
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{chat.name}</span>
                              <span className="text-[8px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                                {chat.memberEmails.length} online
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 truncate">{chat.description}</p>
                            
                            {!isMember && chat.id !== "gc-general" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJoinGC(chat.id);
                                }}
                                className="w-full mt-2 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold font-mono rounded-lg transition cursor-pointer"
                              >
                                Join Group Chat
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Live user follows section in Messenger panel */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider block px-1">Social Follower Graph</span>
                      <span className="text-[8px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded uppercase font-semibold">Live User Profiles</span>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {allProfiles.map((p) => {
                        const isMe = currentUser && currentUser.email === p.email;
                        const isFollowedByMe = currentUser && currentUser.following.includes(p.email);
                        const followersCount = allProfiles.filter(other => other.following.includes(p.email)).length;

                        return (
                          <div key={p.email} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-[10px]">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <img src={p.avatar} alt={p.username} className="w-6 h-6 rounded-full object-cover shrink-0 border" />
                              <div className="flex flex-col text-left min-w-0">
                                <span className="font-bold text-slate-800 truncate" title={p.username}>{p.username}</span>
                                <span className="text-[8px] text-slate-400 truncate">{followersCount} followers</span>
                              </div>
                            </div>

                            {currentUser && !isMe && (
                              <button
                                onClick={() => handleFollowToggle(p.email)}
                                className={`px-2 py-0.5 rounded font-mono font-bold shrink-0 text-[8px] cursor-pointer ${isFollowedByMe ? "bg-slate-100 text-slate-500" : "bg-emerald-600 text-white"}`}
                              >
                                {isFollowedByMe ? "✓" : "+ Follow"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Panel: Active GC Conversation (8 Columns) */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
                  {(() => {
                    const selectedGc = groupChats.find(g => g.id === activeGcId);
                    if (!selectedGc) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                          <MessageCircle className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
                          <h4 className="font-display font-semibold text-slate-800">Select or Join a Group Chat</h4>
                          <p className="text-xs text-slate-500 mt-1">Real-time herbal wellness messages will populate here instantly.</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Conversation Header */}
                        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center border-b border-slate-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-700 border border-emerald-500/20 flex items-center justify-center text-sm font-bold font-mono text-white">
                              {selectedGc.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-bold font-display leading-tight text-white">{selectedGc.name}</h4>
                              <p className="text-[10px] text-emerald-200/90 font-mono mt-0.5 truncate max-w-[280px]" title={selectedGc.description}>{selectedGc.description}</p>
                            </div>
                          </div>

                          <div className="text-[10px] text-emerald-100 font-mono text-right bg-white/10 px-2.5 py-1 rounded-full">
                            Members: {selectedGc.memberEmails.length} online
                          </div>
                        </div>

                        {/* Message Stream */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                          {selectedGc.messages.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs font-mono">
                              No messages in this chat. Start the conversation!
                            </div>
                          ) : (
                            selectedGc.messages.map((msg, idx) => {
                              const isMe = currentUser && msg.senderEmail === currentUser.email;

                              return (
                                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                  <div className="flex items-start space-x-2 max-w-[80%]">
                                    {!isMe && (
                                      <img 
                                        src={msg.senderAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(msg.senderName)}`} 
                                        alt={msg.senderName} 
                                        className="w-7 h-7 rounded-full object-cover shrink-0 border mt-3"
                                      />
                                    )}

                                    <div className="flex flex-col">
                                      {!isMe && (
                                        <span className="text-[9px] text-slate-500 font-bold ml-1 text-left mb-0.5">
                                          {msg.senderName}
                                        </span>
                                      )}
                                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed text-left shadow-xs ${
                                        isMe 
                                          ? "bg-slate-900 text-white rounded-tr-none" 
                                          : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                                      }`}>
                                        <p>{msg.content}</p>
                                        <span className="text-[8px] text-slate-400 text-right block mt-1 font-mono leading-none">
                                          {msg.timestamp}
                                        </span>
                                      </div>
                                    </div>

                                    {isMe && (
                                      <img 
                                        src={msg.senderAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(msg.senderName)}`} 
                                        alt={msg.senderName} 
                                        className="w-7 h-7 rounded-full object-cover shrink-0 border mt-3"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Message Input Footer */}
                        <form onSubmit={handleSendGCMessage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
                          <input 
                            type="text"
                            value={chatInputMessage}
                            onChange={(e) => setChatInputMessage(e.target.value)}
                            placeholder={currentUser ? `Send real-time chat message to ${selectedGc.name}...` : "Please sign in to chat"}
                            disabled={!currentUser}
                            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                          />
                          <button
                            type="submit"
                            disabled={!currentUser || !chatInputMessage.trim()}
                            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
                          >
                            Send
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer id="global-layout-footer" className="bg-slate-900 text-slate-400 py-8 px-4 md:px-8 border-t border-slate-800 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-bold text-white font-display text-sm">Love Herbal by Enrico Andaya</p>
            <p className="text-[11px] text-slate-500">A personalized wellness journey experience</p>
            <p className="text-[10px] text-slate-500 font-mono">Developed & created by Usagyuun VTuber a.k.a Mark David Valmores</p>
          </div>

          <div className="flex flex-col md:items-end space-y-1.5 font-mono text-[10px]">
            <div>Authorized Fund Representative: andayaenrico55@gmail.com</div>
            <div>GCash CP #: 09102225789</div>
            <div>Official Wellness Partner: Enrico Andaya</div>
            <div className="text-emerald-400">© 2026 Love Herbal PH Corp.</div>
          </div>
        </div>
      </footer>

      {/* NOTIFICATIONS PROMPT MODAL (First timers check) */}
      <AnimatePresence>
        {showNotificationModal && (
          <div id="notifications-prompt-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 text-center"
            >
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-slate-900 text-sm">Enable Order & Stock Alerts?</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Receive instant real-time notifications about checkout confirmations, restock availability, and wellness reminders during your purchase.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  id="decline-notifs"
                  onClick={() => handleEnableNotifications(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Maybe Later
                </button>
                <button
                  id="approve-notifs"
                  onClick={() => handleEnableNotifications(true)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                >
                  Enable Alerts
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC SECURE CHECKOUT MODAL (GCash & PayPal support) */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div id="secure-checkout-overlay" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col space-y-6"
            >
              {/* Checkout Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-display font-bold text-slate-950 text-sm">Secure Purchase & Dispatch</h3>
                </div>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                
                {/* 1. Account credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono block uppercase">Your Name</label>
                    <input 
                      type="text"
                      required
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono block uppercase">Email for Receipts</label>
                    <input 
                      type="email"
                      required
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="juan@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* 2. Choose Payment Method */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-mono block uppercase">Settlement Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("GCash")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                        paymentMethod === "GCash" 
                          ? "border-blue-500 bg-blue-50/50 text-blue-800" 
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                        G
                      </div>
                      <span>GCash (Philippines)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PayPal")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                        paymentMethod === "PayPal" 
                          ? "border-amber-500 bg-amber-50/50 text-amber-800" 
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                        P
                      </div>
                      <span>PayPal Account</span>
                    </button>
                  </div>
                </div>

                {/* 3. Conditional GCash payment details (Philippines specialized) */}
                {paymentMethod === "GCash" ? (
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center space-x-1 text-xs font-bold text-blue-900">
                      <span>GCash Real-time Settlement Procedure</span>
                    </div>
                    <p className="text-[10px] text-blue-800 leading-normal">
                      Send your total order amount of <strong>₱{getCartTotal()}.00</strong> to GCash wellness fund account <strong>CP # 09102225789</strong> (Registered under Love Herbal).
                    </p>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-mono block uppercase">GCash Reference Number</label>
                      <input 
                        type="text"
                        required={paymentMethod === "GCash"}
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="e.g. 1098 2738 4918"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-amber-900">PayPal Direct Settlement</div>
                    <p className="text-[10px] text-amber-800 leading-normal">
                      Confirming purchase will auto-forward receipt matching to authorized PayPal account <strong>andayaenrico55@gmail.com</strong>.
                    </p>
                  </div>
                )}

                {/* Submit trigger with loaders */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-500">Amount Due:</span>
                    <span className="text-base font-mono font-bold text-emerald-800">₱{getCartTotal()}.00</span>
                  </div>

                  <button
                    id="submit-payment-button"
                    type="submit"
                    disabled={gcashStatus === "verifying"}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-xl hover:shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {gcashStatus === "verifying" ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying GCash Reference Number...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Payment and Checkout</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC THANK YOU / BUNNY MODAL */}
      <AnimatePresence>
        {showThankYouModal && lastCompletedTx && (
          <div id="thank-you-bunny-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-center relative overflow-hidden"
            >
              
              {/* Confetti decoration */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400"></div>

              {/* VTuber Bunny Saying greeting */}
              <div className="space-y-3">
                <div className="text-6xl animate-bounce">
                  🐰🌸
                </div>
                <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded-2xl border border-emerald-100 text-sm font-semibold font-display inline-block max-w-[90%]">
                  "Thank you for your Purchase! Come again soon."
                </div>
              </div>

              {/* Order OR Receipt matching */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs text-left space-y-2">
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>OR NUMBER:</span>
                  <span>{lastCompletedTx.orNumber}</span>
                </div>
                <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
                  Customer: {lastCompletedTx.customerName}
                </div>
                <div className="space-y-1">
                  {lastCompletedTx.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                      <span>{it.productName} (x{it.quantity})</span>
                      <span className="font-mono">₱{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-mono font-bold text-slate-900">
                  <span>TOTAL AMOUNT:</span>
                  <span>₱{lastCompletedTx.totalAmount}.00</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono text-center pt-2">
                  Receipt receipt sent via email to {lastCompletedTx.customerEmail}
                </div>
              </div>

              {/* Close and auto direct to secure portal */}
              <div className="space-y-2">
                <button
                  id="bunny-thankyou-dismiss"
                  onClick={() => {
                    setShowThankYouModal(false);
                    setActiveTab("portal");
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  View Receipts in Secure Portal
                </button>
                <p className="text-[10px] text-slate-400 font-mono">
                  Developed by Usagyuun VTuber for Love Herbal
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN RECEIPT VIEW DIALOG */}
      <AnimatePresence>
        {selectedOrderReceipt && (
          <div id="full-or-dialog-overlay" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col space-y-6"
            >
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wider">Official Digital Receipt</h3>
                </div>
                <button 
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Paper styled Receipt */}
              <div className="border border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50 space-y-4 text-xs font-mono">
                <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
                  <h4 className="font-bold font-display text-sm tracking-wide text-slate-900">LOVE HERBAL PH</h4>
                  <p className="text-[10px] text-slate-500">by Enrico Andaya</p>
                  <p className="text-[9px] text-slate-500">VTuber Division: Usagyuun / Mark David Valmores</p>
                  <p className="text-[10px] text-slate-600">andayaenrico55@gmail.com</p>
                  <p className="text-[9px] text-slate-500 font-mono">CP #: 09102225789</p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-700">
                  <div><strong>OR NUMBER:</strong> {selectedOrderReceipt.orNumber}</div>
                  <div><strong>TX ID:</strong> {selectedOrderReceipt.id}</div>
                  <div><strong>CUSTOMER:</strong> {selectedOrderReceipt.customerName}</div>
                  <div><strong>EMAIL:</strong> {selectedOrderReceipt.customerEmail}</div>
                  <div><strong>DATE:</strong> {new Date(selectedOrderReceipt.date).toLocaleString()}</div>
                </div>

                <div className="h-0.5 border-t border-dashed border-slate-300 my-2"></div>

                <div className="space-y-2">
                  <div className="font-bold text-[10px] uppercase text-slate-400">PURCHASE DETAILS</div>
                  {selectedOrderReceipt.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.productName} (x{i.quantity})</span>
                      <span>₱{i.price * i.quantity}.00</span>
                    </div>
                  ))}
                </div>

                <div className="h-0.5 border-t border-dashed border-slate-300 my-2"></div>

                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>TOTAL PAID</span>
                  <span>₱{selectedOrderReceipt.totalAmount}.00</span>
                </div>

                <div className="bg-white p-3 rounded border border-slate-200 text-[10px] space-y-1">
                  <div><strong>Settlement:</strong> {selectedOrderReceipt.paymentMethod} Payment</div>
                  <div><strong>Reference No:</strong> {selectedOrderReceipt.paymentReference}</div>
                </div>

                <div className="text-center pt-4 border-t border-dashed border-slate-300 space-y-1">
                  <p className="text-[11px] font-bold text-slate-900">"Come Again Soon!"</p>
                  <p className="text-[9px] text-slate-400">Love Herbal Personalized Wellness journey</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Print OR Receipt
                </button>
                <button
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Dismiss
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotPassword && (
          <div id="forgot-password-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden text-slate-900"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowForgotPassword(false)}
                className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-display font-bold text-lg text-slate-950">Password Recovery Console</h3>
                <p className="text-xs text-slate-500">Authorized Merchant Partner Credentials Reset</p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center space-x-2 pb-2">
                <div className={`h-1.5 w-10 rounded-full transition-all ${forgotStep === "verify" ? "bg-emerald-600" : "bg-slate-200"}`}></div>
                <div className={`h-1.5 w-10 rounded-full transition-all ${forgotStep === "reset" ? "bg-emerald-600" : "bg-slate-200"}`}></div>
                <div className={`h-1.5 w-10 rounded-full transition-all ${forgotStep === "success" ? "bg-emerald-600" : "bg-slate-200"}`}></div>
              </div>

              {forgotStep === "verify" && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail.trim().toLowerCase() === "andayaenrico55@gmail.com") {
                    setForgotStep("reset");
                    addSystemAlert("info", "Partner email verified. Please answer security question.");
                  } else {
                    addSystemAlert("warning", "Authorized partner email not found in records.");
                  }
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Merchant Partner Email</label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. andayaenrico55@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Hint: The authorized merchant email is available in Enrico's Heritage or checkout notes (e.g. andayaenrico55@gmail.com).
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    Verify Account Email
                  </button>
                </form>
              )}

              {forgotStep === "reset" && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const cleanAnswer = forgotAnswer.trim().replace(/[^0-9]/g, '');
                  if (cleanAnswer === "09102225789") {
                    if (forgotNewPass.trim().length < 4) {
                      addSystemAlert("warning", "Password must be at least 4 characters long.");
                      return;
                    }
                    setAdminPassword(forgotNewPass);
                    setForgotStep("success");
                    addSystemAlert("success", "Merchant credentials successfully updated!");
                  } else {
                    addSystemAlert("warning", "Verification failed. Security question answer is incorrect.");
                  }
                }} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <strong>Security Verification:</strong> Prove ownership of the Love Herbal merchant account to reset credentials.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Security Question: What is Enrico's registered 11-digit GCash mobile number?
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 09102225789"
                      value={forgotAnswer}
                      onChange={(e) => setForgotAnswer(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Enter New Admin Password</label>
                    <input 
                      type="text"
                      required
                      placeholder="Enter new secure password..."
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    Reset & Apply New Password
                  </button>
                </form>
              )}

              {forgotStep === "success" && (
                <div className="space-y-4 text-center">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto">
                    <Check className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Credentials Updated Successfully</h4>
                    <p className="text-xs text-slate-500">
                      You have securely updated the merchant partner credentials. Your new password is now active.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl font-mono text-xs border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400">NEW PASSWORD:</span>
                    <strong className="text-emerald-800">{adminPassword}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotStep("verify");
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REAL-TIME AUTHENTICATION MODAL (SIGN IN / REGISTER / AVATARS) */}
      <AnimatePresence>
        {showAuthModal && (
          <div id="realtime-auth-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative text-slate-900"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <Leaf className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-display font-bold text-lg text-slate-950">Love Herbal Account</h3>
                <p className="text-xs text-slate-500">Live social interactions, group chats & profile follows</p>
              </div>

              {/* Login / Register tabs switcher */}
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAuthTab("login")}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                    authTab === "login" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab("register")}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                    authTab === "register" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Register Profile
                </button>
              </div>

              {/* Quick fill panel for testers */}
              {authTab === "login" && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 space-y-2 text-left">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-800 font-mono uppercase">
                    <span>💡 Merchant Admin Fast Pass</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-sans leading-normal">
                    Sign in with the authorized owner email <strong>andayaenrico55@gmail.com</strong> to unlock the Support Tickets dashboard instantly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthEmail("andayaenrico55@gmail.com");
                      setAuthPassword(adminPassword);
                    }}
                    className="py-1 px-3 bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold font-mono text-[9px] rounded-lg transition cursor-pointer"
                  >
                    Auto-Fill Admin Partner
                  </button>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="e.g. andayaenrico55@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                {authTab === "register" && (
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Username</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. EnricoAndaya55"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white"
                    />
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                    {authTab === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAuthModal(false);
                          setShowForgotPassword(true);
                        }}
                        className="text-[10px] font-mono text-emerald-600 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                {authTab === "register" && (
                  <>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Short Bio (Optional)</label>
                      <input 
                        type="text"
                        placeholder="Traditional herbal formulation enthusiast."
                        value={authBio}
                        onChange={(e) => setAuthBio(e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Custom VTuber Avatar</label>
                      <div className="grid grid-cols-5 gap-2">
                        {["bunny", "panda", "koala", "fox", "bear"].map((seed) => {
                          const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                          const isSelected = authAvatar === url;
                          return (
                            <button
                              key={seed}
                              type="button"
                              onClick={() => setAuthAvatar(url)}
                              className={`p-1.5 rounded-xl border-2 transition-all bg-slate-50 cursor-pointer ${
                                isSelected ? "border-emerald-600 bg-emerald-50/40" : "border-slate-150 hover:border-slate-300"
                              }`}
                            >
                              <img src={url} alt={seed} className="w-full h-8 object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  {authTab === "login" ? "Sign In to Channels" : "Create My Account"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW WELLNESS GROUP CHAT MODAL */}
      <AnimatePresence>
        {showCreateGcModal && (
          <div id="create-gc-overlay" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative text-slate-900 text-left"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowCreateGcModal(false)}
                className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <MessageSquare className="w-8 h-8 text-emerald-600 animate-pulse" />
                <h3 className="font-display font-bold text-lg text-slate-950">New Wellness Group Chat</h3>
                <p className="text-xs text-slate-500">Create an interactive channel for your herbal network partners</p>
              </div>

              <form onSubmit={handleCreateGC} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Group Chat Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Glootah formulation support team"
                    value={newGcName}
                    onChange={(e) => setNewGcName(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description / Goal</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="What topics will be discussed in this channel?"
                    value={newGcDesc}
                    onChange={(e) => setNewGcDesc(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pre-Invite Members (Profiles)</label>
                  <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50">
                    {allProfiles.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-mono text-center">No other members registered yet.</p>
                    ) : (
                      allProfiles.map((p) => {
                        const isSelected = newGcMembers.includes(p.email);
                        return (
                          <label key={p.email} className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewGcMembers(prev => [...prev, p.email]);
                                } else {
                                  setNewGcMembers(prev => prev.filter(m => m !== p.email));
                                }
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{p.username} ({p.email})</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  Establish Group Chat
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
