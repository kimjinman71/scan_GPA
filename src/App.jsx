import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Calculator,
  GraduationCap,
  TrendingUp,
  Loader2,
  FileText,
  Image as ImageIcon,
  X,
  Trophy,
  Lock,
  Key,
  ShieldCheck,
  Table as TableIcon,
  Printer,
  Layers,
  MapPin,
  Edit3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const SEMESTERS = [
  '1학년 1학기',
  '1학년 2학기',
  '2학년 1학기',
  '2학년 2학기',
  '3학년 1학기',
  '3학년 2학기',
];

const YEARS = ['1학년', '2학년', '3학년'];
const ACHIEVEMENTS = ['A', 'B', 'C', 'D', 'E', 'P'];

const SUBJECT_CATEGORIES = [
  { id: '국어', name: '국어', keywords: ['국어', '문학', '독서', '화법', '언어', '매체', '고전'], exclusions: [] },
  { id: '수학', name: '수학', keywords: ['수학', '대수', '미적', '확률', '기하', '통계', '해석'], exclusions: [] },
  { id: '영어', name: '영어', keywords: ['영어', '영미', '독해', '회화', '심화영어'], exclusions: [] },
  { id: '사회', name: '사회', keywords: ['사회', '윤리', '지리', '역사', '경제', '정치', '법', '세계사', '동아시아'], exclusions: [] },
  { id: '과학', name: '과학', keywords: ['과학', '물리', '화학', '생명', '지구', '융합'], exclusions: [] },
  { id: '한국사', name: '한국사', keywords: ['한국사'], exclusions: [] },
  { id: '기타', name: '기타', keywords: [], exclusions: [] },
];

const REGION_DATA = {
  서울권: [
    { name: '서울대', g9: [1.1, 1.4], g5: [1.0, 1.08] },
    { name: '연세대', g9: [1.3, 1.5], g5: [1.02, 1.12] },
    { name: '고려대', g9: [1.3, 1.6], g5: [1.03, 1.15] },
    { name: '서강대', g9: [1.5, 1.7], g5: [1.1, 1.22] },
    { name: '성균관대', g9: [1.5, 1.8], g5: [1.12, 1.28] },
    { name: '한양대', g9: [1.6, 1.8], g5: [1.18, 1.32] },
    { name: '중앙대', g9: [1.8, 2.0], g5: [1.3, 1.55] },
    { name: '경희대', g9: [1.8, 2.1], g5: [1.35, 1.6] },
    { name: '한국외대', g9: [1.9, 2.2], g5: [1.4, 1.68] },
    { name: '서울시립대', g9: [1.9, 2.1], g5: [1.38, 1.62] },
    { name: '이화여대', g9: [1.9, 2.3], g5: [1.45, 1.75] },
    { name: '건국대', g9: [2.0, 2.4], g5: [1.55, 1.95] },
    { name: '동국대', g9: [2.0, 2.5], g5: [1.6, 2.0] },
    { name: '홍익대', g9: [2.1, 2.6], g5: [1.68, 2.08] },
    { name: '숙명여대', g9: [2.0, 2.5], g5: [1.62, 2.02] },
    { name: '국민대', g9: [2.3, 2.8], g5: [1.85, 2.25] },
    { name: '숭실대', g9: [2.2, 2.7], g5: [1.78, 2.18] },
    { name: '세종대', g9: [2.0, 2.5], g5: [1.6, 2.0] },
    { name: '광운대', g9: [2.1, 2.7], g5: [1.68, 2.15] },
    { name: '단국대', g9: [2.4, 2.9], g5: [1.92, 2.35] },
    { name: '가톨릭대', g9: [2.3, 2.9], g5: [1.85, 2.3] },
    { name: '명지대', g9: [2.8, 3.4], g5: [2.2, 2.7] },
    { name: '상명대', g9: [3.0, 3.6], g5: [2.35, 2.85] },
    { name: '한성대', g9: [3.4, 4.1], g5: [2.7, 3.2] },
    { name: '서경대', g9: [3.5, 4.2], g5: [2.8, 3.3] },
    { name: '삼육대', g9: [3.1, 3.8], g5: [2.45, 3.0] },
  ],
  경기인천권: [
    { name: '아주대', g9: [1.9, 2.4], g5: [1.52, 1.92] },
    { name: '인하대', g9: [2.0, 2.5], g5: [1.58, 1.98] },
    { name: '가천대', g9: [2.5, 3.2], g5: [2.0, 2.55] },
    { name: '단국대', g9: [2.4, 2.9], g5: [1.92, 2.35] },
    { name: '한국항공대', g9: [2.2, 2.9], g5: [1.75, 2.3] },
    { name: '인천대', g9: [2.4, 3.0], g5: [1.92, 2.38] },
    { name: '경기대', g9: [3.0, 3.8], g5: [2.4, 3.0] },
    { name: '한국공학대', g9: [3.0, 3.7], g5: [2.35, 2.95] },
    { name: '한경국립대', g9: [3.4, 4.2], g5: [2.7, 3.35] },
    { name: '수원대', g9: [3.5, 4.3], g5: [2.8, 3.4] },
    { name: '용인대', g9: [3.5, 4.5], g5: [2.8, 3.55] },
    { name: '안양대', g9: [3.8, 4.5], g5: [3.0, 3.55] },
    { name: '대진대', g9: [3.8, 4.8], g5: [3.0, 3.82] },
    { name: '평택대', g9: [4.0, 5.0], g5: [3.2, 4.0] },
  ],
  충청권: [
    { name: '충남대', g9: [2.2, 2.9], g5: [1.75, 2.3] },
    { name: '충북대', g9: [2.5, 3.2], g5: [2.0, 2.55] },
    { name: '한국기술교대', g9: [2.1, 2.8], g5: [1.68, 2.22] },
    { name: '공주대', g9: [2.8, 3.5], g5: [2.22, 2.78] },
    { name: '한밭대', g9: [2.7, 3.4], g5: [2.15, 2.72] },
    { name: '순천향대', g9: [2.8, 3.6], g5: [2.25, 2.85] },
    { name: '건양대', g9: [3.0, 3.9], g5: [2.38, 3.1] },
    { name: '호서대', g9: [3.2, 4.0], g5: [2.55, 3.18] },
    { name: '백석대', g9: [3.5, 4.3], g5: [2.8, 3.42] },
    { name: '선문대', g9: [3.4, 4.2], g5: [2.72, 3.35] },
    { name: '우송대', g9: [3.3, 4.1], g5: [2.65, 3.28] },
    { name: '대전대', g9: [3.4, 4.2], g5: [2.7, 3.35] },
    { name: '청주대', g9: [3.7, 4.5], g5: [2.95, 3.58] },
  ],
  강원권: [
    { name: '연세대(M)', g9: [1.9, 2.5], g5: [1.52, 2.0] },
    { name: '강원대', g9: [2.5, 3.2], g5: [2.0, 2.55] },
    { name: '한림대', g9: [2.7, 3.4], g5: [2.15, 2.72] },
    { name: '강릉원주대', g9: [3.0, 3.9], g5: [2.38, 3.1] },
    { name: '가톨릭관동대', g9: [3.4, 4.3], g5: [2.72, 3.42] },
    { name: '상지대', g9: [3.5, 4.5], g5: [2.8, 3.58] },
  ],
  대구경북권: [
    { name: '경북대', g9: [2.0, 2.6], g5: [1.6, 2.08] },
    { name: '영남대', g9: [2.5, 3.2], g5: [2.0, 2.55] },
    { name: '계명대', g9: [2.8, 3.6], g5: [2.25, 2.88] },
    { name: '대구가톨릭대', g9: [3.2, 4.0], g5: [2.55, 3.18] },
    { name: '대구대', g9: [3.1, 3.9], g5: [2.48, 3.1] },
    { name: '금오공대', g9: [2.7, 3.4], g5: [2.15, 2.72] },
    { name: '안동대', g9: [3.2, 4.0], g5: [2.55, 3.18] },
    { name: '경일대', g9: [3.6, 4.5], g5: [2.88, 3.58] },
    { name: '대구한의대', g9: [3.5, 4.3], g5: [2.8, 3.42] },
  ],
  부산경남권: [
    { name: '부산대', g9: [1.9, 2.5], g5: [1.52, 2.0] },
    { name: '부경대', g9: [2.3, 3.0], g5: [1.85, 2.38] },
    { name: '경상국립대', g9: [2.6, 3.3], g5: [2.08, 2.62] },
    { name: '울산대', g9: [2.4, 3.1], g5: [1.92, 2.48] },
    { name: '동아대', g9: [2.7, 3.5], g5: [2.15, 2.78] },
    { name: '한국해양대', g9: [2.7, 3.4], g5: [2.15, 2.72] },
    { name: '동의대', g9: [3.2, 4.0], g5: [2.55, 3.18] },
    { name: '경남대', g9: [3.3, 4.1], g5: [2.65, 3.28] },
    { name: '인제대', g9: [3.0, 3.8], g5: [2.38, 3.0] },
  ],
  전라제주권: [
    { name: '전남대학교', g9: [2.1, 2.8], g5: [1.68, 2.25] },
    { name: '전북대학교', g9: [2.2, 2.9], g5: [1.75, 2.3] },
    { name: '제주대학교', g9: [2.4, 3.1], g5: [1.92, 2.48] },
    { name: '조선대학교', g9: [2.8, 3.6], g5: [2.25, 2.88] },
    { name: '원광대학', g9: [2.9, 3.7], g5: [2.3, 2.95] },
    { name: '순천대', g9: [3.0, 3.8], g5: [2.38, 3.0] },
    { name: '군산대', g9: [3.1, 3.9], g5: [2.48, 3.1] },
    { name: '목포대', g9: [3.2, 4.0], g5: [2.55, 3.18] },
    { name: '목포해양대', g9: [3.0, 3.8], g5: [2.38, 3.0] },
    { name: '우석대', g9: [3.4, 4.2], g5: [2.72, 3.35] },
    { name: '동신대', g9: [3.5, 4.3], g5: [2.8, 3.42] },
    { name: '세한대', g9: [3.8, 4.8], g5: [3.0, 3.82] },
  ],
};

