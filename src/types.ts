export interface Product {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  price: number;
  image: string;
  stock: number;
  category: string;
  isExtracted?: boolean;
  fbPostId?: string;
  fbPostUrl?: string;
  detectedAt?: string;
}

export interface Transaction {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: 'GCash' | 'PayPal';
  paymentReference?: string;
  status: 'Pending' | 'Completed' | 'Failed';
  orNumber: string;
  shippingAddress?: string;
  shippingStatus?: 'Pending Payment' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber?: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  email: string;
  username: string;
  avatar: string;
  bio: string;
  followers: string[]; // List of user emails
  following: string[]; // List of user emails
  createdAt: string;
  role: 'admin' | 'user';
}

export interface PostComment {
  id: string;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  upvotes: string[]; // Emails
  downvotes: string[]; // Emails
  reactions: { [emoji: string]: string[] }; // Emoji to emails mapping
  comments: PostComment[];
  createdAt: string;
  mediaUrl?: string;
}

export interface GroupMessage {
  id: string;
  senderEmail: string;
  senderUsername: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
}

export interface GroupChat {
  id: string;
  name: string;
  description: string;
  createdBy: string; // Email
  memberEmails: string[];
  messages: GroupMessage[];
  createdAt: string;
}

export interface SupportComplaint {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'Pending' | 'Resolved';
  createdAt: string;
}

