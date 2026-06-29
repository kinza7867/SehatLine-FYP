import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Dimensions, Platform, StatusBar, SafeAreaView,
  TextInput, Modal, Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../theme';

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
        <View style={[styles.chatContainer, styles.cardShadow]}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.chatHeader}>
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatAvatar}>
                <Ionicons name="chatbubble-outline" size={wp(4.5)} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.chatTitle}>Support Chat</Text>
                <Text style={styles.chatStatus}>Online • Usually replies in minutes</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <Ionicons name="close" size={wp(5.5)} color={COLORS.white} />
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
              placeholderTextColor={COLORS.textSecondary}
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.sendGradient}>
                <Ionicons name="send" size={wp(4)} color={COLORS.white} />
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
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.25 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={{ width: wp(10) }} />
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Ionicons name="headset-outline" size={wp(10)} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSubtitle}>We're here to assist you 24/7</Text>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => openPhone('1122')}>
              <LinearGradient
                colors={[COLORS.danger, '#CC0000']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="call-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Emergency</Text>
                <Text style={styles.quickActionSub}>1122</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => setShowChatModal(true)}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="chatbubble-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Live Chat</Text>
                <Text style={styles.quickActionSub}>Chat with us</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => openEmail('support@sehatline.com')}>
              <LinearGradient
                colors={[COLORS.success, '#059669']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="mail-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Email</Text>
                <Text style={styles.quickActionSub}>support@sehatline.com</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => openPhone('051-111-123-456')}>
              <LinearGradient
                colors={[COLORS.appointment, '#7C3AED']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="call-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Call Us</Text>
                <Text style={styles.quickActionSub}>051-111-123-456</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={wp(4.5)} color={COLORS.textSecondary} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search FAQs..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={wp(4)} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter */}
          <CategoryFilter />

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubtitle}>{filteredFaqs.length} articles found</Text>
            
            {filteredFaqs.map((faq) => (
              <TouchableOpacity 
                key={faq.id}
                style={[styles.faqCard, styles.cardShadow]}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.85}
              >
                <View style={styles.faqContent}>
                  <View style={styles.faqHeader}>
                    <View style={styles.faqIcon}>
                      <Ionicons name="help-circle-outline" size={wp(4.5)} color={COLORS.primary} />
                    </View>
                    <View style={styles.faqInfo}>
                      <Text style={styles.faqCategory}>{faq.category}</Text>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                    </View>
                    <Ionicons 
                      name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                      size={wp(4.5)} 
                      color={COLORS.textSecondary} 
                    />
                  </View>
                  
                  {expandedFaq === faq.id && (
                    <View style={styles.faqAnswer}>
                      <View style={styles.divider} />
                      <Text style={styles.answerText}>{faq.answer}</Text>
                      <TouchableOpacity style={styles.helpfulButton}>
                        <Text style={styles.helpfulText}>Was this helpful?</Text>
                        <Ionicons name="thumbs-up-outline" size={wp(3)} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Still Need Help */}
          <View style={[styles.needHelpCard, styles.cardShadow]}>
            <Ionicons name="chatbubbles-outline" size={wp(8)} color={COLORS.primary} />
            <Text style={styles.needHelpTitle}>Still Need Help?</Text>
            <Text style={styles.needHelpSub}>Our support team is available 24/7</Text>
            <View style={styles.needHelpButtons}>
              <TouchableOpacity style={styles.needHelpBtn} onPress={() => setShowChatModal(true)}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.needHelpGradient}>
                  <Ionicons name="chatbubble-outline" size={wp(3.5)} color={COLORS.white} />
                  <Text style={styles.needHelpBtnText}>Live Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.needHelpBtn} onPress={() => openPhone('051-111-123-456')}>
                <LinearGradient colors={[COLORS.appointment, '#7C3AED']} style={styles.needHelpGradient}>
                  <Ionicons name="call-outline" size={wp(3.5)} color={COLORS.white} />
                  <Text style={styles.needHelpBtnText}>Call Us</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine v2.0.0 | CDA Healthcare Portal</Text>
            <Text style={styles.footerSub}>Support available 24/7</Text>
          </View>

          <View style={{ height: hp(5) }} />
        </ScrollView>
      </SafeAreaView>

      <ChatModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  safeArea: { 
    flex: 1 
  },

  cardShadow: { ...SHADOWS.medium },

  // Header
  headerContainer: {
    paddingBottom: hp(1),
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { 
    color: COLORS.white, 
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
    padding: wp(4),
    borderRadius: wp(4),
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  heroIcon: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: wp(4.5),
    fontWeight: 'bold',
    marginBottom: hp(0.3),
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: wp(2),
    marginBottom: hp(2),
  },
  quickAction: {
    width: (wp(92) - wp(6)) / 2,
    borderRadius: wp(3.5),
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: wp(3),
    alignItems: 'center',
    gap: hp(0.3),
  },
  quickActionTitle: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: 'bold',
  },
  quickActionSub: {
    color: COLORS.white,
    fontSize: wp(2.3),
    opacity: 0.8,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: hp(1.5),
    paddingHorizontal: wp(3.5),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: wp(2),
    ...SHADOWS.small,
  },
  searchInput: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: wp(3.5), 
    paddingVertical: hp(1.2),
  },

  filterContainer: {
    marginBottom: hp(2),
  },
  filterScroll: {
    paddingVertical: hp(0.3),
    gap: wp(2),
  },
  filterChip: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },

  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: wp(4.2),
    fontWeight: 'bold',
    marginBottom: hp(0.3),
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
    marginBottom: hp(1.5),
  },

  faqCard: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqContent: {
    padding: wp(3),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  faqIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqInfo: {
    flex: 1,
  },
  faqCategory: {
    color: COLORS.primary,
    fontSize: wp(2.2),
    fontWeight: '600',
  },
  faqQuestion: {
    color: COLORS.text,
    fontSize: wp(3.2),
    fontWeight: '600',
    marginTop: hp(0.1),
  },
  faqAnswer: {
    marginTop: hp(1),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: hp(0.8),
  },
  answerText: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
    lineHeight: wp(4.5),
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: wp(1),
    marginTop: hp(0.8),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    backgroundColor: COLORS.primary + '10',
    borderRadius: wp(2),
  },
  helpfulText: {
    color: COLORS.primary,
    fontSize: wp(2.3),
  },

  needHelpCard: {
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: 'center',
    gap: hp(0.8),
    marginBottom: hp(2),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  needHelpTitle: {
    color: COLORS.text,
    fontSize: wp(4.2),
    fontWeight: 'bold',
  },
  needHelpSub: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
  },
  needHelpButtons: {
    flexDirection: 'row',
    gap: wp(2.5),
    marginTop: hp(0.5),
  },
  needHelpBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  needHelpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    gap: wp(1.5),
  },
  needHelpBtnText: {
    color: COLORS.white,
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  footer: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
  },
  footerSub: {
    color: COLORS.textLight,
    fontSize: wp(2.5),
    marginTop: hp(0.3),
  },

  // Chat Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    height: hp(70),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(3.5),
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
  },
  chatAvatar: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatTitle: {
    color: COLORS.white,
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  chatStatus: {
    color: COLORS.success,
    fontSize: wp(2.3),
  },
  chatMessages: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  chatMessagesContent: {
    padding: wp(3),
    gap: hp(0.8),
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
    padding: wp(2.5),
    borderRadius: wp(3.5),
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: wp(3),
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: wp(2),
    color: COLORS.textLight,
    marginTop: hp(0.2),
    alignSelf: 'flex-end',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: wp(2.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: wp(2),
    backgroundColor: COLORS.white,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(4),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    color: COLORS.text,
    fontSize: wp(3),
  },
  sendButton: {
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  sendGradient: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HelpSupportScreen;