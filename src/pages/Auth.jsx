import { useState } from "react";
import { Button, Field, Input, Logo, material } from "../shared";

function Auth({ navigate, setSession }) {
  const [signup, setSignup] = useState(
    window.location.pathname.endsWith("signup"),
  );
  const [form, setForm] = useState({
    email: "admin@mypg.com",
    password: "demo1234",
    pgName: "",
  });
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!form.email.includes("@") || form.password.length < 8)
      return setError(
        "Enter a valid email and a password of at least 8 characters.",
      );
    setSession(
      { email: form.email, role: "admin" },
      signup ? { email: form.email, pgName: form.pgName || "My PG" } : null,
    );
    navigate("/dashboard");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center">
          <div className="mb-5 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold">
            {signup ? "Create your workspace" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-[#575757]">
            {signup
              ? "Set up your PG management workspace."
              : "Sign in to manage your property."}
          </p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-[#e6e6e6] p-6 sm:p-8"
        >
          <Field label="Email address" required>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </Field>
          {signup && (
            <Field label="PG name" required>
              <Input
                required
                value={form.pgName}
                onChange={(e) => setForm({ ...form, pgName: e.target.value })}
                placeholder="e.g. Green Park PG"
              />
            </Field>
          )}
          <Field label="Password" required>
            <Input
              type="password"
              minLength="8"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {!signup && (
              <span className="block text-xs text-[#575757]">
                Demo account is prefilled. Use any password with 8+ characters.
              </span>
            )}
          </Field>
          {error && (
            <div
              aria-live="polite"
              className="rounded-lg bg-[#fef2f2] p-3 text-sm text-[#b91c1c]"
            >
              {material("error", "mr-2 align-middle")}
              {error}
            </div>
          )}
          <Button type="submit" className="w-full">
            {signup ? "Create account" : "Log in"}
            {material("arrow_forward")}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[#575757]">
          {signup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setSignup(!signup);
              setError("");
              navigate(signup ? "/auth" : "/auth/signup");
            }}
            className="focusable font-bold text-[#7c360b]"
          >
            {signup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}


export default Auth;
