import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;

import '../../providers/cart_provider.dart';
import '../../providers/shop_provider.dart';
import '../../utils/app_theme.dart';
import '../shop/shops_screen.dart';
import '../cart/cart_screen.dart';
import '../orders/orders_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const ShopsScreen(),
    const CartScreen(),
    const OrdersScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    // Fetch shops on load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ShopProvider>().fetchShops();
    });
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(25),
            topRight: Radius.circular(25),
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.restaurant_outlined),
                activeIcon: Icon(Icons.restaurant),
                label: 'Shops',
              ),
              BottomNavigationBarItem(
                icon: badges.Badge(
                  showBadge: cartProvider.totalQuantity > 0,
                  badgeContent: Text(
                    cartProvider.totalQuantity.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  badgeStyle: const badges.BadgeStyle(
                    badgeColor: AppTheme.primaryColor,
                  ),
                  child: const Icon(Icons.shopping_cart_outlined),
                ),
                activeIcon: badges.Badge(
                  showBadge: cartProvider.totalQuantity > 0,
                  badgeContent: Text(
                    cartProvider.totalQuantity.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  badgeStyle: const badges.BadgeStyle(
                    badgeColor: AppTheme.primaryColor,
                  ),
                  child: const Icon(Icons.shopping_cart),
                ),
                label: 'Cart',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.receipt_long_outlined),
                activeIcon: Icon(Icons.receipt_long),
                label: 'Orders',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
