import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.madebyangel.nexapay",
  appName: "nexapay",
  webDir: "dist",

  plugins: {
    FirebaseAuthentication: {
      providers: ["google.com"],
    },
    StatusBar: {
      style: "DARK", // white icons — matches your dark #0d1825 bg
      backgroundColor: "#0d1825", // your app background color
      overlaysWebView: false, // bars stay solid, content sits below them
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#0d1825", // match your app background
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: false,
    },
  },
};

export default config;
