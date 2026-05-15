import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Dimensions, Platform, StatusBar, ImageBackground, SafeAreaView,
  TextInput, Modal, Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const HelpSupportScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Welcome to SehatLine Support! How can I help you today?", sender: 'bot', time: 'Just now' }
  ]);

  const faqs = [
    { 
      id: 1,
      question: "How do I book an appointment?", 
      answer: "You can book an appointment by:\n\n1. Go to the 'Book Appointment' tab\n2. Select your preferred doctor\n3. Choose available time slot\n4. Confirm your booking\n\nYou'll receive a confirmation notification immediately.",
      category: "Appointments"
    },
    { 
      id: 2,
      question: "How does AI Symptom Checker work?", 
      answer: "Our AI Symptom Checker (HAMI) works by:\n\n1. You describe your symptoms\n2. AI analyzes against medical database\n3. Provides severity assessment\n4. Recommends department\n5. Generates priority token if needed\n\n⚠️ Note: Always consult a real doctor for final diagnosis.",
      category: "AI Features"
    },
    { 
      id: 3,
      question: "Can I track my ambulance?", 
      answer: "Yes! After activating SOS:\n\n1. Your location is shared with dispatch\n2. You can see ambulance ETA\n3. Track in real-time on map\n4. Receive arrival notifications\n5. Direct call to ambulance driver",
      category: "Emergency"
    },
    { 
      id: 4,
      question: "How to add family members?", 
      answer: "Add family members to your account:\n\n1. Go to 'Family Health Hub'\n2. Tap 'Add New Member'\n3. Enter their details\n4. Link medical records\n5. Manage appointments for them",
      category: "Family Hub"
    },
    { 
      id: 5,
      question: "How do I view my medical reports?", 
      answer: "View your medical reports:\n\n1. Go to 'Medical Records'\n2. Select report type (Lab/Imaging)\n3. Filter by date\n4. Tap to view/download\n5. Share with doctor via app",
      category: "Medical Records"
    },
    { 
      id: 6,
      question: "What is the cancellation policy?", 
      answer: "Cancellation Policy:\n\n• Free cancellation up to 2 hours before appointment\n• 50% charge for late cancellation\n• No-show fees apply\n• Reschedule anytime for free\n• Emergency cases exempted",
      category: "Policies"
    },
    { 
      id: 7,
      question: "How secure is my health data?", 
      answer: "Your data security is our priority:\n\n• AES-256 encryption\n• HIPAA compliant\n• Two-factor authentication\n• Regular security audits\n• Your data never shared with third parties",
      category: "Security"
    },
    { 
      id: 8,
      question: "How do I reset my password?", 
      answer: "Reset your password:\n\n1. Tap 'Forgot Password' on login\n2. Enter registered email\n3. Check OTP in email\n4. Create new password\n5. Login with new credentials",
      category: "Account"
    },
  ];

  const categories = ['All', 'Appointments', 'AI Features', 'Emergency', 'Family Hub', 'Medical Records', 'Policies', 'Security', 'Account'];

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory([
      ...chatHistory,
      { id: chatHistory.length + 1, text: chatMessage, sender: 'user', time: 'Just now' }
    ]);
    setChatMessage('');
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: prev.length + 1,
        text: "Thank you for your message. Our support team will respond shortly. For urgent matters, please call our helpline at 1122.",
        sender: 'bot',
        time: 'Just now'
      }]);
    }, 1000);
  };

  const openPhone = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const openEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const CategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
      style={styles.filterContainer}
    >
      {categories.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
          onPress={() => setSelectedCategory(cat)}
        >
          <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const ChatModal = () => (
    <Modal visible={showChatModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.chatContainer}>
          <LinearGradient colors={['#001D3D', '#000814']} style={styles.chatHeader}>
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatAvatar}>
                <Ionicons name="chatbubble" size={wp(5)} color="#04e1f5" />
              </View>
              <View>
                <Text style={styles.chatTitle}>Support Chat</Text>
                <Text style={styles.chatStatus}>Online • Usually replies in minutes</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <Ionicons name="close" size={wp(6)} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
            {chatHistory.map((msg) => (
              <View key={msg.id} style={[styles.messageRow, msg.sender === 'user' ? styles.userMessageRow : styles.botMessageRow]}>
                <View style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.messageText, msg.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>
                    {msg.text}
                  </Text>
                  <Text style={styles.messageTime}>{msg.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message..."
              placeholderTextColor="#64748B"
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.sendGradient}>
                <Ionicons name="send" size={wp(4.5)} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <LinearGradient
              colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
              style={styles.headerGradient}
            >
              <View style={styles.topHeader}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: wp(10) }} />
              </View>
            </LinearGradient>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >

              {/* Hero Section */}
              <LinearGradient
                colors={['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)']}
                style={styles.heroSection}
              >
                <View style={styles.heroIcon}>
                  <Ionicons name="headset" size={wp(12)} color="#04e1f5" />
                </View>
                <Text style={styles.heroTitle}>How can we help you?</Text>
                <Text style={styles.heroSubtitle}>We're here to assist you 24/7</Text>
              </LinearGradient>

              {/* Quick Actions Grid */}
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction} onPress={() => openPhone('1122')}>
                  <LinearGradient
                    colors={['#DC2626', '#EF4444']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="call" size={wp(6)} color="#fff" />
                    <Text style={styles.quickActionTitle}>Emergency</Text>
                    <Text style={styles.quickActionSub}>1122</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={() => setShowChatModal(true)}>
                  <LinearGradient
                    colors={['#04e1f5', '#0284c7']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="chatbubble" size={wp(6)} color="#fff" />
                    <Text style={styles.quickActionTitle}>Live Chat</Text>
                    <Text style={styles.quickActionSub}>Chat with us</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={() => openEmail('support@sehatline.com')}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="mail" size={wp(6)} color="#fff" />
                    <Text style={styles.quickActionTitle}>Email</Text>
                    <Text style={styles.quickActionSub}>support@sehatline.com</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={() => openPhone('051-111-123-456')}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="call" size={wp(6)} color="#fff" />
                    <Text style={styles.quickActionTitle}>Call Us</Text>
                    <Text style={styles.quickActionSub}>051-111-123-456</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={wp(5)} color="#04e1f5" />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search FAQs..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={wp(4.5)} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Filter */}
              <CategoryFilter />

              {/* FAQ Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 Frequently Asked Questions</Text>
                <Text style={styles.sectionSubtitle}>{filteredFaqs.length} articles found</Text>
                
                {filteredFaqs.map((faq) => (
                  <TouchableOpacity 
                    key={faq.id}
                    style={styles.faqCard}
                    onPress={() => toggleFaq(faq.id)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.35)']}
                      style={styles.faqGradient}
                    >
                      <View style={styles.faqHeader}>
                        <View style={styles.faqIcon}>
                          <Ionicons name="help-circle" size={wp(5)} color="#04e1f5" />
                        </View>
                        <View style={styles.faqContent}>
                          <Text style={styles.faqCategory}>{faq.category}</Text>
                          <Text style={styles.faqQuestion}>{faq.question}</Text>
                        </View>
                        <Ionicons 
                          name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                          size={wp(5)} 
                          color="#64748B" 
                        />
                      </View>
                      
                      {expandedFaq === faq.id && (
                        <View style={styles.faqAnswer}>
                          <View style={styles.divider} />
                          <Text style={styles.answerText}>{faq.answer}</Text>
                          <TouchableOpacity style={styles.helpfulButton}>
                            <Text style={styles.helpfulText}>Was this helpful?</Text>
                            <Ionicons name="thumbs-up" size={wp(3.5)} color="#04e1f5" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Still Need Help */}
              <LinearGradient
                colors={['rgba(4, 225, 245, 0.1)', 'rgba(4, 225, 245, 0.05)']}
                style={styles.needHelpCard}
              >
                <Ionicons name="chatbubbles" size={wp(10)} color="#04e1f5" />
                <Text style={styles.needHelpTitle}>Still Need Help?</Text>
                <Text style={styles.needHelpSub}>Our support team is available 24/7</Text>
                <View style={styles.needHelpButtons}>
                  <TouchableOpacity style={styles.needHelpBtn} onPress={() => setShowChatModal(true)}>
                    <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.needHelpGradient}>
                      <Ionicons name="chatbubble" size={wp(4)} color="#fff" />
                      <Text style={styles.needHelpBtnText}>Live Chat</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.needHelpBtn} onPress={() => openPhone('051-111-123-456')}>
                    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.needHelpGradient}>
                      <Ionicons name="call" size={wp(4)} color="#fff" />
                      <Text style={styles.needHelpBtnText}>Call Us</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>SehatLine v2.0.0 | CDA Healthcare Portal</Text>
                <Text style={styles.footerSub}>Support available 24/7</Text>
              </View>

              <View style={{ height: hp(5) }} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <ChatModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.36)' },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(2),
    borderBottomLeftRadius: wp(6),
    borderBottomRightRadius: wp(6),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  iconBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: wp(5), 
    fontWeight: 'bold',
  },

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  heroSection: {
    marginTop: hp(2),
    marginBottom: hp(2),
    padding: wp(5),
    borderRadius: wp(5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.2)',
  },
  heroIcon: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  heroTitle: {
    color: '#fff',
    fontSize: wp(5),
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  heroSubtitle: {
    color: '#B2DFDB',
    fontSize: wp(3.2),
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: wp(2),
    marginBottom: hp(2.5),
  },
  quickAction: {
    width: (wp(92) - wp(6)) / 2,
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: wp(3.5),
    alignItems: 'center',
    gap: hp(0.5),
  },
  quickActionTitle: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  quickActionSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: wp(2.5),
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginBottom: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
    gap: wp(2.5),
  },
  searchInput: { 
    flex: 1, 
    color: '#fff', 
    fontSize: wp(3.5), 
    paddingVertical: hp(1.5),
  },

  filterContainer: {
    marginBottom: hp(2),
  },
  filterScroll: {
    paddingVertical: hp(0.5),
    gap: wp(2.5),
  },
  filterChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  filterChipActive: {
    backgroundColor: '#04e1f5',
    borderColor: '#04e1f5',
  },
  filterText: {
    color: '#04e1f5',
    fontSize: wp(3),
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },

  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    color: '#fff',
    fontSize: wp(4.2),
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  sectionSubtitle: {
    color: '#d7dbe2',
    fontSize: wp(2.8),
    marginBottom: hp(1.5),
  },

  faqCard: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1),
  },
  faqGradient: {
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.1)',
    borderRadius: wp(3),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
  },
  faqIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContent: {
    flex: 1,
  },
  faqCategory: {
    color: '#04e1f5',
    fontSize: wp(2.3),
    fontWeight: '600',
  },
  faqQuestion: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: '600',
    marginTop: hp(0.2),
  },
  faqAnswer: {
    marginTop: hp(1.5),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    marginBottom: hp(1),
  },
  answerText: {
    color: '#B2DFDB',
    fontSize: wp(3.2),
    lineHeight: wp(4.5),
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: wp(1),
    marginTop: hp(1),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    borderRadius: wp(2),
  },
  helpfulText: {
    color: '#04e1f5',
    fontSize: wp(2.5),
  },

  needHelpCard: {
    borderRadius: wp(4),
    padding: wp(5),
    alignItems: 'center',
    gap: hp(1),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.2)',
  },
  needHelpTitle: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  needHelpSub: {
    color: '#94A3B8',
    fontSize: wp(3),
  },
  needHelpButtons: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(1),
  },
  needHelpBtn: {
    borderRadius: wp(3),
    overflow: 'hidden',
  },
  needHelpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    gap: wp(1.5),
  },
  needHelpBtnText: {
    color: '#fff',
    fontSize: wp(3),
    fontWeight: '600',
  },

  footer: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  footerText: {
    color: '#64748B',
    fontSize: wp(2.8),
  },
  footerSub: {
    color: '#4B5563',
    fontSize: wp(2.5),
    marginTop: hp(0.5),
  },

  // Chat Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#0A1520',
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    height: hp(70),
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4, 225, 245, 0.2)',
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  chatAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatTitle: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  chatStatus: {
    color: '#10B981',
    fontSize: wp(2.5),
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: wp(3),
    gap: hp(1),
  },
  messageRow: {
    flexDirection: 'row',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: wp(3),
    borderRadius: wp(4),
  },
  userBubble: {
    backgroundColor: '#04e1f5',
  },
  botBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  messageText: {
    fontSize: wp(3.2),
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#B2DFDB',
  },
  messageTime: {
    fontSize: wp(2),
    color: '#64748B',
    marginTop: hp(0.3),
    alignSelf: 'flex-end',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: wp(3),
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 225, 245, 0.2)',
    gap: wp(2),
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: wp(5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    color: '#fff',
    fontSize: wp(3.2),
  },
  sendButton: {
    borderRadius: wp(5),
    overflow: 'hidden',
  },
  sendGradient: {
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HelpSupportScreen;