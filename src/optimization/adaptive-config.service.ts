import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface PendingChange {
  id: string;
  parameter: string;
  currentValue: unknown;
  proposedValue: unknown;
  changePct: number;
  proposedAt: string;
  requiresApproval: boolean;
}

@Injectable()
export class AdaptiveConfigService {
  private readonly logger = new Logger(AdaptiveConfigService.name);
  private readonly pending: PendingChange[] = [];

  getPending(): PendingChange[] {
    return [...this.pending];
  }

  propose(parameter: string, currentValue: unknown, proposedValue: unknown): PendingChange {
    const current = Number(currentValue);
    const proposed = Number(proposedValue);

    let changePct = 0;
    if (!isNaN(current) && !isNaN(proposed) && current !== 0) {
      changePct = Math.abs(((proposed - current) / current) * 100);
    }

    const change: PendingChange = {
      id: randomUUID(),
      parameter,
      currentValue,
      proposedValue,
      changePct,
      proposedAt: new Date().toISOString(),
      requiresApproval: Math.abs(changePct) > 20,
    };

    this.pending.push(change);
    this.logger.log(`Proposed config change: ${parameter} (${changePct.toFixed(1)}% change, requiresApproval=${change.requiresApproval})`);
    return change;
  }

  approve(id: string): boolean {
    const idx = this.pending.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const change = this.pending.splice(idx, 1)[0];
    this.logger.log(`Adaptive config approved: ${change.parameter} → ${JSON.stringify(change.proposedValue)}`);
    return true;
  }

  reject(id: string): boolean {
    const idx = this.pending.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const change = this.pending.splice(idx, 1)[0];
    this.logger.log(`Adaptive config rejected: ${change.parameter} (id=${id})`);
    return true;
  }
}
