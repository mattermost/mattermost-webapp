import { css } from 'styled-components';

import { PGlobalStyles } from './globalStyles';

const getElevationOpacity = (props: PGlobalStyles): number =>
    props.theme.type === 'dark' ? 0.32 : 0.08;

const VELevation = css`
    --elevation-shadow-1: 0 2px 3px 0 rgba(0, 0, 0, ${getElevationOpacity});
    --elevation-shadow-2: 0 4px 6px 0 rgba(0, 0, 0, ${getElevationOpacity});
    --elevation-shadow-3: 0 6px 14px 0 rgba(0, 0, 0, ${getElevationOpacity});
    --elevation-shadow-4: 0 8px 24px 0 rgba(0, 0, 0, ${getElevationOpacity});
    --elevation-shadow-5: 0 12px 32px 0 rgba(0, 0, 0, ${getElevationOpacity});
    --elevation-shadow-6: 0 20px 32px 0 rgba(0, 0, 0, ${getElevationOpacity});
`;

export default VELevation;
