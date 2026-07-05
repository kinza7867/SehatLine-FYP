import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Dimensions, Platform, StatusBar, SafeAreaView,
  TextInput, Modal, Linking, Keyboard, KeyboardAvoidingView,
  TouchableWithoutFeedback, Animated, ActivityIndicator, FlatList
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
    { id: 1, text: "👋 Welcome to SehatLine Support! How can I help you today?", sender: 'bot', time: 'Just now' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  
  const flatListRef = useRef(null);
  const chatInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSending, setIsSending] = useState(false);

  // ✅ Quick Reply Options
  const quickReplies = [
    { id: '1', text: '📅 Book Appointment', icon: 'calendar-outline' },
    { id: '2', text: '🎫 Token System', icon: 'ticket-outline' },
    { id: '3', text: '📄 Medical Reports', icon: 'document-text-outline' },
    { id: '4', text: '🔑 Password Help', icon: 'key-outline' },
    { id: '5', text: '👨‍👩‍👧‍👦 Family Hub', icon: 'people-outline' },
    { id: '6', text: '💬 Talk to Agent', icon: 'person-outline' },
  ];

  const faqs = [
    { 
      id: 1,
      question: "How do I book an appointment?", 
      answer: "You can book an appointment by:\n\n1️⃣ Go to the 'Book Appointment' tab\n2️⃣ Select your preferred doctor\n3️⃣ Choose available time slot\n4️⃣ Confirm your booking\n\n📱 You'll receive a confirmation notification immediately.\n\n💡 Tip: You can also book appointments through the 'Quick Actions' on the home screen.",
      category: "Appointments"
    },
    { 
      id: 2,
      question: "How does AI Symptom Checker work?", 
      answer: "🤖 Our AI Symptom Checker (HAMI) works by:\n\n1️⃣ You describe your symptoms\n2️⃣ AI analyzes against medical database\n3️⃣ Provides severity assessment\n4️⃣ Recommends department\n5️⃣ Generates priority token if needed\n\n⚠️ Note: Always consult a real doctor for final diagnosis. The AI is for preliminary guidance only.",
      category: "AI Features"
    },
    { 
      id: 3,
      question: "How to add family members?", 
      answer: "👨‍👩‍👧‍👦 Add family members to your account:\n\n1️⃣ Go to 'Family Health Hub'\n2️⃣ Tap 'Add New Member'\n3️⃣ Enter their details (name, age, relation)\n4️⃣ Link medical records\n5️⃣ Manage appointments for them\n\n✅ You can add up to 10 family members.",
      category: "Family Hub"
    },
    { 
      id: 4,
      question: "How do I view my medical reports?", 
      answer: "📄 View your medical reports:\n\n1️⃣ Go to 'Medical Records'\n2️⃣ Select report type (Lab/Imaging)\n3️⃣ Filter by date\n4️⃣ Tap to view/download\n5️⃣ Share with doctor via app\n\n📊 Reports are available for 2 years.",
      category: "Medical Records"
    },
    { 
      id: 5,
      question: "What is the cancellation policy?", 
      answer: "📋 Cancellation Policy:\n\n✅ Free cancellation up to 2 hours before appointment\n⏰ 50% charge for late cancellation\n❌ No-show fees apply\n🔄 Reschedule anytime for free\n🚨 Emergency cases exempted\n\n📞 For urgent cancellations, call 051-111-123-456.",
      category: "Policies"
    },
    { 
      id: 6,
      question: "How secure is my health data?", 
      answer: "🔒 Your data security is our priority:\n\n✅ AES-256 encryption\n✅ HIPAA compliant\n✅ Two-factor authentication\n✅ Regular security audits\n✅ Your data never shared with third parties\n\n🛡️ All data is stored on secure servers in Pakistan.",
      category: "Security"
    },
    { 
      id: 7,
      question: "How do I reset my password?", 
      answer: "🔑 Reset your password:\n\n1️⃣ Tap 'Forgot Password' on login screen\n2️⃣ Enter registered email address\n3️⃣ Check OTP in your email\n4️⃣ Create new password (minimum 8 characters)\n5️⃣ Login with new credentials\n\n📧 If you don't receive OTP, check spam folder.",
      category: "Account"
    },
    { 
      id: 8,
      question: "How to use the digital token system?", 
      answer: "🎫 Digital Token System:\n\n1️⃣ Generate token from home screen\n2️⃣ View token in 'My Token' section\n3️⃣ Track live queue status\n4️⃣ Get notified when your turn arrives\n5️⃣ Present token at the counter\n\n✅ Tokens are valid for same day only.",
      category: "Appointments"
    },
    { 
      id: 9,
      question: "How do I share my reports with a doctor?", 
      answer: "📤 Sharing reports with doctors:\n\n1️⃣ Open report in 'Medical Records'\n2️⃣ Tap 'Share' button\n3️⃣ Select doctor from list\n4️⃣ Add optional notes\n5️⃣ Confirm sharing\n\n👨‍⚕️ The doctor will receive your reports instantly.",
      category: "Medical Records"
    },
  ];

  const categories = ['All', 'Appointments', 'AI Features', 'Family Hub', 'Medical Records', 'Policies', 'Security', 'Account'];

  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ✅ Send Message Function
  const sendMessage = (messageText) => {
    const text = messageText || chatMessage.trim();
    if (!text || isSending) return;
    
    setIsSending(true);
    setShowQuickReplies(false);
    
    setChatHistory(prev => [...prev, { 
      id: prev.length + 1, 
      text: text, 
      sender: 'user', 
      time: 'Just now' 
    }]);
    setChatMessage('');
    setIsTyping(true);
    
    scrollToBottom();
    
    // Auto-reply based on keywords
    setTimeout(() => {
      setIsTyping(false);
      let reply = "Thank you for your message. Our support team will assist you shortly.";
      
      const lowerMsg = text.toLowerCase();
      if (lowerMsg.includes('appointment') || lowerMsg.includes('book')) {
        reply = "📅 **Book Appointment**\n\nHere's how:\n\n1️⃣ Go to 'Book Appointment' tab\n2️⃣ Select your preferred doctor\n3️⃣ Choose available time slot\n4️⃣ Confirm booking\n\n✅ You'll receive confirmation immediately.\n\nWould you like to book now?";
      } else if (lowerMsg.includes('token') || lowerMsg.includes('queue')) {
        reply = "🎫 **Token System**\n\nSteps:\n\n1️⃣ Generate token from home\n2️⃣ View in 'My Token'\n3️⃣ Track live queue\n4️⃣ Get notified when it's your turn\n\n📱 Your token number will be displayed on screen.";
      } else if (lowerMsg.includes('report') || lowerMsg.includes('result')) {
        reply = "📄 **Medical Reports**\n\nHow to view:\n\n1️⃣ Go to 'Medical Records'\n2️⃣ Select report type\n3️⃣ View or download\n4️⃣ Share with doctor\n\n📊 All reports are securely stored.";
      } else if (lowerMsg.includes('password') || lowerMsg.includes('login')) {
        reply = "🔑 **Password Help**\n\nReset your password:\n\n1️⃣ Tap 'Forgot Password'\n2️⃣ Enter email\n3️⃣ Check OTP\n4️⃣ Create new password\n\n📧 Check spam folder if OTP not received.";
      } else if (lowerMsg.includes('family') || lowerMsg.includes('member')) {
        reply = "👨‍👩‍👧‍👦 **Family Hub**\n\nAdd family members:\n\n1️⃣ Go to 'Family Health Hub'\n2️⃣ Tap 'Add New Member'\n3️⃣ Enter details\n4️⃣ Manage their health\n\n✅ Add up to 10 family members.";
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        reply = "👋 **Hello!** Welcome to SehatLine Support.\n\nI can help you with:\n• 📅 Appointments\n• 🎫 Tokens\n• 📄 Reports\n• 🔑 Password\n• 👨‍👩‍👧‍👦 Family Hub\n\nJust type what you need help with!";
      } else if (lowerMsg.includes('thanks') || lowerMsg.includes('thank')) {
        reply = "🙏 **You're welcome!**\n\nWe're always here to help. If you need anything else, just let me know.\n\n💬 Type 'help' to see all options.";
      } else if (lowerMsg.includes('help')) {
        reply = "💡 **How can I help?**\n\nChoose a topic:\n• 📅 Book Appointment\n• 🎫 Token System\n• 📄 Medical Reports\n• 🔑 Password Help\n• 👨‍👩‍👧‍👦 Family Hub\n\nJust type your question or tap a quick reply below!";
      } else {
        reply = "💬 **Got it!**\n\nI'll connect you with a support agent shortly. Meanwhile, you can:\n\n1️⃣ Check our FAQs below\n2️⃣ Use quick replies\n3️⃣ Call us at 051-111-123-456\n\nIs there anything specific you'd like help with?";
      }
      
      setChatHistory(prev => [...prev, {
        id: prev.length + 1,
        text: reply,
        sender: 'bot',
        time: 'Just now'
      }]);
      
      setIsSending(false);
      scrollToBottom();
      
      // Show quick replies again after bot response
      setTimeout(() => {
        setShowQuickReplies(true);
      }, 500);
    }, 1000);
  };

  // ✅ Handle Quick Reply Press
  const handleQuickReply = (text) => {
    setShowQuickReplies(false);
    sendMessage(text);
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

  // ✅ Render Chat Item
  const renderChatItem = ({ item }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userMessageRow : styles.botMessageRow]}>
      {item.sender === 'bot' && (
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubble" size={wp(3.5)} color={COLORS.primary} />
        </View>
      )}
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
    </View>
  );

  // ✅ Render Quick Replies
  const renderQuickReplies = () => {
    if (!showQuickReplies) return null;
    
    return (
      <View style={styles.quickRepliesContainer}>
        <Text style={styles.quickRepliesTitle}>💡 Quick Replies</Text>
        <View style={styles.quickRepliesGrid}>
          {quickReplies.map((reply) => (
            <TouchableOpacity
              key={reply.id}
              style={styles.quickReplyChip}
              onPress={() => handleQuickReply(reply.text)}
            >
              <Ionicons name={reply.icon} size={wp(3.5)} color={COLORS.primary} />
              <Text style={styles.quickReplyText}>{reply.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ✅ Chat Modal
  const ChatModal = () => (
    <Modal 
      visible={showChatModal} 
      transparent 
      animationType="slide"
      onRequestClose={() => setShowChatModal(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.chatContainer}>
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
              <View style={styles.chatHeaderActions}>
                <TouchableOpacity 
                  style={styles.chatHeaderAction}
                  onPress={() => {
                    setChatHistory([
                      { id: 1, text: "👋 Welcome to SehatLine Support! How can I help you today?", sender: 'bot', time: 'Just now' }
                    ]);
                    setShowQuickReplies(true);
                  }}
                >
                  <Ionicons name="refresh-outline" size={wp(4.5)} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowChatModal(false)}>
                  <Ionicons name="close" size={wp(5.5)} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            <FlatList
              ref={flatListRef}
              data={chatHistory}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.chatMessages}
              contentContainerStyle={styles.chatMessagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
              ListFooterComponent={
                <>
                  {isTyping && (
                    <View style={styles.typingIndicator}>
                      <Text style={styles.typingText}>Support is typing...</Text>
                    </View>
                  )}
                  {renderQuickReplies()}
                </>
              }
            />
            
            <View style={styles.chatInputContainer}>
              <TextInput
                ref={chatInputRef}
                style={styles.chatInput}
                placeholder="Type your message..."
                placeholderTextColor={COLORS.textSecondary}
                value={chatMessage}
                onChangeText={setChatMessage}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
              />
              <TouchableOpacity 
                style={[styles.sendButton, (!chatMessage.trim() || isSending) && styles.sendButtonDisabled]} 
                onPress={() => sendMessage()}
                disabled={!chatMessage.trim() || isSending}
              >
                <LinearGradient 
                  colors={[COLORS.primary, COLORS.secondary]} 
                  style={styles.sendGradient}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons name="send" size={wp(4)} color={COLORS.white} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
        <View style={styles.headerContainer}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={{ width: wp(10) }} />
          </View>
        </View>

        <Animated.ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={{ opacity: fadeAnim }}
        >
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Ionicons name="headset-outline" size={wp(10)} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSubtitle}>We're here to assist you</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => setShowChatModal(true)}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.quickActionGradient}>
                <Ionicons name="chatbubble-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Live Chat</Text>
                <Text style={styles.quickActionSub}>Chat with us</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => openEmail('support@sehatline.com')}>
              <LinearGradient colors={[COLORS.success, '#059669']} style={styles.quickActionGradient}>
                <Ionicons name="mail-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Email</Text>
                <Text style={styles.quickActionSub}>support@sehatline.com</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => openPhone('051-111-123-456')}>
              <LinearGradient colors={[COLORS.appointment, '#7C3AED']} style={styles.quickActionGradient}>
                <Ionicons name="call-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Call Us</Text>
                <Text style={styles.quickActionSub}>051-111-123-456</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickAction, styles.cardShadow]} onPress={() => navigation.navigate('ContactScreen')}>
              <LinearGradient colors={[COLORS.warning, '#D97706']} style={styles.quickActionGradient}>
                <Ionicons name="location-outline" size={wp(5)} color={COLORS.white} />
                <Text style={styles.quickActionTitle}>Visit Us</Text>
                <Text style={styles.quickActionSub}>CDA Hospital</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

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

          <CategoryFilter />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubtitle}>{filteredFaqs.length} articles found</Text>
            
            {filteredFaqs.map((faq) => (
              <TouchableOpacity 
                key={faq.id}
                style={[styles.faqCard, styles.cardShadow, expandedFaq === faq.id && styles.faqCardExpanded]}
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
                      <View style={styles.helpfulContainer}>
                        <TouchableOpacity style={styles.helpfulButton}>
                          <Text style={styles.helpfulText}>👍 Helpful</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.helpfulButton}>
                          <Text style={styles.helpfulText}>👎 Not Helpful</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.needHelpCard, styles.cardShadow]}>
            <Ionicons name="chatbubbles-outline" size={wp(8)} color={COLORS.primary} />
            <Text style={styles.needHelpTitle}>Still Need Help?</Text>
            <Text style={styles.needHelpSub}>Our support team is available</Text>
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

          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine v2.0.0 | CDA Healthcare Portal</Text>
            <Text style={styles.footerSub}>Support available</Text>
          </View>

          <View style={{ height: hp(5) }} />
        </Animated.ScrollView>
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
  faqCardExpanded: {
    borderColor: COLORS.primary + '40',
    borderWidth: 1.5,
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
  helpfulContainer: {
    flexDirection: 'row',
    gap: wp(2),
    marginTop: hp(0.8),
  },
  helpfulButton: {
    paddingHorizontal: wp(2.5),
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
    height: hp(75),
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
  chatHeaderActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  chatHeaderAction: {
    padding: wp(1),
  },
  chatMessages: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  chatMessagesContent: {
    padding: wp(3),
    gap: hp(0.8),
    paddingBottom: wp(4),
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(2),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(1.5),
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
    lineHeight: wp(4),
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
  typingIndicator: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.3),
  },
  typingText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.6),
    fontStyle: 'italic',
  },
  quickRepliesContainer: {
    paddingHorizontal: wp(1),
    paddingTop: hp(0.5),
  },
  quickRepliesTitle: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginBottom: hp(0.5),
    fontWeight: '500',
  },
  quickRepliesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(1.5),
  },
  quickReplyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: wp(1),
    ...SHADOWS.small,
  },
  quickReplyText: {
    fontSize: wp(2.5),
    color: COLORS.primary,
    fontWeight: '500',
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
    maxHeight: hp(10),
  },
  sendButton: {
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HelpSupportScreen;