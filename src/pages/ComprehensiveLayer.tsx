import React from "react";
import { Stack } from "@chakra-ui/react";
import ComprehensiveLayerTable from "../components/ComprehensiveLayerTable";
import ComprehensiveLayerFilter from "../components/filters/ComprehensiveLayerFilter";
const PreventionLayer = () => {
  return (
    <Stack p="10px">
      <ComprehensiveLayerFilter />
      <ComprehensiveLayerTable />
    </Stack>
  );
};
export default PreventionLayer;