const CHART_COLORS = [
  '#ff5f5f',
  '#ffbd2e',
  '#27c93f',
  '#3b82f6',
  '#a855f7',
  '#94a3b8',
  '#0ea5e9',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#f97316',
  '#1d4ed8',
  '#166534',
  '#4b5563',
];

const MAX_GEMINI_INLINE_DATA_CHARS = 3_600_000;
const IMAGE_TARGET_WIDTH = 1500;
const IMAGE_MIN_WIDTH = 1200;
const IMAGE_JPEG_QUALITY = 0.68;

const normalizeString = (str) =>
  String(str || '')
    .replace(/\s/g, '')
    .replace(/Ⅱ/g, '2')
    .replace(/II/g, '2')
    .replace(/ii/g, '2')
    .replace(/Ⅰ/g, '1')
    .replace(/I/g, '1')
    .replace(/i/g, '1')
    .replace(/Ⅲ/g, '3')
    .replace(/III/g, '3')
    .replace(/iii/g, '3');

const sampleGrades = () => [
  {
    id: 1,
    type: 'relative',
    semester: '1학년 1학기',
    group: '국어',
    name: '국어',
    credits: 4,
    score: 95,
    mean: 65.2,
    achievement: 'A',
    grade: 1,
    studentCount: 320,
  },
  {
    id: 2,
    type: 'relative',
    semester: '1학년 1학기',
    group: '수학',
    name: '수학',
    credits: 4,
    score: 98,
    mean: 58.7,
    achievement: 'A',
    grade: 1,
    studentCount: 320,
  },
];

const parseNum = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const normalized = String(value).trim().toLowerCase();
  if (['null', 'undefined', '-', '.', '/'].includes(normalized)) return null;
  const clean = normalized.replace(/[^0-9.]/g, '');
  if (!clean || clean === '.') return null;
  const number = Number.parseFloat(clean);
  return Number.isNaN(number) ? null : number;
};

