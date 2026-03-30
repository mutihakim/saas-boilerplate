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
      <Head title="Statistics | Velzon -  Admin & Dashboard Template" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="STATISTICS" pageTitle="Jobs" />

          <Row>
            <Widgets
            // dataColors='["--vz-success", "--vz-danger"]'
            />
          </Row>

          <Row>
            <VisitorGraph dataColors='["--vz-primary-rgb, 0.75", "--vz-secondary", "--vz-warning", "--vz-info","--vz-success", "--vz-danger"]' />
            <UsersByDevice />
          </Row>

          <Row>
            <NatworkSummary chartId="deal-type-charts" />
            <JobSummary chartId="revenue-expenses-charts" />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
Statistics.layout = (page: any) => <Layout children={page} />
export default Statistics;
