const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

test('new accounts require one-time profile and password setup', () => {
  const user = new User({
    name: 'Test Member',
    email: 'test@kiit.ac.in',
    password: 'test-password',
    rollNumber: 'TEST123',
    year: 1
  });

  assert.equal(user.mustChangePassword, true);
  assert.equal(user.profileSetupComplete, false);
});

test('attendance model has a unique GBM/member index', () => {
  assert.deepEqual(Attendance.schema.indexes()[0][0], { gbm: 1, member: 1 });
  assert.equal(Attendance.schema.indexes()[0][1].unique, true);
});
