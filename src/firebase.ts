import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'

// ============================================================
// 🔥 CONFIGURACIÓN DE FIREBASE 🔥
// ============================================================
// INSTRUCCIONES:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un proyecto nuevo (gratis)
// 3. Ve a "Project Overview" > "Project settings" > "Your apps"
// 4. Agrega una app web (ícono </>)
// 5. Copia el objeto firebaseConfig y reemplázalo aquí abajo
// 6. Ve a "Build" > "Firestore Database" > "Create database"
// 7. Elige "Start in test mode" (luego puedes cambiar las reglas)
// 8. ¡Listo! El ranking ahora será global
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCPwxqlUFQ6LQyTuhP-BdaZdpFo1NLrxPQ",
  authDomain: "database-spaceshooter.firebaseapp.com",
  projectId: "database-spaceshooter",
  storageBucket: "database-spaceshooter.firebasestorage.app",
  messagingSenderId: "803371874884",
  appId: "1:803371874884:web:f6f694184e47e88a9b1a11",
  measurementId: "G-72XBXD0FDC"
};

// ============================================================

let db: any = null
let firebaseEnabled = false

try {
  // Solo inicializar si las credenciales están configuradas
  if (firebaseConfig.apiKey !== "AIzaSyCPwxqlUFQ6LQyTuhP-BdaZdpFo1NLrxPQ") {
    const app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    firebaseEnabled = true
    console.log('✅ Firebase conectado - Ranking global activo')
  } else {
    console.warn('⚠️ Firebase no configurado - Usando localStorage (ranking local)')
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error)
}

export interface RankEntry {
  name: string
  score: number
  difficulty: string
  date: string
  timestamp?: any
}

// Guardar score en el ranking global
export async function saveScoreToRanking(entry: RankEntry): Promise<boolean> {
  if (!firebaseEnabled || !db) {
    console.log('Firebase no disponible, guardando en localStorage')
    return false
  }

  try {
    await addDoc(collection(db, 'ranking'), {
      name: entry.name,
      score: entry.score,
      difficulty: entry.difficulty,
      date: entry.date,
      timestamp: serverTimestamp()
    })
    console.log('✅ Score guardado en Firebase')
    return true
  } catch (error) {
    console.error('❌ Error guardando score:', error)
    return false
  }
}

// Obtener top 20 del ranking global
export async function getTopRanking(): Promise<RankEntry[]> {
  if (!firebaseEnabled || !db) {
    console.log('Firebase no disponible, cargando desde localStorage')
    return []
  }

  try {
    const q = query(
      collection(db, 'ranking'),
      orderBy('score', 'desc'),
      limit(20)
    )
    const querySnapshot = await getDocs(q)
    const ranking: RankEntry[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      ranking.push({
        name: data.name,
        score: data.score,
        difficulty: data.difficulty,
        date: data.date
      })
    })
    
    console.log('✅ Ranking cargado desde Firebase:', ranking.length, 'entradas')
    return ranking
  } catch (error) {
    console.error('❌ Error cargando ranking:', error)
    return []
  }
}

export { firebaseEnabled }
