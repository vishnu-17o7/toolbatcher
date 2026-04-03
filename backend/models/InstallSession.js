const mongoose = require('mongoose');

const installEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, default: 'info' },
    status: { type: String, default: '' },
    message: { type: String, default: '' },
    toolName: { type: String, default: '' },
    stepIndex: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const installSessionSchema = new mongoose.Schema({
  token: { type: String, unique: true, index: true, required: true },
  script: { type: String, default: '' },
  data: { type: mongoose.Schema.Types.Mixed, default: null },
  ip: { type: String, default: '' },
  os: {
    type: String,
    enum: ['linux', 'macos', 'windows', ''],
    default: '',
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  oneTime: { type: Boolean, default: false },
  runnerNonce: { type: String, default: '' },
  runnerUsed: { type: Boolean, default: false },
  runnerUsedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['pending', 'running', 'succeeded', 'failed', 'cancelled'],
    default: 'pending',
  },
  events: { type: [installEventSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastEventAt: { type: Date, default: null },
  expiresAt: { type: Date, index: { expires: 0 }, required: true },
});

module.exports = mongoose.model('InstallSession', installSessionSchema);