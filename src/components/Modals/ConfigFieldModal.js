import React, { useEffect, useState } from "react";
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
import ConfigFieldTree from "../ConfigFieldTree/ConfigFieldTree";
import ConfigFieldTreeInterface from "../ConfigFieldTree/ConfigFieldTreeInterface";

const ConfigFieldModal = ({
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
  const [conditionForm, setConditionForm] = useState({
    fromField: "",
    toField: "",
  });

  useEffect(() => {
    if (formState.configFieldObjList.length > 0) {
      setConditionForm({
        fromField: formState.configFieldObjList[0].field_name,
        toField: formState.configFieldObjList[0].field_name,
      });
    }
  }, [formState.configFieldObjList]);

  const handleChange = (e) => {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;
    setConditionForm({ ...conditionForm, [fieldName]: fieldValue });
  };

  const validateCondition = () => {
    let errorMsg = "";

    if (conditionForm.fromField === "") {
      errorMsg = "Source Field Is Required";
    } else if (conditionForm.toField === "") {
      errorMsg = "Destination Field Is Required";
    } else if (conditionForm.fromField === conditionForm.toField) {
      errorMsg = "Choose Two Different Fields To Add A Condition";
    }

    if (errorMsg === "") return true;
    else {
      alert(errorMsg);
      return false;
    }
  };

  const handleAddCondition = () => {
    if (validateCondition()) {
      ConfigFieldTreeInterface.addCondition(
        conditionForm.fromField,
        conditionForm.toField
      );
    }
  };

  const removeConfigField = (fieldName) => {
    setFormState({
      ...formState,
      configFieldObjList: formState.configFieldObjList.filter((v, i, arr) => {
        return v.field_name !== fieldName;
      }),
    });
  };

  const validateConfigFieldObjList = () => {
    let errorMsg = "";

    if (formState.configFieldObjList.length === 0) {
      errorMsg = "Atleast One Config Field Is Required";
    }

    if (errorMsg === "") return true;
    else {
      alert(errorMsg);
      return false;
    }
  };

  const handleDone = () => {
    if (validateConfigFieldObjList()) {
      // Set All Condition Value Before Final Submit
      let allConditions = ConfigFieldTreeInterface.getAllConditions();
      setFormState({
        ...formState,
        configFieldObjList: formState.configFieldObjList.map((field) => {
          if (allConditions[field.field_name]) {
            field.condition = allConditions[field.field_name];
          }
          return field;
        }),
      });

      // Clear The Config Field Tree Interface State
      ConfigFieldTreeInterface.root = {
        name: "hidden-root",
        parent: null,
        children: [],
      };
      
      handleFinalSubmit();
    }
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
      <ModalHeader>Config Field</ModalHeader>
      <ModalBody className="px-5">
        <Row className="gy-2 align-items-center">
          <Col xs={12} lg={3}>
            Config Field
          </Col>
          <Col xs={12} lg={5}>
            <Button
              block
              color="info"
              className="text-white"
              onClick={nextStep}
            >
              Add Config Field
            </Button>
          </Col>
        </Row>
        {formState.configFieldObjList.length > 1 && (
          <FormGroup className="mt-3">
            <Row className="align-items-end">
              <Col xs={12} lg={4}>
                <Label htmlFor="fromField">From Field:</Label>
                <Input
                  type="select"
                  id="fromField"
                  name="fromField"
                  value={conditionForm.fromField}
                  onChange={handleChange}
                >
                  {formState.configFieldObjList.map((field, idx) => (
                    <option key={idx} value={field.field_name}>
                      {field.field_name}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col xs={12} lg={4}>
                <Label htmlFor="toField">To Field:</Label>
                <Input
                  type="select"
                  id="toField"
                  name="toField"
                  value={conditionForm.toField}
                  onChange={handleChange}
                >
                  {formState.configFieldObjList.map((field, idx) => (
                    <option key={idx} value={field.field_name}>
                      {field.field_name}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col xs={12} lg={4}>
                <Button
                  block
                  color="info"
                  className="text-white"
                  onClick={handleAddCondition}
                >
                  Add Condition
                </Button>
              </Col>
            </Row>
          </FormGroup>
        )}
        <ConfigFieldTree
          configFieldObjList={formState.configFieldObjList}
          removeConfigField={removeConfigField}
        />
      </ModalBody>
      <ModalFooter>
        <Row className="w-100 gy-2 gx-0 justify-content-between">
          <Col xs={12} lg={4}>
            <Button
              block
              color="info"
              className="text-white"
              onClick={prevStep}
            >
              Previous
            </Button>
          </Col>
          <Col xs={12} lg={4}>
            <Button block color="success" onClick={handleDone}>
              Done
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>
  );
};

export default ConfigFieldModal;
