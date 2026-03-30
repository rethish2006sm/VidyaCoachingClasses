export const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const normalizeTopperEntry = (entry = {}) => {
  const rawPercentage = parseNumber(entry.percentage ?? entry.score);
  const rawMarks = parseNumber(entry.marks);
  const outOfValue = parseNumber(entry.outOf) ?? 500;
  const subjects =
    Array.isArray(entry.subjects) && entry.subjects.length
      ? entry.subjects
      : undefined;

  let resolvedMarks = 0;
  let resolvedPercentage = 0;

  if (outOfValue > 0) {
    if (rawMarks !== null) {
      resolvedMarks = Math.min(Math.max(rawMarks, 0), outOfValue);
    } else if (rawPercentage !== null) {
      resolvedMarks = Math.min(
        Math.round((rawPercentage / 100) * outOfValue),
        outOfValue
      );
    }

    if (rawPercentage !== null) {
      resolvedPercentage = rawPercentage;
    } else if (outOfValue > 0) {
      resolvedPercentage = Number(
        ((resolvedMarks / outOfValue) * 100).toFixed(1)
      );
    }
  } else {
    resolvedMarks = Math.max(rawMarks ?? 0, 0);
    resolvedPercentage = rawPercentage ?? 0;
  }

  return {
    percentage: Math.min(Math.max(resolvedPercentage, 0), 100),
    marks: resolvedMarks,
    outOf: outOfValue > 0 ? outOfValue : 500,
    subjects,
  };
};

export const getResultSchoolLabel = (entry = {}) => {
  const school = entry.school?.trim();
  if (school) {
    return school;
  }
  const board = entry.board?.trim();
  if (board) {
    return `${board} Board`;
  }
  return "Vidya Coaching Classes";
};

const getYearNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
};

const extractYearFromKey = (key) => {
  if (!key) return new Date().getFullYear();
  const yearPart = key.split("-").pop();
  return getYearNumber(yearPart);
};

const sortEntriesByYearPriority = (entries) => {
  const currentYear = new Date().getFullYear();
  return [...entries].sort((a, b) => {
    const yearA = extractYearFromKey(a[0]);
    const yearB = extractYearFromKey(b[0]);
    const priorityA = yearA === currentYear ? 0 : 1;
    const priorityB = yearB === currentYear ? 0 : 1;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return yearB - yearA;
  });
};

export const buildSectionsFromResults = (entries = []) => {
  const map = new Map();
  entries.forEach((entry) => {
    const year = entry.year ?? new Date().getFullYear();
    const label = entry.standard || "Batch";
    const key = `${label}-${year}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(entry);
  });

  const sortedEntries = sortEntriesByYearPriority(Array.from(map.entries()));
  return sortedEntries.map(([key, students]) => {
    const [label, yearPart] = key.split("-");
    const yearNumber = Number(yearPart) || new Date().getFullYear();
    const normalizedStudents = students.map((student) => ({
      student,
      normalized: normalizeTopperEntry(student),
    }));
    const sorted = normalizedStudents.sort(
      (a, b) => b.normalized.marks - a.normalized.marks
    );
    const title =
      label === "Batch" ? `Batch ${yearNumber}` : `${label} ${yearNumber}`.trim();

    return {
      title,
      accent: label === "Batch" ? title : label,
      standard: label,
      year: yearNumber,
      toppers: sorted.slice(0, 6).map(({ student, normalized }) => {
        const position = student.profileImagePosition || {};
      const topperSchool = getResultSchoolLabel(student);
      return {
        name: student.studentName,
          percentage: normalized.percentage,
          marks: normalized.marks,
          outOf: normalized.outOf,
          subjects: normalized.subjects,
          imageUrl: student.profileImage,
          imagePositionX: position.x ?? 50,
          imagePositionY: position.y ?? 50,
          year: student.year ?? yearNumber,
          school: topperSchool,
          board: student.board,
          source: student,
          id: student._id,
        };
      }),
    };
  });
};
