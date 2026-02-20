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

## Software Architecture

### Architecture Pattern: Feature-Based Clean Architecture

The app follows a **feature-based modular architecture** with clear separation of concerns across three layers:

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│   (Screens, Components, Navigation, Hooks)      │
├─────────────────────────────────────────────────┤
│              Business Logic Layer                │
│   (Context/State, Services, Utilities)          │
├─────────────────────────────────────────────────┤
│              Data Layer                          │
│   (SQLite Database, AsyncStorage, APIs)         │
└─────────────────────────────────────────────────┘
```

**Presentation Layer** — React Native screens and reusable UI components. Each feature (workout, nutrition, social, progress) owns its own screens and components. Navigation is managed centrally via React Navigation with a bottom tab navigator and nested stack navigators.

**Business Logic Layer** — React Context providers manage global state (auth, theme, user preferences). Feature-specific services encapsulate business rules (e.g., calculating total volume, macro percentages, streak tracking). A shared `hooks/` directory provides custom hooks for common patterns (timers, database queries, form state).

**Data Layer** — SQLite (via `expo-sqlite`) serves as the primary local database for all structured data. AsyncStorage handles lightweight key-value preferences. External API calls (USDA food database, AI chat) are isolated behind service modules so they can be swapped or mocked independently.

### Data Flow

```
User Action → Screen → Hook/Context → Service → Database/API → State Update → Re-render
```

- **Local-first**: All reads/writes go to SQLite first. Network calls (food search, AI chat, social sync) are secondary and gracefully degrade offline.
- **Unidirectional data flow**: State flows down through context providers; user events flow up through callbacks and service calls.

### Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Cross-platform framework | React Native (Expo) | Mature ecosystem, large community, Expo simplifies builds and device APIs |
| Language | TypeScript | Type safety, better IDE support, catches errors at compile time |
| Local database | SQLite (expo-sqlite) | Reliable, performant, well-supported on both platforms |
| State management | React Context + useReducer | Sufficient for local-first app; avoids Redux complexity |
| Navigation | React Navigation v6 | Industry standard for React Native, supports tabs + stacks |
| AI integration | OpenAI API (or Anthropic API) | Powers the AI coach feature for workout/nutrition advice |

---

## Technology Stack (Software Used)

### Platform & Framework
- **React Native** (via **Expo SDK 52+**) — Cross-platform mobile framework
- **TypeScript** — Primary language for all application code
- **Target Platforms**: iOS 14+ and Android 10+

### Core Libraries

| Category | Library | Purpose |
|---|---|---|
| Navigation | `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/stack` | Tab bar and screen navigation |
| Database | `expo-sqlite` | Local SQLite database for structured data |
| Storage | `@react-native-async-storage/async-storage` | Key-value storage for preferences |
| UI Components | `react-native-paper` | Material Design component library |
| Charts | `react-native-chart-kit` or `victory-native` | Progress graphs and analytics |
| Icons | `@expo/vector-icons` | Icon set for UI |
| Notifications | `expo-notifications` | Rest timer alerts and reminders |
| Camera/Barcode | `expo-camera` + `expo-barcode-scanner` | Barcode scanning for food lookup |
| File System | `expo-file-system` | Export files (CSV, PDF) |
| Sharing | `expo-sharing` | Share workout summaries and progress |
| PDF Generation | `react-native-html-to-pdf` or `expo-print` | Generate PDF reports |

### External APIs & Services

| Service | Purpose |
|---|---|
| **USDA FoodData Central API** | Primary food/nutrition database (free, no key required for basic use) |
| **Nutritionix API** | Secondary food database with barcode support |
| **OpenAI API** or **Anthropic API** | AI-powered workout/nutrition coach |

### Development & Build Tools

| Tool | Purpose |
|---|---|
| **Expo CLI** | Development server, builds, OTA updates |
| **EAS Build** | Cloud builds for iOS and Android binaries |
| **ESLint + Prettier** | Code linting and formatting |
| **Jest + React Native Testing Library** | Unit and component testing |
| **Git + GitHub** | Version control and collaboration |

---

## Planned File Tree

```
Trainer/
├── app.json                        # Expo app configuration
├── App.tsx                         # Root component (providers + navigation)
├── babel.config.js                 # Babel configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── .env                            # API keys (USDA, AI service)
├── .gitignore                      # Git ignore rules
├── assets/                         # Static assets
│   ├── icon.png                    # App icon
│   ├── splash.png                  # Splash screen
│   ├── fonts/                      # Custom fonts
│   └── images/                     # Muscle group diagrams, onboarding images
│
├── src/
│   ├── navigation/                 # Navigation configuration
│   │   ├── AppNavigator.tsx        # Root navigator (auth check)
│   │   ├── TabNavigator.tsx        # Bottom tab bar
│   │   ├── WorkoutStack.tsx        # Workout screen stack
│   │   ├── NutritionStack.tsx      # Nutrition screen stack
│   │   ├── ProgressStack.tsx       # Progress screen stack
│   │   ├── SocialStack.tsx         # Social screen stack
│   │   └── ProfileStack.tsx        # Profile/settings screen stack
│   │
│   ├── screens/                    # All app screens
│   │   ├── home/
│   │   │   └── DashboardScreen.tsx
│   │   ├── workout/
│   │   │   ├── WorkoutListScreen.tsx
│   │   │   ├── ActiveWorkoutScreen.tsx
│   │   │   ├── ExerciseLibraryScreen.tsx
│   │   │   ├── ExerciseDetailScreen.tsx
│   │   │   ├── WorkoutTemplatesScreen.tsx
│   │   │   └── CreateTemplateScreen.tsx
│   │   ├── nutrition/
│   │   │   ├── FoodLogScreen.tsx
│   │   │   ├── AddFoodScreen.tsx
│   │   │   ├── FoodDetailScreen.tsx
│   │   │   ├── BarcodeScannerScreen.tsx
│   │   │   └── CreateCustomFoodScreen.tsx
│   │   ├── progress/
│   │   │   ├── ProgressDashboardScreen.tsx
│   │   │   ├── ExerciseProgressScreen.tsx
│   │   │   └── NutritionAnalyticsScreen.tsx
│   │   ├── social/
│   │   │   ├── FeedScreen.tsx
│   │   │   ├── FriendsScreen.tsx
│   │   │   └── CreatePostScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── GoalsScreen.tsx
│   │   │   └── DataExportScreen.tsx
│   │   └── ai/
│   │       └── AiCoachScreen.tsx
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── workout/
│   │   │   ├── SetRow.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── RestTimer.tsx
│   │   │   └── WorkoutSummaryCard.tsx
│   │   ├── nutrition/
│   │   │   ├── FoodItemRow.tsx
│   │   │   ├── MacroRing.tsx
│   │   │   └── MealSection.tsx
│   │   └── charts/
│   │       ├── LineGraph.tsx
│   │       ├── BarChart.tsx
│   │       └── PieChart.tsx
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.tsx          # User session state
│   │   ├── ThemeContext.tsx         # Light/dark theme
│   │   └── PreferencesContext.tsx   # User preferences (units, etc.)
│   │
│   ├── services/                   # Business logic and API calls
│   │   ├── database/
│   │   │   ├── init.ts             # Database initialization and migrations
│   │   │   ├── workoutDb.ts        # Workout CRUD operations
│   │   │   ├── nutritionDb.ts      # Nutrition CRUD operations
│   │   │   ├── exerciseDb.ts       # Exercise library queries
│   │   │   ├── socialDb.ts         # Social feature queries
│   │   │   └── userDb.ts           # User profile queries
│   │   ├── api/
│   │   │   ├── foodApi.ts          # USDA / Nutritionix API calls
│   │   │   └── aiApi.ts            # AI coach API calls
│   │   ├── workoutService.ts       # Workout calculations (volume, PRs)
│   │   ├── nutritionService.ts     # Macro calculations, goal tracking
│   │   ├── exportService.ts        # CSV/PDF generation
│   │   └── notificationService.ts  # Push notification scheduling
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useTimer.ts             # Rest timer logic
│   │   ├── useDatabase.ts          # Database query wrapper
│   │   ├── useFood.ts              # Food search and lookup
│   │   └── useProgress.ts          # Progress data aggregation
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── workout.ts              # Workout, Exercise, Set, Template types
│   │   ├── nutrition.ts            # Food, FoodLog, FoodItem types
│   │   ├── social.ts               # Friend, Post, Like, Comment types
│   │   ├── user.ts                 # User, Goals, Preferences types
│   │   └── navigation.ts           # Navigation param list types
│   │
│   ├── constants/                  # App-wide constants
│   │   ├── exercises.ts            # Pre-populated exercise library data
│   │   ├── muscleGroups.ts         # Muscle group definitions
│   │   ├── theme.ts                # Color palette, spacing, typography
│   │   └── config.ts               # API URLs, feature flags
│   │
│   └── utils/                      # Pure utility functions
│       ├── formatting.ts           # Number/date/unit formatting
│       ├── validation.ts           # Input validation helpers
│       └── calculations.ts         # Shared math (BMR, TDEE, etc.)
│
└── __tests__/                      # Test files (mirrors src/ structure)
    ├── services/
    ├── hooks/
    └── components/
```

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
