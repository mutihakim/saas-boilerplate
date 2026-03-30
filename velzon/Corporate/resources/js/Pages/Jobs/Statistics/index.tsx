import React from "react";
import { Container, Row } from "react-bootstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import UsersByDevice from "../../DashboardAnalytics/UsersByDevice";
import JobSummary from "./JobSummary";
import NatworkSummary from "./NatworkSummary";
import VisitorGraph from "./VisitorGraph";
import Widgets from "./Widgets";
import { Head } from "@inertiajs/react";
import Layout from "../../../Layouts";

const Statistics = () => {

  return (
    <React.Fragment>
       <Head title = "Statistics | Velzon -  Admin & Dashboard Template"/>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="STATISTICS" pageTitle="Jobs" />

          <Row>
            <Widgets  />
          </Row>

          <Row>
            <VisitorGraph dataColors='["--vz-primary", "--vz-primary-rgb, 0.65", "--vz-secondary", "--vz-secondary-rgb, 0.75","--vz-primary-rgb, 0.4", "--vz-success"]' />
            <UsersByDevice />
          </Row>

          <Row>
            <NatworkSummary dataColors='["--vz-primary", "--vz-secondary"]' />
            <JobSummary dataColors='["--vz-success","--vz-primary", "--vz-info", "--vz-danger"]' />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
Statistics.layout = (page:any) => <Layout children={page}/>
export default Statistics;
