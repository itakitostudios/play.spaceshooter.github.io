import { useEffect, useRef, useState, useCallback } from 'react'

type Screen = 'menu' | 'playing' | 'gameover' | 'shop' | 'levels' | 'ranking' | 'nameEntry' | 'settings'
type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme'

interface Skin { id: string; name: string; color: string; accent: string; price: number; owned: boolean }
interface RankEntry { name: string; score: number; difficulty: string; date: string }

const SKINS: Skin[] = [
  { id: 'default', name: 'Azul Clásico', color: '#4488ff', accent: '#88bbff', price: 0, owned: true },
  { id: 'red', name: 'Rojo Fuego', color: '#ff4444', accent: '#ff8888', price: 100, owned: false },
  { id: 'green', name: 'Verde Esmeralda', color: '#44ff88', accent: '#88ffbb', price: 150, owned: false },
  { id: 'purple', name: 'Púrpura Místico', color: '#aa44ff', accent: '#cc88ff', price: 200, owned: false },
  { id: 'gold', name: 'Dorado Legendario', color: '#ffcc00', accent: '#ffee88', price: 300, owned: false },
  { id: 'cyan', name: 'Cyan Eléctrico', color: '#00ffff', accent: '#88ffff', price: 250, owned: false },
  { id: 'pink', name: 'Rosa Neón', color: '#ff44aa', accent: '#ff88cc', price: 350, owned: false },
  { id: 'white', name: 'Platino', color: '#ffffff', accent: '#cccccc', price: 500, owned: false },
]

const DIFFICULTIES: Record<Difficulty, { name: string; color: string; enemySpeed: number; spawnRate: number; enemyHealth: number; reward: number }> = {
  easy: { name: 'Fácil', color: '#44ff88', enemySpeed: 0.7, spawnRate: 80, enemyHealth: 1, reward: 5 },
  normal: { name: 'Normal', color: '#facc15', enemySpeed: 1, spawnRate: 55, enemyHealth: 1, reward: 10 },
  hard: { name: 'Difícil', color: '#ff6644', enemySpeed: 1.4, spawnRate: 40, enemyHealth: 2, reward: 20 },
  extreme: { name: 'Extremo', color: '#ff00ff', enemySpeed: 1.8, spawnRate: 25, enemyHealth: 3, reward: 40 },
}

// SVG Icons
const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#facc15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
const IconCoin = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8M8 14h8"/></svg>
const IconHeart = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#f87171"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconBolt = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
const IconTriple = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2"><path d="M12 2v20M7 7l5-5 5 5M7 17l5 5 5-5"/></svg>
const IconPlay = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
const IconShop = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
const IconTrophy = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3h12v8a6 6 0 01-12 0V3zM9 21h6M12 17v4"/></svg>
const IconTarget = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconSettings = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
const IconVolume = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
const IconMute = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
const IconBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
const IconReload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconAmmo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#00ff88"><rect x="8" y="2" width="8" height="20" rx="2"/><rect x="10" y="4" width="4" height="4" fill="#88ffbb"/></svg>
const IconMedal = ({color}: {color: string}) => <svg width="20" height="20" viewBox="0 0 24 24" fill={color}><circle cx="12" cy="15" r="7"/><path d="M8 2l4 6 4-6" stroke={color} strokeWidth="2" fill="none"/></svg>

// Audio Engine
class AudioEngine {
  ctx: AudioContext | null = null
  masterGain: GainNode | null = null
  muted = false
  playing = false
  intervalId: number | null = null

  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.15
    this.masterGain.connect(this.ctx.destination)
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.15
    }
    return this.muted
  }

  playNote(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0) {
    if (!this.ctx || !this.masterGain || this.muted) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay)
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + delay + 0.05)
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + duration)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(this.ctx.currentTime + delay)
    osc.stop(this.ctx.currentTime + delay + duration)
  }

  startMusic() {
    if (this.playing) return
    this.init()
    this.playing = true
    const melody = [262, 330, 392, 523, 392, 330, 262, 294, 349, 440, 523, 440, 349, 294, 262, 330]
    const bass = [131, 131, 165, 165, 175, 175, 131, 131]
    let noteIdx = 0
    let bassIdx = 0
    this.intervalId = window.setInterval(() => {
      this.playNote(melody[noteIdx % melody.length], 0.3, 'triangle')
      if (noteIdx % 2 === 0) {
        this.playNote(bass[bassIdx % bass.length], 0.5, 'sine')
        bassIdx++
      }
      noteIdx++
    }, 280)
  }

  stopMusic() {
    this.playing = false
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null }
  }

  playSfx(type: 'shoot' | 'explosion' | 'powerup' | 'hit') {
    if (!this.ctx || !this.masterGain || this.muted) return
    if (type === 'shoot') this.playNote(800, 0.08, 'square')
    else if (type === 'explosion') { this.playNote(100, 0.3, 'sawtooth'); this.playNote(60, 0.4, 'sine', 0.05) }
    else if (type === 'powerup') { this.playNote(523, 0.1, 'sine'); this.playNote(659, 0.1, 'sine', 0.1); this.playNote(784, 0.15, 'sine', 0.2) }
    else if (type === 'hit') this.playNote(200, 0.1, 'square')
  }
}

