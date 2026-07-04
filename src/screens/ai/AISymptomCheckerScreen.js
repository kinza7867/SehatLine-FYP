import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  FlatList,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ─── Translations ──────────────────────────────────────────────────────────
const translations = {
  en: {
    title: 'Cardiac Symptom Checker',
    subtitle: 'AI-powered heart health assessment',
    greeting: "Hello! I'm HAMI - Your AI Cardiac Health Assistant",
    askSymptoms: 'Select your cardiac symptoms',
    placeholder: 'Describe additional symptoms...',
    analyze: 'Analyze Symptoms',
    analyzing: 'Analyzing...',
    urgency: 'Urgency Level',
    recommendations: 'Recommendations',
    nextSteps: 'Next Steps',
    department: 'Recommended Department',
    bookConsultation: 'Book Cardiology Appointment',
    startOver: 'Start Over',
    emergency: 'EMERGENCY: Call 1122 immediately!',
    privacyNote: 'Your cardiac data is encrypted and securely stored',
    typeResponse: 'Type your response...',
    send: 'Send',
    severity: {
      low: 'Low - Monitor at Home',
      medium: 'Medium - Consult within 48hrs',
      high: 'High - Consult within 24hrs',
      critical: 'CRITICAL - Immediate Care Required',
    },
  },
  ur: {
    title: 'Cardiac Symptom Checker',
    subtitle: 'AI-powered heart health assessment',
    greeting: "Hello! I'm HAMI - Your AI Cardiac Health Assistant",
    askSymptoms: 'Select your cardiac symptoms',
    placeholder: 'Describe additional symptoms...',
    analyze: 'Analyze Symptoms',
    analyzing: 'Analyzing...',
    urgency: 'Urgency Level',
    recommendations: 'Recommendations',
    nextSteps: 'Next Steps',
    department: 'Recommended Department',
    bookConsultation: 'Book Cardiology Appointment',
    startOver: 'Start Over',
    emergency: 'EMERGENCY: Call 1122 immediately!',
    privacyNote: 'Your cardiac data is encrypted and securely stored',
    typeResponse: 'Type your response...',
    send: 'Send',
    severity: {
      low: 'Low - Monitor at Home',
      medium: 'Medium - Consult within 48hrs',
      high: 'High - Consult within 24hrs',
      critical: 'CRITICAL - Immediate Care Required',
    },
  },
};

// ─── CARDIOLOGY SYMPTOMS ──────────────────────────────────────────────────
const cardiacSymptoms = [
  { id: 'chest_pain', label: 'Chest Pain / Discomfort', severity: 'critical' },
  { id: 'chest_pressure', label: 'Chest Pressure / Tightness', severity: 'critical' },
  { id: 'palpitations', label: 'Heart Palpitations', severity: 'high' },
  { id: 'shortness_breath', label: 'Shortness of Breath', severity: 'high' },
  { id: 'dizziness', label: 'Dizziness / Lightheaded', severity: 'high' },
  { id: 'fainting', label: 'Fainting / Near Fainting', severity: 'critical' },
  { id: 'sweating', label: 'Cold Sweating', severity: 'high' },
  { id: 'nausea', label: 'Nausea with Chest Discomfort', severity: 'high' },
  { id: 'arm_pain', label: 'Pain in Left Arm / Jaw', severity: 'critical' },
  { id: 'fatigue', label: 'Unexplained Fatigue', severity: 'medium' },
  { id: 'swelling', label: 'Swelling in Legs / Ankles', severity: 'medium' },
  { id: 'irregular_heartbeat', label: 'Irregular Heartbeat', severity: 'high' },
  { id: 'anxiety', label: 'Anxiety with Heart Symptoms', severity: 'medium' },
  { id: 'cough', label: 'Persistent Cough with Heart Issues', severity: 'medium' },
];

