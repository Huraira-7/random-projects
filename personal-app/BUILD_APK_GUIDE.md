# Build APK for Personal App

This guide will help you build a standalone APK for your Personal app (Expense Tracker + Notes with Notifications).

## ✅ App Configuration Updated

The app is now configured for standalone builds:
- App name: **"Personal app"**
- Package: `com.personalapp.app`
- All notification permissions included
- Background notification support enabled

## 🎯 Recommended Method: EAS Build (Easiest!)

EAS Build is Expo's official cloud build service. It's **FREE** and **RELIABLE**.

### Steps:

1. **Install EAS CLI** (on your laptop):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   npx eas login
   ```
   - Create a free account at https://expo.dev if you don't have one

3. **Configure EAS Build**:
   ```bash
   npx eas build:configure
   ```
   - Press Enter to accept defaults

4. **Build APK**:
   ```bash
   npx eas build -p android --profile preview
   ```
   - This builds in the cloud (takes 10-15 minutes)
   - You'll get a download link when done

5. **Download & Install**:
   - Click the link to download APK
   - Transfer to your Android phone
   - Enable "Install from Unknown Sources"
   - Install and enjoy!

## 📱 Testing Before Building

Before building the APK, test everything works:
```bash
npm start
```
- Test expense tracking
- Test notes
- Test notifications (especially the random scheduling)
- Make sure fonts load properly

## 🔧 Alternative: Google Colab Build

If you prefer Google Colab, use the updated `Build_APK_Colab.ipynb` notebook.

### Preparation:
1. **Zip your project**:
   ```bash
   # On Windows PowerShell
   Get-ChildItem -Path . -Exclude node_modules | Compress-Archive -DestinationPath personal-app.zip -Force
   ```

2. **Upload to Google Drive**

3. **Open Colab Notebook** and follow instructions

## ⚠️ Important Notes

### For Notifications to Work in APK:
- All necessary permissions are already added
- Random scheduling will work in background
- Notifications will continue even when app is closed
- On Android 12+, user may need to enable "Alarms & Reminders" permission

### First Time Setup on Phone:
1. Install APK
2. Open app
3. Grant notification permissions when prompted
4. Add some notes
5. Notifications will start automatically at random intervals!

## 🐛 Troubleshooting

### APK Won't Install:
- Make sure "Install from Unknown Sources" is enabled
- Uninstall any previous version first

### Notifications Not Working:
- Check app permissions in phone settings
- Make sure "Alarms & Reminders" is enabled (Android 12+)
- Add at least one note first

### Fonts Not Showing:
- This is normal during development
- In production APK, fonts will work fine

## 📊 APK Details

- **App Name**: Personal app
- **Package**: com.personalapp.app
- **Version**: 1.0.0
- **Min Android**: 6.0 (API 23)
- **Target Android**: 13 (API 33)

## 🎉 Success Checklist

After installing APK:
- [ ] App opens successfully
- [ ] Can create/edit/delete notes
- [ ] Can add/edit/delete expenses
- [ ] Can manage months and categories
- [ ] Notifications work and appear at random intervals
- [ ] Clicking notification opens beautiful parchment view
- [ ] Pie charts display correctly
- [ ] Custom fonts render properly

## Need Help?

If you encounter issues:
1. Check the troubleshooting section
2. Look at console logs during build
3. Make sure all dependencies are installed
4. Verify app.json configuration

---

**Congratulations!** Your Personal app is ready for standalone use! 🎊

