// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {PreferenceType} from "mattermost-redux/types/preferences";
import './cloud_announcement_bar.scss';
import {UserProfile} from "mattermost-redux/types/users";
import { Preferences } from "utils/constants";
import classNames from 'classnames';
import { isEmpty } from 'lodash';

type Props = {
    userLimit: string;
    userIsAdmin: boolean;
    currentUser: UserProfile;
    preferences: PreferenceType[];
    isCloud: boolean;
    analytics: {
        TOTAL_USERS: string,
    };
    actions: {
        closeModal: () => void;
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        getStandardAnalytics: () => void;
    };
};

export default class CloudAnnouncementBar extends React.PureComponent<Props> {
    componentDidMount() {
        if (isEmpty(this.props.analytics)) {
            console.log("getStandardAnalytics");
            this.props.actions.getStandardAnalytics();
        }
    }

    handleButtonClick = () => {
        console.log('Upgrade');
        // Do nothing for now
    }

    handleClose = async () => {
        console.log("Close");
        await this.props.actions.savePreferences(this.props.currentUser.id, [{
            category: Preferences.CLOUD_UPGRADE_BANNER,
            user_id: this.props.currentUser.id,
            name: 'hide',
            value: 'true',
        }]);
    }

    shouldShowBanner = () => {
        const { userLimit, analytics, userIsAdmin, isCloud } = this.props;
        if (!isCloud) {
            return false;
        }

        if (!userIsAdmin) {
            return false;
        }

        if (userLimit > analytics.TOTAL_USERS) {
            return false;
        }

        // if (this.props.preferences.some((pref) => pref.name === 'hide' && pref.value === 'true')) {
        //     return false;
        // }

        return true;
    }

    render() {

        if (!this.shouldShowBanner()) {
            return null;
        }

        // If they AT user limit, and banner hidden, don't render anything
        if (this.props.userLimit === this.props.analytics.TOTAL_USERS &&
            this.props.preferences.some((pref) => pref.name === "hide" && pref.value === "true")) {
                return null;
        }


        let notDismissable = false;
        if (this.props.userLimit < this.props.analytics.TOTAL_USERS) {
            notDismissable = true;
        }

        let closeButton = null;
        if (!notDismissable) {
            closeButton = (
                <a onClick={this.handleClose} href="#" className="content__close">
                    {""}
                </a>
            );
        }
        console.log(this.props);
        console.log(notDismissable);
        return (
          <div
            className={classNames(
              "announcement-bar",
              "cloud",
              notDismissable ? "not-dismissable" : ""
            )}
          >
            <div className={"content"}>
              {notDismissable ? (
                <div className={"content__icon"}>{""}</div>
              ) : (
                <div className={"content__icon"}>{""}</div>
              )}
              <div className={"content__description"}>
                {"You've reached the user limit of the free tier"}
              </div>
              <button
                onClick={this.handleButtonClick}
                className="upgrade-button"
              >
                {"Upgrade Mattermost Cloud"}
              </button>
              {closeButton}
            </div>
          </div>
        );
    }
}
