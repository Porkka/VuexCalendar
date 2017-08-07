<template>
  <div v-bind:id="id" v-bind:class="classObj">
    <frame v-on:prev="prev" v-on:next="next"></frame>
  </div>
</template>

<script>
import frame from './Frame'
import { mapGetters, mapActions } from 'vuex'
import helpers from '../../mixins/GeneralHelpers'
import calendar_helpers from '../../mixins/CalendarHelpers'

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
    options: null
  },

  data() {
    return {
      id: null,
      classObj: {
        'pb-calendar': true
      },
      times: [

      ],
      calendar_entries: [
        // 
      ],
      date: moment(this.options.selected_date),
    }
  },

  created() {

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

    if(this.options) {
      this.setOptions(this.options);
    }

    let entry_objects = this._createEntryObjects(this.entries);

    this.times = this._createTimes();
    if(this._isMonth()) {
      let calendar_dates = this._createMonth();
      this.setEntries(entry_objects);
      // calendar_dates = this._setEntriesToDates(calendar_dates, entry_objects);
      this.setTimeRanges(calendar_dates);
    } else {
      let calendar_dates = this._createWeek();
      this.setEntries(entry_objects);
      this.setTimeRanges(calendar_dates);
    }
  },

  mounted()  {
  },

  methods: {

    ...mapActions([
      'setSelectedDate', 'setOptions', 'setTimeRanges', 'setEntries'
    ]),

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
        tmp = this.date.clone(),
        week = { days: [ ] },
        weeks = [ ];

      for(var t in this.times) {

        if(t % 7 == 0 && t!=0) { // Row every 7th
          weeks.push(week);
          var week = {
              days: [ ]
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
          classes: {
            'pb-past': false,
            'pb-today': false,
            'pb-future': false,
            'pb-prev-month': false,
            'pb-next-month': false,
            'pb-skeleton date-row': true,
          },
          sanitized: this.times[t].format('l'),
          timestamp: this.times[t].format('X'),
          text: this.times[t].format('DD'),
          title: this.times[t].format('L')
        };

        // Prev and next month classes
        if(this.times[t].format('M') < month_no_now) { 
          day.classes['pb-prev-month'] = true;
        } else if( this.times[t].format('M') > month_no_now) {
          day.classes['pb-next-month'] = true;
        }

        // Today class
        if(this.times[t].format('l') == date_now) {
          day.classes['today'] = true;
        }

        // Add indicators for past and future times
        if(this.times[t].format('X') < stamp_now) {
          day.classes['pb-past'] = true;
        } else if(this.times[t].format('l') != date_now) {
          day.classes['pb-future'] = true;
        }

        week.days.push(day);
      }
      return weeks;
    },

    _createWeek() {

      var clone = this.date.clone();

      var date_now = clone.format('l'),
        stamp_now = clone.format('X'),
        month_no_now = clone.format('M'),
        start = clone.isoWeekday(1).clone(),
        end = clone.endOf('week').clone(),
        week = { ranges: [ ] };

      var day_end = this._splitTimeStr(this.options.day_end);
      var day_start = this._splitTimeStr(this.options.day_start);
      var interval = this._splitTimeStr(this.options.hour_interval);
      var end_day = 7, start_day = 0;
      while(start_day < end_day) {

        var tmp = start.clone();
        tmp.add(start_day, 'days');
        tmp.hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds);

        var tmp_end = tmp.clone();
        tmp_end = tmp_end.hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds);

        // Add data attributes for easier manipulation
        var day = {
          end: tmp_end,
          start: tmp,
          entries: [ ],
          classes: {
            'pb-past': false, 'pb-today': false, 'pb-future': false,
            'pb-prev-month': false, 'pb-next-month': false, 'pb-skeleton date-row': true,
          },
          sanitized: tmp.format('L'),
          timestamp: tmp.format('X'),
          text: tmp.format('hh:mm'),
          title: tmp.format('L'),
          times: [ ]
        };

        // Prev and next month classes
        if(tmp.format('M') < month_no_now) { 
          day.classes['pb-prev-month'] = true;
        } else if(tmp.format('M') > month_no_now) {
          day.classes['pb-next-month'] = true;
        }

        for(let t in this.times) {
          tmp = tmp.clone();
          tmp_end = tmp.clone();
          tmp.hours(this.times[t].hours()).minutes(this.times[t].minutes()).seconds(this.times[t].seconds());
          tmp_end.add(interval.hours, 'hours').add(interval.minutes, 'minutes').seconds(interval.seconds, 'seconds');
          // Add data attributes for easier manipulation
          let time = {
            start: tmp,
            end: tmp_end,
            entries: [ ],
            classes: {
              'pb-past': false, 'pb-today': false, 'pb-future': false,
              'pb-prev-month': false, 'pb-next-month': false, 'pb-skeleton date-row': true,
            },
            sanitized: tmp.format('L, hh:mm'),
            timestamp: tmp.format('X'),
            text: tmp.format('hh:mm'),
            title: tmp.format('L')
          };

          day.times.push(time);
        }

        start_day++;
        week.ranges.push(day);
      }

      return [ week ];
    },

    prev() {
  
      if(this._isMonth()) {
        this.date.subtract(1, 'months').clone()
      }
      this.options.selected_date = this._longFormat(this.date);

      this.times = this._createTimes();
 
      if(this.options.type == 'month') {
        let calendar_dates = this._createMonth();
        // calendar_dates = this._setEntriesToDates(calendar_dates, entry_objects);
        this.setTimes(calendar_dates);
      }

      this.setSelectedDate(this.date);
    },

    next() {
   
      if(this._isMonth()) {
        this.date.add(1, 'months').clone()
      } else if(this._isWeek()) {
        this.date.add(7, 'days').clone()
        console.log(this.date);
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
    },


/*** HELPERS ***/
    /** Starting and ending dates are the dates supplied as parameters **/
    _rangeToDays(a_date, b_date) {
      // var start = moment(a_date);
      // var end = moment(b_date);
      // var tmp = start.clone();

      // // Days to add to start and to end to get full weeks
      // var start_num = 24 - start.hour() - start.minutes() / 60 - 0.01;
      // var end_num = 24 - end.hour() - end.minutes() / 60 - 0.01;

      // // Return variable
      // var days = [ ];

      // // Init day variable and add first day to return array
      // var day = { start: null, end: null };
      // day.start = this._longFormat(tmp);
      // tmp.add(start_num, 'hours');
      // day.end = this._longFormat(tmp);

      // // Loop till too far (same day as the parameter end date)
      // while(tmp.format('x') <= end.format('x')) {
      //   // Add to return value
      //   days.push(day);
      //   var day = { start: null, end: null };
      //   // Skip to monday
      //   tmp.add(1, 'hours');
      //   day.start = this._longFormat(tmp);
      //   // Skip to sunday
      //   tmp.add(23, 'hours');
      //   day.end = this._longFormat(tmp);
      // }
      // tmp.subtract(end_num, 'hours');
      // day.end = this._longFormat(tmp);
      // // Add to return value
      // days.push(day);

      // return days;
    },

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
    }

  } // Methods
}
</script>
<style>/*** === CORE SKELETON === ***/
.pb-calendar {
  position: relative;
}
.pb-calendar .entry {
  z-index: 10;
  color: #FFFFFF;
  cursor: pointer;
  padding: 2px 4px;
  position: absolute;
  transition: 0.15s all;
  border: 1px solid #424242;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.pb-calendar .entry:hover {
  opacity: 0.95;
}
.pb-calendar.table {
  position: relative;
}
.pb-calendar table {
  width: 100%;
  border-collapse: collapse;
}
.pb-calendar table th {
  height: 20px;
  text-align: center;
}
.pb-calendar .pb-nav {
}
.pb-calendar .pb-nav.prev {
}
.pb-calendar .pb-nav.next {
}
.pb-calendar table .day-name-row {
}
.pb-calendar table .day-title {
  text-transform: uppercase;
}
.pb-calendar table td.pb-time {
  width: 80px;
}
.pb-calendar table td {
  height: auto;
  padding: 0 0 0 10px;
  position: relative;
  transition: 0.15s background;
  border: 1px solid #DEDEDE;
  -webkit-user-select: none;  /* Chrome all / Safari all */
  -moz-user-select: none;     /* Firefox all */
  -ms-user-select: none;      /* IE 10+ */
  user-select: none;          /* Likely future */
}
.pb-calendar td.selected {
  background-color: #EAEDFF;
}
.pb-calendar table td span {
  display: block;
  color: #FFFFFF;
  padding: 10px 0;
  text-align: center;
}
/*** === /CORE SKELETON === ***/


