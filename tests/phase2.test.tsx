import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  ASSET_LABEL,
  DEFENCE_LAYERS,
  allControls,
  getLayer,
  remainingLayers,
} from '../src/data/defenceLayers';
import { PHASE_2 } from '../src/data/phase2';
import { RISK_SCENARIOS, getScenario } from '../src/data/riskScenarios';
import {
  assign,
  assignedElsewhere,
  correctOptionFor,
  fieldsAsked,
  gradeScenario,
  isComplete,
} from '../src/lib/riskEngine';
import { ControlsView } from '../src/components/ControlsView';
import { ScenarioWorkbench } from '../src/components/ScenarioWorkbench';
import { ControlsFallback2D } from '../src/scenes/ControlsFallback2D';
import { LabView } from '../src/components/LabView';
import { runCommand } from '../src/sim/commands';
import { __setWebGLAvailable } from '../src/lib/webgl';
import { RISK_FIELD_ORDER, type ScenarioAnswer } from '../src/types';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useProgressStore } from '../src/store/useProgressStore';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

/** Build the fully correct answer for a scenario. */
function perfectAnswer(scenarioId: string): ScenarioAnswer {
  const scenario = getScenario(scenarioId)!;
  const answer: ScenarioAnswer = {};
  for (const field of fieldsAsked(scenario)) {
    answer[field] = correctOptionFor(scenario, field)!.id;
  }
  return answer;
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('Phase 2 curriculum', () => {
  it('teaches every concept PROMPT.md lists for this phase', () => {
    const text = PHASE_2.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'confidentiality',
      'integrity',
      'availability',
      'authentication',
      'authorisation',
      'accounting',
      'non-repudiation',
      'least privilege',
      'defence in depth',
      'zero trust',
      'attack surface',
      'threat',
      'vulnerability',
      'exploit',
      'risk',
      'preventive',
      'detective',
      'corrective',
      'physical',
      'technical',
      'administrative',
    ];

    for (const topic of required) {
      expect(text, `Phase 2 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('ships lessons and labs covering the taxonomy, layers, and risk', () => {
    expect(PHASE_2.lessons).toHaveLength(4);
    expect(PHASE_2.labs).toHaveLength(3);
    const labTitles = PHASE_2.labs.map((l) => l.title.toLowerCase());
    expect(labTitles.some((t) => t.includes('classify'))).toBe(true);
    expect(labTitles.some((t) => t.includes('defence in depth'))).toBe(true);
    expect(labTitles.some((t) => t.includes('risk assessment'))).toBe(true);
  });
});

describe('risk scenario data integrity', () => {
  it('exercises all six fields in every scenario', () => {
    for (const scenario of RISK_SCENARIOS) {
      expect(fieldsAsked(scenario), `${scenario.id} does not ask all six fields`).toEqual(
        RISK_FIELD_ORDER
      );
    }
  });

  it('defines exactly one correct option per field', () => {
    for (const scenario of RISK_SCENARIOS) {
      for (const field of RISK_FIELD_ORDER) {
        const matches = scenario.options.filter((o) => o.correctFor === field);
        expect(
          matches,
          `${scenario.id}/${field} has ${matches.length} correct options`
        ).toHaveLength(1);
      }
    }
  });

  it('includes distractors, each with a rationale that teaches something', () => {
    for (const scenario of RISK_SCENARIOS) {
      const distractors = scenario.options.filter((o) => o.correctFor === null);
      expect(distractors.length, `${scenario.id} has no distractors`).toBeGreaterThan(0);
      for (const d of distractors) {
        expect(d.rationale.length, `${scenario.id}/${d.id} rationale too thin`).toBeGreaterThan(40);
      }
    }
  });

  it('gives every option a unique id and a rationale', () => {
    for (const scenario of RISK_SCENARIOS) {
      const ids = scenario.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const o of scenario.options) expect(o.rationale.length).toBeGreaterThan(20);
    }
  });

  it('resolves scenarios by id', () => {
    expect(getScenario('p2-scenario-0')?.title).toBe('The unpatched remote access appliance');
    expect(getScenario('nope')).toBeUndefined();
  });
});

describe('riskEngine grading', () => {
  const scenario = RISK_SCENARIOS[0];

  it('scores a fully correct assessment', () => {
    const result = gradeScenario(scenario, perfectAnswer(scenario.id));
    expect(result.correctCount).toBe(6);
    expect(result.total).toBe(6);
    expect(result.percentage).toBe(100);
  });

  it('scores an empty assessment as zero rather than crashing', () => {
    const result = gradeScenario(scenario, {});
    expect(result.correctCount).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.fields).toHaveLength(6);
  });

  it("explains the learner's own wrong choice, not just the right answer", () => {
    // Deliberately swap threat and vulnerability — the classic confusion.
    const threatOption = correctOptionFor(scenario, 'threat')!;
    const result = gradeScenario(scenario, { vulnerability: threatOption.id });
    const field = result.fields.find((f) => f.field === 'vulnerability')!;

    expect(field.correct).toBe(false);
    // Rationale for the chosen (wrong) option appears first, then the correction.
    expect(field.rationale).toContain('whether or not you are weak');
    expect(field.rationale).toContain('The correct answer is');
  });

  it('says "not answered" when a field was left empty', () => {
    const result = gradeScenario(scenario, {});
    expect(result.fields[0].rationale).toContain('Not answered');
  });

  it('marks a distractor as incorrect wherever it is placed', () => {
    const distractor = scenario.options.find((o) => o.correctFor === null)!;
    for (const field of RISK_FIELD_ORDER) {
      const result = gradeScenario(scenario, { [field]: distractor.id });
      expect(result.fields.find((f) => f.field === field)!.correct).toBe(false);
    }
  });
});

describe('riskEngine shared option pool', () => {
  const scenario = RISK_SCENARIOS[0];

  it('moves an option rather than duplicating it across fields', () => {
    const optionId = scenario.options[0].id;
    let answer: ScenarioAnswer = assign({}, 'asset', optionId);
    expect(answer.asset).toBe(optionId);

    // Assigning the same option elsewhere must clear the original slot — this
    // constraint is what forces the threat/vulnerability decision.
    answer = assign(answer, 'threat', optionId);
    expect(answer.threat).toBe(optionId);
    expect(answer.asset).toBeUndefined();
  });

  it('clears a field when given undefined', () => {
    const answer = assign(assign({}, 'asset', 'o0'), 'asset', undefined);
    expect(answer.asset).toBeUndefined();
  });

  it('reports which options are taken by other fields', () => {
    const answer: ScenarioAnswer = { asset: 'o0', threat: 'o1' };
    const taken = assignedElsewhere(answer, 'threat');

    expect(taken.has('o0')).toBe(true);
    expect(taken.has('o1'), 'a field should not block its own selection').toBe(false);
  });

  it('reports completeness only when every asked field is placed', () => {
    expect(isComplete(scenario, {})).toBe(false);
    expect(isComplete(scenario, { asset: 'o0' })).toBe(false);
    expect(isComplete(scenario, perfectAnswer(scenario.id))).toBe(true);
  });
});

describe('defence layer data', () => {
  it('orders seven layers from outermost to the asset', () => {
    expect(DEFENCE_LAYERS).toHaveLength(7);
    expect(DEFENCE_LAYERS.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shrinks the radius as layers approach the asset', () => {
    const radii = DEFENCE_LAYERS.map((l) => l.radius);
    expect([...radii].sort((a, b) => b - a)).toEqual(radii);
  });

  it('gives every layer controls and a failure explanation', () => {
    for (const l of DEFENCE_LAYERS) {
      expect(l.controls.length, `${l.id} has no controls`).toBeGreaterThan(0);
      expect(l.whenOuterLayersFail.length).toBeGreaterThan(40);
    }
  });

  it('classifies every control on both axes', () => {
    for (const c of allControls()) {
      expect(['preventive', 'detective', 'corrective', 'deterrent']).toContain(c.function);
      expect(['physical', 'technical', 'administrative']).toContain(c.type);
    }
  });

  it('includes the corrective and deterrent controls the taxonomy needs', () => {
    const functions = new Set(allControls().map((c) => c.function));
    expect(functions).toContain('corrective');
    expect(functions).toContain('deterrent');
  });

  it('computes the layers that survive a set of failures', () => {
    expect(remainingLayers(new Set())).toHaveLength(7);
    expect(remainingLayers(new Set(['perimeter']))).toHaveLength(6);
    expect(remainingLayers(new Set(DEFENCE_LAYERS.map((l) => l.id)))).toHaveLength(0);
  });

  it('resolves a layer by id', () => {
    expect(getLayer('data')?.title).toBe('Data');
    expect(getLayer('nope')).toBeUndefined();
  });
});

describe('Phase 2 simulated evidence', () => {
  it('classifies backups as corrective, the most misclassified control', () => {
    const out = runCommand('classify control c-05').output;
    expect(out).toContain('Corrective');
    expect(out).toContain('They prevent nothing');
  });

  it('distinguishes compensating from corrective', () => {
    const out = runCommand('classify control c-12').output;
    expect(out).toContain('Compensating');
    expect(out).toContain('not a weaker synonym');
  });

  it('lists controls on both axes', () => {
    const out = runCommand('list controls').output;
    expect(out).toContain('Preventive');
    expect(out).toContain('Detective');
    expect(out).toContain('Corrective');
    expect(out).toContain('Administrative');
  });

  it('shows attack surface beyond open ports', () => {
    const out = runCommand('show attack surface srv-01').output;
    expect(out).toContain('NON-NETWORK SURFACE');
    expect(out).toContain('World-writable executables');
  });

  it('assesses risk both before and after controls', () => {
    const out = runCommand('assess risk northwind-vpn').output;
    expect(out).toContain('INHERENT RISK');
    expect(out).toContain('RESIDUAL RISK');
    expect(out).toContain('TREATMENT');
  });

  it('keeps the defence layer command consistent with the layer data', () => {
    const out = runCommand('show defense layers').output;
    for (const layer of DEFENCE_LAYERS) {
      expect(out, `layer ${layer.title} missing from the transcript`).toContain(layer.title);
    }
  });
});

describe('ScenarioWorkbench', () => {
  it('renders the first scenario with all six fields', () => {
    renderAt('/scenarios', '/scenarios', <ScenarioWorkbench />);

    expect(screen.getByText('The unpatched remote access appliance')).toBeInTheDocument();
    for (const label of ['Asset', 'Threat', 'Vulnerability', 'Risk', 'Control', 'Residual risk']) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    }
  });

  it('blocks submission until every field is placed', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/scenarios', '/scenarios', <ScenarioWorkbench />);

    const submitButton = screen.getByRole('button', { name: 'Submit assessment' });
    expect(submitButton).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: 'Asset: The patient records system and the 12,000 medical histories it holds',
      })
    );
    expect(screen.getByText('1 of 6 fields placed')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('shows where an assigned option currently sits, and moves it on click', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/scenarios', '/scenarios', <ScenarioWorkbench />);

    const optionText = 'The patient records system and the 12,000 medical histories it holds';
    await user.click(screen.getByRole('button', { name: `Asset: ${optionText}` }));

    // The marker appears on this option wherever else it is offered, so scope
    // the assertion to one field's copy of it.
    const threatCopy = screen.getByRole('button', { name: `Threat: ${optionText}` });
    expect(within(threatCopy).getByText('— currently Asset')).toBeInTheDocument();

    // Clicking it under Threat moves it there rather than being blocked.
    await user.click(threatCopy);
    const assetCopy = screen.getByRole('button', { name: `Asset: ${optionText}` });
    expect(within(assetCopy).getByText('— currently Threat')).toBeInTheDocument();
    // Still exactly one field placed: it moved rather than duplicating.
    expect(screen.getByText('1 of 6 fields placed')).toBeInTheDocument();
  });

  it('grades a perfect assessment and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/scenarios', '/scenarios', <ScenarioWorkbench />);

    const scenario = RISK_SCENARIOS[0];
    for (const field of fieldsAsked(scenario)) {
      const option = correctOptionFor(scenario, field)!;
      const label = `${field === 'residualRisk' ? 'Residual risk' : field[0].toUpperCase() + field.slice(1)}: ${option.text}`;
      await user.click(screen.getByRole('button', { name: label }));
    }

    await user.click(screen.getByRole('button', { name: 'Submit assessment' }));

    expect(screen.getByTestId('scenario-score')).toHaveTextContent('6/6');
    expect(screen.getByText('Debrief')).toBeInTheDocument();
    expect(useMasteryStore.getState().getLevel('risk')).toBe(1);
  });

  it('does not credit mastery when a field is wrong', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/scenarios', '/scenarios', <ScenarioWorkbench />);

    const scenario = RISK_SCENARIOS[0];
    const fields = fieldsAsked(scenario);

    // Fill five fields correctly, then put a distractor under vulnerability.
    // A distractor is used deliberately: placing another field's correct option
    // there would MOVE it and leave that field empty, blocking submission.
    for (const field of fields.filter((f) => f !== 'vulnerability')) {
      const option = correctOptionFor(scenario, field)!;
      const label = `${field === 'residualRisk' ? 'Residual risk' : field[0].toUpperCase() + field.slice(1)}: ${option.text}`;
      await user.click(screen.getByRole('button', { name: label }));
    }
    const distractor = scenario.options.find((o) => o.correctFor === null)!;
    await user.click(screen.getByRole('button', { name: `Vulnerability: ${distractor.text}` }));

    await user.click(screen.getByRole('button', { name: 'Submit assessment' }));

    expect(screen.getByTestId('scenario-score')).toHaveTextContent('5/6');
    expect(useMasteryStore.getState().getLevel('risk')).toBe(0);
  });

  it('switches between scenarios and clears the previous answer', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/scenarios', '/scenarios', <ScenarioWorkbench />);

    await user.click(
      screen.getByRole('button', { name: /2\. The finance department wire transfer/ })
    );
    expect(screen.getByText(/Harbour Logistics/)).toBeInTheDocument();
    expect(screen.getByText('0 of 6 fields placed')).toBeInTheDocument();
  });
});

describe('ControlsView', () => {
  it('falls back to the 2D layer diagram when WebGL is unavailable', () => {
    renderAt('/controls', '/controls', <ControlsView />);
    expect(screen.getByTestId('controls-fallback-2d')).toBeInTheDocument();
    expect(screen.getByText(/WebGL is unavailable/)).toBeInTheDocument();
  });

  it('starts with every layer protecting the asset', () => {
    renderAt('/controls', '/controls', <ControlsView />);
    expect(screen.getByTestId('remaining-layers')).toHaveTextContent('7 of 7');
  });

  it('drops a failed layer while the rest keep protecting the asset', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/controls', '/controls', <ControlsView />);

    await user.click(screen.getByRole('button', { name: 'Fail the Perimeter layer' }));

    expect(screen.getByTestId('remaining-layers')).toHaveTextContent('6 of 7');
    expect(screen.getByText(/still behind/)).toBeInTheDocument();
  });

  it('reports full exposure only when every layer has failed', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/controls', '/controls', <ControlsView />);

    for (const layer of DEFENCE_LAYERS) {
      await user.click(screen.getByRole('button', { name: `Fail the ${layer.title} layer` }));
    }

    expect(screen.getByTestId('remaining-layers')).toHaveTextContent('0 of 7');
    expect(screen.getByText(/fully exposed/)).toBeInTheDocument();
  });

  it('restores every failed layer', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/controls', '/controls', <ControlsView />);

    await user.click(screen.getByRole('button', { name: 'Fail the Data layer' }));
    await user.click(screen.getByRole('button', { name: 'Restore all' }));

    expect(screen.getByTestId('remaining-layers')).toHaveTextContent('7 of 7');
  });

  it('shows a selected layer with its controls classified on both axes', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/controls', '/controls', <ControlsView />);

    await user.click(screen.getByRole('button', { name: '7. Data' }));

    expect(screen.getByRole('heading', { name: 'Layer 7 — Data' })).toBeInTheDocument();

    // Scope to the control list — the explanatory card also uses the word.
    const backup = screen.getByText('Automated backup restore').closest('li')!;
    expect(within(backup).getByText('corrective')).toBeInTheDocument();
    expect(within(backup).getByText(/technical/)).toBeInTheDocument();
  });
});

describe('ControlsFallback2D', () => {
  it('renders one accessible control per layer plus the asset', () => {
    render(<ControlsFallback2D selectedId={null} failedIds={[]} onSelect={() => {}} />);

    expect(screen.getAllByRole('button', { name: /^Inspect layer / })).toHaveLength(
      DEFENCE_LAYERS.length
    );
    expect(screen.getByText(ASSET_LABEL)).toBeInTheDocument();
  });

  it('marks failed layers in its accessible name', () => {
    render(<ControlsFallback2D selectedId={null} failedIds={['perimeter']} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Perimeter, failed/ })).toBeInTheDocument();
  });
});

describe('Phase 2 labs run end to end', () => {
  it('advances the control classification lab and teaches the backup trap', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p2-lab-0', '/lab/:labId', <LabView />);

    const input = screen.getByLabelText('Simulated command input');
    await user.type(input, 'list controls{Enter}');
    await user.type(input, 'classify control c-05{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/They prevent nothing/)).toBeInTheDocument();
  });

  it('runs the risk assessment lab and shows inherent and residual risk', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p2-lab-2', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'assess risk northwind-vpn{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/INHERENT RISK\s+HIGH/)).toBeInTheDocument();
    expect(within(transcript).getByText(/RESIDUAL RISK\s+MODERATE/)).toBeInTheDocument();
  });
});
