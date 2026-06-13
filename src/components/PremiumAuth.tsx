import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Sun, 
  Moon, 
  AlertCircle, 
  Check, 
  RefreshCw,
  Globe,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playLatencyAlarm } from "../utils/audioNotification";
import SentricLogo from "./SentricLogo";

interface PremiumAuthProps {
  onLogin: (email: string) => void;
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
}

interface UserAccount {
  email: string;
  phone: string;
  prefix: string;
  password?: string;
  pin?: string;
  createdAt: string;
}

const countriesList = [
  { code: "+91", country: "IN", name: "India" },
  { code: "+1", country: "US", name: "USA / Canada" },
  { code: "+44", country: "GB", name: "United Kingdom" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+971", country: "AE", name: "UAE" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+65", country: "SG", name: "Singapore" }
];

export default function PremiumAuth({ onLogin, theme, setTheme }: PremiumAuthProps) {
  // Navigation states: 'sign_in' | 'sign_up' | 'forgot_password'
  const [authMode, setAuthMode] = useState<"sign_in" | "sign_up" | "forgot_password">("sign_in");
  
  // Tab within Sign In: 'password' or 'otp'
  const [signInMethod, setSignInMethod] = useState<"password" | "otp">("password");

  // Core Form inputs
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [countryPrefix, setCountryPrefix] = useState("+91");
  const [passwordInput, setPasswordInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States for verification & OTP
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // State for active OTP verification workflow
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpVal, setOtpVal] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpTarget, setOtpTarget] = useState("");
  const [otpChannel, setOtpChannel] = useState<"email" | "phone">("email");
  const [simulatedCourier, setSimulatedCourier] = useState<{
    type: "email" | "phone";
    subject?: string;
    body?: string;
    text?: string;
    code: string;
    target: string;
  } | null>(null);

  // Brute force mitigations
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Google OAuth simulator states
  const [showGoogleOAuthMock, setShowGoogleOAuthMock] = useState(false);
  const [googleSelectedEmail, setGoogleSelectedEmail] = useState("");
  const [googleManualEmail, setGoogleManualEmail] = useState("");
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [googlePhoneLinking, setGooglePhoneLinking] = useState(false);
  const [googleLinkPhoneInput, setGoogleLinkPhoneInput] = useState("");
  const [googleLinkPrefix, setGoogleLinkPrefix] = useState("+91");

  // Load existing accounts or seed default Admin account
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const raw = localStorage.getItem("sentric_registered_users");
    const parsed = raw ? JSON.parse(raw) : [];
    
    // Ensure default admin and standard fallback accounts are seeded
    const hasAdmin = parsed.some((u: UserAccount) => u.email === "superadmin@sentric.io" || u.email === "aryan21430@gmail.com");
    if (!hasAdmin) {
      const adminAcc: UserAccount = {
        email: "superadmin@sentric.io",
        phone: "9820988164",
        prefix: "+91",
        password: "Rajaram09",
        pin: "991005",
        createdAt: new Date().toISOString()
      };
      
      const johnAcc: UserAccount = {
        email: "john.doe@company.com",
        phone: "5551234567",
        prefix: "+1",
        password: "Password123",
        pin: "123456",
        createdAt: new Date().toISOString()
      };

      const employeeAcc: UserAccount = {
        email: "employee@organization.com",
        phone: "9820988164",
        prefix: "+91",
        password: "EmployeeSafe77",
        pin: "445566",
        createdAt: new Date().toISOString()
      };

      const updated = [adminAcc, johnAcc, employeeAcc, ...parsed];
      localStorage.setItem("sentric_registered_users", JSON.stringify(updated));
      return updated;
    }
    return parsed;
  });

  // Countdown logical drivers
  useEffect(() => {
    let timer: any;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown(c => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  useEffect(() => {
    let timer: any;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer(c => {
          if (c <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  const triggerAudioFeedback = () => {
    try {
      playLatencyAlarm();
    } catch (e) {}
  };

  // Dispatch OTP core trigger (sign in via OTP or during signup / recovery)
  const dispatchOtp = async (channel: "email" | "phone", targetVal: string, prefSymbol = "") => {
    setFormError(null);
    setFormSuccess(null);

    if (isLockedOut) {
      setFormError(`Brute Force Mitigation: Portal frozen. Wait ${lockoutTimer}s.`);
      return;
    }

    const cleanTarget = targetVal.trim();
    if (!cleanTarget) {
      setFormError("Identity value cannot be left blank.");
      return;
    }

    if (channel === "email" && !cleanTarget.includes("@gmail.com")) {
      setFormError("Sentinel Enforcement: Standard company or personal @gmail.com vector is required.");
      return;
    }

    setIsProcessing(true);
    try {
      const payload: any = { type: channel };
      if (channel === "email") {
        payload.email = cleanTarget.toLowerCase();
      } else {
        payload.phone = cleanTarget;
        payload.prefix = prefSymbol;
      }

      const res = await fetch("/api/security/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setIsProcessing(false);

      if (!res.ok) {
        setFormError(data.error || "Failed sending cryptographically active OTP.");
        return;
      }

      setOtpChannel(channel);
      setOtpTarget(channel === "email" ? cleanTarget.toLowerCase() : `${prefSymbol}${cleanTarget}`);
      setOtpCooldown(30);
      setIsVerifyingOtp(true);
      
      setSimulatedCourier({
        type: channel,
        code: data.otp,
        target: channel === "email" ? cleanTarget.toLowerCase() : `${prefSymbol}${cleanTarget}`,
        subject: data.emailDetails?.subject,
        body: data.emailDetails?.body,
        text: data.smsDetails?.text
      });

      setFormSuccess(`Handshake verification code routed successfully.`);
      triggerAudioFeedback();
    } catch (err: any) {
      setIsProcessing(false);
      setFormError(`Connection pipeline disrupted: ${err.message || err}`);
    }
  };

  // Verify OTP backend check
  const submitVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isLockedOut) return;

    if (!otpVal.trim() || otpVal.trim().length !== 6) {
      setFormError("OTP passcode must be exactly 6 numeric digits.");
      return;
    }

    setIsProcessing(true);
    try {
      const prefixSelected = otpChannel === "phone" ? countryPrefix : undefined;
      const cleanRawVal = otpTarget.replace(prefixSelected || "", "").trim();

      const res = await fetch("/api/security/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: otpChannel,
          email: otpChannel === "email" ? otpTarget : undefined,
          phone: otpChannel === "phone" ? cleanRawVal : undefined,
          prefix: prefixSelected,
          otp: otpVal.trim()
        })
      });

      const data = await res.json();
      setIsProcessing(false);

      if (!res.ok) {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        if (nextFailed >= 3) {
          setIsLockedOut(true);
          setLockoutTimer(60);
          setFormError("CRITICAL ACCESS THREAT: Session lock activated due to multiple verification errors.");
        } else {
          setFormError(`${data.error || "MFA Exception."} Remaining attempts: ${3 - nextFailed}`);
        }
        return;
      }

      // Verification Handshake is complete! Action depends on the active form flow
      setFormSuccess("Identity successfully verified. Handshake completed!");
      triggerAudioFeedback();

      if (authMode === "sign_in" && signInMethod === "otp") {
        // Log in this target
        onLogin(otpTarget);
      } else if (authMode === "sign_up") {
        // Complete registration process
        finalizeRegistration();
      } else if (authMode === "forgot_password") {
        // Advance to input new password state
        // Keep in-state to render the Password Form
        setIsVerifyingOtp(false);
        setFormSuccess("MFA challenge certified. Update your access credentials below.");
      }
    } catch (err: any) {
      setIsProcessing(false);
      setFormError(`MFA endpoint broken: ${err.message || err}`);
    }
  };

  const finalizeRegistration = () => {
    const cleanMail = emailInput.trim().toLowerCase();
    const existing = accounts.find(a => a.email === cleanMail);
    if (existing) {
      setFormError("Account already exists with this Gmail identity.");
      return;
    }

    const newAcc: UserAccount = {
      email: cleanMail,
      phone: phoneInput.trim(),
      prefix: countryPrefix,
      password: passwordInput,
      pin: pinInput || "884001",
      createdAt: new Date().toISOString()
    };

    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    localStorage.setItem("sentric_registered_users", JSON.stringify(updated));

    setFormSuccess("Account provisioned under Sentinel Zero Trust protocols. Directing to main platform...");
    triggerAudioFeedback();

    setTimeout(() => {
      onLogin(cleanMail);
    }, 1500);
  };

  // Handle Simulated Google OAuth Single Sign-on redirect & Mobile OTP trigger
  const handleGoogleOAuthSignIn = async (emailToUse: string) => {
    setIsGoogleProcessing(true);
    setFormError(null);
    setFormSuccess(null);

    const cleanEmail = emailToUse.trim().toLowerCase();
    setGoogleSelectedEmail(cleanEmail);

    // 1. "After successful Gmail authentication, fetch the user's registered mobile number."
    const existingAccount = accounts.find(acc => acc.email === cleanEmail);

    if (existingAccount) {
      // User is registered! We have their phone and country prefix code
      const prefixToUse = existingAccount.prefix || "+91";
      const phoneToUse = existingAccount.phone;

      setIsGoogleProcessing(false);
      setShowGoogleOAuthMock(false);

      // 2. "Send OTP through Twilio Verify API."
      await dispatchOtp("phone", phoneToUse, prefixToUse);
    } else {
      // 3. User does not have a registered profile. Let them link/enter their phone number for Twilio OTP!
      setIsGoogleProcessing(false);
      setGooglePhoneLinking(true);
    }
  };

  // User submits a telephone number to link to their Google SSO session
  const submitGooglePhoneLinking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleLinkPhoneInput.trim()) {
      return;
    }

    setIsGoogleProcessing(true);
    const cleanEmail = googleSelectedEmail.trim().toLowerCase();

    // Dynamically register/save this user locally with the linked phone so their session profile persists
    const newAcc: UserAccount = {
      email: cleanEmail,
      phone: googleLinkPhoneInput.trim(),
      prefix: googleLinkPrefix,
      createdAt: new Date().toISOString()
    };

    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    localStorage.setItem("sentric_registered_users", JSON.stringify(updated));

    setIsGoogleProcessing(false);
    setShowGoogleOAuthMock(false);

    // Send OTP through Twilio Verify API
    await dispatchOtp("phone", googleLinkPhoneInput.trim(), googleLinkPrefix);
  };

  // Sign in via Password
  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanMail = emailInput.trim().toLowerCase();
    if (!cleanMail) {
      setFormError("Please enter your Gmail identifier.");
      return;
    }

    if (!cleanMail.includes("@gmail.com")) {
      setFormError("Sentinel Rule: A valid standard Google @gmail.com account is required.");
      return;
    }

    // Direct credentials check
    const account = accounts.find(a => a.email === cleanMail);
    if (!account) {
      setFormError("Security Exception: Access denied. Account node does not exist.");
      return;
    }

    if (account.password !== passwordInput) {
      setFormError("Security Exception: Authentication failed. Incorrect key signature.");
      return;
    }

    // Success! Save custom configured password to keep in sync with local storage signature checks
    localStorage.setItem("sentric_verified_pass", passwordInput);
    localStorage.setItem("sentric_verified_code", account.pin || "991005");

    setFormSuccess("Cryptographic identity authenticated. Rerouting to Sentric workspace...");
    triggerAudioFeedback();

    setTimeout(() => {
      onLogin(cleanMail);
    }, 1200);
  };

  // Request Registration Verification
  const handleRegistrationVerifyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanMail = emailInput.trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes("@gmail.com")) {
      setFormError("A standard @gmail.com coordinates block is required for enrollment.");
      return;
    }

    if (passwordInput.length < 6) {
      setFormError("Security Mandate: Password must match a minimum scale of 6 characters.");
      return;
    }

    if (!phoneInput || phoneInput.length < 7) {
      setFormError("Please supply a valid global contact telephone sequence.");
      return;
    }

    // Dispatch verification to Gmail
    dispatchOtp("email", cleanMail);
  };

  // Request recovery OTP
  const handleRecoveryRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanMail = emailInput.trim().toLowerCase();
    if (!cleanMail) {
      setFormError("Please input your configured Gmail node address.");
      return;
    }

    const account = accounts.find(a => a.email === cleanMail);
    if (!account) {
      setFormError("Credential node failed lookup. Try a different registered operator ID.");
      return;
    }

    dispatchOtp("email", cleanMail);
  };

  // Commit updated password
  const handleSaveRecoveredPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (passwordInput.length < 6) {
      setFormError("Sentinel Security Rule: Password must be at least 6 characters.");
      return;
    }

    const cleanMail = emailInput.trim().toLowerCase();
    const updated = accounts.map(acc => {
      if (acc.email === cleanMail) {
        return {
          ...acc,
          password: passwordInput,
          pin: pinInput || acc.pin
        };
      }
      return acc;
    });

    setAccounts(updated);
    localStorage.setItem("sentric_registered_users", JSON.stringify(updated));
    localStorage.setItem("sentric_verified_pass", passwordInput);
    if (pinInput) {
      localStorage.setItem("sentric_verified_code", pinInput);
    }

    setFormSuccess("Success: Security configurations synchronized in dry storage. Returning to login...");
    triggerAudioFeedback();

    setTimeout(() => {
      setIsVerifyingOtp(false);
      setSimulatedCourier(null);
      setAuthMode("sign_in");
    }, 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200 ${
      theme === "light" ? "bg-slate-50 text-slate-900" : "bg-[#05060b] text-slate-100"
    }`}>
      
      {/* Dynamic Background Glow meshes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))] pointer-events-none z-0"></div>
      
      {/* Floating Theme controller */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
            theme === "light" 
              ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" 
              : "bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
          title={`Toggle ${theme === "dark" ? "Light" : "Dark"} theme`}
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-500" />}
        </button>
      </div>

      {/* LEFT GRAPHEME PANEL (Saas Identity / Architectural Brand Showcase) */}
      <div className="hidden md:flex md:w-[48%] bg-gradient-to-br from-slate-950 via-[#0a0c16] to-[#040509] p-12 flex-col justify-between border-r border-white/5 relative z-10 overflow-hidden">
        {/* Abstract graphic lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* Corporate branding */}
        <SentricLogo size="sm" withText={true} withTagline={false} theme="dark" />

        {/* Interactive illustration & visual grid */}
        <div className="space-y-6 relative py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/40 border border-indigo-900/30 rounded-full text-[9.5px] font-mono text-indigo-400">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-450" />
            <span>Zero-Trust Enterprise Access Shield Active</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight">
            See Everything.<br />
            Secure Prompt Payloads.<br />
            Consolidate soaring model fees.
          </h2>
          
          <div className="space-y-4 text-xs text-slate-400 font-sans max-w-sm">
            <p>
              Sentric acts as the core unified proxy layer for sovereign startups and Fortune 500 engineering clusters.
            </p>
            <p className="text-[11px] text-slate-500">
              Integrate with standard credential structures, audit runtime telemetry, mask credentials instantly and bypass external token overhead safely.
            </p>
          </div>

          {/* Abstract Vercel/Palantir styled terminal element */}
          <div className="bg-[#030407]/90 border border-slate-900 rounded-xl p-4 font-mono text-[9.5px]/relaxed text-slate-400 shadow-2xl">
            <div className="flex items-center gap-1.5 pb-2 border-b border-indigo-950 mb-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
              <span className="text-slate-500 text-[8px] uppercase">Proxy Integrity State Analyzer</span>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500">// Real-time diagnostic monitor</p>
              <p><span className="text-indigo-400">[DAEMON]</span> Sentinel integrity modules initialized successfully.</p>
              <p><span className="text-indigo-400">[DAEMON]</span> Routing table sync: <span className="text-emerald-450">SECURE NODE OK</span></p>
              <p><span className="text-indigo-400">[DAEMON]</span> Super Admin account mapped to: <span className="text-white">superadmin@sentric.io</span></p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-600 font-mono flex items-center justify-between">
          <span>Sentinel Core v2.4.9</span>
          <span>© 2026 Sentric Inc.</span>
        </div>
      </div>

      {/* RIGHT AUTH CONTROL PANEL - Stripe & Linear styled interactive layouts */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 md:p-16 relative z-10 min-h-screen">
        
        {/* Small top header for mobile branding */}
        <div className="md:hidden flex items-center justify-between border-b pb-4 mb-6 border-slate-800">
          <SentricLogo size="xs" withText={true} withTagline={false} theme={theme} />
          <span className="text-[9px] font-mono text-slate-500">SECURE DISPATCH</span>
        </div>

        {/* Empty spacing grid for aesthetics */}
        <div className="hidden sm:block"></div>

        {/* Core form center stage */}
        <div className="max-w-[420px] w-full mx-auto space-y-6 flex flex-col items-center justify-center">
          
          {/* Prominent SENTRIC Logo for branding at top-center */}
          <SentricLogo 
            size="lg" 
            center={true} 
            withText={true} 
            withTagline={true} 
            theme={theme}
            className="mb-2"
          />

          <AnimatePresence mode="wait">
            {!isVerifyingOtp ? (
              <motion.div
                key={authMode + (signInMethod)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 w-full"
              >
                {/* Header Context Titles */}
                <div className="text-center">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight font-sans">
                    {authMode === "sign_in" && "Welcome to SENTRIC Security Platform"}
                    {authMode === "sign_up" && "Create your SENTRIC profile"}
                    {authMode === "forgot_password" && "Recover Security Portal"}
                  </h1>
                  <p className="text-xs text-slate-450 mt-2 font-sans leading-relaxed">
                    {authMode === "sign_in" && "Upholding absolute identity signatures using multi-factor zero trust protocols."}
                    {authMode === "sign_up" && "Deploy a new compliance proxy. Initialize free enterprise neural tokens instantly."}
                    {authMode === "forgot_password" && "Authorize profile adjustments by initiating an active identity handshake."}
                  </p>
                </div>

                {/* Switch Login Method tabs only on Sign In */}
                {authMode === "sign_in" && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      id="google-oauth-trigger"
                      onClick={() => {
                        setFormError(null);
                        setFormSuccess(null);
                        setShowGoogleOAuthMock(true);
                        setGoogleSelectedEmail("");
                        setGoogleManualEmail("");
                        setGooglePhoneLinking(false);
                      }}
                      className="w-full py-2.5 px-4 bg-white dark:bg-[#0c0f1a] hover:bg-slate-50 dark:hover:bg-[#121626] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer select-none"
                    >
                      <Globe className="h-4 w-4 text-indigo-500 animate-pulse" />
                      Sign in with Google Account
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-800/80"></div>
                      <span className="flex-shrink mx-3 text-[9px] font-mono text-slate-450 dark:text-slate-500 uppercase tracking-wider">Or Alternative Key Access</span>
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-800/80"></div>
                    </div>

                    <div className={`grid grid-cols-2 gap-1 p-1 rounded-xl border text-[10.5px] font-mono ${
                      theme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950/60 border-slate-850"
                    }`}>
                      <button
                        type="button"
                        onClick={() => { setSignInMethod("password"); setFormError(null); }}
                        className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          signInMethod === "password"
                            ? (theme === "light" ? "bg-white text-indigo-650 shadow-sm" : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400")
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Secure Password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSignInMethod("otp"); setFormError(null); }}
                        className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          signInMethod === "otp"
                            ? (theme === "light" ? "bg-white text-indigo-650 shadow-sm" : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400")
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Dynamic OTP Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Errors display */}
                {formError && (
                  <div className="p-3 bg-rose-950/10 border border-rose-900/20 rounded-xl text-rose-500 text-[10.5px] leading-relaxed flex items-start gap-2 animate-shake">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 bg-emerald-950/10 border border-emerald-920/20 rounded-xl text-emerald-400 text-[10.5px] leading-relaxed flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* SIGN IN VIEW - EMAIL PASSWORD / EMAIL OTP */}
                {authMode === "sign_in" && (
                  signInMethod === "password" ? (
                    /* PASSWORD SIGN IN FORM */
                    <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase block">Google Gmail ID:</label>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="john.doe@company.com"
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                            theme === "light" 
                              ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                              : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono text-slate-500 uppercase block">Account Security Key:</label>
                          <button
                            type="button"
                            onClick={() => setAuthMode("forgot_password")}
                            className="text-[10px] text-indigo-500 hover:underline hover:text-indigo-400 cursor-pointer"
                          >
                            Recovery Wizard
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="••••••••••"
                            className={`w-full px-3.5 py-2 pr-10 rounded-xl text-xs font-mono outline-none border transition ${
                              theme === "light" 
                                ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                                : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-550 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-lg select-none cursor-pointer"
                      >
                        {isProcessing ? "Validating signatures..." : "Complete Handshake"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  ) : (
                    /* DYNAMIC OTP SIGN IN INITIATION (Email or Mobile options) */
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase block select-none">MFA Handshake Vector Input:</label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="user@example.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                              theme === "light" 
                                ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                                : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                            }`}
                          />
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => dispatchOtp("email", emailInput)}
                            className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-medium transition cursor-pointer shrink-0"
                          >
                            Gmail OTP
                          </button>
                        </div>
                      </div>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-800/10"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-500 uppercase">Universal Telephone Alternative</span>
                        <div className="flex-grow border-t border-slate-800/10"></div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase block select-none">Global Telephone Vector:</label>
                        <div className="flex gap-1.5">
                          <div className="relative shrink-0">
                            <select
                              value={countryPrefix}
                              onChange={(e) => setCountryPrefix(e.target.value)}
                              className={`h-full border rounded-xl pl-3 pr-8 py-2 font-mono text-xs outline-none cursor-pointer appearance-none transition ${
                                theme === "light"
                                  ? "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                                  : "bg-slate-950 border-slate-800 text-slate-300 focus:border-indigo-500/30"
                              }`}
                            >
                              {countriesList.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.country} ({country.code})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                          </div>
                          
                          <input
                            type="text"
                            placeholder="+91 XXXXX XXXXX"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value.replace(/[^\d+()\-\s]/g, ""))}
                            className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                              theme === "light" 
                                ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                                : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                            }`}
                          />

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => dispatchOtp("phone", phoneInput, countryPrefix)}
                            className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-medium transition cursor-pointer shrink-0"
                          >
                            Phone OTP
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* SIGN UP VIEW - IDENTITY REGISTRATION */}
                {authMode === "sign_up" && (
                  <form onSubmit={handleRegistrationVerifyRequest} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">Google Gmail Endpoint:</label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="employee@organization.com"
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                          theme === "light" 
                            ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                            : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">Define Password:</label>
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••••"
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                          theme === "light" 
                            ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                            : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">Phone Contact for OTP Handshake:</label>
                      <div className="flex gap-1.5">
                        <div className="relative shrink-0">
                          <select
                            value={countryPrefix}
                            onChange={(e) => setCountryPrefix(e.target.value)}
                            className={`h-full border rounded-xl pl-3 pr-8 py-1.5 font-mono text-xs outline-none cursor-pointer appearance-none ${
                              theme === "light"
                                ? "bg-white border-slate-200 text-slate-800"
                                : "bg-slate-950 border-slate-800 text-slate-300"
                            }`}
                          >
                            {countriesList.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.country} ({country.code})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                        
                        <input
                          type="text"
                          required
                          placeholder="+1 (555) 123-4567"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value.replace(/[^\d+()\-\s]/g, ""))}
                          className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                            theme === "light" 
                              ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                              : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">6-Digit Backup PIN PIN:</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 991005"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono text-center tracking-widest outline-none border transition ${
                          theme === "light" 
                            ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                            : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                        }`}
                      />
                    </div>

                    <p className="text-[9.5px]/relaxed text-slate-500 font-sans">
                      By registering, you authorize Sentinel compliance modules to verify identifiers across dynamic global networks.
                    </p>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      {isProcessing ? "Initiating verification..." : "Create Account & Send Gmail OTP Link"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}

                {/* FORGOT PASSWORD VIEW - RECOVERY HANDSHAKE */}
                {authMode === "forgot_password" && (
                  <form onSubmit={handleRecoveryRequest} className="space-y-3.5">
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Losing credentials requires verification. Enter your linked Gmail identifier to dispatch a restorative OTP payload.
                    </p>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">Linked Gmail account:</label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="john.doe@company.com"
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                          theme === "light" 
                            ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                            : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      {isProcessing ? "Validating records..." : "Transmit Recovery OTP to Gmail"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setAuthMode("sign_in")}
                      className="w-full text-center text-[11px] text-indigo-500 font-mono hover:underline block"
                    >
                      Return to Workspace Sign In
                    </button>
                  </form>
                )}

                {/* Footer Switch Modes */}
                <div className={`pt-4.5 border-t text-center text-xs text-slate-500 leading-normal ${
                  theme === "light" ? "border-slate-200" : "border-slate-900"
                }`}>
                  {authMode === "sign_in" ? (
                    <p>
                        Don’t have a proxy node yet?{" "}
                      <button
                        type="button"
                        onClick={() => { setAuthMode("sign_up"); setFormError(null); setFormSuccess(null); }}
                        className="text-indigo-500 underline font-semibold hover:text-indigo-400"
                      >
                        Enroll Company Account
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already synchronized with Sentric?{" "}
                      <button
                        type="button"
                        onClick={() => { setAuthMode("sign_in"); setFormError(null); setFormSuccess(null); }}
                        className="text-indigo-500 underline font-semibold hover:text-indigo-400"
                      >
                        Access Control Center
                      </button>
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              /* ACTIVE ONE-TIME PASSCODE HANDSHAKE VERIFICATION INPUT SCREEN */
              <motion.div
                key="active_handshake_otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-amber-500">
                  <Clock className="h-5 w-5 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest">Awaiting One-Time Passcode</span>
                </div>

                <div className={`p-4 rounded-xl border text-xs leading-normal font-sans ${
                  theme === "light" ? "bg-indigo-50 border-indigo-100 text-indigo-900" : "bg-indigo-950/15 border-indigo-900/30 text-indigo-300"
                }`}>
                  A highly secure 6-digit confirmation key has been dispatched to: <strong className="font-mono text-black dark:text-white select-all">{otpTarget}</strong> via Sentric Courier outboxes.
                  Please apply this security key inside {otpCooldown} seconds.
                </div>

                {formError && (
                  <div className="p-3 bg-rose-950/10 border border-rose-900/20 rounded-xl text-rose-500 text-[10.5px] leading-relaxed flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* OTP Passcode submission or credentials reset form */}
                {authMode === "forgot_password" && simulatedCourier && !isVerifyingOtp ? (
                  /* PASSWORD CHANGE SCREEN UNDER FORGOT PASSWORD FLOW */
                  <form onSubmit={handleSaveRecoveredPassword} className="space-y-4">
                    <div className="p-2.5 bg-emerald-950/15 border border-emerald-900/30 text-emerald-400 rounded-xl text-[10.5px] font-mono text-center">
                      ✓ Handshake Code Approved! Define new workspace keys:
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">New Portal Key (Password):</label>
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Min 6 characters"
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                          theme === "light" 
                            ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                            : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">New 6-Digit Backup PIN PIN:</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="e.g. 991005"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono tracking-widest text-center outline-none border transition ${
                          theme === "light" 
                            ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                            : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      Commit and Save Keys
                      <Check className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  /* OTP CODE SUBMIT FORM */
                  <form onSubmit={submitVerifyOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold text-center">
                        Secure OTP:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="••••••"
                        value={otpVal}
                        onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ""))}
                        className={`w-full px-4 py-3 rounded-xl text-lg font-mono text-center tracking-[0.5em] focus:border-indigo-500 outline-none border transition ${
                          theme === "light" 
                            ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                            : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                        }`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsVerifyingOtp(false);
                          setSimulatedCourier(null);
                          setFormError(null);
                        }}
                        className={`py-2 px-4 rounded-xl font-mono text-xs transition cursor-pointer flex items-center gap-1.5 border ${
                          theme === "light"
                            ? "bg-slate-100 border-slate-250 text-slate-600 hover:bg-slate-200"
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                        }`}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-grow py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isProcessing ? "Validating code..." : "Complete Auth Handshake"}
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 📡 UNIVERSAL COURIER SIMULATOR TERMINAL */}
        {simulatedCourier && (
          <div className={`mt-6 rounded-2xl p-4.5 space-y-3 font-mono text-[9.5px]/relaxed shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150 max-w-[440px] mx-auto w-full text-left border ${
            theme === "light" ? "bg-indigo-950/5 border-indigo-100/60" : "bg-slate-950 border-slate-800"
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-indigo-950/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  📬 SENTINEL OUTBOX DISPATCH COURIER
                </h4>
              </div>
              <span className="text-[7.5px] text-slate-500">SIMULATION CONTAINER</span>
            </div>

            {simulatedCourier.type === "email" ? (
              <div className="space-y-1.5 p-2.5 rounded-lg border leading-normal text-slate-400 bg-slate-950 border-slate-900">
                <div className="pb-1 border-b border-slate-900/60 text-[8.5px] text-slate-450 flex flex-col gap-0.5">
                  <div><span className="text-indigo-400 font-bold">FROM:</span> dispatcher.fortress@sentric-security.net</div>
                  <div><span className="text-indigo-400 font-bold">TO:</span> {simulatedCourier.target}</div>
                  <div><span className="text-indigo-400 font-bold">SUBJECT:</span> {simulatedCourier.subject}</div>
                </div>
                {/* Visual email header brand logo */}
                <div className="pt-2 pb-1.5 flex justify-center border-b border-slate-900/40">
                  <SentricLogo size="xs" withText={true} theme="dark" />
                </div>
                <div className="whitespace-pre-line text-[9px]/normal text-slate-400 mt-2 max-h-36 overflow-y-auto pr-1">
                  {simulatedCourier.body}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-amber-950/10 border border-amber-900/20 p-2.5 rounded-lg text-slate-300">
                <Phone className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-bold text-amber-400 tracking-wider">SMS DISPATCH MATRIX:</span>
                  <p className="text-[9px]/relaxed text-amber-300 bg-[#0f0e0c] p-2 rounded border border-amber-500/10 font-bold">
                    {simulatedCourier.text}
                  </p>
                </div>
              </div>
            )}

            <div className={`text-[8px] text-slate-500 text-center uppercase tracking-wide leading-none pt-1 border-t ${
              theme === "light" ? "border-indigo-100" : "border-slate-800"
            }`}>
              Handshake OTP: <span className="text-indigo-400 font-bold bg-indigo-955/20 border border-indigo-500/15 px-1 rounded select-all font-mono text-[9px]">{simulatedCourier.code}</span>
            </div>
          </div>
        )}

        {/* Corporate compliance notes */}
        <div className="text-[10px] text-slate-500 text-center font-mono py-4 border-t border-slate-800/10 max-w-[420px] mx-auto w-full select-none mt-4">
          Secured with AES-GCM local HSM signatures. Mapped and cleared globally using active cloud-run gateway perimeters.
        </div>
      </div>

      {/* 🔐 GOOGLE OAUTH 2.0 SINGLE SIGN-ON SIMULATION MODAL */}
      <AnimatePresence>
        {showGoogleOAuthMock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border text-left flex flex-col relative ${
                theme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-[#0b0c10] border-slate-800 text-slate-200"
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowGoogleOAuthMock(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/20"
              >
                <span className="sr-only">Close</span>
                <span className="text-xl leading-none">×</span>
              </button>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Google SSO Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 font-bold tracking-tight text-lg select-none">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-amber-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-emerald-500">l</span>
                    <span className="text-red-500">e</span>
                    <span className="ml-1 text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 font-mono border border-slate-200/50 dark:border-slate-800 font-normal">OAuth 2.0</span>
                  </div>
                  <h3 className="text-base font-bold font-sans">
                    {!googlePhoneLinking ? "Choose an account" : "Link Telephone Vector"}
                  </h3>
                  <p className="text-[11px] text-slate-450 font-sans leading-relaxed">
                    {!googlePhoneLinking 
                      ? "to continue authentication to Sentric Space securely"
                      : "Provide registered global destination coordinates for real-time Twilio/Vonage MFA"}
                  </p>
                </div>

                {isGoogleProcessing ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                    <span className="text-xs font-mono text-slate-450">Exchanging single sign-on security claims...</span>
                  </div>
                ) : !googlePhoneLinking ? (
                  /* ACCOUNT CHOOSER SCREEN */
                  <div className="space-y-3.5">
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {/* Seeded Accounts Choice */}
                      {accounts.map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => handleGoogleOAuthSignIn(acc.email)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer select-none ${
                            theme === "light"
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-200"
                              : "bg-[#0d0f17] hover:bg-[#141824] border-slate-850"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0 text-indigo-400 font-bold font-mono text-xs uppercase">
                            {acc.email[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 truncate leading-snug">
                              {acc.email === "superadmin@sentric.io" ? "Super Admin" : "Team Member"}
                            </h4>
                            <p className="text-[10.5px] font-mono text-slate-450 truncate">
                              {acc.email}
                            </p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </button>
                      ))}
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
                      <span className="flex-shrink mx-3 text-[9px] font-mono text-slate-500 uppercase">Or Custom Identity</span>
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
                    </div>

                    {/* Manual Input choice */}
                    <div className="space-y-2">
                      <label className="text-[9.5px] font-mono text-slate-500 uppercase block select-none">Enter Google Email ID:</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="user.name@gmail.com"
                          value={googleManualEmail}
                          onChange={(e) => setGoogleManualEmail(e.target.value)}
                          className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                            theme === "light" 
                              ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                              : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!googleManualEmail.trim() || !googleManualEmail.includes("@")) {
                              setFormError("Must provide a valid standard Google coordinates block.");
                              return;
                            }
                            handleGoogleOAuthSignIn(googleManualEmail);
                          }}
                          className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-medium transition cursor-pointer shrink-0"
                        >
                          Auth Identity
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PHONE LINKING SCREEN FOR THIRD-PARTY EMAIL WITHOUT REGISTERED PHONE NODE */
                  <form onSubmit={submitGooglePhoneLinking} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">Selected SSO Identity:</label>
                      <input
                        type="text"
                        disabled
                        value={googleSelectedEmail}
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-900/50 border border-slate-800 text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">Select Target Destination Telephone:</label>
                      <div className="flex gap-1.5">
                        <div className="relative shrink-0">
                          <select
                            value={googleLinkPrefix}
                            onChange={(e) => setGoogleLinkPrefix(e.target.value)}
                            className={`h-full border rounded-xl pl-3 pr-8 py-2 font-mono text-xs outline-none cursor-pointer appearance-none transition ${
                              theme === "light"
                                ? "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
                                : "bg-slate-950 border-slate-800 text-slate-300 focus:border-indigo-500/30"
                            }`}
                          >
                            {countriesList.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.country} ({country.code})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>
                        
                        <input
                          type="text"
                          required
                          placeholder="+91 XXXXX XXXXX"
                          value={googleLinkPhoneInput}
                          onChange={(e) => setGoogleLinkPhoneInput(e.target.value.replace(/[^\d+()\-\s]/g, ""))}
                          className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-mono outline-none border transition ${
                            theme === "light" 
                              ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500" 
                              : "bg-slate-950/80 border-slate-800 text-white focus:border-indigo-500/40"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGooglePhoneLinking(false);
                          setGoogleSelectedEmail("");
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isGoogleProcessing}
                        className="flex-grow py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        {isGoogleProcessing ? "Transmitting check..." : "Send Twilio OTP"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Footer notes */}
                <div className="text-[9px] text-slate-500 text-center uppercase tracking-wide font-mono leading-none pt-2 border-t border-slate-800/20">
                  Google secure identity assertion • sector 18 gateway
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
