import { Column } from "./../interfaces";
export const columns: Column[] = [
  // { display: "Instance", id: "trackedEntityInstance", selected: true },
  { display: "Beneficiary ID", id: "RDEklSXCD4C.HLKc2AKR9jW", selected: true },
  {
    display: "Old Beneficiary ID",
    id: "RDEklSXCD4C.e0zEpTw7IH6",
    selected: true,
  },
  { display: "Household Code", id: "RDEklSXCD4C.tHCT4RKXoiU", selected: true },
  {
    display: "Enrollment Date",
    id: "RDEklSXCD4C.enrollmentDate",
    selected: true,
  },

  {
    display: "Type(Comprehensive, Prevention)",
    id: "RDEklSXCD4C.type",
    selected: true,
  },
  { display: "District", id: "district", selected: true },
  { display: "Sub-county", id: "subCounty", selected: true },
  { display: "Parish", id: "RDEklSXCD4C.orgUnitName", selected: true },
  { display: "Village", id: "HEWq6yr4cs5.Xkwy5P2JG24", selected: true },
  { display: "Household Head", id: "HEWq6yr4cs5.ExnzeYjgIaT", selected: true },
  {
    display: "Primary Caregiver",
    id: "primaryCareGiver",
    selected: true,
  },
  {
    display: "Date of Assessment",
    id: "HEWq6yr4cs5.sYE3K7fFM4Y.eventDate",
    selected: true,
  },
  {
    display: "Beneficiary Name",
    id: "RDEklSXCD4C.huFucxA3e5c",
    selected: true,
  },
  { display: "DOB", id: "RDEklSXCD4C.N1nMqKtYKvI", selected: true },
  { display: "Age", id: "RDEklSXCD4C.age", selected: true },
  { display: "Age Group", id: "RDEklSXCD4C.ageGroup", selected: true },
  { display: "Sex", id: "RDEklSXCD4C.CfpoFtRmK1z", selected: true },
  {
    display: "Risk Factor",
    id: "riskFactor",
    selected: true,
  },
  {
    display: "Household status",
    id: "householdStatus",
    selected: true,
  },
  { display: "Member status", id: "memberStatus", selected: true },
  {
    display: "Currently Enrolled in School (Y/N)",
    id: "enrolledInSchool",
    selected: true,
  },
  { display: "Newly enrolled", id: "newlyEnrolled", selected: true },
  { display: "HIV_Status(+,-,?, -/+)", id: "hivStatus", selected: true },
  {
    display: "OVC_TST ASSESS",
    id: "riskAssessment",
    selected: true,
  },
  {
    display: "OVC_TST RISK",
    id: "isAtRisk",
    selected: true,
  },
  {
    display: "OVC_TST REFER",
    id: "OVC_TST_REFER",
    selected: true,
  },
  {
    display: "OVC_TST REPORT",
    id: "OVC_TST_REPORT",
    selected: true,
  },
  {
    display: "HIV test not required based on  HIV risk Assessment",
    id: "isNotAtRisk",
    selected: true,
  },
  {
    display: "Unknown HIV status: other reasons",
    id: "unknown",
    selected: true,
  },
  {
    display: "Linked to HTS (referred for Testing) (1 Yes, 0 No)",
    id: "linked",
    selected: true,
  },
  {
    display: "Tested for HIV (1 Yes, 0 No)",
    id: "testedForHIV",
    selected: true,
  },
  {
    display: "Newly Reported HIV Positive (1 Yes, 0 No)",
    id: "newlyPositive",
    selected: true,
  },

  {
    display: "Newly Tested HIV Positive (1 Yes, 0 No)",
    id: "newlyTestedPositive",
    selected: true,
  },
  {
    display: "Newly Tested HIV Positive initiated on ART (1 Yes, 0 No)",
    id: "newlyTestedAndOnArt",
    selected: true,
  },
  { display: "Date of ART initiation", id: "artStartDate", selected: true },
  { display: "ART_No_HVAT", id: "RDEklSXCD4C.n7VQaJ8biOJ", selected: true },
  { display: "ART_No_VL", id: "artNo", selected: true },
  {
    display: "On_ART_HVAT (1 Yes, 0 No)",
    id: "RDEklSXCD4C.umqeJCVp4Zq",
    selected: true,
  },
  {
    display: "On_ART_VL (1 Yes, 0 No)",
    id: "onArt",
    selected: true,
  },
  {
    display: "Facility",
    id: "facility",
    selected: true,
  },
  {
    display: "OVC_VL Eligible (1 Yes, 0 No)",
    id: "ovcEligible",
    selected: true,
  },
  {
    display: "Last Viral Load Date",
    id: "lastViralLoadDate",
    selected: true,
  },
  { display: "VLTest done (1 Yes, 0 No)", id: "VLTestDone", selected: true },
  { display: "OVC_VLR (1 Yes, 0 No, Waiting )", id: "ovcVL", selected: true },
  {
    display: "Viral Load Status (Suppressed, Non Suppressed, Waiting)",
    id: "VLStatus",
    selected: true,
  },
  {
    display: "Viral Load Copies",
    id: "copies",
    selected: true,
  },
  { display: "OVC_VLS (1 Yes, 0 No))", id: "VLSuppressed", selected: true },
  { display: "VSLA", id: "VSLA", selected: true },
  { display: "Financial Literacy", id: "fLiteracy", selected: true },
  { display: "Bank Linkages", id: "bankLinkages", selected: true },
  { display: "Agribusiness", id: "agriBusiness", selected: true },
  { display: "SPM Training", id: "spmTraining", selected: true },
  { display: "Micro-Franchise", id: "micro", selected: true },
  { display: "IGA Booster", id: "igaBooster", selected: true },
  {
    display: "Temporary Consumption support",
    id: "tempConsumption",
    selected: true,
  },
  { display: "VSLA+ OVCFund", id: "vlsaOvcFund", selected: true },
  { display: "Core_ES", id: "coreES", selected: true },
  { display: "Education subsidy", id: "educationSubsidy", selected: true },
  { display: "Home Learning", id: "homeLearning", selected: true },
  { display: "NFE", id: "nonFormalEducation", selected: true },
  { display: "core_education", id: "coreEducation", selected: true },
  { display: "HTS referral", id: "HTSReferral", selected: true },
  {
    display: "Non Disclosure Support",
    id: "nonDisclosureSupport",
    selected: true,
  },
  {
    display: "Antiretroviral Therapy (ART) Initiation",
    id: "artInitiation",
    selected: true,
  },
  {
    display: "ART_Adherence_Education",
    id: "artAdherenceEducation",
    selected: true,
  },
  {
    display: "Intensive Adherence Counseling (IAC)",
    id: "iac",
    selected: true,
  },
  { display: "EMTCT", id: "eMTCT", selected: true },
  { display: "HIV prevention Education", id: "hivPrevention", selected: true },
  { display: "Journeys MOH", id: "journeysMOH", selected: true },
  { display: "Journeys LARA", id: "journeysLARA", selected: true },
  { display: "NMN (Boys)", id: "NMNBoys", selected: true },
  { display: "NMN (Girls)", id: "NMNGirls", selected: true },
  { display: "TF_Health", id: "TFHealth", selected: true },
  { display: "PEP Service", id: "PEP", selected: true },
  { display: "COVID 19 Education", id: "covid19Education", selected: true },
  {
    display: "Other Health Related Services",
    id: "otherHealthServices",
    selected: true,
  },
  { display: "core_health", id: "coreHealth", selected: true },
  {
    display: "GBV Prevention Education",
    id: "GBVPreventionEducation",
    selected: true,
  },
  { display: "TF_GBV", id: "TFGBV", selected: true },
  { display: "Legal support", id: "referral4LegalSupport", selected: true },
  { display: "ECD", id: "ECD", selected: true },
  { display: "Parenting", id: "parenting", selected: true },
  {
    display: "Child Protection Education",
    id: "childProtectionEducation",
    selected: true,
  },
  {
    display: "Core_child_protection",
    id: "coreChildProtection",
    selected: true,
  },
  { display: "Nutrition education", id: "nutritionEducation", selected: true },
  {
    display: "voucher for crops",
    id: "voucher4CropsOrKitchenGardens",
    selected: true,
  },
  {
    display: "TF_NutritionalSupport",
    id: "nutritionalAssessment",
    selected: true,
  },
  { display: "core_nutrition", id: "coreNutrition", selected: true },
  { display: "PSS", id: "psychosocialSupport", selected: true },
  { display: "core_pss", id: "corePSS", selected: true },
  {
    display: "Served in Current Reporting Quarter",
    id: "quarter",
    selected: true,
  },
  {
    display: "Served_in_Previous Quarter say Q3((1 Yes, 0 No, )",
    id: "servedInPreviousQuarter",
    selected: true,
  },
  { display: "Graduated(1 Yes, 0 No, )", id: "graduated", selected: true },
  { display: "OVC_SERV(1 Yes, 0 No, )", id: "OVC_SERV", selected: true },
  { display: "OVC_ENROL", id: "OVC_ENROL", selected: true },
  { display: "OVC_SERV_SUBPOP", id: "OVC_SERV_SUBPOP", selected: true },
  {
    display: "OVC_HIV STAT (1 Yes, 0 No, )",
    id: "OVC_HIV_STAT",
    selected: true,
  },
  {
    display: "Exited With Graduation",
    id: "exitedWithGraduation",
    selected: true,
  },
  {
    display: "Transferred to Other PEPFAR IP",
    id: "otherPERFARIP",
    selected: true,
  },
  { display: "Transferred to Other IP", id: "otherIP", selected: true },
  { display: "Para-social Worker", id: "homeVisitor", selected: true },
  {
    display: "Telephone No. of Para-social Worker",
    id: "homeVisitorContact",
    selected: true,
  },
];

