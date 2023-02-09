// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  createTestAppStore,
  renderComponentWithStore,
} from '../../../test-helpers/render-component-with-store';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { setSelectedResourceId } from '../../../state/actions/resource-actions/audit-view-simple-actions';
import { ButtonText, PopupType } from '../../../enums/enums';
import { getOpenPopup } from '../../../state/selectors/view-selector';
import {
  Attributions,
  ResourcesToAttributions,
} from '../../../../shared/shared-types';
import {
  setExternalData,
  setManualData,
  setTemporaryPackageInfo,
} from '../../../state/actions/resource-actions/all-views-simple-actions';
import { GlobalPopup } from '../../GlobalPopup/GlobalPopup';
import { getTemporaryPackageInfo } from '../../../state/selectors/all-views-resource-selectors';
import { openAttributionWizardPopup } from '../../../state/actions/popup-actions/popup-actions';

const selectedResourceId = '/samplepath/';
const testManualAttributions: Attributions = {
  uuid_0: {
    packageType: 'generic',
    packageName: 'react',
    packageNamespace: 'npm',
    packageVersion: '18.2.0',
  },
};
const testManualResourcesToAttributions: ResourcesToAttributions = {
  [selectedResourceId]: ['uuid_0'],
};
const testExternalAttributions: Attributions = {
  uuid_1: {
    packageType: 'generic',
    packageName: 'numpy',
    packageNamespace: 'pip',
    packageVersion: '1.24.1',
  },
};
const testExternalResourcesToAttributions: ResourcesToAttributions = {
  '/samplepath/file': ['uuid_1'],
};

const namespaceListTitle = 'Package namespace';
const nameListTitle = 'Package name';
const versionListTitle = 'Package version';

