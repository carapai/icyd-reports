import { Stack } from "@chakra-ui/react";
import { useState } from "react";
import moment from "moment";
import OVCServiceTrackerFilter from "../components/filters/OVCServiceTrackerFilter";
import OVCServiceTrackerTable from "../components/OVCServiceTrackerTable";
import { DistrictOption } from "../interfaces";

const OVCServiceTracker = () => {
  const [period, setPeriod] = useState<any>(moment());
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  return (
    <Stack p="10px">
      <OVCServiceTrackerFilter
        period={period}
        onPeriodChange={setPeriod}
        districts={districts}
        onDistrictChange={setDistricts}
      />
      <OVCServiceTrackerTable districts={districts} period={period} />
    </Stack>
  );
};

export default OVCServiceTracker;