export const columns2: Column[] = [
  {
    id: "event",
    display: "Event",
    selected: true,
  },
  {
    id: "ypDUCAS6juy",
    display: "Beneficiary ID",
    selected: true,
  },
  {
    id: "enrollmentDate",
    display: "Enrollment Date",
    selected: true,
  },
  {
    id: "completionDate",
    display: "Completion Date",
    selected: true,
  },
  {
    id: "Ah4eyDOBf51",
    display: "Implementing Partner",
    selected: true,
  },
  {
    id: "mWyp85xIzXR",
    display: "Group Type",
    selected: true,
  },
  {
    id: "cYDK0qZSri9",
    display: "Group Name",
    selected: true,
  },
  {
    id: "vfHaBC1ONln",
    display: "Beneficiary Name",
    selected: true,
  },
  {
    id: "ZUKC6mck81A",
    display: "Sex",
    selected: true,
  },
  {
    id: "eXWM3v3oIKu",
    display: "Age",
    selected: true,
  },
  {
    id: "district",
    display: "District",
    selected: true,
  },
  {
    id: "subCounty",
    display: "Sub-county",
    selected: true,
  },
  {
    id: "parish",
    display: "Parish",
    selected: true,
  },
  {
    id: "Gender and HIV",
    selected: true,
    bg: "red.200",
    display: "Gender and HIV",
  },
  {
    id: "Stigma and Discrimination",
    selected: true,
    bg: "red.200",
    display: "Stigma and Discrimination",
  },
  {
    id: "HIV Transmission",
    selected: true,
    bg: "red.200",
    display: "HIV Transmission",
  },
  {
    id: "Reporting of Violence and Abuse",
    selected: true,
    bg: "red.200",
    display: "Reporting of Violence and Abuse",
  },
  {
    id: "Let's decide",
    selected: true,
    bg: "red.200",
    display: "Let's decide",
  },
  {
    id: "HIV & School Related GBV risk and protection",
    selected: true,
    bg: "red.200",
    display:
      "HIV & School Related Gender Based Violence (SRGBV) risk and protection",
  },
  {
    id: "Positive bystander response to violence",
    selected: true,
    bg: "red.200",
    display: "Positive bystander response to violence",
  },
  {
    id: "Post Violence Care, treatment and support",
    selected: true,
    bg: "red.200",
    display: "Post Violence Care, treatment and support",
  },
  {
    id: "Seeking Assistance",
    selected: true,
    bg: "red.200",
    display: "Seeking Assistance",
  },
  {
    id: "Teacher to pupil Relationships",
    selected: true,
    bg: "red.200",
    display: "Teacher to pupil Relationships",
  },
  {
    id: "Resisting negative peer pressure",
    selected: true,
    bg: "red.200",
    display: "Resisting negative peer pressure",
  },
  {
    id: "The 4Cs and meaning of consents",
    selected: true,
    bg: "red.200",
    display: "The 4Cs and meaning of consents",
  },
  {
    id: "Healthy and unhealthy relationships",
    selected: true,
    bg: "red.200",
    display: "Healthy and unhealthy relationships",
  },
  {
    id: "HIV/AIDS, STI, Truth and Myths",
    selected: true,
    bg: "red.200",
    display: "HIV/AIDS, STI, Truth and Myths",
  },
  {
    id: "Power and Consent",
    selected: true,
    bg: "red.200",
    display: "Power and Consent",
  },
  {
    id: "My body image",
    selected: true,
    bg: "red.200",
    display: "My body image",
  },
  {
    id: "Pupil to pupil Relationships",
    selected: true,
    bg: "red.200",
    display: "Pupil to pupil Relationships",
  },
  {
    id: "Teenage Pregnancy",
    selected: true,
    bg: "red.200",
    display: "Teenage Pregnancy",
  },
  {
    id: "MOE Journeys Plus",
    selected: true,
    bg: "red.200",
    display: "MOE Journeys Plus sessions attended",
  },
  {
    id: "Completed MOE Journeys Plus",
    selected: true,
    bg: "red.200",
    display: "Completed MOE Journeys Plus",
  },

  {
    id: "Status",
    selected: true,
    bg: "yellow",
    display: "Status",
  },
  {
    id: "Let's decide",
    selected: true,
    bg: "yellow",
    display: "Let's decide",
  },
  {
    id: "My circle of support",
    selected: true,
    bg: "yellow",
    display: "My circle of support",
  },
  {
    id: "Respecting similarities and differences",
    selected: true,
    bg: "yellow",
    display: "Respecting similarities and differences",
  },
  {
    id: "Healthy and unhealthy relationships",
    selected: true,
    bg: "yellow",
    display: "Healthy and unhealthy relationships",
  },
  {
    id: "Child pregnancy",
    selected: true,
    bg: "yellow",
    display: "Child pregnancy",
  },
  {
    id: "Let's communicate",
    selected: true,
    bg: "yellow",
    display: "Let's communicate",
  },
  {
    id: "Community response to violence",
    selected: true,
    bg: "yellow",
    display: "Community response to violence",
  },
  {
    id: "What's important to me",
    selected: true,
    bg: "yellow",
    display: "What's important to me",
  },
  {
    id: "Our project",
    selected: true,
    bg: "yellow",
    display: "Our project",
  },
  {
    id: "Sexual Harassment",
    selected: true,
    bg: "yellow",
    display: "Sexual Harassment",
  },
  {
    id: "Positive and Negative attention",
    selected: true,
    bg: "yellow",
    display: "Positive and Negative attention",
  },
  {
    id: "How HIV and AIDs affects children",
    selected: true,
    bg: "yellow",
    display: "How HIV and AIDs affects children",
  },
  {
    id: "Facts about HIV/AIDS and other sexual transmitted infections (STIs)",
    selected: true,
    bg: "yellow",
    display:
      "Facts about HIV/AIDS and other sexual transmitted infections (STIs)",
  },
  {
    id: "The feeling game",
    selected: true,
    bg: "yellow",
    display: "The feeling game",
  },
  {
    id: "Talents, interests and personal qualities",
    selected: true,
    bg: "yellow",
    display: "Talents, interests and personal qualities",
  },
  {
    id: "My Body",
    selected: true,
    bg: "yellow",
    display: "My Body",
  },
  {
    id: "My body image",
    selected: true,
    bg: "yellow",
    display: "My body image",
  },
  {
    id: "Making friends",
    selected: true,
    bg: "yellow",
    display: "Making friends",
  },
  {
    id: "Menstruation and making reusable sanitary pads",
    selected: true,
    bg: "yellow",
    display: "Menstruation and making reusable sanitary pads",
  },
  {
    id: "Gender",
    selected: true,
    bg: "yellow",
    display: "Gender",
  },
  {
    id: "MOH Journeys curriculum",
    selected: true,
    bg: "yellow",
    display: "MOH Journeys sessions attended",
  },
  {
    id: "Completed MOH Journeys",
    selected: true,
    bg: "yellow",
    display: "Completed MOH Journeys",
  },

  //Boys
  {
    id: "Intervention",
    selected: true,
    bg: "green",
    display: "Intervention",
  },
  {
    id: "Introduction to sources of strength",
    selected: true,
    bg: "green",
    display: "Introduction to sources of strength",
  },
  {
    id: "Journey to Manhood",
    selected: true,
    bg: "green",
    display: "Journey to Manhood",
  },
  {
    id: "Cycle of force",
    selected: true,
    bg: "green",
    display: "Cycle of force",
  },
  {
    id: "Introduction to the man box",
    selected: true,
    bg: "green",
    display: "Introduction to the man box",
  },
  {
    id: "No means No sessions (Boys)",
    selected: true,
    bg: "green",
    display: "NMN Boys total sessions",
  },
  {
    id: "Completed NMN Boys",
    selected: true,
    bg: "pink",
    display: "Completed NMN Boys",
  },
  // Girls

  {
    id: "Strikes, chokes, full force",
    selected: true,
    bg: "pink",
    display: "Strikes, chokes, full force",
  },
  {
    id: "Assertive, aggressiveness passive scale and verbal skills",
    selected: true,
    bg: "pink",
    display: "Assertive, aggressiveness passive scale and verbal skills",
  },
  {
    id: "Weapons and targets",
    selected: true,
    bg: "pink",
    display: "Weapons and targets",
  },
  {
    id: "Self-defence basics and assault continuum",
    selected: true,
    bg: "pink",
    display: "Self-defence basics and assault continuum",
  },
  {
    id: "Descalation, negotiation, multiple attackers, full force drill",
    selected: true,
    bg: "pink",
    display: "Descalation, negotiation, multiple attackers, full force drill",
  },
  {
    id: "Target, test and attack (plays, awareness, intuition)",
    selected: true,
    bg: "pink",
    display: "Target, test and attack (plays, awareness, intuition)",
  },
  {
    id: "No means No sessions (Girls)",
    selected: true,
    bg: "pink",
    display: "NMN Girls sessions attended",
  },
  {
    id: "Completed NMN Girls",
    selected: true,
    bg: "pink",
    display: "Completed NMN Girls",
  },
  {
    id: "completedPrevention",
    selected: true,
    bg: "pink",
    display: "OVC_SERV PREV",
  },
];