const getFormattedChartData = (region, isFiveGrade) =>
  REGION_DATA[region].map((univ, index) => ({
    name: univ.name,
    min: isFiveGrade ? univ.g5[0] : univ.g9[0],
    max: isFiveGrade ? univ.g5[1] : univ.g9[1],
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

const canvasToInlineData = (canvas) => ({
  data: canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY).split(',')[1],
  mimeType: 'image/jpeg',
});

const SCHOOL_YEAR_LABEL = '\uD559\uB144';
const SEMESTER_LABEL = '\uD559\uAE30';
const schoolYearPattern = new RegExp(`([1-3])\\s*${SCHOOL_YEAR_LABEL}`);
const detectedYearPattern = new RegExp(`([1-3])\\s*${SCHOOL_YEAR_LABEL}|^\\s*([1-3])\\s*$`);
const semesterTermPattern = new RegExp(`([1-2])\\s*${SEMESTER_LABEL}|^\\s*([1-2])\\s*$`);

const detectSchoolYear = (text) => {
  const normalized = normalizeString(text);
  const match = normalized.match(schoolYearPattern);
  return match ? Number(match[1]) : null;
};

const parseDetectedYear = (value) => {
  const match = normalizeString(value).match(detectedYearPattern);
  return match ? Number(match[1] || match[2]) : null;
};

const parseSemesterParts = (semester) => {
  const match = normalizeString(semester).match(/([1-3])\D*([1-2])\D*/);
  return match ? { year: Number(match[1]), term: Number(match[2]) } : null;
};

const repairSemesterSequence = (items) => {
  let currentYear = 1;
  let previousTerm = null;

  return items.map((item) => {
    const parts = parseSemesterParts(item.semester);
    if (!parts) return item;

    if (previousTerm === 2 && parts.term === 1) {
      currentYear = Math.min(currentYear + 1, 3);
    }

    if (parts.year > currentYear && parts.year <= 3) {
      currentYear = parts.year;
    }

    previousTerm = parts.term;

    return {
      ...item,
      semester: `${currentYear}${SCHOOL_YEAR_LABEL} ${parts.term}${SEMESTER_LABEL}`,
    };
  });
};

const optimizeImageElement = (img) => {
  const canvas = document.createElement('canvas');
  const maxWidth = IMAGE_TARGET_WIDTH;
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height *= maxWidth / width;
    width = maxWidth;
  } else if (width < IMAGE_MIN_WIDTH) {
    const scale = IMAGE_MIN_WIDTH / width;
    width *= scale;
    height *= scale;
  }

  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const grayBuf = new Uint8ClampedArray(canvas.width * canvas.height);

    for (let i = 0; i < pixels.length; i += 4) {
      grayBuf[i >> 2] = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    }

    for (let y = 1; y < canvas.height - 1; y += 1) {
      const yOffset = y * canvas.width;
      const yPrev = (y - 1) * canvas.width;
      const yNext = (y + 1) * canvas.width;

      for (let x = 1; x < canvas.width - 1; x += 1) {
        const idx = yOffset + x;
        const sharpened =
          5 * grayBuf[idx] -
          grayBuf[idx - 1] -
          grayBuf[idx + 1] -
          grayBuf[yPrev + x] -
          grayBuf[yNext + x];
        const finalVal = Math.max(0, Math.min(255, sharpened));
        const contrastVal = finalVal > 135 ? Math.min(255, finalVal * 1.25) : Math.max(0, finalVal * 0.42);
        const destIdx = idx << 2;
        pixels[destIdx] = contrastVal;
        pixels[destIdx + 1] = contrastVal;
        pixels[destIdx + 2] = contrastVal;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch {
    ctx.filter = 'contrast(1.4) brightness(1.02) grayscale(1)';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  return canvasToInlineData(canvas);
};

const optimizePdf = async (file) => {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = [];
  let currentYearHint = null;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str || '').join(' ');
    const yearHint = detectSchoolYear(pageText);
    if (yearHint) currentYearHint = yearHint;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = IMAGE_TARGET_WIDTH / baseViewport.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
      background: '#ffffff',
    }).promise;

    pages.push({
      ...canvasToInlineData(canvas),
      label: `${file.name} ${pageNumber}/${pdf.numPages}페이지`,
      yearHint: yearHint || currentYearHint,
    });
  }

  return pages;
};

const optimizeFile = async (file) => {
  if (file.type === 'application/pdf') {
    return optimizePdf(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.src = event.target.result;
      img.onload = () => {
        resolve([{ ...optimizeImageElement(img), label: file.name }]);
      };
    };
    reader.readAsDataURL(file);
  });
};

const assertPayloadSize = (optimizedContent, fileName) => {
  if (optimizedContent.data.length > MAX_GEMINI_INLINE_DATA_CHARS) {
    const mb = (optimizedContent.data.length / 1024 / 1024).toFixed(2);
    throw new Error(
      `${fileName} 파일이 압축 후에도 너무 큽니다. 현재 약 ${mb}MB입니다. PDF는 페이지별 이미지로 저장하거나 더 낮은 해상도의 이미지로 다시 업로드해 주세요.`,
    );
  }
};

const fetchWithRetry = async (url, options, retries = 3, backoff = 900) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const body = await response.text();
      const message = (() => {
        try {
          return JSON.parse(body)?.error?.message || body;
        } catch {
          return body;
        }
      })();
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error(message || '분석 서버 응답 실패');
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

const recoverJson = (text) => {
  const cleanText = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleanText);
  } catch {
    const startIdx = cleanText.indexOf('{');
    if (startIdx === -1) return { detected_rows: 0, grades: [] };

    const jsonString = cleanText.substring(startIdx).replace(/,\s*$/, '');
    const suffixes = ['', '}', ']}', '}]}', '"]}', '"}', 'null}]}', '0}]}'];
    for (const suffix of suffixes) {
      try {
        return JSON.parse(jsonString + suffix);
      } catch {
        // keep trying
      }
    }
    return { detected_rows: 0, grades: [] };
  }
};

