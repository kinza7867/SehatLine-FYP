import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const VoiceHealthAssistantScreen = ({ navigation }) => {
  const [isListening, setIsListening] = useState(false);
  const [response, setResponse] = useState('');

  const speak = (text) => {
    Speech.speak(text, { 
      language: 'en', 
      pitch: 1.0, 
      rate: 0.9 
    });
  };

  const startVoiceAssistant = () => {
    setIsListening(true);
    setResponse('');

    // Mock voice input
    setTimeout(() => {
      setIsListening(false);
      const mockResponse = "You mentioned chest pain and shortness of breath. This could be medium severity. I recommend Cardiology department with priority token.";
      setResponse(mockResponse);
      speak(mockResponse);
      Alert.alert("Voice Analysis Done", mockResponse);
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Voice Health Assistant" navigation={navigation} />

      <View style={styles.content}>
        <Ionicons name="mic-circle" size={120} color={isListening ? "#EF4444" : "#00D4FF"} />

        <Text style={styles.title}>
          {isListening ? "Listening..." : "Speak your symptoms"}
        </Text>
        <Text style={styles.subtitle}>Supports Urdu, Roman Urdu & English</Text>

        <TouchableOpacity 
          style={[styles.voiceButton, isListening && styles.listeningButton]} 
          onPress={startVoiceAssistant}
          disabled={isListening}
        >
          <Ionicons name={isListening ? "stop-circle" : "mic"} size={40} color="#fff" />
          <Text style={styles.voiceButtonText}>
            {isListening ? "Processing..." : "Tap to Speak"}
          </Text>
        </TouchableOpacity>

        {response ? (
          <View style={styles.responseCard}>
            <Text style={styles.responseTitle}>AI Response:</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 40, textAlign: 'center' },
  voiceButton: {
    backgroundColor: '#00D4FF',
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  listeningButton: { backgroundColor: '#EF4444' },
  voiceButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  responseCard: {
    marginTop: 40,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    elevation: 4,
  },
  responseTitle: { fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
  responseText: { fontSize: 16, lineHeight: 24, color: '#334155' },
});

export default VoiceHealthAssistantScreen;