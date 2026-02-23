import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { Card, Title, Paragraph, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Importaciones de Firebase
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Asegúrate de que la ruta sea la correcta

import { Proposal, Helix } from "../types";

// Tipos para la navegación (para poder ir a los detalles)
type RootStackParamList = {
  MainTabs: undefined;
  ProposalDetail: { proposal: Proposal };
};
type RankingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

const getHelixColor = (category: Helix): string => {
  const colors = {
    Gobierno: "#410525",
    Academia: "#7B1FA2",
    Empresa: "#43A047",
    Comunidad: "#F57C00",
  };
  return colors[category] || "#757575";
};

const getMedalConfig = (position: number) => {
  if (position === 1) {
    return {
      icon: "crown",
      color: "#FFD700",
      size: 32,
    };
  }
  if (position === 2) {
    return {
      icon: "medal",
      color: "#C0C0C0",
      size: 26,
    };
  }
  if (position === 3) {
    return {
      icon: "medal",
      color: "#CD7F32",
      size: 26,
    };
  }

  return null;
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
      collection(db, "proposals"),
      orderBy("votes", "desc"),
      limit(50),
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
        <ActivityIndicator size="large" color="#410525" />
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
                index === 1 && styles.secondCard,
                index === 2 && styles.thirdCard,
                index === 0 && styles.firstCard,
              ]}
              // Agregamos la navegación al tocar la tarjeta
              onPress={() =>
                navigation.navigate("ProposalDetail", { proposal })
              }
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.leftSection}>
                  {index < 3 ? (
                    <MaterialCommunityIcons
                      name={getMedalConfig(index + 1)?.icon as any}
                      size={getMedalConfig(index + 1)?.size}
                      color={getMedalConfig(index + 1)?.color}
                    />
                  ) : (
                    <Text style={styles.positionNumber}>{index + 1}°</Text>
                  )}
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
                    compact
                  >
                    {proposal.category}
                  </Chip>
                </View>

                <View style={styles.rightSection}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={20}
                    color="#E91E63"
                  />
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
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  header: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: "#410525",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#f3d9e3",
    fontSize: 14,
    marginTop: 6,
  },
  listContainer: {
    padding: 16,
    marginTop: -10,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  topThreeCard: {
    borderWidth: 1,
    borderColor: "#f3d9e3",
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  leftSection: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  middleSection: {
    flex: 1,
    paddingHorizontal: 8,
  },
  proposalTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "bold", // Le agregué negrita para que resalte más
  },
  rightSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
  },
  votes: {
    fontSize: 18,
  },
  votesNumber: {
    fontSize: 18,
    color: "#E91E63",
    marginTop: 2,
    fontWeight: "bold",
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 1,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  firstCard: {
    backgroundColor: "#FFF8E1",
    borderWidth: 2,
    borderColor: "#FFD700",
    elevation: 6,
  },

  secondCard: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#C0C0C0",
  },

  thirdCard: {
    backgroundColor: "#FBE9E7",
    borderWidth: 1,
    borderColor: "#CD7F32",
  },

  positionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#777",
  },
});
