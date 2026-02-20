# Workout & Nutrition Tracker App - Design Document

## Overview
A mobile application (iOS/Android) for tracking workouts and nutrition with goal-setting capabilities. The app uses local storage for data persistence and includes social features for sharing progress with friends.

## Core Features

### Workout Tracking
- **Exercise Logging**
  - Log exercises with details: name, weight, reps/time, sets
  - View muscle groups targeted by each exercise
  - Support for both strength training (weight/reps/sets) and cardio (time/distance)

- **Rest Timer**
  - Configurable timer between sets
  - Push notifications/alerts when rest period ends
  - Quick start with preset times (30s, 60s, 90s, 2min, 3min)
  - Pause/resume functionality

- **Workout Templates**
  - Create and save workout routines
  - Quick-start workouts from templates
  - Edit templates based on progress
  - Category organization (Push, Pull, Legs, Full Body, etc.)

- **Progress Tracking**
  - Visual graphs showing progress over time:
    - Weight progression per exercise
    - Total volume (sets × reps × weight)
    - Workout frequency
    - Personal records
  - Filter by date range (week, month, 3 months, year, all time)
  - Comparison views (current vs previous workout)

### Nutrition Tracking
- **Food Logging**
  - Log foods by serving size
  - Track brand information
  - Quick add recent/favorite foods
  - Barcode scanning (optional integration)
  - Integration with USDA and other food databases

- **Calorie & Macro Tracking**
  - Daily calorie intake
  - Macronutrient breakdown (protein, carbs, fats)
  - Micronutrients tracking (optional)
  - Meal categorization (breakfast, lunch, dinner, snacks)

- **Goals & Targets**
  - Set daily calorie goals
  - Set macro targets (grams or percentages)
  - Weekly workout volume goals
  - Visual indicators showing progress toward goals

### Social Features
- **Sharing**
  - Share workout summaries
  - Share progress graphs
  - Share personal records
  - Optional privacy settings (public/friends-only/private)

- **Friends & Community**
  - Add friends by username/QR code
  - View friends' shared workouts
  - Like and comment on posts
  - Leaderboards (optional competitive features)

### Export & Reports
- **Data Export**
  - Export workout logs to CSV
  - Export nutrition logs to CSV
  - Export progress graphs as images
  - Generate PDF summary reports

- **Report Types**
  - Weekly summary (workouts completed, avg calories, etc.)
  - Monthly progress report
  - Custom date range reports

## Technical Architecture

### Platform
- **Framework**: React Native or Flutter for cross-platform development
- **Target Platforms**: iOS (14+) and Android (10+)

### Data Storage
- **Local Database**: SQLite or Realm for structured data storage
- **File System**: For images/graphs/cached data
- **Async Storage**: For user preferences and settings

### Key Libraries/Dependencies
- **UI Components**: Native Base / React Native Paper / Flutter Material
- **Charts**: Victory Native (React Native) / FL Chart (Flutter)
- **Database**: SQLite / Realm / Watermelon DB
- **Timer**: React Native Background Timer or native timers
- **Food Database API**: USDA FoodData Central API, Nutritionix API
- **Notifications**: React Native Push Notification / Flutter Local Notifications
- **Barcode Scanner**: React Native Camera / mobile_scanner (Flutter)

## Data Models

### User Profile
```
User {
  id: UUID
  username: string
  displayName: string
  email: string (optional for local only)
  profilePicture: string (local path)
  createdAt: DateTime
  goals: Goals
  preferences: UserPreferences
}

Goals {
  dailyCalories: number
  proteinGrams: number
  carbsGrams: number
  fatsGrams: number
  weeklyWorkouts: number
}

UserPreferences {
  weightUnit: 'kg' | 'lbs'
  heightUnit: 'cm' | 'ft/in'
  defaultRestTime: number (seconds)
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
}
```

