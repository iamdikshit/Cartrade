"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validation";
import { Eye, EyeOff, Loader2, Car, Shield, AlertTriangle } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuthData, user, ready } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (ready && user) {
      router.replace("/admin/dashboard");
    }
  }, [ready, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Login failed");
        return;
      }

      // Set auth state IN CONTEXT first, then navigate
      // This ensures the layout sees user before it renders
      setAuthData(result.user, result.accessToken);

      toast.success(`Welcome back, ${result.user.name}!`);

      if (result.user.mustChangePassword) {
        router.push("/admin/change-password");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Network error. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="absolute top-20 right-20 w-80 h-80 bg-brand-600 rounded-full filter blur-3xl opacity-10" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-brand-400 rounded-full filter blur-3xl opacity-10" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gradient rounded-2xl shadow-xl mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-800 text-white">
            Car<span style={{ color: "#f97316" }}>Trade</span>
          </h1>
          <p className="text-dark-400 mt-1 text-sm">Admin Portal</p>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-brand-400" />
            <h2 className="font-display text-xl font-700 text-white">
              Secure Login
            </h2>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-5">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="admin@cartrade.com"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-dark-300 text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-gradient text-white py-3.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-dark-700">
            <p className="text-dark-500 text-xs text-center">
              Secure admin area. All access is logged and monitored.
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <a
            href="/"
            className="text-dark-500 hover:text-dark-300 text-sm transition-colors"
          >
            ← Back to public site
          </a>
        </p>
      </div>
    </div>
  );
}
