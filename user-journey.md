# User Journey

1. Open app
2. Redirect to a sign in page if not authed. Sign in page will be very basic for MVP
3. Start/new workout
4. Optionally select or create a workout day e.g. Chest, legs, push, pull etc.
   - Days are user defined
   - They are used to help recommend exercises to improve UX
   - They are optional
   - They dynamically populate and recommend activities based on previous days of the same type
   - They can be edited to add or remove exercises
   - If an exercise does not exist in the day currently, that does not prevent it from being done
5. Select/create workout/exercise
   - There is a list of predefined workouts
   - Each workout contains information like: name and primary muscles groups
   - If an exercise is not available on the predefined list, the user can create a custom one.
6. User selects weight in lbs or kg
   - Body weight can also be selected
   - Body weight should be stored in the user model.
   - Users should be prompted weekly/monthly to update their body weight if they think it might have changed.
   - Body weight + weight can be a future option (for exercises like weighted dips or weighted pull ups)
7. User adds sets (reps per set).
   - Weight can be changed per set, but should be the same as the previous set as a default
   - Weight should be automatically set to the previous amount if this exercise has been recorded before
   - If this exercise has been recorded before, information from the last sets should be displayed to help with tracking
     progressive overload.
8. Once all sets are recorded the users saves the exercise and repeats from step 3

   - Users may optionally add any notes from the workout

9. **Workout Completion Flow**: After all exercises are done, users see a workout summary with total volume, time, and can add notes about how they felt or any observations
10. **Quick Actions**: Users can access quick actions like "Copy last workout", "Quick start" for common routines, or "Continue from template" to reduce setup time
11. **Offline/Data Sync**: The app handles poor connectivity during workouts by storing data locally and syncing when connection is restored, ensuring no workout data is lost
12. **Exercise History**: Users can view their exercise history with configurable time ranges (week, month, 3 months, 6 months, year) to track long-term progress and identify plateaus
13. **Rest Timer**: Integrated rest timer between sets that users can start/stop, with customizable default rest periods per exercise type
