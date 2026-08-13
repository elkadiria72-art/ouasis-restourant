export interface RestaurantSettings {
  id?: string;
  restaurant_name: string;
  logo_url: string;
  description: string;
  phone: string;
  address: string;
  working_hours: string;
  default_language: string;
  currency: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  qr_text: string;
  font_family: string;
}

export const defaultSettings: RestaurantSettings = {
  id: 'restaurant',
  restaurant_name: 'Elkahmed Restaurant',
  logo_url: '',
  description: 'A premium restaurant experience with fresh flavors and warm hospitality.',
  phone: '+212 5 00 00 00 00',
  address: 'Casablanca, Morocco',
  working_hours: 'Mon-Sun: 09:00 AM - 11:00 PM',
  default_language: 'Arabic',
  currency: 'MAD',
  primary_color: '#C9A227',
  secondary_color: '#F8EED0',
  accent_color: '#F59E0B',
  qr_text: 'Scan to view our menu',
  font_family: 'Inter, sans-serif',
};
