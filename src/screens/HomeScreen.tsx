import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Text } from 'react-native-paper';
import { Proposal, Helix } from '../types';

interface HomeScreenProps {
  proposals: Proposal[];
  onVote: (id: string) => void;
}

const getHelixColor = (category: Helix): string => {
  const colors = {
    Gobierno: '#1E88E5',
    Academia: '#7B1FA2',
    Empresa: '#43A047',
    Comunidad: '#F57C00',
  };
  return colors[category];
};

export default function HomeScreen({ proposals, onVote }: HomeScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>ColaboraMX</Title>
        <Paragraph style={styles.subtitle}>
          Conectando Gobierno, Academia, Empresas y Comunidades
        </Paragraph>
      </View>

      {proposals.map((proposal) => (
        <Card key={proposal.id} style={styles.card}>
          <Card.Content>
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
              <Text style={styles.votes}>❤️ {proposal.votes}</Text>
            </View>

            <Title style={styles.cardTitle}>{proposal.title}</Title>
            <Paragraph style={styles.description}>
              {proposal.description}
            </Paragraph>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => onVote(proposal.id)}
              style={[styles.voteButton, { backgroundColor: '#43A047' }]}
            >
              Votar
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
