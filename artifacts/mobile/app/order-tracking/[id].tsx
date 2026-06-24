// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   Linking,
// } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// interface TrackingData {
//   orderId: string;
//   status: string;
//   estimatedDelivery: string;
//   currentLocation: {
//     address: string;
//     city: string;
//   };
//   trackingHistory: Array<{
//     status: string;
//     location: string;
//     timestamp: string;
//     description: string;
//   }>;
//   deliveryPartner: {
//     name: string;
//     phone: string;
//     rating: number;
//   };
// }

// const statusSteps = [
//   { key: 'pending', label: 'Order Placed', icon: 'cart-outline' },
//   { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
//   { key: 'preparing', label: 'Preparing', icon: 'restaurant-outline' },
//   { key: 'ready', label: 'Ready for Pickup', icon: 'cube-outline' },
//   { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'bicycle-outline' },
//   { key: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle-outline' },
// ];

// export default function OrderTrackingScreen() {
//   const { id } = useLocalSearchParams();
//   const [tracking, setTracking] = useState<TrackingData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchTrackingDetails();
//     // Set up polling every 30 seconds
//     const interval = setInterval(fetchTrackingDetails, 30000);
//     return () => clearInterval(interval);
//   }, [id]);

//   const fetchTrackingDetails = async () => {
//     try {
//       // Replace with your actual API call
//       // const response = await api.get(`/orders/${id}/tracking`);
//       // setTracking(response.data);
      
//       // Mock data for demonstration
//       const mockTracking: TrackingData = {
//         orderId: id as string,
//         status: 'out_for_delivery',
//         estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(),
//         currentLocation: {
//           address: '123 Main Street',
//           city: 'Downtown',
//         },
//         trackingHistory: [
//           {
//             status: 'Order Placed',
//             location: 'Online',
//             timestamp: new Date(Date.now() - 3600000).toISOString(),
//             description: 'Your order has been received',
//           },
//           {
//             status: 'Confirmed',
//             location: 'Restaurant',
//             timestamp: new Date(Date.now() - 3000000).toISOString(),
//             description: 'Restaurant confirmed your order',
//           },
//           {
//             status: 'Preparing',
//             location: 'Restaurant Kitchen',
//             timestamp: new Date(Date.now() - 2400000).toISOString(),
//             description: 'Your food is being prepared',
//           },
//           {
//             status: 'Out for Delivery',
//             location: 'On the way',
//             timestamp: new Date(Date.now() - 600000).toISOString(),
//             description: 'Delivery partner is on the way',
//           },
//         ],
//         deliveryPartner: {
//           name: 'Rahul Sharma',
//           phone: '+91 98765 43210',
//           rating: 4.8,
//         },
//       };
//       setTracking(mockTracking);
//     } catch (error) {
//       console.error('Error fetching tracking:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchTrackingDetails();
//   };

//   const getCurrentStepIndex = () => {
//     if (!tracking) return 0;
//     const index = statusSteps.findIndex(step => step.key === tracking.status);
//     return index >= 0 ? index : 0;
//   };

//   const formatTime = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diff = now.getTime() - date.getTime();
//     const minutes = Math.floor(diff / 60000);
//     const hours = Math.floor(minutes / 60);
    
//     if (minutes < 1) return 'Just now';
//     if (minutes < 60) return `${minutes} min ago`;
//     if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
//     return date.toLocaleDateString();
//   };

//   const getEstimatedTime = () => {
//     if (!tracking?.estimatedDelivery) return 'N/A';
//     const deliveryTime = new Date(tracking.estimatedDelivery);
//     const now = new Date();
//     const diff = deliveryTime.getTime() - now.getTime();
//     const minutes = Math.floor(diff / 60000);
    
//     if (minutes <= 0) return 'Arriving soon';
//     if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   const callDeliveryPartner = () => {
//     if (tracking?.deliveryPartner.phone) {
//       Linking.openURL(`tel:${tracking.deliveryPartner.phone}`);
//     }
//   };

