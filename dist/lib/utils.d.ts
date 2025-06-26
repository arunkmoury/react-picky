import { OptionsType, OptionType } from 'types';
export declare const isDataObject: (
  obj: OptionType | undefined,
  valueKey: string | undefined,
  labelKey: string | undefined
) => boolean;
export declare const hasItem: (
  all: OptionsType | OptionType | undefined,
  item: OptionType,
  valueKey?: string,
  labelKey?: string,
  returnIndex?: boolean
) => number | boolean;
export declare const hasItemIndex: (
  all: OptionsType | OptionType,
  item: OptionType,
  valueKey?: string,
  labelKey?: string
) => number;
export declare const keyExtractor: (
  item: OptionType,
  valueKey?: string,
  labelKey?: string
) => any;
export declare const labelExtractor: (
  item: OptionType,
  valueKey?: string,
  labelKey?: string
) => any;
export declare function sortCollection(array: any[], valueKey?: string): any[];
export declare function arraysEqual(left: any[], right: any[]): boolean;
export declare const asArray: (obj: any) => any[];
