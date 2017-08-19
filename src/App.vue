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
        entry_limit: 3,
        day_start: '07:00',
        day_end: '23:59:59',
        prev_nav: '<i class="fa fa-angle-left"></i>',
        next_nav: '<i class="fa fa-angle-right"></i>',
        type: 'day',
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
      }
    }
  },

  created() {
    this.entries = [
       {
        title: '0000',
        start: '2017-08-19 15:00',
        end: '2017-08-19 18:00',
        styles: {
          background: 'red',
        }
       },
    ];
  },

  methods: {
  }

}
</script>