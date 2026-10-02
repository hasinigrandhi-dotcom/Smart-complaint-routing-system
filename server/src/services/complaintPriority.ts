/*
 * Purpose: calculate an initial complaint priority score using severity, urgency,
 * category, and complaint age. This is intentionally simple and readable so it can
 * be explained clearly during a viva or academic demonstration.
 *
 * Input: complaint payload with severity, urgency, category, and created timestamp.
 * Output: a numeric priority score in the range 0 to 100.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 *
 * Explanation:
 * - Severity and urgency are weighted most heavily because they represent the
 *   urgency of the issue and the level of impact.
 * - Category boosts are added to reflect the seriousness of some categories such
 *   as public safety and electricity.
 * - Age increases the score slowly so old unresolved issues gain priority over time.
 */

export type ComplaintCategory =
  | 'WATER_SUPPLY'
  | 'ROADS'
  | 'ELECTRICITY'
  | 'SANITATION'
  | 'GARBAGE'
  | 'PUBLIC_SAFETY'
  | 'STREET_LIGHTS'
  | 'OTHER';

const CATEGORY_WEIGHT: Record<ComplaintCategory, number> = {
  WATER_SUPPLY: 12,
  ROADS: 10,
  ELECTRICITY: 15,
  SANITATION: 14,
  GARBAGE: 11,
  PUBLIC_SAFETY: 18,
  STREET_LIGHTS: 9,
  OTHER: 7
};

export function calculateComplaintPriority(
  severity: number,
  urgency: number,
  category: ComplaintCategory,
  createdAt: Date | string
) {
  const severityWeight = Number(severity) || 1;
  const urgencyWeight = Number(urgency) || 1;
  const categoryWeight = CATEGORY_WEIGHT[category] || CATEGORY_WEIGHT.OTHER;

  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const ageHours = Math.max(0, (Date.now() - createdDate.getTime()) / (1000 * 60 * 60));
  const ageBoost = Math.min(20, ageHours / 4);

  const normalizedSeverity = (severityWeight / 5) * 40;
  const normalizedUrgency = (urgencyWeight / 5) * 35;
  const categoryContribution = categoryWeight;

  const score = normalizedSeverity + normalizedUrgency + categoryContribution + ageBoost;

  return Number(Math.min(100, Math.max(0, score)).toFixed(2));
}

export function getComplaintPriorityLevel(score: number) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Low';
  return 'Very Low';
}
