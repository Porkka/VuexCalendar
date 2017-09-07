<template>
  <div v-bind:class="classObj">


    <div class="heading">
      <a href="#" class="vxc-nav prev" id="prev" v-html="this.options.prev_nav" @click.prevent="prev"></a>
      <span class="vxc-title" v-html="this.title"></span>
      <a href="#" class="vxc-nav next" id="next" v-html="this.options.next_nav" @click.prevent="next"></a>
    </div>

    <div v-bind:class="calendar_container.classes">
      <table class="vxc-main-table">
        <tr class="heading-row day-name-row" v-if="!_isDay()">
          <th class="entry-row" v-if="!_isMonth()"></th>
          <th v-for="header in headers" v-bind:class="[header.classes, 'day-title']" v-html="header.text" v-if="!_isDay()"></th>
        </tr>
        <tr v-if="_isMonth()" class="entry-row" v-for="(week, k) in time_ranges">
          <time-slot v-for="day in week.ranges" v-bind:day="day" v-bind:key="k" v-on:daySelected="daySelected"></time-slot>
        </tr>
        <tr class="entry-row" v-if="!_isMonth()" v-for="(time, l) in time_ranges[0].ranges[0].times">
          <td v-text="time.text"></td>
          <time-slot v-for="(range, k) in time_ranges[0].ranges" v-bind:day="range.times[ l ]" v-bind:key="l" v-on:daySelected="daySelected"></time-slot>
        </tr>
      </table>
    </div>


    <ul v-bind:class="entry_list.classes"
      draggable="true"
      @dragstart.stop="calendar_container.classes.closed =! calendar_container.classes.closed">
      <li class="vxc-selected-date">{{ date.format('L') }}</li>
      <li v-for="(entry, k) in date_entries">
        <entry 
        v-bind:key="k" 
        v-on:entryClick="entrySelected"
        v-bind:entry="entry"></entry>
      </li>
    </ul>
    <div class="vxc-tools">
      <div v-if="!entry && !edit">
        <a href="new" @click.prevent="create_new = true"><i class="fa fa-plus"></i><br>Uusi</a>
        <a href="month" @click.prevent="options.type = 'month'" v-bind:class="[ options.type == 'month' ? 'active' : '' ]"><i class="fa fa-calendar"></i><br>Kuukausi</a>
        <a href="week" @click.prevent="options.type = 'week'" v-bind:class="[ options.type == 'week' ? 'active' : '' ]"><i class="fa fa-calendar"></i><br>Viikko</a>
        <a href="day" @click.prevent="options.type = 'day'" v-bind:class="[ options.type == 'day' ? 'active' : '' ]"><i class="fa fa-clock-o"></i><br>Päivä</a>
      </div>

      <div v-if="entry">
        <a href="new" @click.prevent="create_new = true"><i class="fa fa-plus"></i><br>Uusi</a>
        <a href="edit" @click.prevent="edit = true"><i class="fa fa-pencil"></i><br>Muokkaa</a>
        <a href="remove" @click.prevent="removeEntry()"><i class="fa fa-trash"></i><br>Poista</a>
      </div>

    </div>

    <transition name="custom-classes-transition"
    enter-active-class="animated slideInRight"
    leave-active-class="animated slideOutRight">
    <entry-overview v-bind:entry="entry" v-if="entry" v-on:back="entry=null"></entry-overview>
    </transition>

    <div v-if="loading" class="loading-overlay"><div class="loader"></div></div>
  </div>
</template>

<style lang="scss">
@import '../../../node_modules/animate.css/animate.min.css';
@import '../../assets/sass/simple-mobile.scss';
</style>
<script>
import entry from './Entry'
import time_slot from './Slot'
import entry_overview from './EntryOverview'
import { mapGetters, mapActions } from 'vuex'
import helpers from '../../mixins/GeneralHelpers'
import calendar_helpers from '../../mixins/CalendarHelpers'

var _ = require('lodash');
var moment = require('moment');

