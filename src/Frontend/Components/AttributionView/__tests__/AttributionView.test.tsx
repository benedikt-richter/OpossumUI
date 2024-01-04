// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import {
  Attributions,
  FollowUp,
  Resources,
  ResourcesToAttributions,
} from '../../../../shared/shared-types';
import { View } from '../../../enums/enums';
import { loadFromFile } from '../../../state/actions/resource-actions/load-actions';
import { navigateToView } from '../../../state/actions/view-actions/view-actions';
import {
  getParsedInputFileEnrichedWithTestData,
  selectFilter,
} from '../../../test-helpers/general-test-helpers';
import { renderComponent } from '../../../test-helpers/render';
import { AttributionView } from '../AttributionView';

describe('The Attribution View', () => {
  const testManualUuid = 'a32f2f96-f40e-11ea-adc1-0242ac120002';
  const testOtherManualUuid = 'a32f2f96-f40e-11ea-adc1-0242ac120003';
  const testManualAttributions: Attributions = {};
  const testResourcesToManualAttributions: ResourcesToAttributions = {};
  testManualAttributions[testManualUuid] = {
    attributionConfidence: 0,
    comment: 'Some comment',
    packageName: 'Test package',
    packageVersion: '1.0',
    copyright: 'Copyright John Doe',
    licenseText: 'Some license text',
    firstParty: true,
  };
  testResourcesToManualAttributions['/test resource'] = [testManualUuid];
  testManualAttributions[testOtherManualUuid] = {
    attributionConfidence: 0,
    comment: 'Some other comment',
    packageName: 'Test other package',
    packageVersion: '2.0',
    copyright: 'other Copyright John Doe',
    licenseText: 'Some other license text',
    followUp: FollowUp,
  };
  testResourcesToManualAttributions['/test other resource'] = [
    testOtherManualUuid,
  ];

  it('renders', () => {
    const { store } = renderComponent(<AttributionView />);
    store.dispatch(
      loadFromFile(
        getParsedInputFileEnrichedWithTestData({
          resources: { 'test resource': 1 },
          manualAttributions: testManualAttributions,
          resourcesToManualAttributions: testResourcesToManualAttributions,
        }),
      ),
    );
    act(() => {
      store.dispatch(navigateToView(View.Attribution));
    });

    expect(
      screen.getByText(/Attributions \(2 total, 0, 1, 0, 1/),
    ).toBeInTheDocument();
    expect(screen.getByText('Test package, 1.0')).toBeInTheDocument();
    expect(screen.getByText('Test other package, 2.0')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Test package, 1.0'));
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByText('test resource')).toBeInTheDocument();
  });

  it('filters Follow-ups', async () => {
    const { store } = renderComponent(<AttributionView />);
    store.dispatch(
      loadFromFile(
        getParsedInputFileEnrichedWithTestData({
          resources: { 'test resource': 1 },
          manualAttributions: testManualAttributions,
          resourcesToManualAttributions: testResourcesToManualAttributions,
        }),
      ),
    );
    act(() => {
      store.dispatch(navigateToView(View.Attribution));
    });

    expect(
      screen.getByText(/Attributions \(2 total, 0, 1, 0, 1/),
    ).toBeInTheDocument();
    expect(screen.getByText('Test package, 1.0')).toBeInTheDocument();
    expect(screen.getByText('Test other package, 2.0')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Filters'));
    await selectFilter(screen, 'Needs Follow-Up');

    expect(screen.getByText('Test other package, 2.0')).toBeInTheDocument();
    expect(screen.queryByText('Test package, 1.0')).not.toBeInTheDocument();
  });

  it('filters Only First Party', async () => {
    const { store } = renderComponent(<AttributionView />);
    store.dispatch(
      loadFromFile(
        getParsedInputFileEnrichedWithTestData({
          resources: { 'test resource': 1 },
          manualAttributions: testManualAttributions,
          resourcesToManualAttributions: testResourcesToManualAttributions,
        }),
      ),
    );
    act(() => {
      store.dispatch(navigateToView(View.Attribution));
    });

    expect(
      screen.getByText(/Attributions \(2 total, 0, 1, 0, 1/),
    ).toBeInTheDocument();
    expect(screen.getByText('Test package, 1.0')).toBeInTheDocument();
    expect(screen.getByText('Test other package, 2.0')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Filters'));
    await selectFilter(screen, 'First Party');

    expect(screen.getByText('Test package, 1.0')).toBeInTheDocument();
    expect(
      screen.queryByText('Test other package, 2.0'),
    ).not.toBeInTheDocument();
  });

  it('filters Only First Party and follow ups and then hide first party and follow ups', async () => {
    const { store } = renderComponent(<AttributionView />);
    store.dispatch(
      loadFromFile(
        getParsedInputFileEnrichedWithTestData({
          resources: { 'test resource': 1 },
          manualAttributions: testManualAttributions,
          resourcesToManualAttributions: testResourcesToManualAttributions,
        }),
      ),
    );
    act(() => {
      store.dispatch(navigateToView(View.Attribution));
    });

    expect(
      screen.getByText(/Attributions \(2 total, 0, 1, 0, 1/),
    ).toBeInTheDocument();
    expect(screen.getByText('Test package, 1.0')).toBeInTheDocument();
    expect(screen.getByText('Test other package, 2.0')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Filters'));
    await selectFilter(screen, 'First Party');
    await selectFilter(screen, 'Needs Follow-Up');

    expect(screen.queryByText('Test package, 1.0')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Test other package, 2.0'),
    ).not.toBeInTheDocument();
  });

  it('sorts displayAttributionsWithCount', () => {
    const testResources: Resources = { 'test resource': 1 };
    const testManualAttributions: Attributions = {
      uuid_1: {
        packageName: 'zz Test package',
      },
      uuid_2: {
        attributionConfidence: 0,
        comment: 'Some comment',
        packageName: 'Test package',
        packageVersion: '1.0',
        copyright: 'Copyright John Doe',
        licenseText: 'Some license text',
      },
      uuid_3: {
        copyright: '(C) Copyright John Doe 2',
      },
    };
    const testResourcesToManualAttributions = {
      '/file': ['uuid_1', 'uuid_2', 'uuid_3'],
    };

    const { store } = renderComponent(<AttributionView />);
    store.dispatch(
      loadFromFile(
        getParsedInputFileEnrichedWithTestData({
          resources: testResources,
          manualAttributions: testManualAttributions,
          resourcesToManualAttributions: testResourcesToManualAttributions,
        }),
      ),
    );
    act(() => {
      store.dispatch(navigateToView(View.Attribution));
    });

    const nodePackage1 = screen.getByText(/zz Test package/);
    const nodePackage2 = screen.getByText(/Test package, 1\.0/);
    const nodePackage3 = screen.getByText(/\(C\) Copyright John Doe 2/);

    expect(nodePackage3.compareDocumentPosition(nodePackage1)).toBe(2);
    expect(nodePackage3.compareDocumentPosition(nodePackage2)).toBe(2);
    expect(nodePackage1.compareDocumentPosition(nodePackage2)).toBe(2);
  });
});
