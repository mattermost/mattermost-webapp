import React from "react";
import { Modal } from "react-bootstrap";
import { CloudLinks } from "utils/constants";

export default function AirGappedSelfHostedPurhcaseModal() {
    return (
        <Modal
            onHide={() => {}}
        >
            <Modal.Body className="testingggg">
                Hello
                {CloudLinks.SELF_HOSTED_SIGNUP}
            </Modal.Body>
        </Modal>
    )
}