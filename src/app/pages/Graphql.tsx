import * as React from 'react';
import { withSheriffs, withSheriffUpdater } from '../gql/queries';
import { Table } from 'react-bootstrap';
import { Sheriff } from '../api/Api';


interface UpdatableFieldProps {
    submit?: (sheriff: Partial<Sheriff>) => void;
    sheriff: Partial<Sheriff>;
    field: keyof (Sheriff);
}


interface UpdatableFieldState {
    editing: boolean;
    value?: string;
}

class UpdatableField extends React.PureComponent<UpdatableFieldProps, UpdatableFieldState>{
    state = { editing: false, value: undefined };

    private startEdit() {
        this.setState({
            editing: true
        });
    }

    private finishEdit() {
        this.setState({
            editing: false
        });
        const { value } = this.state;
        const { submit, field } = this.props;
        let updatedSheriff = {};
        updatedSheriff[field] = value;
        if (submit) {
            submit(updatedSheriff);
        }
    }

    private handleChange(e: any) {
        this.setState({
            value: e.target.value
        });
    }
    render() {
        const { field, sheriff } = this.props;
        const originalValue: string = sheriff[field] as string;
        const { value = originalValue, editing } = this.state;
        if (!editing) {
            return (
                <div onClick={() => this.startEdit()}>{value}</div>
            );
        } else {
            return (
                <input
                    width={20}
                    type="text"
                    value={value}
                    onChange={(e) => this.handleChange(e)}
                    onBlur={() => this.finishEdit()}
                />
            )
        }
    }
}

const UpdateableSheriffField = withSheriffUpdater(({field, submit, sheriff }) => {
    return (
        <UpdatableField submit={submit} field={field} sheriff={sheriff} />
    );
});

export default withSheriffs(({ data }) => {
    if (!data) {
        return <div>No Data</div>;
    }
    if (data.loading) {
        return <div>Loading</div>;
    }
    if (data.error) {
        return <div>ERROR:{data.error.message}</div>;
    }

    const { allSheriffs: { sheriffs = [] } = {} } = data;

    return (
        <div>
            <Table>
                <thead>
                    <td>First Name</td>
                    <td>Last Name</td>
                    <td>Badge Number</td>
                    <td>Courthouse</td>
                </thead>
                <tbody>
                    {sheriffs.map(s => (
                        <tr>
                            <td><UpdateableSheriffField field="firstName" nodeId={s.id} sheriff={s} /></td>
                            <td><UpdateableSheriffField field="lastName" nodeId={s.id} sheriff={s} /></td>
                            <td>{s.badgeNumber}</td>
                            <td>
                                {s.courthouse.location.name}<br />
                                {s.courthouse.location.description}<br />
                                {s.courthouse.location.address}
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </Table>
            <Table>
                <tbody>
                    {sheriffs.map(s => (
                        <tr>
                            <td>{s.firstName}</td>
                            <td>{s.lastName}</td>
                            <td>{s.badgeNumber}</td>
                            <td>
                                {s.courthouse.location.name}<br />
                                {s.courthouse.location.description}<br />
                                {s.courthouse.location.address}
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </Table>
        </div>
    );
});

