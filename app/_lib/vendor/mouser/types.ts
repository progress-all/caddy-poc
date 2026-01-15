/**
 * Mouser API 型定義
 */

// 入力型
export interface KeywordSearchInput {
  keyword: string;
  records?: number;
  startingRecord?: number;
}

export interface PartNumberSearchInput {
  partNumber: string;
  partSearchOptions?: string;
}

// レスポンス型
export interface MouserPart {
  MouserPartNumber?: string;
  ManufacturerPartNumber?: string;
  Description?: string;
  Manufacturer?: string;
  LifecycleStatus?: string;
  ProductAttributes?: Array<{
    AttributeName: string;
    AttributeValue: string;
  }>;
  PriceBreaks?: Array<{
    Quantity: number;
    Price: string;
    Currency?: string;
  }>;
  Availability?: string;
  DataSheetUrl?: string;
  ImagePath?: string;
  [key: string]: unknown;
}

export interface MouserSearchResults {
  SearchResults?: {
    NumberOfResult?: number;
    Parts?: MouserPart[];
  };
}
