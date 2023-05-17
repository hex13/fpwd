const request = require('supertest');
const { makeQuestionRepository } = require('./repositories/question');
const { createApp: createExpressApp } = require('./index');
const { faker } = require('@faker-js/faker')

function createAppAndRepos() {

   module.exports = fileName => (req, res, next) => {
      req.repositories = { questionRepo: makeQuestionRepository(fileName) }
      next()
    }
    let counter = 0;
    const questionRepo = {
      c: () => counter,
      getAnswer: (questionId, answerId) => {
         console.log("C", counter++)
         return (['getAnswer', questionId, answerId]);
      },
      getAnswers: (id) => {
         console.log("C", counter++)
         return (['getAnswers', id])
      },
      addQuestion: jest.fn((a) => {
         console.log("ADD Q", a)
      }),
      getQuestions: () => (['getQuestions']),
      getQuestionById: async (id) => (['getQuestionById', id]),
   }

   const makeRepositories = () => (req, res, next) => {
      req.repositories = {
         questionRepo,
      }
      next()
   } 

   return { app: createExpressApp(makeRepositories), questionRepo };
}


describe('index', () => {
   let app, questionRepo
   beforeEach(() => {
      ({ app, questionRepo } = createAppAndRepos());
   })

   it('GET /', async () => {

      const response = await request(app)
         .get('/')
         .expect('Content-Type', /json/);
   });
   it('GET /questions', async () => {
      const response = await request(app)
         .get('/questions')
         .expect('Content-Type', /json/);
      
      expect(response.body).toEqual(['getQuestions'])
   });
   it('POST /questions should add question', async () => {
      const response = await request(app)
         .post('/questions')
         .send({abc: 'foo'})
         .expect('Content-Type', /json/);
      
      expect(questionRepo.addQuestion.mock.calls).toEqual([[{abc: 'foo'}]])

   });

   it('GET /questions/:questionId', async () => {
      const id = faker.datatype.uuid();
      const response = await request(app)
         .get(`/questions/${id}`)
         .expect('Content-Type', /json/);
      
      const question = response.body;
      expect(question).toEqual(['getQuestionById', id])
   });

   it('GET /questions/:questionId/answers', async () => {
      const questionId = faker.datatype.uuid();
      const response = await request(app)
         .get(`/questions/${questionId}/answers`)
         .expect('Content-Type', /json/);

      const question = response.body;

      expect(question).toEqual(['getAnswers', questionId])
   });

   it('GET /questions/:questionId/answers/:answerId', async () => {
      console.log("-======")
      const questionId = faker.datatype.uuid();
      const answerId = faker.datatype.uuid();
      const response = await request(app)
         .get(`/questions/${questionId}/answers/${answerId}`)
         .expect('Content-Type', /json/);

      const question = response.body;

      expect(question).toEqual(['getAnswer', questionId, answerId])
   });
});