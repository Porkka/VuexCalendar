<template>
  <div>
    <component :is="calendar"></component>

    <transition name="custom-classes-transition"
    enter-active-class="animated slideInRight"
    leave-active-class="animated slideOutRight">
    <entry-overview v-bind:entry="entry"
    v-bind:editing="editing"
    v-if="entry"
    v-on:back="editing=entry=null"></entry-overview>
    </transition>
    <bottom-nav>
      <default-toolset :tools="tools"></default-toolset>
      <!-- Overview -->
      <div v-if="entry && !editing">
          <a href="new" @click.prevent="onEntryNewClick"><div><i class="fa fa-plus icon"></i>Uusi</div></a>
          <a href="edit" @click.prevent="onEntryEditClick"><div><i class="fa fa-pencil icon"></i>Muokkaa</div></a>
          <a href="remove" @click.prevent="onEntryRemoveClick"><div><i class="fa fa-trash icon"></i>Poista</div></a>
      </div>
      <!-- Saving entry (New / Edit) -->
      <div v-if="entry && editing">
          <a href="back" @click.prevent="editing=entry=null"><div><i class="fa fa-times icon"></i>Peruuta</div></a>
          <a href="save" @click.prevent="onEntrySaved"><div><i class="fa fa-floppy-o icon"></i>Tallenna</div></a>
      </div>
    </bottom-nav>
  </div>
</template>
<script>
var _ = require('lodash');
var moment = require('moment');
import { mapActions, mapGetters } from 'vuex'
import Normal from './components/normal/Calendar'
import Mobile from './components/mobile/Calendar'
import EntryOverview from './components/mobile/EntryOverview'
// Mobile components
import BottomNav from './components/mobile/toolbar/Container'
import DefaultToolset from './components/mobile/toolbar/toolsets/Default'

export default {

  components: {
    Normal,
    Mobile,
    BottomNav,
    EntryOverview,
    DefaultToolset
  },
 
  computed: {
    ...mapGetters([ 'entries', 'options' ]),
    type() {
      return this.options.type
    }
  },

  data() {
    return {
      entry: null,
      editing: false,
      calendar: 'mobile',

      tools: [
        {
          id: 'new',
          icon: 'fa fa-plus',
          text: 'Uusi',
          callback: () => {
            console.log('dfsfds');
          }
        },
        {
          id: 'month',
          icon: 'fa fa-calendar',
          text: 'Kuukausi',
          callback: () => {
            console.log('dfsfds');
          }
        },
        {
          id: 'week',
          icon: 'fa fa-calendar',
          text: 'Viikko',
          callback: () => {
            console.log('dfsfds');
          }
        },
        {
          id: 'day',
          icon: 'fa fa-clock-o',
          text: 'Päivä',
          callback: () => {
            console.log('dfsfds');
          }
        },
      ],

      form: {
        errors: [ ],
        entry: { from: '', to: '', name: '' },
      },

      modal: {
        class_obj: { modal: true, 'is-active': false }
      },

    }
  },

  methods: {

    ...mapActions([ 'setOptions', 'setEntries', 'addEntries', 'updateEntries', 'removeEntriesByGuids' ]),

    saveEntry() {
      this.form.errors = [ ];
      var name = this.form.entry.name.trim();
      var from = this.form.entry.from.trim();
      var to = this.form.entry.to.trim();
      if(!name.length || !from.length || !to.length) {
        this.form.errors.push('Please fill in all the fields!');
        return;
      }

      this.addEntries([{
        title: name,
        start: moment(from, 'DD.MM.YYYY HH:mm').format('YYYY-MM-DD HH:mm'),
        end: moment(to, 'DD.MM.YYYY HH:mm').format('YYYY-MM-DD HH:mm'),
        styles: {
          color: '#FFFFFF',
          background: 'rgba(255, 100, 0, 0.68)',
        }
      }]);
      this.modal.class_obj['is-active'] = false;
    },

    onEntryNewClick(e) {
      var from = moment(this.options.selected_date).locale(this.options.locale);
      var to = moment(this.options.selected_date).locale(this.options.locale).add('hours', 1);
      this.editing = true;
      this.entry = {
        title: 'Untitled',
        guid: '',
        from: from,
        to: to,
        start: from.format('L HH:mm'),
        end: to.format('L HH:mm'),
        classes: { entry: true },
      };
    },

    onEntryRemoveClick(e) {
      if(this.entry) {
        this.removeEntriesByGuids([ this.entry.guid ]);
        this.entry = null;
      } else {
        console.log('Can\'t remove entry. No entry selected.');
      }
    },

    onEntrySaved() {
      var title = this.entry.title.trim();
      var from = this.entry.start.trim();
      var to = this.entry.end.trim();

      this.entry.title = title;
      this.entry.from = moment(from, 'DD.MM.YYYY HH:mm');
      this.entry.to = moment(to, 'DD.MM.YYYY HH:mm');
      this.entry.start = this.entry.from.format('YYYY-MM-DD HH:mm');
      this.entry.end = this.entry.to.format('YYYY-MM-DD HH:mm');

      if(this.entry.guid.length) {
        this.updateEntries([ this.entry ]);
      } else {
        this.addEntries([ this.entry ]);
      }

      this.entry = null;
      this.editing = false;
    },

    onEntryEditClick() {
      this.entry.start = this.entry.from.format('DD.MM.YYYY HH:mm');
      this.entry.end = this.entry.to.format('DD.MM.YYYY HH:mm');
      this.editing = true;
    },

  },


  created() {

    this.setOptions({
        locale: 'fi',
        type: 'week',
        // entry_limit: 3,
        day_start: '07:00',
        day_end: '23:59:59',
        hour_interval: '00:30:00',
        prev_nav: '<i class="fa fa-angle-left"></i>',
        next_nav: '<i class="fa fa-angle-right"></i>',
        format: {
          date: 'L',
          time: 'HH:mm'
        },
        property_names: {
          en: { day: 'Day', week: 'Week', month: 'Month' },
          fi: { day: 'Päivä', week: 'Viikko', month: 'Kuukausi' },
        },
        onEntryClick: (entry, node, calendar_entry_object) => {
          this.entry = entry;
        }
    });

    this.setEntries([{
        title: 'Text text',
        start: '2017-09-09 09:00',
        end: '2017-09-09 09:30'
       },{
        title: 'Textiii',
        start: '2017-09-09 09:00',
        end: '2017-09-09 09:30'
       },
       {
        title: 'Paikka 1',
        start: '2017-08-31 15:02',
        end: '2017-08-31 18:00',
        styles: {
          background: 'rgba(155, 0, 155, 0.68)',
        }
       },
       {
        title: 'Paikka 1',
        start: '2017-08-31 15:02',
        end: '2017-08-31 18:00',
        styles: {
          background: 'rgba(155, 0, 155, 0.68)',
        }
       },
       {
        title: 'Paikka 1',
        start: '2017-08-31 15:02',
        end: '2017-08-31 18:00',
        styles: {
          background: 'rgba(155, 0, 155, 0.68)',
        }
       },
       {
        title: 'Paikka 1',
        start: '2017-08-31 15:02',
        end: '2017-08-31 18:00',
        styles: {
          background: 'rgba(155, 0, 155, 0.68)',
        }
       }
    ]);
  }

}
</script>