import { binarySearch, linearSearch } from '../algorithms/searching/searching';
import { mergeSort, quickSort, type Comparator } from '../algorithms/sorting/sorting';

export type ComplaintSortKey = 'priority' | 'date' | 'status' | 'category' | 'title';
export type SortDirection = 'asc' | 'desc';

export type ComplaintLike = {
  id: string;
  title?: string | null;
  status?: string | null;
  category?: string | null;
  priorityScore?: number | null;
  createdAt?: Date | string | null;
};

function compareByPriority(left: ComplaintLike, right: ComplaintLike): number {
  const leftValue = Number(left.priorityScore ?? 0);
  const rightValue = Number(right.priorityScore ?? 0);

  if (leftValue !== rightValue) {
    return leftValue - rightValue;
  }

  return String(left.id).localeCompare(String(right.id));
}

function compareByDate(left: ComplaintLike, right: ComplaintLike): number {
  const leftTime = new Date(left.createdAt ?? 0).getTime();
  const rightTime = new Date(right.createdAt ?? 0).getTime();

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return String(left.id).localeCompare(String(right.id));
}

function compareByStatus(left: ComplaintLike, right: ComplaintLike): number {
  const leftValue = String(left.status ?? '').toLowerCase();
  const rightValue = String(right.status ?? '').toLowerCase();

  if (leftValue !== rightValue) {
    return leftValue.localeCompare(rightValue);
  }

  return String(left.id).localeCompare(String(right.id));
}

function compareByCategory(left: ComplaintLike, right: ComplaintLike): number {
  const leftValue = String(left.category ?? '').toLowerCase();
  const rightValue = String(right.category ?? '').toLowerCase();

  if (leftValue !== rightValue) {
    return leftValue.localeCompare(rightValue);
  }

  return String(left.id).localeCompare(String(right.id));
}

function compareByTitle(left: ComplaintLike, right: ComplaintLike): number {
  const leftValue = String(left.title ?? '').toLowerCase();
  const rightValue = String(right.title ?? '').toLowerCase();

  if (leftValue !== rightValue) {
    return leftValue.localeCompare(rightValue);
  }

  return String(left.id).localeCompare(String(right.id));
}

function getComparator(sortKey: ComplaintSortKey): Comparator<ComplaintLike> {
  switch (sortKey) {
    case 'priority':
      return compareByPriority;
    case 'date':
      return compareByDate;
    case 'status':
      return compareByStatus;
    case 'category':
      return compareByCategory;
    case 'title':
      return compareByTitle;
    default:
      return compareByDate;
  }
}

export function sortComplaints(
  complaints: ComplaintLike[],
  sortKey: ComplaintSortKey = 'priority',
  direction: SortDirection = 'desc'
): ComplaintLike[] {
  /**
   * Sort complaints using the best algorithm for the chosen key:
   * - string-like keys (title, category, status) use Quick Sort
   * - numeric/date keys use Merge Sort (stable for demo clarity)
   * Returns a new array; original input is not mutated.
   */
  const comparator = getComparator(sortKey);
  const sorted = sortKey === 'title' || sortKey === 'category' || sortKey === 'status'
    ? quickSort(complaints, comparator)
    : mergeSort(complaints, comparator);

  if (direction === 'asc') {
    return sorted;
  }

  return [...sorted].reverse();
}

export function findComplaintByIdLinear(complaints: ComplaintLike[], complaintId: string): ComplaintLike | null {
  const target = { id: complaintId } as ComplaintLike;
  const index = linearSearch(complaints, target, (complaint, targetComplaint) => {
    return complaint.id === targetComplaint.id ? 0 : complaint.id.localeCompare(targetComplaint.id ?? '');
  });

  return index === -1 ? null : complaints[index];
}

export function findComplaintByIdBinary(complaints: ComplaintLike[], complaintId: string): ComplaintLike | null {
  const sortedById = quickSort(complaints, (left, right) => String(left.id).localeCompare(String(right.id)));
  const target = { id: complaintId } as ComplaintLike;
  const index = binarySearch(sortedById, target, (item, targetComplaint) => {
    return String(item.id).localeCompare(String(targetComplaint.id ?? ''));
  });

  return index === -1 ? null : sortedById[index];
}