### Workout Models
```
Workout {
  id: UUID
  userId: UUID
  date: DateTime
  name: string
  notes: string (optional)
  duration: number (minutes)
  exercises: Exercise[]
}

Exercise {
  id: UUID
  workoutId: UUID
  exerciseTypeId: UUID
  sets: Set[]
  notes: string (optional)
  order: number
}

ExerciseType {
  id: UUID
  name: string
  description: string
  muscleGroups: MuscleGroup[]
  category: 'strength' | 'cardio' | 'flexibility'
  equipment: string[] (e.g., 'barbell', 'dumbbell', 'bodyweight')
  isCustom: boolean
}

Set {
  id: UUID
  exerciseId: UUID
  setNumber: number
  weight: number (optional, for strength)
  reps: number (optional, for strength)
  duration: number (optional, for cardio/timed exercises)
  distance: number (optional, for cardio)
  completed: boolean
}

MuscleGroup {
  id: UUID
  name: string (e.g., 'Chest', 'Quadriceps', 'Biceps')
  isPrimary: boolean
}

WorkoutTemplate {
  id: UUID
  userId: UUID
  name: string
  category: string
  exercises: TemplateExercise[]
  createdAt: DateTime
}

TemplateExercise {
  exerciseTypeId: UUID
  targetSets: number
  targetReps: number
  targetWeight: number (optional)
  order: number
}
```

### Nutrition Models
```
FoodLog {
  id: UUID
  userId: UUID
  date: DateTime
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodItems: FoodItem[]
}

FoodItem {
  id: UUID
  foodLogId: UUID
  foodId: UUID (reference to Food)
  servings: number
  servingSize: string
}

Food {
  id: UUID
  name: string
  brand: string (optional)
  servingSize: string
  servingUnit: string (e.g., 'cup', 'oz', 'g', '100g')
  calories: number
  protein: number (grams)
  carbs: number (grams)
  fats: number (grams)
  fiber: number (grams, optional)
  sugar: number (grams, optional)
  sodium: number (mg, optional)
  source: 'usda' | 'nutritionix' | 'custom'
  barcode: string (optional)
  isCustom: boolean
  isFavorite: boolean
}
```

### Social Models
```
Friend {
  id: UUID
  userId: UUID
  friendId: UUID
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: DateTime
}

Post {
  id: UUID
  userId: UUID
  type: 'workout' | 'progress' | 'achievement'
  content: string
  workoutId: UUID (optional)
  imageUrl: string (optional, local path)
  visibility: 'public' | 'friends' | 'private'
  createdAt: DateTime
  likes: Like[]
  comments: Comment[]
}

Like {
  id: UUID
  postId: UUID
  userId: UUID
  createdAt: DateTime
}

Comment {
  id: UUID
  postId: UUID
  userId: UUID
  content: string
  createdAt: DateTime
}
```

## User Interface & Screens

### Main Navigation
- **Tab Bar** (bottom navigation):
  1. Home/Dashboard
  2. Workout
  3. Nutrition
  4. Progress
  5. Profile/Settings

### Screen Flows

#### 1. Dashboard/Home
- Today's summary card
  - Calories consumed vs. goal
  - Macros progress (circular/bar charts)
  - Workouts completed this week
- Quick actions
  - Start workout
  - Log meal
  - Log quick food
- Recent activity feed
- Upcoming/scheduled workouts

#### 2. Workout Section
**Workout List Screen**
- Calendar view or list view toggle
- Filter by date range
- "Start New Workout" button
- "Load Template" button
- Workout history cards

**Active Workout Screen**
- Current exercise display
- Set counter
- Weight/reps input
- Rest timer (floating or modal)
- Previous performance comparison
- Notes field
- "Next Exercise" / "Finish Workout" buttons
- Progress indicator

**Exercise Library Screen**
- Search and filter exercises
- Categories (Chest, Back, Legs, etc.)
- Exercise detail view:
  - Description
  - Muscle groups highlighted (visual)
  - Instructions
  - Alternative exercises
- "Add Custom Exercise" option

**Workout Template Screen**
- List of saved templates
- Create/edit template
- Drag to reorder exercises
- Duplicate template option

#### 3. Nutrition Section
**Food Log Screen**
- Date selector
- Meal type sections (expandable)
- Total calories/macros for the day
- Progress toward goals (visual bars)
- "Add Food" button per meal

**Add Food Screen**
- Search food database
- Recent foods list
- Favorite foods list
- Barcode scanner button
- "Create Custom Food" option
- Serving size selector

