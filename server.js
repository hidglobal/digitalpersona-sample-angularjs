const express = require('express')
const path = require('path')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, './out/public')))

//app.get('/', (req, res) => res.redirect('/main'))
//app.get('/main', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')))

app.listen(3000, () => console.log('Listening on port 3000!'))

