import { AuditLog } from '../models/AuditLog';
import { IUser } from '../models/User';
import { Request } from 'express';

interface AuditParams {
  action: string;
  entity: string;
  entityId: string;
  actor: IUser;
  before?: Record<string, any>;
  after?: Record<string, any>;
  req?: Request;
}

export const logAudit = async ({
  action,
  entity,
  entityId,
  actor,
  before,
  after,
  req,
}: AuditParams): Promise<void> => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      actorId: actor._id,
      actorRole: actor.role,
      before,
      after,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging shouldn't break the main operation
  }
};

// Helper for common actions
export const auditActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  COMPLETE: 'COMPLETE',
  CANCEL: 'CANCEL',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
};
