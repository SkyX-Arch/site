Hi! Thanks for reporting the issue. To help me identify the cause, please capture a **logcat** while the crash happens.

### 1. Enable Developer Options

* Open **Settings > About phone**.
* Tap **Build number** 7 times until you see *"You are now a developer!"*.
* Go back to **Settings > System > Developer options** (or search for "Developer options").
* Enable **USB debugging**.

### 2. Install ADB on your computer

Download **Android Platform Tools** for your operating system:
https://developer.android.com/tools/releases/platform-tools

Extract the archive to any folder.

### 3. Connect your phone

* Connect the phone to your PC with a USB cable.
* When prompted on the phone, tap **Allow** for the USB debugging authorization.

### 4. Open a terminal or command prompt

Open the folder where you extracted Platform Tools.

On Windows:

* Hold **Shift** and right-click inside the folder.
* Select **Open in Terminal** (or Command Prompt/PowerShell).

### 5. Verify the connection

Run:

```bash
adb devices
```

If your device appears in the list, you're ready.

### 6. Capture the log

Clear old logs first:

```bash
adb logcat -c
```

Then start logging:

```bash
adb logcat > logcat.txt
```

Leave the terminal running.

### 7. Reproduce the issue

* Open the app.
* Do whatever causes it to crash.
* Wait a few seconds after the crash.

### 8. Stop logging

Go back to the terminal and press:

**Ctrl + C**

A file named **logcat.txt** will be created in the Platform Tools folder.

### 9. Submit a log

Please submit the **logcat.txt** file to GitHub Issues along with the following information:

* Application name.

* Exact steps to reproduce the issue.

* Does the issue occur every time or only occasionally.

Thank you! This information is usually enough to determine the cause of most application crashes.
