// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import { all, fork } from 'redux-saga/effects';
import { FindScenarioRunById } from './FindScenarioRunById';
import { stopScenarioRunSaga } from './StopScenarioRun';

export default function* scenarioRunSaga() {
  yield all([fork(FindScenarioRunById), fork(stopScenarioRunSaga)]);
}
