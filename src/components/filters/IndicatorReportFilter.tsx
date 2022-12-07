import { Stack, Text, Spinner, Box } from "@chakra-ui/react";
import { DatePicker } from "antd";
import { useState } from "react";
import { GroupBase, Select } from "chakra-react-select";
import { useDistricts } from "../../store/Queries";
import { DistrictOption, Option } from "../../interfaces";
import { useStore } from "effector-react";
import { $store } from "../../store/Stores";

type IndicatorReportFilterProps = {
  districts: DistrictOption[];
  onDistrictChange: (district: DistrictOption[]) => void;
  // partners: Option[];
  // onPartnerChange: (district: Option[]) => void;
  period: any;
  onPeriodChange: (period: any) => void;
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
      {/* <Text>Partners:</Text>
      <Stack zIndex={10000} w="500px">
        <Select<Option, true, GroupBase<Option>>
          isMulti
          options={partnerOptions}
          isClearable
          size="sm"
          value={partnerOptions.filter(
            (d) =>
              partners.findIndex((partner) => partner.value === d.value) !== -1
          )}
          onChange={(e) =>
            onPartnerChange(
              e.map((x) => {
                return { value: x.value, label: x.label };
              })
            )
          }
        />
      </Stack> */}
      <Text>Year:</Text>
      <DatePicker
        picker="year"
        value={period}
        onChange={(value: any) => onPeriodChange(value)}
      />
    </Stack>
  );
};

export default IndicatorReportFilter;
