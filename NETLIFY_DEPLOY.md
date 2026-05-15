# Deploying The Chat on Netlify ✨
### Plain English, No Tech Background Required

Netlify is free website hosting. Once deployed, your friends just open a link —
no app store, no downloads, no accounts (except their Google login for the app itself).

This guide takes about 15 minutes.

---

## Before you start — checklist

Make sure you've done these first:
- ✅ Completed the Firebase setup (FIREBASE_SETUP.md)
- ✅ Pasted your Firebase credentials into `src/firebase/config.js`
- ✅ Published your Firestore security rules
- ✅ Node.js is installed on your computer (see below if not)
- ✅ Your Firebase credentials are pasted into `src/firebase/config.js`

---

## Do you have Node.js installed?

Node.js is a tool that lets you run the build command. You only need it once.

**To check if you have it:**
1. Open Terminal (Mac) or Command Prompt (Windows)
   - Mac: press Cmd+Space, type "Terminal", hit Enter
   - Windows: press the Windows key, type "cmd", hit Enter
2. Type this and hit Enter:
   ```
   node --version
   ```
3. If you see something like `v18.0.0` — you have it! Skip to Part 1.
4. If you see an error — go to **https://nodejs.org**, click the big
   "LTS" download button, install it like any normal app, then come back here.

---

## Good news — Firebase is already wired in! 🎉
The `App.jsx` file has been fully updated to use real Firebase data.
You don't need to manually swap any hooks. Just make sure your
Firebase credentials are in `src/firebase/config.js` and you're good to go.

---

## PART 1 — Build the app

"Building" turns your code files into a simple folder of files
that any web host (like Netlify) can serve. Think of it like
exporting a Word doc to PDF before sending it.

**1. Unzip the `the-chat.zip` file if you haven't already**
You should have a folder called `the-chat` on your computer.

**2. Open Terminal (Mac) or Command Prompt (Windows)**

**3. Navigate to your project folder**
Type `cd ` (with a space after it), then drag and drop the `the-chat` folder
directly into the Terminal window. The folder path fills in automatically.
Hit Enter.

It should look something like:
```
cd /Users/yourname/Downloads/the-chat
```

**4. Install the project dependencies — type this and hit Enter:**
```
npm install
```
You'll see a lot of text scrolling by. That's normal. Wait for it to finish
(usually 30–60 seconds). You'll know it's done when you see the `$` prompt again.

**5. Build the app — type this and hit Enter:**
```
npm run build
```
Again, some text will scroll. When it finishes you'll see something like:
```
✓ built in 3.45s
```

**6. Find the `dist` folder**
Inside your `the-chat` folder, there should now be a new folder called `dist`.
That's what you'll upload to Netlify. 🎉

---

## PART 2 — Deploy to Netlify

**7. Go to https://netlify.com**

**8. Click "Sign up" → choose "Sign up with GitHub" or "Sign up with Email"**
Either works. Email is simpler if you don't have a GitHub account.

**9. Once you're logged in, you'll see your Netlify dashboard**
It might say "Team overview" or show a blank sites list — that's fine.

**10. Find the deploy box**
Look for a section that says **"drag and drop your site folder here"**
or a box with a dashed border. It's usually in the middle of the page.

**11. Drag your `dist` folder onto that box**
Open Finder (Mac) or File Explorer (Windows), navigate to your `the-chat` folder,
find the `dist` folder inside it, and drag it onto the Netlify page.

**12. Wait about 10 seconds**
Netlify will process the upload. You'll see a progress indicator.

**13. Your site is live! 🎉**
Netlify will give you a URL that looks like:
```
https://whimsical-cupcake-abc123.netlify.app
```
(The random name is auto-generated — you can change it in the next step)

---

## PART 3 — Customize your URL

The random URL works, but let's make it something you'd actually want to share.

**14. Click "Site configuration" or "Domain settings"**
It's in the site dashboard after your deploy.

**15. Click "Change site name"**

**16. Type something like `the-chat-girls` or `just-the-girls`**
Then click Save. Your new URL will be:
```
https://the-chat-girls.netlify.app
```

---

## PART 4 — Tell Firebase about your Netlify URL

Firebase needs to know your app's URL is allowed to use Google Sign-In.
Otherwise your friends will get a login error.

**17. Go back to https://console.firebase.google.com**

**18. Click your project → Authentication → Settings tab**
(Settings is next to Users and Sign-in method at the top)

**19. Scroll down to "Authorized domains"**

**20. Click "Add domain"**

**21. Type your Netlify URL** (without the https://)
For example: `the-chat-girls.netlify.app`

**22. Click Add**

---

## YOU'RE DONE! ✨

Your app is live. Here's your full setup:
- ✅ Firebase storing all your data in real time
- ✅ Google Sign-In working for your friends
- ✅ App live at your Netlify URL
- ✅ Security rules protecting your group's data

**Share the link with your friends.** They open it, sign in with Google,
and they're in. Posts, reactions, check-ins — all live and synced. 🎉

---

## How to update the app in the future

If you make changes to the code and want to redeploy:
1. Make your changes in the files
2. Run `npm run build` again in Terminal
3. Go to your Netlify site dashboard
4. Drag the new `dist` folder onto the page again (or use the "Deploys" tab)

---

## Troubleshooting

**"npm: command not found"**
Node.js isn't installed yet. Go to nodejs.org, download and install LTS, restart
Terminal, then try again.

**"npm install" gives errors about permissions**
Try: `sudo npm install` (Mac) — it'll ask for your computer password.

**Build fails with an error message**
The most common cause is the Firebase credentials in `config.js` not being
filled in correctly. Double-check that every `PASTE_YOUR_*_HERE` placeholder
has been replaced with your real Firebase values (no extra spaces or missing quotes).

**Friends get "auth/unauthorized-domain" error when signing in**
Your Netlify URL isn't added to Firebase's authorized domains yet. Do steps 17–22.

**The app loads but shows old demo data, not real posts**
The Firebase hooks haven't been wired into App.jsx yet. This is the code step —
see the 🔥 FIREBASE: comments in App.jsx and README.md for how to do this,
or hand the project to a developer friend at this point.

**Want a custom domain? (e.g. thechat.com)**
Domains cost about $10–15/year. Buy one from Namecheap or Google Domains,
then in Netlify → Domain settings → Add custom domain. Netlify walks you through it.
