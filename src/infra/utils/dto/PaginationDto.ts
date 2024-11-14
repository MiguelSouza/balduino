export class PaginationDto {
    pageIndex: number;
    pageSize: number;
    totalItems?: number;
  
    constructor(pageIndex: number = 0, pageSize: number = 10, totalItems?: number) {
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.totalItems = totalItems;
    }
  }
  