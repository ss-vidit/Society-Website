const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const Recruitment = require('../models/Recruitment');
const Notification = require('../models/Notification');
const GBM = require('../models/GBM');
const authController = require('../controllers/authController');
const recruitmentController = require('../controllers/recruitmentController');
const notificationController = require('../controllers/notificationController');
const gbmController = require('../controllers/gbmController');

const responseRecorder = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  return response;
};

test('create-member rejects missing required fields with a client error', async () => {
  const response = responseRecorder();
  await authController.createMember({ body: {} }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test('stopping recruitment keeps the form link and saved applicants', async (t) => {
  const applicants = [{ name: 'Test Applicant' }];
  const doc = {
    isLive: true,
    formLink: 'https://forms.gle/example',
    applicants,
    save: async () => {}
  };
  const originalFindOne = Recruitment.findOne;
  t.after(() => { Recruitment.findOne = originalFindOne; });
  Recruitment.findOne = () => ({ sort: async () => doc });

  const response = responseRecorder();
  await recruitmentController.toggleRecruitment(
    { body: { isLive: false }, user: { _id: 'board-user' } },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.equal(doc.isLive, false);
  assert.equal(doc.formLink, 'https://forms.gle/example');
  assert.deepEqual(doc.applicants, applicants);
});

test('granting member access rejects a short temporary password', async (t) => {
  const applicant = { name: 'Test Applicant', email: 'test@example.com', rollNumber: 'TEST123' };
  const doc = { applicants: { id: () => applicant } };
  const originalFindOne = Recruitment.findOne;
  const originalUserFindOne = User.findOne;
  t.after(() => {
    Recruitment.findOne = originalFindOne;
    User.findOne = originalUserFindOne;
  });
  Recruitment.findOne = () => ({ sort: async () => doc });
  User.findOne = async () => null;

  const response = responseRecorder();
  await recruitmentController.grantMemberAccess(
    { params: { applicantId: 'applicant-id' }, body: { password: 'short' } },
    response
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test('mark-read returns not found for a notification the user cannot access', async (t) => {
  const originalUpdateOne = Notification.updateOne;
  t.after(() => { Notification.updateOne = originalUpdateOne; });
  Notification.updateOne = async () => ({ matchedCount: 0 });

  const response = responseRecorder();
  await notificationController.markAsRead(
    { params: { id: '507f1f77bcf86cd799439011' }, user: { _id: 'member-user' } },
    response
  );

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.success, false);
});

test('mark-read rejects malformed notification IDs', async () => {
  const response = responseRecorder();
  await notificationController.markAsRead(
    { params: { id: 'not-an-object-id' }, user: { _id: 'member-user' } },
    response
  );
  assert.equal(response.statusCode, 400);
});

test('attendance rejects non-boolean present values', async (t) => {
  const originalFindById = GBM.findById;
  t.after(() => { GBM.findById = originalFindById; });
  GBM.findById = async () => ({ _id: 'gbm-id' });

  const response = responseRecorder();
  await gbmController.markAttendance(
    {
      params: { id: 'gbm-id' },
      body: { records: [{ memberId: 'member-id', present: 'false' }] },
      user: { _id: 'board-user' }
    },
    response
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});
