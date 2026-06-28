// import { Ionicons } from "@expo/vector-icons";
// import * as Haptics from "expo-haptics";
// import { router } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Alert,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useAuth } from "@/context/AuthContext";
// import { useCart } from "@/context/CartContext";
// import { api, ApiError } from "@/lib/api";
// import { useColors } from "@/hooks/useColors";

// // For Razorpay - we'll use a simplified approach
// // In production, you'd use react-native-razorpay or a web view

// const PAYMENT_METHODS = [
//   { id: "upi", label: "UPI", icon: "phone-portrait-outline" as const },
//   { id: "card", label: "Credit / Debit Card", icon: "card-outline" as const },
//   { id: "cod", label: "Cash on Delivery", icon: "cash-outline" as const },
// ];

// export default function CheckoutScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { user, addAddress } = useAuth();
//   const { items, restaurantId, restaurantName, subtotal, clearCart } = useCart();

//   const [addresses, setAddresses] = useState<{ id: string; type: string; address: string }[]>([]);
//   const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
//   const [selectedPayment, setSelectedPayment] = useState("upi");
//   const [placing, setPlacing] = useState(false);
//   const [orderError, setOrderError] = useState<string | null>(null);
//   const [showAddAddr, setShowAddAddr] = useState(false);
//   const [newAddrType, setNewAddrType] = useState("Home");
//   const [newAddrText, setNewAddrText] = useState("");
//   const [savingAddr, setSavingAddr] = useState(false);
//   const [addrError, setAddrError] = useState<string | null>(null);
//   const [paymentProcessing, setPaymentProcessing] = useState(false);

//   const topPad = Platform.OS === "web" ? 67 : insets.top;
//   const deliveryFee = subtotal > 499 ? 0 : 29;
//   const tax = Math.round(subtotal * 0.05);
//   const total = subtotal + deliveryFee + tax;

//   useEffect(() => {
//     const userAddresses = user?.addresses ?? [];
//     const defaults = [
//       { id: "a1", type: "Home", address: "12, 3rd Cross, Koramangala 5th Block, Bangalore - 560034" },
//       { id: "a2", type: "Work", address: "WeWork Embassy Tech Village, Outer Ring Road, Bangalore - 560103" },
//     ];
//     const mapped = userAddresses.map((a) => ({ id: a._id ?? a.type, type: a.type, address: a.address }));
//     setAddresses(mapped.length > 0 ? mapped : defaults);
//   }, [user]);

//   const handleSaveAddress = async () => {
//     if (!newAddrText.trim()) { setAddrError("Please enter an address."); return; }
//     setSavingAddr(true);
//     setAddrError(null);
//     try {
//       await addAddress(newAddrType, newAddrText.trim());
//       setAddresses((prev) => [...prev, { id: Date.now().toString(), type: newAddrType, address: newAddrText.trim() }]);
//       setSelectedAddressIdx(addresses.length);
//       setShowAddAddr(false);
//       setNewAddrText("");
//     } catch (e: any) {
//       setAddrError(e?.message ?? "Failed to save address.");
//     } finally {
//       setSavingAddr(false);
//     }
//   };

//   // Simulate Razorpay payment for web
//   const processPayment = async (orderData: any): Promise<boolean> => {
//     return new Promise((resolve, reject) => {
//       // For web, we'll use a simulated payment flow
//       if (Platform.OS === "web") {
//         // Simulate Razorpay popup
//         const confirmed = window.confirm(
//           `Payment of ₹${total}\n\n` +
//           `Order Details:\n` +
//           `Restaurant: ${restaurantName}\n` +
//           `Items: ${items.map(i => `${i.quantity}× ${i.name}`).join(', ')}\n\n` +
//           `Click OK to complete payment (simulated)`
//         );
//         if (confirmed) {
//           // Generate fake payment details
//           resolve({
//             success: true,
//             razorpayPaymentId: `pay_${Date.now()}`,
//             razorpayOrderId: orderData.razorpayOrderId,
//             razorpaySignature: `sig_${Date.now()}`,
//           });
//         } else {
//           reject(new Error("Payment cancelled by user"));
//         }
//       } else {
//         // For mobile, show alert with simulated payment
//         Alert.alert(
//           "Payment",
//           `Pay ₹${total} for your order?`,
//           [
//             {
//               text: "Cancel",
//               style: "cancel",
//               onPress: () => reject(new Error("Payment cancelled by user")),
//             },
//             {
//               text: "Pay Now",
//               onPress: () => {
//                 resolve({
//                   success: true,
//                   razorpayPaymentId: `pay_${Date.now()}`,
//                   razorpayOrderId: orderData.razorpayOrderId,
//                   razorpaySignature: `sig_${Date.now()}`,
//                 });
//               },
//             },
//           ]
//         );
//       }
//     });
//   };

