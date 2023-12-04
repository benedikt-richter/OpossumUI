// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
// SPDX-FileCopyrightText: Nico Carl <nicocarl@protonmail.com>
//
// SPDX-License-Identifier: Apache-2.0
import AddIcon from '@mui/icons-material/Add';
import ExploreIcon from '@mui/icons-material/Explore';
import MuiChip from '@mui/material/Chip';
import MuiIconButton from '@mui/material/IconButton';
import MuiTooltip from '@mui/material/Tooltip';
import { compact, orderBy } from 'lodash';
import { useMemo } from 'react';

import { PackageInfo } from '../../../shared/shared-types';
import { text } from '../../../shared/text';
import { baseIcon, OpossumColors } from '../../shared-styles';
import { setTemporaryDisplayPackageInfo } from '../../state/actions/resource-actions/all-views-simple-actions';
import { addToSelectedResource } from '../../state/actions/resource-actions/save-actions';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import {
  getExternalAttributionSources,
  getExternalData,
  getManualData,
  getTemporaryDisplayPackageInfo,
} from '../../state/selectors/all-views-resource-selectors';
import {
  getResolvedExternalAttributions,
  getSelectedResourceId,
} from '../../state/selectors/audit-view-resource-selectors';
import { convertDisplayPackageInfoToPackageInfo } from '../../util/convert-package-info';
import {
  getContainedExternalPackages,
  getContainedManualPackages,
} from '../../util/get-contained-packages';
import { generatePurl } from '../../util/handle-purl';
import { isImportantAttributionInformationMissing } from '../../util/is-important-attribution-information-missing';
import { maybePluralize } from '../../util/maybe-pluralize';
import { Autocomplete } from '../Autocomplete/Autocomplete';

type SignalWithCount = PackageInfo & {
  count?: number;
};

interface Props {
  title: string;
  attribute: Extract<
    keyof PackageInfo,
    | 'packageType'
    | 'packageNamespace'
    | 'packageName'
    | 'packageVersion'
    | 'url'
    | 'licenseName'
  >;
  highlight?: 'default' | 'dark';
  endAdornment?: React.ReactElement;
  defaults?: Array<SignalWithCount>;
  disabled: boolean;
  showHighlight: boolean | undefined;
}

export function PackageAutocomplete({
  attribute,
  title,
  highlight,
  endAdornment,
  defaults = [],
  disabled,
  showHighlight,
}: Props) {
  const { signals, sources } = useSignals({ attribute });
  const dispatch = useAppDispatch();
  const packageInfo = useAppSelector(getTemporaryDisplayPackageInfo);

  return (
    <Autocomplete
      title={title}
      disabled={disabled}
      autoHighlight
      disableClearable
      freeSolo
      highlight={
        showHighlight &&
        isImportantAttributionInformationMissing(attribute, packageInfo)
          ? highlight
          : undefined
      }
      options={signals.concat(defaults)}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option[attribute] || ''
      }
      getOptionKey={(option) =>
        typeof option === 'string'
          ? option
          : compact([
              option.copyright,
              option.licenseName,
              option[attribute],
              generatePurl(option),
            ]).join()
      }
      renderOptionStartIcon={(option) =>
        option.count && (
          <MuiTooltip
            title={`${maybePluralize(
              option.count,
              text.attributionColumn.occurrence,
            )} ${text.attributionColumn.amongSignals}`}
          >
            <MuiChip
              label={option.count}
              size={'small'}
              sx={{ marginRight: '12px' }}
            />
          </MuiTooltip>
        )
      }
      renderOptionEndIcon={renderOptionEndIcon}
      value={packageInfo as SignalWithCount}
      isOptionEqualToValue={(option, value) =>
        option[attribute] === value[attribute]
      }
      groupBy={(option) =>
        option.source
          ? sources[option.source.name]?.name || option.source.name
          : text.attributionColumn.manualAttributions
      }
      groupIcon={
        <ExploreIcon
          sx={{
            ...baseIcon,
            color: `${OpossumColors.black} !important`,
          }}
        />
      }
      optionText={{
        primary: (option) =>
          typeof option === 'string' ? option : option[attribute],
        secondary: (option) =>
          typeof option === 'string' ? option : generatePurl(option),
      }}
      onInputChange={(_, value) => {
        packageInfo[attribute] !== value &&
          dispatch(
            setTemporaryDisplayPackageInfo({
              ...packageInfo,
              [attribute]: value,
            }),
          );
      }}
      endAdornment={endAdornment}
    />
  );

  function renderOptionEndIcon(
    {
      copyright,
      licenseName,
      licenseText,
      originIds,
      packageName,
      packageNamespace,
      packageType,
      packageVersion,
      preferred,
      source,
      url,
      wasPreferred,
    }: PackageInfo,
    { closePopper }: { closePopper: () => void },
  ) {
    if (!packageName || !packageType) {
      return null;
    }

    return (
      <MuiTooltip
        title={text.attributionColumn.useAutocompleteSuggestion}
        disableInteractive
      >
        <MuiIconButton
          onClick={(event) => {
            event.stopPropagation();
            dispatch(
              addToSelectedResource(
                convertDisplayPackageInfoToPackageInfo({
                  attributionConfidence: packageInfo.attributionConfidence,
                  attributionIds: packageInfo.attributionIds,
                  copyright,
                  licenseName,
                  licenseText,
                  originIds,
                  packageName,
                  packageNamespace,
                  packageType,
                  packageVersion,
                  preferred,
                  source,
                  url,
                  wasPreferred,
                }),
              ),
            );
            closePopper();
          }}
          size={'small'}
        >
          <AddIcon fontSize={'inherit'} color={'primary'} />
        </MuiIconButton>
      </MuiTooltip>
    );
  }
}