describe('AttributionWizardPopup', () => {
  it('renders with header, resource path, and buttons', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    expect(screen.getByText('Attribution Wizard')).toBeInTheDocument();
    expect(screen.getByText(selectedResourceId)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ButtonText.Cancel })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ButtonText.Next })
    ).toBeInTheDocument();
  });

  it('closes when clicking "cancel"', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    expect(getOpenPopup(testStore.getState())).toBe(
      PopupType.AttributionWizardPopup
    );

    fireEvent.click(screen.getByRole('button', { name: ButtonText.Cancel }));
    expect(getOpenPopup(testStore.getState())).toBeNull();
  });

  it('renders breadcrumbs', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    expect(screen.getByText('package')).toBeInTheDocument();
    expect(screen.getByText('version')).toBeInTheDocument();
  });

  it('allows navigation via "next" and "back" buttons', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    expect(screen.getByText(namespaceListTitle)).toBeInTheDocument();
    expect(screen.getByText(nameListTitle)).toBeInTheDocument();
    expect(screen.queryByText(versionListTitle)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: ButtonText.Back })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ButtonText.Next }));

    expect(screen.queryByText(namespaceListTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(nameListTitle)).not.toBeInTheDocument();
    expect(screen.getByText(versionListTitle)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: ButtonText.Next })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ButtonText.Back }));

    expect(screen.getByText(namespaceListTitle)).toBeInTheDocument();
    expect(screen.getByText(nameListTitle)).toBeInTheDocument();
    expect(screen.queryByText(versionListTitle)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: ButtonText.Back })
    ).not.toBeInTheDocument();
  });

  it('allows navigation via breadcrumbs (back only, so far)', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    expect(screen.getByText(namespaceListTitle)).toBeInTheDocument();
    expect(screen.getByText(nameListTitle)).toBeInTheDocument();
    expect(screen.queryByText(versionListTitle)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ButtonText.Next }));

    expect(screen.queryByText(namespaceListTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(nameListTitle)).not.toBeInTheDocument();
    expect(screen.getByText(versionListTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByText('package'));

    expect(screen.getByText(namespaceListTitle)).toBeInTheDocument();
    expect(screen.getByText(nameListTitle)).toBeInTheDocument();
    expect(screen.queryByText(versionListTitle)).not.toBeInTheDocument();
  });

  it('renders an apply button', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    fireEvent.click(screen.getByRole('button', { name: ButtonText.Next }));

    expect(
      screen.getByRole('button', { name: ButtonText.Apply })
    ).toBeInTheDocument();
  });

  it('changes temporary package info', () => {
    const initialTemporaryPackageInfo = testManualAttributions.uuid_0;
    const expectedChangedTemporaryPackageInfo = testExternalAttributions.uuid_1;

    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    testStore.dispatch(setTemporaryPackageInfo(initialTemporaryPackageInfo));

    fireEvent.click(screen.getByText('pip'));
    fireEvent.click(screen.getByText('numpy'));
    fireEvent.click(screen.getByRole('button', { name: ButtonText.Next }));
    fireEvent.click(screen.getByText('1.24.1'));
    fireEvent.click(screen.getByRole('button', { name: ButtonText.Apply }));

    const changedTemporaryPackageInfo = getTemporaryPackageInfo(
      testStore.getState()
    );
    expect(changedTemporaryPackageInfo).toEqual(
      expectedChangedTemporaryPackageInfo
    );
  });

  it('displays manually added list entries', () => {
    const testStore = createTestAppStore();
    testStore.dispatch(setSelectedResourceId(selectedResourceId));
    testStore.dispatch(
      setExternalData(
        testExternalAttributions,
        testExternalResourcesToAttributions
      )
    );
    testStore.dispatch(
      setManualData(testManualAttributions, testManualResourcesToAttributions)
    );
    renderComponentWithStore(<GlobalPopup />, { store: testStore });
    act(() => {
      testStore.dispatch(openAttributionWizardPopup('uuid_0'));
    });

    const namespaceTable = screen.getByText('Package namespace')
      .parentElement as HTMLElement;
    const namespaceTextBox = within(namespaceTable).getByRole('textbox');
    const namespaceIconButton = within(namespaceTable).getByRole('button', {
      name: 'Enter text to add a new item to the list',
    });
    expect(namespaceIconButton).toBeDisabled();
    fireEvent.change(namespaceTextBox, { target: { value: 'new_namespace' } });
    expect(namespaceIconButton).toBeEnabled();
    fireEvent.click(namespaceIconButton);
    expect(namespaceTextBox).toHaveValue('');
    expect(namespaceIconButton).toBeDisabled();
    expect(screen.getByText('new_namespace')).toBeInTheDocument();

    const nameTable = screen.getByText('Package name')
      .parentElement as HTMLElement;
    const nameTextBox = within(nameTable).getByRole('textbox');
    const nameIconButton = within(nameTable).getByRole('button', {
      name: 'Enter text to add a new item to the list',
    });
    expect(nameIconButton).toBeDisabled();
    fireEvent.change(nameTextBox, { target: { value: 'new_name' } });
    expect(nameIconButton).toBeEnabled();
    fireEvent.click(nameIconButton);
    expect(nameTextBox).toHaveValue('');
    expect(nameIconButton).toBeDisabled();
    expect(screen.getByText('new_name')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ButtonText.Next }));

    const versionTable = screen.getByText('Package version')
      .parentElement as HTMLElement;
    const versionTextBox = within(versionTable).getByRole('textbox');
    const versionIconButton = within(versionTable).getByRole('button', {
      name: 'Enter text to add a new item to the list',
    });
    expect(versionIconButton).toBeDisabled();
    fireEvent.change(versionTextBox, { target: { value: 'new_version' } });
    expect(versionIconButton).toBeEnabled();
    fireEvent.click(versionIconButton);
    expect(versionTextBox).toHaveValue('');
    expect(versionIconButton).toBeDisabled();
    expect(screen.getByText('new_version')).toBeInTheDocument();
  });
});
