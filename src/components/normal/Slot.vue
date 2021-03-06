<template>
<td 
  draggable="true"
  @drop="onDrop"
  @dragstart="onDragstart"
  @dragover.prevent="onDragover"
  @click.stop.prevent="onClick"
  v-bind:class="day.classes"
  v-bind:data-sanitized="day.sanitized"
  v-bind:data-timestamp="day.timestamp">

  <span class="day-number" v-if="_isMonth()">{{ day.text }}</span>

  <entry v-for="(entry, k) in day_entries" 
  v-if="!entry.overflow"
  v-bind:key="k" 
  v-on:draggedOver="onDraggedOverEntry"
  v-on:entryClick="onEntryClicked"
  v-bind:entry="entry"></entry>

  <a v-if="has_overflow" href="#" v-on:click.prevent.stop="popup_open = true" class="entry-popup-toggle">
    <i class="fa fa-plus"></i>
  </a>

  <entryPopup v-if="has_overflow && popup_open">
    <div class="text-center" style="border-bottom: 2px solid #636363">All entries<br>{{ day.sanitized }}</div>

    <entry v-for="(entry, k) in day_entries" 
    v-bind:key="k" 
    v-on:draggedOver="onDraggedOverEntry"
    v-on:entryClick="onEntryClicked"
    v-bind:entry="entry"></entry>

    <a href="#" v-on:click.prevent.stop="popup_open = false" class="entry-popup-close"><i class="fa fa-times"></i></a>
  </entryPopup>

