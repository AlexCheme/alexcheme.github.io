import { Student } from '../types';

export function getStudentFullName(s?: Partial<Student> | null): string {
  if (!s) return 'N/A';
  const name = (s.firstName || '').trim();
  const father = (s.fatherName || s.middleName || '').trim();
  const grandFather = (s.grandFatherName || s.lastName || '').trim();

  const parts = [name, father, grandFather].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unnamed Student';
}

export const getDojangPrefix = (dojangName: string): string => {
  if (!dojangName || !dojangName.trim()) return 'TKD';
  const words = dojangName
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((w) => w.length > 0);
  if (words.length === 0) return 'TKD';
  const firstWord = words[0].toUpperCase();
  return (firstWord.substring(0, 3) || 'TKD').padEnd(3, 'X');
};

export const getBranchPrefix = (branchName: string | undefined | null, dojangName: string): string => {
  if (!branchName || !branchName.trim()) return '';
  const cleanBranch = branchName.trim();
  const lowerBranch = cleanBranch.toLowerCase();

  // HQ, Central, or Main branches do not add a branch sub-tag
  if (
    lowerBranch.includes('central') ||
    lowerBranch.includes('headquarters') ||
    lowerBranch.includes('hq') ||
    lowerBranch.includes('main branch') ||
    lowerBranch === 'main'
  ) {
    return '';
  }

  // Extract dojang words and generic suffix words to isolate unique branch name
  const dojangWords = new Set(
    dojangName
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length > 0)
  );

  const genericWords = new Set(['branch', 'club', 'dojang', 'center', 'centre', 'school', 'academy', 'taekwondo', 'tkd']);

  const branchWords = cleanBranch
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((w) => w.length > 0);

  const uniqueWords = branchWords.filter((w) => {
    const lower = w.toLowerCase();
    return !dojangWords.has(lower) && !genericWords.has(lower);
  });

  let targetWord = '';
  if (uniqueWords.length > 0) {
    targetWord = uniqueWords[0];
  } else if (branchWords.length > 0) {
    targetWord = branchWords[0];
  } else {
    return '';
  }

  const code = targetWord.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3);
  const dojangPrefix = getDojangPrefix(dojangName);
  if (code === dojangPrefix) return '';
  return code.padEnd(3, 'X');
};

export const getNextYearSequence = (existingStudents: Student[], regYear: string): string => {
  const countInYear = (existingStudents || []).filter((s) => {
    if (!s) return false;
    const sDate = s.registrationDate || '';
    if (sDate.startsWith(regYear)) return true;
    if (s.id && s.id.endsWith(`-${regYear}`)) return true;
    return false;
  }).length;

  return String(countInYear + 1).padStart(3, '0');
};

export const generateStudentId = (
  dojangName: string,
  branchName: string | undefined | null,
  regDate: string,
  existingStudents: Student[]
): string => {
  const dojangPrefix = getDojangPrefix(dojangName);
  const branchPrefix = getBranchPrefix(branchName, dojangName);
  const regYear = (regDate && regDate.length >= 4) ? regDate.substring(0, 4) : new Date().getFullYear().toString();
  const seqNumber = getNextYearSequence(existingStudents, regYear);

  if (branchPrefix) {
    return `${dojangPrefix}-${branchPrefix}-${seqNumber}-${regYear}`;
  }
  return `${dojangPrefix}-${seqNumber}-${regYear}`;
};

