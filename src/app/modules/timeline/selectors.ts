import { RootState } from '../../store';

export const visibleTime = (state: RootState): { visibleTimeStart: any, visibleTimeEnd: any } => {
    const {visibleTimeStart, visibleTimeEnd} = state.timeline;
    return {visibleTimeStart, visibleTimeEnd};
};