import d3 from "d3";

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

const ConfigFieldTreeInterface = {};

ConfigFieldTreeInterface.treeNodeIdCount = 0;
ConfigFieldTreeInterface.duration = 750;
ConfigFieldTreeInterface.totalNodes = undefined;
ConfigFieldTreeInterface.maxLabelLength = undefined;
ConfigFieldTreeInterface.svgHeight = undefined;
ConfigFieldTreeInterface.svgWidth = undefined;
ConfigFieldTreeInterface.treeHeight = undefined;
ConfigFieldTreeInterface.treeWidth = undefined;
ConfigFieldTreeInterface.root = undefined;
ConfigFieldTreeInterface.state = undefined;
ConfigFieldTreeInterface.treeContainer = undefined;

ConfigFieldTreeInterface.tree = d3.layout.tree(); // size method takes two parameters: x and y

ConfigFieldTreeInterface.sortTreeByName = function () {
  let cfti = this;
  cfti.tree.sort(function (a, b) {
    return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
  });
};

ConfigFieldTreeInterface.zoomListener = d3.behavior
  .zoom()
  .scaleExtent([0.1, 3])
  .on("zoom", zoom);

ConfigFieldTreeInterface.diagonal = d3.svg.diagonal().projection(function (d) {
  return [d.y, d.x];
});

ConfigFieldTreeInterface.centerNode = function (source) {
  let cfti = this;
  let scaleMultiplier = cfti.zoomListener.scale();
  let x = -source.y0;
  let y = -source.x0;
  x = x * scaleMultiplier + cfti.svgWidth / 2;
  y = y * scaleMultiplier + cfti.svgHeight / 2;
  d3.select(cfti.treeContainer)
    .select(".tree-group")
    .transition()
    .duration(cfti.duration)
    .attr(
      "transform",
      "translate(" + x + "," + y + ")scale(" + scaleMultiplier + ")"
    );
  cfti.zoomListener.scale(scaleMultiplier);
  cfti.zoomListener.translate([x, y]);
};

function createContextMenu(data, contextMenuItems, treeContainer) {
  d3.event.preventDefault();

  d3.select("#context-menu").remove();

  d3.select(ConfigFieldTreeInterface.treeContainer).on("click", function () {
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
      d.action(data);
      d3.select("#context-menu").remove();
    });
}

// Perform Search And Create Path To Found Nodes
function getTreeNodeByName(d, nodeName) {
  if (d.name && d.name === nodeName) {
    return d;
  }
  if (d.children) {
    for (let i = 0; i < d.children.length; i++) {
      let foundNode = getTreeNodeByName(d.children[i], nodeName);
      if (foundNode) return foundNode;
    }
  }
  return null;
}

ConfigFieldTreeInterface.addCondition = function (fromField, toField) {
  let cfti = this;
  let fromFieldNode = getTreeNodeByName(cfti.root, fromField);
  let toFieldNode = getTreeNodeByName(cfti.root, toField);
  if (fromFieldNode === null || toFieldNode === null) return;

  // Check For Circular Conditions By Walking The Parent Chain
  let parent = fromFieldNode.parent;
  while (parent) {
    if (parent.name === toFieldNode.name) {
      alert("Cannot Add Circular Condition");
      return;
    }
    parent = parent.parent;
  }

  // Remove toFieldNode from the Children Array Of toFieldParentNode
  let toFieldNodeParent = toFieldNode.parent;
  toFieldNodeParent.children = toFieldNodeParent.children.filter(
    (childNode) => childNode.name !== toFieldNode.name
  );

  // If There Are No Children Then Create An Empty Children To Add toFieldNode
  fromFieldNode.children = fromFieldNode.children ? fromFieldNode.children : [];

  // Set fromFieldNode As A Parent Of toFieldNode
  toFieldNode.parent = fromFieldNode;
  // Set The New Depth Of The toFieldNode
  toFieldNode.depth = fromFieldNode.depth + 1;
  // Push toFieldNode To The Children Array Of fromFieldNode
  fromFieldNode.children.push(toFieldNode);

  cfti.update(cfti.root);
  cfti.centerNode(toFieldNode);
};

