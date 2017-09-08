export default {
	methods: {
		prev() {
		  this.loading = true;
		  var el = document.getElementById('prev');
		  el.className += ' pulse';
		  if(this._isMonth()) {
		    this.date.subtract(1, 'months').clone();
		  } else if(this._isWeek()) {
		    this.date.subtract(7, 'days').clone();
		  } else if(this._isDay()) {
		    this.date.subtract(1, 'days').clone();
		  }

		  this.options.selected_date = this._longFormat(this.date);
		  this.times = this._createTimes();

		  if(this.options.type == 'month') {
		    let calendar_dates = this._createMonth();
		    this.setTimeRanges(calendar_dates);
		  } else {
		    let calendar_dates = this._createWeek();
		    this.setTimeRanges(calendar_dates);
		  }
		  this.setSelectedDate(this.date);
		  this.renderCalendar();
		  this.loading = false;
		  setTimeout(function() {
		    el.className = el.className.replace(' pulse');
		  }, 1000);
		},

		next(e) {
		  this.loading = true;
		  var el = document.getElementById('next');
		  el.className += ' pulse';
		  if(this._isMonth()) {
		    this.date.add(1, 'months').clone()
		  } else if(this._isWeek()) {
		    this.date.add(7, 'days').clone()
		  } else if(this._isDay()) {
		    this.date.add(1, 'days').clone();
		  }
		  this.options.selected_date = this._longFormat(this.date);
		  this.times = this._createTimes();
		  if(this._isMonth()) {
		    let calendar_dates = this._createMonth();
		    this.setTimeRanges(calendar_dates);
		  } else {
		    let calendar_dates = this._createWeek();
		    this.setTimeRanges(calendar_dates);
		  }
		  this.setSelectedDate(this.date);
		  this.renderCalendar();
		  this.loading = false;
		  setTimeout(function() {
		    el.className = el.className.replace(' pulse');
		  }, 1000);
		}
	}
}