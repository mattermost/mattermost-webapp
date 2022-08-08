// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import NotificationFromMembersModal from './notifcation_from_members_modal';

type Props = {
    text: string;
    userIds: string[];
    messageMetadata: Record<string, string>;
}

function AtSumOfMembersMention(props: Props) {
    const [show, setShow] = useState(false);
    const closeModal = () => {
        setShow(false);
    };

    return (
        <>
            <NotificationFromMembersModal
                show={show}
                onHide={closeModal}
                userIds={['35jru68ypjd98kppystub16p3h', 'muj41o4ox78bjjok4r6teypp7w', '1cmokosaftbi5prpfj76n5jf9r']}
                feature={props.messageMetadata.requestedFeature}
            />
            <a
                onClick={() => {
                    setShow(true);
                }}
            >
                {props.text}
            </a>
        </>

    );
}

export default AtSumOfMembersMention;
