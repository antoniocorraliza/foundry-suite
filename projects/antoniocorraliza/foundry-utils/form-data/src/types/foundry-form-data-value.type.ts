import type { FoundryFormDataFile } from '../interfaces/foundry-form-data-file.interface';
import type { FoundryFormDataJson } from '../interfaces/foundry-form-data-json.interface';

/** Value that a form can send in one part. */
export type FoundryFormDataValue = string | number | boolean | Blob | FoundryFormDataFile | FoundryFormDataJson;
