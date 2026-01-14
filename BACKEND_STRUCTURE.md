# Firebase Backend Structure for EzEatz

This document outlines the Firestore database structure required for the EzEatz Student App. Please ensure the Admin Portal writes data according to this schema.

## Collections

### 1. `users`
Stores student information.
- `uid` (string): User ID from Auth
- `email` (string)
- `displayName` (string)
- `photoUrl` (string)
- `phoneNumber` (string)
- `createdAt` (timestamp)
- `lastLoginAt` (timestamp)

### 2. `shops`
Stores canteen/shop details.
- `name` (string): Shop Name
- `description` (string): Short description
- `imageUrl` (string): URL to cover image
- `category` (string): e.g., "South Indian", "Chinese"
- `isOpen` (boolean): true/false
- `openTime` (string): e.g., "08:00"
- `closeTime` (string): e.g., "18:00"
- `rating` (number): 0.0 to 5.0
- `totalOrders` (number)

### 3. `foodItems`
Stores menu items for each shop.
- `shopId` (string): ID of the parent shop
- `name` (string)
- `description` (string)
- `imageUrl` (string)
- `price` (number)
- `category` (string): e.g., "Breakfast", "Snacks"
- `isAvailable` (boolean)
- `isVeg` (boolean)
- `preparationTime` (number): in minutes
- `rating` (number)
- `orderCount` (number)
- `tags` (array of strings): e.g., ["spicy", "bestseller"]

### 4. `orders`
Stores all placed orders.
- `orderId` (string): 6-digit unique display ID
- `userId` (string)
- `userName` (string)
- `userEmail` (string)
- `shopId` (string)
- `shopName` (string)
- `items` (array of maps):
  - `foodItemId`, `name`, `price`, `quantity`, `totalPrice`, `specialInstructions`, `imageUrl`
- `subtotal` (number)
- `tax` (number)
- `totalAmount` (number)
- `status` (string): "pending", "confirmed", "preparing", "ready", "completed", "cancelled"
- `paymentMethod` (string): "UPI", "Cash"
- `paymentId` (string)
- `isPaid` (boolean)
- `createdAt` (timestamp)
- `estimatedReadyTime` (timestamp): Nullable, set by Admin
- `notes` (string)

## Notifications
The app listens for notifications on the order status updates. The Admin (or backend function) should trigger a notification to the specific user when the order status changes (e.g., to "Ready").