</td>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import entry from './Entry'
import entryPopup from './EntryPopup'
import helpers from '../../mixins/GeneralHelpers'
import calendar_helpers from '../../mixins/CalendarHelpers'
var moment = require('moment');
var _ = require('lodash');
export default {

  components: {
    entry, entryPopup
  },

  mixins: [ helpers, calendar_helpers ],

  computed: {
    ...mapGetters([
      'moving', 'resizing', 'selecting', 'entries', 'time_ranges', 'date', 'options', 'targetDay', 'dayByTimestamp', 'dayTimeByTimestamp',
      'drag_event_entry', 'drag_event_origin_date', 'drag_event_on_date', 'normalize_entry', 'get_attributes'
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
      popup_open: false,
      has_overflow: false
    }
  },

  created() {
  },

  methods: {

    ...mapActions([
      'setDragEventOnDate', 'resetEvents', 'setSelectingEvent', 'selectDayRange',
      'restoreEntries', 'updateEntries', 'setDragEventOriginDate'
    ]),

    onDrag(e) {
    },

    onDragstart(e) {
      let img = new Image();
      img.src = './src/assets/image/ghost.png';
      e.dataTransfer.setDragImage(img, 10, 10);
      this.setSelectingEvent(true);
      this.setDragEventOriginDate(this.day); // Find day object from store with the timestamp
    },

    onDrop(e) {
      var self = this;

      if((!this.drag_event_entry || !this.drag_event_on_date) && (this.moving || this.resizing)) {
        return;
      }

      if(self.resizing) {
        if(self.options.onEntryResize(this.normalize_entry(this.drag_event_entry))) {
          self.resetEvents();
        } else {
          self.restoreEntries();
        }
      } else if(self.moving) {
        if(self.options.onEntryMove(this.normalize_entry(this.drag_event_entry))) {
          self.resetEvents();
        } else {
          self.restoreEntries();
        }
      } else if(this.selecting) {
          if(typeof(this.options.onRangeSelect) == 'function') {
          if(this.drag_event_origin_date.start.format('X') < this.drag_event_on_date.end.format('X')) {
            this.options.onRangeSelect(this.drag_event_origin_date, this.drag_event_on_date);
          } else {
            this.options.onRangeSelect(this.drag_event_on_date, this.drag_event_origin_date);
          }
        } else {
          console.log('VuexCalendar: onRangeSelect callback is not a function.');
        }
        self.resetEvents();
      }
    },

    onClick(e) {
      console.log(this.day.start, this.day.end);
    },

    onDragover(e) {
      if(!this.drag_event_on_date) {
        this.setDragEventOnDate(this.day);
        if(this.moving && this.drag_event_entry) {
          this._doEntryMove();
        } else if(this.resizing && this.drag_event_entry) {  
          this._doEntryResize();
        } else if(this.selecting) {
          this._doDaySelect();
        }
      } else if(this.drag_event_on_date.timestamp != this.day.timestamp) {
        this.setDragEventOnDate(this.day);
        if(this.moving && this.drag_event_entry) {
          this._doEntryMove();
        } else if(this.resizing && this.drag_event_entry) {
          this._doEntryResize();
        } else if(this.selecting) {
          this._doDaySelect();
        }
      }
    },

    onDraggedOverEntry(e, entry_element) {
      if(entry_element) {
        let slot = this._getElementFromMousePosition(e.clientX, e.clientY, entry_element);
        if(!this.drag_event_on_date) {
          let d = this.dayTimeByTimestamp(slot.dataset.timestamp);
          if(!d) {
            return;
          }
          this.setDragEventOnDate(d);
          if(this.moving) {
            this._doEntryMove();
          } else if(this.resizing) {  
            this._doEntryResize();
          } else if(this.selecting) {  
            this._doDaySelect();
          }
        } else if(this.drag_event_on_date.timestamp != slot.dataset.timestamp) {
          let d = this.dayTimeByTimestamp(slot.dataset.timestamp);
          if(!d) {
            return;
          }
          this.setDragEventOnDate(d);
          if(this.moving) {
            this._doEntryMove();
          } else if(this.resizing) {
            this._doEntryResize();
          } else if(this.selecting) {
            this._doDaySelect();
          }
        }
      }
    },

    onEntryClicked(entry, node) {
      if(typeof(this.options.onEntryClick) == 'function') {
        this.options.onEntryClick(this.normalize_entry(entry), node, entry);
      } else {
        console.log('VuexCalendar: onEntryClick callback is not a function.');
      }
    },

    _doEntryMove: _.debounce(function() {

      if(!this.moving) {
        return;
      } else if(!this.drag_event_entry || !this.drag_event_origin_date || !this.drag_event_on_date) {
        return;
      }

      var entry = _.cloneDeep(this.drag_event_entry),
      old_start = entry.origin_from,
      day_start = this._splitTimeStr(this.options.day_start),
      day_end = this._splitTimeStr(this.options.day_end),
      start = this.drag_event_on_date.start.clone(),
      diff = moment.duration(start.diff(old_start)).asMilliseconds();
      let end = entry.origin_to.clone().add(diff);

      if(this._isMonth()) {
        start.hours(entry.from.hours());
        end.hours(entry.to.hours());
      }

      if(this._isWeek() && start.day() < end.day() && (end.hours() || end.minutes()) ) {
        if(start.hours() > end.hours()) {
          end.add(day_start.hours, 'hours');
        }
      }

      entry.end = this._longFormat(end);
      entry.start = this._longFormat(start);
      entry.from = start;
      entry.to = end;

      this.updateEntries([ this.get_attributes(entry) ]);
    }, 200),

    _doEntryResize: _.debounce(function() {

      if(!this.resizing) {
        return;
      }
      if(!this.drag_event_entry || !this.drag_event_origin_date || !this.drag_event_on_date) {
        return;
      }

      var self = this;
      let normalized_entry = this.normalize_entry(this.drag_event_entry);
      let entry = _.cloneDeep(normalized_entry),
      old_start = moment(entry.start),
      old_end = moment(entry.end),
      start = moment(entry.start),
      day_start = self._splitTimeStr(self.options.day_start),
      end = self.drag_event_on_date.end,
      tmp = start.clone();

      if(self._isMonth()) {
        if(tmp.hours(0).minutes(0).seconds(0).format('X') > end.format('X')) {
          return;
        }
      } else {
        if(tmp.format('X') > end.format('X')) {
          return;
        }
      }

      if(self._isMonth()) {
        end.hours(old_end.hours());
      }

      entry.end = self._longFormat(end);
      this.updateEntries([ this.get_attributes(entry) ]);
    }, 200),

    _doDaySelect() {
      if(!this.selecting) {
        return;
      } else if(!this.drag_event_origin_date || !this.drag_event_on_date) {
        return;
      }

      if(this.drag_event_origin_date.start.format('X') > this.drag_event_on_date.end.format('X')) {
        this.selectDayRange({
          start: this.drag_event_on_date.start,
          end: this.drag_event_origin_date.end
        });
      } else {
        this.selectDayRange({
          start: this.drag_event_origin_date.start,
          end: this.drag_event_on_date.end
        });
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