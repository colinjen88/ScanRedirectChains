import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { scanRouter } from './routes/scan.js'
import { aiRouter } from './routes/ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
}))
app.use(express.json())

// Routes
app.use('/api/scan', scanRouter)
app.use('/api/ai', aiRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static frontend files (used in production Docker container)
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

// Handle Vue Router history mode / wildcard fallback to index.html (僅在存在 dist 時，避免開發時送檔崩潰)
app.get('/{*splat}', (req, res, next) => {
    const indexFile = path.join(distPath, 'index.html')
    if (fs.existsSync(indexFile)) res.sendFile(indexFile)
    else next()
})

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Redirect Scanner API Server`)
    console.log(`   Port: ${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/api/health`)
    console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not set (AI features disabled)'}`)
    console.log('')
})
