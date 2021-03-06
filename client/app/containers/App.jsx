'use strict';

import React, { Component, Children, PropTypes } from 'react';
import Relay from 'react-relay';
import Radium, { Style } from 'radium';
import styler from 'react-styling';
import { Router, Link } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Map from '../components/Map.jsx';
import Home from './Home.jsx';
import Videos from './Videos.jsx';
import UserWidget from '../components/UserWidget.jsx';

@Radium
class App extends Component {

  state = {
    showOverlays: false,
    activeVideo: null,
    openVideo: null,
    authObj: null,
    idToken: null
  };

  setActiveVideo  = index => this.setState({activeVideo: index});
  setOpenVideo    = index => this.setState({openVideo: index});
  setShowOverlays = show  => this.setState({showOverlays: !!show});
  setAuthObj = authObj => this.setState({ authObj });

  initVideos = (city='', year=0, month=0) => {
    const { location } = this.props
        , { idToken }  = this.state;

    let path = '/videos'
      , params = [];

    if (city && city.length > 0) { params.push(`city=${city}`); }
    if (year) { params.push(`year=${year}`); }
    if (month) { params.push(`month=${month}`); }

    if (params.length > 0) { path += '?' + params.join('&'); }

    this.props.history.replaceState({ city, year, month, idToken }, path);
  };

  setIdToken = idToken => {
    this.setState({ idToken });
    const { location } = this.props;

    if (location.state) {
      const { city, year, month } = location.state
          , { pathname, search } = location
          , path = pathname + search;

      this.props.history.replaceState({ city, year, month, idToken }, path);
    }
  };

  render() {
    const {viewer, children} = this.props
        , {showOverlays, activeVideo, openVideo, authObj, idToken} = this.state;

    return (
      <div style={styles.app}>
        <Style rules={styles.appRules} />
        <main style={styles.main}>
          <div style={styles.userContainer}>
            <UserWidget authObj={authObj}
                        setAuthObj={this.setAuthObj}
                        setIdToken={this.setIdToken} />
          </div>
          <Map showOverlays={showOverlays}
               activeVideo={activeVideo}
               setActiveVideo={this.setActiveVideo}
               setOpenVideo={this.setOpenVideo}
               videos={viewer.videos}
               city={viewer.city} />
          <ReactCSSTransitionGroup transitionName='main'
                                   transitionEnterTimeout={500}
                                   transitionLeaveTimeout={300} >
            {React.cloneElement(children || <div />, {
              key: this.props.location.pathname,
              activeVideo,
              openVideo,
              authObj,
              idToken,
              setShowOverlays: this.setShowOverlays,
              setActiveVideo: this.setActiveVideo,
              setOpenVideo: this.setOpenVideo,
              initVideos: this.initVideos,
              videos: viewer.videos,
              cities: viewer.cities,
              viewer
            })}
          </ReactCSSTransitionGroup>
        </main>
      </div>
    );
  }

}

export default Relay.createContainer(App, {
  initialVariables: {
    city: '',
    year: 0,
    month: 0
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        ${Videos.getFragment('viewer')},
        videos: videosByCity(year: $year, month: $month, city: $city) {
          ${Videos.getFragment('videos')},
          ${Map.getFragment('videos')}
        },
        cities {
          ${Home.getFragment('cities')},
          ${Videos.getFragment('cities')}
        },
        city(city: $city) {
          ${Map.getFragment('city')}
        }
      }
    `
  }
});

const styles = styler`
  app
    font-family: "proxima-nova", sans-serif
    font-size: 15px
    line-height: 1.5em
    display: flex
    flex-direction: column
    min-height: 100vh

  appRules
    *
      box-sizing: border-box
    h1, h2, h3
      line-height: 1.5em
    h1
      font-size: 36px
      font-weight: 500
    h2
      font-size: 30px
    h3
      font-size: 24px
      font-weight: 500
    em
      font-style: italic
    a
      text-decoration: none
      font-weight: bold

    ::-webkit-input-placeholder
      color: rgba(153,153,153,1)

    ::-webkit-scrollbar
      width: 10px
      height: 10px
      position: absolute
      bottom: 0
      left: 0
      background-color: rgba(230,230,230,1)

    ::-webkit-scrollbar-thumb
      border: 3px solid rgba(230,230,230,1)
      background-color: rgba(240,53,78,0.5)
      border-radius: 5px

    main
      flex: 1 0 auto
      width: 100%
      overflow: hidden

    div.main-enter
      opacity: 0.01
      transform: scale(2)

    div.main-enter.main-enter-active
      opacity: 1
      transition: opacity 300ms ease-in-out, transform 300ms ease-in-out
      transform: scale(1)

    div.main-leave
      opacity: 1
      transform: scale(1)

    div.main-leave.main-leave-active
      opacity: 0.01
      transform: scale(2)
      transition: opacity 300ms ease-in-out, transform 300ms ease-in-out

  main
    margin-top: 0px
    position: relative

  userContainer
    z-index: 15
    position: absolute
    right: 20px
    top: 21px
`;