export default {

  components: {
    'entry': entry,
    'time-slot': time_slot,
    'entry-overview': entry_overview
  },

  mixins: [ helpers, calendar_helpers ],

  computed: {
    ...mapGetters([ 'entries', 'time_ranges', 'options', 'normalized_entries' ]),
    type() {
      return this.options.type
    }
  },

  watch: {
    date: function() {
      this.renderCalendar();
      this.renderEntries();
    },
    type: function() {
      // Reset type class
      this.classObj.day = this.classObj.week = this.classObj.month = false;
      this.classObj[this.options.type] = true;
      // Create and render new times data (thus the calendar)
      this.renderCalendar();
      // Re-render entries to fit the new calendar theme
      this.setEntries( this.normalized_entries );
    },
  },

  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  },

  data() {
    return {
      title: '',
      times: [ ],
      date: null,
      edit: false,
      entry: null,
      headers: [ ],
      loading: false,
      date_entries: [ ],
      create_new: false,
      initial_date: null,
      selected_date: null,
      initial_options: null,
      calendar_container: { classes: { 'calendar-container': true, 'closed': false } },
      entry_list: { classes: { 'open': false, 'vxc-entries': true } }, 
      classObj: { 'vuex-calendar': true, 'mobile': true },
    }
  },

  created() {

    this.classObj[this.options.type] = true;
    if(this.options.theme) {
      this.classObj[this.options.theme] = true;
    }

    this.initial_options = _.cloneDeep(this.options);

    this.initial_date = this.options.selected_date ? this.options.selected_date : moment();
    this.date = this.initial_date.clone();
    this.date.locale(this.options.locale);

    this.renderCalendar();
    this.renderEntries();
  },

  methods: {

    ...mapActions([ 'setSelectedDate', 'setOptions',  'setTimeRanges', 'setEntries', 'refreshEntries' ]),

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
      var date_clone = this.date.clone();
      date_clone.hours(0).minutes(0).seconds(0);
      var date_now = date_clone.format('l'),
        stamp_now = date_clone.format('X'),
        month_no_now = date_clone.format('M'),
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
            'selected': false, 'past': false, 'today': false,
            'future': false, 'prev-month': false, 'next-month': false, 'skeleton date-row': true,
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
        if(this.times[t].format('l') == date_clone.format('l')) {
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

    daySelected(date) {
      this.date = date.start;
    },
    entrySelected(entry) {
      this.entry = entry;
    },

    prev() {
      this.loading = true;
      var el = document.getElementById('prev');
      el.className += ' pulse';
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
      this.renderCalendar();
      this.loading = false;
      setTimeout(function() {
        el.className = el.className.replace(' pulse');
      }, 1000);
    },

    next(e) {
      this.loading = true;
      var el = document.getElementById('next');
      el.className += ' pulse';
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
      this.renderCalendar();
      this.loading = false;
      setTimeout(function() {
        el.className = el.className.replace(' pulse');
      }, 1000);
    },

/*** HELPERS ***/
    renderCalendar() {
      this.times = this._createTimes();
      if(this._isMonth()) {
        var calendar_dates = this._createMonth();
      } else {
        var calendar_dates = this._createWeek();
      }
      let clone = this.date.clone();
      this.title = this.calendarTitle(clone);
      this.headers = this.calendarHeaders(clone);
      this.setTimeRanges(calendar_dates);
    },

    renderEntries() {

      let entries = [ ];
      var day_format = this.date.format('X');
      for(let e in this.entries) {
        let start = this.entries[ e ].from.clone().format('X');
        if(this._isMonth()) {
          start = this.entries[ e ].from.clone().hours(0).minutes(0).seconds(0).format('X');
        }
        if(start == day_format) {
          entries.push(this.entries[ e ]);
        }
      }
      this.date_entries = entries;
    },

    monthHeader(moment) {
      // Header
      moment.locale(this.locale);
      var tmp = moment.clone(),
      headers = [ ],
      startWeek = tmp.startOf('isoWeek').clone(),
      endWeek = tmp.endOf('isoWeek').clone();

      // Loop trough the week and push generate day names as headers
      while(startWeek.format('d') != endWeek.format('d')) {
        var cell = { text: startWeek.format('dddd').substr(0, 2) };
        startWeek.add(1, 'days');
        // Append to table headers
        headers.push(cell);
      }
      // Last cell
      var cell = {
        text: startWeek.format('dddd').substr(0, 2),
        sanitized: startWeek.format('l')
      };
      startWeek.add(1, 'days');
      // Append to table headers
      headers.push(cell);

      return headers;
    },

    weekHeader(moment) {
      // Header
      moment.locale(this.locale);
      var tmp = moment.clone(), headers = [ ],
      date_now_str = this.initial_date.format('l'),
      startWeek = tmp.startOf('isoWeek').clone(), endWeek = tmp.endOf('isoWeek').clone();
      var range = startWeek.format(this.options.format.date) + ' - ' + endWeek.format(this.options.format.date);
      while(startWeek.format('d') != endWeek.format('d')) {
        var cell = {
          text: startWeek.format('dddd').substr(0, 2) +'<br>'+ startWeek.format(this.options.format.date),
          classes: {
            today: (startWeek.format('l') == date_now_str)
          }
        };
        startWeek.add(1, 'days');
        // Append to table headers
        headers.push(cell);
      }
      var cell = { text: startWeek.format('dddd').substr(0, 2) +'<br>'+ startWeek.format(this.options.format.date) };
      startWeek.add(1, 'days');
      // Append to table headers
      headers.push(cell);
      return headers;
    },

    dayHeader(moment) {
      // Header
      moment.locale(this.locale);
      var headers = [ ];
      var tmp = moment.clone();
      var cell = { text: tmp.format('dddd').substr(0, 2) };
      headers.push(cell);
      return headers;
    },

    calendarTitle(moment) {
      if(this._isMonth()) {
        let start = moment.startOf('month'), end = moment.endOf('month');
        return '<span class="month-name">' + start.format('MMMM') + '</span>' + ' <span class="year">' + end.format('YYYY') + '</span>';
      } else if(this._isWeek()) {
        let startWeek = moment.startOf('isoWeek').clone();
        let endWeek = moment.endOf('isoWeek').clone();
        return startWeek.format('L') + ' - ' + endWeek.format('L');
      } else if(this._isDay()) {
        return moment.format('dddd') + '<br>' + moment.format('L');
      }
    },

    calendarHeaders(moment) {
      if(this._isMonth()) {
        var headers = this.monthHeader(moment);
      } else if(this._isWeek()) {
        var headers = this.weekHeader(moment);
      }
      return headers;
    },

    rangeSelect(start, end) {
      this.$emit('onRangeselect', start, end);
    },

  } // Methods
}
</script>