import SoundManager from './SoundManager.js';
import WorldManager from './WorldManager.js';

export default class extends PIXI.Container {
    screenWidth;
    screenHeight;
    sheets;
    separated;

    uiManager;
    soundManager;

    _worldManager;

    constructor(screenWidth, screenHeight, { sheets, separated, sounds }, player) {
        super();

        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.sheets = sheets;
        this.separated = separated;

        this._worldManager = new WorldManager(player, { sheets, separated });

        this.soundManager = new SoundManager(sounds);
        //this.soundManager.play('soundtrack');
        
        this.addChild(this._worldManager);
    };

    process (delta) {
        this._worldManager.process(delta);
    };

    initLevel (score, gameId, maxScore) {
        this._worldManager.setGameData(gameId, score, maxScore);

        document.querySelector('#game').style.display = 'block';
    };

    changeVolumeState (mute) {
        this.soundManager.changeVolume(mute);
    };
};