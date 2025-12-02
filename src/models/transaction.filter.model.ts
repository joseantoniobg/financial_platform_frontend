import { PaginationFilterModel } from "./pagination.filter.model";

export class TransactionFilterModel extends PaginationFilterModel {
  initialDate: string = '';
  finalDate: string = '';
  walletId: string = 'None';
  categoryIds: string[] = [];
  typeIds: string[] = [];
}
