/**
 * Risk Levels
 */
const RISK_LEVELS = {
  SAFE: 'safe',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Risk Score Thresholds
 */
const RISK_THRESHOLDS = {
  LOW: 20,
  MEDIUM: 40,
  HIGH: 60,
  CRITICAL: 80,
};

/**
 * Risky package name patterns
 */
const RISKY_PACKAGE_PATTERNS = [
  { keyword: 'lucky', score: 40 },
  { keyword: 'casino', score: 45 },
  { keyword: 'betting', score: 45 },
  { keyword: 'porn', score: 50 },
  { keyword: 'adult', score: 50 },
  { keyword: 'hack', score: 60 },
  { keyword: 'crack', score: 60 },
  { keyword: 'mod', score: 35 },
  { keyword: 'cheat', score: 50 },
  { keyword: 'fake', score: 45 },
  { keyword: 'cleaner', score: 35 },
  { keyword: 'booster', score: 35 },
  { keyword: 'speedup', score: 30 },
  { keyword: 'optimizer', score: 30 },
  { keyword: 'battery', score: 25 },
  { keyword: 'antivirus', score: 30 },
  { keyword: 'vpn', score: 25 },
  { keyword: 'proxy', score: 30 },
];

/**
 * Risky Android permissions with severity scores
 */
const RISKY_PERMISSIONS = {
  // SMS & Messaging
  'android.permission.READ_SMS': 30,
  'android.permission.SEND_SMS': 35,
  'android.permission.RECEIVE_SMS': 25,
  'android.permission.RECEIVE_MMS': 20,
  'android.permission.READ_CELL_BROADCASTS': 15,
  
  // Contacts
  'android.permission.READ_CONTACTS': 20,
  'android.permission.WRITE_CONTACTS': 20,
  'android.permission.GET_ACCOUNTS': 15,
  
  // Phone & Calls
  'android.permission.READ_CALL_LOG': 25,
  'android.permission.WRITE_CALL_LOG': 25,
  'android.permission.CALL_PHONE': 20,
  'android.permission.READ_PHONE_STATE': 15,
  'android.permission.ANSWER_PHONE_CALLS': 25,
  'android.permission.PROCESS_OUTGOING_CALLS': 30,
  
  // Location
  'android.permission.ACCESS_FINE_LOCATION': 15,
  'android.permission.ACCESS_COARSE_LOCATION': 10,
  'android.permission.ACCESS_BACKGROUND_LOCATION': 20,
  
  // Audio & Camera
  'android.permission.RECORD_AUDIO': 25,
  'android.permission.CAMERA': 15,
  
  // Storage
  'android.permission.WRITE_EXTERNAL_STORAGE': 10,
  'android.permission.READ_EXTERNAL_STORAGE': 5,
  'android.permission.MANAGE_EXTERNAL_STORAGE': 20,
  
  // High-risk system permissions
  'android.permission.SYSTEM_ALERT_WINDOW': 20,
  'android.permission.REQUEST_INSTALL_PACKAGES': 40,
  'android.permission.BIND_ACCESSIBILITY_SERVICE': 50,
  'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE': 35,
  'android.permission.BIND_DEVICE_ADMIN': 45,
  'android.permission.REQUEST_DELETE_PACKAGES': 30,
  'android.permission.PACKAGE_USAGE_STATS': 20,
  
  // Internet & Network
  'android.permission.INTERNET': 5,
  'android.permission.ACCESS_NETWORK_STATE': 2,
  'android.permission.CHANGE_NETWORK_STATE': 10,
  'android.permission.ACCESS_WIFI_STATE': 5,
  'android.permission.CHANGE_WIFI_STATE': 10,
  
  // Calendar
  'android.permission.READ_CALENDAR': 15,
  'android.permission.WRITE_CALENDAR': 15,
  
  // Body Sensors
  'android.permission.BODY_SENSORS': 15,
  'android.permission.ACTIVITY_RECOGNITION': 10,
};

/**
 * Trusted package prefixes and exact matches
 */
const TRUSTED_PACKAGES = [
  // Google
  'com.google.android',
  'com.google.android.gms',
  'com.google.android.apps',
  'com.android',
  
  // Popular social media
  'com.whatsapp',
  'com.facebook',
  'com.instagram.android',
  'com.twitter.android',
  'com.snapchat.android',
  'com.linkedin.android',
  'com.zhiliaoapp.musically', // TikTok
  
  // Messaging
  'org.telegram.messenger',
  'com.viber.voip',
  'org.thoughtcrime.securesms', // Signal
  'com.discord',
  
  // Banking & Payments (Pakistan)
  'com.easypaisa',
  'com.jazz.jazzcash',
  'pk.com.hbl',
  'com.mcb.mobilebankingapp',
  'com.meezanbank',
  
  // Streaming & Entertainment
  'com.netflix.mediaclient',
  'com.spotify.music',
  'com.amazon.avod.thirdpartyclient',
  'com.youtube.android',
  
  // Transportation
  'com.ubercab',
  'com.careem.acma',
  'com.grab.passenger',
  
  // Email
  'com.google.android.gm', // Gmail
  'com.microsoft.office.outlook',
  
  // Productivity
  'com.microsoft.office',
  'com.dropbox.android',
  'com.evernote',
  
  // Security
  'com.google.android.apps.authenticator2',
  
  // Samsung
  'com.samsung.android',
  'com.sec.android',
];

module.exports = {
  RISK_LEVELS,
  RISK_THRESHOLDS,
  RISKY_PACKAGE_PATTERNS,
  RISKY_PERMISSIONS,
  TRUSTED_PACKAGES,
};