// ─── CARDIOLOGY DISEASE DATABASE ──────────────────────────────────────────
const cardiacDiseaseDatabase = {
  heart_attack: {
    symptoms: ['chest_pain', 'chest_pressure', 'arm_pain', 'shortness_breath', 'sweating', 'nausea'],
    severity: 'critical',
    department: 'Cardiology',
    urgency: 'Immediate',
    description: 'Possible Heart Attack - Seek Emergency Care Immediately!',
    recommendations: [
      'Call 1122 Emergency Services NOW',
      'Seek Immediate Medical Attention',
      'Chew Aspirin (if not allergic)',
      'Stop all activity, sit or lie down',
      'Contact family or emergency contact',
    ],
    counter: 'Cardiac Emergency - Counter 1',
    warning: 'DO NOT DRIVE YOURSELF - Call ambulance',
  },
  angina: {
    symptoms: ['chest_pain', 'chest_pressure', 'arm_pain', 'shortness_breath'],
    severity: 'high',
    department: 'Cardiology',
    urgency: '24 hours',
    description: 'Possible Angina - Reduced blood flow to heart',
    recommendations: [
      'Visit Cardiology Department within 24 hours',
      'Take prescribed nitroglycerin if available',
      'Avoid physical exertion',
      'Bring previous medical records',
    ],
    counter: 'Cardiology OPD - Counter 2',
    warning: 'Rest immediately if pain occurs',
  },
  arrhythmia: {
    symptoms: ['palpitations', 'irregular_heartbeat', 'dizziness', 'fainting'],
    severity: 'high',
    department: 'Cardiology',
    urgency: '24 hours',
    description: 'Possible Arrhythmia - Irregular heart rhythm',
    recommendations: [
      'Schedule Cardiology appointment within 24 hours',
      'ECG/EKG recommended immediately',
      'Keep a log of palpitation episodes',
      'Avoid caffeine and stimulants',
    ],
    counter: 'Cardiology OPD - Counter 3',
    warning: 'Monitor heart rate regularly',
  },
  heart_failure: {
    symptoms: ['shortness_breath', 'swelling', 'fatigue', 'dizziness'],
    severity: 'high',
    department: 'Cardiology',
    urgency: '24 hours',
    description: 'Possible Heart Failure - Reduced pumping function',
    recommendations: [
      'Visit Cardiology within 24 hours',
      'Reduce salt intake immediately',
      'Echocardiogram recommended',
      'Take diuretics as prescribed',
    ],
    counter: 'Cardiology OPD - Counter 4',
    warning: 'Monitor weight daily',
  },
  hypertension: {
    symptoms: ['headache', 'dizziness', 'palpitations', 'fatigue', 'anxiety'],
    severity: 'medium',
    department: 'Cardiology',
    urgency: '48 hours',
    description: 'Possible Hypertension - High blood pressure',
    recommendations: [
      'Schedule appointment within 48 hours',
      'Take prescribed BP medications',
      'Reduce salt intake',
      'Regular BP monitoring recommended',
    ],
    counter: 'Cardiology OPD - Counter 5',
    warning: 'Check BP twice daily',
  },
  cardiomyopathy: {
    symptoms: ['fatigue', 'shortness_breath', 'swelling', 'palpitations'],
    severity: 'high',
    department: 'Cardiology',
    urgency: '24 hours',
    description: 'Possible Cardiomyopathy - Heart muscle disease',
    recommendations: [
      'Visit Cardiology within 24 hours',
      'Echocardiogram and ECG recommended',
      'Follow prescribed medications',
      'Avoid alcohol and smoking',
    ],
    counter: 'Cardiology OPD - Counter 6',
    warning: 'Avoid heavy physical activity',
  },
  pericarditis: {
    symptoms: ['chest_pain', 'fatigue', 'shortness_breath'],
    severity: 'high',
    department: 'Cardiology',
    urgency: '24 hours',
    description: 'Possible Pericarditis - Inflammation of heart lining',
    recommendations: [
      'Visit Cardiology within 24 hours',
      'Anti-inflammatory medications may be needed',
      'Rest and avoid exertion',
      'ECG and blood tests recommended',
    ],
    counter: 'Cardiology OPD - Counter 7',
    warning: 'Pain may worsen when lying down',
  },
};

// ─── Chat state tracking ──────────────────────────────────────────────────
let userAnswers = {
  question1: null, // When symptoms started
  question2: null, // Severity
  question3: null, // Pre-existing conditions
  question4: null, // Medications
};

