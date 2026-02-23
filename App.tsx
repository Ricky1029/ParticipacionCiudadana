import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

// Importación de Pantallas
import HomeScreen from "./src/screens/HomeScreen";
import CreateScreen from "./src/screens/CreateScreen";
import RankingScreen from "./src/screens/RankingScreen";
import ProposalDetailScreen from "./src/screens/ProposalDetailScreen";
import LoginScreen from "./src/screens/LoginScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // <-- CREAMOS EL STACK

// 1. Agrupamos las pestañas en su propio componente
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: string = "circle";

          if (route.name === "Inicio") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Crear") {
            iconName = focused ? "plus-circle" : "plus-circle-outline";
          } else if (route.name === "Ranking") {
            iconName = focused ? "trophy" : "trophy-outline";
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={focused ? 26 : 22}
              color={color}
            />
          );
        },

        tabBarActiveTintColor: "#410525",
        tabBarInactiveTintColor: "#B39AA5",
        headerShown: false,

        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#FFFFFF",
          height: 75 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Crear" component={CreateScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
    </Tab.Navigator>
  );
}

// 2. El App principal ahora usa el Stack Navigator
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Observador de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar hidden={true} />
        {!isAuthenticated ? (
          // Mostrar pantalla de login si no está autenticado
          <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          // Mostrar la app principal si está autenticado
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#410525",
                },
                headerTintColor: "#ffffff",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: 20,
                },
                headerTitleAlign: "left", // o "center"
              }}
            >
              {/* Pantalla base: Las Pestañas (ocultamos el header del stack aquí) */}
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />

              {/* Pantalla sobrepuesta: El Detalle de la Propuesta */}
              <Stack.Screen
                name="ProposalDetail"
                component={ProposalDetailScreen}
                options={{ title: "Detalle de la Propuesta" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
