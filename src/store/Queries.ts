import { useDataEngine } from "@dhis2/app-runtime";
import {
  differenceInMonths,
  differenceInYears,
  isBefore,
  isWithinInterval,
  parseISO,
  subYears,
} from "date-fns";
import { every, fromPairs, groupBy, has, maxBy, sortBy, uniq } from "lodash";
import { useQuery } from "react-query";
import {
  changeTotal,
  setSelectedOrgUnits,
  setSessions,
  setUserOrgUnits,
} from "./Events";

const findAgeGroup = (age: number) => {
  if (age <= 0) {
    return "< 1";
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
const mapping: any = {
  "MOE Journeys Plus": "Completed MOE Journeys Plus",
  "MOH Journeys curriculum": "Completed MOH Journeys",
  "No means No sessions (Boys)": "Completed NMN Boys",
  "No means No sessions (Girls)": "Completed NMN Girls",
};
const mapping2: any = {
  "MOE Journeys Plus": 18,
  "MOH Journeys curriculum": 21,
  "No means No sessions (Boys)": 4,
  "No means No sessions (Girls)": 5,
  SINOVUYO: 10,
};

const hadASession = (
  allSessions: string[][],
  participantIndex: number,
  sessionNameIndex: number,
  sessionDateIndex: number,
  participant: string,
  startDate: Date,
  endDate: Date,
  sessions: string[]
) => {
  return !!allSessions.find((row: string[]) => {
    return (
      row[participantIndex] === participant &&
      sessions.indexOf(row[sessionNameIndex]) !== -1 &&
      isWithinInterval(parseISO(row[sessionDateIndex]), {
        start: startDate,
        end: endDate,
      })
    );
  });
};

const hasCompleted = (
  allSessions: string[][],
  participantIndex: number,
  sessionNameIndex: number,
  sessionDateIndex: number,
  participant: string,
  endDate: Date,
  sessions: string[],
  value: number
) => {
  const doneSessions = allSessions
    .filter((row: string[]) => {
      return (
        row[participantIndex] === participant &&
        sessions.indexOf(row[sessionNameIndex]) !== -1 &&
        parseISO(row[sessionDateIndex]).getTime() <= endDate.getTime()
      );
    })
    .map((row: string[]) => row[sessionNameIndex]);

  return doneSessions.length >= value;
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

const mostCurrentEvent = (events: any[]) => {
  return maxBy(events, "eventDate");
};

const eventsBeforePeriod = (events: any[], programStage: string, end: Date) => {
  return events.filter((e: any) => {
    return (
      e.programStage === programStage && isBefore(parseISO(e.eventDate), end)
    );
  });
};

const eventsWithinPeriod = (
  events: any[],
  programStage: string,
  start: Date,
  end: Date
) => {
  return events.filter((e: any) => {
    return (
      e.eventDate &&
      e.programStage === programStage &&
      isWithinInterval(parseISO(e.eventDate), { start, end })
    );
  });
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

const allValues4DataElement = (
  events: any[],
  dataElement: string,
  value: string
) => {
  if (events.length > 0) {
    return events.every((e: any) => e[dataElement] === value);
  }

  return true;
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
    const de = dataElements
      .map((de: string) => event[de])
      .filter((v) => v !== undefined);
    const result =
      every(de, (v) => v === value) && de.length === dataElements.length;
    return result;
  }
  return false;
};

const checkRiskAssessment = (
  event: any | undefined,
  dataElements: string[],
  value: any
) => {
  if (event) {
    const de = dataElements
      .map((de: string) => event[de])
      .filter((v) => v !== undefined);
    if (de.length === 0) {
      return 0;
    }
    if (de.length < dataElements.length) {
      if (every(de, (v) => v === value)) {
        return 3;
      }
      if (de.indexOf(value) === -1) {
        return 2;
      }
      return 1;
    }
    if (de.length === dataElements.length) {
      if (every(de, (v) => v === value)) {
        return 6;
      }
      if (de.indexOf(value) === -1) {
        return 5;
      }
      return 4;
    }
  }
  return -1;
};

const hasDataElementWithinPeriod = (
  events: any[],
  dataElement: string,
  value: string
) => {
  return !!events.find((e: any) => e[dataElement] === value);
};

const deHasAnyValue = (de: any, values: string[]) => {
  if (de && values.indexOf(de) !== -1) {
    return 1;
  }
  return 0;
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

    MOE: {
      resource: "optionGroups/HkuYbbefaEM",
      params: {
        fields: "options[code]",
      },
    },
    MOH: {
      resource: "optionGroups/P4tTIlhX1yB",
      params: {
        fields: "options[code]",
      },
    },
    Boys: {
      resource: "optionGroups/WuPXlmvSfVJ",
      params: {
        fields: "options[code]",
      },
    },
    Girls: {
      resource: "optionGroups/okgcyLQNVFe",
      params: {
        fields: "options[code]",
      },
    },
    VSLA: {
      resource: "optionGroups/XQ3eQax0uIk",
      params: {
        fields: "options[code]",
      },
    },
    VSLATOT: {
      resource: "optionGroups/qEium1Lrsc0",
      params: {
        fields: "options[code]",
      },
    },
    Financial: {
      resource: "optionGroups/LUR9gZUkcrr",
      params: {
        fields: "options[code]",
      },
    },
    SPM: {
      resource: "optionGroups/EYMKGdEeniO",
      params: {
        fields: "options[code]",
      },
    },
    BANK: {
      resource: "optionGroups/gmEcQwHbivM",
      params: {
        fields: "options[code]",
      },
    },
    SINOVUYO: {
      resource: "optionGroups/ptI9Geufl7R",
      params: {
        fields: "options[code]",
      },
    },
    ECD: {
      resource: "optionGroups/QHaULS891IF",
      params: {
        fields: "options[code]",
      },
    },
    SAVING: {
      resource: "optionGroups/ZOAmd05j2t9",
      params: {
        fields: "options[code]",
      },
    },
  };
  return useQuery<any, Error>("sqlViews", async () => {
    const {
      me: { organisationUnits },
      relationships: { relationshipTypes },
      MOE: { options },
      MOH: { options: options1 },
      Boys: { options: options2 },
      Girls: { options: options3 },
      VSLA: { options: options4 },
      VSLATOT: { options: options5 },
      Financial: { options: options6 },
      SPM: { options: options7 },
      BANK: { options: options8 },
      SINOVUYO: { options: options9 },
      ECD: { options: options10 },
      SAVING: { options: options11 },
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
    setSessions({
      "MOE Journeys Plus": options.map((o: any) => o.code),
      "MOH Journeys curriculum": options1.map((o: any) => o.code),
      "No means No sessions (Boys)": options2.map((o: any) => o.code),
      "No means No sessions (Girls)": options3.map((o: any) => o.code),
      "VSLA Methodology": options4.map((o: any) => o.code),
      "VSLA TOT": options5.map((o: any) => o.code),
      "Financial Literacy": options6.map((o: any) => o.code),
      "SPM Training": options7.map((o: any) => o.code),
      "Bank Linkages": options8.map((o: any) => o.code),
      SINOVUYO: options9.map((o: any) => o.code),
      ECD: options10.map((o: any) => o.code),
      "Saving and Borrowing": options11.map((o: any) => o.code),
    });
    return true;
  });
}

export const processPrevention = async (
  engine: any,
  trackedEntityInstances: any[],
  sessions: { [key: string]: string[] },
  period: [Date, Date]
) => {
  const orgUnits = uniq(
    trackedEntityInstances.map(({ orgUnit }: any) => orgUnit)
  );

  const {
    hierarchy: { organisationUnits: ous },
  }: any = await engine.query({
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
    ous.map((unit: any) => {
      return [
        unit.id,
        {
          subCounty: unit.parent?.name,
          district: unit.parent?.parent?.name,
        },
      ];
    })
  );

  return trackedEntityInstances.flatMap(
    ({ attributes, enrollments, orgUnit }: any) => {
      const units: any = processedUnits[orgUnit];
      const [{ events, enrollmentDate, orgUnitName }] = enrollments;
      const instance = fromPairs(
        attributes.map((a: any) => [a.attribute, a.value])
      );

      const doneSessions = events
        .filter((event: any) => {
          return (
            event.eventDate &&
            event.programStage === "VzkQBBglj3O" &&
            isWithinInterval(new Date(event.eventDate), {
              start: period[0],
              end: period[1],
            })
          );
        })
        .map(({ dataValues }: any) => {
          const code = dataValues.find(
            ({ dataElement }: any) => dataElement === "ypDUCAS6juy"
          );
          const session = dataValues.find(
            ({ dataElement }: any) => dataElement === "n20LkH4ZBF8"
          );
          return { session: session?.value, code: code?.value };
        });

      const subType: any = instance?.["mWyp85xIzXR"];
      const allSubTypes = String(subType).split(",");
      const completed = mapping[subType];
      const groupedSessions = groupBy(doneSessions, "code");
      return events
        .filter((event: any) => event.programStage === "aTZwDRoJnxj")
        .map((event: any) => {
          const elements = fromPairs(
            event.dataValues.map((dv: any) => [dv.dataElement, dv.value])
          );
          const individualCode: any = elements.ypDUCAS6juy;
          const participantSessions = groupedSessions[individualCode]?.filter(
            (i: any) => {
              return sessions[allSubTypes[0]].indexOf(i.session) !== -1;
            }
          );
          const sess = fromPairs(
            participantSessions?.map(({ session }: any) => [session, 1])
          );
          return {
            event: event.event,
            ...elements,
            ...instance,
            ...sess,
            ...units,
            parish: orgUnitName,
            enrollmentDate,
            [subType]: participantSessions?.length,
            [completed]:
              participantSessions?.length >= mapping2[subType] ? 1 : 0,
            completedPrevention:
              participantSessions?.length >= mapping2[subType] ? 1 : 0,
          };
        });
    }
  );
};

export const processInstances = async (
  engine: any,
  program: string,
  trackedEntityInstances: any[],
  period: any,
  ou: string,
  sessions: { [key: string]: string[] }
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
        program: "HEWq6yr4cs5",
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

  const householdMemberCodes = trackedEntityInstances.flatMap(
    ({ attributes }: any) => {
      const attribute = attributes.find(
        (a: any) => a.attribute === "HLKc2AKR9jW"
      );
      if (attribute) {
        return [attribute.value];
      }
      return [];
    }
  );

  const {
    sessions: { headers, rows },
  } = await engine.query({
    sessions: {
      resource: "events/query.json",
      params: {
        ou,
        ouMode: "DESCENDANTS",
        programStage: "VzkQBBglj3O",
        skipPaging: "true",
        filter: `ypDUCAS6juy:IN:${householdMemberCodes.join(";")}`,
      },
    },
  });

  const sessionNameIndex = headers.findIndex(
    (header: any) => header.name === "n20LkH4ZBF8"
  );
  const participantIndex = headers.findIndex(
    (header: any) => header.name === "ypDUCAS6juy"
  );
  const sessionDateIndex = headers.findIndex(
    (header: any) => header.name === "eventDate"
  );

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
      enrollments,
    }) => {
      const units: any = processedUnits[orgUnit];
      const [{ trackedEntityInstance: eventInstance, orgUnitName }] =
        enrollments;

      const [enrollmentDate] = enrollments
        .map((e: any) => e.enrollmentDate)
        .sort();

      const allEvents = enrollments.flatMap(({ events }: any) => {
        return events
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
      });

      const parent = indexCases.find(
        ({ trackedEntityInstance }: any) =>
          relationship?.from?.trackedEntityInstance.trackedEntityInstance ===
          trackedEntityInstance
      );

      let child: any = fromPairs(
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

      const isWithin = isWithinInterval(parseISO(enrollmentDate), {
        start: quarterStart,
        end: quarterEnd,
      });
      // One Year before quarter end

      const riskAssessmentsDuringYear = eventsWithinPeriod(
        allEvents,
        "B9EI27lmQrZ",
        subYears(quarterEnd, 1),
        quarterEnd
      );
      const referralsDuringYear = eventsWithinPeriod(
        allEvents,
        "yz3zh5IFEZm",
        subYears(quarterEnd, 1),
        quarterEnd
      );

      // During Quarter

      const referralsDuringQuarter = eventsWithinPeriod(
        allEvents,
        "yz3zh5IFEZm",
        quarterStart,
        quarterEnd
      );

      const homeVisitsDuringQuarter = eventsWithinPeriod(
        allEvents,
        "HaaSLv2ur0l",
        quarterStart,
        quarterEnd
      );
      const viralLoadDuringQuarter = eventsWithinPeriod(
        allEvents,
        "kKlAyGUnCML",
        quarterStart,
        quarterEnd
      );

      const serviceProvisionDuringQuarter = eventsWithinPeriod(
        allEvents,
        "yz3zh5IFEZm",
        quarterStart,
        quarterEnd
      );
      const serviceLinkagesDuringQuarter = eventsWithinPeriod(
        allEvents,
        "SxnXrDtSJZp",
        quarterStart,
        quarterEnd
      );

      // Before or during quarter starts

      const referralsBe4Quarter = eventsBeforePeriod(
        allEvents,
        "yz3zh5IFEZm",
        quarterEnd
      );

      const previousReferrals = eventsBeforePeriod(
        allEvents,
        "yz3zh5IFEZm",
        quarterStart
      );

      const previousViralLoads = eventsBeforePeriod(
        allEvents,
        "yz3zh5IFEZm",
        quarterStart
      );

      const homeVisitsBe4Quarter = eventsBeforePeriod(
        allEvents,
        "HaaSLv2ur0l",
        quarterEnd
      );
      const viralLoadsBe4Quarter = eventsBeforePeriod(
        allEvents,
        "kKlAyGUnCML",
        quarterEnd
      );

      const currentRiskAssessment = mostCurrentEvent(riskAssessmentsDuringYear);
      const currentReferral = mostCurrentEvent(referralsDuringYear);
      const referralThisQuarter = mostCurrentEvent(referralsDuringQuarter);
      const anyViralLoad = mostCurrentEvent(viralLoadsBe4Quarter);
      const hivResult = specificDataElement(currentReferral, "XTdRWh5MqPw");

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
      } else if (hivResult) {
        child = {
          ...child,
          hivStatus:
            hivResult === "Positive"
              ? "+"
              : hivResult === "Negative"
              ? "-"
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

      const isNotAtRiskAdult = checkRiskAssessment(
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

      const atTBRiskChild = checkRiskAssessment(
        currentRiskAssessment,
        ["DgCXKSDPTWn", "Rs5qrKay7Gq", "QEm2B8LZtzd", "X9n17I5Ibdf"],
        "true"
      );
      const atTBRiskAdult = checkRiskAssessment(
        currentRiskAssessment,
        ["If8hDeux5XE", "ha2nnIeFgbu", "NMtrXN3NBqY"],
        "true"
      );

      const isNotAtRisk = checkRiskAssessment(
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
      const serviceProvided = specificDataElement(
        currentReferral,
        "XWudTD2LTUQ"
      );
      const serviceProvidedThisQuarter = specificDataElement(
        referralsDuringYear,
        "XWudTD2LTUQ"
      );
      const serviceProvidedThisYear = specificDataElement(
        referralThisQuarter,
        "XWudTD2LTUQ"
      );
      const unknownOther = findAnyEventValue(
        riskAssessmentsDuringYear,
        "cTV8aMqnVbe"
      );

      child = {
        ...child,
        linked: deHasAnyValue(serviceProvidedThisQuarter, [
          "Started HIV treatment",
          "PEP",
          "HCT/ Tested for HIV",
          "Intensive Adherence Counseling (IAC)",
          "Viral Load Testing",
          "Provided with ARVs",
        ]),
      };

      if (serviceProvidedThisQuarter === "HCT/ Tested for HIV") {
        child = { ...child, testedForHIV: 1 };
      } else {
        child = { ...child, testedForHIV: 0 };
      }

      if (child["RDEklSXCD4C.nDUbdM2FjyP"] === "Primary caregiver") {
        child = { ...child, primaryCareGiver: "1" };
      } else {
        child = { ...child, primaryCareGiver: "0" };
      }
      const ageGroup: any = child["RDEklSXCD4C.N1nMqKtYKvI"];
      const hVatDate: any = child["HEWq6yr4cs5.enrollmentDate"];
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
        riskAssessmentsDuringYear.length > 0
      ) {
        child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.vBqh2aiuHOV`]: 1 };
      } else {
        child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.vBqh2aiuHOV`]: 0 };
      }

      if (serviceProvided && serviceProvided === "HCT/ Tested for HIV") {
        child = { ...child, OVC_TST_REFER: 1 };
      } else {
        child = { ...child, OVC_TST_REFER: 0 };
      }
      if (hivResult && child.OVC_TST_REFER === 1) {
        child = { ...child, OVC_TST_REPORT: 1 };
      } else {
        child = { ...child, OVC_TST_REPORT: 0 };
      }

      // if (age < 18 && testedForHIV) {
      //   child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.testedForHIV`]: 1 };
      // } else {
      //   child = { ...child, [`RDEklSXCD4C.B9EI27lmQrZ.testedForHIV`]: 0 };
      // }

      if (child.hivStatus === "+" && age < 18) {
        child = {
          ...child,
          riskFactor: "CLHIV",
        };
      } else {
        child = {
          ...child,
          riskFactor:
            findAnyEventValue(homeVisitsBe4Quarter, "rQBaynepqjy") ||
            child[`RDEklSXCD4C.nDUbdM2FjyP`],
        };
      }

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

      // const hivStatusReferral = findAnyEventValue(
      //   referralsBe4Quarter,
      //   "PpUByWk3p8N"
      // );
      // const hivStatusRiskAssessment = findAnyEventValue(
      //   riskAssessmentsBe4Quarter,
      //   "vBqh2aiuHOV"
      // );
      // const hivStatusVL = findAnyEventValue(
      //   viralLoadsBe4Quarter,
      //   "PpUByWk3p8N"
      // );
      const homeVisitor = findAnyEventValue(
        homeVisitsBe4Quarter,
        "i6XGAmzx3Ri"
      );
      const homeVisitorContact = findAnyEventValue(
        homeVisitsBe4Quarter,
        "BMzryoryhtX"
      );

      child = {
        ...child,
        homeVisitor,
        onArt: "",
        facility: "",
        artNo: "",
        homeVisitorContact,
      };

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
          } else if (!!lastViralLoadDate) {
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
        } else if (!!lastViralLoadDate) {
          child = {
            ...child,
            ovcEligible: 1,
          };
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
      child = {
        ...child,
        VSLA: hadASession(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterStart,
          quarterEnd,
          [
            ...sessions["VSLA Methodology"],
            ...sessions["VSLA TOT"],
            ...sessions["Saving and Borrowing"],
          ]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        fLiteracy:
          hadASession(
            rows,
            participantIndex,
            sessionNameIndex,
            sessionDateIndex,
            child["RDEklSXCD4C.HLKc2AKR9jW"],
            quarterStart,
            quarterEnd,
            sessions["Financial Literacy"]
          ) ||
          (anyEventWithDE(homeVisitsDuringQuarter, "PBiFAeCVnot") &&
            age >= 10) ||
          ((anyEventWithDE(homeVisitsDuringQuarter, "Xlw16qiDxqk") ||
            anyEventWithDE(homeVisitsDuringQuarter, "rOTbGzSfKbs")) &&
            age >= 15)
            ? 1
            : 0,
      };
      child = {
        ...child,
        [`bankLinkages`]:
          anyEventWithAnyOfTheValue(
            serviceLinkagesDuringQuarter,
            "NxQ4EZUB0fr",
            [
              "F1. Access credit services",
              "F2. Access saving services",
              "F3. Insurance services/ Health Fund",
            ]
          ) ||
          hadASession(
            rows,
            participantIndex,
            sessionNameIndex,
            sessionDateIndex,
            child["RDEklSXCD4C.HLKc2AKR9jW"],
            quarterStart,
            quarterEnd,
            sessions["Bank Linkages"]
          )
            ? 1
            : 0,
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
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        spmTraining: hadASession(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterStart,
          quarterEnd,
          sessions["SPM Training"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        micro: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["B1. Access to credit services", "B2. Access to saving services"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        igaBooster: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["O3. IGA Booster"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        tempConsumption:
          anyEventWithAnyOfTheValue(
            serviceLinkagesDuringQuarter,
            "NxQ4EZUB0fr",
            ["UF12 Temporary Food Support"]
          ) ||
          anyEventWithAnyOfTheValue(referralsDuringQuarter, "XWudTD2LTUQ", [
            "Temporary Food Support",
          ])
            ? 1
            : 0,
      };
      child = {
        ...child,
        vlsaOvcFund: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["UF3 VSLA OVC protection Fund"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        educationFund: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["UF09 OVC VSLA Education Fund"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        heathFund: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["UF10 OVC VSLA Health Fund"]
        )
          ? 1
          : 0,
      };

      child = {
        ...child,
        educationSubsidy:
          anyEventWithAnyOfTheValue(
            serviceLinkagesDuringQuarter,
            "NxQ4EZUB0fr",
            ["O1. Education subsidy"]
          ) ||
          anyEventWithAnyOfTheValue(referralsDuringQuarter, "XWudTD2LTUQ", [
            "Educational support",
          ])
            ? 1
            : 0,
      };
      child = {
        ...child,
        homeLearning: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["Home Learning"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        nonFormalEducation:
          anyEventWithAnyOfTheValue(
            serviceLinkagesDuringQuarter,
            "NxQ4EZUB0fr",
            ["O2. None Formal Education"]
          ) ||
          anyEventWithAnyOfTheValue(referralsDuringQuarter, "XWudTD2LTUQ", [
            "Vocational/Apprenticeship",
          ])
            ? 1
            : 0,
      };

      child = {
        ...child,
        educationInformation:
          (anyEventWithDE(homeVisitsDuringQuarter, "sTyaaJxvR5S") ||
            anyEventWithDE(homeVisitsDuringQuarter, "oyQActIi370") ||
            anyEventWithDE(homeVisitsDuringQuarter, "P7nd91Mkhol") ||
            anyEventWithDE(homeVisitsDuringQuarter, "leNiACgoBcL")) &&
          age >= 6
            ? 1
            : 0,
      };
      if (
        deHasAnyValue(serviceProvidedThisQuarter, [
          "Started HIV treatment",
          "PEP",
          "HCT/ Tested for HIV",
          "Intensive Adherence Counseling (IAC)",
          "Viral Load Testing",
          "Provided with ARVs",
        ]) === 1 ||
        anyEventWithAnyOfTheValue(serviceLinkagesDuringQuarter, "HzDRzHCuzdf", [
          "HTS",
        ])
      ) {
        child = { ...child, HTSReferral: 1 };
      } else {
        child = { ...child, HTSReferral: 0 };
      }

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
        artInitiation: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Initiated on HIV Treatment"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        homeDrugDelivery: deHasAnyValue(serviceProvidedThisQuarter, [
          "Home drug delivery",
        ]),
      };
      child = {
        ...child,
        artAdherenceEducation:
          anyEventWithDE(homeVisitsDuringQuarter, "NxhBKqINsZY") ||
          anyEventWithDE(homeVisitsDuringQuarter, "svrj6VtHjay") ||
          anyEventWithDE(homeVisitsDuringQuarter, "NJZ13SXf8XV")
            ? 1
            : 0,
      };
      child = {
        ...child,
        iac:
          anyEventWithDataElement(
            viralLoadDuringQuarter,
            "iHdNYfm1qlz",
            "true"
          ) ||
          anyEventWithAnyOfTheValue(referralsDuringQuarter, "XWudTD2LTUQ", [
            "Intensive Adherence Counseling (IAC)",
          ])
            ? 1
            : 0,
      };
      child = {
        ...child,
        eMTCT:
          anyEventWithDE(homeVisitsDuringQuarter, "SrEP2vZtMHV") ||
          anyEventWithDE(homeVisitsDuringQuarter, "ffxCn2msT1R") ||
          anyEventWithAnyOfTheValue(referralsDuringQuarter, "XWudTD2LTUQ", [
            "EMTCT",
          ])
            ? 1
            : 0,
      };
      child = {
        ...child,
        hivPrevention: anyEventWithDE(homeVisitsDuringQuarter, "xXqKqvuwA8m")
          ? 1
          : 0,
      };
      child = {
        ...child,
        journeysMOH: hasCompleted(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterEnd,
          sessions["MOH Journeys curriculum"],
          mapping2["MOH Journeys curriculum"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        journeysLARA: hasCompleted(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterEnd,
          sessions["MOE Journeys Plus"],
          mapping2["MOE Journeys Plus"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        NMNBoys: hasCompleted(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterEnd,
          sessions["No means No sessions (Boys)"],
          mapping2["No means No sessions (Boys)"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        NMNGirls: hasCompleted(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterEnd,
          sessions["No means No sessions (Girls)"],
          mapping2["No means No sessions (Girls)"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        TFHealth: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["Transport to Facility"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        PEP: anyEventWithAnyOfTheValue(
          serviceProvisionDuringQuarter,
          "XWudTD2LTUQ",
          ["PEP"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        covid19Education: anyEventWithDE(homeVisitsDuringQuarter, "RtQudbqa6XH")
          ? 1
          : 0,
      };

      child = {
        ...child,
        immunization: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Immunisation"]
        )
          ? 1
          : 0,
      };

      child = {
        ...child,
        wash:
          anyEventWithDE(homeVisitsDuringQuarter, "eEZu3v92pJZ") ||
          anyEventWithAnyOfTheValue(referralsDuringQuarter, "XWudTD2LTUQ", [
            "WASH",
          ])
            ? 1
            : 0,
      };
      child = {
        ...child,
        treatedNets: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Insecticide Treated Nets"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        familyPlanning: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Family planning services"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        tested4TB: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Tested for TB"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        initiatedOnTB: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Initiated on TB Treatment"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        supported2CompleteTBDose: anyEventWithAnyOfTheValue(
          referralsDuringQuarter,
          "XWudTD2LTUQ",
          ["Supported to Complete TB Dose"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        viralLoadBleeding:
          anyEventWithAnyOfTheValue(referralsDuringQuarter, "XWudTD2LTUQ", [
            "Viral Load Testing",
          ]) ||
          anyEventWithAnyOfTheValue(
            serviceLinkagesDuringQuarter,
            "NxQ4EZUB0fr",
            ["HTS7. Viral load test"]
          )
            ? 1
            : 0,
      };
      child = {
        ...child,
        returnedToCare: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["PLHIV Returned to care"]
        )
          ? 1
          : 0,
      };

      child = {
        ...child,
        otherHealthServices:
          anyEventWithDE(homeVisitsDuringQuarter, "eEZu3v92pJZ") ||
          // anyEventWithDE(homeVisitsDuringQuarter, "C41UbAJDeqG") ||
          anyEventWithDE(homeVisitsDuringQuarter, "D7rrGXWwjGn") ||
          anyEventWithDE(homeVisitsDuringQuarter, "CnfRJ2y4Lg8")
            ? 1
            : 0,
      };
      child = {
        ...child,
        tbScreening: atTBRiskChild >= 4 || atTBRiskAdult >= 4 ? 1 : 0,
      };

      child = {
        ...child,
        atRiskOfTB: atTBRiskChild >= 5 || atTBRiskAdult >= 5 ? 1 : 0,
      };

      child = {
        ...child,
        GBVPreventionEducation:
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
        TFGBV:
          anyEventWithDataElement(
            referralsDuringQuarter,
            "XWudTD2LTUQ",
            "Transport GBV"
          ) ||
          anyEventWithDataElement(
            serviceLinkagesDuringQuarter,
            "NxQ4EZUB0fr",
            "Transport GBV"
          )
            ? 1
            : 0,
      };
      child = {
        ...child,
        referral4LegalSupport: anyEventWithDataElement(
          referralsDuringQuarter,
          "EDa2GQUCbsx",
          "Legal Support"
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        ECD: hadASession(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterStart,
          quarterEnd,
          sessions["ECD"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        parenting: hasCompleted(
          rows,
          participantIndex,
          sessionNameIndex,
          sessionDateIndex,
          child["RDEklSXCD4C.HLKc2AKR9jW"],
          quarterEnd,
          sessions["SINOVUYO"],
          mapping2["SINOVUYO"]
        )
          ? 1
          : 0,
      };
      child = {
        ...child,
        childProtectionEducation:
          anyEventWithDE(homeVisitsDuringQuarter, "cgnfO3xqaYb") ||
          anyEventWithDE(homeVisitsDuringQuarter, "bJPqgTbbt8g") ||
          anyEventWithDE(homeVisitsDuringQuarter, "UlQEavBni01") ||
          anyEventWithDE(homeVisitsDuringQuarter, "v6zHvL8w9ex")
            ? 1
            : 0,
      };

      child = {
        ...child,
        nutritionEducation:
          anyEventWithDE(homeVisitsDuringQuarter, "FGs1bkmfoTX") ||
          anyEventWithDE(homeVisitsDuringQuarter, "BDVZPgVPVww") ||
          anyEventWithDE(homeVisitsDuringQuarter, "p9EaFSIg3ht") ||
          anyEventWithDE(homeVisitsDuringQuarter, "Eg1yxmjMfG7")
            ? 1
            : 0,
      };
      child = {
        ...child,
        nutritionalFoodSupplement: deHasAnyValue(serviceProvidedThisQuarter, [
          "Food supplement",
        ]),
      };
      child = {
        ...child,
        nutritionalAssessment: deHasAnyValue(serviceProvidedThisQuarter, [
          "Nutritional assessment",
        ]),
      };
      child = {
        ...child,
        voucher4CropsOrKitchenGardens: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["A1. Input Markets through voucher", "M3 Input Vouchers"]
        )
          ? 1
          : 0,
      };

      child = {
        ...child,
        kitchenGarden: anyEventWithAnyOfTheValue(
          serviceLinkagesDuringQuarter,
          "NxQ4EZUB0fr",
          ["A2. input such as seeds and poultry"]
        )
          ? 1
          : 0,
      };

      child = {
        ...child,
        psychosocialSupport:
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
        child.nonFormalEducation === 1 ||
        child.educationInformation === 1 ||
        child.educationFund === 1;
      const coreHealth =
        child.HTSReferral === 1 ||
        child.nonDisclosureSupport === 1 ||
        child.artInitiation === 1 ||
        child.artAdherenceEducation === 1 ||
        child.iac === 1 ||
        child.eMTCT === 1 ||
        child.hivPrevention === 1 ||
        child.journeysMOH === 1 ||
        child.journeysLARA === 1 ||
        child.NMNBoys === 1 ||
        child.NMNGirls === 1 ||
        child.TFHealth === 1 ||
        child.PEP === 1 ||
        child.covid19Education === 1 ||
        child.otherHealthServices === 1 ||
        child.homeDrugDelivery === 1 ||
        child.tested4TB ||
        child.initiatedOnTB ||
        child.wash ||
        child.treatedNets ||
        child.familyPlanning ||
        child.healthFund ||
        child.TFHealth ||
        child.supported2CompleteTBDose ||
        child.immunization;

      const coreChildProtection =
        child.GBVPreventionEducation === 1 ||
        child.TFGBV === 1 ||
        child.referral4LegalSupport === 1 ||
        child.ECD === 1 ||
        child.parenting === 1 ||
        child.childProtectionEducation === 1;

      const coreNutrition =
        child.nutritionEducation === 1 ||
        child.voucher4CropsOrKitchenGardens === 1 ||
        child.nutritionalAssessment === 1 ||
        child.kitchenGarden === 1 ||
        child.nutritionalFoodSupplement === 1;
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
        ([0, 3, 6].indexOf(isNotAtRisk) !== -1 &&
          [0, 3, 6].indexOf(isNotAtRiskAdult) !== -1 &&
          child.hivStatus === "DK")
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
      if (riskAssessmentsDuringYear.length > 0 && child.hivStatus !== "+") {
        child = { ...child, riskAssessment: 1 };
      } else if (child.hivStatus === "+") {
        child = { ...child, riskAssessment: "" };
        child = { ...child, isAtRisk: "" };
      } else {
        child = { ...child, riskAssessment: 0 };
        child = { ...child, isAtRisk: 0 };
      }
      if (child.riskAssessment === 1) {
        if (age < 18 && [0, 3, 6].indexOf(isNotAtRisk) !== -1) {
          child = { ...child, isAtRisk: 0 };
        } else if (age >= 18 && [0, 3, 6].indexOf(isNotAtRiskAdult) !== -1) {
          child = { ...child, isAtRisk: 0 };
        } else if (
          [0, 3, 6].indexOf(isNotAtRiskAdult) === -1 ||
          [0, 3, 6].indexOf(isNotAtRisk) === -1
        ) {
          child = { ...child, isAtRisk: 1 };
        }
      }

      if (child.hivStatus !== "+") {
        if (
          [0, 3, 6].indexOf(isNotAtRiskAdult) !== -1 ||
          [0, 3, 6].indexOf(isNotAtRisk) !== -1
        ) {
          child = { ...child, isNotAtRisk: 1 };
        } else {
          child = { ...child, isNotAtRisk: 0 };
        }
      }

      if (
        child.hivStatus !== "+" &&
        child.hivStatus !== "-" &&
        child.isNotAtRisk !== 1
      ) {
        if (!!unknownOther) {
          child = {
            ...child,
            unknown: unknownOther,
          };
        } else {
          child = { ...child, unknown: "Other reasons" };
        }
      } else if (
        child.hivStatus === "+" ||
        child.hivStatus === "-" ||
        child.isNotAtRisk === 1
      ) {
        child = { ...child, unknown: "" };
      }

      if (child.newlyEnrolled === "Yes" && child.hivStatus === "+") {
        child = { ...child, newlyPositive: 1 };
      } else if (child.hivStatus === "+") {
        if (
          child["RDEklSXCD4C.HzUL8LTDPga"] === "Negative" &&
          previousViralLoads.length === 0 &&
          allValues4DataElement(previousReferrals, "XTdRWh5MqPw", "Negative")
        ) {
          child = { ...child, newlyPositive: 1 };
        } else {
          child = { ...child, newlyPositive: 0 };
        }
      }

      if (
        child.newlyPositive &&
        !!artStartDate &&
        isWithinInterval(parseISO(artStartDate), {
          start: subYears(quarterEnd, 1),
          end: quarterEnd,
        })
      ) {
        child = { ...child, newlyTestedPositive: 1 };
      } else if (
        child.newlyPositive &&
        hasDataElementWithinPeriod(
          referralsDuringYear,
          "XTdRWh5MqPw",
          "Positive"
        )
      ) {
        child = { ...child, newlyTestedPositive: 1 };
      } else if (child.hivStatus === "+") {
        child = { ...child, newlyTestedPositive: 0 };
      }
      const currentArtStartDate = anyViralLoad?.["epmIBD8gh7G"];

      child = {
        ...child,
        artStartDate: currentArtStartDate,
      };

      if (
        child.newlyTestedPositive &&
        currentArtStartDate &&
        child.onArt &&
        isWithinInterval(parseISO(currentArtStartDate), {
          start: subYears(quarterEnd, 1),
          end: quarterEnd,
        })
      ) {
        child = {
          ...child,
          newlyTestedAndOnArt: 1,
        };
      } else if (serviceProvidedThisQuarter === "Started HIV treatment") {
        child = { ...child, newlyTestedAndOnArt: 1 };
      }
      return child;
    }
  );
  return instances;
};

export const useProgramStage = (
  organisationUnits: string[],
  period: [Date, Date],
  sessions: { [key: string]: string[] },
  page: number,
  pageSize: number
) => {
  const engine = useDataEngine();
  return useQuery<any, Error>(
    ["trackedEntityInstances", ...organisationUnits, ...period, page, pageSize],
    async () => {
      if (organisationUnits.length > 0) {
        const query = {
          instances: {
            resource: "trackedEntityInstances.json",
            params: {
              fields: "*",
              ou: organisationUnits.join(";"),
              ouMode: "DESCENDANTS",
              filter: `mWyp85xIzXR:IN:${[
                "MOE Journeys Plus",
                "MOH Journeys curriculum",
                "No means No sessions (Boys)",
                "No means No sessions (Girls)",
              ].join(";")}`,
              page,
              pageSize,
              program: "IXxHJADVCkb",
              totalPages: true,
            },
          },
        };
        const {
          instances: { trackedEntityInstances, pager },
        }: any = await engine.query(query);
        const { total } = pager;
        changeTotal(total);
        return await processPrevention(
          engine,
          trackedEntityInstances,
          sessions,
          period
        );
      }
      changeTotal(0);
      return [];
    }
  );
};
export const useTracker = (
  program: string,
  organisationUnits: string[],
  sessions: { [a: string]: string[] },
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
              filter: `HLKc2AKR9jW:NE:""`,
              page,
              pageSize,
              program: "RDEklSXCD4C",
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
          trackedEntityInstances.filter(
            (instance: any) =>
              instance.inactive === false && instance.deleted === false
          ),
          period,
          organisationUnits.join(";"),
          sessions
        );
      }
      changeTotal(0);
      return [];
    }
  );
};
