// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';

import store from 'stores/redux_store.jsx';

const CHANGE_EVENT = 'change';

class AnalyticsStoreClass extends EventEmitter {
    constructor() {
        super();

        this.entities = {};

        store.subscribe(() => {
            const newEntities = store.getState().entities.admin;

            const entities = this.entities;
            this.entities = newEntities;

            const analyticsChanged = newEntities.analytics !== entities.analytics;
            const teamAnalyticsChanged = newEntities.teamAnalytics !== entities.teamAnalytics;

            if (analyticsChanged || teamAnalyticsChanged) {
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
