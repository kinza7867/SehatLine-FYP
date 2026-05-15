import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const DoctorReviewsScreen = ({ navigation }) => {
  const reviews = [
    { id: '1', name: "Ahmed Khan", rating: 5, comment: "Very caring doctor. Explained everything clearly.", date: "2 days ago" },
    { id: '2', name: "Ayesha Bibi", rating: 4, comment: "Good experience. Wait time was reasonable.", date: "1 week ago" },
    { id: '3', name: "Bilal Ahmed", rating: 5, comment: "Best cardiologist in the hospital!", date: "3 weeks ago" },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Patient Reviews" navigation={navigation} />

      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{item.name}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <View style={styles.stars}>
              {[...Array(item.rating)].map((_, i) => (
                <Ionicons key={i} name="star" size={20} color="#F59E0B" />
              ))}
            </View>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  reviewCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reviewerName: { fontSize: 17, fontWeight: '600', color: '#1E3A8A' },
  date: { color: '#64748B', fontSize: 13 },
  stars: { flexDirection: 'row', marginBottom: 12 },
  comment: { fontSize: 16, color: '#334155', lineHeight: 24 },
});

export default DoctorReviewsScreen;