export type TestCategory = 'hematology' | 'radiology' | 'chemistry';

export interface DiagnosticTest {
  id: number;
  name: string;
  price: number;
  category?: TestCategory;
  provider_id: number;
}
