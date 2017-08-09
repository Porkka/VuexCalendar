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

	entries: (state) => {
		return state.entries
	},
	active_entries: (state) => {
		return state.active_entries
	},

	time_ranges: (state) => {
		return state.time_ranges
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