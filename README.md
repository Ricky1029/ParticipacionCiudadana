# ColaboraMX - Plataforma de Participación Ciudadana

## 🚀 Descripción
ColaboraMX es una aplicación móvil de participación ciudadana que conecta cuatro hélices: **Gobierno**, **Academia**, **Empresa** y **Comunidad**.

## ✨ Características

- **Feed de Propuestas**: Visualiza todas las propuestas con tarjetas atractivas
- **Sistema de Votación**: Vota por las propuestas que más te interesen
- **Crear Propuestas**: Comparte tus ideas seleccionando una de las 4 hélices
- **Ranking**: Ve las propuestas más votadas en tiempo real

## 🛠️ Tecnologías

- **React Native** + **Expo**
- **React Native Paper** (componentes UI)
- **React Navigation** (navegación por pestañas)
- **TypeScript** (tipado estático)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar la aplicación
npm start
```

## 📱 Ejecución

1. Instala **Expo Go** en tu dispositivo móvil
2. Ejecuta `npm start` en tu terminal
3. Escanea el código QR con Expo Go (Android) o la cámara (iOS)

## 🎨 Paleta de Colores

- **Azul Institucional**: `#1E88E5` (Gobierno, principal)
- **Verde**: `#43A047` (Éxito, botones de acción)
- **Púrpura**: `#7B1FA2` (Academia)
- **Naranja**: `#F57C00` (Comunidad)
- **Rosa**: `#E91E63` (Votos, rankings)

## 📂 Estructura del Proyecto

```
ParticipacionCiudadana/
├── App.tsx                           # Componente principal con navegación
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Pantalla de inicio (Feed)
│   │   ├── CreateScreen.tsx         # Pantalla de creación
│   │   └── RankingScreen.tsx        # Pantalla de ranking
│   ├── types/
│   │   └── index.ts                 # Definiciones de tipos
│   └── data/
│       └── initialProposals.ts      # Datos iniciales
```

## 🎯 Funcionalidades Implementadas

✅ Navegación por pestañas (Tab Navigation)
✅ Estado local con useState
✅ Votación en tiempo real
✅ Creación de nuevas propuestas
✅ Ranking dinámico ordenado por votos
✅ Categorización por hélices (4 categorías)
✅ UI moderna con React Native Paper
✅ Modo demo sin backend

---

Desarrollado con ❤️ para fomentar la participación ciudadana en México 🇲🇽
