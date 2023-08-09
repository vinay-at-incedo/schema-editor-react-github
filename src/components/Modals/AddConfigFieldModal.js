import React, { useEffect } from "react";
import CONFIG_FIELD_OPTIONS from "../../data/field_type.json";

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
import ConfigFieldTreeInterface from "../ConfigFieldTree/ConfigFieldTreeInterface.js";

const MANDATORY_FLAG_1_LIST = [
  { flag: "o", description: "Optional" },
  { flag: "m", description: "Mandatory" },
];

const MANDATORY_FLAG_2_LIST = [
  { flag: "b", description: "Both" },
  { flag: "k", description: "Only Key" },
  { flag: "v", description: "Only Value" },
];

const OPTIONAL_FLAG_LIST = [
  { flag: "m", description: "enter submodule if this field is entered" },
  { flag: "h", description: "flag h is used for hidden commands." },
  {
    flag: "k",
    description: "This flag specifies that the field is an object key field.",
  },
  { flag: "s", description: "field visible in shared partition only" },
  { flag: "p", description: "field visible in private partition only" },
  { flag: "S", description: "field visible in service partition only" },
  { flag: "r", description: "field allows replace" },
  { flag: "d", description: "field is optional in no command" },
  { flag: "f", description: "send full command to IMI" },
  { flag: "i", description: "field is ignored in no command" },
  { flag: "a", description: "check for association" },
  { flag: "b", description: "ignore both keyword and value in no command" },
  { flag: "c", description: "No data available" },
  { flag: "z", description: "Replace keys and Yank fields" },
  { flag: "y", description: "Yank associated fields" },
];

