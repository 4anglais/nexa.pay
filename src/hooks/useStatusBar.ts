import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

/**
 * Custom hook to manage the status bar and navigation bar appearance.
 * This hook only applies changes on Android native platforms.
 * @param {Object} options - Configuration options for the status bar.
 * @param {string} [options.backgroundColor] - Background color for the status bar.
 * @param {Style} [options.style] - Style for the status bar (DARK or LIGHT).
 * @param {boolean} [options.overlaysWebView] - Whether the status bar overlays the web view.
 * @param {string} [options.navigationBarColor] - Background color for the navigation bar.
 * @param {boolean} [options.navigationBarDarkIcons] - Whether the navigation bar icons are dark.
 */
export const useStatusBar = ({
  backgroundColor = "#0d1825",
  style = "DARK",
  overlaysWebView = false,
  navigationBarColor = "#0d1825",
  navigationBarDarkIcons = false,
}: {
  backgroundColor?: string;
  style?: Style;
  overlaysWebView?: boolean;
  navigationBarColor?: string;
  navigationBarDarkIcons?: boolean;
} = {}) => {
  useEffect(() => {
    // Only apply changes on Android native platforms
    if (Capacitor.getPlatform() !== "android") {
      return;
    }

    const setStatusBar = async () => {
      try {
        // Set status bar appearance
        await StatusBar.setBackgroundColor({ color: backgroundColor });
        await StatusBar.setStyle({ style });
        await StatusBar.setOverlaysWebView({ overlay: overlaysWebView });

        // Set navigation bar appearance (if supported)
        if (navigationBarColor) {
          await StatusBar.setNavigationBarColor({ color: navigationBarColor });
        }

        // Set navigation bar icon color (if supported)
        if (navigationBarDarkIcons) {
          await StatusBar.setNavigationBarDarkIcons({
            isDark: navigationBarDarkIcons,
          });
        }
      } catch (error) {
        console.error("Error setting status bar:", error);
      }
    };

    setStatusBar();

    // Cleanup function to reset the status bar when the component unmounts
    return () => {
      if (Capacitor.getPlatform() === "android") {
        StatusBar.setBackgroundColor({ color: "#0d1825" }).catch(console.error);
        StatusBar.setStyle({ style: "DARK" }).catch(console.error);
        StatusBar.setOverlaysWebView({ overlay: false }).catch(console.error);
      }
    };
  }, [
    backgroundColor,
    style,
    overlaysWebView,
    navigationBarColor,
    navigationBarDarkIcons,
  ]);
};
