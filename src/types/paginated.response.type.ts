export interface PaginatedResponseType<T> {
  content: T[];
  totalRecords: number;
  page: number;
  size: number;
  totalPages: number;
}