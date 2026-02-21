import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { Proposal, Helix } from '../types';

interface RankingScreenProps {
  proposals: Proposal[];
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

const getMedalEmoji = (position: number): string => {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return `${position}°`;
};

export default function RankingScreen({ proposals }: RankingScreenProps) {
  const sortedProposals = [...proposals].sort((a, b) => b.votes - a.votes);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Ranking</Title>
        <Paragraph style={styles.subtitle}>
          Las propuestas más votadas
        </Paragraph>
      </View>

      <View style={styles.listContainer}>
        {sortedProposals.map((proposal, index) => (
          <Card
            key={proposal.id}
            style={[
              styles.card,
              index < 3 && styles.topThreeCard,
            ]}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.leftSection}>
                <Text style={styles.position}>
                  {getMedalEmoji(index + 1)}
                </Text>
              </View>
              
              <View style={styles.middleSection}>
                <Text style={styles.proposalTitle}>{proposal.title}</Text>
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
                <Text style={styles.votesNumber}>{proposal.votes}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
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

