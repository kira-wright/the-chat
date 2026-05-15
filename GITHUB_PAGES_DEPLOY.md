# Deploying The Chat on GitHub Pages ✨
### Free, no bandwidth limits, auto-deploys when you update

GitHub Pages is completely free with no limits for a private group app like this.
Once set up, every time you upload new code it automatically builds and deploys.
No more manual drag-and-drop to Netlify.

Your app will live at: https://YOUR-USERNAME.github.io/the-chat/

---

## PART 1 — Create a GitHub account (skip if you have one)

1. Go to https://github.com
2. Click "Sign up" → use any email → create a username and password
3. Verify your email

---

## PART 2 — Create a new repository

A "repository" (repo) is just a folder on GitHub that holds your code.

1. Once logged in, click the **+** icon in the top right → **New repository**
2. Name it exactly: `the-chat` (lowercase, no spaces)
3. Set it to **Public** ← important, GitHub Pages requires this on free accounts
4. Leave everything else as default
5. Click **Create repository**

You'll land on an empty repo page. Leave it open.

---

## PART 3 — Upload your code

1. Open Terminal and go to your project folder:
   ```
   cd /path/to/the-chat
   ```
   (Type `cd ` then drag the folder in)

2. Set up Git in your folder:
   ```
   git init
   git add .
   git commit -m "first commit"
   ```

3. Connect to your GitHub repo (replace YOUR-USERNAME with your GitHub username):
   ```
   git remote add origin https://github.com/YOUR-USERNAME/the-chat.git
   git branch -M main
   git push -u origin main
   ```

4. GitHub will ask for your username and password.
   - Username: your GitHub username
   - Password: use a **Personal Access Token** (not your GitHub password)
     → Go to github.com → Settings → Developer settings → Personal access tokens
     → Tokens (classic) → Generate new token → check "repo" scope → Generate
     → Copy the token and paste it as your password

---

## PART 4 — Enable GitHub Pages

1. On your repo page, click **Settings** (top tab)
2. In the left sidebar, click **Pages**
3. Under "Source", select **Deploy from a branch**
4. Under "Branch", select **gh-pages** → **/ (root)** → click Save

The gh-pages branch gets created automatically by the GitHub Action
the first time you push code. If it doesn't appear yet, wait 2 minutes
and refresh after your first push completes.

---

## PART 5 — Watch it deploy automatically

1. On your repo page, click the **Actions** tab
2. You'll see a workflow running called "Deploy to GitHub Pages"
3. Wait about 2 minutes for it to finish (green checkmark = done ✅)
4. Your app is live at: **https://YOUR-USERNAME.github.io/the-chat/**

---

## PART 6 — Update Firebase authorized domains

Since your app moved from Netlify to GitHub Pages, tell Firebase the new URL.

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Click "Add domain"
3. Add: `YOUR-USERNAME.github.io`
4. Click Add

---

## How to update the app in the future

No more manual builds or Netlify drag-and-drop! Just:

1. Make changes to your files
2. In Terminal (from the the-chat folder):
   ```
   git add .
   git commit -m "describe what you changed"
   git push
   ```
3. GitHub automatically builds and deploys in ~2 minutes ✨

---

## Sharing with friends

Send them: **https://YOUR-USERNAME.github.io/the-chat/**

They open it, sign in with Google, and they're in.
The URL is permanent and free forever.

---

## Troubleshooting

**Actions tab shows a red ✗**
Click on the failed workflow to see the error message.
Most common cause: the gh-pages branch doesn't exist yet.
Fix: go to Settings → Pages and make sure gh-pages branch is selected.

**App loads but shows blank page**
Make sure `vite.config.js` has `base: "/the-chat/"` — it's already set in this zip.

**Friends get login error**
Add `YOUR-USERNAME.github.io` to Firebase authorized domains (Part 6 above).

**"Repository not found" when pushing**
Double-check the remote URL:
```
git remote -v
```
If it's wrong, reset it:
```
git remote set-url origin https://github.com/YOUR-USERNAME/the-chat.git
```
