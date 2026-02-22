import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importaciones de Firebase
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Asegúrate de que la ruta sea la correcta

import { Proposal, Helix } from '../types';

// Tipos para la navegación (para poder ir a los detalles)
type RootStackParamList = {
  MainTabs: undefined;
  ProposalDetail: { proposal: Proposal };
};
type RankingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const getHelixColor = (category: Helix): string => {
  const colors = {
    Gobierno: '#1E88E5',
    Academia: '#7B1FA2',
    Empresa: '#43A047',
    Comunidad: '#F57C00',
  };
  return colors[category] || '#757575';
};

const getMedalEmoji = (position: number): string => {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return `${position}°`;
};

// Ya no necesitamos recibir props
export default function RankingScreen() {
  const navigation = useNavigation<RankingScreenNavigationProp>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consultamos la colección ordenada directamente por "votes" de mayor a menor (desc)
    // Limitamos a las top 50 propuestas para mejor rendimiento
    const q = query(
      collection(db, 'proposals'), 
      orderBy('votes', 'desc'),
      limit(50)
    );

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={{ marginTop: 10 }}>Cargando ranking...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Ranking</Title>
        <Paragraph style={styles.subtitle}>
          Las propuestas más votadas
        </Paragraph>
      </View>

      <View style={styles.listContainer}>
        {proposals.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text>Aún no hay propuestas para mostrar en el ranking.</Text>
          </View>
        ) : (
          proposals.map((proposal, index) => (
            <Card
              key={proposal.id}
              style={[
                styles.card,
                index < 3 && styles.topThreeCard,
              ]}
              // Agregamos la navegación al tocar la tarjeta
              onPress={() => navigation.navigate('ProposalDetail', { proposal })}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.leftSection}>
                  <Text style={styles.position}>
                    {getMedalEmoji(index + 1)}
                  </Text>
                </View>
                
                <View style={styles.middleSection}>
                  <Text style={styles.proposalTitle} numberOfLines={2}>
                    {proposal.title}
                  </Text>
                  <Chip
                    style={[
                      styles.chip,
                      { backgroundColor: getHelixColor(proposal.category) },
                    ]}
                    textStyle={styles.chipText}
                  >
                    {proposal.category}
                  </Chip>
                </View>
                
                <View style={styles.rightSection}>
                  <Text style={styles.votes}>❤️</Text>
                  <Text style={styles.votesNumber}>{proposal.votes || 0}</Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
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
  listContainer: {
    padding: 12,
  },
  card: {
    marginBottom: 12,
  },
  topThreeCard: {
    backgroundColor: '#FFF9E6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leftSection: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  position: {
    fontSize: 28,
  },
  middleSection: {
    flex: 1,
    paddingHorizontal: 8,
  },
  proposalTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: 'bold', // Le agregué negrita para que resalte más
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  votes: {
    fontSize: 20,
  },
  votesNumber: {
    fontSize: 18,
    color: '#E91E63',
    marginTop: 4,
    fontWeight: 'bold', // Le agregué negrita para que resalte más
  },
  chip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});