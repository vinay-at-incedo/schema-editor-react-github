import { useState } from "react";
import { Container } from "reactstrap";
import "./App.css";
import Header from "./components/Header";
import SchemaTree from "./components/SchemaTree/SchemaTree";
import SchemaTreeInterface from "./components/SchemaTree/SchemaTreeInterface";

function App() {
  const [nodeColoredByOccurence, setNodeColoredByOccurence] = useState(false);
  const [options, setOptions] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const resetSearch = () => {
    setSelectedOption(null);
    SchemaTreeInterface.clearSearchState();
  };

  return (
    <Container fluid>
      <Header
        nodeColoredByOccurence={nodeColoredByOccurence}
        setNodeColoredByOccurence={setNodeColoredByOccurence}
        options={options}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        resetSearch={resetSearch}
      />
      <SchemaTree
        nodeColoredByOccurence={nodeColoredByOccurence}
        selectedOption={selectedOption}
        setOptions={setOptions}
      />
    </Container>
  );
}

export default App;
