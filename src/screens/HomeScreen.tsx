import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Text } from 'react-native-paper';

// Importaciones de Firebase
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 

import { Proposal, Helix } from '../types';
import { useNavigation } from '@react-navigation/native';
// IMPORTANTE: Importar el tipo de navegación adecuado (asumiendo Stack Navigation)
import { StackNavigationProp } from '@react-navigation/stack'; 

// 1. Definimos los tipos de nuestras rutas y qué parámetros reciben
type RootStackParamList = {
  Home: undefined; // Home no recibe parámetros
  ProposalDetail: { proposal: Proposal }; // ProposalDetail recibe un objeto 'proposal'
};

// 2. Creamos un tipo específico para la navegación de esta pantalla
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const getHelixColor = (category: Helix): string => {
  const colors = {
    Gobierno: '#1E88E5',
    Academia: '#7B1FA2',
    Empresa: '#43A047',
    Comunidad: '#F57C00',
  };
  return colors[category] || '#757575';
};

export default function HomeScreen() {
  // 3. Le pasamos el tipo al hook useNavigation
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (el resto de tu lógica de useEffect y handleVote se queda IGUAL)
  useEffect(() => {
    const q = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const proposalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Proposal[]; 
      
      setProposals(proposalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleVote = async (id: string) => {
    try {
      const proposalRef = doc(db, 'proposals', id);
      await updateDoc(proposalRef, {
        votes: increment(1)
      });
    } catch (error) {
      console.error("Error al votar:", error);
      alert("Hubo un error al registrar tu voto.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={{ marginTop: 10 }}>Cargando propuestas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>ColaboraMX</Title>
        <Paragraph style={styles.subtitle}>
          Conectando Gobierno, Academia, Empresas y Comunidades
        </Paragraph>
      </View>

      {proposals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text>Aún no hay propuestas. ¡Sé el primero en crear una!</Text>
        </View>
      ) : (
        proposals.map((proposal) => (
          <Card 
            key={proposal.id} 
            style={styles.card} 
            // ¡Esta línea ya la tenías bien! TypeScript ahora la entenderá.
            onPress={() => navigation.navigate('ProposalDetail', { proposal: proposal })}
          >
            {proposal.imageUrls && proposal.imageUrls.length > 0 && (
              <Card.Cover source={{ uri: proposal.imageUrls[0] }} style={styles.cardImage} />
            )}
            
            <Card.Content style={{ paddingTop: 10 }}>
              <View style={styles.cardHeader}>
                <Chip
                  style={[
                    styles.chip,
                    { backgroundColor: getHelixColor(proposal.category) },
                  ]}
                  textStyle={styles.chipText}
                >
                  {proposal.category}
                </Chip>
                <Text style={styles.votes}>❤️ {proposal.votes || 0}</Text>
              </View>

              <Title style={styles.cardTitle}>{proposal.title}</Title>
              <Paragraph style={styles.description}>
                {proposal.description}
              </Paragraph>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button
                mode="contained"
                onPress={() => handleVote(proposal.id)}
                style={[styles.voteButton, { backgroundColor: '#43A047' }]}
                icon="thumb-up"
              >
                Votar
              </Button>
            </Card.Actions>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
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
  card: {
    margin: 12,
    overflow: 'hidden', // Para que la imagen respete los bordes curvos de la tarjeta
  },
  cardImage: {
    height: 150,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  votes: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    justifyContent: 'flex-end',
    paddingRight: 8,
    paddingBottom: 8,
  },
  voteButton: {
    borderRadius: 8,
  },
});