'use strict';

import React, { Component } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import GoogleMap from 'google-map-react';
import { fitBounds } from 'google-map-react/utils';
import Radium from 'radium';
import styler from 'react-styling';
import VideoOverlay from './VideoOverlay.jsx';

const createMapOptions = maps => ({
  zoomControlOptions: {
    position: maps.ControlPosition.RIGHT_CENTER,
    style: maps.ZoomControlStyle.SMALL
  }
});

@Radium
class Map extends Component {

  state = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  static defaultProps = {
    defaultZoom: 9,
    showOverlays: true,
    videos: [],
    defaultCenter: {
      lat: 59.288331692,
      lng: -135.637207031
    }
  };

  handleResize = () => this.setState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const {
      showOverlays, activeVideo, setActiveVideo, setOpenVideo,
      videos, city, defaultCenter, defaultZoom
    } = this.props;

    const bounds = city ? city.bounds : null;

    const { width, height } = this.state;

    const overlays = showOverlays ? videos.map((video, index) =>
      <VideoOverlay lat={video.location.latitude}
                    lng={video.location.longitude}
                    video={video}
                    index={index + 1}
                    isActive={(index + 1) === activeVideo}
                    setActiveVideo={setActiveVideo}
                    setOpenVideo={setOpenVideo}
                    key={index + 1} />
    ) : [];

    const { center, zoom } = !bounds ? {
      center: defaultCenter,
      zoom: defaultZoom
    } : fitBounds({
      nw : { lat: bounds.nw.latitude, lng: bounds.nw.longitude},
      se : { lat: bounds.se.latitude, lng: bounds.se.longitude}
    }, { width, height });

    const activeLocation = activeVideo !== null && videos[activeVideo-1]
                         ? videos[activeVideo-1].location
                         : null;

    const { latitude: activeLat, longitude: activeLng } = activeLocation || {};

    return (
      <div style={styles.map}>
        <GoogleMap defaultCenter={defaultCenter}
                   defaultZoom={defaultZoom}
                   zoom={zoom}
                   center={activeLocation ? { lat: activeLat, lng: activeLng } : center}
                   options={createMapOptions}>
          {overlays}
        </GoogleMap>
      </div>
    );
  }

}

export default Relay.createContainer(Map, {
  fragments: {
    videos: () => Relay.QL`
      fragment on Video @relay(plural: true) {
        title,
        location { latitude, longitude }
      }
    `,
    city: () => Relay.QL`
      fragment on City {
        bounds {
          nw { latitude, longitude },
          se { latitude, longitude }
        }
      }
    `
  }
});

const styles = styler`
  map
    width: 100%
    height: 100vh
    position: absolute
    top: 0
    left: 0
    overflow-y: hidden
`;
