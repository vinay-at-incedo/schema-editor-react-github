import d3 from "d3";
import { saveAs } from "file-saver";

function zoom() {
  // It is named as svgElement because we have attached the zoomListener to the svg element.
  let svgElement = this;
  d3.select(svgElement)
    .select(".tree-group")
    .attr(
      "transform",
      "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"
    );
}

function colorBasedOnOccurences(d) {
  if (d.occurences === "single") return "#4CAF50";
  else if (d.occurences === "multi") return "#2196F3";
  else if (d.occurences === "intermediate") return "#f0ad4e";
}

function toggleChildrenVisibility(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else if (d._children) {
    d.children = d._children;
    d._children = null;
  }
  return d;
}

function generateUUID() {
  // d stores the time
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

function calculateMaxLabelLength(treeData) {
  let maxLabelLength = 0;
  let totalNodes = 0;

  function visitAllNodesDFS(parent, visitNode, visitChildren) {
    if (!parent) return;
    visitNode(parent);
    let children = visitChildren(parent);
    if (children) {
      let count = children.length;
      for (let i = 0; i < count; i++) {
        visitAllNodesDFS(children[i], visitNode, visitChildren);
      }
    }
  }

  visitAllNodesDFS(
    treeData,
    function (d) {
      totalNodes++;
      maxLabelLength = Math.max(d.name.length, maxLabelLength);
    },
    function (d) {
      return d.children && d.children.length > 0 ? d.children : null;
    }
  );
  return [totalNodes, maxLabelLength];
}

function computeLevelWidth(level, d) {
  let levelWidth = [1];
  if (d.children && d.children.length > 0) {
    if (levelWidth.length <= level + 1) levelWidth.push(0);

    levelWidth[level + 1] += d.children.length;
    d.children.forEach(function (d) {
      computeLevelWidth(level + 1, d);
    });
  }
  return levelWidth;
}

const SchemaTreeInterface = {};

SchemaTreeInterface.treeNodeIdCount = 0;
SchemaTreeInterface.duration = 650;
SchemaTreeInterface.totalNodes = undefined;
SchemaTreeInterface.maxLabelLength = undefined;
SchemaTreeInterface.svgHeight = undefined;
SchemaTreeInterface.svgWidth = undefined;
SchemaTreeInterface.treeHeight = undefined;
SchemaTreeInterface.treeWidth = undefined;
SchemaTreeInterface.root = undefined;
SchemaTreeInterface.state = undefined;
SchemaTreeInterface.treeContainer = undefined;
SchemaTreeInterface.createNodeParentData = undefined;
SchemaTreeInterface.createdNodesInSession = [];

SchemaTreeInterface.tree = d3.layout.tree(); // size method takes two parameters: x and y

SchemaTreeInterface.sortTreeByName = function () {
  let sti = this;
  sti.tree.sort(function (a, b) {
    return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
  });
};

SchemaTreeInterface.zoomListener = d3.behavior
  .zoom()
  .scaleExtent([0.1, 3])
  .on("zoom", zoom);

SchemaTreeInterface.diagonal = d3.svg.diagonal().projection(function (d) {
  return [d.y, d.x];
});

SchemaTreeInterface.centerNode = function (source) {
  let sti = this;
  let scaleMultiplier = sti.zoomListener.scale();
  let x = -source.y0;
  let y = -source.x0;
  x = x * scaleMultiplier + sti.svgWidth / 2;
  y = y * scaleMultiplier + sti.svgHeight / 2;
  d3.select(sti.treeContainer)
    .select(".tree-group")
    .transition()
    .duration(sti.duration)
    .attr(
      "transform",
      "translate(" + x + "," + y + ")scale(" + scaleMultiplier + ")"
    );
  sti.zoomListener.scale(scaleMultiplier);
  sti.zoomListener.translate([x, y]);
};

SchemaTreeInterface.getSelectOptions = function () {
  let sti = this;
  let allNodeNames = [];

  // This function loops through all the nodes, and stores name of each node
  function getAllNodeNames(d) {
    if (d.children) d.children.forEach(getAllNodeNames);
    else if (d._children) d._children.forEach(getAllNodeNames);
    allNodeNames.push(d.name);
  }

  getAllNodeNames(sti.root);

  let optionsData = allNodeNames
    .sort(function (a, b) {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    })
    .filter(function (val, idx, arr) {
      // returns the array containing elements that satisfy the condition
      // we use this to keep unique items only
      return arr.indexOf(val) === idx;
    })
    .map(function (val, idx, arr) {
      return { value: val, label: val };
    });

  return optionsData;
};

SchemaTreeInterface.performSearch = function (searchText) {
  let sti = this;

  // Clear Current Styling Of Nodes
  sti.clearSearch();
  // Expand All Nodes To Make It Possible To Create A Path For Found Nodes
  sti.expandAll(sti.root);
  // Update Tree With New Root Structure
  sti.update(sti.root);

  // Perform Search And Create Path To Found Nodes
  function searchTreeByNodeName(d, searchText) {
    if (d.children)
      d.children.forEach(function (child) {
        searchTreeByNodeName(child, searchText);
      });
    else if (d._children)
      d._children.forEach(function (_child) {
        searchTreeByNodeName(_child, searchText);
      });

    let searchFieldValue = d.name;
    if (searchFieldValue && searchFieldValue === searchText) {
      // Walk parent chain to create visible path for the found node
      let parent = d;
      while (parent !== undefined) {
        parent.class = "found";
        parent = parent.parent;
      }
    }
  }
  searchTreeByNodeName(sti.root, searchText);

  // Collapse All The Nodes That Are Not Found In Search So As To Create A Clear Search View
  sti.collapseAllNotFound();
  // Update Tree With New Root Structure
  sti.update(sti.root);
  sti.centerNode(sti.root);
};

function createContextMenu(nodeData, contextMenuItems, treeContainer) {
  d3.event.preventDefault();

  d3.select("#context-menu").remove();

  d3.select("body").on("click", function () {
    d3.select("#context-menu").remove();
  });

  let contextMenuSelection = d3
    .select(treeContainer)
    .append("div")
    .attr("id", "context-menu")
    .attr("class", "visible")
    .style("left", `${d3.event.pageX + 10}px`)
    .style("top", `${d3.event.pageY - 5}px`);

  contextMenuSelection
    .append("ul")
    .attr("class", "list-group")
    .selectAll("li")
    .data(contextMenuItems)
    .enter()
    .append("li")
    .attr("class", "list-group-item item")
    .html(function (d) {
      return d.title;
    })
    .on("click", function (d, i) {
      d.action(nodeData);
      d3.select("#context-menu").remove();
    });
}

SchemaTreeInterface.clearSearchState = function () {
  let sti = this;
  sti.clearSearch();
  sti.createInitialStructure();
  sti.update(sti.root);
  sti.centerNode(sti.root);
};

SchemaTreeInterface.createInitialStructure = function () {
  let sti = this;
  function cis(d) {
    if (d.children) {
      d.children.forEach(cis);
      d._children = d.children;
      d.children = null;
    }
  }
  cis(sti.root);
};

SchemaTreeInterface.clearSearch = function (d) {
  let sti = this;
  function cs(d) {
    d.class = "";
    if (d.children) d.children.forEach(cs);
    else if (d._children) d._children.forEach(cs);
  }
  cs(sti.root);
};

SchemaTreeInterface.collapseAllNotFound = function (d) {
  let sti = this;
  function canf(d) {
    if (d.children) {
      if (d.class !== "found") {
        d._children = d.children;
        d._children.forEach(canf);
        d.children = null;
      } else d.children.forEach(canf);
    }
  }
  canf(sti.root);
};

SchemaTreeInterface.expandAll = function (d) {
  let sti = this;
  function ea(d) {
    if (d._children) {
      d.children = d._children;
      d.children.forEach(ea);
      d._children = null;
    } else if (d.children) d.children.forEach(ea);
  }
  ea(sti.root);
};

SchemaTreeInterface.createNode = function (createNodeData) {
  let sti = this;

  // children means its children is visible and _children means its children is hidden
  // If node is collapsed then make its children visible and _children null
  if (sti.createNodeParentData._children != null) {
    sti.createNodeParentData.children = sti.createNodeParentData._children;
    sti.createNodeParentData._children = null;
  }

  // Now Node Is In Expanded Mode And If Its children is null then we add an empty array of children
  if (sti.createNodeParentData.children == null) {
    sti.createNodeParentData.children = [];
  }

  let _Node = {};

  _Node.id = generateUUID();
  _Node.name = createNodeData.objectName;
  _Node.lineage = createNodeData.objectLineage;
  _Node.occurences = createNodeData.objectOccurences;
  _Node.metadata = createNodeData.objectMetadataObj;
  _Node.depth = sti.createNodeParentData.depth + 1;
  _Node.children = [];
  _Node._children = null;
  _Node.obj_class = `${_Node.lineage}.${_Node.name}`;
  _Node.used_counter = "0";
  _Node.config_fields = createNodeData.configFieldObjList;

  sti.createNodeParentData.children.push(_Node);
  sti.createdNodesInSession.push(_Node);
  sti.update(sti.createNodeParentData);
  sti.centerNode(sti.createNodeParentData);
  sti.createNodeParentData = undefined;
};

SchemaTreeInterface.generateSchema = function (obj) {
  let currSchema = `\nobj-name=${obj.name},\nobj-lineage=${obj.lineage},\nobj-occurences=${obj.occurences},\n`;
  let metadata = obj.metadata
    ? Object.keys(obj.metadata)
        .map((key) => `${key}=${obj.metadata[key]}`)
        .join(",\n")
    : ``;

  currSchema = currSchema + metadata;

  if (obj.config_fields.length !== 0) {
    currSchema += `\n\nconfig-fields:\n`;
  }

  for (let i = 0; i < obj.config_fields.length; i++) {
    let eachObj = obj.config_fields[i];
    let name = eachObj.field_name;
    let type = eachObj.field_type;
    let f1 = eachObj.flag1;
    let f2 = eachObj.flag2;
    let optionalFlags = eachObj.optional_flag.join("");
    let condition = eachObj.condition ? ` condition ${eachObj.condition};` : ``;
    let fieldMetaData = `${eachObj.field_metadata.join("; ")};`;
    let addNextLine = i < obj.config_fields.length - 1 ? `,\n` : ``;

    currSchema += `${name}=${type} <${f1}${f2}${optionalFlags}; ${fieldMetaData}${condition}>${addNextLine}`;
  }
  currSchema += `;\n`;
  return currSchema;
};

SchemaTreeInterface.downloadAddedNodesSchema = function () {
  let sti = this;
  let cnis = sti.createdNodesInSession;
  if (cnis.length <= 0) alert("No Object added");
  else {
    cnis.forEach(function (currNode) {
      let schema = sti.generateSchema(currNode);
      const blob = new Blob([schema], { type: "text/plain" });
      saveAs(blob, `${currNode.name}.txt`);
    });
  }
};

SchemaTreeInterface.resizeTree = function () {
  let sti = this;
  let boundingRectangle = sti.treeContainer.getBoundingClientRect();
  sti.svgHeight = boundingRectangle.height;
  sti.svgWidth = boundingRectangle.width;

  d3.select(sti.treeContainer)
    .select("svg")
    .attr("height", sti.svgHeight)
    .attr("width", sti.svgWidth);

  sti.update(sti.root);
  sti.centerNode(sti.root);
};

SchemaTreeInterface.updateTreeState = function (updatedState) {
  let sti = this;
  sti.state = updatedState;
  if (sti.state.inSearchingState) sti.performSearch(sti.state.searchText);
  else sti.update(sti.root);
};

SchemaTreeInterface.create = function (treeContainer, initialState) {
  let sti = this;

  sti.state = initialState;
  sti.treeContainer = treeContainer;

  sti.svgHeight = sti.state.height;
  sti.svgWidth = sti.state.width;
  sti.svgHeight = sti.state.height;
  sti.treeWidth = sti.state.width;

  sti.root = sti.state.data;
  sti.root.x0 = sti.svgHeight / 2;
  sti.root.y0 = 0;

  // Resize SVG According To Window Size
  window.addEventListener("resize", () => sti.resizeTree());

  let svg = d3
    .select(sti.treeContainer)
    .append("svg")
    .attr("class", "tree-svg overlay")
    .attr("width", sti.svgWidth)
    .attr("height", sti.svgHeight)
    .call(sti.zoomListener);

  // Append a group which holds all nodes and which the zoom Listener can act upon.
  let treeGroup = svg.append("g").attr("class", "tree-group");

  sti.createInitialStructure();
  sti.update(sti.root);
  sti.centerNode(sti.root);
};

SchemaTreeInterface.update = function (source) {
  let sti = this;

  [sti.totalNodes, sti.maxLabelLength] = calculateMaxLabelLength(sti.root);
  let allLevelWidth = computeLevelWidth(0, sti.root);
  sti.treeHeight = d3.max(allLevelWidth) * 60;
  sti.tree = sti.tree.size([sti.treeHeight, sti.svgWidth]);

  // Compute the new tree layout.
  let nodes = sti.tree.nodes(sti.root).reverse();
  let links = sti.tree.links(nodes);

  nodes.forEach(function (d) {
    d.y = d.depth * (sti.maxLabelLength * 20);
  });

  let treeGroup = d3.select(sti.treeContainer).select(".tree-group");

  // Update the nodes…
  let node = treeGroup.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++sti.treeNodeIdCount);
  });

  let nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", function click(d) {
      // Check If Any Dragging Event Is Going On Using d3.event.defaultPrevented
      if (d3.event.defaultPrevented) return;
      d = toggleChildrenVisibility(d);
      sti.update(d);
      sti.centerNode(d);
    });

  nodeEnter
    .append("circle")
    .attr("r", 0)
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

  nodeEnter
    .append("text")
    .attr("x", function (d) {
      return d.children || d._children ? -10 : 10;
    })
    .attr("dy", ".35em")
    .attr("class", "nodeText")
    .attr("text-anchor", function (d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function (d) {
      return d.name;
    })
    .style("fill-opacity", 0);

  nodeEnter
    .append("foreignObject")
    .attr("width", 50)
    .attr("x", -100)
    .attr("y", -26)
    .attr("height", 50)
    .append("xhtml:div")
    .append("xhtml:span")
    .attr("class", "blackColorSpan")
    .text(function (d) {
      return "Path = ";
    })
    .append("xhtml:span")
    .attr("class", "redColorSpan")
    .text(function (d) {
      return d.lineage + "." + d.name;
    })
    .append("xhtml:span")
    .attr("class", "blackColorSpan")
    .append("xhtml:span")
    .attr("class", "redColorSpan");

  // Add a context menu
  node.on("contextmenu", function (nodeData) {
    createContextMenu(nodeData, sti.state.contextMenuItems, sti.treeContainer);
  });

  // Transition nodes to their new position.
  let nodeUpdate = node
    .transition()
    .duration(sti.duration)
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  nodeUpdate
    .select("circle")
    .attr("r", 4.5)
    .style("fill", function (d) {
      if (d.class === "found") {
        return "#ff4136"; //red
      } else if (d._children) {
        if (sti.state.nodeColoredByOccurence) return colorBasedOnOccurences(d);
        else return "lightsteelblue";
      } else {
        if (sti.state.nodeColoredByOccurence) return colorBasedOnOccurences(d);
        else return "#fff";
      }
    })
    .style("stroke", function (d) {
      if (d.class === "found") {
        return "#ff4136"; //red
      }
    });

  nodeUpdate.select("text").style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  let nodeExit = node
    .exit()
    .transition()
    .duration(sti.duration)
    .attr("transform", function (d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("circle").attr("r", 0);

  nodeExit.select("text").style("fill-opacity", 0);

  // Update the links…
  let link = treeGroup.selectAll("path.link").data(links, function (d) {
    return d.target.id;
  });

  // Enter any new links at the parent's previous position.
  link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("d", function (d) {
      let point = {
        x: d.source.x0,
        y: d.source.y0,
      };
      return sti.diagonal({
        source: point,
        target: point,
      });
    });

  // Transition links to their new position.
  link
    .transition()
    .duration(sti.duration)
    .attr("d", sti.diagonal)
    .style("stroke", function (d) {
      if (d.target.class === "found") {
        return "#ff4136";
      } else if (sti.state.inSearchingState) {
        return "white";
      }
    });

  // Transition exiting nodes to the parent's new position.
  link
    .exit()
    .transition()
    .duration(sti.duration)
    .attr("d", function (d) {
      let point = {
        x: d.source.x,
        y: d.source.y,
      };
      return sti.diagonal({
        source: point,
        target: point,
      });
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
};

SchemaTreeInterface.destroy = function () {
  let sti = this;
  d3.select(sti.treeContainer).select("svg").remove();
};

export default SchemaTreeInterface;
