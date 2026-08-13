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
  restaurant_name: 'مطعم قـا أحمد',
  logo_url: '',
  description: 'تجربة مطعم مميزة بنكهات طازجة وضيافة دافئة.',
  phone: '+212 5 00 00 00 00',
  address: 'الدار البيضاء، المغرب',
  working_hours: 'الإثنين–الأحد: 09:00 – 23:00',
  default_language: 'Arabic',
  currency: 'MAD',
  primary_color: '#C9A227',
  secondary_color: '#F8EED0',
  accent_color: '#F59E0B',
  qr_text: 'امسح الرمز لعرض المنيو',
  font_family: 'Inter, sans-serif',
};
