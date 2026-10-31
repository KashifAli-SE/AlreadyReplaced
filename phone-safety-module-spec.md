# Phone Safety Check-up Module (Web App Implementation)

## What This Module ACTUALLY Does

This module **teaches users to check their own phone** rather than scanning it automatically. This aligns with your "Teach Test" principle and is honest about technical limitations.

---

## Module Structure

### 1. Safety Checklist (Interactive Guide)

**5 Checklist Items:**

#### ☐ Unknown Apps Check
**Mini-lesson (3 steps):**
1. Show mock screen: Settings → Apps
2. Highlight: "Look for apps you don't remember installing"
3. Action: "Tap any unknown app → Uninstall"

**Red flags to teach:**
- Apps with generic names like "System Service" or "Update Manager"
- Apps you don't recognize
- Multiple file manager or cleaner apps

#### ☐ App Permissions Audit
**Mini-lesson (3 steps):**
1. Mock screen: Settings → Privacy → Permission Manager
2. Show which apps have Camera, Microphone, Location, SMS
3. Teach: "A flashlight app doesn't need your location"

**Red flags:**
- Games accessing SMS or Contacts
- Wallpaper apps accessing Camera
- Utility apps accessing Microphone

#### ☐ Notification Spam Check
**Mini-lesson (3 steps):**
1. Mock screen: Settings → Notifications
2. Show notification history
3. Action: "Long-press spam notification → Turn off"

**Red flags:**
- Prize/lottery notifications
- "Your phone is infected" alerts
- Fake system warnings
- Dating or casino ads

#### ☐ Call Blocking Setup
**Mini-lesson (3 steps):**
1. Mock screen: Phone app → Settings
2. Show "Block numbers" option
3. Enable "Filter spam calls" (Truecaller style)

#### ☐ Google Play Protect Check
**Mini-lesson (3 steps):**
1. Mock screen: Play Store → Profile → Play Protect
2. Show scan button
3. Verify "No harmful apps found"

---

### 2. Simulated Scan Result Screen

**CLEARLY LABELED: "SIMULATED SCAN - FOR LEARNING ONLY"**

```
┌─────────────────────────────────────┐
│  🔍 Learning Scan Complete          │
│  [SIMULATED - NOT A REAL SCAN]      │
├─────────────────────────────────────┤
│                                      │
│  Found 3 potential risks:            │
│                                      │
│  ⚠️ "Fast Cleaner Pro"               │
│     Why risky: Asks for SMS access   │
│     [Learn more] [Check manually]    │
│                                      │
│  ⚠️ Excessive Notifications          │
│     12 spam alerts today             │
│     [Show me how to block]           │
│                                      │
│  ⚠️ Camera permission                │
│     5 apps can access your camera    │
│     [Review permissions]             │
│                                      │
│  ✅ Google Play Protect: Enabled     │
│                                      │
└─────────────────────────────────────┘
```

**How the simulation works:**
- Use a seeded list of 8-10 common risky app patterns
- Randomize which ones appear
- Each finding links to the relevant mini-lesson
- Badge appears on every screen

---

## Component Structure

```
/src/modules/safety/
├── SafetyChecklist.tsx          # Main checklist UI
├── ChecklistItem.tsx            # Individual check item
├── SafetyLesson.tsx            # Reuses LessonPlayer
├── SimulatedScan.tsx           # Fake scan screen
├── ScanResults.tsx             # Simulated findings
├── safety-lessons.json         # 5 mini-lessons
└── risky-app-patterns.json     # Demo data for simulation
```

---

## Data Files

### safety-lessons.json
```json
{
  "unknown-apps": {
    "id": "unknown-apps",
    "title": {
      "en": "Check for Unknown Apps",
      "ur": "نامعلوم ایپس چیک کریں"
    },
    "steps": [
      {
        "screen": "android-settings-home",
        "target": "apps-menu-item",
        "caption": {
          "en": "Tap on Apps to see all installed apps",
          "ur": "تمام ایپس دیکھنے کے لیے Apps پر ٹیپ کریں"
        }
      },
      {
        "screen": "apps-list",
        "target": null,
        "caption": {
          "en": "Scroll through and look for apps you don't recognize",
          "ur": "سکرول کریں اور ایسی ایپس دیکھیں جو آپ نہیں پہچانتے"
        },
        "highlights": ["System Service", "Fast Cleaner"]
      },
      {
        "screen": "app-details",
        "target": "uninstall-button",
        "caption": {
          "en": "Tap Uninstall to remove a risky app",
          "ur": "خطرناک ایپ ہٹانے کے لیے Uninstall دبائیں"
        }
      }
    ],
    "redFlags": [
      "Apps with generic names",
      "Apps you don't remember downloading",
      "Multiple 'cleaner' or 'booster' apps"
    ]
  }
}
```

