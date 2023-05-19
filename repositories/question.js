const { readFile, writeFile } = require('fs/promises')

const makeQuestionRepository = fileName => {
  let questions
  const load = async () => {
    questions = getQuestions()
  }
  const save = async (questions) => {
    await writeFile(fileName, JSON.stringify(questions, null, 2), { encoding: 'utf-8' })
  };

  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)
    return questions
  }

  const getQuestionById = async (questionId, questions = null) => {
    if (!questions) questions = await getQuestions()
    return questions.find(question => question.id == questionId);
  }
  const addQuestion = async question => {
    const questions = await getQuestions();
    questions.push(question);
    await save(questions);
  }

  const getAnswers = async questionId => {
    const question = await getQuestionById(questionId);
    return question?.answers;
  }
  const getAnswer = async (questionId, answerId) => {
    const answers = await getAnswers(questionId);
    return answers?.find(answer => answer.id == answerId)
  }

  const addAnswer = async (questionId, answer) => {
    const questions = await getQuestions()
    const question = await getQuestionById(questionId, questions)
    question.answers.push(answer)
    await save(questions)
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }
