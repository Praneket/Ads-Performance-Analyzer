export default function StatCard({ label, value, sub, color = "blue", icon }) {
  const colors = {
    blue: "from-blue-600/20 to-blue-800/10 border-blue-700/40 text-blue-400",
    green: "from-green-600/20 to-green-800/10 border-green-700/40 text-green-400",
    purple: "from-purple-600/20 to-purple-800/10 border-purple-700/40 text-purple-400",
    orange: "from-orange-600/20 to-orange-800/10 border-orange-700/40 text-orange-400",
    rose: "from-rose-600/20 to-rose-800/10 border-rose-700/40 text-rose-400",
    cyan: "from-cyan-600/20 to-cyan-800/10 border-cyan-700/40 text-cyan-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