//   const finishOrder = (orderId: string) => {
//     clearCart();
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     router.replace(`/order-tracking/${orderId}`);
//   };

//   const handlePlaceOrder = async () => {
//     if (!restaurantId || !restaurantName) {
//       setOrderError("Restaurant information is missing. Please go back and try again.");
//       return;
//     }
    
//     if (items.length === 0) {
//       setOrderError("Your cart is empty. Please add items before placing an order.");
//       return;
//     }

//     setOrderError(null);
//     setPlacing(true);
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

//     try {
//       const deliveryAddress = addresses[selectedAddressIdx]?.address ?? "Default Address";
      
//       const orderData = {
//         restaurantId,
//         restaurantName,
//         items: items.map((c) => ({
//           itemId: c.id,
//           name: c.name,
//           qty: c.quantity,
//           price: c.price,
//           isVeg: c.isVeg,
//         })),
//         subtotal,
//         deliveryFee,
//         tax,
//         total,
//         deliveryAddress,
//         paymentMethod: selectedPayment,
//       };

//       if (selectedPayment === "cod") {
//         // For COD, create order directly
//         const response = await api.orders.createCod(orderData);
//         if (response.success && response.order) {
//           finishOrder(response.order._id);
//         } else {
//           setOrderError("Failed to place order. Please try again.");
//           setPlacing(false);
//         }
//       } else {
//         // For online payments - Step 1: Create payment order
//         const paymentResponse = await api.orders.createPaymentOrder(orderData);
        
//         if (!paymentResponse.razorpayOrderId) {
//           setOrderError("Failed to initialize payment. Please try again.");
//           setPlacing(false);
//           return;
//         }

//         // Step 2: Process payment
//         setPaymentProcessing(true);
//         try {
//           const paymentResult = await processPayment({
//             razorpayOrderId: paymentResponse.razorpayOrderId,
//             amount: paymentResponse.amount,
//           });

//           // Step 3: Verify payment and create order
//           const verifyResponse = await api.orders.verifyAndCreateOrder({
//             razorpayOrderId: paymentResponse.razorpayOrderId,
//             razorpayPaymentId: paymentResult.razorpayPaymentId,
//             razorpaySignature: paymentResult.razorpaySignature,
//             orderData: orderData,
//           });

//           if (verifyResponse.success && verifyResponse.order) {
//             finishOrder(verifyResponse.order._id);
//           } else {
//             setOrderError("Payment verification failed. Please try again.");
//             setPlacing(false);
//           }
//         } catch (paymentError: any) {
//           setOrderError(paymentError?.message || "Payment failed. Please try again.");
//           setPlacing(false);
//         } finally {
//           setPaymentProcessing(false);
//         }
//       }
//     } catch (err: any) {
//       setOrderError(err?.message ?? "Failed to place order. Please try again.");
//       setPlacing(false);
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={24} color={colors.foreground} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: colors.foreground }]}>Checkout</Text>
//         <View style={{ width: 44 }} />
//       </View>

//       <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 120 }]}>

