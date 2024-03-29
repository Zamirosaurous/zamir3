import React, { useCallback } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import { Trans, useTranslation } from 'react-i18next';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';
import { IconButton } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';
import { TwoActionsDialogService } from '../../../../services/twoActionsDialog/twoActionsDialogService';
import {
  useCurrentDataset,
  useDeleteDataset,
  useRefreshDataset,
  useSelectDataset,
} from '../../../../state/hooks/DatasetHooks';
import { useWorkspaceData } from '../../../../state/hooks/WorkspaceHooks';

export default function DatasetActions({ dataset }) {
  const { t } = useTranslation();
  const deleteDataset = useDeleteDataset();
  const isDatasetCopyEnabledInWorkspace = useWorkspaceData()?.datasetCopy ?? false;
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleClicked = () => {
    if (showConfetti) {
      setShowConfetti(false);
    } else {
      setShowConfetti(true);
    }
  };
  const askConfirmationToDeleteDialog = useCallback(
    async (event, dataset) => {
      event.stopPropagation();
      const impactedScenariosWarning = isDatasetCopyEnabledInWorkspace
        ? ''
        : ' ' + // Space character is here on purpose, to separate concatenated sentences in confirmation dialog body
          t(
            'commoncomponents.datasetmanager.dialogs.delete.impactedScenariosWarning',
            'All the scenarios using this dataset will be impacted.'
          );
      const dialogProps = {
        id: 'delete-dataset',
        component: 'div',
        labels: {
          title: t('commoncomponents.datasetmanager.dialogs.delete.title', 'Delete dataset?'),
          body: (
            <Trans
              i18nKey="commoncomponents.datasetmanager.dialogs.delete.body"
              defaultValue="Do you really want to delete <i>{{datasetName}}</i>?
                This action is irreversible.{{impactedScenariosWarning}}"
              values={{ datasetName: dataset?.name, impactedScenariosWarning }}
              shouldUnescape={true}
            />
          ),
          button1: t('commoncomponents.datasetmanager.dialogs.cancel', 'Cancel'),
          button2: t('commoncomponents.datasetmanager.dialogs.delete.confirmButton', 'Delete'),
        },
        button2Props: {
          color: 'error',
        },
      };
      const result = await TwoActionsDialogService.openDialog(dialogProps);
      if (result === 2) {
        deleteDataset(dataset.datasetId);
      }
    },
    [t]
  );

  return (
    <ButtonGroup>
      {showConfetti && <ConfettiExplosion />}
      <IconButton onClick={handleClicked}>
        <HeartBrokenIcon color="primary" />
      </IconButton>
      <IconButton>
        <BabyChangingStationIcon color="primary" />
      </IconButton>
      <IconButton>
        <RefreshIcon color="primary" />
      </IconButton>
      <IconButton>
        <EditIcon color="primary" />
      </IconButton>
      <IconButton>
        <AddCircleIcon color="primary" />
      </IconButton>
      <IconButton>
        <ShareIcon color="primary" />
      </IconButton>
      <IconButton onClick={(event) => askConfirmationToDeleteDialog(event, dataset)}>
        {/* deleteDataset(dataset.datasetId?) */}
        <DeleteForeverIcon color="primary" />
      </IconButton>
    </ButtonGroup>
  );
}
