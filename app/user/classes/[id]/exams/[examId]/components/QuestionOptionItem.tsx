interface QuestionOptionItemProps {
  name: string;
  label: string;
  optionText: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const optionRootBaseClass =
  "flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150";
const optionRootSelectedClass = "border-indigo-500 bg-indigo-50/70";
const optionRootUnselectedClass =
  "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80";
const letterBaseClass =
  "shrink-0 w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all";
const letterSelectedClass = "bg-indigo-600 text-white";
const letterUnselectedClass = "bg-slate-100 text-slate-500";
const textClass = "pt-1.5 leading-relaxed font-medium";
const textSelectedClass = "text-slate-900";
const textUnselectedClass = "text-slate-600";

export function QuestionOptionItem({
  name,
  label,
  optionText,
  selected,
  disabled,
  onSelect,
}: QuestionOptionItemProps) {
  return (
    <label
      className={`${optionRootBaseClass} ${
        selected ? optionRootSelectedClass : optionRootUnselectedClass
      }`}
    >
      <input
        className="hidden"
        type="radio"
        name={name}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
      />
      <span
        className={`${letterBaseClass} ${
          selected ? letterSelectedClass : letterUnselectedClass
        }`}
      >
        {label}
      </span>
      <span
        className={`${textClass} ${
          selected ? textSelectedClass : textUnselectedClass
        }`}
      >
        {optionText}
      </span>
    </label>
  );
}
