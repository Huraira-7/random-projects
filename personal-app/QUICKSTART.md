# Quick Start Guide 🚀

Get your Expense Tracker app running in 5 minutes!

## Option 1: Test on Your Phone (Fastest - No Java/Android SDK needed!)

### Step 1: Install Node.js
Download and install from https://nodejs.org/ (choose LTS version)

### Step 2: Install Dependencies
Open terminal/command prompt in the project folder and run:
```bash
npm install
```

### Step 3: Install Expo Go on Your Phone
- Open Google Play Store on your Android phone
- Search for "Expo Go"
- Install the app

### Step 4: Start the App
In the terminal, run:
```bash
npm start
```
or
```bash
npx expo start
```

### Step 5: Scan QR Code
- Open Expo Go app on your phone
- Tap "Scan QR code"
- Point camera at the QR code in your terminal
- App will load and run on your phone!

**Note**: Make sure your phone and laptop are on the same WiFi network.

---

## Option 2: Build APK Using Google Colab

### Why Use This Method?
- No need to install Java SDK or Android Studio
- Build happens in the cloud
- Get a real APK file you can install on any Android device

### Steps:

1. **Prepare Your Project**
   - Zip your entire project folder
   - Upload the zip file to your Google Drive

2. **Open Google Colab**
   - Go to https://colab.research.google.com/
   - Upload the `Build_APK_Colab.ipynb` file from this project
   - Or create new notebook and copy the cells

3. **Run the Notebook**
   - Follow instructions in the notebook
   - Run each cell in order
   - Update the paths to match your Google Drive structure

4. **Download APK**
   - Once build completes (takes 15-20 minutes)
   - Download `ExpenseTracker.apk` from your Google Drive

5. **Install on Android**
   - Transfer APK to your phone
   - Enable "Install from Unknown Sources" in Settings
   - Tap the APK and install

---

## Option 3: Build Using EAS (Expo's Cloud Service)

This is the easiest way to get a production-ready APK!

### Steps:

1. **Create Expo Account**
   ```bash
   npx expo login
   ```
   (Create account at expo.dev if you don't have one)

2. **Configure EAS Build**
   ```bash
   npx eas build:configure
   ```

3. **Build APK**
   ```bash
   npx eas build -p android --profile preview
   ```

4. **Wait for Build**
   - Build happens on Expo's servers
   - Takes about 10-15 minutes
   - You'll get a download link when done

5. **Download and Install**
   - Click the link to download APK
   - Install on your Android device

---

## Troubleshooting

### "Cannot connect to Metro bundler"
- Make sure phone and laptop are on same WiFi
- Try running: `npx expo start --tunnel`

### "npm install fails"
- Delete `node_modules` folder
- Delete `package-lock.json` file
- Run `npm install` again

### "App crashes on phone"
- Make sure you have latest Expo Go app
- Clear Expo Go cache in app settings
- Restart the development server

### "QR code not scanning"
- Make sure you have good lighting
- Try manual entry: type the URL shown below QR code into Expo Go

---

## What's Included in This App

✅ **Notes Page** - Blank page ready for your notes feature  
✅ **Tracking Page** - Full expense tracking functionality  
✅ **Month Management** - Add months with smart date inference  
✅ **Expense Table** - Add/delete expenses with category, name, price  
✅ **Pie Chart** - Visual breakdown by category  
✅ **Data Persistence** - All data saved locally  
✅ **Bottom Navigation** - Easy tab switching  

---

## Next Steps

Once you have the app running:

1. **Test the Features**
   - Add some months
   - Add expenses in different categories
   - View the pie chart
   - Try deleting expenses

2. **Customize**
   - Modify colors in the styles
   - Add more features to Notes page
   - Add more expense categories

3. **Build Production APK**
   - Follow Option 3 (EAS) for production build
   - Generate signing key for Play Store upload

---

## Need Help?

- Expo Documentation: https://docs.expo.dev/
- React Native Documentation: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/

Happy coding! 🎉

