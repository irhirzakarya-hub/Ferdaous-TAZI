export interface LocalizedString {
  ar: string;
  fr: string;
}

export interface BadgeItem {
  id: string;
  ar: string;
  fr: string;
  icon: string;
  descAr?: string;
  descFr?: string;
}

export interface ProductItem {
  nameAr: string;
  nameFr: string;
}

export interface CategoryItem {
  id: string;
  nameAr: string;
  nameFr: string;
  icon: string;
  items: ProductItem[];
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  color?: string;
}

export interface ProfileData {
  businessName: LocalizedString;
  subtitle: LocalizedString;
  slogan: LocalizedString;
  description: LocalizedString;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappLink: string;
  city: LocalizedString;
  deliveryText: LocalizedString;
  mapsUrl: string;
  posterImage: string;
  logoImage?: string;
  theme?: {
    primary: string;
    accent: string;
    dark: string;
  };
  badges: BadgeItem[];
  categories: CategoryItem[];
  socialLinks: SocialLink[];
  adminPin: string;
}
