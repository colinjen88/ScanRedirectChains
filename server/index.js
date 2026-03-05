import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
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
app.use(express.static(path.join(__dirname, '../dist')))

// Handle Vue Router history mode / wildcard fallback to index.html
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Redirect Scanner API Server`)
    console.log(`   Port: ${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/api/health`)
    console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not set (AI features disabled)'}`)
    console.log('')
})
