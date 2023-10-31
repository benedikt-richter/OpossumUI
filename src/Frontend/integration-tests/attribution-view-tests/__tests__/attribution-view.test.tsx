// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
// SPDX-FileCopyrightText: Nico Carl <nicocarl@protonmail.com>
//
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, screen } from '@testing-library/react';

import {
  DiscreteConfidence,
  PackageInfo,
  ParsedFileContent,
  SaveFileArgs,
} from '../../../../shared/shared-types';
import { text } from '../../../../shared/text';
import { App } from '../../../Components/App/App';
import { ButtonText, View } from '../../../enums/enums';
import {
  clickOnButtonInHamburgerMenu,
  expectButtonInHamburgerMenu,
  expectValueInTextBox,
  expectValueNotInTextBox,
  insertValueIntoTextBox,
} from '../../../test-helpers/attribution-column-test-helpers';
import {
  clickOnButton,
  clickOnOpenFileIcon,
  closeProjectStatisticsPopup,
  EMPTY_PARSED_FILE_CONTENT,
  expectButton,
  goToView,
  mockElectronBackendOpenFile,
} from '../../../test-helpers/general-test-helpers';
import { clickOnPackageInPackagePanel } from '../../../test-helpers/package-panel-helpers';
import {
  expectReplaceAttributionPopupIsNotShown,
  expectReplaceAttributionPopupIsShown,
  expectUnsavedChangesPopupIsShown,
} from '../../../test-helpers/popup-test-helpers';
import { renderComponentWithStore } from '../../../test-helpers/render-component-with-store';
import {
  clickOnElementInResourceBrowser,
  expectResourceBrowserIsNotShown,
} from '../../../test-helpers/resource-browser-test-helpers';

