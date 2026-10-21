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
  descAr?: string;
  descFr?: string;
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
  businessName: LocalizedString | string;
  title?: string;
  subtitle?: LocalizedString | string;
  slogan?: LocalizedString | string;
  description: LocalizedString | string;
  phone: string;
  phoneDisplay?: string;
  email?: string;
  whatsapp: string;
  whatsappLink?: string;
  city?: LocalizedString | string;
  deliveryText?: LocalizedString | string;
  mapsUrl?: string;
  posterImage: string;
  qrCodeImage?: string;
  qrCodeUrl?: string;
  logoImage?: string;
  organization?: LocalizedString | string;
  linkedin?: string;
  website?: string;
  theme?: {
    primary: string;
    accent: string;
    dark: string;
  };
  badges?: BadgeItem[];
  categories?: CategoryItem[];
  socialLinks?: SocialLink[];
  instagram?: string;
  facebook?: string;
  adminPin: string;
}