const AddConfigFieldModal = ({
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
  // So As To Set Default Values
  useEffect(() => {
    setConfigFieldObjState({
      ...configFieldObjState,
      fieldType: configFieldObjState.fieldType || CONFIG_FIELD_OPTIONS[0],
      flag1: configFieldObjState.flag1 || MANDATORY_FLAG_1_LIST[0].flag,
      flag2: configFieldObjState.flag2 || MANDATORY_FLAG_2_LIST[0].flag,
    });
  }, []);

  const handleChange = (e) => {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;
    setConfigFieldObjState({ ...configFieldObjState, [fieldName]: fieldValue });
  };

  const handleCheckChange = (e) => {
    let optionalFlagValue = e.target.value;
    let optionalFlagChecked = e.target.checked;
    setConfigFieldObjState({
      ...configFieldObjState,
      optionalFlagObj: {
        ...configFieldObjState.optionalFlagObj,
        [optionalFlagValue]: optionalFlagChecked,
      },
    });
  };

  const resetConfigFieldObjState = () => {
    setConfigFieldObjState({
      fieldName: "",
      fieldType: "",
      flag1: "",
      flag2: "",
      optionalFlagObj: {},
      fieldMetadataObj: {},
    });
  };

  // Initially Add Config Field To The Config Field Tree 
  const addNodeToConfigFieldTree = (field) => {
    let newNode = {
      name: field.field_name,
      parent: null,
      children: [],
    };
    if (ConfigFieldTreeInterface.root.children) {
      ConfigFieldTreeInterface.root.children = [
        ...ConfigFieldTreeInterface.root.children,
        newNode,
      ];
    } else {
      ConfigFieldTreeInterface.root.children = [newNode];
    }
    ConfigFieldTreeInterface.update(ConfigFieldTreeInterface.root);
  };

  const addConfigFieldToList = () => {
    let _configFieldObj = {
      field_name: configFieldObjState.fieldName,
      field_type: configFieldObjState.fieldType,
      flag1: configFieldObjState.flag1,
      flag2: configFieldObjState.flag2,
      // Add Only Those Optional Flags Which Are Checked
      optional_flag: Object.keys(configFieldObjState.optionalFlagObj).filter(
        (key) => configFieldObjState.optionalFlagObj[key]
      ),
      field_metadata: Object.keys(configFieldObjState.fieldMetadataObj).map(
        (key) => `${[key]} ${configFieldObjState.fieldMetadataObj[key]}`
      ),
    };

    setFormState({
      ...formState,
      configFieldObjList: [...formState.configFieldObjList, _configFieldObj],
    });

    resetConfigFieldObjState();
    addNodeToConfigFieldTree(_configFieldObj);
    prevStep();
  };

  const handleCancel = () => {
    resetConfigFieldObjState();
    prevStep();
  };

  const validateConfigField = () => {
    let errorMsg = "";

    if (configFieldObjState.fieldName === "") {
      errorMsg = "Field Name Is Required";
    } else if (configFieldObjState.fieldType === "") {
      errorMsg = "Field Type Is Required";
    } else if (configFieldObjState.flag1 === "") {
      errorMsg = "Flag 1 Is Required";
    } else if (configFieldObjState.flag2 === "") {
      errorMsg = "Flag 2 Is Required";
    }

    if (errorMsg === "") return true;
    else {
      alert(errorMsg);
      return false;
    }
  };

  const handleAdd = () => {
    if (validateConfigField()) addConfigFieldToList();
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
      <ModalHeader>Add Config Field</ModalHeader>
      <ModalBody className="p-5">
        <FormGroup>
          <Label htmlFor="fieldName">Field name :</Label>
          <Input
            type="text"
            id="fieldName"
            name="fieldName"
            placeholder="Config Field Name"
            value={configFieldObjState.fieldName}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="fieldType">Field Type:</Label>
          <Input
            type="select"
            id="fieldType"
            name="fieldType"
            value={configFieldObjState.fieldType}
            onChange={handleChange}
          >
            {CONFIG_FIELD_OPTIONS.map((configFieldType, idx) => (
              <option key={idx} value={configFieldType}>
                {configFieldType}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col sm={12} lg={3}>
              Flag 1
            </Col>
            <Col sm={12} lg={9}>
              <Row>
                {MANDATORY_FLAG_1_LIST.map((flagData, idx) => (
                  <Col xs={4} key={idx}>
                    <Input
                      type="radio"
                      id={`flag1-${flagData.flag}`}
                      name="flag1"
                      value={flagData.flag}
                      onChange={handleChange}
                      checked={flagData.flag === configFieldObjState.flag1}
                    />{" "}
                    <Label htmlFor={`flag1-${flagData.flag}`}>
                      {flagData.flag}
                      <span className="tooltiptext">
                        {flagData.description}
                      </span>
                    </Label>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col sm={12} lg={3}>
              Flag 2
            </Col>
            <Col sm={12} lg={9}>
              <Row>
                {MANDATORY_FLAG_2_LIST.map((flagData, idx) => (
                  <Col xs={4} key={idx}>
                    <Input
                      type="radio"
                      id={`flag2-${flagData.flag}`}
                      name="flag2"
                      value={flagData.flag}
                      onChange={handleChange}
                      checked={flagData.flag === configFieldObjState.flag2}
                    />{" "}
                    <Label htmlFor={`flag2-${flagData.flag}`}>
                      {flagData.flag}
                      <span className="tooltiptext">
                        {flagData.description}
                      </span>
                    </Label>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col sm={12} lg={3}>
              Optional Flag
            </Col>
            <Col sm={12} lg={9}>
              <Row>
                {OPTIONAL_FLAG_LIST.map((flagData, idx) => (
                  <Col xs={4} key={idx}>
                    <Input
                      type="checkbox"
                      id={`optionalFlag-${flagData.flag}`}
                      name={`optionalFlag-${flagData.flag}`}
                      value={flagData.flag}
                      onChange={handleCheckChange}
                      checked={
                        configFieldObjState.optionalFlagObj[flagData.flag] ||
                        false
                      }
                    />{" "}
                    <Label htmlFor={`optionalFlag-${flagData.flag}`}>
                      {flagData.flag}
                      <span className="tooltiptext">
                        {flagData.description}
                      </span>
                    </Label>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </FormGroup>
        <Row className="align-items-center my-2">
          <Col xs={12} lg={3}>
            Field Meta Data
          </Col>
          <Col xs={12} lg={4}>
            <Button
              block
              color="info"
              className="text-white"
              onClick={nextStep}
            >
              Add Field Metadata
            </Button>
          </Col>
        </Row>
        <Row className="gy-2">
          {Object.keys(configFieldObjState.fieldMetadataObj).length > 0 && Object.keys(configFieldObjState.fieldMetadataObj).map(
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
      </ModalBody>
      <ModalFooter>
        <Row className="w-100 gy-2 justify-content-between">
          <Col xs={12} lg={4}>
            <Button block color="danger" onClick={handleCancel}>
              Cancel
            </Button>
          </Col>
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
      </ModalFooter>
    </Modal>
  );
};

export default AddConfigFieldModal;
