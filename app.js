const express = require('express')
const { urlencoded, json } = require('body-parser')

exports.createApp = makeRepositories => {
  const app = express()

  app.use(urlencoded({ extended: true }))
  app.use(json())
  app.use(makeRepositories())

  app.get('/', (_, res) => {
    res.json({ message: 'Welcome to responder!' })
  })

  app.get('/questions', async (req, res) => {
    const questions = await req.repositories.questionRepo.getQuestions()
    res.json(questions)
  })

  app.get('/questions/:questionId', async (req, res) => {
    const question = await req.repositories.questionRepo.getQuestionById(
      req.params.questionId
    )
    res.json(question)
  })

  app.post('/questions', async (req, res) => {
    await req.repositories.questionRepo.addQuestion(req.body)
    res.json({})
  })

  app.get('/questions/:questionId/answers', async (req, res) => {
    res.json(
      await req.repositories.questionRepo.getAnswers(req.params.questionId)
    )
  })

  app.post('/questions/:questionId/answers', async (req, res) => {
    await req.repositories.questionRepo.addAnswer(
      req.params.questionId,
      req.body
    )
    res.json({})
  })

  app.get('/questions/:questionId/answers/:answerId', async (req, res) => {
    const { questionId, answerId } = req.params
    res.json(
      await req.repositories.questionRepo.getAnswer(questionId, answerId)
    )
  })

  return app
}
