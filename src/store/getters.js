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
			if(!state.entries[e].origin_guid) {
				// Push normalized
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
				if(state.entries[ ee ].origin_guid == e.guid) {
					if(state.entries[ ee ].to.format('X') > e.to.format('X')) {
						e.to = state.entries[ ee ].to;
						e.end = state.entries[ ee ].end;
					}
				}
			}
			return e;
		};
	},
	normalize_entry: (state, getters) => {
		return function(entry) {
			if(entry.origin_guid) { // Get the origin guid
				var e = getters.concatenate_entry( getters.entryByGuid(entry.origin_guid) );
			} else {
				var e = getters.concatenate_entry(entry);
			}
			return {
				from: e.from,
				to: e.to,
				start: e.start,
				end:  e.end,
				title: e.title,
				styles: e.styles,
				guid: e.guid,
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