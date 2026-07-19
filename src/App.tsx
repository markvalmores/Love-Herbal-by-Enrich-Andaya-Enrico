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
  Facebook, 
  Share2, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Search, 
  X, 
  ChevronRight, 
  Activity, 
  Award,
  Sparkles,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle,
  Clock
} from "lucide-react";
import { Product, Transaction, ChatMessage, SystemAlert } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // State variables
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [activeTab, setActiveTab] = useState<"store" | "support" | "portal" | "dashboard" | "about">("store");
  const [products, setProducts] = useState<Product[]>([]);
  const [stockAlerts, setStockAlerts] = useState<string[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  
  // Facebook scraper trigger states
  const [fbUrl, setFbUrl] = useState("https://www.facebook.com/profile.php?id=61587916804588");
  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "scraping" | "success" | "error">("idle");
  const [scrapingMessage, setScrapingMessage] = useState("");

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
      text: "Yay! Welcome explorer! I am Usagyuun, your VTuber wellness guide! Let's find your perfect Enrico Andaya formulation today. Ask me anything! Ja Na Matta Ne!",
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

  // Fetch products and dashboard data on load
  useEffect(() => {
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setStockAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error("Error fetching products", e);
    }
  };

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

  // Scrape and extract Facebook Posts automatically using Gemini analysis
  const triggerFacebookExtraction = async () => {
    setScrapingStatus("scraping");
    setScrapingMessage("Scraping Facebook Page media components...");
    try {
      const res = await fetch("/api/extract-facebook-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fbUrl })
      });
      const data = await res.json();
      if (data.success) {
        setScrapingStatus("success");
        setScrapingMessage(data.message);
        setProducts(data.productsDetected);
        fetchDashboardStats();
        
        // Add alert notification
        addSystemAlert("success", `AI parsed and updated Love Herbal catalog. ${data.detectedProductsCount} items aligned.`);
      } else {
        setScrapingStatus("error");
        setScrapingMessage(data.error || "Failed to parse Facebook Page posts.");
      }
    } catch (err: any) {
      setScrapingStatus("error");
      setScrapingMessage("Network failure connection: " + err.message);
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
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutEmail) {
      addSystemAlert("warning", "Please provide checkout credentials to dispatch.");
      return;
    }

    if (paymentMethod === "GCash") {
      if (!referenceNumber) {
        addSystemAlert("warning", "GCash payments require to type in reference number.");
        return;
      }
      // Trigger Philippine GCash visual processing
      setGcashStatus("verifying");
      addSystemAlert("info", "GCash real-time reference audit matching. Please wait...");
      
      // Real-time verification loop delay
      setTimeout(async () => {
        await executeFinalCheckout();
      }, 2500);
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
          referenceNumber: paymentMethod === "GCash" ? referenceNumber : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGcashStatus("success");
        setLastCompletedTx(data.transaction);
        setCart([]);
        setShowCheckoutModal(false);
        setShowThankYouModal(true);
        fetchProducts(); // refresh inventory
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
        text: data.reply || "I am processing your wellness question. Ja Na Matta Ne!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        sender: "bot",
        text: "I had a tiny disconnect, but Usagyuun is back! Ask me anything about Enrico Andaya's formulas. Ja Na Matta Ne!",
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

          {/* Scraper bar integrated cleanly for Facebook profile page */}
          <div className="w-full md:w-auto max-w-md flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <div className="flex items-center pl-3 text-slate-400">
              <Facebook className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
              <span className="text-xs text-slate-500 font-mono truncate hidden lg:inline max-w-[120px]">
                profile.php?id=61587916804588
              </span>
            </div>
            <button
              id="scrape-fb-action"
              onClick={triggerFacebookExtraction}
              disabled={scrapingStatus === "scraping"}
              className={`ml-auto px-4 py-2 text-xs font-medium rounded-lg shadow-sm transition-all flex items-center space-x-1.5 ${
                scrapingStatus === "scraping" 
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {scrapingStatus === "scraping" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing AI Catalog...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sync FB Posts</span>
                </>
              )}
            </button>
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
          </div>
        </div>

        {/* Global tab Navigation with explicit layout IDs */}
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: "store", label: "Organic Store", icon: ShoppingBag },
            { id: "support", label: "Usagyuun Wellness AI", icon: MessageSquare },
            { id: "portal", label: "Digital Receipts & Portal", icon: FileText },
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
        
        {/* Scraping AI banner notification if success or error */}
        {scrapingStatus !== "idle" && (
          <div id="scraping-notifier-banner" className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-xs border ${
            scrapingStatus === "success" 
              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
              : scrapingStatus === "error"
              ? "bg-red-50 border-red-100 text-red-800"
              : "bg-slate-100 border-slate-200 text-slate-700 animate-pulse"
          }`}>
            <Sparkles className={`w-4 h-4 shrink-0 ${scrapingStatus === "scraping" ? "animate-spin text-emerald-600" : ""}`} />
            <div className="flex-1">
              <span className="font-semibold block">AI Scraper Extraction Engine:</span>
              <span>{scrapingMessage}</span>
            </div>
            {scrapingStatus !== "scraping" && (
              <button onClick={() => setScrapingStatus("idle")} className="p-1 hover:bg-slate-200/50 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

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
                        Every capsule and organic tea is fully verified by our AI matching mechanism, directly synchronized with Enrico Andaya's Facebook feed.
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
                        We are populating the native herbal catalog or connecting with Enrico's live Facebook updates.
                      </p>
                      <button 
                        onClick={triggerFacebookExtraction}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                      >
                        Manually Fetch Catalog
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
                              {product.isExtracted && (
                                <span className="bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full flex items-center space-x-1 font-bold shadow-sm">
                                  <Facebook className="w-2.5 h-2.5" />
                                  <span>FB SYNCED</span>
                                </span>
                              )}
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
                            Direct automated transfers are processed instantly to GCash wellness fund <strong>CP # 09560333111</strong> or <strong>andayaenrico55@gmail.com</strong>.
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

                  {/* Quick questions list */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                    <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider">Common Questions</h4>
                    <div className="flex flex-col space-y-2">
                      {[
                        "What is Banaba leaf tea best used for?",
                        "How can I take pure Moringa capsules daily?",
                        "Can Lagundi cure minor dry coughs?",
                        "Is Sambong tea safe for daily kidney cleansing?"
                      ].map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => {
                            setChatInput(q);
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl text-[11px] text-slate-700 font-medium border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between"
                        >
                          <span className="truncate">{q}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
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
                              <div>Ref Number: {order.paymentReference}</div>
                              <div>Merchant Account: andayaenrico55@gmail.com</div>
                              <div>GCash Account (CP #): 09560333111</div>
                              <div>Checkout Date: {new Date(order.date).toLocaleString()}</div>
                            </div>
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
                      <p className="text-[10px] text-slate-500 font-mono">Secure merchant account: andayaenrico55@gmail.com (09560333111)</p>
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
                    <span className="font-semibold block text-sm">Automated Digital Matching:</span>
                    <p>
                      Our system utilizes standard, fast-acting scraper processes that trace the real-time media feeds on Enrico Andaya's official Facebook Profile. We match and detect each physical wellness item with precision, immediately making them available for secure purchase via GCash Reference Verification to **CP # 09560333111** or PayPal settlement to <strong>andayaenrico55@gmail.com</strong>.
                    </p>
                  </div>

                  <p className="pt-2 text-[10px] text-slate-500 font-mono text-center">
                    Website developed and created by Usagyuun VTuber a.k.a Mark David Valmores. All rights reserved.
                  </p>
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
            <div>GCash CP #: 09560333111</div>
            <div>Scraped Source: <span className="text-blue-400">facebook.com/profile.php?id=61587916804588</span></div>
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
                      Send your total order amount of <strong>₱{getCartTotal()}.00</strong> to GCash wellness fund account <strong>CP # 09560333111</strong> (Registered under Love Herbal).
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
                  "Thank you for your Purchase! Come Again, Ja Na Matta Ne."
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
                  <p className="text-[9px] text-slate-500 font-mono">CP #: 09560333111</p>
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
                  <p className="text-[11px] font-bold text-slate-900">"Come Again, Ja Na Matta Ne!"</p>
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

    </div>
  );
}
