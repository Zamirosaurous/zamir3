// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { Login, DatasetManager } from '../../commons/actions';
import { stub } from '../../commons/services/stubbing';
import {
  CUSTOM_SUBDATASOURCES,
  DATASETS,
  SOLUTION,
  WORKSPACE,
  WORKSPACE_WITHOUT_CONFIG,
  ORGANIZATION_WITH_DEFAULT_ROLE_USER,
} from '../../fixtures/stubbing/DatasetManager';

const WORKSPACES = [WORKSPACE, WORKSPACE_WITHOUT_CONFIG];
const forgeSubdatasetNameFromParentName = (parentName) => `${parentName} (subdataset)`;

describe('Subdatasets creation', () => {
  before(() => {
    stub.start();
    stub.setOrganizations([ORGANIZATION_WITH_DEFAULT_ROLE_USER]);
    stub.setSolutions([SOLUTION]);
    stub.setWorkspaces(WORKSPACES);
    stub.setDatasets([...DATASETS]);
  });
  beforeEach(() => Login.login({ url: '/W-stbbdbrwryWithDM', workspaceId: 'W-stbbdbrwryWithDM' }));
  after(stub.stop);

  it('can create a subdataset as a child of the selected dataset', () => {
    const DATASET_A = DATASETS[0];
    const SUBDATASET_ID = 'd-stbdsubdst00';
    const SUBDATASET_NAME = forgeSubdatasetNameFromParentName(DATASET_A.name);
    const RUNNER_ID = 'r-stbdrunnr00';

    const expectedDatasetCreationPayload = {
      name: SUBDATASET_NAME,
      parentId: DATASET_A.id,
      ownerName: DATASET_A.ownerName,
      tags: DATASET_A.tags,
      description: DATASET_A.description,
      sourceType: 'ETL',
      security: { default: 'none', accessControlList: [{ id: 'dev.sample.webapp@example.com', role: 'admin' }] },
      source: { location: WORKSPACE.id, name: RUNNER_ID },
    };
    const validateDatasetCreationRequest = (req) => expect(req.body).to.deep.equal(expectedDatasetCreationPayload);

    const expectedRunnerCreationPayload = {
      name: SUBDATASET_NAME,
      tags: DATASET_A.tags,
      description: DATASET_A.description,
      datasetList: [DATASET_A.id],
      parametersValues: [],
      security: { default: 'none', accessControlList: [{ id: 'dev.sample.webapp@example.com', role: 'admin' }] },
      runTemplateId: 'no_filter',
    };
    const validateRunnerCreationRequest = (req) => expect(req.body).to.deep.equal(expectedRunnerCreationPayload);

    const expectedRunnerPatchPayload = { runTemplateId: 'no_filter', datasetList: [SUBDATASET_ID, DATASET_A.id] };
    const validateRunnerPatchRequest = (req) => expect(req.body).to.deep.equal(expectedRunnerPatchPayload);

    DatasetManager.switchToDatasetManagerView();
    DatasetManager.getDatasetsListItemButton(DATASET_A.id).should('be.visible');
    DatasetManager.selectDatasetById(DATASET_A.id);
    DatasetManager.getDatasetMetadataParent().should('not.exist');
    DatasetManager.getCreateSubdatasetButton().should('be.visible');
    DatasetManager.startSubdatasetCreation();

    // Check metadata inherited from parent dataset (name, tags, description)
    DatasetManager.getParentNameSubtitle().should('contain', DATASET_A.name);
    DatasetManager.getNewDatasetNameInput().should('value', SUBDATASET_NAME);
    DATASET_A.tags.forEach((tag, index) => DatasetManager.getNewDatasetTag(index).should('contain', tag));
    DatasetManager.getNewDatasetDescription().should('contain', DATASET_A.description);

    // Check subdatasources in wizard 2nt step
    DatasetManager.getDatasetCreationNextStep().click();
    DatasetManager.getNewDatasetSourceTypeSelect().click();
    DatasetManager.getNewDatasetSourceTypeOptions().should('have.length', CUSTOM_SUBDATASOURCES.length);
    DatasetManager.getNewDatasetSourceTypeOption('no_filter').should('be.visible').click();
    DatasetManager.confirmDatasetCreation({
      id: SUBDATASET_ID,
      isETL: true,
      validateRequest: validateDatasetCreationRequest,
      runnerCreationOptions: { id: RUNNER_ID, validateRequest: validateRunnerCreationRequest },
      runnerUpdateOptions: { validateRequest: validateRunnerPatchRequest },
    });

    // Check new dataset is automatically selected after creation, and that parent name is visible
    DatasetManager.getDatasetNameInOverview(10).should('have.text', SUBDATASET_NAME);
    DatasetManager.getDatasetMetadataParent().should('contain', DATASET_A.name);
  });
});
