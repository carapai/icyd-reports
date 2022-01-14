import {
  Button, Checkbox, Drawer,
  DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader,
  DrawerOverlay, List, ListItem, Spacer, Stack, Text, useDisclosure,
  Box,
  DrawerFooter,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Progress,

} from "@chakra-ui/react";
import { saveAs } from "file-saver";
import XLSX from "xlsx";
import { useDataEngine } from "@dhis2/app-runtime";
import { DatePicker, TreeSelect } from "antd";
import 'antd/dist/antd.css';
import { useStore } from "effector-react";
import { flatten } from 'lodash';
import { ChangeEvent, useRef, useState } from "react";
import { MdFileDownload, MdFilterList } from "react-icons/md";
import { columns } from "../../store/Constants";
import { addRemoveColumn, changePeriod, setSelectedOrgUnits, setUserOrgUnits } from "../../store/Events";
import { $columns, $store } from "../../store/Stores";
import { processInstances } from "../../store/Queries";

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
        paging: "false",
        order: "shortName:desc",
        fields: "children[id,name,path,leaf]",
      },
    },
  };
};

const DataSetLayerFilter = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: modalIsOpen,
    onOpen: modalOnOpen,
    onClose: modalOnClose,
  } = useDisclosure();
  const store = useStore($store)
  const btnRef = useRef<any>();
  const engine = useDataEngine();
  const columns = useStore($columns)
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
    const trackedEntitiesQuery = {
      results: {
        resource: "trackedEntityInstances",
        params: {
          ouMode: "DESCENDANTS",
          ou: store.selectedOrgUnits.join(";"),
          fields: ["*"],
          program: store.selectedProgram,
          page: 1,
          totalPages: true,
          pageSize: 250,
        },
      },
    };

    const {
      results: {
        trackedEntityInstances,
        pager: { pageCount },
      },
    }: any = await engine.query(trackedEntitiesQuery);
    const processedData = await processInstances(
      engine,
      store.selectedProgram,
      trackedEntityInstances,
      store.period,
      store.selectedOrgUnits.join(";")
    );
    let changedColumnData = processedData.map((d) => {
      return columns.map((c) => d[c.id] || "");
    });

    if (pageCount > 1) {
      for (let page = 2; page <= pageCount; page++) {
        const newQuery = {
          results: {
            resource: "trackedEntityInstances",
            params: {
              ouMode: "DESCENDANTS",
              ou: store.selectedOrgUnits.join(";"),
              fields: ["*"],
              program: store.selectedProgram,
              page,
              pageSize: 250,
            },
          },
        };
        const {
          results: { trackedEntityInstances },
        }: any = await engine.query(newQuery);
        const processedData = await processInstances(
          engine,
          store.selectedProgram,
          trackedEntityInstances,
          store.period,
          store.selectedOrgUnits.join(";")
        );
        let allData = processedData.map((d) => {
          return columns.map((c) => d[c.id] || "");
        });
        changedColumnData = [...changedColumnData, ...allData];
      }
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
      columns.map((c) => c.display),
      ...changedColumnData,
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

    <Stack direction="row" spacing="30px">
      <Stack direction="row" alignItems="center">
        <Text>Select Organisation:</Text>
        <TreeSelect
          allowClear={true}
          treeDataSimpleMode
          style={{
            width: "350px",
            backgroundColor: "#e2e8f0",
            border: 0,
          }}
          multiple
          value={store.selectedOrgUnits}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Please select Organisation Unit(s)"
          onChange={(value) => setSelectedOrgUnits(value)}
          loadData={loadOrganisationUnitsChildren}
          treeData={store.userOrgUnits}
        />
      </Stack>
      <Stack direction="row" alignItems="center">
        <Text>Quarter:</Text>
        <DatePicker picker="quarter" value={store.period} onChange={(value: any) => changePeriod(value)} />
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
              Choose Columns
            </DrawerHeader>

            <DrawerBody>
              <List spacing={3}>
                {store.columns.map((c) => <ListItem key={c.display}>
                  <Checkbox isChecked={c.selected} onChange={(e: ChangeEvent<HTMLInputElement>) => addRemoveColumn({ value: e.target.checked, id: c.id })}>{c.display}</Checkbox>
                </ListItem>)}
              </List>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Stack>
    </Stack>
  )
}

export default DataSetLayerFilter
