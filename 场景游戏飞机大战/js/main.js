/***********************/

// 分数
var score = 0;

// 生成Title
var makeTitle = function(score) {
    if(score < 1000) {
        return "简版飞机大战，还挺难的，我才" + score + "分，你能得多少分呢？";
    } else {
        return "简版飞机大战，我是天才，得了" + score + "分，你能得多少分呢？";
    }
}

// 关闭分享
var onCloseShare = function() {
    document.getElementById('share').style.display = 'none';
};

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
        var preloadSprite = game.add.sprite(10, game.height/2, 'loading');
        game.load.setPreloadSprite(preloadSprite);
        game.load.image('background', 'assets/bg.jpg');
        game.load.image('copyright', 'assets/copyright.png');
        game.load.spritesheet('myplane', 'assets/myplane.png', 40, 40, 4);
        game.load.spritesheet('startbutton', 'assets/startbutton.png', 100, 40, 2);
        game.load.spritesheet('replaybutton', 'assets/replaybutton.png', 80, 30, 2);
        game.load.spritesheet('sharebutton', 'assets/sharebutton.png', 80, 30, 2);
        game.load.image('mybullet', 'assets/mybullet.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('enemy1', 'assets/enemy1.png');
        game.load.image('enemy2', 'assets/enemy2.png');
        game.load.image('enemy3', 'assets/enemy3.png');
        game.load.spritesheet('explode1', 'assets/explode1.png', 20, 20, 3);
        game.load.spritesheet('explode2', 'assets/explode2.png', 30, 30, 3);
        game.load.spritesheet('explode3', 'assets/explode3.png', 50, 50, 3);
        game.load.spritesheet('myexplode', 'assets/myexplode.png', 40, 40, 3);
        game.load.image('award', 'assets/award.png');
        game.load.audio('normalback', 'assets/normalback.mp3');
        game.load.audio('playback', 'assets/playback.mp3');
        game.load.audio('fashe', 'assets/fashe.mp3');
        game.load.audio('crash1', 'assets/crash1.mp3');
        game.load.audio('crash2', 'assets/crash2.mp3');
        game.load.audio('crash3', 'assets/crash3.mp3');
        game.load.audio('ao', 'assets/ao.mp3');
        game.load.audio('pi', 'assets/pi.mp3');
        game.load.audio('deng', 'assets/deng.mp3');
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
        //我方飞机等级，越高则子弹越多，最大是五发子弹
        this.myplane.level = 2;
        // 动画，自由裸体
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
        //50是子弹数量，对象池，遇到边界没了就又重新生出来。
        this.mybullets.createMultiple(50, 'mybullet');
        this.mybullets.setAll('outOfBoundsKill', true);
        this.mybullets.setAll('checkWorldBounds', true);
         //默认自动开火
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

    // 自己开火
    this.myFireBullet = function() {
        //game.time.now > this.bulletTime设置每次发射子弹的间隔
        if(this.myplane.alive && game.time.now > this.bulletTime) {
            try {
                this.pi.play();
            } catch(e) {}
            var bullet;
            bullet = this.mybullets.getFirstExists(false);
            if(bullet) {
                //重置子弹相对于飞机的位置,reset可以重置位置
                bullet.reset(this.myplane.x + 16, this.myplane.y - 15);
                //-400子弹自由运动速度
                bullet.body.velocity.y = -400;
                this.bulletTime = game.time.now + 100;
             }
            if(this.myplane.level >= 2) {
                bullet = this.mybullets.getFirstExists(false);
                if(bullet) {
                    bullet.reset(this.myplane.x + 16, this.myplane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = -40;
                    this.bulletTime = game.time.now + 100;
                }
                bullet = this.mybullets.getFirstExists(false);
                if(bullet) {
                    bullet.reset(this.myplane.x + 16, this.myplane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = 40;
                    this.bulletTime = game.time.now + 100;
                }
            }
            if(this.myplane.level >= 3) {
                bullet = this.mybullets.getFirstExists(false);
                if(bullet) {
                    bullet.reset(this.myplane.x + 16, this.myplane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = -80;
                    this.bulletTime = game.time.now + 200;
                }
                bullet = this.mybullets.getFirstExists(false);
                if(bullet) {
                    bullet.reset(this.myplane.x + 16, this.myplane.y - 15);
                    bullet.body.velocity.y = -400;
                    bullet.body.velocity.x = 80;
                    this.bulletTime = game.time.now + 200;
                }
            }
         }
    };


    // 更新函数
    this.update = function() {
        if(this.myStartFire) {
            this.myFireBullet();
            // this.enemy1.enemyFire();
            // this.enemy2.enemyFire();
            // this.enemy3.enemyFire();
            // // 碰撞检测
            // game.physics.arcade.overlap(this.mybullets, this.enemy1.enemys, this.enemy1.hitEnemy, null, this.enemy1);
            // game.physics.arcade.overlap(this.mybullets, this.enemy2.enemys, this.enemy2.hitEnemy, null, this.enemy2);
            // game.physics.arcade.overlap(this.mybullets, this.enemy3.enemys, this.enemy3.hitEnemy, null, this.enemy3);
            // game.physics.arcade.overlap(this.enemy1.enemyBullets, this.myplane, this.hitMyplane, null, this);
            // game.physics.arcade.overlap(this.enemy2.enemyBullets, this.myplane, this.hitMyplane, null, this);
            // game.physics.arcade.overlap(this.enemy3.enemyBullets, this.myplane, this.hitMyplane, null, this);
            // game.physics.arcade.overlap(this.enemy1.enemys, this.myplane, this.crashMyplane, null, this);
            // game.physics.arcade.overlap(this.enemy2.enemys, this.myplane, this.crashMyplane, null, this);
            // game.physics.arcade.overlap(this.enemy3.enemys, this.myplane, this.crashMyplane, null, this);
            // game.physics.arcade.overlap(this.awards, this.myplane, this.getAward, null, this);
        }
    };
};



game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);
game.state.add('start', game.States.start);
// game.state.add('over', game.States.over);

game.state.start('boot');