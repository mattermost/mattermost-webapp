import React from 'react';
import {trackEvent} from 'actions/telemetry_actions';

import './contact_sales.scss';

export interface Props {
    buttonTextElement: JSX.Element,
    eventID?: string
}

const ContactSales: React.FC<Props> = (props: Props) => {
    const handleContactSalesLinkClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent('admin', props.eventID || 'in_trial_contact_sales');
        window.open('https://mattermost.com/contact-us/', '_blank');
    }

    return (
        <button
            className='contact-sales'
            onClick={(e) => handleContactSalesLinkClick(e)}
        >
            {props.buttonTextElement}
        </button>
    )
};

export default ContactSales;
