import { describe, expect, it } from 'vitest';
import { listCommands, normaliseCommand, runCommand, SIM_COMMANDS } from '../src/sim/commands';
import {
  advance,
  completionPercent,
  goToStep,
  load,
  reset,
  step,
  transcriptToEvidence,
  verify,
} from '../src/sim/engine';
import { PHASE_0 } from '../src/data/curriculum';

const lab = PHASE_0.labs[1]; // "First Triage — Host Command Line"

describe('command simulator safety', () => {
  it('refuses anything outside the allowlist instead of executing it', () => {
    const out = runCommand('rm -rf /');
    expect(out.recognised).toBe(false);
    expect(out.output).toContain('not part of');
    expect(out.output).toContain('no command is ever executed');
  });

  it('treats shell metacharacters as plain unrecognised text', () => {
    for (const attempt of ['whoami; rm -rf /', 'whoami && curl http://example.com', '$(whoami)']) {
      expect(runCommand(attempt).recognised).toBe(false);
    }
  });

  it('normalises case and whitespace', () => {
    expect(normaliseCommand('  IPCONFIG   /ALL ')).toBe('ipconfig /all');
    expect(runCommand('  IPCONFIG   /ALL ').recognised).toBe(true);
  });

  it('labels every prepared output with a provenance', () => {
    for (const cmd of SIM_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(cmd.provenance);
    }
  });

  it('contains no credentials, keys, or tokens in any prepared output', () => {
    const forbidden = [
      /password\s*[:=]/i,
      /api[_-]?key/i,
      /secret\s*[:=]/i,
      /BEGIN [A-Z ]*PRIVATE KEY/,
      // An actual bearer credential is a long opaque string in an Authorization
      // header. Matching any word after "bearer" flags correct prose explaining
      // what a bearer token is, which Phase 5 legitimately contains.
      /bearer\s+[A-Za-z0-9._~+/-]{20,}/,
    ];
    for (const cmd of SIM_COMMANDS) {
      for (const pattern of forbidden) {
        expect(cmd.output, `${cmd.match} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('exposes every allowlisted command to the help listing', () => {
    expect(listCommands()).toHaveLength(SIM_COMMANDS.length);
  });
});

describe('lab runner', () => {
  it('starts with the first step active and the rest pending', () => {
    const state = load(lab);
    expect(state.cursor).toBe(0);
    expect(state.stepStatus[0]).toBe('active');
    expect(state.stepStatus.slice(1).every((s) => s === 'pending')).toBe(true);
    expect(state.transcript).toHaveLength(0);
  });

  it('auto-advances when the run command matches the current step', () => {
    const state = load(lab);
    const { state: next } = step(state, lab, lab.steps[0].command!);

    expect(next.stepStatus[0]).toBe('done');
    expect(next.cursor).toBe(1);
    expect(next.transcript).toHaveLength(1);
  });

  it('records unrecognised commands without advancing', () => {
    const state = load(lab);
    const { state: next, output } = step(state, lab, 'not-a-real-command');

    expect(output.recognised).toBe(false);
    expect(next.cursor).toBe(0);
    expect(next.transcript).toHaveLength(1);
  });

  it('does not advance on a recognised command for a different step', () => {
    const state = load(lab);
    const { state: next } = step(state, lab, 'sudo -l');
    expect(next.cursor).toBe(0);
  });

  it('is deterministic — same state and input yields the same output', () => {
    const state = load(lab, 0);
    const a = step(state, lab, 'netstat -ano', 0);
    const b = step(state, lab, 'netstat -ano', 0);
    expect(a.output).toEqual(b.output);
    expect(a.state.transcript).toEqual(b.state.transcript);
  });

  it('marks the lab complete once every step is advanced', () => {
    let state = load(lab, 0);
    for (let i = 0; i < lab.steps.length; i++) state = advance(state, lab, 0);

    expect(state.cursor).toBe(lab.steps.length);
    expect(state.completedAt).toBe(0);
    expect(completionPercent(state)).toBe(100);
  });

  it('ignores advancing past the final step', () => {
    let state = load(lab);
    for (let i = 0; i < lab.steps.length + 3; i++) state = advance(state, lab);
    expect(state.cursor).toBe(lab.steps.length);
  });

  it('jumps to a step without discarding completed work', () => {
    let state = load(lab);
    state = advance(state, lab);
    state = goToStep(state, 4, lab);

    expect(state.cursor).toBe(4);
    expect(state.stepStatus[0]).toBe('done');
    expect(state.stepStatus[4]).toBe('active');
  });

  it('rejects an out-of-range step index', () => {
    const state = load(lab);
    expect(goToStep(state, 99, lab)).toBe(state);
    expect(goToStep(state, -1, lab)).toBe(state);
  });

  it('resets back to the initial state', () => {
    const pristine = load(lab, 0);
    const worked = step(pristine, lab, 'ipconfig /all', 0).state;

    expect(worked).not.toEqual(pristine);
    expect(reset(lab, 0)).toEqual(pristine);
  });
});

describe('verification', () => {
  it('fails a lab that was never worked', () => {
    const result = verify(load(lab), lab);
    expect(result.passed).toBe(false);
    expect(result.checks.some((c) => !c.passed)).toBe(true);
  });

  it('fails when steps are complete but nothing was run in the simulator', () => {
    let state = load(lab);
    for (let i = 0; i < lab.steps.length; i++) state = advance(state, lab);

    const result = verify(state, lab);
    expect(result.passed).toBe(false);
    expect(result.checks.find((c) => c.label.includes('At least one command'))?.passed).toBe(false);
  });

  it('passes once every step is done and a command was run', () => {
    let state = load(lab);
    state = step(state, lab, lab.steps[0].command!).state;
    while (state.cursor < lab.steps.length) state = advance(state, lab);

    const result = verify(state, lab);
    expect(result.passed).toBe(true);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it('includes every declared verification criterion', () => {
    const result = verify(load(lab), lab);
    for (const v of lab.verification) {
      expect(result.checks.map((c) => c.label)).toContain(v);
    }
  });
});

describe('transcriptToEvidence', () => {
  it('reports an empty transcript explicitly', () => {
    expect(transcriptToEvidence(load(lab))).toBe('(no commands run)');
  });

  it('renders the command, its provenance, and its output', () => {
    const state = step(load(lab), lab, 'whoami').state;
    const text = transcriptToEvidence(state);

    expect(text).toContain('$ whoami');
    expect(text).toContain('[PREPARED]');
    expect(text).toContain('analyst1');
  });
});
