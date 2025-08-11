# Overload - Gym Tracking App

A Next.js and Convex-powered application to help track gym sets and manage progressive overload.

## 🏋️‍♂️ Development Todo List

### Phase 1: Project Setup & Dependencies

- [ ] **Install Shadcn UI**

  - [ ] Run `npx shadcn@latest init` to set up Shadcn
  - [ ] Configure Tailwind CSS (already installed)
  - [ ] Install and configure base components (button, input, card, etc.)

- [ ] **Install Clerk Authentication**

  - [ ] Run `npm install @clerk/nextjs`
  - [ ] Set up Clerk environment variables
  - [ ] Configure Clerk provider in your app
  - [ ] Set up authentication middleware

- [ ] **Install Additional Dependencies**
  - [ ] `npm install lucide-react` (for icons)
  - [ ] `npm install date-fns` (for date handling)
  - [ ] `npm install @hookform/resolvers react-hook-form zod` (for forms)

### Phase 2: Convex Database Schema

- [ ] **Design Database Tables**

  - [ ] Create `users` table (linked to Clerk user IDs)
  - [ ] Create `exercises` table (exercise definitions)
  - [ ] Create `workouts` table (workout sessions)
  - [ ] Create `sets` table (individual set records)
  - [ ] Create `progressive_overload` table (tracking progression)

- [ ] **Implement Convex Functions**
  - [ ] User management functions (create, update, delete)
  - [ ] Exercise CRUD operations
  - [ ] Workout tracking functions
  - [ ] Set recording functions
  - [ ] Progressive overload calculation functions

### Phase 3: Core Features

- [ ] **Authentication System**

  - [ ] Implement sign-in/sign-up pages
  - [ ] Create protected routes
  - [ ] Set up user profile management

- [ ] **Exercise Management**

  - [ ] Create exercise library
  - [ ] Add new exercises form
  - [ ] Exercise search and filtering
  - [ ] Exercise categories (strength, cardio, etc.)

- [ ] **Workout Tracking**

  - [ ] Start new workout functionality
  - [ ] Add exercises to workout
  - [ ] Record sets with weight, reps, RPE
  - [ ] Workout history view

- [ ] **Progressive Overload Tracking**
  - [ ] Calculate and display progression
  - [ ] Show improvement trends
  - [ ] Set personal records tracking
  - [ ] Progress visualization (charts/graphs)

### Phase 4: UI Components & Pages

- [ ] **Layout & Navigation**

  - [ ] Create main app layout
  - [ ] Implement navigation sidebar/menu
  - [ ] Add breadcrumbs and page headers

- [ ] **Dashboard**

  - [ ] Recent workouts summary
  - [ ] Quick stats overview
  - [ ] Quick actions (start workout, add exercise)

- [ ] **Workout Interface**

  - [ ] Workout timer
  - [ ] Set input forms
  - [ ] Rest timer between sets
  - [ ] Workout completion flow

- [ ] **Data Visualization**
  - [ ] Progress charts (line charts for weight progression)
  - [ ] Volume tracking
  - [ ] Personal records display
  - [ ] Workout frequency calendar

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
  - [ ] Offline capability considerations

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
