/**
 * Mouser API レスポンス型定義
 */

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
