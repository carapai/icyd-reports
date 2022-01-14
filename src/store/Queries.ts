import { useQuery } from "react-query";
import { useDataEngine } from "@dhis2/app-runtime";
import { uniq, fromPairs, maxBy, every, sortBy, has } from "lodash";
import {
  differenceInYears,
  parseISO,
  isWithinInterval,
  isBefore,
  differenceInMonths,
  format,
} from "date-fns";
import { setSelectedOrgUnits, setUserOrgUnits, changeTotal } from "./Events";

const findAgeGroup = (age: number) => {
  if (age <= 0) {
    return "< 0";
  }

  if (age > 0 && age <= 4) {
    return "1 - 4";
  }
  if (age > 4 && age <= 9) {
    return "5 - 9";
  }
  if (age > 9 && age <= 14) {
    return "10 - 14";
  }
  if (age > 14 && age <= 17) {
    return "15 - 17";
  }
  if (age > 17 && age <= 20) {
    return "18 - 20";
  }
  if (age > 20 && age <= 24) {
    return "21 - 24";
  }
  if (age >= 25) {
    return "25+";
  }
};

const isAtSchool = (
  age: number,
  homeVisitValue: string,
  enrollmentValue: string
) => {
  if (age >= 6 && age <= 17) {
    if (homeVisitValue) {
      return homeVisitValue;
    }

    if (enrollmentValue === "Yes") {
      return "No";
    }
    if (enrollmentValue === "No") {
      return "Yes";
    }
  } else if (enrollmentValue) {
    if (enrollmentValue === "Yes") {
      return "No";
    }
    if (enrollmentValue === "No") {
      return "Yes";
    }
  }
  return "NA";
};

const mostCurrentEvent = (events: any[], programStage: string, end: Date) => {
  const riskAssessments = events.filter(
    (e: any) =>
      e.programStage === programStage && isBefore(end, parseISO(e.eventDate))
  );
  return maxBy(riskAssessments, "eventDate");
};

const eventWithinQuarter = (
  events: any[],
  programStage: string,
  start: Date,
  end: Date
) => {
  const riskAssessments = events.filter(
    (e: any) =>
      e.programStage === programStage &&
      isWithinInterval(parseISO(e.eventDate), { start, end })
  );
  return maxBy(riskAssessments, "eventDate");
};

const eventsWithinQuarter = (
  events: any[],
  programStage: string,
  start: Date,
  end: Date
) => {
  return events.filter((e: any) => {
    return (
      e.programStage === programStage &&
      isWithinInterval(parseISO(e.eventDate), { start, end })
    );
  });
};

const eventsBe4Quarter = (events: any[], programStage: string, end: Date) => {
  return events.filter(
    (e: any) =>
      e.programStage === programStage && isBefore(parseISO(e.eventDate), end)
  );
};

const findAnyEventValue = (events: any[], dataElement: string) => {
  const sortedEvents = sortBy(events, (e: any) => e.eventDate).reverse();
  const event = sortedEvents.find(
    ({ [dataElement]: de }: any) => de !== null && de !== undefined
  );
  if (event) {
    return event[dataElement];
  }
  return null;
};

const findHIVStatus = (value: string, addition: string = "") => {
  const allValues: { [key: string]: string } = {
    Positive: `${addition}+`,
    Negative: `${addition}-`,
    DK: `${addition}DK`,
  };
  return allValues[value] || "";
};

const anyEventWithDataElement = (
  events: any[],
  dataElement: string,
  value: string
) => {
  if (events.length === 0) {
    return false;
  }
  const processed = events.find((event: any) => {
    return event[dataElement] === value;
  });
  return !!processed;
};
const anyEventWithDE = (events: any[], dataElement: string) => {
  if (events.length === 0) {
    return false;
  }
  const processed = events.find((event) => {
    return has(event, dataElement);
  });
  return !!processed;
};

const anyEventWithAnyOfTheValue = (
  events: any[],
  dataElement: string,
  values: string[]
) => {
  const processed = events.find((event: any) => {
    return values.indexOf(event[dataElement]) !== -1;
  });
  if (processed) {
    return true;
  }
  return false;
};

const specificDataElement = (event: any | undefined, dataElement: string) => {
  if (event) {
    return event[dataElement];
  }
  return null;
};

const hasAYes = (event: any | undefined, dataElements: string[]) => {
  if (event) {
    const de = dataElements.map((de: string) => !!event[de]);
    return de.includes(true);
  }
  return false;
};

const allHaveValue = (
  event: any | undefined,
  dataElements: string[],
  value: any
) => {
  if (event) {
    const de = dataElements.map((de: string) => event[de]);
    const result = every(de, (v) => v === value);
    return result;
  }
  return false;
};

