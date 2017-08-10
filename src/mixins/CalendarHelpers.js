var _ = require('lodash');
var moment = require('moment');
export default {

  methods: {

    _createEntryObjects(entries) {
      if(this._isMonth()) {
        var entry_objects = this._createMonthEntryObjects(entries);
      } else if(this._isWeek()) {
        var entry_objects = this._createWeekEntryObjects(entries);
      }
      

      return entry_objects;
    },

    _createMonthEntryObjects(entries) {
      let day_start = this._splitTimeStr(this.options.day_start),
      day_end = this._splitTimeStr(this.options.day_end),
      entry_objects = [ ];
      for(let ent in entries) {

        let entry = this._initEntryObject(entries[ ent ]);

        let tmp_start = entry.from.clone(),
        tmp_end = entry.to.clone();

        if(tmp_start.isoWeek() != tmp_end.isoWeek()) {
          // Clone so we don't change the existing one...
          var weeks = this._rangeToWeeks(tmp_start, tmp_end),
          weeks_count = weeks.length;
          var origin_guid = '';
          for(let i = 0; i < weeks_count; i++) {

            let split = _.cloneDeep(entry);
            split.guid = this._guid();
            if(!i) {
              origin_guid = split.guid;
            } else {
              split.origin_guid = origin_guid;
            }

            let tmp_start = moment(weeks[i].start).hours(day_start.hours).minutes(day_start.minutes).seconds(day_start.seconds);
            let tmp_end = moment(weeks[i].end).hours(day_end.hours).minutes(day_end.minutes).seconds(day_end.seconds);

            split.start = this._longFormat(tmp_start);
            split.end = this._longFormat(tmp_end);
            split.from = moment(split.start);
            split.to = moment(split.end);
            split.has_resizer = ( i + 1 ) == weeks_count;

            let day_diff = Math.abs(split.to.diff(split.from, 'days'));
            day_diff++;
            let w = (Math.max(day_diff, 1) * 100) - 20;
            if(day_diff > 1) {
              split.styles.width = 'calc(' + w + '%' + ' + ' + day_diff + 'px)';
            } else {
              split.styles.width =  w + '%';
            }
            entry_objects.push(split);
          }
        } else {
          entry.has_resizer = true;
          let day_diff = Math.abs(tmp_end.diff(tmp_start, 'days')) + 1;
          entry.styles.width = (Math.max(day_diff, 1) * 100) - 20 + '%';
          entry_objects.push(entry);
        }
      }
      return entry_objects;
    },

    _createWeekEntryObjects(entries) {
      let day_start = this._splitTimeStr(this.options.day_start),
      day_end = this._splitTimeStr(this.options.day_end),
      interval = this._splitTimeStr(this.options.hour_interval),
      length = interval.hours * 3600 + interval.minutes * 60,
      entry_objects = [ ];
      for(let ent in entries) {

        let entry = this._initEntryObject(entries[ ent ]),
        tmp_start = entry.from.clone(),
        tmp_end = entry.to.clone();

        if(tmp_start.day() != tmp_end.day()) {
          // Clone so we don't change the existing one...
          var days = this._rangeToDays(tmp_start, tmp_end),
          day_count = days.length;
          var origin_guid = '';
          for(let i = 0; i < day_count; i++) {

            let split = _.cloneDeep(entry),
            tmp_start = moment(days[i].start),
            tmp_end = moment(days[i].end);
            split.guid = this._guid();

            if(!i) {
              origin_guid = split.guid;
            } else {
              split.origin_guid = origin_guid;
            }

            split.start = this._longFormat(tmp_start);
            split.end = this._longFormat(tmp_end);
            split.from = moment(split.start);
            split.to = moment(split.end);
            split.has_resizer = ( i + 1 ) == day_count;

            let diff = Math.floor(parseInt(tmp_end.diff(tmp_start, 'seconds')) / length);
            split.styles.height = 'calc(' + (diff * 100 - 15) + '% + ' + diff + 'px)';
            entry_objects.push(split);
          }
        } else {
          entry.has_resizer = true;
          let diff = Math.floor(parseInt(tmp_end.diff(tmp_start, 'seconds')) / length);
          entry.styles.height = 'calc(' + (diff * 100 - 15) + '% + ' + diff + 'px)';
          entry_objects.push(entry);
        }
      }
      return entry_objects;
    },

    _isDay() { return this.options.type == 'day' },
    _isWeek() { return this.options.type == 'week' },
    _isMonth() { return this.options.type == 'month' },

    /** Starting and ending dates are the dates supplied as parameters **/
    _rangeToWeeks(start, end) {
      let tmp = start.clone();

      let weeks = [ ];
      // Days to add to start and to end to get full weeks
      let start_num = 7 - tmp.isoWeekday();
      // Init week variable and add first week to return array
      let week = { start: null, end: null };
      week.start = this._longFormat(tmp);
      // Skip to sunday
      tmp.add(start_num, 'days');
      week.end = this._longFormat(tmp);
      // Loop till too far (same week as the parameter end date)
      let end_week = end.isoWeek();
      weeks.push(week);
      // Skip to monday
      tmp.add(1, 'days');
      let start_week = tmp.isoWeek();
      for (var i = start_week; i < end_week; i++) {
          week = { start: null, end: null };
          week.start = this._longFormat(tmp);
          // Skip to sunday
          tmp.add(6, 'days');
          week.end = this._longFormat(tmp);
          // Add to return value
          weeks.push(week);
          // Skip to monday
          tmp.add(1, 'days');
      };

      if(tmp.format('x') <= end.format('x')) {
          week = { start: null, end: null };
          week.start = this._longFormat(tmp);
          week.end = this._longFormat(end);
          // Add to return value
          weeks.push(week);
      }
      // Add to return value
      return weeks;
    },

    /** Starting and ending dates are the dates supplied as parameters **/
    _rangeToDays(start, end) {
        var days = [ ], tmp = start.clone(),
        day_start = this._splitTimeStr(this.options.day_start),
        day_end = this._splitTimeStr(this.options.day_end),
        start_num = 24 - start.hour() - start.minutes() / 60 - 0.01;

        // Init day variable and add first day to return array
        var day = { start: null, end: null };
        day.start = this._longFormat(tmp);
        tmp.add(start_num, 'hours');
        day.end = this._longFormat(tmp);
        days.push(day);
        while(tmp.day() < end.day()) {
            var day = { start: null, end: null };

            tmp.add('1', 'days').hours(day_start.hours).minutes(day_start.minutes);
            // console.log(tmp.format('L, HH:mm'));
            day.start = this._longFormat(tmp);

            tmp.hours(day_end.hours).minutes(day_end.minutes);
            if(tmp.format('x') > end.format('x')) { // Whoops! Too much
              tmp.hours(end.hours()).minutes(end.minutes());
            }
            // console.log(tmp.format('L, HH:mm'));
            day.end = this._longFormat(tmp);

            days.push(day);
        }
        return days;
    },

    _getOverlappingEntries(entry, entry_objects) {
      let entries = entry_objects.filter(function(item) {
        if(item.guid != entry.guid) { // Skip if entry itself
          let istart = parseInt(item.from.format('X')), iend = parseInt(item.to.format('X')),
          estart = parseInt(entry.from.format('X')), eend = parseInt(entry.to.format('X'));
          return (
            // Check if overlapping in any way
            ( istart >= estart && iend <= eend ) || // [ --- ]
            ( istart <= estart && iend > estart) || // -[ -- ]
            ( istart <= estart && iend >= eend ) || // --[ --- ]--
            ( istart <= eend && iend >= eend ) // [ -- ]-
          );
        }
      });
      return entries;
    },

    _initEntryObject(ent) {
      let entry = _.clone(ent);
    
      entry.guid = this._guid();
      entry.origin_from = entry.from = moment(entry.start).locale(this.options.locale);
      entry.origin_to = entry.to = moment(entry.end).locale(this.options.locale);
      entry.has_resizer = false;
      entry.origin_guid = '';
      entry.classes = { entry: true },
      entry.attributes = { },
      entry.styles = { height: '20px' };
      entry.text = entry.title;

      for(let key in ent) {
        if(key == 'attributes') {
          for(let a in ent[ key ]) {
            entry.attributes[ a ] = ent[ key ];
          }
        } else if(key == 'styles') { /** User defined styles **/
          for(let s in ent[ key ]) {
            entry.styles[ s ] = ent[ key ][ s ];
          }
        } else if(key != 'from' && key != 'tp') { /** User defined other properties set to element's data **/
          entry.attributes[ 'data-' + key ] = ent[ key ];
        }
      }

      return entry;
    },

	}

}