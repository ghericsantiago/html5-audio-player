function player()
{
	var self = this;
	var app = new Audio();
	self.temp = {};
	self.volume = ko.observable(.09 * 100);
	self.current = ko.observable();
	self.playing = ko.observable(false);
	self.currentTime = ko.observable(0);
	self.seekerPercentage = ko.observable(0);
	self.bufferPercentage = ko.observable(0);
	self.playlist = ko.observableArray([
		{ id : 0 , url:'audio/gitara.mp3' , name : 'Gitara' },
		{ id : 1 , url:'audio/harana.mp3' , name : 'Harana' },
		{ id : 2 , url:'audio/harana.mp3' , name : 'Harana2' },
		{ id : 3 , url:'audio/horse.mp3' , name : 'Horse' },
		{ id : 4 , url:'audio/gitara.mp3' , name : 'Gitara1' },
		{ id : 5 , url:'audio/harana.mp3' , name : 'Harana3' },
		{ id : 6 , url:'audio/harana.mp3' , name : 'Harana4' },
		{ id : 7 , url:'audio/horse.mp3' , name : '1' },
		{ id : 8 , url:'audio/gitara.mp3' , name : '2' },
		{ id : 9 , url:'audio/harana.mp3' , name : '3' },
		{ id : 10 , url:'audio/harana.mp3' , name : '4' },
		{ id : 11 , url:'audio/horse.mp3' , name : '5' },
		{ id : 12 , url:'audio/gitara.mp3' , name : '6' },
		{ id : 13, url:'audio/harana.mp3' , name : '7' },
		{ id : 14 , url:'audio/harana.mp3' , name : '8' },
		{ id : 15 , url:'audio/horse.mp3' , name : '9' },
		]);
	self.queue = ko.observableArray([]);
	self.random = ko.observable(false);
	self.repeat = ko.observable(false);

	/*
	 * START OF PLAYER METHODS
	 */

	 self.toggleVolume = function(){

	 	if(self.volume())
	 	{
	 		self.temp['volume'] = self.volume();
	 		self.volume(0);
	 	}
	 	else
	 		self.volume(self.temp['volume']);
	 }

	self.next = function(){

		currentIndex = self.findIndexById(self.current().id);

		if(self.random())
		{
			do
			{
				randomPosition = self.getRandomInt(0, self.queue().length - 1);
				nextSong = self.queue()[randomPosition];
			}
			while($.inArray(nextSong.id, self.temp.played) > -1 && self.queue().length != self.temp.played.length);
			
			if(self.queue().length != self.temp.played.length)
				self.current(nextSong);
		}
		else
		{
			/*
			 * LOOP THE SONG IN THE QUEUE 
			 * IF THE LAST SONG IS REACHED
			 */
			if(currentIndex < self.queue().length - 1 && self.queue().length != 1)
				self.current(self.queue()[currentIndex + 1]);
			else
				self.current(self.queue()[0]);
		}

		if(self.queue().length == self.temp.played.length)
		{
			console.log('All music had been played');
			self.stop();
			self.temp.played = [];
		}
		else
		{
			// CLEAR THE PLAYER
			self.stop();
			app.currentTime = 0;
			app.src = self.queue()[self.findIndexById(self.current().id)].url;
			self.play();
		}
	};

	self.prev = function(){
		

		/*
		 * LOOP THE SONG IN THE QUEUE 
		 * IF THE FIRST SONG IS REACHED
		 */
		currentIndex =  self.findIndexById(self.current().id);

		if(self.random())
		{
			do
			{
				randomPosition = self.getRandomInt(0, self.queue().length - 1);
				nextSong = self.queue()[randomPosition];
			}
			while($.inArray(nextSong.id, self.temp.played) > -1 && self.queue().length != self.temp.played.length);
			
			if(self.queue().length != self.temp.played.length)
				self.current(nextSong);
		}
		else
		{
			if(currentIndex > 0)
			{
				currentSong = self.queue()[currentIndex - 1];
				self.current(currentSong);
			}
			else
			{
				self.current(self.queue()[self.queue().length - 1]);
			}
		}

		
		if(self.queue().length == self.temp.played.length)
		{
			console.log('All music had been played');
			self.stop();
			self.temp.played = [];
		}
		else
		{
			// CLEAR THE PLAYER
			self.stop();
			app.currentTime = 0;
			app.src = self.queue()[self.findIndexById(self.current().id)].url;
			self.play();
		}
	};

	self.addToQueue = function(e){
		
		if(self.songisValid(e))
		{

			// SET SELECTED SONG IN
			// CURRENT PLAYING
			// CURRENT PLAYING IS NOT SET
			if(!self.current() || self.playing() == false)
			{
				self.current(e);
			}

			self.queue.push(e);


			/* 
			 * QUEUE IS NOT EMPTY
			 * PLAYER IS NOT PLAYNG
			 */
			if(self.queue().length > 0 && self.playing() == false){
				app.src = self.queue()[self.findIndexById(self.current().id)].url;
				self.play()
			}
		}
		else
			console.log('song is in queue already');
	};


	/*
	 * PARAM: OBJECT song
	 * DESCRIPTION: remove the selected song from queue
	 */
	self.removeToQueue = function(e){

		if(e.id == self.current().id && self.playing() == true && self.queue().length > 0)
		{
			/*
			 * GET THE PREV SONG
			 * FOR PREPARATION IN
			 * NEXT FUNCTION
			 */

			curIndex = self.findIndexById(self.current().id);
			prevIndex = (curIndex <= 0) ? self.queue().length - 1 : curIndex - 1; 
			
			// SET THE PREV SONG TO CURRENT
			// SO IN NEXT FUNCTION, THE NEXT POSIBLE
			// SONG WILL PLAY AFTER REMOVING THE
			// CURRENT SONG
			self.current(self.queue()[prevIndex]);
				
		}
		self.queue.remove(e);		
		self.next();

	};

	/*
	 *	PARAM: OBJECT song
	 * 	DESCRIPTION: Check if the selected song
	 *  is already in the queue.
	 * 	RETURN: boolean
	 */
	self.songisValid = function(song){
		var queue = self.queue();
		for(var i = 0; i < queue.length; i++)
		{
			tmpSong = queue[i];
			if(tmpSong.id == song.id)
				return false;
		}
		return true;
	}

	/*
	 *  PARAM: song id
	 *  DESCRIPTION: get the current index of song
	 *  in the queue
	 *  RETURN: INT index || boolean false
	 */
	self.findIndexById = function(id)
	{
		queue = self.queue();
		for(var i = 0; i <= queue.length; i++)
		{
			
			if(queue.hasOwnProperty(i) && queue[i].id == id)
			{
				return i;
			}
		}

		return false;
	};

	self.stop = function(){
		console.log('player stoped');

		var waitTime = 150;
		setTimeout(function () {  
		  	self.playing(false);
			app.pause();
			self.currentTime(0);
			app.currentTime = self.currentTime();
			self.seekerPercentage(0);
			self.bufferPercentage(0);
		}, waitTime);	
	};

	self.pause = function()
	{
		console.log('player is paused');
		var waitTime = 150;
		setTimeout(function () {   
		  if (self.playing() == true) {
		   	self.playing(false);
			app.pause();
		  }

		}, waitTime);	

		return;
	};

	self.play = function()
	{
		console.log('now playing');
		var waitTime = 150;
		setTimeout(function () {   
			if (self.playing() == false) {
			    self.playing(true);
			    
			    // add the id of current song
				// in played queue
				key = self.current().id;
				if(!self.temp.played)
			    	self.temp.played = [];
			    if($.inArray(key, self.temp.played) == -1)
			    	self.temp.played.push(key);	

			    if(self.random() == false)
			    	self.temp.played = [];

				app.currentTime = self.currentTime();
				app.play();	
			 }
		}, waitTime);
	};

	self.playNow = function(e){
		self.stop();
		self.current(e);
		app.currentTime = 0;
		app.src = e.url;
		self.play();
	};

	self.search = function()
	{
		/*var posting = $.get('getsong.php',null,{'format':'json'});
		
		posting.done(function(data){
		
		})*/
		data = [
		{ id : 4 , url:'audio/gitara.mp3' , name : 'test' },
		{ id : 5 , url:'audio/harana.mp3' , name : 'test2' },
		{ id : 6 , url:'audio/harana.mp3' , name : 'test3' },
		{ id : 7 , url:'audio/horse.mp3' , name : 'test4' }
		];

		playlist = self.playlist();
		$(data).each(function(e,d){
			playlist.push(d);
		});
		self.playlist(playlist);

		
	}


	self.seek = function(ui,e)
	{
		/*
		 * CHECK IF THERE IS A SONG
		 * IN THE PLAYER
		 */
		if(self.current() && self.queue())
		{
			console.log('Seeking');
			/*
			 * GET THE MOUSE POSITION RELATIVE TO PROGRESS DIV
			 * COMPUTE THE PERCENTAGE OF SELECTED POSITION RELATIVE 
			 * TO PROGRESS CONTAINER
			 */
			var width = $('.progress').width();
			var mouseX = e.pageX - 2;		
			selectedSeek = (mouseX / width) * 100;
			seekerPercentage = (selectedSeek <= 100) ? selectedSeek : 100;
			
			/*
			 * COMPUTE THE CURRENT TIME OF SONG
			 * BASED ON THE PERCETAGE OF SEEKER
			 * AND SET THE SONG TO THAT CURRENT TIME
			 */
			app.currentTime = app.duration * (seekerPercentage / 100);


			/*
			 * IF THE SONG IS CURENTLY PLAYING
			 * CONTINUE TO PLAY THE SONG AFTER CHANGING
			 * THE CURRENT TIME
			 */
			if(self.playing())
				self.play();	
		}
		
	}

	self.toggleRandom = function()
	{
		self.random((self.random()) ? false : true );

		if(self.random() == true)
		{
			key = self.current().id;
			if(!self.temp.played)
		    	self.temp.played = [];
		    if($.inArray(key, self.temp.played) == -1)
		    	self.temp.played.push(key);	
		}

	};

	self.toggleRepeat = function()
	{
		self.repeat((self.repeat()) ? false : true);
	}


	/*
	 * HELPER
	 */

	 /**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	self.getRandomInt = function (min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}


	/*
	 * START OF ALL COMPUTED LISTENERS
	 */
	 self.volumeUpdated = ko.computed(function(){
	 	volume = self.volume();
	 	app.volume = volume / 100;
	 });

	 self.tiggerAutoPlay = ko.computed(function(e){

		/*
		 * QUEUE IS EMPTY
		 * PLAYER IS PLAYING
		 */
		if(self.queue().length <= 0 && self.playing() == true)
		{
			self.pause();
			app.currentTime = 0;
		}

		return self.queue().length;
	})

	self.getSongTitle = ko.computed(function(){

		if(self.queue().length > 0)
		{
			if(self.queue().hasOwnProperty(self.findIndexById(self.current().id)))
				return self.queue()[self.findIndexById(self.current().id)].name;

		}
	});

	self.currentEventListener = ko.computed(function(){

		$('.list-group-item').removeClass('active');
		activeSong = self.current();
		if(activeSong)
		{
			var waitTime = 150;
			setTimeout(function () {   
				$('.queue-song-' + activeSong.id).addClass('active');
			}, waitTime);
				
		}
	});

	/* 
	 * START OF APP LISTENERS
	 */
	app.addEventListener("ended", function(){

		if(self.repeat())
		{
			self.playing(false);
			self.play();
		}
		else
		{
			/*
			 * CHECK IF THE NEXT SONG
			 * IS NOT THE CURRENT SONG
			 * TO PREVENT LOOP IF ALL SONG
			 * IS DONE PLAYING
			 */
			if(self.findIndexById(self.current().id) != (self.queue().length - 1) || self.random())
			{
				self.playing(false);
	     		self.next();	
			}
			else
			{
				console.log('All music has been played');
				self.stop();
				self.playing(false);	
			}
		}

		
	});

	app.addEventListener("timeupdate",function(){
		
		/*
		 * UPDATE THE SEEKER AND 
		 * CURRENT TIME VARIABLES
		 */
		 if(self.current() && self.playing())
		 {
			self.seekerPercentage((app.currentTime / app.duration) * 100);
			self.currentTime(app.currentTime);
			self.bufferPercentage((app.buffered.end(0) / app.duration) * 100); 	
		 }
	});
} 

$(function(){	
	player = new player();
	ko.applyBindings(player);

});