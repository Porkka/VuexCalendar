export default {

  options: {
    theme: null,
    locale: 'fi',
    entry_limit: 3,
    type:  'month',
    day_start: '08:00',
    day_end: '23:59',
    prev_nav: '&laquo;',
    next_nav: '&raquo;',
    selected_date: null,
    breakpoints: { 767: { type: 'day', entry_limit: 2 } },
    events: { move: true, resize: true  , select: true },
    type_names: {
      en: { day: 'Day', week: 'Week', month: 'Month' },
      fi: { day: 'Päivä', week: 'Viikko', month: 'Kuukausi' },
    }, 
    hour_interval: '00:60:00',
    onEntryResizeConfirm: () => { return confirm('Are you sure you want to change this entry\'s length?'); },
    onEntryMoveConfirm: () => { return confirm('Are you sure you want to change this entry\'s position?'); }
  },

  weeks: [

  ],

  events: {
    moving: false,
    resizing: false,
    selecting: false
  },

  event_data: {
    drag: {
      entry: null,
      on_date: null,
      origin_date: null,
    },
  },

  entries: [

  ],

  active_entries: [

  ],

  active_days: [
	   
  ],

  target_day: null,

  backup_entries: [

  ],

}