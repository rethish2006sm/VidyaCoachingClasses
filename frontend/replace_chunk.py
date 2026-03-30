from pathlib import Path
path = Path('src/pages/Leaderboard.jsx')
lines = path.read_text(encoding='utf-8').splitlines()
start = 280
end = 310
new = [
'                    <div className= space-y-5>',
'                      {entry.students.map((student, i) => {',
'                        const studentPhotoPosition = student.photoPosition || { x: 50, y: 50 };',
'                        return (',
'                          <div key={i} className=flex items-center justify-between group/row>',
'                            <div className=flex items-center gap-4>',
'                              <span className={	ext-xs font-black w-7 h-7 rounded-xl flex items-center justify-center transition-all }>
                                {i + 1}
                              </span>',
'                              <div className=flex items-center gap-3>',
'                                <div className=w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-inner>',
'                                  <img',
'                                    src={student.photoUrl || classLogo}',
'                                    alt={student.name}',
'                                    className=w-full h-full object-cover',
'                                    style={{',
'                                      objectPosition: ${studentPhotoPosition.x}% %,',
'                                    }}',
'                                  />',
'                                </div>',
'                                <span className=text-base md:text-lg font-bold text-slate-700 group-hover/row:text-slate-900 transition-colors tracking-tight>',
'                                  {student.name}',
'                                </span>',
'                              </div>',
'                            </div>',
'                            <span className={	ext-lg font-black }>
                              {student.score}%
                            </span>',
'                          </div>',
'                        );',
'                      })}',
'                    </div>',
]
lines[start:end] = new
path.write_text('\n'.join(lines), encoding='utf-8')
