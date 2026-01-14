import 'package:cloud_firestore/cloud_firestore.dart';

class Shop {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final String category;
  final bool isOpen;
  final String openTime;
  final String closeTime;
  final double rating;
  final int totalOrders;

  Shop({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.category,
    this.isOpen = true,
    this.openTime = '08:00',
    this.closeTime = '18:00',
    this.rating = 0.0,
    this.totalOrders = 0,
  });

  factory Shop.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Shop(
      id: doc.id,
      name: data['name'] ?? '',
      description: data['description'] ?? '',
      imageUrl: data['imageUrl'] ?? '',
      category: data['category'] ?? 'General',
      isOpen: data['isOpen'] ?? true,
      openTime: data['openTime'] ?? '08:00',
      closeTime: data['closeTime'] ?? '18:00',
      rating: (data['rating'] ?? 0.0).toDouble(),
      totalOrders: data['totalOrders'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'category': category,
      'isOpen': isOpen,
      'openTime': openTime,
      'closeTime': closeTime,
      'rating': rating,
      'totalOrders': totalOrders,
    };
  }
}
