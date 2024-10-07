import ResourceManager from './ResourceManager.js';
import PlayerManager from './PlayerManager.js';
import GameManager from './GameManager.js';
import UIManager from './UIManager.js';

const WIDTH = 800,
HEIGHT = 1280,
ASSETS_DIR = 'assets',
SPRITESHEETS = ['assets'],
SEPARATED_TEXTURES = [],
SOUNDS = [];

window.DEBUG_MODE = 1;

export default class extends PIXI.Application {
    #_playerData = new PlayerManager();
    #_uiManager = new UIManager();
    #_gameManager;

    constructor () {
        super({
            width: WIDTH,
            height: HEIGHT,
            background: 0x808080,
            resolution: window.devicePixelRatio || 1
        })._resize();

        this._init();
    };

    async _init () {
        if(!window.DEBUG_MODE) document.querySelector('#game').appendChild(this.view);

        await this.#_playerData.init(window.Telegram.WebApp.initDataUnsafe.user?.id);

        this.#_gameManager = new GameManager(
            WIDTH,
            HEIGHT,
            await (new ResourceManager(ASSETS_DIR)).loadAssets(SPRITESHEETS, SEPARATED_TEXTURES, SOUNDS),
            this.#_playerData
        );
        this.stage.addChild(this.#_gameManager);

        this.#_uiManager.init(this.#_gameManager, this.#_playerData);

        document.addEventListener('visibilitychange', () => this.#_gameManager.changeVolumeState(document.hidden));

        this.stage.eventMode = 'static';
    
        this.ticker.add(() => {
            this._resize();

            this.#_gameManager.process(this.ticker.elapsedMS / 1000);
        });
    };

    _resize () {
        const ratio = WIDTH / HEIGHT,
        width = window.innerWidth,
        height = window.innerHeight;

        let newWidth, newHeight;
    
        if(width / height > ratio) {
            newHeight = height;
            newWidth = height * ratio;
        } else {
            newWidth = width;
            newHeight = width / ratio;
        };
    
        this.renderer.resize(newWidth, newHeight);
        this.stage.scale.set(newWidth / WIDTH, newHeight / HEIGHT);
    
        this.view.style.width = `${newWidth}px`;
        this.view.style.height = `${newHeight}px`;
        this.view.style.margin = 'auto';
    };
};