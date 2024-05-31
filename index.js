const express = require('express')
const axios = require('axios')
const session = require('express-session')
const path = require('path')
const app = express()
require('dotenv').config()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: 'DannTeam',
    resave: false,
    saveUninitialized: true
}))

const port = process.env.PORT
const APP_ID = process.env.APP_ID
const APP_SECRET = process.env.APP_SECRET
const REDIRECT_URI = 'http://api.dannteam.com/callback'

// Home route
app.get('/', (req, res) => {
    res.render('login')
})

// OAuth redirect route
app.get('/auth', (req, res) => {
    const authUrl = `https://teman.social/api/oauth2?app_id=${APP_ID}`
    res.redirect(authUrl)
})

// OAuth callback route
app.get('/callback', async (req, res) => {
    const authKey = req.query.auth_key

    try {
        const response = await axios.get(`https://teman.social/api/authorize?app_id=${APP_ID}&app_secret=${APP_SECRET}&auth_key=${authKey}`)
        const accessToken = response.data.access_token

        req.session.accessToken = accessToken
        res.redirect('/profile')
    } catch (error) {
        console.error('Error while fetching access token:', error)
        res.status(500).send('Error while fetching access token.')
    }
})

// Profile route
app.get('/profile', async (req, res) => {
    if (!req.session.accessToken) {
        return res.redirect('/')
    }

    try {
        const response = await axios.get(`https://teman.social/api/get_user_info?access_token=${req.session.accessToken}`)
        const userInfo = response.data
        res.render('profile', { user: userInfo })
    } catch (error) {
        console.error('Error while fetching user information:', error)
        res.status(500).send('Error while fetching user information.')
    }
})

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to logout.')
        }
        res.redirect('/')
    })
})

app.listen(port, () => {
    console.log('Server is running on port', port)
})
