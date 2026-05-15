import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const FeedbackScreen = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const emojis = [
    { id: 1, name: 'sad-outline', label: 'Poor', color: '#FF4D6D' },
    { id: 2, name: 'neutral-outline', label: 'Average', color: '#FFD60A' },
    { id: 3, name: 'happy-outline', label: 'Good', color: '#00EAFF' },
    { id: 4, name: 'heart-outline', label: 'Excellent', color: '#32D74B' },
  ];

  const handleSubmit = () => {
    if (rating === 0 && !selectedEmoji) {
      Alert.alert("Wait!", "Please select a rating before submitting.");
      return;
    }
    
    // Logic to send to your backend would go here
    Alert.alert(
      "Thank You!", 
      "Your feedback helps us improve SehatLine for everyone.",
      [{ text: "Done", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={['#001D3D', '#020914']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Experience</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.question}>How was your experience today?</Text>
          
          {/* Emoji Sentiment Row */}
          <View style={styles.emojiRow}>
            {emojis.map((emoji) => (
              <TouchableOpacity 
                key={emoji.id} 
                onPress={() => setSelectedEmoji(emoji.id)}
                style={[
                  styles.emojiBtn,
                  selectedEmoji === emoji.id && { backgroundColor: emoji.color + '20', borderColor: emoji.color }
                ]}
              >
                <Ionicons 
                  name={selectedEmoji === emoji.id ? emoji.name.replace('-outline', '') : emoji.name} 
                  size={32} 
                  color={selectedEmoji === emoji.id ? emoji.color : '#444'} 
                />
                <Text style={[styles.emojiLabel, selectedEmoji === emoji.id && { color: emoji.color }]}>
                  {emoji.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.subQuestion}>Rate our service</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={38} 
                  color={star <= rating ? "#FFD60A" : "#222"} 
                  style={{ marginHorizontal: 5 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Detailed Feedback (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us what we can improve..."
            placeholderTextColor="#444"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <LinearGradient 
            colors={['#00EAFF', '#0077B6']} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}} 
            style={styles.gradientBtn}
          >
            <Text style={styles.submitText}>Submit Feedback</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020914' },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  scrollContent: { padding: 20 },
  card: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 25, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center'
  },
  question: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  emojiBtn: { alignItems: 'center', padding: 10, borderRadius: 15, borderWidth: 2, borderColor: 'transparent', flex: 1 },
  emojiLabel: { color: '#666', fontSize: 10, marginTop: 5, fontWeight: 'bold' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', width: '100%', marginVertical: 20 },
  
  subQuestion: { color: '#888', fontSize: 14, marginBottom: 15 },
  starRow: { flexDirection: 'row', marginBottom: 10 },
  
  inputContainer: { marginTop: 25 },
  label: { color: '#AAA', fontSize: 14, marginBottom: 10, marginLeft: 5 },
  textInput: { 
    backgroundColor: '#0A192F', 
    borderRadius: 20, 
    padding: 15, 
    color: '#FFF', 
    fontSize: 15, 
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(0, 234, 255, 0.1)',
    minHeight: 120
  },
  
  submitBtn: { marginTop: 30, borderRadius: 15, overflow: 'hidden', marginBottom: 40 },
  gradientBtn: { padding: 18, alignItems: 'center' },
  submitText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});

export default FeedbackScreen;