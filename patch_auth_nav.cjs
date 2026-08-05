const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const target = `            {/* Auth Toggle */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 ml-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 hidden md:inline-block max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <button`;

const replacement = `            {/* Auth Toggle */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 ml-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 object-cover" />
                ) : (
                  <UserCircle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <button`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Navbar.tsx', content, 'utf8');
