
export interface Country {
  id: string;
  name: string;
  createdAt: number;
  battery?: number;
  isCharging?: boolean;
}