//         {/* Delivery Address */}
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
//           {addresses.map((addr, idx) => (
//             <TouchableOpacity
//               key={addr.id}
//               style={[styles.addressRow, {
//                 borderColor: selectedAddressIdx === idx ? colors.primary : colors.border,
//                 backgroundColor: selectedAddressIdx === idx ? colors.secondary : colors.background,
//               }]}
//               onPress={() => setSelectedAddressIdx(idx)}
//               activeOpacity={0.75}
//             >
//               <View style={[styles.addrIcon, { backgroundColor: selectedAddressIdx === idx ? colors.primary : colors.muted }]}>
//                 <Ionicons
//                   name={addr.type === "Home" ? "home" : addr.type === "Work" ? "briefcase" : "location"}
//                   size={16}
//                   color={selectedAddressIdx === idx ? "#fff" : colors.mutedForeground}
//                 />
//               </View>
//               <View style={styles.addrInfo}>
//                 <Text style={[styles.addrType, { color: colors.foreground }]}>{addr.type}</Text>
//                 <Text style={[styles.addrText, { color: colors.mutedForeground }]} numberOfLines={2}>{addr.address}</Text>
//               </View>
//               {selectedAddressIdx === idx && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
//             </TouchableOpacity>
//           ))}

//           {showAddAddr ? (
//             <View style={[styles.addAddrForm, { backgroundColor: colors.muted, borderRadius: 12, padding: 12, gap: 8 }]}>
//               <View style={styles.addrTypeRow}>
//                 {["Home", "Work", "Other"].map((t) => (
//                   <TouchableOpacity
//                     key={t}
//                     style={[styles.typeChip, { backgroundColor: newAddrType === t ? colors.primary : colors.card, borderColor: colors.border }]}
//                     onPress={() => setNewAddrType(t)}
//                   >
//                     <Text style={{ color: newAddrType === t ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>{t}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <TextInput
//                 style={[styles.addrInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
//                 placeholder="Enter full address..."
//                 placeholderTextColor={colors.mutedForeground}
//                 value={newAddrText}
//                 onChangeText={(t) => { setNewAddrText(t); setAddrError(null); }}
//                 multiline
//               />
//               {addrError && <Text style={styles.inlineError}>{addrError}</Text>}
//               <View style={{ flexDirection: "row", gap: 8 }}>
//                 <TouchableOpacity style={[styles.saveAddrBtn, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleSaveAddress} disabled={savingAddr}>
//                   {savingAddr ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Save</Text>}
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.saveAddrBtn, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }]} onPress={() => { setShowAddAddr(false); setAddrError(null); setNewAddrText(""); }}>
//                   <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ) : (
//             <TouchableOpacity style={[styles.addAddrBtn, { borderColor: colors.border }]} onPress={() => setShowAddAddr(true)}>
//               <Ionicons name="add" size={18} color={colors.primary} />
//               <Text style={[styles.addAddrText, { color: colors.primary }]}>Add New Address</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Payment */}
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
//           {PAYMENT_METHODS.map((method) => (
//             <TouchableOpacity
//               key={method.id}
//               style={[styles.paymentRow, {
//                 borderColor: selectedPayment === method.id ? colors.primary : colors.border,
//                 backgroundColor: selectedPayment === method.id ? colors.secondary : colors.background,
//               }]}
//               onPress={() => setSelectedPayment(method.id)}
//               activeOpacity={0.75}
//             >
//               <View style={[styles.payIcon, { backgroundColor: selectedPayment === method.id ? colors.primary : colors.muted }]}>
//                 <Ionicons name={method.icon} size={18} color={selectedPayment === method.id ? "#fff" : colors.mutedForeground} />
//               </View>
//               <Text style={[styles.payLabel, { color: colors.foreground }]}>{method.label}</Text>
//               {method.id === "upi" && (
//                 <View style={[styles.popularTag, { backgroundColor: colors.secondary }]}>
//                   <Text style={{ color: colors.primary, fontSize: 10, fontFamily: "Inter_600SemiBold" }}>Popular</Text>
//                 </View>
//               )}
//               {method.id !== "cod" && selectedPayment === method.id && (
//                 <View style={[styles.razorpayBadge, { backgroundColor: colors.muted }]}>
//                   <Ionicons name="shield-checkmark" size={11} color={colors.mutedForeground} />
//                   <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_500Medium" }}>Razorpay</Text>
//                 </View>
//               )}
//               <View style={[styles.radio, { borderColor: selectedPayment === method.id ? colors.primary : colors.border }]}>
//                 {selectedPayment === method.id && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
//               </View>
//             </TouchableOpacity>
//           ))}
//           {selectedPayment !== "cod" && (
//             <View style={[styles.razorpayNote, { backgroundColor: colors.secondary }]}>
//               <Ionicons name="information-circle" size={14} color={colors.primary} />
//               <Text style={[styles.razorpayText, { color: colors.primary }]}>
//                 Payment will be processed securely. Order will be created only after successful payment.
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Order Summary */}
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Summary</Text>
//           {items.slice(0, 3).map((c) => (
//             <View key={c.id} style={styles.summaryRow}>
//               <Text style={[styles.summaryItem, { color: colors.mutedForeground }]} numberOfLines={1}>{c.quantity}× {c.name}</Text>
//               <Text style={[styles.summaryPrice, { color: colors.foreground }]}>₹{c.price * c.quantity}</Text>
//             </View>
//           ))}
//           {items.length > 3 && (
//             <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }}>+{items.length - 3} more items</Text>
//           )}
//           <View style={[styles.divider, { backgroundColor: colors.border }]} />
//           {[
//             { label: "Subtotal", value: `₹${subtotal}` },
//             { label: "Delivery", value: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}` },
//             { label: "GST (5%)", value: `₹${tax}` },
//           ].map((row) => (
//             <View key={row.label} style={styles.summaryRow}>
//               <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
//               <Text style={[styles.billValue, { color: row.value === "FREE" ? colors.success : colors.foreground }]}>{row.value}</Text>
//             </View>
//           ))}
//           <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
//             <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Payable</Text>
//             <Text style={[styles.totalValue, { color: colors.primary }]}>₹{total}</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Footer */}
//       <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 12, borderTopColor: colors.border }]}>
//         {orderError && (
//           <View style={styles.errorBanner}>
//             <Ionicons name="alert-circle" size={15} color="#ef4444" />
//             <Text style={styles.errorText}>{orderError}</Text>
//           </View>
//         )}
//         <TouchableOpacity
//           style={[styles.placeBtn, { backgroundColor: (placing || paymentProcessing) ? colors.muted : colors.primary }]}
//           onPress={handlePlaceOrder}
//           disabled={placing || paymentProcessing}
//           activeOpacity={0.85}
//         >
//           {(placing || paymentProcessing) ? (
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//               <ActivityIndicator color="#fff" />
//               <Text style={[styles.placeBtnText, { color: colors.primaryForeground }]}>
//                 {paymentProcessing ? 'Processing Payment...' : 'Placing Order...'}
//               </Text>
//             </View>
//           ) : (
//             <>
//               <Text style={[styles.placeBtnText, { color: colors.primaryForeground }]}>
//                 {selectedPayment === "cod" ? "Place Order" : "Pay & Place Order"}
//               </Text>
//               <Text style={[styles.placeBtnAmount, { color: "rgba(255,255,255,0.85)" }]}>₹{total}</Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
//   backBtn: { width: 44, height: 44, justifyContent: "center" },
//   headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
//   content: { padding: 16, gap: 12 },
//   section: { borderRadius: 16, padding: 16, gap: 10 },
//   sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
//   addressRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
//   addrIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
//   addrInfo: { flex: 1 },
//   addrType: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
//   addrText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
//   addAddrForm: {},
//   addrTypeRow: { flexDirection: "row", gap: 8 },
//   typeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
//   addrInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 60 },
//   inlineError: { color: "#ef4444", fontSize: 12, fontFamily: "Inter_500Medium" },
//   saveAddrBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: "center", justifyContent: "center" },
//   addAddrBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
//   addAddrText: { fontSize: 14, fontFamily: "Inter_500Medium" },
//   paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
//   payIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
//   payLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
//   popularTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
//   razorpayBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
//   radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" },
//   radioFill: { width: 10, height: 10, borderRadius: 5 },
//   razorpayNote: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 10 },
//   razorpayText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between" },
//   summaryItem: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", marginRight: 8 },
//   summaryPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
//   divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
//   billLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
//   billValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
//   totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
//   totalLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
//   totalValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
//   footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
//   errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
//   errorText: { flex: 1, color: "#ef4444", fontSize: 13, fontFamily: "Inter_500Medium" },
//   placeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14 },
//   placeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
//   placeBtnAmount: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
// });


