import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Title, Paragraph, Chip, Text, Divider, Button, TextInput, Avatar } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

// Nuevas importaciones de Firebase
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; // Ajusta la ruta a tu config

import { Proposal, Helix } from '../types';

const getHelixColor = (category: Helix): string => {
  const colors = {
    Gobierno: '#1E88E5',
    Academia: '#7B1FA2',
    Empresa: '#43A047',
    Comunidad: '#F57C00',
  };
  return colors[category] || '#757575';
};

const { width } = Dimensions.get('window');

// Interfaz para los comentarios
interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: any;
}

export default function ProposalDetailScreen({ route }) {
  // Inicializamos la propuesta con los datos que nos llegan, pero la guardamos en un estado
  // para poder actualizar visualmente el contador de votos de inmediato
  const [proposal, setProposal] = useState<Proposal>(route.params.proposal);
  
  // Estados para los comentarios
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Verificar si el usuario ya votó
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const checkVote = async () => {
      const voteRef = doc(db, 'proposals', proposal.id, 'votes', user.uid);
      const voteDoc = await getDoc(voteRef);
      setHasVoted(voteDoc.exists());
    };

    checkVote();
  }, [proposal.id]);

  // Escuchar los comentarios en tiempo real
  useEffect(() => {
    // Apuntamos a la subcolección 'comments' dentro de esta propuesta específica
    const commentsRef = collection(db, 'proposals', proposal.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [proposal.id]);

  // Función para votar (Apoyar)
  const handleVote = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Debes iniciar sesión para votar');
        return;
      }

      // Verificar si ya votó
      if (hasVoted) {
        alert('Ya has votado por esta propuesta');
        return;
      }

      // Crear documento de voto en subcolección
      const voteRef = doc(db, 'proposals', proposal.id, 'votes', user.uid);
      await setDoc(voteRef, {
        userId: user.uid,
        votedAt: new Date(),
      });

      // Incrementar contador de votos
      const proposalRef = doc(db, 'proposals', proposal.id);
      await updateDoc(proposalRef, {
        votes: increment(1)
      });

      // Actualizamos el estado local
      setProposal(prev => ({ 
        ...prev, 
        votes: (prev.votes || 0) + 1
      }));
      setHasVoted(true);
    } catch (error) {
      console.error("Error al votar:", error);
      alert("Hubo un error al registrar tu apoyo.");
    }
  };

  // Función para agregar un comentario
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      const commentsRef = collection(db, 'proposals', proposal.id, 'comments');
      
      await addDoc(commentsRef, {
        text: newComment.trim(),
        userId: user ? user.uid : 'Ciudadano Anónimo',
        createdAt: serverTimestamp(),
      });

      setNewComment(''); // Limpiamos el input
    } catch (error) {
      console.error("Error al comentar:", error);
      alert("No se pudo enviar el comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView>
        {/* Carrusel de Imágenes */}
        {proposal.imageUrls && proposal.imageUrls.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
            {proposal.imageUrls.map((url, index) => (
              <Image key={index} source={{ uri: url }} style={styles.image} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>Sin imágenes</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Chip style={[styles.chip, { backgroundColor: getHelixColor(proposal.category) }]} textStyle={styles.chipText}>
              {proposal.category}
            </Chip>
            <Text style={styles.votes}>❤️ {proposal.votes || 0} Votos</Text>
          </View>

          <Title style={styles.title}>{proposal.title}</Title>
          <Paragraph style={styles.description}>{proposal.description}</Paragraph>

          {/* Botón de Apoyo */}
          <Button 
            mode="contained" 
            icon={hasVoted ? "check" : "heart"}
            onPress={handleVote} 
            style={[styles.supportButton, hasVoted && { backgroundColor: '#9E9E9E' }]}
            contentStyle={{ paddingVertical: 8 }}
            disabled={hasVoted}
          >
            {hasVoted ? '¡Ya apoyaste esta propuesta!' : '¡Apoyo la propuesta!'}
          </Button>

          <Divider style={styles.divider} />

          {/* Sección del Mapa */}
          <Title style={styles.sectionTitle}>Ubicación</Title>
          {proposal.location ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: proposal.location.latitude,
                  longitude: proposal.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: proposal.location.latitude,
                    longitude: proposal.location.longitude,
                  }}
                  title={proposal.title}
                />
              </MapView>
            </View>
          ) : (
            <Text style={styles.noLocationText}>Esta propuesta no tiene una ubicación registrada.</Text>
          )}

          <Divider style={styles.divider} />

          {/* SECCIÓN DE COMENTARIOS */}
          <Title style={styles.sectionTitle}>Comentarios ({comments.length})</Title>
          
          <View style={styles.commentInputContainer}>
            <TextInput
              mode="outlined"
              label="Escribe un comentario..."
              value={newComment}
              onChangeText={setNewComment}
              style={styles.commentInput}
              multiline
              disabled={isSubmitting}
            />
            <Button 
              mode="contained" 
              onPress={handleAddComment} 
              disabled={!newComment.trim() || isSubmitting}
              style={styles.commentButton}
            >
              Enviar
            </Button>
          </View>

          <View style={styles.commentsList}>
            {comments.length === 0 ? (
              <Text style={styles.noCommentsText}>Sé el primero en comentar.</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentBubble}>
                  <View style={styles.commentHeader}>
                    <Avatar.Icon size={24} icon="account" style={{ backgroundColor: '#1E88E5' }} />
                    <Text style={styles.commentAuthor}>
                      {comment.userId === 'anonimo' ? 'Ciudadano Anónimo' : 'Ciudadano'}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))
            )}
          </View>
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  image: { width: width, height: 250, resizeMode: 'cover' },
  noImageContainer: { width: width, height: 200, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: '#757575' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  chip: { height: 28 },
  chipText: { color: '#FFFFFF', fontSize: 12 },
  votes: { fontSize: 16, color: '#E91E63', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, lineHeight: 30 },
  description: { fontSize: 16, color: '#424242', lineHeight: 24 },
  
  supportButton: { marginTop: 15, backgroundColor: '#E91E63', borderRadius: 8 },
  
  divider: { marginVertical: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  mapContainer: { height: 200, width: '100%', borderRadius: 10, overflow: 'hidden', marginTop: 10 },
  map: { ...StyleSheet.absoluteFillObject },
  noLocationText: { color: '#757575', fontStyle: 'italic', marginTop: 10 },
  
  // Estilos de comentarios
  commentInputContainer: { marginBottom: 20 },
  commentInput: { backgroundColor: '#FFFFFF', marginBottom: 10 },
  commentButton: { alignSelf: 'flex-end', borderRadius: 8 },
  commentsList: { paddingBottom: 30 },
  noCommentsText: { color: '#757575', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  commentBubble: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12, marginBottom: 10 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  commentAuthor: { fontWeight: 'bold', marginLeft: 8, color: '#333' },
  commentText: { color: '#424242', lineHeight: 20, marginLeft: 32 },
});