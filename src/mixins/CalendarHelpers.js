var _ = require('lodash');
var moment = require('moment');
export default {

  methods: {

    _isDay() { return this.options.type == 'day' },
    _isWeek() { return this.options.type == 'week' },
    _isMonth() { return this.options.type == 'month' },

    _getOverlappingRange(range_start, range_end, entry_objects) {
      let self = this;
      let entries = entry_objects.filter(function(item) {
          let istart = parseInt(item.from.format('X')), iend = parseInt(item.to.format('X')),
          estart = parseInt(range_start.format('X')), eend = parseInt(range_end.format('X'));
          return (
            // Check if overlapping in any way
            ( istart >= estart && iend <= eend ) || // [ --- ]
            ( istart <= estart && iend > estart) || // -[ -- ]
            ( istart <= estart && iend >= eend ) || // --[ --- ]--
            ( istart <= eend && iend >= eend ) || // [ -- ]-
            ( (istart == eend || iend == estart ) && self._isMonth() ) 
          );
      });
      return entries;
    },


    calendarHeaders(moment) {
      if(this._isMonth()) {
        var headers = this.monthHeader(moment);
      } else if(this._isWeek()) {
        var headers = this.weekHeader(moment);
      }
      return headers;
    },

    _getOverlappingEntries(entry, entry_objects) {
      var clone = _.cloneDeep(entry);
      if(this._isMonth()) {
        clone.from.hours(0).minutes(0).seconds(0);
        clone.to.hours(23).minutes(59).seconds(59);
      }

      var self = this;
      var entries = entry_objects.filter(function(item) {
        if(item.guid != clone.guid) { // Skip if entry itself
          if(self._isMonth()) {
            var start = item.from.clone().hours(0).minutes(0).seconds(0);
            var end = item.to.clone().hours(0).minutes(0).seconds(0);
          } else {
            var start = item.from;
            var end = item.to;
          }
          var istart = parseInt(start.format('X')), iend = parseInt(end.format('X')),
          estart = parseInt(clone.from.format('X')), eend = parseInt(clone.to.format('X'));
          return (
            // Check if overlapping in any way
            ( istart >= estart && iend <= eend ) || // [ --- ]
            ( istart <= estart && iend > estart) || // -[ -- ]
            ( istart <= estart && iend >= eend ) || // --[ --- ]--
            ( istart <= eend && iend >= eend ) || // [ -- ]-
            ( (istart == eend || iend == estart ) && self._isMonth() ) // [ -- ]-
          );
        }
      });
      return entries;
    }

	}

}