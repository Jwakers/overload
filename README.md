# Overload - Gym Tracking App

A Next.js and Convex-powered application to help track gym sets and manage progressive overload.

## 🏋️‍♂️ Development Todo List

### Bugs

- [ ] Signed out users can see the nav and start workouts

### Phase 1: Project Setup & Dependencies

- [x] **Install Setup**

  - [x] Run `npx shadcn@latest init` to set up Shadcn
  - [x] Configure Tailwind CSS (already installed)
  - [x] Code rabbit setup
  - [x] Vercel setup

- [x] **Install Clerk Authentication**

  - [x] Run `npm install @clerk/nextjs`
  - [x] Set up Clerk environment variables
  - [x] Configure Clerk provider in your app
  - [x] Set up authentication middleware

### Phase 2: Convex Database Schema

- [x] **Design Database Tables**

- [x] Outline schema based on user journey
- [x] Create `users` table (linked to Clerk user IDs)
  - [x] Sync clerk user data to the `users` table
  - [x] Add body weight tracking fields and preferences
- [x] Create `bodyWeightHistory` table (weight tracking over time)
- [x] Create `exercises` table (exercise definitions)
- [x] Create `workoutDays` table (user-defined workout templates)
- [x] Create `workouts` table (workout sessions)
- [x] Create `workoutExercises` table (exercises within workouts)
- [x] Create `exerciseHistory` table (quick access to performance data)
- [x] Create `predefinedExercises` table (exercise library)

### PWA

- [ ] Do necessary PWA setup as per: https://nextjs.org/docs/app/guides/progressive-web-apps

### Phase 3: Core Features

- [x] **Authentication System**

  - [x] Implement sign-in/sign-up pages
  - [x] Create protected routes

- [ ] **Exercise Management**

  - [x] Create exercise library
  - [x] Add new exercises form
  - [x] Exercise search and filtering
  - [x] Exercise categories (strength, cardio, etc.)

- [ ] **Workout Tracking**

  - [x] Start new workout functionality
  - [x] Continue active workout (don't create new)
  - [x] Add exercises sets to workout
  - [x] Refactor exercise to have a equipment field (cable, machine, barbell, kettlebell, barbell etc.)
  - [ ] Record sets with weight, reps, RPE
  - [ ] Workout history view
  - [ ] Workout completion flow with summary and notes
  - [ ] Quick actions (copy last workout, quick start, continue from template)
  - [ ] Offline data sync for poor connectivity during workouts
  - [ ] Integrated rest timer between sets with customizable defaults

- [ ] **Progressive Overload Tracking**
  - [ ] Calculate and display progression
  - [ ] Show improvement trends
  - [ ] Set personal records tracking
  - [ ] Progress visualization (charts/graphs)
  - [ ] Exercise history with configurable time ranges (week, month, 3 months, 6 months, year)
  - [ ] Long-term progress tracking to identify plateaus

### Phase 4: UI Components & Pages

- [ ] **Layout & Navigation**

  - [ ] Create main app layout
  - [x] Implement navigation menu
  - [ ] Add breadcrumbs and page headers

- [ ] **Home page**

  - [ ] As per base 44 design
  - [ ] Sections for broad and recent data
  - [ ] The dashboard can be the home page, as long as it gives options to link out ot further detailed breakdowns

- [ ] **Dashboard**

  - [ ] Recent workouts summary
  - [ ] Quick stats overview
  - [ ] Quick actions (start workout, add exercise)

- [ ] **Workout Interface**

  - [ ] Create split
  - [ ] Assign split to workout session
  - [ ] Workout timer
  - [ ] Set input forms
  - [ ] Rest timer between sets with customizable defaults
  - [ ] Workout completion flow with summary view
  - [ ] Quick action buttons for common workflows
  - [ ] Offline indicator and sync status

- [ ] **Data Visualization**
  - [ ] Progress charts (line charts for weight progression)
  - [ ] Volume tracking
  - [ ] Personal records display
  - [ ] Workout frequency calendar
  - [ ] Exercise history timeline with configurable ranges
  - [ ] Plateau detection and trend analysis

### Phase 5: Advanced Features

- [ ] **Workout Templates**

  - [ ] Create reusable workout programs
  - [ ] Split routines (push/pull/legs, etc.)
  - [ ] Template sharing between users

- [ ] **Analytics & Insights**

  - [ ] Volume analysis
  - [ ] Strength progression metrics
  - [ ] Workout frequency analysis
  - [ ] Goal tracking

- [ ] **Mobile Optimization**
  - [ ] Responsive design for mobile devices
  - [ ] Touch-friendly workout interface
  - [ ] Offline capability with local storage and sync
  - [ ] Progressive Web App (PWA) features for app-like experience

### Phase 6: Polish & Testing

- [ ] **Error Handling**

  - [ ] Form validation
  - [ ] Error boundaries
  - [ ] User feedback messages

- [ ] **Performance Optimization**

  - [ ] Implement proper loading states
  - [ ] Optimize database queries
  - [ ] Add caching where appropriate

- [ ] **Testing**
  - [ ] Unit tests for Convex functions
  - [ ] Component testing
  - [ ] Integration testing

### Phase 7: Deployment & Launch

- [ ] **Environment Setup**

  - [ ] Configure production Convex deployment
  - [ ] Set up production Clerk environment
  - [ ] Environment variable management

- [ ] **Deployment**
  - [ ] Deploy to Vercel/Netlify
  - [ ] Configure custom domain
  - [ ] Set up monitoring and analytics

### Phase 8: Post MVP

- [ ] User profile management
- [ ] Exercises synonyms to make search more effective
- [ ] Start new workout button should say resume if there is an active workout. The drawer can be closed by accident this allows the user to quickly resume what they were doing
- [ ] When starting a new workout we should query if there are any other workouts created today and if so offer to resume or create a new one.
- [ ] Filter by muscle group AND equipment
- [ ] Improve the muscle group system
- [ ] Enforce only one active workout session (when requesting a new one all others should be set to isActive === false). No user should ever have multiple active sessions

## 🚀 Recommended Development Order

1. **Start with Phase 1** (setup) - this gives you the foundation
2. **Move to Phase 2** (database) - this defines your data structure
3. **Implement Phase 3** (core features) incrementally
4. **Build UI components** as you develop features
5. **Add advanced features** once core functionality works
6. **Polish and test** before deployment

## 🔧 Key Technical Considerations

- **Convex**: Use real-time subscriptions for live workout updates
- **Shadcn**: Leverage their component library for consistent UI
- **Clerk**: Implement proper role-based access control
- **Performance**: Use optimistic updates for better UX during workouts
- **Data Structure**: Design for efficient querying of workout history and progression

## 📚 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex
- **Authentication**: Clerk
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Database**: Convex (built on top of PostgreSQL)

## 🎯 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Convex: `npx convex dev`
4. Set up environment variables for Clerk
5. Start development server: `npm run dev`

---

_This app is designed to help fitness enthusiasts track their progress and maintain consistent progressive overload in their training._
