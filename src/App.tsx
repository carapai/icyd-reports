import { Box, Link, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";
import {
  HashRouter as Router,
  Link as RLink,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { Navigation } from "./components/Navigation";
import DataSetLayer from "./pages/DataSetLayer";
import GroupActivityLayer from "./pages/GroupActivityLayer";
import IndicatorReport from "./pages/IndicatorReport";
import OVCMISReport from "./pages/OVCMISReport";
import OVCServiceTracker from "./pages/OVCServiceTracker";
import { useLoader } from "./store/Queries";

const Links = [
  { link: "/", name: "DataSet Layering" },
  { link: "/ovc-service-tracker", name: "OVC Service Tracker" },
  { link: "/indicator-report", name: "Indicator Report" },
  { link: "/ovc-mis-report", name: "OVC-MIS Report" },
];

const NavLink = ({ children, to }: { children: ReactNode; to: string }) => (
  <Link
    px={2}
    py={1}
    as={RLink}
    to={to}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
  >
    {children}
  </Link>
);

const App = () => {
  const { isLoading, isSuccess, isError, error } = useLoader();
  return (
    <>
      {isLoading && <Box>Loading ...</Box>}
      {isSuccess && (
        <Router>
          <Navigation />
          <Switch>
            <Route path="/" exact>
              <DataSetLayer />
            </Route>
            <Route path="/ovc-service-tracker">
              <OVCServiceTracker />
            </Route>
            <Route path="/indicator-report">
              <IndicatorReport />
            </Route>
            <Route path="/ovc-mis-report">
              <OVCMISReport />
            </Route>
            <Route path="/group-activity-data-layer">
              <GroupActivityLayer />
            </Route>
            <Redirect to="/" />
          </Switch>
        </Router>
      )}
      {isError && <Box>{error?.message}</Box>}
    </>
  );
};

export default App;
