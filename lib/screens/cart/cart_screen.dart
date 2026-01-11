import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../providers/cart_provider.dart';
import '../../utils/app_theme.dart';
import '../../models/food_item_model.dart';
import '../checkout/checkout_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Cart'),
        actions: [
          if (!cartProvider.isEmpty)
            IconButton(
              onPressed: () {
                _showClearCartDialog(context, cartProvider);
              },
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Clear Cart',
            ),
        ],
      ),
      body: cartProvider.isEmpty
          ? _buildEmptyCart(context)
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cartProvider.cartItems.length,
                    itemBuilder: (context, index) {
                      final cartItem = cartProvider.cartItems[index];
                      return _buildCartItem(
                        context,
                        cartItem,
                        cartProvider,
                        index,
                      );
                    },
                  ),
                ),
                _buildCartSummary(context, cartProvider),
              ],
            ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
                Icons.shopping_cart_outlined,
                size: 100,
                color: Colors.grey.shade300,
              )
              .animate(onPlay: (controller) => controller.repeat())
              .shake(duration: 2000.ms, hz: 2),
          const SizedBox(height: 20),
          Text(
            'Your cart is empty',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 10),
          Text(
            'Add some delicious food to get started!',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 30),
          ElevatedButton(
            onPressed: () {
              // Navigate to shops tab via bottom nav (handled by user gesture mainly)
              // Or could use a global key/callback to switch tabs
            },
            child: const Text('Browse Food Shops'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(
    BuildContext context,
    dynamic cartItem,
    CartProvider provider,
    int index,
  ) {
    final FoodItem item = cartItem.foodItem;

    return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
              ),
            ],
          ),
          child: Row(
            children: [
              // Image
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                ),
                child: SizedBox(
                  width: 100,
                  height: 100,
                  child: item.imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: item.imageUrl,
                          fit: BoxFit.cover,
                        )
                      : Container(
                          color: AppTheme.primaryColor.withValues(alpha: 0.2),
                          child: const Icon(
                            Icons.fastfood,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                ),
              ),

              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '₹${cartItem.totalPrice.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${item.price.toStringAsFixed(0)} x ${cartItem.quantity}',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Quantity Controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          _buildQuantityBtn(
                            icon: Icons.remove,
                            onTap: () => provider.decreaseQuantity(item.id),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              cartItem.quantity.toString(),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                          _buildQuantityBtn(
                            icon: Icons.add,
                            onTap: () => provider.increaseQuantity(item.id),
                            isAdd: true,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        )
        .animate()
        .fadeIn(delay: Duration(milliseconds: 100 * index))
        .slideX(begin: 0.1, end: 0);
  }

  Widget _buildQuantityBtn({
    required IconData icon,
    required VoidCallback onTap,
    bool isAdd = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: isAdd ? AppTheme.primaryColor : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          size: 16,
          color: isAdd ? Colors.white : Colors.black87,
        ),
      ),
    );
  }

  Widget _buildCartSummary(BuildContext context, CartProvider provider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Subtotal'),
                Text(
                  '₹${provider.subtotal.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tax (5%)'),
                Text(
                  '₹${provider.tax.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Amount',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  '₹${provider.totalAmount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const CheckoutScreen()),
                  );
                },
                child: const Text(
                  'Proceed to Checkout',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showClearCartDialog(BuildContext context, CartProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clear Cart?'),
        content: const Text(
          'Are you sure you want to remove all items from the cart?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              provider.clear();
              Navigator.pop(ctx);
            },
            child: const Text('Clear', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
