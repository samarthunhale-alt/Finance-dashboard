import Activity from '../models/Activity.js';

/** Fire-and-forget audit trail entry. Never blocks or fails a request. */
export function logActivity(userId, action, meta = {}) {
  Activity.create({ user: userId, action, meta }).catch((err) =>
    console.error('Failed to log activity:', err.message)
  );
}
