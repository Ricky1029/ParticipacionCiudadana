import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import CreateScreen from './src/screens/CreateScreen';
import RankingScreen from './src/screens/RankingScreen';
import { Proposal, Helix } from './src/types';
import { initialProposals } from './src/data/initialProposals';

const Tab = createBottomTabNavigator();

export default function App() {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);

  const handleVote = (id: string) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id
          ? { ...proposal, votes: proposal.votes + 1 }
          : proposal
      )
    );
  };

  const handleCreateProposal = (
    title: string,
    description: string,
    category: Helix
  ) => {
    const newProposal: Proposal = {
      id: Date.now().toString(),
      title,
      description,
      category,
      votes: 0,
      createdAt: new Date(),
    };
    setProposals((prevProposals) => [newProposal, ...prevProposals]);
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: string;

                if (route.name === 'Inicio') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Crear') {
                  iconName = focused ? 'plus-circle' : 'plus-circle-outline';
                } else if (route.name === 'Ranking') {
                  iconName = focused ? 'trophy' : 'trophy-outline';
                } else {
                  iconName = 'circle';
                }

                return (
                  <MaterialCommunityIcons
                    name={iconName}
                    size={size}
                    color={color}
                  />
                );
              },
              tabBarActiveTintColor: '#1E88E5',
              tabBarInactiveTintColor: '#999',
              headerShown: false,
              tabBarStyle: {
                paddingBottom: 5,
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 12,
              },
            })}
          >
            <Tab.Screen name="Inicio">
              {() => <HomeScreen proposals={proposals} onVote={handleVote} />}
            </Tab.Screen>
            <Tab.Screen name="Crear">
              {() => (
                <CreateScreen onCreateProposal={handleCreateProposal} />
              )}
            </Tab.Screen>
            <Tab.Screen name="Ranking">
              {() => <RankingScreen proposals={proposals} />}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
