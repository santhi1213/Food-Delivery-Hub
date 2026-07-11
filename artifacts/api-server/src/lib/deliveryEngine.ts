import { Restaurant } from "../models/Restaurant";

interface Location { lat: number; lng: number; }

function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371;
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) * Math.cos((loc2.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function getDeliveryQuote(restaurantId: string, customerLocation: Location) {
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const restLat = restaurant.address?.coordinates?.lat;
    const restLng = restaurant.address?.coordinates?.lng;
    if (!restLat || !restLng) return { deliveryFee: 35, source: "fallback", distanceKm: 0 };

    const distance = calculateDistance({ lat: restLat, lng: restLng }, customerLocation);
    const SFX_API_URL = process.env.SHADOWFAX_API_URL || "https://flash-backend.shadowfax.in/api/v1";
    const SFX_TOKEN = process.env.SHADOWFAX_API_KEY || "d9e70b0f1ca13663f19bd371aec120a31ecfffa2";

    const response = await fetch(`${SFX_API_URL}/delivery_modes`, {
      method: "POST",
      headers: { "Authorization": `Token ${SFX_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup_latitude: restLat,
        pickup_longitude: restLng,
        delivery_latitude: customerLocation.lat,
        delivery_longitude: customerLocation.lng,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const cost = data?.delivery_modes?.[0]?.cost || Math.round(30 + distance * 7);
      return { deliveryFee: Math.max(cost, 15), source: "shadowfax", distanceKm: distance };
    }

    return { deliveryFee: Math.max(Math.round(30 + distance * 6), 15), source: "fallback", distanceKm: distance };
  } catch {
    return { deliveryFee: 40, source: "fallback", distanceKm: 0 };
  }
}