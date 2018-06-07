import RequestAction from '../../infrastructure/RequestAction';
import { ThunkExtra } from '../../store';
import arrayToMap from '../../infrastructure/arrayToMap';
import {
    STATE_KEY,
    SheriffModuleState
} from './common';
import {
    SheriffMap,
    Sheriff
} from '../../api/index';
import { SheriffProfile } from '../../api/Api';
import { LeaveModuleState } from '../leaves/common';

// Sheriff Map
class SheriffMapRequest extends RequestAction<void, SheriffMap, SheriffModuleState> {
    constructor(namespace: string = STATE_KEY, actionName: string = 'sheriffMap') {
        super(namespace, actionName);
    }
    public async doWork(request: void, { api }: ThunkExtra): Promise<SheriffMap> {
        let sheriffs = await api.getSheriffs();
        return arrayToMap(sheriffs, t => t.id);
    }
}

export const sheriffMapRequest = new SheriffMapRequest();

// Create Sheriff
class CreateSheriffRequest extends RequestAction<Partial<Sheriff>, Sheriff, SheriffModuleState> {
    constructor(namespace: string = STATE_KEY, actionName: string = 'createSheriff') {
        super(namespace, actionName);
    }
    public async doWork(sheriff: Partial<Sheriff>, { api }: ThunkExtra): Promise<Sheriff> {
        let newSheriff = await api.createSheriff(sheriff as Sheriff);
        return newSheriff;
    }

    reduceSuccess(moduleState: SheriffModuleState, action: { type: string, payload: Sheriff }): SheriffModuleState {
        // Call the super's reduce success and pull out our state and
        // the sheriffMap state
        const {
            sheriffMap: {
                data: currentMap = {},
                ...restMap
            } = {},
            ...restState
        } = super.reduceSuccess(moduleState, action);

        // Create a new map and add our sheriff to it
        const newMap = { ...currentMap };
        newMap[action.payload.id] = action.payload;

        // Merge the state back together with the original in a new object
        const newState: Partial<SheriffModuleState> = {
            ...restState,
            sheriffMap: {
                ...restMap,
                data: newMap
            }
        }
        return newState;
    }
}

export const createSheriffRequest = new CreateSheriffRequest();

class CreateSheriffProfileRequest extends 
    RequestAction<Partial<SheriffProfile>, SheriffProfile, SheriffModuleState & LeaveModuleState> {
    
    constructor(namespace: string = STATE_KEY, actionName: string = 'createSheriffProfile') {
        super(namespace, actionName);
    }
    public async doWork(sheriffProfile: Partial<SheriffProfile>, { api }: ThunkExtra): Promise<SheriffProfile> {
        let newSheriffProfile = await api.createSheriffProfile(sheriffProfile as SheriffProfile);
        return newSheriffProfile;
    }

    // tslint:disable-next-line:max-line-length
    reduceSuccess(moduleState: SheriffModuleState & LeaveModuleState, action: { type: string, payload: SheriffProfile }): SheriffModuleState {
        // Call the super's reduce success and pull out our state and
        // the sheriffMap state
        const {
            sheriffMap: {
                data: currentSheriffMap = {},
                ...restSheriffMap
            } = {},
            leaveMap: {
                data: currentLeaveMap = {},
                ...restLeaveMap
            } = {},
            ...restState
        } = super.reduceSuccess(moduleState, action);

        // Create a new map and add our sheriff to it
        const newSheriffMap = { ...currentSheriffMap };
        newSheriffMap[action.payload.sheriff.id] = action.payload.sheriff;

        // Create a new map and add the leave to it
        const newLeaveMap = { ...currentLeaveMap };
        const newLeaves = action.payload.leaves || [];
        newLeaves.forEach(nl => newLeaveMap[nl.id] = nl);

        // Merge the state back together with the original in a new object
        const newState: Partial<SheriffModuleState & LeaveModuleState> = {
            ...restState,
            sheriffMap: {
                ...restSheriffMap,
                data: newSheriffMap
            },
            leaveMap: {
                ...restLeaveMap,
                data: newLeaveMap
            }
        };
        return newState;
    }
}

export const createSheriffProfileRequest = new CreateSheriffProfileRequest();

class UpdateSheriffProfileRequest extends CreateSheriffProfileRequest {
    constructor(namespace: string = STATE_KEY, actionName: string = 'updateSheriffProfile') {
        super(namespace, actionName);
    }
    public async doWork(sheriffProfileToUpdate: SheriffProfile, { api }: ThunkExtra): Promise<SheriffProfile> {
        let updatedSheriffProfile = await api.updateSheriffProfile(sheriffProfileToUpdate);
        return updatedSheriffProfile;
    }

    // tslint:disable-next-line:max-line-length
    reduceSuccess(moduleState: SheriffModuleState, action: { type: string, payload: SheriffProfile }): SheriffModuleState {
        // Call the super's reduce success and pull out our state and
        // the sheriffMap state
        const {
            sheriffMap: {
                data: currentMap = {},
                ...restMap
            } = {},
            ...restState
        } = super.reduceSuccess(moduleState, action);

        // Create a new map and add our sheriff to it
        const newMap = { ...currentMap };
        newMap[action.payload.sheriff.id] = action.payload.sheriff;

        // Merge the state back together with the original in a new object
        const newState: Partial<SheriffModuleState> = {
            ...restState,
            sheriffMap: {
                ...restMap,
                data: newMap
            }
        };
        return newState;
    }
}

export const updateSheriffProfileRequest = new UpdateSheriffProfileRequest();

// Sheriff Edit
class UpdateSheriffRequest extends CreateSheriffRequest {
    constructor(namespace: string = STATE_KEY, actionName: string = 'updateSheriff') {
        super(namespace, actionName);
    }
    public async doWork(sheriff: Partial<Sheriff>, { api }: ThunkExtra): Promise<Sheriff> {
        let newSheriff = await api.updateSheriff(sheriff);
        return newSheriff;
    }

    reduceSuccess(moduleState: SheriffModuleState, action: { type: string, payload: Sheriff }): SheriffModuleState {
        // Call the super's reduce success and pull out our state and
        // the sheriffMap state
        const {
            sheriffMap: {
                data: currentMap = {},
                ...restMap
            } = {},
            ...restState
        } = super.reduceSuccess(moduleState, action);

        // Create a new map and add our sheriff to it
        const newMap = { ...currentMap };
        newMap[action.payload.id] = action.payload;

        // Merge the state back together with the original in a new object
        const newState: Partial<SheriffModuleState> = {
            ...restState,
            sheriffMap: {
                ...restMap,
                data: newMap
            }
        }
        return newState;
    }
}

export const updateSheriffRequest = new UpdateSheriffRequest();