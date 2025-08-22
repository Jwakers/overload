# Workout Drawer Components

This directory contains the refactored workout drawer components that were previously all contained in a single `workout-drawer.tsx` file.

## Components

### `WorkoutDrawer` (main component)

- **File**: `workout-drawer.tsx`
- **Purpose**: Main workout drawer component that orchestrates the workout logging experience
- **Features**:
  - Creates workout sessions
  - Manages exercise sets
  - Handles workout saving and deletion

### `WeightUnitToggle`

- **File**: `weight-unit-toggle.tsx`
- **Purpose**: Toggle component for switching between lbs and kg weight units
- **Features**:
  - Updates user preferences
  - Visual feedback for current selection
  - Handles loading states

### `SelectExerciseDrawer`

- **File**: `select-exercise-drawer.tsx`
- **Purpose**: Drawer for selecting exercises to add to workouts
- **Features**:
  - Search and filter exercises
  - Muscle group filtering
  - Exercise selection with metadata display

### `ExerciseFilter`

- **File**: `exercise-filter.tsx`
- **Purpose**: Filter component for exercises by muscle groups
- **Features**:
  - Popover-based filter interface
  - Search within muscle groups
  - Visual feedback for active filters

### `ExerciseSetForm`

- **File**: `exercise-set-form.tsx`
- **Purpose**: Form component for logging exercise sets
- **Features**:
  - Weight, reps, and notes input
  - Set history display
  - Form validation
  - Weight unit display

## Usage

Import components individually or use the index file:

```tsx
// Individual imports (deep paths)
import { WorkoutDrawer } from "./workout-drawer/workout-drawer";
import { WeightUnitToggle } from "./workout-drawer/weight-unit-toggle";

// Or use the barrel (index.ts) in this directory
import { WorkoutDrawer, WeightUnitToggle } from "./workout-drawer";
```

## Benefits of Refactoring

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used independently in other parts of the app
3. **Testing**: Easier to write unit tests for individual components
4. **Code Organization**: Clearer structure and easier to navigate
5. **Performance**: Better tree-shaking and code splitting opportunities
