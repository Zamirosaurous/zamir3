// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import { DATASET_ACTIONS_KEY } from '../../commons/DatasetConstants';

export const dispatchGetAllDatasets = (payLoad) => ({
  type: DATASET_ACTIONS_KEY.GET_ALL_DATASETS,
  ...payLoad,
});

export const dispatchAddDatasetToStore = (payLoad) => {
  return {
    type: DATASET_ACTIONS_KEY.ADD_DATASET,
    ...payLoad,
  };
};

export const dispatchSetCurrentDatasetIndex = (datasetIndex) => {
  return {
    type: DATASET_ACTIONS_KEY.SET_CURRENT_DATASET_INDEX,
    selectedDatasetIndex: datasetIndex,
  };
};

export const dispatchDeleteDataset = (organizationId, datasetId) => ({
  type: DATASET_ACTIONS_KEY.DELETE_DATASET,
  organizationId,
  datasetId,
});
