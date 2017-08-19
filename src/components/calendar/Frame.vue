<template>
	<table class="vxc-main-table">
		<tr class="heading-row day-name-row" v-if="!_isDay()">
			<th class="entry-row" v-if="!_isMonth()"></th>
			<th v-for="header in headers" class="day-title" v-html="header.text" v-if="!_isDay()"></th>
		</tr>
		<tr class="heading-row">
			<th colspan="9">
				<a href="#" class="vxc-nav prev" v-html="this.options.prev_nav" @click.stop.prevent="previousView"></a>
				<span class="vxc-title" v-html="this.title"></span>
				<a href="#" class="vxc-nav next" v-html="this.options.next_nav" @click.stop.prevent="nextView"></a>
			</th>
		</tr>
		<tr v-if="_isMonth()" class="entry-row" v-for="(week, k) in time_ranges">
      <day v-for="day in week.ranges" v-bind:day="day" v-bind:key="k" v-on:onRangeselect="rangeSelect"></day>
		</tr>
		<tr class="entry-row" v-if="!_isMonth()" v-for="(time, l) in time_ranges[0].ranges[0].times">
			<td v-text="time.text"></td>
			<day v-for="(range, k) in time_ranges[0].ranges" v-bind:day="range.times[ l ]" v-bind:key="l" v-on:onRangeselect="rangeSelect"></day>
		</tr>
	</table>
</template>
<script>
import day from './Day'
import entry from './Entry'
import { mapGetters, mapActions } from 'vuex'
import calendar_helpers from '../../mixins/CalendarHelpers'
export default {

	components: {
		entry, day
	},

  mixins: [ calendar_helpers ],

  computed: {
    ...mapGetters([
      'time_ranges', 'date', 'options', 'entries'
    ]),
  },

  watch: {

  	time_ranges: function() {
			let clone = this.date.clone();
	    this.title = this.calendarTitle(clone);
	    if(this._isMonth()) {
		    this.headers = this.monthHeader(clone);
	    } else if(this._isWeek()) {
		    this.headers = this.weekHeader(clone);
	    }
  	}

  },

  data: function() {
  	return {
  		title: '',
  		headers: [],
  	}
  },

	created() {

		let clone = this.date.clone();
		if(this._isMonth()) {
		  this.headers = this.monthHeader(clone);
		} else if(this._isWeek()) {
	    this.headers = this.weekHeader(clone);
    }

		this.title = this.calendarTitle(clone);

    var all_entries = [ ];
    for(let ent in this.entries) {
      var overlaps = this._getOverlappingEntries(this.entries[ ent ], all_entries);
      if(this._isMonth()) {
        this.entries[ ent ].styles.top = (overlaps.length * parseInt(this.entries[ ent ].styles.height)) + (5 * overlaps.length) + 20 + 'px';
      } else {
      	var width = 100 / (overlaps.length + 1);
      	this.entries[ ent ].styles.left = 10 + (20 * (overlaps.length)) + 'px';
        this.entries[ ent ].styles.width = 'calc(' + width + '% - 20px)';
        for(let e in overlaps) {
        	overlaps[ e ].styles.width = 'calc(' + width + '% - 20px)';
        }
      }
      all_entries.push(this.entries[ ent ]);
    }
	},

	methods: {

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
		  var tmp = moment.clone();
		  var headers = [ ];
		  var startWeek = tmp.startOf('isoWeek').clone();
		  var endWeek = tmp.endOf('isoWeek').clone();
      var range = startWeek.format(this.options.format.date) + ' - ' + endWeek.format(this.options.format.date);
      while(startWeek.format('d') != endWeek.format('d')) {
				var cell = { text: startWeek.format('dddd').substr(0, 2) +'<br>'+ startWeek.format(this.options.format.date) };
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
				return start.format('MMMM') + '<br>' + end.format('YYYY');
	    } else if(this._isWeek()) {
			  let startWeek = moment.startOf('isoWeek').clone();
			  let endWeek = moment.endOf('isoWeek').clone();
				return startWeek.format('L') + ' - ' + endWeek.format('L');
	    } else if(this._isDay()) {
				return moment.format('dddd') + '<br>' + moment.format('L');
	    }
	  },

	  rangeSelect(start, end) {
      this.$emit('onRangeselect', start, end);
	  },

	  previousView() {
	  	this.$emit('prev');
	  },

	  nextView() {
	  	this.$emit('next');
	  },

	}

}
</script>