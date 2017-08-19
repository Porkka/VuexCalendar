<template>
  <div v-bind:id="id" v-bind:class="classObj">
    <frame v-on:prev="prev" v-on:next="next"></frame>
    <div v-if="loading" class="loading-overlay">
      <div class="loader"></div>
    </div>
  </div>
</template>

<script>
import frame from './Frame'
import { mapGetters, mapActions } from 'vuex'
import helpers from '../../mixins/GeneralHelpers'
import calendar_helpers from '../../mixins/CalendarHelpers'

var _ = require('lodash');
var moment = require('moment');

export default {

  components: {
    frame
  },

  mixins: [ helpers, calendar_helpers ],

  props: {
    entries: {
      default: function() {
        [ ]
      }
    },
    initial_options: null
  },

  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  },

  data() {
    return {
      id: null,
      loading: false,
      options: null,
      classObj: {
        'vuex-calendar': true
      },
      times: [

      ],
      calendar_entries: [
        // 
      ],
      date: null,
      initial_date: null,
    }
  },

  created() {

    if(this.initial_options) {
      this.setOptions(this.initial_options);
    }

    this.options = _.cloneDeep(this.initial_options);
    this.date = this.options.selected_date ? moment(this.options.selected_date).locale(this.options.locale) : moment().locale(this.options.locale);
    this.initial_date = this.options.selected_date ? moment(this.options.selected_date).locale(this.options.locale) : moment().locale(this.options.locale);

    // TODO set props from passed options

    if(!this.id) { // Generate id
      this.id = parseInt( Math.random(1) * 999 );
    }
 
    this.classObj[this.options.type] = true;
    if(this.options.theme) {
      this.classObj[this.options.theme] = true;
    }

    this.date.locale(this.options.locale);
    this.setSelectedDate(this.date);

    this.render();

    window.addEventListener('resize', this.handleResize)
  },

  mounted()  {
  },

  methods: {

    ...mapActions([
      'setSelectedDate', 'setOptions', 'setTimeRanges', 'setEntries'
    ]),

    handleResize() {
      this._checkBreakpoints();
    },

    _createTimes() {

      let interval = this._splitTimeStr(this.options.hour_interval);
      if(!interval.hours && !interval.minutes) {
        console.log('Invalid interval');
        interval.hours = 1;
      }

      // Create day start moment
      let start = this.date.clone();
      let day_start = this._splitTimeStr(this.options.day_start);
      start.hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds);
      // Create day end moment
      let end = start.clone();
      let day_end = this._splitTimeStr(this.options.day_end);
      end.hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds);

      let times = [ ];
      if(!this._isMonth()) {
        do {
          times.push(start.clone());
          start.add(interval.hours, 'h');
          start.add(interval.minutes, 'm');
          start.add(interval.seconds, 's');
        } while(start.format('X') < end.format('X'));
      } else {
        start = start.startOf('month').clone();

        start.hours(0).minutes(0).seconds(0);
        let start_day_num = start.day();
        if(!start_day_num) {
          start_day_num = 7;
        }
        // Subtract so we get the start of the 1st week 
        start.subtract(start_day_num, 'd');
        while(times.length < 49) { // Example output Mon. 26.6.2017....Sun. 6.8.2017
          start.add(1, 'd');
          times.push(start.clone());
        }
      }

      return times;
    },

    _createMonth() {
      var date_now = this.date.format('l'),
        stamp_now = this.date.format('X'),
        month_no_now = this.date.format('M'),
        week = { ranges: [ ] }, weeks = [ ];
      for(var t in this.times) {

        if(t % 7 == 0 && t!=0) { // Row every 7th
          weeks.push(week);
          var week = {
              ranges: [ ]
          };
        }

        var end = this.times[ t ].clone();
        var start = this.times[ t ].clone();
        start.hours(0).minutes(0).seconds(0);
        end.hours(23).minutes(59).seconds(59);
        // Add data attributes for easier manipulation
        var day = {
          end: end,
          start: start,
          entries: [ ],
          times: [ ],
          classes: {
            'selected': false,
            'past': false, 'today': false,
            'future': false, 'prev-month': false,
            'next-month': false, 'skeleton date-row': true,
          },
          sanitized: this.times[t].format('l'),
          timestamp: this.times[t].format('X'),
          text: this.times[t].format('DD'),
          title: this.times[t].format('L')
        };

        // Prev and next month classes
        if(this.times[t].format('M') < month_no_now) { 
          day.classes['prev-month'] = true;
        } else if( this.times[t].format('M') > month_no_now) {
          day.classes['next-month'] = true;
        }

        // Today class
        if(this.times[t].format('l') == this.initial_date.format('l')) {
          // console.log(this.times[t].format('l'));
          day.classes['today'] = true;
        }

        // Add indicators for past and future times
        if(this.times[t].format('X') < stamp_now) {
          day.classes['past'] = true;
        } else if(this.times[t].format('l') != date_now) {
          day.classes['future'] = true;
        }

        week.ranges.push(day);
      }
      return weeks;
    },

    _createWeek() {

      var clone = this.date.clone();
      var date_now = clone.format('l'),
        week = { ranges: [ ] },
        stamp_now = clone.format('X'),
        month_no_now = clone.format('M'),
        start = this._isWeek() ? clone.isoWeekday(1).clone() : this.date.clone(),
        end = clone.endOf('week').clone(),
        time_format = this.options.format.time,
        date_format = this.options.format.date,
        day_end = this._splitTimeStr(this.options.day_end),
        day_start = this._splitTimeStr(this.options.day_start),
        interval = this._splitTimeStr(this.options.hour_interval),
        length = interval.hours * 3600 + interval.minutes * 60 + interval.seconds,
        end_day = this._isWeek() ? 7 : 1,
        start_day = 0;

      while(start_day < end_day) {

        var tmp = start.clone();
        tmp.add(start_day, 'days');
        tmp.hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds);

        var tmp_end = tmp.clone();
        tmp_end = tmp_end.hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds);

        // Add data attributes for easier manipulation
        var day = {
          start: tmp,
          end: tmp_end,
          entries: [ ],
          classes: {
            'selected': false,
            'vxc-past': false, 'vxc-today': false, 'vxc-future': false,
            'vxc-prev-month': false, 'vxc-next-month': false, 'vxc-skeleton date-row': true,
          },
          sanitized: tmp.format('L'),
          timestamp: tmp.format('X'),
          text: tmp.format('hh:mm'),
          title: tmp.format('L'),
          times: [ ]
        };

        // Prev and next month classes
        if(tmp.format('M') < month_no_now) { 
          day.classes['vxc-prev-month'] = true;
        } else if(tmp.format('M') > month_no_now) {
          day.classes['vxc-next-month'] = true;
        }

        for(let t in this.times) {
          tmp = tmp.clone();
          tmp.hours(this.times[t].hours()).minutes(this.times[t].minutes()).seconds(this.times[t].seconds());
          tmp_end = tmp.clone();
          tmp_end.add(length, 'seconds');
          // console.log(tmp.format('L, HH:mm') + ' - ' + tmp_end.format('L, HH:mm'))
          // Add data attributes for easier manipulation
          let time = {
            start: tmp,
            end: tmp_end,
            entries: [ ],
            timestamp: tmp.format('X'),
            text: tmp.format(time_format),
            title: tmp.format(date_format + ', ' + time_format),
            sanitized: tmp.format(date_format + ', ' + time_format) + ' - ' + tmp_end.format(date_format + ', ' + time_format),
            classes: {
              'selected': false,
              'vxc-past': false, 'vxc-today': false, 'vxc-future': false,
              'vxc-prev-month': false, 'vxc-next-month': false, 'vxc-skeleton date-row': true,
            },
          };

          day.times.push(time);
        }

        start_day++;
        week.ranges.push(day);
      }

      return [ week ];
    },

    prev() {
      this.loading = true;
      if(this._isMonth()) {
        this.date.subtract(1, 'months').clone();
      } else if(this._isWeek()) {
        this.date.subtract(7, 'days').clone();
      } else if(this._isDay()) {
        this.date.subtract(1, 'days').clone();
      }

      this.options.selected_date = this._longFormat(this.date);
      this.times = this._createTimes();
 
      if(this.options.type == 'month') {
        let calendar_dates = this._createMonth();
        this.setTimeRanges(calendar_dates);
      } else {
        let calendar_dates = this._createWeek();
        this.setTimeRanges(calendar_dates);
      }
      this.setSelectedDate(this.date);
      this.loading = false;
    },

    next() {
      this.loading = true;
      if(this._isMonth()) {
        this.date.add(1, 'months').clone()
      } else if(this._isWeek()) {
        this.date.add(7, 'days').clone()
      } else if(this._isDay()) {
        this.date.add(1, 'days').clone();
      }
      this.options.selected_date = this._longFormat(this.date);
      this.times = this._createTimes();
      if(this._isMonth()) {
        let calendar_dates = this._createMonth();
        this.setTimeRanges(calendar_dates);
      } else {
        let calendar_dates = this._createWeek();
        this.setTimeRanges(calendar_dates);
      }
      this.setSelectedDate(this.date);
      this.loading = false;
    },

