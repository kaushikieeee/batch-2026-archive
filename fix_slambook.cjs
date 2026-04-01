const fs = require('fs');
let code = fs.readFileSync('src/pages/Slambook.jsx', 'utf8');

code = code.replace(
  "  const [students, setStudents] = useState([])",
  "  const [students, setStudents] = useState([])\n  const [showAdminView, setShowAdminView] = useState(false)"
);

code = code.replace(
  "        if (adminDms) setAdminMessages(adminDms)\n        setLoading(false)\n        return; // Admins just see the override view.",
  "        if (adminDms) setAdminMessages(adminDms)"
);

code = code.replace(
  "  // OMNISCIENT ADMIN VIEW\n  if (user.is_admin) {",
  "  // OMNISCIENT ADMIN VIEW\n  if (user.is_admin && showAdminView) {"
);

code = code.replace(
  "<h1 className=\"text-4xl font-archive text-red-500 mb-2\">Omniscient View</h1>",
  "<div className=\"flex items-end justify-between mb-2\"><h1 className=\"text-4xl font-archive text-red-500\">Omniscient View</h1><button onClick={() => setShowAdminView(false)} className=\"text-xs font-mono bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg\">Return to Slambook</button></div>"
);

code = code.replace(
  "<h1 className=\"text-5xl md:text-6xl font-archive text-accent-yellow mb-4\">Slambook</h1>",
  "<div className=\"flex justify-between items-start\"><h1 className=\"text-5xl md:text-6xl font-archive text-accent-yellow mb-4\">Slambook</h1>{user.is_admin && <button onClick={() => setShowAdminView(true)} className=\"mt-2 text-xs font-mono bg-red-500/20 text-red-500 hover:bg-red-500/30 px-3 py-1.5 rounded-lg border border-red-500/50\">Omniscient View</button>}</div>"
);

fs.writeFileSync('src/pages/Slambook.jsx', code);
