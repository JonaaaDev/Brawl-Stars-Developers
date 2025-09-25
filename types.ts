export interface Country {
  id: string;
  name: string;
  createdAt: number;
  battery?: number;
  isCharging?: boolean;
  postalCode?: string;
  city?: string;
  ipv4?: string;
  ipv6?: string;
}