const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.jsx', 'utf8');

const t2 = `              <div className="flex-1 font-mono text-[10px] tracking-widest uppercase text-muted/60">ID</div>
              <div className="flex-1 font-mono text-[10px] tracking-widest uppercase text-muted/60">Username</div>
              <div className="flex-1 font-mono text-[10px] tracking-widest uppercase text-muted/60 text-right">Actions</div>`

const t2Repl = `              <div className="flex-1 font-mono text-[10px] tracking-widest uppercase text-muted/60">ID</div>
              <div className="flex-1 font-mono text-[10px] tracking-widest uppercase text-muted/60">Username</div>
              <div className="flex-1 font-mono text-[10px] tracking-widest uppercase text-muted/60">Welcome Info</div>
              <div className="flex-1 font-mono text-[10px] tracking-widest uppercase text-muted/60 text-right">Actions</div>`
code = code.replace(t2, t2Repl);

const t3 = `                  <div className="flex-1 text-sm text-text-primary truncate">{u.username}</div>
                  <div className="flex-1 text-sm font-mono text-muted/40 truncate">••••••••</div>
                  <div className="flex-1 text-right">`

const t3Repl = `                  <div className="flex-1 text-sm text-text-primary truncate">{u.username}</div>
                  <div className="flex-1 text-sm font-mono text-muted/40 truncate text-ellipsis overflow-hidden whitespace-nowrap">
                    {u.welcome_message ? \`"\${u.welcome_message}"\` : 'No Msg'} {u.welcome_image_url && '🖼️'}
                  </div>
                  <div className="flex-1 text-right">`
code = code.replace(t3, t3Repl);

fs.writeFileSync('src/pages/Admin.jsx', code, 'utf8');
console.log('patched columns')
