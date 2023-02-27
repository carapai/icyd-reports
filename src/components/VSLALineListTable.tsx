import {
  Box,
  Button,
  Heading,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import { useState } from "react";
import { useLayeringVSLA } from "../store/Queries";
import { $store } from "../store/Stores";
import { innerColumns, otherRows } from "../store/utils";

const VSLALineListTable = () => {
  const store = useStore($store);

  const [query, setQuery] = useState<{ [key: string]: any }>({
    fetch_size: 25,
    filter: {
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  terms: {
                    ["level1.keyword"]: store.selectedOrgUnits,
                  },
                },
                {
                  terms: {
                    ["level2.keyword"]: store.selectedOrgUnits,
                  },
                },
                {
                  terms: {
                    ["level3.keyword"]: store.selectedOrgUnits,
                  },
                },
                {
                  terms: {
                    ["level4.keyword"]: store.selectedOrgUnits,
                  },
                },
                {
                  terms: {
                    ["level5.keyword"]: store.selectedOrgUnits,
                  },
                },
              ],
            },
          },
          {
            exists: {
              field: "eventDate",
            },
          },
        ],
      },
    },
  });
  const { isLoading, isSuccess, isError, error, data } = useLayeringVSLA(
    query,
    store.currentStage
  );
  return (
    <Stack>
      <Box m="auto" w="100%">
        <Box
          position="relative"
          overflow="auto"
          whiteSpace="nowrap"
          h="calc(100vh - 280px)"
        >
          {isLoading && (
            <Stack
              h="100%"
              alignItems="center"
              justifyContent="center"
              justifyItems="center"
              alignContent="center"
            >
              <Spinner />
            </Stack>
          )}
          {isSuccess && (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr py={1}>
                  {store.columns4
                    .filter((s) => s.selected)
                    .map((column: any, index: number) => (
                      <Th key={`${column.id}`} {...otherRows(index, column.bg)}>
                        <Heading as="h6" size="xs" textTransform="none">
                          {column.display}
                        </Heading>
                      </Th>
                    ))}
                </Tr>
              </Thead>
              <Tbody py={10}>
                {data.data.map((record: any) => (
                  <Tr key={record.event}>
                    {store.columns4
                      .filter((s) => s.selected)
                      .map((column, index: number) => (
                        <Td
                          {...innerColumns(index)}
                          key={`${record.trackedEntityInstance}${column.id}`}
                        >
                          {record[column.id]}
                        </Td>
                      ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>
      <Button
        isDisabled={!data || isLoading || !data.cursor}
        onClick={() => {
          setQuery(() => {
            return {
              cursor: data.cursor,
            };
          });
        }}
      >
        Load More
      </Button>
      {isError && <Box>{error?.message}</Box>}
    </Stack>
  );
};

export default VSLALineListTable;
