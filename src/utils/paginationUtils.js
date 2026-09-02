export function getPaginationItems(currentPage, totalPages, siblingCount = 1) {
  const total = Math.max(0, Math.floor(Number(totalPages) || 0));
  if (total === 0) return [];

  const current = Math.min(total, Math.max(1, Math.floor(Number(currentPage) || 1)));
  const siblings = Math.max(0, Math.floor(Number(siblingCount) || 0));
  const visiblePageCount = (siblings * 2) + 3;

  if (total <= visiblePageCount) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const items = [1];

  if (start > 2) items.push('start-ellipsis');
  for (let page = start; page <= end; page++) items.push(page);
  if (end < total - 1) items.push('end-ellipsis');

  items.push(total);
  return items;
}
