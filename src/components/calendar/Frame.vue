<template>
	<table class="pb-main-table">
		<tr class="heading-row day-name-row">
			<th class="entry-row" v-if="!_isMonth()"></th>
			<th v-for="header in headers" class="day-title" v-html="header.text"></th>
		</tr>
		<tr class="heading-row">
			<th colspan="8">
				<a href="#" class="pb-nav prev" v-html="this.options.prev_nav"
				@click.stop.prevent="previousView"></a>
				<span class="pb-title">{{ this.title }}</span>
				<a href="#" class="pb-nav next" v-html="this.options.next_nav"
				@click.stop.prevent="nextView"></a>
			</th>
		</tr>
		<tr v-if="_isMonth()" class="entry-row" v-for="(range, k) in time_ranges">
      <day v-for="time in range.times" v-bind:day="time" v-bind:key="k"></day>
		</tr>
		<tr class="entry-row" v-if="!_isMonth()" v-for="(time, l) in time_ranges[0].ranges[0].times">
			<td v-text="time.text"></td>
			<day v-for="(range, k) in time_ranges[0].ranges" v-bind:day="range.times[ l ]" v-bind:key="l"></day>
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
	    } else {
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
		} else {
		  this.headers = this.weekHeader(clone);
		}

		this.title = this.calendarTitle(clone);

    var all_entries = [ ];
    for(let ent in this.entries) {
      var overlaps = this._getOverlappingEntries(this.entries[ ent ], all_entries);
      if(this._isMonth()) {
        this.entries[ ent ].styles.top = (overlaps.length * parseInt(this.entries[ ent ].styles.height)) + (5 * overlaps.length) + 20 + 'px';
      }
      all_entries.push(this.entries[ ent ]);
    }
	},

	methods: {

	  monthHeader(moment) {
		  // Header
		  moment.locale(this.locale);
		  var tmp = moment.clone();
		  var headers = [ ];

		  var startWeek = tmp.startOf('isoWeek').clone();
		  var endWeek = tmp.endOf('isoWeek').clone();

		  // Loop trough the week and push generate day names as headers
		  while(startWeek.format('d') != endWeek.format('d')) {
				var cell = {
					text: startWeek.format('dddd').substr(0, 2)
				};
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
      var range = startWeek.format('L') + ' - ' + endWeek.format('L');
      while(startWeek.format('d') != endWeek.format('d')) {
				var cell = {
					text: startWeek.format('dddd').substr(0, 2) +'<br>'+ startWeek.format('l')
				};
				startWeek.add(1, 'days');
				// Append to table headers
				headers.push(cell);
      }

			return headers;
	  },

	  calendarTitle(moment) {
	    if(this._isMonth()) {
				let start = moment.startOf('month'),
				end = moment.endOf('month');
				return start.format('MMMM') + ' ' + end.format('YYYY');
	    } else {
			  let startWeek = moment.startOf('isoWeek').clone();
			  let endWeek = moment.endOf('isoWeek').clone();
				return startWeek.format('L') + ' - ' + endWeek.format('L');
	    }
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