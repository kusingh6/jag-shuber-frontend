import React from 'react';
import { connect } from 'react-redux';
import { RootState } from './store';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';
import {
  DragDropContext
} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Navigation from './components/Navigation';
import './assets/styles/Glyphicons.css';
import './index.css';
import DutyRoster from './pages/DutyRoster';
import ManageSheriffs from './pages/ManageSheriffs';
import DefaultAssignments from './pages/DefaultAssignments';
import Scheduling from './pages/Scheduling';
import AssignmentDutyEditModal from './containers/AssignmentDutyEditModal';
import CurrentCourthouseSelector from './containers/CurrentCourthouseSelector';
import { Well } from 'react-bootstrap';
import SheriffProfileModal from './containers/SheriffProfileModal';
import ScheduleShiftCopyModal from './containers/ScheduleShiftCopyModal';
import ScheduleShiftAddModal from './containers/ScheduleShiftAddModal';
import PublishSchedule from './pages/PublishSchedule/PublishSchedule';
import Footer from './components/Footer/Footer';
import {
  isCourthouseSet as isCurrentCourthouseSet
} from '../app/modules/user/selectors';

export interface LayoutStateProps {
  isCourthouseSet?: boolean;
}

export interface LayoutDispatchProps {
}
class Layout extends React.Component<LayoutStateProps & LayoutDispatchProps> {

  render() {
    const { 
      isCourthouseSet = false, 
    } = this.props;

    return (
      <Router>
        <div className="App">
          <div className="headerArea">
            <Navigation />
          </div>
          {!isCourthouseSet && (
            <div className="mainArea">
              <Well
                style={{
                  backgroundColor: 'white',
                  maxWidth: '80%',
                  minWidth: 800,
                  height: '100%',
                  margin:'auto'
                }}
              >
                <div style={{ paddingTop: 10 }}>
                  <h1>Select your Location</h1>
                  <CurrentCourthouseSelector />
                </div>
              </Well>
            </div>
          )}

          {isCourthouseSet && (
            <div className="mainArea">
              <Route exact={true} path="/" component={DutyRoster} />
              <Route path="/sheriffs/schedule" component={Scheduling} />
              <Route path="/sheriffs/manage" component={ManageSheriffs} />
              <Route path="/assignments/manage/default" component={DefaultAssignments} />
              <Route path="/schedule/publishView" component={PublishSchedule} />

              <AssignmentDutyEditModal />
              <SheriffProfileModal />
              <ScheduleShiftCopyModal />
              <ScheduleShiftAddModal />
            </div>
          )}
          <div className="footerArea">
            <Footer />
          </div>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isCourthouseSet: isCurrentCourthouseSet(state)
  };
};

const mapDispatchToProps = {};

const connectedLayout = connect<LayoutStateProps, LayoutDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Layout);
// Make our Layout the root of the Drag Drop Context
export default DragDropContext(HTML5Backend)(connectedLayout);