const normalizeParsedGrade = (item, index, yearHint = null) => {
  let subjName = item.name ? String(item.name).trim() : '인식불가과목';
  let semester = String(item.semester || '').trim();
  const semesterMatch = semester.match(/([1-3])[^\d]*([1-2])[^\d]*/);

  if (semesterMatch) {
    semester = `${yearHint || semesterMatch[1]}${SCHOOL_YEAR_LABEL} ${semesterMatch[2]}${SEMESTER_LABEL}`;
  } else {
    const termMatch = semester.match(semesterTermPattern);
    const term = termMatch ? Number(termMatch[1] || termMatch[2]) : null;

    if (yearHint && term) {
      semester = `${yearHint}${SCHOOL_YEAR_LABEL} ${term}${SEMESTER_LABEL}`;
    } else {
      const found = SEMESTERS.find((value) => normalizeString(value).includes(normalizeString(semester)));
      semester = found || '1학년 1학기';
    }
  }

  const big6 = ['국어', '수학', '영어', '사회', '과학', '한국사'];
  const parsedGroup = normalizeString(item.group || '');
  const parsedName = normalizeString(subjName);
  let foundBig6 = big6.find((name) => parsedGroup === name || parsedGroup.includes(name));

  if (!foundBig6) {
    const matchedCategory = SUBJECT_CATEGORIES.find(
      (category) =>
        category.id !== '기타' &&
        category.keywords.some((keyword) => parsedName.includes(normalizeString(keyword))) &&
        !category.exclusions.some((keyword) => parsedName.includes(normalizeString(keyword))),
    );
    if (matchedCategory) foundBig6 = matchedCategory.id;
  }

  const nonBig6Keywords = [
    '기술',
    '가정',
    '중국어',
    '일본어',
    '한문',
    '정보',
    '진로',
    '제2외국어',
    '철학',
    '보건',
    '환경',
    '프로그래밍',
    '심리학',
    '교육학',
    '종교',
    '논리학',
    '교양',
    '실용',
    '독일어',
    '프랑스어',
    '스페인어',
    '러시아어',
    '아랍어',
    '베트남어',
  ].map(normalizeString);

  let finalGroup = foundBig6 && big6.includes(foundBig6) ? foundBig6 : '기타';
  if (nonBig6Keywords.some((keyword) => parsedName.includes(keyword) || parsedGroup.includes(keyword))) {
    finalGroup = '기타';
  }

  const absoluteOnlySubjectsName = [
    '과학탐구실험',
    '탐구실험',
    '과학실험탐구',
    '진로',
    '융합과학',
    '생활과과학',
    '기하',
    '물리학2',
    '화학2',
    '생명과학2',
    '지구과학2',
    '고전읽기',
    '영미문학',
    '수학과제',
    '사회문제',
    '창의융합',
    '여행지리',
    '고전과윤리',
    '경제수학',
    '심화국어',
    '심화수학',
    '심화영어',
    '스포츠',
    '합창',
    '음악연주',
    '미술창작',
    '체육생활',
    '스포츠생활',
    '운동',
    '실용수학',
    '실용영어',
    '실용국어',
    '공학일반',
    '창의공학',
    '프로그래밍',
    '인공지능',
    '중국어2',
    '일본어2',
    '한문2',
    '회화',
    '독서감상',
    '과제연구',
    '고전',
    '과제',
    '심화영어회화',
    '심화영어독해',
    '운동과건강',
    '체육탐구',
    '음악실기',
    '미술실기',
    '빅데이터',
    '과학사',
  ].map(normalizeString);
  const absoluteOnlyGroups = ['체육', '예술', '미술', '음악'].map(normalizeString);
  const isAbsoluteForced =
    absoluteOnlySubjectsName.some((keyword) => parsedName.includes(keyword)) ||
    absoluteOnlyGroups.some((keyword) => parsedGroup.includes(keyword));

  let gradeVal = null;
  const rawGrade = String(item.grade || '').trim();
  if (!isAbsoluteForced && !['', '.', '-', '/', 'null', 'undefined'].includes(rawGrade.toLowerCase())) {
    const parsedGrade = Number.parseInt(rawGrade.replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(parsedGrade) && parsedGrade >= 1 && parsedGrade <= 9) gradeVal = parsedGrade;
  }

  let scoreVal = parseNum(item.score);
  let meanVal = parseNum(item.mean);
  const achievement = String(item.achievement || 'A').trim().charAt(0).toUpperCase() || 'A';
  if ((scoreVal === 6 || scoreVal === 6.0) && ['A', 'B', 'C'].includes(achievement)) scoreVal = null;
  if ((meanVal === 6 || meanVal === 6.0) && ['A', 'B', 'C'].includes(achievement)) meanVal = null;

  return {
    id: Date.now() + index + Math.random(),
    type: gradeVal === null ? 'absolute' : 'relative',
    semester,
    group: finalGroup,
    name: subjName,
    credits: parseNum(item.credits) || 1,
    score: scoreVal,
    mean: meanVal,
    achievement,
    grade: gradeVal,
    studentCount: parseNum(item.studentCount),
  };
};

