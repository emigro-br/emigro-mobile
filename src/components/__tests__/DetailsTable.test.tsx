import { render } from 'test-utils';

import { DetailsTable, RowItem } from '@/components/DetailsTable';

describe('DetailsTable', () => {
  const rows: RowItem[] = [
    { label: 'Label 1', value: 'Value 1' },
    { label: 'Label 2', value: 2 },
    { label: 'Label 3', value: 'Value 3' },
  ];

  it('renders the correct number of rows', () => {
    const { getAllByTestId } = render(<DetailsTable rows={rows} />);
    const rowElements = getAllByTestId('row');
    expect(rowElements.length).toBe(rows.length);
  });

  it('renders the correct label and value for each row', () => {
    const { getByText } = render(<DetailsTable rows={rows} />);
    rows.forEach((row) => {
      const labelElement = getByText(row.label);
      const valueElement = getByText(row.value.toString());
      expect(labelElement).toBeOnTheScreen();
      expect(valueElement).toBeOnTheScreen();
    });
  });
});