//   const openMaps = () => {
//     // Open Google Maps or Apple Maps with the restaurant location
//     const address = encodeURIComponent(tracking?.currentLocation.address || '');
//     const url = `https://maps.google.com/?q=${address}`;
//     Linking.openURL(url);
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#FF6B6B" />
//         <Text style={styles.loadingText}>Fetching order details...</Text>
//       </View>
//     );
//   }

//   const currentStepIndex = getCurrentStepIndex();

//   return (
//     <ScrollView
//       style={styles.container}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
//       }
//     >
//       {/* Order Header */}
//       <View style={styles.header}>
//         <Text style={styles.orderId}>Order #{tracking?.orderId?.slice(-8)}</Text>
//         <View style={styles.statusContainer}>
//           <Ionicons name="time-outline" size={16} color="#FF6B6B" />
//           <Text style={styles.estimatedTime}>Est. {getEstimatedTime()}</Text>
//         </View>
//       </View>

//       {/* Progress Tracker */}
//       <View style={styles.progressContainer}>
//         {statusSteps.map((step, index) => {
//           const isCompleted = index <= currentStepIndex;
//           const isCurrent = index === currentStepIndex;
          
//           return (
//             <View key={step.key} style={styles.progressStep}>
//               <View style={[
//                 styles.progressDot,
//                 isCompleted && styles.progressDotCompleted,
//                 isCurrent && styles.progressDotCurrent,
//               ]}>
//                 <Ionicons 
//                   name={isCompleted ? (step.icon as any) : 'ellipse-outline'} 
//                   size={isCurrent ? 20 : 16} 
//                   color={isCompleted ? '#FFFFFF' : '#CBD5E1'} 
//                 />
//               </View>
//               {index < statusSteps.length - 1 && (
//                 <View style={[
//                   styles.progressLine,
//                   isCompleted && styles.progressLineCompleted,
//                 ]} />
//               )}
//               <Text style={[
//                 styles.progressLabel,
//                 isCompleted && styles.progressLabelCompleted,
//               ]}>
//                 {step.label}
//               </Text>
//             </View>
//           );
//         })}
//       </View>

//       {/* Live Location Card */}
//       <TouchableOpacity style={styles.locationCard} onPress={openMaps}>
//         <View style={styles.locationHeader}>
//           <Ionicons name="location-outline" size={24} color="#FF6B6B" />
//           <Text style={styles.locationTitle}>Current Location</Text>
//         </View>
//         <Text style={styles.locationAddress}>
//           {tracking?.currentLocation.address}, {tracking?.currentLocation.city}
//         </Text>
//         <View style={styles.viewMapButton}>
//           <Text style={styles.viewMapText}>View on Maps</Text>
//           <Ionicons name="arrow-forward" size={16} color="#FF6B6B" />
//         </View>
//       </TouchableOpacity>

