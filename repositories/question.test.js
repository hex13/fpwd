const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

const createTestQuestions = () => [
  {
    "id": "50f9e662-fa0e-4ec7-b53b-7845e8f821c3",
    "author": "John Stockton",
    "summary": "What is the shape of the Earth?",
    "answers": [
      {
        "id": "ce7bddfb-0544-4b14-92d8-188b03c41ee4",
        "author": "Brian McKenzie",
        "summary": "The Earth is flat."
      },
      {
        "id": "d498c0a3-5be2-4354-a3bc-78673aca0f31",
        "author": "Dr Strange",
        "summary": "It is egg-shaped."
      }
    ]
  },
  {
    "id": "00f3dd43-ae53-4430-8da1-b722e034c73d",
    "author": "Sarah Nickle",
    "summary": "Who let the dogs out?",
    "answers": []
  }
];

describe('question repository', () => {
  let testQuestionsFilePath
  let questionRepo
  let testQuestions

  const writeQuestions = async (questions) => {
    await writeFile(testQuestionsFilePath, JSON.stringify(questions))
  }

  beforeEach(async () => {
    testQuestionsFilePath = 'mock-questions-' + faker.datatype.uuid()
    testQuestions = createTestQuestions()
    questionRepo = makeQuestionRepository(testQuestionsFilePath)
    await writeQuestions([])
  })

  afterEach(async () => {
    await rm(testQuestionsFilePath)
  })

  test('should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('should return a list of 2 questions', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ]

    await writeQuestions(testQuestions);

    expect(await questionRepo.getQuestions()).toHaveLength(2)
  })

  test('should return question by id', async () => {
    const expectedQuestion = {
      id: faker.datatype.uuid(),
      summary: 'What is my name?',
      author: 'Jack London',
      answers: []
    };

    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Robert De Niro',
        answers: []
      },
      expectedQuestion,
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ]

    await writeQuestions(testQuestions);
    const question = await questionRepo.getQuestionById(expectedQuestion.id);
    expect(question).toStrictEqual(expectedQuestion);
  })

  test('should return undefined where there\'s no question', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Robert De Niro',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ]

    await writeQuestions(testQuestions)
    const question = await questionRepo.getQuestionById('non existing')
    expect(question).toBe(undefined);
  })

  test('getAnswers() should return answers', async () => {
    await writeQuestions(createTestQuestions());
    const id = createTestQuestions()[0].id;
    const answers = await questionRepo.getAnswers(id)
    expect(answers).toStrictEqual(createTestQuestions()[0].answers);
  })

  test('getAnswers() should return undefined', async () => {
    await writeQuestions(createTestQuestions());
    const id = createTestQuestions()[0].id;
    const answers = await questionRepo.getAnswers('foo')
    expect(answers).toBe(undefined);
  })

  test('getAnswer() should return answer', async () => {
    await writeQuestions(createTestQuestions());
    const questionId = createTestQuestions()[0].id;
    const answer = await questionRepo.getAnswer(questionId, "d498c0a3-5be2-4354-a3bc-78673aca0f31")
    expect(answer).toStrictEqual({
      "id": "d498c0a3-5be2-4354-a3bc-78673aca0f31",
      "author": "Dr Strange",
      "summary": "It is egg-shaped."
    })
  })
  
  test('getAnswer() should return undefined', async () => {
    await writeQuestions(createTestQuestions());
    expect(await questionRepo.getAnswer("bar", "00f3dd43-ae53-4430-8da1-b722e034c73d")).toBe(undefined);
  })

  test('addQuestion() should add question, addAnswer() should add answer', async () => {
    const questionId = '6c561c0c-a289-4336-950f-476c5fc36e12';
    const answerId = '7b8c408e-2a59-447c-a3ca-b218c54e6a92';
    const createTestQuestion = () => ({
      id: questionId,
      author: 'Elon Musk',
      summary: 'When will you fly to Mars?',
      answers: [],
    })
    const createTestAnswer = () => ({
      id: answerId,
      author: 'Elon Musk',
      summary: 'Tomorrow',
    })

    await writeQuestions(createTestQuestions())
    await questionRepo.addQuestion(createTestQuestion())
    expect(await questionRepo.getQuestionById(questionId)).toStrictEqual(createTestQuestion())
    
    await questionRepo.addAnswer(questionId, createTestAnswer())

    expect(await questionRepo.getAnswer(questionId, answerId)).toStrictEqual(createTestAnswer())
    expect(await questionRepo.getQuestionById(questionId)).toStrictEqual({
      ...createTestQuestion(),
      answers: [createTestAnswer()]
    })

  })

})
