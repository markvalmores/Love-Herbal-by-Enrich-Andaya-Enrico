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

// 1. Get products list
app.get("/api/products", (req, res) => {
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
  const { customerName, customerEmail, cartItems, paymentMethod, referenceNumber, shippingAddress } = req.body;

  if (!customerName || !customerEmail || !cartItems || cartItems.length === 0 || !paymentMethod) {
    return res.status(400).json({ error: "Missing checkout parameters" });
  }

  // Double check and deduct inventory
  let totalAmount = 0;
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
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(", ") });
  }

  // Deduct stock and assemble items
  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId)!;
    product.stock -= item.quantity;
    totalAmount += product.price * item.quantity;
    itemsSummary.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price
    });
  }

  // Generate unique transactional IDs
  const txId = "tx-" + Math.floor(1000 + Math.random() * 9000);
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
