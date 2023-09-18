// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import { Login, Scenarios, ScenarioParameters } from '../../commons/actions';
import { BreweryParameters } from '../../commons/actions/brewery';
import { DEFAULT_SCENARIOS_LIST } from '../../fixtures/stubbing/default';
import { stub } from '../../commons/services/stubbing';
import { setup } from '../../commons/utils/setup';

describe('Scenario view PowerBI report', () => {
  before(() => {
    setup.initCypressAndStubbing();
    stub.start({
      CREATE_AND_DELETE_SCENARIO: true,
      GET_DATASETS: true,
      GET_SOLUTIONS: true,
      GET_WORKSPACES: true,
      GET_ORGANIZATION: true,
      GET_SCENARIOS: true,
      LAUNCH_SCENARIO: true,
      PERMISSIONS_MAPPING: true,
      UPDATE_SCENARIO: true,
    });
    stub.setScenarios(DEFAULT_SCENARIOS_LIST);
  });

  beforeEach(() => {
    Login.login();
  });

  after(() => {
    stub.stop();
  });

  it('can correctly show "out of sync" dashboard warning & "logs download" button', () => {
    const { id: scenarioId } = DEFAULT_SCENARIOS_LIST[0];
    const runOptions = {
      runDuration: 1000,
      dataIngestionDuration: 1000,
      finalStatus: 'Successful',
      expectedPollsCount: 2,
    };

    ScenarioParameters.expandParametersAccordion();

    // First phase: warning is never visible until we first launch the scenario
    Scenarios.checkIfReportIsUnsynced(false);
    Scenarios.getScenarioBackdrop(10).should('not.be.visible');
    Scenarios.getDashboardAccordionLogsDownloadButton().should('not.exist');
    BreweryParameters.getCurrencyUsedInput().check();
    Scenarios.checkIfReportIsUnsynced(false);

    // Second phase: after a run, warning is only visible when the form is in a "dirty" state
    ScenarioParameters.launch({ scenarioId, runOptions, saveAndLaunch: true });
    Scenarios.checkIfReportIsUnsynced(false);
    Scenarios.getDashboardAccordionLogsDownloadButton().should('not.exist');
    ScenarioParameters.waitForScenarioRunEnd();
    Scenarios.checkIfReportIsUnsynced(false);
    Scenarios.getDashboardAccordionLogsDownloadButton().should('be.visible');
    BreweryParameters.getCurrencyUsedInput().uncheck();
    Scenarios.checkIfReportIsUnsynced(true);
    Scenarios.getDashboardAccordionLogsDownloadButton().should('be.visible');

    BreweryParameters.getCurrencyUsedInput().check();
    Scenarios.checkIfReportIsUnsynced(false);
    BreweryParameters.getCurrencyUsedInput().uncheck();
    Scenarios.checkIfReportIsUnsynced(true);
    ScenarioParameters.discard();
    Scenarios.checkIfReportIsUnsynced(false);
    BreweryParameters.getCurrencyUsedInput().uncheck();
    Scenarios.checkIfReportIsUnsynced(true);
    ScenarioParameters.launch({ scenarioId, runOptions, saveAndLaunch: true });
    Scenarios.checkIfReportIsUnsynced(false);
    Scenarios.getDashboardAccordionLogsDownloadButton().should('not.exist');

    // Third phase: warning is still visible after saving new parameters values, even if we "undo" local changes or
    // discard them
    ScenarioParameters.waitForScenarioRunEnd();
    BreweryParameters.getCurrencyUsedInput().check();
    // Because the stubbed run is fast (< 1 minute) and because we have to compare lastRun vs. lastUpdate at the minute
    // level, we must fake an update date in the future to make sure the update date is evaluated as "after" the last
    // run date
    const fakeLastUpdate = new Date();
    fakeLastUpdate.setMinutes(fakeLastUpdate.getMinutes() + 2);
    const customScenarioPatch = { lastUpdate: fakeLastUpdate.toISOString() };
    ScenarioParameters.save(true, customScenarioPatch);
    Scenarios.getScenarioBackdrop(10).should('not.be.visible');
    Scenarios.checkIfReportIsUnsynced(true);
    BreweryParameters.getCurrencyUsedInput().uncheck();
    BreweryParameters.getCurrencyUsedInput().check(); // "undo" local changes
    Scenarios.checkIfReportIsUnsynced(true);
    BreweryParameters.getCurrencyUsedInput().uncheck();
    ScenarioParameters.discard();
    Scenarios.checkIfReportIsUnsynced(true);
  });
});