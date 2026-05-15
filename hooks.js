// ─── FIREBASE HOOKS ──────────────────────────────────────────────────────────
// These replace the useState(INIT_*) mock data in App.jsx with real
// Firestore reads/writes. Import and use these in App.jsx instead.

import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, query,
  orderBy, doc, setDoc, getDoc, deleteDoc, getDocs, serverTimestamp
} from "firebase/firestore";
import { db, auth, googleProvider } from "./config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// ── AUTH ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn  = () => signInWithPopup(auth, googleProvider);
  const signOut_ = () => signOut(auth);

  return { user, loading, signIn, signOut: signOut_ };
}

// ── FEED POSTS ────────────────────────────────────────────────────────────────
// Replaces: const [feed, setFeed] = useState(INIT_FEED)

export function useFeed() {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "feed"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setFeed(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const addPost = async (post) => {
    await addDoc(collection(db, "feed"), {
      ...post,
      createdAt: serverTimestamp(),
    });
  };

  return { feed, addPost };
}

// ── ARTICLES ──────────────────────────────────────────────────────────────────
// Replaces: const [articles, setArticles] = useState(INIT_ARTICLES)

export function useArticles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const addArticle = async (article) => {
    await addDoc(collection(db, "articles"), {
      ...article,
      createdAt: serverTimestamp(),
    });
  };

  return { articles, addArticle };
}

// ── CHECK-INS ─────────────────────────────────────────────────────────────────
// Replaces: const INIT_CHECKINS static array
// Each user writes their own check-in doc keyed by their uid.
// Everyone reads all check-ins in real time.

export function useCheckins(user) {
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "checkins"), (snap) => {
      setCheckins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const postCheckin = async ({ mood, note }) => {
    if (!user) return;
    // Delete old comments so they don't carry over to the new status
    try {
      const commentsSnap = await getDocs(collection(db, "checkins", user.uid, "comments"));
      console.log("Found", commentsSnap.docs.length, "comments to delete");
      await Promise.all(commentsSnap.docs.map(d => deleteDoc(d.ref)));
      console.log("Comments deleted successfully");
    } catch(e) {
      console.error("Failed to delete comments:", e.message);
    }
    // Save new check-in
    await setDoc(doc(db, "checkins", user.uid), {
      friend:    user.displayName || user.email?.split("@")[0] || "Friend",
      avatar:    user.photoURL    || "✨",
      mood,
      note,
      updatedAt: serverTimestamp(),
    });
  };

  return { checkins, postCheckin };
}

// ── PINNED POST ───────────────────────────────────────────────────────────────
// One shared "pinned" doc for the group. Any member can pin/unpin.

export function usePinned() {
  const [pinnedId, setPinnedId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "pinned"), (snap) => {
      if (snap.exists()) setPinnedId(snap.data().postId || null);
      else setPinnedId(null);
    });
    return unsub;
  }, []);

  const togglePin = async (id) => {
    const ref = doc(db, "settings", "pinned");
    if (pinnedId === id) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { postId: id });
    }
  };

  return { pinnedId, togglePin };
}

// ── STREAK ────────────────────────────────────────────────────────────────────
// Counts how many consecutive days the group has posted something.

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "feed"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const days = new Set(
        snap.docs.map(d => {
          const ts = d.data().createdAt?.toDate?.();
          return ts ? ts.toDateString() : null;
        }).filter(Boolean)
      );
      // Count consecutive days back from today
      let count = 0;
      let cursor = new Date();
      while (days.has(cursor.toDateString())) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
      }
      setStreak(count);
    });
    return unsub;
  }, []);

  return streak;
}

// ── REACTIONS ─────────────────────────────────────────────────────────────────
// Per-post reactions stored as a subcollection: feed/{postId}/reactions/{uid}

export function useReactions(postId, user) {
  const [reactions, setReactions] = useState({});    // { "❤️": 3, "🔥": 1, ... }
  const [myReaction, setMyReaction] = useState(null);

  useEffect(() => {
    if (!postId) return;
    const unsub = onSnapshot(
      collection(db, "feed", postId, "reactions"),
      (snap) => {
        const counts = {};
        snap.docs.forEach(d => {
          const { emoji } = d.data();
          counts[emoji] = (counts[emoji] || 0) + 1;
          if (d.id === user?.uid) setMyReaction(emoji);
        });
        setReactions(counts);
      }
    );
    return unsub;
  }, [postId, user?.uid]);

  const react = async (emoji, { postAuthorUid, postText, reactorName } = {}) => {
    if (!user || !postId) return;
    const ref = doc(db, "feed", postId, "reactions", user.uid);
    if (myReaction === emoji) {
      await deleteDoc(ref);
      setMyReaction(null);
    } else {
      await setDoc(ref, { emoji });
      setMyReaction(emoji);
      // Write notification if reacting to someone else's post
      if (postAuthorUid && postAuthorUid !== user.uid) {
        await writeReactionNotification({
          recipientUid: postAuthorUid,
          reactorName:  reactorName || user.displayName || "Someone",
          emoji,
          postText,
        });
      }
    }
  };

  return { reactions, myReaction, react };
}

