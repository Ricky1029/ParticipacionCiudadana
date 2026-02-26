import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity,
} from "react-native";
import { Card, Title, Paragraph, Button, Chip, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


import { collection, query, orderBy, limit, startAfter, getDocs, doc, updateDoc, increment, setDoc, getDoc, DocumentData, QueryDocumentSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";

import { Proposal, Helix } from "../types";
import { useNavigation } from "@react-navigation/native";
// IMPORTANTE: Importar el tipo de navegación adecuado (asumiendo Stack Navigation)
import { StackNavigationProp } from "@react-navigation/stack";

// 1. Definimos los tipos de nuestras rutas y qué parámetros reciben
type RootStackParamList = {
  Home: undefined; // Home no recibe parámetros
  ProposalDetail: { proposal: Proposal }; // ProposalDetail recibe un objeto 'proposal'
};

// 2. Creamos un tipo específico para la navegación de esta pantalla
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const getHelixColor = (category: Helix): string => {
  const colors = {
    Gobierno: "#410525",
    Academia: "#7B1FA2",
    Empresa: "#43A047",
    Comunidad: "#F57C00",
  };
  return colors[category] || "#757575";
};

const PROPOSALS_PER_PAGE = 10;

export default function HomeScreen() {
  // 3. Le pasamos el tipo al hook useNavigation
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Cargar primeras propuestas
  useEffect(() => {
    loadInitialProposals();
  }, []);

  const loadInitialProposals = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "proposals"),
        orderBy("createdAt", "desc"),
        limit(PROPOSALS_PER_PAGE),
      );

      const snapshot = await getDocs(q);
      const proposalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Proposal[];

      setProposals(proposalsData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PROPOSALS_PER_PAGE);
    } catch (error) {
      console.error("Error al cargar propuestas:", error);
      alert("Error al cargar propuestas");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProposals = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);
      const q = query(
        collection(db, "proposals"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PROPOSALS_PER_PAGE),
      );

      const snapshot = await getDocs(q);
      const newProposals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Proposal[];

      setProposals((prev) => [...prev, ...newProposals]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PROPOSALS_PER_PAGE);
    } catch (error) {
      console.error("Error al cargar más propuestas:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Cargar votos del usuario
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || proposals.length === 0) return;

    const loadUserVotes = async () => {
      const votesSet = new Set<string>();

      for (const proposal of proposals) {
        const voteRef = doc(db, "proposals", proposal.id, "votes", user.uid);
        const voteDoc = await getDoc(voteRef);
        if (voteDoc.exists()) {
          votesSet.add(proposal.id);
        }
      }

      setUserVotes(votesSet);
    };

    loadUserVotes();
  }, [proposals]);

  const handleVote = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión para votar");
        return;
      }

      // Verificar si ya votó
      if (userVotes.has(id)) {
        alert("Ya has votado por esta propuesta");
        return;
      }

      // Crear documento de voto en subcolección
      const voteRef = doc(db, "proposals", id, "votes", user.uid);
      await setDoc(voteRef, {
        userId: user.uid,
        votedAt: new Date(),
      });

      // Incrementar contador de votos
      const proposalRef = doc(db, "proposals", id);
      await updateDoc(proposalRef, {
        votes: increment(1),
      });

      // Actualizar estado local
      setUserVotes((prev) => new Set(prev).add(id));
    } catch (error) {
      console.error("Error al votar:", error);
      alert("Hubo un error al registrar tu voto.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sí, cerrar sesión",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#410525" />
        <Text style={{ marginTop: 10 }}>Cargando propuestas...</Text>
      </View>
    );
  }

  const renderProposal = ({ item: proposal }: { item: Proposal }) => {
    const hasVoted = userVotes.has(proposal.id);

    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate("ProposalDetail", { proposal: proposal })
        }
      >
        {proposal.imageUrls && proposal.imageUrls.length > 0 && (
          <Card.Cover
            source={{ uri: proposal.imageUrls[0] }}
            style={styles.cardImage}
          />
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
            <View style={styles.voteBadge}>
              <MaterialCommunityIcons name="heart" size={16} color="#921051" />
              <Text style={styles.votes}>{proposal.votes || 0}</Text>
            </View>
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
            style={[
              styles.voteButton,
              { backgroundColor: hasVoted ? "#bdbdbd" : "#c8500f" },
            ]}
            icon={hasVoted ? "check" : "thumb-up"}
            disabled={hasVoted}
          >
            {hasVoted ? "Ya votaste" : "Votar"}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderHeader = () => (
    <SafeAreaView
    edges={["top"]}
    style={{ backgroundColor: "#7A1E48" }}
  >
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={{ flex: 1 }}>
          <Title style={styles.title}>ColaboraMX</Title>
          <Paragraph style={styles.subtitle}>
            Conectando Gobierno, Academia, Empresas y Comunidades
          </Paragraph>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={26} color="#f3d9e3" />
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1E88E5" />
        <Text style={{ marginLeft: 10 }}>Cargando más...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.centerContainer}>
      <Text>Aún no hay propuestas. ¡Sé el primero en crear una!</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={proposals}
      renderItem={renderProposal}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={!loading ? renderEmpty : null}
      onEndReached={loadMoreProposals}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={loadInitialProposals}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
   
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#410525",
    marginBottom: 16,
    paddingTop: 30,
    paddingBottom: 35,
    paddingHorizontal: 20,
    backgroundColor:  "#7A1E48",
    

   
  },
  headerContent: {
    flexDirection: "row",
  alignItems: "center",
  },
  logoutButton: {
    padding: 8,
    marginLeft: 10,
  },
  title: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "700",
      letterSpacing: 0.5,
  },
  subtitle: {
      color: "#f3d9e3",
      fontSize: 13,
      marginTop: 6,
      lineHeight: 18,
  },
  card: {
      marginHorizontal: 16,
      marginVertical: 10,
      borderRadius: 22,
      backgroundColor: "#ffffff",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
  },
  cardImage: {
    height: 180,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  votes: {
    fontSize: 16,
    marginLeft: 6,
    color: "#921051",
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#410525",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  actions: {
    justifyContent: "flex-end",
    paddingRight: 8,
    paddingBottom: 8,
  },
  voteButton: {
    borderRadius: 30,
    paddingHorizontal: 14,
    elevation: 2,
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  voteBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fce4ec",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
});
