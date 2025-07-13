const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../../util/expressError.js");
const wrapAsync = require("../../util/wrapAsync.js");
const User = require("../../models/User.js");
const { isLoggedIn } = require("../../middleware.js");






router.post('/fixed', isLoggedIn, wrapAsync(async (req, res) => {
  try {
    const { questionIndex, timestamp } = req.body;

    const user = await User.findById(req.user._id);
    user.quizInteractions = user.quizInteractions || [];

    const existing = user.quizInteractions.find(
      (entry) => entry.questionIndex === Number(questionIndex)
    );

    if (existing) {
      existing.fixed = true;
      existing.fixedTimestamp = timestamp;
    }

    await user.save();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error("Error in /quiz/fixed:", err);
    res.status(500).json({ error: 'Fixed tracking failed.' });
  }
}));

router.post('/mark', isLoggedIn, wrapAsync(async (req, res) => {
  try {
    const { questionIndex, timestamp } = req.body;

    const user = await User.findById(req.user._id);
    user.quizInteractions = user.quizInteractions || [];

    const existing = user.quizInteractions.find(
      (entry) => entry.questionIndex === Number(questionIndex)
    );

    if (existing) {
      existing.marked = !existing.marked;
      existing.markTimestamp = timestamp;
    } else {
      user.quizInteractions.push({
        questionIndex: Number(questionIndex),
        marked: true,
        markTimestamp: timestamp,
      });
    }

    await user.save();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error("Error in /quiz/mark:", err);
    res.status(500).json({ error: 'Mark tracking failed.' });
  }
}));


router.post('/track', isLoggedIn, wrapAsync(async (req, res) => {
  try {
    const { questionIndex, question, type, known, timestamp } = req.body;

    const user = await User.findById(req.user._id);
    user.quizInteractions = user.quizInteractions || [];

    const existing = user.quizInteractions.find(
      (entry) => entry.questionIndex === Number(questionIndex) && entry.type === type
    );

    if (existing) {
      existing.known = known;
      existing.timestamp = timestamp;
    } else {
      user.quizInteractions.push({
        questionIndex: Number(questionIndex),
        question,
        type,
        known,
        timestamp
      });
    }

    await user.save();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error("Error in /quiz/track:", err);
    res.status(500).json({ error: 'Tracking failed.' });
  }
}));


module.exports = router;