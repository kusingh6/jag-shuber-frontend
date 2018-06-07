import * as ShuberApi from 'jag-shuber-api';
import * as moment from 'moment';
import {
    API,
    AlternateAssignment,
    Assignment,
    AssignmentDuty,
    AssignmentDutyDetails,
    CourtAssignment,
    Courthouse,
    Courtroom,
    DateType,
    EscortAssignment,
    IdType,
    JailAssignment,
    JailRole,
    Leave,
    OtherAssignment,
    Run,
    Sheriff,
    SheriffDuty,
    Shift,
    ShiftCopyOptions,
    WorkSectionCode,
    ShiftUpdates,
    SheriffRank,
    DateRange,
    SheriffProfile
} from './Api';
import MockApi from './Mock/MockApi';
import { SubmissionError } from 'redux-form';
// import { isCourtAssignment, isEscortAssignment, isJailAssignment, isOtherAssignment } from './utils';

export function extractWorksectionCode(workSectionCodePath: string): WorkSectionCode {
    const code = `${workSectionCodePath}`.split('/').slice(-1)[0] as any;
    return code !== '' ? code : 'OTHER';
}

export function toWorkSectionCodePath(workSectionCode: WorkSectionCode = 'OTHER'): string {
    return `/workSectionCodes/${workSectionCode}`;
}

class ShuberApiClient extends ShuberApi.Client {

    constructor(baseUrl: string) {
        super(baseUrl);
    }

    protected processError(err: any) {
        // If we've got a validation error, we likely submitted a form
        // so return a SubmissionError for the sake of redux forms
        if (ShuberApi.Client.isValidationError(err)) {
            const fields = err.response.body.fields || {};
            const fieldKeys = Object.keys(fields);
            if (fieldKeys.length > 0) {
                const fieldErrors = {
                    _error: 'Submission Error'
                };
                fieldKeys.forEach(fieldKey => {
                    const fieldName = fieldKey.replace('model.', '');
                    fieldErrors[fieldName] = fields[fieldKey].message;
                });
                return new SubmissionError(fieldErrors);
            } else {
                return new SubmissionError({
                    _error: 'General Validation Error: todo, extract better error message from response'
                });
            }
        }

        // Otherwise just return the error
        return super.processError(err);
    }

}

export default class Client implements API {
    
    private _client: ShuberApi.Client;
    private _courthouseId: string;
    private _mockApi: MockApi;

    constructor(baseUrl: string = '/') {
        this._client = new ShuberApiClient(baseUrl);
        this._client.requestInterceptor = (req) => {
            req.set('TOKEN', 'TESTING');
            return req;
        };
        this._mockApi = new MockApi();
    }

    get isCourthouseSet() {
        return this._courthouseId != undefined;
    }

    setCurrentCourthouse(id: IdType) {
        this._courthouseId = id;
    }

    get currentCourthouse(): string {
        return this._courthouseId;
    }

    async getSheriffs(): Promise<Sheriff[]> {
        const sheriffList = (await this._client.GetSheriffs(this.currentCourthouse) as Sheriff[]);
        return sheriffList;
    }

     async createSheriffProfile(newSheriffProfile: SheriffProfile): Promise<SheriffProfile> {
        const {sheriff} = newSheriffProfile;
        const newSheriff = await this.createSheriff(sheriff);
        return {sheriff: newSheriff, leaves: []};
        // const newLeaves = Promise.all(
        //         leaves.map(l => ({...l, sheriffId: newSheriff.id}))
        //         .map(leave => this._client.createLeave(leave) as Promise<Leave>));

    }

    async createSheriff(newSheriff: Sheriff): Promise<Sheriff> {
        const {
            homeCourthouseId = this.currentCourthouse,
            rankCode = 'DEPUTYSHERIFF'
        } = newSheriff;
        const sheriff = await this._client.CreateSheriff({
            ...newSheriff,
            homeCourthouseId,
            rankCode
        });
        return sheriff as Sheriff;
    }
    async updateSheriff(sheriffToUpdate: Partial<Sheriff>): Promise<Sheriff> {
        const { id } = sheriffToUpdate;
        if (!id) {
            throw 'Sheriff to Update has no id';
        }
        return await this._client.UpdateSheriff(id, sheriffToUpdate) as Sheriff;
    }

    async getAssignments(dateRange: DateRange = {}): Promise<(CourtAssignment | JailAssignment | EscortAssignment | OtherAssignment)[]> {
        const { startDate, endDate } = dateRange;
        const list = await this._client.GetAssignments(this.currentCourthouse, startDate, endDate);
        return list as Assignment[];
    }
    async createAssignment(assignment: Partial<Assignment>): Promise<Assignment> {
        const assignmentToCreate: any = {
            ...assignment,
            courthouseId: this.currentCourthouse
        };
        const created = await this._client.CreateAssignment(assignmentToCreate);
        return created as Assignment;
    }

    async deleteDutyRecurrence(recurrenceId: string): Promise<void> {
        if (recurrenceId === undefined) {
            return;
        }

        await this._client.ExpireDutyRecurrence(recurrenceId);
    }

    async updateAssignment(assignment: Partial<Assignment>): Promise<Assignment> {
        const { id } = assignment;
        if (!id) {
            throw 'Assignment to Update has no id';
        }
        const updated = await this._client.UpdateAssignment(id, assignment as any);
        return updated as Assignment;
    }

    async deleteAssignment(assignmentId: IdType): Promise<void> {
        if (assignmentId === undefined) {
            return;
        }
        await this._client.ExpireAssignment(assignmentId);
    }

