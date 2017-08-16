export default {

	setSelectedDate: ({ commit }, date) => {
		commit('SET_DATE', date)
	},

	setOptions: ({ commit }, options) => {
		commit('SET_CALENDAR_OPTIONS', options)
	},

	selectDayRange: ({ commit }, payload) => {
		commit('SELECT_CALENDAR_RANGE', payload);
	},

	setTimeRanges: ({ commit }, time_ranges) => {
		commit('SET_CALENDAR_TIME_RANGES', time_ranges)
	},

	setEntries: ({ commit }, entries) => {
		commit('STORE_ENTRIES', entries)
	},

	appendEntries: ({ commit }, entries) => {
		commit('APPEND_ENTRIES', entries)
	},

	backupEntry: ({ commit }, entry) => {
		commit('BACKUP_ENTRY', entry)
	},

	restoreEntries: ({ commit }) => {
		commit('RESTORE_BACKUPS')
	},

	activateEntry: ({ commit }, entry) => {
		commit('ACTIVATE_ENTRY', entry)
	},

	removeActiveEntries: ({ commit }) => {
		commit('REMOVE_ACTIVE_ENTRIES')
	},

	activateDay: ({ commit }, entry) => {
		commit('ACTIVATE_DAY', entry)
	},

	setDragEventEntry: ({ commit }, entry) => {
		commit('DRAG_EVENT_ENTRY', entry)
  },

	setDragEventOnDate: ({ commit }, date) => {
		commit('DRAG_EVENT_ON_DATE', date)
	},

	setDragEventOriginDate: ({ commit }, date) => {
		commit('DRAG_EVENT_ORIGIN_DATE', date)
	},

	setMovingEvent: ({ commit }, bool) => {
		commit('SET_MOVING_EVENT', bool)
	},
	setSelectingEvent: ({ commit }, bool) => {
		commit('SET_SELECTING_EVENT', bool)
	},
	setResizingEvent: ({ commit }, bool) => {
		commit('SET_RESIZING_EVENT', bool)
	},
	resetEvents: ({ commit }) => {
		commit('RESET_EVENTS')
	},
	resetActiveEntries: ({ commit }) => {
		commit('RESET_ACTIVE_ENTRIES')
	}

}