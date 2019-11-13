const mongoose = require('mongoose');

const Question = new mongoose.Schema({
  quest: { type: String, required: true, unique: true },
  answered: { type: Boolean, default: false },
  answers: [String],
  correct: { type: Number, default: -1 },
  incorrect: [Number],
  answeredBy: { type: String, default: null }
});

var validateUpdate = async function(next) {
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (!docToUpdate) next();

  if (docToUpdate.answered) {
    next(new Error('Question already answered.'));
  }

  if (this._update.correct == -1) {
    if (docToUpdate.incorrect.includes(this._update.incorrect[0])) {
      next(new Error('Incorrect answer already in database.'));
    } else {
      this.set({
        incorrect: docToUpdate.incorrect.push(this._update.incorrect)
      });
    }
  }

  next();
};

Question.pre('findOneAndUpdate', validateUpdate);

module.exports = mongoose.model('Question', Question);
