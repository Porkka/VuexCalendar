<template>
  <div>
    <calendar v-bind:entries="entries" v-bind:initial_options="options"></calendar>
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

  data() {
    return {
      entries: [ ],
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
        onEntryClick: (entry, node) => {
          var parent = node.parentElement;
          var entry_overview = document.createElement('div');
          entry_overview.setAttribute('class', 'entry-overview');
          entry_overview.style.zIndex = '11';
          entry_overview.style.height = '100px';
          entry_overview.style.padding = '5px 10px';
          entry_overview.style.width = '400px';
          entry_overview.style.border = '1px solid #DEDEDE';
          entry_overview.style.background = '#FFFFFF';
          entry_overview.style.position = 'absolute';
          entry_overview.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.25)';
          entry_overview.style.top = (node.offsetTop + 30) + 'px';
          entry_overview.style.transform = 'translateX(-50%)';
          entry_overview.style.left = '50%';

          var close = document.createElement('a');
          close.innerHTML = '<i class="fa fa-times"></i>';
          close.style.float = 'right';
          close.setAttribute('class', 'entry-overview-close');

          entry_overview.appendChild(close);
          parent.appendChild(entry_overview);

        }
      }
    }
  },

  created() {
    this.entries = [
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
    ];
  },

  methods: {
  }

}
</script>