const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.jsx', 'utf8');

const regexDone = /\n  return \(\n    <motion\.div\n      initial={{ opacity: 0 }}\n      animate={{ opacity: 1 }}\n      exit={{ opacity: 0, scale: 1\.03 }}/g;

const doneStepStr = `\n  if (step === 'DONE') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[99998] flex items-center justify-center bg-[#111111] px-4">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")\` }} />
        <h2 className="font-archive text-3xl md:text-4xl text-accent-yellow text-glow-sm animate-pulse">
          Opening Archive...
        </h2>
      </motion.div>
    )
  }\n\n  return (\n    <motion.div\n      initial={{ opacity: 0 }}\n      animate={{ opacity: 1 }}\n      exit={{ opacity: 0, scale: 1.03 }}`;

code = code.replace(regexDone, doneStepStr);

code = code.replace(
  /<SignaturePad onSave={\(data\) => setProfile\(p => \({...p, signature_url: data}\)\)} \/>/g,
  `<SignaturePad onSave={(data) => setProfile(p => ({...p, signature_url: data}))} />\n           <p className="font-mono text-xs text-accent-yellow/80 mt-4 mb-4 text-center bg-accent-yellow/10 border border-accent-yellow/20 p-3 rounded-lg">💡 Tip: Lock in the signature before you hit Continue!</p>`
);

code = code.replace(
  /<div className="flex flex-col items-center gap-4 mb-6">/g,
  `<div className="flex flex-col items-center gap-4 mb-6">\n           <p className="font-archive text-3xl text-white/90 text-center mb-1 text-glow-sm">Upload Profile Photo</p>`
);

code = code.replace(
  /<p className="font-mono text-\[10px\] text-muted\/60 mb-2">Create custom social connections, add unlimited links\.<\/p>/g,
  `<p className="font-body text-xl text-accent-yellow/90 mb-4 font-semibold text-glow-sm">Create custom social connections, add unlimited links.</p>`
);

fs.writeFileSync('src/components/LoginScreen.jsx', code);
console.log('LoginScreen updated correctly!');
