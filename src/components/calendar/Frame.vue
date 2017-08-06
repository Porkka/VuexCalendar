<template>
	<table class="pb-main-table">
		<tr class="heading-row day-name-row">
			<th v-for="header in headers" class="day-title">{{ header.text }}</th>
		</tr>
		<tr class="heading-row">
			<th colspan="8">
				<a href="#" class="pb-nav prev" v-html="this.options.prev_nav"></a>
				<span class="pb-title">{{ this.title }}</span>
				<a href="#" class="pb-nav prev" v-html="this.options.next_nav"></a>
			</th>
		</tr>
		<tr class="entry-row" v-for="(week, k) in weeks">
      <day v-for="day in week.days" v-bind:day="day" v-bind:key="k"></day>
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
      'weeks', 'date', 'options', 'entries'
    ]),
  },

	data() {
		return {
			headers: [ ]
		}
	},

	created() {
		this._monthHeader(this.date)

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

	  _monthHeader(moment) {
		  // Header
		  moment.locale(this.locale);
		  var tmp = moment.clone();
		  var start = tmp.clone();
		  var end = tmp.clone();
		  start = start.startOf('month');
		  end = end.endOf('month');

		  this.title = start.format('MMMM') + ' ' + end.format('YYYY');

		  tmp = moment.clone();

		  var startWeek = tmp.startOf('isoWeek').clone();
		  var endWeek = tmp.endOf('isoWeek').clone();

		  // Loop trough the week and push generate day names as headers
		  while(startWeek.format('d') != endWeek.format('d')) {
				var cell = {
					text: startWeek.format('dddd').substr(0, 2)
				};
				startWeek.add(1, 'days');
				// Append to table headers
				this.headers.push(cell);
		  }
		  // Last cell
			var cell = {
				text: startWeek.format('dddd').substr(0, 2),
				sanitized: startWeek.format('l')
			};
			startWeek.add(1, 'days');
			// Append to table headers
			this.headers.push(cell);
	  },

	}

}
</script>