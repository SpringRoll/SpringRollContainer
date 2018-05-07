/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	var SavedData = include('springroll.SavedData');

	/**
	 * @class Container
	 */
	var plugin = new springroll.ContainerPlugin(60);

	/**
	 * The name of the saved property if the sound is muted or not
	 * @property {string} SOUND_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var SOUND_MUTED = 'soundMuted';

	/**
	 * The name of the saved property if the music is muted or not
	 * @property {string} MUSIC_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var MUSIC_MUTED = 'musicMuted';

	/**
	 * The name of the saved property if the voice-over is muted or not
	 * @property {string} VO_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var VO_MUTED = 'voMuted';

	/**
	 * The name of the saved property if the effects are muted or not
	 * @property {string} SFX_MUTED
	 * @static
	 * @private
	 * @final
	 */
	var SFX_MUTED = 'sfxMuted';

	plugin.setup = function()
	{
		/**
		 * Reference to the all sound mute button
		 * @property {HTMLElement} soundButton
		 */
		this.soundButton = document.querySelector(this.options.soundButton);
		this.soundButton.addEventListener('click', onSoundToggle.bind(this));

		if (null === this.soundButton)
		{
			throw new Error(
				'No element found with provided selector for sound button'
			);
		}

		/**
		 * Reference to the music mute button
		 * @property {HTMLElement} musicButton
		 */
		this.musicButton = document.querySelector(this.options.musicButton);
		this.musicButton.addEventListener('click', onMusicToggle.bind(this));

		if (null === this.musicButton)
		{
			throw new Error(
				'No element found with provided selector for music button'
			);
		}

		/**
		 * Reference to the sound effects mute button
		 * @property {HTMLElement} sfxButton
		 */
		this.sfxButton = document.querySelector(this.options.sfxButton);
		this.sfxButton.addEventListener('click', onSFXToggle.bind(this));

		if (null === this.sfxButton)
		{
			throw new Error('No element found with provided selector for sfx button');
		}

		/**
		 * Reference to the voice-over mute button
		 * @property {HTMLElement} voButton
		 */
		this.voButton = document.querySelector(this.options.voButton);
		this.voButton.addEventListener('click', onVOToggle.bind(this));

		if (null === this.voButton)
		{
			throw new Error(
				'No element found with provided selector for voice-over button'
			);
		}

		/**
		 * Check for when all mutes are muted or unmuted
		 * @method _checkSoundMute
		 * @private
		 */
		this._checkSoundMute = function()
		{
			this.soundMuted = this.sfxMuted && this.voMuted && this.musicMuted;
		};

		/**
		 * Set the all sound is enabled or not
		 * @property {boolean} soundMuted
		 * @default false
		 */
		Object.defineProperty(this, SOUND_MUTED,
		{
			set: function(muted)
			{
				this._soundMuted = muted;
				this._setMuteProp(SOUND_MUTED, this.soundButton, muted);
			},
			get: function()
			{
				return this._soundMuted;
			}
		});

		/**
		 * Set the voice-over audio is muted
		 * @property {boolean} voMuted
		 * @default true
		 */
		Object.defineProperty(this, VO_MUTED,
		{
			set: function(muted)
			{
				this._voMuted = muted;
				this._setMuteProp(VO_MUTED, this.voButton, muted);
			},
			get: function()
			{
				return this._voMuted;
			}
		});

		/**
		 * Set the music audio is muted
		 * @property {boolean} musicMuted
		 * @default true
		 */
		Object.defineProperty(this, MUSIC_MUTED,
		{
			set: function(muted)
			{
				this._musicMuted = muted;
				this._setMuteProp(MUSIC_MUTED, this.musicButton, muted);
			},
			get: function()
			{
				return this._musicMuted;
			}
		});

		/**
		 * Set the sound effect audio is muted
		 * @property {boolean} sfxMuted
		 * @default true
		 */
		Object.defineProperty(this, SFX_MUTED,
		{
			set: function(muted)
			{
				this._sfxMuted = muted;
				this._setMuteProp(SFX_MUTED, this.sfxButton, muted);
			},
			get: function()
			{
				return this._sfxMuted;
			}
		});

		//Set the defaults if we have none for the controls
		if (SavedData.read(SOUND_MUTED) === null)
		{
			this.soundMuted = false;
		}

		this.on(
			'features',
			function(features)
			{
				this.voButton.style.display = 'none';
				this.musicButton.style.display = 'none';
				this.soundButton.style.display = 'none';
				this.sfxButton.style.display = 'none';

				if (features.vo) this.voButton.style.display = 'inline-block';
				if (features.music) this.musicButton.style.display = 'inline-block';
				if (features.sound) this.soundButton.style.display = 'inline-block';
				if (features.sfxButton) this.sfxButton.style.display = 'inline-block';
			}.bind(this)
		);
	};

	/**
	 * Handler when the sound mute button is clicked
	 * @method onSoundToggle
	 * @private
	 */
	var onSoundToggle = function()
	{
		var muted = !this.soundMuted;
		this.soundMuted = muted;
		this.musicMuted = muted;
		this.voMuted = muted;
		this.sfxMuted = muted;
	};

	/**
	 * Handler when the music mute button is clicked
	 * @method onMusicToggle
	 * @private
	 */
	var onMusicToggle = function()
	{
		this.musicMuted = !this.musicMuted;
		this._checkSoundMute();
	};

	/**
	 * Handler when the voice-over mute button is clicked
	 * @method onVOToggle
	 * @private
	 */
	var onVOToggle = function()
	{
		this.voMuted = !this.voMuted;
		this._checkSoundMute();
	};

	/**
	 * Handler when the voice-over mute button is clicked
	 * @method onSFXToggle
	 * @private
	 */
	var onSFXToggle = function()
	{
		this.sfxMuted = !this.sfxMuted;
		this._checkSoundMute();
	};

	plugin.open = function() {};

	plugin.opened = function()
	{
		this.soundButton.classList.remove('disabled');
		this.sfxButton.classList.remove('disabled');
		this.voButton.classList.remove('disabled');
		this.musicButton.classList.remove('disabled');

		this.soundMuted = !!SavedData.read(SOUND_MUTED);
		this.musicMuted = !!SavedData.read(MUSIC_MUTED);
		this.sfxMuted = !!SavedData.read(SFX_MUTED);
		this.voMuted = !!SavedData.read(VO_MUTED);
	};

	plugin.close = function()
	{
		this._disableButton(this.soundButton);
		this._disableButton(this.musicButton);
		this._disableButton(this.voButton);
		this._disableButton(this.sfxButton);
	};

	plugin.teardown = function()
	{
		this.soundButton.removeEventListener('click', onSoundToggle.bind(this));
		this.musicButton.removeEventListener('click', onMusicToggle.bind(this));
		this.sfxButton.removeEventListener('click', onSFXToggle.bind(this));
		this.voButton.removeEventListener('click', onVOToggle.bind(this));
		delete this.voButton;
		delete this.sfxButton;
		delete this.musicButton;
		delete this.soundButton;
		delete this._checkSoundMute;
	};
})();