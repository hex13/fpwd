const { createApp } = require('./app')
const makeRepositories = require('./middleware/repositories');

const PORT = 3000
const STORAGE_FILE_PATH = 'questions.json'

const app = createApp(() => makeRepositories(STORAGE_FILE_PATH));
app.listen(PORT, () => {
    console.log(`Responder app listening on port ${PORT}`)
})
