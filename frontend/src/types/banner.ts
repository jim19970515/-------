export interface Banner {
  id: number
  imageUrl: string
  title: string | null
  subtitle: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export interface BannerPayload {
  imageUrl: string
  title?: string
  subtitle?: string
  sortOrder?: number
  isActive?: boolean
}
