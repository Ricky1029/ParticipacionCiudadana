import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Menu,
  Text,
  Snackbar,
} from 'react-native-paper';
import { Helix } from '../types';

interface CreateScreenProps {
  onCreateProposal: (
    title: string,
    description: string,
    category: Helix
  ) => void;
}

const helices: Helix[] = ['Gobierno', 'Academia', 'Empresa', 'Comunidad'];

export default function CreateScreen({ onCreateProposal }: CreateScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Helix>('Gobierno');
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    onCreateProposal(title, description, category);
    setTitle('');
    setDescription('');
    setCategory('Gobierno');
    setSnackbarVisible(true);
  };

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

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

          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!isFormValid}
            style={[styles.submitButton, { backgroundColor: '#1E88E5' }]}
            contentStyle={styles.submitButtonContent}
          >
            Publicar Propuesta
          </Button>
        </View>
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1E88E5',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 120,
  },
  menuContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  menuButton: {
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  menuButtonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  snackbar: {
    backgroundColor: '#43A047',
  },
});
