import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const PriorityTokenScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Priority Token" navigation={navigation} />

      <View style={styles.content}>
        <Ionicons name="star" size={100} color="#EF4444" />

        <Text style={styles.title}>Your Priority Token</Text>
        <Text style={styles.tokenNumber}>P-089</Text>
        <Text style={styles.status}>Critical • Immediate Attention</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>You have been given priority due to AI-detected critical symptoms.</Text>
          <Text style={styles.waitTime}>Estimated wait time: 8-12 minutes</Text>
        </View>

        <TouchableOpacity 
          style={styles.viewQueueButton}
          onPress={() => navigation.navigate('LiveTokenQueueScreen')}
        >
          <Text style={styles.buttonText}>View Live Queue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A', marginTop: 20 },
  tokenNumber: { fontSize: 72, fontWeight: 'bold', color: '#EF4444', marginVertical: 15 },
  status: { fontSize: 20, color: '#EF4444', fontWeight: '600' },
  infoBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    marginTop: 40,
    width: '100%',
    elevation: 5,
  },
  infoText: { fontSize: 16, textAlign: 'center', lineHeight: 26, color: '#334155' },
  waitTime: { fontSize: 17, color: '#10B981', fontWeight: 'bold', textAlign: 'center', marginTop: 15 },
  viewQueueButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
});

export default PriorityTokenScreen;