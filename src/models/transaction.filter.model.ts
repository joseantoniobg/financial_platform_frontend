import { PaginationFilterModel } from "./pagination.filter.model";

export class TransactionFilterModel extends PaginationFilterModel {
  constructor(userId?: string) {
    super();
    this.userId = userId;
  }

  userId?: string;
  initialDate: string = '';
  finalDate: string = '';
  walletId: string = 'None';
  categoryIds: string[] = [];
  typeIds: string[] = [];
}
