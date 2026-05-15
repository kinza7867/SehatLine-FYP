import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, Platform, StatusBar, ImageBackground, SafeAreaView,
  Modal, Animated, Alert, ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const MedicineListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const categories = ['All', 'Antibiotics', 'Pain Relief', 'Blood Pressure', 'Diabetes', 'Heart Care', 'Stomach Care', 'Vitamins', 'Skin Care', 'Respiratory', 'Neurology'];

  const medicines = [
    // Antibiotics (10)
    { id: '1', name: 'Amoxicillin 500mg', price: 180, category: 'Antibiotics', stock: 'In Stock', expiry: '12/2025', prescription: true, rating: 4.5, sold: 1240, unit: 'capsule', manufacturer: 'GSK' },
    { id: '2', name: 'Azithromycin 250mg', price: 320, category: 'Antibiotics', stock: 'In Stock', expiry: '09/2025', prescription: true, rating: 4.7, sold: 980, unit: 'tablet', manufacturer: 'Pfizer' },
    { id: '3', name: 'Ciprofloxacin 500mg', price: 150, category: 'Antibiotics', stock: 'In Stock', expiry: '11/2025', prescription: true, rating: 4.3, sold: 2100, unit: 'tablet', manufacturer: 'Bayer' },
    { id: '4', name: 'Doxycycline 100mg', price: 250, category: 'Antibiotics', stock: 'In Stock', expiry: '10/2025', prescription: true, rating: 4.4, sold: 870, unit: 'capsule', manufacturer: 'Roche' },
    { id: '5', name: 'Clarithromycin 500mg', price: 380, category: 'Antibiotics', stock: 'Low Stock', expiry: '08/2025', prescription: true, rating: 4.6, sold: 540, unit: 'tablet', manufacturer: 'Abbott' },
    { id: '6', name: 'Cefixime 200mg', price: 220, category: 'Antibiotics', stock: 'In Stock', expiry: '01/2026', prescription: true, rating: 4.5, sold: 760, unit: 'tablet', manufacturer: 'Sanofi' },
    { id: '7', name: 'Metronidazole 400mg', price: 120, category: 'Antibiotics', stock: 'In Stock', expiry: '06/2025', prescription: true, rating: 4.2, sold: 1890, unit: 'tablet', manufacturer: 'Novartis' },
    { id: '8', name: 'Levofloxacin 500mg', price: 280, category: 'Antibiotics', stock: 'In Stock', expiry: '03/2026', prescription: true, rating: 4.4, sold: 670, unit: 'tablet', manufacturer: 'Merck' },
    { id: '9', name: 'Clindamycin 300mg', price: 350, category: 'Antibiotics', stock: 'Low Stock', expiry: '07/2025', prescription: true, rating: 4.3, sold: 430, unit: 'capsule', manufacturer: 'Lilly' },
    { id: '10', name: 'Augmentin 625mg', price: 420, category: 'Antibiotics', stock: 'In Stock', expiry: '02/2026', prescription: true, rating: 4.8, sold: 1560, unit: 'tablet', manufacturer: 'GSK' },

    // Pain Relief (10)
    { id: '11', name: 'Panadol Extra', price: 85, category: 'Pain Relief', stock: 'In Stock', expiry: '08/2025', prescription: false, rating: 4.8, sold: 3420, unit: 'tablet', manufacturer: 'GSK' },
    { id: '12', name: 'Brufen 400mg', price: 120, category: 'Pain Relief', stock: 'Low Stock', expiry: '11/2025', prescription: false, rating: 4.2, sold: 2450, unit: 'tablet', manufacturer: 'Abbott' },
    { id: '13', name: 'Aspirin 75mg', price: 60, category: 'Pain Relief', stock: 'In Stock', expiry: '12/2025', prescription: false, rating: 4.5, sold: 3100, unit: 'tablet', manufacturer: 'Bayer' },
    { id: '14', name: 'Voltaren 50mg', price: 180, category: 'Pain Relief', stock: 'In Stock', expiry: '09/2025', prescription: true, rating: 4.4, sold: 1670, unit: 'tablet', manufacturer: 'Novartis' },
    { id: '15', name: 'Celebrex 200mg', price: 320, category: 'Pain Relief', stock: 'In Stock', expiry: '10/2025', prescription: true, rating: 4.6, sold: 890, unit: 'capsule', manufacturer: 'Pfizer' },
    { id: '16', name: 'Naprosyn 250mg', price: 200, category: 'Pain Relief', stock: 'In Stock', expiry: '06/2025', prescription: true, rating: 4.3, sold: 720, unit: 'tablet', manufacturer: 'Roche' },
    { id: '17', name: 'Diclofenac Sodium 50mg', price: 90, category: 'Pain Relief', stock: 'In Stock', expiry: '04/2026', prescription: false, rating: 4.1, sold: 2890, unit: 'tablet', manufacturer: 'Sanofi' },
    { id: '18', name: 'Mefenamic Acid 250mg', price: 110, category: 'Pain Relief', stock: 'In Stock', expiry: '07/2025', prescription: true, rating: 4.2, sold: 1340, unit: 'capsule', manufacturer: 'Merck' },
    { id: '19', name: 'Tramadol 50mg', price: 280, category: 'Pain Relief', stock: 'Low Stock', expiry: '02/2026', prescription: true, rating: 4.0, sold: 450, unit: 'capsule', manufacturer: 'Lilly' },
    { id: '20', name: 'Paracetamol 500mg', price: 50, category: 'Pain Relief', stock: 'In Stock', expiry: '12/2025', prescription: false, rating: 4.7, sold: 8900, unit: 'tablet', manufacturer: 'GSK' },

    // Blood Pressure (8)
    { id: '21', name: 'Losartan 50mg', price: 220, category: 'Blood Pressure', stock: 'Low Stock', expiry: '03/2026', prescription: true, rating: 4.3, sold: 890, unit: 'tablet', manufacturer: 'Merck' },
    { id: '22', name: 'Amlodipine 5mg', price: 190, category: 'Blood Pressure', stock: 'In Stock', expiry: '01/2026', prescription: true, rating: 4.5, sold: 760, unit: 'tablet', manufacturer: 'Pfizer' },
    { id: '23', name: 'Enalapril 5mg', price: 210, category: 'Blood Pressure', stock: 'In Stock', expiry: '08/2025', prescription: true, rating: 4.4, sold: 540, unit: 'tablet', manufacturer: 'Novartis' },
    { id: '24', name: 'Lisinopril 10mg', price: 240, category: 'Blood Pressure', stock: 'In Stock', expiry: '11/2025', prescription: true, rating: 4.6, sold: 670, unit: 'tablet', manufacturer: 'AstraZeneca' },
    { id: '25', name: 'Metoprolol 50mg', price: 260, category: 'Blood Pressure', stock: 'In Stock', expiry: '05/2025', prescription: true, rating: 4.5, sold: 820, unit: 'tablet', manufacturer: 'Roche' },
    { id: '26', name: 'Carvedilol 6.25mg', price: 290, category: 'Blood Pressure', stock: 'In Stock', expiry: '09/2025', prescription: true, rating: 4.3, sold: 430, unit: 'tablet', manufacturer: 'GSK' },
    { id: '27', name: 'Nifedipine 30mg', price: 310, category: 'Blood Pressure', stock: 'Low Stock', expiry: '02/2026', prescription: true, rating: 4.2, sold: 380, unit: 'tablet', manufacturer: 'Bayer' },
    { id: '28', name: 'Valsartan 80mg', price: 340, category: 'Blood Pressure', stock: 'In Stock', expiry: '07/2025', prescription: true, rating: 4.4, sold: 520, unit: 'tablet', manufacturer: 'Novartis' },

    // Diabetes (8)
    { id: '29', name: 'Metformin 500mg', price: 95, category: 'Diabetes', stock: 'In Stock', expiry: '10/2025', prescription: true, rating: 4.6, sold: 2100, unit: 'tablet', manufacturer: 'Merck' },
    { id: '30', name: 'Gliclazide 80mg', price: 210, category: 'Diabetes', stock: 'In Stock', expiry: '07/2025', prescription: true, rating: 4.4, sold: 540, unit: 'tablet', manufacturer: 'Servier' },
    { id: '31', name: 'Glimepiride 2mg', price: 180, category: 'Diabetes', stock: 'In Stock', expiry: '12/2025', prescription: true, rating: 4.3, sold: 890, unit: 'tablet', manufacturer: 'Sanofi' },
    { id: '32', name: 'Januvia 100mg', price: 650, category: 'Diabetes', stock: 'Low Stock', expiry: '04/2026', prescription: true, rating: 4.8, sold: 320, unit: 'tablet', manufacturer: 'Merck' },
    { id: '33', name: 'Jardiance 10mg', price: 720, category: 'Diabetes', stock: 'In Stock', expiry: '06/2025', prescription: true, rating: 4.9, sold: 280, unit: 'tablet', manufacturer: 'Boehringer' },
    { id: '34', name: 'Insulin Glargine', price: 1850, category: 'Diabetes', stock: 'In Stock', expiry: '09/2025', prescription: true, rating: 4.9, sold: 150, unit: 'vial', manufacturer: 'Sanofi' },
    { id: '35', name: 'Pioglitazone 15mg', price: 250, category: 'Diabetes', stock: 'In Stock', expiry: '03/2025', prescription: true, rating: 4.2, sold: 430, unit: 'tablet', manufacturer: 'Lilly' },
    { id: '36', name: 'Sitagliptin 100mg', price: 580, category: 'Diabetes', stock: 'In Stock', expiry: '11/2025', prescription: true, rating: 4.5, sold: 390, unit: 'tablet', manufacturer: 'MSD' },

    // Heart Care (6)
    { id: '37', name: 'Atorvastatin 20mg', price: 280, category: 'Heart Care', stock: 'In Stock', expiry: '10/2025', prescription: true, rating: 4.6, sold: 1250, unit: 'tablet', manufacturer: 'Pfizer' },
    { id: '38', name: 'Rosuvastatin 10mg', price: 350, category: 'Heart Care', stock: 'In Stock', expiry: '12/2025', prescription: true, rating: 4.7, sold: 980, unit: 'tablet', manufacturer: 'AstraZeneca' },
    { id: '39', name: 'Clopidogrel 75mg', price: 290, category: 'Heart Care', stock: 'In Stock', expiry: '08/2025', prescription: true, rating: 4.5, sold: 760, unit: 'tablet', manufacturer: 'Sanofi' },
    { id: '40', name: 'Aspirin 75mg', price: 60, category: 'Heart Care', stock: 'In Stock', expiry: '05/2025', prescription: false, rating: 4.8, sold: 5600, unit: 'tablet', manufacturer: 'Bayer' },
    { id: '41', name: 'Isosorbide 10mg', price: 150, category: 'Heart Care', stock: 'Low Stock', expiry: '02/2026', prescription: true, rating: 4.3, sold: 340, unit: 'tablet', manufacturer: 'Novartis' },
    { id: '42', name: 'Digoxin 0.25mg', price: 220, category: 'Heart Care', stock: 'In Stock', expiry: '07/2025', prescription: true, rating: 4.4, sold: 290, unit: 'tablet', manufacturer: 'Roche' },

    // Stomach Care (6)
    { id: '43', name: 'Omeprazole 20mg', price: 150, category: 'Stomach Care', stock: 'In Stock', expiry: '06/2025', prescription: false, rating: 4.4, sold: 1670, unit: 'capsule', manufacturer: 'AstraZeneca' },
    { id: '44', name: 'Esomeprazole 40mg', price: 250, category: 'Stomach Care', stock: 'In Stock', expiry: '09/2025', prescription: true, rating: 4.5, sold: 890, unit: 'tablet', manufacturer: 'AstraZeneca' },
    { id: '45', name: 'Domperidone 10mg', price: 80, category: 'Stomach Care', stock: 'In Stock', expiry: '04/2026', prescription: false, rating: 4.1, sold: 1890, unit: 'tablet', manufacturer: 'J&J' },
    { id: '46', name: 'Mebeverine 135mg', price: 200, category: 'Stomach Care', stock: 'In Stock', expiry: '11/2025', prescription: true, rating: 4.3, sold: 540, unit: 'tablet', manufacturer: 'Abbott' },
    { id: '47', name: 'Ranitidine 150mg', price: 100, category: 'Stomach Care', stock: 'Low Stock', expiry: '01/2026', prescription: false, rating: 4.0, sold: 2340, unit: 'tablet', manufacturer: 'GSK' },
    { id: '48', name: 'Ursodeoxycholic Acid', price: 450, category: 'Stomach Care', stock: 'In Stock', expiry: '03/2025', prescription: true, rating: 4.5, sold: 230, unit: 'tablet', manufacturer: 'Dr.Reddy' },

    // Vitamins & Supplements (6)
    { id: '49', name: 'Centrum Silver', price: 850, category: 'Vitamins', stock: 'In Stock', expiry: '12/2026', prescription: false, rating: 4.9, sold: 3420, unit: 'bottle', manufacturer: 'Pfizer' },
    { id: '50', name: 'Vitamin D3 5000 IU', price: 450, category: 'Vitamins', stock: 'In Stock', expiry: '08/2026', prescription: false, rating: 4.7, sold: 2670, unit: 'bottle', manufacturer: 'Nature Made' },
    { id: '51', name: 'Vitamin B Complex', price: 280, category: 'Vitamins', stock: 'In Stock', expiry: '10/2025', prescription: false, rating: 4.6, sold: 3450, unit: 'bottle', manufacturer: 'Abbott' },
    { id: '52', name: 'Vitamin C 1000mg', price: 320, category: 'Vitamins', stock: 'In Stock', expiry: '06/2026', prescription: false, rating: 4.8, sold: 4890, unit: 'bottle', manufacturer: 'Nature Made' },
    { id: '53', name: 'Calcium+D3', price: 380, category: 'Vitamins', stock: 'In Stock', expiry: '09/2025', prescription: false, rating: 4.5, sold: 2310, unit: 'bottle', manufacturer: 'Novartis' },
    { id: '54', name: 'Fish Oil Omega-3', price: 550, category: 'Vitamins', stock: 'In Stock', expiry: '05/2026', prescription: false, rating: 4.7, sold: 1980, unit: 'bottle', manufacturer: 'Seven Seas' },

    // Skin Care (5)
    { id: '55', name: 'Clotrimazole Cream', price: 180, category: 'Skin Care', stock: 'In Stock', expiry: '11/2025', prescription: false, rating: 4.4, sold: 1230, unit: 'tube', manufacturer: 'Bayer' },
    { id: '56', name: 'Hydrocortisone Cream', price: 220, category: 'Skin Care', stock: 'In Stock', expiry: '07/2025', prescription: false, rating: 4.3, sold: 890, unit: 'tube', manufacturer: 'Pfizer' },
    { id: '57', name: 'Betnovate Cream', price: 280, category: 'Skin Care', stock: 'Low Stock', expiry: '02/2026', prescription: true, rating: 4.5, sold: 540, unit: 'tube', manufacturer: 'GSK' },
    { id: '58', name: 'Tretinoin Cream', price: 350, category: 'Skin Care', stock: 'In Stock', expiry: '09/2025', prescription: true, rating: 4.6, sold: 430, unit: 'tube', manufacturer: 'J&J' },
    { id: '59', name: 'Azelaic Acid Gel', price: 420, category: 'Skin Care', stock: 'In Stock', expiry: '12/2025', prescription: true, rating: 4.4, sold: 320, unit: 'tube', manufacturer: 'Novartis' },

    // Respiratory (4)
    { id: '60', name: 'Ventolin Inhaler', price: 450, category: 'Respiratory', stock: 'In Stock', expiry: '10/2025', prescription: true, rating: 4.8, sold: 1890, unit: 'inhaler', manufacturer: 'GSK' },
    { id: '61', name: 'Montelukast 10mg', price: 280, category: 'Respiratory', stock: 'In Stock', expiry: '06/2025', prescription: true, rating: 4.5, sold: 980, unit: 'tablet', manufacturer: 'Merck' },
    { id: '62', name: 'Cetirizine 10mg', price: 90, category: 'Respiratory', stock: 'In Stock', expiry: '08/2025', prescription: false, rating: 4.6, sold: 3450, unit: 'tablet', manufacturer: 'UCB' },
    { id: '63', name: 'Budesonide Inhaler', price: 650, category: 'Respiratory', stock: 'In Stock', expiry: '03/2026', prescription: true, rating: 4.7, sold: 540, unit: 'inhaler', manufacturer: 'AstraZeneca' },

    // Neurology (3)
    { id: '64', name: 'Gabapentin 300mg', price: 380, category: 'Neurology', stock: 'In Stock', expiry: '11/2025', prescription: true, rating: 4.4, sold: 670, unit: 'capsule', manufacturer: 'Pfizer' },
    { id: '65', name: 'Pregabalin 75mg', price: 450, category: 'Neurology', stock: 'Low Stock', expiry: '01/2026', prescription: true, rating: 4.5, sold: 540, unit: 'capsule', manufacturer: 'Lilly' },
    { id: '66', name: 'Carbamazepine 200mg', price: 320, category: 'Neurology', stock: 'In Stock', expiry: '09/2025', prescription: true, rating: 4.3, sold: 430, unit: 'tablet', manufacturer: 'Novartis' },
  ];

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(search.toLowerCase()) ||
                          med.category.toLowerCase().includes(search.toLowerCase()) ||
                          med.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine, qty = 1) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: qty }]);
    }
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
    
    Alert.alert('Added to Cart', `${medicine.name} added to your cart`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    setShowCartModal(false);
    navigation.navigate('CheckoutScreen', { cart, total: getCartTotal() });
  };

  const openMedicineModal = (medicine) => {
    setSelectedMedicine(medicine);
    setQuantity(1);
  };

  const getStockColor = (stock) => {
    return stock === 'In Stock' ? '#10B981' : '#F59E0B';
  };

  const getStockBg = (stock) => {
    return stock === 'In Stock' ? '#D1FAE5' : '#FEF3C7';
  };

  const CategoryFilter = () => (
    <View style={styles.filterWrapper}>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
      style={styles.filterContainer}
    >
      {categories.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
          onPress={() => setSelectedCategory(cat)}
        >
          <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    </View>
  );

  const renderMedicineCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.medicineCard}
      activeOpacity={0.9}
      onPress={() => openMedicineModal(item)}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.cardGradient}
      >
        <View style={styles.medicineIcon}>
          <LinearGradient
            colors={['#04e1f5', '#0284c7']}
            style={styles.iconGradient}
          >
            <Ionicons name="medkit" size={wp(7)} color="#fff" />
          </LinearGradient>
          {item.prescription && (
            <View style={styles.rxOverlay}>
              <Text style={styles.rxOverlayText}>Rx</Text>
            </View>
          )}
        </View>

        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.medicineCategory}>{item.category}</Text>
          <Text style={styles.manufacturer}>{item.manufacturer}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={wp(3.5)} color="#FBBF24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.soldText}>({item.sold} sold)</Text>
          </View>

          <View style={styles.stockRow}>
            <View style={[styles.stockBadge, { backgroundColor: getStockBg(item.stock) }]}>
              <Ionicons name={item.stock === 'In Stock' ? 'checkmark-circle' : 'alert-circle'} size={wp(3)} color={getStockColor(item.stock)} />
              <Text style={[styles.stockText, { color: getStockColor(item.stock) }]}>{item.stock}</Text>
            </View>
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.price}>₨ {item.price}</Text>
          <Text style={styles.unitPrice}>/{item.unit}</Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item, 1)}>
              <LinearGradient
                colors={['#04e1f5', '#0284c7']}
                style={styles.addGradient}
              >
                <Ionicons name="add" size={wp(5)} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const CartModal = () => (
    <Modal visible={showCartModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#001D3D', '#000814']} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Cart ({getCartItemCount()} items)</Text>
            <TouchableOpacity onPress={() => setShowCartModal(false)}>
              <Ionicons name="close" size={wp(7)} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={wp(20)} color="#4B5563" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <TouchableOpacity 
                style={styles.continueBtn}
                onPress={() => setShowCartModal(false)}
              >
                <Text style={styles.continueBtnText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.cartList}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>₨ {item.price} x {item.quantity}</Text>
                    </View>
                    <View style={styles.cartItemActions}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity 
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={wp(4)} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={wp(4)} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cartItemTotal}>₨ {item.price * item.quantity}</Text>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                        <Ionicons name="trash-outline" size={wp(5.5)} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
              
              <View style={styles.cartFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>₨ {getCartTotal()}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutBtn} onPress={proceedToCheckout}>
                  <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.checkoutGradient}>
                    <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={wp(4.5)} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const MedicineDetailModal = () => (
    <Modal visible={!!selectedMedicine} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContainer}>
          <LinearGradient colors={['#001D3D', '#000814']} style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>Medicine Details</Text>
            <TouchableOpacity onPress={() => setSelectedMedicine(null)}>
              <Ionicons name="close" size={wp(7)} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {selectedMedicine && (
            <ScrollView style={styles.detailContent}>
              <View style={styles.detailIconSection}>
                <LinearGradient
                  colors={['#04e1f5', '#0284c7']}
                  style={styles.detailIcon}
                >
                  <Ionicons name="medkit" size={wp(12)} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.detailName}>{selectedMedicine.name}</Text>
              <Text style={styles.detailCategory}>{selectedMedicine.category}</Text>
              <Text style={styles.detailManufacturer}>by {selectedMedicine.manufacturer}</Text>

              <View style={styles.detailStats}>
                <View style={styles.detailStat}>
                  <Ionicons name="star" size={wp(4.5)} color="#FBBF24" />
                  <Text style={styles.detailStatValue}>{selectedMedicine.rating}</Text>
                  <Text style={styles.detailStatLabel}>Rating</Text>
                </View>
                <View style={styles.detailStat}>
                  <Ionicons name="people" size={wp(4.5)} color="#04e1f5" />
                  <Text style={styles.detailStatValue}>{selectedMedicine.sold}</Text>
                  <Text style={styles.detailStatLabel}>Sold</Text>
                </View>
                <View style={styles.detailStat}>
                  <Ionicons name="calendar" size={wp(4.5)} color="#F59E0B" />
                  <Text style={styles.detailStatValue}>{selectedMedicine.expiry}</Text>
                  <Text style={styles.detailStatLabel}>Expiry</Text>
                </View>
              </View>

              <View style={styles.detailInfo}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>₨ {selectedMedicine.price} / {selectedMedicine.unit}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Stock:</Text>
                  <View style={[styles.stockBadgeLarge, { backgroundColor: getStockBg(selectedMedicine.stock) }]}>
                    <Text style={[styles.stockTextLarge, { color: getStockColor(selectedMedicine.stock) }]}>{selectedMedicine.stock}</Text>
                  </View>
                </View>
                {selectedMedicine.prescription && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Prescription:</Text>
                    <View style={styles.rxRequiredBadge}>
                      <Ionicons name="document-text" size={wp(3.5)} color="#EF4444" />
                      <Text style={styles.rxRequiredText}>Rx Required</Text>
                    </View>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Form:</Text>
                  <Text style={styles.detailValue}>{selectedMedicine.unit}</Text>
                </View>
              </View>

              <View style={styles.quantitySelector}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <View style={styles.quantityControlsLarge}>
                  <TouchableOpacity 
                    style={styles.qtyBtnLarge}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Ionicons name="remove" size={wp(4.5)} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.qtyTextLarge}>{quantity}</Text>
                  <TouchableOpacity 
                    style={styles.qtyBtnLarge}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <Ionicons name="add" size={wp(4.5)} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.addToCartBtn}
                onPress={() => {
                  addToCart(selectedMedicine, quantity);
                  setSelectedMedicine(null);
                }}
              >
                <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.addToCartGradient}>
                  <Ionicons name="cart" size={wp(5)} color="#fff" />
                  <Text style={styles.addToCartBtnText}>Add to Cart (₨ {selectedMedicine.price * quantity})</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <LinearGradient
              colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
              style={styles.headerGradient}
            >
              <View style={styles.topHeader}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pharmacy</Text>
                <TouchableOpacity style={styles.cartIconBtn} onPress={() => setShowCartModal(true)}>
                  <Ionicons name="cart" size={wp(5.5)} color="#04e1f5" />
                  {getCartItemCount() > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.welcomeBanner}>
                <Text style={styles.welcomeTitle}>💊 Online Medicine Delivery</Text>
                <Text style={styles.welcomeSub}>Free delivery on orders above ₨ 1000</Text>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={wp(5)} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search medicines..."
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            </LinearGradient>

            <CategoryFilter />

            <FlatList
              data={filteredMedicines}
              keyExtractor={item => item.id}
              renderItem={renderMedicineCard}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContainer}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="medical-outline" size={wp(15)} color="#4B5563" />
                  <Text style={styles.emptyTitle}>No Medicines Found</Text>
                  <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
                </View>
              }
            />

            {getCartItemCount() > 0 && (
              <TouchableOpacity style={styles.floatingCart} onPress={() => setShowCartModal(true)}>
                <LinearGradient
                  colors={['#04e1f5', '#0284c7']}
                  style={styles.floatingCartGradient}
                >
                  <Ionicons name="cart" size={wp(6)} color="#fff" />
                  <Text style={styles.floatingCartText}>{getCartItemCount()} items (₨ {getCartTotal()})</Text>
                  <Ionicons name="arrow-forward" size={wp(5)} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </View>
      </ImageBackground>

      <CartModal />
      <MedicineDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(6, 13, 80, 0.21)' },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(2),
    borderBottomLeftRadius: wp(6),
    borderBottomRightRadius: wp(6),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  iconBtn: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3.5),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  cartIconBtn: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3.5),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -wp(1.5),
    right: -wp(1.5),
    backgroundColor: '#EF4444',
    borderRadius: wp(3.5),
    minWidth: wp(5.5),
    height: wp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1.2),
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: wp(3),
    fontWeight: 'bold',
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: wp(5.5), 
    fontWeight: 'bold',
  },

  welcomeBanner: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    marginBottom: hp(1.5),
    padding: wp(3.5),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    borderRadius: wp(4),
    borderLeftWidth: 3,
    borderLeftColor: '#04e1f5',
  },
  welcomeTitle: {
    color: '#04e1f5',
    fontSize: wp(4.2),
    fontWeight: 'bold',
  },
  welcomeSub: {
    color: '#94A3B8',
    fontSize: wp(3.2),
    marginTop: hp(0.5),
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginHorizontal: wp(5),
    marginTop: hp(1.5),
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(0.3),
    borderRadius: wp(8),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
    gap: wp(3),
  },
  searchInput: { 
    flex: 1, 
    color: '#fff', 
    fontSize: wp(3.8), 
    paddingVertical: hp(1.5),
  },

  filterContainer: {
    maxHeight: hp(8),
    marginVertical: hp(1.5),
  },
  filterScroll: {
    paddingHorizontal: wp(4),
    gap: wp(3),
  },
  filterChip: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderRadius: wp(6),
    backgroundColor: 'rgba(10, 10, 10, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  filterChipActive: {
    backgroundColor: '#04e1f5',
    borderColor: '#04e1f5',
  },
  filterText: {
    color: '#04e1f5',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },

  gridContainer: {
    paddingVertical: hp(2),
    paddingBottom: hp(12),
  },

  medicineCard: {
    width: (wp(100) - wp(10)) / 2,
    marginBottom: hp(2),
    marginHorizontal: wp(1.5),
    borderRadius: wp(5),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  cardGradient: {
    padding: wp(3.5),
    gap: hp(1),
  },

  medicineIcon: {
    alignItems: 'center',
    marginBottom: hp(0.8),
    position: 'relative',
  },
  iconGradient: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rxOverlay: {
    position: 'absolute',
    top: -wp(1),
    right: wp(2),
    backgroundColor: '#EF4444',
    paddingHorizontal: wp(2),
    paddingVertical: wp(0.8),
    borderRadius: wp(3),
  },
  rxOverlayText: {
    color: '#fff',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },

  medicineInfo: {
    gap: hp(0.5),
  },
  medicineName: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: wp(5),
  },
  medicineCategory: {
    fontSize: wp(3),
    color: '#64748B',
  },
  manufacturer: {
    fontSize: wp(2.5),
    color: '#94A3B8',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  ratingText: {
    fontSize: wp(3),
    color: '#1E293B',
    fontWeight: '600',
  },
  soldText: {
    fontSize: wp(2.5),
    color: '#94A3B8',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: wp(2.5),
    gap: wp(0.8),
  },
  stockText: {
    fontSize: wp(2.5),
    fontWeight: '600',
  },

  priceSection: {
    alignItems: 'center',
    marginTop: hp(1),
  },
  price: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#04e1f5',
  },
  unitPrice: {
    fontSize: wp(2.3),
    color: '#94A3B8',
    marginBottom: hp(0.8),
  },
  addButton: {
    marginTop: hp(0.5),
  },
  addGradient: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(15),
  },
  emptyTitle: {
    color: '#9CA3AF',
    fontSize: wp(4.5),
    fontWeight: 'bold',
    marginTop: hp(2),
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: wp(3.5),
    marginTop: hp(1),
  },

  floatingCart: {
    position: 'absolute',
    bottom: hp(2),
    left: wp(5),
    right: wp(5),
    borderRadius: wp(7),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.8),
  },
  floatingCartText: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#0A1520',
    borderRadius: wp(6),
    width: wp(92),
    maxHeight: hp(85),
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4, 225, 245, 0.2)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: hp(8),
  },
  emptyCartText: {
    color: '#94A3B8',
    fontSize: wp(4),
    marginTop: hp(2),
  },
  continueBtn: {
    marginTop: hp(2.5),
    padding: wp(3.5),
    backgroundColor: 'rgba(4, 225, 245, 0.2)',
    borderRadius: wp(4),
  },
  continueBtnText: {
    color: '#04e1f5',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  cartList: {
    padding: wp(4),
  },
  cartItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  cartItemInfo: {
    marginBottom: hp(1.2),
  },
  cartItemName: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  cartItemPrice: {
    color: '#94A3B8',
    fontSize: wp(3.2),
    marginTop: hp(0.5),
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
  },
  qtyBtn: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2.5),
    backgroundColor: '#04e1f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
    width: wp(7),
    textAlign: 'center',
  },
  cartItemTotal: {
    color: '#04e1f5',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  cartFooter: {
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 225, 245, 0.2)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  totalLabel: {
    color: '#94A3B8',
    fontSize: wp(4),
  },
  totalAmount: {
    color: '#04e1f5',
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  checkoutBtn: {
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(3.5),
    gap: wp(2.5),
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },

  detailModalContainer: {
    backgroundColor: '#0A1520',
    borderRadius: wp(6),
    width: wp(92),
    maxHeight: hp(85),
    overflow: 'hidden',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4, 225, 245, 0.2)',
  },
  detailModalTitle: {
    color: '#fff',
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  detailContent: {
    padding: wp(5),
  },
  detailIconSection: {
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  detailIcon: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailName: {
    color: '#fff',
    fontSize: wp(5.5),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailCategory: {
    color: '#94A3B8',
    fontSize: wp(3.5),
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  detailManufacturer: {
    color: '#6B7280',
    fontSize: wp(3),
    textAlign: 'center',
    marginTop: hp(0.3),
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: hp(2.5),
    padding: wp(4),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: wp(4),
  },
  detailStat: {
    alignItems: 'center',
    gap: hp(0.5),
  },
  detailStatValue: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  detailStatLabel: {
    color: '#94A3B8',
    fontSize: wp(2.8),
  },
  detailInfo: {
    gap: hp(1.5),
    marginBottom: hp(2.5),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: wp(3.5),
    width: wp(28),
  },
  detailValue: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: '500',
  },
  stockBadgeLarge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
  },
  stockTextLarge: {
    fontSize: wp(3),
    fontWeight: '600',
  },
  rxRequiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
  },
  rxRequiredText: {
    color: '#EF4444',
    fontSize: wp(3),
    fontWeight: '600',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(2.5),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 225, 245, 0.2)',
  },
  quantityLabel: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: '600',
  },
  quantityControlsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  qtyBtnLarge: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3.5),
    backgroundColor: '#04e1f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyTextLarge: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
    width: wp(10),
    textAlign: 'center',
  },
  addToCartBtn: {
    borderRadius: wp(4),
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(4),
    gap: wp(2.5),
  },
  addToCartBtnText: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
});

export default MedicineListScreen;