<template>
  <div>
    <calendar v-bind:calendar_entries="calendar_entries" v-bind:initial_options="options"></calendar>
  </div>
</template>
<style lang="scss">
  @import './assets/sass/general.scss';
  @import './assets/sass/dot-trail.scss';
</style>
<script>
import { mapActions, mapGetters } from 'vuex'
import calendar from './components/calendar/Calendar'
/**** 
== Callback ==

onEntryResize
onEntryMove
onEntryClick
onRangeSelect

****/
export default {

  components: {
    calendar
  },

  computed: {
    ...mapGetters([
      'entries'
    ])
  },

  data() {
    return {
      calendar_entries: [ ],
      options: {
        theme: 'original',
        locale: 'fi',
        entry_limit: 2,
        day_start: '07:00',
        day_end: '23:59:59',
        prev_nav: '<i class="fa fa-angle-left"></i>',
        next_nav: '<i class="fa fa-angle-right"></i>',
        type: 'month',
        format: {
          time: 'hh:mm a',
          date: 'L'
        },
        breakpoints: {
          767: { type: 'week', entry_limit: 2 },
          640: { type: 'day', entry_limit: 2 }
        },
        events: { move: true, select: true, resize: true },
        property_names: {
          en: { day: 'Day', week: 'Week', month: 'Month' },
          fi: { day: 'Päivä', week: 'Viikko', month: 'Kuukausi' },
        },
        hour_interval: '01:00:00',
        onRangeSelect: (start, end) => {
          var entries = this.entries;
          entries.push({
            title: 'Untitled',
            start: start.start.format('YYYY-MM-DD HH:mm'),
            end: end.end.format('YYYY-MM-DD HH:mm'),
            styles: {
              color: '#FFFFFF',
              background: 'rgba(255, 155, 0, 0.68)',
            }
          });
          console.log('Added', start, end);
          this.calendar_entries = entries;
        },
        onEntryClick: (entry, node) => {

          var old = document.getElementById('entry-overview');
          if(old) {
            old.remove();
          }

          var parent = node.parentElement;
          var entry_overview = document.createElement('div');

          entry_overview.setAttribute('id', 'entry-overview');
          entry_overview.style.top = (node.offsetTop + 30) + 'px';

          var close = document.createElement('a');
          close.innerHTML = '<i class="fa fa-times"></i>';
          close.style.float = 'right';
          close.setAttribute('href', '#');
          close.setAttribute('class', 'entry-overview-close');
          close.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            entry_overview.remove();
          });

          var name = document.createElement('p');
          name.innerHTML = entry.title;
          var time = document.createElement('p');
          time.innerHTML = entry.start + ' - ' + entry.end;

          var toolbox = document.createElement('div');
          toolbox.setAttribute('class', 'tootlbox');
          toolbox.style.textAlign = 'right';
          var edit = document.createElement('a');
          edit.style.display = 'inline-block';
          edit.style.margin = '0 5px';
          edit.setAttribute('href', '#');
          edit.innerHTML = '<i class="fa fa-pencil"></i>';
          var remove = document.createElement('a');
          remove.setAttribute('href', '#');
          remove.style.display = 'inline-block';
          remove.style.margin = '0 5px';
          remove.innerHTML = '<i class="fa fa-trash"></i>';

          toolbox.appendChild(edit);
          toolbox.appendChild(remove);
          entry_overview.appendChild(close);
          entry_overview.appendChild(name);
          entry_overview.appendChild(time);
          entry_overview.appendChild(toolbox);
          parent.appendChild(entry_overview);

        }
      }
    }
  },

  created() {
    this.calendar_entries = [
       {
        title: 'Long ass fucking name',
        start: '2017-08-19 15:00',
        end: '2017-08-26 18:00',
        styles: {
          color: '#FFFFFF',
          background: 'rgba(255, 155, 0, 0.68)',
        }
       },
       {
        title: 'Text text',
        start: '2017-08-19 15:00',
        end: '2017-08-19 18:00',
        styles: {
          background: 'rgba(155, 200, 0, 0.68)',
        }
       },
       {
        title: 'Drink beer',
        start: '2017-08-19 15:00',
        end: '2017-08-19 18:00',
        styles: {
          background: 'rgba(255, 0, 155, 0.68)',
        }
       },
       {
        title: 'Shots, shots, shots, shots',
        start: '2017-08-19 15:00',
        end: '2017-08-19 18:00',
        styles: {
          background: 'rgba(255, 0, 0, 0.68)',
        }
       },
       {
        title: 'Drink beer',
        start: '2017-08-08 15:00',
        end: '2017-08-08 18:00',
        styles: {
          background: 'rgba(0, 100, 200, 0.68)',
        }
      },
       {
        title: 'Drink beer',
        start: '2017-08-18 07:00',
        end: '2017-08-20 22:59:29',
        styles: {
          background: 'rgba(0, 100, 200, 0.68)',
        }
       },
    ];
  },

  methods: {
  }

}
</script>