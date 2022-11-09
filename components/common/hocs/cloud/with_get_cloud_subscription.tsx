// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { ComponentType } from "react";

import {Subscription} from "@mattermost/types/cloud";
import useGetSubscription from "components/common/hooks/useGetSubscription";


interface UsedHocProps {
    subscription?: Subscription;
    isCloud: boolean;
    userIsAdmin?: boolean;
}

function withGetCloudSubscription<P>(Component: ComponentType<P>) {
    return function WrappedComponent(props: P & UsedHocProps) {
        const subscription = useGetSubscription();
        if (!subscription) {
            return null;
        }
        return <Component {...props} />;
    };
}

export default withGetCloudSubscription;
