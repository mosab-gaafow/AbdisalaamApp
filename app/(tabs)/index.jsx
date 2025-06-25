import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import styles from '../styles/home.styles';
import { API_URL } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/color';
import Loader from '../components/Loader';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const { token } = useAuthStore();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tripTypeFilter, setTripTypeFilter] = useState("All");

  const fetchTrips = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      // const url = `${API_URL}/trips/public?page=${pageNum}&limit=5`;
      const url = `${API_URL}/trips/public?page=${pageNum}&limit=5${
  tripTypeFilter !== "All" ? `&tripType=${tripTypeFilter}` : ""
}`;


      console.log("URL", url)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    ;

      const data = await response.json();
//       console.log("response status:", response.status);
// console.log("response data:", data);

if (!response.ok || !Array.isArray(data.trips)) {
  throw new Error("Failed to fetch trips");
}

      const newTrips = refresh || pageNum === 1 ? data.trips : [...trips, ...data.trips];

      const uniqueTrips = Array.from(new Set(newTrips.map((trip) => trip.id)))
        .map((id) => newTrips.find((trip) => trip.id === id));

      setTrips(uniqueTrips);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching trips:", err.message);
    } finally {
      if (refresh) {
        await sleep(1000);
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
  fetchTrips(1, true); // refresh when filter changes
}, [tripTypeFilter]);


  useEffect(() => {
    fetchTrips();
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchTrips(page + 1);
    }
  };

  const filteredTrips = trips.filter((trip) =>
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
  <View style={styles.bookCard}>
    <View style={styles.bookHeader}>
      <Text style={styles.bookTitle}>{item.origin} → {item.destination}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: COLORS.primary }}>{item.status}</Text>
        {item.availableSeats < 5 && (
          <Text style={{ marginLeft: 8, color: 'orange', fontWeight: 'bold' }}>🔥 Popular</Text>
        )}
        {new Date(item.date).toDateString() === new Date().toDateString() && (
          <Text style={{ marginLeft: 8, color: 'green', fontWeight: 'bold' }}>Today</Text>
        )}
      </View>
    </View>

    <Text style={styles.caption}>Date: {new Date(item.date).toLocaleDateString()}</Text>
    <Text style={styles.caption}>Time: {item.time}</Text>
    <Text style={styles.caption}>Price: ${item.price}</Text>
    <Text style={styles.caption}>Available Seats: {item.availableSeats}</Text>
    {item.isTourism && item.tourismFeatures && Array.isArray(item.tourismFeatures) && (
  <View style={{ marginTop: 8 }}>
    <Text style={{ fontWeight: '600', marginBottom: 4, color: COLORS.primary }}>
      Tourism Packages Included:
    </Text>
    {item.tourismFeatures.map((feature, index) => (
      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
        <Ionicons name="checkmark-circle" size={16} color="green" style={{ marginRight: 6 }} />
        <Text style={{ color: '#333' }}>{feature}</Text>
      </View>
    ))}
  </View>
)}


    {item.isTourism && item.tourismFeatures && typeof item.tourismFeatures === "object" && (
  <View style={{
    marginTop: 10,
    backgroundColor: '#eef9f1',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  }}>
    <Text style={{ fontWeight: '600', marginBottom: 6 }}>
      🌿 Included in This Tourism Package:
    </Text>

    {Object.entries(item.tourismFeatures).map(([key, value]) => {
      if (!value) return null;

      const icons = {
        lunch: '🍽️ Free Lunch Included',
        photographing: '📸 Guided Photographing & Videography',
        sunsetView: '🌇 Sunset/Sunrise Viewing Spots',
        tourGuide: '👨‍🏫 Local Tour Guide Available',
        culturalVisit: '🕌 Cultural / Religious Site Visits',
      };

      return (
        <Text key={key} style={{ marginBottom: 4 }}>
          {icons[key] || `✅ ${key}`}
        </Text>
      );
    })}
  </View>
)}


  </View>
);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTrips}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Available Trips 🚐</Text>
              <Text style={styles.headerSubtitle}>Explore and book your journey</Text>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
  <Text style={{ fontWeight: '600', marginBottom: 6 }}>Filter by Trip Type</Text>
  <View style={{ flexDirection: 'row', gap: 10 }}>
    {["All", "Travel", "Tourism"].map((type) => (
      <Text
        key={type}
        onPress={() => setTripTypeFilter(type)}  // ✅ Let useEffect handle fetching

        style={{
          backgroundColor: tripTypeFilter === type ? COLORS.primary : '#ccc',
          color: tripTypeFilter === type ? '#fff' : '#000',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 10,
          marginHorizontal: 4,
          fontWeight: 'bold',
        }}
      >
        {type}
      </Text>
    ))}
  </View>
</View>




            <View style={{ paddingHorizontal: 16 }}>
              <TextInput
                placeholder="Search by destination or origin..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  backgroundColor: '#fff',
                  padding: 12,
                  borderRadius: 10,
                  borderColor: '#ccc',
                  borderWidth: 1,
                }}
              />
            </View>
          </View>
          
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTrips(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bus-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No Trips Available</Text>
            <Text style={styles.emptySubtext}>Please check back later</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && trips.length > 0 ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.footerLoader} />
          ) : null
        }
      />
    </View>
  );
}
