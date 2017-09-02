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

	}

}