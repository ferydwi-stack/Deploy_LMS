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

  // Since JSX can have > inside props (like onChange={() => {}}), we use [\s\S]*? but we have to be careful not to match across elements.
  // A safer way is to match `<select ` and then match until `className="...`
  // We can just look for `<select ` and then parse it roughly or just use lazy matching assuming it's the next className.
  
  content = content.replace(/(<select(?:[\s\S](?!<select|>))*?className=(["']))([\s\S]*?)\2/gi, (match, p1, quote, p3) => {
    let classes = p3;
    const removeClasses = ["bg-slate-100", "text-slate-400", "text-slate-500", "text-slate-800", "text-slate-900", "bg-[#F8FAFC]", "text-white", "font-bold", "border"];
    const targetClasses = ["bg-white", "border", "border-slate-200", "text-slate-700", "font-medium", "focus:ring-blue-600", "focus:border-blue-600", "appearance-none"];
    
    let classArray = classes.split(/\s+/).filter(Boolean);
    classArray = classArray.filter(c => !removeClasses.includes(c) && !targetClasses.includes(c));
    classArray = [...targetClasses, ...classArray];
    
    return p1 + classArray.join(" ") + quote;
  });

  content = content.replace(/(<option(?:[\s\S](?!<option|>))*?className=(["']))([\s\S]*?)\2/gi, (match, p1, quote, p3) => {
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
