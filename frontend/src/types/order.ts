export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'PAID'

export interface OrderItem {
  id: number
  quantity: number
  unitPrice: string
  menuItemId: number
  menuItem: {
    name: string
  }
}

export interface Order {
  id: number
  orderNo: string
  tableNo: string
  status: OrderStatus
  totalPrice: string
  createdAt: string
  items: OrderItem[]
}
