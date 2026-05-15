# Setting Up Firebase for The Chat ✨
### Plain English, No Tech Background Required

Firebase is Google's free tool that stores your app's data (posts, check-ins, reactions)
and handles login. Think of it like a private Google Sheet that your app reads and writes to
automatically — except way more powerful and totally free for a small group.

This guide takes about 20 minutes.

---

## PART 1 — Create your Firebase project

**1. Go to https://console.firebase.google.com**
Sign in with any Google account (Gmail). This becomes the "owner" account for your app.

**2. Click the big blue "Create a project" button**

**3. Name your project**
Type `the-chat` (or anything you like) → click Continue

**4. Turn off Google Analytics**
It asks if you want Google Analytics — toggle it OFF, it's not needed → click Create project

**5. Wait about 10 seconds, then click Continue**
You'll land on your project dashboard. It looks like a dark sidebar with icons.

---

## PART 2 — Connect the app to Firebase

**6. Click the </> icon (it means "web app")**
It's on the project dashboard, in the row of icons that looks like this: iOS | Android | Web

**7. Register your app**
- In the "App nickname" box, type: `the-chat`
- Leave the "Firebase Hosting" checkbox UNCHECKED (we're using Netlify instead)
- Click **Register app**

**8. Copy your credentials — THIS IS THE IMPORTANT PART**
Firebase will show you a block of code that looks like this:

```
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "the-chat-abc12.firebaseapp.com",
  projectId: "the-chat-abc12",
  storageBucket: "the-chat-abc12.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Take a screenshot or copy this whole block somewhere safe.**
You'll need it in Part 4.

**9. Click Continue to console** (the button at the bottom)

---

## PART 3 — Set up the database

This is where your app's posts and data will actually live.

**10. In the left sidebar, click "Build" to expand it**
Then click **Firestore Database**

**11. Click "Create database"**

**12. Choose "Start in test mode"**
Click the circle next to "Start in test mode" → click Next
(Don't worry — you'll add proper security in a later step)

**13. Choose your location**
Pick the region closest to you (e.g. `us-central` if you're in the US) → click Enable

**14. Wait about 30 seconds**
You'll see an empty database screen. That's correct — it's empty for now!

---

## PART 4 — Enable Google Sign-In

So your friends can log in with their Google accounts.

**15. In the left sidebar under "Build", click Authentication**

**16. Click "Get started"**

**17. Click on "Google" in the list of sign-in providers**

**18. Toggle the Enable switch to ON (it turns blue)**

**19. Fill in the "Project support email"**
Click the dropdown and select your Gmail address → click **Save**

---

## PART 5 — Paste your credentials into the app

Now you connect the app files to your Firebase project.

**20. Open the file `src/firebase/config.js` from the zip I gave you**
You can open it with any text editor:
- **Mac:** Right-click the file → Open With → TextEdit
- **Windows:** Right-click the file → Open With → Notepad

**21. You'll see this at the top:**
```
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE",
};
```

**22. Replace each placeholder with the value from Step 8**
For example, replace `"PASTE_YOUR_API_KEY_HERE"` with your actual API key
(keep the quote marks, just swap out the text inside them)

**23. Save the file**
Cmd+S on Mac, Ctrl+S on Windows.

---

## PART 6 — Add security rules

This makes sure only your friends (people you invite) can see the app.

**24. Back in Firebase, go to Firestore Database → click the "Rules" tab**
It's at the top of the Firestore page, next to "Data" and "Indexes"

**25. Open the file `firestore.rules` from the zip**
(Same way you opened config.js — in a text editor)

**26. Select ALL the text in the rules editor on Firebase**
Click inside the Firebase rules box → Cmd+A (Mac) or Ctrl+A (Windows)

**27. Copy everything from the `firestore.rules` file**
Select all → Cmd+C or Ctrl+C

**28. Paste it into the Firebase rules editor**
Cmd+V or Ctrl+V — it should replace everything that was there

**29. Click "Publish"**
A small confirmation should appear.

---

## YOU'RE DONE WITH FIREBASE! ✨

Your database is set up and secure. Here's what you've accomplished:
- ✅ Firebase project created
- ✅ Database ready to store posts, check-ins, reactions
- ✅ Google Sign-In enabled (your friends log in with Gmail)
- ✅ Security rules set (only signed-in members can access data)

---

## What's next

Now you need to connect the app code to Firebase and deploy it.
The next steps are in the README.md file — specifically STEP 3 (wiring up the hooks).

If this feels like too much, this is the perfect point to hand things off.
Show a developer-friend this guide and the zip file — they can take it from here
in about an hour, and all the hard Firebase setup is already done by you. 💪

---

## Something went wrong?

**"Permission denied" error** → Your security rules didn't save. Redo steps 24–29.

**App shows no data after login** → The Firebase hooks haven't been wired up yet in App.jsx.
That's expected — the data wiring is the next step after this guide.

**"Firebase: Error (auth/unauthorized-domain)"** → You need to add your app's URL
to the authorized domains list:
Firebase Console → Authentication → Settings → Authorized domains → Add domain

**Lost your credentials from Step 8?**
Firebase Console → Project Settings (gear icon) → Your apps → SDK setup and configuration
