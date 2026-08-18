const fs = require("fs");
const path = require("path");

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith(".tsx")) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const files = walkSync("Frontend/app");
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  // Replace for <select className="...">
  content = content.replace(/(<select[^>]*?className=["'])(.*?)(["'])/gs, (match, p1, p2, p3) => {
    let classes = p2;
    // Remove unwanted classes
    const removeClasses = ["bg-slate-100", "text-slate-400", "text-slate-500", "text-slate-800", "text-slate-900", "bg-[#F8FAFC]", "text-white", "font-bold"];
    
    // Also remove the target standard classes so we don't duplicate
    const targetClasses = ["bg-white", "border-slate-200", "text-slate-700", "font-medium", "focus:ring-blue-600", "focus:border-blue-600", "appearance-none"];
    
    let classArray = classes.split(/\s+/).filter(Boolean);
    classArray = classArray.filter(c => !removeClasses.includes(c) && !targetClasses.includes(c));
    
    // Add target classes at the beginning
    classArray = [...targetClasses, ...classArray];
    
    return p1 + classArray.join(" ") + p3;
  });

  // Replace for <option className="...">
  content = content.replace(/(<option[^>]*?className=["'])(.*?)(["'])/gs, (match, p1, p2, p3) => {
    let classes = p2;
    const removeClasses = ["bg-slate-100", "text-slate-400", "text-slate-500", "text-slate-800", "text-slate-700", "bg-white"];
    const targetClasses = ["text-slate-700", "bg-white"];
    
    let classArray = classes.split(/\s+/).filter(Boolean);
    classArray = classArray.filter(c => !removeClasses.includes(c) && !targetClasses.includes(c));
    classArray = [...targetClasses, ...classArray];
    
    return p1 + classArray.join(" ") + p3;
  });
  
  // Add className="text-slate-700 bg-white" to <option> tags that don't have a className
  // Using a simpler regex
  content = content.replace(/<option(?!\s+[^>]*?className=)([^>]*?>)/gi, '<option className="text-slate-700 bg-white"$1');

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated", file);
  }
}
