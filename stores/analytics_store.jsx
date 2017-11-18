// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import EventEmitter from 'events';

import store from 'stores/redux_store.jsx';

const CHANGE_EVENT = 'change';

class AnalyticsStoreClass extends EventEmitter {
    constructor() {
        super();

        this.entities = {};

        store.subscribe(() => {
            const newEntities = store.getState().entities.admin;

            const analyticsChanged = newEntities.analytics !== this.entities.analytics;
            const teamAnalyticsChanged = newEntities.teamAnalytics !== this.entities.teamAnalytics;

            if (analyticsChanged || teamAnalyticsChanged) {
                this.entities = newEntities;
                this.emitChange();
            }
        });
    }

    emitChange() {
        this.emit(CHANGE_EVENT);
    }

    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }

    getAllSystem() {
        return JSON.parse(JSON.stringify(store.getState().entities.admin.analytics));
    }

    getAllTeam(id) {
        const teamStats = store.getState().entities.admin.teamAnalytics[id];
        if (teamStats) {
            return JSON.parse(JSON.stringify(teamStats));
        }

        return {};
    }
}

var AnalyticsStore = new AnalyticsStoreClass();
export default AnalyticsStore;
