const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const boardRoster = [
  ['Amrita Bhattacharyya', 'amrita.bhattacharyya', 'coordinator', 'amrita.jpg'],
  ['Vishwesh Shukla', 'vishwesh.shukla', 'student_lead', 'vishwesh.jpg'],
  ['Atanu Das', 'atanu.das', 'operations_lead', 'atanu.jpg'],
  ['Tanishq Singh', 'tanishq.singh', 'operations_lead', 'tanishq.jpg'],
  ['Meghma Boral', 'meghma.boral', 'hr_lead', 'meghma.jpg'],
  ['Pratyusha Bhattacharya', 'pratyusha.bhattacharya', 'hr_lead', 'pratyusha.jpg'],
  ['Shayari Maity', 'shayari.maity', 'assistant_coordinator', 'shayari.jpg'],
  ['Shikhar Modi', 'shikhar.modi', 'assistant_coordinator', 'shikhar.jpg'],
  ['Ananya Roy', 'ananya.roy', 'student_representative', 'ananya.jpg'],
  ['Aprajita Kumari', 'aprajita.kumari', 'hr_member', 'aprajita.jpg'],
  ['Sumedha Chatterjee', 'sumedha.chatterjee', 'hr_member', 'sumedha.jpg'],
  ['Bidisha Dutta', 'bidisha.dutta', 'operations_member', 'bidisha.jpg'],
  ['Ritika P. Pattanaik', 'ritika.p.pattanaik', 'operations_member', 'ritika.jpg'],
  ['Anshuman Kumar', 'anshuman.kumar', 'content_lead', 'anshuman.jpg'],
  ['Tanishaa das', 'tanishaa.das', 'social_media_lead', 'tanishaa.jpg']
];

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to seed the database.');
  }
  const defaultPassword = process.env.BOARD_DEFAULT_PASSWORD || process.env.DEMO_ACCOUNT_PASSWORD;
  if (!defaultPassword || defaultPassword.length < 6) {
    throw new Error('Set BOARD_DEFAULT_PASSWORD or DEMO_ACCOUNT_PASSWORD (at least 6 characters).');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let created = 0;

  for (let index = 0; index < boardRoster.length; index += 1) {
    const [name, username, boardRole, photo] = boardRoster[index];
    const email = `${username}@kiit.ac.in`;
    const existing = await User.findOne({ email });
    if (existing) continue;

    await User.create({
      name,
      email,
      password: defaultPassword,
      rollNumber: `BB-DEMO-${String(index + 1).padStart(3, '0')}`,
      year: 3,
      photo: `/board/${photo}`,
      isBoardMember: true,
      boardRole,
      mustChangePassword: false,
      profileSetupComplete: true
    });
    created += 1;
  }

  console.log(`Board roster seed complete. Created ${created} account(s); no passwords were printed.`);
};

seed()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
