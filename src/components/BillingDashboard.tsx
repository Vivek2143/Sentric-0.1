import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  Mail, 
  Globe, 
  Sparkles, 
  CheckCircle, 
  FileText, 
  RefreshCw, 
  UserCheck, 
  Lock, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Flame,
  ArrowRight,
  Phone,
  ShieldAlert,
  Check,
  ChevronDown,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
  Send
} from "lucide-react";
import { detectGeoLocation, formatPrice } from "../utils/geo";
import { playLatencyAlarm } from "../utils/audioNotification";

interface BillingDashboardProps {
  userEmail: string | null;
  subscriptionStatus: string;
  trialScansRemaining: number;
  onLogin: (email: string) => void;
  onLogout: () => void;
  onPurchaseSubscription: (status: string) => void;
}

export default function BillingDashboard({
  userEmail,
  subscriptionStatus,
  trialScansRemaining,
  onLogin,
  onLogout,
  onPurchaseSubscription
}: BillingDashboardProps) {
  // Geo IP Data
  const [geo, setGeo] = useState<{
    ip: string;
    country: string;
    country_name: string;
    city: string;
    currency: string;
    symbol: string;
  }>({
    ip: "Detecting...",
    country: "US",
    country_name: "United States",
    city: "New York",
    currency: "USD",
    symbol: "$"
  });

  const [isLocating, setIsLocating] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "INR">("USD");

  // Email input state
  const [gmailInput, setGmailInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Pre-verification credentials setup
  const [authStep, setAuthStep] = useState<"credentials" | "google">("credentials");
  const [securityPassword, setSecurityPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [credsError, setCredsError] = useState<string | null>(null);

  // --- OTP Verification & Multi-Channel Authentication States ---
  const [authChannel, setAuthChannel] = useState<"email" | "phone">("email");
  const [phoneInput, setPhoneInput] = useState("");
  const [countryPrefix, setCountryPrefix] = useState("+91");
  const [otpModeState, setOtpModeState] = useState<"enter_info" | "enter_otp">("enter_info");
  const [otpInput, setOtpInput] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [sentOtpSuccess, setSentOtpSuccess] = useState<string | null>(null);
  const [scannedLogsToShow, setScannedLogsToShow] = useState<{ subject?: string; body?: string; text?: string; type: "email" | "phone"; code: string; target: string } | null>(null);
  
  // Security Locks & Expiry tracking
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Password reset control center states
  const [isManagingPassword, setIsManagingPassword] = useState(false);
  const [pwModeState, setPwModeState] = useState<"select_channel" | "verify_otp" | "input_new">("select_channel");
  const [pwChannel, setPwChannel] = useState<"email" | "phone">("email");
  const [pwPhoneVal, setPwPhoneVal] = useState("");
  const [pwCountryPref, setPwCountryPref] = useState("+91");
  const [pwEmailVal, setPwEmailVal] = useState("");
  const [pwOtpVal, setPwOtpVal] = useState("");
  const [pwOtpCooldown, setPwOtpCooldown] = useState(0);
  const [pwSentOtp, setPwSentOtp] = useState<string | null>(null);
  const [pwNewPassVal, setPwNewPassVal] = useState("");
  const [pwNewPinVal, setPwNewPinVal] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccessMsg, setPwSuccessMsg] = useState<string | null>(null);
  const [pwCourierLog, setPwCourierLog] = useState<{ subject?: string; body?: string; text?: string; type: "email" | "phone"; code: string; target: string } | null>(null);

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

  // Cooldown & Lockout countdown logic
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
            setOtpAttempts(0);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  useEffect(() => {
    let timer: any;
    if (pwOtpCooldown > 0) {
      timer = setInterval(() => {
        setPwOtpCooldown(c => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pwOtpCooldown]);

  useEffect(() => {
    if (userEmail) {
      setPwEmailVal(userEmail);
    }
  }, [userEmail]);

  // Handler for OTP requested for primary sign in
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSentOtpSuccess(null);

    if (isLockedOut) {
      setAuthError(`Brute Force Mitigation: Login panel currently suspended. Wait ${lockoutTimer} seconds.`);
      return;
    }

    const payload: any = { type: authChannel };
    let finalTarget = "";

    if (authChannel === "email") {
      const emailClean = gmailInput.trim().toLowerCase();
      if (!emailClean) {
        setAuthError("Sentinel Warning: Gmail input cannot be blank.");
        return;
      }
      if (!emailClean.includes("@gmail.com")) {
        setAuthError("Sentinel Security Warning: A valid @gmail.com identifier is mandatory.");
        return;
      }
      // Special admin check validation
      if (emailClean === "aryan21430@gmail.com") {
        if (securityPassword !== "Rajaram09") {
          setAuthError("Sentinel Access Warning: Invalid portal security key corresponding to the prime administrator account node.");
          return;
        }
      }
      payload.email = emailClean;
      finalTarget = emailClean;
    } else {
      if (!phoneInput.trim() || phoneInput.trim().length < 7) {
        setAuthError("Sentinel Warning: Please enter a valid telephone coordinate.");
        return;
      }
      payload.phone = phoneInput.trim();
      payload.prefix = countryPrefix;
      finalTarget = `${countryPrefix} ${phoneInput.trim()}`;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/security/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setIsLoggingIn(false);

      if (!response.ok) {
        setAuthError(data.error || "Failed to transmit OTP pipeline payload.");
        return;
      }

      setSentOtpSuccess(`Success: A secure handshake OTP code has been issued.`);
      setOtpCooldown(120); // 2 minutes countdown
      setOtpModeState("enter_otp");
      
      setScannedLogsToShow({
        type: authChannel,
        code: data.otp,
        target: finalTarget,
        subject: data.emailDetails?.subject,
        body: data.emailDetails?.body,
        text: data.smsDetails?.text
      });
      
      try {
        playLatencyAlarm();
      } catch (err) {}
    } catch (err: any) {
      setIsLoggingIn(false);
      setAuthError(`Connection pipeline disrupted: ${err.message || err}`);
    }
  };

  // Handler for OTP verification submit for primary sign in
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (isLockedOut) {
      setAuthError("This session is locked out due to excessive failed attempts.");
      return;
    }

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError("Input Exception: Security OTP must be exactly a 6-digit passcode.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/security/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: authChannel,
          email: authChannel === "email" ? gmailInput.trim().toLowerCase() : undefined,
          phone: authChannel === "phone" ? phoneInput.trim() : undefined,
          prefix: authChannel === "phone" ? countryPrefix : undefined,
          otp: otpInput.trim()
        })
      });
      const data = await response.json();
      setIsLoggingIn(false);

      if (!response.ok) {
        const nextAttempts = otpAttempts + 1;
        setOtpAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setIsLockedOut(true);
          setLockoutTimer(60);
          setAuthError("CRITICAL EXCEPTION: Too many incorrect OTP attempts! Handshake suspended for 60 seconds.");
        } else {
          setAuthError(`${data.error || "Verification failed."} Remaining chances: ${3 - nextAttempts}`);
        }
        return;
      }

      // Successful handshake!
      const finalEmail = authChannel === "email" ? gmailInput.trim() : `${countryPrefix} ${phoneInput.trim()}`;
      onLogin(finalEmail);
      
      // Reset states
      setOtpModeState("enter_info");
      setOtpInput("");
      setGmailInput("");
      setPhoneInput("");
      setScannedLogsToShow(null);
      setOtpAttempts(0);
      try {
        playLatencyAlarm();
      } catch (err) {}
    } catch (err: any) {
      setIsLoggingIn(false);
      setAuthError(`Validation pathway error: ${err.message || err}`);
    }
  };

  // Handlers for OTP requested for password change
  const handleRequestPwChangeOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccessMsg(null);

    const payload: any = { type: pwChannel };
    let finalTarget = "";

    if (pwChannel === "email") {
      const emailVal = pwEmailVal.trim().toLowerCase();
      if (!emailVal) {
        setPwError("Please enter your linked Gmail coordinate.");
        return;
      }
      payload.email = emailVal;
      finalTarget = emailVal;
    } else {
      if (!pwPhoneVal.trim() || pwPhoneVal.trim().length < 7) {
        setPwError("Please enter a valid telephone vector.");
        return;
      }
      payload.phone = pwPhoneVal.trim();
      payload.prefix = pwCountryPref;
      finalTarget = `${pwCountryPref} ${pwPhoneVal.trim()}`;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/security/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setIsLoggingIn(false);

      if (!response.ok) {
        setPwError(data.error || "Failed secure password OTP handshake.");
        return;
      }

      setPwSentOtp(data.otp);
      setPwOtpCooldown(120);
      setPwModeState("verify_otp");
      
      setPwCourierLog({
        type: pwChannel,
        code: data.otp,
        target: finalTarget,
        subject: data.emailDetails?.subject,
        body: data.emailDetails?.body,
        text: data.smsDetails?.text
      });
      
      setPwSuccessMsg("MFA OTP routed successfully. Inspect the courier outbox console.");
      try {
        playLatencyAlarm();
      } catch (err) {}
    } catch (err: any) {
      setIsLoggingIn(false);
      setPwError(`MFA endpoint broken: ${err.message || err}`);
    }
  };

  const handleVerifyPwChangeOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (!pwOtpVal.trim()) {
      setPwError("Please supply the verification PIN code.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/security/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: pwChannel,
          email: pwChannel === "email" ? pwEmailVal.trim().toLowerCase() : undefined,
          phone: pwChannel === "phone" ? pwPhoneVal.trim() : undefined,
          prefix: pwChannel === "phone" ? pwCountryPref : undefined,
          otp: pwOtpVal.trim()
        })
      });
      const data = await response.json();
      setIsLoggingIn(false);

      if (!response.ok) {
        setPwError(data.error || "Cryptographic challenge deauthorized.");
        return;
      }

      setPwModeState("input_new");
      setPwSuccessMsg("MFA code Approved. Credential Modification Gateway is now unlocked.");
      try {
        playLatencyAlarm();
      } catch (err) {}
    } catch (err: any) {
      setIsLoggingIn(false);
      setPwError(`Verification system error: ${err.message || err}`);
    }
  };

  const handleApplyNewPasswords = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (pwNewPassVal.length < 6) {
      setPwError("Strict Guideline Error: Password must contain at least 6 characters.");
      return;
    }

    if (!/^\d{6}$/.test(pwNewPinVal)) {
      setPwError("Strict Guideline Error: PIN must be exactly a 6-digit numeric sequence.");
      return;
    }

    // Set updated values!
    setSecurityPassword(pwNewPassVal);
    setSecurityCode(pwNewPinVal);
    localStorage.setItem("sentric_verified_pass", pwNewPassVal);
    localStorage.setItem("sentric_verified_code", pwNewPinVal);

    setPwSuccessMsg("Credential parameters committed successfully to Sentinel vault.");
    
    // Smooth auto reset
    setTimeout(() => {
      setIsManagingPassword(false);
      setPwModeState("select_channel");
      setPwNewPassVal("");
      setPwNewPinVal("");
      setPwOtpVal("");
      setPwCourierLog(null);
      setPwSuccessMsg(null);
    }, 2800);

    try {
      playLatencyAlarm();
    } catch (err) {}
  };

  // Monitor user login state to reset authentication step on exit
  useEffect(() => {
    if (!userEmail) {
      setAuthStep("credentials");
    } else {
      const savedPass = localStorage.getItem("sentric_verified_pass");
      const savedCode = localStorage.getItem("sentric_verified_code");
      if (savedPass) setSecurityPassword(savedPass);
      if (savedCode) setSecurityCode(savedCode);
    }
  }, [userEmail]);

  // Handle credentials preset verification
  const handleVerifyCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError(null);
    
    if (securityPassword.length < 6) {
      setCredsError("Sentinel Security Warning: Passwords must contain at least 6 characters.");
      return;
    }
    
    if (!/^\d{6}$/.test(securityCode)) {
      setCredsError("Sentinel Security Warning: Verification code must be exactly a 6-digit numeric PIN.");
      return;
    }

    // Securely cache credentials locally for active session context
    localStorage.setItem("sentric_verified_pass", securityPassword);
    localStorage.setItem("sentric_verified_code", securityCode);
    
    // Smooth transition to stage 2
    setAuthStep("google");
    try {
      playLatencyAlarm();
    } catch (err) {}
  };

  // Persistent Corporate Billing Address state
  const [billingCompany, setBillingCompany] = useState(() => localStorage.getItem("sentric_billing_company") || "Sentric India Technologies Ltd");
  const [billingAddress, setBillingAddress] = useState(() => localStorage.getItem("sentric_billing_address") || "Sector 18, Block B-42, Noida, Uttar Pradesh, 201301, India");
  const [billingPhone, setBillingPhone] = useState(() => localStorage.getItem("sentric_billing_phone") || "+91 98209 88164");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempCompany, setTempCompany] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [tempPhone, setTempPhone] = useState("");

  const handleSaveAddress = () => {
    setBillingCompany(tempCompany || "Sentric India Technologies Ltd");
    setBillingAddress(tempAddress || "Sector 18, Block B-42, Noida, Uttar Pradesh, 201301, India");
    setBillingPhone(tempPhone || "+91 98209 88164");
    localStorage.setItem("sentric_billing_company", tempCompany || "Sentric India Technologies Ltd");
    localStorage.setItem("sentric_billing_address", tempAddress || "Sector 18, Block B-42, Noida, Uttar Pradesh, 201301, India");
    localStorage.setItem("sentric_billing_phone", tempPhone || "+91 98209 88164");
    setIsEditingAddress(false);
  };

  // Active checkout specific Billing Address state
  const [checkoutBillingAddress, setCheckoutBillingAddress] = useState("");
  const [checkoutBillingCompany, setCheckoutBillingCompany] = useState("");

  // Target Invoice Modal Detail state
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: string; date: string; planName: string; amount: string; status: string; companyName: string; address: string } | null>(null);

  // Billing states
  const [checkoutPlan, setCheckoutPlan] = useState<{ id: string; duration: string; price: number } | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank" | "card">("upi");
  const [transactionId, setTransactionId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Invoice logs mapping
  const [invoices, setInvoices] = useState<Array<{ id: string; date: string; planName: string; amount: string; status: string }>>([
    { id: "INV-9021", date: "2026-06-10", planName: "Free Trial Registration", amount: "$0.00", status: "Success" }
  ]);

  // Load geolocation and setup currency
  useEffect(() => {
    async function loadGeo() {
      setIsLocating(true);
      const data = await detectGeoLocation();
      setGeo(data);
      setSelectedCurrency(data.currency as "USD" | "INR");
      setIsLocating(false);
    }
    loadGeo();
  }, []);

  // Update dynamic invoice currencies on change
  useEffect(() => {
    if (subscriptionStatus && subscriptionStatus !== "none" && subscriptionStatus !== "trial") {
      let fee = 350;
      let durationName = "3 Months Enterprise Portal";
      if (subscriptionStatus === "active_6m") {
        fee = 650;
        durationName = "6 Months Enterprise Portal";
      } else if (subscriptionStatus === "active_1y") {
        fee = 1250;
        durationName = "1 Year Unlimited Canopy";
      }
      const sym = selectedCurrency === "INR" ? "₹" : "$";
      setInvoices([
        {
          id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
          date: new Date().toISOString().split("T")[0],
          planName: durationName,
          amount: `${sym}${fee}`,
          status: "Paid"
        },
        { id: "INV-9021", date: "2026-06-10", planName: "Free Trial Activation", amount: `${selectedCurrency === "INR" ? "₹0.00" : "$0.00"}`, status: "Success" }
      ]);
    }
  }, [subscriptionStatus, selectedCurrency]);

  const handleGmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!gmailInput.trim()) return;

    const emailClean = gmailInput.trim().toLowerCase();

    if (!emailClean.includes("@gmail.com")) {
      setAuthError("Oops! Sentinel security protocols require a valid @gmail.com address to verify credentials.");
      return;
    }

    // Ingress Validation for Master Admin Node & Custom Credentials
    if (emailClean === "aryan21430@gmail.com") {
      if (securityPassword !== "Rajaram09") {
        setAuthError("Sentinel Access Warning: Invalid portal security key corresponding to the prime administrator account node.");
        return;
      }
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      onLogin(gmailInput.trim());
      setIsLoggingIn(false);
      setGmailInput("");
      try {
        playLatencyAlarm();
      } catch (err) {}
    }, 1200);
  };

  const handleQuickGmailLogin = () => {
    // Fill security credentials automatically for easy quick sign-in compliance
    setSecurityPassword("sentinelAdmin101");
    setSecurityCode("991005");
    localStorage.setItem("sentric_verified_pass", "sentinelAdmin101");
    localStorage.setItem("sentric_verified_code", "991005");

    setIsLoggingIn(true);
    setTimeout(() => {
      onLogin("sentinel.engineer@gmail.com");
      setIsLoggingIn(false);
      try {
        playLatencyAlarm();
      } catch (err) {}
    }, 1000);
  };

  const handleAdminOverrideLogin = () => {
    // Fill admin specific credentials for aryan21430@gmail.com
    setSecurityPassword("Rajaram09");
    setSecurityCode("991005");
    localStorage.setItem("sentric_verified_pass", "Rajaram09");
    localStorage.setItem("sentric_verified_code", "991005");

    setIsLoggingIn(true);
    setTimeout(() => {
      onLogin("aryan21430@gmail.com");
      setIsLoggingIn(false);
      try {
        playLatencyAlarm();
      } catch (err) {}
    }, 1000);
  };

  const handleStartCheckout = (planId: string, duration: string, price: number) => {
    if (!userEmail) {
      setAuthError("Please authenticate using your Gmail first to link your custom subscription trial node.");
      // Scroll to auth section smoothly
      const element = document.getElementById("auth-panel");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    setCheckoutPlan({ id: planId, duration, price });
    setCheckoutBillingCompany(billingCompany);
    setCheckoutBillingAddress(billingAddress);
    setPaymentSuccess(false);
    setCheckoutError(null);
    setTransactionId("");
    setPaymentMethod(selectedCurrency === "INR" ? "upi" : "card");
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (paymentMethod === "card") {
      if (!cardName.trim() || cardNumber.length < 15 || !cardExpiry.trim() || cardCvv.length < 3) {
        setCheckoutError("Sentinel core rejected card formatting. Verify credit credentials and retry.");
        return;
      }
    } else {
      if (!transactionId.trim() || transactionId.trim().length < 8) {
        setCheckoutError("Verification Error: Please enter a valid 8-12 character UPI UTR or Bank IMPS/NEFT Transaction Reference ID to match ledger entries.");
        return;
      }
    }

    if (!checkoutBillingAddress.trim()) {
      setCheckoutError("Billing address is required to generate commercial compliant receipts.");
      return;
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      // Persist checkout billing address as the main updated billing address
      setBillingCompany(checkoutBillingCompany);
      setBillingAddress(checkoutBillingAddress);
      localStorage.setItem("sentric_billing_company", checkoutBillingCompany);
      localStorage.setItem("sentric_billing_address", checkoutBillingAddress);

      onPurchaseSubscription(checkoutPlan?.id || "active_3m");
      try {
        playLatencyAlarm();
      } catch (err) {}
      setTimeout(() => {
        setCheckoutPlan(null);
        setPaymentSuccess(false);
        setCardName("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvv("");
        setTransactionId("");
      }, 4000);
    }, 2500);
  };

  // Human friendly subscription statuses
  const getSubBadge = () => {
    if (userEmail?.toLowerCase() === "aryan21430@gmail.com") {
      return { 
        text: "Founder Lifetime Pass (Fully Free)", 
        color: "text-amber-400 bg-amber-950/40 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-extrabold animate-pulse" 
      };
    }
    switch (subscriptionStatus) {
      case "active_3m":
        return { text: "Active (3-Month Enterprise Suite)", color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20" };
      case "active_6m":
        return { text: "Active (6-Month Premium Vault)", color: "text-[#aa80ff] bg-[#aa80ff]/10 border-[#aa80ff]/20" };
      case "active_1y":
        return { text: "Active (1-Year Global Canopy)", color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/20" };
      case "trial":
        return { text: "Free Trial Node Active", color: "text-amber-400 bg-amber-950/40 border-amber-500/20" };
      default:
        return { text: "No Active License (Restricted Mode)", color: "text-rose-400 bg-rose-950/40 border-rose-500/20" };
    }
  };

  const subBadgeStatus = getSubBadge();

  const computedUpiId = "9820988164@upi";
  const computedUpiUrl = checkoutPlan ? `upi://pay?pa=${computedUpiId}&pn=Aryan%20Raj&am=${checkoutPlan.price}&cu=${selectedCurrency}&tn=Sentric%252520Plan%252520${checkoutPlan.id}` : "";
  const computedQrCodeSrc = checkoutPlan ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(computedUpiUrl)}` : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Dynamic Geolocation Tracker Badge & Header */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-mono text-indigo-400">
              <Globe className="h-3 w-3 animate-spin duration-[10s]" />
              <span>DYNAMIC IP SENTINEL GEOLOCATION DETECTOR</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">Sentric Billing & Global Licensing</h2>
            <p className="text-xs text-slate-400 max-w-2xl font-sans">
              Manage enterprise subscription channels, check automatic localized exchange rates, review telemetry, and connect Google accounts. Allowed and distributed globally under extreme compliance.
            </p>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl shrink-0 space-y-2 font-mono text-[10.5px]">
            <div className="flex justify-between gap-8 text-slate-400 border-b border-white/5 pb-1.5">
              <span>Detected country:</span>
              <span className="text-white font-semibold">{isLocating ? "Locating..." : geo.country_name} ({geo.country})</span>
            </div>
            <div className="flex justify-between gap-8 text-slate-400 border-b border-white/5 pb-1.5">
              <span>Geolocated IP:</span>
              <span className="text-cyan-400 font-bold">{isLocating ? "Scanning DNS..." : geo.ip}</span>
            </div>
            <div className="flex justify-between gap-8 text-slate-400">
              <span>Portal Currency:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-indigo-400 font-bold">{selectedCurrency} ({selectedCurrency === "INR" ? "₹" : "$"})</span>
                <button 
                  onClick={() => setSelectedCurrency(prev => prev === "USD" ? "INR" : "USD")}
                  className="px-1.5 py-0.5 bg-slate-850 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/30 text-slate-300 hover:text-white rounded text-[8.5px] transition"
                  title="Force toggle currency mapping parameters manually"
                >
                  Force Toggle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: GMAIL PROFILE & SIGN-IN */}
        <div id="auth-panel" className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <h3 className="text-sm font-mono font-bold tracking-wide text-white uppercase border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <Mail className="h-4.5 w-4.5 text-indigo-400" />
              1. Authentication Node
            </h3>

            {userEmail ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 relative">
                  <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-mono text-sm font-bold text-indigo-400 select-none">
                      {userEmail[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-white leading-none truncate max-w-[140px]" title={userEmail}>{userEmail}</p>
                      <span className="text-[9.5px] font-mono text-slate-500 mt-1 block">Account Level: Enterprise Admin</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-900 pt-3 flex flex-col gap-1.5 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Access Key:</span>
                      <span className="text-slate-350 font-bold">SECURE_NODE_OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Node Location:</span>
                      <span className="text-slate-350">{geo.city}, {geo.country}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900/50 pt-1.5 mt-1 pb-0.5">
                      <span className="text-slate-500">Security Password:</span>
                      <span className="text-emerald-450 font-bold">•••••• (Configured)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Secure Backup PIN:</span>
                      <span className="text-emerald-450 font-bold">●●●●●● (Enforced)</span>
                    </div>
                  </div>
                </div>

                {/* 🔐 PROFILE PASSWORD MODIFICATION CENTER */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-450 flex items-center gap-1">
                      <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                      Credential Management
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManagingPassword(!isManagingPassword);
                        setPwModeState("select_channel");
                        setPwError(null);
                        setPwSuccessMsg(null);
                        setPwCourierLog(null);
                      }}
                      className="text-[9px] font-mono font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      {isManagingPassword ? "Close Wizard" : "Change Passwords"}
                    </button>
                  </div>

                  {isManagingPassword ? (
                    <div className="space-y-3 border-t border-white/5 pt-3 animate-in fade-in duration-150">
                      {pwModeState === "select_channel" && (
                        <form onSubmit={handleRequestPwChangeOtp} className="space-y-3">
                          <p className="text-[10px] text-slate-450 leading-relaxed font-sans">
                            Choose verification path to authorize profile adjustments.
                          </p>

                          <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-805">
                            <button
                              type="button"
                              onClick={() => setPwChannel("email")}
                              className={`py-1 rounded text-[10px] font-mono uppercase font-bold transition ${
                                pwChannel === "email" ? "bg-indigo-505/15 text-indigo-400" : "text-slate-500 hover:text-slate-400"
                              }`}
                            >
                              📧 Gmail Link
                            </button>
                            <button
                              type="button"
                              onClick={() => setPwChannel("phone")}
                              className={`py-1 rounded text-[10px] font-mono uppercase font-bold transition ${
                                pwChannel === "phone" ? "bg-indigo-505/15 text-indigo-400" : "text-slate-500 hover:text-slate-400"
                              }`}
                            >
                              📱 Mobile Phone
                            </button>
                          </div>

                          {pwChannel === "email" ? (
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-mono text-slate-500 block">Linked Gmail Vector:</label>
                              <input
                                type="email"
                                required
                                value={pwEmailVal}
                                onChange={(e) => setPwEmailVal(e.target.value)}
                                placeholder="operator@gmail.com"
                                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-705 outline-none focus:border-indigo-500/50"
                              />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-mono text-slate-500 block">Telephone Sequence:</label>
                              <div className="flex gap-1">
                                <div className="relative shrink-0">
                                  <select
                                    value={pwCountryPref}
                                    onChange={(e) => setPwCountryPref(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 font-mono text-xs text-indigo-451 outline-none cursor-pointer appearance-none pr-6"
                                  >
                                    {countriesList.map((c) => (
                                      <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="h-3 w-3 absolute right-1.5 top-2.5 text-slate-500 pointer-events-none" />
                                </div>
                                <input
                                  type="text"
                                  required
                                  placeholder="98209xxxxx"
                                  value={pwPhoneVal}
                                  onChange={(e) => setPwPhoneVal(e.target.value.replace(/\D/g, ""))}
                                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white outline-none focus:border-indigo-500/50"
                                />
                              </div>
                            </div>
                          )}

                          {pwError && <p className="text-[9.5px] text-rose-500 font-sans leading-tight mt-1">⚠️ {pwError}</p>}

                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-1.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 font-mono text-[10px] uppercase rounded-lg transition"
                          >
                            {isLoggingIn ? "Dispatching..." : "Transmit Verification OTP"}
                          </button>
                        </form>
                      )}

                      {pwModeState === "verify_otp" && (
                        <form onSubmit={handleVerifyPwChangeOtp} className="space-y-2.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <p className="text-[10px] text-slate-400 font-mono">
                              Awaiting Verification OTP... {pwOtpCooldown > 0 ? `(${pwOtpCooldown}s)` : "Expired"}
                            </p>
                          </div>

                          <input
                            type="text"
                            maxLength={6}
                            required
                            placeholder="Enter 6-digit OTP passcode"
                            value={pwOtpVal}
                            onChange={(e) => setPwOtpVal(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-center font-mono text-xs text-white placeholder-slate-705 tracking-widest outline-none focus:border-indigo-500/50"
                          />

                          {pwError && <p className="text-[9.5px] text-rose-500 font-sans leading-tight">⚠️ {pwError}</p>}

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => { setPwModeState("select_channel"); setPwError(null); }}
                              className="py-1 px-3 bg-slate-950 border border-slate-850 text-slate-400 font-mono text-[9.5px] rounded-lg"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={isLoggingIn}
                              className="flex-grow py-1 bg-indigo-500/20 hover:bg-indigo-500 border border-indigo-500/30 text-white font-mono text-[9.5px] rounded-lg"
                            >
                              Verify OTP Passcode
                            </button>
                          </div>
                        </form>
                      )}

                      {pwModeState === "input_new" && (
                        <form onSubmit={handleApplyNewPasswords} className="space-y-3">
                          <p className="text-[10px] text-emerald-450 font-sans">✓ Auth Verified. Define your new workspace keys:</p>
                          
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-mono text-slate-500 block">New Access Password:</label>
                            <input
                              type="password"
                              required
                              placeholder="Min 6 characters"
                              value={pwNewPassVal}
                              onChange={(e) => setPwNewPassVal(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white outline-none focus:border-indigo-500/50"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] font-mono text-slate-500 block">New 6-Digit PIN PIN:</label>
                            <input
                              type="text"
                              maxLength={6}
                              required
                              placeholder="e.g. 981102"
                              value={pwNewPinVal}
                              onChange={(e) => setPwNewPinVal(e.target.value.replace(/\D/g, ""))}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono tracking-widest text-center text-white outline-none focus:border-indigo-500/50"
                            />
                          </div>

                          {pwError && <p className="text-[9.5px] text-rose-500 font-sans leading-tight">⚠️ {pwError}</p>}

                          <button
                            type="submit"
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono uppercase rounded-lg transition"
                          >
                            Commit & Save updated Parameters
                          </button>
                        </form>
                      )}

                      {pwSuccessMsg && (
                        <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded text-[9.5px] font-mono text-center">
                          {pwSuccessMsg}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-mono">
                      <ShieldCheck className="h-4 w-4 text-emerald-450 shrink-0" />
                      <span>Security credentials certified under absolute offline HSM standard.</span>
                    </div>
                  )}
                </div>

                {/* Sub status details */}
                <div className="p-4 bg-slate-950/40 border border-slate-805 rounded-xl space-y-3">
                  <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-500">Shield Canopy Status</span>
                  <div className={`p-2.5 rounded-lg border font-mono text-[10.5px] font-medium text-center ${subBadgeStatus.color}`}>
                    {subBadgeStatus.text}
                  </div>
                  {subscriptionStatus === "trial" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10.5px] font-mono text-slate-400">
                        <span>Trial Neural Sandbox Scans:</span>
                        <strong className="text-indigo-400 font-bold">{trialScansRemaining} remaining</strong>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-900 overflow-hidden">
                        <div 
                          className="bg-indigo-505 h-full transition-all duration-300"
                          style={{ width: `${(trialScansRemaining / 3) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-[9.5px] text-slate-550 leading-relaxed font-sans">
                        Enjoy unvetted firewall interception sandbox credentials. Upgrade below once trial runs out to enjoy unlimited API scans.
                      </p>
                    </div>
                  )}
                  {subscriptionStatus !== "trial" && subscriptionStatus !== "none" && (
                    <div className="text-[10px] space-y-1.5 font-sans leading-relaxed text-slate-400">
                      <p className="text-emerald-450 font-medium">✓ Lifetime API neural endpoints activated.</p>
                      <p className="text-slate-500 text-[9.5px] font-mono">Renewal period: Standard prepaid term (NIST secure node)</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={onLogout}
                  className="w-full py-2 bg-slate-950 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 font-mono text-[10px] uppercase border border-slate-850 hover:border-rose-900/30 rounded-xl transition duration-150 cursor-pointer"
                >
                  Unlink Google Node
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Verification Stage:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${authStep === "credentials" ? "bg-indigo-500 animate-pulse" : "bg-indigo-900"}`}></span>
                    <span className={`text-[9.5px] font-mono font-bold ${authStep === "credentials" ? "text-indigo-400" : "text-slate-500"}`}>
                      1. Keys
                    </span>
                    <span className="text-slate-700 text-[10px]">→</span>
                    <span className={`h-2 w-2 rounded-full ${authStep === "google" ? "bg-indigo-500 animate-pulse" : "bg-slate-800"}`}></span>
                    <span className={`text-[9.5px] font-mono font-bold ${authStep === "google" ? "text-indigo-400" : "text-slate-500"}`}>
                      2. MFA OTP
                    </span>
                  </div>
                </div>

                {authStep === "credentials" ? (
                  /* STEP 1: DEFINE LOCAL SECURE CREDENTIALS */
                  <form onSubmit={handleVerifyCredentialsSubmit} className="space-y-3.5">
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Sentinel security compliance requires creating a secure password and a 6-digit access code for your workspace before linking standard Google services.
                    </p>

                    <div>
                      <label className="text-[10.5px] font-mono text-slate-400 block mb-1">Set Portal Password:</label>
                      <div className="relative">
                        <input 
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={securityPassword}
                          onChange={(e) => setSecurityPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-700 outline-none focus:border-indigo-500/50 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10.5px] font-mono text-slate-400 block mb-1">Set 6-Digit Backup PIN PIN:</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 192837"
                          value={securityCode}
                          onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-700 outline-none focus:border-indigo-500/50 transition tracking-widest text-center"
                        />
                      </div>
                    </div>

                    {credsError && (
                      <div className="p-2.5 bg-rose-950/15 border border-rose-900/30 rounded-lg text-rose-400 font-sans text-[10px] leading-relaxed flex items-start gap-1.5 animate-bounce">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{credsError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white font-mono font-medium rounded-xl text-xs transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Continue & Set Passwords</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  /* STEP 2: MULTI-CHANNEL AUTHENTICATION GATEWAY WITH OTP */
                  <div className="space-y-4">
                    {otpModeState === "enter_info" ? (
                      <form onSubmit={handleRequestOtp} className="space-y-3.5">
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          A local profile keys has been verified! Now choose your preferred secure channel to request a One-Time verification passcode:
                        </p>

                        {/* Interactive Tab Switcher */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 border border-slate-850 rounded-xl">
                          <button
                            type="button"
                            onClick={() => { setAuthChannel("email"); setAuthError(null); }}
                            className={`py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                              authChannel === "email" 
                                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" 
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            ✉ Gmail Link
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAuthChannel("phone"); setAuthError(null); }}
                            className={`py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                              authChannel === "phone" 
                                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" 
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            📱 Mobile Phone
                          </button>
                        </div>

                        {authChannel === "email" ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-450 block">Google Email Identifier:</label>
                            <div className="relative">
                              <input 
                                type="text"
                                required
                                placeholder="e.g. administrator"
                                value={gmailInput}
                                onChange={(e) => setGmailInput(e.target.value)}
                                className="w-full pl-3 pr-20 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-700 outline-none focus:border-indigo-500/50 transition"
                              />
                              <span className="absolute right-3 top-2 text-[9px] font-mono text-slate-500 leading-none">@gmail.com</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-450 block">Universal Telephone Contact:</label>
                            <div className="flex gap-1.5">
                              {/* Styled Custom Dropdown Selector */}
                              <div className="relative">
                                <select
                                  value={countryPrefix}
                                  onChange={(e) => setCountryPrefix(e.target.value)}
                                  className="h-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 font-mono text-xs text-white outline-none cursor-pointer appearance-none transition focus:border-indigo-500/50"
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
                                placeholder="9820988164"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                                className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-700 outline-none focus:border-indigo-500/50 transition"
                              />
                            </div>
                          </div>
                        )}

                        {authError && (
                          <div className="p-2.5 bg-rose-950/15 border border-rose-900/30 rounded-lg text-rose-400 font-sans text-[10px] leading-relaxed flex items-start gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{authError}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAuthStep("credentials")}
                            className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 font-mono text-[10.5px] rounded-xl transition"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="flex-grow py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-mono font-medium rounded-xl text-xs transition duration-150 active:scale-95 shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isLoggingIn ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5 text-indigo-300" />
                                Request Security OTP
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Awaiting entered OTP */
                      <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                        <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                            <span className="text-[10.5px] font-mono font-bold text-amber-400 uppercase tracking-wide">
                              AWAITING ONE-TIME PASSCODE DISPATCH
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                            A secure identity token was sent to: <span className="text-white font-mono font-semibold">{authChannel === "email" ? `${gmailInput}@gmail.com` : `${countryPrefix} ${phoneInput}`}</span>. 
                            Please verify within <span className="font-mono text-amber-400 font-bold">{otpCooldown} seconds</span>. Change attempts remaining: <span className="font-mono text-rose-450 font-bold">{3 - otpAttempts}</span>.
                          </p>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-mono text-slate-455 block mb-1">Enter 6-Digit Code:</label>
                          <input 
                            type="text"
                            maxLength={6}
                            required
                            placeholder="••••••"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-center text-white outline-none tracking-[0.5em] focus:border-indigo-500/50 transition"
                          />
                        </div>

                        {authError && (
                          <div className="p-2.5 bg-rose-950/15 border border-rose-900/30 rounded-lg text-rose-400 font-sans text-[10px] leading-relaxed flex items-start gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{authError}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setOtpModeState("enter_info"); setAuthError(null); }}
                            className="py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 font-mono text-[10.5px] rounded-xl transition"
                          >
                            Go Back
                          </button>
                          <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="flex-grow py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isLoggingIn ? "Validating OTP..." : "Complete Handshake verification"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-3 text-[9px] font-mono uppercase tracking-widest text-slate-600">OR DEMO DEV LINK</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleQuickGmailLogin}
                    disabled={isLoggingIn}
                    className="w-full py-2 bg-slate-950 hover:bg-[#12141c] hover:text-indigo-400 border border-slate-850 hover:border-indigo-500/20 text-slate-400 font-mono text-[10px] uppercase rounded-xl transition duration-150 cursor-pointer"
                  >
                    Quick Sign-In with Demo Account
                  </button>

                  <button
                    type="button"
                    onClick={handleAdminOverrideLogin}
                    disabled={isLoggingIn}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 font-mono text-[10px] uppercase rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1 font-bold shadow-[0_0_8px_rgba(245,158,11,0.15)] animate-pulse"
                  >
                    🌟 Master Admin Quick Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 📡 SENTINEL OUTBOX COURIER SIMULATOR TERMINAL */}
          {((scannedLogsToShow && otpModeState === "enter_otp") || (pwCourierLog && isManagingPassword && pwModeState === "verify_otp")) && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 space-y-3 font-mono text-[10px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between border-b border-indigo-950/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                  <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">
                    📬 SENTINEL OUTBOX COURIER
                  </h4>
                </div>
                <span className="text-[8px] text-slate-500 font-mono">STATUS: SIMULATED READY</span>
              </div>

              {/* Show email format logs */}
              {((scannedLogsToShow?.type === "email") || (pwCourierLog?.type === "email")) ? (
                <div className="space-y-2 bg-[#06070c] p-3 rounded-lg border border-slate-900 leading-normal text-slate-300">
                  <div className="border-b border-slate-900/60 pb-1 text-slate-500 flex flex-col gap-0.5">
                    <div><span className="text-indigo-405 font-bold">FROM:</span> sentinel.outbox@sentric-security.net</div>
                    <div><span className="text-indigo-405 font-bold">TO:</span> {scannedLogsToShow?.target || pwCourierLog?.target}</div>
                    <div><span className="text-indigo-405 font-bold">SUBJECT:</span> {scannedLogsToShow?.subject || pwCourierLog?.subject}</div>
                  </div>
                  <div className="whitespace-pre-line text-[9.5px] leading-relaxed text-slate-400 mt-2 max-h-48 overflow-y-auto pr-1">
                    {scannedLogsToShow?.body || pwCourierLog?.body}
                  </div>
                </div>
              ) : (
                /* Show SMS format logs */
                <div className="bg-amber-950/10 border border-amber-900/20 p-3 rounded-lg flex items-start gap-2.5 text-slate-305">
                  <Phone className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-bold text-amber-400 font-mono tracking-wider">SMS TRANSMISSION MATRIX:</span>
                    <p className="text-[9.5px] leading-relaxed text-amber-300 font-sans font-medium bg-[#0f0e0c] p-2 rounded border border-amber-500/10">
                      {scannedLogsToShow?.text || pwCourierLog?.text}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-[8.5px] text-slate-500 text-center uppercase tracking-wide leading-none">
                Handshake Code extracted: <span className="text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/15 px-1.5 py-0.5 rounded leading-none select-all">{scannedLogsToShow?.code || pwCourierLog?.code}</span>
              </div>
            </div>
          )}

          <div className="bg-slate-900/10 border border-slate-805 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-slate-500" />
              Frequently Asked Billing Q's
            </h4>
            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <h5 className="font-semibold text-white text-[11.5px]">Is the free trial actually functional?</h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Yes. Your secure Gmail trial gives you exactly 3 real LLM analysis scans inside the Bodyguard sandbox, querying official Gemini servers. Once depleted, the sandbox locks until subscription activation.
                </p>
              </div>
              <div className="space-y-1">
                <h5 className="font-semibold text-white text-[11.5px]">How does currency detection operate?</h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  We query your network IP address against DNS geolocation maps. If from India or other non-US locales, we convert pricing into INR. US operators view natively in USD. You can toggle custom override at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMNS: SUBSCRIPTION PERIOD CARDS & CHECKOUT */}
        <div className="lg:col-span-2 space-y-6">

          {checkoutPlan ? (
            /* ACTIVE CHECKOUT OVERLAY PANEL */
            <div className="bg-slate-900/40 border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wide">SECURE PRE-PAID GATEWAY</h3>
                    <p className="text-[10px] text-slate-500 font-sans">Enterprise subscription: {checkoutPlan.duration}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCheckoutPlan(null)}
                  className="px-2.5 py-1 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded-lg text-[9px] font-mono uppercase cursor-pointer"
                >
                  Cancel Plan
                </button>
              </div>

              {paymentSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle className="h-8 w-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">PAYMENT ROUTING SUCCESSFUL</h4>
                    <p className="text-xs text-slate-400 font-sans max-w-sm">
                      Sentric payment node synchronized with token router block metrics. Your enterprise account has been updated to **Pre-Paid Unlimited coverage**!
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-450 uppercase animate-pulse">Node ready. Instantiating console...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Order Summary */}
                  <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-805 space-y-4 text-xs font-mono">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">ORDER BRIEF</span>
                    <div className="space-y-3">
                      <div className="flex justify-between pb-2 border-b border-slate-900 text-slate-450">
                        <span>Selected canopy:</span>
                        <strong className="text-white">{checkoutPlan.duration}</strong>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-900 text-slate-450">
                        <span>License Term:</span>
                        <span className="text-white">Continuous secure sync</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-900 text-slate-450">
                        <span>Unit Base price:</span>
                        <span className="text-white font-bold">{selectedCurrency === "INR" ? "₹" : "$"}{checkoutPlan.price}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-[13px]">
                        <span className="text-indigo-400 font-bold">DUE TODAY:</span>
                        <strong className="text-white text-base font-bold">{selectedCurrency === "INR" ? "₹" : "$"}{checkoutPlan.price}.00</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-950/15 border border-indigo-900/35 rounded-lg space-y-1 font-sans text-[10px] text-slate-400 leading-normal">
                      <div className="flex items-center gap-1 text-indigo-400 font-semibold font-mono text-[9px] uppercase tracking-wider">
                        <Lock className="h-3 w-3" />
                        SECURE AES-256 PIPELINE
                      </div>
                      Authorized for global compliance domains across US, India, and all world regions. Currency calculated dynamically via secure client IP gateway checks.
                    </div>

                    {/* Checkout Billing Address details info */}
                    <div className="pt-3 border-t border-slate-900 space-y-2 text-left font-sans">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Billing Address for this Payment</span>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Company Legal Entity:</label>
                          <input 
                            type="text"
                            required
                            value={checkoutBillingCompany}
                            onChange={(e) => setCheckoutBillingCompany(e.target.value)}
                            placeholder="e.g. Sentric Technologies Ltd"
                            className="w-full px-2.5 py-1.5 bg-[#05060b] border border-slate-800 rounded-lg font-mono text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Billing Address & Postal Code:</label>
                          <textarea 
                            required
                            value={checkoutBillingAddress}
                            onChange={(e) => setCheckoutBillingAddress(e.target.value)}
                            placeholder="e.g. Suite 402, Outer Ring Road, Noida, India"
                            rows={3}
                            className="w-full px-2.5 py-1.5 bg-[#05060b] border border-slate-800 rounded-lg font-mono text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment form / portal destination */}
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">PAYMENT DESTINATION ROUTE</span>
                    
                    {/* Interactive Tab Selectors */}
                    <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod("upi"); setCheckoutError(null); }}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-mono transition flex items-center justify-center gap-1 cursor-pointer font-semibold ${
                          paymentMethod === "upi" 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        ⚡ UPI QR Code
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod("bank"); setCheckoutError(null); }}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono transition flex items-center justify-center gap-1 cursor-pointer font-semibold ${
                          paymentMethod === "bank" 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        🏛️ Bank Details
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod("card"); setCheckoutError(null); }}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono transition flex items-center justify-center gap-1 cursor-pointer font-semibold ${
                          paymentMethod === "card" 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        💳 Card Pay
                      </button>
                    </div>

                    <form onSubmit={handleExecutePayment} className="space-y-4">
                      {paymentMethod === "upi" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            Scan the dynamically generated UPI QR code using any UPI compatible mobile application (Google Pay, PhonePe, Paytm, BHIM, SBI Yono) to transfer funds directly.
                          </p>
                          
                          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-800 w-[240px] mx-auto shadow-md">
                            <img 
                              src={computedQrCodeSrc} 
                              alt="UPI Payment QR Code" 
                              referrerPolicy="no-referrer"
                              className="w-[190px] h-[190px]"
                            />
                            <span className="text-[9.5px] font-mono text-slate-900 mt-2 font-bold tracking-wider select-all">
                              MEMBER ID: {computedUpiId}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Payee UPI ID:</span>
                              <span className="text-white font-bold select-all">{computedUpiId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Amount to pay:</span>
                              <span className="text-emerald-400 font-bold font-mono">
                                {selectedCurrency === "INR" ? "₹" : "$"}{checkoutPlan.price}.00
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Enter 12-Digit UPI Ref No / Transaction UTR:
                            </label>
                            <input 
                              type="text"
                              required
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                              placeholder="e.g. 612849102834"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-center text-indigo-400 tracking-widest placeholder-slate-700 outline-none focus:border-indigo-500/50 transition-all font-bold"
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === "bank" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            Complete an instant IMPS, NEFT, or RTGS bank transfer using your bank's official internet portal or mobile app directly to the accounts details provided below.
                          </p>

                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 text-xs font-mono">
                            <div className="flex justify-between pb-1.5 border-b border-slate-900">
                              <span className="text-slate-500">Bank Name:</span>
                              <span className="text-white font-bold">State Bank of India</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-900">
                              <span className="text-slate-500">Account Number:</span>
                              <span className="text-white font-bold select-all">40707195192</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-900">
                              <span className="text-slate-500">IFSC Code:</span>
                              <span className="text-cyan-400 font-bold select-all">SBIN0011754</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Primary Holder:</span>
                              <span className="text-white font-medium">Aryan Raj / Sentric Licensing</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Enter IMPS/NEFT Transaction Reference Code:
                            </label>
                            <input 
                              type="text"
                              required
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                              placeholder="e.g. SBIN98214028"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-center text-cyan-400 tracking-widest placeholder-slate-700 outline-none focus:border-cyan-500/50 transition-all font-bold"
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === "card" && (
                        <div className="space-y-3 font-sans animate-in fade-in duration-200">
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">Card Holder Name:</label>
                            <input 
                              type="text"
                              required
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="e.g. ARYAN RAJ"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white uppercase outline-none focus:border-cyan-500/50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">Card Number (15-16 digits):</label>
                            <input 
                              type="text"
                              required
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                              placeholder="e.g. 5412750912239081"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-cyan-500/50 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">Expiry (MM/YY):</label>
                              <input 
                                type="text"
                                required
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="e.g. 12/28"
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white text-center outline-none focus:border-cyan-500/50 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">Security CVV:</label>
                              <input 
                                type="password"
                                required
                                maxLength={3}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                placeholder="e.g. 991"
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white text-center outline-none focus:border-cyan-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {checkoutError && (
                        <div className="p-2 bg-rose-950/20 border border-rose-900/40 text-rose-450 rounded-lg text-[10px] leading-snug font-sans flex items-start gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{checkoutError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 hover:opacity-90 text-slate-950 font-mono font-bold rounded-xl text-xs uppercase tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isProcessingPayment ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Verifying routed transaction proof...
                          </>
                        ) : (
                          <>
                            <span>
                              {paymentMethod === "upi" ? "Confirm UPI Payment & Activate" : paymentMethod === "bank" ? "Confirm Bank Transfer & Activate" : `Authorize Payment: ${selectedCurrency === "INR" ? "₹" : "$"}${checkoutPlan.price}.00`}
                            </span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* PERIOD SELECTOR SUBSCRIPTIONS & DETAILED PLANS */
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <h4 className="text-base font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                    2. Select Sentric Subscription Plan
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose the coverage tier that aligns with your organizational security boundaries and audit metrics.
                  </p>
                </div>
                
                {/* Monthly/Yearly Billing Cycle Toggle */}
                <div className="flex items-center gap-4 bg-slate-950/60 p-1 border border-slate-850 rounded-xl relative">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      !isAnnual 
                        ? "bg-indigo-500/15 border border-indigo-505/20 text-indigo-400" 
                        : "text-slate-450 hover:text-white border border-transparent"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                      isAnnual 
                        ? "bg-indigo-500/15 border border-indigo-505/20 text-indigo-400" 
                        : "text-slate-450 hover:text-white border border-transparent"
                    }`}
                  >
                    Yearly
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded font-black uppercase">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* THREE COLUMN PREMIUM PRICING CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* STARTER PLAN */}
                <div className="bg-slate-900/10 border border-slate-850 hover:border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:translate-y-[-2px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded uppercase">Starter</span>
                        <h5 className="text-xs text-slate-400 font-sans mt-1.5">For small teams getting started</h5>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Base Coverage</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-mono font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {selectedCurrency === "INR" 
                            ? (isAnnual ? "₹280" : "₹350") 
                            : (isAnnual ? "$4.00" : "$5.00")}
                        </span>
                        <span className="text-xs text-slate-500 font-sans">/ month</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {isAnnual 
                          ? `Billed annually (${selectedCurrency === "INR" ? "₹3,360" : "$48.00"} / year)` 
                          : "Billed monthly"}
                      </p>
                    </div>

                    <ul className="text-[11px] text-slate-400 space-y-3 font-sans pt-4 border-t border-slate-900/60">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>AI Discovery Dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Shadow AI Detection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Basic Security Monitoring</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Basic FinOps Tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Standard Analytics</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      const isINR = selectedCurrency === "INR";
                      const term = isAnnual ? "Yearly" : "Monthly";
                      const priceVal = isINR ? (isAnnual ? 3360 : 350) : (isAnnual ? 48 : 5);
                      handleStartCheckout("active_3m", `Starter (${term})`, priceVal);
                    }}
                    className="w-full mt-6 py-2.5 bg-slate-950 hover:bg-white hover:text-black text-slate-350 font-mono text-[10px] uppercase border border-slate-850 hover:border-white rounded-xl transition duration-200 cursor-pointer text-center font-bold"
                  >
                    Select Starter Plan
                  </button>
                </div>

                {/* HISTORIC PROFESSIONAL PLAN (POPULAR) */}
                <div className="bg-slate-900/25 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group shadow-[0_0_30px_rgba(99,102,241,0.08)] hover:translate-y-[-2px]">
                  {/* Glowing popular pill */}
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono font-bold text-[8px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    Popular Plan
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">Professional</span>
                        <h5 className="text-xs text-slate-400 font-sans mt-1.5">For growing security teams</h5>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-450 font-semibold">All Features Included</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-mono font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {selectedCurrency === "INR" 
                            ? (isAnnual ? "₹520" : "₹650") 
                            : (isAnnual ? "$7.00" : "$9.00")}
                        </span>
                        <span className="text-xs text-slate-500 font-sans">/ month</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {isAnnual 
                          ? `Billed annually (${selectedCurrency === "INR" ? "₹6,240" : "$84.00"} / year)` 
                          : "Billed monthly"}
                      </p>
                    </div>

                    <ul className="text-[11px] text-slate-400 space-y-3 font-sans pt-4 border-t border-slate-900/60">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-slate-350">Everything in Starter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>PDF Report Downloads</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Advanced Analytics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Organization Insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Advanced Security Reports</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      const isINR = selectedCurrency === "INR";
                      const term = isAnnual ? "Yearly" : "Monthly";
                      const priceVal = isINR ? (isAnnual ? 6240 : 650) : (isAnnual ? 84 : 9);
                      handleStartCheckout("active_6m", `Professional (${term})`, priceVal);
                    }}
                    className="w-full mt-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:opacity-90 text-white font-mono font-bold text-[10.5px] uppercase rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-950/40 text-center"
                  >
                    Select Professional Plan
                  </button>
                </div>

                {/* ENTERPRISE PLAN (Solid luxury gradient) */}
                <div className="bg-gradient-to-b from-slate-900/30 to-purple-950/10 border border-purple-500/30 hover:border-purple-400/50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:translate-y-[-2px] shadow-[0_0_40px_rgba(168,85,247,0.06)]">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white font-mono font-bold text-[8px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                    POWERFUL OPTION
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded uppercase">Enterprise</span>
                        <h5 className="text-xs text-slate-400 font-sans mt-1.5">For scale governance & analytics</h5>
                      </div>
                      <span className="text-[10px] font-mono text-purple-350">Ultimate Suite</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-mono font-bold text-white group-hover:text-purple-400 transition-colors">
                          {selectedCurrency === "INR" 
                            ? (isAnnual ? "₹1000" : "₹1250") 
                            : (isAnnual ? "$13.00" : "$17.00")}
                        </span>
                        <span className="text-xs text-slate-500 font-sans">/ month</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {isAnnual 
                          ? `Billed annually (${selectedCurrency === "INR" ? "₹12,000" : "$156.00"} / year)` 
                          : "Billed monthly"}
                      </p>
                    </div>

                    <ul className="text-[11px] text-slate-400 space-y-3 font-sans pt-4 border-t border-purple-950/40">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-purple-400 shrink-0" />
                        <span className="font-semibold text-slate-350">Everything in Professional</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Audio Report Generation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Voice Summaries & Premium Insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Enterprise Governance Rules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Priority Processing & Advanced Reports</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      const isINR = selectedCurrency === "INR";
                      const term = isAnnual ? "Yearly" : "Monthly";
                      const priceVal = isINR ? (isAnnual ? 12000 : 1250) : (isAnnual ? 156 : 17);
                      handleStartCheckout("active_1y", `Enterprise (${term})`, priceVal);
                    }}
                    className="w-full mt-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-mono font-bold text-[10.5px] uppercase rounded-xl transition duration-200 cursor-pointer text-center"
                  >
                    Select Enterprise Plan
                  </button>
                </div>

              </div>

              {/* DETAILED SaaS PLAN FEATURE COMPARISON TABLE */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden pt-6">
                <div className="px-6 pb-6 border-b border-white/5">
                  <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-400" />
                    Complete Feature Comparison Checklist
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Dive into our comprehensive capability matrices to identify the best plan fit for your organization.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-slate-900/30 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                        <th className="py-4 px-6 font-semibold">Tuned security capabilities</th>
                        <th className="py-2.5 px-6 font-semibold text-center w-36">Starter</th>
                        <th className="py-2.5 px-6 font-semibold text-center w-36 text-indigo-400 bg-indigo-505/[0.02]">Professional</th>
                        <th className="py-2.5 px-6 font-semibold text-center w-36 text-purple-400">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-sans">
                      {[
                        { name: "AI Discovery Dashboard", starter: true, pro: true, enterprise: true, cat: "Analytics" },
                        { name: "Shadow AI Detection", starter: true, pro: true, enterprise: true, cat: "Security" },
                        { name: "Basic Security Monitoring", starter: true, pro: true, enterprise: true, cat: "Security" },
                        { name: "Basic FinOps Tracking", starter: true, pro: true, enterprise: true, cat: "FinOps" },
                        { name: "Standard Analytics", starter: true, pro: true, enterprise: true, cat: "Analytics" },
                        { name: "PDF Report Downloads", starter: false, pro: true, enterprise: true, cat: "Reporting" },
                        { name: "Advanced Analytics", starter: false, pro: true, enterprise: true, cat: "Analytics" },
                        { name: "Organization Insights", starter: false, pro: true, enterprise: true, cat: "Analytics" },
                        { name: "Advanced Security Reports", starter: false, pro: true, enterprise: true, cat: "Security" },
                        { name: "Audio Report Generation", starter: false, pro: false, enterprise: true, cat: "Auditory AI" },
                        { name: "Voice Summaries", starter: false, pro: false, enterprise: true, cat: "Auditory AI" },
                        { name: "Premium AI Insights", starter: false, pro: false, enterprise: true, cat: "Auditory AI" },
                        { name: "Enterprise Governance Features", starter: false, pro: false, enterprise: true, cat: "Governance" },
                        { name: "Priority Processing", starter: false, pro: false, enterprise: true, cat: "Performance" },
                        { name: "Advanced Reporting", starter: false, pro: false, enterprise: true, cat: "Reporting" },
                        { name: "Future Enterprise Features", starter: false, pro: false, enterprise: true, cat: "Governance" }
                      ].map((feat, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/10 transition-colors select-none">
                          <td className="py-3 px-6 font-medium text-slate-200">
                            <div className="flex items-center gap-2">
                              <span>{feat.name}</span>
                              <span className="text-[8px] opacity-40 font-mono tracking-widest uppercase bg-slate-900 border border-slate-850 px-1 py-0.2 rounded">
                                {feat.cat}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-center">
                            {feat.starter ? (
                              <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                                <Check className="h-3 w-3" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-950 text-slate-600 border border-slate-800">
                                <span className="text-[9px] font-bold">✗</span>
                              </div>
                            )}
                          </td>
                          {/* Highlight column */}
                          <td className="py-3 px-6 text-center bg-indigo-505/[0.02]">
                            {feat.pro ? (
                              <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Check className="h-3 w-3" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-950 text-slate-600 border border-slate-800">
                                <span className="text-[9px] font-bold">✗</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-6 text-center">
                            {feat.enterprise ? (
                              <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <Check className="h-3 w-3" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-950 text-slate-600 border border-slate-800">
                                <span className="text-[9px] font-bold">✗</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4.5 bg-slate-900/40 text-center text-[11px] text-slate-400 font-sans border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 justify-center">
                    <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    Our system geo-detects tax components and dynamically formats localized currencies.
                  </span>
                  <div className="flex gap-4">
                    <span className="text-slate-350">Individuals: <strong>Starter</strong></span>
                    <span className="text-slate-350">Teams: <strong>Professional</strong></span>
                    <span className="text-slate-350">Enterprise Strategy: <strong>Enterprise</strong></span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* CORPORATE BILLING ADDRESS MANAGER */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <h4 className="text-sm font-mono font-bold tracking-wide text-white uppercase border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-indigo-400" />
                💼 Corporate Billing Address Manager
              </span>
              <span className="text-[9.5px] text-indigo-450 lowercase font-normal">Registered Commercial Entity Details</span>
            </h4>

            {isEditingAddress ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-slate-450 leading-relaxed font-sans">
                  Configure corporate licensing metadata printed on all downstream security receipts. Changing this dynamically updates current compliance invoice models.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Company Legal Entity:</label>
                    <input 
                      type="text"
                      value={tempCompany}
                      onChange={(e) => setTempCompany(e.target.value)}
                      placeholder="e.g. Sentric India Technologies Ltd"
                      className="w-full px-3 py-2 bg-[#05060b] border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-750 outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Billing Phone Node:</label>
                    <input 
                      type="text"
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      placeholder="e.g. +91 98209 88164"
                      className="w-full px-3 py-2 bg-[#05060b] border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-750 outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Registered Billing Address (Street, State, Country & Pin Code):</label>
                  <textarea 
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="e.g. Sector 18, Block B-42, Noida, Uttar Pradesh, 201301, India"
                    rows={3}
                    className="w-full px-3 py-2 bg-[#05060b] border border-slate-800 rounded-xl font-mono text-xs text-white placeholder-slate-755 outline-none focus:border-indigo-500/50 transition-all resize-none leading-relaxed"
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-3.5 py-1.5 bg-slate-950 hover:bg-[#121214] border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-550 text-white rounded-lg text-xs font-mono transition font-semibold focus:outline-none"
                  >
                    Save & Update Node
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8 space-y-2 text-xs font-mono leading-relaxed">
                    <div className="flex flex-col">
                      <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Business Entity Name</span>
                      <strong className="text-white text-sm font-bold tracking-tight">{billingCompany}</strong>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Registered Billing Address</span>
                      <span className="text-slate-300 leading-snug">{billingAddress}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Billing Contact Support</span>
                      <span className="text-indigo-400 font-bold">{billingPhone}</span>
                    </div>
                  </div>
                  <div className="md:col-span-4 flex md:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setTempCompany(billingCompany);
                        setTempAddress(billingAddress);
                        setTempPhone(billingPhone);
                        setIsEditingAddress(true);
                      }}
                      className="px-4 py-2 bg-slate-950 hover:bg-[#12141d] hover:text-white text-slate-355 hover:border-indigo-500/40 rounded-xl text-xs font-mono border border-slate-850 transition duration-150 cursor-pointer flex items-center gap-1.5"
                    >
                      <Globe className="h-3.5 w-3.5 text-indigo-400 animate-spin duration-[20s]" />
                      Edit Saved Address
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INVOICES AND RECEIPTS LIST */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <h4 className="text-sm font-mono font-bold tracking-wide text-white uppercase border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-slate-400" />
                3. Audit Invoice Logs (Secure Nodes)
              </span>
              <span className="text-[9.5px] text-slate-500 lowercase font-normal">Encrypted invoices cataloged successfully</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-550 font-mono text-[9px] uppercase tracking-wider">
                    <th className="pb-2.5 font-normal">Invoice Reference</th>
                    <th className="pb-2.5 font-normal">Billing Date</th>
                    <th className="pb-2.5 font-normal">Subscribed Canopy</th>
                    <th className="pb-2.5 font-normal text-right">Amount Paid</th>
                    <th className="pb-2.5 font-normal text-center w-24">Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-slate-300">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-950/20 transition-all leading-relaxed">
                      <td className="py-3 text-white font-bold">{inv.id}</td>
                      <td className="py-3 text-slate-450">{inv.date}</td>
                      <td className="py-3 text-slate-350">{inv.planName}</td>
                      <td className="py-3 text-right text-emerald-450 font-bold">{inv.amount}</td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => {
                            setSelectedInvoice({
                              id: inv.id,
                              date: inv.date,
                              planName: inv.planName,
                              amount: inv.amount,
                              status: inv.status,
                              companyName: inv.companyName || billingCompany,
                              address: inv.address || billingAddress
                            });
                          }}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded text-[9.5px] cursor-pointer font-bold"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Invoice Receipt Detail Modal Overlay */}
          {selectedInvoice && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-[#0c0e17] border border-indigo-500/35 rounded-2xl max-w-lg w-full p-6 relative overflow-hidden space-y-5 animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 right-1/4 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none"></div>

                {/* Receipt Brand Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-[#05060b] border border-indigo-500/30 flex items-center justify-center">
                      <span className="text-[10px] font-black font-mono text-indigo-400">SNT</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider leading-none">SENTRIC TECHNOLOGIES INC</h4>
                      <span className="text-[8.5px] text-slate-500 font-mono tracking-widest mt-1 block">OFFICIAL COMMERCIAL RECEIPT</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded">
                    {selectedInvoice.id}
                  </span>
                </div>

                {/* Receipt Summary Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Transaction Date</span>
                    <strong className="text-white font-medium">{selectedInvoice.date}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Payment Status</span>
                    <span className="text-emerald-450 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      SUCCESS / PAID
                    </span>
                  </div>
                </div>

                {/* Client billing address panel */}
                <div className="bg-[#05060b] border border-slate-850 p-4 rounded-xl space-y-2 text-xs font-mono leading-relaxed">
                  <div className="flex flex-col">
                    <span className="text-[9.5px] text-slate-500 uppercase tracking-widest block font-bold mb-0.5">Billed To (Company Entity)</span>
                    <strong className="text-white font-bold">{selectedInvoice.companyName}</strong>
                  </div>
                  <div className="flex flex-col border-t border-slate-900 pt-2 mt-1.5">
                    <span className="text-[9.5px] text-slate-500 uppercase tracking-widest block mb-0.5">Verified Billing Address</span>
                    <span className="text-slate-300 leading-snug">{selectedInvoice.address}</span>
                  </div>
                </div>

                {/* Itemized transaction ledger details */}
                <div className="space-y-2 text-xs font-mono">
                  <span className="text-[9.5px] text-slate-500 uppercase block font-mono font-bold">Itemized Ledger Receipts</span>
                  <div className="border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-slate-950/20">
                      <div className="space-y-0.5">
                        <span className="text-white font-medium block">{selectedInvoice.planName}</span>
                        <span className="text-[9px] text-slate-500">Secure Node Sync Protocol v1.4</span>
                      </div>
                      <strong className="text-white text-sm font-black">{selectedInvoice.amount}</strong>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-950/45 text-[11px] text-[#aa80ff] font-bold">
                      <span>Pre-Paid Subscription Credits</span>
                      <span className="text-indigo-400 font-bold">100% UTILITY SECURED</span>
                    </div>
                  </div>
                </div>

                {/* Regulatory footer */}
                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1 text-[9.5px] font-mono text-slate-500 leading-normal text-center">
                  Licensed corporate cloud firewall ledger. Authorized globally. Verified via secure UPI QR / SBI bank transaction routers.
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold rounded-xl text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
