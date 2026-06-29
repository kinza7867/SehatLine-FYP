import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
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
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');

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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.background, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.content}>
          {/* CENTER — LOGO + TITLE */}
          <View style={styles.centerSection}>
            <View style={styles.logoStack}>
              <Animated.View style={[styles.haloOuter, animatedHaloOuterStyle]} />
              <Animated.View style={[styles.halo, animatedHaloStyle]} />
              <Animated.View style={[styles.logoOuterRing, animatedLogoStyle]}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
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
              <Ionicons name="ribbon-outline" size={SIZES.iconSmall} color={COLORS.primary} />
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
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={SIZES.iconMedium}
                    color={COLORS.white}
                    style={{ marginLeft: SIZES.sm }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.versionText}>SehatLine v2.0  •  Secure & Private</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + SIZES.xs : SIZES.xs,
    paddingHorizontal: SIZES.xl,
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
    borderColor: COLORS.primary,
  },
  halo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  logoOuterRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
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
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 118,
    height: 118,
    resizeMode: 'cover',
  },

  /* TITLE */
  titleGroup: {
    alignItems: 'center',
    marginTop: SIZES.xxl,
  },
  title: {
    color: COLORS.primary,
    fontSize: SIZES.h1 + 10,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleWhite: {
    color: COLORS.text,
    fontWeight: '800',
  },
  dividerLine: {
    width: 50,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    marginVertical: SIZES.md,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: SIZES.body,
    letterSpacing: 1,
    fontWeight: '700',
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: COLORS.accent,
    fontSize: SIZES.small + 0.5,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SIZES.sm,
    paddingHorizontal: SIZES.xxl + 6,
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* BOTTOM */
  bottomSection: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? SIZES.xxl + 6 : SIZES.xl + 2,
  },
  cdaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusXl,
    backgroundColor: 'rgba(115, 170, 184, 0.63)',
    borderWidth: 1,
    borderColor: COLORS.primary + '66',
    marginBottom: SIZES.xl + 2,
  },
  cdaText: {
    color: COLORS.white,
    fontSize: SIZES.small - 0.5,
    marginLeft: SIZES.sm,
    fontWeight: '500',
  },
  cdaHighlight: {
    color: COLORS.secondary,
    fontWeight: '800',
  },
  buttonWrap: {
    width: '80%',
    alignItems: 'center',
  },
  buttonShadow: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    borderRadius: SIZES.radiusXl + 6,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: SIZES.lg,
    borderRadius: SIZES.radiusXl + 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  versionText: {
    marginTop: SIZES.md,
    color: COLORS.accent,
    fontSize: SIZES.xSmall,
    letterSpacing: 1,
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default WelcomeScreen;