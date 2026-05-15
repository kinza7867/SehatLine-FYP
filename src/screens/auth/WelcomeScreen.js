import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const BRAND = '#04e1f5';
const BRAND_DEEP = '#06a5f5';
const DARK_BG = '#0A1520';


const WelcomeScreen = ({ navigation }) => {
  // Gentle animation values
  const fadeIn = useSharedValue(0);
  const logoTranslate = useSharedValue(20);
  const titleTranslate = useSharedValue(20);
  const cdaTranslate = useSharedValue(20);
  const buttonTranslate = useSharedValue(20);
  const haloPulse = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    fadeIn.value = withTiming(1, { duration: 900, easing: ease });
    logoTranslate.value = withTiming(0, { duration: 900, easing: ease });

    titleTranslate.value = withDelay(
      300,
      withTiming(0, { duration: 800, easing: ease })
    );
    cdaTranslate.value = withDelay(
      650,
      withTiming(0, { duration: 800, easing: ease })
    );
    buttonTranslate.value = withDelay(
      900,
      withTiming(0, { duration: 800, easing: ease })
    );

    // Soft halo breathing
    haloPulse.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: logoTranslate.value }],
  }));

  const animatedHaloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(haloPulse.value, [0, 1], [0.2, 0.5]),
    transform: [{ scale: interpolate(haloPulse.value, [0, 1], [1, 1.08]) }],
  }));

  const animatedHaloOuterStyle = useAnimatedStyle(() => ({
    opacity: interpolate(haloPulse.value, [0, 1], [0.12, 0.3]),
    transform: [{ scale: interpolate(haloPulse.value, [0, 1], [1.05, 1.18]) }],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: titleTranslate.value }],
  }));

  const animatedCdaStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: cdaTranslate.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: buttonTranslate.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.content}>
          {/* CENTER — LOGO + TITLE */}
          <View style={styles.centerSection}>
            <View style={styles.logoStack}>
              <Animated.View style={[styles.haloOuter, animatedHaloOuterStyle]} />
              <Animated.View style={[styles.halo, animatedHaloStyle]} />
              <Animated.View style={[styles.logoOuterRing, animatedLogoStyle]}>
                <LinearGradient
                  colors={[BRAND, BRAND_DEEP]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradientRing}
                >
                  <View style={styles.logoInnerCircle}>
                    <Image
                      source={require('../../../assets/logo.png')}
                      style={styles.logoImage}
                    />
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* TITLE */}
            <Animated.View style={[styles.titleGroup, animatedTitleStyle]}>
              <Text style={styles.title}>
                SEHAT<Text style={styles.titleWhite}>LINE</Text>
              </Text>
              <View style={styles.dividerLine} />
              <Text style={styles.subtitle}>Your Health, One Tap Away</Text>
              <Text style={styles.description}>
                A gentle companion for your everyday healthcare needs.
              </Text>
            </Animated.View>
          </View>

          {/* BOTTOM — CDA + BUTTON */}
          <View style={styles.bottomSection}>
            <Animated.View style={[styles.cdaBadge, animatedCdaStyle]}>
              <Ionicons name="ribbon-outline" size={14} color={BRAND} />
              <Text style={styles.cdaText}>
                In association with{' '}
                <Text style={styles.cdaHighlight}>CDA Hospital, Islamabad</Text>
              </Text>
            </Animated.View>

            <Animated.View style={[styles.buttonWrap, animatedButtonStyle]}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.buttonShadow}
                onPress={() => navigation.replace('Login')}
              >
                <LinearGradient
                  colors={[BRAND, BRAND_DEEP]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginLeft: 10 }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.versionText}>SehatLine v2.0  •  Secure & Private</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  backgroundImage: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingHorizontal: 24,
  },

  /* CENTER — LOGO + TITLE */
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* LOGO STACK */
  logoStack: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: BRAND,
  },
  halo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: BRAND,
  },
  logoOuterRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  logoGradientRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  logoInnerCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Logo image now fills the white circle so there's no big empty space around it
  logoImage: {
    width: 118,
    height: 118,
    resizeMode: 'cover',
  },

  /* TITLE */
  titleGroup: {
    alignItems: 'center',
    marginTop: 28,
  },
  title: {
    color: BRAND,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleWhite: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dividerLine: {
    width: 50,
    height: 3,
    backgroundColor: BRAND,
    borderRadius: 2,
    marginVertical: 12,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: '#e8f7f9',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 30,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* BOTTOM */
  bottomSection: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 22,
  },
  cdaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 21, 32, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.4)',
    marginBottom: 22,
  },
  cdaText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    marginLeft: 8,
    fontWeight: '500',
  },
  cdaHighlight: {
    color: BRAND,
    fontWeight: '800',
  },
  buttonWrap: {
    width: '80%',
    alignItems: 'center',
  },
  buttonShadow: {
    width: '100%',
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    borderRadius: 30,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  versionText: {
    marginTop: 14,
    color: '#cfeef3',
    fontSize: 10,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default WelcomeScreen;