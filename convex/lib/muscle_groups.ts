// Simple, flat muscle group structure with clear relationships
export const muscleGroups = {
  chest: [
    "chest",
    "chest_upper",
    "chest_middle",
    "chest_lower",
    "chest_inner",
    "chest_outer",
  ],
  back: [
    "back",
    "back_upper",
    "back_middle",
    "back_lower",
    "back_lats",
    "back_rhomboids",
    "back_teres",
    "back_trapezius",
  ],
  shoulders: [
    "shoulders",
    "shoulders_front",
    "shoulders_middle",
    "shoulders_rear",
    "shoulders_rotator_cuff",
  ],
  arms: [
    "arms",
    "biceps",
    "triceps",
    "forearms",
    "biceps_long_head",
    "biceps_short_head",
    "biceps_brachialis",
    "triceps_long_head",
    "triceps_lateral_head",
    "triceps_medial_head",
    "forearms_flexors",
    "forearms_extensors",
    "forearms_brachioradialis",
  ],
  core: [
    "core",
    "abs",
    "lower_back",
    "abs_rectus",
    "abs_obliques",
    "abs_transverse",
    "core_lower_back",
    "core_erector_spinae",
    "core_multifidus",
  ],
  glutes: ["glutes", "glutes_maximus", "glutes_medius", "glutes_minimus"],
  legs: [
    "legs",
    "quads",
    "hamstrings",
    "adductors",
    "abductors",
    "calves",
    "hips",
    "quads_rectus_femoris",
    "quads_vastus_lateralis",
    "quads_vastus_medialis",
    "quads_vastus_intermedius",
    "hamstrings_biceps_femoris",
    "hamstrings_semitendinosus",
    "hamstrings_semimembranosus",
    "calves_gastrocnemius",
    "calves_soleus",
    "calves_tibialis",
    "hip_flexors",
    "hip_abductors",
    "hip_adductors",
    "hip_rotators",
  ],
  fullBody: ["full_body", "cardio", "flexibility", "balance", "stability"],
} as const;

// Type for all muscle group values
export type MuscleGroup =
  (typeof muscleGroups)[keyof typeof muscleGroups][number];

// Get all muscle groups as a flat array
export const getAllMuscleGroups = (): string[] =>
  Object.values(muscleGroups).flat();
