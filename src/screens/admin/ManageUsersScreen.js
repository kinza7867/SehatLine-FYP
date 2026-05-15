import React, { useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  TextInput, ImageBackground, StatusBar, Platform 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../../components/CustomHeader';

const ManageUsersScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([
    { id: '1', name: 'Ahmed Khan', role: 'Patient', phone: '0300-1234567', status: 'Active', joinDate: '12 Mar 2026' },
    { id: '2', name: 'Ayesha Bibi', role: 'Patient', phone: '0312-9876543', status: 'Active', joinDate: '10 Mar 2026' },
    { id: '3', name: 'Bilal Ahmed', role: 'Doctor', phone: '0333-5556677', status: 'Active', joinDate: '05 Mar 2026' },
    { id: '4', name: 'Sana Malik', role: 'Patient', phone: '0345-1122334', status: 'Inactive', joinDate: '01 Mar 2026' },
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } 
        : user
    ));
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Doctor': return '#FFB800';
      case 'Patient': return '#04e1f5';
      default: return '#A855F7';
    }
  };

  const getStatusStyle = (status) => {
    return status === 'Active' ? styles.activeStatus : styles.inactiveStatus;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <CustomHeader title="Manage Users" navigation={navigation} textColor="#FFFFFF" />

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#04e1f5" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name or role..."
              placeholderTextColor="#a5a3a3"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={[styles.avatar, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
                    <Ionicons 
                      name={item.role === 'Doctor' ? 'medkit-outline' : 'person-outline'} 
                      size={28} 
                      color={getRoleColor(item.role)} 
                    />
                  </View>
                  <View style={styles.details}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={[styles.userRole, { color: getRoleColor(item.role) }]}>
                      {item.role} • {item.phone}
                    </Text>
                    <Text style={styles.joinDate}>Joined: {item.joinDate}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.statusBtn, getStatusStyle(item.status)]}
                    onPress={() => toggleUserStatus(item.id)}
                  >
                    <Text style={styles.statusBtnText}>{item.status}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity style={styles.addButton}>
            <LinearGradient
              colors={['#04e1f5', '#0284c7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add New User</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    height: 50, 
    fontSize: 16,
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  details: { 
    flex: 1 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  userRole: { 
    fontSize: 13, 
    marginTop: 2,
    fontWeight: '600',
  },
  joinDate: { 
    fontSize: 11, 
    color: '#B2DFDB', 
    marginTop: 2 
  },
  actions: { 
    alignItems: 'center' 
  },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  activeStatus: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  inactiveStatus: {
    backgroundColor: 'rgba(255, 77, 77, 0.2)',
    borderWidth: 1,
    borderColor: '#FF4D4D',
  },
  statusBtnText: { 
    fontSize: 12, 
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#04e1f5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ManageUsersScreen;