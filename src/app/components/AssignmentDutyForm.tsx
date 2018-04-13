import * as React from 'react';
import * as moment from 'moment';
import {
    Form
} from 'react-bootstrap';
import {
    Field,
    InjectedFormProps,
    FieldArray,
    formValues
} from 'redux-form';
import {
    IdType,
    TimeType,
    WorkSectionCode,
    AssignmentDuty
} from '../api';
import TimeSliderField from './FormElements/TimeSliderField';
import { getWorkSectionColour } from '../api/utils';
import {
    ListGroup,
    ListGroupItem,
    Button,
    Glyphicon
} from 'react-bootstrap';

export interface AssignmentDutyFormProps {
    handleSubmit?: () => void;
    onSubmitSuccess?: () => void;
    assignmentTitle?: string;
    assignmentId?: IdType;
    minTime?: TimeType;
    maxTime?: TimeType;
    workSectionId?: WorkSectionCode;
}

interface SheriffDutyFieldProps {

}

class SheriffDutyFieldArray extends FieldArray<SheriffDutyFieldProps> {

}

export default class AssignmentDutyForm extends
    React.Component<AssignmentDutyFormProps & InjectedFormProps<{}, AssignmentDutyFormProps>, {}> {

    static parseAssignmentDutyFromValues(values: any): AssignmentDuty {
        const { timeRange: { startTime, endTime }, sheriffDuties, ...rest } = values;
        const assignmentDuty = { ...rest };
        assignmentDuty.startDateTime = startTime;
        assignmentDuty.endDateTime = endTime;
        assignmentDuty.sheriffDuties = sheriffDuties.map((element: any) => ({
            startDateTime: moment(element.timeRange.startTime).toISOString(),
            endDateTime: moment(element.timeRange.endTime).toISOString(),
        }));
        return assignmentDuty as AssignmentDuty;
    }

    static assignmentDutyToFormValues(duty: AssignmentDuty) {
        return {
            ...duty,
            timeRange: {
                startTime: moment(duty.startDateTime).toISOString(),
                endTime: moment(duty.endDateTime).toISOString()
            }
        };
    }

    renderSheriffDutyFieldsComponent(): React.ComponentClass {
        return formValues('timeRange')((props: any) => {
            const {
                timeRange: {
                    startTime: minTime = moment().startOf('day').add(7, 'hours').toISOString(),
                endTime: maxTime = moment().startOf('day').add(17, 'hours').toISOString()
                }
            } = props;
            return (
                <SheriffDutyFieldArray
                    name="sheriffDuties"
                    component={(p) => {
                        const { fields } = p;
                        return (
                            <ListGroup >
                                {fields.map((fieldInstanceName, index) => {
                                    return (
                                        <ListGroupItem key={index}>
                                            <Button
                                                bsStyle="danger"
                                                onClick={() => fields.remove(index)}
                                                className="pull-right"
                                            >
                                                <Glyphicon glyph="trash" />
                                            </Button>
                                            <div style={{marginTop:20}}>
                                            <Field
                                                name={`${fieldInstanceName}.timeRange`}
                                                component={(p) => <TimeSliderField
                                                    {...p}
                                                    minTime={minTime}
                                                    maxTime={maxTime}
                                                    timeIncrement={15}
                                                    color={'#888'}
                                                />}
                                                label={`Sheriff ${index + 1}`}
                                            />
                                            </div>
                                        </ListGroupItem>
                                    );
                                }
                                )}
                                <br />
                                <Button 
                                    onClick={() => fields.push({
                                        timeRange: {
                                            startTime: minTime,
                                            endTime: maxTime
                                        }
                                    })} 
                                >
                                    <Glyphicon glyph="plus" />
                                </Button>
                            </ListGroup>
                        );
                    }}
                />
            )
        });
    }

    render() {
        const {
            handleSubmit,
            assignmentTitle = 'Duty',
            minTime = moment().startOf('day').add('hours', 6).toISOString(),
            maxTime = moment().startOf('day').add('hours', 22).toISOString(),
            workSectionId = 'OTHER'
        } = this.props;
        const SheriffDutyFields = this.renderSheriffDutyFieldsComponent();
        return (
            <div>
                <h1 style={{ marginBottom: 20 }}>{assignmentTitle}</h1>
                <Form onSubmit={handleSubmit}>
                    <Field
                        name="timeRange"
                        component={(p) => <TimeSliderField
                            {...p}
                            minTime={minTime}
                            maxTime={maxTime}
                            timeIncrement={15}
                            color={getWorkSectionColour(workSectionId)}
                            label={<h2 style={{marginBottom:5}}>Duty Time Range</h2>}
                        />}
                    />
                    <div style={{ marginTop: 40 }}>
                        <h2>Sheriffs for Duty</h2>
                        <SheriffDutyFields />
                    </div>
                </Form>
            </div>
        );
    }
}