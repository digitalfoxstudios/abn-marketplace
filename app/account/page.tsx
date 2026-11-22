"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not connected yet. Configure the project URL and public key in your hosting environment variables.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (authError) throw authError;
        setMessage(
          data.session
            ? "Your ABN account has been created. You are signed in."
            : "Account created. Please check your email for the confirmation link before signing in."
        );
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        setMessage("You are signed in to ABN Marketplace.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-panel">
        <a href="/" className="account-back">← Back to ABN Marketplace</a>
        <div className="account-brand"><span className="brand-mark">ABN</span></div>
        <span className="eyebrow">YOUR ABN ACCOUNT</span>
        <h1>{mode === "signup" ? "Join the network." : "Welcome back."}</h1>
        <p className="account-intro">
          {mode === "signup"
            ? "Create one account to connect with ABN Store, ABN Business and ABN Daily Needs."
            : "Sign in to continue to ABN Marketplace."}
        </p>

        <div className="account-tabs" role="group" aria-label="Account action">
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); setError(""); }}>Create account</button>
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); setError(""); }}>Sign in</button>
        </div>

        <form className="account-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Full name
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required maxLength={100} placeholder="Your full name" />
            </label>
          )}
          <label>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} placeholder="At least 8 characters" />
          </label>
          <button className="button button-primary account-submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create my ABN account" : "Sign in"}
          </button>
        </form>

        {message && <p className="account-message" role="status">{message}</p>}
        {error && <p className="account-error" role="alert">{error}</p>}
        <p className="account-footnote">By creating an account, you agree to use ABN Marketplace responsibly. Additional terms and privacy information will be added before public launch.</p>
      </section>
    </main>
  );
}
