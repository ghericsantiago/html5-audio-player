function player()
{
	var self = this;
	var app = $('#my-player')[0];

	self.current = ko.observable();
	self.playing = ko.observable(false);
	self.currentTime = ko.observable(0);
	self.seekerPercentage = ko.observable(0);
	self.playlist = ko.observableArray([
		{ id : 0 , url:'audio/gitara.mp3' , name : 'gitara' },
		{ id : 1 , url:'audio/harana.mp3' , name : 'harana' },
		{ id : 2 , url:'audio/harana.mp3' , name : 'harana2' },
		{ id : 3 , url:'audio/horse.mp3' , name : 'horse' }
		]);
	self.queue = ko.observableArray([]);

	/*
	 * START OF PLAYER METHODS
	 */

	self.next = function(){
		
		currentIndex = self.findIndexById(self.current().id);

		/*
		 * LOOP THE SONG IN THE QUEUE 
		 * IF THE LAST SONG IS REACHED
		 */
		if(currentIndex < self.queue().length - 1 && self.queue().length != 1)
			self.current(self.queue()[currentIndex + 1]);
		else
			self.current(self.queue()[0]);

		// CLEAR THE PLAYER
		self.stop();
		app.currentTime = 0;
		app.src = self.queue()[self.findIndexById(self.current().id)].url;
		self.play();
	};

	self.prev = function(){
		

		/*
		 * LOOP THE SONG IN THE QUEUE 
		 * IF THE FIRST SONG IS REACHED
		 */
		currentIndex =  self.findIndexById(self.current().id);
		if(currentIndex > 0)
		{
			currentSong = self.queue()[currentIndex - 1];
			self.current(currentSong);
		}
		else
		{
			self.current(self.queue()[self.queue().length - 1]);
		}

		// CLEAR THE PLAYER
		self.stop();
		app.currentTime = 0;
		app.src = self.queue()[self.findIndexById(self.current().id)].url;
		self.play();
	};

	self.addToQueue = function(e){
		
		if(self.songisValid(e))
		{

			// SET SELECTED SONG IN
			// CURRENT PLAYING IF
			// CURRENT PLAYING IS NOT SET
			if(!self.current() || self.playing == false)
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

		console.log('song is stop');
		var waitTime = 150;
		setTimeout(function () {   

		  if (self.playing() == true) {
		   	self.playing(false);
			app.pause();
			self.currentTime(0);
			app.currentTime = self.currentTime();
		  }

		}, waitTime);	
	};

	self.pause = function()
	{
		console.log('song is paused');
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
				app.currentTime = self.currentTime();
				app.play();	
			 }
		}, waitTime);
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


	/*
	 * START OF ALL COMPUTER LISTENERS
	 */

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

	self.currentEventListener = ko.computed(function(e){

		self.current();

	});

	/* 
	 * START OF APP LISTENERS
	 */
	app.addEventListener("ended", function(){

		/*
		 * CHECK IF THE NEXT SONG
		 * IS NOT THE CURRENT SONG
		 * TO PREVENT LOOP IF ALL SONG
		 * IS DONE PLAYING
		 */
		if(self.findIndexById(self.current().id) != (self.queue().length - 1) )
		{
			self.playing(false);
     		self.next();	
		}
		else
		{
			self.seekerPercentage(0);
			self.playing(false);	
		}
	});

	app.addEventListener("timeupdate",function(){
		
		/*
		 * UPDATE THE SEEKER AND 
		 * CURRENT TIME VARIABLES
		 */
		self.seekerPercentage((app.currentTime / app.duration) * 100);
		self.currentTime(app.currentTime);
	
	});
} 

$(function(){	
	player = new player();
	ko.applyBindings(player);

});