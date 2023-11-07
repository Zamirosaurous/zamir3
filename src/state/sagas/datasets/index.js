// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import { all, fork } from 'redux-saga/effects';
import { findAllDatasetsData } from './FindAllDatasets';
import { deleteDatasetSaga } from './DeleteDataset';

export default function* datasetSaga() {
  yield all([fork(findAllDatasetsData), fork(deleteDatasetSaga)]);
}
