# Expense Tracker App

A React Native mobile app for tracking expenses with month-wise categorization and pie chart visualization.

## Features

- **Two Pages**: Notes (blank) and Tracking
- **Bottom Tab Navigation**: Easy switching between pages
- **Expense Management**: Add and delete expenses with category, name, and price
- **Month Management**: Create new months with auto-inference (e.g., May 25 → June 25)
- **Monthly Summaries**: View total expenses per month
- **Pie Chart**: Visual breakdown of expenses by category
- **Data Persistence**: All data saved locally using AsyncStorage

## Testing on Your Laptop (No Java SDK Required!)

### Prerequisites
1. Install Node.js (v16 or higher) from https://nodejs.org/
2. Install Expo Go app on your Android phone from Google Play Store

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

3. **Test on Your Phone**
   - Open Expo Go app on your Android phone
   - Scan the QR code shown in the terminal or browser
   - The app will load on your phone instantly!

4. **Test on Your Laptop** (Optional)
   - Press `w` in the terminal to open in web browser
   - Or use an Android emulator if you have one

## Building APK Using Google Colab

You can build the APK file using Google Colab without installing Java SDK or Android Studio on your laptop!

### Method 1: Using EAS Build (Recommended)

1. **Create Expo Account**
   - Go to https://expo.dev/signup
   - Create a free account

2. **Install EAS CLI** (run on your laptop)
   ```bash
   npm install -g eas-cli
   ```

3. **Login to EAS**
   ```bash
   eas login
   ```

4. **Configure EAS Build**
   ```bash
   eas build:configure
   ```

5. **Build APK**
   ```bash
   eas build -p android --profile preview
   ```
   
   This will build your APK on Expo's servers (free for open-source projects)
   
6. **Download APK**
   - Once build completes, you'll get a download link
   - Download and install on your Android device

### Method 2: Using Google Colab (Manual Build)

1. **Upload Your Project**
   - Zip your entire project folder
   - Upload to Google Drive

2. **Open the Colab Notebook**
   - Open `Build_APK_Colab.ipynb` in Google Colab
   - Follow the instructions in the notebook

3. **Download APK**
   - The notebook will generate an APK file
   - Download it from Colab's file browser

## Project Structure

```
expense-tracker-app/
├── App.js                 # Main app with navigation
├── screens/
│   ├── NotesScreen.js    # Notes page (blank)
│   └── TrackingScreen.js # Expense tracking page
├── package.json          # Dependencies
├── app.json              # Expo configuration
└── assets/               # App icons and images
```

## How to Use the App

### Tracking Page

1. **Add a Month**
   - Tap the green "+" button next to the month selector
   - New month is auto-inferred from the last month

2. **Add an Expense**
   - Tap the blue floating "+" button at the bottom
   - Enter Category, Name, and Price
   - Tap "Add Expense"

3. **Delete an Expense**
   - Tap the trash icon next to any expense

4. **View Different Months**
   - Tap the month selector dropdown
   - Select any month to view its expenses

5. **View Pie Chart**
   - Pie chart automatically shows when you have expenses
   - Shows category-wise breakdown

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **React Navigation**: Navigation library
- **AsyncStorage**: Local data persistence
- **React Native Chart Kit**: Pie chart visualization
- **React Native Paper**: UI components

## Notes

- All data is stored locally on your device
- No internet connection required after initial setup
- App works offline once loaded
- Data persists between app restarts

## Troubleshooting

**Issue**: Can't scan QR code
- Make sure your phone and laptop are on the same WiFi network
- Try using tunnel mode: `npx expo start --tunnel`

**Issue**: App crashes on phone
- Make sure you have the latest version of Expo Go
- Clear Expo Go cache and reload

**Issue**: Dependencies not installing
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

## Future Enhancements

- Add notes functionality to Notes page
- Export data to CSV
- Budget setting and alerts
- Search and filter expenses
- Dark mode support

