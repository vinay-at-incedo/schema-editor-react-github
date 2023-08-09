import React from "react";
import { Container, Row, Col, Button, Progress } from "reactstrap";
import Select from "react-select";
import SchemaTreeInterface from "./SchemaTree/SchemaTreeInterface";

const Header = ({
  nodeColoredByOccurence,
  setNodeColoredByOccurence,
  selectedOption,
  setSelectedOption,
  options,
  resetSearch,
}) => {
  const showJSONTree = () => {
    const stringifyCircularJSON = (obj) => {
      const seen = new WeakSet();
      return JSON.stringify(
        obj,
        (k, v) => {
          if (v !== null && typeof v === "object") {
            if (seen.has(v)) return;
            seen.add(v);
          }
          return v;
        },
        2
      );
    };
    const blob = new Blob([stringifyCircularJSON(SchemaTreeInterface.root)], {
      type: "text/plain",
    });
    let url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadSchema = () => {
    SchemaTreeInterface.downloadAddedNodesSchema();
  };

  return (
    <Container fluid className="mt-3">
      <Row className="align-items-center justify-content-center">
        <Col xs={12} md={9}>
          <Row className="g-0 p-1">
            <Col xs={12} md={4}>
              <Button
                onClick={() => showJSONTree()}
                block
                className="bg-info p-2 rounded-0 border-0 "
              >
                See JSON Tree File
              </Button>
            </Col>
            <Col xs={12} md={4}>
              <Button
                onClick={() =>
                  setNodeColoredByOccurence(!nodeColoredByOccurence)
                }
                block
                className="bg-warning p-2 rounded-0 border-0"
              >
                {nodeColoredByOccurence ? "Uncolor" : "Color"}
              </Button>
            </Col>
            <Col xs={12} md={4}>
              <Button
                onClick={() => downloadSchema()}
                block
                className="bg-info p-2 rounded-0 border-0"
              >
                Download Added Schema
              </Button>
            </Col>
          </Row>
          <Row className="g-0 p-1 align-items-center input-group">
            <Col xs={12} lg={2} className="input-group-prepend">
              <div className="input-group-text rounded-0">Search Node</div>
            </Col>
            <Col xs={12} lg={7}>
              <Select
                value={selectedOption}
                className="z-3"
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderRadius: 0,
                  }),
                }}
                onChange={(option) => setSelectedOption(option)}
                options={options}
              />
            </Col>
            <Col xs={12} lg={3}>
              <Button
                block
                color="info"
                className="text-white rounded-0"
                onClick={resetSearch}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Col>
        {/* Legend */}
        <Col xs={12} md={3} className="mt-2 mt-md-0">
          <Container fluid className="color-container">
            <Row className="p-1 align-items-center">
              <Col xs={12} md={6}>
                Single
              </Col>
              <Col xs={12} md={6}>
                <Progress className="rounded-0" color="success" value={100} />
              </Col>
            </Row>
            <Row className="p-1 align-items-center">
              <Col xs={12} md={6}>
                Intermediate
              </Col>
              <Col xs={12} md={6}>
                <Progress className="rounded-0" color="warning" value={100} />
              </Col>
            </Row>
            <Row className="p-1 align-items-center">
              <Col xs={12} md={6}>
                Multi
              </Col>
              <Col xs={12} md={6}>
                <Progress className="rounded-0" color="primary" value={100} />
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