const AISymptomCheckerScreen = ({ navigation }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [additionalSymptoms, setAdditionalSymptoms] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatCompleted, setChatCompleted] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const flatListRef = useRef(null);

  const t = translations[language];

  // Reset answers when starting new chat
  useEffect(() => {
    userAnswers = {
      question1: null,
      question2: null,
      question3: null,
      question4: null,
    };
  }, [showChat]);

  const aiQuestions = [
    {
      id: 1,
      question: 'When did these cardiac symptoms start? (e.g., yesterday, 2 days ago)',
      type: 'text',
      key: 'question1',
    },
    {
      id: 2,
      question: 'On a scale of 1-10, how severe is the discomfort? (1 = mild, 10 = severe)',
      type: 'scale',
      key: 'question2',
    },
    {
      id: 3,
      question: 'Do you have any existing heart conditions or risk factors? (e.g., diabetes, high BP)',
      type: 'text',
      key: 'question3',
    },
    {
      id: 4,
      question: 'Are you currently taking any heart medications?',
      type: 'text',
      key: 'question4',
    },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (flatListRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) => {
      const exists = prev.find((s) => s.id === symptom.id);
      if (exists) {
        return prev.filter((s) => s.id !== symptom.id);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const removeSymptom = (symptomId) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== symptomId));
  };

  const predictCardiacDisease = (symptomsList) => {
    const symptomIds = symptomsList.map((s) => s.id);
    let bestMatch = null;
    let maxScore = 0;

    for (const [diseaseId, disease] of Object.entries(cardiacDiseaseDatabase)) {
      let score = 0;
      disease.symptoms.forEach((symId) => {
        if (symptomIds.includes(symId)) {
          score += 2;
        }
      });
      symptomsList.forEach((s) => {
        if (s.severity === 'critical' && disease.symptoms.includes(s.id)) {
          score += 3;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = { diseaseId, ...disease, score };
      }
    }

    // Only return if there's a meaningful match (score > 0)
    if (bestMatch && bestMatch.score > 0) {
      return bestMatch;
    }

    return null;
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0 && !additionalSymptoms.trim()) {
      Alert.alert(t.title, 'Please select at least one cardiac symptom');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const allSymptoms = [...selectedSymptoms];
      if (additionalSymptoms.trim()) {
        const extras = additionalSymptoms.split(',').map((s, i) => ({
          id: 'extra_' + i,
          label: s.trim(),
          severity: 'low',
        }));
        allSymptoms.push(...extras);
      }

      // Check for critical symptoms first
      const hasCritical = allSymptoms.some((s) => s.severity === 'critical');
      
      let severity = 'low';
      let department = 'Cardiology';
      let urgency = '72 hours';
      let recommendations = [];
      let diseaseName = '';
      let counter = '';
      let warning = '';
      let description = '';

      // If there are critical symptoms, always set as critical
      if (hasCritical) {
        severity = 'critical';
        department = 'Emergency - Cardiology';
        urgency = 'Immediate';
        recommendations = [
          'Seek immediate medical attention',
          'Call 1122 for emergency services',
          'Do not delay - go to hospital now',
        ];
        warning = 'CRITICAL - DO NOT WAIT';
        description = 'You have selected critical symptoms that require immediate attention.';
      } else {
        // Try to predict disease
        const prediction = predictCardiacDisease(allSymptoms);
        
        if (prediction) {
          severity = prediction.severity;
          department = prediction.department;
          urgency = prediction.urgency;
          recommendations = prediction.recommendations;
          diseaseName = prediction.diseaseId.replace('_', ' ').toUpperCase();
          counter = prediction.counter || 'Cardiology OPD';
          warning = prediction.warning || '';
          description = prediction.description || '';
        } else {
          // No specific disease matched - general cardiac checkup
          const hasHigh = allSymptoms.some((s) => s.severity === 'high');
          const hasMedium = allSymptoms.some((s) => s.severity === 'medium');
          
          if (hasHigh) {
            severity = 'high';
            department = 'Cardiology';
            urgency = '24 hours';
            recommendations = [
              'Visit Cardiology within 24 hours',
              'Bring medical records if available',
              'Consult with a cardiologist',
            ];
          } else if (hasMedium) {
            severity = 'medium';
            department = 'Cardiology';
            urgency = '48 hours';
            recommendations = [
              'Schedule Cardiology appointment within 48 hours',
              'Monitor symptoms closely',
              'Keep a symptom diary',
            ];
          } else {
            severity = 'low';
            department = 'Cardiology - General';
            urgency = '72 hours';
            recommendations = [
              'Monitor your cardiac symptoms',
              'Rest and avoid stress',
              'Schedule a routine checkup',
            ];
          }
        }
      }

      const result = {
        symptoms: allSymptoms,
        additionalSymptoms: additionalSymptoms,
        severity: severity,
        department: department,
        urgency: urgency,
        recommendations: recommendations,
        diseaseName: diseaseName,
        counter: counter,
        warning: warning,
        description: description,
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
      setShowActions(false);

      // Reset answers for new session
      userAnswers = {
        question1: null,
        question2: null,
        question3: null,
        question4: null,
      };

      const greetingMsg = "Hello! I'm HAMI - Your AI Cardiac Health Assistant. I've analyzed your selected symptoms and will ask a few questions for a better assessment.";

      setChatMessages([
        { id: 1, text: greetingMsg, sender: 'ai', time: new Date().toLocaleTimeString() },
        {
          id: 2,
          text: aiQuestions[0].question,
          sender: 'ai',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }, 2000);
  };

  const saveToHistory = async (data) => {
    try {
      const history = await AsyncStorage.getItem('cardiacHistory');
      const parsedHistory = history ? JSON.parse(history) : [];
      parsedHistory.unshift(data);
      await AsyncStorage.setItem('cardiacHistory', JSON.stringify(parsedHistory.slice(0, 20)));
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      text: chatInput,
      sender: 'user',
      time: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    
    const userInput = chatInput.trim();
    setChatInput('');

    // Show typing indicator
    const typingMessage = {
      id: chatMessages.length + 2,
      text: '...',
      sender: 'ai',
      time: new Date().toLocaleTimeString(),
      isTyping: true,
    };
    setChatMessages((prev) => [...prev, typingMessage]);

    setTimeout(() => {
      setChatMessages((prev) => prev.filter((m) => !m.isTyping));

      // Store the user's answer for the current question
      if (currentQuestion < aiQuestions.length) {
        const questionKey = aiQuestions[currentQuestion].key;
        userAnswers[questionKey] = userInput;
      }

      // Check if we've asked all questions
      if (currentQuestion < aiQuestions.length - 1) {
        // Move to next question
        const nextQuestion = aiQuestions[currentQuestion + 1];
        const aiResponse = {
          id: chatMessages.length + 2,
          text: 'Thank you for sharing that. ' + nextQuestion.question,
          sender: 'ai',
          time: new Date().toLocaleTimeString(),
        };
        setChatMessages((prev) => [...prev, aiResponse]);
        setCurrentQuestion((prev) => prev + 1);
      } else if (currentQuestion === aiQuestions.length - 1) {
        // Last question answered - show final analysis
        setChatCompleted(true);
        setShowActions(true);
        
        // Generate final response based on all collected data
        let finalMessage = '';
        
        // Check for critical symptoms
        const hasCritical = selectedSymptoms.some((s) => s.severity === 'critical');
        
        if (hasCritical) {
          finalMessage = '⚠️ EMERGENCY: You have selected critical cardiac symptoms. Please seek immediate medical attention by calling 1122 or visiting the nearest Emergency Department.\n\nDo not delay - your symptoms require urgent care.';
        } else {
          const prediction = predictCardiacDisease(selectedSymptoms);
          
          if (prediction) {
            finalMessage = 'Thank you for sharing all the information.\n\nBased on your symptoms:\n• ' + prediction.description + '\n• Department: ' + prediction.department + '\n• Urgency: ' + prediction.urgency + '\n• Counter: ' + prediction.counter + '\n' + prediction.warning + '\n\nI recommend you schedule a Cardiology appointment as soon as possible.';
          } else {
            // No specific disease matched
            const hasHigh = selectedSymptoms.some((s) => s.severity === 'high');
            const hasMedium = selectedSymptoms.some((s) => s.severity === 'medium');
            
            if (hasHigh) {
              finalMessage = 'Thank you for sharing all the information.\n\nBased on your symptoms, I recommend visiting Cardiology within 24 hours for a thorough evaluation.\n\nPlease monitor your symptoms closely and seek immediate care if they worsen.';
            } else if (hasMedium) {
              finalMessage = 'Thank you for sharing all the information.\n\nBased on your symptoms, I recommend scheduling a Cardiology appointment within 48 hours for a routine checkup.\n\nKeep tracking your symptoms and maintain a healthy lifestyle.';
            } else {
              finalMessage = 'Thank you for sharing all the information.\n\nBased on your symptoms, a general Cardiology checkup is recommended.\n\nPlease monitor your symptoms and consult a doctor if you notice any changes.';
            }
          }
        }
        
        const finalResponse = {
          id: chatMessages.length + 2,
          text: finalMessage,
          sender: 'ai',
          time: new Date().toLocaleTimeString(),
        };
        setChatMessages((prev) => [...prev, finalResponse]);
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 1500);
  };

  const resetEverything = () => {
    setShowChat(false);
    setAnalysisResult(null);
    setChatMessages([]);
    setSelectedSymptoms([]);
    setAdditionalSymptoms('');
    setCurrentQuestion(0);
    setUserResponses([]);
    setChatInput('');
    setChatCompleted(false);
    setShowActions(false);
    userAnswers = {
      question1: null,
      question2: null,
      question3: null,
      question4: null,
    };
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      default: return 'checkmark-circle';
    }
  };

  // ─── Render Dropdown ──────────────────────────────────────────────────────
  const renderDropdown = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setShowDropdown(!showDropdown)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownHeaderText}>
          {selectedSymptoms.length > 0
            ? selectedSymptoms.length + ' symptoms selected'
            : 'Select cardiac symptoms...'}
        </Text>
        <Ionicons
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {cardiacSymptoms.map((symptom) => {
              const isSelected = selectedSymptoms.some((s) => s.id === symptom.id);
              return (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.dropdownItem,
                    isSelected && styles.dropdownItemSelected,
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      isSelected && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {symptom.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={getSeverityColor(symptom.severity)}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {selectedSymptoms.length > 0 && (
        <View style={styles.selectedTags}>
          {selectedSymptoms.map((s) => (
            <View
              key={s.id}
              style={[
                styles.selectedTag,
                { borderColor: getSeverityColor(s.severity) },
              ]}
            >
              <Text style={styles.selectedTagText}>{s.label}</Text>
              <TouchableOpacity onPress={() => removeSymptom(s.id)}>
                <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ─── Render Header ──────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>SehatLine</Text>
                <Text style={styles.headerSub}>Cardiac Symptom Checker</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.headerBtn} onPress={() => setShowLanguageModal(true)}>
              <Ionicons name="language-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  // ─── Render Message ──────────────────────────────────────────────────────
  const renderMessage = ({ item }) => {
    if (item.isTyping) {
      return (
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.typingContainer}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotMiddle]} />
            <View style={[styles.typingDot, styles.typingDotLast]} />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={item.sender === 'user' ? styles.userMessageText : styles.aiMessageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
    );
  };

  // ─── Render Action Buttons ──────────────────────────────────────────────
  const renderActionButtons = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('BookAppointmentScreen', {
              department: analysisResult?.department || 'Cardiology',
            })
          }
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="calendar-outline" size={22} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Book Cardiology Appointment</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonOutlined]}
          onPress={resetEverything}
        >
          <Ionicons name="refresh-outline" size={22} color={COLORS.textSecondary} />
          <Text style={[styles.actionButtonText, { color: COLORS.textSecondary }]}>Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Modals ──────────────────────────────────────────────────────────────
  const LanguageModal = () => (
    <Modal visible={showLanguageModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Language</Text>
          <TouchableOpacity
            style={styles.languageOption}
            onPress={() => { setLanguage('en'); setShowLanguageModal(false); }}
          >
            <Text style={styles.languageText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.languageOption}
            onPress={() => { setLanguage('ur'); setShowLanguageModal(false); }}
          >
            <Text style={styles.languageText}>Urdu</Text>
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
            <Ionicons name="shield-checkmark" size={30} color={COLORS.primary} />
            <Text style={styles.privacyTitle}>Privacy & Security</Text>
          </View>
          <ScrollView>
            <Text style={styles.privacyText}>
              • Your cardiac data is encrypted using AES-256{'\n\n'}
              • All conversations are private and secure{'\n\n'}
              • Data is stored locally on your device{'\n\n'}
              • You can delete your history anytime{'\n\n'}
              • We never share your data with third parties{'\n\n'}
              • Compliant with healthcare data regulations
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.privacyClose} onPress={() => setShowPrivacyModal(false)}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.privacyCloseGradient}>
              <Text style={styles.privacyCloseText}>I Understand</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ─── ROOT ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.15 }}
        style={styles.gradientBackground}
      />

      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {!showChat ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
              {/* AI Avatar */}
              <View style={styles.aiAvatarContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.aiAvatarGradient}
                >
                  <Ionicons name="heart" size={40} color={COLORS.white} />
                </LinearGradient>
                <View style={styles.aiStatus}>
                  <View style={styles.aiStatusDot} />
                  <Text style={styles.aiStatusText}>AI Ready</Text>
                </View>
              </View>

              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>

              {/* Dropdown for Symptoms */}
              {renderDropdown()}

              {/* Additional Symptoms Input */}
              <View style={[styles.inputCard, styles.cardShadow]}>
                <Text style={styles.inputLabel}>Additional Details</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.placeholder}
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                  value={additionalSymptoms}
                  onChangeText={setAdditionalSymptoms}
                  textAlignVertical="top"
                />
              </View>

              {/* Analyze Button */}
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={analyzeSymptoms}
                disabled={loading}
              >
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.analyzeGradient}>
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Ionicons name="analytics-outline" size={24} color={COLORS.white} />
                      <Text style={styles.analyzeButtonText}>{t.analyze}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Security Note */}
              <TouchableOpacity style={styles.securityNote} onPress={() => setShowPrivacyModal(true)}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.securityText}>{t.privacyNote}</Text>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        ) : (
          <View style={styles.chatContainer}>
            {/* Analysis Result Summary */}
            {analysisResult && (
              <View style={[styles.resultSummary, styles.cardShadow]}>
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: getSeverityColor(analysisResult.severity) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getSeverityIcon(analysisResult.severity)}
                    size={18}
                    color={getSeverityColor(analysisResult.severity)}
                  />
                  <Text
                    style={[
                      styles.urgencyText,
                      { color: getSeverityColor(analysisResult.severity) },
                    ]}
                  >
                    {analysisResult.severity === 'critical'
                      ? t.severity.critical
                      : analysisResult.severity === 'high'
                      ? t.severity.high
                      : analysisResult.severity === 'medium'
                      ? t.severity.medium
                      : t.severity.low}
                  </Text>
                </View>
                {analysisResult.diseaseName && (
                  <Text style={styles.resultDisease}>{analysisResult.diseaseName}</Text>
                )}
                {analysisResult.description && (
                  <Text style={styles.resultDescription}>{analysisResult.description}</Text>
                )}
                <Text style={styles.resultDept}>{analysisResult.department}</Text>
                {analysisResult.counter && (
                  <Text style={styles.resultCounter}>{analysisResult.counter}</Text>
                )}
                {analysisResult.warning && (
                  <Text style={styles.resultWarning}>{analysisResult.warning}</Text>
                )}
                {analysisResult.severity === 'critical' && (
                  <Text style={styles.emergencyAlert}>{t.emergency}</Text>
                )}
              </View>
            )}

            {/* Chat Messages */}
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.chatList}
              showsVerticalScrollIndicator={false}
            />

            {/* Chat Input */}
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder={t.typeResponse}
                placeholderTextColor={COLORS.textLight}
                value={chatInput}
                onChangeText={setChatInput}
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.sendGradient}>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Action Buttons - Only shown when chat is completed */}
            {renderActionButtons()}
          </View>
        )}
      </KeyboardAvoidingView>

      <LanguageModal />
      <PrivacyModal />
    </View>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(15),
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
    paddingTop: hp(1),
  },

  animatedContainer: {
    flex: 1,
  },

  cardShadow: { ...SHADOWS.small },

  // ─── Header ────────────────────────────────────────────────────────────
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : (StatusBar.currentHeight || 24) + hp(0.5),
  },
  headerGradient: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2.5),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? hp(1) : hp(0.5),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  headerSub: {
    color: COLORS.white + '70',
    fontSize: wp(2.8),
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // ─── Content ────────────────────────────────────────────────────────────
  aiAvatarContainer: {
    alignItems: 'center',
    marginBottom: hp(1.5),
    position: 'relative',
  },
  aiAvatarGradient: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiStatus: {
    position: 'absolute',
    bottom: 0,
    right: wp(32),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.15),
    borderRadius: 12,
    gap: 4,
  },
  aiStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  aiStatusText: {
    color: COLORS.white,
    fontSize: wp(2),
    fontWeight: 'bold',
  },

  title: {
    fontSize: wp(5.5),
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: hp(0.3),
  },
  subtitle: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: hp(1.5),
  },

  // ─── Dropdown ──────────────────────────────────────────────────────────
  dropdownContainer: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: hp(1),
    ...SHADOWS.small,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
  },
  dropdownHeaderText: {
    fontSize: wp(3.5),
    color: COLORS.text,
  },
  dropdownList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: hp(30),
  },
  dropdownScroll: {
    maxHeight: hp(30),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary + '08',
  },
  dropdownItemText: {
    fontSize: wp(3.2),
    color: COLORS.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(3),
    paddingBottom: hp(0.5),
    gap: 6,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  selectedTagText: {
    fontSize: wp(2.8),
    color: COLORS.text,
  },

  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    color: COLORS.primary,
    fontSize: wp(3.2),
    fontWeight: '600',
    marginBottom: hp(0.3),
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(2),
    padding: wp(2.5),
    color: COLORS.text,
    fontSize: wp(3.5),
    minHeight: hp(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },

  analyzeButton: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1),
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: 10,
  },
  analyzeButtonText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '700',
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: hp(0.3),
  },
  securityText: {
    color: COLORS.textLight,
    fontSize: wp(2.8),
  },

  // ─── Chat ──────────────────────────────────────────────────────────────
  chatContainer: {
    flex: 1,
  },

  resultSummary: {
    backgroundColor: COLORS.white,
    margin: wp(3),
    padding: wp(3.5),
    borderRadius: wp(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: 20,
    marginBottom: hp(0.2),
  },
  urgencyText: {
    fontSize: wp(3),
    fontWeight: 'bold',
  },
  resultDisease: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(0.1),
  },
  resultDescription: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: hp(0.1),
  },
  resultDept: {
    color: COLORS.textSecondary,
    fontSize: wp(3.2),
    marginBottom: hp(0.1),
  },
  resultCounter: {
    color: COLORS.primary,
    fontSize: wp(3),
    fontWeight: '600',
    marginBottom: hp(0.1),
  },
  resultWarning: {
    color: '#EF4444',
    fontSize: wp(3),
    fontWeight: 'bold',
    marginBottom: hp(0.1),
  },
  emergencyAlert: {
    color: '#EF4444',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },

  chatList: {
    padding: wp(3),
    paddingBottom: hp(2),
    flexGrow: 1,
  },

  messageBubble: {
    maxWidth: '80%',
    padding: wp(3),
    borderRadius: wp(4),
    marginBottom: hp(0.5),
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userMessageText: {
    color: COLORS.white,
    fontSize: wp(3.5),
  },
  aiMessageText: {
    color: COLORS.text,
    fontSize: wp(3.5),
  },
  messageTime: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: hp(0.1),
    alignSelf: 'flex-end',
  },

  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.2),
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 0.8,
  },
  typingDotLast: {
    opacity: 1,
  },

  chatInputContainer: {
    flexDirection: 'row',
    padding: wp(3),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 25,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.5),
    color: COLORS.text,
    fontSize: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    marginLeft: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  sendGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Action Buttons ──────────────────────────────────────────────────────
  actionButtonsContainer: {
    padding: wp(3),
    gap: 10,
    paddingBottom: Platform.OS === 'ios' ? hp(3) : hp(1),
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    gap: 10,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  actionButtonOutlined: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: hp(1),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },

  // ─── Modals ──────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: wp(5),
    width: width * 0.8,
    ...SHADOWS.large,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: wp(4),
    fontWeight: 'bold',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  languageOption: {
    paddingVertical: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  languageText: {
    color: COLORS.text,
    fontSize: wp(3.5),
  },
  closeModalBtn: {
    marginTop: hp(1.5),
    paddingVertical: hp(0.8),
    alignItems: 'center',
  },
  closeModalText: {
    color: COLORS.textLight,
    fontSize: wp(3.5),
  },

  privacyModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: wp(5),
    width: width * 0.9,
    maxHeight: height * 0.7,
    ...SHADOWS.large,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: hp(1.5),
    justifyContent: 'center',
  },
  privacyTitle: {
    color: COLORS.text,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  privacyText: {
    color: COLORS.textSecondary,
    fontSize: wp(3.2),
    lineHeight: 24,
    marginBottom: hp(1.5),
  },
  privacyClose: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  privacyCloseGradient: {
    paddingVertical: hp(1),
    alignItems: 'center',
  },
  privacyCloseText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
});

export default AISymptomCheckerScreen;