// checkout.tsx - Complete Stripe version
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api, ApiError } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "card-outline" as const },
  { id: "upi", label: "UPI", icon: "phone-portrait-outline" as const },
  { id: "cod", label: "Cash on Delivery", icon: "cash-outline" as const },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addAddress } = useAuth();
  const { items, restaurantId, restaurantName, subtotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState<{ id: string; type: string; address: string }[]>([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddrType, setNewAddrType] = useState("Home");
  const [newAddrText, setNewAddrText] = useState("");
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const deliveryFee = subtotal > 499 ? 0 : 29;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    const userAddresses = user?.addresses ?? [];
    const defaults = [
      { id: "a1", type: "Home", address: "12, 3rd Cross, Koramangala 5th Block, Bangalore - 560034" },
      { id: "a2", type: "Work", address: "WeWork Embassy Tech Village, Outer Ring Road, Bangalore - 560103" },
    ];
    const mapped = userAddresses.map((a) => ({ id: a._id ?? a.type, type: a.type, address: a.address }));
    setAddresses(mapped.length > 0 ? mapped : defaults);
  }, [user]);

  const handleSaveAddress = async () => {
    if (!newAddrText.trim()) { setAddrError("Please enter an address."); return; }
    setSavingAddr(true);
    setAddrError(null);
    try {
      await addAddress(newAddrType, newAddrText.trim());
      setAddresses((prev) => [...prev, { id: Date.now().toString(), type: newAddrType, address: newAddrText.trim() }]);
      setSelectedAddressIdx(addresses.length);
      setShowAddAddr(false);
      setNewAddrText("");
    } catch (e: any) {
      setAddrError(e?.message ?? "Failed to save address.");
    } finally {
      setSavingAddr(false);
    }
  };

  // Simulate Stripe payment for testing
  const processStripePayment = async (clientSecret: string): Promise<{ success: boolean; paymentIntentId: string }> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === "web") {
        // For web, simulate Stripe payment popup
        const confirmed = window.confirm(
          `💳 Stripe Payment\n\n` +
          `Amount: ₹${total}\n` +
          `Restaurant: ${restaurantName}\n` +
          `Items: ${items.map(i => `${i.quantity}× ${i.name}`).join(', ')}\n\n` +
          `Click OK to complete test payment`
        );
        if (confirmed) {
          resolve({
            success: true,
            paymentIntentId: `pi_test_${Date.now()}`,
          });
        } else {
          reject(new Error("Payment cancelled by user"));
        }
      } else {
        // For mobile, show alert with simulated payment
        Alert.alert(
          "💳 Stripe Payment",
          `Pay ₹${total} for your order?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => reject(new Error("Payment cancelled by user")),
            },
            {
              text: "Pay Now",
              onPress: () => {
                resolve({
                  success: true,
                  paymentIntentId: `pi_test_${Date.now()}`,
                });
              },
            },
          ]
        );
      }
    });
  };

  const finishOrder = (orderId: string) => {
    clearCart();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(`/order-tracking/${orderId}`);
  };

  const handlePlaceOrder = async () => {
    if (!restaurantId || !restaurantName) {
      setOrderError("Restaurant information is missing. Please go back and try again.");
      return;
    }
    
    if (items.length === 0) {
      setOrderError("Your cart is empty. Please add items before placing an order.");
      return;
    }

    setOrderError(null);
    setPlacing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const deliveryAddress = addresses[selectedAddressIdx]?.address ?? "Default Address";
      
      const orderData = {
        restaurantId,
        restaurantName,
        items: items.map((c) => ({
          itemId: c.id,
          name: c.name,
          qty: c.quantity,
          price: c.price,
          isVeg: c.isVeg,
        })),
        subtotal,
        deliveryFee,
        tax,
        total,
        deliveryAddress,
        paymentMethod: selectedPayment,
      };

      console.log("📦 Order data:", JSON.stringify(orderData, null, 2));

      // ========================================
      // CASH ON DELIVERY FLOW
      // ========================================
      if (selectedPayment === "cod") {
        console.log("📦 Creating COD order...");
        const response = await api.orders.createCod(orderData);
        console.log("✅ COD response:", response);
        
        if (response.success && response.order) {
          finishOrder(response.order._id);
        } else {
          setOrderError(response.message || "Failed to place order. Please try again.");
          setPlacing(false);
        }
        return;
      }

      // ========================================
      // STRIPE PAYMENT FLOW
      // ========================================
      console.log("💳 Creating Stripe payment intent...");
      
      // Step 1: Create Payment Intent
      const paymentResponse = await api.orders.createPaymentIntent(orderData);
      console.log("✅ Payment intent response:", paymentResponse);
      
      if (!paymentResponse.success) {
        setOrderError(paymentResponse.error || "Failed to initialize payment. Please try again.");
        setPlacing(false);
        return;
      }

      if (!paymentResponse.clientSecret) {
        console.error("❌ No clientSecret in response:", paymentResponse);
        setOrderError("Payment initialization failed. Missing client secret.");
        setPlacing(false);
        return;
      }

      setPaymentIntentId(paymentResponse.paymentIntentId);
      setPaymentProcessing(true);

      try {
        // Step 2: Process payment (simulated)
        console.log("💳 Processing payment...");
        const paymentResult = await processStripePayment(paymentResponse.clientSecret);
        console.log("✅ Payment result:", paymentResult);

        // Step 3: Confirm payment and create order
        console.log("📦 Confirming payment and creating order...");
        const confirmResponse = await api.orders.confirmPayment({
          paymentIntentId: paymentResult.paymentIntentId,
          paymentMethodId: "pm_test_123", // Test payment method
          orderData: orderData,
        });

        console.log("✅ Confirm response:", confirmResponse);

        if (confirmResponse.success && confirmResponse.order) {
          finishOrder(confirmResponse.order._id);
        } else {
          setOrderError(confirmResponse.message || "Payment verification failed. Please try again.");
          setPlacing(false);
        }
      } catch (paymentError: any) {
        console.error("❌ Payment error:", paymentError);
        setOrderError(paymentError?.message || "Payment failed. Please try again.");
        setPlacing(false);
      } finally {
        setPaymentProcessing(false);
        setPaymentIntentId(null);
      }

    } catch (err: any) {
      console.error("❌ Error placing order:", err);
      setOrderError(err?.message || "Failed to place order. Please try again.");
      setPlacing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 120 }]}>

        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
          {addresses.map((addr, idx) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressRow, {
                borderColor: selectedAddressIdx === idx ? colors.primary : colors.border,
                backgroundColor: selectedAddressIdx === idx ? colors.secondary : colors.background,
              }]}
              onPress={() => setSelectedAddressIdx(idx)}
              activeOpacity={0.75}
            >
              <View style={[styles.addrIcon, { backgroundColor: selectedAddressIdx === idx ? colors.primary : colors.muted }]}>
                <Ionicons
                  name={addr.type === "Home" ? "home" : addr.type === "Work" ? "briefcase" : "location"}
                  size={16}
                  color={selectedAddressIdx === idx ? "#fff" : colors.mutedForeground}
                />
              </View>
              <View style={styles.addrInfo}>
                <Text style={[styles.addrType, { color: colors.foreground }]}>{addr.type}</Text>
                <Text style={[styles.addrText, { color: colors.mutedForeground }]} numberOfLines={2}>{addr.address}</Text>
              </View>
              {selectedAddressIdx === idx && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          ))}

          {showAddAddr ? (
            <View style={[styles.addAddrForm, { backgroundColor: colors.muted, borderRadius: 12, padding: 12, gap: 8 }]}>
              <View style={styles.addrTypeRow}>
                {["Home", "Work", "Other"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, { backgroundColor: newAddrType === t ? colors.primary : colors.card, borderColor: colors.border }]}
                    onPress={() => setNewAddrType(t)}
                  >
                    <Text style={{ color: newAddrType === t ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.addrInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Enter full address..."
                placeholderTextColor={colors.mutedForeground}
                value={newAddrText}
                onChangeText={(t) => { setNewAddrText(t); setAddrError(null); }}
                multiline
              />
              {addrError && <Text style={styles.inlineError}>{addrError}</Text>}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={[styles.saveAddrBtn, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleSaveAddress} disabled={savingAddr}>
                  {savingAddr ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Save</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveAddrBtn, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }]} onPress={() => { setShowAddAddr(false); setAddrError(null); setNewAddrText(""); }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={[styles.addAddrBtn, { borderColor: colors.border }]} onPress={() => setShowAddAddr(true)}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[styles.addAddrText, { color: colors.primary }]}>Add New Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentRow, {
                borderColor: selectedPayment === method.id ? colors.primary : colors.border,
                backgroundColor: selectedPayment === method.id ? colors.secondary : colors.background,
              }]}
              onPress={() => setSelectedPayment(method.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.payIcon, { backgroundColor: selectedPayment === method.id ? colors.primary : colors.muted }]}>
                <Ionicons name={method.icon} size={18} color={selectedPayment === method.id ? "#fff" : colors.mutedForeground} />
              </View>
              <Text style={[styles.payLabel, { color: colors.foreground }]}>{method.label}</Text>
              {method.id === "upi" && (
                <View style={[styles.popularTag, { backgroundColor: colors.secondary }]}>
                  <Text style={{ color: colors.primary, fontSize: 10, fontFamily: "Inter_600SemiBold" }}>Popular</Text>
                </View>
              )}
              {method.id !== "cod" && selectedPayment === method.id && (
                <View style={[styles.stripeBadge, { backgroundColor: colors.muted }]}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_500Medium" }}>Stripe</Text>
                </View>
              )}
              <View style={[styles.radio, { borderColor: selectedPayment === method.id ? colors.primary : colors.border }]}>
                {selectedPayment === method.id && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
          {selectedPayment !== "cod" && (
            <View style={[styles.stripeNote, { backgroundColor: colors.secondary }]}>
              <Ionicons name="information-circle" size={14} color={colors.primary} />
              <Text style={[styles.stripeNoteText, { color: colors.primary }]}>
                Payment will be processed securely via Stripe. Order will be created only after successful payment.
              </Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Summary</Text>
          {items.slice(0, 3).map((c) => (
            <View key={c.id} style={styles.summaryRow}>
              <Text style={[styles.summaryItem, { color: colors.mutedForeground }]} numberOfLines={1}>{c.quantity}× {c.name}</Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>₹{c.price * c.quantity}</Text>
            </View>
          ))}
          {items.length > 3 && (
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }}>+{items.length - 3} more items</Text>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {[
            { label: "Subtotal", value: `₹${subtotal}` },
            { label: "Delivery", value: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}` },
            { label: "GST (5%)", value: `₹${tax}` },
          ].map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.billValue, { color: row.value === "FREE" ? colors.success : colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Payable</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 12, borderTopColor: colors.border }]}>
        {orderError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={15} color="#ef4444" />
            <Text style={styles.errorText}>{orderError}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.placeBtn, { backgroundColor: (placing || paymentProcessing) ? colors.muted : colors.primary }]}
          onPress={handlePlaceOrder}
          disabled={placing || paymentProcessing}
          activeOpacity={0.85}
        >
          {(placing || paymentProcessing) ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#fff" />
              <Text style={[styles.placeBtnText, { color: colors.primaryForeground }]}>
                {paymentProcessing ? 'Processing Payment...' : 'Placing Order...'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.placeBtnText, { color: colors.primaryForeground }]}>
                {selectedPayment === "cod" ? "Place Order" : "Pay & Place Order"}
              </Text>
              <Text style={[styles.placeBtnAmount, { color: "rgba(255,255,255,0.85)" }]}>₹{total}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  section: { borderRadius: 16, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  addrIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  addrInfo: { flex: 1 },
  addrType: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  addrText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  addAddrForm: {},
  addrTypeRow: { flexDirection: "row", gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  addrInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 60 },
  inlineError: { color: "#ef4444", fontSize: 12, fontFamily: "Inter_500Medium" },
  saveAddrBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  addAddrBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
  addAddrText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  payIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  payLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  popularTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  stripeBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  stripeNote: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 10 },
  stripeNoteText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", marginRight: 8 },
  summaryPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  billLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  billValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
  totalLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  errorText: { flex: 1, color: "#ef4444", fontSize: 13, fontFamily: "Inter_500Medium" },
  placeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14 },
  placeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  placeBtnAmount: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});