function useSignals({ attribute }: Pick<Props, 'attribute'>) {
  const resourceId = useAppSelector(getSelectedResourceId);
  const externalData = useAppSelector(getExternalData);
  const manualData = useAppSelector(getManualData);
  const sources = useAppSelector(getExternalAttributionSources);
  const resolvedExternalAttributions = useAppSelector(
    getResolvedExternalAttributions,
  );

  return {
    sources,
    signals: useMemo(() => {
      const signalsOnResource = (
        externalData.resourcesToAttributions[resourceId] || []
      ).map((id) => externalData.attributions[id]);
      const signalsOnChildren = getContainedExternalPackages(
        resourceId,
        externalData.resourcesWithAttributedChildren,
        externalData.resourcesToAttributions,
        resolvedExternalAttributions,
      ).map(({ attributionId }) => externalData.attributions[attributionId]);
      const attributionsOnChildren = getContainedManualPackages(
        resourceId,
        manualData,
      ).map(({ attributionId }) => manualData.attributions[attributionId]);

      const getUniqueKey = (item: PackageInfo) =>
        compact([
          item.source && sources[item.source.name]?.name,
          item.copyright,
          item.licenseName,
          item[attribute],
          generatePurl(item),
        ]).join();

      const signals = [
        ...signalsOnResource,
        ...signalsOnChildren,
        ...attributionsOnChildren,
      ].reduce<Array<SignalWithCount>>((acc, signal) => {
        if (
          ['', undefined].includes(signal[attribute]) ||
          !generatePurl(signal)
        ) {
          return acc;
        }

        const key = getUniqueKey(signal);
        const dupeIndex = acc.findIndex((item) => getUniqueKey(item) === key);

        if (dupeIndex === -1) {
          acc.push({
            count: 1,
            ...signal,
          });
        } else {
          acc[dupeIndex] = {
            ...acc[dupeIndex],
            count: (acc[dupeIndex].count ?? 0) + 1,
            preSelected: acc[dupeIndex].preSelected || signal.preSelected,
          };
        }

        return acc;
      }, []);

      return orderBy(
        signals,
        [
          ({ source }) => (source && sources[source.name])?.priority ?? 0,
          'count',
        ],
        ['desc', 'desc'],
      );
    }, [
      externalData.resourcesToAttributions,
      externalData.resourcesWithAttributedChildren,
      externalData.attributions,
      resourceId,
      resolvedExternalAttributions,
      manualData,
      attribute,
      sources,
    ]),
  };
}
