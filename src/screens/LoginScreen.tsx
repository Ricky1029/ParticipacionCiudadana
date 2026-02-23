import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { TextInput, Button, Title, Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      Alert.alert("Error", "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Éxito", "Cuenta creada exitosamente");
      onLoginSuccess();
    } catch (error: any) {
      console.error("Error al registrarse:", error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "Este email ya está registrado");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "Email inválido");
      } else {
        Alert.alert("Error", "No se pudo crear la cuenta");
      }
    } finally {
      setLoading(false);
    }
  };

  const fadeAnim = useState(new Animated.Value(1))[0];

  const toggleMode = () => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 150,
    useNativeDriver: true,
  }).start(() => {
    // 👇 El cambio ocurre cuando ya desapareció
    setIsRegisterMode((prev) => !prev);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  });
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="vote" size={80} color="#ffffff" />
          <Title style={styles.title}>Participación Ciudadana</Title>
          <Text style={styles.subtitle}>
            {isRegisterMode
              ? "Crear una cuenta"
              : "Inicia sesión para continuar"}
          </Text>
        </View>


        <Card style={styles.card}>
          <Animated.View style={{ opacity: fadeAnim }}>
          <Card.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              activeOutlineColor="#921051"
              outlineColor="#d8c3cc"
              left={<TextInput.Icon icon="email" color="#921051" />}
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              activeOutlineColor="#921051"
              outlineColor="#d8c3cc"
              left={<TextInput.Icon icon="lock" color="#921051"/>}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#921051"
                />
              }
              style={styles.input}
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={isRegisterMode ? handleRegister : handleLogin}
              loading={loading}
              disabled={loading}
              buttonColor={isRegisterMode ? "#c8500f" : "#410525"}
              textColor="#ffffff"
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {isRegisterMode ? "Registrarse" : "Iniciar Sesión"}
            </Button>

            <Button
              mode="text"
              textColor="#921051"
              onPress={toggleMode}
              disabled={loading}
              style={styles.switchButton}
            >
              {isRegisterMode
                ? "¿Ya tienes una cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </Button>
          </Card.Content>
          </Animated.View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#410525",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    padding: 20,
  },
  header: {
    alignItems: "center",
  marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#f3d9e3",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    borderRadius: 24,
  paddingVertical: 20,
  elevation: 8,
  backgroundColor: "#ffffff",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  switchButton: {
    marginTop: 4,
  },
});
