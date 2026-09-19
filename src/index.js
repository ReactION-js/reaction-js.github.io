import * as d3 from "d3";
import JSONFormatter from "json-formatter-js";
import allData from "./data.js";
import { filterRedux, filterRouter, filterDOM } from "./filters.js";

function updateState(state, props) {
  // console.log('props', props)
  const stateFormatter = new JSONFormatter(state, 1, {
    hoverPreviewEnabled: false,
    hoverPreviewArrayCount: 10,
    hoverPreviewFieldCount: 5,
    animateOpen: true,
    animateClose: true,
  });

  // props
  const propsFomatter = new JSONFormatter(props, 1, {
    hoverPreviewEnabled: false,
    hoverPreviewArrayCount: 100,
    hoverPreviewFieldCount: 5,
    theme: "dark",
    animateOpen: true,
    animateClose: true,
  });

  const stateNode = document.getElementById("state");
  const propsNode = document.getElementById("props");

  stateNode.innerHTML = "";
  propsNode.innerHTML = "";

  if (state == null || state == undefined) {
    stateNode.appendChild(document.createTextNode("None"));
  } else {
    stateNode.appendChild(stateFormatter.render());
  }

  if (props == null || props == undefined) {
    propsNode.appendChild(document.createTextNode("None"));
  } else {
    propsNode.appendChild(propsFomatter.render());
  }
}

function draw() {
  const hideDOM = document.querySelector("#dom-btn").checked;
  const hideRedux = document.querySelector("#redux-btn").checked;
  const hideRouter = document.querySelector("#router-btn").checked;

  let data = allData;
  if (hideRedux) data = filterRedux(data);
  if (hideDOM) data = filterDOM(data);
  if (hideRouter) data = filterRouter(data);
  drawChart(data);
}

// document.addEventListener('DOMContentLoaded', () => {
/**
 * Initially draw the chart
 *
 * @param {*} treeData
 */
function drawChart(treeData) {
  // declares a tree layout and assigns the size
  treemap = d3.tree().size([height - 500, width - 500]);

  // Assigns parent, children, height, depth
  root = d3.hierarchy(treeData, (d) => d.children);
  root.x0 = height - 500 / 2;
  root.y0 = 0;
  update(root);
}

function update(source) {
  // Creates a curved (diagonal) path from parent to the child nodes
  const diagonal = (s, d) => {
    const path =
      "M" +
      s.x +
      "," +
      s.y +
      "C" +
      s.x +
      "," +
      (s.y + d.y) / 2 +
      " " +
      d.x +
      "," +
      (s.y + d.y) / 2 +
      " " +
      d.x +
      "," +
      d.y;
    return path;
  };

  // Toggle children on click.
  const click = (event, d) => {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    // d3.selectAll("text").attr("class", "text");
    update(d);
  };

  // console.log('Updating Tree with current source...', source)
  // console.log('root: ', root)
  treemap = d3.tree().nodeSize([hSlider * 5, hSlider * 5]);

  // Assigns the x and y position for the nodes
  const treeData = treemap(root);

  // Compute the new tree layout.
  const nodes = treeData.descendants();
  const links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach((d) => {
    d.y = d.depth * vSlider * 10;
  }); // magic number is distance between each node

  // ****************** Nodes section ***************************

  // Update the nodes...
  const node = svg.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  });

  // Remove any exiting nodes
  const nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", (d) => "translate(" + source.x + "," + source.y + ")")
    .remove();

  // Enter any new modes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + source.x0 + "," + source.y0 + ")";
    })
    .on("click", click);

  // Add Circle for the nodes
  nodeEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", 5)
    .style("fill", (d) => (d._children ? "lightsteelblue" : "#fff"))
    .style("pointer-events", "visible")
    .on("mouseover", (event, d) => {
      updateState(d.data.state, d.data.props);
    });

  // Add labels for the nodes
  nodeEnter
    .append("text")
    .attr("dy", ".35em")
    .attr("y", (d) => (d.children || d._children ? -24 : 24))
    .attr("text-anchor", "middle")
    .text((d) => d.data.name);

  // UPDATE
  const nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");

  // Update the node attributes and style
  nodeUpdate
    .select("circle.node")
    .attr("r", 10)
    .style("fill", (d) => (d._children ? "lightsteelblue" : "#fff"))
    .attr("cursor", "pointer"); // On exit reduce the node circles size to 0

  nodeExit.select("circle").attr("r", 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select("text").style("fill-opacity", 1e-6);

  // ****************** links section ***************************

  // Update the links...
  const link = svg.selectAll("path.link").data(links, (d) => d.id);

  // Enter any new links at the parent's previous position.
  const linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("d", function (d) {
      const o = { x: source.x0, y: source.y0 };
      return diagonal(o, o);
    });

  // UPDATE
  const linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(100)
    .attr("d", (d) => diagonal(d, d.parent));

  // Remove any exiting links
  const linkExit = link
    .exit()
    .transition()
    .duration(200)
    .attr("d", (d) => {
      const o = { x: source.x, y: source.y };
      return diagonal(o, o);
    })
    .remove();

  // Store the old positions for transition.
  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function zoomed(event) {
  svg.attr("transform", event.transform);
}

// **************
// **** MAIN ****
//***************
let i = 0;
const duration = 500;
let root;
let treemap;

let hSlider = 10;
let vSlider = 10;

const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 1000 - margin.right - margin.left;
const height = 960 - margin.top - margin.bottom;

let svg;

// The interactive tree only mounts when its container is present on the page.
const treeMount = document.querySelector(".tree");
if (treeMount) {
  d3.select("#vSlider").on("input", () => {
    vSlider = document.querySelector("#vSlider").value;
    update(root);
  });

  d3.select("#hSlider").on("input", () => {
    hSlider = document.querySelector("#hSlider").value;
    update(root);
  });

  document.querySelector("#router-btn")?.addEventListener("click", draw);
  document.querySelector("#redux-btn")?.addEventListener("click", draw);
  document.querySelector("#dom-btn")?.addEventListener("click", draw);

  const zoom = d3.zoom().scaleExtent([0.05, 2]).on("zoom", zoomed);

  svg = d3
    .select(".tree")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "500")
    .attr("viewBox", "0 0 " + Math.min(width, 500) + " " + Math.min(width, 500))
    .attr("preserveAspectRatio", "xMinYMin")
    .call(zoom)
    .append("g")
    .attr(
      "transform",
      "translate(" +
        Math.min(width, height) / 2 +
        "," +
        Math.min(width, height) / 2 +
        ")",
    );

  d3.select("svg")
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 12).scale(1),
    );

  draw(allData);
}
