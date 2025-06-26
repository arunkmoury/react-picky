import * as React from 'react';
import { SelectionState } from './types';
type SelectAllProps = {
  tabIndex: number | undefined;
  disabled: boolean;
  allSelected: SelectionState;
  id: string;
  selectAllText?: string;
  toggleSelectAll(): void;
  visible: boolean;
};
declare class SelectAll extends React.PureComponent<SelectAllProps> {
  static displayName: string;
  checkboxRef: React.RefObject<HTMLInputElement>;
  componentDidUpdate(prevProps: SelectAllProps): void;
  render(): React.JSX.Element | null;
}
export { SelectAll };
