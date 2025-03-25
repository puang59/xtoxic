"use client";
import { useState } from "react";
import { analyzeToxicity } from "./actions/analyzeTweets";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";

type AnalysisResult = {
  toxicityLevel: number;
  categories: {
    hateSpeech: number;
    harassment: number;
    profanity: number;
    misinformation: number;
  };
  toxicTweets: string[];
  explanation: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
} & {
  cached: boolean;
  isError: boolean;
};

export default function AnalyzeToxicityPage() {
  const [username, setUsername] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleExceed = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("xtoxic is currently unavailable due to exceeded API credits.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const cleanUsername = username.trim().replace(/^@/, "");
      if (!cleanUsername) {
        throw new Error("Please enter a valid Twitter username");
      }
      const analysisResult = await analyzeToxicity(cleanUsername);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to analyze toxicity. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getToxicityColor = (level: number) => {
    if (level < 20) return "#0ea5e9";
    if (level < 40) return "#2563eb";
    if (level < 60) return "#1d4ed8";
    if (level < 80) return "#1e40af";
    return "#312e81";
  };

  const getToxicityDescription = (level: number) => {
    if (level < 20) return "Low toxicity - Generally respectful communication";
    if (level < 40) return "Mild toxicity - Occasionally problematic content";
    if (level < 60) return "Moderate toxicity - Potentially concerning content";
    if (level < 80) return "High toxicity - Significantly harmful content";
    return "Extreme toxicity - Very harmful and problematic content";
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <ParticleBackground />

      {/* New layout structure */}
      <div className="relative z-10 min-h-screen">
        {/* Header - Now centered at the top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 pb-6 text-center"
        >
          <h1 className="text-7xl font-black tracking-tighter inline-block">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
              xtoxic
            </span>
          </h1>
          <p className="text-blue-200 text-lg font-light mt-2">
            measuring the toxicity in your digital footprint
          </p>
        </motion.div>

        {/* Main content - Centered with max width */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.1)]"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-10 pr-4 py-4 bg-black/40 border border-blue-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-300"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 30px rgba(59,130,246,0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                disabled={isAnalyzing || !username.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Analyzing...
                  </span>
                ) : (
                  "Analyze"
                )}
              </motion.button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-blue-300 text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Card - Now appears below input */}
          <AnimatePresence>
            {result && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.1)]"
              >
                <div className="space-y-6">
                  {/* Toxicity Score Circle */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative w-32 h-32 mb-4"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-4xl font-black"
                          style={{
                            color: getToxicityColor(result.toxicityLevel),
                          }}
                        >
                          {result.toxicityLevel}
                        </span>
                      </div>
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="60"
                          className="stroke-black/40 fill-none"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="60"
                          className="fill-none"
                          strokeWidth="8"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: result.toxicityLevel / 100 }}
                          style={{
                            stroke: getToxicityColor(result.toxicityLevel),
                          }}
                        />
                      </svg>
                    </motion.div>
                    <h2 className="text-xl font-semibold text-blue-200 text-center">
                      Toxicity Score
                    </h2>
                  </div>

                  <p className="text-blue-200 text-center">
                    {getToxicityDescription(result.toxicityLevel)}
                  </p>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-blue-200 leading-relaxed text-center">
                      {result.explanation.split("\n")[0]}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - Stays at bottom */}
        <footer className="fixed bottom-0 left-0 w-full py-4 text-center text-blue-300/60 text-sm bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/puang59/xtoxic"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
