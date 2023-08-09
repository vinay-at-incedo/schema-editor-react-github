import React, { useState } from "react";
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
import OBJECT_METADATA_OPTIONS from "../../data/obj_metadata.json";

const AddObjectMetadataModal = ({
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
  removeObjectMetadata,
}) => {
  const [objectMetadataState, setObjectMetadataState] = useState({
    objectMetadataKey: OBJECT_METADATA_OPTIONS[0].name,
    objectMetadataValue: "",
  });

  let objectMetadataRequired = OBJECT_METADATA_OPTIONS.find(
    (metadata) => metadata.name === objectMetadataState.objectMetadataKey
  )?.required;

  const handleChange = (e) => {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;

    setObjectMetadataState({ ...objectMetadataState, [fieldName]: fieldValue });
  };

  const addObjectMetadataToObj = () => {
    setFormState({
      ...formState,
      objectMetadataObj: {
        ...formState.objectMetadataObj,
        [objectMetadataState.objectMetadataKey]:
          objectMetadataState.objectMetadataValue,
      },
    });
    setObjectMetadataState({
      objectMetadataKey: OBJECT_METADATA_OPTIONS[0].name,
      objectMetadataValue: "",
    });
  };

  const handleCancel = () => {
    setObjectMetadataState({
      objectMetadataKey: OBJECT_METADATA_OPTIONS[0].name,
      objectMetadataValue: "",
    });
    prevStep();
  };

  const validateObjectMetadata = () => {
    let errorMsg = "";

    if (objectMetadataState.objectMetadataKey === "") {
      errorMsg = "Object Metadata Key Is Required";
    } else if (
      objectMetadataRequired &&
      objectMetadataState.objectMetadataValue === ""
    ) {
      errorMsg = "Object  Metadata Value Is Required";
    }

    if (errorMsg === "") return true;
    else {
      alert(errorMsg);
      return false;
    }
  };

  const handleAdd = () => {
    if (validateObjectMetadata()) addObjectMetadataToObj();
  };

  const handleContinue = () => {
    nextStep();
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
      <ModalHeader>Add Object Metadata</ModalHeader>
      <ModalBody className="p-5">
        <FormGroup>
          <Label htmlFor="objectMetadataKey">Object Metadata Key :</Label>
          <Input
            type="select"
            name="objectMetadataKey"
            id="ObjectMetadataKey"
            value={objectMetadataState.objectMetadataKey}
            onChange={handleChange}
            required
          >
            {OBJECT_METADATA_OPTIONS.map((objectMetadata, idx) => {
              return (
                <option key={idx} value={objectMetadata.name}>
                  {objectMetadata.name}
                </option>
              );
            })}
          </Input>
        </FormGroup>
        {objectMetadataRequired && (
          <FormGroup>
            <Label htmlFor="objectMetadataValue">Object Metadata Value :</Label>
            <Input
              type="text"
              id="objectMetadataValue"
              name="objectMetadataValue"
              placeholder="Object Metadata Value"
              value={objectMetadataState.objectMetadataValue}
              onChange={handleChange}
              required
            />
          </FormGroup>
        )}
        <Row className="justify-content-end">
          <Col xs={12} lg={4}>
            <Button
              block
              color="info"
              className="text-white"
              onClick={handleAdd}
            >
              Add
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
        <Row className="w-100 gy-2 justify-content-between">
          <Col xs={12} lg={4}>
            <Button block color="danger" onClick={handleCancel}>
              Cancel
            </Button>
          </Col>
          <Col xs={12} lg={4}>
            <Button block color="success" onClick={handleContinue}>
              Continue
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>
  );
};

export default AddObjectMetadataModal;
