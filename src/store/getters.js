var _ = require('lodash');
export default {

	date: (state) => {
		return state.date
	},

	options: (state) => {
		return state.options
	},

	moving: (state) => {
		return state.events.moving
	},
	selecting: (state) => {
		return state.events.selecting
	},
	resizing: (state) => {
		return state.events.resizing
	},

	drag_event_origin_date: (state) => {
		return state.event_data.drag.origin_date
	},

	drag_event_on_date: (state) => {
		return state.event_data.drag.on_date
	},

	drag_event_entry: (state) => {
		return state.event_data.drag.entry
	},
	normalized_entries: (state, getters) => {
    var normalized = [ ];
    for(let e in state.entries) {
      let guids = _.map(normalized, 'guid');
      if(guids.indexOf(state.entries[e].guid) == -1) {
        normalized.push(getters.normalize_entry(state.entries[e]));
      }
    }
		return normalized;
	},
	concatenate_entry: (state) => {
		// Concatenate entry
		return function(entry) {
			var e = _.cloneDeep(entry);
			for(let ee in state.entries) {
				if(state.entries[ ee ].guid == e.guid) {
					if(state.entries[ ee ].to.format('X') > e.to.format('X')) {
						e.to = state.entries[ ee ].to;
						e.end = state.entries[ ee ].end;
					}
					if(state.entries[ ee ].from.format('X') < e.from.format('X')) {
						e.from = state.entries[ ee ].from;
						e.start = state.entries[ ee ].start;
					}
				}
			}
			return e;
		};
	},
	normalize_entry: (state, getters) => {
		return function(entry) {
			var e = getters.concatenate_entry(entry);
			return {
				guid: e.guid,
				from: e.from,
				to: e.to,
				start: e.start,
				end:  e.end,
				title: e.title,
				styles: e.styles,
				classes: e.classes,
				attributes: e.attributes,
			};
		};
	},
	get_attributes: (state, getters) => {
		return function(entry) {
			return {
				guid: entry.guid,
				from: entry.from,
				to: entry.to,
				start: entry.start,
				end:  entry.end,
				title: entry.title,
				styles: entry.styles,
			  classes: entry.classes,
				attributes: entry.attributes,
			};
		};
	},
	entries: (state) => {
		return state.entries
	},
	active_entries: (state) => {
		return state.active_entries
	},

	time_ranges: (state) => {
		return state.time_ranges
	},
	week: (state) => {
		return state.week
	},

	entryByGuid: (state) => {
		return function (guid) {
			for(var i in state.entries) {
				if(state.entries[ i ].guid == guid) {
					return state.entries[ i ]
				}
			}
		};
	},

	originEntry: (state) => {
		return function (entry) {
			if(entry.origin_guid == '') {
				return entry;
			}
			for(var i in state.entries) {
				if(state.entries[ i ].guid == entry.origin_guid) {
					return state.entries[ i ]
				}
			}
		};
	},

	dayByTimestamp: (state) => {
		return function (timestamp) {
			timestamp = parseInt(timestamp);
			for(var i in state.time_ranges) {
				for(var j in state.time_ranges[ i ].ranges) {
					if(state.time_ranges[ i ].ranges[ j ].timestamp == timestamp) {
						return state.time_ranges[ i ].ranges[ j ];
					}
				}	
			}
		};
	},

	dayTimeByTimestamp: (state) => {
		return function (timestamp) {
			timestamp = parseInt(timestamp);
			for(var i in state.time_ranges[0].ranges) {
				for(var j in state.time_ranges[ 0 ].ranges[ i ].times) {
					if(state.time_ranges[ 0 ].ranges[ i ].times[ j ].timestamp == timestamp) {
						return state.time_ranges[ 0 ].ranges[ i ].times[ j ];
					}
				}	
			}
		};
	}

}