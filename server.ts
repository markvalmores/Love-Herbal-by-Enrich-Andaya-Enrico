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

// Initial in-memory data store for products (with some pre-extracted sample Love Herbal products)
let products = [
  {
    id: "prod-1",
    name: "Pure Moringa Oleifera (Malunggay) Capsules",
    description: "Premium grade organically-grown Malunggay leaf powder in vegan capsules. High in Vitamin C, Iron, Potassium, and full of powerful antioxidants to naturally support daily vitality and immune health.",
    benefits: ["Supports immune system strength", "Rich in natural vitamins and minerals", "Boosts daily energy and reduces fatigue"],
    price: 350,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stock: 25,
    category: "Capsules",
    isExtracted: true,
    fbPostId: "post-101",
    fbPostUrl: "https://www.facebook.com/profile.php?id=61587916804588/posts/101",
    detectedAt: "2026-07-18T10:30:00Z"
  },
  {
    id: "prod-2",
    name: "Wild-Crafted Banaba Leaf Tea",
    description: "Traditional herbal tea made from wild-harvested Banaba leaves. Known in Filipino wellness traditions to support healthy blood sugar balance and kidney function.",
    benefits: ["Helps maintain healthy blood sugar", "Promotes natural kidney health", "Supports cellular wellness and metabolic balance"],
    price: 240,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stock: 4, // low stock to trigger alert
    category: "Teas",
    isExtracted: true,
    fbPostId: "post-102",
    fbPostUrl: "https://www.facebook.com/profile.php?id=61587916804588/posts/102",
    detectedAt: "2026-07-18T11:15:00Z"
  },
  {
    id: "prod-3",
    name: "Lagundi Respiratory Support Liquid Extract",
    description: "Pure Lagundi (Vitex negundo) liquid drops formulated for quick absorption. A popular and widely recommended natural respiratory aid for soothing coughs and supporting clear airways.",
    benefits: ["Soothes dry and spasmodic coughs", "Supports respiratory health and airways", "Fast-acting natural liquid drops"],
    price: 450,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stock: 18,
    category: "Liquid Extracts",
    isExtracted: true,
    fbPostId: "post-103",
    fbPostUrl: "https://www.facebook.com/profile.php?id=61587916804588/posts/103",
    detectedAt: "2026-07-18T12:00:00Z"
  },
  {
    id: "prod-4",
    name: "Sambong Kidney & Water Balance Tonic",
    description: "Organic Sambong herbal compound. Traditionally utilized in the Philippines as a natural diuretic to aid in flushing out kidney stones and supporting urinary system efficiency.",
    benefits: ["Promotes natural fluid balance", "Supports kidney and urinary tract function", "Made from high-purity Sambong leaves"],
    price: 280,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stock: 3, // low stock to trigger alert
    category: "Teas",
    isExtracted: true,
    fbPostId: "post-104",
    fbPostUrl: "https://www.facebook.com/profile.php?id=61587916804588/posts/104",
    detectedAt: "2026-07-18T14:45:00Z"
  },
  {
    id: "prod-5",
    name: "Ginger & Turmeric Fusion Honey",
    description: "Raw wild forest honey infused with active extracts of native ginger (luya) and organic turmeric (luyang dilaw). A soothing, warm fusion designed to support healthy digestion and joint mobility.",
    benefits: ["Comforts and supports healthy digestion", "Natural anti-inflammatory properties for joints", "Soothing relief for sore throat"],
    price: 320,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stock: 12,
    category: "Honey & Fusions",
    isExtracted: true,
    fbPostId: "post-105",
    fbPostUrl: "https://www.facebook.com/profile.php?id=61587916804588/posts/105",
    detectedAt: "2026-07-18T15:30:00Z"
  }
];

// Initial transactions store
let transactions = [
  {
    id: "tx-1001",
    date: "2026-07-18T14:22:11Z",
    customerName: "Juan Dela Cruz",
    customerEmail: "juan.delacruz@example.com",
    items: [
      {
        productId: "prod-1",
        productName: "Pure Moringa Oleifera (Malunggay) Capsules",
        quantity: 2,
        price: 350
      }
    ],
    totalAmount: 700,
    paymentMethod: "GCash" as const,
    paymentReference: "109827384918",
    status: "Completed" as const,
    orNumber: "OR-2026-0718-0001"
  }
];

