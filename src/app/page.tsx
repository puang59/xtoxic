"use client";
import { useState } from "react";
import { analyzeToxicity } from "./actions/analyzeTweets";

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
    if (level < 20) return "#22c55e";
    if (level < 40) return "#eab308";
    if (level < 60) return "#f97316";
    if (level < 80) return "#ef4444";
    return "#a855f7";
  };

  const getToxicityDescription = (level: number) => {
    if (level < 20) return "Low toxicity - Generally respectful communication";
    if (level < 40) return "Mild toxicity - Occasionally problematic content";
    if (level < 60) return "Moderate toxicity - Potentially concerning content";
    if (level < 80) return "High toxicity - Significantly harmful content";
    return "Extreme toxicity - Very harmful and problematic content";
  };

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <div className="flex-grow flex flex-col items-center justify-center py-8">
        <div className="max-w-md w-full mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
            xtoxic
          </h1>
          <p className="text-sm text-gray-500 font-medium mb-8 text-center">
            because your x feed is a dumpster fire
          </p>

          <form onSubmit={handleExceed} className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full pl-8 pr-3 py-3 border-0 bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing || !username.trim()}
                className="px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
          </form>

          {isAnalyzing && (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-sm">
                  Analyzing tweets...
                </p>
              </div>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-medium text-gray-600">
                    Toxicity Level
                  </h2>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getToxicityColor(
                        result.toxicityLevel
                      )}20`,
                      color: getToxicityColor(result.toxicityLevel),
                    }}
                  >
                    {result.toxicityLevel}/100
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${result.toxicityLevel}%`,
                      backgroundColor: getToxicityColor(result.toxicityLevel),
                    }}
                  ></div>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  {getToxicityDescription(result.toxicityLevel)}
                </p>
              </div>

              <div className="text-sm text-gray-600 border-t border-gray-200 pt-4">
                <p className="leading-relaxed">
                  {result.explanation.split("\n")[0]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full py-4 mt-auto border-t border-gray-100">
        <div className="max-w-md mx-auto text-center text-xs text-gray-400">
          <p>
            <span className="flex items-center justify-center gap-1">
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <a
                href="https://github.com/puang59/xtoxic"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-500 transition-colors"
              >
                github.com/xtoxic
              </a>
              {" • "}
              <a
                href="https://twitter.com/kovis0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-500 transition-colors"
              >
                @kovis0
              </a>
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
