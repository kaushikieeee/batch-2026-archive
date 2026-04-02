const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.jsx', 'utf-8');

if(!content.includes("import YearbookCard from '../components/YearbookCard'")) {
    content = content.replace("import { motion } from 'framer-motion'", "import { motion } from 'framer-motion'\nimport YearbookCard from '../components/YearbookCard'");
}

const OLD_BLOCK = `                    <div className="px-4 pb-4 pt-1 ml-10 text-xs text-muted-foreground space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                           <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-1">Quote & Bio</div>
                           {u.quote && <div className="italic text-accent-yellow mb-1">"{u.quote}"</div>}
                           {u.bio && <div>{u.bio}</div>}
                           {!u.quote && !u.bio && <div className="text-white/20">Not provided</div>}
                         </div>
         const fs = require('fs');
let content = fs  let content = fs.readFilt-
if(!content.includes("import YearbookCard from '../componentsul    content = content.replace("import { motion } from 'framer-motion'", "importte}

const OLD_BLOCK = `                    <div className="px-4 pb-4 pt-1 ml-10 text-xs text-muted-foreground space-y-3">
                      <div className="grid griddiv>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                      n                          <div>
                           <di                             <dor                           {u.quote && <div className="italic text-accent-yellow mb-1">"{u.quote}"</div>}
           am                           {u.bio && <div>{u.bio}</div>}
                           {!u.quote && !u.bio                              {!u.quote && !u.bio && <div [&                         </div>
         const fs = require('fs');
let content = fs  let content = te         const fs = require('f>}let content = fs  let content = fu.if(!content.includes("import YearbookCard fPH
const OLD_BLOCK = `                    <div className="px-4 pb-4 pt-1 ml-10 text-xs text-muted-foreground space-y-3">
                      <di                         <div className="grid griddiv>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="grid grid-coam                         <div>
                      n                               n      iv                           <di                    }</di           am                           {u.bio && <div>{u.bio}</div>}
                           {!u.quote && !u.bio                              {!u.quote && !u.bio &n                            {!u.quote && !u.bio                                 const fs = require('fs');
let content = fs  let content = te         const fs = require('f>}let content = fs  let content = fu.v>let content = fs  let content = divconst OLD_BLOCK = `                    <div className="px-4 pb-4 pt-1 ml-10 text-xs text-muted-foreground space-y-3">
                      <di  e                       <di                         <div className="grid griddiv>
                      <div className                        <div className="grid grid-cols-2 gap-4">
                                          <div className="grid grid-coam      n                       n                               n      iv                                                  {!u.quote && !u.bio                              {!u.quote && !u.bio &n                            {!u.quote && !u.bio                                 const fs  let content = fs  let content = te         const fs = require('f>}let content = fs  let content = fu.v>let content = fs  let content = divconst OLD_BLOCK = `                    <div className="px-4 pb-4p-                      <di  e                       <di                         <div className="grid griddiv>
                      <div className                        <div className="grid grid-cols-2 gap-4">
                                          <dst                      <div className                        <div className="grid grid-cols-2 gap-4">
      ow                                          <div className="grid grid-coam      n                                            <div className                        <div className="grid grid-cols-2 gap-4">
                                          <dst                      <div className                        <div className="grid grid-cols-2 gap-4">
      ow                                          <div className="grid grid-coam      n                                            <div className                        <div className="grid grid-cols-2 gap-4">
                                          <dst                      <div className                        <div className="grid grid-cols-2 gap-4">
      ow                                          <div class |                                          <dst                      <div className                 r-      ow                                          <div className="grid grid-coam      n                                            <div classNamete                                          <dst                      <div className                        <div className="grid grid-cols-2 gap-4">
      ow                                                  {u.em      ow                                          <div className="grid grid-coam      n                                            <div classNamemu                                          <dst                      <div className                        <div className="grid grid-cols-2 gap-4">
      ow                                          <div class pa      ow                                          <div class |                                          <dst                      <div className /s      ow                                                  {u.em      ow                                          <div className="grid grid-coam      n                                            <div classNamemu                                          <dst                      <div className                        <div className="grid grid-cols-2 gap-4">
      ow                                          <div class pa      ow                           ><      ow                                          <div class pa      ow                                          <div class |                                          <dst                      <div className /s      ow                                                  {u.em      ow                                          <div className="grid grid-coam  l       ow                                          <div class pa      ow                           ><      ow                                          <div class pa      ow                                          <div class |                                          <dst                      <div className /s      ow                                                  {u.em      ow                                          <div className="grid grid-coam  l       ow                                          <div class pa      ow                           ><      owe/5 pl-6 pt-1">
                           <div className="text-[10px] text-muted/60 uppercase tracking-widest mb-1">Public Profile Preview</div>
                           <div className="w-full max-w-[140px]">
                              <YearbookCard student={{...u, accentColor: u.accent_color}} />
                           </div>
                           <div className="text-[9px] text-muted leading-tight max-w-[140px]">
                              Click the card to view how others interact with this profile.
                           </div>
                        </div>
                      </div>
                    </div>`;

if(content.includes(OLD_BLOCK)) {
    content = content.replace(OLD_BLOCK, NEW_BLOCK);
    fs.writeFileSync('src/pages/Admin.jsx', content);
    console.log("Patched Admin page correctly");
} else {
    console.log("Failed to find OLD_BLOCK");
}
