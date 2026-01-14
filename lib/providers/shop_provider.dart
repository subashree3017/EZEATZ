import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/shop_model.dart';
import '../models/food_item_model.dart';

class ShopProvider extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  List<Shop> _shops = [];
  List<FoodItem> _menuItems = [];
  Shop? _selectedShop;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';
  String _selectedCategory = 'All';

  List<Shop> get shops => _shops;
  List<FoodItem> get menuItems => _filteredMenuItems;
  Shop? get selectedShop => _selectedShop;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  String get selectedCategory => _selectedCategory;

  List<String> get categories {
    final cats = _menuItems.map((item) => item.category).toSet().toList();
    cats.insert(0, 'All');
    return cats;
  }

  List<FoodItem> get _filteredMenuItems {
    List<FoodItem> filtered = _menuItems;

    // Filter by category
    if (_selectedCategory != 'All') {
      filtered = filtered
          .where((item) => item.category == _selectedCategory)
          .toList();
    }

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where(
            (item) =>
                item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                item.description.toLowerCase().contains(
                  _searchQuery.toLowerCase(),
                ) ||
                item.tags.any(
                  (tag) =>
                      tag.toLowerCase().contains(_searchQuery.toLowerCase()),
                ),
          )
          .toList();
    }

    return filtered;
  }

  List<FoodItem> get popularItems {
    final sorted = List<FoodItem>.from(_menuItems)
      ..sort((a, b) => b.orderCount.compareTo(a.orderCount));
    return sorted.take(5).toList();
  }

  List<FoodItem> get recommendedItems {
    // Get items with high rating
    final sorted = List<FoodItem>.from(
      _menuItems.where((item) => item.rating >= 4.0),
    )..sort((a, b) => b.rating.compareTo(a.rating));
    return sorted.take(6).toList();
  }

  Future<void> fetchShops() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final snapshot = await _firestore
          .collection('shops')
          .where('isOpen', isEqualTo: true)
          .get();

      _shops = snapshot.docs.map((doc) => Shop.fromFirestore(doc)).toList();

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load shops. Please try again.';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> selectShop(Shop shop) async {
    _selectedShop = shop;
    await fetchMenuItems(shop.id);
    notifyListeners();
  }

  Future<void> fetchMenuItems(String shopId) async {
    try {
      _isLoading = true;
      _error = null;
      _selectedCategory = 'All';
      _searchQuery = '';
      notifyListeners();

      final snapshot = await _firestore
          .collection('foodItems')
          .where('shopId', isEqualTo: shopId)
          .where('isAvailable', isEqualTo: true)
          .get();

      _menuItems = snapshot.docs
          .map((doc) => FoodItem.fromFirestore(doc))
          .toList();

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load menu. Please try again.';
      _isLoading = false;
      notifyListeners();
    }
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void clearSelection() {
    _selectedShop = null;
    _menuItems = [];
    _searchQuery = '';
    _selectedCategory = 'All';
    notifyListeners();
  }

  Shop? getShopById(String shopId) {
    try {
      return _shops.firstWhere((shop) => shop.id == shopId);
    } catch (e) {
      return null;
    }
  }

  FoodItem? getFoodItemById(String itemId) {
    try {
      return _menuItems.firstWhere((item) => item.id == itemId);
    } catch (e) {
      return null;
    }
  }
}
