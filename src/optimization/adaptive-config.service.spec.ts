import { AdaptiveConfigService } from './adaptive-config.service';

describe('AdaptiveConfigService', () => {
  let service: AdaptiveConfigService;

  beforeEach(() => {
    service = new AdaptiveConfigService();
  });

  it('propose with 15% change → requiresApproval false', () => {
    const change = service.propose('spam_threshold', 100, 115);
    expect(change.changePct).toBeCloseTo(15, 5);
    expect(change.requiresApproval).toBe(false);
  });

  it('propose with 25% change → requiresApproval true', () => {
    const change = service.propose('spam_threshold', 100, 125);
    expect(change.changePct).toBeCloseTo(25, 5);
    expect(change.requiresApproval).toBe(true);
  });

  it('proposed change appears in getPending()', () => {
    service.propose('yara_rules_version', 1, 2);
    expect(service.getPending()).toHaveLength(1);
  });

  it('approve existing id → returns true and removes from pending', () => {
    const change = service.propose('spam_threshold', 50, 60);
    const result = service.approve(change.id);
    expect(result).toBe(true);
    expect(service.getPending()).toHaveLength(0);
  });

  it('approve nonexistent id → returns false', () => {
    const result = service.approve('00000000-0000-0000-0000-000000000000');
    expect(result).toBe(false);
  });

  it('reject existing id → returns true and removes from pending', () => {
    const change = service.propose('spam_threshold', 50, 80);
    const result = service.reject(change.id);
    expect(result).toBe(true);
    expect(service.getPending()).toHaveLength(0);
  });

  it('reject nonexistent id → returns false', () => {
    const result = service.reject('00000000-0000-0000-0000-000000000000');
    expect(result).toBe(false);
  });

  it('getPending returns a copy — mutations do not affect internal state', () => {
    service.propose('p', 1, 2);
    const list = service.getPending();
    list.pop();
    expect(service.getPending()).toHaveLength(1);
  });

  it('propose stores correct metadata', () => {
    const before = new Date();
    const change = service.propose('yara_rules_version', 3, 4);
    const after = new Date();
    expect(change.parameter).toBe('yara_rules_version');
    expect(change.currentValue).toBe(3);
    expect(change.proposedValue).toBe(4);
    const proposedAt = new Date(change.proposedAt);
    expect(proposedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(proposedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(change.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
