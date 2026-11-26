import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "@/api/client";
import { Button, card } from "@/components/list-ui";

type Step = "email" | "code" | "done";

const fieldBox = {
  height: 54,
  borderWidth: 1,
  borderColor: "#DBE3F0",
  borderRadius: 14,
  backgroundColor: "#F8FAFC",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  marginBottom: 12,
} as const;

const title = {
  fontSize: 20,
  fontWeight: "800",
  color: "#0F172A",
  textAlign: "center",
} as const;

const subtitle = {
  fontSize: 14,
  color: "#64748B",
  textAlign: "center",
  lineHeight: 20,
  marginTop: 8,
  marginBottom: 20,
} as const;

// Reset flow without links: we email a one-time code, the student types it here together with a
// new password. No deep links or redirect URLs are involved, so it works the same in Expo Go,
// dev builds and release APKs.
export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds until another email is allowed
  // The code can only be used once. If saving the password fails after the code was accepted,
  // we remember that so a retry doesn't send the (now used) code again.
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async () => {
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed))
      return setError("Enter a valid email address.");
    setError("");
    setLoading(true);
    const { error: e } = await supabase.auth.resetPasswordForEmail(trimmed);
    setLoading(false);
    if (e) {
      // "For security purposes, you can only request this after 49 seconds." -> count it down
      const wait = /after (\d+) second/i.exec(e.message);
      if (wait) return setCooldown(Number(wait[1]));
      return setError(e.message);
    }
    setVerified(false);
    setCode("");
    setCooldown(60);
    setStep("code");
  };

  const saveNewPassword = async () => {
    const token = code.replace(/\s/g, "");
    if (!verified && !/^\d{6,10}$/.test(token))
      return setError("Enter the code from your email.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setError("");
    setLoading(true);

    if (!verified) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "recovery",
      });
      if (verifyError) {
        setLoading(false);
        return setError(
          /expired|invalid/i.test(verifyError.message)
            ? "That code is wrong or has expired. Request a new one."
            : verifyError.message,
        );
      }
      setVerified(true);
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      return setError(
        /different from the old/i.test(updateError.message)
          ? "Choose a password you haven't used before."
          : updateError.message,
      );
    }
    Keyboard.dismiss(); // otherwise the keyboard can stay open and cover the button below
    setStep("done");
  };

  // Verifying the code starts a session, so end it and send the student to sign in normally.
  // We leave the screen first and end the session in the background, so a slow or failed
  // sign-out request can never keep the student stuck here.
  const toSignIn = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/login");
    void supabase.auth.signOut({ scope: "local" });
  };

  const icon =
    step === "done"
      ? "checkmark-circle-outline"
      : step === "code"
        ? "mail-open-outline"
        : "lock-closed-outline";

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          justifyContent: "center",
        }}
      >
        <View style={{ ...card, padding: 24 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: "#EFF6FF",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
              alignSelf: "center",
            }}
          >
            <Ionicons name={icon} size={30} color="#2563EB" />
          </View>

          {step === "email" && (
            <>
              <Text style={title}>Forgot your password?</Text>
              <Text style={subtitle}>
                Enter your email and we'll send you a code to reset it.
              </Text>
              <View style={fieldBox}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
                />
              </View>
              {cooldown > 0 ? (
                <Text style={warnText}>
                  For security, you can request another code in {cooldown}s.
                </Text>
              ) : error ? (
                <Text style={errorText}>{error}</Text>
              ) : null}
              <Button
                label={cooldown > 0 ? `Try again in ${cooldown}s` : "Send code"}
                onPress={sendCode}
                loading={loading}
                disabled={cooldown > 0}
              />
              <BackLink onPress={toSignIn} />
            </>
          )}

          {step === "code" && (
            <>
              <Text style={title}>Enter your code</Text>
              <Text style={subtitle}>
                If an account exists for {email.trim()}, we sent a code to it.
                Enter the code and choose a new password.
              </Text>
              <View style={fieldBox}>
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^\d]/g, ""))}
                  placeholder="Code from your email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!verified}
                  style={{
                    flex: 1,
                    fontSize: 18,
                    letterSpacing: 4,
                    color: "#0F172A",
                  }}
                />
              </View>
              <View style={fieldBox}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password (8+ characters)"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
                />
                <TouchableOpacity onPress={() => setShow(!show)}>
                  <Text
                    style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}
                  >
                    {show ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={fieldBox}>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  style={{ flex: 1, fontSize: 15, color: "#0F172A" }}
                />
              </View>
              {error ? <Text style={errorText}>{error}</Text> : null}
              <Button
                label="Save new password"
                onPress={saveNewPassword}
                loading={loading}
              />
              <TouchableOpacity
                onPress={sendCode}
                disabled={cooldown > 0 || loading || verified}
                style={{ alignSelf: "center", marginTop: 16 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: cooldown > 0 || verified ? "#94A3B8" : "#2563EB",
                  }}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </Text>
              </TouchableOpacity>
              <BackLink onPress={toSignIn} />
            </>
          )}

          {step === "done" && (
            <>
              <Text style={title}>Password updated</Text>
              <Text style={subtitle}>
                You can now sign in with your new password.
              </Text>
              <Button label="Go to sign in" onPress={toSignIn} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ alignSelf: "center", marginTop: 16, padding: 4 }}
    >
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>
        Back to sign in
      </Text>
    </TouchableOpacity>
  );
}

const errorText = {
  color: "#B91C1C",
  fontSize: 13,
  fontWeight: "600",
  marginBottom: 12,
  textAlign: "center",
} as const;

const warnText = {
  color: "#B45309",
  fontSize: 13,
  fontWeight: "600",
  marginBottom: 12,
  textAlign: "center",
} as const;
