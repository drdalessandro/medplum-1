import { Filter, IndexedStructureDefinition, Operator, SearchRequest } from '@medplum/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { SearchPopupMenu } from './SearchPopupMenu';

const schema: IndexedStructureDefinition = {
  types: {
    Patient: {
      display: 'Patient',
      properties: {
        name: {
          key: 'name',
          display: 'Name',
          type: 'HumanName'
        },
        birthDate: {
          key: 'birthDate',
          display: 'Birth Date',
          type: 'date'
        }
      }
    },
    Observation: {
      display: 'Observation',
      properties: {
        valueInteger: {
          key: 'valueInteger',
          display: 'Value',
          type: 'integer'
        }
      }
    }
  }
};

test('SearchPopupMenu for invalid resource', () => {
  expect(SearchPopupMenu({
    schema,
    search: { resourceType: 'xyz' },
    visible: true,
    x: 0,
    y: 0,
    field: 'name',
    onChange: (e) => console.log('onChange', e),
    onClose: () => console.log('onClose')
  })).toBeNull();
});

test('SearchPopupMenu for invalid property', () => {
  expect(SearchPopupMenu({
    schema,
    search: { resourceType: 'Patient' },
    visible: true,
    x: 0,
    y: 0,
    field: 'xyz',
    onChange: (e) => console.log('onChange', e),
    onClose: () => console.log('onClose')
  })).toBeNull();
});

test('SearchPopupMenu renders name field', () => {
  render(<SearchPopupMenu
    schema={schema}
    search={{
      resourceType: 'Patient'
    }}
    visible={true}
    x={0}
    y={0}
    field={'name'}
    onChange={e => console.log('onChange', e)}
    onClose={() => console.log('onClose')}
  />);

  expect(screen.getByText('Equals...')).not.toBeUndefined();
});

test('SearchPopupMenu renders date field', () => {
  render(<SearchPopupMenu
    schema={schema}
    search={{
      resourceType: 'Patient'
    }}
    visible={true}
    x={0}
    y={0}
    field={'birthDate'}
    onChange={e => console.log('onChange', e)}
    onClose={() => console.log('onClose')}
  />);

  expect(screen.getByText('Before...')).not.toBeUndefined();
  expect(screen.getByText('After...')).not.toBeUndefined();
});

test('SearchPopupMenu renders date field submenu', async (done) => {
  render(<SearchPopupMenu
    schema={schema}
    search={{
      resourceType: 'Patient'
    }}
    visible={true}
    x={0}
    y={0}
    field={'birthDate'}
    onChange={e => console.log('onChange', e)}
    onClose={() => console.log('onClose')}
  />);

  expect(screen.getByText('Before...')).not.toBeUndefined();
  expect(screen.getByText('After...')).not.toBeUndefined();

  const dateFiltersSubmenu = screen.getByText('Date filters');

  await act(async () => {
    fireEvent.click(dateFiltersSubmenu);
  });

  expect(screen.getByText('Tomorrow')).not.toBeUndefined();
  expect(screen.getByText('Today')).not.toBeUndefined();
  expect(screen.getByText('Yesterday')).not.toBeUndefined();
  done();
});

test('SearchPopupMenu renders numeric field', () => {
  render(<SearchPopupMenu
    schema={schema}
    search={{
      resourceType: 'Observation'
    }}
    visible={true}
    x={0}
    y={0}
    field={'valueInteger'}
    onChange={e => console.log('onChange', e)}
    onClose={() => console.log('onClose')}
  />);

  expect(screen.getByText('Sort Largest to Smallest')).not.toBeUndefined();
  expect(screen.getByText('Sort Smallest to Largest')).not.toBeUndefined();
});

test('SearchPopupMenu sort', async (done) => {
  let currSearch: SearchRequest = {
    resourceType: 'Patient'
  };

  render(<SearchPopupMenu
    schema={schema}
    search={currSearch}
    visible={true}
    x={0}
    y={0}
    field={'birthDate'}
    onChange={e => currSearch = e}
    onClose={() => console.log('onClose')}
  />);

  await act(async () => {
    fireEvent.click(screen.getByText('Sort Oldest to Newest'));
  });

  expect(currSearch.sortRules).not.toBeUndefined();
  expect(currSearch.sortRules?.length).toEqual(1);
  expect(currSearch.sortRules?.[0].code).toEqual('birthDate');
  expect(currSearch.sortRules?.[0].descending).toEqual(false);

  await act(async () => {
    fireEvent.click(screen.getByText('Sort Newest to Oldest'));
  });

  expect(currSearch.sortRules).not.toBeUndefined();
  expect(currSearch.sortRules?.length).toEqual(1);
  expect(currSearch.sortRules?.[0].code).toEqual('birthDate');
  expect(currSearch.sortRules?.[0].descending).toEqual(true);
  done();
});

test('SearchPopupMenu prompt', async (done) => {
  window.prompt = jest.fn().mockImplementation(() => 'xyz');

  let currSearch: SearchRequest = {
    resourceType: 'Patient'
  };

  render(<SearchPopupMenu
    schema={schema}
    search={currSearch}
    visible={true}
    x={0}
    y={0}
    field={'birthDate'}
    onChange={e => currSearch = e}
    onClose={() => console.log('onClose')}
  />);

  await act(async () => {
    fireEvent.click(screen.getByText('Equals...'));
  });

  expect(currSearch.filters).not.toBeUndefined();
  expect(currSearch.filters?.length).toEqual(1);
  expect(currSearch.filters?.[0]).toMatchObject({
    code: 'birthDate',
    operator: Operator.EQUALS,
    value: 'xyz'
  } as Filter);
  done();
});
