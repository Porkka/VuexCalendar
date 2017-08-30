<template>
  <div>
    <calendar v-bind:calendar_entries="calendar_entries" v-bind:initial_options="options"></calendar>
    <div class="modal" v-bind:class="modal.class_obj">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title" v-html="modal.title"></p>
          <button class="delete" aria-label="close" @click.prevent.stop="modal.class_obj['is-active']=false"></button>
        </header>
        <section class="modal-card-body">
          <form action="" v-on:submit.prevent="saveEntry">
            <div class="notification is-danger" v-if="form.errors.length">
              <button class="delete" @click="form.errors = []"></button>
              <ul>
                <li v-for="error in form.errors" v-text="error"></li>
              </ul>
            </div>

            <label for="">Name</label>
            <input type="text" name="to" id="vxc-entry-name" v-model="form.entry.name">
            <label for="">From</label>
            <input type="text" name="from" id="vxc-entry-from" v-model="form.entry.from">
            <label for="">To</label>
            <input type="text" name="to" id="vxc-entry-to" v-model="form.entry.to">

          </form>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click.prevent.stop="saveEntry">Save changes</button>
          <button class="button" @click.prevent.stop="modal.class_obj['is-active']=false">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import './assets/sass/general.scss';
@import './assets/sass/dot-trail.scss';
</style>
<script>
var moment = require('moment');
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
      'entries', 'normalized_entries'
    ])
  },

  data() {
    return {
      counter: 0,

      form: {
        entry: {
          from: '',
          to: '',
          name: '',
        },
        errors: [ ],
      },

      modal: {
        class_obj: {
          modal: true,
          'is-active': false,
        }
      },
      calendar_entries: [{
        title: 'Long ass fucking name',
        start: '2017-08-09 15:00',
        end: '2017-08-10 18:00',
        styles: {
          color: '#FFFFFF',
          background: 'rgba(255, 100, 0, 0.68)',
        }
       },
       {
        title: 'Long ass fucking name2',
        start: '2017-08-09 15:00',
        end: '2017-08-10 18:00',
        styles: {
          color: '#FFFFFF',
          background: 'rgba(255, 0, 0, 0.68)',
        }
       },
       {
        title: 'Text text',
        start: '2017-08-10 15:00',
        end: '2017-08-11 18:00',
        styles: {
          background: 'rgba(155, 200, 0, 0.68)',
        }
       },
       {
        title: 'Paikka 1',
        start: '2017-08-11 15:00',
        end: '2017-08-12 18:00',
        styles: {
          background: 'rgba(155, 0, 155, 0.68)',
        }
       }
      ],
      options: {
        locale: 'fi',
        entry_limit: 3,
        theme: 'original',
        day_start: '07:00',
        day_end: '23:59:59',
        prev_nav: '<i class="fa fa-angle-left"></i>',
        next_nav: '<i class="fa fa-angle-right"></i>',
        type: 'month',
        format: {
          time: 'HH:mm',
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

          this.modal.class_obj['is-active'] = true;
          this.modal.title = 'Create new Entry';

          this.form.entry.name = '';
          this.form.entry.from = start.start.format('L HH:mm');
          this.form.entry.to = end.end.format('L HH:mm');

          setTimeout(function( ) {
            document.getElementById('vxc-entry-name').focus();
          }, 400);

        },
        onEntryClick: (entry, node) => {
          var self = this;

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
            e.preventDefault(); e.stopPropagation();
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
          edit.setAttribute('href', entry.guid);
          edit.innerHTML = '<i class="fa fa-pencil"></i>';
          var remove = document.createElement('a');
          remove.setAttribute('href', entry.guid);
          remove.style.display = 'inline-block';
          remove.style.margin = '0 5px';
          remove.innerHTML = '<i class="fa fa-trash"></i>';
          remove.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            var new_entries = [ ];
            var guid = this.getAttribute('href');
            for(var e in self.normalized_entries) {
              if(self.normalized_entries[e].guid != guid) {
                new_entries.push(self.normalized_entries[e]);
              }
            }
            self.calendar_entries = new_entries;
            var old = document.getElementById('entry-overview');
            if(old) {
              old.remove();
            }
          });

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
  methods: {
    saveEntry() {
      this.calendar_entries = this.normalized_entries;

      this.form.errors = [ ];

      var name = this.form.entry.name.trim();
      var from = this.form.entry.from.trim();
      var to = this.form.entry.to.trim();
      if(!name.length || !from.length || !to.length) {
        this.form.errors.push('Please fill in all the fields!');
        return;
      }

      this.calendar_entries.push({
        title: name,
        start: moment(from, 'DD.MM.YYYY HH:mm').format('YYYY-MM-DD HH:mm'),
        end: moment(to, 'DD.MM.YYYY HH:mm').format('YYYY-MM-DD HH:mm'),
        styles: {
          color: '#FFFFFF',
          background: 'rgba(255, 100, 0, 0.68)',
        }
      });
      this.modal.class_obj['is-active'] = false;
    }
  }
}
</script>