// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
// SPDX-FileCopyrightText: Nico Carl <nicocarl@protonmail.com>
//
// SPDX-License-Identifier: Apache-2.0
import { app, BrowserWindow, Menu, shell } from 'electron';

import { AllowedFrontendChannels } from '../../shared/ipc-channels';
import { ExportType } from '../../shared/shared-types';
import { isFileLoaded } from '../utils/getLoadedFile';
import { getGlobalBackendState } from './globalBackendState';
import {
  getIconBasedOnTheme,
  makeFirstIconVisibleAndSecondHidden,
} from './iconHelpers';
import {
  getOpenFileListener,
  getSelectBaseURLListener,
  setLoadingState,
} from './listeners';
import logger from './logger';
import {
  getPathOfChromiumNoticeDocument,
  getPathOfNoticeDocument,
} from './notice-document-helpers';
import { UserSettings } from './user-settings';

export async function createMenu(mainWindow: BrowserWindow): Promise<Menu> {
  const webContents = mainWindow.webContents;
  const qaMode = await UserSettings.get('qaMode');

  return Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          icon: getIconBasedOnTheme(
            'icons/open-white.png',
            'icons/open-black.png',
          ),
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            void getOpenFileListener(mainWindow)();
          },
        },
        {
          icon: getIconBasedOnTheme(
            'icons/save-white.png',
            'icons/save-black.png',
          ),
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            webContents.send(AllowedFrontendChannels.SaveFileRequest, {
              saveFile: true,
            });
          },
        },
        {
          label: 'Export',
          icon: getIconBasedOnTheme(
            'icons/export-white.png',
            'icons/export-black.png',
          ),
          submenu: [
            {
              label: 'Follow-Up',
              icon: getIconBasedOnTheme(
                'icons/follow-up-white.png',
                'icons/follow-up-black.png',
              ),
              click: () => {
                setLoadingState(mainWindow.webContents, true);
                logger.info('Preparing data for follow-up export');
                webContents.send(
                  AllowedFrontendChannels.ExportFileRequest,
                  ExportType.FollowUp,
                );
              },
            },
            {
              icon: getIconBasedOnTheme(
                'icons/com-list-white.png',
                'icons/com-list-black.png',
              ),
              label: 'Compact component list',
              click: () => {
                setLoadingState(mainWindow.webContents, true);
                logger.info('Preparing data for compact component list export');
                webContents.send(
                  AllowedFrontendChannels.ExportFileRequest,
                  ExportType.CompactBom,
                );
              },
            },
            {
              icon: getIconBasedOnTheme(
                'icons/det-list-white.png',
                'icons/det-list-black.png',
              ),
              label: 'Detailed component list',
              click: () => {
                setLoadingState(mainWindow.webContents, true);
                logger.info(
                  'Preparing data for detailed component list export',
                );
                webContents.send(
                  AllowedFrontendChannels.ExportFileRequest,
                  ExportType.DetailedBom,
                );
              },
            },
            {
              icon: getIconBasedOnTheme(
                'icons/yaml-white.png',
                'icons/yaml-black.png',
              ),
              label: 'SPDX (yaml)',
              click: () => {
                setLoadingState(mainWindow.webContents, true);
                logger.info('Preparing data for SPDX (yaml) export');
                webContents.send(
                  AllowedFrontendChannels.ExportFileRequest,
                  ExportType.SpdxDocumentYaml,
                );
              },
            },
            {
              icon: getIconBasedOnTheme(
                'icons/json-white.png',
                'icons/json-black.png',
              ),
              label: 'SPDX (json)',
              click: () => {
                setLoadingState(mainWindow.webContents, true);
                logger.info('Preparing data for SPDX (json) export');
                webContents.send(
                  AllowedFrontendChannels.ExportFileRequest,
                  ExportType.SpdxDocumentJson,
                );
              },
            },
          ],
        },
        {
          icon: getIconBasedOnTheme(
            'icons/about-white.png',
            'icons/about-black.png',
          ),
          label: 'Project Metadata',
          click: () => {
            if (isFileLoaded(getGlobalBackendState())) {
              webContents.send(
                AllowedFrontendChannels.ShowProjectMetadataPopup,
                {
                  showProjectMetadataPopup: true,
                },
              );
            }
          },
        },
        {
          icon: getIconBasedOnTheme(
            'icons/statictics-white.png',
            'icons/statictics-black.png',
          ),
          label: 'Project Statistics',
          click: () => {
            if (isFileLoaded(getGlobalBackendState())) {
              webContents.send(
                AllowedFrontendChannels.ShowProjectStatisticsPopup,
                {
                  showProjectStatisticsPopup: true,
                },
              );
            }
          },
        },
        {
          icon: getIconBasedOnTheme(
            'icons/restore-white.png',
            'icons/restore-black.png',
          ),
          label: 'Set Path to Sources',
          click: () => {
            getSelectBaseURLListener(mainWindow)();
          },
        },
        {
          icon: getIconBasedOnTheme(
            'icons/quit-white.png',
            'icons/quit-black.png',
          ),
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          icon: getIconBasedOnTheme(
            'icons/undo-white.png',
            'icons/undo-black.png',
          ),
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/redo-white.png',
            'icons/redo-black.png',
          ),
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
        },
        { type: 'separator' },
        {
          icon: getIconBasedOnTheme(
            'icons/cut-white.png',
            'icons/cut-black.png',
          ),
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/copy-white.png',
            'icons/copy-black.png',
          ),
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/paste-white.png',
            'icons/paste-black.png',
          ),
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/select-all-white.png',
            'icons/select-all-black.png',
          ),
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll',
        },
        { type: 'separator' },
        {
          icon: getIconBasedOnTheme(
            'icons/magnifying-glass-white.png',
            'icons/magnifying-glass-black.png',
          ),
          label: 'Search Attributions',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            if (isFileLoaded(getGlobalBackendState())) {
              webContents.send(AllowedFrontendChannels.SearchAttributions);
            }
          },
        },
        {
          icon: getIconBasedOnTheme(
            'icons/magnifying-glass-white.png',
            'icons/magnifying-glass-black.png',
          ),
          label: 'Search Signals',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            if (isFileLoaded(getGlobalBackendState())) {
              webContents.send(AllowedFrontendChannels.SearchSignals);
            }
          },
        },
        {
          icon: getIconBasedOnTheme(
            'icons/search-white.png',
            'icons/search-black.png',
          ),
          label: 'Search All Resources',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (isFileLoaded(getGlobalBackendState())) {
              webContents.send(AllowedFrontendChannels.SearchResources);
            }
          },
        },
        {
          icon: getIconBasedOnTheme(
            'icons/search-white.png',
            'icons/search-black.png',
          ),
          label: 'Search Linked Resources',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => {
            if (isFileLoaded(getGlobalBackendState())) {
              webContents.send(AllowedFrontendChannels.SearchLinkedResources);
            }
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          icon: getIconBasedOnTheme(
            'icons/developer-tool-white.png',
            'icons/developer-tool-black.png',
          ),
          label: 'Show Developer Tools',
          role: 'toggleDevTools',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/full-screen-white.png',
            'icons/full-screen-black.png',
          ),
          label: 'Full Screen',
          role: 'togglefullscreen',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/zoom-in-white.png',
            'icons/zoom-in-black.png',
          ),
          label: 'Zoom In',
          role: 'zoomIn',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/zoom-out-white.png',
            'icons/zoom-out-black.png',
          ),
          label: 'Zoom Out',
          role: 'zoomOut',
        },
        {
          icon: getIconBasedOnTheme(
            'icons/check-box-blank-white.png',
            'icons/check-box-blank-black.png',
          ),
          label: 'QA Mode',
          id: 'disabled-qa-mode',
          click: () => {
            makeFirstIconVisibleAndSecondHidden(
              'enabled-qa-mode',
              'disabled-qa-mode',
            );
            void UserSettings.set('qaMode', true);
          },
          visible: !qaMode,
        },
        {
          icon: getIconBasedOnTheme(
            'icons/check-box-white.png',
            'icons/check-box-black.png',
          ),
          label: 'QA Mode',
          id: 'enabled-qa-mode',
          click: () => {
            makeFirstIconVisibleAndSecondHidden(
              'disabled-qa-mode',
              'enabled-qa-mode',
            );
            void UserSettings.set('qaMode', false);
          },
          visible: !!qaMode,
        },
      ],
    },
    {
      label: 'About',
      submenu: [
        {
          icon: getIconBasedOnTheme(
            'icons/github-white.png',
            'icons/github-black.png',
          ),
          label: 'Open on GitHub',
          click: () =>
            shell.openExternal('https://github.com/opossum-tool/opossumUI'),
        },
        {
          icon: getIconBasedOnTheme(
            'icons/notice-white.png',
            'icons/notice-black.png',
          ),
          label: 'OpossumUI Notices',
          click: () => shell.openPath(getPathOfNoticeDocument()),
        },
        {
          icon: getIconBasedOnTheme(
            'icons/chromium-white.png',
            'icons/chromium-black.png',
          ),
          label: 'Chromium Notices',
          click: () => shell.openPath(getPathOfChromiumNoticeDocument()),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          icon: getIconBasedOnTheme(
            'icons/user-guide-white.png',
            'icons/user-guide-black.png',
          ),
          label: "User's Guide",
          click: () =>
            shell.openExternal(
              'https://github.com/opossum-tool/OpossumUI/blob/main/USER_GUIDE.md',
            ),
        },
        {
          icon: getIconBasedOnTheme(
            'icons/log-white.png',
            'icons/log-black.png',
          ),
          label: 'Open log files folder',
          click: () => shell.openPath(app.getPath('logs')),
        },
        {
          icon: getIconBasedOnTheme(
            'icons/update-white.png',
            'icons/update-black.png',
          ),
          label: 'Check for updates',
          click: () => {
            webContents.send(AllowedFrontendChannels.ShowUpdateAppPopup, {
              showUpdateAppPopup: true,
            });
          },
        },
      ],
    },
  ]);
}
