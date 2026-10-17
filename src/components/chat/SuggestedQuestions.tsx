interface SuggestedQuestionsProps {
  label: string;
  questions: readonly string[];
  onPick: (question: string) => void;
}

/** Starter questions under the greeting (PLAN.md §6.1). Picking one sends it straight away. */
export function SuggestedQuestions({ label, questions, onPick }: SuggestedQuestionsProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onPick(question)}
          className="min-h-9 rounded-full border border-primary/30 bg-primary-soft px-3.5 text-small text-primary transition-colors hover:border-primary hover:bg-surface motion-reduce:transition-none"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
