import React from "react";

const TestCard = ({ test, onStart }) => {
  const difficultyClass = {
    Easy: "text-green-400 bg-green-400/10 border-green-400/20",
    Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Hard: "text-red-400 bg-red-400/10 border-red-400/20",
    Mixed: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-cyan-500/10">
      
      {/* Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/20" />

      <div className="relative z-10">
        
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                {test.category}
              </span>

              <span
                className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                  difficultyClass[test.difficulty] ||
                  difficultyClass.Mixed
                }`}
              >
                {test.difficulty}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {test.title}
            </h3>
          </div>

          <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">
              {test.totalMarks}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Marks
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-6 min-h-[48px] text-sm leading-6 text-slate-400">
          {test.description || "Test your knowledge with a real-time mock exam."}
        </p>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
            <div className="mb-1 text-lg">📝</div>
            <p className="text-sm font-semibold text-white">
              {test.totalQuestions}
            </p>
            <p className="text-xs text-slate-500">
              Questions
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
            <div className="mb-1 text-lg">⏱️</div>
            <p className="text-sm font-semibold text-white">
              {test.durationMinutes}
            </p>
            <p className="text-xs text-slate-500">
              Minutes
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
            <div className="mb-1 text-lg">🎯</div>
            <p className="text-sm font-semibold text-white">
              {test.passingMarks}
            </p>
            <p className="text-xs text-slate-500">
              Pass Marks
            </p>
          </div>
        </div>

        {/* Question types */}
        {test.questionTypes?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {test.questionTypes.map((type) => (
              <span
                key={type}
                className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-400"
              >
                {type.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        )}

        {/* Start */}
        <button
          type="button"
          onClick={() => onStart(test)}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/30 active:scale-[0.98]"
        >
          Start Test
          <span className="ml-2 transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
};

export default TestCard;