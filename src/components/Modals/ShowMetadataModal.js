import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const ShowMetadataModal = ({ isOpen, setIsOpen, nodeMetadata }) => {
  if (!nodeMetadata) return;

  return (
    <Modal centered size="lg" isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      <ModalHeader className="text-center" toggle={() => setIsOpen(!isOpen)}>
        Meta Data Of {nodeMetadata.name}
      </ModalHeader>
      <ModalBody className="p-5">
        <p className="p-2">
          Object Name : <span className="fw-bold">{nodeMetadata.name}</span>
        </p>
        <p className="p-2">
          Object Lineage :{" "}
          <span className="fw-bold">{nodeMetadata.lineage}</span>
        </p>
        <p className="p-2">
          Object Occurences :{" "}
          <span className="fw-bold">{nodeMetadata.occurences}</span>
        </p>
        <p className="p-2">
          No.of children :{" "}
          <span className="fw-bold">{nodeMetadata.noOfChildren}</span>
        </p>
        {nodeMetadata.metadata &&
          Object.keys(nodeMetadata.metadata).map((key) => (
            <p className="p-2">
              {key} :{" "}
              <span className="fw-bold">{nodeMetadata.metadata[key]}</span>
            </p>
          ))}
      </ModalBody>
    </Modal>
  );
};

export default ShowMetadataModal;
