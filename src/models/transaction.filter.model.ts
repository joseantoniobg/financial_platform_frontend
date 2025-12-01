import { PaginationFilterModel } from "./pagination.filter.model";

export class TransactionFilterModel extends PaginationFilterModel {
  initialDate: string = '';
  finalDate: string = '';
  walletId: string = 'None';
  categoryId: string = 'None';
  transactionTypeId: string = 'None';
}
