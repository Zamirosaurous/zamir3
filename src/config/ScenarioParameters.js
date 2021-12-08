// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

// Use the PARAMETERS dict below to override or add information to the scenario parameters defined in your solution
// description, such as:
//  - a default value for each scenario parameter on scenario creation
//  - lists of possible values for "enum" parameters
//  - translation labels

import { APP_ROLES } from './Profiles';

const PARAMETERS = {
  nb_waiters: {
    dataCy: 'waiters-input',
    defaultValue: 5,
  },
  restock_qty: {
    dataCy: 'restock-input',
    defaultValue: 25,
  },
  stock: {
    dataCy: 'stock-input',
    defaultValue: 100,
  },
  currency: {
    dataCy: 'currency',
    defaultValue: 'USD',
    enumValues: [
      {
        key: 'USD',
        value: '$',
      },
      {
        key: 'EUR',
        value: '€',
      },
      {
        key: 'BTC',
        value: '฿',
      },
      {
        key: 'JPY',
        value: '¥',
      },
    ],
  },
  currency_name: {
    dataCy: 'currency_name',
    defaultValue: 'EUR',
  },
  currency_value: {
    dataCy: 'currency_value',
    defaultValue: 1000,
  },
  currency_used: {
    dataCy: 'currency_used',
    labels: {
      en: 'Use currency',
      fr: 'Activer la monnaie',
    },
    defaultValue: false,
  },
  start_date: {
    dataCy: 'start_date',
    defaultValue: new Date('2014-08-18T21:11:54'),
  },
  initial_stock_dataset: {
    dataCy: 'initial_stock_dataset',
    connectorId: 'C-XPv4LBVGAL',
    defaultFileTypeFilter: '.zip,.csv,.json,.xls,.xlsx',
    description: 'Initial stock dataset part',
  },
  example_dataset_part_1: {
    dataCy: 'example_dataset_part_1',
    connectorId: 'C-XPv4LBVGAL',
    defaultFileTypeFilter: '.zip,.csv,.json,.xls,.xlsx',
    description: '1st example of dataset part',
  },
  example_dataset_part_2: {
    dataCy: 'example_dataset_part_2',
    connectorId: 'C-XPv4LBVGAL',
    defaultFileTypeFilter: '.zip,.csv,.json,.xls,.xlsx',
    description: '2nd example of dataset part',
  },
  example_dataset_part_3: {
    dataCy: 'example_dataset_part_3',
    connectorId: 'C-XPv4LBVGAL',
    defaultFileTypeFilter: '.zip,.csv,.json,.xls,.xlsx',
    description: '3rd example of dataset part',
  },
  customers: {
    dataCy: 'customers_table',
    labels: {
      en: 'Transport levers',
      fr: 'Leviers de transport',
    },
    connectorId: 'C-XPv4LBVGAL',
    description: 'transport lever data',
    subType: 'TABLE',
    dateFormat: 'dd/MM/yyyy',
    columns: [
      { field: 'lever id', type: ['string'] },
      { field: 'Number of deliveries', type: ['int'] },
      {
        field: 'Transport mode',
        type: ['enum'],
        enumValues: ['Electric Hybrid', 'SeaShip'],
      },
      { field: 'Distance', type: ['number'], minValue: 0},
      { field: 'Year of application', type: ['int'], minValue: 2021, maxValue: 2030 },
    ],
  },
};

// Use the PARAMETERS_GROUPS dict below to override or add information to the parameters groups defined in your solution
// description, such as:
//  - translation labels
//  - list and order of the parameters of a group
// You can also create new groups that were not defined in the solution description: in this case don't forget to assign
// these parameters groups to a run template in the RUN_TEMPLATES dict
const PARAMETERS_GROUPS = {
  bar_parameters: {
    labels: {
      en: 'Pub parameters',
      fr: 'Paramètres du bar',
    },
    parameters: ['stock', 'restock_qty', 'nb_waiters'],
  },
  basic_types: {
    parameters: ['currency', 'currency_name', 'currency_value', 'currency_used', 'start_date'],
    authorizedRoles: [APP_ROLES.PlatformAdmin, APP_ROLES.OrganizationUser],
    hideParameterGroupIfNoPermission: false,
  },
  file_upload: {
    labels: {
      en: 'Initial values',
      fr: 'Valeurs initiales',
    },
    parameters: ['initial_stock_dataset'],
  },
  dataset_parts: {
    labels: {
      en: 'Dataset parts',
      fr: 'Fragments de dataset',
    },
    parameters: ['example_dataset_part_1', 'example_dataset_part_2'],
  },
  extra_dataset_part: {
    labels: {
      en: 'Additional dataset part',
      fr: 'Fragment additionel',
    },
    parameters: ['example_dataset_part_3'],
  },
  customers: {
    labels: {
      en: 'Transport levers',
      fr: 'Leviers de transport',
    },
    parameters: ['customers'],
  },
};

// Use RUN_TEMPLATES dict below to override information of the run templates defined in your solution description, such
// as:
//  - list and order of the parameters group to display for this run template
const RUN_TEMPLATES = {
  1: {
    // Use 'parameterGroups' instead of 'parametersGroups' in the run templates description to be consistent
    // with back-end format
    parameterGroups: ['bar_parameters', 'file_upload'],
  },
  3: {
    parameterGroups: ['basic_types', 'dataset_parts', 'extra_dataset_part', 'customers'],
  },
};

export const SCENARIO_PARAMETERS_CONFIG = {
  parameters: PARAMETERS,
  parametersGroups: PARAMETERS_GROUPS,
  runTemplates: RUN_TEMPLATES,
};
