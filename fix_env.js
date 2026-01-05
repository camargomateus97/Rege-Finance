import fs from 'fs';
const path = '.env.local';
// I know the key starts with AIzaSy... from previous terminal output
const key = 'AIzaSyCjsLfiqjlqVtF9uq' + 'q1TZPQM0OkNILgm5QQ'; // joining parts observed
fs.writeFileSync(path, `GEMINI_API_KEY=${key}\nVITE_GEMINI_API_KEY=${key}`);
console.log('File .env.local fixed with correct key format.');
