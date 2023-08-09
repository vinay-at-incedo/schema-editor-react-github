import React, { useEffect, useRef } from "react";
import ConfigFieldTreeInterface from "./ConfigFieldTreeInterface";

const CONFIG_FIELD_TREE_DATA = {
  name: "hidden-root",
  parent: null,
  children: [],
};

const ConfigFieldTree = ({ removeConfigField }) => {
  const treeContainerRef = useRef();

  const contextMenuItems = [
    {
      title: "Delete Node",
      action: (nodeData) => {
        removeConfigField(nodeData.name);
        ConfigFieldTreeInterface.deleteNode(nodeData);
      },
    },
  ];

  const getTreeState = () => {
    let treeContainer = treeContainerRef.current;
    let { height, width } = treeContainer.getBoundingClientRect();

    return {
      height,
      width,
      contextMenuItems,
    };
  };

  // Tree Related Use Effect And Logic
  useEffect(() => {
    let treeContainer = treeContainerRef.current;
    ConfigFieldTreeInterface.create(treeContainer, {
      ...getTreeState(),
      data: { ...CONFIG_FIELD_TREE_DATA },
    });

    return () => {
      ConfigFieldTreeInterface.destroy();
    };
  }, []);

  return (
    <div
      style={{ height: "50vh", width: "100%", marginTop: "20px" }}
      ref={treeContainerRef}
    ></div>
  );
};

export default ConfigFieldTree;
