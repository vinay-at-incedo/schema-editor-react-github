import React from "react";
import {
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import ConfigFieldTreeInterface from "../ConfigFieldTree/ConfigFieldTreeInterface";

const OBJECT_OCCURENCES_OPTIONS = ["Single", "Multi", "Intermediate"];

const NodeDetailsModal = ({
  isOpen,
  setIsOpen,
  step,
  setStep,
  formState,
  setFormState,
  handleFinalSubmit,
  configFieldObjState,
  setConfigFieldObjState,
  nextStep,
  prevStep,
  removeFieldMetadata,
  removeObjectMetadata
}) => {
  const validateNodeDetails = () => {
    let errorMsg = "";

    if (formState.objectName === "") {
      errorMsg = "Object Name Is Required";
    } else if (formState.objectLineage === "") {
      errorMsg = "Object Lineage Is Required";
    } else if (formState.objectOccurences === "") {
      errorMsg = "Object Occurences Is Required";
    }

    if (errorMsg === "") return true;
    else {
      alert(errorMsg);
      return false;
    }
  };

  const handleNext = () => {
    if (validateNodeDetails()) nextStep();
  };

  const handleChange = (e) => {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;
    setFormState({ ...formState, [fieldName]: fieldValue });
  };

  const handleCancel = () => {
    setFormState({
      objectName: "",
      objectLineage: "",
      objectOccurences: "",
      objectMetadataObj: [],
      configFieldObjList: [],
    });

    ConfigFieldTreeInterface.root = {
      name: "hidden-root",
      parent: null,
      children: [],
    };
    setIsOpen(false);
  };

  return (
    <Modal
      centered
      size="lg"
      isOpen={isOpen}
      toggle={() => setIsOpen(!isOpen)}
      backdrop="static"
      keyboard={false}
    >
      <ModalHeader>Node Details</ModalHeader>
      <ModalBody className="p-5">
        <FormGroup>
          <Label>Object Name</Label>
          <Input
            type="text"
            id="objectName"
            name="objectName"
            placeholder="Node Name"
            value={formState.objectName}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Object Lineage</Label>
          <Input
            type="text"
            id="objectLineage"
            name="objectLineage"
            placeholder="Object Lineage"
            value={formState.objectLineage}
            onChange={handleChange}
            disabled
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Object Occurences</Label>
          <Input
            type="select"
            id="objectOccurences"
            name="objectOccurences"
            placeholder="Object Occurences"
            value={formState.objectOccurences}
            onChange={handleChange}
            required
          >
            {OBJECT_OCCURENCES_OPTIONS.map((optionType, idx) => (
              <option key={idx} value={optionType}>
                {optionType}
              </option>
            ))}
          </Input>
        </FormGroup>
        <Row className="justify-content-end">
          <Col xs={12} lg={4}>
            <Button
              block
              color="info"
              className="text-white"
              onClick={prevStep}
            >
              Add Object Metadata
            </Button>
          </Col>
        </Row>
        {Object.keys(formState.objectMetadataObj).length > 0 && (
          <Row className="mt-3">
            <Col xs={12} className="my-2">
              Object Metadata
            </Col>
            {Object.keys(formState.objectMetadataObj).map(
              (metaDataKey, idx) => (
                <Col key={idx} xs={6} lg={4}>
                  <div className="bg-info text-white p-2 rounded-3 d-flex justify-content-between">
                    <span>{metaDataKey}</span>
                    <button
                      className="btn text-white py-0"
                      onClick={() => removeObjectMetadata(metaDataKey)}
                    >
                      X
                    </button>
                  </div>
                </Col>
              )
            )}
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Row className="w-100 gy-2 gx-0 justify-content-between">
          <Col xs={12} lg={4}>
            <Button block color="danger" onClick={handleCancel}>
              Cancel
            </Button>
          </Col>
          <Col xs={12} lg={4}>
            <Button block color="success" onClick={handleNext}>
              Next
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>
  );
};

export default NodeDetailsModal;
