import 'package:flutter/material.dart';
import '../models/cart_item_model.dart';
import '../models/food_item_model.dart';

class CartProvider extends ChangeNotifier {
  final Map<String, CartItem> _items = {};
  String? _selectedShopId;
  String? _selectedShopName;

  Map<String, CartItem> get items => {..._items};
  int get itemCount => _items.length;
  String? get selectedShopId => _selectedShopId;
  String? get selectedShopName => _selectedShopName;

  int get totalQuantity {
    int total = 0;
    _items.forEach((key, cartItem) {
      total += cartItem.quantity;
    });
    return total;
  }

  double get subtotal {
    double total = 0.0;
    _items.forEach((key, cartItem) {
      total += cartItem.totalPrice;
    });
    return total;
  }

  double get tax => subtotal * 0.05; // 5% GST

  double get totalAmount => subtotal + tax;

  List<CartItem> get cartItems => _items.values.toList();

  bool get isEmpty => _items.isEmpty;

  void setSelectedShop(String shopId, String shopName) {
    if (_selectedShopId != shopId && _items.isNotEmpty) {
      // Clear cart if switching shops
      _items.clear();
    }
    _selectedShopId = shopId;
    _selectedShopName = shopName;
    notifyListeners();
  }

  void addItem(FoodItem foodItem, {String? specialInstructions}) {
    // Check if item is from a different shop
    if (_selectedShopId != null && foodItem.shopId != _selectedShopId) {
      // Clear cart and set new shop
      _items.clear();
    }

    if (_items.containsKey(foodItem.id)) {
      // Increase quantity
      _items.update(
        foodItem.id,
        (existingItem) => CartItem(
          foodItem: existingItem.foodItem,
          quantity: existingItem.quantity + 1,
          specialInstructions:
              specialInstructions ?? existingItem.specialInstructions,
        ),
      );
    } else {
      // Add new item
      _items.putIfAbsent(
        foodItem.id,
        () => CartItem(
          foodItem: foodItem,
          quantity: 1,
          specialInstructions: specialInstructions,
        ),
      );
    }
    notifyListeners();
  }

  void removeItem(String foodItemId) {
    _items.remove(foodItemId);
    if (_items.isEmpty) {
      _selectedShopId = null;
      _selectedShopName = null;
    }
    notifyListeners();
  }

  void decreaseQuantity(String foodItemId) {
    if (!_items.containsKey(foodItemId)) return;

    if (_items[foodItemId]!.quantity > 1) {
      _items.update(
        foodItemId,
        (existingItem) => CartItem(
          foodItem: existingItem.foodItem,
          quantity: existingItem.quantity - 1,
          specialInstructions: existingItem.specialInstructions,
        ),
      );
    } else {
      removeItem(foodItemId);
    }
    notifyListeners();
  }

  void increaseQuantity(String foodItemId) {
    if (!_items.containsKey(foodItemId)) return;

    _items.update(
      foodItemId,
      (existingItem) => CartItem(
        foodItem: existingItem.foodItem,
        quantity: existingItem.quantity + 1,
        specialInstructions: existingItem.specialInstructions,
      ),
    );
    notifyListeners();
  }

  void updateSpecialInstructions(String foodItemId, String instructions) {
    if (!_items.containsKey(foodItemId)) return;

    _items.update(
      foodItemId,
      (existingItem) => CartItem(
        foodItem: existingItem.foodItem,
        quantity: existingItem.quantity,
        specialInstructions: instructions,
      ),
    );
    notifyListeners();
  }

  int getItemQuantity(String foodItemId) {
    if (_items.containsKey(foodItemId)) {
      return _items[foodItemId]!.quantity;
    }
    return 0;
  }

  void clear() {
    _items.clear();
    _selectedShopId = null;
    _selectedShopName = null;
    notifyListeners();
  }

  List<Map<String, dynamic>> getItemsForOrder() {
    return _items.values.map((item) => item.toMap()).toList();
  }
}
