import React from "react";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Form,
} from "react-bootstrap";


import avatar from "../../../images/users/avatar-1.jpg";
import { Head } from "@inertiajs/react";
import Layout from "../../Layouts";

const UserProfile = () => {

  return (
    <React.Fragment>
      <Head title="Profile | Velzon - React Admin & Dashboard Template" />
      <div className="page-content mt-lg-5">
        <Container fluid>
          <Row>
            <Col lg="12">

              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="mx-3">
                      <img
                        src={avatar}
                        alt=""
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div>
                    <div className="flex-grow-1 align-self-center">
                      <div className="text-muted">

                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <h4 className="card-title mb-4">Change User Name</h4>

          <Card>
            <CardBody>
              <Form
                className="form-horizontal"
              >
                <div className="form-group">
                  <Form.Label className="form-label">User Name</Form.Label>
                  <Form.Control
                    name="first_name"
                    className="form-control"
                    placeholder="Enter User Name"
                    type="text"
                  />
                  <Form.Control name="idx"
                    type="hidden" />
                </div>
                <div className="text-center mt-4">
                  <Button type="submit"className="btn-success">
                    Update User Name
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};
UserProfile.layout = (page: any) => <Layout children={page} />
export default UserProfile;
