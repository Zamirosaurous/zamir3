// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useReuploadFileDatasetButton } from './ReuploadFileDatasetButtonHook';
import { DatasetsUtils } from '../../../../utils';
import { INGESTION_STATUS } from '../../../../services/config/ApiConstants';

export const ReuploadFileDatasetButton = ({ confirmAndCallback, datasetId, disabled, iconButton }) => {
  const { t } = useTranslation();
  const { organizationId, pollTwingraphStatus, setApplicationErrorMessage, updateDatasetInStore } =
    useReuploadFileDatasetButton();

  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (file == null) return;

      const response = await DatasetsUtils.uploadZipWithFetchApi(organizationId, datasetId, file);
      if (response?.ok) {
        updateDatasetInStore(datasetId, { ingestionStatus: INGESTION_STATUS.PENDING });
        pollTwingraphStatus(datasetId);
      } else {
        let error = null;
        if (response?.status === 400) {
          error = await new Response(response.body).json();
          console.error(error);
        }
        setApplicationErrorMessage(
          error,
          t('commoncomponents.banner.datasetFileReuploadFailed', 'The file upload for dataset update has failed')
        );
        updateDatasetInStore(datasetId, { ingestionStatus: INGESTION_STATUS.ERROR });
      }
    },
    [datasetId, organizationId, pollTwingraphStatus, setApplicationErrorMessage, t, updateDatasetInStore]
  );

  const openFileBrowser = useCallback((inputElementId) => document.getElementById(inputElementId).click(), []);

  const inputId = useMemo(() => `dataset-reupload-input-${datasetId}`, [datasetId]);
  return (
    <>
      <input hidden type="file" accept="application/zip" id={inputId} onChange={handleFileUpload} />
      {iconButton ? (
        <IconButton
          component="span"
          data-cy={`dataset-reupload-button-${datasetId}`}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            confirmAndCallback(event, () => openFileBrowser(inputId));
          }}
        >
          <RefreshIcon />
        </IconButton>
      ) : (
        <Button
          data-cy={`dataset-reupload-button-${datasetId}`}
          disabled={disabled}
          variant="contained"
          onClick={(event) => {
            event.stopPropagation();
            openFileBrowser(inputId);
          }}
        >
          {t('commoncomponents.datasetmanager.overview.placeholder.retryButton', 'Retry')}
        </Button>
      )}
    </>
  );
};

ReuploadFileDatasetButton.propTypes = {
  datasetId: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  confirmAndCallback: PropTypes.func,
  iconButton: PropTypes.bool,
};

ReuploadFileDatasetButton.defaultProps = {
  disabled: false,
  iconButton: true,
};
