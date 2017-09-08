<template>
  <div>
    <component :is="calendar"></component>
    <transition name="custom-classes-transition"
    enter-active-class="animated slideInRight"
    leave-active-class="animated slideOutRight">
    <entry-overview v-bind:entry="entry" v-if="entry" v-on:back="editing=entry=null"></entry-overview>
    </transition>

    <div class="vxc-tools">
      <!-- Initial stage -->
      <div v-if="!entry && !editing">
        <a href="new" @click.prevent="onEntryNewClick"><i class="fa fa-plus"></i><br>Uusi</a>
        <a href="month" @click.prevent="options.type = 'month'" v-bind:class="[ options.type == 'month' ? 'active' : '' ]"><i class="fa fa-calendar"></i><br>Kuukausi</a>
        <a href="week" @click.prevent="options.type = 'week'" v-bind:class="[ options.type == 'week' ? 'active' : '' ]"><i class="fa fa-calendar"></i><br>Viikko</a>
        <a href="day" @click.prevent="options.type = 'day'" v-bind:class="[ options.type == 'day' ? 'active' : '' ]"><i class="fa fa-clock-o"></i><br>Päivä</a>
      </div>
      <!-- Overview -->
      <div v-if="entry && !editing">
        <a href="new" @click.prevent="onEntryNewClick"><i class="fa fa-plus"></i><br>Uusi</a>
        <a href="edit" @click.prevent="edit = true"><i class="fa fa-pencil"></i><br>Muokkaa</a>
        <a href="remove" @click.prevent="onEntryRemoveClick"><i class="fa fa-trash"></i><br>Poista</a>
      </div>
      <!-- Saving entry (New / Edit) -->
      <div v-if="entry && editing">
        <a href="back" @click.prevent="editing=entry=null"><i class="fa fa-times"></i><br>Peruuta</a>
        <a href="save" @click.prevent="onEntryNewClick"><i class="fa fa-floppy-o"></i><br>Tallenna</a>
      </div>

    </div>
  </div>
</template>
<style lang="scss">
@import './assets/sass/dot-trail.scss';
</style>
<script>
var _ = require('lodash');
var moment = require('moment');
import { mapActions, mapGetters } from 'vuex'
import entry_overview from './components/mobile/EntryOverview'
import normal from './components/normal/Calendar'
import mobile from './components/mobile/Calendar'

export default {

  components: { 'normal': normal, 'mobile': mobile, 'entry-overview': entry_overview },
 
  computed: {
    ...mapGetters([ 'entries', 'options' ]),
    type() {
      return this.options.type
    }
  },

  data() {
    return {
      editing: false,
      entry: null,
      calendar: 'mobile',

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

    ...mapActions([ 'setOptions', 'setEntries', 'addEntries', 'removeEntriesByGuids' ]),

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
      var from = moment().locale(this.options.locale);
      var to = moment().locale(this.options.locale).add('hours', 1);
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

    onEntrySaveClick(e) {
      this.editing = this.entry = false;
    },

    onEntryRemoveClick(e) {
      if(this.entry) {
        this.removeEntriesByGuids([ this.entry.guid ]);
        this.entry = null;
      } else {
        console.log('Can\'t remove entry. No entry selected.');
      }
    }

  },


  created() {

    this.setOptions({
        locale: 'fi',
        type: 'month',
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
        start: '2017-08-31 15:00',
        end: '2017-09-01 18:00',
        styles: {
          background: 'rgba(155, 200, 0, 0.68)',
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