### risky-app-patterns.json (for simulation)
```json
{
  "patterns": [
    {
      "id": "cleaner-1",
      "name": "Fast Cleaner Pro",
      "icon": "🧹",
      "risk": "high",
      "reason": "Requests SMS and contact access",
      "permissions": ["SMS", "Contacts", "Phone"],
      "lesson": "Apps that clean your phone rarely need to read your messages"
    },
    {
      "id": "game-1", 
      "name": "Lucky Spin Casino",
      "icon": "🎰",
      "risk": "high",
      "reason": "Gambling app with location tracking",
      "permissions": ["Location", "Camera"],
      "lesson": "Games should not track your location"
    },
    {
      "id": "util-1",
      "name": "Flashlight Plus",
      "icon": "🔦",
      "risk": "medium",
      "reason": "Flashlight doesn't need internet or location",
      "permissions": ["Location", "Internet"],
      "lesson": "Simple utility apps shouldn't need many permissions"
    }
  ],
  "notificationSpam": [
    {
      "app": "Unknown Source",
      "message": "🎉 You won $5000! Claim now!",
      "frequency": "5 times today",
      "risk": "Lottery scam notifications"
    },
    {
      "app": "System Alert",
      "message": "⚠️ Virus detected! Clean now!",
      "frequency": "3 times today", 
      "risk": "Fake system warnings"
    }
  ]
}
```

---

## UI Flow

```
Home
  ↓
Phone Safety Check-up
  ↓
┌─────────────────────────┐
│ Safety Checklist        │
├─────────────────────────┤
│ ☐ Unknown Apps         │ → Mini-lesson (3 steps)
│ ☐ App Permissions      │ → Mini-lesson (3 steps)
│ ☐ Notification Spam    │ → Mini-lesson (3 steps)
│ ☐ Call Blocking        │ → Mini-lesson (3 steps)
│ ☐ Play Protect         │ → Mini-lesson (3 steps)
│                         │
│ [Run Learning Scan]    │
└─────────────────────────┘
  ↓
Simulated Scan
  ↓
Results (with SIMULATED badge)
  ↓
[Check manually] → Relevant mini-lesson
```

---

## Acceptance Criteria (from SRS)

✅ **PS-1:** Checklist of 5 items, each opens a 3-step mini lesson
✅ **PS-2:** Simulated scan screen with risk labels and explanations, badged SIMULATED
✅ **SH-4:** SIMULATED badge visible on scan screen
✅ **Teach Test:** User learns HOW to check, not just shown a result

---

## What This Module Teaches

1. ✅ How to find Settings → Apps
2. ✅ What permissions are risky
3. ✅ How to spot suspicious app names
4. ✅ How to block notifications
5. ✅ How to enable Play Protect
6. ✅ Red flags to look for themselves

---

## Priority

- **P1** in your SRS (build if P0 complete)
- **Time estimate:** 45-60 minutes
- **Can be built by:** Member 4 (Shell/README owner)

---

## Why This Approach Works

1. **Honest:** Clearly labeled as simulated, not deceptive
2. **Educational:** Passes the "Teach Test" - users learn to check themselves
3. **Feasible:** Can be built in your 5-hour window
4. **Compliant:** Meets hackathon rules about real vs simulated
5. **Valuable:** Users gain actual skills

---

## Future: Native Android Version

**What a real native app COULD do:**
- Read `PackageManager` for installed apps
- Access `NotificationListenerService` 
- Check actual permissions with `PermissionManager`
- Real-time monitoring (with user consent)

**But that's:**
- ❌ Not possible in 5 hours
- ❌ Not possible in a web app
- ❌ Requires Play Store approval
- ❌ Android 13+ restricts notification access

Document this in your README under "Future Work"