/*** HELPERS ***/
    _getOverlappingEntries(entry, entry_objects) {
      return entry_objects.filter(function(item) {
        if(item.guid != entry.guid) { // Skip if entry itself
          let istart = parseInt(item.from), iend = parseInt(item.to),
          estart = parseInt(entry.from), eend = parseInt(entry.to);
          return (
            // Check if overlapping in any way
            ( istart >= estart && iend <= eend ) || // [ --- ]
            ( istart <= estart && iend > estart) || // -[ -- ]
            ( istart <= estart && iend >= eend ) || // --[ --- ]--
            ( istart <= eend && iend >= eend ) // [ -- ]-
          );
        }
      });
    },

    _checkBreakpoints() {
      // Hunt for breakpoints
      var min_width = null;
      var cw = window.outerWidth;
      for(var w in this.options.breakpoints) {
          w = parseInt(w);
          if(( cw <= w && min_width == null ) || ( w < min_width && min_width != null )) {
              min_width = w;
          }
      }

      // If we got min_width => Set new options and rerender the calendar
      if(min_width) {
          var options = this._merge_options(this.options, this.options.breakpoints[ w ]);
      } else {
          var options = this.initial_options;
      }
      this.options = options;
      this.setOptions(options);
      this.render();
    },

    render() {
      let entry_objects = this._createEntryObjects(this.entries);
      this.times = this._createTimes();
      if(this._isMonth()) {
        let calendar_dates = this._createMonth();
        this.setEntries(entry_objects);
        this.setTimeRanges(calendar_dates);
      } else {
        let calendar_dates = this._createWeek();
        this.setEntries(entry_objects);
        this.setTimeRanges(calendar_dates);
      }
    },

  } // Methods
}
</script>