import { RequestActionState } from '../../infrastructure/RequestAction';
import {
    Sheriff,
    SheriffMap,
    SheriffProfile
} from '../../api/Api';

export interface SheriffModuleState {
    sheriffMap?: RequestActionState<SheriffMap>;
    createSheriff?: RequestActionState<Sheriff>;
    updateSheriff?: RequestActionState<Sheriff>;
    createSheriffProfile?: RequestActionState<SheriffProfile>;
    updateSheriffProfile?: RequestActionState<SheriffProfile>;
}

export const STATE_KEY: string = 'sheriffs';