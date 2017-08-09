<template>
  <td 
    @drop="onDrop"
    @dragover.prevent="onDragover"
    @click.stop.prevent="onClick"
    v-bind:class="day.classes" 
    v-bind:data-sanitized="day.sanitized"
    v-bind:data-timestamp="day.timestamp">
    {{ _isMonth() ? day.text : '' }}
    <entry v-for="(entry, k) in day_entries" 
    v-bind:key="k" 
    v-on:draggedOver="onDraggedOverEntry"
    v-bind:entry="entry"></entry>
  </td>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import entry from './Entry'
import helpers from '../../mixins/GeneralHelpers'
import calendar_helpers from '../../mixins/CalendarHelpers'
var moment = require('moment');
var _ = require('lodash');
export default {

  components: {
    entry
  },

  mixins: [ helpers, calendar_helpers ],

  computed: {
    ...mapGetters([
      'moving', 'resizing', 'selecting', 'entries',
      'time_ranges', 'date', 'options', 'targetDay', 'dayByTimestamp', 'dayTimeByTimestamp',
      'drag_event_entry', 'drag_event_origin_date', 'drag_event_on_date'
    ]),
    day_entries: function() {
      let entries = [ ];
      var day_format = this.day.start.format('X');
      for(let e in this.entries) {
        let start = this.entries[ e ].from.clone().format('X');
        if(this._isMonth()) {
          start = this.entries[ e ].from.clone().hours(0).minutes(0).seconds(0).format('X');
        }
        if(start == day_format) {
          entries.push(this.entries[ e ]);
        }
      }
      return entries;
    }
  },

  props: {
    day: null
  },

  data() {
    return {
      timer: null
    }
  },

  methods: {

    ...mapActions([
      'activateDay', 'activateEntry', 'setTargetDay', 'setDragEventOnDate', 'resetEvents', 'setDragEventEntry',
      'removeActiveEntries', 'restoreEntries', 'setWeeks', 'replaceEntry', 'appendEntries', 'resetActiveEntries'
    ]),

    onDrag(e) {
    },

    onDrop(e) {
      var self = this;
      setTimeout(function() {
        if(self.resizing) {
          if(self.options.onEntryResizeConfirm()) {
            self.resetEvents();
          } else {
            self.removeActiveEntries();
            self.restoreEntries();
          }
        } else if(self.moving) {
          if(self.options.onEntryMoveConfirm()) {
            self.resetEvents();
          } else {
            self.removeActiveEntries();
            self.restoreEntries();
          }
        }

        var entries = _.sortBy(self.entries, function(o) { return parseInt(o.origin_from.format('X')); });
        // this.entries = ent;
        var all_entries = [ ];
        for(let ent in entries) {
          var overlaps = self._getOverlappingEntries(entries[ ent ], all_entries);
          if(self._isMonth()) {
            var styles = _.cloneDeep(entries[ ent ].styles);
            styles.top = (overlaps.length * parseInt(entries[ ent ].styles.height)) + (5 * overlaps.length) + 20 + 'px';
            entries[ ent ].styles = styles;
          } else {
            var width = 100 / (overlaps.length + 1);
            entries[ ent ].styles.left = 10 + (20 * (overlaps.length)) + 'px';
            entries[ ent ].styles.width = 'calc(' + width + '% - 20px)';
            for(let e in overlaps) {
              overlaps[ e ].styles.width = 'calc(' + width + '% - 20px)';
            }
          }
          all_entries.push(entries[ ent ]);
        }

      }, 400);
    },

    onClick(e) {
    },

    onDragover(e) {
      if(this.drag_event_entry) {
        if(!this.drag_event_on_date) {
          this.setDragEventOnDate(this.day);
          if(this.moving) {
            this._doEntryMove();
          } else if(this.resizing) {  
            this._doEntryResize();
          }
        } else if(this.drag_event_on_date.timestamp != this.day.timestamp) {
          this.setDragEventOnDate(this.day);
          if(this.moving) {
            this._doEntryMove();
          } else if(this.resizing) {
            this._doEntryResize();
          }
        }
      }
    },

    onDraggedOverEntry(e, entry_element) {
      if(this.drag_event_entry && entry_element) {
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
          }
        }
      }
    },

    _doEntryMove() {

      if(!this.moving) {
        return;
      }

      if(!this.drag_event_entry || !this.drag_event_origin_date || !this.drag_event_on_date) {
        return;
      }

      var self = this;
      clearTimeout(this.timer);
      this.timer = setTimeout(function() {
        let entry = self.drag_event_entry,
        old_start = entry.origin_from,
        old_end = entry.origin_to,
        diff = moment.duration(old_end.diff(old_start));

        let start = self.drag_event_on_date.start.clone();
        if(self._isMonth()) {
          start = start.hours(old_start.hours()).minutes(old_start.minutes()).seconds(old_start.seconds());
        }
        let end = start.clone();
        end.add(diff);

        if(self._isWeek() && start.day() != end.day()) {
          let day_start = self._splitTimeStr(self.options.day_start);
          end.add(day_start.hours, 'hours');
        }

        entry.start = self._longFormat(start);
        entry.from = start;
        entry.end = self._longFormat(end);
        entry.to = end;
        // entry.most_top = 1;
        let entries = self._createEntryObjects([ entry ]);

        self.removeActiveEntries();
        for(let e in entries) {
          self.activateEntry(entries[ e ]);
        }

        self.appendEntries(entries);

      }, 500);
    },

    _doEntryResize() {

      if(!this.resizing) {
        return;
      }
      if(!this.drag_event_entry || !this.drag_event_origin_date || !this.drag_event_on_date) {
        return;
      }

      var self = this;
      clearTimeout(this.timer);
      this.timer = setTimeout(function() {
        let entry = _.cloneDeep(self.drag_event_entry),
        guid = entry.guid,
        old_start = moment(entry.start),
        old_end = moment(entry.end),
        moment_start = moment(entry.start),
        moment_end = self.drag_event_on_date.end;

        let tmp = moment_start.clone();

        if(self._isMonth()) {
          if(tmp.hours(0).minutes(0).seconds(0).format('X') > moment_end.format('X')) {
            return;
          }
        } else {
          if(tmp.format('X') > moment_end.format('X')) {
            return;
          }          
        }
        if(self.options.type == 'month') {
          moment_end.hours(old_end.hours());
        }
        entry.end = self._longFormat(moment_end);

        let entries = self._createEntryObjects([ entry ]);
        self.removeActiveEntries();
        for(let e in entries) {
          self.activateEntry(entries[ e ]);
        }

        self.appendEntries(entries);
      }, 400);
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