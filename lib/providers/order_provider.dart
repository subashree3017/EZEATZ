import 'dart:math';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart' hide Order;

import '../models/order_model.dart';
import '../models/cart_item_model.dart';

class OrderProvider extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  List<Order> _orders = [];
  Order? _currentOrder;
  bool _isLoading = false;
  String? _error;

  List<Order> get orders => _orders;
  Order? get currentOrder => _currentOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Order> get activeOrders {
    return _orders
        .where(
          (order) =>
              order.status != OrderStatus.completed &&
              order.status != OrderStatus.cancelled,
        )
        .toList();
  }

  List<Order> get completedOrders {
    return _orders
        .where(
          (order) =>
              order.status == OrderStatus.completed ||
              order.status == OrderStatus.cancelled,
        )
        .toList();
  }

  String _generateOrderId() {
    // Generate a 6-digit number based on time and random component
    // unique enough for daily canteen operations
    final timestamp =
        DateTime.now().millisecondsSinceEpoch % 1000; // last 3 digits of time
    final random = Random().nextInt(900) + 100; // 3 digit random
    return '$timestamp$random'; // 6 digits total
  }

  Future<Order?> createOrder({
    required String userId,
    required String userName,
    required String userEmail,
    required String shopId,
    required String shopName,
    required List<CartItem> cartItems,
    required double subtotal,
    required double tax,
    required double totalAmount,
    required String paymentMethod,
    String? paymentId,
    String? notes,
  }) async {
    // 1. Basic Input Validation
    if (totalAmount < 0) throw Exception('Invalid total amount');
    if (cartItems.isEmpty) throw Exception('No items in order');

    // 2. Sanitize Notes
    final sanitizedNotes = notes?.trim().replaceAll(
      RegExp(r'[<>]'),
      '',
    ); // Remove HTML-like tags

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final orderId = _generateOrderId();
      final orderItems = cartItems
          .map(
            (item) => OrderItem(
              foodItemId: item.foodItem.id,
              name: item.foodItem.name,
              price: item.foodItem.price,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              specialInstructions: item.specialInstructions,
              imageUrl: item.foodItem.imageUrl,
            ),
          )
          .toList();

      final orderData = {
        'orderId': orderId,
        'userId': userId,
        'userName': userName,
        'userEmail': userEmail,
        'shopId': shopId,
        'shopName': shopName,
        'items': orderItems.map((item) => item.toMap()).toList(),
        'subtotal': subtotal,
        'tax': tax,
        'totalAmount': totalAmount,
        'status': OrderStatus.pending.name,
        'paymentMethod': paymentMethod,
        'paymentId': paymentId ?? '',
        'isPaid': paymentMethod != 'cash',
        'createdAt': Timestamp.fromDate(DateTime.now()),
        'notes': sanitizedNotes,
      };

      final docRef = await _firestore.collection('orders').add(orderData);

      final order = Order(
        id: docRef.id,
        oderId: orderId,
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        shopId: shopId,
        shopName: shopName,
        items: orderItems,
        subtotal: subtotal,
        tax: tax,
        totalAmount: totalAmount,
        status: OrderStatus.pending,
        paymentMethod: paymentMethod,
        paymentId: paymentId ?? '',
        isPaid: paymentMethod != 'cash',
        createdAt: DateTime.now(),
        notes: sanitizedNotes,
      );

      _currentOrder = order;
      _orders.insert(0, order);

      _isLoading = false;
      notifyListeners();
      return order;
    } catch (e) {
      _error = 'Failed to create order. Please try again.';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<void> fetchUserOrders(String userId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final snapshot = await _firestore
          .collection('orders')
          .where('userId', isEqualTo: userId)
          .orderBy('createdAt', descending: true)
          .get();

      _orders = snapshot.docs.map((doc) => Order.fromFirestore(doc)).toList();

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load orders. Please try again.';
      _isLoading = false;
      notifyListeners();
    }
  }

  Stream<List<Order>> streamUserOrders(String userId) {
    return _firestore
        .collection('orders')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map(
          (snapshot) =>
              snapshot.docs.map((doc) => Order.fromFirestore(doc)).toList(),
        );
  }

  Future<void> cancelOrder(String orderId) async {
    try {
      await _firestore.collection('orders').doc(orderId).update({
        'status': OrderStatus.cancelled.name,
        'updatedAt': Timestamp.fromDate(DateTime.now()),
      });

      final index = _orders.indexWhere((order) => order.id == orderId);
      if (index != -1) {
        _orders[index] = _orders[index].copyWith(
          status: OrderStatus.cancelled,
          updatedAt: DateTime.now(),
        );
      }
      notifyListeners();
    } catch (e) {
      _error = 'Failed to cancel order. Please try again.';
      notifyListeners();
    }
  }

  void setCurrentOrder(Order order) {
    _currentOrder = order;
    notifyListeners();
  }

  void clearCurrentOrder() {
    _currentOrder = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
