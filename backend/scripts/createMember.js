const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createMember = async () => {
  const { NEW_MEMBER_NAME, NEW_MEMBER_EMAIL, NEW_MEMBER_ROLL_NUMBER, NEW_MEMBER_YEAR } = process.env;
  const password = process.env.NEW_MEMBER_PASSWORD || process.env.DEMO_ACCOUNT_PASSWORD;
  const year = Number(NEW_MEMBER_YEAR);

  if (!NEW_MEMBER_NAME || !NEW_MEMBER_EMAIL || !NEW_MEMBER_ROLL_NUMBER) {
    throw new Error('Set NEW_MEMBER_NAME, NEW_MEMBER_EMAIL, NEW_MEMBER_ROLL_NUMBER, and NEW_MEMBER_YEAR.');
  }
  if (!password || password.length < 6 || ![1, 2, 3, 4].includes(year)) {
    throw new Error('Password must be at least 6 characters and year must be from 1 to 4.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({
    $or: [
      { email: NEW_MEMBER_EMAIL.trim().toLowerCase() },
      { rollNumber: NEW_MEMBER_ROLL_NUMBER.trim() }
    ]
  });
  if (existing) {
    throw new Error('An account already exists with that email or roll number.');
  }

  const user = await User.create({
    name: NEW_MEMBER_NAME.trim(),
    email: NEW_MEMBER_EMAIL.trim().toLowerCase(),
    password,
    rollNumber: NEW_MEMBER_ROLL_NUMBER.trim(),
    year,
    isBoardMember: false,
    mustChangePassword: true
  });

  console.log(`Created member account: ${user.email}`);
  console.log('The account must complete first-login profile setup.');
};

createMember()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
