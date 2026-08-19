const fs = require("fs");

let content = fs.readFileSync("Frontend/app/guru/tugas/page.tsx", "utf8");

content = content.replace(/(<select[^>]*?className=(["']))([\s\S]*?)\2/gi, (match, p1, quote, p3) => {
    let classes = p3;
    const removeClasses = ["bg-slate-100", "text-slate-400", "text-slate-500", "text-slate-800", "text-slate-900", "bg-[#F8FAFC]", "text-white", "font-bold", "border"];
    const targetClasses = ["bg-white", "border", "border-slate-200", "text-slate-700", "font-medium", "focus:ring-blue-600", "focus:border-blue-600", "appearance-none"];
    
    let classArray = classes.split(/\s+/).filter(Boolean);
    classArray = classArray.filter(c => !removeClasses.includes(c) && !targetClasses.includes(c));
    classArray = [...targetClasses, ...classArray];
    
    return p1 + classArray.join(" ") + quote;
});

fs.writeFileSync("Frontend/app/guru/tugas/page.tsx", content, "utf8");
