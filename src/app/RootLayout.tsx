import * as React from 'react';
import {
  Route,
  BrowserRouter as Router
} from "react-router-dom";
import {
  DragDropContext
} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Footer from './components/Footer';
import Navigation from './components/Navigation'
import './assets/styles/Glyphicons.css'
import './index.css';
import Timeline from './pages/Timeline';
import ManageSheriffs from './pages/ManageSheriffs';
import DefaultAssignments from './pages/DefaultAssignments';
import Scheduling from './pages/Scheduling';
import Graphql from './pages/Graphql';

class Layout extends React.PureComponent {
  render() {
    return (
      <Router>
        <div className="App">
          <div className="headerArea">
            <Navigation />
          </div>
          <div className="mainArea">
            <Route exact path='/' component={Timeline} />
            <Route path='/sheriffs/manage' component={ManageSheriffs} />
            <Route path='/assignments/manage/default' component={DefaultAssignments} />
            <Route path='/sheriffs/schedule' component={Scheduling} />
            <Route path='/graphql' component={Graphql} />
          </div>
          <div className='footerArea'>
            <Footer />
          </div>
        </div>
      </Router>
    );
  }
}

// Make our Layout the root of the Drag Drop Context
export default DragDropContext(HTML5Backend)(Layout);
