// Persistent token store with MongoDB TTL index and memory fallback for tests.
const crypto = require('crypto');
const mongoose = require('mongoose');
const InstallSession = require('../models/InstallSession');

const DEFAULT_TTL_MINUTES = parseInt(process.env.SCRIPT_TTL_MINUTES || '30', 10);
const DEFAULT_AUDIT_LIMIT = parseInt(process.env.INSTALL_AUDIT_LIMIT || '100', 10);

class ScriptStore {
  constructor() {
    this.memoryStore = new Map();
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  shouldUseMemory() {
    const forced = String(process.env.INSTALL_SESSION_STORE || '').toLowerCase();
    if (forced === 'memory') {
      return true;
    }
    return mongoose.connection.readyState !== 1;
  }

  generateToken() {
    return crypto.randomBytes(24).toString('hex');
  }

  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  isExpired(entry) {
    return Date.now() > new Date(entry.expiresAt).getTime();
  }

  async save({
    script = '',
    data = null,
    ip = '',
    os = '',
    metadata = {},
    ttlMinutes = DEFAULT_TTL_MINUTES,
    oneTime = false,
    runnerNonce,
  }) {
    const token = this.generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    const nonce = runnerNonce || this.generateNonce();

    const payload = {
      token,
      script,
      data,
      ip,
      os,
      metadata,
      createdAt: now,
      expiresAt,
      oneTime,
      runnerNonce: nonce,
      runnerUsed: false,
      status: 'pending',
      events: [],
      lastEventAt: null,
    };

    if (this.shouldUseMemory()) {
      this.memoryStore.set(token, payload);
      return token;
    }

    await InstallSession.create(payload);
    return token;
  }

  async get(token) {
    if (this.shouldUseMemory()) {
      const entry = this.memoryStore.get(token);
      if (!entry) return null;
      if (this.isExpired(entry)) {
        this.memoryStore.delete(token);
        return null;
      }
      return entry;
    }

    const entry = await InstallSession.findOne({ token }).lean();
    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      await InstallSession.deleteOne({ token });
      return null;
    }

    return entry;
  }

  async consume(token) {
    const entry = await this.get(token);
    if (!entry) return null;

    if (entry.oneTime) {
      await this.remove(token);
    }

    return entry;
  }

  async remove(token) {
    if (this.shouldUseMemory()) {
      this.memoryStore.delete(token);
      return;
    }

    await InstallSession.deleteOne({ token });
  }

  async markRunnerUsed(token, nonce, enforceOneTime) {
    if (this.shouldUseMemory()) {
      const entry = await this.get(token);
      if (!entry) return null;
      if (entry.runnerNonce !== nonce) return null;
      if (enforceOneTime && entry.runnerUsed) return null;
      entry.runnerUsed = true;
      entry.runnerUsedAt = new Date();
      this.memoryStore.set(token, entry);
      return entry;
    }

    const query = {
      token,
      runnerNonce: nonce,
    };

    if (enforceOneTime) {
      query.runnerUsed = { $ne: true };
    }

    const entry = await InstallSession.findOneAndUpdate(
      query,
      {
        $set: {
          runnerUsed: true,
          runnerUsedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    return entry;
  }

  async appendEvent(token, event) {
    const nextEvent = {
      eventType: String(event?.eventType || 'info'),
      status: String(event?.status || ''),
      message: String(event?.message || ''),
      toolName: String(event?.toolName || ''),
      stepIndex: Number(event?.stepIndex || 0),
      timestamp: new Date(),
    };

    const status = nextEvent.status && ['running', 'succeeded', 'failed', 'cancelled'].includes(nextEvent.status)
      ? nextEvent.status
      : undefined;

    if (this.shouldUseMemory()) {
      const entry = await this.get(token);
      if (!entry) return false;
      entry.events = Array.isArray(entry.events) ? entry.events : [];
      entry.events.push(nextEvent);
      entry.lastEventAt = nextEvent.timestamp;
      if (status) {
        entry.status = status;
      }
      this.memoryStore.set(token, entry);
      return true;
    }

    const update = {
      $push: { events: nextEvent },
      $set: { lastEventAt: nextEvent.timestamp },
    };

    if (status) {
      update.$set.status = status;
    }

    const result = await InstallSession.updateOne({ token }, update);
    return result.modifiedCount > 0;
  }

  async listAudit({ limit = DEFAULT_AUDIT_LIMIT, status = '', os = '' } = {}) {
    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(Number(limit), 500)) : DEFAULT_AUDIT_LIMIT;

    if (this.shouldUseMemory()) {
      let sessions = Array.from(this.memoryStore.values())
        .filter((entry) => !this.isExpired(entry));

      if (status) {
        sessions = sessions.filter((entry) => entry.status === status);
      }

      if (os) {
        sessions = sessions.filter((entry) => entry.os === os);
      }

      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return sessions.slice(0, safeLimit);
    }

    const filter = {};
    if (status) filter.status = status;
    if (os) filter.os = os;

    return InstallSession.find(filter)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select('token os ip status createdAt expiresAt lastEventAt events')
      .lean();
  }

  cleanup() {
    const now = Date.now();
    for (const [token, entry] of this.memoryStore.entries()) {
      if (now > new Date(entry.expiresAt).getTime()) this.memoryStore.delete(token);
    }
  }
}

module.exports = new ScriptStore();
