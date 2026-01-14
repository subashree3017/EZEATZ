# EZEATZ - Canteen Admin Web Application

A modern, feature-rich admin panel for college canteen management with real-time menu updates, stock tracking, and automated daily specials.

![EZEATZ Admin](https://img.shields.io/badge/EZEATZ-Admin%20Portal-FFD700?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7wn42977iP</dGV4dD48L3N2Zz4=)

## ✨ Features

- 🔐 **Google Sign-In** with Email/OTP signup for new users
- 🍽️ **Multi-canteen support** with separate menus per canteen
- 📸 **Food item management** with images, prices, and stock status
- ⏰ **30-minute stock alerts** to remind admins to update inventory
- 🔄 **Auto-enable/disable** items based on stock availability
- 📅 **Special daily foods** that auto-activate on scheduled days
- 🎨 **Vibrant UI** with yellow, blue, red, and white color scheme

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8080

# Then open http://localhost:8080
```

### Option 3: VS Code Live Server
1. Install the "Live Server" extension
2. Right-click on `index.html` → "Open with Live Server"

## 📁 Project Structure

```
EZEATZ/
├── index.html              # Authentication page
├── dashboard.html          # Admin dashboard
├── firebase.json           # Firebase hosting config
├── css/
│   └── styles.css          # Complete design system
└── js/
    ├── firebase-config.js  # Firebase initialization & sample data
    ├── auth.js             # Authentication logic
    ├── dashboard.js        # Dashboard functionality
    ├── menu-manager.js     # Menu CRUD utilities
    ├── stock-alerts.js     # 30-min reminder system
    └── daily-specials.js   # Special food automation
```

## 🔧 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `ezeatz-40d36` (or create new)
3. Enable Authentication:
   - Go to Authentication → Sign-in methods
   - Enable **Google** provider
4. Create Firestore Database:
   - Go to Firestore Database → Create database
5. Get Web Config:
   - Go to Project Settings → Your apps → Web
   - Copy config values to `js/firebase-config.js`

## 🎨 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| 🟡 Yellow | `#FFD700` | Primary accent, buttons |
| 🔵 Blue | `#2196F3` | Links, info badges |
| 🔴 Red | `#FF4444` | Alerts, delete actions |
| ⚪ White | `#FFFFFF` | Backgrounds, text |

## 📱 Pages

### Login Page (`index.html`)
- Animated gradient background
- Google Sign-In button
- Email/OTP signup flow

### Dashboard (`dashboard.html`)
- Real-time date/time display with calendar
- Canteen selector dropdown
- Food items grid with:
  - Image, name, price
  - Stock status (Limited/Unlimited)
  - Enable/Disable toggle
  - Edit/Delete actions
- 30-minute stock update reminders
- Daily specials configuration

## ⚙️ Features in Detail

### Stock Management
- Limited stock items show count
- Auto-disable when stock reaches 0
- 30-minute browser notifications
- Low stock indicators (< 10 items)

### Daily Specials
- Configure specials for each day of week
- Auto-enable when the day arrives
- Visual badge on special items
- Weekly schedule overview

## 🧪 Demo Mode

The app runs in demo mode with sample data when Firebase is not configured:
- 3 sample canteens
- 10 sample food items
- Pre-configured daily specials

## 📋 License

MIT License - Feel free to use for your college canteen!

---

Made with ❤️ for EZEATZ College Canteen