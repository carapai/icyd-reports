import {
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { TreeSelect } from "antd";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { saveAs } from "file-saver";
import { flatten, fromPairs, uniq } from "lodash";
import { ChangeEvent, useRef } from "react";
import { MdFileDownload, MdFilterList } from "react-icons/md";
import XLSX from "xlsx";
import { Column, Option } from "../../interfaces";
import {
  addRemoveColumn4,
  setColumn4,
  setCurrentStage,
  setUserOrgUnits,
  toggleColumns4,
  setSelectedOrgUnits,
} from "../../store/Events";
import { api } from "../../store/Queries";
import { $columns4, $isChecked, $stages, $store } from "../../store/Stores";

function s2ab(s: any) {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

const createQuery = (parent: any) => {
  return {
    organisations: {
      resource: `organisationUnits.json`,
      params: {
        filter: `id:in:[${parent.id}]`,
        // paging: "false",
        skipPaging: "true",
        order: "shortName:desc",
        fields: "children[id,name,path,leaf]",
      },
    },
  };
};

const VSLALineFilter = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: modalIsOpen,
    onOpen: modalOnOpen,
    onClose: modalOnClose,
  } = useDisclosure();
  const store = useStore($store);
  const stages = useStore($stages);
  const btnRef = useRef<any>();
  const engine = useDataEngine();
  const filteredColumns = useStore($columns4);
  const isChecked = useStore($isChecked);

  const loadOrganisationUnitsChildren = async (parent: any) => {
    try {
      const {
        organisations: { organisationUnits },
      }: any = await engine.query(createQuery(parent));
      const found = organisationUnits.map((unit: any) => {
        return unit.children
          .map((child: any) => {
            return {
              id: child.id,
              pId: parent.id,
              value: child.id,
              title: child.name,
              isLeaf: child.leaf,
            };
          })
          .sort((a: any, b: any) => {
            if (a.title > b.title) {
              return 1;
            }
            if (a.title < b.title) {
              return -1;
            }
            return 0;
          });
      });
      const all = flatten(found);
      setUserOrgUnits([...store.userOrgUnits, ...all]);
    } catch (e) {
      console.log(e);
    }
  };

  const download = async () => {
    let must: any[] = [
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
    ];
    let {
      data: { rows: allRows, columns, cursor: currentCursor },
    } = await api.post("sql", {
      query: `select * from ${String(store.currentStage).toLowerCase()}`,
      filter: {
        bool: {
          must,
        },
      },
    });
    let availableRows = allRows.map((r: any) => {
      return fromPairs(columns.map((c: any, i: number) => [c.name, r[i]]));
    });

    const instances = uniq(
      availableRows.map((d: any) => d.trackedEntityInstance)
    );
    const orgUnits = uniq(availableRows.map((d: any) => d.orgUnit));

    const query3 = {
      units: {
        resource: "organisationUnits.json",
        params: {
          filter: `id:in:[${orgUnits.join(",")}]`,
          fields: "id,name,parent[id,name,parent[id,name]]",
        },
      },
    };
    const query2 = {
      query: `select * from rdeklsxcd4c`,
      filter: {
        terms: {
          [`trackedEntityInstance.keyword`]: instances,
        },
      },
    };

    const {
      data: { columns: columns1, rows: rows1 },
    } = await api.post("sql", query2);

    const {
      units: { organisationUnits },
    }: any = await engine.query(query3);

    const organisations = fromPairs<Object>(
      organisationUnits.map(({ id, name, parent }: any) => {
        return [
          id,
          {
            parish: name,
            subCounty: parent.name,
            district: parent.parent.name,
          },
        ];
      })
    );

    const results = fromPairs<Object>(
      rows1
        .map((r: any) => {
          return fromPairs(columns1.map((c: any, i: number) => [c.name, r[i]]));
        })
        .map(({ trackedEntityInstance, ...rest }: any) => {
          return [trackedEntityInstance, rest];
        })
    );

    availableRows = availableRows.map((d: any) => {
      return {
        ...d,
        ...results[d.trackedEntityInstance],
        ...organisations[d.orgUnit],
      };
    });

    if (currentCursor) {
      do {
        let {
          data: { rows, cursor },
        } = await api.post("sql", { cursor: currentCursor });

        let currentRows = rows.map((r: any) => {
          return fromPairs(columns.map((c: any, i: number) => [c.name, r[i]]));
        });

        const instances = uniq(
          currentRows.map((d: any) => d.trackedEntityInstance)
        );
        const orgUnits = uniq(currentRows.map((d: any) => d.orgUnit));

        const query3 = {
          units: {
            resource: "organisationUnits.json",
            params: {
              filter: `id:in:[${orgUnits.join(",")}]`,
              fields: "id,name,parent[id,name,parent[id,name]]",
            },
          },
        };
        const query2 = {
          query: `select * from rdeklsxcd4c`,
          filter: {
            terms: {
              [`trackedEntityInstance.keyword`]: instances,
            },
          },
        };

        const {
          data: { columns: columns1, rows: rows1 },
        } = await api.post("sql", query2);

        const {
          units: { organisationUnits },
        }: any = await engine.query(query3);

        const organisations = fromPairs<Object>(
          organisationUnits.map(({ id, name, parent }: any) => {
            return [
              id,
              {
                parish: name,
                subCounty: parent.name,
                district: parent.parent.name,
              },
            ];
          })
        );

        const results = fromPairs<Object>(
          rows1
            .map((r: any) => {
              return fromPairs(
                columns1.map((c: any, i: number) => [c.name, r[i]])
              );
            })
            .map(({ trackedEntityInstance, ...rest }: any) => {
              return [trackedEntityInstance, rest];
            })
        );

        currentRows = currentRows.map((d: any) => {
          return {
            ...d,
            ...results[d.trackedEntityInstance],
            ...organisations[d.orgUnit],
          };
        });
        availableRows = availableRows.concat(currentRows);
        currentCursor = cursor;
      } while (!!currentCursor);
    }

    let wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "SheetJS Tutorial",
      Subject: "Test",
      Author: "Red Stapler",
      CreatedDate: new Date(),
    };

    wb.SheetNames.push("Listing");
    let ws = XLSX.utils.aoa_to_sheet([
      filteredColumns.map((c: any) => c.display),
      ...availableRows.map((r: any) =>
        filteredColumns.map((c: any) => r[c.id])
      ),
    ]);
    wb.Sheets["Listing"] = ws;
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      "export.xlsx"
    );
    modalOnClose();
  };

  return (
    <Stack direction="row" spacing="30px" alignItems="center">
      <Text>Program Stage</Text>
      <Stack zIndex={10000} w="500px">
        <Select<Option, false, GroupBase<Option>>
          options={stages}
          isClearable
          value={stages.find((d) => d.value === store.currentStage)}
          onChange={(e) => {
            setCurrentStage(e?.value || "");
            const attributes =
              store.currentProgram.programTrackedEntityAttributes.map(
                ({ trackedEntityAttribute }: any) => {
                  const display = trackedEntityAttribute.name;
                  const id = trackedEntityAttribute.id;
                  return { id, display, selected: true } as Column;
                }
              );
            if (e?.value) {
              const stage = store.currentProgram.programStages?.find(
                ({ id }: any) => id === e.value
              );
              if (stage) {
                const initialColumns = stage.programStageDataElements.map(
                  ({ dataElement }: any) => {
                    const display = dataElement.name;
                    const id = dataElement.id;
                    return { id, display, selected: true } as Column;
                  }
                );
                setColumn4([
                  ...attributes,
                  { display: "District", id: "district", selected: true },
                  { display: "Sub-county", id: "subCounty", selected: true },
                  { display: "Parish", id: "orgUnitName", selected: true },
                  ...initialColumns,
                ]);
              }
            }
          }}
        />
      </Stack>
      <Stack direction="row" alignItems="center">
        <Text>Select Organisation:</Text>
        <TreeSelect
          allowClear={true}
          treeDataSimpleMode
          style={{
            width: "350px",
          }}
          // listHeight={700}
          multiple
          value={store.selectedOrgUnits}
          dropdownStyle={{ height: 200, overflow: "scroll" }}
          placeholder="Please select Organisation Unit(s)"
          onChange={(value) => setSelectedOrgUnits(value)}
          loadData={loadOrganisationUnitsChildren}
          treeData={store.userOrgUnits}
        />
      </Stack>
      <Spacer />
      <Stack direction="row" spacing={4}>
        <Button
          leftIcon={<MdFilterList />}
          colorScheme="blue"
          size="sm"
          onClick={onOpen}
        >
          Show columns
        </Button>
        <Button
          rightIcon={<MdFileDownload />}
          colorScheme="blue"
          variant="outline"
          size="sm"
          onClick={() => {
            modalOnOpen();
            download();
          }}
        >
          Download
        </Button>
        <Modal isOpen={modalIsOpen} onClose={modalOnClose} isCentered>
          <ModalOverlay />
          <ModalContent bg="none" boxShadow="none" textColor="white">
            <ModalBody
              display="flex"
              alignItems="center"
              alignContent="center"
              justifyItems="center"
              justifyContent="center"
              boxShadow="none"
            >
              <Text fontSize="xl">Downloading...</Text>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Drawer
          size="sm"
          isOpen={isOpen}
          placement="right"
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <Checkbox
                isChecked={isChecked}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  toggleColumns4(e.target.checked)
                }
              >
                Choose Columns
              </Checkbox>
            </DrawerHeader>
            <DrawerBody>
              <List spacing={3}>
                {store.columns4.map((c: any) => (
                  <ListItem key={c.display}>
                    <Checkbox
                      isChecked={c.selected}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        addRemoveColumn4({ value: e.target.checked, id: c.id })
                      }
                    >
                      {c.display}
                    </Checkbox>
                  </ListItem>
                ))}
              </List>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Stack>
    </Stack>
  );
};

export default VSLALineFilter;