ConfigFieldTreeInterface.removeCondition = function (linkData) {
  let cfti = this;

  let fromFieldNode = linkData.source;
  let toFieldNode = linkData.target;
  if (fromFieldNode === null || toFieldNode === null) return;

  // Remove toFieldNode from the Children Array Of toFieldParentNode
  let toFieldNodeParent = toFieldNode.parent;
  toFieldNodeParent.children = toFieldNodeParent.children.filter(
    (childNode) => childNode.name !== toFieldNode.name
  );

  // Set root As A Parent Of toFieldNode
  toFieldNode.parent = cfti.root;

  // Set The New Depth Of The toFieldNode
  toFieldNode.depth = cfti.root.depth + 1;

  // Push toFieldNode To The Children Array Of root
  cfti.root.children.push(toFieldNode);

  cfti.update(cfti.root);
  cfti.centerNode(toFieldNode);
};

ConfigFieldTreeInterface.deleteNode = function (toDeleteNode) {
  let cfti = this;
  let toDeleteNodeParent = toDeleteNode.parent;

  // Remove This Node From The Children Array Of Parent Node
  toDeleteNodeParent.children = toDeleteNodeParent.children.filter(
    (childNode) => childNode.name !== toDeleteNode.name
  );

  if (toDeleteNode.children) {
    // Make root Node The Parent Node Of The Children Nodes Of The Node To Be Deleted 
    if (cfti.root.children) {
      toDeleteNode.children.forEach((child, idx, childArr) => {
        cfti.root.children.push(child);
      })
    } else {
      cfti.root.children = [...toDeleteNode.children];
    }
  }

  toDeleteNode = null;
  cfti.update(cfti.root);
};

ConfigFieldTreeInterface.getAllConditions = function () {
  let cfti = this;
  let nodes = cfti.tree.nodes(cfti.root);
  let links = cfti.tree.links(nodes);

  let allConditions = {};

  links
    .filter((link) => link.source.name !== "hidden-root")
    .forEach((link) => {
      allConditions[link.target.name] = link.source.name;
    });

  return allConditions;
};

ConfigFieldTreeInterface.resizeTree = function () {
  let cfti = this;
  let boundingRectangle = cfti.treeContainer.getBoundingClientRect();
  cfti.svgHeight = boundingRectangle.height;
  cfti.svgWidth = boundingRectangle.width;

  d3.select(cfti.treeContainer)
    .select("svg")
    .attr("height", cfti.svgHeight)
    .attr("width", cfti.svgWidth);

  cfti.update(cfti.root);
  cfti.centerNode(cfti.root);
};

ConfigFieldTreeInterface.updateTreeState = function (updatedState) {
  let cfti = this;
  cfti.state = updatedState;
  cfti.update(cfti.root);
};

ConfigFieldTreeInterface.create = function (treeContainer, initialState) {
  let cfti = this;

  cfti.state = initialState;
  cfti.treeContainer = treeContainer;

  cfti.svgHeight = cfti.state.height;
  cfti.svgWidth = cfti.state.width;
  cfti.svgHeight = cfti.state.height;
  cfti.treeWidth = cfti.state.width;

  // If Tree Has Some Data Then Update That Data Else Set To Intital State Data
  cfti.root = cfti.root || cfti.state.data;

  cfti.root.x0 = cfti.svgHeight / 2;
  cfti.root.y0 = 0;

  // Resize SVG According To Window Size
  window.addEventListener("resize", () => cfti.resizeTree());

  let svg = d3
    .select(cfti.treeContainer)
    .append("svg")
    .attr("class", "tree-svg overlay")
    .attr("width", cfti.svgWidth)
    .attr("height", cfti.svgHeight)
    .call(cfti.zoomListener);

  // Append a group which holds all nodes and which the zoom Listener can act upon.
  let treeGroup = svg.append("g").attr("class", "tree-group");

  cfti.update(cfti.root);
  cfti.centerNode(
    cfti.root.children
      ? cfti.root.children[Math.floor(cfti.root.children.length / 2)]
      : cfti.root
  );
};

