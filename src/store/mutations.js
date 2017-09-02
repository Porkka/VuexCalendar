import state from './state';

var _ = require('lodash')
var moment = require('moment');
export default {

  SET_DATE (state, date) {
  	state.date = date
  },

  SET_CALENDAR_OPTIONS (state, options) {
    for(let o in options) {
      if(state.options.hasOwnProperty(o)) {
        state.options[ o ] = options[o];
      }
    }
  },

  SET_CALENDAR_TIME_RANGES (state, time_ranges) {
  	state.time_ranges = time_ranges
  },

  SELECT_CALENDAR_RANGE (state, range) {
    let start = range.start.format('X'), end = range.end.format('X');
    if(state.options.type == 'month') {
      for(var i in state.time_ranges) {
        for(var j in state.time_ranges[ i ].ranges) {
          let timestamp = state.time_ranges[ i ].ranges[ j ].timestamp;
          if(start <= timestamp && timestamp <= (end - 1)) {
            state.time_ranges[ i ].ranges[ j ].classes.selected = true;
          } else {
            state.time_ranges[ i ].ranges[ j ].classes.selected = false;
          }
        } 
      }
    } else {
      for(var i in state.time_ranges[0].ranges) {
        for(var j in state.time_ranges[ 0 ].ranges[ i ].times) {
          let timestamp = state.time_ranges[ 0 ].ranges[ i ].times[ j ].timestamp;
          if(start <= timestamp && timestamp <= (end - 1)) {
            state.time_ranges[ 0 ].ranges[ i ].times[ j ].classes.selected = true;
          } else {
            state.time_ranges[ 0 ].ranges[ i ].times[ j ].classes.selected = false;
          }
        } 
      }
    }
  },

  ADD_ENTRIES (state, entries) {
    var new_entries = _createEntryObjects(entries);
    new_entries = new_entries.concat(state.entries);
    new_entries = _sortEntries(new_entries);
    state.entries = _checkOffsets(new_entries);
  },

  UPDATE_ENTRIES (state, entries) {
    var new_entries = [ ];
    var guids = _.map(entries, 'guid');
    for(let e in state.entries) {
      if(guids.indexOf(state.entries[ e ].guid) == -1) {
        new_entries.push(state.entries[ e ]);
      }
    }
    var updated_entries = _createEntryObjects(entries, true);
    updated_entries = new_entries.concat(updated_entries);
    updated_entries = _sortEntries(updated_entries);
    state.entries = _checkOffsets(updated_entries);
  },

  REMOVE_ENTRIES_BY_GUIDS (state, guids) {
    var new_entries = [ ];

    if(!guids) {
      console.log('REMOVE_ENTRIES_BY_GUIDS: Invalid paremeter. Parameter must be array of guids. Your\'s was: ' , guids);
      return;
    }

    for(let e in state.entries) {
      if(guids.indexOf(state.entries[ e ].guid) == -1) {
        new_entries.push(state.entries[ e ]);
      }
    }
    new_entries = _sortEntries(new_entries);
    state.entries = _checkOffsets(new_entries);
  },

	STORE_ENTRIES (state, entries) {
		var ent = _createEntryObjects(entries);
    ent = _sortEntries(ent);
    state.entries = _checkOffsets(ent);
	},

  BACKUP_ENTRY (state, entry) {
    state.backup_entries.push(entry);
  },

  RESTORE_BACKUPS(state) {
    if(state.backup_entries) {
      var new_entries = [ ];
      var guids = _.map(state.backup_entries, 'guid');
      for(let e in state.entries) {
        if(guids.indexOf(state.entries[ e ].guid) == -1) {
          new_entries.push(state.entries[ e ]);
        }
      }
      var updated_entries = _createEntryObjects(state.backup_entries, true);
      updated_entries = new_entries.concat(updated_entries);
      updated_entries = _sortEntries(updated_entries);
      state.entries = _checkOffsets(updated_entries);
    }
    state.backup_entries = [ ];
  },

  ACTIVATE_DAY (state, day) {
    state.active_days.push(day)
  },

  DRAG_EVENT_ENTRY (state, entry) {
    state.event_data.drag.entry = entry
  },
  DRAG_EVENT_ON_DATE (state, date) {
    state.event_data.drag.on_date = date
  },
  DRAG_EVENT_ORIGIN_DATE (state, date) {
    state.event_data.drag.origin_date = date
  },

  SET_MOVING_EVENT (state) {
    state.events.moving = true;
    state.events.selecting = state.events.resizing = false;
  },
  SET_SELECTING_EVENT (state) {
    state.events.selecting = true;
    state.events.moving = state.events.resizing = false;
  },
  SET_RESIZING_EVENT (state) {
    state.events.resizing = true;
    state.events.selecting = state.events.moving = false;
  },

  RESET_EVENTS (state) {

    if(state.events.selecting) {
      if(state.options.type == 'month') {
        for(var i in state.time_ranges) {
          for(var j in state.time_ranges[ i ].ranges) {
            state.time_ranges[ i ].ranges[ j ].classes.selected = false;
          } 
        }
      } else {
        for(var i in state.time_ranges[0].ranges) {
          for(var j in state.time_ranges[ 0 ].ranges[ i ].times) {
            state.time_ranges[ 0 ].ranges[ i ].times[ j ].classes.selected = false;
          } 
        }
      }
    }

    state.events.selecting = state.events.selecting = state.events.moving = false;
    state.backup_entries = [ ];
    state.event_data.drag = {
      entry: null,
      on_date: null,
      origin_date: null
    }
  }

}
function _guid() {
  function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
function _isDay() { return state.options.type == 'day' }
function _isWeek() { return state.options.type == 'week' }
function _isMonth() { return state.options.type == 'month' }
function _createEntryObjects(entries, leave_initial_guid) {
  if(_isMonth()) {
    var entry_objects = _createMonthEntryObjects(entries, leave_initial_guid);
  } else {
    var entry_objects = _createWeekEntryObjects(entries, leave_initial_guid);
  }
  return entry_objects;
}
function _createMonthEntryObjects(entries, leave_initial_guid) {
  let day_start = _splitTimeStr(state.options.day_start),
  day_end = _splitTimeStr(state.options.day_end),
  entry_objects = [ ];
  for(let ent in entries) {
    let entry = _initEntryObject(entries[ ent ], leave_initial_guid);
    let tmp_start = entry.from.clone(),
    tmp_end = entry.to.clone();

    if(tmp_start.isoWeek() != tmp_end.isoWeek()) {
      // Clone so we don't change the existing one...
      var weeks = _rangeToWeeks(tmp_start, tmp_end),
      weeks_count = weeks.length;
      var origin_guid = '';
      for(let i = 0; i < weeks_count; i++) {

        let split = _.cloneDeep(entry);
        let tmp_start = moment(weeks[i].start).hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds);
        let tmp_end = moment(weeks[i].end).hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds);

        split.start = _longFormat(tmp_start);
        split.end = _longFormat(tmp_end);
        split.from = moment(split.start);
        split.to = moment(split.end);
        split.has_resizer = ( i + 1 ) == weeks_count;

        let day_diff = Math.abs(split.to.diff(split.from, 'days'));
        day_diff++;
        let w = (Math.max(day_diff, 1) * 100) - 10;
        if(day_diff > 1) {
          split.styles.width = 'calc(' + w + '%' + ' + ' + day_diff + 'px)';
        } else {
          split.styles.width =  w + '%';
        }
        split.styles.left = 'auto';
        split.styles.height = '22px';
        entry_objects.push(split);
      }
    } else {
      entry.has_resizer = true;
      let day_diff = Math.abs(tmp_end.diff(tmp_start, 'days')) + 1;
      entry.styles.left = 'auto';
      entry.styles.height = '22px';
      entry.styles.width = (Math.max(day_diff, 1) * 100) - 12 + '%';
      entry_objects.push(entry);
    }
  }
  return entry_objects;
}
function _createWeekEntryObjects(entries, leave_initial_guid) {
  let day_start = _splitTimeStr(state.options.day_start),
  day_end = _splitTimeStr(state.options.day_end),
  interval = _splitTimeStr(state.options.hour_interval),
  length = interval.hours * 3600 + interval.minutes * 60,
  entry_objects = [ ];
  for(let ent in entries) {
    let entry = _initEntryObject(entries[ ent ], leave_initial_guid),
    tmp_start = entry.from.clone(),
    tmp_end = entry.to.clone();
    if(tmp_start.day() != tmp_end.day()) {
      // Clone so we don't change the existing one...
      var days = _rangeToDays(tmp_start, tmp_end),
      day_count = days.length;
      var origin_guid = '';
      for(let i = 0; i < day_count; i++) {

        let split = _.cloneDeep(entry),
        tmp_start = moment(days[i].start),
        tmp_end = moment(days[i].end);

        split.start = _longFormat(tmp_start);
        split.end = _longFormat(tmp_end);
        split.from = moment(split.start);
        split.to = moment(split.end);
        split.has_resizer = ( i + 1 ) == day_count;

        let diff = Math.max(Math.ceil(parseInt(tmp_end.diff(tmp_start, 'seconds')) / length), 1);
        split.styles.height = 'calc(' + (diff * 100 - 15) + '% + ' + diff + 'px)';
        entry_objects.push(split);
      }
    } else {
      entry.has_resizer = true;
      let diff = Math.max(Math.ceil(parseInt(tmp_end.diff(tmp_start, 'seconds')) / length), 1);
      entry.styles.height = 'calc(' + (diff * 100 - 15) + '% + ' + diff + 'px)';
      entry_objects.push(entry);
    }
  }
  // console.log(entry_objects);
  return entry_objects;
}
/** Starting and ending dates are the dates supplied as parameters **/
function _rangeToWeeks(start, end) {
  let tmp = start.clone();
  let weeks = [ ];
  // Days to add to start and to end to get full weeks
  let start_num = 7 - tmp.isoWeekday();
  // Init week variable and add first week to return array
  let week = { start: null, end: null };
  week.start = _longFormat(tmp);
  // Skip to sunday
  tmp.add(start_num, 'days');
  week.end = _longFormat(tmp);
  // Loop till too far (same week as the parameter end date)
  let end_week = end.isoWeek();
  weeks.push(week);
  // Skip to monday
  tmp.add(1, 'days');
  let start_week = tmp.isoWeek();
  for (var i = start_week; i < end_week; i++) {
      week = { start: null, end: null };
      week.start = _longFormat(tmp);
      // Skip to sunday
      tmp.add(6, 'days');
      week.end = _longFormat(tmp);
      // Add to return value
      weeks.push(week);
      // Skip to monday
      tmp.add(1, 'days');
  };

  if(tmp.format('x') <= end.format('x')) {
      week = { start: null, end: null };
      week.start = _longFormat(tmp);
      week.end = _longFormat(end);
      // Add to return value
      weeks.push(week);
  }
  // Add to return value
  return weeks;
}
/** Starting and ending dates are the dates supplied as parameters **/
function _rangeToDays(start, end) {
  var days = [ ], tmp = start.clone(),
  day_start = _splitTimeStr(state.options.day_start),
  day_end = _splitTimeStr(state.options.day_end),
  end_num = 24 - start.hour() - start.minutes() / 60;
  // Init day variable and add first day to return array
  // 1. Get first day (Example: 16:30 - 00:00)
  var day = { start: _longFormat(tmp), end: null };
  tmp.add(end_num, 'hours');
  day.end = _longFormat(tmp);
  days.push(day);
  // 2. Check if tmp.format('x') < end.format('x')
  if(tmp.format('x') < end.format('x')) {
    day = { start: null, end: null };
    tmp.hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds);
    // 3. Take day length (day_end - day_start)
    let ms = moment().hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds),
    me = moment().hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds),
    // 4. Take length of the remaining time (end - tmp)
    diff_in_days = end.diff(tmp, 'days');
    for(let i = 0; i < diff_in_days; i++) {
      day = { start: _longFormat(tmp), end: null };
      tmp.hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds);
      day.end = _longFormat(tmp);
      days.push(day);
      tmp.add(1, 'days');
      tmp.hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds);
    }
    if(tmp.format('x') < end.format('x')) {
      day = { start: _longFormat(tmp), end: null };
      tmp.hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds);
      day.end = _longFormat(end);
      days.push(day);
    }
  }
    return days;
}
function _getOverlappingEntries(entry, entry_objects) {
  var clone = _.cloneDeep(entry);
  if(_isMonth()) {
    clone.from.hours(0).minutes(0).seconds(0);
    clone.to.hours(23).minutes(59).seconds(59);
  }

  var entries = entry_objects.filter(function(item) {
    if(item.guid != clone.guid) { // Skip if entry itself
      if(_isMonth()) {
        var start = item.from.clone().hours(0).minutes(0).seconds(0);
        var end = item.to.clone().hours(0).minutes(0).seconds(0);
      } else {
        var start = item.from;
        var end = item.to;
      }
      var istart = parseInt(start.format('X')), iend = parseInt(end.format('X')),
      estart = parseInt(clone.from.format('X')), eend = parseInt(clone.to.format('X'));
      return (
        // Check if overlapping in any way
        ( istart >= estart && iend <= eend ) || // [ --- ]
        ( istart <= estart && iend > estart) || // -[ -- ]
        ( istart <= estart && iend >= eend ) || // --[ --- ]--
        ( istart <= eend && iend >= eend ) || // [ -- ]-
        ( (istart == eend || iend == estart ) && _isMonth() ) // [ -- ]-
      );
    }
  });
  return entries;
}
function _sortEntries(entries) {
  var a = function(o) { return parseInt(o.from.format('X')); };
  var b = function(o) { return parseInt( o.to.format('X') - o.from.format('X') ); }
  entries = _.sortBy(entries, [ a, b ], [ 'desc' ]);
  return entries;
}
function _checkOffsets(entries) {
  var all_entries = [ ];
  var available_slots = _.range(0, (state.options.entry_limit - 1));
  for(let ent in entries) {
    entries[ent].slot = 0;
    entries[ent].overflow = false;

    var overlaps = _getOverlappingEntries(entries[ ent ], all_entries);
    // Check in which slot the overlapping etries occupy
    if(overlaps.length) {
      entries[ent].slot = overlaps.length;
      var filled_slots = _.map(overlaps, 'slot');
      for(let a in available_slots) {
        if(filled_slots.indexOf(available_slots[a]) == -1) {
          entries[ent].slot = available_slots[a]; 
          break;
        }
      }
      if((entries[ent].slot + 1) > state.options.entry_limit) {
        entries[ent].overflow = true;
      }
    }

    if(_isMonth()) {
      var styles = _.cloneDeep(entries[ ent ].styles);
      styles.top = (entries[ ent ].slot * parseInt(entries[ ent ].styles.height)) + (4 * entries[ ent ].slot) + 25 + 'px';
      entries[ ent ].styles = styles;
      entries[ ent ].styles = _.omit(entries[ ent ].styles, 'left');
    } else {

      var width = 100;
      if(entries[ ent ].slot) {
        width = 100 / (entries[ ent ].slot + 0.5);
      }
      entries[ ent ].styles.left = 10 + ( ( width/ 2 ) * entries[ ent ].slot) + 'px';
      entries[ ent ].styles.width = 'calc(' + width + '% - 20px)';
      entries[ ent ].styles = _.omit(entries[ ent ].styles, 'top');
      for(let e in overlaps) {
        overlaps[ e ].styles.width = 'calc(' + width + '% - 20px)';
      }
    }
    all_entries.push(entries[ ent ]);
  }
  return all_entries;
}
function _initEntryObject(ent, leave_initial_guid) {
  let entry = _.cloneDeep(ent);

  if(!leave_initial_guid) {
    entry.guid = _guid();
  } else if(!ent.guid) {
    entry.guid = _guid();
  } 
  entry.origin_from = entry.from = moment(entry.start).locale(state.options.locale);
  entry.origin_to = entry.to = moment(entry.end).locale(state.options.locale);
  entry.has_resizer = false;
  entry.origin_guid = '';
  entry.overflow = false;
  entry.slot = 0;
  entry.classes = { entry: true },
  entry.attributes = { },
  entry.styles = { height: '25px' };
  entry.text = entry.title;

  for(let key in ent) {
    if(key == 'attributes') {
      for(let a in ent[ key ]) {
        entry.attributes[ a ] = ent[ key ];
      }
    } else if(key == 'styles') { /** User defined styles **/
      for(let s in ent[ key ]) {
        entry.styles[ s ] = ent[ key ][ s ];
      }
    } else if(key != 'from' && key != 'tp') { /** User defined other properties set to element's data **/
      entry.attributes[ 'data-' + key ] = ent[ key ];
    }
  }
  return entry;
}
function _splitTimeStr(time_string) {
  let time = { hour: 0, minutes: 0, seconds: 0 }
  let intervals = time_string.split(':');

  time.hours  = (intervals.length >= 1) ? parseInt(intervals[0]) : 0;
  time.minutes  = (intervals.length >= 2) ? parseInt(intervals[1]) : 0;
  time.seconds  = (intervals.length >= 3) ? parseInt(intervals[2]) : 0;

  return time;
}
function _longFormat(moment) {
  return moment.format('YYYY') + '-' + moment.format('MM') + '-' + moment.format('DD') + ' ' + moment.format('HH')+ ':' + moment.format('mm')
}