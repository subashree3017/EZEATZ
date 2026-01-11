import 'package:cloud_firestore/cloud_firestore.dart';

enum OrderStatus { pending, confirmed, preparing, ready, completed, cancelled }

class OrderItem {
  final String foodItemId;
  final String name;
  final double price;
  final int quantity;
  final double totalPrice;
  final String? specialInstructions;
  final String imageUrl;

  OrderItem({
    required this.foodItemId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.totalPrice,
    this.specialInstructions,
    required this.imageUrl,
  });

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      foodItemId: map['foodItemId'] ?? '',
      name: map['name'] ?? '',
      price: (map['price'] ?? 0.0).toDouble(),
      quantity: map['quantity'] ?? 1,
      totalPrice: (map['totalPrice'] ?? 0.0).toDouble(),
      specialInstructions: map['specialInstructions'],
      imageUrl: map['imageUrl'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'foodItemId': foodItemId,
      'name': name,
      'price': price,
      'quantity': quantity,
      'totalPrice': totalPrice,
      'specialInstructions': specialInstructions,
      'imageUrl': imageUrl,
    };
  }
}

class Order {
  final String id;
  final String oderId; // Unique 6-digit order ID for pickup
  final String userId;
  final String userName;
  final String userEmail;
  final String shopId;
  final String shopName;
  final List<OrderItem> items;
  final double subtotal;
  final double tax;
  final double totalAmount;
  final OrderStatus status;
  final String paymentMethod;
  final String paymentId;
  final bool isPaid;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? estimatedReadyTime;
  final String? notes;

  Order({
    required this.id,
    required this.oderId,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.shopId,
    required this.shopName,
    required this.items,
    required this.subtotal,
    required this.tax,
    required this.totalAmount,
    this.status = OrderStatus.pending,
    required this.paymentMethod,
    this.paymentId = '',
    this.isPaid = false,
    required this.createdAt,
    this.updatedAt,
    this.estimatedReadyTime,
    this.notes,
  });

  factory Order.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Order(
      id: doc.id,
      oderId: data['orderId'] ?? '',
      userId: data['userId'] ?? '',
      userName: data['userName'] ?? '',
      userEmail: data['userEmail'] ?? '',
      shopId: data['shopId'] ?? '',
      shopName: data['shopName'] ?? '',
      items:
          (data['items'] as List<dynamic>?)
              ?.map((item) => OrderItem.fromMap(item as Map<String, dynamic>))
              .toList() ??
          [],
      subtotal: (data['subtotal'] ?? 0.0).toDouble(),
      tax: (data['tax'] ?? 0.0).toDouble(),
      totalAmount: (data['totalAmount'] ?? 0.0).toDouble(),
      status: OrderStatus.values.firstWhere(
        (e) => e.name == (data['status'] ?? 'pending'),
        orElse: () => OrderStatus.pending,
      ),
      paymentMethod: data['paymentMethod'] ?? '',
      paymentId: data['paymentId'] ?? '',
      isPaid: data['isPaid'] ?? false,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
      estimatedReadyTime: (data['estimatedReadyTime'] as Timestamp?)?.toDate(),
      notes: data['notes'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'orderId': oderId,
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'shopId': shopId,
      'shopName': shopName,
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'tax': tax,
      'totalAmount': totalAmount,
      'status': status.name,
      'paymentMethod': paymentMethod,
      'paymentId': paymentId,
      'isPaid': isPaid,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
      'estimatedReadyTime': estimatedReadyTime != null
          ? Timestamp.fromDate(estimatedReadyTime!)
          : null,
      'notes': notes,
    };
  }

  String get statusText {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.preparing:
        return 'Preparing';
      case OrderStatus.ready:
        return 'Ready for Pickup';
      case OrderStatus.completed:
        return 'Completed';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }

  Order copyWith({
    String? id,
    String? oderId,
    String? userId,
    String? userName,
    String? userEmail,
    String? shopId,
    String? shopName,
    List<OrderItem>? items,
    double? subtotal,
    double? tax,
    double? totalAmount,
    OrderStatus? status,
    String? paymentMethod,
    String? paymentId,
    bool? isPaid,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? estimatedReadyTime,
    String? notes,
  }) {
    return Order(
      id: id ?? this.id,
      oderId: oderId ?? this.oderId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userEmail: userEmail ?? this.userEmail,
      shopId: shopId ?? this.shopId,
      shopName: shopName ?? this.shopName,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      tax: tax ?? this.tax,
      totalAmount: totalAmount ?? this.totalAmount,
      status: status ?? this.status,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentId: paymentId ?? this.paymentId,
      isPaid: isPaid ?? this.isPaid,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      estimatedReadyTime: estimatedReadyTime ?? this.estimatedReadyTime,
      notes: notes ?? this.notes,
    );
  }
}
