const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Admin.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /{newUser\.personal_letter \? \([\s\S]*?(?=\)\s*:\s*\()/;
const newStr = `{newUser.personal_letter ? (
                            <>
                              <div className="bg-[#f4f1ea] rounded p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(139,69,19,0.06)] relative border border-[#e3dcc8]">
                                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-28 h-6 bg-[#e8e4d5] opacity-90 rotate-[-1.5deg] shadow-sm z-20 backdrop-blur-sm border border-[#dfdacc]" style={{ clipPath: 'polygon(1% 0, 99% 3%, 99% 98%, 0 96%)' }} />
                                <div className="absolute bottom-[-8px] right-6 w-16 h-5 bg-[#e8e4d5] opacity-80 rotate-[4deg] shadow-sm z-20 backdrop-blur-sm border border-[#dfdacc]" style={{ clipPath: 'polygon(0 4%, 98% 0, 100% 96%, 3% 100%)' }} />

                                <div className="absolute top-4 right-4 w-12 h-12 border-[2px] border-[#8b4513] rounded-full opacity-[0.06] flex items-center justify-center rotate-[-15deg] pointer-events-none">
                                  <span className="font-archive text-[10px] text-[#8b4513] uppercase tracking-widest mt-0.5">2026</span>
                                </div>

                                <h3 className="font-handwritten text-3xl text-[#3b2a1a] mb-5 mt-2 mix-blend-multiply relative z-10 drop-shadow-sm">A letter from the developer</h3>
                                
                                <div className="font-body text-sm text-[#2a221b] leading-[2.1] whitespace-pre-wrap max-h-[250px] overflow-y-auto pr-2 mix-blend-multiply relative z-10 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#5c4033]/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                                  {newUser.personal_letter}
                                </div>

                                <div className="mt-8 pt-4 border-t-[1.5px] border-dashed border-[#8b4513]/20 relative z-10">
                                  <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-2 p-2 bg-[#8b4513]/[0.04] rounded-lg border border-[#8b4513]/10">
                                      <span className="text-xs mt-0.5 opacity-80">📸</span>
                                      <p className="font-mono text-[7px] sm:text-[8px] text-[#5c4033]/80 uppercase tracking-widest leading-loose text-left">
                                        <strong className="block mb-0.5 text-[#3b2a1a]">Screenshot this now.</strong>
                                        This letter is permanently sealed. It is uniquely generated for you and will never be rendered on this site again.
                                      </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <button onClick={() => setPreviewStep('welcome')} className="font-mono text-[8px] uppercase tracking-widest text-[#f9f7f1]/50 hover:text-[#1a1512] transition-colors">
                                        ← Back
                                      </button>
                                      <button onClick={() => setPreviewStep('password')} className="font-mono text-[8px] tracking-[0.2em] uppercase px-4 py-2 bg-[#1f1a17] text-[#f4f1ea] rounded hover:bg-[#000000] focus:ring-2 ring-[#8b4513]/20 transition-all hover:scale-105 shadow-xl duration-300 active:scale-95">
                                        I understand →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>`;

content = content.replace(regex, newStr);
fs.writeFileSync(filePath, content, 'utf8');
console.log('patched admin');
