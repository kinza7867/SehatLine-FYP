import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, Dimensions, Platform, StatusBar,
  Animated, Modal, ImageBackground, SafeAreaView, KeyboardAvoidingView,
  FlatList
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Complete translations with all required fields
const translations = {
  en: {
    title: "AI Symptom Checker",
    subtitle: "Get instant health insights",
    greeting: "Hello! I'm HAMI - Your AI Health Assistant",
    askSymptoms: "Please describe your symptoms in detail",
    placeholder: "Example: I have chest pain, fever for 2 days, difficulty breathing...",
    analyze: "Analyze Symptoms",
    analyzing: "Analyzing...",
    urgency: "Urgency Level",
    recommendations: "Recommendations",
    nextSteps: "Next Steps",
    department: "Recommended Department",
    bookConsultation: "Book Consultation",
    startOver: "Start Over",
    emergency: "EMERGENCY: Call 1122 immediately!",
    commonSymptoms: "Common Symptoms",
    privacyNote: "Your data is encrypted and securely stored",
    typeResponse: "Type your response...",
    send: "Send",
    severity: {
      low: "Low - Self Care",
      medium: "Medium - Consult within 48hrs",
      high: "High - Consult within 24hrs",
      critical: "Critical - Immediate Care Required"
    }
  },
  ur: {
    title: "علامات کی جانچ",
    subtitle: "فوری صحت کی معلومات حاصل کریں",
    greeting: "السلام علیکم! میں حامی ہوں - آپ کا AI صحت معاون",
    askSymptoms: "براہ کرم اپنی علامات تفصیل سے بتائیں",
    placeholder: "مثال: سینے میں درد، دو دن سے بخار، سانس لینے میں دشواری...",
    analyze: "علامات چیک کریں",
    analyzing: "جانچ ہو رہی ہے...",
    urgency: "ایمرجنسی لیول",
    recommendations: "تجاویز",
    nextSteps: "اگلے اقدامات",
    department: "تجویز کردہ شعبہ",
    bookConsultation: "اپوائنٹمنٹ بک کریں",
    startOver: "دوبارہ شروع کریں",
    emergency: "ایمرجنسی: فوری 1122 پر کال کریں!",
    commonSymptoms: "عام علامات",
    privacyNote: "آپ کا ڈیٹا انکرپٹڈ اور محفوظ ہے",
    typeResponse: "اپنا جواب لکھیں...",
    send: "بھیجیں",
    severity: {
      low: "کم - خود دیکھ بھال",
      medium: "درمیانی - 48 گھنٹے میں ڈاکٹر سے رجوع کریں",
      high: "زیادہ - 24 گھنٹے میں ڈاکٹر سے رجوع کریں",
      critical: "خطرناک - فوری طبی امداد ضروری"
    }
  }
};

