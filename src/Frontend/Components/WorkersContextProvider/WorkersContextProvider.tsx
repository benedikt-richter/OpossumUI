// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo } from 'react';
import { useAppSelector } from '../../state/hooks';
import {
  getAttributionBreakpoints,
  getExternalData,
  getFilesWithChildren,
  getResources,
  getResourcesToExternalAttributions,
} from '../../state/selectors/all-views-resource-selectors';
import { getNewAccordionWorkers } from '../../web-workers/get-new-accordion-workers';
import { getNewFolderProgressBarWorker } from '../../web-workers/get-new-folder-progress-bar-worker';

const resourceDetailsTabsWorkers = getNewAccordionWorkers();

export const AccordionWorkersContext = React.createContext(
  resourceDetailsTabsWorkers
);

export const AccordionWorkersContextProvider: FC = ({ children }) => {
  const externalData = useAppSelector(getExternalData);
  useMemo(() => {
    try {
      resourceDetailsTabsWorkers.containedExternalAttributionsAccordionWorker.postMessage(
        { externalData }
      );
    } catch (error) {
      console.info('Web worker error in workers context provider: ', error);
    }
  }, [externalData]);
  return (
    <AccordionWorkersContext.Provider value={resourceDetailsTabsWorkers}>
      {children}
    </AccordionWorkersContext.Provider>
  );
};

const folderProgressBarWorker = getNewFolderProgressBarWorker();

export const ProgressBarWorkerContext = React.createContext(
  folderProgressBarWorker
);

export const ProgressBarWorkerContextProvider: FC = ({ children }) => {
  const resources = useAppSelector(getResources);
  const resourcesToExternalAttributions = useAppSelector(
    getResourcesToExternalAttributions
  );
  const attributionBreakpoints = useAppSelector(getAttributionBreakpoints);
  const filesWithChildren = useAppSelector(getFilesWithChildren);
  useMemo(() => {
    try {
      folderProgressBarWorker.postMessage({
        resources,
        resourcesToExternalAttributions,
        attributionBreakpoints,
        filesWithChildren,
      });
    } catch (error) {
      console.info('Web worker error in workers context provider: ', error);
    }
  }, [
    resources,
    resourcesToExternalAttributions,
    attributionBreakpoints,
    filesWithChildren,
  ]);
  return (
    <ProgressBarWorkerContext.Provider value={folderProgressBarWorker}>
      {children}
    </ProgressBarWorkerContext.Provider>
  );
};