//       {/* Delivery Partner Card */}
//       {tracking?.deliveryPartner && tracking.status === 'out_for_delivery' && (
//         <View style={styles.deliveryCard}>
//           <Text style={styles.sectionTitle}>Delivery Partner</Text>
//           <View style={styles.deliveryInfo}>
//             <View style={styles.deliveryAvatar}>
//               <Ionicons name="person-circle-outline" size={48} color="#CBD5E1" />
//             </View>
//             <View style={styles.deliveryDetails}>
//               <Text style={styles.deliveryName}>{tracking.deliveryPartner.name}</Text>
//               <View style={styles.ratingContainer}>
//                 <Ionicons name="star" size={14} color="#FBBF24" />
//                 <Text style={styles.rating}>{tracking.deliveryPartner.rating}</Text>
//               </View>
//             </View>
//             <TouchableOpacity style={styles.callButton} onPress={callDeliveryPartner}>
//               <Ionicons name="call-outline" size={22} color="#FFFFFF" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Tracking Timeline */}
//       <View style={styles.timelineCard}>
//         <Text style={styles.sectionTitle}>Tracking History</Text>
//         {tracking?.trackingHistory.map((event, index) => (
//           <View key={index} style={styles.timelineItem}>
//             <View style={styles.timelineIcon}>
//               <Ionicons 
//                 name={index === 0 ? 'radio-button-on' : 'ellipse-outline'} 
//                 size={16} 
//                 color={index === 0 ? '#FF6B6B' : '#CBD5E1'} 
//               />
//               {index < (tracking.trackingHistory.length - 1) && (
//                 <View style={styles.timelineLine} />
//               )}
//             </View>
//             <View style={styles.timelineContent}>
//               <Text style={styles.timelineStatus}>{event.status}</Text>
//               <Text style={styles.timelineLocation}>{event.location}</Text>
//               <Text style={styles.timelineDescription}>{event.description}</Text>
//               <Text style={styles.timelineTime}>{formatTime(event.timestamp)}</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Need Help Button */}
//       <TouchableOpacity style={styles.helpButton}>
//         <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
//         <Text style={styles.helpButtonText}>Need Help with Your Order?</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#64748B',
//   },
//   header: {
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E2E8F0',
//   },
//   orderId: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#0F172A',
//     marginBottom: 8,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   estimatedTime: {
//     fontSize: 14,
//     color: '#FF6B6B',
//     fontWeight: '500',
//   },
//   progressContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     marginTop: 12,
//     marginHorizontal: 16,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   progressStep: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   progressDot: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#F1F5F9',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   progressDotCompleted: {
//     backgroundColor: '#22C55E',
//   },
//   progressDotCurrent: {
//     backgroundColor: '#FF6B6B',
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//   },
//   progressLine: {
//     position: 'absolute',
//     top: 16,
//     left: '50%',
//     right: '-50%',
//     height: 2,
//     backgroundColor: '#E2E8F0',
//   },
//   progressLineCompleted: {
//     backgroundColor: '#22C55E',
//   },
//   progressLabel: {
//     fontSize: 10,
//     color: '#94A3B8',
//     textAlign: 'center',
//   },
//   progressLabelCompleted: {
//     color: '#0F172A',
//     fontWeight: '500',
//   },
//   locationCard: {
//     backgroundColor: '#FFFFFF',
//     margin: 16,
//     marginTop: 12,
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   locationHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 12,
//   },
//   locationTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0F172A',
//   },
//   locationAddress: {
//     fontSize: 14,
//     color: '#475569',
//     marginBottom: 12,
//   },
//   viewMapButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   viewMapText: {
//     fontSize: 14,
//     color: '#FF6B6B',
//     fontWeight: '500',
//   },
//   deliveryCard: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginBottom: 12,
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0F172A',
//     marginBottom: 16,
//   },
//   deliveryInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   deliveryAvatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#F1F5F9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   deliveryDetails: {
//     flex: 1,
//   },
//   deliveryName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0F172A',
//     marginBottom: 4,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   rating: {
//     fontSize: 12,
//     color: '#64748B',
//   },
//   callButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#22C55E',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   timelineCard: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginBottom: 16,
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   timelineItem: {
//     flexDirection: 'row',
//     marginBottom: 20,
//   },
//   timelineIcon: {
//     width: 28,
//     alignItems: 'center',
//     position: 'relative',
//   },
//   timelineLine: {
//     width: 2,
//     flex: 1,
//     backgroundColor: '#E2E8F0',
//     position: 'absolute',
//     top: 20,
//     bottom: -20,
//   },
//   timelineContent: {
//     flex: 1,
//     paddingBottom: 8,
//   },
//   timelineStatus: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#0F172A',
//     marginBottom: 4,
//   },
//   timelineLocation: {
//     fontSize: 13,
//     color: '#64748B',
//     marginBottom: 2,
//   },
//   timelineDescription: {
//     fontSize: 12,
//     color: '#94A3B8',
//     marginBottom: 4,
//   },
//   timelineTime: {
//     fontSize: 11,
//     color: '#94A3B8',
//   },
//   helpButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#FF6B6B',
//     margin: 16,
//     marginTop: 0,
//     padding: 16,
//     borderRadius: 12,
//   },
//   helpButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
// });


// app/order-tracking/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

const ORDER_STATUSES = [
  { key: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { key: "preparing", label: "Preparing", icon: "restaurant" },
  { key: "ready", label: "Ready for Pickup", icon: "cube" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "bicycle" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.orders.get(id);
      if (response.success && response.order) {
        setOrder(response.order);
        // Find current status index
        const statusIndex = ORDER_STATUSES.findIndex(
          s => s.key === response.order.status
        );
        setCurrentStatus(statusIndex >= 0 ? statusIndex : 0);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading order details...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>Order not found</Text>
        <TouchableOpacity
          style={[styles.goHomeBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.goHomeBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/orders")} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Order Tracking</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Order ID */}
        <View style={[styles.orderIdContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.orderIdLabel, { color: colors.mutedForeground }]}>Order #{order.orderId || order._id?.slice(-8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: order.status === 'delivered' ? colors.success + '20' : colors.primary + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: order.status === 'delivered' ? colors.success : colors.primary }]}>
              {order.status?.toUpperCase() || 'CONFIRMED'}
            </Text>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={[styles.timelineContainer, { backgroundColor: colors.card }]}>
          {ORDER_STATUSES.map((status, index) => (
            <View key={status.key}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    {
                      backgroundColor: index <= currentStatus ? colors.primary : colors.border,
                      borderColor: index <= currentStatus ? colors.primary : colors.border,
                    }
                  ]}>
                    {index < currentStatus ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : index === currentStatus ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : null}
                  </View>
                  {index < ORDER_STATUSES.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: index < currentStatus ? colors.primary : colors.border }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[
                    styles.timelineLabel,
                    {
                      color: index <= currentStatus ? colors.foreground : colors.mutedForeground,
                      fontWeight: index === currentStatus ? '600' : '400',
                    }
                  ]}>
                    {status.label}
                  </Text>
                  {index === currentStatus && (
                    <Text style={[styles.timelineStatus, { color: colors.primary }]}>
                      In Progress
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={[styles.summaryItem, { color: colors.mutedForeground }]}>
                {item.qty || item.quantity}× {item.name}
              </Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>
                ₹{item.price * (item.qty || item.quantity || 1)}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTotalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.summaryTotalPrice, { color: colors.primary }]}>₹{order.total}</Text>
          </View>
          <Text style={[styles.deliveryAddress, { color: colors.mutedForeground }]}>
            Delivery: {order.deliveryAddress}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {order.status !== 'delivered' && (
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.accent }]}
              onPress={() => {
                Alert.alert(
                  "Cancel Order",
                  "Are you sure you want to cancel this order?",
                  [
                    { text: "No", style: "cancel" },
                    { 
                      text: "Yes, Cancel", 
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await api.orders.cancel(order._id);
                          Alert.alert("Cancelled", "Your order has been cancelled");
                          router.replace("/(tabs)/orders");
                        } catch (error) {
                          Alert.alert("Error", "Failed to cancel order");
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={[styles.cancelBtnText, { color: colors.accent }]}>Cancel Order</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.supportBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="headset-outline" size={20} color={colors.primary} />
            <Text style={[styles.supportBtnText, { color: colors.primary }]}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  orderIdLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  timelineContainer: { padding: 16, borderRadius: 12 },
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { width: 30, alignItems: 'center', marginRight: 12 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineRight: { flex: 1, paddingVertical: 4 },
  timelineLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  timelineStatus: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  summaryContainer: { padding: 16, borderRadius: 12, gap: 8 },
  summaryTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  summaryTotalLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  summaryTotalPrice: { fontSize: 16, fontFamily: "Inter_700Bold" },
  deliveryAddress: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  actionContainer: { gap: 10 },
  cancelBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  supportBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  homeBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeBtnText: { color: 'white', fontSize: 15, fontFamily: "Inter_600SemiBold" },
  loadingText: { marginTop: 12, fontSize: 16, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 16, fontFamily: "Inter_400Regular", marginBottom: 20 },
  goHomeBtn: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  goHomeBtnText: { color: 'white', fontSize: 16, fontFamily: "Inter_600SemiBold" },
});