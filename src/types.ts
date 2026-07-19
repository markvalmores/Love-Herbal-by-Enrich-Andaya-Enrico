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
