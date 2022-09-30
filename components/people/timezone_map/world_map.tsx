// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {geoPath} from 'd3';
import * as GeoJSON from 'geojson';
import React, {ReactElement} from 'react';
import * as topojson from 'topojson-client';
import {Topology} from 'topojson-specification';

import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

import timezoneTopoJson from './assets/timezones.json';
import {findTimeZone} from './util';
import './world_map.scss';

type PolygonFeature = GeoJSON.Feature<
GeoJSON.Polygon,
GeoJSON.GeoJsonProperties
>;

/**
 * Read world map polygon data.
 * @returns array of polygon data
 */
const createTimeZonePolygonFeatures = (): PolygonFeature[] => {
    // Read world map for timezones.
    // See https://github.com/evansiroky/timezone-boundary-builder
    //     https://github.com/topojson/topojson
    //
    // Somehow TS type definition does not match with the actual data, and I need to resort to
    // forceful casting.
    const tzData: Topology = timezoneTopoJson as unknown as Topology;
    const tzDataFeature = topojson.feature(tzData, tzData.objects.timezones);
    const features = (tzDataFeature as {features: PolygonFeature[]}).features;
    return features;
};

interface WorldMapProps {

    /** Time zone name selected e.g. 'Asia/Tokyo' */
    timeZoneName: string;

    /** Called when a timezone is selected. */
    onChange: (timeZoneName: string) => void;
}

const WorldMap = (props: WorldMapProps): ReactElement => {
    const pathGenerator = geoPath();
    const timeZonePolygonFeatures = React.useMemo(
        createTimeZonePolygonFeatures,
        [],
    );
    const selectedTimeZone = findTimeZone(props.timeZoneName);
    const tzPaths = timeZonePolygonFeatures.map((d: PolygonFeature) => {
        const id = `${d.properties?.id}`;

        // Time zone corresponding to the polygon.
        const timeZone = findTimeZone(id);
        let opacity;
        let stroke;
        let fill;
        if (selectedTimeZone && selectedTimeZone === timeZone) {
            opacity = 1.0;
            stroke = 'darkgrey';
            fill = 'darkgrey';
        } else if (
            selectedTimeZone &&
            timeZone &&
            selectedTimeZone.rawOffsetInMinutes === timeZone.rawOffsetInMinutes
        ) {
            opacity = 0.7;
            stroke = 'grey';
            fill = 'lightgrey';
        } else {
            opacity = 0.4;
            stroke = 'lightgrey';
            fill = 'lightgrey';
        }

        const generatedPath = pathGenerator(d) || undefined;

        const tooltip = (
            <Tooltip
                id='mapLocationTooltip'
                className='map-location-name-tooltip'
            >
                <p className='location-name'>{'Location: '}{props.timeZoneName}</p>
            </Tooltip>
        );

        return (
            <OverlayTrigger
                delayShow={100}
                placement='top'
                overlay={tooltip}
                key={id}
            >
                <path
                    id={id}
                    data-testid={id}
                    d={generatedPath}
                    opacity={opacity}
                    fill={fill}
                    strokeWidth={0.5}
                    stroke={stroke}
                />
            </OverlayTrigger>
        );
    });

    return (
        <svg
            viewBox='0 0 800 320'
            width={'100%'}
        >
            <g transform='matrix(2.3 0 0 -2 400 200)'>
                {tzPaths}
            </g>
        </svg>
    );
};

export default WorldMap;
