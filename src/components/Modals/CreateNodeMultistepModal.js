import React, { useCallback, useState } from "react";
import AddConfigFieldModal from "./AddConfigFieldModal";
import AddFieldMetadataModal from "./AddFieldMetadataModal";
import NodeDetailsModal from "./NodeDetailsModal";
import ConfigFieldModal from "./ConfigFieldModal";
import AddObjectMetadataModal from "./AddObjectMetadataModal";

const CreateNodeMultistepModal = ({
  isOpen,
  setIsOpen,
  formState,
  setFormState,
  handleSubmit,
}) => {
  const [step, setStep] = useState(1);

  const [configFieldObjState, setConfigFieldObjState] = useState({
    fieldName: "",
    fieldType: "",
    flag1: "",
    flag2: "",
    optionalFlagObj: {},
    fieldMetadataObj: {},
  });

  const removeFieldMetadata = (metaDataKey) => {
    let _fieldMetadataObj = { ...configFieldObjState.fieldMetadataObj };
    delete _fieldMetadataObj[metaDataKey];
    setConfigFieldObjState({
      ...configFieldObjState,
      fieldMetadataObj: _fieldMetadataObj,
    });
  };

  const removeObjectMetadata = (metaDataKey) => {
    let _objectMetadataObj = { ...formState.objectMetadataObj };
    delete _objectMetadataObj[metaDataKey];
    setFormState({
      ...formState,
      objectMetadataObj: _objectMetadataObj,
    });
  };

  // function for going to next step by increasing step state by 1
  const nextStep = () => {
    setStep(step + 1);
  };

  // function for going to previous step by decreasing step state by 1
  const prevStep = () => {
    setStep(step - 1);
  };

  const handleFinalSubmit = () => {
    setStep(1);
    setIsOpen(false);
    handleSubmit();
  };

  // GetStepModal Will Only Be Called Again When step Changes
  const GetStepModal = useCallback(
    (props) => {
      switch (step) {
        case 0:
          return <AddObjectMetadataModal {...props} />;
        case 1:
          return <NodeDetailsModal {...props} />;
        case 2:
          return <ConfigFieldModal {...props} />;
        case 3:
          return <AddConfigFieldModal {...props} />;
        case 4:
          return <AddFieldMetadataModal {...props} />;
        default:
          return <div></div>;
      }
    },
    [step]
  );

  return (
    <GetStepModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      step={step}
      setStep={setStep}
      formState={formState}
      setFormState={setFormState}
      configFieldObjState={configFieldObjState}
      setConfigFieldObjState={setConfigFieldObjState}
      nextStep={nextStep}
      prevStep={prevStep}
      removeFieldMetadata={removeFieldMetadata}
      removeObjectMetadata={removeObjectMetadata}
      handleFinalSubmit={handleFinalSubmit}
    />
  );
};

export default CreateNodeMultistepModal;
