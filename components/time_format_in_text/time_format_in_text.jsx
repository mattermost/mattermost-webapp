import React from "react";
import moment from "moment";
import OverlayTrigger from "components/overlay_trigger";

import { Tooltip } from "react-bootstrap";

import "./time_format_in_text.scss";

export default class TimeFormatInText extends React.Component {
    render() {
        const postUserTimeZone = this.props.postUserTimeZone.manualTimezone
        const userTimeZone = this.props.userTimeZone.manualTimezone;
        const parseHoursMinutes = this.props.originalTime.split(":");
        const originalTimeInMoment = moment("2020-01-01").set({
            hour: parseHoursMinutes[0],
            minute: parseHoursMinutes[1],
        });
        const originalTimeInISO = originalTimeInMoment.toISOString();

        const userTime = originalTimeInMoment.tz(userTimeZone).format("HH:ss");
        console.log(originalTimeInMoment.toISOString(), "<>");

        if(this.props.isSelfPost){
            return <span>{this.props.originalTime}</span>
        }

        return (
            <span className="timeFormatInText">
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip>
                            Converted from {this.props.originalTime}{" "}
                            {postUserTimeZone}
                        </Tooltip>
                    }
                >
                    <span>
                        {userTime} {userTimeZone}
                    </span>
                </OverlayTrigger>
            </span>
        );
    }
}
