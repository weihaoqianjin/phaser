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


//添加场景
game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);
game.state.add('start', game.States.start);
game.state.add('over', game.States.over);

//启动boot场景
game.state.start('boot');