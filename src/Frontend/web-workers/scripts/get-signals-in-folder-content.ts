// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import { AttributionData } from '../../../shared/shared-types';
import { getContainedExternalDisplayPackageInfosWithCount } from '../../Components/AggregatedAttributionsPanel/AccordionPanel.util';
import { PackagePanelTitle } from '../../enums/enums';
import { Sorting } from '../../shared-constants';
import { PanelData } from '../../types/types';

interface Props {
  externalData: AttributionData;
  resolvedExternalAttributions: Set<string>;
  resourceId: string;
  sorting: Sorting;
}

export function getSignalsInFolderContent({
  externalData,
  resolvedExternalAttributions,
  resourceId,
  sorting,
}: Props): PanelData {
  const [sortedPackageCardIds, displayPackageInfos] =
    getContainedExternalDisplayPackageInfosWithCount({
      selectedResourceId: resourceId,
      externalData,
      resolvedExternalAttributions,
      panelTitle: PackagePanelTitle.ContainedExternalPackages,
      sorting,
    });

  return {
    sortedPackageCardIds,
    displayPackageInfos,
  };
}