function GradeRow({ row, type, updateRow, removeRow }) {
  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-slate-50/60">
      <td className="px-4 py-2 text-xs">
        <select
          value={row.semester}
          onChange={(event) => updateRow(row.id, 'semester', event.target.value)}
          className="w-full cursor-pointer border-none bg-transparent p-1 font-bold focus:ring-0"
        >
          {SEMESTERS.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <select
          value={row.group}
          onChange={(event) => updateRow(row.id, 'group', event.target.value)}
          className={`w-full cursor-pointer border-none bg-transparent p-1 text-[11px] font-black focus:ring-0 ${
            type === 'relative' ? 'text-blue-700' : 'text-emerald-700'
          }`}
        >
          {SUBJECT_CATEGORIES.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          value={row.name}
          placeholder="과목"
          onChange={(event) => updateRow(row.id, 'name', event.target.value)}
          className="w-full border-none bg-slate-100/70 p-1.5 text-[11px] font-bold transition-all focus:bg-white focus:ring-1"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={row.credits ?? ''}
          onChange={(event) => updateRow(row.id, 'credits', event.target.value === '' ? null : Number(event.target.value))}
          className="mx-auto w-12 border-none bg-slate-100/70 p-1 text-center text-[11px] font-bold"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={row.score ?? ''}
          onChange={(event) => updateRow(row.id, 'score', event.target.value === '' ? null : Number(event.target.value))}
          className="mx-auto w-12 border-none bg-slate-100/70 p-1 text-center text-[11px] font-bold"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          step="0.1"
          value={row.mean ?? ''}
          onChange={(event) => updateRow(row.id, 'mean', event.target.value === '' ? null : Number(event.target.value))}
          className="mx-auto w-12 border-none bg-slate-100/70 p-1 text-center text-[11px] font-bold"
        />
      </td>
      <td className="px-2 py-2">
        <select
          value={row.achievement}
          onChange={(event) => updateRow(row.id, 'achievement', event.target.value)}
          className="mx-auto w-12 border-none bg-slate-100/70 p-1 text-center text-[11px] font-black focus:ring-0"
        >
          {ACHIEVEMENTS.map((achievement) => (
            <option key={achievement} value={achievement}>
              {achievement}
            </option>
          ))}
        </select>
      </td>
      {type === 'relative' && (
        <>
          <td className="px-2 py-2 text-center">
            <input
              type="number"
              min="1"
              max="9"
              value={row.grade ?? ''}
              onChange={(event) => updateRow(row.id, 'grade', event.target.value === '' ? null : Number(event.target.value))}
              className="mx-auto w-10 border-none bg-blue-600 p-1 text-center text-[11px] font-black text-white"
            />
          </td>
          <td className="px-2 py-2">
            <input
              type="number"
              value={row.studentCount ?? ''}
              onChange={(event) =>
                updateRow(row.id, 'studentCount', event.target.value === '' ? null : Number(event.target.value))
              }
              className="mx-auto w-16 border-none bg-slate-100/70 p-1 text-center text-[11px] font-bold"
            />
          </td>
        </>
      )}
      <td className="px-4 py-2 text-right print:hidden">
        <button
          type="button"
          onClick={() => removeRow(row.id)}
          className="p-1 text-slate-300 opacity-0 transition-colors hover:text-red-500 group-hover:opacity-100"
          aria-label={`${row.name || '과목'} 삭제`}
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

const MemoGradeRow = React.memo(GradeRow);

function TableSection({ title, grades, type, updateRow, removeRow, addRow }) {
  return (
    <section className="mb-6 overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md print:border-slate-300 print:shadow-none">
      <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 p-4 backdrop-blur-md print:p-2">
        <h2 className="text-lg font-black tracking-tight text-slate-800">{title}</h2>
        <button
          type="button"
          onClick={() => addRow(type)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 print:hidden ${
            type === 'relative' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}
        >
          <Plus size={14} /> 과목 추가
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left print:min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3">학년/학기</th>
              <th className="px-2 py-3">교과</th>
              <th className="px-2 py-3">과목</th>
              <th className="w-14 px-2 py-3 text-center">학점(수)</th>
              <th className="w-14 px-2 py-3 text-center">원점수</th>
              <th className="w-14 px-2 py-3 text-center">과목평균</th>
              <th className="w-14 px-2 py-3 text-center">성취도</th>
              {type === 'relative' && (
                <>
                  <th className="w-14 px-2 py-3 text-center">석차등급</th>
                  <th className="w-20 px-2 py-3 text-center">수강자수</th>
                </>
              )}
              <th className="w-10 px-4 py-3 print:hidden" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {grades.map((row) => (
              <MemoGradeRow key={row.id} row={row} type={type} updateRow={updateRow} removeRow={removeRow} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UniversityChart({ userGrade, data, title, isFiveGrade }) {
  const gpa = Number.parseFloat(userGrade);
  const isValid = !Number.isNaN(gpa) && gpa > 0;
  const chartMin = 1.0;
  const chartMax = isFiveGrade ? 3.5 : 4.5;
  const range = chartMax - chartMin;
  const chartContentWidth = data.length * 55 + (data.length > 0 ? (data.length - 1) * 12 : 0);

  return (
    <section className="mt-6 overflow-hidden border border-slate-200 bg-white shadow-sm print:hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4">
        <Trophy className="text-amber-500" size={18} />
        <h2 className="text-md font-black">{title}</h2>
      </div>
      <div className="relative overflow-x-auto overflow-y-hidden bg-white pb-16 pt-12">
        <div className="relative inline-flex h-[320px] min-w-full items-end gap-3 px-10">
          {isValid && (
            <div
              className="pointer-events-none absolute z-20 border-t-2 border-dashed border-red-500 transition-all duration-500"
              style={{
                bottom: `${Math.max(0, Math.min(280, (1 - (gpa - chartMin) / range) * 280 + 35))}px`,
                left: '40px',
                width: `${chartContentWidth}px`,
              }}
            >
              <div className="absolute left-[-5px] top-0 z-30 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap bg-red-600 px-2 py-1 text-[10px] font-black text-white shadow-lg">
                내위치 <span>{gpa.toFixed(2)}</span>
              </div>
            </div>
          )}

          {data.map((univ) => {
            const barBottom = (1 - (univ.max - chartMin) / range) * 280;
            const barHeight = ((univ.max - univ.min) / range) * 280;
            return (
              <div key={univ.name} className="group relative flex shrink-0 flex-col items-center" style={{ width: '55px' }}>
                <div className="relative flex h-[280px] w-10 flex-col justify-end overflow-hidden bg-slate-100/70 shadow-inner">
                  <div
                    className="absolute w-full transition-all duration-700"
                    style={{
                      bottom: `${barBottom}px`,
                      height: `${barHeight}px`,
                      backgroundColor: univ.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span className="mt-4 origin-left rotate-45 whitespace-nowrap text-[10px] font-black text-slate-700">
                  {univ.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [grades, setGrades] = useState(sampleGrades);
  const [activeTab, setActiveTab] = useState('input');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [stagedFiles, setStagedFiles] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('서울권');
  const [manualGpa, setManualGpa] = useState('');
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleAuth = async (event) => {
    event?.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '인증 서버 응답 실패');
      if (result.ok) {
        setIsAuthenticated(true);
      } else {
        setAuthError('유효하지 않은 보안 코드입니다. 전문가용 코드를 확인해 주세요.');
      }
    } catch (error) {
      if (import.meta.env.DEV && ['0000', '8405'].includes(passwordInput.trim().toLowerCase())) {
        setIsAuthenticated(true);
      } else {
        setAuthError(error.message || '인증 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const runPrecisionAnalysis = async () => {
    if (stagedFiles.length === 0) {
      setUploadStatus({ type: 'error', message: '먼저 분석할 파일을 추가해 주세요.' });
      return;
    }

    setIsAnalyzing(true);
    setUploadStatus({ type: 'info', message: '초정밀 비전 스캔 가동: 파일을 1개씩 압축 분석 중입니다...' });

    try {
      const systemInstruction = `당신은 대한민국 고등학교 생활기록부 '교과학습발달상황' 내신성적표 전용 초정밀 데이터 추출 비전 AI입니다.
오직 '교과학습발달상황' 하위의 [1학년], [2학년], [3학년] 성적 표 내부 데이터 행만 수집하십시오.
인적학적사항, 출결상황, 수상경력, 창의적 체험활동상황, 독서활동상황, 행동특성 및 종합의견, 봉사활동실적, 세부능력 및 특기사항 등 성적 표가 아닌 영역은 모두 무시하십시오.
석차등급, 원점수, 과목평균이 공란이거나 '.', '-', '/'로 표기된 경우 임의 숫자를 만들지 말고 반드시 "" 또는 "null"로 반환하십시오.
성취도나 등급이 P인 과목은 최종 배열에서 제외하십시오.
교과는 국어, 수학, 영어, 사회, 과학, 한국사, 기타 중 하나로만 반환하십시오.`;

      const extractedGrades = [];
      let currentYearHint = null;

      for (let index = 0; index < stagedFiles.length; index += 1) {
        const stagedFile = stagedFiles[index];
        setUploadStatus({
          type: 'info',
          message: `파일 분석 중 (${index + 1}/${stagedFiles.length}): ${stagedFile.name}`,
        });

        const optimizedContents = await optimizeFile(stagedFile.file);

        for (let contentIndex = 0; contentIndex < optimizedContents.length; contentIndex += 1) {
          const optimizedContent = optimizedContents[contentIndex];
          const effectiveYearHint = optimizedContent.yearHint || currentYearHint;
          assertPayloadSize(optimizedContent, optimizedContent.label || stagedFile.name);
          setUploadStatus({
            type: 'info',
            message: `분석 요청 중 (${index + 1}/${stagedFiles.length}): ${optimizedContent.label || stagedFile.name}`,
          });

          const payload = {
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${effectiveYearHint ? `이 페이지는 학생부의 [${effectiveYearHint}학년] 영역입니다. semester의 학년은 반드시 ${effectiveYearHint}학년으로 유지하세요.\n` : ''}이미지에 [1학년], [2학년], [3학년] 제목만 보이면 detected_year에 해당 학년을 반환하세요. 세특, 행동특성, 출결 등 불필요한 섹션은 모두 무시하고 오직 1~3학년 성적표 테이블 데이터만 JSON으로 추출하세요. 빈칸에 가짜 숫자를 넣지 마세요.`,
                  },
                  {
                    inlineData: { mimeType: optimizedContent.mimeType, data: optimizedContent.data },
                  },
                ],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: `${systemInstruction}
학년 문맥만은 예외적으로 표 바깥의 [1학년], [2학년], [3학년] 제목도 읽어 detected_year에 반환하십시오. 다른 항목의 파싱 규칙은 기존 지시를 그대로 따르십시오.`,
                },
              ],
            },
            generationConfig: {
              temperature: 0,
              responseMimeType: 'application/json',
              topP: 0.1,
              maxOutputTokens: 8192,
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  detected_rows: { type: 'INTEGER' },
                  detected_year: { type: 'STRING' },
                  grades: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        semester: { type: 'STRING' },
                        group: { type: 'STRING' },
                        name: { type: 'STRING' },
                        credits: { type: 'STRING' },
                        score: { type: 'STRING' },
                        mean: { type: 'STRING' },
                        achievement: { type: 'STRING' },
                        grade: { type: 'STRING' },
                        studentCount: { type: 'STRING' },
                      },
                      required: ['semester', 'group', 'name'],
                    },
                  },
                },
              },
            },
          };

          const response = await fetchWithRetry('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }, 0);
          const result = await response.json();
          const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) throw new Error(result.error?.message || 'AI 응답을 수신하지 못했습니다.');

          const parsedData = recoverJson(rawText);
          const detectedYear = parseDetectedYear(parsedData.detected_year);
          if (!Array.isArray(parsedData.grades)) {
            if (detectedYear) {
              parsedData.grades = [];
            } else {
              throw new Error('데이터 구조가 유효하지 않습니다.');
            }
          }
          if (detectedYear) currentYearHint = detectedYear;
          if (optimizedContent.yearHint) currentYearHint = optimizedContent.yearHint;

          extractedGrades.push(
            ...parsedData.grades
              .filter((item) => {
                if (!item.name) return false;
                const achievement = String(item.achievement || '').toUpperCase().trim();
                const grade = String(item.grade || '').toUpperCase().trim();
                return !(achievement === 'P' || grade === 'P' || achievement.includes('P') || grade.includes('P'));
              })
              .map((item, itemIndex) => normalizeParsedGrade(item, itemIndex, optimizedContent.yearHint || currentYearHint)),
          );
        }
      }

      setGrades((previous) => {
        const repairedGrades = repairSemesterSequence(extractedGrades);
        const isInitialDummy = previous.length === 2 && previous[0].id === 1 && previous[1].id === 2;
        if (isInitialDummy) return repairedGrades;

        const existingKeys = new Set(previous.map((grade) => `${grade.semester}-${grade.name}`));
        const uniqueNewGrades = repairedGrades.filter((grade) => !existingKeys.has(`${grade.semester}-${grade.name}`));
        return [...previous, ...uniqueNewGrades];
      });

      setUploadStatus({
        type: 'success',
        message: `분석 완료: ${extractedGrades.filter((grade) => grade.grade !== null).length}개의 데이터가 추출되었습니다. 누락분은 같은 파일 상태에서 다시 이어서 파싱할 수 있습니다.`,
      });
    } catch (error) {
      setUploadStatus({ type: 'error', message: `분석 오류: ${error.message}` });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileStage = (event, type) => {
    const files = Array.from(event.target.files || []);
    const newStaged = files.map((file) => ({ id: Date.now() + Math.random(), file, name: file.name, type }));
    setStagedFiles((previous) => [...previous, ...newStaged]);
    event.target.value = '';
  };

  const updateRow = useCallback((id, field, value) => {
    setGrades((previous) =>
      previous.map((grade) => {
        if (grade.id !== id) return grade;
        const updated = { ...grade, [field]: value };
        if (field === 'grade') updated.type = value === null ? 'absolute' : 'relative';
        return updated;
      }),
    );
  }, []);

  const removeRow = useCallback((id) => setGrades((previous) => previous.filter((grade) => grade.id !== id)), []);

  const addRow = useCallback((type) => {
    setGrades((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        type,
        semester: '1학년 1학기',
        group: '국어',
        name: '',
        credits: 1,
        score: null,
        mean: null,
        achievement: 'A',
        grade: type === 'relative' ? 1 : null,
        studentCount: type === 'relative' ? 0 : null,
      },
    ]);
  }, []);

  const analysis = useMemo(() => {
    const calcAvg = (items) => {
      let totalCredits = 0;
      let weightedScore = 0;
      let validCount = 0;
      items
        .filter((item) => item.grade !== null && item.grade >= 1 && item.grade <= 9)
        .forEach((item) => {
          const credits = Number.parseFloat(item.credits) || 0;
          const grade = Number.parseFloat(item.grade) || 0;
          if (credits > 0) {
            totalCredits += credits;
            weightedScore += credits * grade;
            validCount += 1;
          }
        });
      return validCount > 0 ? (weightedScore / totalCredits).toFixed(2) : '-';
    };

    const categories = ['전교과', '국수영사과', '국수영사', '국수영과', '국어', '수학', '영어', '사회', '과학'];
    const getFilter = (category) => {
      if (category === '전교과') return () => true;
      const mapping = {
        국수영사과: ['국어', '수학', '영어', '사회', '과학', '한국사'],
        국수영사: ['국어', '수학', '영어', '사회', '한국사'],
        국수영과: ['국어', '수학', '영어', '과학'],
        국어: ['국어'],
        수학: ['수학'],
        영어: ['영어'],
        사회: ['사회', '한국사'],
        과학: ['과학'],
      };
      return (grade) => mapping[category].includes(grade.group);
    };

    const semesterMatrix = categories.map((category) => ({
      label: category,
      all: calcAvg(grades.filter(getFilter(category))),
      ...SEMESTERS.reduce(
        (acc, semester) => ({
          ...acc,
          [semester]: calcAvg(grades.filter(getFilter(category)).filter((grade) => grade.semester === semester)),
        }),
        {},
      ),
    }));

    const gradeMatrix = categories.map((category) => ({
      label: category,
      all: calcAvg(grades.filter(getFilter(category))),
      ...YEARS.reduce(
        (acc, year) => ({
          ...acc,
          [year]: calcAvg(grades.filter(getFilter(category)).filter((grade) => grade.semester.startsWith(year))),
        }),
        {},
      ),
    }));

    const trendSubjects = ['국어', '수학', '영어', '과학', '사회'];
    const trendData = trendSubjects.map((subject) => ({
      subject,
      data: SEMESTERS.map((semester) => {
        const value = calcAvg(
          grades
            .filter((grade) => (subject === '사회' ? ['사회', '한국사'].includes(grade.group) : grade.group === subject))
            .filter((grade) => grade.semester === semester),
        );
        return { name: semester.replace('학년 ', '-').replace('학기', ''), value: value === '-' ? null : Number.parseFloat(value) };
      }),
    }));

    return { semesterMatrix, gradeMatrix, trendData };
  }, [grades]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-4 font-sans">
        <div className="relative w-full max-w-[380px] bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-[#2563eb] shadow-xl shadow-blue-100">
            <Lock className="text-white" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-800">보안 코드 인증</h1>
          <p className="mb-8 text-[13px] font-medium leading-relaxed text-slate-500">
            데이터 분석 시스템입니다.
            <br />
            접근을 위해 보안 코드를 입력해 주세요.
          </p>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                placeholder="보안 코드 입력"
                className="w-full border-none bg-[#f1f5f9] py-3.5 pl-12 pr-4 font-bold text-slate-800 transition-all placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {authError && <p className="text-[11px] font-bold text-red-500">{authError}</p>}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="flex w-full items-center justify-center gap-3 bg-[#2563eb] py-3.5 text-md font-black text-white shadow-lg shadow-blue-200 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {isAuthenticating ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 시스템 접속
            </button>
          </form>
          <div className="mt-12 text-[9px] font-black uppercase tracking-widest text-slate-300">SECURED BY IPSISKETCH DATA LAB</div>
        </div>
      </div>
    );
  }

  const defaultTotalGpa = analysis.semesterMatrix[0]?.all !== '-' ? analysis.semesterMatrix[0].all : '';
  const effectiveGpa = manualGpa !== '' ? manualGpa : defaultTotalGpa;

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 md:p-8">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { background: white !important; padding: 0 !important; }
              header, footer, main { display: none !important; }
              .shadow-xl, .shadow-md, .shadow-sm { box-shadow: none !important; }
              table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #e2e8f0 !important; }
              th, td { border: 1px solid #e2e8f0 !important; padding: 6px !important; font-size: 9pt !important; color: black !important; }
            }
          `,
        }}
      />

      <header className="mx-auto mb-6 flex max-w-[1450px] items-center justify-between print:hidden">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <GraduationCap className="text-blue-600" /> 내신 정밀 분석 리포트
        </h1>
        <div className="flex border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`px-6 py-2 text-xs font-bold ${activeTab === 'input' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            데이터 입력
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-2 text-xs font-bold ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            정밀 리포트
          </button>
        </div>
      </header>

      <div className="hidden print:block font-sans text-slate-900">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-black">내신성적 정밀 분석 리포트</h1>
          <p className="text-xs text-slate-400">IPSISKETCH DATA LAB</p>
        </div>
        <PrintTable title="내신성적 정밀 분석표 (학기별)" icon={<TableIcon size={16} />} rows={analysis.semesterMatrix} columns={SEMESTERS} />
        <PrintTable title="내신성적 정밀 분석표 (학년별)" icon={<Layers size={16} />} rows={analysis.gradeMatrix} columns={YEARS} />
        <div className="mt-12 border-t pt-4 text-center text-[9px] text-slate-400">
          본 리포트는 IPSISKETCH DATA LAB의 초정밀 분석 엔진으로 생성되었습니다.
        </div>
      </div>

      <main className="mx-auto max-w-[1450px] print:hidden">
        {activeTab === 'input' ? (
          <div className="space-y-6">
            <section className="relative overflow-hidden bg-[#0f172a] p-10 text-white shadow-xl">
              <div className="absolute right-0 top-0 -mr-40 -mt-40 h-80 w-80 bg-blue-500/10 blur-3xl" />
              <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center border border-dashed border-slate-700 p-10 transition-all hover:border-blue-500 hover:bg-white/5"
                >
                  <input type="file" accept="application/pdf" multiple onChange={(event) => handleFileStage(event, 'pdf')} ref={pdfInputRef} className="hidden" />
                  <FileText size={36} className="mb-4 text-slate-400 group-hover:text-blue-400" />
                  <p className="mb-1 text-lg font-black">PDF 파일 추가</p>
                  <p className="text-[11px] font-medium text-slate-500">나이스 성적표 PDF 전용</p>
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center border border-dashed border-slate-700 p-10 transition-all hover:border-emerald-500 hover:bg-white/5"
                >
                  <input type="file" accept="image/*" multiple onChange={(event) => handleFileStage(event, 'image')} ref={imageInputRef} className="hidden" />
                  <ImageIcon size={36} className="mb-4 text-slate-400 group-hover:text-emerald-400" />
                  <p className="mb-1 text-lg font-black">사진/이미지 추가</p>
                  <p className="text-[11px] font-medium text-slate-500">성적표 사진 한 장씩 추가 가능</p>
                </button>
              </div>

              {stagedFiles.length > 0 && (
                <div className="mt-8 border border-white/10 bg-black/40 p-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <span className="text-xs font-black text-blue-300">대기 중인 파일 ({stagedFiles.length})</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGrades(sampleGrades())}
                        className="hidden bg-slate-700 px-4 py-3.5 text-xs font-bold text-white transition-all hover:bg-slate-600 md:block"
                      >
                        데이터 초기화
                      </button>
                      <button
                        type="button"
                        onClick={runPrecisionAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center gap-3 bg-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Calculator size={18} />} 데이터 이어서 추가 파싱
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stagedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 border border-white/10 bg-white/5 px-3 py-2 text-[10px]">
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <button type="button" onClick={() => setStagedFiles((previous) => previous.filter((item) => item.id !== file.id))} aria-label={`${file.name} 제거`}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {uploadStatus.message && (
                <div
                  className={`mt-4 p-3 text-xs font-bold ${
                    uploadStatus.type === 'error'
                      ? 'bg-red-500/20 text-red-400'
                      : uploadStatus.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {uploadStatus.message}
                </div>
              )}
            </section>

            <div className="space-y-6">
              <TableSection title="상대평가 (석차등급)" type="relative" updateRow={updateRow} removeRow={removeRow} addRow={addRow} grades={grades.filter((grade) => grade.grade !== null)} />
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700"
              >
                <Printer size={16} /> 리포트 인쇄
              </button>
            </div>

            <ReportTable title="내신성적 정밀 분석표 (학기별)" icon={<TableIcon className="text-blue-600" size={18} />} rows={analysis.semesterMatrix} columns={SEMESTERS} accent="blue" />
            <ReportTable title="내신성적 정밀 분석표 (학년별)" icon={<Layers className="text-indigo-600" size={18} />} rows={analysis.gradeMatrix} columns={YEARS} accent="indigo" />

            <section className="space-y-10 print:hidden">
              <div className="flex items-center gap-3 p-4">
                <TrendingUp className="text-blue-600" size={20} />
                <h2 className="text-md font-black">주요 교과별 성적 추이 분석 (1등급 하단 기준)</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {analysis.trendData.map((subject) => (
                  <div key={subject.subject} className="flex h-[280px] flex-col border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-6 text-[13px] font-black text-slate-700">{subject.subject} 성적 변화</h3>
                    <div className="w-full flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={subject.data} margin={{ top: 25, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} />
                          <YAxis domain={[1, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} connectNulls>
                            <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fill: '#1e293b', fontWeight: '900' }} offset={12} />
                          </Line>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-10">
                <div className="mb-6 flex flex-col gap-4 px-2">
                  <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
                    <MapPin size={22} className="text-blue-600" /> 권역별 대학 내신 지원 가능성 진단
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <label className="bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">권역 선택</label>
                      <select
                        value={selectedRegion}
                        onChange={(event) => setSelectedRegion(event.target.value)}
                        className="cursor-pointer appearance-none bg-transparent pr-8 text-sm font-black text-slate-800 focus:outline-none"
                      >
                        {Object.keys(REGION_DATA).map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden h-6 w-px bg-slate-200 md:block" />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                        <Edit3 size={14} /> 나의 내신 시뮬레이션
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1.00"
                        max="9.00"
                        placeholder={defaultTotalGpa || '0.00'}
                        value={manualGpa}
                        onChange={(event) => setManualGpa(event.target.value)}
                        className="w-20 border-b-2 border-slate-200 bg-transparent pb-0.5 text-center text-sm font-black text-blue-600 transition-colors placeholder:text-slate-300 focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">등급</span>
                    </div>
                  </div>
                </div>

                <UniversityChart
                  userGrade={effectiveGpa}
                  data={getFormattedChartData(selectedRegion, false)}
                  title={`[${selectedRegion}] 주요 대학 지원 가능성 진단 (전교과 기준 - 현재 9등급제 70%컷)`}
                  isFiveGrade={false}
                />
                <UniversityChart
                  userGrade={effectiveGpa}
                  data={getFormattedChartData(selectedRegion, true)}
                  title={`[${selectedRegion}] 주요 대학 지원 가능성 진단 (전교과 기준 - 5등급제 예상 70%컷)`}
                  isFiveGrade
                />
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="mx-auto mt-20 max-w-[1450px] border-t border-slate-200 py-10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 print:hidden">
        ADMISSIONS DATA IPSISKETCH LAB. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}

function ReportTable({ title, icon, rows, columns, accent }) {
  const accentClass = accent === 'indigo' ? 'text-indigo-600 bg-indigo-50/5' : 'text-blue-600 bg-blue-50/5';
  const headerAccentClass = accent === 'indigo' ? 'text-indigo-700 bg-indigo-50/50' : 'text-blue-700 bg-blue-50/50';

  return (
    <section className="border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4">
        {icon}
        <h2 className="text-md font-black">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[9px] font-black uppercase text-slate-500">
              <th className="border-r border-slate-100 px-4 py-2">교과 분류</th>
              <th className={`border-r border-slate-100 px-3 py-2 text-center font-black ${headerAccentClass}`}>전체 평균</th>
              {columns.map((column) => (
                <th key={column} className="border-r border-slate-100 px-2 py-2 text-center">
                  {column.replace('학년 ', '-').replace('학기', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="border-r border-slate-100 px-4 py-2 text-[11px] font-bold">{row.label}</td>
                <td className={`border-r border-slate-100 px-3 py-2 text-center text-[11px] font-black ${accentClass}`}>{row.all}</td>
                {columns.map((column) => (
                  <td key={column} className="border-r border-slate-100 px-2 py-2 text-center text-[11px] font-semibold">
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PrintTable({ title, icon, rows, columns }) {
  return (
    <div className="mb-6 border border-slate-300">
      <div className="flex items-center gap-2 border-b border-slate-300 bg-slate-50 p-3 text-sm font-bold">
        {icon} {title}
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100 text-[10px] font-black uppercase">
            <th className="border-r border-slate-200 px-3 py-2">교과 분류</th>
            <th className="border-r border-slate-200 px-3 py-2 text-center font-black text-blue-700">전체 평균</th>
            {columns.map((column) => (
              <th key={column} className="border-r border-slate-200 px-2 py-2 text-center">
                {column.replace('학년 ', '-').replace('학기', '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row.label} className="text-[11px]">
              <td className="border-r border-slate-200 px-3 py-2 font-bold">{row.label}</td>
              <td className="border-r border-slate-200 bg-blue-50/20 px-3 py-2 text-center font-black text-blue-600">{row.all}</td>
              {columns.map((column) => (
                <td key={column} className="border-r border-slate-200 px-2 py-2 text-center">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
