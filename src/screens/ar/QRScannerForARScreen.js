import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
//import { BarCodeScanner } from 'expo-barcode-scanner';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const QRScannerForARScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert(
      "QR Code Detected",
      `Hospital Location: ${data}\n\nStarting AR Navigation...`,
      [
        { 
          text: "Start AR Navigation", 
          onPress: () => navigation.navigate('ARHospitalNavigation', { location: data }) 
        },
        { text: "Scan Again", onPress: () => setScanned(false) }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <CustomHeader title="QR Scanner for AR" navigation={navigation} />
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <CustomHeader title="QR Scanner for AR" navigation={navigation} />
        <Text style={styles.message}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Scan QR for AR Navigation" navigation={navigation} />

      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <View style={styles.scannerFrame} />
        
        <Text style={styles.instruction}>
          Point camera at QR code placed at hospital entrance or department
        </Text>

        {scanned && (
          <TouchableOpacity 
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  message: { 
    flex: 1, 
    color: '#fff', 
    textAlign: 'center', 
    marginTop: 100, 
    fontSize: 18 
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderWidth: 4,
    borderColor: '#00D4FF',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 12,
  },
  rescanButton: {
    marginTop: 30,
    backgroundColor: '#00D4FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
  },
  rescanText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default QRScannerForARScreen;