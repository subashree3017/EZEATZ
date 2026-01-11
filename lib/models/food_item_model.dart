import 'package:cloud_firestore/cloud_firestore.dart';

class FoodItem {
  final String id;
  final String shopId;
  final String name;
  final String description;
  final String imageUrl;
  final double price;
  final String category;
  final bool isAvailable;
  final bool isVeg;
  final int preparationTime; // in minutes
  final double rating;
  final int orderCount;
  final List<String> tags;

  FoodItem({
    required this.id,
    required this.shopId,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.price,
    required this.category,
    this.isAvailable = true,
    this.isVeg = true,
    this.preparationTime = 10,
    this.rating = 0.0,
    this.orderCount = 0,
    this.tags = const [],
  });

  factory FoodItem.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FoodItem(
      id: doc.id,
      shopId: data['shopId'] ?? '',
      name: data['name'] ?? '',
      description: data['description'] ?? '',
      imageUrl: data['imageUrl'] ?? '',
      price: (data['price'] ?? 0.0).toDouble(),
      category: data['category'] ?? 'General',
      isAvailable: data['isAvailable'] ?? true,
      isVeg: data['isVeg'] ?? true,
      preparationTime: data['preparationTime'] ?? 10,
      rating: (data['rating'] ?? 0.0).toDouble(),
      orderCount: data['orderCount'] ?? 0,
      tags: List<String>.from(data['tags'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'shopId': shopId,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'price': price,
      'category': category,
      'isAvailable': isAvailable,
      'isVeg': isVeg,
      'preparationTime': preparationTime,
      'rating': rating,
      'orderCount': orderCount,
      'tags': tags,
    };
  }

  FoodItem copyWith({
    String? id,
    String? shopId,
    String? name,
    String? description,
    String? imageUrl,
    double? price,
    String? category,
    bool? isAvailable,
    bool? isVeg,
    int? preparationTime,
    double? rating,
    int? orderCount,
    List<String>? tags,
  }) {
    return FoodItem(
      id: id ?? this.id,
      shopId: shopId ?? this.shopId,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      category: category ?? this.category,
      isAvailable: isAvailable ?? this.isAvailable,
      isVeg: isVeg ?? this.isVeg,
      preparationTime: preparationTime ?? this.preparationTime,
      rating: rating ?? this.rating,
      orderCount: orderCount ?? this.orderCount,
      tags: tags ?? this.tags,
    );
  }
}