/*** === MODIFIERS === ***/
.pb-calendar table td.pb-past span:not(.entry) {
}
.pb-calendar table td.pb-prev-month span:not(.entry),
.pb-calendar table td.pb-next-month span:not(.entry) {
  opacity: 0.55;
  color: #424242;
  background-color: #D4D2D2;
}
/*** === /MODIFIERS === ***/

/*** === MONTH === ***/
.pb-calendar.month table td {
    width: 244px;
  height: 120px;
  position: relative;
    vertical-align: top;
}
a.pb-read-more {
  left: 50%;
    bottom: 0;
    width: 66px;
    font-size: 13px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    text-overflow: clip;
    transform: translateX(-50%);
}
.pb-read-more-container {
  top: 100%;
  z-index: 100;
  padding: 14px;
  display: none;
  border-radius: 4px;
  position: absolute;
  border: 1px solid #DEDEDE;
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
.pb-read-more-container .entry {
  position: relative !important;
}
.week .pb-resizer {
  left: 50%;
  margin: 0;
  bottom: 0;
  width: 90%;
  float: none;
  height: 12px;
  display: block;
  cursor: s-resize;
  background-color: aliceblue;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: absolute;
  transform: translate(-50%, -30%);
}
.month .pb-resizer {
  margin: -2px -4px;
  width: 16px;
  height: 22px;
  float: right;
  display: block;
  cursor: e-resize;
  background-color: aliceblue;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/*** === /MONTH === ***/


@media screen and (max-width: 1200px) {

  .pb-calendar.container {
    width: 100%;
  }

}

</style>