**Food Detail/Edit Screen**
- Nutrition facts display
- Serving size adjustment
- "Add to Meal" button
- "Save as Favorite" option

#### 4. Progress Section
**Progress Dashboard**
- Filter/selector for data type:
  - Workout volume
  - Exercise PRs
  - Body measurements (future)
  - Nutrition trends
- Date range selector
- Graph/chart displays
- Statistical summaries (avg, max, trends)

**Exercise Progress Detail**
- Line graph of weight progression
- Volume over time
- PR tracker
- Personal best history

**Nutrition Analytics**
- Weekly calorie average
- Macro distribution pie chart
- Adherence to goals (%)
- Streak tracker

#### 5. Social Section (within Profile or separate tab)
**Feed Screen**
- Friends' posts
- Like/comment functionality
- Share your own post button

**Friends Screen**
- Friends list
- Pending requests
- Add friend (username/QR)
- Friend search

#### 6. Profile/Settings
**Profile Screen**
- User info and stats
- Achievements/badges
- Privacy settings
- Goals and preferences

**Settings Screen**
- Units preferences
- Theme settings
- Notification settings
- Data management (export, delete)
- About/help

## Implementation Phases

### Phase 1: Core Workout Tracking (MVP)
**Priority: High**
- User profile setup (local)
- Exercise library (pre-populated with common exercises)
- Active workout screen with set logging
- Basic rest timer
- Workout history view
- Simple progress graph (weight over time for one exercise)

**Estimated Complexity**: Medium
**Screens**: 5-6 core screens

### Phase 2: Nutrition Tracking
**Priority: High**
- Food database integration
- Food logging interface
- Daily calorie/macro tracking
- Nutrition dashboard
- Goals setting for nutrition

**Estimated Complexity**: Medium-High
**Screens**: 4-5 screens

### Phase 3: Goals & Analytics
**Priority: Medium**
- Set workout and nutrition goals
- Enhanced progress graphs
- Weekly/monthly reports
- Comparison tools
- Achievement system

**Estimated Complexity**: Medium
**Screens**: 3-4 screens + enhancements

### Phase 4: Templates & Optimization
**Priority: Medium**
- Workout templates creation
- Template library
- Quick-start workouts
- Exercise substitutions
- Custom exercises

**Estimated Complexity**: Medium
**Screens**: 2-3 screens

### Phase 5: Social Features
**Priority: Low-Medium**
- Friend system
- Post sharing
- Activity feed
- Comments and likes
- Privacy controls

**Estimated Complexity**: Medium-High
**Screens**: 4-5 screens

### Phase 6: Export & Polish
**Priority: Low-Medium**
- CSV export
- PDF reports
- Data backup/restore
- Enhanced UI/UX polish
- Performance optimization
- Barcode scanning

**Estimated Complexity**: Low-Medium
**Screens**: 1-2 screens + utilities

## Technical Considerations

### Performance
- Lazy loading for exercise lists
- Virtualized lists for long workout histories
- Image optimization and caching
- Database indexing on frequently queried fields
- Pagination for social feeds

### Offline Support
- All features work offline (local-first)
- Queue posts for sharing when online
- Cache food database results
- Background sync for social features

### Data Integrity
- Input validation for all user entries
- Database migrations for schema changes
- Regular data backup prompts
- Conflict resolution for concurrent edits

### Security & Privacy
- Secure local storage
- Optional data encryption
- Privacy controls for social features
- No analytics/tracking without consent

### Accessibility
- Screen reader support
- Sufficient color contrast
- Adjustable font sizes
- Voice input for logging (optional)

## Future Enhancements (Post-Launch)
- Body measurement tracking (weight, body fat %, photos)
- Workout programs/periodization
- Video demonstrations for exercises
- Meal planning
- Recipe builder with nutrition calculation
- Integration with fitness wearables
- Cloud sync option (with user accounts)
- AI-powered form check (using camera)
- Workout music integration
- Hydration tracking
- Sleep tracking integration

## Success Metrics
- User retention (daily/weekly active users)
- Average workouts logged per user per week
- Average meals logged per user per day
- Goal completion rate
- Feature adoption rates
- User satisfaction (in-app surveys)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-19
