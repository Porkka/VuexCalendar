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

	weeks: (state) => {
		return state.weeks
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
			for(var i in state.weeks) {
				for(var j in state.weeks[ i ].days) {
					if(state.weeks[ i ].days[ j ].timestamp == timestamp) {
						return state.weeks[ i ].days[ j ];
					}
				}	
			}
		};  
	}

}