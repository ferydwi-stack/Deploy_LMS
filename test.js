const fs = require("fs");
const path = require("path");

const files = [
  "Frontend/app/admin/assignments/page.tsx",
  "Frontend/app/admin/reports/page.tsx",
  "Frontend/app/admin/settings/page.tsx",
  "Frontend/app/admin/users/add/page.tsx",
  "Frontend/app/admin/users/edit/page.tsx",
  "Frontend/app/admin/users/page.tsx",
  "Frontend/app/guru/absensi/page.tsx",
  "Frontend/app/guru/courses/new/page.tsx",
  "Frontend/app/guru/materi/upload/page.tsx",
  "Frontend/app/guru/reports/page.tsx",
  "Frontend/app/guru/tugas/create/page.tsx",
  "Frontend/app/guru/tugas/page.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  // Since regex might be skipping line breaks or something with 's' flag, 
  // Let's use a robust match
  content = content.replace(/(<select[^>]*?className=(["']))([\s\S]*?)\2/gi, (match, p1, quote, p3) => {
    let classes = p3;
    const removeClasses = ["bg-slate-100", "text-slate-400", "text-slate-500", "text-slate-800", "text-slate-900", "bg-[#F8FAFC]", "text-white", "font-bold", "border"];
    const targetClasses = ["bg-white", "border", "border-slate-200", "text-slate-700", "font-medium", "focus:ring-blue-600", "focus:border-blue-600", "appearance-none"];
    
    let classArray = classes.split(/\s+/).filter(Boolean);
    classArray = classArray.filter(c => !removeClasses.includes(c) && !targetClasses.includes(c));
    classArray = [...targetClasses, ...classArray];
    
    return p1 + classArray.join(" ") + quote;
  });

  content = content.replace(/(<option[^>]*?className=(["']))([\s\S]*?)\2/gi, (match, p1, quote, p3) => {
    let classes = p3;
    const removeClasses = ["bg-slate-100", "text-slate-400", "text-slate-500", "text-slate-800", "text-slate-700", "bg-white", "text-slate-900", "bg-[#F8FAFC]", "font-bold"];
    const targetClasses = ["text-slate-700", "bg-white"];
    
    let classArray = classes.split(/\s+/).filter(Boolean);
    classArray = classArray.filter(c => !removeClasses.includes(c) && !targetClasses.includes(c));
    classArray = [...targetClasses, ...classArray];
    
    return p1 + classArray.join(" ") + quote;
  });

  // add className="text-slate-700 bg-white" to <option> that have NO className
  // using a loop or regex
  content = content.replace(/<option([^>]*?)>/gi, (match, attrs) => {
    if (!/className=/i.test(attrs)) {
      // make sure it's not self-closing or something, though option shouldn't be
      if (attrs.endsWith('/')) {
        return `<option className="text-slate-700 bg-white" ${attrs.slice(0, -1)}/>`;
      }
      return `<option className="text-slate-700 bg-white" ${attrs}>`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated", file);
  }
}
