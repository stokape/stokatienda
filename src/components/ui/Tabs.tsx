export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="tablist" className="flex gap-2 overflow-x-auto scrollbar-none p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`cursor-pointer whitespace-nowrap rounded-lg border border-stoka-border px-4 py-2 text-sm font-bold transition-[transform,box-shadow] ${
            active === tab.value
              ? "bg-stoka-green-600 text-white shadow-none"
              : "bg-stoka-surface text-stoka-green-700 shadow-card hover:-translate-x-px hover:-translate-y-px hover:shadow-pop"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
