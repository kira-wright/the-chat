import { useState, useEffect } from "react";
import { useAuth, useFeed, useArticles, useCheckins, usePinned, useStreak, useReactions, usePollVotes, useNotifications, useComments, useCheckinReactions } from "./firebase/hooks";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase/config";

// ─── FIREBASE WIRED ──────────────────────────────────────────────
// This file is the complete UI. To make it multi-user with real data, replace
// the marked sections below with Firebase hooks from src/firebase/hooks.js
//
// SEARCH FOR "🔥 FIREBASE:" comments to find every swap point.
//
// QUICK START:
//   1. Fill in src/firebase/config.js with your Firebase project credentials
//   2. Run: npm install
//   3. Replace each 🔥 FIREBASE: section with the hook shown
//   4. Add <Login/> screen before the main app (see hooks.js useAuth)
// ─────────────────────────────────────────────────────────────────────────────

// ─── PEOPLE ──────────────────────────────────────────────────────────────────
const PEOPLE = [
  { id:1, name:"Maya",  cultName:"Sister Maya",  avatar:"🌸", cultAvatar:"🕯️", color:"#E8A598", cultColor:"#C4383A" },
  { id:2, name:"Jess",  cultName:"Sister Jess",  avatar:"🌿", cultAvatar:"🌿", color:"#8BAF8B", cultColor:"#B03040" },
  { id:3, name:"Priya", cultName:"Sister Priya", avatar:"🌙", cultAvatar:"🌙", color:"#9B8EC4", cultColor:"#D4606A" },
  { id:4, name:"You",   cultName:"You",           avatar:"✨", cultAvatar:"👁️", color:"#D4A96A", cultColor:"#E08878" },
];

// ─── PROMPTS & MOODS ─────────────────────────────────────────────────────────
const PROMPTS_COZY = [
  "What made you smile today?","What song is living in your head right now?",
  "Show us something beautiful you saw today.","What are you looking forward to this week?",
  "What's one small thing you're grateful for?","What did you eat today that you loved?",
  "Name a moment today that felt like a breath of fresh air.",
];
const PROMPTS_CULT = [
  "What sign did the universe send you today, child?","Which song carried your spirit this morning?",
  "Describe something beautiful that crossed your path.","What ritual are you looking forward to this week?",
  "Name one small miracle you are grateful for.","What did you consume today that nourished your soul?",
  "Describe a moment today when the veil felt thin.",
];
const MOODS_COZY = ["🌤️ Good","🌧️ Hard","🌈 Great","🌫️ Meh","🌙 Tired","🔥 Alive"];
const MOODS_CULT = ["☀️ Ascending","🌧️ Cleansing","🔥 Transcendent","🌫️ Seeking","🌙 Dormant","⚡ Awakened"];

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const INIT_FEED = [
  { id:1,  author:"Maya",  avatar:"🌸", cultAvatar:"🕯️", color:"#E8A598", cultColor:"#C4383A", type:"moment",  text:"First coffee in the garden ☕ the lilacs are blooming", time:"9:12am",    bg:"#FFF5F0", rotation:-2 },
  { id:2,  author:"Priya", avatar:"🌙", cultAvatar:"🌙", color:"#9B8EC4", cultColor:"#D4606A", type:"music",   text:"Endlessly — Bon Iver", sub:"This one hits different lately", time:"Yesterday", bg:"#F5F0FF", rotation:1.5, linkType:"spotify", embedUrl:"https://open.spotify.com/embed/track/0ofHAoxe9vBkTCp2UQIavz?utm_source=generator&theme=0" },
  { id:3,  author:"Jess",  avatar:"🌿", cultAvatar:"🌿", color:"#8BAF8B", cultColor:"#B03040", type:"list",    title:"top 5 songs this week 🎵", items:["Espresso - Sabrina Carpenter","Von dutch - Charli XCX","Good Luck Babe - Chappell Roan","360 - Charli XCX","Please Please Please - Sabrina Carpenter"], time:"Yesterday", bg:"#F0FFF4", rotation:-1 },
  { id:4,  author:"You",   avatar:"✨", cultAvatar:"👁️", color:"#D4A96A", cultColor:"#E08878", type:"moment",  text:"She laughed for the first time today. I cried. Obviously.", time:"2 days ago", bg:"#FFFAF0", rotation:2 },
  { id:5,  author:"Priya", avatar:"🌙", cultAvatar:"🌙", color:"#9B8EC4", cultColor:"#D4606A", type:"poll",    question:"best era for a girls trip?", options:["🌊 Beach","🏙️ City break","🏕️ Camping","🌍 International"], votes:[3,5,1,4], time:"2 days ago", bg:"#F8F0FF", rotation:-0.5 },
  { id:6,  author:"Maya",  avatar:"🌸", cultAvatar:"🕯️", color:"#E8A598", cultColor:"#C4383A", type:"music",   text:"Feather — Sabrina Carpenter", sub:"My current walk to the kitchen song lol", time:"3 days ago", bg:"#FFF5F0", rotation:-1.5, linkType:"spotify", embedUrl:"https://open.spotify.com/embed/track/7K3BhDmGSmDwGnpRqGHGNW?utm_source=generator&theme=0" },
  { id:7,  author:"Jess",  avatar:"🌿", cultAvatar:"🌿", color:"#8BAF8B", cultColor:"#B03040", type:"note",    text:"reminder to everyone that we haven't had a dance night in THREE MONTHS. this is a cry for help. also I found a new playlist. also I miss you all. ok bye.", time:"3 days ago", bg:"#F0FFF8", rotation:1 },
  { id:8,  author:"Maya",  avatar:"🌸", cultAvatar:"🕯️", color:"#E8A598", cultColor:"#C4383A", type:"collab",  title:"things we need for the trip 🏕️", items:["bug spray ✅","snacks (Jess is on it)","portable speaker","someone figure out the playlist","sunscreen x4"], time:"4 days ago", bg:"#FFFAF0", rotation:-1 },
];

const INIT_ARTICLES = [
  { id:1, author:"Priya", avatar:"🌙", cultAvatar:"🌙", color:"#9B8EC4", cultColor:"#D4606A", title:"The case for doing nothing", source:"The Atlantic", url:"#", note:"This gave me permission to just sit. Sending to everyone.", time:"Yesterday", rotation:-1.5 },
  { id:2, author:"Maya",  avatar:"🌸", cultAvatar:"🕯️", color:"#E8A598", cultColor:"#C4383A", title:"Why your brain needs more boredom", source:"Nautilus", url:"#", note:"The science version of 'put your phone down' lol", time:"2 days ago", rotation:1 },
  { id:3, author:"Jess",  avatar:"🌿", cultAvatar:"🌿", color:"#8BAF8B", cultColor:"#B03040", title:"The lost art of getting lost", source:"Orion Magazine", url:"#", note:"Made me want to go somewhere with no signal.", time:"4 days ago", rotation:-0.5 },
];

