function Player($ct){
	this.$ct = $ct
	this.init()
	this.bind()
}

Player.prototype = {
	init:function(){
		this.songArr = []
		this.channels = this.$ct.find('.channels-ct')
		this.songsList = this.$ct.find('.songs-list')
		this.songs = this.$ct.find('.songs-list .songs li')
		this.lyric = this.$ct.find('.player .song-info .lyric')
		this.audio = this.$ct.find('audio').eq(0)
		this.channelName = this.$ct.find('.player .song-info .channelName')
		this.songName = this.$ct.find('.player .song-info .songName')
		this.songer = this.$ct.find('.player .song-info .songer')
		this.cover = this.$ct.find('.player .song-info .cover')
		this.playBtn = this.$ct.find('.player .controls .suspend')
		this.prevSong = this.$ct.find('.player .controls .prev-song')
		this.nextSong = this.$ct.find('.player .controls .next-song')
		this.playMode = this.$ct.find('.player .controls .play-mode') 
		this.lyricShow = this.$ct.find('.player .controls .lyric-show')
		this.toChannels = this.$ct.find('.player .playlist .to-channels')
		this.toSongs = this.$ct.find('.player .playlist .to-songs')
		this.volumeCt = this.$ct.find('.player .main .volume-ct')
		this.volume = this.$ct.find('.player .main .volume-ct .volume')
		this.volumeColumn = this.$ct.find('.player .main .volume-ct .volume-column')


		this.getChannels()
	},


	bind:function(){
		var self = this

		//歌曲就绪时获取时长和当前播放时间
		this.audio.on('canplay',function(){
			self.setTotalTime()
			self.setCurTime()
		})

		//音乐结束自动播放下一曲
		this.audio.on('ended',function(){
			self.nextSong.trigger('click')
		})

		//歌曲暂停时停止音符动画？
		this.audio.on('pause',function(){
			console.log(self.$ct.find('.songs-list .songs>li .music'))
			self.$ct.find('.songs-list .songs>li .music').stop().animate()
			//self.$ct.find('.songs-list .songs>li .music')[0].style.webkitAnimationPlayState="pause"
			self.$ct.find('.songs-list .songs>li .music').addClass('pause')
		})

		//音量变化同步音量条
		this.audio.on('volumechange',function(){
			var volumePercent = self.audio[0].volume*100
			self.volumeColumn.find('.volume-bar').css('height',volumePercent+'%')
		})

		//歌曲进度条控制
		var perX;

		this.$ct.find('.basebar').on('mousedown',function(e){
			perX = (e.clientX - $(this).offset().left)/$(this).width()*100
		})
		this.$ct.find('.basebar').on('mouseover',function(){
			self.$ct.find('.basebar .progressbar').css('width',perX+'%')
		})
		this.$ct.find('.basebar').on('mouseup',function(){
			self.audio[0].currentTime = self.audio[0].duration*perX/100
		})

		//播放/暂停
		this.playBtn.on('click',function(){
			if(self.audio[0].paused){
				self.play()
			}else{
				self.stop()
			}
		})

		//上一首
		this.prevSong.on('click',function(){
			var songs = self.$ct.find('.songs-list .songs>li')
			console.log(songs.length)
			$.each(songs,function(index){
				if(self.audio.attr('src') === songs.eq(index).attr('data-url')){
					console.log(index)
					if(index>0){
						console.log('prev')
						songs.eq(index-1).trigger('click')
						return false
					}else{
						alert('没有上一首了')
						return false
					}

				}
			})
		})

		//下一首
		this.nextSong.on('click',function(){
			var songs = self.$ct.find('.songs-list .songs>li')
			console.log(songs.length)
			if(songs.length>1){
				$.each(songs,function(index){
					if(self.audio.attr('src') === songs.eq(index).attr('data-url')){
						console.log(index)
						if(songs.eq(index+1).attr('data-url')){
							console.log('next')
							songs.eq(index+1).trigger('click')
							return false
						}else{
							console.log('new')
							self.getSong()
							return false
						}

					}
				})
			}else{
				self.getSong()
			}
			
		})

		//歌曲播放模式切换
		this.playMode.on('click',function(){
			if(self.playMode.hasClass('icon-shunxubofang')){
				self.audio.attr('loop','loop')
				self.playMode.removeClass('icon-shunxubofang').addClass('icon-danquxunhuan').attr('title','单曲循环')
			}else{
				self.audio.removeAttr('loop')
				self.playMode.removeClass('icon-danquxunhuan').addClass('icon-shunxubofang').attr('title','顺序播放')

			}
		})

		//歌词展示开关
		this.lyricShow.on('click',function(){
			self.lyric.siblings().toggleClass('close')
			self.lyricShow.toggleClass('active')
			if(self.lyricShow.hasClass('active')){
				self.lyric.animate({
					opacity:1
				},200)
			}else{
				self.lyric.animate({
					opacity:0
				},200)
			}
		})

		//音量显示
		this.volumeCt.on('mouseenter',function(){
			self.volumeColumn.show(100)
			self.volumeCt.addClass('show')
		})

		this.volumeCt.on('mouseleave',function(){
			self.volumeColumn.hide(100)
			self.volumeCt.removeClass('show')
		})

		//静音切换
		this.volume.on('click',function(){
			if(self.volume.hasClass('icon-yinliang')){
				self.volume.removeClass('icon-yinliang').addClass('icon-jingyin')
				self.audio[0].volume = 0
			}else{
				self.volume.removeClass('icon-jingyin').addClass('icon-yinliang')
				self.audio[0].volume = 1
			}
		})

		//音量控制
		var perY
		this.volumeColumn.on('mousedown',function(e){
			perY = (self.volumeColumn.offset().top + self.volumeColumn.height() - e.pageY)*100/$(this).height()
		})
		this.volumeColumn.on('mouseup',function(){
			//self.volumeColumn.find('.volume-bar').css('height',perY+'%')
			self.audio[0].volume = perY*1/100
		})

		//电台频道展示
		this.toChannels.on('click',function(){	
			self.channels.animate({
				left:'0'
			},200)
		})

		//歌曲列表展示
		this.toSongs.on('click',function(){
			self.songsList.animate({
				right:'0'
			},200)
		})		

		//电台界面返回按钮 
		this.$ct.find('.channels-ct .icon-fanhui').on('click',function(){
			self.channels.animate({
				left:'-600'
			},200)
		})

		//歌曲列表界面返回按钮
		this.$ct.find('.songs-list .icon-fanhui1').on('click',function(){
			self.songsList.animate({
				right:'-600'
			},200)
		})

		//点击频道切换
		this.channels.find('.channels').on('click',function(e){
			var target = e.target;
			console.log(target)
			if(target.tagName.toLowerCase() === 'li'){
				self.channelName.attr('data-id',$(target).attr('data-id'))
				self.channelName.text($(target).text())
				console.log($(target).attr('data-id'))
				console.log(self.channelName.attr('data-id'))
				self.getSong()
				self.channels.animate({
					left:'-600'
				},200)
				self.playBtn.removeClass('icon-play').addClass('icon-zanting')	
			}
		})

		//点击歌曲列表播放
		this.$ct.find('.songs-list .songs').on('click',function(e){
			var target = e.target;
			console.log(target)
			if(target.tagName.toLowerCase() === 'li'){
				self.audio.attr('src',$(target).attr('data-url'))
				self.songName.text($(target).attr('data-title'))
				self.songer.text($(target).attr('data-artist'))
				self.channelName.text($(target).find('.song-channel').text())
				self.cover.attr('src',$(target).attr('data-picture'))
				self.cover.css({
				 	'width':400,
				 	'height':400
				 })	
				self.getLyric($(target).attr('data-sid'))
				self.songsList.animate({
					right:'-600'
				},200)
			}else{
				self.audio.attr('src',$(target).parents('.songs>li').attr('data-url'))
				self.songName.text($(target).parents('.songs>li').attr('data-title'))
				self.songer.text($(target).parents('.songs>li').attr('data-artist'))
				self.channelName.text($(target).parents('.song-channel').text())
				self.cover.attr('src',$(target).parents('.songs>li').attr('data-picture'))
				self.cover.css({
				 	'width':400,
				 	'height':400
				 })	
				self.getLyric($(target).find('.songs>li').attr('data-sid'))
				self.songsList.animate({
					right:'-600'
				},200)
			}
			self.playBtn.removeClass('icon-play').addClass('icon-zanting')	
			self.setCurSong()
		})
	},

	//获取FM频道（随机获取）
	getChannels:function(){
		var self = this
		$.ajax({
			url:'http://api.jirengu.com/fm/getChannels.php',
			method:'get',
			dataType:'json'
		}).done(function(result){
			var len = result.channels.length
			var random = Math.floor(Math.random()*len)
			var randomId = result.channels[random].channel_id
			console.log(random)
			var randomName = result.channels[random].name
			self.channelName.text(randomName)
			self.channelName.attr('data-id',randomId)
			console.log(randomName)
			self.getSong()
			self.setChannels(result.channels)
		})
	},

	//获取现在频道的歌曲
	getSong:function(){
		var self = this
		$.ajax({
			url:'http://api.jirengu.com/fm/getSong.php',
			method:'get',
			dataType:'json',
			data:{
				channel:self.channelName.attr('data-id')
			}
		}).done(function(result){
			var songDetails = result.song[0]
			console.log(songDetails)
			//self.setSongDetails(songDetails)
			var sid = songDetails.sid
			self.getLyric(sid)
			//self.setCurTime()
			//self.setTotalTime()
			self.setSongArr(songDetails)
			//self.setSongslist(songDetails)
		})
	},

	//获取歌词
	getLyric:function(sid){
		var self = this
		$.post('http://api.jirengu.com/fm/getLyric.php',{sid:sid})
		.done(function(result){
			var lyr = JSON.parse(result).lyric
	 		//console.log(lyr)
	 		self.setLyric(lyr)
		})
		.fail(function(){
			self.lyric.text('未找到歌词')
		})
	},

	//设置频道列表
	setChannels:function(data){
		var html = ''
		for(var i=0;i<data.length;i++){
			html += '<li data-id="'+data[i].channel_id+'">'+data[i].name+'</li>'
		}
		//console.log(html)
		this.$ct.find('.channels-ct .channels').append($(html))
	},

	//设置歌曲信息并播放
	setSongDetails:function(data){
		this.songName.text(data.title)
		this.songer.text(data.artist)
		this.audio.attr('src',data.url)
		this.cover.attr('src',data.picture)
		this.cover.css({
		 	'width':66.66666667+'%',
		 	'height':66.66666667+'%'
		 })
		this.setTotalTime()	
		this.setCurTime()
	},

	//储存歌曲信息至数组
	setSongArr:function(data){
		var self = this
		var isAdded = true
		var perSong = {
			title:data.title,
			artist:data.artist,
			url:data.url,
			picture:data.picture,
			sid:data.sid
		}
		if(perSong.url !== null){
			self.setSongDetails(perSong)
			if(!this.songArr.length){
				console.log(1)
				this.songArr.push(perSong)
				this.setSongslist(perSong)
			}else{
				console.log(2)
				$.each(self.songArr,function(index){
					if(perSong.title !== self.songArr[index].title){
						isAdded = false
						console.log('no-rr')
					}else{
						isAdded = true
						console.log('rr')
						return false  //结束循环
					}
				})
				self.setSongslist(perSong)
				if(!isAdded){
					self.songArr.push(perSong)
				}
			}
		}
		console.log(this.songArr)
	},

	//正确显示时间
	setTime:function(data){
		var time = parseInt(data)
		var min = Math.floor(time/60)
		var sec = time - min*60
		if(min<10){
			min = '0' + String(min)
		}else{
			min = String(min)
		}
		if(sec<10){
			sec = '0'+ String(sec)
		}else{
			sec = String(sec)
		}

		return (min+':'+sec)
	},

	//获取歌曲时长
	setTotalTime:function(){
		var self = this
		//setTimeout(function(){
			var rel = self.setTime(self.audio[0].duration)
			console.log(rel)
			self.$ct.find('.basebar .total-time').text(rel)
			//self.$ct.find('.songs-list .songs li .song-time').text(rel)
		//},800)
	},

	//获取歌曲当前播放时间
	setCurTime:function(){
		var self = this
		setInterval(function(){
			var rel = self.setTime(self.audio[0].currentTime)
			self.$ct.find('.basebar .cur-time').text(rel)
			self.setBasebar()
		},200)
	},

	//设置歌曲进度条
	setBasebar:function(){
		var percentage = this.audio[0].currentTime/this.audio[0].duration*100
		this.$ct.find('.basebar .progressbar').css('width',percentage+'%')
	},

	//设置歌曲列表
	setSongslist:function(data){
		var self = this
		setTimeout(function(){
			var isAdded = true
			var time = self.setTime(self.audio[0].duration)
			var html = ''
			html += '<li data-url="'+data.url+'" data-title="'+data.title+'" data-artist="'+data.artist+'" data-picture="'+data.picture+'" data-channel="'+self.channelName.attr('data-id')+'" data-sid="'+data.sid+'">'
			html += '<h3>'+data.title+'</h3>'
			html += '<p>'+data.artist+'</p>'
			html += '<span class="song-channel">'+self.channelName.text()+'</span>'
			html += '<span class="song-time">'+time+'</span>'
			html += '</li>'
			//console.log(html)

			if(data.url !== null){
				var songs = self.$ct.find('.songs-list .songs>li')
				if(!songs.length){
					console.log(0)
					self.$ct.find('.songs-list .songs').append($(html))
					//console.log(songs.length)
				}else{
					songs.each(function(index){
						if(data.title !== songs.eq(index).attr('data-title')){
							isAdded = false
							console.log('n-r')
						}else{
							isAdded = true
							songs.eq(index).clone(true).appendTo(self.$ct.find('.songs-list .songs'))
							songs.eq(index).remove()
							console.log('r')
							return false
						}
					})
					if(!isAdded){
						self.$ct.find('.songs-list .songs').append($(html))
					}
				}
				self.setCurSong()
			}
			
		},1000)
	},

	//设置歌词格式
	setLyric:function(lyr){
		var rows = lyr.split('\n')
		//console.log(rows)

		var lyr = []

		$.each(rows,function(index,node){
			var time = rows[index].match(/\[\d{2}:\d{2}.\d{2}\]/g)
			var timeSpecial = rows[index].match(/\[\d{2}:\d{2}.\d{1}\]/g)
			
			if(time !== null){
				//console.log(time)
				if(time.length === 1){
					var lineLyr = rows[index].split(time)[1] 
					var timeArr = String(time).split(':')
					var min = parseInt(timeArr[0].split('[')[1])
					var sec = parseFloat(timeArr[1].split(']')[0])
					var curTime = min*60+sec
					//console.log(curTime+' '+lineLyr)
					lyr.push({
						t:curTime,
						l:lineLyr
					}) 
				}else if(time.length > 1){
					var lineLyrRepeat = rows[index].split(String(String(time).split(',').join('')))[1]
					//console.log(lineLyrRepeat)
					$.each(time,function(index){
						var timeArr = String(time[index]).split(':')
						var min = parseInt(timeArr[0].split('[')[1])
						var sec = parseFloat(timeArr[1].split(']')[0])
						var curTime = min*60+sec
						//console.log(curTime+' '+lineLyrRepeat)
						lyr.push({
							t:curTime,
							l:lineLyrRepeat
						}) 
					})
				}
			}else if(timeSpecial !== null){
				if(timeSpecial.length === 1){
					var lineLyr = rows[index].split(time)[1] 
					var timeArr = String(timeSpecial).split(':')
					var min = parseInt(timeArr[0].split('[')[1])
					var sec = parseFloat(timeArr[1].split(']')[0])
					var curTime = min*60+sec
					//console.log(curTime+' '+lineLyr)
					lyr.push({
						t:curTime,
						l:lineLyr
					}) 
				}else if(timeSpecial.length > 1){
					var lineLyrRepeat = rows[index].split(String(String(timeSpecial).split(',').join('')))[1]
					$.each(timeSpecial,function(index){
						var timeArr = String(timeSpecial[index]).split(':')
						var min = parseInt(timeArr[0].split('[')[1])
						var sec = parseFloat(timeArr[1].split(']')[0])
						var curTime = min*60+sec
						//console.log(curTime+' '+lineLyrRepeat)
						lyr.push({
							t:curTime,
							l:lineLyrRepeat
						}) 
					})
				}
			}	
		})
		
		//对歌词数组按时间排序
		lyr.sort(function(a,b){
			return a.t-b.t
		})
		//console.log(lyr)
		//lyr.each(function(index){
			//console.log(lyr[index])
		//})

		this.renderLyric(lyr)
	},	

	//渲染歌词至页面
	renderLyric:function(lyr){
		var self = this
		var html = ''
		$.each(lyr,function(index){
			html += '<li data-time="'+lyr[index].t+'">'+lyr[index].l+'</li>'
		})
		
		this.lyric.html(html)
		setInterval(function(){
			self.showLyric()
		},1000)
	},

	//展示歌词
	showLyric:function(){
		var self = this
		var changeH = this.lyric.find('li').eq(0).outerHeight(true)
		var curT = this.audio[0].currentTime
		//console.log(curT)
		this.lyric.css('top',-changeH*(-8))
		$.each(this.lyric.find('li'),function(index){
			var nowT = self.lyric.find('li').eq(index).attr('data-time')
			var nextT =self.lyric.find('li').eq(index+1).attr('data-time')
			///console.log(nowT+' '+nextT)
			if((curT+1 > nowT) && (curT < nextT)){
				self.lyric.find('li').eq(index).addClass('active').siblings().removeClass('active')
				self.lyric.css('top',-changeH*(index-8))
			}
		})
		
	},

	//播放
	play:function(){
		this.audio[0].play()
		this.playBtn.removeClass('icon-play').addClass('icon-zanting')
	},

	//暂停
	stop:function(){
		this.audio[0].pause()
		this.playBtn.removeClass('icon-zanting').addClass('icon-play')
	},

	//设置当前播放歌曲音符标识
	setCurSong(){
		var songs = this.$ct.find('.songs-list .songs>li')
		var self = this
		var html = '<div class="music"></div>'
		$.each(songs,function(index){
			if(self.audio.attr('src') === songs.eq(index).attr('data-url')){
				songs.eq(index).append($(html)).siblings().find('.music').remove()
			}
		})
	}

}




var playerSet = (function(){
	return {
		init:function(nodes){
			nodes.each(function(index,node){
				new Player($(node))
			})
		}
	}
})()

playerSet.init($('.FM-ct'))