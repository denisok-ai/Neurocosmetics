/**
 * @file index.ts
 * @description Общие TypeScript-типы для HAEE Neurocosmetics Portal
 * @dependencies -
 * @created 2025-03-05
 */

export type UserRole = "guest" | "user" | "b2b" | "manager" | "admin";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type AgentType = "sales" | "b2b" | "care" | "copilot";

export type LLMProvider = "openai" | "anthropic" | "deepseek";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  /** Курс применения (для отображения на карточке) */
  course?: string;
  /** Краткий состав набора */
  composition?: string;
  /** Цена по запросу (B2B) — не добавляется в корзину */
  price_on_request?: boolean;
  /** Галерея: до 5 изображений с разных ракурсов (первое = основное) */
  images?: string[];
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface AiPrompt {
  id: string;
  agent_type: AgentType;
  title: string;
  system_prompt: string;
  model: string;
  temperature: number;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface LLMSettings {
  provider: LLMProvider;
  model: string;
  api_key: string;
  temperature: number;
  prompt_id: string | null;
}
