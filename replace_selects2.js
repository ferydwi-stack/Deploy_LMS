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

  // Replace for <select className="...">
  content = content.replace(/(<select[^>]*?className=["'])(.*?)(["'])/gs, (match, p1, p2, p3) => {
    let classes = p2;
    // Remove unwanted classes
    const removeClasses = ["bg-slate-100", "text-slate-400", "text-slate-500", "text-slate-800", "text-slate-900", "bg-[#F8FAFC]", "text-white", "font-bold", "border"];
    
    // Also remove the target standard classes so we don't duplicate
    const targetClasses = ["bg-white", "border-slate-200", "text-slate-700", "font-medium", "focus:ring-blue-600", "focus:border-blue-600", "appearance-none", "border"];
    
    let classArray = classes.split(/\s+/).filter(Boolean);
    classArray = classArray.filter(c => !removeClasses.includes(c) && !targetClasses.includes(c));
    
    // Add target classes at the beginning
    classArray = [...targetClasses, ...classArray];
    
    return p1 + classArray.join(" ") + p3;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated", file);
  }
}
