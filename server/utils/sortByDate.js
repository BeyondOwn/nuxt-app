export function sortByDate(array, dateKey, order = 'asc') {
  return array.slice().sort((a, b) => {
    const dateA = new Date(a[dateKey]);
    const dateB = new Date(b[dateKey]);

    let comparison = 0;
    if (dateA < dateB) {
      comparison = -1;
    } else if (dateA > dateB) {
      comparison = 1;
    }

    if (order.toLowerCase() === 'desc') {
      return comparison * -1; // Reverse the comparison for descending order
    }

    return comparison; // Default: ascending order
  });
}