describe('The App in attribution view', () => {
  it('app shows empty AttributionsDetailsViewer for selected Signals', () => {
    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: {
        folder1: { folder2: { file1: 1 } },
        file2: 1,
      },

      externalAttributions: {
        attributions: {
          uuid_1: {
            source: {
              name: 'HC',
              documentConfidence: 50.0,
            },
            packageName: 'JQuery',
          },
          uuid_2: {
            source: {
              name: 'SC',
              documentConfidence: 9.0,
            },
            packageName: 'Angular',
          },
        },
        resourcesToAttributions: {
          '/folder1/folder2/file1': ['uuid_1'],
          '/file2': ['uuid_2'],
        },
      },
    };
    mockElectronBackendOpenFile(mockChannelReturn);

    renderComponentWithStore(<App />);

    clickOnElementInResourceBrowser(screen, 'file2');
    clickOnPackageInPackagePanel(screen, 'Angular', 'Signals');
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Angular',
    );

    goToView(screen, View.Attribution);

    expect(screen.queryByText('Linked Resources')).not.toBeInTheDocument();
  });

  it('allows to modify text in text boxes', () => {
    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: {
        root: { src: { file_1: 1, file_2: 1 } },
        file: 1,
      },
      manualAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'Angular',
            packageVersion: '16.0.0',
            comment: 'ManualPackage',
          },
          uuid_2: {
            packageName: 'Vue',
            packageVersion: '2.6.0',
            comment: 'ManualPackage 2',
          },
        },
        resourcesToAttributions: {
          '/root/src/file_1': ['uuid_1'],
          '/root/src/file_2': ['uuid_2'],
        },
      },
    };
    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);

    clickOnOpenFileIcon(screen);
    goToView(screen, View.Attribution);
    expectResourceBrowserIsNotShown(screen);

    fireEvent.click(screen.getByText('Angular, 16.0.0') as Element);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Angular',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '16.0.0',
    );
    expectValueInTextBox(screen, 'Comment', 'ManualPackage');
    expect(screen.queryByText('jQuery')).not.toBeInTheDocument();

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );

    fireEvent.click(screen.getByText('Vue, 2.6.0') as Element);
    expectUnsavedChangesPopupIsShown(screen);
    clickOnButton(screen, ButtonText.Save);

    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Vue',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '2.6.0',
    );
    expectValueInTextBox(screen, 'Comment', 'ManualPackage 2');
    expect(screen.queryByText('jQuery')).not.toBeInTheDocument();

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
  });

  it('handles purls correctly', () => {
    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: {
        root: { src: { file_1: 1, file_2: 1 } },
        file: 1,
      },
      manualAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'Angular',
            packageVersion: '16.0.0',
            comment: 'ManualPackage',
          },
          uuid_2: {
            packageName: 'Vue',
            packageVersion: '2.6.0',
            comment: 'ManualPackage 2',
          },
        },
        resourcesToAttributions: {
          '/root/src/file_1': ['uuid_1'],
          '/root/src/file_2': ['uuid_2'],
        },
      },
    };
    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);
    closeProjectStatisticsPopup(screen);

    clickOnOpenFileIcon(screen);
    goToView(screen, View.Attribution);
    expectResourceBrowserIsNotShown(screen);

    fireEvent.click(screen.getByText('Angular, 16.0.0') as Element);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Angular',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '16.0.0',
    );
    expectValueInTextBox(screen, 'Comment', 'ManualPackage');

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.purl,
      'pkg:rpm/opensuse/curl@7.56.1-1.1.?arch=i386&distro=opensuse-tumbleweed',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.purl,
      'pkg:rpm/opensuse/curl@7.56.1-1.1.?arch=i386&distro=opensuse-tumbleweed',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'curl',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '7.56.1-1.1.',
    );

    fireEvent.click(screen.getByText('Vue, 2.6.0') as Element);
    expectUnsavedChangesPopupIsShown(screen);
    clickOnButton(screen, ButtonText.Save);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.purl,
      '',
    );

    fireEvent.click(screen.getByText('curl, 7.56.1-1.1.') as Element);

    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.purl,
      'pkg:rpm/opensuse/curl@7.56.1-1.1.?arch=i386&distro=opensuse-tumbleweed',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'curl',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '7.56.1-1.1.',
    );

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.purl,
      'invalid-purl',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'curl',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '7.56.1-1.1.',
    );
    expectButton(screen, ButtonText.Save, true);
    expectButtonInHamburgerMenu(screen, ButtonText.Undo, true);

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.purl,
      'pkg:test/name@version',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'name',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      'version',
    );
    expectButton(screen, ButtonText.Save, false);
    expectButtonInHamburgerMenu(screen, ButtonText.Undo, false);
    clickOnButton(screen, ButtonText.Save);

    const expectedSaveFileArgs: SaveFileArgs = {
      manualAttributions: {
        uuid_1: {
          attributionConfidence: DiscreteConfidence.High,
          comment: 'ManualPackage',
          packageName: 'curl',
          packageNamespace: 'opensuse',
          packagePURLAppendix: '?arch=i386&distro=opensuse-tumbleweed',
          packageType: 'rpm',
          packageVersion: '7.56.1-1.1.',
        },
        uuid_2: {
          comment: 'ManualPackage 2',
          packageName: 'Vue',
          packageVersion: '2.6.0',
        },
      },
      resolvedExternalAttributions: new Set(),
      resourcesToAttributions: {
        '/root/src/file_1': ['uuid_1'],
        '/root/src/file_2': ['uuid_2'],
      },
    };
    expect(window.electronAPI.openFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.saveFile).toHaveBeenCalledTimes(2);
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expectedSaveFileArgs,
    );
  });

  it('saves an updated attribution to file', () => {
    const testManualPackage: PackageInfo = {
      packageName: 'jQuery',
      packageVersion: '16.0.0',
      comment: 'ManualPackage',
    };
    const expectedSaveFileArgs: SaveFileArgs = {
      manualAttributions: {
        uuid_1: {
          ...testManualPackage,
          attributionConfidence: DiscreteConfidence.High,
          packageName: 'Angular',
        },
      },
      resourcesToAttributions: {
        '/root/src/file_1': ['uuid_1'],
      },
      resolvedExternalAttributions: new Set<string>().add('test_id'),
    };

    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      metadata: {
        projectId: '2a58a469-738e-4508-98d3-a27bce6e71f7',
        fileCreationDate: '2020-07-23 11:47:13.764544',
      },
      resources: {
        root: { src: { file_1: 1, file_2: 1 } },
        file: 1,
      },
      manualAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'jQuery',
            packageVersion: '16.0.0',
            comment: 'ManualPackage',
          },
        },
        resourcesToAttributions: {
          '/root/src/file_1': ['uuid_1'],
        },
      },
      externalAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'Vue',
            packageVersion: '2.6.0',
            comment: 'ExternalPackage',
          },
        },
        resourcesToAttributions: {
          '/root/src/file_2': ['uuid_1'],
        },
      },

      resolvedExternalAttributions: new Set<string>().add('test_id'),
    };
    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);
    closeProjectStatisticsPopup(screen);

    clickOnOpenFileIcon(screen);
    goToView(screen, View.Attribution);
    expectResourceBrowserIsNotShown(screen);

    fireEvent.click(screen.getByText('jQuery, 16.0.0') as Element);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '16.0.0',
    );
    expectValueInTextBox(screen, 'Comment', 'ManualPackage');

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Angular',
    );
    clickOnButtonInHamburgerMenu(screen, ButtonText.Undo);

    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    expectValueNotInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Angular',
    );

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Angular',
    );
    clickOnButton(screen, ButtonText.Save);

    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'Angular',
    );
    expectValueNotInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    expect(screen.getByText('Angular, 16.0.0'));

    expect(window.electronAPI.openFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.saveFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expectedSaveFileArgs,
    );
  });

  it('deletes an attribution', () => {
    const expectedSaveFileArgs: SaveFileArgs = {
      manualAttributions: {},
      resourcesToAttributions: {},
      resolvedExternalAttributions: new Set(),
    };

    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: {
        root: { src: { file_1: 1, file_2: 1 } },
        file: 1,
      },
      manualAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'jQuery',
            packageVersion: '16.0.0',
            comment: 'ManualPackage',
          },
        },
        resourcesToAttributions: {
          '/root/src/file_1': ['uuid_1'],
        },
      },
      externalAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'Vue',
            packageVersion: '2.6.0',
            comment: 'ExternalPackage',
          },
        },
        resourcesToAttributions: {
          '/root/src/file_2': ['uuid_1'],
        },
      },
    };
    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);
    closeProjectStatisticsPopup(screen);

    clickOnOpenFileIcon(screen);
    goToView(screen, View.Attribution);
    expectResourceBrowserIsNotShown(screen);

    fireEvent.click(screen.getByText('jQuery, 16.0.0') as Element);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '16.0.0',
    );
    expectValueInTextBox(screen, 'Comment', 'ManualPackage');

    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      '',
    );
    insertValueIntoTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageVersion,
      '',
    );
    insertValueIntoTextBox(screen, 'Comment', '');
    clickOnButton(screen, ButtonText.Save);

    expect(screen.queryByText('jQuery, 16.0.0')).not.toBeInTheDocument();
    expect(window.electronAPI.openFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.saveFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expectedSaveFileArgs,
    );
  });

  it('replaces attributions', () => {
    const expectedSaveFileArgs: SaveFileArgs = {
      manualAttributions: {
        uuid_2: {
          comment: 'ManualPackage',
          packageName: 'React',
          packageVersion: '16.0.0',
          attributionConfidence: DiscreteConfidence.High,
        },
      },
      resolvedExternalAttributions: new Set(),
      resourcesToAttributions: {
        '/root/src/file_1': ['uuid_2'],
        '/root/src/file_2': ['uuid_2'],
      },
    };
    const mockChannelReturn: ParsedFileContent = {
      ...EMPTY_PARSED_FILE_CONTENT,
      resources: {
        root: { src: { file_1: 1, file_2: 1 } },
        file: 1,
      },
      manualAttributions: {
        attributions: {
          uuid_1: {
            packageName: 'jQuery',
            packageVersion: '16.0.0',
            comment: 'ManualPackage',
            attributionConfidence: DiscreteConfidence.High,
          },
          uuid_2: {
            packageName: 'React',
            packageVersion: '16.0.0',
            comment: 'ManualPackage',
            attributionConfidence: DiscreteConfidence.High,
          },
        },
        resourcesToAttributions: {
          '/root/src/file_1': ['uuid_1'],
          '/root/src/file_2': ['uuid_2'],
        },
      },
    };
    mockElectronBackendOpenFile(mockChannelReturn);
    renderComponentWithStore(<App />);

    clickOnOpenFileIcon(screen);
    goToView(screen, View.Attribution);
    expectResourceBrowserIsNotShown(screen);

    fireEvent.click(screen.getByText('jQuery, 16.0.0') as Element);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'jQuery',
    );
    screen.getByText('file_1');

    clickOnButtonInHamburgerMenu(screen, ButtonText.MarkForReplacement);

    fireEvent.click(screen.getByText('React, 16.0.0') as Element);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'React',
    );
    screen.getByText('file_2');

    clickOnButtonInHamburgerMenu(screen, ButtonText.ReplaceMarked);
    expectReplaceAttributionPopupIsShown(screen);
    clickOnButton(screen, ButtonText.Cancel);
    expect(screen.getByText('jQuery, 16.0.0')).toBeInTheDocument();
    expectReplaceAttributionPopupIsNotShown(screen);

    clickOnButtonInHamburgerMenu(screen, ButtonText.ReplaceMarked);
    expectReplaceAttributionPopupIsShown(screen);
    clickOnButton(screen, ButtonText.Replace);
    expectValueInTextBox(
      screen,
      text.attributionColumn.packageSubPanel.packageName,
      'React',
    );
    expectReplaceAttributionPopupIsNotShown(screen);
    expect(screen.queryByText('jQuery, 16.0.0')).not.toBeInTheDocument();
    screen.getByText('file_1');
    screen.getByText('file_2');

    // make sure resources are now linked to React attribution
    expect(window.electronAPI.openFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.saveFile).toHaveBeenCalledTimes(1);
    expect(window.electronAPI.saveFile).toHaveBeenCalledWith(
      expectedSaveFileArgs,
    );
  });
});
