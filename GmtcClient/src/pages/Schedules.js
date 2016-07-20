/*global fetch*/
import React, { Component, PropTypes } from 'react'
import PureListView from '../components/PureListView'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {genData, combineData} from '../helper/dataHelper'
import * as dataActions from '../reducers/data'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import SegmentTabWrapper from '../components/SegmentTabWrapper'
import TopicsCarousel from './TopicsCarousel'
import Topic from './Topic'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native'

class Schedules extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    load: PropTypes.func.isRequired,
    loadSuccess: PropTypes.func.isRequired,
    loadFailed: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    days: PropTypes.array.isRequired
  };

  render () {
    let width
    if (this.props.loading || this.props.days.length === 0) {
      return (
        <View style={[styles.container, styles.center]} >
          <Text>Loading...</Text>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <View onLayout={e => {
            width = e.nativeEvent.layout.width
          }}>
          <Image source={require('../assets/schedule-background.png')} style={[styles.center, {width, height: 250, paddingTop: 24, resizeMode: 'stretch'}]}>
            <Image source={require('../assets/gmtc.png')} style={{padding: 10, height: 60, width: 200}} />
            <Text style={{color: 'white', fontSize: 29, marginTop: 15}}>全球移动技术大会</Text>
            <Text style={{color: 'rgba(255, 255, 255, 0.7)', fontSize: 11, marginTop: 3}}>2016年6月24日－25日</Text>
          </Image>
        </View>
        <ScrollableTabView style={{marginTop: -41}}
          renderTabBar={() =>
            <SegmentTabWrapper style={{marginBottom: 7}} borderRadius={13.5} titleSize={12} horizontalWidth={160} horizontalHeight={27} activeColor='rgba(255,255,255,0.5)'/>}>
          <PureListView data={this.props.days[0].topics} tabLabel='第一天'
            renderRow={this.renderRow}
            enableEmptySections
            renderSectionHeader={this.renderSectionHeader}/>
          <PureListView data={this.props.days[1].topics} tabLabel='第二天'
            renderRow={this.renderRow}
            enableEmptySections
            renderSectionHeader={this.renderSectionHeader}/>
        </ScrollableTabView>
      </View>
    )
  }

  renderRow = (item, index) => {
    if (item.rest) {
      return <Topic topic={item} isSubscribed={item.isSubscribed}/>
    }
    return (
      <TouchableOpacity onPress={() => this.goToCarousel(item)}>
        <Topic topic={item} isSubscribed={item.isSubscribed}/>
      </TouchableOpacity>
    )
  }

  goToCarousel = (item) => {
    // const dayId = item.room.day_id
    this.props.navigator.push({
      component: TopicsCarousel,
      day: this.props.days[item.room.day_id - 1],
      topic: item
    })
  }

  renderSectionHeader = (sectionData, time) => {
    const startTime = sectionData[0].start_at.slice(11, 16)
    const endTime = sectionData[0].end_at.slice(11, 16)
    return (
      <View key={time} style={{backgroundColor: '#eeeeee'}}>
        <Text style={[{margin: 6, marginLeft: 8}, styles.font]}>{startTime}~{endTime}</Text>
      </View>
    )
  }

  componentDidMount () {
    this.loadData()
  }

  loadData () {
    this.props.load()
    fetch('http://gmtc.applean.cn/home/index.json')
    .then(response => response.json())
    .then(responseData => {
      this.props.loadSuccess(genData(responseData))
    })
    .catch(error => this.props.loadFailed(error))
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  font: {
    fontSize: 12.5,
    color: '#555555'
  }
})

const mapStateToProps = state => ({
  loading: state.data.loading,
  error: state.data.error,
  days: combineData(state.data.days, state.schedule.subscription)
})

const mapDispatchToProps = dispatch =>
  bindActionCreators({...dataActions}, dispatch)

module.exports = connect(mapStateToProps, mapDispatchToProps)(Schedules)
