<template>
	<div v-bind:class="entry.classes" 
		draggable="true"
		@dragstart.stop="onDragstart"
		@dragover.prevent.stop="onDragover"
		@click.stop.prevent="onClick"
		v-bind:data-uid="entry.uid"
		v-bind:style="entry.styles">
		{{ entry.text }}
    <p href="#" class="pb-resizer" v-show="entry.has_resizer"
		draggable="true"
    ></p>
	</div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import helpers from '../../mixins/GeneralHelpers'
import calendar_helpers from '../../mixins/CalendarHelpers'
var moment = require('moment');
export default {

	mixins: [
		helpers, calendar_helpers
	],

	computed: {
    ...mapGetters([
      'drag_event_entry', 'drag_on_date', 'weeks', 'options', 'originEntry'
    ])
	},

	props: {
		entry: null
	},

	data() {
		return {
		}
	},

	created() {
	},

	mounted() {

	},

	methods: {

		...mapActions([
			'setMovingEvent', 'setResizingEvent', 'activateEntry', 'resetActiveEntries',
			'setDragEventEntry', 'setDragEventOnDate', 'setDragEventOriginDate', 'backupEntry'
		]),

		onDragstart(e) {
			let img = new Image();
			img.src = './src/assets/ghost.png';
			e.dataTransfer.setDragImage(img, 10, 10);

			let entry = this.originEntry(this.entry);

			if(!entry) {
				return;
			}

			this.backupEntry(entry);

			if(e.target.classList.contains('pb-resizer')) {
				this.setResizingEvent(true);
			} else {
				this.setMovingEvent(true);
			}

			this.resetActiveEntries();
			this.activateEntry(entry);

			this.setDragEventEntry(entry);
      this.setDragEventOriginDate(this.$parent.day); // Find day object from store with the timestamp
		},

    onDrop(e) {
      console.log('Entry: Drop');
    },

	  onClick() {
	  },

	  onMousedown(e) {

	  },

	  onDragover () {
	  },

	  onMouseup() {
			// console.log('Mouse is up');
	  },

	  onMousemove() {

	  },

	}

}
</script>
<style lang="scss">
</style>