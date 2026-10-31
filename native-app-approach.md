# Native Android Scanner (NOT FEASIBLE FOR 5-HOUR HACKATHON)

## ⚠️ Warning: This Cannot Be Built in Your Timeline

This requires:
- Native Android development (Kotlin/Java)
- 20-40 hours minimum
- Play Store approval (weeks)
- Testing on multiple devices
- Privacy/security review

---

## What a Native App Would Need

### 1. Permissions Required

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
<uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
```

**Problems:**
- `QUERY_ALL_PACKAGES` requires Play Store justification
- Notification listener needs user to manually enable in Settings
- These permissions are heavily restricted for security reasons

---

### 2. Scanning Installed Apps

```kotlin
// Get list of installed apps
val packageManager = context.packageManager
val installedApps = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)

for (app in installedApps) {
    val appName = app.loadLabel(packageManager).toString()
    val packageName = app.packageName
    val permissions = packageManager.getPackageInfo(
        packageName, 
        PackageManager.GET_PERMISSIONS
    ).requestedPermissions
    
    // Analyze risk based on:
    // - Permissions requested
    // - Install source (sideloaded?)
    // - App signature
    // - Known malware patterns
}
```

---

### 3. Monitoring Notifications

```kotlin
class NotificationListener : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val notification = sbn.notification
        val title = notification.extras.getString(Notification.EXTRA_TITLE)
        val text = notification.extras.getString(Notification.EXTRA_TEXT)
        
        // Check for spam patterns:
        // - Prize/lottery keywords
        // - Fake system warnings
        // - Suspicious links
    }
}
```

**Problem:** User must manually enable this in Settings → Special app access → Notification access

---

### 4. Risk Scoring Algorithm

```kotlin
data class AppRisk(
    val app: ApplicationInfo,
    val riskLevel: RiskLevel,
    val reasons: List<String>
)

enum class RiskLevel { LOW, MEDIUM, HIGH, CRITICAL }

fun analyzeAppRisk(app: ApplicationInfo, permissions: Array<String>?): AppRisk {
    val reasons = mutableListOf<String>()
    var score = 0
    
    // Check 1: Excessive permissions
    permissions?.let {
        if (it.contains("android.permission.READ_SMS")) score += 20
        if (it.contains("android.permission.READ_CONTACTS")) score += 15
        if (it.contains("android.permission.RECORD_AUDIO")) score += 25
    }
    
    // Check 2: Install source
    val installer = packageManager.getInstallerPackageName(app.packageName)
    if (installer != "com.android.vending") { // Not from Play Store
        score += 30
        reasons.add("Installed from unknown source")
    }
    
    // Check 3: Generic or suspicious name
    val name = app.loadLabel(packageManager).toString()
    if (name.contains("system", ignoreCase = true) && !app.flags.and(ApplicationInfo.FLAG_SYSTEM)) {
        score += 40
        reasons.add("Pretends to be system app")
    }
    
    // Check 4: Behavior patterns (requires ML model)
    // - Network activity
    // - Background CPU usage
    // - Data collection patterns
    
    val riskLevel = when {
        score >= 70 -> RiskLevel.CRITICAL
        score >= 50 -> RiskLevel.HIGH
        score >= 30 -> RiskLevel.MEDIUM
        else -> RiskLevel.LOW
    }
    
    return AppRisk(app, riskLevel, reasons)
}
```

---

## Timeline Reality Check

| Task | Minimum Time |
|------|-------------|
| Set up Android project | 1 hour |
| Implement permission handling | 2 hours |
| Build app scanner | 3 hours |
| Build notification analyzer | 3 hours |
| Risk scoring algorithm | 2 hours |
| UI/UX | 4 hours |
| Testing on multiple devices | 4 hours |
| Handle edge cases | 4 hours |
| Play Store submission | 2-3 weeks |
| **TOTAL** | **20+ hours minimum** |

---

## Why Your SRS Wisely Cut This

From your document:
> "Play Store policy restricts those, and recording calls from a third-party app is blocked or limited on current Android versions. iOS gives no such access. None of this is stable enough to build and demo in 5 hours."

**Your SRS authors were 100% correct.**

---

## Recommendation

✅ **For the hackathon:** Build the educational checklist (Option 1)
✅ **Document in README:** "Future: Native Android companion app"
✅ **Show you understand:** Explain why it's not possible as a web app
✅ **Pass the Teach Test:** Users learn to check themselves

❌ **Don't:** Try to build a native app in 5 hours
❌ **Don't:** Fake a real scanner without clear SIMULATED badges
❌ **Don't:** Claim browser APIs can do what they cannot
