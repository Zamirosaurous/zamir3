// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  DeleteForever as DeleteForeverIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { DontAskAgainDialog, SearchBar } from '@cosmotech/ui';
import { ResourceUtils } from '@cosmotech/core';
import { useDatasetList } from './DatasetListHook';
import { TwoActionsDialogService } from '../../../../services/twoActionsDialog/twoActionsDialogService';
import { CreateDatasetButton } from '../CreateDatasetButton';
import { DATASET_SOURCE_TYPE, INGESTION_STATUS } from '../../../../services/config/ApiConstants';

const useStyles = makeStyles(() => ({
  searchBar: {
    width: '100%',
  },
}));

export const DatasetList = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const refreshDialogLabels = {
    title: t('commoncomponents.datasetmanager.dialogs.refresh.title', 'Overwrite data?'),
    body: t(
      'commoncomponents.datasetmanager.dialogs.refresh.body',
      'Your data will be lost, replaced with the imported one.'
    ),
    cancel: t('commoncomponents.datasetmanager.dialogs.cancel', 'Cancel'),
    confirm: t('commoncomponents.datasetmanager.dialogs.refresh.overwriteButton', 'Overwrite'),
    checkbox: t('commoncomponents.datasetmanager.dialogs.refresh.checkbox', 'Do not ask me again'),
  };

  const [isRefreshConfirmationDialogOpen, setIsRefreshConfirmationDialogOpen] = useState(false);
  const { datasets, currentDataset, selectDataset, deleteDataset, refreshDatasetById } = useDatasetList();

  const sortedDatasetList = useMemo(() => {
    return ResourceUtils.getResourceTree(datasets?.filter((dataset) => dataset.main === true));
  }, [datasets]);

  const [displayedDatasetList, setDisplayedDatasetList] = useState(sortedDatasetList);
  const [searchString, setSearchString] = useState('');
  const datasetRefreshCallback = useRef();

  useEffect(() => {
    setDisplayedDatasetList(sortedDatasetList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedDatasetList]);

  const filterDatasets = useCallback(
    (searchString) => {
      if (!searchString) {
        setDisplayedDatasetList(sortedDatasetList);
      } else {
        const datasets = sortedDatasetList.filter(
          (dataset) =>
            dataset.name.toLowerCase().includes(searchString.toLowerCase()) ||
            dataset.tags?.some((tag) => tag.toLowerCase().includes(searchString.toLowerCase()))
        );
        setDisplayedDatasetList(datasets);
      }
    },
    [sortedDatasetList]
  );

  useEffect(() => {
    filterDatasets(searchString);
  }, [searchString, filterDatasets]);

  const askConfirmationToDeleteDialog = useCallback(
    async (event, dataset) => {
      event.stopPropagation();
      const dialogProps = {
        id: 'delete-dataset',
        component: 'div',
        labels: {
          title: t('commoncomponents.datasetmanager.dialogs.delete.title', 'Delete dataset?'),
          body: (
            <Trans
              i18nKey="commoncomponents.datasetmanager.dialogs.delete.body"
              defaultValue="Do you really want to delete <i>{{datasetName}}</i>?
                This action is irreversible."
              values={{ datasetName: dataset?.name }}
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
        deleteDataset(dataset?.id);
      }
    },
    [t, deleteDataset]
  );

  const confirmAndRefreshDataset = useCallback((event, callbackFunction) => {
    event.stopPropagation();
    if (localStorage.getItem('dontAskAgainToRefreshDataset') !== 'true') {
      datasetRefreshCallback.current = callbackFunction;
      setIsRefreshConfirmationDialogOpen(true);
    } else {
      callbackFunction();
    }
  }, []);

  const onConfirmRefreshDataset = useCallback(
    (isChecked) => {
      localStorage.setItem('dontAskAgainToRefreshDataset', isChecked);
      datasetRefreshCallback.current();
      setIsRefreshConfirmationDialogOpen(false);
    },
    [setIsRefreshConfirmationDialogOpen, datasetRefreshCallback]
  );

  const datasetListHeader = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
      <Typography variant="h6">Datasets</Typography>
      <CreateDatasetButton />
    </Box>
  );

  const getDatasetListItemActions = useCallback(
    (dataset) => {
      let refreshButton = null;
      if (![DATASET_SOURCE_TYPE.NONE, DATASET_SOURCE_TYPE.LOCAL_FILE].includes(dataset.sourceType)) {
        refreshButton = (
          <IconButton
            onClick={(event) => confirmAndRefreshDataset(event, () => refreshDatasetById(dataset.id))}
            data-cy={`dataset-refresh-button-${dataset.id}`}
          >
            <RefreshIcon />
          </IconButton>
        );
      }

      return (
        <Box>
          {refreshButton}
          <IconButton
            onClick={(event) => askConfirmationToDeleteDialog(event, dataset)}
            data-cy={`dataset-delete-button-${dataset.id}`}
          >
            <DeleteForeverIcon />
          </IconButton>
        </Box>
      );
    },
    [askConfirmationToDeleteDialog, confirmAndRefreshDataset, refreshDatasetById]
  );

  return (
    <div>
      <SearchBar
        label={t('commoncomponents.datasetmanager.searchBar.label', 'Find...')}
        onSearchChange={setSearchString}
        icon={<SearchIcon />}
        className={classes.searchBar}
        id="dataset-search-bar"
      />
      <Card variant="outlined" square={true} sx={{ backgroundColor: 'transparent', mt: 1 }}>
        <List subheader={datasetListHeader} data-cy="datasets-list">
          <Divider />
          {displayedDatasetList.map((dataset) => (
            <ListItemButton
              key={dataset.id}
              data-cy={`datasets-list-item-button-${dataset.id}`}
              selected={dataset.id === currentDataset?.id}
              onClick={(e) => selectDataset(dataset)}
            >
              <ListItem
                secondaryAction={getDatasetListItemActions(dataset)}
                disableGutters
                sx={{ pl: dataset.depth * 2 }}
              >
                <ListItemText
                  data-cy={`datasets-list-item-text-${dataset.id}`}
                  primary={dataset.name}
                  primaryTypographyProps={{ variant: 'body1' }}
                  secondary={
                    dataset.ingestionStatus === INGESTION_STATUS.PENDING ? (
                      <CircularProgress data-cy={`refresh-spinner-${dataset.id}`} size="1rem" color="inherit" />
                    ) : dataset.ingestionStatus === INGESTION_STATUS.ERROR ? (
                      <ErrorIcon data-cy={`refresh-error-icon-${dataset.id}`} color="error" />
                    ) : null
                  }
                  sx={{ display: 'flex', gap: 1 }}
                />
              </ListItem>
            </ListItemButton>
          ))}
        </List>
      </Card>
      <DontAskAgainDialog
        id="refresh-dataset-dialog"
        open={isRefreshConfirmationDialogOpen}
        labels={refreshDialogLabels}
        onClose={() => setIsRefreshConfirmationDialogOpen(false)}
        onConfirm={onConfirmRefreshDataset}
      />
    </div>
  );
};