export function useLoader() {
  const engine = useDataEngine();
  const query = {
    me: {
      resource: "me.json",
      params: {
        fields: "organisationUnits[*]",
      },
    },
    relationships: {
      resource: "relationshipTypes",
      params: {
        pageSize: 5,
        fields: ["id", "displayName", "toConstraint", "fromConstraint"],
      },
    },
  };
  return useQuery<any, Error>("sqlViews", async () => {
    const {
      me: { organisationUnits },
      relationships: { relationshipTypes },
    }: any = await engine.query(query);
    const processedUnits = organisationUnits.map((unit: any) => {
      return {
        id: unit.id,
        pId: unit.pId || "",
        value: unit.id,
        title: unit.name,
        isLeaf: unit.leaf,
      };
    });
    setUserOrgUnits(processedUnits);
    setSelectedOrgUnits(organisationUnits.map((u: any) => u.id));
    return true;
  });
}

export const processInstances = async (
  engine: any,
  program: string,
  trackedEntityInstances: any[],
  period: any,
  ou: string
) => {
  const quarterStart = period.startOf("quarter").toDate();
  const quarterEnd = period.endOf("quarter").toDate();
  const orgUnits = uniq(
    trackedEntityInstances.map(({ orgUnit }: any) => orgUnit)
  );

  const currentData = trackedEntityInstances.map(
    ({ relationships: [relationship] }) => {
      if (relationship) {
        return relationship?.from?.trackedEntityInstance.trackedEntityInstance;
      }
    }
  );
  const {
    indexes: { trackedEntityInstances: indexCases },
    hierarchy: { organisationUnits },
  } = await engine.query({
    indexes: {
      resource: "trackedEntityInstances",
      params: {
        fields: "*",
        ou,
        ouMode: "DESCENDANTS",
        trackedEntityType: "SXQEqYXKejK",
        trackedEntityInstance: uniq(currentData).join(";"),
        skipPaging: "true",
      },
    },
    hierarchy: {
      resource: "organisationUnits.json",
      params: {
        filter: `id:in:[${orgUnits.join(",")}]`,
        fields: "id,parent[name,parent[name]]",
        paging: "false",
      },
    },
  });

  const processedUnits = fromPairs(
    organisationUnits.map((unit: any) => {
      return [
        unit.id,
        { subCounty: unit.parent?.name, district: unit.parent?.parent?.name },
      ];
    })
  );

  const instances = trackedEntityInstances.map(
    ({
      created,
      orgUnit,
      attributes,
      trackedEntityInstance,
      relationships: [relationship],
      enrollments: [
        {
          trackedEntityInstance: eventInstance,
          events,
          orgUnitName,
          enrollmentDate,
        },
      ],
    }) => {
      const units: any = processedUnits[orgUnit];
      const allEvents = events
        .filter(({ deleted }: any) => deleted === false)
        .map(({ dataValues, event, eventDate, programStage }: any) => {
          return {
            event,
            eventDate,
            trackedEntityInstance: eventInstance,
            programStage,
            ...fromPairs(
              dataValues.map(({ dataElement, value }: any) => [
                dataElement,
                value,
              ])
            ),
          };
        });
      const parent = indexCases.find(
        ({ trackedEntityInstance }: any) =>
          relationship?.from?.trackedEntityInstance.trackedEntityInstance ===
          trackedEntityInstance
      );

      let child = fromPairs(
        attributes.map(({ attribute, value }: any) => [
          `${program}.${attribute}`,
          value,
        ])
      );
      child = {
        trackedEntityInstance,
        [`${program}.created`]: created,
        [`${program}.orgUnit`]: orgUnit,
        [`${program}.orgUnitName`]: orgUnitName,
        [`${program}.enrollmentDate`]: enrollmentDate,
        [`${program}.type`]: "Comprehensive",
        ...units,
        ...child,
      };
      if (parent) {
        const {
          enrollments: [
            {
              enrollmentDate,
              created,
              orgUnit,
              orgUnitName,
              program: parentProgram,
              events: [event],
            },
          ],
        } = parent;
        let eventDetails = {
          [`${parentProgram}.created`]: created,
          [`${parentProgram}.orgUnit`]: orgUnit,
          [`${parentProgram}.orgUnitName`]: orgUnitName,
          [`${parentProgram}.enrollmentDate`]: enrollmentDate,
        };
        if (event) {
          const {
            dataValues,
            programStage: parentProgramStage,
            eventDate,
          } = event;
          eventDetails = {
            ...eventDetails,
            [`${parentProgram}.${parentProgramStage}.eventDate`]: eventDate,
            ...fromPairs(
              dataValues.map(({ dataElement, value }: any) => [
                `${parentProgram}.${parentProgramStage}.${dataElement}`,
                value,
              ])
            ),
          };
        }
        child = {
          ...child,
          ...fromPairs(
            parent.attributes.map(({ attribute, value }: any) => [
              `${parentProgram}.${attribute}`,
              value,
            ])
          ),
          ...eventDetails,
          hasEnrollment: !!enrollmentDate,
        };
      }

      const isWithin = isWithinInterval(
        parseISO(child["HEWq6yr4cs5.enrollmentDate"] as string),
        { start: quarterStart, end: quarterEnd }
      );

      const currentRiskAssessment = mostCurrentEvent(
        allEvents,
        "B9EI27lmQrZ",
        quarterEnd
      );
      const currentAVat = mostCurrentEvent(
        allEvents,
        "TuLJEpHu0um",
        quarterEnd
      );
      const currentHomeVisit = mostCurrentEvent(
        allEvents,
        "HaaSLv2ur0l",
        quarterEnd
      );
      const currentVL = mostCurrentEvent(allEvents, "kKlAyGUnCML", quarterEnd);
      const currentPlanning = mostCurrentEvent(
        allEvents,
        "LATgKmbf7Yv",
        quarterEnd
      );

      const currentReferral = mostCurrentEvent(
        allEvents,
        "yz3zh5IFEZm",
        quarterEnd
      );
      const currentGroupActivity = mostCurrentEvent(
        allEvents,
        "EVkAS8LJNbO",
        quarterEnd
      );
      const currentServiceLinkage = mostCurrentEvent(
        allEvents,
        "SxnXrDtSJZp",
        quarterEnd
      );

      const aVatDuringQuarter = eventsWithinQuarter(
        allEvents,
        "TuLJEpHu0um",
        quarterStart,
        quarterEnd
      );
      const homeVisitsDuringQuarter = eventsWithinQuarter(
        allEvents,
        "HaaSLv2ur0l",
        quarterStart,
        quarterEnd
      );
      const viralLoadDuringQuarter = eventsWithinQuarter(
        allEvents,
        "kKlAyGUnCML",
        quarterStart,
        quarterEnd
      );
      const casePlanningDuringQuarter = eventsWithinQuarter(
        allEvents,
        "LATgKmbf7Yv",
        quarterStart,
        quarterEnd
      );
      const serviceProvisionDuringQuarter = eventsWithinQuarter(
        allEvents,
        "yz3zh5IFEZm",
        quarterStart,
        quarterEnd
      );
      const groupActivitiesDuringQuarter = eventsWithinQuarter(
        allEvents,
        "EVkAS8LJNbO",
        quarterStart,
        quarterEnd
      );
      const serviceLinkagesDuringQuarter = eventsWithinQuarter(
        allEvents,
        "SxnXrDtSJZp",
        quarterStart,
        quarterEnd
      );
      const riskAssessmentDuringQuarter = eventsWithinQuarter(
        allEvents,
        "B9EI27lmQrZ",
        quarterStart,
        quarterEnd
      );
      const referralsDuringQuarter = eventsWithinQuarter(
        allEvents,
        "yz3zh5IFEZm",
        quarterStart,
        quarterEnd
      );

      const referralsBe4Quarter = eventsBe4Quarter(
        allEvents,
        "yz3zh5IFEZm",
        quarterEnd
      );

      const aVatsBe4Quarter = eventsBe4Quarter(
        allEvents,
        "TuLJEpHu0um",
        quarterEnd
      );

      const homeVisitsBe4Quarter = eventsBe4Quarter(
        allEvents,
        "HaaSLv2ur0l",
        quarterEnd
      );
      const viralLoadsBe4Quarter = eventsBe4Quarter(
        allEvents,
        "kKlAyGUnCML",
        quarterEnd
      );
      const casePlansBe4Quarter = eventsBe4Quarter(
        allEvents,
        "LATgKmbf7Yv",
        quarterEnd
      );
      const serviceProvisionsBe4Quarter = eventsBe4Quarter(
        allEvents,
        "yz3zh5IFEZm",
        quarterEnd
      );
      const riskAssessmentsBe4Quarter = eventsBe4Quarter(
        allEvents,
        "B9EI27lmQrZ",
        quarterEnd
      );

      child = {
        ...child,
        ["RDEklSXCD4C.HaaSLv2ur0l.tM67MBdox3O"]: child[
          "RDEklSXCD4C.HaaSLv2ur0l.tM67MBdox3O"
        ]
          ? 1
          : 0,
        newlyEnrolled: isWithin ? "Yes" : "No",
      };

      if (viralLoadsBe4Quarter.length > 0) {
        child = {
          ...child,
          hivStatus: "+",
        };
      } else if (currentReferral && !!currentReferral["vBqh2aiuHOV"]) {
        child = {
          ...child,
          hivStatus:
            currentReferral["vBqh2aiuHOV"] === "Positive"
              ? "+"
              : currentReferral["vBqh2aiuHOV"] === "Negative"
              ? "-"
              : currentReferral["vBqh2aiuHOV"] === "Dont Know (DK)"
              ? "DK"
              : "",
        };
      } else {
        child = {
          ...child,
          hivStatus:
            child["RDEklSXCD4C.HzUL8LTDPga"] === "Positive"
              ? "+"
              : child["RDEklSXCD4C.HzUL8LTDPga"] === "Negative"
              ? "-"
              : child["RDEklSXCD4C.HzUL8LTDPga"] === "Dont Know (DK)"
              ? "DK"
              : "",
        };
      }

      const isAtRisk = hasAYes(currentRiskAssessment, [
        "WlTMjkcP6gv",
        "Y8kX45XGXXI",
        "NN0M618qUFX",
        "MH5BGP1Ww2Q",
        "p3FSiLQ1q6T",
        "x1bL4w5EsPL",
        "dunvFwnbGQF",
        "oI9btGSwA7P",
      ]);

      const isNotAtRiskAdult = allHaveValue(
        currentRiskAssessment,
        [
          "WwMOTHl2cOz",
          "uf6tkJtuWpt",
          "zpvSpZxMYIV",
          "O6O0ADYLwua",
          "VOCmw7bULXR",
          "FHu4YfcrIQw",
          "Dny6B3ubQEa",
          "h7JCV3YLRJO",
          "VtnameiqmRy",
        ],
        "false"
      );
      const isNotAtRisk = allHaveValue(
        currentRiskAssessment,
        [
          "WlTMjkcP6gv",
          "Y8kX45XGXXI",
          "NN0M618qUFX",
          "MH5BGP1Ww2Q",
          "p3FSiLQ1q6T",
          "x1bL4w5EsPL",
          "dunvFwnbGQF",
          "oI9btGSwA7P",
        ],
        "false"
      );
      const reasonForReferral = specificDataElement(
        referralsDuringQuarter,
        "EDa2GQUCbsx"
      );
      const unknownOther = findAnyEventValue(
        riskAssessmentsBe4Quarter,
        "cTV8aMqnVbe"
      );
      const testedForHIV = specificDataElement(
        currentRiskAssessment,
        "XWudTD2LTUQ"
      );

      const hivResult = anyEventWithDataElement(
        referralsBe4Quarter,
        "yz3zh5IFEZm",
        ""
      );

      if (child["RDEklSXCD4C.nDUbdM2FjyP"] === "Primary caregiver") {
        child = { ...child, primaryCareGiver: "1" };
      } else {
        child = { ...child, primaryCareGiver: "0" };
      }
      const ageGroup: any = child["RDEklSXCD4C.N1nMqKtYKvI"];
      const hVatDate: any = child["HEWq6yr4cs5.enrollmentDate"];
      const phase: any = child["HEWq6yr4cs5.jiuPVqetSaV"];
      const age = differenceInYears(quarterEnd, parseISO(ageGroup));
      if (ageGroup && ageGroup.length === 10) {
        child = { ...child, [`RDEklSXCD4C.ageGroup`]: findAgeGroup(age) };
      }
      if (ageGroup && ageGroup.length === 10) {
        child = { ...child, [`RDEklSXCD4C.age`]: age };
      }
      if (
        isWithinInterval(parseISO(hVatDate), {
          start: quarterStart,
          end: quarterEnd,
        })
      ) {
        child = { ...child, [`HEWq6yr4cs5.jiuPVqetSaV`]: 1 };
      } else {
        child = { ...child, [`HEWq6yr4cs5.jiuPVqetSaV`]: 0 };
      }
      if (
        child["hivStatus"] &&
        child["hivStatus"] !== "+" &&
        riskAssessmentDuringQuarter.length > 0
      ) {
        child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.vBqh2aiuHOV`]: 1 };
      } else {
        child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.vBqh2aiuHOV`]: 0 };
      }
      if (age < 18 && isAtRisk) {
        child = { ...child, isAtRisk: 1 };
      } else {
        child = { ...child, isAtRisk: 0 };
      }
      if (age < 18 && reasonForReferral && reasonForReferral === "") {
        child = { ...child, [`RDEklSXCD4C.yz3zh5IFEZm.reason`]: 1 };
      } else {
        child = { ...child, [`RDEklSXCD4C.yz3zh5IFEZm.reason`]: 0 };
      }
      if (age < 18 && hivResult) {
        child = { ...child, [`RDEklSXCD4C.yz3zh5IFEZm.hivResult`]: 1 };
      } else {
        child = { ...child, [`RDEklSXCD4C.yz3zh5IFEZm.hivResult`]: 0 };
      }
      if (isNotAtRisk) {
        child = { ...child, isNotAtRisk: 1 };
      } else {
        child = { ...child, isNotAtRisk: 0 };
      }
      if (age < 18 && unknownOther) {
        child = {
          ...child,
          unknown: unknownOther,
        };
      } else {
        child = { ...child, unknown: "" };
      }
      if (age < 18 && testedForHIV) {
        child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.testedForHIV`]: 1 };
      } else {
        child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.testedForHIV`]: 0 };
      }
      child = { ...child, [`newlyPositive`]: 0 };
      child = { ...child, [`newlyTestedPositive`]: 0 };
      child = { ...child, [`newlyTestedAndOnArt`]: 0 };
      child = {
        ...child,
        riskFactor:
          findAnyEventValue(homeVisitsBe4Quarter, "rQBaynepqjy") ||
          child[`RDEklSXCD4C.nDUbdM2FjyP`],
      };
      child = {
        ...child,
        memberStatus:
          findAnyEventValue(homeVisitsBe4Quarter, "tM67MBdox3O") === "true"
            ? "Active"
            : findAnyEventValue(homeVisitsBe4Quarter, "VEw6HHnx8mR")
            ? findAnyEventValue(homeVisitsBe4Quarter, "VEw6HHnx8mR")
            : "No Home Visit",
      };
      child = {
        ...child,
        householdStatus: !!findAnyEventValue(
          homeVisitsBe4Quarter,
          "PpUByWk3p8N"
        )
          ? findAnyEventValue(homeVisitsBe4Quarter, "PpUByWk3p8N")
          : child["hasEnrollment"]
          ? "Active"
          : "Not Enrolled",
      };
      child = {
        ...child,
        enrolledInSchool: isAtSchool(
          age,
          "",
          child["RDEklSXCD4C.h4pXErY01YR"] as any
        ),
      };

      const hivStatusReferral = findAnyEventValue(
        referralsBe4Quarter,
        "PpUByWk3p8N"
      );
      const hivStatusRiskAssessment = findAnyEventValue(
        riskAssessmentsBe4Quarter,
        "vBqh2aiuHOV"
      );
      const hivStatusVL = findAnyEventValue(
        viralLoadsBe4Quarter,
        "PpUByWk3p8N"
      );

      child = { ...child, artNo: "" };
      child = { ...child, onArt: "" };
      child = { ...child, facility: "" };

      if (
        viralLoadsBe4Quarter.length > 0 &&
        !!findAnyEventValue(viralLoadsBe4Quarter, "aBc9Lr1z25H")
      ) {
        child = {
          ...child,
          artNo: findAnyEventValue(viralLoadsBe4Quarter, "aBc9Lr1z25H"),
        };

        child = {
          ...child,
          facility: findAnyEventValue(viralLoadsBe4Quarter, "usRWNcogGX7"),
        };
      }
      if (
        viralLoadsBe4Quarter.length > 0 &&
        findAnyEventValue(viralLoadsBe4Quarter, "xyDBnQTdZqS")
      ) {
        child = {
          ...child,
          [`onArt`]: findAnyEventValue(viralLoadsBe4Quarter, "xyDBnQTdZqS")
            ? 1
            : "",
        };
      } else if (child["hivStatus"] === "+") {
        child = {
          ...child,
          [`onArt`]: "No VL",
        };
      } else {
        child = {
          ...child,
          [`onArt`]: "",
        };
      }

      if (
        child["hivStatus"] !== "+" &&
        child["RDEklSXCD4C.umqeJCVp4Zq"] === "NA"
      ) {
        child = {
          ...child,
          ["RDEklSXCD4C.umqeJCVp4Zq"]: "",
        };
      } else if (child["hivStatus"] === "+") {
        child = {
          ...child,
          ["RDEklSXCD4C.umqeJCVp4Zq"]:
            child["RDEklSXCD4C.umqeJCVp4Zq"] === "Yes" ? 1 : 0,
        };
      }

      const artStartDate = findAnyEventValue(
        viralLoadsBe4Quarter,
        "epmIBD8gh7G"
      );

      const lastViralLoadDate = findAnyEventValue(
        viralLoadsBe4Quarter,
        "Ti0huZXbAM0"
      );
      const viralTestDone = findAnyEventValue(
        viralLoadsBe4Quarter,
        "cM7dovIX2Dl"
      );
      const viralLoadResultsReceived = findAnyEventValue(
        viralLoadsBe4Quarter,
        "te2VwealaBT"
      );
      const viralLoadStatus = findAnyEventValue(
        viralLoadsBe4Quarter,
        "AmaNW7QDuOV"
      );
      const viralLoadCopies = findAnyEventValue(
        viralLoadsBe4Quarter,
        "b8p0uWaYRhY"
      );
      const copies = findAnyEventValue(viralLoadsBe4Quarter, "dKuvKdHH5BP");
      if (child["hivStatus"] === "+") {
        if (!!artStartDate) {
          const daysOnArt = differenceInMonths(
            quarterEnd,
            parseISO(artStartDate)
          );
          if (daysOnArt >= 6) {
            child = {
              ...child,
              ovcEligible: 1,
            };
          } else {
            child = {
              ...child,
              ovcEligible: "NE",
            };
          }
        } else {
          child = {
            ...child,
            ovcEligible: "No VL",
          };
        }
        child = { ...child, lastViralLoadDate };

        if (!!lastViralLoadDate && child.ovcEligible === 1) {
          const monthsSinceLastViralLoad = differenceInMonths(
            quarterEnd,
            parseISO(lastViralLoadDate)
          );
          if (monthsSinceLastViralLoad <= 12) {
            child = {
              ...child,
              VLTestDone:
                viralTestDone === "true"
                  ? 1
                  : viralTestDone === "false"
                  ? 0
                  : 0,
              VLStatus: viralLoadStatus,
            };
          } else {
            child = {
              ...child,
              VLTestDone: 0,
            };
          }
        } else {
          child = {
            ...child,
            VLTestDone: 0,
          };
        }
        if (!!viralLoadResultsReceived && child.VLTestDone === 1) {
          child = {
            ...child,
            ovcVL: viralLoadResultsReceived === "true" ? 1 : 0,
          };
        } else {
          child = {
            ...child,
            ovcVL: 0,
          };
        }

        if (child.ovcVL === 1) {
          child = {
            ...child,
            copies: viralLoadCopies,
            VLSuppressed: viralLoadStatus === "Suppressed" ? 1 : 0,
          };
        } else {
          child = {
            ...child,
            ovcVL: 0,
            VLSuppressed: 0,
          };
        }
      } else {
        child = {
          ...child,
          VLTestDone: "",
          ovcEligible: "",
          ovcVL: "",
          VLStatus: "",
        };
      }
      child = { ...child, [`VSLA`]: 0 };
      child = { ...child, [`fLiteracy`]: 0 };
      child = {
        ...child,
        [`bankLinkages`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          [
            "F1. Access credit services",
            "F2. Access saving services",
            "F3. Insurance services/ Health Fund",
          ]
        ),
      };
      child = {
        ...child,
        [`agriBusiness`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          [
            "A1. Input Markets through voucher",
            "A2. input such as seeds and poultry",
            "A3. training in agricultural production",
          ]
        ),
      };
      child = { ...child, [`spmTraining`]: 0 };
      child = {
        ...child,
        [`micro`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["B1. Access to credit services", "B2. Access to saving services"]
        ),
      };
      child = {
        ...child,
        [`igaBooster`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["O3. IGA Booster"]
        ),
      };
      child = {
        ...child,
        [`tempConsumption`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          [
            "UF1.Gov't Emergence fund",
            "UF3 VSLA OVC protection Fund",
            "UF2. SAGE",
            "UF7. Others specify",
          ]
        ),
      };
      child = {
        ...child,
        [`vlsaOvcFund`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["UF3 VSLA OVC protection Fund"]
        ),
      };

      child = {
        ...child,
        [`educationSubsidy`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["O1. Education subsidy"]
        ),
      };
      child = { ...child, [`homeLearning`]: 0 };
      child = {
        ...child,
        [`nonFormalEducation`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["O2. None Formal Education"]
        ),
      };
      child = { ...child, [`coreEducation`]: 0 };

      child = { ...child, [`HTSReferral`]: 0 };
      child = {
        ...child,
        nonDisclosureSupport:
          anyEventWithDE(homeVisitsDuringQuarter, "rLc3CF2VeOC") ||
          anyEventWithDE(homeVisitsDuringQuarter, "xSS9QHbuT4S")
            ? 1
            : 0,
      };
      child = {
        ...child,
        [`artInitiation`]: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Initiated on HIV Treatment"]
        ),
      };
      child = {
        ...child,
        [`artAdherenceEducation`]:
          anyEventWithDE(homeVisitsDuringQuarter, "NxhBKqINsZY") ||
          anyEventWithDE(homeVisitsDuringQuarter, "svrj6VtHjay") ||
          anyEventWithDE(homeVisitsDuringQuarter, "NJZ13SXf8XV")
            ? 1
            : 0,
      };
      child = {
        ...child,
        [`iac`]: anyEventWithDataElement(
          viralLoadDuringQuarter,
          "iHdNYfm1qlz",
          "true"
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        [`eMTCT`]:
          anyEventWithDE(homeVisitsDuringQuarter, "SrEP2vZtMHV") ||
          anyEventWithDE(homeVisitsDuringQuarter, "ffxCn2msT1R")
            ? 1
            : 0,
      };
      child = {
        ...child,
        [`hivPrevention`]: anyEventWithDE(
          homeVisitsDuringQuarter,
          "xXqKqvuwA8m"
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        [`journeysMOH`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`journeysLARA`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`NMNBoys`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`NMNGirls`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`TFHealth`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "HzDRzHCuzdf",
          ["Unconditional financial support initiatives"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        [`PEP`]: anyEventWithAnyOfTheValue(
          serviceProvisionDuringQuarter,
          "rzd1tAkPSkv",
          ["PEP"]
        ),
      };
      child = {
        ...child,
        [`covid19Education`]: "",
      };

      child = {
        ...child,
        [`otherHealthServices`]:
          anyEventWithDE(homeVisitsDuringQuarter, "eEZu3v92pJZ") ||
          anyEventWithDE(homeVisitsDuringQuarter, "C41UbAJDeqG") ||
          anyEventWithDE(homeVisitsDuringQuarter, "D7rrGXWwjGn") ||
          anyEventWithDE(homeVisitsDuringQuarter, "CnfRJ2y4Lg8")
            ? 1
            : 0,
      };
      child = {
        ...child,
        [`GBVPreventionEducation`]:
          anyEventWithDE(homeVisitsDuringQuarter, "ENMOyjoE2GM") ||
          anyEventWithDE(homeVisitsDuringQuarter, "ak7SceZTDsF") ||
          anyEventWithDE(homeVisitsDuringQuarter, "HqbcvvZAc9w") ||
          anyEventWithDE(homeVisitsDuringQuarter, "H4YhW8kTs2P") ||
          anyEventWithDE(homeVisitsDuringQuarter, "kpWBIc81VKL") ||
          anyEventWithDE(homeVisitsDuringQuarter, "pm7k8wuOTLt") ||
          anyEventWithDE(homeVisitsDuringQuarter, "a0lXaMhHh32")
            ? 1
            : 0,
      };
      child = {
        ...child,
        [`TFGBV`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`referral4LegalSupport`]: anyEventWithDataElement(
          referralsDuringQuarter,
          "EDa2GQUCbsx",
          "Legal Support"
        ),
      };
      child = {
        ...child,
        [`ECD`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`parenting`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`childProtectionEducation`]:
          anyEventWithDE(homeVisitsDuringQuarter, "cgnfO3xqaYb") ||
          anyEventWithDE(homeVisitsDuringQuarter, "bJPqgTbbt8g") ||
          anyEventWithDE(homeVisitsDuringQuarter, "UlQEavBni01") ||
          anyEventWithDE(homeVisitsDuringQuarter, "v6zHvL8w9ex")
            ? 1
            : 0,
      };

      child = {
        ...child,
        [`nutritionEducation`]:
          anyEventWithDE(homeVisitsDuringQuarter, "FGs1bkmfoTX") ||
          anyEventWithDE(homeVisitsDuringQuarter, "BDVZPgVPVww") ||
          anyEventWithDE(homeVisitsDuringQuarter, "p9EaFSIg3ht") ||
          anyEventWithDE(homeVisitsDuringQuarter, "Eg1yxmjMfG7")
            ? 1
            : 0,
      };
      child = {
        ...child,
        [`nutritionalAssessment`]: anyEventWithAnyOfTheValue(
          homeVisitsDuringQuarter,
          "YclIJQQsA89",
          ["Yes"]
        ),
      };
      child = {
        ...child,
        [`voucher4CropsOrKitchenGardens`]: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "HzDRzHCuzdf",
          ["Agribusiness"]
        )
          ? 1
          : 0,
      };

      child = {
        ...child,
        [`psychosocialSupport`]:
          anyEventWithDE(homeVisitsDuringQuarter, "EPchB4Exe2W") ||
          anyEventWithDE(homeVisitsDuringQuarter, "bl1spy2qZx9") ||
          anyEventWithDE(homeVisitsDuringQuarter, "VfpDpPPKRN6") ||
          anyEventWithDE(homeVisitsDuringQuarter, "I8f8EVY5rtY") ||
          anyEventWithDE(homeVisitsDuringQuarter, "OawjweoGEhr") ||
          anyEventWithDE(homeVisitsDuringQuarter, "yowPVwuMMqZ") ||
          anyEventWithDE(homeVisitsDuringQuarter, "f4jgX6ch67t") ||
          anyEventWithDE(homeVisitsDuringQuarter, "YZH5hmsL7wS") ||
          anyEventWithDE(homeVisitsDuringQuarter, "KsGYugQ1vmD") ||
          anyEventWithDE(homeVisitsDuringQuarter, "Mu3g2OAL45z") ||
          anyEventWithDE(homeVisitsDuringQuarter, "DJuFa605flQ") ||
          anyEventWithDE(homeVisitsDuringQuarter, "l2dux9dZ80n") ||
          anyEventWithDE(homeVisitsDuringQuarter, "I14Ps4E6pkc") ||
          anyEventWithDE(homeVisitsDuringQuarter, "dkUee6TB7kh") ||
          anyEventWithDE(homeVisitsDuringQuarter, "SBnpTKoIGsP") ||
          anyEventWithDE(homeVisitsDuringQuarter, "ySVNhEXsMdJ") ||
          anyEventWithDE(homeVisitsDuringQuarter, "ttrftNW6Hvt") ||
          anyEventWithDE(homeVisitsDuringQuarter, "fKt9QfYFLcP") ||
          anyEventWithDE(homeVisitsDuringQuarter, "LLqXFg9LSva") ||
          anyEventWithDE(homeVisitsDuringQuarter, "RgiLe8wnGCu") ||
          anyEventWithDE(homeVisitsDuringQuarter, "xe4vjgebIvY") ||
          anyEventWithDE(homeVisitsDuringQuarter, "Vvhi5UERsGt") ||
          anyEventWithDE(homeVisitsDuringQuarter, "XPa9UnDjaBm") ||
          anyEventWithDE(homeVisitsDuringQuarter, "SPwxtuLWvUS") ||
          anyEventWithDE(homeVisitsDuringQuarter, "OPaSCuEHG6U") ||
          anyEventWithDE(homeVisitsDuringQuarter, "AirD3FZ9n6i") ||
          anyEventWithDE(homeVisitsDuringQuarter, "LQSy4undhKw") ||
          anyEventWithDE(homeVisitsDuringQuarter, "blyJnu6QaTY") ||
          anyEventWithDE(homeVisitsDuringQuarter, "xSS9QHbuT4S") ||
          anyEventWithDE(homeVisitsDuringQuarter, "ffxCn2msT1R") ||
          anyEventWithDE(homeVisitsDuringQuarter, "qr5qx26F2k5") ||
          anyEventWithDE(homeVisitsDuringQuarter, "WPjGiogQuMg") ||
          anyEventWithDE(homeVisitsDuringQuarter, "ArdR8f6lg2I") ||
          anyEventWithDE(homeVisitsDuringQuarter, "LEa6yJQU4FR") ||
          anyEventWithDE(homeVisitsDuringQuarter, "OQ2O7hzLz4n") ||
          anyEventWithDE(homeVisitsDuringQuarter, "kgeTLR5iPGl") ||
          anyEventWithDE(homeVisitsDuringQuarter, "af5jHMW6cPf") ||
          anyEventWithDE(homeVisitsDuringQuarter, "bdKyx6Eb911") ||
          anyEventWithDE(homeVisitsDuringQuarter, "nKjyjWLj88B")
            ? 1
            : 0,
      };

      const coreES =
        child.VSLA === 1 ||
        child.fLiteracy === 1 ||
        child.bankLinkages === 1 ||
        child.agriBusiness === 1 ||
        child.spmTraining === 1 ||
        child.micro === 1 ||
        child.igaBooster === 1 ||
        child.tempConsumption ||
        child.vlsaOvcFund;

      const coreEducation =
        child.educationSubsidy === 1 ||
        child.homeLearning === 1 ||
        child.nonFormalEducation === 1;

      const coreHealth =
        child.HTSReferral === 1 ||
        child.nonDisclosureSupport === 1 ||
        child.artInitiation === 1 ||
        child.artAdherenceEducation === 1 ||
        child.iac === 1 ||
        child.eMTCT === 1 ||
        child.hivPrevention === 1 ||
        child.journeysMOH ||
        child.journeysLARA ||
        child.NMNBoys ||
        child.NMNGirls ||
        child.TFHealth ||
        child.PEP ||
        child.covid19Education ||
        child.otherHealthServices;

      const coreChildProtection =
        child.VSLGBVPreventionEducationA === 1 ||
        child.TFGBV === 1 ||
        child.referral4LegalSupport === 1 ||
        child.ECD === 1 ||
        child.parenting === 1 ||
        child.childProtectionEducation === 1;

      const coreNutrition =
        child.nutritionEducation === 1 ||
        child.voucher4CropsOrKitchenGardens === 1 ||
        child.nutritionalAssessment === 1;
      const corePSS = child.psychosocialSupport === 1;

      child = {
        ...child,
        coreES: coreES ? 1 : 0,
        coreEducation: coreEducation ? 1 : 0,
        coreHealth: coreHealth ? 1 : 0,
        coreChildProtection: coreChildProtection ? 1 : 0,
        coreNutrition: coreNutrition ? 1 : 0,
        corePSS: corePSS ? 1 : 0,
      };

      if (
        child.coreES === 1 ||
        child.coreEducation === 1 ||
        child.coreHealth === 1 ||
        child.coreChildProtection === 1 ||
        child.coreNutrition === 1 ||
        child.corePSS === 1
      ) {
        child = {
          ...child,
          quarter: 1,
        };
      } else {
        child = {
          ...child,
          quarter: 0,
        };
      }

      if (child.newlyEnrolled === "Yes" && child.quarter === 1) {
        child = {
          ...child,
          OVC_SERV: 1,
        };
      } else if (child.quarter === 1) {
        child = {
          ...child,
          OVC_SERV: 1,
        };
      } else {
        child = {
          ...child,
          OVC_SERV: 0,
        };
      }

      if (age < 18 && child.ovcVL === 1 && child.OVC_SERV === 1) {
        child = {
          ...child,
          OVC_ENROL: 1,
        };
      } else if (age < 18 && child.hivStatus === "+") {
        child = {
          ...child,
          OVC_ENROL: 0,
        };
      }

      if (age < 18 && child.OVC_SERV === 1) {
        child = {
          ...child,
          OVC_SERV_SUBPOP: child.riskFactor,
        };
      }

      if (
        child.hivStatus === "+" ||
        child.hivStatus === "-" ||
        (isNotAtRisk && isNotAtRiskAdult && child.hivStatus === "DK")
      ) {
        child = {
          ...child,
          OVC_HIV_STAT: 1,
        };
      } else {
        child = {
          ...child,
          OVC_HIV_STAT: 0,
        };
      }

      return child;
    }
  );
  return instances;
};
export const useTracker = (
  program: string,
  organisationUnits: string[],
  period: any,
  page: number,
  pageSize: number
) => {
  const engine = useDataEngine();
  return useQuery<any, Error>(
    [
      "trackedEntityInstances",
      program,
      organisationUnits,
      period,
      page,
      pageSize,
    ],
    async () => {
      if (program && organisationUnits.length > 0 && period) {
        const query = {
          instances: {
            resource: "trackedEntityInstances.json",
            params: {
              fields: "*",
              ou: organisationUnits.join(";"),
              ouMode: "DESCENDANTS",
              page,
              pageSize,
              trackedEntityType: "UpbYgM3gwhn",
              totalPages: true,
            },
          },
        };
        const {
          instances: { trackedEntityInstances, pager },
        }: any = await engine.query(query);
        const { total } = pager;
        changeTotal(total);
        return await processInstances(
          engine,
          program,
          trackedEntityInstances,
          period,
          organisationUnits.join(";")
        );
      }
      changeTotal(0);
      return [];
    }
  );
};
