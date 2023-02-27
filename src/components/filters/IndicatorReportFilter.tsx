import { Stack, Text } from "@chakra-ui/react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { DistrictOption, Option } from "../../interfaces";
import { $store } from "../../store/Stores";

type IndicatorReportFilterProps = {
  districts: DistrictOption[];
  onDistrictChange: (district: DistrictOption[]) => void;
  period: Dayjs | null;
  onPeriodChange: (period: Dayjs | null) => void;
};

const partnerOptions: Option[] = [
  {
    code: "ACORD",
    name: "ACORD",
  },
  {
    code: "IDI",
    name: "IDI",
  },
  {
    code: "UWESO",
    name: "UWESO",
  },
  {
    code: "YOUTHALIVE",
    name: "YOUTHALIVE",
  },
  {
    code: "TASO",
    name: "TASO",
  },
  {
    code: "RHSP",
    name: "RHSP",
  },
  {
    code: "MildMay",
    name: "MildMay",
  },
  {
    code: "ROM",
    name: "Reach Out Mbuya",
  },
  {
    code: "MDMS",
    name: "Masaka Diocesan Medical Services",
  },
].map(({ code, name }) => {
  return { label: name, value: code };
});

const IndicatorReportFilter = ({
  period,
  districts,
  // partners,
  onPeriodChange,
  onDistrictChange,
}: // onPartnerChange,
IndicatorReportFilterProps) => {
  const store = useStore($store);

  return (
    <Stack direction="row" alignItems="center">
      <Text>Districts:</Text>
      <Stack zIndex={10000} w="500px">
        <Select<DistrictOption, true, GroupBase<DistrictOption>>
          isMulti
          options={store.districts}
          isClearable
          size="sm"
          value={store.districts.filter(
            (d) =>
              districts.findIndex((district) => district.value === d.value) !==
              -1
          )}
          onChange={(e) =>
            onDistrictChange(
              e.map((x) => {
                return { value: x.value, label: x.label, ip: x.ip };
              })
            )
          }
        />
      </Stack>
      <Text>Year:</Text>
      <DatePicker
        picker="year"
        value={period}
        onChange={(value) => onPeriodChange(value)}
      />
    </Stack>
  );
};

export default IndicatorReportFilter;
