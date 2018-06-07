import { RequestActionState } from '../../infrastructure/RequestAction';
import {
    Shift,
    ShiftMap
} from '../../api/Api';

export interface ShiftModuleState {
    shiftMap?: RequestActionState<ShiftMap>;
    createShift?: RequestActionState<Shift>;
    updateShift?: RequestActionState<Shift>;
    deleteShift?: RequestActionState<void>;
}

export const STATE_KEY: string = 'shifts';