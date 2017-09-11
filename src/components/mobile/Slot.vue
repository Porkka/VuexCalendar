<template>
<td 
  draggable="true"
  @click.stop.prevent="onClick"
  v-bind:class="day.classes"
  v-bind:data-sanitized="day.sanitized"
  v-bind:data-timestamp="day.timestamp">
  <span class="day-number" v-if="_isMonth()">{{day.text}}
    <span class="entry-indicator" v-if="day_entries.length > 0"></span>
  </span>

  <entry v-for="(entry, k) in day_entries" 
  v-if="!entry.overflow && !_isMonth()"
  v-bind:key="k" 
  v-on:entryClick="onEntryClicked"
  v-bind:entry="entry"></entry>

</td>
</template>
<script>
import entry from './Entry'
import { mapGetters, mapActions } from 'vuex'
import helpers from '../../mixins/GeneralHelpers'
import calendar_helpers from '../../mixins/CalendarHelpers'
var moment = require('moment');
var _ = require('lodash');
export default {

  mixins: [ helpers, calendar_helpers ],

  components: { entry },

  computed: {
    ...mapGetters([
      'entries', 'date', 'options', 'normalize_entry'
    ]),
    day_entries: function() {
      let entries = [ ];
      this.has_overflow = false;
      var day_format = this.day.start.format('X');
      for(let e in this.entries) {
        let start = this.entries[ e ].from.clone().format('X');
        if(this._isMonth()) {
          start = this.entries[ e ].from.clone().hours(0).minutes(0).seconds(0).format('X');
        }
        if(start == day_format) {
          if(this.entries[ e ].overflow) {
            this.has_overflow = true;
          }
          entries.push(this.entries[ e ]);
        }
      }
      return entries;
    }
  },

  props: {
    day: null,
  },

  data() {
    return {
    }
  },

  created() {
  },

  methods: {

    ...mapActions([
    ]),

    onClick(e) {
      this.$emit('daySelected', this.day);
    },

    onEntryClicked(entry, node) {
      if(typeof(this.options.onEntryClick) == 'function') {
        this.options.onEntryClick(this.normalize_entry(entry), node);
      } else {
        console.log('VuexCalendar: onEntryClick callback is not a function.');
      }
    },

    onMousedown(e) {
    },

    onMouseup(e) {
    },

    onMousemove(e) {
    },

    onMouseover(e) {
    },
  }

}
</script>