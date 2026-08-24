import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildStudentProfileWhere, buildDriveWhere } from './analytics.service';
import { INSIGHT_THRESHOLDS } from './analytics.constants';

export interface SkillGapRow {
  skill: string;
  studentSupply: number;
  recruiterDemand: number;
  gap: number;
  coverage: number;
}

export interface SkillGapResponse {
  skills: SkillGapRow[];
  topShortages: SkillGapRow[];
  topSurpluses: SkillGapRow[];
  recommendations: { skill: string; gap: number; recommendation: string }[];
}

/**
 * Parse skills from JSON fields. Skills may be stored as:
 * - JSON array of strings: ["Python", "Java"]
 * - JSON array of objects: [{ name: "Python" }]
 * - Comma-separated string: "Python, Java"
 */
function parseSkills(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (Array.isArray(raw)) {
    return raw.map(item =>
      typeof item === 'string' ? item.trim() :
      typeof item === 'object' && item !== null && 'name' in item ? String((item as any).name).trim() :
      ''
    ).filter(Boolean);
  }
  return [];
}

export async function getSkillGap(filters: AnalyticsFilterInput): Promise<SkillGapResponse> {
  const studentWhere = buildStudentProfileWhere(filters);
  const driveWhere = buildDriveWhere(filters);

  // Get student skills (supply)
  const studentProfiles = await prisma.studentProfile.findMany({
    where: studentWhere,
    select: { skills: true },
  });

  const supplyMap = new Map<string, number>();
  for (const profile of studentProfiles) {
    const skills = parseSkills(profile.skills);
    for (const skill of skills) {
      const normalized = skill.toLowerCase();
      supplyMap.set(normalized, (supplyMap.get(normalized) || 0) + 1);
    }
  }

  // Get recruiter demand from drives
  const drives = await prisma.placementDrive.findMany({
    where: driveWhere,
    select: { requiredSkills: true, preferredSkills: true, technologyStack: true },
  });

  const demandMap = new Map<string, number>();
  for (const drive of drives) {
    const allSkills = [
      ...parseSkills(drive.requiredSkills),
      ...parseSkills(drive.preferredSkills),
      ...parseSkills(drive.technologyStack),
    ];
    for (const skill of allSkills) {
      const normalized = skill.toLowerCase();
      demandMap.set(normalized, (demandMap.get(normalized) || 0) + 1);
    }
  }

  // Merge supply and demand
  const allSkills = new Set([...supplyMap.keys(), ...demandMap.keys()]);
  const skills: SkillGapRow[] = [];

  for (const skill of allSkills) {
    const supply = supplyMap.get(skill) || 0;
    const demand = demandMap.get(skill) || 0;
    const gap = supply - demand;
    const coverage = demand > 0 ? parseFloat(((supply / demand) * 100).toFixed(1)) : supply > 0 ? 100 : 0;

    skills.push({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      studentSupply: supply,
      recruiterDemand: demand,
      gap,
      coverage,
    });
  }

  // Sort by gap (most shortage first)
  skills.sort((a, b) => a.gap - b.gap);

  const topShortages = skills.filter(s => s.gap < 0).slice(0, 10);
  const topSurpluses = [...skills].filter(s => s.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 10);

  // Generate training recommendations for significant shortages
  const recommendations = topShortages
    .filter(s => Math.abs(s.gap) >= INSIGHT_THRESHOLDS.skillGapThreshold)
    .map(s => ({
      skill: s.skill,
      gap: Math.abs(s.gap),
      recommendation: `${s.skill} has a ${Math.abs(s.gap)}-candidate shortage (${s.coverage}% coverage). Consider creating a ${s.skill} training program for approximately ${Math.abs(s.gap)} students.`,
    }));

  return { skills, topShortages, topSurpluses, recommendations };
}
