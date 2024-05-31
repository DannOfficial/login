const express = require('express')
const axios = require('axios')
const app = express()
require('dotenv').config()

app.set('view engine', 'ejs')
app.use(express.static('public'))

const port = process.env.PORT
const APP_ID = process.env.APP_ID
const APP_SECRET = process.env.APP_SECRET
const REDIRECT_URI = 'https://api.dannteam.com/callback'

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/views/login.ejs")
})

app.get('/auth', (req, res) => {
    const authUrl = `https://teman.social/api/oauth2?app_id=${APP_ID}`
    res.redirect(authUrl)
})

app.get('/callback', async (req, res) => {
    const authKey = req.query.auth_key

    try {
        const response = await axios.get(`https://teman.social/api/authorize?app_id=${APP_ID}&app_secret=${APP_SECRET}&auth_key=${authKey}`)
        const accessToken = response.data.access_token

        req.session.accessToken = accessToken
        res.redirect('/profile')
    } catch (error) {
        res.send('Terjadi kesalahan saat mengambil data akses token.')
    }
})

app.get('/profile', async (req, res) => {
    if (!req.session.accessToken) {
        return res.redirect('/')
    }

    try {
        const response = await axios.get(`https://teman.social/api/get_user_info?access_token=${req.session.accessToken}`)
        const userInfo = response.data
        res.render('profile', { user: userInfo })
    } catch (error) {
        res.send('Terjadi kesalahan saat mengambil data user informasi.')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

app.listen(port, () => {
    console.log('Server is running on port', port)
})
