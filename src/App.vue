<template>
  <div>
    <calendar v-bind:entries="entries" v-bind:options="options"></calendar>
  </div>
</template>
<style lang="scss">
  @import './assets/sass/general.scss'
</style>
<script>

import { mapActions, mapGetters } from 'vuex'
import calendar from './components/calendar/Calendar'

export default {

  components: {
    calendar
  },

  data() {
    return {
      entries: [ ],
      options: {
        theme: 'original',
        locale: 'en',
        entry_limit: 3,
        day_start: '08:00',
        day_end: '23:59:59',
        prev_nav: '&laquo;',
        next_nav: '&raquo;',
        type: 'week',
        format: {
          time: 'hh:mm a',
          date: 'L'
        },
        selected_date: '2017-08-01 10:00',
        breakpoints: {
          767: { type: 'day', entry_limit: 2 }
        },
        events: { move: true, select: true, resize: true },
        property_names: {
          en: { day: 'Day', week: 'Week', month: 'Month' },
          fi: { day: 'Päivä', week: 'Viikko', month: 'Kuukausi' },
        },
        hour_interval: '01:00:00',
        onEntryResizeConfirm: () => { return confirm('Are you sure you want to change this entry\'s length?'); },
        onEntryMoveConfirm: () => { return confirm('Are you sure you want to change this entry\'s position?'); }
      }
    }
  },

  created() {
    this.entries = [
       {
        title: '0000',
        start: '2017-07-31 09:00',
        end: '2017-07-31 13:55',
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