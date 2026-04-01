const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.jsx', 'utf8');
const o1 = /setPrivacy\(\{[\s\S]*?show_linkedin: user\.show_linkedin !== false\s*\}\)/;
const n1 = `      const vp = typeof user.visibility_preferences === 'string' ? JSON.parse(user.visibility_preferences) : (user.visibility_preferences || {});\n      setPrivacy({\n        show_phone: vp.phone || false,\n        show_instagram: vp.instagram !== false,\n        show_snapchat: vp.snapchat !== false,\n        show_email: vp.email || false,\n        show_linkedin: vp.website !== false\n      })`;
code = code.replace(o1, n1);
const o2 = /const handlePrivacySubmit = async \(\) \=> \{\s*setLoading\(true\)\s*const \{ error \} = await updateUserProfile\(authUser\.id, privacy\)/;
code = code.replace(o2, n2);
fs.writeFileSync('src/components/LoginScreen.jsx', code);
console.log('LoginScreen patched for privacy submit.');
