var _ = require('lodash')
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

  ACTIVATE_ENTRY (state, entry) {
    let new_entries = [ ];
    state.active_entries.push(entry)
    for(let e in state.entries) {
      if(state.entries[ e ].origin_guid == entry.guid || state.entries[ e ].guid == entry.origin_guid) {
        state.active_entries.push(state.entries[ e ]);
      }
    }
  },

  SORT_ENTRIES (state) {
    var a = function(o) { return parseInt(o.from.format('X')); };
    var b = function(o) { return parseInt( o.from.format('X') - o.to.format('X') ); }
    state.entries = _.sortBy(state.entries, [ b ], [ 'desc' ]);
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

  ADD_ENTRY (state, entry) {
    state.entries.push(entry)
  },

  APPEND_ENTRIES (state, entries) {
    for(let entry in entries) {
      state.entries.push(entries[ entry ])
    }
  },

	STORE_ENTRIES (state, entries) {
		state.entries = entries
	},

  BACKUP_ENTRY (state, entry) {
    state.backup_entries = [ ];
    for(let e in state.entries) {
      if(state.entries[ e ].guid == entry.guid || state.entries[ e ].origin_guid == entry.guid) {
        state.backup_entries.push(_.cloneDeep(state.entries[ e ]));
      }
    }
  },

  RESTORE_BACKUPS(state) {
    if(state.backup_entries) {
      for (let i in state.backup_entries) {
        state.entries.push(state.backup_entries[ i ]);
      }
    }
    state.backup_entries = [ ];
  },

  REMOVE_ACTIVE_ENTRIES (state) {
    let guids = _.map(state.active_entries, 'guid');
    let new_entries = [ ];
    for(let e in state.entries) {
      if(guids.indexOf(state.entries[ e ].guid) == -1) {
        new_entries.push(state.entries[ e ]);
      }
    }
    state.entries = new_entries;
    state.active_entries = [ ];
  },

  RESET_ACTIVE_ENTRIES (state) {
    state.active_entries = [ ];
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

    state.event_data.drag = {
      entry: null,
      on_date: null,
      origin_date: null
    }
  }


}