const parseSortBy = (value) => {
  if (typeof value !== 'string') {
    return 'name';
  }

  const validSortKeys = [
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'contactType',
    '_id',
    'createdAt',
  ];

  return validSortKeys.includes(value) ? value : 'name';
};

const parseSortOrder = (value) => {
  if (typeof value !== 'string') {
    return 'asc';
  }

  return ['asc', 'desc'].includes(value) ? value : 'asc';
};

export const parseSortParams = (query) => {
  const { sortBy, sortOrder } = query;

  return {
    sortBy: parseSortBy(sortBy),
    sortOrder: parseSortOrder(sortOrder),
  };
};
