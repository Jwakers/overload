# Overload - Gym Tracking App

A Next.js and Convex-powered application to help track gym sets and manage progressive overload.

// TODO next

- Tackle some bugs
- Set up a landing page and app.etc subdomain for all app functionality (including sign in redirects)
- Populate data proper from my records

## 🏋️‍♂️ Development Todo List

### Bugs

- [x] Remove cardio exercises from the exercise library
- [x] On Iphone we need the UI to avoid the notch at the bottom of the screen
- [ ] Clicking toasts close the drawers
- [ ] On saving a workout session, all unsaved exercise sets should be saved first or at least warn that they are not saved
- [ ] When setting and saving PB and performance data we must account for difference in weight unit
- [ ] Signed out users can see the nav and start workouts
- [ ] Edit exercise button does not work (happened when workout sets were all deleted)
- [ ] Should not be able to delete sets unless the exercise set isActive
- [ ] Add exercise to split banner shows when no split is selected
- [ ] When a workout session is deleted, exercise performance is not re-evaluated/removed
- [ ] No way to sign out
- [ ] Toast descriptions are too light for example when used for push notification toasts
- [ ] Notifications section in settings. Green tick is squashed on Iphone
- [ ] The PB styling on sets when it comes to body weight is not working as intended

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

- [x] Do necessary PWA setup as per: https://nextjs.org/docs/app/guides/progressive-web-apps
- [x] Add section in settings
- [x] Install and refactor with serwist
- [ ] Set up a landing page and app.etc subdomain for all app functionality
- [ ] Set up a cron or background job to check for stale pushSubscriptions and delete them
- [ ] Send notifications with convex actions instead of server actions
- [ ] Test on production deployment
- [ ] Set up a system that sends specifically me an inspirational quote every day at the same time through the app to celebrate the PWA milestone

### Phase 3: Core Features

- [x] **Authentication System**

  - [x] Implement sign-in/sign-up pages
  - [x] Create protected routes

- [x] **Exercise Management**

  - [x] Create exercise library
  - [x] Add new exercises form
  - [x] Exercise search and filtering
  - [x] Exercise categories (strength, cardio, etc.)

- [ ] **Workout Tracking**

  - [x] Start new workout functionality
  - [x] Continue active workout (don't create new)
  - [x] Add exercises sets to workout
  - [x] Refactor exercise to have a equipment field (cable, machine, barbell, kettlebell, barbell etc.)
  - [ ] Warn users no split has been selected before saving
  - [ ] Add custom exercises
  - [x] Record sets with weight, reps, RPE
  - [ ] Workout history view
  - [x] Workout completion flow with summary and notes
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

  - [x] Create split
  - [x] Assign split to workout session
  - [ ] Edit a split (can be done on the split page)
  - [ ] Workout timer
  - [ ] Set input forms
  - [ ] Rest timer between sets with customizable defaults
  - [ ] Workout completion flow with summary view
  - [ ] Quick action buttons for common workflows
  - [ ] Add optimistic updates for faster UX ([see convex docs](https://docs.convex.dev/client/react/optimistic-updates))
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
- [ ] Improve the muscle group and equipment systems
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
- **Database**: Convex

## 🎯 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Convex: `npx convex dev`
4. Set up environment variables for Clerk
5. Start development server: `npm run dev`

---

_This app is designed to help fitness enthusiasts track their progress and maintain consistent progressive overload in their training._