const audio = new AudioEngine()

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<any>(null)
  const animRef = useRef<number>(0)
  const keysRef = useRef<Record<string, boolean>>({})

  const [screen, setScreen] = useState<Screen>(() => {
    const name = localStorage.getItem('playerName')
    return name ? 'menu' : 'nameEntry'
  })
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '')
  const [nameInput, setNameInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('spaceCoins') || '0'))
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [currentSkin, setCurrentSkin] = useState(() => localStorage.getItem('spaceCurrentSkin') || 'default')
  const [skins, setSkins] = useState<Skin[]>(() => {
    const saved = localStorage.getItem('spaceSkins')
    return saved ? JSON.parse(saved) : SKINS
  })
  const [ammo, setAmmo] = useState(6)
  const [reloading, setReloading] = useState(false)
  const [shield, setShield] = useState(false)
  const [rapid, setRapid] = useState(false)
  const [triple, setTriple] = useState(false)
  const [notification, setNotification] = useState('')
  const [muted, setMuted] = useState(() => localStorage.getItem('spaceMuted') === 'true')
  const [ranking, setRanking] = useState<RankEntry[]>(() => {
    const saved = localStorage.getItem('spaceRanking')
    return saved ? JSON.parse(saved) : []
  })
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [menuAnim, setMenuAnim] = useState(0)

  // Menu animation
  useEffect(() => {
    const interval = setInterval(() => setMenuAnim(p => p + 1), 50)
    return () => clearInterval(interval)
  }, [])

  const showNotif = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(''), 2000) }

  const saveSkins = (s: Skin[]) => { setSkins(s); localStorage.setItem('spaceSkins', JSON.stringify(s)) }
  const saveRanking = (r: RankEntry[]) => { setRanking(r); localStorage.setItem('spaceRanking', JSON.stringify(r)) }

  const submitName = () => {
    if (nameInput.trim().length < 2) return
    setPlayerName(nameInput.trim())
    localStorage.setItem('playerName', nameInput.trim())
    setScreen('menu')
  }

  const buySkin = (id: string) => {
    const skin = skins.find(s => s.id === id)
    if (!skin || skin.owned) return
    if (coins < skin.price) { showNotif('Monedas insuficientes'); return }
    const nc = coins - skin.price
    setCoins(nc); localStorage.setItem('spaceCoins', nc.toString())
    saveSkins(skins.map(s => s.id === id ? { ...s, owned: true } : s))
    showNotif(`Compraste: ${skin.name}`)
  }

  const selectSkin = (id: string) => {
    const skin = skins.find(s => s.id === id)
    if (!skin || !skin.owned) return
    setCurrentSkin(id); localStorage.setItem('spaceCurrentSkin', id)
    showNotif(`Equipado: ${skin.name}`)
  }

  const toggleMute = () => {
    const m = audio.toggleMute()
    setMuted(m); localStorage.setItem('spaceMuted', m.toString())
  }

  const startGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width, H = canvas.height
    const stars = []
    for (let i = 0; i < 180; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, speed: 0.5 + Math.random() * 2.5, size: Math.random() * 2.5 + 0.5, twinkle: Math.random() * Math.PI * 2 })
    const diff = DIFFICULTIES[difficulty]
    gameRef.current = {
      player: { x: W / 2 - 20, y: H - 80, width: 40, height: 40, speed: 5 },
      bullets: [], enemies: [], particles: [], powerUps: [], stars,
      lastShot: 0, score: 0, lives: difficulty === 'easy' ? 5 : difficulty === 'hard' ? 2 : difficulty === 'extreme' ? 1 : 3,
      level: 1, enemySpawnTimer: 0, enemySpawnRate: diff.spawnRate, frameCount: 0,
      shieldActive: false, rapidFire: false, tripleShot: false, running: true, W, H,
      ammo: 6, maxAmmo: 6, reloading: false, reloadTimer: 0, reloadTime: 90,
      difficulty, coinsEarned: 0,
      nebulae: [{ x: Math.random() * W, y: Math.random() * H, radius: 100 + Math.random() * 80, color: `hsla(${Math.random() * 360}, 70%, 30%, 0.12)` }, { x: Math.random() * W, y: Math.random() * H, radius: 80 + Math.random() * 100, color: `hsla(${Math.random() * 360}, 70%, 30%, 0.1)` }],
      screenShake: 0
    }
    setScore(0); setLives(gameRef.current.lives); setLevel(1); setAmmo(6); setReloading(false)
    setShield(false); setRapid(false); setTriple(false); setCoinsEarned(0)
    setScreen('playing')
    audio.init(); audio.startMusic()
  }, [difficulty])

  const endGame = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    g.running = false
    audio.stopMusic()
    const diffData = DIFFICULTIES[g.difficulty as Difficulty]
    const earned = Math.floor((g.score / 10) * diffData.reward / 10)
    const nc = coins + earned
    setCoins(nc); localStorage.setItem('spaceCoins', nc.toString())
    setCoinsEarned(earned)
    // Add to ranking
    const entry: RankEntry = { name: playerName, score: g.score, difficulty: diffData.name, date: new Date().toLocaleDateString() }
    const newRanking = [...ranking, entry].sort((a, b) => b.score - a.score).slice(0, 20)
    saveRanking(newRanking)
    setScreen('gameover')
  }, [coins, playerName, ranking])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = Math.min(window.innerWidth - 32, 1200)
      canvas.height = Math.min(window.innerHeight - 180, 750)
      if (gameRef.current) { gameRef.current.W = canvas.width; gameRef.current.H = canvas.height }
    }
    resize()
    window.addEventListener('resize', resize)

    if (!gameRef.current) {
      const stars = []
      for (let i = 0; i < 180; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 0.5 + Math.random() * 2.5, size: Math.random() * 2.5 + 0.5, twinkle: Math.random() * Math.PI * 2 })
      gameRef.current = { stars, particles: [], frameCount: 0, running: false, W: canvas.width, H: canvas.height, nebulae: [] }
    }

    const onKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault() }
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const createExplosion = (x: number, y: number, color: string, count = 14) => {
      const g = gameRef.current
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        const speed = 1 + Math.random() * 4
        g.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 30 + Math.random() * 20, color, size: 2 + Math.random() * 4 })
      }
    }

    const getSkin = () => skins.find(s => s.id === currentSkin) || SKINS[0]

    const loop = () => {
      animRef.current = requestAnimationFrame(loop)
      const g = gameRef.current
      if (!g) return
      g.frameCount++
      const W = canvas.width, H = canvas.height

      // Screen shake
      let shakeX = 0, shakeY = 0
      if (g.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * g.screenShake
        shakeY = (Math.random() - 0.5) * g.screenShake
        g.screenShake *= 0.9
        if (g.screenShake < 0.5) g.screenShake = 0
      }
      ctx.save()
      ctx.translate(shakeX, shakeY)

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
      bgGrad.addColorStop(0, '#050510'); bgGrad.addColorStop(0.5, '#0a0a2a'); bgGrad.addColorStop(1, '#050515')
      ctx.fillStyle = bgGrad; ctx.fillRect(-10, -10, W + 20, H + 20)

      // Nebulae
      if (g.nebulae) g.nebulae.forEach((n: any) => {
        n.y += 0.15; if (n.y > H + n.radius) { n.y = -n.radius; n.x = Math.random() * W }
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius)
        grad.addColorStop(0, n.color); grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad; ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2)
      })

      // Stars
      g.stars.forEach((s: any) => {
        s.y += s.speed; s.twinkle += 0.03
        if (s.y > H) { s.y = 0; s.x = Math.random() * W }
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(s.twinkle) * 0.3 + s.size * 0.15})`
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 0.7, 0, Math.PI * 2); ctx.fill()
      })

      // Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i]
        p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96; p.life--
        if (p.life <= 0) { g.particles.splice(i, 1) } else {
          ctx.globalAlpha = p.life / 50; ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 4
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
          ctx.shadowBlur = 0; ctx.globalAlpha = 1
        }
      }

      if (!g.running) { ctx.restore(); return }

      // Player
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) g.player.x -= g.player.speed
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) g.player.x += g.player.speed
      if (keysRef.current['ArrowUp'] || keysRef.current['w']) g.player.y -= g.player.speed
      if (keysRef.current['ArrowDown'] || keysRef.current['s']) g.player.y += g.player.speed
      g.player.x = Math.max(0, Math.min(W - g.player.width, g.player.x))
      g.player.y = Math.max(0, Math.min(H - g.player.height, g.player.y))

      // Reload
      if (g.reloading) { g.reloadTimer++; if (g.reloadTimer >= g.reloadTime) { g.reloading = false; g.ammo = g.maxAmmo; g.reloadTimer = 0; setAmmo(g.maxAmmo); setReloading(false) } }

      // Shoot
      const now = Date.now(); const shootDelay = g.rapidFire ? 80 : 150
      if (keysRef.current[' '] && now - g.lastShot > shootDelay && !g.reloading && g.ammo > 0) {
        g.lastShot = now; g.ammo--; setAmmo(g.ammo); audio.playSfx('shoot')
        if (g.ammo <= 0) { g.reloading = true; g.reloadTimer = 0; setReloading(true) }
        if (g.tripleShot) { g.bullets.push({ x: g.player.x + 18, y: g.player.y, speed: -12 }, { x: g.player.x + 8, y: g.player.y + 10, speed: -12 }, { x: g.player.x + 28, y: g.player.y + 10, speed: -12 }) }
        else { g.bullets.push({ x: g.player.x + 18, y: g.player.y, speed: -12 }) }
      }

      for (let i = g.bullets.length - 1; i >= 0; i--) { g.bullets[i].y += g.bullets[i].speed; if (g.bullets[i].y < -20) g.bullets.splice(i, 1) }

      // Spawn
      g.enemySpawnTimer++
      if (g.enemySpawnTimer >= g.enemySpawnRate) {
        g.enemySpawnTimer = 0; const dd = DIFFICULTIES[g.difficulty as Difficulty]
        const type = Math.random() < 0.1 + g.level * 0.02 ? 1 : Math.random() < 0.04 ? 2 : 0
        const sizes = [32, 45, 55]; const size = sizes[type]
        const healths = [dd.enemyHealth, dd.enemyHealth + 2, dd.enemyHealth + 4]
        g.enemies.push({ x: Math.random() * (W - size), y: -size, speed: dd.enemySpeed + Math.random() * 0.8 + g.level * 0.1, width: size, height: size, health: healths[type], maxHealth: healths[type], type })
      }

      // Enemies
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const e = g.enemies[i]; e.y += e.speed
        if (g.player.x < e.x + e.width && g.player.x + g.player.width > e.x && g.player.y < e.y + e.height && g.player.y + g.player.height > e.y) {
          createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#ff4444', 20); audio.playSfx('explosion'); g.screenShake = 8
          if (g.shieldActive) { g.shieldActive = false; setShield(false) }
          else { g.lives--; setLives(g.lives); if (g.lives <= 0) { createExplosion(g.player.x + 20, g.player.y + 20, '#ffaa00', 30); g.screenShake = 15; endGame() } }
          g.enemies.splice(i, 1); continue
        }
        if (e.y > H + 10) g.enemies.splice(i, 1)
      }

      // Bullet-enemy
      for (let b = g.bullets.length - 1; b >= 0; b--) {
        const bullet = g.bullets[b]; let hit = false
        for (let e = g.enemies.length - 1; e >= 0; e--) {
          const enemy = g.enemies[e]
          if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width && bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
            enemy.health--; hit = true; audio.playSfx('hit')
            if (enemy.health <= 0) {
              g.score += [10, 30, 50][enemy.type] || 10; setScore(g.score)
              const nl = Math.floor(g.score / 200) + 1
              if (nl > g.level) { g.level = nl; g.enemySpawnRate = Math.max(15, DIFFICULTIES[g.difficulty as Difficulty].spawnRate - g.level * 3); setLevel(g.level) }
              if (Math.random() < 0.1) { const types = ['shield', 'rapid', 'triple', 'ammo']; g.powerUps.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, speed: 2, type: types[Math.floor(Math.random() * types.length)] }) }
              createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === 2 ? '#ff00ff' : enemy.type === 1 ? '#ff6600' : '#00ff88', 16); audio.playSfx('explosion')
              g.enemies.splice(e, 1)
            } else { createExplosion(bullet.x, bullet.y, '#ffffff', 5) }
            break
          }
        }
        if (hit) g.bullets.splice(b, 1)
      }

      // Powerups
      for (let i = g.powerUps.length - 1; i >= 0; i--) {
        const pu = g.powerUps[i]; pu.y += pu.speed
        if (pu.y > H) { g.powerUps.splice(i, 1); continue }
        if (g.player.x < pu.x + 12 && g.player.x + g.player.width > pu.x - 12 && g.player.y < pu.y + 12 && g.player.y + g.player.height > pu.y - 12) {
          if (pu.type === 'shield') { g.shieldActive = true; setShield(true) }
          else if (pu.type === 'rapid') { g.rapidFire = true; setRapid(true) }
          else if (pu.type === 'triple') { g.tripleShot = true; setTriple(true) }
          else if (pu.type === 'ammo') { g.ammo = g.maxAmmo; g.reloading = false; g.reloadTimer = 0; setAmmo(g.maxAmmo); setReloading(false) }
          createExplosion(pu.x, pu.y, '#ffff00', 10); audio.playSfx('powerup')
          g.powerUps.splice(i, 1)
        }
      }

      // === DRAW ===
      const skin = getSkin()

      // Powerups
      const puColors: any = { shield: '#00aaff', rapid: '#ffaa00', triple: '#ff00ff', ammo: '#00ff88' }
      g.powerUps.forEach((pu: any) => {
        const pulse = 1 + Math.sin(g.frameCount * 0.1) * 0.2
        ctx.fillStyle = puColors[pu.type]; ctx.shadowColor = puColors[pu.type]; ctx.shadowBlur = 12
        ctx.beginPath(); ctx.arc(pu.x, pu.y, 10 * pulse, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const labels: any = { shield: 'S', rapid: 'R', triple: 'T', ammo: '+' }
        ctx.fillText(labels[pu.type], pu.x, pu.y)
      })

      // Bullets
      g.bullets.forEach((b: any) => {
        const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + 16)
        grad.addColorStop(0, skin.color); grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad; ctx.fillRect(b.x - 2, b.y, 4, 16)
        ctx.fillStyle = '#fff'; ctx.shadowColor = skin.color; ctx.shadowBlur = 8
        ctx.fillRect(b.x - 1.5, b.y, 3, 6); ctx.shadowBlur = 0
      })

      // Enemies
      g.enemies.forEach((e: any) => {
        if (e.type === 2) {
          ctx.fillStyle = '#880088'; ctx.beginPath()
          ctx.moveTo(e.x + e.width / 2, e.y); ctx.lineTo(e.x + e.width, e.y + e.height * 0.4); ctx.lineTo(e.x + e.width * 0.8, e.y + e.height); ctx.lineTo(e.x + e.width * 0.2, e.y + e.height); ctx.lineTo(e.x, e.y + e.height * 0.4)
          ctx.closePath(); ctx.fill()
          ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(e.x + e.width / 2, e.y + e.height * 0.5, 10, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#ff88ff'; ctx.beginPath(); ctx.arc(e.x + e.width / 2, e.y + e.height * 0.5, 5, 0, Math.PI * 2); ctx.fill()
        } else if (e.type === 1) {
          ctx.fillStyle = '#ff4400'; ctx.beginPath()
          ctx.moveTo(e.x + e.width / 2, e.y); ctx.lineTo(e.x + e.width, e.y + e.height); ctx.lineTo(e.x, e.y + e.height)
          ctx.closePath(); ctx.fill()
          ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(e.x + e.width / 2, e.y + e.height * 0.6, 8, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(e.x + e.width / 2, e.y + e.height * 0.6, 4, 0, Math.PI * 2); ctx.fill()
        } else {
          ctx.fillStyle = '#22cc66'; ctx.beginPath()
          ctx.moveTo(e.x + e.width / 2, e.y + e.height); ctx.lineTo(e.x + e.width, e.y); ctx.lineTo(e.x, e.y)
          ctx.closePath(); ctx.fill()
          ctx.fillStyle = '#66ffaa'; ctx.beginPath(); ctx.arc(e.x + e.width / 2, e.y + e.height * 0.35, 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#118844'; ctx.fillRect(e.x + 2, e.y + 5, 4, e.height - 15); ctx.fillRect(e.x + e.width - 6, e.y + 5, 4, e.height - 15)
        }
        if (e.maxHealth > 1) {
          ctx.fillStyle = '#333'; ctx.fillRect(e.x, e.y - 8, e.width, 4)
          ctx.fillStyle = e.health / e.maxHealth > 0.5 ? '#44ff88' : e.health / e.maxHealth > 0.25 ? '#ffaa00' : '#ff4444'
          ctx.fillRect(e.x, e.y - 8, (e.width * e.health) / e.maxHealth, 4)
        }
      })

      // Player
      const px = g.player.x, py = g.player.y
      const flameLen = 10 + Math.sin(g.frameCount * 0.4) * 5
      const fg = ctx.createLinearGradient(px + 20, py + 40, px + 20, py + 40 + flameLen)
      fg.addColorStop(0, '#ffffff'); fg.addColorStop(0.3, '#ffaa00'); fg.addColorStop(1, 'transparent')
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(px + 12, py + 40); ctx.lineTo(px + 20, py + 40 + flameLen); ctx.lineTo(px + 28, py + 40); ctx.closePath(); ctx.fill()

      ctx.fillStyle = skin.color; ctx.beginPath()
      ctx.moveTo(px + 20, py); ctx.lineTo(px + 40, py + 40); ctx.lineTo(px + 30, py + 35); ctx.lineTo(px + 10, py + 35); ctx.lineTo(px, py + 40)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = skin.accent; ctx.beginPath(); ctx.moveTo(px + 20, py + 8); ctx.lineTo(px + 30, py + 32); ctx.lineTo(px + 10, py + 32); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.shadowColor = skin.color; ctx.shadowBlur = 6
      ctx.beginPath(); ctx.arc(px + 20, py + 18, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0
      ctx.globalAlpha = 0.6; ctx.fillStyle = skin.color; ctx.fillRect(px + 2, py + 25, 6, 12); ctx.fillRect(px + 32, py + 25, 6, 12); ctx.globalAlpha = 1

      if (g.shieldActive) {
        const a = 0.4 + Math.sin(g.frameCount * 0.1) * 0.2
        ctx.strokeStyle = `rgba(0,170,255,${a})`; ctx.lineWidth = 2.5; ctx.shadowColor = '#00aaff'; ctx.shadowBlur = 8
        ctx.beginPath(); ctx.arc(px + 20, py + 20, 30, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0
      }

      if (g.reloading) {
        const prog = g.reloadTimer / g.reloadTime
        ctx.fillStyle = '#333'; ctx.fillRect(px, py - 14, g.player.width, 4)
        ctx.fillStyle = '#00ff88'; ctx.fillRect(px, py - 14, g.player.width * prog, 4)
      }

      ctx.restore()
    }

    animRef.current = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('resize', resize) }
  }, [screen, currentSkin, skins, endGame])

  const currentSkinData = skins.find(s => s.id === currentSkin) || SKINS[0]
  const btnStyle = (bg: string): React.CSSProperties => ({ padding: '12px 32px', fontSize: 16, fontWeight: 'bold', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', background: bg, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', width: 240, transition: 'transform 0.2s, box-shadow 0.2s' })

  // NAME ENTRY
  if (screen === 'nameEntry') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050510, #0a0a2a, #050515)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, Arial, sans-serif', color: 'white', padding: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 400, animation: 'fadeIn 0.5s ease' }}>
          <h1 style={{ fontSize: 36, marginBottom: 8, background: 'linear-gradient(90deg, #22d3ee, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPACE SHOOTER</h1>
          <p style={{ color: '#9ca3af', marginBottom: 24 }}>Ingresa tu nombre de piloto</p>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitName()} placeholder="Tu nombre..." maxLength={15} style={{ width: '100%', padding: '12px 16px', fontSize: 18, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: 8, color: 'white', outline: 'none', marginBottom: 16, textAlign: 'center', boxSizing: 'border-box' }} />
          <button onClick={submitName} style={{ ...btnStyle('linear-gradient(135deg, #9333ea, #2563eb)'), width: '100%' }}>Comenzar Aventura</button>
        </div>
        <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Segoe UI, Arial, sans-serif', color: 'white', userSelect: 'none', overflow: 'hidden' }}>
      {/* Notification */}
      {notification && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', border: '1px solid #a855f7', borderRadius: 8, padding: '10px 24px', zIndex: 100, fontSize: 15, color: '#facc15', animation: 'slideDown 0.3s ease' }}>{notification}</div>}

      {/* Top bar with profile & settings */}
      <div style={{ width: '100%', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '4px 12px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${currentSkinData.color}, ${currentSkinData.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconUser /></div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{playerName}</span>
          <span style={{ fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 2 }}><IconCoin />{coins}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleMute} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{muted ? <IconMute /> : <IconVolume />}</button>
          <button onClick={() => setScreen('settings')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconSettings /></button>
        </div>
      </div>

      {/* HUD (playing) */}
      {screen === 'playing' && (
        <div style={{ width: '100%', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: 15, display: 'flex', alignItems: 'center', gap: 4 }}><IconStar />{score}</span>
            <span style={{ color: '#facc15', fontSize: 13 }}>Nivel {level}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '3px 8px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ width: 7, height: 12, borderRadius: 2, background: i < ammo ? '#00ffff' : '#333', boxShadow: i < ammo ? '0 0 4px #00ffff' : 'none', transition: 'background 0.15s' }} />
              ))}
              {reloading && <span style={{ fontSize: 10, color: '#00ff88', marginLeft: 4, display: 'flex', alignItems: 'center', gap: 2, animation: 'pulse 0.5s infinite' }}><IconReload />REC</span>}
            </div>
            {shield && <span style={{ display: 'flex' }}><IconShield /></span>}
            {rapid && <span style={{ display: 'flex' }}><IconBolt /></span>}
            {triple && <span style={{ display: 'flex' }}><IconTriple /></span>}
            <span style={{ display: 'flex', gap: 2 }}>{Array.from({ length: lives }).map((_, i) => <IconHeart key={i} />)}</span>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 8 }}>
        <div style={{ position: 'relative', border: '2px solid rgba(168,85,247,0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 60px rgba(168,85,247,0.15)', width: '100%', maxWidth: 1200 }}>
          <canvas ref={canvasRef} style={{ display: 'block', background: '#050510', width: '100%', height: '100%' }} />

          {/* MENU */}
          {screen === 'menu' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
              <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 'bold', marginBottom: 4, background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'titleGlow 3s ease-in-out infinite' }}>SPACE SHOOTER</h1>
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 28 }}>Destruye enemigos, gana monedas, sube al ranking</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <button onClick={startGame} style={btnStyle('linear-gradient(135deg, #9333ea, #2563eb)')}><IconPlay />JUGAR</button>
                <button onClick={() => setScreen('levels')} style={btnStyle('linear-gradient(135deg, #f59e0b, #ef4444)')}><IconTarget />NIVELES</button>
                <button onClick={() => setScreen('shop')} style={btnStyle('linear-gradient(135deg, #10b981, #06b6d4)')}><IconShop />TIENDA</button>
                <button onClick={() => setScreen('ranking')} style={btnStyle('linear-gradient(135deg, #8b5cf6, #d946ef)')}><IconTrophy />RANKING</button>
              </div>
              <style>{`@keyframes titleGlow { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.3) } } @keyframes slideDown { from { opacity:0; transform:translate(-50%,-20px) } to { opacity:1; transform:translate(-50%,0) } } @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } } @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } } @keyframes slideIn { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:translateX(0) } }`}</style>
            </div>
          )}

          {/* LEVELS */}
          {screen === 'levels' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: 20 }}>
              <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 6, color: '#facc15' }}>Selector de Dificultad</h2>
              <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>Más difícil = más monedas</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => (
                  <button key={d} onClick={() => { setDifficulty(d); showNotif(`Dificultad: ${DIFFICULTIES[d].name}`) }} style={{ padding: 16, fontSize: 14, fontWeight: 'bold', color: 'white', border: difficulty === d ? `2px solid ${DIFFICULTIES[d].color}` : '2px solid transparent', borderRadius: 10, cursor: 'pointer', background: difficulty === d ? `${DIFFICULTIES[d].color}33` : 'rgba(255,255,255,0.05)', width: 170, textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ color: DIFFICULTIES[d].color, fontSize: 16, marginBottom: 4 }}>{DIFFICULTIES[d].name}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 'normal' }}>Vel: {DIFFICULTIES[d].enemySpeed}x | Rec: {DIFFICULTIES[d].reward}x | Vidas: {d === 'easy' ? 5 : d === 'normal' ? 3 : d === 'hard' ? 2 : 1}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setScreen('menu')} style={{ ...btnStyle('rgba(255,255,255,0.1)'), width: 160 }}><IconBack />Volver</button>
            </div>
          )}

          {/* SHOP */}
          {screen === 'shop' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.85)', padding: 20, overflowY: 'auto' }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4, color: '#10b981' }}>TIENDA DE SKINS</h2>
              <p style={{ color: '#fbbf24', fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}><IconCoin />{coins} monedas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, width: '100%', maxWidth: 700, marginBottom: 16 }}>
                {skins.map(skin => (
                  <div key={skin.id} style={{ background: currentSkin === skin.id ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)', border: currentSkin === skin.id ? '2px solid #a855f7' : '2px solid transparent', borderRadius: 10, padding: 10, textAlign: 'center', transition: 'all 0.2s' }}>
                    <svg width="44" height="44" viewBox="0 0 50 50" style={{ margin: '0 auto 6px', display: 'block' }}><polygon points="25,5 45,45 5,45" fill={skin.color} /><polygon points="25,15 35,40 15,40" fill={skin.accent} /><circle cx="25" cy="25" r="4" fill="white" /></svg>
                    <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>{skin.name}</div>
                    {skin.owned ? (currentSkin === skin.id ? <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 'bold' }}>EQUIPADO</div> : <button onClick={() => selectSkin(skin.id)} style={{ fontSize: 10, padding: '3px 8px', background: '#a855f7', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Equipar</button>) : <button onClick={() => buySkin(skin.id)} style={{ fontSize: 10, padding: '3px 8px', background: coins >= skin.price ? '#10b981' : '#555', color: 'white', border: 'none', borderRadius: 4, cursor: coins >= skin.price ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 3, margin: '0 auto' }}><IconCoin />{skin.price}</button>}
                  </div>
                ))}
              </div>
              <button onClick={() => setScreen('menu')} style={{ ...btnStyle('rgba(255,255,255,0.1)'), width: 160 }}><IconBack />Volver</button>
            </div>
          )}

          {/* RANKING */}
          {screen === 'ranking' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.85)', padding: 20, overflowY: 'auto' }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#d946ef', display: 'flex', alignItems: 'center', gap: 8 }}><IconTrophy />RANKING TOP 20</h2>
              {ranking.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>Aún no hay registros. ¡Juega para aparecer aquí!</p>
              ) : (
                <div style={{ width: '100%', maxWidth: 500 }}>
                  {ranking.slice(0, 20).map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: i < 3 ? 'rgba(255,255,255,0.05)' : 'transparent', borderRadius: 8, marginBottom: 4, borderLeft: i < 3 ? `3px solid ${i === 0 ? '#facc15' : i === 1 ? '#94a3b8' : '#cd7f32'}` : 'none', animation: `slideIn 0.3s ease ${i * 0.05}s both` }}>
                      <div style={{ width: 28, textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: i === 0 ? '#facc15' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#6b7280' }}>
                        {i < 3 ? <IconMedal color={i === 0 ? '#facc15' : i === 1 ? '#94a3b8' : '#cd7f32'} /> : `#${i + 1}`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.name}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{entry.difficulty} | {entry.date}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#22d3ee' }}>{entry.score}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setScreen('menu')} style={{ ...btnStyle('rgba(255,255,255,0.1)'), width: 160, marginTop: 16 }}><IconBack />Volver</button>
            </div>
          )}

          {/* SETTINGS */}
          {screen === 'settings' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', padding: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Configuración</h2>
              <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{muted ? <IconMute /> : <IconVolume />}Música</span>
                  <button onClick={toggleMute} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: muted ? '#ef4444' : '#10b981', color: 'white', fontWeight: 'bold', fontSize: 12 }}>{muted ? 'OFF' : 'ON'}</button>
                </div>
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                  <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><IconUser />Piloto: <strong>{playerName}</strong></div>
                  <button onClick={() => { localStorage.clear(); window.location.reload() }} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#ef4444', color: 'white', fontWeight: 'bold', fontSize: 12 }}>Resetear datos</button>
                </div>
              </div>
              <button onClick={() => setScreen('menu')} style={{ ...btnStyle('rgba(255,255,255,0.1)'), width: 160, marginTop: 24 }}><IconBack />Volver</button>
            </div>
          )}

          {/* GAME OVER */}
          {screen === 'gameover' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
              <h2 style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 12, color: '#f87171', animation: 'fadeIn 0.5s ease' }}>GAME OVER</h2>
              <p style={{ fontSize: 18, color: 'white', marginBottom: 4 }}>Puntuación: <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{score}</span></p>
              <p style={{ fontSize: 15, color: '#fbbf24', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><IconCoin />+{coinsEarned} monedas</p>
              <p style={{ color: '#9ca3af', marginBottom: 20, fontSize: 13 }}>Dificultad: {DIFFICULTIES[difficulty].name}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={startGame} style={{ ...btnStyle('linear-gradient(135deg, #16a34a, #059669)'), width: 'auto' }}><IconPlay />Reintentar</button>
                <button onClick={() => { audio.stopMusic(); setScreen('menu') }} style={{ ...btnStyle('rgba(255,255,255,0.1)'), width: 'auto' }}><IconBack />Menú</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile controls */}
      {screen === 'playing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0' }}>
          <button onTouchStart={() => { keysRef.current['ArrowUp'] = true }} onTouchEnd={() => { keysRef.current['ArrowUp'] = false }} style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', fontSize: 20, cursor: 'pointer' }}>↑</button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onTouchStart={() => { keysRef.current['ArrowLeft'] = true }} onTouchEnd={() => { keysRef.current['ArrowLeft'] = false }} style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', fontSize: 20, cursor: 'pointer' }}>←</button>
            <button onTouchStart={() => { keysRef.current[' '] = true }} onTouchEnd={() => { keysRef.current[' '] = false }} style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.3)', border: 'none', borderRadius: '50%', color: '#fca5a5', fontSize: 16, cursor: 'pointer' }}>FIRE</button>
            <button onTouchStart={() => { keysRef.current['ArrowRight'] = true }} onTouchEnd={() => { keysRef.current['ArrowRight'] = false }} style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', fontSize: 20, cursor: 'pointer' }}>→</button>
          </div>
          <button onTouchStart={() => { keysRef.current['ArrowDown'] = true }} onTouchEnd={() => { keysRef.current['ArrowDown'] = false }} style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', fontSize: 20, cursor: 'pointer' }}>↓</button>
        </div>
      )}
    </div>
  )
}

export default App
