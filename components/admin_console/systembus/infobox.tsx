// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

type Props = {
    node: any
}

export const Infobox = ({node}: Props) => {
    if (!node) {
        return null;
    }
    const orig = node.options.extras.original
    if (!orig) {
        return null;
    }
    if (orig.type === "event" || orig.type === "action") {
        return null
    }

    if (orig.type === "webhook") {
        return (
            <div className='graph-infobox'>
                <h2>Webhook info</h2>
                <div>URL: {window.location.origin}/api/v4/actions/webhook/{orig.id}</div>
                <div>Secret: {orig.secret}</div>
            </div>
        );
    } else if (orig.type === 'flow' && orig.controlType === 'if') {
        return (
            <div className='graph-infobox'>
                <h2>If info</h2>
                <div>Value: {orig.ifValue}</div>
                <div>Comparison: {orig.ifComparison}</div>
            </div>
        );
    } else if (orig.type === 'flow' && orig.controlType === 'switch') {
        return (
            <div className='graph-infobox'>
                <h2>Switch info</h2>
                <div>Cases:</div>
                <ul>
                    {orig.caseValues.map((c: string) => (<li>{c}</li>))}
                </ul>
            </div>
        );
    } else if (orig.type === 'flow' && orig.controlType === 'random') {
        return (
            <div className='graph-infobox'>
                <h2>Random info</h2>
                <div>Number of outpus: {orig.randomOptions}</div>
            </div>
        );
    } else if (orig.type === 'slash-command') {
        return (
            <div className='graph-infobox'>
                <h2>Slash Command info info</h2>
                <div>TBD</div>
            </div>
        );
    }
    return null;
};

export default Infobox;
