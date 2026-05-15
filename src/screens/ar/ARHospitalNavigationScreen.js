import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const { width, height } = Dimensions.get('window');

const ARHospitalNavigationScreen = ({ navigation, route }) => {
  const location = route.params?.location || "Cardiology Department";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState("Turn left after the main lobby");

  const steps = [
    { step: 1, instruction: "Walk straight from entrance", arrow: "arrow-forward" },
    { step: 2, instruction: "Turn left towards elevators", arrow: "arrow-back" },
    { step: 3, instruction: "Take elevator to 2nd floor", arrow: "arrow-up" },
    { step: 4, instruction: "Cardiology Department is on your right", arrow: "arrow-forward" },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setDirection(steps[currentStep].instruction);
    } else {
      Alert.alert("You have arrived!", "Welcome to Cardiology Department");
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="AR Hospital Navigation" navigation={navigation} />

      {/* AR Camera Simulation Area */}
      <View style={styles.arView}>
        <View style={styles.arOverlay}>
          {/* Simulated AR Arrows */}
          <View style={styles.arArrowContainer}>
            <Ionicons 
              name={steps[currentStep-1].arrow} 
              size={120} 
              color="#00D4FF" 
              style={styles.arArrow} 
            />
          </View>

          <Text style={styles.arLocation}>{location}</Text>
          <Text style={styles.arDistance}>Distance: ~45 meters</Text>
        </View>

        {/* Floor Indicator */}
        <View style={styles.floorIndicator}>
          <Text style={styles.floorText}>2nd Floor</Text>
        </View>
      </View>

      {/* Navigation Instructions */}
      <View style={styles.instructionPanel}>
        <Text style={styles.stepText}>Step {currentStep} of {steps.length}</Text>
        
        <Text style={styles.instruction}>
          {steps[currentStep-1].instruction}
        </Text>

        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length ? "I Have Arrived" : "Next Direction"}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.endButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.endButtonText}>End Navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  arView: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  arOverlay: {
    alignItems: 'center',
  },
  arArrowContainer: {
    marginBottom: 30,
  },
  arArrow: {
    transform: [{ rotate: '0deg' }],
  },
  arLocation: {
    color: '#00D4FF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arDistance: {
    color: '#fff',
    fontSize: 18,
    marginTop: 8,
  },
  floorIndicator: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'rgba(0,212,255,0.9)',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 30,
  },
  floorText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionPanel: {
    backgroundColor: '#fff',
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
  },
  stepText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 32,
  },
  nextButton: {
    backgroundColor: '#00D4FF',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    marginRight: 10,
  },
  endButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#EF4444',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ARHospitalNavigationScreen;