    async getAssignmentDuties(startDate: DateType = moment(), endDate?: DateType): Promise<AssignmentDuty[]> {
        let duties: AssignmentDuty[] = (await this._client.GetDuties() as any);
        return duties;
    }

    getAssignmentDutyDetails(): Promise<AssignmentDutyDetails[]> {
        console.warn('Using Mock API');
        return this._mockApi.getAssignmentDutyDetails();
    }

    updateAssignmentDutyDetails(dutyDetails: Partial<AssignmentDutyDetails>): Promise<AssignmentDutyDetails> {
        console.warn('Using Mock API');
        return this._mockApi.updateAssignmentDutyDetails(dutyDetails);
    }

    createAssignmentDutyDetails(dutyDetails: Partial<AssignmentDutyDetails>): Promise<AssignmentDutyDetails> {
        console.warn('Using Mock API');
        return this._mockApi.createAssignmentDutyDetails(dutyDetails);
    }

    async createAssignmentDuty(duty: Partial<AssignmentDuty>): Promise<AssignmentDuty> {
        return (await this._client.CreateDuty(duty as any) as AssignmentDuty);
    }
    async updateAssignmentDuty(duty: Partial<AssignmentDuty>): Promise<AssignmentDuty> {
        const { id } = duty;
        if (!id) {
            throw 'Duty to update has no Id';
        }
        return (await this._client.UpdateDuty(id, duty as any)) as AssignmentDuty;
    }

    async deleteAssignmentDuty(idPath: IdType): Promise<void> {
        await this._client.DeleteDuty(idPath);
    }

    async createSheriffDuty(sheriffDuty: Partial<SheriffDuty>): Promise<SheriffDuty> {
        return await this._client.CreateSheriffDuty(sheriffDuty as any) as SheriffDuty;
    }
    async updateSheriffDuty(sheriffDuty: Partial<SheriffDuty>): Promise<SheriffDuty> {
        const { id } = sheriffDuty;
        if (!id) {
            throw "No Id included in sheriffDuty to update";
        }
        return await this._client.UpdateSheriffDuty(id, sheriffDuty as any) as SheriffDuty;
    }
    async deleteSheriffDuty(sheriffDutyId: string): Promise<void> {
        await this._client.DeleteSheriffDuty(sheriffDutyId);
    }

    async createDefaultDuties(date: moment.Moment = moment()): Promise<AssignmentDuty[]> {
        return await this._client.ImportDefaultDuties({
            courthouseId: this.currentCourthouse,
            date: date.toISOString()
        }) as AssignmentDuty[];
    }

    async getShifts(): Promise<Shift[]> {
        const list = await this._client.GetShifts(this.currentCourthouse);
        return list as Shift[];
    }

    async updateMultipleShifts(shiftIds: IdType[], shiftUpdates: ShiftUpdates): Promise<Shift[]> {
        const { sheriffId, startTime, endTime, workSectionId } = shiftUpdates;
        return await this._client.UpdateMultipleShifts({
            shiftIds,
            sheriffId,
            workSectionId,
            startTime: startTime ? moment(startTime).toISOString() : undefined,
            endTime: endTime ? moment(endTime).toISOString() : undefined
        }) as Shift[];
    }

    async updateShift(shiftToUpdate: Partial<Shift>): Promise<Shift> {
        const { id } = shiftToUpdate;
        if (!id) {
            throw 'Shift to Update has no id';
        }
        return await this._client.UpdateShift(id, shiftToUpdate as any) as Shift;
    }

    async createShift(newShift: Partial<Shift>): Promise<Shift> {
        const shiftToCreate: any = {
            ...newShift,
            courthouseId: this.currentCourthouse
        };
        const created = await this._client.CreateShift(shiftToCreate);
        return created as Shift;
    }

    async deleteShift(shiftIds: IdType[]): Promise<void> {
        await Promise.all(shiftIds.map(id => this._client.DeleteShift(id)));
    }

    async copyShifts(shiftCopyDetails: ShiftCopyOptions): Promise<Shift[]> {
        const {startOfWeekDestination, startOfWeekSource, shouldIncludeSheriffs} = shiftCopyDetails;
        return await this._client.CopyShifts({
            startOfWeekDestination: moment(startOfWeekDestination).toISOString(),
            startOfWeekSource: moment(startOfWeekSource).toISOString(),
            shouldIncludeSheriffs,
            courthouseId: this.currentCourthouse
        }) as Shift[];
    }

    getLeaves(): Promise<Leave[]> {
        console.warn('Using Mock API');
        return this._mockApi.getLeaves();
    }

    async getCourthouses(): Promise<Courthouse[]> {
        const list = await this._client.GetCourthouses();
        return list as Courthouse[];
    }

    async getCourtrooms(): Promise<Courtroom[]> {
        const list = await this._client.GetCourtrooms(this.currentCourthouse);
        return list as Courtroom[];
    }

    async getRuns(): Promise<Run[]> {
        const list = await this._client.GetRuns(this.currentCourthouse);
        return list as Run[];
    }

    async getJailRoles(): Promise<JailRole[]> {
        const list = await this._client.GetJailRoleCodes();
        return list as JailRole[];
    }

    async getAlternateAssignmentTypes(): Promise<AlternateAssignment[]> {
        const list = await this._client.GetOtherAssignCodes();
        return list as AlternateAssignment[];
    }

    async getSheriffRankCodes(): Promise<SheriffRank[]> {
        const list = await this._client.GetSheriffRankCodes();
        return list as SheriffRank[];
    }

}