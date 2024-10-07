import Controller from './Controller.js';

const { Engine, Render, Composite, Bodies, Body, Events } = Matter,
getRandom = arr => arr[Math.floor(Math.random() * arr.length)];

export default class {
    #_engine;
    #_render;
    #_world;
    #_maxScore = 0;
    #_score = 0;
    #_scoreReward = 0;
    #_time = 0;
    #_player = {
        positionX: 20, // СПАВН ХИТБОКСА ПО ИКСУ
        size: [20, 25], // РАЗМЕР ХИТБОКСА
        body: null, // ХИТБОКС
        jumpPower: 7, // СИЛА ПРЫЖКА
        maxJumps: 1, // МАКС. КОЛ. ПРЫЖКОВ
        jumpCounts: 0, // ДОСТУПНОЕ КОЛ. ПРЫЖКОВ
        canJump: false, // МОЖЕТ ЛИ ПРЫГНУТЬ
        crouch: false, // СОСТОЯНИЕ ПРИСЯДА
        controller: new Controller() // КОНТРОЛЛЕР ВВОДА
    };
    #_gameStates = {
        IDLE: 0,
        STARTED: 1,
        WIN: 2,
        LOSE: 3 
    };
    #_game = {
        gravity: 0.98,
        time: 60,
        speed: 1,
        maxSpeed: 3,
        acceleration: 0.001,
        state: this.#_gameStates.IDLE
    };
    #_ground = {
        body: null,
        position: [300, 200],
        size: [600, 100]
    };
    #_obstacles = {
        list: [],
        spawnPosition: [700, 150],
        toCreate: {
            test: [[25, 25], 0.6],
            bird: [[25, 17], 0.3],
            cactus: [[35, 30], 0.5]
        },
        speed: [1.25, 1],
        removeX: -50,
        spawnCooldown: 1,
        maxCount: 5,
        types: ['test','bird','cactus'],
        skyTypes: ['bird'],
        skyOffsetY: -17
    };
    #_hitTypes = {
        DEATH: 1,
        ADD_SCORE: 2,
        REMOVE_SCORE: 3,
        SPEED_UP: 4
    };
    #_resultMessages = {
        [this.#_gameStates.WIN]: 'GAME WIN!',
        [this.#_gameStates.LOSE]: 'GAME OVER'
    };
    #_html = {
        score: document.querySelector('#score'),
        result: document.querySelector('#result'),
        progressBarSlider: document.querySelector('#progressBar-slider')
    };

    setScore (score, maxScore) {
        this.#_score = score;

        this.#_maxScore = maxScore;

        this.#_scoreReward = score * 0.25;

        this._updateScore(this.#_score);
    };

    _updateScore (value) {
        this.#_html.score.textContent = `SCORE: ${value}`;
    };

    setState (state) {
        this.#_game.state = this.#_gameStates[state] || 0;

        switch (this.#_game.state) {
            case this.#_gameStates.WIN:
            case this.#_gameStates.LOSE:
                this.#_html.result.textContent = this.#_resultMessages[this.#_game.state];

                break;
        };
    };

    getGroundPosition () {
        return this.#_ground.position;
    };

    init () {
        this.#_engine = Engine.create({
            gravity: {
                y: this.#_game.gravity
            }
        });

        this.#_world = this.#_engine.world;

        Composite.add(
            this.#_world,
            [
                this.initPlayer(),
                this.initGround()
            ]
        );

        this.#_player.controller.init();

        this.initCollisionEventListener();

        if(window.DEBUG_MODE) {
            this.#_render = Render.create({
                element: document.querySelector('#game'),
                engine: this.#_engine,
                options: {
                    width: 600,
                    height: 152
                }
            });

            document.querySelector('canvas').style.width = '100%';
            
            Render.run(this.#_render);
        };
    };
    
    initPlayer () {
        const [width, height] = this.#_player.size;

        this.#_player.body = Bodies.rectangle(
            this.#_player.positionX,
            this.#_ground.position[1] - height * 2 - height / 2,
            width,
            height,
            { restitution: 0, frictionAir: 0 }
        );

        return this.#_player.body;
    };

    initGround () {
        const [x, y] = this.#_ground.position,
        [width, height] = this.#_ground.size,
        ground = Bodies.rectangle(
            x,
            y,
            width,
            height,
            { isStatic: true }
        );

        this.#_ground.body = ground.id;

        return ground;
    };

    initCollisionEventListener () {
        Events.on(this.#_engine, 'collisionStart', ({ source: { detector: { collisions } } }) => {
            const plrId = this.#_player.body.id;

            collisions.map(({ bodyA, bodyB }) => {
                if(
                    (bodyA.id === plrId || bodyB.id === plrId)
                    &&
                    (bodyA.id !== this.#_ground.body && bodyB.id !== this.#_ground.body)
                ) {
                    const hitType = bodyA.hitType || bodyB.hitType || 0;

                    console.log('HITTED OBSTACLE', hitType);

                    Body.setPosition(
                        this.#_player.body,
                        {
                            x: this.#_player.positionX,
                            y: this.#_player.body.position.y,
                        }
                    );
    
                    if(hitType !== this.#_hitTypes.DEATH) this.removeBody([bodyA, bodyB][+(bodyA.id === plrId)]);
    
                    switch (hitType) {
                        case this.#_hitTypes.DEATH:
                            // GAME LOSE
    
                            console.log('GAME LOSE');
    
                            this.setState('LOSE');
    
                            break;
                        case this.#_hitTypes.ADD_SCORE:
                            // ADD SCORE
    
                            console.log('ADD SCORE');
    
                            this.#_score = Math.min(this.#_maxScore, this.#_score + this.#_scoreReward);

                            this._updateScore(this.#_score);
    
                            break;
                        case this.#_hitTypes.REMOVE_SCORE:
                            // REMOVE SCORE

                            this.#_score = Math.max(0, this.#_score - this.#_scoreReward);

                            this._updateScore(this.#_score);

                            console.log('REMOVE SCORE');
    
                            break;
                        case this.#_hitTypes.SPEED_UP:
                            // SPEED UP

                            console.log('SPEED UP');
    
                            break;
                    };
                } else {
                    console.log('CAN JUMP');
        
                    this.#_player.jumpCounts = this.#_player.maxJumps;
                };
            });
        });
    };

    createObstacle (type) {
        console.log('NEW OBSTACLE CREATED');

        const [[width, height]] = this.#_obstacles.toCreate[type],
        body = Bodies.rectangle(
            this.#_obstacles.spawnPosition[0],
            (this.#_obstacles.spawnPosition[1] + (this.#_obstacles.skyTypes.includes(type) ? (this.#_obstacles.skyOffsetY * (Math.random() + 1)) : 0)) - height / 2,
            width,
            height,
            { isStatic: true }
        );

        body.hitType = getRandom([1,2,3,4]);

        body.gameSpeed = this.#_obstacles.speed[+this.#_obstacles.skyTypes.includes(type)];

        this.#_obstacles.list.push(body);

        Composite.add(this.#_world, [body]);
    };

    removeBody (body) {
        console.log(`OBSTACLE ${body.id} OVER THE WORLD EDGE, REMOVING...`);

        Composite.remove(this.#_world, body);

        this.#_obstacles.list.splice(this.#_obstacles.list.findIndex(({ id }) => id === body.id), 1);
    };

    process (delta) {
        delta = Math.min(0.016, delta);

        const input = this.#_player.controller.getInput();

        if(input[32] || input[87]) {
            if(this.#_player.canJump && (this.#_game.state !== this.#_gameStates.STARTED || this.#_game.state === this.#_gameStates.LOSE)) {
                console.log('GAME STARTED');

                if(this.#_game.state === this.#_gameStates.LOSE || this.#_game.state === this.#_gameStates.WIN) this.restartLevel();
                else this.setState('STARTED');
            };

            if(this.#_player.jumpCounts > 0 && this.#_player.canJump) {
                console.log('JUMP');

                this.#_player.jumpCounts--;
    
                this.#_player.canJump = false;
    
                Body.setVelocity(
                    this.#_player.body,
                    {
                        x: this.#_player.body.velocity.x,
                        y: -this.#_player.jumpPower
                    }
                );
            };
        } else this.#_player.canJump = true;

        if(this.#_game.state === this.#_gameStates.STARTED || this.#_game.state === this.#_gameStates.IDLE) {
            if(!input[40] && !input[83] && this.#_player.crouch) {
                console.log('UNCROUCH');
    
                Body.scale(this.#_player.body, 1, 2);

                Body.setPosition(
                    this.#_player.body,
                    {
                        x: this.#_player.positionX,
                        y: this.#_ground.position[1] - this.#_player.size[1] * 2 - this.#_player.size[1] / 2,
                    }
                );
    
                this.#_player.crouch = false;
            };
            
            if((input[40] || input[83]) && !this.#_player.crouch) {
                console.log('CROUCH');
    
                Body.scale(this.#_player.body, 1, 0.5);

                Body.setPosition(
                    this.#_player.body,
                    {
                        x: this.#_player.positionX,
                        y: this.#_ground.position[1] - this.#_player.size[1] * 2,
                    }
                );
    
                this.#_player.crouch = true;
            };

            if(this.#_game.state === this.#_gameStates.STARTED) {
                this.#_time += delta;

                const gameTimePercent = this.#_time / this.#_game.time;

                this.#_html.progressBarSlider.style.width = `${gameTimePercent * 100}%`;

                if(gameTimePercent >= 0.8) {
                    console.log('BACKGROUND COLOR CHANGE');

                    // CHANGE BG COLOR;

                    if(gameTimePercent >= 1) {
                        console.log('GAME WON!');

                        this.setState('WIN');
                    };
                };

                this.#_game.speed = Math.min(this.#_game.maxSpeed, this.#_game.speed + delta * this.#_game.acceleration);

                this.#_obstacles.spawnCooldown -= delta;

                if(Math.random() >= 0.8 && this.#_obstacles.spawnCooldown <= 0 && this.#_obstacles.list.length < this.#_obstacles.maxCount) {
                    this.createObstacle(getRandom(this.#_obstacles.types));

                    this.#_obstacles.spawnCooldown = 2 * Math.random();
                };

                this.#_obstacles.list.map(body => {
                    Body.setPosition(
                        body,
                        {
                            x: body.position.x - body.gameSpeed * this.#_game.speed,
                            y: body.position.y
                        }
                    );
    
                    if(body.position.x <= this.#_obstacles.removeX) this.removeBody(body);
                });
            };

            Body.setAngle(this.#_player.body, 0);

            Engine.update(this.#_engine, delta * 1000);
        };

        return (
            this.#_game.state === this.#_gameStates.WIN
            ||
            this.#_game.state === this.#_gameStates.LOSE
        ) ? this.#_score : null;
    };

    restartLevel () {
        console.log('GAME RESTARTED');

        this.#_time = 0;

        Body.setPosition(
            this.#_player.body,
            {
                x: this.#_player.positionX,
                y: this.#_ground.position[1] - this.#_player.size[1] * 2 - this.#_player.size[1] / 2 - 5,
            }
        );

        Composite.remove(this.#_world, this.#_obstacles.list);

        this.#_obstacles.list = [];

        this.#_html.progressBarSlider.style.width = '0%';

        this.#_player.controller.resetInput();

        this.setState('IDLE');
    };

    get playerBody () {
        return this.#_player.body;
    };
};