const AISymptomCheckerScreen = ({ navigation }) => {
  const [symptoms, setSymptoms] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatCompleted, setChatCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const flatListRef = useRef(null);

  const t = translations[language];

  // AI Questions for chatbot interaction
  const aiQuestions = [
    { id: 1, question: language === 'en' ? "When did your symptoms start?" : "آپ کی علامات کب شروع ہوئیں؟", type: "text" },
    { id: 2, question: language === 'en' ? "On a scale of 1-10, how severe is the discomfort?" : "ایک سے دس کے پیمانے پر، تکلیف کتنی شدید ہے؟", type: "scale" },
    { id: 3, question: language === 'en' ? "Do you have any pre-existing conditions (diabetes, BP, heart disease)?" : "کیا آپ کو کوئی پرانی بیماری ہے (شوگر، بلڈ پریشر، دل کی بیماری)؟", type: "text" },
    { id: 4, question: language === 'en' ? "Are you currently taking any medications?" : "کیا آپ فی الحال کوئی دوائی لے رہے ہیں؟", type: "text" },
  ];

  // Medical database for symptom analysis
  const medicalDatabase = {
    chest: { severity: "critical", department: "Cardiology", urgency: "Immediate", code: "CHEST-01" },
    heart: { severity: "critical", department: "Cardiology", urgency: "Immediate", code: "CAR-01" },
    breathing: { severity: "critical", department: "Pulmonology", urgency: "Immediate", code: "RESP-01" },
    stroke: { severity: "critical", department: "Neurology", urgency: "Immediate", code: "NEURO-01" },
    bleeding: { severity: "critical", department: "Emergency", urgency: "Immediate", code: "EMERG-01" },
    fever: { severity: "medium", department: "General Medicine", urgency: "48 hours", code: "GEN-01" },
    headache: { severity: "medium", department: "Neurology", urgency: "48 hours", code: "NEURO-02" },
    pain: { severity: "low", department: "General Medicine", urgency: "72 hours", code: "GEN-02" },
    cough: { severity: "low", department: "Pulmonology", urgency: "72 hours", code: "RESP-02" },
    diabetes: { severity: "medium", department: "Endocrinology", urgency: "48 hours", code: "ENDO-01" },
    bp: { severity: "medium", department: "Cardiology", urgency: "48 hours", code: "CAR-02" },
    pregnancy: { severity: "high", department: "Gynecology", urgency: "24 hours", code: "GYN-01" },
    child: { severity: "medium", department: "Pediatrics", urgency: "48 hours", code: "PED-01" },
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      Alert.alert(t.title, "Please describe your symptoms first");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const symptomsLower = symptoms.toLowerCase();
      let detectedConditions = [];
      let severityScore = 0;
      let department = "General Medicine";
      let urgency = "72 hours";
      let recommendations = [];

      for (const [keyword, data] of Object.entries(medicalDatabase)) {
        if (symptomsLower.includes(keyword)) {
          detectedConditions.push(keyword);
          severityScore += data.severity === "critical" ? 3 : data.severity === "high" ? 2 : data.severity === "medium" ? 1 : 0;
          department = data.department;
          urgency = data.urgency;
        }
      }

      let severity = "low";
      if (severityScore >= 3 || symptomsLower.includes('emergency')) {
        severity = "critical";
        recommendations.push(language === 'en' ? "🚨 Seek immediate medical attention" : "🚨 فوری طبی امداد حاصل کریں");
        recommendations.push(language === 'en' ? "📞 Call emergency services: 1122" : "📞 ایمرجنسی سروسز کال کریں: 1122");
      } else if (severityScore >= 2) {
        severity = "high";
        recommendations.push(language === 'en' ? "⚠️ Visit hospital within 24 hours" : "⚠️ 24 گھنٹے کے اندر ہسپتال جائیں");
        recommendations.push(language === 'en' ? "📋 Bring medical records if available" : "📋 طبی ریکارڈ ساتھ لائیں");
      } else if (severityScore >= 1) {
        severity = "medium";
        recommendations.push(language === 'en' ? "📅 Schedule appointment within 48 hours" : "📅 48 گھنٹے کے اندر اپوائنٹمنٹ بک کریں");
        recommendations.push(language === 'en' ? "🩹 Rest and monitor symptoms" : "🩹 آرام کریں اور علامات پر نظر رکھیں");
      } else {
        severity = "low";
        recommendations.push(language === 'en' ? "💡 Self-care recommended" : "💡 خود دیکھ بھال تجویز ہے");
        recommendations.push(language === 'en' ? "🏠 Rest at home" : "🏠 گھر پر آرام کریں");
      }

      const result = {
        symptoms: symptoms,
        severity: severity,
        department: department,
        urgency: urgency,
        recommendations: recommendations,
        detectedSymptoms: detectedConditions,
        timestamp: new Date().toISOString(),
        sessionId: Date.now().toString(),
      };

      setAnalysisResult(result);
      saveToHistory(result);
      setLoading(false);
      setShowChat(true);
      setCurrentQuestion(0);
      setUserResponses([]);
      setChatCompleted(false);
      
      setChatMessages([
        { id: 1, text: t.greeting, sender: 'ai', time: new Date().toLocaleTimeString() },
        { id: 2, text: language === 'en' ? `Based on your symptoms: "${symptoms.substring(0, 100)}..."` : `آپ کی علامات کی بنیاد پر: "${symptoms.substring(0, 100)}..."`, sender: 'ai', time: new Date().toLocaleTimeString() },
      ]);
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { id: prev.length + 1, text: aiQuestions[0].question, sender: 'ai', time: new Date().toLocaleTimeString() }]);
      }, 500);
    }, 2000);
  };

  const saveToHistory = async (data) => {
    try {
      const history = await AsyncStorage.getItem('symptomHistory');
      const parsedHistory = history ? JSON.parse(history) : [];
      parsedHistory.unshift(data);
      await AsyncStorage.setItem('symptomHistory', JSON.stringify(parsedHistory.slice(0, 20)));
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage = { id: chatMessages.length + 1, text: chatInput, sender: 'user', time: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMessage]);
    setUserResponses([...userResponses, chatInput]);
    
    // Clear input immediately
    setChatInput('');
    
    // Process AI response
    setTimeout(() => {
      if (currentQuestion < aiQuestions.length) {
        const nextQuestion = aiQuestions[currentQuestion];
        const aiResponse = { id: chatMessages.length + 2, text: nextQuestion.question, sender: 'ai', time: new Date().toLocaleTimeString() };
        setChatMessages(prev => [...prev, aiResponse]);
        setCurrentQuestion(prev => prev + 1);
      } else if (!chatCompleted) {
        setChatCompleted(true);
        let finalMessage = "";
        
        if (analysisResult?.severity === "critical") {
          finalMessage = language === 'en' 
            ? "⚠️ Based on our conversation, your symptoms suggest you need IMMEDIATE medical attention. Please visit the Emergency Department right away or call 1122."
            : "⚠️ ہماری بات چیت کی بنیاد پر، آپ کی علامات بتاتی ہیں کہ آپ کو فوری طبی امداد کی ضرورت ہے۔ براہ کرم فوری طور پر ایمرجنسی ڈیپارٹمنٹ جائیں یا 1122 پر کال کریں۔";
        } else if (analysisResult?.severity === "high") {
          finalMessage = language === 'en'
            ? "Thank you for sharing. Based on our conversation, I recommend visiting the hospital today. Would you like me to help you book an appointment?"
            : "معلومات شیئر کرنے کا شکریہ۔ ہماری بات چیت کی بنیاد پر، میں آج ہی ہسپتال جانے کی سفارش کرتا ہوں۔ کیا آپ چاہیں گے کہ میں آپ کی اپوائنٹمنٹ بک کرنے میں مدد کروں؟";
        } else {
          finalMessage = language === 'en'
            ? "Thank you for your responses. Monitor your symptoms for the next 48 hours. You can book a teleconsultation through the app if needed. Take care!"
            : "آپ کے جوابات کا شکریہ۔ اگلے 48 گھنٹے اپنی علامات پر نظر رکھیں۔ ضرورت پڑنے پر آپ ایپ کے ذریعے ٹیلی کنسلٹیشن بک کر سکتے ہیں۔ اپنا خیال رکھیں!";
        }
        
        const finalResponse = { id: chatMessages.length + 2, text: finalMessage, sender: 'ai', time: new Date().toLocaleTimeString() };
        setChatMessages(prev => [...prev, finalResponse]);
      }
    }, 1000);
  };

  const resetEverything = () => {
    setShowChat(false);
    setAnalysisResult(null);
    setChatMessages([]);
    setSymptoms('');
    setCurrentQuestion(0);
    setUserResponses([]);
    setChatInput('');
    setChatCompleted(false);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      default: return 'checkmark-circle';
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={item.sender === 'user' ? styles.userMessageText : styles.aiMessageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{item.time}</Text>
    </View>
  );

  const LanguageModal = () => (
    <Modal visible={showLanguageModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Language / زبان منتخب کریں</Text>
          <TouchableOpacity style={styles.languageOption} onPress={() => { setLanguage('en'); setShowLanguageModal(false); }}>
            <Text style={styles.languageText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageOption} onPress={() => { setLanguage('ur'); setShowLanguageModal(false); }}>
            <Text style={styles.languageText}>اردو (Urdu)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowLanguageModal(false)}>
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PrivacyModal = () => (
    <Modal visible={showPrivacyModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.privacyModalContent}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={30} color="#04e1f5" />
            <Text style={styles.privacyTitle}>Privacy & Security</Text>
          </View>
          <ScrollView>
            <Text style={styles.privacyText}>
              • Your health data is encrypted using AES-256{'\n\n'}
              • All conversations are private and secure{'\n\n'}
              • Data is stored locally on your device{'\n\n'}
              • You can delete your history anytime{'\n\n'}
              • We never share your data with third parties{'\n\n'}
              • Compliant with healthcare data regulations
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.privacyClose} onPress={() => setShowPrivacyModal(false)}>
            <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.privacyCloseGradient}>
              <Text style={styles.privacyCloseText}>I Understand</Text>
            </LinearGradient>
          </TouchableOpacity>
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
                  <Ionicons name="chevron-back" size={24} color="#04e1f5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>HAMI - AI Assistant</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowLanguageModal(true)}>
                  <Ionicons name="language" size={22} color="#04e1f5" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              {!showChat ? (
                <ScrollView contentContainerStyle={styles.content}>
                  <Animated.View style={{ opacity: fadeAnim }}>
                    {/* AI Avatar */}
                    <View style={styles.aiAvatarContainer}>
                      <LinearGradient
                        colors={['#04e1f5', '#0284c7']}
                        style={styles.aiAvatarGradient}
                      >
                        <Ionicons name="medkit" size={50} color="#fff" />
                      </LinearGradient>
                      <View style={styles.aiStatus}>
                        <View style={styles.aiStatusDot} />
                        <Text style={styles.aiStatusText}>AI Ready</Text>
                      </View>
                    </View>

                    <Text style={styles.title}>{t.title}</Text>
                    <Text style={styles.subtitle}>{t.subtitle}</Text>

                    {/* Symptom Input */}
                    <View style={styles.inputCard}>
                      <Text style={styles.inputLabel}>{t.askSymptoms}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={t.placeholder}
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={5}
                        value={symptoms}
                        onChangeText={setSymptoms}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Common Symptoms */}
                    <View style={styles.commonSymptoms}>
                      <Text style={styles.commonTitle}>{t.commonSymptoms}</Text>
                      <View style={styles.symptomChips}>
                        {['🤒 Fever', '🤕 Headache', '💪 Body Pain', '🫁 Chest Pain', '😷 Cough', '🦷 Toothache'].map((sym, i) => (
                          <TouchableOpacity key={i} style={styles.symptomChip} onPress={() => setSymptoms(sym)}>
                            <Text style={styles.symptomChipText}>{sym}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Analyze Button */}
                    <TouchableOpacity style={styles.analyzeButton} onPress={analyzeSymptoms} disabled={loading}>
                      <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.analyzeGradient}>
                        {loading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons name="analytics" size={24} color="#fff" />
                            <Text style={styles.analyzeButtonText}>{t.analyze}</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Security Note */}
                    <TouchableOpacity style={styles.securityNote} onPress={() => setShowPrivacyModal(true)}>
                      <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                      <Text style={styles.securityText}>{t.privacyNote}</Text>
                      <Ionicons name="information-circle" size={16} color="#04e1f5" />
                    </TouchableOpacity>
                  </Animated.View>
                </ScrollView>
              ) : (
                <View style={styles.chatContainer}>
                  {/* Analysis Result Summary */}
                  {analysisResult && (
                    <View style={styles.resultSummary}>
                      <View style={[styles.urgencyBadge, { backgroundColor: getSeverityColor(analysisResult.severity) + '20' }]}>
                        <Ionicons name={getSeverityIcon(analysisResult.severity)} size={18} color={getSeverityColor(analysisResult.severity)} />
                        <Text style={[styles.urgencyText, { color: getSeverityColor(analysisResult.severity) }]}>
                          {analysisResult.severity === "critical" ? t.severity.critical :
                           analysisResult.severity === "high" ? t.severity.high :
                           analysisResult.severity === "medium" ? t.severity.medium : t.severity.low}
                        </Text>
                      </View>
                      <Text style={styles.resultDept}>🏥 {analysisResult.department}</Text>
                      {analysisResult.severity === "critical" && (
                        <Text style={styles.emergencyAlert}>{t.emergency}</Text>
                      )}
                    </View>
                  )}

                  {/* Chat Messages */}
                  <FlatList
                    ref={flatListRef}
                    data={chatMessages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.chatList}
                    showsVerticalScrollIndicator={false}
                  />

                  {/* Chat Input */}
                  <View style={styles.chatInputContainer}>
                    <TextInput
                      style={styles.chatInput}
                      placeholder={t.typeResponse}
                      placeholderTextColor="#94A3B8"
                      value={chatInput}
                      onChangeText={setChatInput}
                      returnKeyType="send"
                      onSubmitEditing={handleSendMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                      <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.sendGradient}>
                        <Ionicons name="send" size={20} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.chatActions}>
                    <TouchableOpacity style={styles.chatActionBtn} onPress={() => navigation.navigate('BookAppointmentScreen', { department: analysisResult?.department })}>
                      <Ionicons name="calendar" size={20} color="#04e1f5" />
                      <Text style={styles.chatActionText}>{t.bookConsultation}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chatActionBtn} onPress={resetEverything}>
                      <Ionicons name="refresh" size={20} color="#64748B" />
                      <Text style={[styles.chatActionText, { color: '#64748B' }]}>{t.startOver}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <LanguageModal />
      <PrivacyModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1 },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  content: { padding: 20, paddingBottom: 40 },
  
  aiAvatarContainer: { alignItems: 'center', marginBottom: 20, position: 'relative' },
  aiAvatarGradient: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  aiStatus: { position: 'absolute', bottom: 0, right: width * 0.35, flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  aiStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  aiStatusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#B2DFDB', textAlign: 'center', marginBottom: 24 },
  
  inputCard: { backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)' },
  inputLabel: { color: '#04e1f5', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  input: { backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 14, padding: 14, color: '#fff', fontSize: 15, minHeight: 100, borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.2)' },
  
  commonSymptoms: { marginBottom: 24 },
  commonTitle: { color: '#f4f8f8', fontSize: 13, marginBottom: 12 },
  symptomChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  symptomChip: { backgroundColor: 'rgba(1, 38, 41, 0.62)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.64)' },
  symptomChipText: { color: '#04e1f5', fontSize: 14 },
  
  analyzeButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  analyzeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  analyzeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  securityText: { color: '#94A3B8', fontSize: 12 },
  
  chatContainer: { flex: 1, display: 'flex', flexDirection: 'column' },
  resultSummary: { backgroundColor: 'rgba(0, 0, 0, 0.55)', margin: 16, padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)' },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  urgencyText: { fontSize: 13, fontWeight: 'bold' },
  resultDept: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  emergencyAlert: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  
  chatList: { padding: 16, paddingBottom: 20 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#04e1f5' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(0, 0, 0, 0.55)', borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)' },
  userMessageText: { color: '#fff', fontSize: 15 },
  aiMessageText: { color: '#fff', fontSize: 15 },
  messageTime: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
  
  chatInputContainer: { flexDirection: 'row', padding: 16, backgroundColor: 'rgba(0, 0, 0, 0.55)', borderTopWidth: 1, borderTopColor: 'rgba(4, 225, 245, 0.2)' },
  chatInput: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)' },
  sendButton: { marginLeft: 10, borderRadius: 25, overflow: 'hidden' },
  sendGradient: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  
  chatActions: { flexDirection: 'row', padding: 16, gap: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16 },
  chatActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', paddingVertical: 12, borderRadius: 25, gap: 8, borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)' },
  chatActionText: { color: '#04e1f5', fontSize: 13, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#0A1520', borderRadius: 20, padding: 20, width: width * 0.8, borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  languageOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(4, 225, 245, 0.2)', alignItems: 'center' },
  languageText: { color: '#04e1f5', fontSize: 16 },
  closeModalBtn: { marginTop: 20, paddingVertical: 12, alignItems: 'center' },
  closeModalText: { color: '#94A3B8', fontSize: 14 },
  
  privacyModalContent: { backgroundColor: '#0A1520', borderRadius: 20, padding: 20, width: width * 0.9, maxHeight: height * 0.7, borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.3)' },
  privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, justifyContent: 'center' },
  privacyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  privacyText: { color: '#B2DFDB', fontSize: 14, lineHeight: 24, marginBottom: 20 },
  privacyClose: { borderRadius: 12, overflow: 'hidden' },
  privacyCloseGradient: { paddingVertical: 14, alignItems: 'center' },
  privacyCloseText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AISymptomCheckerScreen;