ConfigFieldTreeInterface.update = function (source) {
  let cfti = this;

  [cfti.totalNodes, cfti.maxLabelLength] = calculateMaxLabelLength(cfti.root);
  let allLevelWidth = computeLevelWidth(0, cfti.root);
  cfti.treeHeight = d3.max(allLevelWidth) * 60;
  cfti.tree = cfti.tree.size([cfti.treeHeight, cfti.svgWidth]);

  // Compute the new tree layout.
  let nodes = cfti.tree.nodes(cfti.root).reverse();
  let links = cfti.tree.links(nodes);

  nodes.forEach(function (d) {
    d.y = d.depth * (cfti.maxLabelLength * 20);
  });

  let treeGroup = d3.select(cfti.treeContainer).select(".tree-group");

  // Update the nodes…
  let node = treeGroup.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++cfti.treeNodeIdCount);
  });

  let nodeEnter = node
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", function click(d) {
      // Check If Any Dragging Event Is Going On Using d3.event.defaultPrevented
      if (d3.event.defaultPrevented) return;
      cfti.centerNode(d);
    });
  nodeEnter.append("circle").attr("r", 0);

  nodeEnter
    .append("text")
    .attr("x", function (d) {
      return d.children && d.children.length > 0 ? -10 : 10;
    })
    .attr("y", "15")
    .attr("dy", ".35em")
    .attr("class", "nodeText")
    .attr("text-anchor", function (d) {
      return d.children && d.children.length ? "end" : "start";
    })
    .text(function (d) {
      return d.name;
    })
    .style("fill-opacity", 0);

  // Add a context menu
  node.on("contextmenu", function (nodeData) {
    createContextMenu(
      nodeData,
      cfti.state.contextMenuItems,
      cfti.treeContainer
    );
  });

  // Transition nodes to their new position.
  // Hide Hidden Root Source
  let nodeUpdate = node
    .attr("class", function (d) {
      return `node ${d.name === "hidden-root" ? "d-none" : ""}`;
    })
    .transition()
    .duration(cfti.duration)
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  nodeUpdate.select("circle").attr("r", 4.5);

  nodeUpdate
    .select("text")
    .style("fill-opacity", 1)
    .attr("x", function (d) {
      return d.children && d.children.length > 0 ? -10 : 10;
    })
    .attr("y", "15")
    .attr("dy", ".35em")
    .attr("class", "nodeText")
    .attr("text-anchor", function (d) {
      return d.children && d.children.length ? "end" : "start";
    });

  // Transition exiting nodes to the parent's new position.
  let nodeExit = node
    .exit()
    .transition()
    .duration(cfti.duration)
    .attr("transform", function (d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("circle").attr("r", 0);

  nodeExit.select("text").style("fill-opacity", 0);

  // Create Arrow Heads For Links
  let arrowsMarkers = treeGroup
    .append("svg")
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("refX", 7)
    .attr("refY", 3)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr(
      "d",
      d3.svg.line()([
        [0, 0],
        [0, 6],
        [6, 3],
      ])
    )
    .attr("stroke", "black");

  // Update the links…
  let link = treeGroup.selectAll("path.link").data(links, function (d) {
    return d.target.id;
  });

  // Enter any new links at the parent's previous position.
  link
    .enter()
    .insert("path", "g")
    .attr("d", function (d) {
      let point = {
        x: d.source.x0,
        y: d.source.y0,
      };
      return cfti.diagonal({
        source: point,
        target: point,
      });
    })
    .attr("marker-end", "url(#arrow)")
    .style("stroke-width", 3)
    .style("stroke", "black")
    .on("contextmenu", function (linkData) {
      createContextMenu(
        linkData,
        [
          {
            title: "Delete Condition",
            action: (linkData) => {
              ConfigFieldTreeInterface.removeCondition(linkData);
            },
          },
        ],
        cfti.treeContainer
      );
    });

  // Transition links to their new position.
  // Hide Links From Hidden Root Source
  link
    .attr("class", function (d) {
      return `link ${d.source.name === "hidden-root" ? "d-none" : ""}`;
    })
    .transition()
    .duration(cfti.duration)
    .attr("d", cfti.diagonal);

  // Transition exiting nodes to the parent's new position.
  link
    .exit()
    .transition()
    .duration(cfti.duration)
    .attr("d", function (d) {
      let point = {
        x: d.source.x,
        y: d.source.y,
      };
      return cfti.diagonal({
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

ConfigFieldTreeInterface.destroy = function () {
  let cfti = this;
  d3.select(cfti.treeContainer).select("svg").remove();
};

export default ConfigFieldTreeInterface;
