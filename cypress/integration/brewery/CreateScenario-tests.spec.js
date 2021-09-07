// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import {
  SCENARIO_NAME,
  URL_REGEX,
  BAR_PARAMETERS_RANGE,
  PAGE_NAME,
  URL_ROOT,
  DATASET,
  SCENARIO_TYPE,
  SCENARIO_RUN_IN_PROGRESS,
  BASIC_PARAMETERS_CONST
} from '../../commons/TestConstants';
import { SELECTORS } from '../../commons/IdConstants';
import utils from '../../commons/TestUtils';

describe('Create scenario', () => {
  const scenarioMasterName = SCENARIO_NAME.SCENARIO_MASTER + utils.randomStr(7);
  const scenarioChildName = SCENARIO_NAME.SCENARIO_CHILD + utils.randomStr(7);
  const scenarioWithBasicTypes = SCENARIO_NAME.SCENARIO_WITH_BASIC_TYPES + utils.randomStr(7);
  const otherScenarioName = SCENARIO_NAME.OTHER_SCENARIO;
  let otherScenarioId;
  let urlRegexWithOtherScenarioId;

  const stock = utils.randomNmbr(BAR_PARAMETERS_RANGE.STOCK.MIN, BAR_PARAMETERS_RANGE.STOCK.MAX);
  const restock = utils.randomNmbr(BAR_PARAMETERS_RANGE.RESTOCK.MIN, BAR_PARAMETERS_RANGE.RESTOCK.MAX);
  const waiters = utils.randomNmbr(BAR_PARAMETERS_RANGE.WAITERS.MIN, BAR_PARAMETERS_RANGE.WAITERS.MAX);

  const textValue = utils.randomStr(8);
  const numberValue = utils.randomNmbr(BASIC_PARAMETERS_CONST.NUMBER.MIN, BASIC_PARAMETERS_CONST.NUMBER.MAX);
  const enumValue = utils.randomEnum(BASIC_PARAMETERS_CONST.ENUM);

  Cypress.Keyboard.defaults({
    keystrokeDelay: 0
  });

  it('can create and lauch scenario master', () => {
    // Create scenario master:
    let scenarioCreatedId, scenarioCreatedName;
    cy.createScenario(scenarioMasterName, true, DATASET.BREWERY_ADT, SCENARIO_TYPE.BREWERY_PARAMETERS)
      .then((value) => {
        scenarioCreatedId = value.scenarioCreatedId;
        scenarioCreatedName = value.scenarioCreatedName;
      });

    // Edit master paramameters values
    cy.get(SELECTORS.scenario.parameters.editButton).click();
    cy.get(SELECTORS.scenario.parameters.tabs).should('be.visible');
    cy.get(SELECTORS.scenario.parameters.brewery.stockInput).find('input').clear().type(stock);
    cy.get(SELECTORS.scenario.parameters.brewery.restockInput).find('input').clear().type(restock);
    cy.get(SELECTORS.scenario.parameters.brewery.waitersInput).find('input').clear().type(waiters);

    // Update and launch scenario master
    cy.intercept('PATCH', URL_REGEX.WITH_UNKNOWN_ID_SCENARIO_SUFFIX)
      .as('requestEditScenario');
    cy.intercept('POST', URL_REGEX.WITH_RUN_SUFFIX)
      .as('requestRunScenario');

    cy.get(SELECTORS.scenario.parameters.updateAndLaunchButton).click();

    cy.wait('@requestEditScenario').should((req) => {
      const { name: nameGet, id: idGet, parametersValues: paramsGet, state } = req.response.body;
      const stockGet = parseFloat(paramsGet.find(obj => obj.parameterId === 'stock').value);
      const restockGet = parseFloat(paramsGet.find(obj => obj.parameterId === 'restock_qty').value);
      const waitersGet = parseFloat(paramsGet.find(obj => obj.parameterId === 'nb_waiters').value);
      expect(nameGet).equal(scenarioCreatedName);
      expect(state).equal('Created');
      expect(idGet).equal(scenarioCreatedId);
      expect(stockGet).equal(stock);
      expect(restockGet).equal(restock);
      expect(waitersGet).equal(waiters);
    });

    cy.wait('@requestRunScenario').should((req) => {
      expect(req.response.body.scenarioId).equal(scenarioCreatedId);
    });

    cy.get(SELECTORS.scenario.dashboard.placeholder).should('have.text', SCENARIO_RUN_IN_PROGRESS);

    // Switch to another scenario then come back to the first scenario
    cy.intercept('GET', urlRegexWithOtherScenarioId).as('requestUpdateCurrentScenario2');

    cy.get(SELECTORS.scenario.selectInput).click().clear().type(otherScenarioName + '{downarrow}{enter}');

    cy.wait('@requestUpdateCurrentScenario2').its('response').its('body')
      .its('name').should('equal', otherScenarioName);

    cy.get(SELECTORS.scenario.selectInput).find('input').should('have.value', otherScenarioName);

    cy.get('@scenarioCreatedId').then(scenarioCreatedId => {
      cy.intercept('GET', new RegExp(`^${URL_ROOT}/.*${PAGE_NAME.SCENARIOS}/${scenarioCreatedId}`))
        .as('requestUpdateCurrentScenario3');
    });

    cy.get(SELECTORS.scenario.selectInput).clear().type(scenarioMasterName + '{downarrow}{enter}');

    cy.wait('@requestUpdateCurrentScenario3').its('response').its('body')
      .its('name').should('equal', scenarioMasterName);

    cy.get(SELECTORS.scenario.selectInput).find('input').should('have.value', scenarioMasterName);

    cy.get(SELECTORS.scenario.parameters.brewery.stockInput).find('input').should('have.value', stock);
    cy.get(SELECTORS.scenario.parameters.brewery.restockInput).find('input').should('have.value', restock);
    cy.get(SELECTORS.scenario.parameters.brewery.waitersInput).find('input').should('have.value', waiters);
  });

  it('can create scenario child', () => {
    // Log and launch app on scenario view
    cy.visit(PAGE_NAME.SCENARIO);
    cy.login();

    // Create Scenario Child
    let scenarioCreatedId, scenarioCreatedName;
    cy.createScenario(scenarioChildName, false, scenarioMasterName, SCENARIO_TYPE.BREWERY_PARAMETERS).then(value => {
      scenarioCreatedId = value.scenarioCreatedId;
      scenarioCreatedName = value.scenarioCreatedName;
    });

    // Check inherited children parameters
    cy.get(SELECTORS.scenario.parameters.brewery.stockInput).find('input').should('have.value', stock);
    cy.get(SELECTORS.scenario.parameters.brewery.restockInput).find('input').should('have.value', restock);
    cy.get(SELECTORS.scenario.parameters.brewery.waitersInput).find('input').should('have.value', waiters);

    // Edit child paramameters values
    const childStock = utils.randomNmbr(BAR_PARAMETERS_RANGE.STOCK.MIN, BAR_PARAMETERS_RANGE.STOCK.MAX);
    const childRestock = utils.randomNmbr(BAR_PARAMETERS_RANGE.RESTOCK.MIN, BAR_PARAMETERS_RANGE.RESTOCK.MAX);
    const childWaiters = utils.randomNmbr(BAR_PARAMETERS_RANGE.WAITERS.MIN, BAR_PARAMETERS_RANGE.WAITERS.MAX);

    cy.get(SELECTORS.scenario.parameters.editButton).click();
    cy.get(SELECTORS.scenario.parameters.tabs).should('be.visible');
    cy.get(SELECTORS.scenario.parameters.brewery.stockInput).find('input').clear().type(childStock);
    cy.get(SELECTORS.scenario.parameters.brewery.restockInput).find('input').clear().type(childRestock);
    cy.get(SELECTORS.scenario.parameters.brewery.waitersInput).find('input').clear().type(childWaiters);

    // Launch scenario child
    cy.intercept('PATCH', URL_REGEX.WITH_UNKNOWN_ID_SCENARIO_SUFFIX)
      .as('requestEditScenario');
    cy.intercept('POST', URL_REGEX.WITH_RUN_SUFFIX)
      .as('requestRunScenario');

    cy.get(SELECTORS.scenario.parameters.updateAndLaunchButton).click();

    cy.wait('@requestEditScenario').should((req) => {
      const { name: nameGet, id: idGet, parametersValues: paramsGet } = req.response.body;
      const stockGet = parseFloat(paramsGet.find(obj => obj.parameterId === 'stock').value);
      const restockGet = parseFloat(paramsGet.find(obj => obj.parameterId === 'restock_qty').value);
      const waitersGet = parseFloat(paramsGet.find(obj => obj.parameterId === 'nb_waiters').value);
      expect(nameGet).equal(scenarioCreatedName);
      expect(idGet).equal(scenarioCreatedId);
      expect(stockGet).equal(childStock);
      expect(restockGet).equal(childRestock);
      expect(waitersGet).equal(childWaiters);
    });

    cy.wait('@requestRunScenario').should((req) => {
      expect(req.response.body.scenarioId).equal(scenarioCreatedId);
    });

    cy.get(SELECTORS.scenario.dashboard.placeholder).should('have.text', SCENARIO_RUN_IN_PROGRESS);

    // Switch to another scenario then come back to the first scenario
    cy.intercept('GET', urlRegexWithOtherScenarioId)
      .as('requestUpdateCurrentScenario2');

    cy.get(SELECTORS.scenario.selectInput).click().clear().type(otherScenarioName + '{downarrow}{enter}');

    cy.wait('@requestUpdateCurrentScenario2').should((req) => {
      const nameGet = req.response.body.name;
      expect(nameGet).equal(otherScenarioName);
    });

    cy.get(SELECTORS.scenario.selectInput).find('input').should('have.value', otherScenarioName);

    cy.get('@scenarioCreatedId').then(scenarioCreatedId => {
      cy.intercept('GET', new RegExp(`^${URL_ROOT}/.*${PAGE_NAME.SCENARIOS}/${scenarioCreatedId}`))
        .as('requestUpdateCurrentScenario3');
    });

    cy.get(SELECTORS.scenario.selectInput).clear().type(scenarioChildName + '{downarrow}{enter}');

    cy.wait('@requestUpdateCurrentScenario3').should((req) => {
      const nameGet = req.response.body.name;
      expect(nameGet).equal(scenarioChildName);
    });

    cy.get(SELECTORS.scenario.selectInput).find('input').should('have.value', scenarioChildName);

    cy.get(SELECTORS.scenario.parameters.brewery.stockInput).find('input').should('have.value', childStock);
    cy.get(SELECTORS.scenario.parameters.brewery.restockInput).find('input').should('have.value', childRestock);
    cy.get(SELECTORS.scenario.parameters.brewery.waitersInput).find('input').should('have.value', childWaiters);
  });

  it('can create scenario, edit/discard parameters and switch between parameters tabs', () => {
    // Log and launch app on scenario view
    cy.visit(PAGE_NAME.SCENARIO);
    cy.login();

    // Create Scenario with some paramaters tabs
    let scenarioCreatedId, scenarioCreatedName;
    cy.createScenario(scenarioWithBasicTypes, true, DATASET.BREWERY_ADT, SCENARIO_TYPE.BASIC_TYPES).then(value => {
      scenarioCreatedId = value.scenarioCreatedId;
      scenarioCreatedName = value.scenarioCreatedName;
    });

    // Edit paramameters values
    cy.get(SELECTORS.scenario.parameters.editButton).click();
    cy.get(SELECTORS.scenario.parameters.basicTypes.tabName).click();

    cy.get(SELECTORS.scenario.parameters.basicTypes.textInput).invoke('attr', 'value').as('basic-text-input');
    cy.get(SELECTORS.scenario.parameters.basicTypes.numberInput).invoke('attr', 'value').as('basic-number-input');
    cy.get(SELECTORS.scenario.parameters.basicTypes.enumInput).next('input')
      .invoke('attr', 'value').as('basic-enum-input');

    cy.get(SELECTORS.scenario.parameters.basicTypes.textInput).click().clear().type(textValue);
    cy.get(SELECTORS.scenario.parameters.basicTypes.numberInput).click().clear().type(numberValue);
    cy.get(SELECTORS.scenario.parameters.basicTypes.enumInput).type(enumValue + ' {enter}');

    // switch parameters tabs then back and check parameters,
    cy.get(SELECTORS.scenario.parameters.uploadFile.tabName).click();
    cy.get(SELECTORS.scenario.parameters.basicTypes.tabName).click();

    cy.get(SELECTORS.scenario.parameters.basicTypes.textInput).should('value', textValue);
    cy.get(SELECTORS.scenario.parameters.basicTypes.numberInput).should('value', numberValue);
    cy.get(SELECTORS.scenario.parameters.basicTypes.enumInput).next('input').invoke('attr', 'value').then(value => {
      expect(BASIC_PARAMETERS_CONST.ENUM[value], enumValue);
    });

    // discard
    cy.get(SELECTORS.scenario.parameters.discardButton).click();
    cy.get(SELECTORS.scenario.parameters.dialogDiscardButton).click();

    cy.get('@basic-text-input').then(input => {
      cy.get(SELECTORS.scenario.parameters.basicTypes.textInput).should('value', input);
    });
    cy.get('@basic-number-input').then(input => {
      cy.get(SELECTORS.scenario.parameters.basicTypes.numberInput).should('value', input);
    });
    cy.get('@basic-enum-input').then(input => {
      cy.get(SELECTORS.scenario.parameters.basicTypes.enumInput).next('input')
        .invoke('attr', 'value').then(value => {
          expect(BASIC_PARAMETERS_CONST.ENUM[value], enumValue);
        });
    });

    // re-edit
    cy.get(SELECTORS.scenario.parameters.editButton).click();
    cy.get(SELECTORS.scenario.parameters.basicTypes.tabName).click();

    cy.get(SELECTORS.scenario.parameters.basicTypes.textInput).click().clear().type(textValue);
    cy.get(SELECTORS.scenario.parameters.basicTypes.numberInput).click().clear().type(numberValue);
    cy.get(SELECTORS.scenario.parameters.basicTypes.enumInput).type(enumValue + ' {enter}');

    // update and launch
    cy.intercept('PATCH', URL_REGEX.WITH_UNKNOWN_ID_SCENARIO_SUFFIX)
      .as('requestEditScenario');
    cy.intercept('POST', URL_REGEX.WITH_RUN_SUFFIX)
      .as('requestRunScenario');

    cy.get(SELECTORS.scenario.parameters.updateAndLaunchButton).click();

    cy.wait('@requestEditScenario').should((req) => {
      const { name: nameGet, id: idGet, parametersValues: paramsGet, state } = req.response.body;
      const textGet = paramsGet.find(obj => obj.parameterId === 'currency_name').value;
      const numberGet = parseFloat(paramsGet.find(obj => obj.parameterId === 'currency_value').value);
      const enumGet = paramsGet.find(obj => obj.parameterId === 'currency').value;
      expect(nameGet).equal(scenarioCreatedName);
      expect(state).equal('Created');
      expect(idGet).equal(scenarioCreatedId);
      expect(textGet).equal(textValue);
      expect(numberGet).equal(numberValue);
      expect(BASIC_PARAMETERS_CONST.ENUM[enumGet]).equal(enumValue);
    });

    cy.wait('@requestRunScenario').should((req) => {
      expect(req.response.body.scenarioId).equal(scenarioCreatedId);
    });

    cy.get(SELECTORS.scenario.dashboard.placeholder).should('have.text', SCENARIO_RUN_IN_PROGRESS);
  });
});
