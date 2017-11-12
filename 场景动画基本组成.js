var game = new Phaser.Game(240, 400, Phaser.CANVAS, 'game');

game.States = {};

game.States.boot = function() {
    this.preload = function() {
        if(typeof(GAME) !== "undefined") {
            this.load.baseURL = GAME + "/";
        }
        if(!game.device.desktop){
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.scale.forcePortrait = true;
            this.scale.refresh();
        }
        game.load.image('loading', 'assets/preloader.gif');
    };
    this.create = function() {
        game.state.start('preload');
    };
};

game.States.preload = function() {
    this.preload = function() {
        //加载进度条
        var preloadSprite = game.add.sprite(10, game.height/2, 'loading');
        game.load.setPreloadSprite(preloadSprite);
        //加载角色精灵，数字依次代表精灵长度，宽度和份数
        game.load.spritesheet('explode1', 'assets/explode1.png', 20, 20, 3);
        //加载图片
        game.load.image('award', 'assets/award.png');
        //加载音频
        game.load.audio('normalback', 'assets/normalback.mp3');

    };
    this.create = function() {
        game.state.start('main');
    };
};

//主场景
game.States.main = function() {
    this.create = function() {
        // 背景
        var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        // 版权
        this.copyright = game.add.image(12, game.height - 16, 'copyright');
        // 我的飞机
        this.myplane = game.add.sprite(100, 100, 'myplane');
        this.myplane.animations.add('fly');
        this.myplane.animations.play('fly', 12, true);
        // 开始按钮,1,1,0设置frame/frameName切换,即按钮动作的切换
        this.startbutton = game.add.button(70, 200, 'startbutton', this.onStartClick, this, 1, 1, 0);
        // 背景音乐,0.2用来调节音量大小
        this.normalback = game.add.audio('normalback', 0.2, true);
        this.normalback.play();
    };
    this.onStartClick = function() {
        game.state.start('start');
        this.normalback.stop();
    };
};


game.States.start = function() {
    this.create = function() {
        // 物理系统
        game.physics.startSystem(Phaser.Physics.ARCADE);
        // 背景
        var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        bg.autoScroll(0, 20);
        // 我的飞机
        this.myplane = game.add.sprite(100, 100, 'myplane');
        this.myplane.animations.add('fly');
        this.myplane.animations.play('fly', 12, true);
        game.physics.arcade.enable(this.myplane);
        this.myplane.body.collideWorldBounds = true;
        this.myplane.level = 2;
        // 动画
        var tween = game.add.tween(this.myplane).to({y: game.height - 40}, 1000, Phaser.Easing.Sinusoidal.InOut, true);
        tween.onComplete.add(this.onStart, this);
        // 背景音乐
        this.playback = game.add.audio('playback', 0.2, true);
        this.playback.play();
        // 开火音乐
        this.pi = game.add.audio('pi', 1, false);
        // 打中敌人音乐
        this.firesound = game.add.audio('fashe', 5, false);
        // 爆炸音乐
        this.crash1 = game.add.audio('crash1', 10, false);
        this.crash2 = game.add.audio('crash2', 10, false);
        this.crash3 = game.add.audio('crash3', 20, false);
        // 挂了音乐
        this.ao = game.add.audio('ao', 10, false);
        // 接到了奖音乐
        this.deng = game.add.audio('deng', 10, false);
    };
    this.onStart = function() {
        // 我的子弹
        this.mybullets = game.add.group();
        this.mybullets.enableBody = true;
        this.mybullets.createMultiple(50, 'mybullet');
        this.mybullets.setAll('outOfBoundsKill', true);
        this.mybullets.setAll('checkWorldBounds', true);
        this.myStartFire = true;
        this.bulletTime = 0;
        // 我的飞机允许拖拽
        this.myplane.inputEnabled = true;
        this.myplane.input.enableDrag(false);
        // 奖
        this.awards = game.add.group();
        this.awards.enableBody = true;
        this.awards.createMultiple(1, 'award');
        this.awards.setAll('outOfBoundsKill', true);
        this.awards.setAll('checkWorldBounds', true);
        this.awardMaxWidth = game.width - game.cache.getImage('award').width;
        game.time.events.loop(Phaser.Timer.SECOND * 30, this.generateAward, this);
        // 分数
        var style = {font: "16px Arial", fill: "#ff0000"};
        this.text = game.add.text(0, 0, "Score: 0", style);
        score = 0;

    };
};



//添加场景
game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);
game.state.add('start', game.States.start);
game.state.add('over', game.States.over);

//启动boot场景
game.state.start('boot');