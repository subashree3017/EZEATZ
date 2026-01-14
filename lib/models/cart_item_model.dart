import 'food_item_model.dart';

class CartItem {
  final FoodItem foodItem;
  int quantity;
  String? specialInstructions;

  CartItem({
    required this.foodItem,
    this.quantity = 1,
    this.specialInstructions,
  });

  double get totalPrice => foodItem.price * quantity;

  Map<String, dynamic> toMap() {
    return {
      'foodItemId': foodItem.id,
      'name': foodItem.name,
      'price': foodItem.price,
      'quantity': quantity,
      'totalPrice': totalPrice,
      'specialInstructions': specialInstructions ?? '',
      'imageUrl': foodItem.imageUrl,
      'shopId': foodItem.shopId,
    };
  }

  CartItem copyWith({
    FoodItem? foodItem,
    int? quantity,
    String? specialInstructions,
  }) {
    return CartItem(
      foodItem: foodItem ?? this.foodItem,
      quantity: quantity ?? this.quantity,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }
}
