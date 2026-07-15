// Shared user profile type — mirrors DB User model
export interface UserProfile {
  id: number;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  languageCode?: string | null;
  isAuthorized: boolean;
  subscriptionStatus: 'free' | 'premium' | 'trial';
  generationsAvailable: number;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

// Legacy TelegramUser (from @tma.js/sdk) — used before DB init
export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}