// ── POLL VOTES ────────────────────────────────────────────────────────────────
// Votes stored as feed/{postId}/votes/{uid} = { optionIndex: N }
// So each user can only vote once, and votes are persistent.

export function usePollVotes(postId, user) {
  const [votes, setVotes] = useState({});   // { uid: optionIndex }
  const [myVote, setMyVote] = useState(null);

  useEffect(() => {
    if (!postId) return;
    const unsub = onSnapshot(
      collection(db, "feed", postId, "votes"),
      (snap) => {
        const v = {};
        snap.docs.forEach(d => { v[d.id] = d.data().optionIndex; });
        setVotes(v);
        if (user?.uid && v[user.uid] !== undefined) setMyVote(v[user.uid]);
      }
    );
    return unsub;
  }, [postId, user?.uid]);

  const castVote = async (optionIndex) => {
    if (!user || !postId || myVote !== null) return;
    await setDoc(doc(db, "feed", postId, "votes", user.uid), { optionIndex });
    setMyVote(optionIndex);
  };

  // Tally votes per option index
  const tally = (numOptions) => {
    const counts = Array(numOptions).fill(0);
    Object.values(votes).forEach(i => { if (i < numOptions) counts[i]++; });
    return counts;
  };

  return { myVote, tally, castVote, totalVoters: Object.keys(votes).length };
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
// When someone reacts to your post, a notification doc is written to:
//   notifications/{recipientUid}/items/{notificationId}
// The current user reads their own notifications in real time.

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [lastRead, setLastRead]           = useState(() => {
    // Persist lastRead time in localStorage so it survives page refreshes
    const stored = localStorage.getItem("notif_lastRead");
    return stored ? new Date(stored) : new Date(0);
  });

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "notifications", user.uid, "items"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => {
    const ts = n.createdAt?.toDate?.();
    return ts && ts > lastRead;
  }).length;

  const markAllRead = () => {
    const now = new Date();
    setLastRead(now);
    localStorage.setItem("notif_lastRead", now.toISOString());
  };

  return { notifications, unreadCount, markAllRead };
}

// ── WRITE A NOTIFICATION ──────────────────────────────────────────────────────
// Called inside useReactions when someone reacts to a post they don't own.
export async function writeReactionNotification({ recipientUid, reactorName, emoji, postText }) {
  if (!recipientUid || !reactorName) return;
  await addDoc(
    collection(db, "notifications", recipientUid, "items"),
    {
      type:      "reaction",
      emoji,
      from:      reactorName,
      postText:  postText?.slice(0, 60) || "your post",
      createdAt: serverTimestamp(),
      read:      false,
    }
  );
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
// Comments stored as subcollections:
//   feed/{postId}/comments/{commentId}
//   checkins/{checkinUid}/comments/{commentId}

export function useComments(collectionPath, docId) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!docId) return;
    const q = query(
      collection(db, collectionPath, docId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [collectionPath, docId]);

  const addComment = async (user, text) => {
    if (!user || !text.trim() || !docId) return;
    await addDoc(collection(db, collectionPath, docId, "comments"), {
      text:      text.trim(),
      authorUid: user.uid,
      author:    user.displayName || user.email?.split("@")[0] || "Someone",
      avatar:    user.photoURL || null,
      createdAt: serverTimestamp(),
    });
  };

  return { comments, addComment };
}

// ── CHECKIN REACTIONS ─────────────────────────────────────────────────────────
// Same pattern as post reactions but under checkins/{uid}/reactions/{reactorUid}

export function useCheckinReactions(checkinUid, user) {
  const [reactions, setReactions] = useState({});
  const [myReaction, setMyReaction] = useState(null);

  useEffect(() => {
    if (!checkinUid) return;
    const unsub = onSnapshot(
      collection(db, "checkins", checkinUid, "reactions"),
      (snap) => {
        const counts = {};
        snap.docs.forEach(d => {
          const { emoji } = d.data();
          counts[emoji] = (counts[emoji] || 0) + 1;
          if (d.id === user?.uid) setMyReaction(emoji);
        });
        setReactions(counts);
      }
    );
    return unsub;
  }, [checkinUid, user?.uid]);

  const react = async (emoji, { reactorName } = {}) => {
    if (!user || !checkinUid) return;
    const ref = doc(db, "checkins", checkinUid, "reactions", user.uid);
    if (myReaction === emoji) {
      await deleteDoc(ref);
      setMyReaction(null);
    } else {
      await setDoc(ref, { emoji });
      setMyReaction(emoji);
    }
  };

  return { reactions, myReaction, react };
}
