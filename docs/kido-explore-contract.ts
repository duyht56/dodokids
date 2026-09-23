/**
 * Canonical Explore runtime contract.
 *
 * Explore is deliberately separate from the lesson/activity wire contract.
 * Config and dependency manifests may be cached, but child play state is
 * memory-only and is never submitted or persisted.
 */

// Must equal EXPLORE_GAME_CODES in mobile/src/types/explore.ts and
// kido-server/src/modules/explore/explore.types.ts (same codes, same order).
export const EXPLORE_GAME_CODES = [
  'tracing_workshop',
  'route_planner',
  'pattern_finder',
  'memory_match',
  'stack_tower',
  'missing_cell',
  'peekaboo_recall',
  'mirror_build',
  'ordinal_position',
  'number_chain',
  'spin_pattern',
  'number_bus',
] as const;

export type ExploreGameCode = (typeof EXPLORE_GAME_CODES)[number];
export type ExploreRuntimeMode = 'local' | 'server';
export type ExploreDependencyKind =
  | 'generator'
  | 'validator'
  | 'config'
  | 'asset'
  | 'vector'
  | 'audio';
export type ExploreDependencyAvailability = 'bundled' | 'installed' | 'remote';

export interface ExploreDependency {
  kind: ExploreDependencyKind;
  id: string;
  version: string;
  availability: ExploreDependencyAvailability;
}

export interface ExploreDependencyManifest {
  version: string;
  dependencies: readonly ExploreDependency[];
}

export interface ExploreRunSlot<Constraints = unknown> {
  slotKey: string;
  /**
   * Declared default level; must be one of the game's `levels`. The mobile
   * authored-run branch plays the slot at the effective level
   * clamp(startingLevel + (constraints.levelOffset ?? 0), game.levels), so a
   * per-game starting level is not overridden by this static value.
   */
  level: number;
  constraints?: Constraints;
}

export interface ExploreRunPolicy {
  version: 'explore-run-v1';
  slots: readonly ExploreRunSlot[];
}

export interface ExploreGameConfig {
  gameCode: ExploreGameCode;
  titleVi: string;
  descriptionVi: string;
  icon: string;
  enabled: boolean;
  forceStop: boolean;
  runtimeMode: ExploreRuntimeMode;
  offlineCapable: boolean;
  configVersion: string;
  generatorVersion: string;
  validatorVersion: string;
  levels: readonly number[];
  dependencyManifest: ExploreDependencyManifest;
  /**
   * Whether the game appears in the child-facing catalog. Absent means visible
   * (compatibility default `true`). Effective visibility is the bundled value
   * AND any applied server value, computed fail-closed so stale server metadata
   * cannot re-expose a retained-but-hidden game.
   */
  catalogVisible?: boolean;
  runPolicy?: ExploreRunPolicy;
}

export interface ExploreExerciseEnvelope<Params = unknown, Answer = unknown> {
  gameCode: ExploreGameCode | 'local_canary' | 'server_canary';
  exerciseType: string;
  generatorVersion: string;
  validatorVersion: string;
  runSlotKey?: string;
  randomSeed: string;
  promptVi: string;
  params: Params;
  answer: Answer;
  assetRefs: readonly string[];
  audioRefs: readonly string[];
}

export function isManifestAvailableLocally(
  manifest: ExploreDependencyManifest,
): boolean {
  return manifest.dependencies.every(
    (dependency) =>
      dependency.availability === 'bundled' ||
      dependency.availability === 'installed',
  );
}