const INIT_CHECKINS = [
  { friend:"Maya",  avatar:"🌸", cultAvatar:"🕯️", color:"#E8A598", cultColor:"#C4383A", mood:"🌈 Great",  cultMood:"🔥 Transcendent", note:"Big work win today!",        cultNote:"The prophecy at work was fulfilled." },
  { friend:"Jess",  avatar:"🌿", cultAvatar:"🌿", color:"#8BAF8B", cultColor:"#B03040", mood:"🌤️ Good",   cultMood:"☀️ Ascending",    note:"Quiet, steady kind of day", cultNote:"A quiet, sacred kind of day." },
  { friend:"Priya", avatar:"🌙", cultAvatar:"🌙", color:"#9B8EC4", cultColor:"#D4606A", mood:"🌙 Tired",   cultMood:"🌙 Dormant",      note:"Long week, but we made it", cultNote:"A long trial. But the circle endures." },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function detectLinkType(url) {
  if (!url) return null;
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("youtu.be")||url.includes("youtube.com")) return "youtube";
  return null;
}
function getSpotifyEmbed(url) {
  try { const m=url.match(/spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/); if(m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`; } catch{} return null;
}
function getYouTubeEmbed(url) {
  try { let v=null; if(url.includes("youtu.be/")) v=url.split("youtu.be/")[1].split("?")[0]; else if(url.includes("youtube.com/watch")) v=new URL(url).searchParams.get("v"); else if(url.includes("youtube.com/shorts/")) v=url.split("shorts/")[1].split("?")[0]; if(v) return `https://www.youtube.com/embed/${v}`; } catch{} return null;
}


function formatTime(ts) {
  if (!ts) return "Just now";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return date.toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  cozy:{
    appBg:"linear-gradient(135deg,#FDF6EE 0%,#F5EDE3 50%,#EDE8F0 100%)",
    cardBg:"white", cardBorder:"none", cardShadow:"0 2px 16px rgba(0,0,0,0.07)",
    navBg:"rgba(253,246,238,0.95)", navBorder:"1px solid rgba(200,180,160,0.3)",
    heroBg:"linear-gradient(135deg,#3D2C1E,#6B4226)",
    inputBg:"#FDFAF7", inputBorder:"1.5px solid #E8DDD4", inputFocus:"#C4A882",
    sectionBg:"#F9F5F0", sectionBorder:"1px solid #EDE0D4",
    promptBg:"#F5EDE3", promptBorderL:"3px solid #C4A882",
    titleFont:"'Lora',serif", bodyFont:"'DM Sans',sans-serif",
    appTitle:"the chat ✨", appSub:"just the girls",
    heroLabel:"TODAY'S PROMPT", heroCta:"Drop something →",
    primary:"#3D2C1E", secondary:"#A08070", tertiary:"#C4B4A4", accent:"#C4A882",
    heroText:"#D4B888", dotColor:"#E8C4A0", dotActive:"#C4A882",
    navTabs:[{id:"home",icon:"✨",label:"Home"},{id:"feed",icon:"💬",label:"Feed"},{id:"articles",icon:"📰",label:"Reads"},{id:"share",icon:"➕",label:"Post"}],
    feedTitle:"The Feed", feedSub:"Everything the group's been up to.",
    checkinsTitle:"How everyone's doing",
    shareTitle:"Post something", shareSub:"No likes, no algorithm. Just the chat.",
    sharePrivacy:"Only the chat sees this. Always.",
    moodPrompt:"How are you feeling today?", moodBtn:"Share with the chat ✨",
    moodSuccess:"Sent to the chat!", moodSuccessSub:"They can feel you today.", moodSuccessIcon:"🌸",
    articlesTitle:"Reading Room", articlesSub:"Things worth your attention.",
    articleShareBtn:"Share with the chat 📰",
    seeAll:"See all →", seeAllStyle:{fontStyle:"normal"},
    shareTypes:[
      {value:"moment",label:"✨ Moment"},{value:"music",label:"🎵 Music"},
      {value:"note",label:"📝 Note"},{value:"list",label:"📋 List"},
      {value:"poll",label:"🗳️ Poll"},{value:"article",label:"📰 Article"},
    ],
    typeBadge:{
      moment:{bg:"#FFF0E0",color:"#A07040",label:"✨ moment"},
      music:{bg:"#EDE0FF",color:"#7B5EA7",label:"🎵 music"},
      mood:{bg:"#E0F0FF",color:"#4A7FA5",label:"💭 mood"},
      video:{bg:"#FFE0E0",color:"#A04040",label:"▶️ video"},
      note:{bg:"#FFF8E0",color:"#9A7020",label:"📝 note"},
      list:{bg:"#E8FFE8",color:"#3A8A3A",label:"📋 list"},
      collab:{bg:"#FFE8F8",color:"#9A40A0",label:"🤝 collab list"},
      poll:{bg:"#E0F0FF",color:"#3060A0",label:"🗳️ poll"},
      article:{bg:"#E0F5FF",color:"#2A7A9A",label:"📰 read"},
    },
    pillBorder:"1.5px solid #E0D4C8", pillBg:"white", pillColor:"#555",
    pillOnBg:"#3D2C1E", pillOnColor:"white", pillOnBorder:"#3D2C1E",
    radius:"18px", cardRadius:"14px", btnRadius:"12px", pillRadius:"30px", inputRadius:"12px",
  },
  cult:{
    appBg:"linear-gradient(160deg,#1A0608 0%,#110408 50%,#0E0308 100%)",
    cardBg:"linear-gradient(160deg,#2A0C0E,#1A0608)", cardBorder:"1px solid rgba(160,50,55,0.4)", cardShadow:"0 4px 24px rgba(0,0,0,0.6),inset 0 1px 0 rgba(200,80,80,0.08)",
    navBg:"rgba(14,4,6,0.97)", navBorder:"1px solid rgba(160,50,55,0.3)",
    heroBg:"linear-gradient(160deg,#3A0A0C,#1A0406)",
    inputBg:"rgba(22,6,8,0.9)", inputBorder:"1px solid rgba(160,60,60,0.3)", inputFocus:"#9B4040",
    sectionBg:"rgba(28,8,10,0.85)", sectionBorder:"1px solid rgba(160,50,55,0.25)",
    promptBg:"rgba(80,20,22,0.5)", promptBorderL:"2px solid #8B2020",
    titleFont:"'Cinzel',serif", bodyFont:"'Crimson Text',serif",
    appTitle:"The Circle", appSub:"your sacred inner sanctum",
    heroLabel:"TODAY'S PROPHECY", heroCta:"Make Your Offering →",
    primary:"#D4B888", secondary:"#9A7858", tertiary:"#7A6050", accent:"#C49050",
    heroText:"#D4B888", dotColor:"#E8C4A0", dotActive:"#8B6030",
    navTabs:[{id:"home",icon:"👁️",label:"Sanctum"},{id:"feed",icon:"📜",label:"Scrolls"},{id:"articles",icon:"📖",label:"Texts"},{id:"share",icon:"🕯️",label:"Offer"}],
    feedTitle:"The Sacred Scrolls", feedSub:"Fragments of the circle's shared becoming.",
    checkinsTitle:"The Circle's Vibrations",
    shareTitle:"Make Your Offering", shareSub:"The circle receives all truths. No judgment. Only us.",
    sharePrivacy:"Only the circle shall bear witness. Always.",
    moodPrompt:"Declare your vibration to the circle, child.", moodBtn:"Declare to the Circle 🕯️",
    moodSuccess:"The circle has received you.", moodSuccessSub:"Your vibration is known.", moodSuccessIcon:"🌿",
    articlesTitle:"Sacred Texts", articlesSub:"Wisdom the universe placed in our path.",
    articleShareBtn:"Offer to the Circle 📖",
    seeAll:"See all sacred texts →", seeAllStyle:{fontStyle:"italic"},
    shareTypes:[
      {value:"vision",label:"📜 Vision"},{value:"hymn",label:"♪ Hymn"},
      {value:"note",label:"📝 Scroll"},{value:"list",label:"📋 Tablet"},
      {value:"poll",label:"🔮 Oracle"},{value:"article",label:"📖 Text"},
    ],
    typeBadge:{
      moment:{bg:"rgba(180,120,60,0.15)",color:"#D4905A",label:"📜 vision"},
      music:{bg:"rgba(139,107,174,0.18)",color:"#B07BC4",label:"♪ hymn"},
      vision:{bg:"rgba(180,120,60,0.15)",color:"#D4905A",label:"📜 vision"},
      hymn:{bg:"rgba(139,107,174,0.18)",color:"#B07BC4",label:"♪ hymn"},
      mood:{bg:"rgba(200,80,60,0.15)",color:"#D07060",label:"⚡ vibration"},
      vibration:{bg:"rgba(200,80,60,0.15)",color:"#D07060",label:"⚡ vibration"},
      video:{bg:"rgba(100,60,180,0.15)",color:"#9070C0",label:"▶ vision"},
      note:{bg:"rgba(180,150,40,0.15)",color:"#C4A830",label:"📝 scroll"},
      list:{bg:"rgba(80,160,80,0.15)",color:"#70B070",label:"📋 tablet"},
      collab:{bg:"rgba(180,80,160,0.15)",color:"#C070B0",label:"🤝 shared tablet"},
      poll:{bg:"rgba(80,120,200,0.15)",color:"#8090D0",label:"🔮 oracle"},
      article:{bg:"rgba(80,120,180,0.15)",color:"#7090C0",label:"📖 text"},
    },
    pillBorder:"1px solid rgba(139,96,48,0.4)", pillBg:"rgba(30,15,5,0.8)", pillColor:"#B89878",
    pillOnBg:"#3D1A06", pillOnColor:"#D4A87A", pillOnBorder:"#8B6030",
    radius:"4px", cardRadius:"4px", btnRadius:"3px", pillRadius:"2px", inputRadius:"3px",
  },
};

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FONTS=`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');`;

// ─── MEDIA EMBED ─────────────────────────────────────────────────────────────
function MediaEmbed({linkType,embedUrl,expanded,onToggle,isCult,t}){
  if(!embedUrl) return null;
  const isSpotify=linkType==="spotify";
  return(
    <div style={{marginTop:10}}>
      {!expanded?(
        <button onClick={onToggle} style={{display:"flex",alignItems:"center",gap:7,background:isSpotify?"#1DB95420":"#FF000020",border:`1px solid ${isSpotify?"#1DB95450":"#FF000050"}`,borderRadius:isCult?3:20,padding:"6px 12px",cursor:"pointer",fontSize:12,color:isSpotify?"#1a9a3a":"#c00000",fontFamily:t.bodyFont,fontWeight:500}}>
          <span>{isSpotify?"🎵":"▶️"}</span>
          {isSpotify?(isCult?"Hear the Sacred Hymn":"Play on Spotify"):(isCult?"Witness the Vision":"Watch on YouTube")}
          <span style={{opacity:0.6,fontSize:11}}>▾</span>
        </button>
      ):(
        <div style={{borderRadius:isCult?4:12,overflow:"hidden",position:"relative",border:isCult?"1px solid rgba(180,120,60,0.3)":"none"}}>
          <button onClick={onToggle} style={{position:"absolute",top:6,right:6,zIndex:10,background:"rgba(0,0,0,0.6)",color:isCult?"#D4A87A":"white",border:"none",borderRadius:"50%",width:24,height:24,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <iframe src={embedUrl} width="100%" height={isSpotify?"80":"200"} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{display:"block"}}/>
        </div>
      )}
    </div>
  );
}

// ─── POLL CARD ───────────────────────────────────────────────────────────────
function PollCard({item,isCult,t,user}){
  const { myVote, tally, castVote, totalVoters } = usePollVotes(item.id, user);
  const counts = tally(item.options.length);
  const total  = totalVoters;
  return(
    <div style={{marginTop:10}}>
      <p style={{fontFamily:t.titleFont,fontSize:15,color:isCult?"#E8D4A8":t.primary,marginBottom:10,fontWeight:isCult?"normal":600}}>{item.question}</p>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {item.options.map((opt,i)=>{
          const pct=total>0?Math.round((counts[i]/total)*100):0;
          const isWinner=myVote!==null&&counts[i]===Math.max(...counts);
          return(
            <button key={i} onClick={()=>castVote(i)} style={{width:"100%",textAlign:"left",background:"none",border:"none",padding:0,cursor:myVote!==null?"default":"pointer"}}>
              <div style={{position:"relative",borderRadius:isCult?2:8,overflow:"hidden",border:`1px solid ${isCult?"rgba(139,96,48,0.35)":myVote===i?"#C4A882":"#E8DDD4"}`,background:isCult?"rgba(28,8,10,0.7)":"#FDFAF7"}}>
                {myVote!==null&&<div style={{position:"absolute",top:0,left:0,height:"100%",width:`${pct}%`,background:isCult?(isWinner?"rgba(180,100,30,0.25)":"rgba(100,60,20,0.15)"):(isWinner?"rgba(196,168,130,0.25)":"rgba(200,180,160,0.12)"),transition:"width 0.5s ease"}}/>}
                <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px"}}>
                  <span style={{fontSize:13,fontFamily:t.bodyFont,color:isCult?(myVote===i?"#D4A87A":"#9A7858"):(myVote===i?"#3D2C1E":"#6A5040")}}>{opt}</span>
                  {myVote!==null&&<span style={{fontSize:12,fontWeight:600,color:isCult?"#C4905A":"#C4A882"}}>{pct}%</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p style={{fontSize:11,color:t.tertiary,marginTop:6,fontStyle:"italic"}}>{total} {total===1?"vote":"votes"}{myVote===null?" · tap to vote":""}</p>
    </div>
  );
}


// ─── REACTIONS ───────────────────────────────────────────────────────────────
const REACTION_SETS = {
  cozy: ["❤️","😂","🔥","✨","😭","👏"],
  cult: ["🩸","🕯️","👁️","🔥","💀","✦"],
};
function Reactions({isCult,t,postId,user,postAuthorUid,postText}){
  const emojis=isCult?REACTION_SETS.cult:REACTION_SETS.cozy;
  const { reactions, myReaction, react } = useReactions(postId, user);
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
      {emojis.map((e,i)=>{
        const count=reactions[e]||0;
        const ismine=myReaction===e;
        return(
          <button key={i} onClick={()=>react(e,{postAuthorUid,postText,reactorName:user?.displayName||user?.email?.split("@")[0]||"Someone"})} style={{display:"flex",alignItems:"center",gap:3,background:ismine?(isCult?"rgba(180,30,30,0.35)":"rgba(196,168,130,0.2)"):(isCult?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"),border:`1px solid ${ismine?(isCult?"rgba(220,80,80,0.5)":"rgba(196,168,130,0.6)"):(isCult?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)")}`,borderRadius:isCult?2:20,padding:"4px 8px",cursor:"pointer",fontSize:13,color:ismine?(isCult?"#F0A0A0":"#8C6A50"):(isCult?"rgba(255,255,255,0.45)":"#999"),fontFamily:"inherit",transition:"all 0.15s"}}>
            <span>{e}</span>
            {count>0&&<span style={{fontSize:11,fontWeight:600}}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}


// ─── COMMENT THREAD ──────────────────────────────────────────────────────────
function CommentThread({collectionPath, docId, user, isCult, t}) {
  const { comments, addComment } = useComments(collectionPath, docId);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    await addComment(user, text);
    setText("");
    setSubmitting(false);
  };

  return (
    <div style={{marginTop:10,borderTop:`1px solid ${isCult?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}`,paddingTop:10}}>
      {comments.length > 0 && (
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
          {comments.map(c => {
            const ts = c.createdAt?.toDate?.();
            const timeStr = ts ? ts.toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "just now";
            return (
              <div key={c.id} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:isCult?"rgba(200,100,100,0.2)":"rgba(196,168,130,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,overflow:"hidden",border:`1px solid ${isCult?"rgba(200,100,100,0.3)":"rgba(196,168,130,0.3)"}`}}>
                  {c.avatar&&c.avatar.startsWith("http")
                    ?<img src={c.avatar} width="26" height="26" style={{objectFit:"cover",borderRadius:"50%"}} alt={c.author}/>
                    :<span style={{fontSize:11,fontFamily:t.bodyFont,color:isCult?"rgba(255,255,255,0.7)":"#8C6A50",fontWeight:500}}>{(c.author||"?")[0].toUpperCase()}</span>
                  }
                </div>
                <div style={{flex:1,minWidth:0,background:isCult?"rgba(255,255,255,0.04)":"#F8F4F0",borderRadius:isCult?3:10,padding:"7px 10px"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
                    <span style={{fontSize:11,fontWeight:500,color:isCult?"rgba(255,255,255,0.85)":"#3D2C1E",fontFamily:t.bodyFont}}>{c.author}</span>
                    <span style={{fontSize:10,color:t.tertiary}}>{timeStr}</span>
                  </div>
                  <p style={{fontSize:12,color:isCult?"rgba(220,190,190,0.9)":"#5A4A30",lineHeight:1.45,fontFamily:t.bodyFont,wordBreak:"break-word"}}>{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {comments.length === 0 && (
        <p style={{fontSize:11,color:t.tertiary,fontStyle:"italic",marginBottom:8,fontFamily:t.bodyFont}}>{isCult?"No testimonies yet. Be the first to speak.":"No comments yet — be the first!"}</p>
      )}
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{width:26,height:26,borderRadius:"50%",background:isCult?"rgba(200,100,100,0.2)":"rgba(196,168,130,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,overflow:"hidden",border:`1px solid ${isCult?"rgba(200,100,100,0.3)":"rgba(196,168,130,0.3)"}`}}>
          {user?.photoURL
            ?<img src={user.photoURL} width="26" height="26" style={{objectFit:"cover",borderRadius:"50%"}} alt="you"/>
            :<span style={{fontSize:11,fontFamily:t.bodyFont,color:isCult?"rgba(255,255,255,0.7)":"#8C6A50",fontWeight:500}}>{(user?.displayName||"Y")[0].toUpperCase()}</span>
          }
        </div>
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}
          placeholder={isCult?"Leave your testimony...":"Add a comment..."}
          style={{flex:1,background:isCult?"rgba(22,6,8,0.7)":"#F8F4F0",border:isCult?"1px solid rgba(160,60,60,0.25)":"1px solid #E8DDD4",borderRadius:isCult?3:20,padding:"7px 12px",fontSize:12,fontFamily:t.bodyFont,color:isCult?"rgba(255,255,255,0.8)":"#3D2C1E",outline:"none"}}
        />
        <button
          onClick={submit}
          disabled={!text.trim()||submitting}
          style={{background:isCult?"linear-gradient(135deg,#5C2010,#3D1008)":"#3D2C1E",color:isCult?"#D4A87A":"white",border:isCult?"1px solid rgba(139,96,48,0.5)":"none",borderRadius:isCult?3:20,padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:t.bodyFont,opacity:!text.trim()||submitting?0.4:1,transition:"opacity 0.15s"}}
        >{isCult?"✦":"↑"}</button>
      </div>
    </div>
  );
}


// ─── CHECKIN CARD ─────────────────────────────────────────────────────────────
function CheckinCard({c, user, isCult, t}) {
  const [showComments, setShowComments] = useState(false);
  const checkinId = c.id || c.friend; // Firebase docs use uid as id
  const { reactions, myReaction, react } = useCheckinReactions(checkinId, user);
  const EMOJIS = isCult ? ["🩸","🕯️","👁️","🔥","💀","✦"] : ["❤️","😂","🔥","✨","😭","👏"];

  return (
    <div className="plain-card" style={{marginBottom:0}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(200,160,130,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,border:"1px solid rgba(200,160,130,0.3)",overflow:"hidden"}}>
          {c.avatar&&c.avatar.startsWith("http")
            ?<img src={c.avatar} width="38" height="38" style={{borderRadius:"50%",objectFit:"cover"}} alt={c.friend}/>
            :<span>{c.avatar||"✨"}</span>
          }
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:isCult?"'Cinzel',serif":t.bodyFont,fontSize:isCult?10:13,fontWeight:500,color:isCult?"rgba(255,255,255,0.88)":"#3D2C1E",letterSpacing:isCult?"0.06em":0}}>{c.friend||"Friend"}</span>
            <span style={{fontSize:12,background:isCult?"rgba(80,40,10,0.8)":"#F5EDE3",border:isCult?"1px solid rgba(139,96,48,0.3)":"none",borderRadius:isCult?2:20,padding:"2px 9px",color:isCult?"#D4A87A":"#8C6A50"}}>{c.mood}</span>
          </div>
          {c.note&&<p style={{fontSize:12,color:t.secondary,marginTop:2,fontStyle:"italic"}}>"{c.note}"</p>}
        </div>
      </div>
      {/* Reactions row */}
      <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${isCult?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}`}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {EMOJIS.map((e,i) => {
            const count = reactions[e]||0;
            const ismine = myReaction===e;
            return (
              <button key={i} onClick={()=>react(e,{reactorName:user?.displayName||"Someone"})} style={{display:"flex",alignItems:"center",gap:3,background:ismine?(isCult?"rgba(180,30,30,0.35)":"rgba(196,168,130,0.2)"):(isCult?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"),border:`1px solid ${ismine?(isCult?"rgba(220,80,80,0.5)":"rgba(196,168,130,0.6)"):(isCult?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)")}`,borderRadius:isCult?2:20,padding:"3px 7px",cursor:"pointer",fontSize:12,color:ismine?(isCult?"#F0A0A0":"#8C6A50"):(isCult?"rgba(255,255,255,0.45)":"#999"),fontFamily:"inherit",transition:"all 0.15s"}}>
                <span>{e}</span>
                {count>0&&<span style={{fontSize:10,fontWeight:600}}>{count}</span>}
              </button>
            );
          })}
        </div>
        <button onClick={()=>setShowComments(v=>!v)} style={{marginTop:6,background:"none",border:"none",cursor:"pointer",fontSize:11,color:t.secondary,fontFamily:t.bodyFont,padding:0,display:"flex",alignItems:"center",gap:4,opacity:0.8}}>
          <span style={{fontSize:13}}>{isCult?"📜":"💬"}</span>
          {showComments?(isCult?"hide testimonies":"hide comments"):(isCult?"testimonies":"comments")}
        </button>
        {showComments&&<CommentThread collectionPath="checkins" docId={checkinId} user={user} isCult={isCult} t={t}/>}
      </div>
    </div>
  );
}

// ─── FEED CARD ───────────────────────────────────────────────────────────────
function FeedCard({item,isCult,t,pinned,onPin,user,collectionPath="feed"}){
  const [expanded,setExpanded]=useState(false);
  const [collabInput,setCollabInput]=useState("");
  const [collabItems,setCollabItems]=useState(item.items||[]);
  const [showComments,setShowComments]=useState(false);
  const badge=t.typeBadge[item.type]||t.typeBadge.moment;
  const avatar=isCult?(item.cultAvatar||item.avatar):item.avatar;
  const color=isCult?(item.cultColor||item.color):item.color;
  const authorLabel=isCult&&item.author!=="You"?"Sister "+item.author:item.author;
  const cardBg=isCult?t.cardBg:(item.bg||"white");
  const rot=pinned?0:(item.rotation||0);

  return(
    <div className="feed-card" style={{background:cardBg,border:pinned?(isCult?"1px solid rgba(200,60,60,0.55)":"1.5px solid #C4A882"):t.cardBorder,boxShadow:pinned?(isCult?"0 0 18px rgba(180,30,30,0.2)":"0 0 18px rgba(196,168,130,0.25)"):t.cardShadow,transform:`rotate(${rot}deg)`}}>
      {pinned&&<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${isCult?"rgba(200,60,60,0.2)":"rgba(196,168,130,0.3)"}`}}><span style={{fontSize:11}}>{isCult?"🩸":"📌"}</span><span style={{fontSize:10,color:isCult?"rgba(220,120,120,0.9)":"#C4A882",fontFamily:isCult?"'Cinzel',serif":t.bodyFont,letterSpacing:isCult?"0.08em":"0",textTransform:isCult?"uppercase":"none"}}>{isCult?"Bound to the Circle":"Pinned by the group"}</span></div>}
      {isCult&&<div style={{height:1,background:"linear-gradient(90deg,transparent,#8B6030,transparent)",marginBottom:10}}/>}
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:color+(isCult?"25":"30"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:`1px solid ${color}50`,overflow:"hidden",flexShrink:0}}>
          {avatar&&avatar.startsWith("http")
            ?<img src={avatar} width="30" height="30" style={{objectFit:"cover",borderRadius:"50%"}} alt={item.author}/>
            :<span>{avatar||"✨"}</span>
          }
        </div>
        <span style={{fontFamily:isCult?"'Cinzel',serif":t.bodyFont,fontWeight:isCult?400:500,fontSize:isCult?11:13,color:isCult?"rgba(255,255,255,0.92)":"#3D2C1E",letterSpacing:isCult?"0.07em":0}}>{authorLabel}</span>
        <span style={{fontSize:10,background:badge.bg,color:badge.color,borderRadius:isCult?2:20,padding:"2px 8px",border:isCult?`1px solid ${badge.color}40`:"none"}}>{badge.label}</span>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,color:t.secondary,fontStyle:isCult?"italic":"normal"}}>{formatTime(item.createdAt)||item.time}</span>
          {onPin&&<button onClick={onPin} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,opacity:pinned?1:0.3,transition:"opacity 0.2s",padding:"0 2px"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=pinned?1:0.3}>{isCult?"🩸":"📌"}</button>}
        </div>
      </div>

      {/* MOMENT / MUSIC / MOOD */}
      {(item.type==="moment"||item.type==="music"||item.type==="mood"||item.type==="vision"||item.type==="hymn"||item.type==="vibration")&&(
        <>
          <p style={{fontFamily:t.titleFont,fontSize:14,color:isCult?"#D4C4A8":"#4A3728",lineHeight:1.5,fontStyle:"italic"}}>"{item.text}"</p>
          {item.sub&&<p style={{fontSize:12,color:t.secondary,marginTop:4}}>{item.sub}</p>}
          {item.embedUrl&&<MediaEmbed linkType={item.linkType} embedUrl={item.embedUrl} expanded={expanded} onToggle={()=>setExpanded(e=>!e)} isCult={isCult} t={t}/>}
        </>
      )}

      {/* NOTE */}
      {item.type==="note"&&(
        <div style={{background:isCult?"rgba(180,150,40,0.08)":"#FFFEF5",border:isCult?"1px solid rgba(180,150,40,0.2)":"1px solid #F0E8C0",borderRadius:isCult?3:10,padding:"12px 14px"}}>
          <p style={{fontFamily:isCult?"'Crimson Text',serif":"'Lora',serif",fontSize:14,color:isCult?"#D4C090":"#5A4A20",lineHeight:1.65,fontStyle:"italic",whiteSpace:"pre-wrap"}}>{item.text}</p>
        </div>
      )}

      {/* LIST (static) */}
      {item.type==="list"&&(
        <div>
          {item.title&&<p style={{fontFamily:t.titleFont,fontSize:14,color:isCult?"#D4C4A8":t.primary,marginBottom:8,fontWeight:isCult?"normal":600}}>{item.title}</p>}
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {item.items.map((li,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <span style={{color:isCult?"#C49050":t.accent,fontSize:12,marginTop:2,flexShrink:0}}>{isCult?"✦":"•"}</span>
                <span style={{fontSize:13,fontFamily:t.bodyFont,color:isCult?"#C4B490":t.primary,lineHeight:1.4}}>{li}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COLLAB LIST */}
      {item.type==="collab"&&(
        <div>
          {item.title&&<p style={{fontFamily:t.titleFont,fontSize:14,color:isCult?"#D4C4A8":t.primary,marginBottom:8,fontWeight:isCult?"normal":600}}>{item.title}</p>}
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
            {collabItems.map((li,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <span style={{color:isCult?"#9070B0":"#C090C0",fontSize:12,marginTop:2,flexShrink:0}}>{isCult?"✦":"★"}</span>
                <span style={{fontSize:13,fontFamily:t.bodyFont,color:isCult?"#C4B490":t.primary,lineHeight:1.4}}>{li}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={collabInput} onChange={e=>setCollabInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&collabInput.trim()){setCollabItems([...collabItems,collabInput.trim()]);setCollabInput("");}}} placeholder={isCult?"Add to the tablet...":"Add something..."} style={{flex:1,background:isCult?"rgba(22,6,8,0.7)":"#FDFAF7",border:isCult?"1px solid rgba(139,96,48,0.25)":"1px solid #E8DDD4",borderRadius:isCult?2:8,padding:"7px 10px",fontSize:13,fontFamily:t.bodyFont,color:t.primary,outline:"none"}}/>
            <button onClick={()=>{if(collabInput.trim()){setCollabItems([...collabItems,collabInput.trim()]);setCollabInput("");}}} style={{background:isCult?"rgba(80,30,10,0.8)":"#F5EDE3",border:isCult?"1px solid rgba(139,96,48,0.3)":"none",borderRadius:isCult?2:8,padding:"7px 12px",cursor:"pointer",fontSize:13,color:isCult?"#D4A87A":"#8C6A50"}}>+</button>
          </div>
        </div>
      )}

      {/* POLL */}
      {item.type==="poll"&&<PollCard item={item} isCult={isCult} t={t} user={user}/>}

      {/* ARTICLE */}
      {item.type==="article"&&(
        <div>
          <a href={item.url||"#"} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:6}}>
            <p style={{fontFamily:t.titleFont,fontSize:15,color:isCult?"#E8D4A8":t.primary,lineHeight:1.4,fontWeight:isCult?"normal":600}}>{item.title}</p>
            <p style={{fontSize:12,color:t.accent,marginTop:3,fontStyle:"italic"}}>{item.source} ↗</p>
          </a>
          {item.note&&<p style={{fontSize:13,color:t.secondary,fontStyle:"italic",fontFamily:t.bodyFont,borderTop:`1px solid ${isCult?"rgba(139,96,48,0.2)":"#F0E8E0"}`,paddingTop:8,marginTop:4}}>"{item.note}"</p>}
        </div>
      )}

      <div style={{marginTop:9,paddingTop:8,borderTop:`1px solid ${isCult?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}`}}>
        <Reactions isCult={isCult} t={t} postId={item.id} user={user} postAuthorUid={item.authorUid} postText={item.text||item.title||item.question}/>
        <button onClick={()=>setShowComments(v=>!v)} style={{marginTop:8,background:"none",border:"none",cursor:"pointer",fontSize:11,color:t.secondary,fontFamily:t.bodyFont,padding:0,display:"flex",alignItems:"center",gap:4,opacity:0.8}}>
          <span style={{fontSize:13}}>{isCult?"📜":"💬"}</span>
          {showComments?(isCult?"hide testimonies":"hide comments"):(isCult?"testimonies":"comments")}
        </button>
        {showComments&&<CommentThread collectionPath={collectionPath} docId={item.id} user={user} isCult={isCult} t={t}/>}
      </div>
      {isCult&&<div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(120,30,30,0.5),transparent)",marginTop:10}}/>}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function TheChat(){
  const [theme,setTheme]=useState("cozy");
  const [tab,setTab]=useState("home");
  const [myMood,setMyMood]=useState(null);
  const [moodNote,setMoodNote]=useState("");
  const [moodSent,setMoodSent]=useState(false);
  const [promptIdx,setPromptIdx]=useState(0);
  const [toggling,setToggling]=useState(false);
  const [showNotifs,setShowNotifs]=useState(false);
  // ── Firebase hooks ──
  const { user, loading, signIn } = useAuth();
  const { feed, addPost }         = useFeed();
  const { articles, addArticle }  = useArticles();
  const { checkins, postCheckin } = useCheckins(user);
  const { pinnedId, togglePin }   = usePinned();
  const streak                    = useStreak();
  const { notifications, unreadCount, markAllRead } = useNotifications(user);

  // Share state
  const [shareType,setShareType]=useState("moment");
  const [shareText,setShareText]=useState("");
  const [shareTitle,setShareTitle]=useState("");
  const [linkUrl,setLinkUrl]=useState("");
  const [linkError,setLinkError]=useState("");
  const [listItems,setListItems]=useState([""]);
  const [pollQ,setPollQ]=useState("");
  const [pollOptions,setPollOptions]=useState(["",""]);
  const [isCollab,setIsCollab]=useState(false);
  const [articleTitle,setArticleTitle]=useState("");
  const [articleSource,setArticleSource]=useState("");
  const [articleUrl,setArticleUrl]=useState("");
  const [articleNote,setArticleNote]=useState("");
  const [posted,setPosted]=useState(false);

  const t=T[theme];
  const isCult=theme==="cult";
  const PROMPTS=isCult?PROMPTS_CULT:PROMPTS_COZY;
  const MOODS=isCult?MOODS_CULT:MOODS_COZY;
  const detectedLink=detectLinkType(linkUrl);

  useEffect(()=>{
    const i=setInterval(()=>setPromptIdx(n=>(n+1)%PROMPTS.length),8000);
    return()=>clearInterval(i);
  },[theme]);

  const switchTheme=()=>{ setToggling(true); setTimeout(()=>{setTheme(th=>th==="cozy"?"cult":"cozy");setToggling(false);},280); };

  const resetShare=()=>{ setShareText("");setShareTitle("");setLinkUrl("");setLinkError("");setListItems([""]);setPollQ("");setPollOptions(["",""]);setIsCollab(false);setArticleTitle("");setArticleSource("");setArticleUrl("");setArticleNote(""); };

  const handlePost=async ()=>{
    const displayName = user?.displayName || user?.email?.split("@")[0] || "You";
    const photoURL    = user?.photoURL    || null;
    const base={
      authorUid: user?.uid || "anon",
      author:    displayName,
      avatar:    photoURL || "✨",
      cultAvatar:"👁️",
      color:"#D4A96A", cultColor:"#E08878",
      time:"Just now",
      rotation:(Math.random()-0.5)*3,
      bg:"#FFFAF0"
    };
    let entry=null;
    const st=shareType;

    if(st==="moment"||st==="music"||st==="vision"||st==="hymn"){
      if(!shareText.trim()) return;
      let embedUrl=null,linkType=null;
      if(linkUrl.trim()){
        linkType=detectLinkType(linkUrl);
        if(linkType==="spotify") embedUrl=getSpotifyEmbed(linkUrl);
        else if(linkType==="youtube") embedUrl=getYouTubeEmbed(linkUrl);
        if(linkUrl.trim()&&!embedUrl){setLinkError("Couldn't parse that link.");return;}
      }
      entry={...base,type:st==="vision"?"moment":st==="hymn"?"music":st,text:shareText,linkType,embedUrl};
    } else if(st==="note"||st==="scroll"){
      if(!shareText.trim()) return;
      entry={...base,type:"note",text:shareText};
    } else if(st==="list"||st==="tablet"){
      const items=listItems.filter(i=>i.trim());
      if(!items.length) return;
      entry={...base,type:isCollab?"collab":"list",title:shareTitle||undefined,items};
    } else if(st==="poll"||st==="oracle"){
      const opts=pollOptions.filter(o=>o.trim());
      if(!pollQ.trim()||opts.length<2) return;
      entry={...base,type:"poll",question:pollQ,options:opts,votes:opts.map(()=>0)};
    } else if(st==="article"){
      if(!articleTitle.trim()) return;
      entry={...base,type:"article",title:articleTitle,source:articleSource||"Shared link",url:articleUrl||"#",note:articleNote};
    }

    if(!entry) return;
    if(st==="article"){ await addArticle(entry); } else { await addPost(entry); }
    setPosted(true); resetShare();
    setTimeout(()=>{ setPosted(false); setTab(st==="article"?"articles":"feed"); },1300);
  };


  // ── Loading state ──
  if(loading) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#FDF6EE,#F5EDE3)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12,animation:"spin 1.5s linear infinite",display:"inline-block"}}>✨</div>
        <p style={{fontFamily:"'Lora',serif",fontSize:18,color:"#3D2C1E"}}>Loading the chat...</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ── Login screen ──
  if(!user) return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#FDF6EE 0%,#F5EDE3 50%,#EDE8F0 100%)",fontFamily:"'DM Sans',sans-serif",padding:24}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={{textAlign:"center",maxWidth:320}}>
        <div style={{fontSize:52,marginBottom:16}}>✨</div>
        <h1 style={{fontFamily:"'Lora',serif",fontSize:32,color:"#3D2C1E",marginBottom:8,letterSpacing:"-0.3px"}}>the chat</h1>
        <p style={{fontSize:15,color:"#A08070",marginBottom:36}}>just the girls</p>
        <button onClick={signIn} style={{display:"flex",alignItems:"center",gap:12,background:"white",border:"1.5px solid #E8DDD4",borderRadius:14,padding:"14px 24px",fontSize:15,fontFamily:"'DM Sans',sans-serif",color:"#3D2C1E",cursor:"pointer",boxShadow:"0 2px 16px rgba(0,0,0,0.08)",width:"100%",justifyContent:"center",fontWeight:500}}>
          <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google"/>
          Sign in with Google
        </button>
        <p style={{fontSize:12,color:"#C4B4A4",marginTop:20}}>Only people you share the link with can join.</p>
      </div>
    </div>
  );

  const cardS={background:t.cardBg,border:t.cardBorder||"none",boxShadow:t.cardShadow,borderRadius:t.radius,padding:18};
  const inputS={width:"100%",background:t.inputBg,border:t.inputBorder,borderRadius:t.inputRadius,padding:"11px 14px",fontSize:14,fontFamily:t.bodyFont,color:isCult?"#D4C4A0":t.primary,outline:"none"};

  return(
    <>
      <style>{`
        ${FONTS}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${isCult?"#0E0308":"#F0E8DC"};transition:background 0.35s;}
        .app{min-height:100vh;max-width:420px;margin:0 auto;position:relative;font-family:${t.bodyFont};background:${t.appBg};transition:all 0.35s ease;opacity:${toggling?0:1};}
        ${isCult?`.app::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");pointer-events:none;z-index:100;opacity:0.4;}`:""}
        .feed-card{border-radius:${t.cardRadius};padding:16px 18px;transition:transform 0.25s,box-shadow 0.25s;}
        .feed-card:hover{transform:scale(1.02) rotate(0deg)!important;box-shadow:${isCult?"0 8px 32px rgba(0,0,0,0.8),0 0 20px rgba(180,100,30,0.15)":"4px 6px 22px rgba(0,0,0,0.15)"};z-index:10;position:relative;}
        .plain-card{background:${t.cardBg};border:${t.cardBorder||"none"};box-shadow:${t.cardShadow};border-radius:${t.radius};padding:18px;}
        .tab-btn{border:none;background:none;cursor:pointer;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;transition:opacity 0.15s;}
        .tab-btn:hover{opacity:0.7;}
        .mood-pill{border:${t.pillBorder};background:${t.pillBg};border-radius:${t.pillRadius};padding:7px 13px;font-size:13px;cursor:pointer;color:${t.pillColor};white-space:nowrap;transition:all 0.18s;font-family:${t.bodyFont};}
        .mood-pill.on{background:${t.pillOnBg};color:${t.pillOnColor};border-color:${t.pillOnBorder};}
        .type-btn{flex:1;padding:9px 6px;border-radius:${isCult?"2px":"10px"};border:${isCult?"1px solid rgba(139,96,48,0.3)":"1.5px solid #E0D4C8"};background:${isCult?"rgba(22,6,8,0.9)":"white"};cursor:pointer;font-size:12px;color:${isCult?"#A88060":"#666"};transition:all 0.15s;font-family:${t.bodyFont};}
        .type-btn.on{background:${isCult?"#2A1005":"#3D2C1E"};color:${isCult?"#D4A87A":"white"};border-color:${isCult?"#8B6030":"#3D2C1E"};}
        .main-btn{background:${isCult?"linear-gradient(135deg,#5C2010,#3D1008)":"#3D2C1E"};color:${isCult?"#D4A87A":"white"};border:${isCult?"1px solid rgba(139,96,48,0.5)":"none"};border-radius:${t.btnRadius};padding:12px 22px;font-size:14px;font-family:${isCult?"'Cinzel',serif":t.bodyFont};letter-spacing:${isCult?"0.06em":"0"};cursor:pointer;transition:all 0.2s;font-weight:500;box-shadow:${isCult?"0 0 12px rgba(180,60,20,0.2)":"none"};}
        .main-btn:hover{background:${isCult?"linear-gradient(135deg,#7A2A12,#5C1A0A)":"#5C3D2E"};transform:scale(1.02);}
        .main-btn:disabled{opacity:0.35;cursor:not-allowed;transform:none;}
        .text-in{width:100%;background:${t.inputBg};border:${t.inputBorder};border-radius:${t.inputRadius};padding:11px 14px;font-size:14px;font-family:${t.bodyFont};color:${isCult?"#D4C4A0":t.primary};outline:none;line-height:1.5;resize:none;transition:border-color 0.2s;}
        .text-in:focus{border-color:${t.inputFocus};}
        .text-in::placeholder{color:${isCult?"#7A6050":"#B8A898"};}
        .pulse{animation:pulse 2s ease-in-out infinite;width:8px;height:8px;border-radius:50%;background:${t.dotColor};}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
        ${isCult?`.flame{animation:flicker 3s ease-in-out infinite;display:inline-block;}@keyframes flicker{0%,100%{transform:scaleY(1) rotate(-1deg);opacity:1}25%{transform:scaleY(1.05) rotate(1deg);opacity:0.9}50%{transform:scaleY(0.95) rotate(-2deg);opacity:1}75%{transform:scaleY(1.08) rotate(0deg);opacity:0.85}}.eye-p{animation:eyeP 4s ease-in-out infinite;}@keyframes eyeP{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}`:``}
        .slide-in{animation:sIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards;}
        @keyframes sIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pop{animation:pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;}
        @keyframes pop{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        .pfade{animation:pfade 0.7s ease forwards;}
        @keyframes pfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .toggle-track{width:44px;height:24px;border-radius:${isCult?"3px":"12px"};background:${isCult?"#3D1A06":"#E8DDD4"};border:${isCult?"1px solid #8B6030":"1px solid #D4C4B4"};position:relative;transition:all 0.3s;cursor:pointer;}
        .toggle-thumb{width:18px;height:18px;border-radius:${isCult?"2px":"9px"};background:${isCult?"#D4A87A":"#3D2C1E"};position:absolute;top:2px;left:${isCult?"22px":"2px"};transition:all 0.3s;display:flex;align-items:center;justify-content:center;font-size:11px;}
        ::-webkit-scrollbar{width:0;}
      `}</style>

      <div className="app">
        {/* Glows */}
        {isCult?(
          <>
            <div style={{position:"fixed",top:-100,left:"50%",transform:"translateX(-50%)",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(180,60,20,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"fixed",bottom:60,right:-80,width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,rgba(100,40,140,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
          </>
        ):(
          <>
            <div style={{position:"fixed",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,165,152,0.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"fixed",bottom:80,left:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(155,142,196,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
          </>
        )}

        {/* ── HEADER ── */}
        <div style={{padding:"50px 20px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:isCult?"1px solid rgba(139,96,48,0.2)":"none"}}>
          <div>
            {isCult&&<div className="eye-p" style={{fontSize:26,marginBottom:4}}>👁️</div>}
            <h1 style={{fontFamily:t.titleFont,fontSize:isCult?22:26,color:isCult?"#C4905A":"#3D2C1E",letterSpacing:isCult?"0.14em":"-0.3px",textTransform:isCult?"uppercase":"none",textShadow:isCult?"0 0 20px rgba(180,100,30,0.35)":"none"}}>{t.appTitle}</h1>
            <p style={{fontSize:11,color:t.secondary,marginTop:2,fontStyle:isCult?"italic":"normal"}}>{t.appSub}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            {/* Top row: bell + theme toggle */}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {/* Bell */}
              <div style={{position:"relative"}}>
                <button onClick={()=>{setShowNotifs(n=>!n);if(!showNotifs)markAllRead();}} style={{background:"none",border:`1px solid ${isCult?"rgba(139,96,48,0.4)":"#E8DDD4"}`,borderRadius:isCult?2:10,padding:"5px 8px",cursor:"pointer",fontSize:15,lineHeight:1,color:t.secondary}}>
                  🔔
                </button>
                {unreadCount>0&&(
                  <span style={{position:"absolute",top:-5,right:-5,background:"#E05050",color:"white",borderRadius:"50%",width:17,height:17,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,pointerEvents:"none"}}>
                    {unreadCount>9?"9+":unreadCount}
                  </span>
                )}
              </div>
              {/* Theme toggle */}
              <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={switchTheme}>
                <span style={{fontSize:10,color:t.secondary,fontFamily:t.bodyFont,letterSpacing:isCult?"0.06em":"0",textTransform:isCult?"uppercase":"none"}}>{isCult?"cozy":"cult"}</span>
                <div className="toggle-track"><div className="toggle-thumb">{isCult?"🌸":"🕯️"}</div></div>
              </div>
            </div>
            {/* Bottom row: avatar + sign out */}
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {user?.photoURL
                ? <img src={user.photoURL} width="28" height="28" style={{borderRadius:"50%",border:`2px solid ${isCult?"rgba(139,96,48,0.5)":"#E8DDD4"}`}} alt="you"/>
                : <div style={{width:28,height:28,borderRadius:"50%",background:"#E8DDD4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✨</div>
              }
              <button onClick={()=>signOut(auth)} style={{fontSize:10,color:t.secondary,background:"none",border:`1px solid ${isCult?"rgba(139,96,48,0.3)":"#E8DDD4"}`,borderRadius:isCult?2:10,padding:"3px 8px",cursor:"pointer",fontFamily:t.bodyFont}}>sign out</button>
            </div>
          </div>
        </div>


        {/* ── NOTIFICATION PANEL ── */}
        {showNotifs&&(
          <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,height:"100vh",background:isCult?"rgba(14,3,8,0.98)":"rgba(253,246,238,0.98)",backdropFilter:"blur(16px)",zIndex:200,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"52px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${isCult?"rgba(139,96,48,0.2)":"rgba(200,180,160,0.3)"}`}}>
              <h2 style={{fontFamily:isCult?"'Cinzel',serif":t.titleFont,fontSize:isCult?16:20,color:isCult?"#C4905A":"#3D2C1E",letterSpacing:isCult?"0.1em":0,textTransform:isCult?"uppercase":"none"}}>{isCult?"The Signals":"Notifications"}</h2>
              <button onClick={()=>setShowNotifs(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:t.secondary}}>✕</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
              {notifications.length===0?(
                <div style={{textAlign:"center",padding:"60px 20px"}}>
                  <div style={{fontSize:36,marginBottom:12}}>🔔</div>
                  <p style={{fontFamily:t.titleFont,fontSize:16,color:t.secondary,fontStyle:"italic"}}>{isCult?"No signals yet, child.":"Nothing yet — check back later."}</p>
                </div>
              ):notifications.map(n=>{
                const ts=n.createdAt?.toDate?.();
                const timeStr=ts?ts.toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"just now";
                const isNew=ts&&ts>new Date(localStorage.getItem("notif_lastRead")||0);
                return(
                  <div key={n.id} style={{background:isCult?"linear-gradient(160deg,#2A0C0E,#1A0608)":"white",border:isCult?"1px solid rgba(160,50,55,0.3)":"none",borderRadius:isCult?4:14,padding:"14px 16px",boxShadow:isCult?"0 2px 12px rgba(0,0,0,0.4)":"0 2px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"flex-start",gap:12,opacity:isNew?1:0.65}}>
                    <span style={{fontSize:22,flexShrink:0}}>{n.emoji}</span>
                    <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
                      <p style={{fontFamily:t.bodyFont,fontSize:13,color:isCult?"rgba(255,255,255,0.88)":"#3D2C1E",lineHeight:1.45}}>
                        <strong>{n.from}</strong> reacted {isCult?"to your scroll":"to your post"}
                      </p>
                      <p style={{fontSize:12,color:t.secondary,marginTop:3,fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{(n.postText||"").slice(0,80)}{(n.postText||"").length>80?"...":""}"</p>
                      <p style={{fontSize:10,color:t.tertiary,marginTop:4}}>{timeStr}</p>
                    </div>
                    {isNew&&<div style={{width:7,height:7,borderRadius:"50%",background:isCult?"#E05050":"#C4A882",flexShrink:0,marginTop:4}}/>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        <div style={{padding:"14px 18px 100px",overflowY:"auto",maxHeight:"calc(100vh - 130px)"}}>

          {/* ════ HOME ════ */}
          {tab==="home"&&(
            <div className="slide-in" style={{display:"flex",flexDirection:"column",gap:16}}>
              {/* Hero prompt */}
              <div style={{background:t.heroBg,borderRadius:isCult?4:18,padding:20,border:isCult?"1px solid rgba(180,80,20,0.4)":"none",boxShadow:isCult?"0 0 30px rgba(180,60,10,0.1),inset 0 0 40px rgba(0,0,0,0.5)":"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  {isCult?<span className="flame" style={{fontSize:17}}>🕯️</span>:<div className="pulse"/>}
                  <span style={{fontFamily:isCult?"'Cinzel',serif":t.bodyFont,fontSize:10,color:isCult?"#C49050":"rgba(255,255,255,0.65)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{t.heroLabel}</span>
                </div>
                <p key={promptIdx} className="pfade" style={{fontFamily:t.titleFont,fontSize:17,color:isCult?"#D4B888":"white",lineHeight:1.45,fontStyle:"italic"}}>"{PROMPTS[promptIdx]}"</p>
                <div style={{display:"flex",gap:8,marginTop:14,alignItems:"center"}}>
                  <button onClick={()=>setTab("share")} style={{background:"rgba(255,255,255,0.12)",border:`1px solid ${isCult?"rgba(200,140,60,0.4)":"rgba(255,255,255,0.3)"}`,color:isCult?"#D4A87A":"white",borderRadius:isCult?3:10,padding:"8px 16px",fontSize:13,cursor:"pointer",fontFamily:isCult?"'Cinzel',serif":t.bodyFont,letterSpacing:isCult?"0.06em":"0"}}>{t.heroCta}</button>
                  <button onClick={()=>setPromptIdx(i=>(i+1)%PROMPTS.length)} title="Shuffle prompt" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",borderRadius:isCult?3:10,padding:"8px 10px",fontSize:14,cursor:"pointer"}}>🔀</button>
                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:isCult?3:20,padding:"5px 10px"}}>
                    <span style={{fontSize:14}}>🔥</span>
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.85)",fontFamily:t.bodyFont,fontWeight:600}}>{streak}</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>day streak</span>
                  </div>
                </div>
              </div>

              {/* Check-ins */}
              <div>
                <h2 style={{fontFamily:isCult?"'Cinzel',serif":t.titleFont,fontSize:isCult?11:15,color:isCult?"#B08050":"#3D2C1E",marginBottom:12,letterSpacing:isCult?"0.1em":"0",textTransform:isCult?"uppercase":"none"}}>{t.checkinsTitle}</h2>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {checkins.map((c,i)=>(<CheckinCard key={c.id||i} c={c} user={user} isCult={isCult} t={t}/>))}
                  {!moodSent?(
                    <div className="plain-card" style={{border:isCult?"1px dashed rgba(139,96,48,0.3)":"1.5px dashed #D4C0B0"}}>
                      <p style={{fontSize:13,color:t.secondary,marginBottom:10,fontStyle:"italic"}}>{t.moodPrompt}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
                        {MOODS.map(m=><button key={m} className={`mood-pill ${myMood===m?"on":""}`} onClick={()=>setMyMood(m)}>{m}</button>)}
                      </div>
                      <textarea className="text-in" rows={2} placeholder={isCult?"A testament, if you wish...":"Add a little note..."} value={moodNote} onChange={e=>setMoodNote(e.target.value)} style={{marginBottom:10}}/>
                      <button className="main-btn" disabled={!myMood} onClick={async()=>{await postCheckin({mood:myMood,note:moodNote});setMoodSent(true);}} style={{width:"100%"}}>{t.moodBtn}</button>
                    </div>
                  ):(
                    <div className="plain-card pop" style={{background:isCult?"rgba(20,40,20,0.5)":"#F0FFF4",border:isCult?"1px solid rgba(80,140,80,0.3)":"none",display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:26}}>{t.moodSuccessIcon}</span>
                      <div>
                        <p style={{fontFamily:isCult?"'Cinzel',serif":t.bodyFont,fontSize:isCult?12:14,fontWeight:500,color:isCult?"#8BBB8B":"#3D2C1E",letterSpacing:isCult?"0.06em":0}}>{t.moodSuccess}</p>
                        <p style={{fontSize:12,color:isCult?"#7AB07A":"#8BAF8B",marginTop:2}}>{t.moodSuccessSub}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent feed */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <h2 style={{fontFamily:isCult?"'Cinzel',serif":t.titleFont,fontSize:isCult?11:15,color:isCult?"#B08050":"#3D2C1E",letterSpacing:isCult?"0.1em":0,textTransform:isCult?"uppercase":"none"}}>Recent posts</h2>
                  <button onClick={()=>setTab("feed")} style={{background:"none",border:"none",fontSize:12,color:t.secondary,cursor:"pointer",fontFamily:t.bodyFont,...t.seeAllStyle}}>{t.seeAll}</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {[...feed].sort((a,b)=>b.id===pinnedId?1:a.id===pinnedId?-1:0).slice(0,3).map(item=><FeedCard key={item.id} item={item} isCult={isCult} t={t} pinned={pinnedId===item.id} onPin={()=>togglePin(item.id)} user={user}/>)}
                </div>
              </div>
            </div>
          )}

          {/* ════ FEED ════ */}
          {tab==="feed"&&(
            <div className="slide-in">
              {isCult&&<div style={{textAlign:"center",marginBottom:14}}><span style={{fontSize:24}}>📜</span></div>}
              <h2 style={{fontFamily:isCult?"'Cinzel',serif":t.titleFont,fontSize:20,color:isCult?"#C4905A":"#3D2C1E",letterSpacing:isCult?"0.12em":0,textTransform:isCult?"uppercase":"none",marginBottom:4}}>{t.feedTitle}</h2>
              <p style={{fontSize:13,color:t.secondary,marginBottom:16,fontStyle:isCult?"italic":"normal"}}>{t.feedSub}</p>
              {isCult&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,#9B6030)"}}/><span style={{color:"#9B6030",fontSize:13}}>✦</span><div style={{flex:1,height:1,background:"linear-gradient(90deg,#9B6030,transparent)"}}/></div>}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[...feed].sort((a,b)=>b.id===pinnedId?1:a.id===pinnedId?-1:0).map(item=><FeedCard key={item.id} item={item} isCult={isCult} t={t} pinned={pinnedId===item.id} onPin={()=>togglePin(item.id)} user={user}/>)}
              </div>
            </div>
          )}

          {/* ════ ARTICLES ════ */}
          {tab==="articles"&&(
            <div className="slide-in">
              {isCult&&<div style={{textAlign:"center",marginBottom:14}}><span style={{fontSize:24}}>📖</span></div>}
              <h2 style={{fontFamily:isCult?"'Cinzel',serif":t.titleFont,fontSize:20,color:isCult?"#C4905A":"#3D2C1E",letterSpacing:isCult?"0.12em":0,textTransform:isCult?"uppercase":"none",marginBottom:4}}>{t.articlesTitle}</h2>
              <p style={{fontSize:13,color:t.secondary,marginBottom:14,fontStyle:isCult?"italic":"normal"}}>{t.articlesSub}</p>
              <button onClick={()=>{setShareType("article");setTab("share");}} style={{marginBottom:16,background:"none",border:`1px solid ${isCult?"rgba(139,96,48,0.4)":"#E0D4C8"}`,borderRadius:isCult?3:20,padding:"7px 14px",fontSize:12,color:t.accent,cursor:"pointer",fontFamily:t.bodyFont}}>
                + {isCult?"Offer a sacred text":"Share an article"}
              </button>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {articles.map(a=><FeedCard key={a.id} item={a} isCult={isCult} t={t} pinned={false} onPin={null} user={user}/>)}
              </div>
            </div>
          )}

          {/* ════ SHARE / POST ════ */}
          {tab==="share"&&(
            <div className="slide-in">
              {isCult&&<div style={{textAlign:"center",marginBottom:10}}><span className="flame" style={{fontSize:28}}>🕯️</span></div>}
              <h2 style={{fontFamily:isCult?"'Cinzel',serif":t.titleFont,fontSize:20,color:isCult?"#C4905A":"#3D2C1E",letterSpacing:isCult?"0.12em":0,textTransform:isCult?"uppercase":"none",marginBottom:4}}>{t.shareTitle}</h2>
              <p style={{fontSize:13,color:t.secondary,marginBottom:18,fontStyle:isCult?"italic":"normal"}}>{t.shareSub}</p>

              {posted?(
                <div className="plain-card pop" style={{textAlign:"center",padding:44,border:isCult?"1px solid rgba(180,80,20,0.4)":"none"}}>
                  <div style={{fontSize:42,marginBottom:12}}>{isCult?"🔥":"✨"}</div>
                  <p style={{fontFamily:isCult?"'Cinzel',serif":t.titleFont,fontSize:18,color:isCult?"#C4905A":"#3D2C1E",letterSpacing:isCult?"0.1em":0}}>{isCult?"Your offering is received.":"Posted to the chat!"}</p>
                  <p style={{fontSize:13,color:t.secondary,marginTop:6,fontStyle:"italic"}}>{isCult?"The scrolls are updated...":"Taking you there now..."}</p>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {/* Type selector */}
                  <div>
                    <p style={{fontSize:11,color:t.secondary,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:isCult?"'Cinzel',serif":t.bodyFont}}>{isCult?"Nature of Offering":"What are you posting?"}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                      {t.shareTypes.map(o=><button key={o.value} className={`type-btn ${shareType===o.value?"on":""}`} onClick={()=>setShareType(o.value)} style={{flex:"none",padding:"8px 12px"}}>{o.label}</button>)}
                    </div>
                  </div>

                  {/* Prompt reminder */}
                  {(shareType==="moment"||shareType==="vision")&&(
                    <div style={{background:t.promptBg,borderRadius:isCult?3:12,padding:"12px 14px",borderLeft:t.promptBorderL}}>
                      <p style={{fontSize:10,color:t.accent,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:isCult?"'Cinzel',serif":t.bodyFont}}>{t.heroLabel}</p>
                      <p style={{fontFamily:t.titleFont,fontSize:14,color:isCult?"#B49070":t.primary,fontStyle:"italic"}}>"{PROMPTS[promptIdx]}"</p>
                    </div>
                  )}

                  {/* MOMENT / MUSIC / NOTE */}
                  {(shareType==="moment"||shareType==="music"||shareType==="note"||shareType==="vision"||shareType==="hymn"||shareType==="scroll")&&(
                    <textarea className="text-in" rows={4} placeholder={
                      shareType==="music"||shareType==="hymn"?"Song name – Artist\nWhy you love it right now...":
                      shareType==="note"||shareType==="scroll"?"Just start typing... stream of consciousness welcome 🌀":
                      "What's on your mind?"
                    } value={shareText} onChange={e=>setShareText(e.target.value)}/>
                  )}

                  {/* Spotify/YouTube link (music only) */}
                  {(shareType==="music"||shareType==="hymn")&&(
                    <div style={{background:t.sectionBg,borderRadius:isCult?3:12,padding:"12px 14px",border:t.sectionBorder}}>
                      <p style={{fontSize:11,color:t.accent,marginBottom:7,fontFamily:isCult?"'Cinzel',serif":t.bodyFont,letterSpacing:isCult?"0.05em":0,textTransform:isCult?"uppercase":"none"}}>🎵 Spotify · ▶️ YouTube <span style={{opacity:0.5,fontStyle:"italic",fontSize:10}}>(optional)</span></p>
                      <div style={{position:"relative"}}>
                        <input className="text-in" type="url" placeholder="Paste a link..." value={linkUrl} onChange={e=>{setLinkUrl(e.target.value);setLinkError("");}} style={{paddingRight:detectedLink?120:14}}/>
                        {detectedLink&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:isCult?2:10,background:detectedLink==="spotify"?"#1DB95420":"#FF000020",color:detectedLink==="spotify"?"#1a9a3a":"#c00000",pointerEvents:"none"}}>{detectedLink==="spotify"?"🎵 Spotify ✓":"▶️ YouTube ✓"}</div>}
                      </div>
                      {linkError&&<p style={{fontSize:12,color:"#c0392b",marginTop:5,fontStyle:"italic"}}>{linkError}</p>}
                    </div>
                  )}

                  {/* LIST / TABLET */}
                  {(shareType==="list"||shareType==="tablet")&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <input className="text-in" placeholder={isCult?"Name this tablet (optional)":"Give it a title (optional, e.g. 'top 5 songs rn')"} value={shareTitle} onChange={e=>setShareTitle(e.target.value)}/>
                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        {listItems.map((item,i)=>(
                          <div key={i} style={{display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{color:t.accent,fontSize:12,flexShrink:0}}>{isCult?"✦":"•"}</span>
                            <input className="text-in" placeholder={`Item ${i+1}...`} value={item} onChange={e=>{const n=[...listItems];n[i]=e.target.value;setListItems(n);}} onKeyDown={e=>{if(e.key==="Enter"){setListItems([...listItems,""]);}}}/>
                            {listItems.length>1&&<button onClick={()=>setListItems(listItems.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:t.secondary,cursor:"pointer",fontSize:16,flexShrink:0}}>×</button>}
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>setListItems([...listItems,""])} style={{background:"none",border:`1px dashed ${isCult?"rgba(139,96,48,0.4)":"#E0D4C8"}`,borderRadius:isCult?3:8,padding:"8px",fontSize:12,color:t.secondary,cursor:"pointer",fontFamily:t.bodyFont}}>+ add item</button>
                      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:t.secondary,fontFamily:t.bodyFont}}>
                        <input type="checkbox" checked={isCollab} onChange={e=>setIsCollab(e.target.checked)} style={{accentColor:isCult?"#8B6030":"#3D2C1E"}}/>
                        {isCult?"Make this a shared tablet (others can add)":"Let everyone add to this list"}
                      </label>
                    </div>
                  )}

                  {/* POLL / ORACLE */}
                  {(shareType==="poll"||shareType==="oracle")&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <input className="text-in" placeholder={isCult?"Pose your question to the oracle...":"Ask the group something..."} value={pollQ} onChange={e=>setPollQ(e.target.value)}/>
                      <p style={{fontSize:11,color:t.secondary,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:isCult?"'Cinzel',serif":t.bodyFont}}>{isCult?"The options":"Choices"}</p>
                      {pollOptions.map((opt,i)=>(
                        <div key={i} style={{display:"flex",gap:6,alignItems:"center"}}>
                          <input className="text-in" placeholder={`Option ${i+1}...`} value={opt} onChange={e=>{const n=[...pollOptions];n[i]=e.target.value;setPollOptions(n);}}/>
                          {pollOptions.length>2&&<button onClick={()=>setPollOptions(pollOptions.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:t.secondary,cursor:"pointer",fontSize:16,flexShrink:0}}>×</button>}
                        </div>
                      ))}
                      {pollOptions.length<6&&<button onClick={()=>setPollOptions([...pollOptions,""])} style={{background:"none",border:`1px dashed ${isCult?"rgba(139,96,48,0.4)":"#E0D4C8"}`,borderRadius:isCult?3:8,padding:"8px",fontSize:12,color:t.secondary,cursor:"pointer",fontFamily:t.bodyFont}}>+ add option</button>}
                    </div>
                  )}

                  {/* ARTICLE */}
                  {shareType==="article"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <input className="text-in" placeholder={isCult?"Title of the sacred text *":"Article title *"} value={articleTitle} onChange={e=>setArticleTitle(e.target.value)}/>
                      <input className="text-in" placeholder={isCult?"Source / publication":"Source / publication"} value={articleSource} onChange={e=>setArticleSource(e.target.value)}/>
                      <input className="text-in" type="url" placeholder="Link (optional)" value={articleUrl} onChange={e=>setArticleUrl(e.target.value)}/>
                      <textarea className="text-in" rows={3} placeholder={isCult?"Why did the spirits lead you here?":"Why are you sharing it?"} value={articleNote} onChange={e=>setArticleNote(e.target.value)}/>
                    </div>
                  )}

                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <button className="main-btn" onClick={handlePost} style={{flex:1}} disabled={
                      (shareType==="moment"||shareType==="music"||shareType==="note"||shareType==="vision"||shareType==="hymn"||shareType==="scroll")&&!shareText.trim()||
                      (shareType==="list"||shareType==="tablet")&&!listItems.some(i=>i.trim())||
                      (shareType==="poll"||shareType==="oracle")&&(!pollQ.trim()||pollOptions.filter(o=>o.trim()).length<2)||
                      shareType==="article"&&!articleTitle.trim()
                    }>
                      {isCult?"Offer to the Circle 🔥":"Post to the chat ✨"}
                    </button>
                    {(shareType==="moment"||shareType==="vision")&&<button onClick={()=>setPromptIdx((promptIdx+1)%PROMPTS.length)} style={{background:"none",border:`1px solid ${isCult?"rgba(139,96,48,0.35)":"#E0D4C8"}`,borderRadius:isCult?3:12,padding:"12px",cursor:"pointer",fontSize:15,color:t.secondary}}>{isCult?"✦":"🔄"}</button>}
                  </div>
                  <p style={{fontSize:11,color:t.tertiary,textAlign:"center",fontStyle:"italic"}}>{t.sharePrivacy}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── NAV ── */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:t.navBg,backdropFilter:"blur(12px)",borderTop:t.navBorder,display:"flex",padding:"10px 16px 24px"}}>
          {t.navTabs.map(nt=>(
            <button key={nt.id} className="tab-btn" onClick={()=>setTab(nt.id)}>
              <span style={{fontSize:20,filter:tab===nt.id?"none":"grayscale(0.5) opacity(0.45)"}}>{nt.icon}</span>
              <span style={{fontSize:9,fontFamily:isCult?"'Cinzel',serif":t.bodyFont,color:tab===nt.id?(isCult?"#C4905A":"#3D2C1E"):t.secondary,fontWeight:tab===nt.id&&!isCult?600:400,letterSpacing:isCult?"0.07em":"0.03em",textTransform:isCult?"uppercase":"none"}}>{nt.label}</span>
              {tab===nt.id&&<div style={{width:4,height:4,borderRadius:isCult?"1px":"50%",background:t.dotActive}}/>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
