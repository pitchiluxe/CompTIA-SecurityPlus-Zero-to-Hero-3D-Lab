import type { MasteryLevel } from '../types';
import { WEAK_THRESHOLD } from './srs';
import {
  IAM_BRIDGE_TOPICS,
  IAM_VENDORS,
  VENDOR_MAPPING_ITEMS,
  type IamBridgeTopic,
  type IamVendor,
  type VendorMappingItem,
} from '../data/iamBridge';

// ---------------------------------------------------------------------------
// Phase 27 — Security+ to IAM Career Bridge engine.
//
// Pure functions over the bridge data plus the learner's existing mastery
// levels. Two jobs:
//
//   1. Continuously connect — given any conceptId a lesson already teaches,
//      return the IAM bridge topics that concept feeds into. This is what lets
//      the bridge surface inside earlier phases instead of living only on its
//      own page.
//
//   2. Concepts before vendors — PROMPT.md's rule ("teach the underlying
//      concepts before vendor-specific implementations") is enforced here, as
//      a gate: a vendor's detail stays locked until every prerequisite concept
//      is above the same weak-area threshold the rest of the platform uses.
// ---------------------------------------------------------------------------

export type GetLevel = (conceptId: string) => MasteryLevel;

function average(levels: number[]): number {
  return levels.length === 0 ? 0 : levels.reduce((sum, l) => sum + l, 0) / levels.length;
}

// --------------------------- Continuous connection --------------------------

/**
 * Bridge topics that a given concept feeds into. Empty for concepts with no
 * identity dimension — the bridge stays quiet rather than inventing a link.
 */
export function topicsForConcept(
  conceptId: string,
  topics: IamBridgeTopic[] = IAM_BRIDGE_TOPICS
): IamBridgeTopic[] {
  return topics.filter((t) => t.conceptIds.includes(conceptId));
}

/** Bridge topics reachable from any of a lesson's concepts, de-duplicated and in topic order. */
export function topicsForConcepts(
  conceptIds: string[],
  topics: IamBridgeTopic[] = IAM_BRIDGE_TOPICS
): IamBridgeTopic[] {
  const wanted = new Set(conceptIds);
  return topics.filter((t) => t.conceptIds.some((c) => wanted.has(c)));
}

// ------------------------------ Topic readiness -----------------------------

export type TopicAssessment = {
  topicId: string;
  title: string;
  question: string;
  conceptIds: string[];
  averageLevel: number;
  /** Below the weak-area threshold — revisit the underlying concept first. */
  weak: boolean;
};

export function assessTopic(topic: IamBridgeTopic, getLevel: GetLevel): TopicAssessment {
  const averageLevel = average(topic.conceptIds.map((id) => getLevel(id)));
  return {
    topicId: topic.id,
    title: topic.title,
    question: topic.question,
    conceptIds: topic.conceptIds,
    averageLevel,
    weak: averageLevel <= WEAK_THRESHOLD,
  };
}

export function assessTopics(
  getLevel: GetLevel,
  topics: IamBridgeTopic[] = IAM_BRIDGE_TOPICS
): TopicAssessment[] {
  return topics.map((t) => assessTopic(t, getLevel));
}

export type BridgeReadiness = {
  total: number;
  ready: number;
  weak: number;
  percentage: number;
};

/** Overall bridge readiness — how many of the nine bridge questions rest on solid concepts. */
export function bridgeReadiness(assessments: TopicAssessment[]): BridgeReadiness {
  const weak = assessments.filter((a) => a.weak).length;
  const ready = assessments.length - weak;
  return {
    total: assessments.length,
    ready,
    weak,
    percentage: assessments.length === 0 ? 0 : Math.round((ready / assessments.length) * 100),
  };
}

/** Weakest bridge topics first — the study order for an IAM-track learner. */
export function weakTopics(assessments: TopicAssessment[]): TopicAssessment[] {
  return assessments.filter((a) => a.weak).sort((a, b) => a.averageLevel - b.averageLevel);
}

// -------------------------- Concepts before vendors -------------------------

export type VendorGate = {
  vendorId: IamVendor['id'];
  name: string;
  averageLevel: number;
  /** True once every prerequisite concept is above the weak-area threshold. */
  unlocked: boolean;
  /** Prerequisite concepts still at or below the threshold, weakest first. */
  missingConceptIds: string[];
};

/**
 * The concept gate. A vendor unlocks only when EVERY prerequisite concept is
 * above the threshold — deliberately stricter than the averaged check used for
 * topics, because "learn the concept first" fails if one prerequisite is
 * missing even when the others are strong.
 */
export function vendorGate(vendor: IamVendor, getLevel: GetLevel): VendorGate {
  const levels = vendor.prerequisiteConceptIds.map((id) => ({ id, level: getLevel(id) }));
  const missing = levels
    .filter((l) => l.level <= WEAK_THRESHOLD)
    .sort((a, b) => a.level - b.level)
    .map((l) => l.id);

  return {
    vendorId: vendor.id,
    name: vendor.name,
    averageLevel: average(levels.map((l) => l.level)),
    unlocked: missing.length === 0,
    missingConceptIds: missing,
  };
}

export function vendorGates(
  getLevel: GetLevel,
  vendors: IamVendor[] = IAM_VENDORS
): VendorGate[] {
  return vendors.map((v) => vendorGate(v, getLevel));
}

export function unlockedVendors(gates: VendorGate[]): VendorGate[] {
  return gates.filter((g) => g.unlocked);
}

export function lockedVendors(gates: VendorGate[]): VendorGate[] {
  return gates.filter((g) => !g.unlocked);
}

// ------------------------ Vendor feature to concept -------------------------

export type MappingAnswer = Record<string, string | undefined>;

export type MappingItemResult = {
  itemId: string;
  chosenTopicId?: string;
  correctTopicId: string;
  answered: boolean;
  correct: boolean;
  rationale: string;
};

export type MappingResult = {
  items: MappingItemResult[];
  correctCount: number;
  total: number;
  percentage: number;
};

/**
 * Grade the concept-before-vendor exercise: each named vendor feature has
 * exactly one bridge topic it implements.
 */
export function gradeVendorMapping(
  answer: MappingAnswer,
  items: VendorMappingItem[] = VENDOR_MAPPING_ITEMS
): MappingResult {
  const results: MappingItemResult[] = items.map((item) => {
    const chosenTopicId = answer[item.id];
    return {
      itemId: item.id,
      chosenTopicId,
      correctTopicId: item.topicId,
      answered: chosenTopicId !== undefined,
      correct: chosenTopicId === item.topicId,
      rationale: item.rationale,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  return {
    items: results,
    correctCount,
    total: items.length,
    percentage: items.length === 0 ? 0 : Math.round((correctCount / items.length) * 100),
  };
}

export function isVendorMappingComplete(
  answer: MappingAnswer,
  items: VendorMappingItem[] = VENDOR_MAPPING_ITEMS
): boolean {
  return items.every((i) => answer[i.id] !== undefined);
}
