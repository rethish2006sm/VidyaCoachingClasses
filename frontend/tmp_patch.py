from pathlib import Path
path = Path('src/pages/Contact.jsx')
text = path.read_text()
old = '<div className= grid gap-6 lg:grid-cols-[1.5fr_1fr]>'
if old not in text:
    raise SystemExit('need grid')
text = text.replace(old, '<div className=grid gap-6 lg:grid-cols-2>', 1)
oldcard = '<motion.div variants={itemVariants} className=relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl>'
newcard = '<motion.div variants={itemVariants} className=relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl flex flex-col h-full>'
count = text.count(oldcard)
if count < 2:
    raise SystemExit('not enough cards')
text = text.replace(oldcard, newcard, 2)
path.write_text(text)
