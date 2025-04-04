# Calorie Counting App - UI Boilerplate

A beautiful, modern UI boilerplate for a calorie counting mobile application built with React Native, Expo, and NativeWind (Tailwind CSS for React Native).

## Features

This boilerplate provides a complete UI framework for a calorie counting app with the following screens:

1. **Dashboard** - Daily progress overview with meal breakdowns
2. **Meal Detail** - Detailed view of food items in specific meals
3. **Meal Evaluation** - Nutritional evaluation and personalized insights
4. **Pantry Management** - Track ingredients and food items
5. **Meal Plan Generator** - Generate recipes based on preferences and pantry items
6. **Virtual Groups** - Collaborative meal planning with friends and family
7. **Product Scanner** - Scan barcodes or nutrition labels
8. **User Profile** - Manage preferences, allergies, and settings

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - React Native development platform
- **NativeWind** - Tailwind CSS for React Native
- **React Navigation** - Navigation library for React Native

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd calorie-counting-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npx expo start
```

4. Run on a simulator or device
   - Press `i` to run on iOS simulator
   - Press `a` to run on Android emulator
   - Scan the QR code with Expo Go app on your physical device

## Project Structure

```
src/
├── assets/          # Images, fonts, and other static files
├── components/      # Reusable UI components
│   ├── common/      # Shared components used across screens
│   └── ui/          # Basic UI building blocks
├── context/         # React Context for global state management
├── navigation/      # Navigation configuration
├── screens/         # App screens
│   ├── Dashboard/
│   ├── MealDetail/
│   ├── MealEvaluation/
│   ├── Pantry/
│   ├── MealPlan/
│   ├── Groups/
│   ├── Scanner/
│   └── Profile/
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and mock data
```

## Notes

This is a UI boilerplate only - no actual functionality or backend integration is implemented. It's designed to provide a solid foundation for developing a fully-functional calorie counting application.

## License

[MIT License](LICENSE) 