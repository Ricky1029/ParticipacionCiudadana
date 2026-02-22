import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Menu,
  Text,
  Snackbar,
  IconButton,
  Portal,
  Dialog,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps'; // <-- Importamos el mapa y el marcador

// Firebase imports
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../firebaseConfig'; 

import { Helix } from '../types';

interface CreateScreenProps {
  onCreateProposal?: () => void; 
}

const helices: Helix[] = ['Gobierno', 'Academia', 'Empresa', 'Comunidad'];

export default function CreateScreen({ onCreateProposal }: CreateScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Helix>('Gobierno');
  const [images, setImages] = useState<string[]>([]);
  
  // Simplificamos el estado para guardar solo latitud y longitud
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageDialogVisible, setImageDialogVisible] = useState(false);

  useEffect(() => {
    (async () => {
      // Solicitar permisos de ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        // Unas coordenadas de respaldo por si rechazan el permiso
        setLocation({ latitude: 32.4580, longitude: -114.7320 }); 
        return;
      }
      
      let currentLocation = await Location.getCurrentPositionAsync({});
      // Guardamos la ubicación actual como punto de partida
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Se necesita acceso a la cámara para tomar fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
      setImageDialogVisible(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7, 
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...selectedUris]);
      setImageDialogVisible(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const uploadImagesAndGetUrls = async () => {
    const urls = [];
    for (let i = 0; i < images.length; i++) {
      const uri = images[i];
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `proposals/${Date.now()}_${i}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      urls.push(downloadUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsLoading(true);

    try {
      const imageUrls = await uploadImagesAndGetUrls();
      const user = auth.currentUser;

      const proposalData = {
        title,
        description,
        category,
        imageUrls,
        // Ahora location ya tiene el formato exacto que necesitamos
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
        } : null,
        userId: user ? user.uid : 'anonimo',
        votes: 0,
        createdAt: serverTimestamp(), 
      };

      await addDoc(collection(db, 'proposals'), proposalData);

      setTitle('');
      setDescription('');
      setCategory('Gobierno');
      setImages([]);
      setSnackbarVisible(true);
      
      if (onCreateProposal) onCreateProposal();

    } catch (error) {
      console.error("Error al guardar la propuesta: ", error);
      alert("Hubo un error al guardar tu propuesta.");
    } finally {
      setIsLoading(false);
    }
  };

  // Agregamos una validación para asegurarnos de que el mapa haya cargado una ubicación
  const isFormValid = title.trim().length > 0 && description.trim().length > 0 && location !== null && !isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title style={styles.title}>Nueva Propuesta</Title>
          <Paragraph style={styles.subtitle}>
            Comparte tu idea para mejorar tu comunidad
          </Paragraph>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Título"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="Ej: Proyecto de Reciclaje Comunitario"
            maxLength={100}
            disabled={isLoading}
          />

          <TextInput
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline={true}
            numberOfLines={6}
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu propuesta en detalle..."
            maxLength={500}
            disabled={isLoading}
          />

          <View style={styles.menuContainer}>
            <Text style={styles.label}>Categoría (Hélice)</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                  contentStyle={styles.menuButtonContent}
                  disabled={isLoading}
                >
                  {category} ▼
                </Button>
              }
            >
              {helices.map((helix) => (
                <Menu.Item
                  key={helix}
                  onPress={() => {
                    setCategory(helix);
                    setMenuVisible(false);
                  }}
                  title={helix}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.imageSection}>
            <Button 
              icon="camera" 
              mode="outlined" 
              onPress={() => setImageDialogVisible(true)} 
              disabled={isLoading}
            >
              Agregar Fotos
            </Button>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <IconButton
                    icon="close-circle"
                    size={20}
                    style={styles.removeIcon}
                    iconColor="red"
                    onPress={() => removeImage(index)}
                    disabled={isLoading}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Sección de Mapa Interactivo */}
          <View style={styles.locationContainer}>
             <Text style={styles.label}>
               📍 Ubicación: Toca el mapa para ajustar el marcador
             </Text>
             {location ? (
               <View style={styles.mapWrapper}>
                 <MapView
                   style={styles.map}
                   initialRegion={{
                     latitude: location.latitude,
                     longitude: location.longitude,
                     latitudeDelta: 0.005, // Zoom inicial
                     longitudeDelta: 0.005,
                   }}
                   // Al tocar cualquier parte del mapa, movemos el pin
                   onPress={(e) => setLocation(e.nativeEvent.coordinate)}
                 >
                   <Marker 
                     coordinate={location} 
                     draggable // Permite mantener presionado y arrastrar
                     onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                   />
                 </MapView>
               </View>
             ) : (
               <View style={styles.mapPlaceholder}>
                 <ActivityIndicator size="small" color="#1E88E5" />
                 <Text style={{marginTop: 10, color: '#666'}}>Obteniendo ubicación...</Text>
               </View>
             )}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!isFormValid}
            style={[styles.submitButton, { backgroundColor: isFormValid ? '#1E88E5' : '#ccc' }]}
            contentStyle={styles.submitButtonContent}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : "Publicar Propuesta"}
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={imageDialogVisible} onDismiss={() => setImageDialogVisible(false)}>
          <Dialog.Title>Agregar Imagen</Dialog.Title>
          <Dialog.Content>
            <Text>Selecciona una opción:</Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              icon="camera" 
              onPress={takePhoto}
              mode="contained"
              style={styles.dialogButton}
            >
              Tomar Foto
            </Button>
            <Button 
              icon="image" 
              onPress={pickImage}
              mode="contained"
              style={styles.dialogButton}
            >
              Galería
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        ¡Propuesta creada exitosamente!
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollView: { flex: 1 },
  header: { padding: 20, backgroundColor: '#1E88E5' },
  title: { color: '#FFFFFF', fontSize: 28 },
  subtitle: { color: '#FFFFFF', fontSize: 14, marginTop: 5 },
  form: { padding: 20 },
  input: { marginBottom: 16, backgroundColor: '#FFFFFF' },
  textArea: { minHeight: 120 },
  menuContainer: { marginBottom: 20 },
  label: { fontSize: 16, color: '#666', marginBottom: 8 },
  menuButton: { justifyContent: 'flex-start', backgroundColor: '#FFFFFF' },
  menuButtonContent: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  imageSection: { marginBottom: 20 },
  imageScroll: { marginTop: 10, flexDirection: 'row' },
  imagePreviewContainer: { marginRight: 10, position: 'relative' },
  imagePreview: { width: 80, height: 80, borderRadius: 8 },
  removeIcon: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white' },
  
  // Estilos nuevos para el mapa
  locationContainer: { marginBottom: 20 },
  mapWrapper: {
    height: 200,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    height: 200,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  submitButton: { marginTop: 10, borderRadius: 8 },
  submitButtonContent: { paddingVertical: 8 },
  snackbar: { backgroundColor: '#43A047' },
  dialogActions: { 
    flexDirection: 'column', 
    alignItems: 'stretch',
    gap: 8,
  },
  dialogButton: { 
    marginVertical: 4,
  },
});