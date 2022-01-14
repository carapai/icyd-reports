import { Tab, TabBar } from "@dhis2/ui";
import { IconFile24, IconHome24, IconList24 } from "@dhis2/ui-icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
export const Navigation = () => {
  const history = useHistory();
  const [active, setActive] = useState("/");
  const changeLink = (path: string) => {
    setActive(path);
    history.push(path);
  };

  return (
    <div>
      <TabBar>
        <Tab
          icon={<IconHome24 />}
          onClick={() => changeLink("/")}
          selected={active === "/"}
        >
          OVC SERVICE Layering Report
        </Tab>
        <Tab
          icon={<IconList24 />}
          onClick={() => changeLink("/ovc-service-tracker")}
          selected={active === "/ovc-service-tracker"}
        >
          OVC SERVICE Tracker
        </Tab>
        <Tab
          icon={<IconFile24 />}
          onClick={() => changeLink("/indicator-report")}
          selected={active === "/indicator-report"}
        >
          Indicator Report
        </Tab>
        <Tab
          icon={<IconFile24 />}
          onClick={() => changeLink("/ovc-mis-report")}
          selected={active === "/ovc-mis-report"}
        >
          OVC MIS Form 100 Report
        </Tab>
        {/* <Tab
          icon={<IconFile24 />}
          onClick={() => changeLink("/reports")}
          selected={active === "/reports"}
        >
          Know Your Child Campaign
        </Tab>
        <Tab
          icon={<IconFile24 />}
          onClick={() => changeLink("/reports")}
          selected={active === "/reports"}
        >
          Viral load Tracker
        </Tab> */}
      </TabBar>
    </div>
  );
};
