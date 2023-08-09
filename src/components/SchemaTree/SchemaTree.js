import React, { useEffect, useRef, useState } from "react";
import SchemaTreeInterface from "./SchemaTreeInterface";
import { Col, Container, Row } from "reactstrap";
import CreateNodeMultistepModal from "../Modals/CreateNodeMultistepModal";
import ShowMetadataModal from "../Modals/ShowMetadataModal";
import SCHEMA_TREE_DATA from "../../data/schema.json";

const SchemaTree = ({ nodeColoredByOccurence, selectedOption, setOptions }) => {
  const treeContainerRef = useRef();


  // Create Node Modal States
  const [isCreateNodeModalOpen, setIsCreateNodeModalOpen] = useState(false);
  const [createNodeFormState, setCreateNodeFormState] = useState({
    objectName: "",
    objectLineage: "",
    objectOccurences: "",
    objectMetadataObj: [],
    configFieldObjList: [],
  });

  // Show Metadata Modal States
  const [isShowMetadataModalOpen, setIsShowMetadataModalOpen] = useState(false);
  const [nodeMetadata, setNodeMetadata] = useState(null);

  const contextMenuItems = [
    {
      title: "Create child node",
      action: (nodeData) => {
        SchemaTreeInterface.createNodeParentData = nodeData;
        let _createNodeFormState = { ...createNodeFormState };
        _createNodeFormState.objectName = "";
        _createNodeFormState.objectLineage =
          nodeData.lineage === "none"
            ? "cmroot"
            : `${nodeData.lineage}.${nodeData.name}`;
        _createNodeFormState.objectOccurences = "Single";
        _createNodeFormState.configFieldObjList = [];

        setCreateNodeFormState(_createNodeFormState);
        setIsCreateNodeModalOpen(true);
      },
    },
    {
      title: "Show Metadata",
      action: (nodeData) => {
        let _nodeMetaData = {};
        _nodeMetaData.name = nodeData.name;
        _nodeMetaData.lineage = nodeData.lineage;
        _nodeMetaData.occurences = nodeData.occurences;

        if (nodeData.children)
          _nodeMetaData.noOfChildren = nodeData.children.length;
        else if (nodeData._children)
          _nodeMetaData.noOfChildren = nodeData._children.length;
        else _nodeMetaData.noOfChildren = 0;

        if (nodeData.metadata) _nodeMetaData.metadata = nodeData.metadata;

        setNodeMetadata(_nodeMetaData);
        setIsShowMetadataModalOpen(true);
      },
    },
  ];


  const handleCreateNodeModalFormSubmit = () => {
    SchemaTreeInterface.createNode(createNodeFormState);
    setOptions(SchemaTreeInterface.getSelectOptions());
    setCreateNodeFormState({
      objectName: "",
      objectLineage: "",
      objectOccurences: "",
      objectMetadataObj: [],
      configFieldObjList: [],
    });

    setIsCreateNodeModalOpen(false);
  };

  const getTreeState = () => {
    let treeContainer = treeContainerRef.current;
    let { height, width } = treeContainer.getBoundingClientRect();

    // Sets Tree To Be In Searching State If Set True
    let inSearchingState = selectedOption;
    let searchText = selectedOption?.value;

    return {
      height,
      width,
      nodeColoredByOccurence,
      inSearchingState,
      searchText,
      contextMenuItems,
    };
  };

  // Tree Related Use Effect And Logic
  useEffect(() => {
    let treeContainer = treeContainerRef.current;
    SchemaTreeInterface.create(treeContainer, {
      ...getTreeState(),
      data: { ...SCHEMA_TREE_DATA },
    });
    setOptions(SchemaTreeInterface.getSelectOptions());

    return () => SchemaTreeInterface.destroy();
  }, []);

  useEffect(() => {
    SchemaTreeInterface.updateTreeState(getTreeState());
  }, [nodeColoredByOccurence, selectedOption]);

  return (
    <Container fluid className="mt-3">
      <CreateNodeMultistepModal
        isOpen={isCreateNodeModalOpen}
        setIsOpen={setIsCreateNodeModalOpen}
        formState={createNodeFormState}
        setFormState={setCreateNodeFormState}
        handleSubmit={handleCreateNodeModalFormSubmit}
      />
      <ShowMetadataModal
        isOpen={isShowMetadataModalOpen}
        setIsOpen={setIsShowMetadataModalOpen}
        nodeMetadata={nodeMetadata}
      />
      <Row>
        <Col xs={12}>
          {/* Tree Container */}
          <div
            style={{ height: "75vh", width: "100%" }}
            ref={treeContainerRef}
          ></div>
        </Col>
      </Row>
    </Container>
  );
};

export default SchemaTree;
