import * as shiftRequests from './requests';
import { getShift } from './selectors';
import { 
    IdType, 
    Shift
} from '../../api';
import { ThunkAction } from '../../store';
import { 
    ShiftCreationPayload, 
    ShiftFactory 
} from '../../api/utils';

export const getShifts = shiftRequests.shiftMapRequest.actionCreator;
export const createShift = shiftRequests.createShiftRequest.actionCreator;
export const copyShiftsFromPrevWeek = shiftRequests.copyShiftsFromPrevWeek.actionCreator;
export const editMultipleShifts = shiftRequests.updateMultipleShiftsRequest.actionCreator;
export const deleteShift = shiftRequests.deleteShiftRequest.actionCreator;
export const editShift = shiftRequests.updateShiftRequest.actionCreator;

type SheriffShiftLink = { sheriffId: IdType, shiftId: IdType };
export const linkShift: ThunkAction<SheriffShiftLink> =
    ({ sheriffId, shiftId }: SheriffShiftLink) => (dispatch, getState, extra) => {
        const shift = getShift(shiftId)(getState());
        if (shift == null) {
            return;
        }

        // todo: Warn if shift is already assigned?

        dispatch(editShift({ ...shift, sheriffId }));
    };

export const unlinkShift: ThunkAction<SheriffShiftLink> =
    ({ sheriffId, shiftId }: SheriffShiftLink) => (dispatch, getState, extra) => {
        const shift = getShift(shiftId)(getState());
        if (shift == null) {
            return;
        }

        // todo: Warn if shift is already assigned?

        dispatch(editShift({ ...shift, sheriffId: undefined }));
    };

export const createShifts: ThunkAction<ShiftCreationPayload> =
    ({ weekStart, workSectionId, startTime, endTime, days, repeatNumber }: ShiftCreationPayload) => 
        (dispatch, getState, extra) => {
            
            let partialShifts: Partial<Shift>[] = 
                ShiftFactory.createShifts(
                    { 
                        weekStart, 
                        workSectionId, 
                        startTime, 
                        endTime, 
                        days, 
                        repeatNumber
                    }
                );
            
            partialShifts.forEach(shift => {
                dispatch(createShift(shift));
            });
    };