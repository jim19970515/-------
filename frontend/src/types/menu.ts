export interface Category {
  id: number
  name: string
  items: MenuItem[]
}

export interface MenuItem {
  id: number
  name: string
  price: string
  description: string | null
  image: string | null
  isAvailable: boolean
  categoryId: number
}

export interface MenuItemPayload {
  name: string
  price: number
  description?: string
  image?: string
  categoryId: number
  isAvailable?: boolean
}
