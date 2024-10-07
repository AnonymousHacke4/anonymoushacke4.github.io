import PhysicsManager from './PhysicsManager.js';

const { Sprite } = PIXI;

export default class extends PIXI.Container {
    _physicsManager = new PhysicsManager();
    _player;
    _sheets;
    _separated;
    _gameId = null;

    constructor (player, { sheets, separated }) {
        super();

        this._player = player;

        this._sheets = sheets;
        this._separated = separated;
        
        this._physicsManager.init();

        this.init();
    };

    init () {
        this.playerSprite = new Sprite(this._sheets.assets.textures['goblin.png']);
        //this.playerSprite.anchor.x = 0.5;
        //this.playerSprite.scale.set(0.25);

        this.addChild(this.playerSprite);

        //const ground = new Sprite(this._);
    };

    setGameData (gameId, score, maxScore) {
        this._gameId = gameId;

        this._physicsManager.setScore(score, maxScore);

        this._physicsManager.restartLevel();
    };

    onLevelComplete (result) {
        this._player.sendGameResult(this._gameId, result);

        this._gameId = null;

        document.querySelector('#game').style.display = 'none';
        document.querySelector('#resultForm').style.visibility = 'visible';
    };

    process (delta) {
        if(this._gameId === null) return;

        const result = this._physicsManager.process(delta);

        if(result !== null) this.onLevelComplete(result);

        const { x, y } = this._physicsManager.playerBody.position;

        this.playerSprite.x = x;
        this.playerSprite.y = y;
    };
};