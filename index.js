const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');
const mongoose = require('mongoose');

const Question = require('./model/Question');

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Db connected');
  })
  .catch(e => console.log(e));

const postQuestion = (req, res, next) => {
  const quest = req.body;
  if (!quest) next('No Body');

  Question.findOneAndUpdate(
    { quest: quest.question },
    {
      quest: quest.question,
      answers: quest.answers,
      correct: quest.correct != null ? quest.correct : -1,
      incorrect: quest.incorrect != null ? [quest.incorrect] : null,
      answeredBy: quest.by,
      answered: quest.correct ? true : false
    },
    { upsert: true },
    (err, doc) => {
      if (err) {
        return res.send({ error: err.message });
      }
      res.end();
    }
  );
};
const getQuestion = (req, res, next) => {
  const quest = req.body;
  if (!quest) next('No Body');
  Question.findOne({ quest: quest.question }, function(err, question) {
    if (err || !question) {
      return res.send({ status: 0 });
    }
    res.send({
      status: 1,
      answers: question.answers,
      correct: question.correct,
      incorrect: question.incorrect,
      answeredBy: question.answeredBy
    });
  });
};

app.use(cors());
app.use(express.json());

app.post('/quiz', postQuestion);
app.post('/quiz2', getQuestion);

app.listen(port, () => console.log(`Server listening on port ${port}!`));
