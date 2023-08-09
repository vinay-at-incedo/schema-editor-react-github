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
import CONFIG_FIELD_METADATA_OPTIONS from "../../data/field_metadata.json";

const AddFieldMetadataModal = ({
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
  const [fieldMetadataState, setFieldMetadataState] = useState({
    fieldMetadataKey: CONFIG_FIELD_METADATA_OPTIONS[0],
    fieldMetadataValue: "",
  });

  const handleChange = (e) => {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;
    setFieldMetadataState({ ...fieldMetadataState, [fieldName]: fieldValue });
  };

  const addFieldMetadataToObj = () => {
    setConfigFieldObjState({
      ...configFieldObjState,
      fieldMetadataObj: {
        ...configFieldObjState.fieldMetadataObj,
        [fieldMetadataState.fieldMetadataKey]:
          fieldMetadataState.fieldMetadataValue,
      },
    });
    setFieldMetadataState({
      fieldMetadataKey: CONFIG_FIELD_METADATA_OPTIONS[0],
      fieldMetadataValue: "",
    });
  };

  const handleCancel = () => {
    setFieldMetadataState({
      fieldMetadataKey: "",
      fieldMetadataValue: "",
    });
    prevStep();
  };

  const validateFieldMetadata = () => {
    let errorMsg = "";

    if (fieldMetadataState.fieldMetadataKey === "") {
      errorMsg = "Field Metadata Key Is Required";
    } else if (fieldMetadataState.fieldMetadataValue === "") {
      errorMsg = "Field  Metadata Value Is Required";
    }

    if (errorMsg === "") return true;
    else {
      alert(errorMsg);
      return false;
    }
  };

  const handleAdd = () => {
    if (validateFieldMetadata()) addFieldMetadataToObj();
  };

  const handleContinue = () => {
    prevStep();
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
      <ModalHeader>Add Field Metadata</ModalHeader>
      <ModalBody className="p-5">
        <FormGroup>
          <Label htmlFor="fieldMetadataKey">Field Metadata Key :</Label>
          <Input
            type="select"
            name="fieldMetadataKey"
            id="fieldMetadataKey"
            value={fieldMetadataState.fieldMetadataKey}
            onChange={handleChange}
            required
          >
            {CONFIG_FIELD_METADATA_OPTIONS.map((configFieldMetaData, idx) => (
              <option key={idx} value={configFieldMetaData}>
                {configFieldMetaData}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="fieldMetadataValue">Field Metadata Value :</Label>
          <Input
            type="text"
            id="fieldMetadataValue"
            name="fieldMetadataValue"
            placeholder="Field Metadata Value"
            value={fieldMetadataState.fieldMetadataValue}
            onChange={handleChange}
            required
          />
        </FormGroup>
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

        {Object.keys(configFieldObjState.fieldMetadataObj).length > 0 && (
          <Row className="mt-3">
            <Col xs={12} className="my-2">
              Field Metadata
            </Col>
            {Object.keys(configFieldObjState.fieldMetadataObj).map(
              (metaDataKey, idx) => (
                <Col key={idx} xs={6} lg={4}>
                  <div className="bg-info text-white p-2 rounded-3 d-flex justify-content-between">
                    <span>{metaDataKey}</span>
                    <button
                      className="btn text-white py-0"
                      onClick={() => removeFieldMetadata(metaDataKey)}
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

export default AddFieldMetadataModal;