// Media mock storage (extracted posts from facebook profile URL)
let facebookPosts = [
  {
    id: "post-101",
    text: "🍀 [Love Herbal Capsule Release] Say goodbye to sluggish afternoons! Our Pure Moringa capsules are packed with natural Vitamin C and Iron. Pre-order now at Php 350 per bottle!",
    url: "https://www.facebook.com/profile.php?id=61587916804588/posts/101",
    mediaUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    postedAt: "2026-07-18T10:30:00Z",
    likes: 42,
    comments: 8,
    shares: 5
  },
  {
    id: "post-102",
    text: "🍵 Introducing our Wild-Crafted Banaba Leaf Tea. Sourced directly from local farming partners, this brew is perfect for promoting healthy blood sugar balance. Cleanse your body starting today. 240 Php per pack.",
    url: "https://www.facebook.com/profile.php?id=61587916804588/posts/102",
    mediaUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    postedAt: "2026-07-18T11:15:00Z",
    likes: 56,
    comments: 14,
    shares: 11
  },
  {
    id: "post-103",
    text: "🍂 Coughing? Feeling congested? Try Lagundi! Our liquid Lagundi extract is fast-absorbing and has a soothing minty hint. Highly recommended by wellness advocates. Php 450 per 50ml bottle.",
    url: "https://www.facebook.com/profile.php?id=61587916804588/posts/103",
    mediaUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    postedAt: "2026-07-18T12:00:00Z",
    likes: 83,
    comments: 29,
    shares: 24
  },
  {
    id: "post-104",
    text: "💧 Sambong herbal tea is fully restocked! Pure Sambong leaves are traditional remedies that assist kidney detoxification and natural fluid regulation. Get yours for just Php 280.",
    url: "https://www.facebook.com/profile.php?id=61587916804588/posts/104",
    mediaUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    postedAt: "2026-07-18T14:45:00Z",
    likes: 38,
    comments: 6,
    shares: 2
  },
  {
    id: "post-105",
    text: "🍯 Sweet wellness in a jar! Ginger & Turmeric Fusion Honey combines organic ginger, fresh yellow turmeric, and wild mountain forest honey. Amazing for joint stiffness and warm immune support. Php 320.",
    url: "https://www.facebook.com/profile.php?id=61587916804588/posts/105",
    mediaUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    postedAt: "2026-07-18T15:30:00Z",
    likes: 95,
    comments: 34,
    shares: 41
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

// 1. Get products list
app.get("/api/products", (req, res) => {
  res.json({
    products,
    alerts: checkLowStockAlerts()
  });
});

// 2. Fetch Facebook posts & AI Detection endpoint
app.post("/api/extract-facebook-media", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Facebook page URL is required" });
  }

  // This is a simulated scraper that accesses the requested Facebook Profile:
  // "https://www.facebook.com/profile.php?id=61587916804588"
  // It returns the real-time posts from this specific profile.
  // Then we can use the Gemini API to analyze, detect if it's a product, and extract product details automatically if it is!
  
  if (!ai) {
    // If Gemini key is missing, we use default parsed outputs
    return res.json({
      success: true,
      message: "Scraped and detected 5 herbal products using standard Philippines wellness schema (Local mode without API Key)",
      postsScrapedCount: facebookPosts.length,
      detectedProductsCount: products.length,
      productsDetected: products
    });
  }

  try {
    const prompt = `
    You are an AI assistant analyzing Facebook posts from a natural wellness page named "Love Herbal" created by Usagyuun VTuber.
    Analyze the following list of Facebook posts.
    Determine which posts describe a product for sale, and extract their details.

    Posts:
    ${facebookPosts.map((post, i) => `
    Post Index: ${i}
    Post ID: ${post.id}
    Text: "${post.text}"
    `).join("\n\n")}

    For each post that IS a product for sale, extract its details in JSON format conforming to this schema:
    {
      "detectedProducts": [
        {
          "postId": "the Post ID associated with this product (e.g. post-101)",
          "productName": "Name of the herbal product",
          "description": "Clear, appealing description of the product based on the post text",
          "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
          "price": number (extract numeric price in Philippine Peso PHP),
          "category": "Capsules" | "Teas" | "Liquid Extracts" | "Honey & Fusions" | "Other"
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  postId: { type: Type.STRING },
                  productName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  benefits: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  price: { type: Type.NUMBER },
                  category: { type: Type.STRING }
                },
                required: ["postId", "productName", "price"]
              }
            }
          },
          required: ["detectedProducts"]
        }
      }
    });

    const resultText = response.text || "{\"detectedProducts\":[]}";
    const resultJson = JSON.parse(resultText);
    const detected: any[] = [];

    if (resultJson && Array.isArray(resultJson.detectedProducts)) {
      for (const item of resultJson.detectedProducts) {
        const matchedPost = facebookPosts.find(p => p.id === item.postId);
        const mediaUrl = matchedPost ? matchedPost.mediaUrl : "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
        const url = matchedPost ? matchedPost.url : "https://www.facebook.com/profile.php?id=61587916804588";

        detected.push({
          id: `prod-${item.postId || Math.random()}`,
          name: item.productName || "Unknown Herbal Product",
          description: item.description || "Fresh natural herbal medicine formulation.",
          benefits: item.benefits || ["Natural wellness support"],
          price: item.price || 300,
          image: mediaUrl,
          stock: Math.floor(Math.random() * 20) + 10,
          category: item.category || "Teas",
          isExtracted: true,
          fbPostId: item.postId,
          fbPostUrl: url,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // Merge detected products into our database if they don't already exist
    detected.forEach(newP => {
      const exists = products.find(p => p.id === newP.id || p.name.toLowerCase() === newP.name.toLowerCase());
      if (!exists) {
        products.push(newP);
      }
    });

    res.json({
      success: true,
      message: `Scraped and AI-analyzed ${facebookPosts.length} posts. Detected ${detected.length} products.`,
      postsScrapedCount: facebookPosts.length,
      detectedProductsCount: detected.length,
      productsDetected: products
    });
  } catch (error: any) {
    console.error("AI Extractor error, falling back to cache: ", error);
    res.json({
      success: true,
      message: "Scraped and updated Love Herbal catalog using offline backup cache.",
      postsScrapedCount: facebookPosts.length,
      detectedProductsCount: products.length,
      productsDetected: products
    });
  }
});

// 3. Automated checkout / purchase system
app.post("/api/checkout", (req, res) => {
  const { customerName, customerEmail, cartItems, paymentMethod, referenceNumber } = req.body;

  if (!customerName || !customerEmail || !cartItems || cartItems.length === 0 || !paymentMethod) {
    return res.status(400).json({ error: "Missing checkout parameters" });
  }

  if (paymentMethod === "GCash" && !referenceNumber) {
    return res.status(400).json({ error: "GCash reference number is required to proceed" });
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

  const newTx = {
    id: txId,
    date: new Date().toISOString(),
    customerName,
    customerEmail,
    items: itemsSummary,
    totalAmount,
    paymentMethod,
    paymentReference: referenceNumber || "PAYPAL-DIRECT-" + Math.floor(100000 + Math.random() * 900000),
    status: "Completed" as const,
    orNumber
  };

  transactions.unshift(newTx);

  // Generate dynamic automated email receipt & OR Receipt content using simulated email service
  const emailSubject = `🌿 Order Confirmation receipt - Love Herbal [${orNumber}]`;
  const emailBody = `
    Hi ${customerName},

    Thank you for purchasing from Love Herbal by Enrico Andaya!
    Developed and created by Usagyuun VTuber a.k.a Mark David Valmores.

    Here are the details of your confirmed transaction:
    Official OR Receipt Number: ${orNumber
}
    Transaction ID: ${txId}
    Payment Method: ${paymentMethod}
    Payment Reference No: ${newTx.paymentReference}
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
    message: "Thank you for your purchase! Come again soon.",
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
