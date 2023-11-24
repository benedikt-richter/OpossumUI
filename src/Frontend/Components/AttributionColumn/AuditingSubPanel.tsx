// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import MuiBox from '@mui/material/Box';
import MuiPaper from '@mui/material/Paper';
import { ReactElement } from 'react';

import {
  DiscreteConfidence,
  DisplayPackageInfo,
} from '../../../shared/shared-types';
import { CheckboxLabel } from '../../enums/enums';
import { useAppSelector } from '../../state/hooks';
import { getExternalAttributionSources } from '../../state/selectors/all-views-resource-selectors';
import { doNothing } from '../../util/do-nothing';
import { prettifySource } from '../../util/prettify-source';
import { Checkbox } from '../Checkbox/Checkbox';
import { Dropdown } from '../InputElements/Dropdown';
import { TextBox } from '../InputElements/TextBox';
import { TextFieldStack } from '../TextFieldStack/TextFieldStack';
import { attributionColumnClasses } from './shared-attribution-column-styles';

const classes = {
  sourceField: {
    flex: 1,
  },
  displayRow: {
    display: 'flex',
    gap: '8px',
  },
  root: {
    ...attributionColumnClasses.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

interface AuditingSubPanelProps {
  isEditable: boolean;
  displayPackageInfo: DisplayPackageInfo;
  isCommentsBoxCollapsed: boolean;
  commentBoxHeight: number;
  followUpChangeHandler(event: React.ChangeEvent<HTMLInputElement>): void;
  excludeFromNoticeChangeHandler(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void;
  discreteConfidenceChangeHandler(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void;
  firstPartyChangeHandler(event: React.ChangeEvent<HTMLInputElement>): void;
  showHighlight?: boolean;
}

export function AuditingSubPanel(props: AuditingSubPanelProps): ReactElement {
  const attributionSources = useAppSelector(getExternalAttributionSources);

  return (
    <MuiPaper sx={classes.root} elevation={0} square={true}>
      <MuiBox>
        <Checkbox
          label={CheckboxLabel.FirstParty}
          disabled={!props.isEditable}
          checked={Boolean(props.displayPackageInfo.firstParty)}
          onChange={props.firstPartyChangeHandler}
        />
        <Checkbox
          label={CheckboxLabel.FollowUp}
          disabled={!props.isEditable}
          checked={Boolean(props.displayPackageInfo.followUp)}
          onChange={props.followUpChangeHandler}
        />
        <Checkbox
          label={CheckboxLabel.ExcludeFromNotice}
          disabled={!props.isEditable}
          checked={Boolean(props.displayPackageInfo.excludeFromNotice)}
          onChange={props.excludeFromNoticeChangeHandler}
        />
      </MuiBox>
      <MuiBox sx={classes.displayRow}>
        <Dropdown
          sx={{ width: '120px' }}
          isEditable={props.isEditable}
          title={'Confidence'}
          handleChange={props.discreteConfidenceChangeHandler}
          value={(
            props.displayPackageInfo.attributionConfidence ||
            DiscreteConfidence.High
          ).toString()}
          menuItems={[
            {
              value: DiscreteConfidence.High.toString(),
              name: `High (${DiscreteConfidence.High})`,
            },
            {
              value: DiscreteConfidence.Low.toString(),
              name: `Low (${DiscreteConfidence.Low})`,
            },
          ]}
        />
        <TextBox
          isEditable={false}
          sx={classes.sourceField}
          title={'Source'}
          text={prettifySource(
            props.displayPackageInfo.source?.additionalName ??
              props.displayPackageInfo.source?.name,
            attributionSources,
          )}
          handleChange={doNothing}
        />
      </MuiBox>
      <TextFieldStack
        isEditable={props.isEditable}
        comments={props.displayPackageInfo.comments || []}
        isCollapsed={props.isCommentsBoxCollapsed}
        commentBoxHeight={props.commentBoxHeight}
      />
    </MuiPaper>
  );
}
