const TYPE_STYLES = {
  success: "bg-green-500/10 border-green-600/40 text-green-300",
  warning: "bg-yellow-500/10 border-yellow-600/40 text-yellow-300",
  danger: "bg-red-500/10 border-red-600/40 text-red-300",
};

const TYPE_ICONS = { success: "✅", warning: "⚠️", danger: "🚨" };

export default function Insights({ insights }) {
  if (!insights.length)
    return <p className="text-gray-500 text-sm">No insights generated.</p>;

  return (
    <ul className="space-y-3">
      {insights.map((ins, i) => (
        <li
          key={i}
          className={`flex gap-3 items-start border rounded-lg px-4 py-3 text-sm ${TYPE_STYLES[ins.type]}`}
        >
          <span className="text-base mt-0.5">{TYPE_ICONS[ins.type]}</span>
          <span>{ins.message}</span>
        </li>
      ))}
    </ul>
  );
}
