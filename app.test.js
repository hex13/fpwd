const request = require('supertest')
const { createApp: createExpressApp } = require('./app')
const { faker } = require('@faker-js/faker')

function createAppAndRepos() {
  const questionRepo = {
    getAnswer: (questionId, answerId) => {
      return ['getAnswer', questionId, answerId]
    },
    getAnswers: id => {
      return ['getAnswers', id]
    },
    addQuestion: jest.fn(() => {}),
    addAnswer: jest.fn(() => {}),
    getQuestions: () => ['getQuestions'],
    getQuestionById: async id => ['getQuestionById', id]
  }

  const makeRepositories = () => (req, res, next) => {
    req.repositories = {
      questionRepo
    }
    next()
  }

  return { app: createExpressApp(makeRepositories), questionRepo }
}

describe('index', () => {
  let app, questionRepo
  beforeEach(() => {
    ;({ app, questionRepo } = createAppAndRepos())
  })

  it('GET /', async () => {
    const response = await request(app).get('/').expect('Content-Type', /json/)
  })
  it('GET /questions', async () => {
    const response = await request(app)
      .get('/questions')
      .expect('Content-Type', /json/)

    expect(response.body).toEqual(['getQuestions'])
  })
  it('POST /questions should add question', async () => {
    await request(app)
      .post('/questions')
      .send({ abc: 'foo' })
      .expect('Content-Type', /json/)

    expect(questionRepo.addQuestion.mock.calls).toEqual([[{ abc: 'foo' }]])
  })
  it('POST /questions/:questionId/answers should add answer', async () => {
    const questionId = faker.datatype.uuid()
    await request(app)
      .post(`/questions/${questionId}/answers`)
      .send({ abc: 'foo' })
      .expect('Content-Type', /json/)

    expect(questionRepo.addAnswer.mock.calls).toEqual([
      [questionId, { abc: 'foo' }]
    ])
  })

  it('GET /questions/:questionId', async () => {
    const id = faker.datatype.uuid()
    const response = await request(app)
      .get(`/questions/${id}`)
      .expect('Content-Type', /json/)

    const question = response.body
    expect(question).toEqual(['getQuestionById', id])
  })

  it('GET /questions/:questionId/answers', async () => {
    const questionId = faker.datatype.uuid()
    const response = await request(app)
      .get(`/questions/${questionId}/answers`)
      .expect('Content-Type', /json/)

    const question = response.body

    expect(question).toEqual(['getAnswers', questionId])
  })

  it('GET /questions/:questionId/answers/:answerId', async () => {
    const questionId = faker.datatype.uuid()
    const answerId = faker.datatype.uuid()
    const response = await request(app)
      .get(`/questions/${questionId}/answers/${answerId}`)
      .expect('Content-Type', /json/)

    const question = response.body

    expect(question).toEqual(['getAnswer', questionId, answerId])
  })
})
