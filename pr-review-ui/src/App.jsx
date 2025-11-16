import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, AlertCircle, FileText } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ---------------------------------------
   Severity Badge Component
---------------------------------------- */
const SeverityBadge = ({ level }) => {
  const map = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
    warning: "bg-orange-100 text-orange-800",
    minor: "bg-blue-100 text-blue-800",
    info: "bg-sky-100 text-sky-800",
  };

  const cls = map[level?.toLowerCase()] || map.info;

  return <Badge className={`px-2 py-1 text-xs ${cls}`}>{level || "Info"}</Badge>;
};

/* ---------------------------------------
   Main Component
---------------------------------------- */
export default function PRReviewUI() {
  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [exampleOpen, setExampleOpen] = useState(false);

  /* ---------------------------------------
     Submit PR for Review
  ---------------------------------------- */
  const submit = async () => {
    setError(null);
    setResults(null);

    if (!prUrl || !prUrl.includes("github.com")) {
      setError("Please enter a valid GitHub PR URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://github-pr-review.onrender.com/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pr_url: prUrl }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error((payload && payload.detail) || "Server error");
      }

      let data = await res.json();

      // Backend returns pure JSON array already
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          data = [];
        }
      }

      setResults(data);
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPrUrl("");
    setResults(null);
    setError(null);
  };

  /* ---------------------------------------
     Group Results: by file → line
  ---------------------------------------- */
  const groupResults = (results) => {
    if (!Array.isArray(results)) return {};

    const grouped = {};

    for (const r of results) {
      if (!grouped[r.file]) grouped[r.file] = {};
      if (!grouped[r.file][r.line]) grouped[r.file][r.line] = [];

      // Deduplicate exact entries
      const exists = grouped[r.file][r.line].some(
        (x) =>
          x.comment === r.comment &&
          x.suggestion === r.suggestion &&
          x.severity === r.severity
      );

      if (!exists) grouped[r.file][r.line].push(r);
    }

    return grouped;
  };

  const grouped = results ? groupResults(results) : {};

  /* ---------------------------------------
     RENDER
  ---------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-start justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                PR Review — Automated
              </h1>
              <p className="text-slate-600 mt-1">
                Paste a GitHub Pull Request URL to run a multi-agent code
                review.
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <Button variant="ghost" onClick={() => setExampleOpen((s) => !s)}>
                <RefreshCw className="mr-2" size={16} />
                Examples
              </Button>
              <Button asChild>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2"
                >
                  <FileText size={16} />
                  Docs
                </a>
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Input Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Start a Review</CardTitle>
            <CardDescription>
              Enter the PR URL and hit Review — results appear below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="md:col-span-2"
              />

              <div className="flex gap-2">
                <Button
                  onClick={submit}
                  className="flex-1 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                  ) : (
                    <Search className="mr-2" size={16} />
                  )}
                  Review
                </Button>

                <Button variant="outline" onClick={clear}>
                  Clear
                </Button>
              </div>
            </div>

            {exampleOpen && (
              <div className="mt-4 bg-slate-50 p-4 rounded">
                <strong>Example PRs</strong>
                <ul className="list-disc ml-5 mt-2 text-sm text-slate-700">
                  <li>https://github.com/octocat/Hello-World/pull/1</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Results */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Review Results</CardTitle>
            <CardDescription>
              Aggregated suggestions from multiple specialist agents.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!results && (
              <div className="text-center py-16 text-slate-400">
                No results yet — run a review to see issues.
              </div>
            )}

            {results && Object.keys(grouped).length === 0 && (
              <div className="text-center py-16">No issues found 🎉</div>
            )}

            {results && Object.keys(grouped).length > 0 && (
              <div className="space-y-6">
                {Object.entries(grouped).map(([file, lines]) => (
                  <Card key={file} className="p-4 border shadow-sm">
                    <h2 className="text-lg font-bold text-slate-700 mb-2">
                      {file}
                    </h2>
                    <Separator className="mb-4" />

                    {Object.entries(lines).map(([line, comments]) => (
                      <div
                        key={line}
                        className="mb-4 p-3 rounded-lg bg-slate-50 border"
                      >
                        <div className="font-semibold text-slate-800 mb-2">
                          Line {line}
                        </div>

                        <div className="space-y-3 ml-2">
                          {comments.map((c, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white border rounded shadow-sm"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <SeverityBadge level={c.severity} />
                                <span className="text-xs text-slate-500">
                                  {c.category || "General"}
                                </span>
                              </div>

                              <div className="text-slate-700 text-sm">
                                {c.comment}
                              </div>

                              {c.suggestion && (
                                <div className="mt-1 text-slate-600 italic text-xs">
                                  Suggestion: {c.suggestion}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Buttons */}
        <div className="mt-4 flex gap-3">
          <Button variant="ghost" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigator.clipboard.writeText(
                JSON.stringify(results || [], null, 2)
              )
            }
          >
            Copy JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
